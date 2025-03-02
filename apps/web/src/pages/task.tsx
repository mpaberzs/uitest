import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router';
import {
  deleteTaskList,
  getTaskList,
  setTaskListStatus,
  updateTaskList,
} from 'src/lib/api/taskListsApi';
import type { Task, TaskList } from '@todoiti/common';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  OutlinedInput,
  Stack,
} from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useDialogs } from '@toolpad/core/useDialogs';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CreateTaskDialog from 'src/components/create-task-dialog';
import { deleteTask, updateTask } from 'src/lib/api/tasksApi';
import { createInvite } from 'src/lib/api/invitesApi';
import { axiosInstance } from 'src/lib/api/axios';
import { UserContext } from 'src/app';

const TaskListActionsBoxWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '20px 0',
}));

const TaskListActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
}));

const TaskListHeaderBox = styled(Box)(({ theme }) => ({
  padding: '20px 0',
}));

const TaskList = () => {
  const notifications = useNotifications();
  const context = React.useContext(UserContext);
  const dialogs = useDialogs();
  const params = useParams();
  const navigate = useNavigate();
  const [taskList, setTaskList] = React.useState<TaskList | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchTaskListError, setFetchTaskListError] = React.useState('');

  const handleUpdate = React.useCallback(
    async (e: any) => {
      if (!taskList) {
        // safeguard (edge case)
        return;
      }
      try {
        // TODO: update
        // await deleteTaskList(taskListId);
        notifications.show(`Updated task "${taskList.name}" successfully!`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });
      } catch (error: any) {
        notifications.show(
          `Error updating task "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 10_000,
          }
        );
      }
    },
    [updateTaskList, dialogs, notifications, taskList]
  );

  const handleDeleteTask = React.useCallback(
    (taskId: string) => async () => {
      if (!taskList || !taskList.tasks?.find((t) => t.id === taskId)) {
        // safeguard (edge case)
        return;
      }

      try {
        await deleteTask(taskId, params.id!);
        await refreshTaskList();
      } catch (error: any) {
        let msg = 'Something went wrong while deleting task';
        if (error?.response?.status === 403) {
          msg = 'Your access to this task is suspended';
        } else if (error?.response?.status === 404) {
          msg = 'task not found';
        }
        notifications.show(msg, { severity: 'error', autoHideDuration: 10_000 });
      } finally {
      }
    },
    [deleteTask, dialogs, notifications, taskList]
  );

  const refreshTaskList = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getTaskList(params.id!);
      setTaskList(list);
    } catch (error: any) {
      let msg = 'Something went wrong while refreshing task';
      if (error?.response?.status === 403) {
        msg = 'Your access to this task is suspended';
      } else if (error?.response?.status === 404) {
        msg = 'task not found';
      }
      setFetchTaskListError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, getTaskList, params.id, setTaskList, setFetchTaskListError, setIsLoading]);

  const handleInitAddTask = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }

    const result = await dialogs.open<
      { taskListName: string; taskListId: string; taskId?: string; taskToEdit?: Task },
      { created: boolean }
    >(CreateTaskDialog, { taskListName: taskList.name, taskListId: taskList.id });

    if (result.created) {
      // if the task list was done but we are setting task as active then change also task list status
      if (taskList!.status === 'done') {
        await setTaskListStatus(taskList!.id, 'active', false);
      }
      await refreshTaskList();
    }
  }, [deleteTaskList, dialogs, notifications, taskList]);

  const handleToggleTaskListDone = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }

    const newTaskListStatus: Task['status'] = taskList.status === 'done' ? 'active' : 'done';
    const confirmResult = await dialogs.confirm(
      `Are you sure you want to mark "${taskList.name}" and all it's subtasks as "${newTaskListStatus}"?`,
      {
        okText: 'Yes',
        cancelText: 'No',
      }
    );
    if (!confirmResult) {
      return;
    }

    try {
      await setTaskListStatus(taskList.id, newTaskListStatus);
      await refreshTaskList();
    } catch (error: any) {
      let msg = 'Something went wrong while updating task';
      if (error?.response?.status === 403) {
        msg = 'Your access to this task is suspended';
      } else if (error?.response?.status === 404) {
        msg = 'Task not found';
      }
      notifications.show(msg, { severity: 'error', autoHideDuration: 10_000 });
    } finally {
    }
  }, [setTaskListStatus, refreshTaskList, dialogs, notifications, taskList]);

  const handleToggleTaskDone = React.useCallback(
    (taskId: string) => async () => {
      const task = taskList?.tasks?.find((t) => t.id === taskId);
      if (!task) {
        // safeguard (edge case)
        return;
      }

      try {
        const newStatus = task.status === 'done' ? 'active' : 'done';
        await updateTask(taskId, taskList!.id, {
          name: task.name,
          description: task.description,
          status: newStatus,
        });
        // if the task list was done but we are setting task as active then change also task list status
        if (newStatus === 'active' && taskList!.status === 'done') {
          await setTaskListStatus(taskList!.id, 'active', false);
        }

        if (
          newStatus === 'done' &&
          !taskList!.tasks?.filter((t) => t.id !== task.id).some((task) => task.status !== 'done')
        ) {
          await setTaskListStatus(taskList!.id, 'done', false);
        }
        await refreshTaskList();
      } catch (error: any) {
        let msg = 'Something went wrong while updating task';
        if (error?.response?.status === 403) {
          msg = 'Your access to this task is suspended';
        } else if (error?.response?.status === 404) {
          msg = 'task not found';
        }
        notifications.show(msg, { severity: 'error', autoHideDuration: 10_000 });
      } finally {
      }
    },
    [updateTask, dialogs, notifications, taskList]
  );

  const handleDeleteTaskList = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }
    const confirmResult = await dialogs.confirm(
      `Are you sure you want to delete task "${taskList.name}" and all it's subtasks?`,
      {
        okText: 'Yes',
        cancelText: 'No',
      }
    );
    if (!confirmResult) {
      return;
    }
    try {
      await deleteTaskList(taskList.id);
      navigate('/', { replace: true });
      notifications.show(`Removed task "${taskList.name}" successfully!`, {
        severity: 'success',
        autoHideDuration: 10_000,
      });
    } catch (error: any) {
      notifications.show(
        `Error deleting task "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
        {
          severity: 'error',
          autoHideDuration: 10_000,
        }
      );
    }
  }, [deleteTaskList, dialogs, notifications, taskList]);

  const handleGoBack = React.useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  const [inviteLink, setInviteLink] = React.useState<string>();
  const handleCopyInviteLink = React.useCallback(() => {
    navigator.clipboard.writeText(inviteLink!);
    notifications.show('Invite link copied to clipboard!');
  }, [setInviteLink, inviteLink]);

  const handleGenerateInvite = React.useCallback(async () => {
    if (!taskList) {
      // safeguard
      return;
    }
    setInviteLink('');
    try {
      const invite = await createInvite(taskList.id);
      setInviteLink(invite.link);
    } catch (error: any) {
      notifications.show(
        `Error generating invite for "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
        {
          severity: 'error',
          autoHideDuration: 15_000,
        }
      );
    }
  }, [createInvite, setInviteLink, notifications, taskList]);

  React.useEffect(() => {
    let isMounted = true;
    let wsConnection: WebSocket | null = null;
    if (params.id) {
      getTaskList(params.id)
        .then((taskList) => {
          if (!isMounted) {
            return;
          }
          setTaskList(taskList);
          const url = new URL(`http://localhost:8000/v1/ws/${taskList.id}`);
          console.log('diggo', axiosInstance.defaults.headers);
          url.searchParams.set(
            'accessToken',
            // FIXME: implement proper auth hooks
            (axiosInstance.defaults.headers.common['Authorization'] as string)?.split(' ').pop() ??
              ''
          );

          const wsConnection = new WebSocket(url);

          wsConnection.addEventListener('message', (event) => {
            if (isMounted) {
              try {
                const websocketPayload = JSON.parse(event.data);
                if (websocketPayload.status === 'failed') {
                  notifications.show(`Realtime connection failed: ${websocketPayload.message}`, {
                    severity: 'warning',
                  });
                  wsConnection.close();
                } else if (websocketPayload.status === 'updated') {
                  // TODO: not if editing description or title
                  refreshTaskList();
                } else if (websocketPayload.status === 'deleted') {
                  wsConnection.close();
                  navigate('/', { replace: true });
                }
              } catch (error: any) {
                console.error('Failed to parse WebSocket message:', error?.message, event.data);
              }
            }
          });
        })
        .catch((error) => {
          if (!isMounted) {
            return;
          }
          let msg = 'Something went wrong while getting task';
          if (error?.response?.status === 403) {
            msg = 'Your access to this task is suspended';
          } else if (error?.response?.status === 404) {
            msg = 'task not found';
          }
          setFetchTaskListError(msg);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return () => {
        isMounted = false;
        wsConnection && (wsConnection as any).close();
      };
    }
  }, [params.id]);

  return (
    <>
      <Box>
        <Button onClick={handleGoBack} color="secondary" startIcon={<ChevronLeftIcon />}>
          Back
        </Button>
      </Box>
      {taskList ? (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <FormControlLabel
              label=""
              control={
                <Checkbox
                  size="large"
                  checked={taskList.status === 'done'}
                  indeterminate={
                    taskList.status === 'active' &&
                    Boolean(taskList.tasks?.some((task) => task.status === 'done'))
                  }
                  onChange={handleToggleTaskListDone}
                />
              }
            />
            <Typography
              sx={{ textDecoration: taskList.status === 'done' ? 'line-through' : 'none' }}
              component="h1"
              variant="h1"
            >
              {taskList.name}
            </Typography>
          </Box>
          {taskList.description ? (
            <Typography component="p">{taskList.description}</Typography>
          ) : null}
          <Divider sx={{ margin: taskList.description ? '0 0 20px' : '20px 0' }} />
          <TaskListActionsBoxWrapper>
            <TaskListActionsBox>
              <Button
                color="primary"
                variant="contained"
                onClick={handleInitAddTask}
                startIcon={<CreateIcon />}
              >
                Add new subtask
              </Button>

              <Button
                color="error"
                variant="contained"
                onClick={handleDeleteTaskList}
                startIcon={<DeleteIcon />}
                sx={{ marginLeft: '20px' }}
              >
                Delete task
              </Button>
            </TaskListActionsBox>
            <TaskListActionsBox>
              {inviteLink ? (
                <TaskListActionsBox sx={{ alignItems: 'center' }}>
                  <OutlinedInput value={inviteLink} type="text" />
                  <IconButton onClick={handleCopyInviteLink}>
                    <FileCopyIcon />
                  </IconButton>
                </TaskListActionsBox>
              ) : (
                <Button onClick={handleGenerateInvite}>Generate collaborator link</Button>
              )}
            </TaskListActionsBox>
          </TaskListActionsBoxWrapper>
          {(taskList.tasks || []).length > 0 ? (
            <>
              <TaskListHeaderBox>
                <Typography component="h2" variant="h3" textAlign="left">
                  Subtasks
                </Typography>
              </TaskListHeaderBox>
              <Stack sx={{ rowGap: 2 }}>
                {taskList.tasks!.map((task) => (
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                    key={task.id}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <CardActions sx={{ paddingLeft: '25px', paddingRight: '5px' }}>
                        <FormControlLabel
                          label=""
                          control={
                            <Checkbox
                              size="large"
                              checked={task.status === 'done'}
                              onChange={handleToggleTaskDone(task.id)}
                            />
                          }
                        />
                      </CardActions>
                      <CardContent>
                        <Typography
                          sx={{
                            textDecoration: taskList.status === 'done' ? 'line-through' : 'none',
                          }}
                          component="h3"
                          variant="h4"
                        >
                          {task.name}
                        </Typography>
                        <Typography>{task.description}</Typography>
                      </CardContent>
                    </Box>
                    <CardActions>
                      <IconButton onClick={handleDeleteTask(task.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            </>
          ) : (
            <TaskListHeaderBox>
              <Typography component="h2" variant="h3">
                No tasks yet!
              </Typography>
            </TaskListHeaderBox>
          )}
        </>
      ) : isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ padding: '20px' }}>
          <Typography component="h1" variant="h3" align="center">
            {fetchTaskListError}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default TaskList;

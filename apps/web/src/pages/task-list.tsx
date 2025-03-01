import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
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
  Stack,
} from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useDialogs } from '@toolpad/core/useDialogs';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CreateTaskDialog from 'src/components/create-task-dialog';
import { deleteTask, updateTask } from 'src/lib/api/tasksApi';

const TaskListCard = styled(MuiCard)(({ theme }) => ({}));
const TaskListActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
  padding: '20px 0',
}));

const TaskListHeaderBox = styled(Box)(({ theme }) => ({
  padding: '20px 0',
}));

const TaskList = () => {
  const notifications = useNotifications();
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
        notifications.show(msg, { severity: 'error' });
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
      await refreshTaskList();
    }
  }, [deleteTaskList, dialogs, notifications, taskList]);

  const handleToggleTaskListDone = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }

    const newTaskListStatus: TaskList['status'] = taskList.status === 'done' ? 'active' : 'done';
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
      notifications.show(msg, { severity: 'error' });
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
        await updateTask(taskId, taskList!.id, {
          name: task.name,
          description: task.description,
          status: task.status === 'done' ? 'active' : 'done',
        });
        await refreshTaskList();
      } catch (error: any) {
        let msg = 'Something went wrong while updating task';
        if (error?.response?.status === 403) {
          msg = 'Your access to this task is suspended';
        } else if (error?.response?.status === 404) {
          msg = 'task not found';
        }
        notifications.show(msg, { severity: 'error' });
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
      `Are you sure you want to delete task "${taskList.name}" ?`,
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

  React.useEffect(() => {
    if (params.id) {
      getTaskList(params.id)
        .then((list) => {
          setTaskList(list);
        })
        .catch((error) => {
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
    }
  }, [params.id]);

  return (
    <TaskListCard variant="outlined" style={{ padding: '15px' }}>
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
                    (taskList.status === 'active' &&
                      taskList.tasks?.some((task) => task.status === 'done')) ||
                    (taskList.status === 'done' &&
                      !taskList.tasks?.some((task) => task.status === 'done'))
                  }
                  onChange={handleToggleTaskListDone}
                />
              }
            />
            <Typography component="h1" variant="h1">
              {taskList.name}
            </Typography>
          </Box>
          {taskList.description ? (
            <Typography component="p">{taskList.description}</Typography>
          ) : null}
          <Divider sx={{ margin: '0 20px 0' }} />
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
              Delete task list
            </Button>
          </TaskListActionsBox>
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
                      <CardContent sx={{}}>
                        <Typography component="h3" variant="h4">
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
    </TaskListCard>
  );
};

export default TaskList;

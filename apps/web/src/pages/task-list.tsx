import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router';
import { deleteTaskList, getTaskList, updateTaskList } from 'src/lib/api/taskListsApi';
import type { TaskList } from '@todoiti/common';
import { Button, CircularProgress } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useDialogs } from '@toolpad/core/useDialogs';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CreateTaskDialog from 'src/components/create-task-dialog';

const TaskListCard = styled(MuiCard)(({ theme }) => ({}));
const TaskListActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
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
        notifications.show(`Updated TODO list "${taskList.name}" successfully!`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });
      } catch (error: any) {
        notifications.show(
          `Error updating TODO list "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 10_000,
          }
        );
      }
    },
    [updateTaskList, dialogs, notifications, taskList]
  );

  const handleInitAddTask = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }

    const result = await dialogs.open<
      { taskListName: string; taskListId: string },
      { created: boolean }
    >(CreateTaskDialog, { taskListName: taskList.name, taskListId: taskList.id });

    if (result.created) {
      setIsLoading(true);
      getTaskList(params.id!)
        .then((list) => {
          setTaskList(list);
        })
        .catch((error) => {
          let msg = 'Something went wrong while refreshing todo list';
          if (error?.response?.status === 403) {
            msg = 'Your access to this TODO list is suspended';
          } else if (error?.response?.status === 404) {
            msg = 'TODO list not found';
          }
          setFetchTaskListError(msg);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [deleteTaskList, dialogs, notifications, taskList]);

  const handleDeleteTaskList = React.useCallback(async () => {
    if (!taskList) {
      // safeguard (edge case)
      return;
    }
    const confirmResult = await dialogs.confirm(
      `Are you sure you want to delete todo list "${taskList.name}" ?`,
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
      notifications.show(`Removed TODO list "${taskList.name}" successfully!`, {
        severity: 'success',
        autoHideDuration: 10_000,
      });
    } catch (error: any) {
      notifications.show(
        `Error deleting TODO list "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
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
          let msg = 'Something went wrong while getting todo list';
          if (error?.response?.status === 403) {
            msg = 'Your access to this TODO list is suspended';
          } else if (error?.response?.status === 404) {
            msg = 'TODO list not found';
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
          <Typography component="h1" variant="h1">
            {taskList.name}
          </Typography>
          <TaskListActionsBox>
            <Button
              color="primary"
              variant="contained"
              onClick={handleInitAddTask}
              startIcon={<CreateIcon />}
            >
              Add new task
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteTaskList}
              startIcon={<DeleteIcon />}
            >
              Delete task list
            </Button>
          </TaskListActionsBox>
          {taskList.description ? (
            <Typography component="p">{taskList.description}</Typography>
          ) : null}
          {(taskList.tasks || []).length > 0 ? (
            <>
              <Typography component="h2" variant="h2">
                tasks
              </Typography>
              {taskList.tasks!.map((task) => (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography>{task.name}</Typography>
                    <Typography>{task.description}</Typography>
                    <Typography>{task.status}</Typography>
                  </Grid>
                </Grid>
              ))}
            </>
          ) : (
            <Typography component="p" color="textSecondary">
              {taskList.tasks?.length ?? 0} tasks
            </Typography>
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

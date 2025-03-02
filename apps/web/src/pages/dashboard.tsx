import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  colors,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  IconButton,
  styled,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router';
import {
  createTaskList,
  deleteTaskList,
  getTaskLists,
  setTaskListStatus,
} from 'src/lib/api/taskListsApi';
import { Task, TaskList } from '@todoiti/common';
import z from 'zod';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useDialogs } from '@toolpad/core/useDialogs';

const TaskListCard = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const FormCard = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [taskLists, setTaskLists] = React.useState<TaskList[]>([]);

  const [nameError, setNameError] = React.useState('');

  const [taskListName, setTaskListName] = React.useState('');
  const [taskListDescription, setTaskListDescription] = React.useState('');

  const [isTaskListsLoading, setIsTaskListsLoading] = React.useState(true);

  const refreshTaskLists = React.useCallback(async () => {
    try {
      setIsTaskListsLoading(true);
      const lists = await getTaskLists();
      setTaskLists(lists);
    } catch (error: any) {
      notifications.show(
        `Error refreshing tasks: ${error?.response?.data?.message || error?.message}`,
        {
          severity: 'error',
          autoHideDuration: 10_000,
        }
      );
    } finally {
      setIsTaskListsLoading(false);
    }
  }, [getTaskLists]);

  const handleSubmit = React.useCallback(
    async (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      setNameError('');
      let nameForm = '';
      try {
        nameForm = z.string().min(3).parse(taskListName);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setNameError(error.issues[0]?.message ?? '');
        } else {
          console.error(error);
        }
        return;
      }

      try {
        await createTaskList({
          name: nameForm,
          description: taskListDescription,
          status: 'active',
        });
        notifications.show(`Task "${nameForm}" created successfully`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });
        setTaskListName('');
        setTaskListDescription('');

        refreshTaskLists();
      } catch (error: any) {
        notifications.show(
          `Error creating task "${nameForm}": ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 10_000,
          }
        );
      }
    },
    [
      nameError,
      setTaskListName,
      setTaskListDescription,
      setTaskLists,
      notifications,
      taskListName,
      taskListDescription,
    ]
  );

  const handleOpenTaskList = React.useCallback(
    (taskListId: string) => () => {
      navigate(`tasks/${taskListId}`);
    },
    [navigate]
  );

  const dialogs = useDialogs();

  const handleDeleteTaskList = React.useCallback(
    (taskListId: string) => async () => {
      const taskList = taskLists.find((l) => l.id === taskListId);
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
        notifications.show(`Removed task "${taskList.name}" successfully!`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });

        await refreshTaskLists();
      } catch (error: any) {
        notifications.show(
          `Error deleting task "${taskList.name}": ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 10_000,
          }
        );
      }
    },
    [deleteTaskList, dialogs, notifications, taskLists]
  );

  const handleToggleTaskListDone = React.useCallback(
    (taskListId: string) => async () => {
      const taskList = taskLists.find((l) => l.id === taskListId);
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
        await refreshTaskLists();
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
    },
    [setTaskListStatus, refreshTaskLists, dialogs, notifications, taskLists]
  );

  React.useEffect(() => {
    let isMounted = true;
    getTaskLists()
      .then((lists) => {
        isMounted && setTaskLists(lists as any);
      })
      .catch((error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          navigate('/login', { replace: true });
          return;
        }
        if (isMounted) {
          notifications.show(
            `Error fetching tasks: ${error?.response?.data?.message || error?.message}`,
            {
              severity: 'error',
              autoHideDuration: 10_000,
            }
          );
        }
      })
      .finally(() => {
        setIsTaskListsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [getTaskLists, setTaskLists, navigate, notifications]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h1" align="center" gutterBottom>
          Your tasks
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {isTaskListsLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : taskLists.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Typography component="h2" variant="h2">
              You have no tasks yet!
            </Typography>
          </Box>
        ) : (
          taskLists.map((taskList) => (
            <Grid size={12}>
              <TaskListCard variant="outlined" sx={{ padding: '10px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <CardActions>
                    <FormControlLabel
                      label=""
                      control={
                        <Checkbox
                          size="large"
                          checked={taskList.status === 'done'}
                          onChange={handleToggleTaskListDone(taskList.id)}
                        />
                      }
                    />
                  </CardActions>
                  <CardContent sx={{ '&:hover': { cursor: 'pointer' } }}>
                    <Box onClick={handleOpenTaskList(taskList.id)}>
                      <Typography
                        component="h4"
                        variant="h4"
                        sx={{
                          textDecoration: taskList.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {taskList.name}
                      </Typography>
                      <Typography
                        component="p"
                        color="textSecondary"
                        sx={{
                          textDecoration: taskList.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {taskList.tasks?.length ?? 0} subtasks
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
                <CardActions>
                  <IconButton onClick={handleDeleteTaskList(taskList.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </TaskListCard>
            </Grid>
          ))
        )}

        <FormCard>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <TextField
                error={Boolean(nameError)}
                helperText={nameError}
                id="name"
                type="text"
                name="name"
                placeholder="Task name"
                fullWidth
                color={nameError ? 'error' : 'primary'}
                onChange={(event) => setTaskListName(event.target.value)}
                value={taskListName}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <TextareaAutosize
                name="description"
                placeholder="Task description"
                id="description"
                color="primary"
                onChange={(event) => setTaskListDescription(event.target.value)}
                value={taskListDescription}
                minRows={10}
              />
            </FormControl>
            <Button type="submit" color="primary" startIcon={<CreateIcon />} variant="contained">
              Create
            </Button>
          </Box>
        </FormCard>
      </Grid>
    </Box>
  );
};

export default Dashboard;

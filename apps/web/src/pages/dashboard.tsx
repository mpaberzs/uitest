import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import CreateIcon from '@mui/icons-material/Create';
import {
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  styled,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { createTaskList, getTaskLists } from 'src/lib/api/taskListsApi';
import { TaskList, taskStatusSchema } from '@todoiti/common';
import z from 'zod';
import { useNotifications } from '@toolpad/core/useNotifications';

const TaskListCard = styled(MuiCard)(({ theme }) => ({
  '&:hover': {
    cursor: 'pointer',
  },
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
        `Error refreshing TODO lists: ${error?.response?.data?.message || error?.message}`,
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
        await createTaskList({ name: nameForm, description: taskListDescription, status: 'active' });
        notifications.show(`TODO list "${nameForm}" created successfully`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });
        setTaskListName('');
        setTaskListDescription('');

        refreshTaskLists();
      } catch (error: any) {
        notifications.show(
          `Error creating TODO list "${nameForm}": ${error?.response?.data?.message || error?.message}`,
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
      navigate(`todos/${taskListId}`);
    },
    [navigate]
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
            `Error fetching TODO lists: ${error?.response?.data?.message || error?.message}`,
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
          Your TODO lists
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
              You have no TODO lists yet!
            </Typography>
          </Box>
        ) : (
          taskLists.map((taskList) => (
            <Grid
              size={taskLists.length >= 3 ? 4 : 12 / taskLists.length}
              onClick={handleOpenTaskList(taskList.id)}
            >
              <TaskListCard variant="outlined" style={{ padding: '10px' }}>
                <Typography component="h4" variant="h4">
                  {taskList.name}
                </Typography>
                {taskList.description ? (
                  <Typography component="p">{taskList.description}</Typography>
                ) : null}
                <Typography component="p" color="textSecondary">
                  {taskList.tasks?.length ?? 0} tasks
                </Typography>
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
                placeholder="TODO list name"
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
                placeholder="TODO list description"
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

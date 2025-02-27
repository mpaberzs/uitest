import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import {
  Button,
  colors,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  Snackbar,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import { createTaskList, getTaskList, getTaskLists } from 'src/lib/api/taskListsApi';
import { TaskList } from '@todoiti/common';
import z from 'zod';

const Card = styled(MuiCard)(({ theme }) => ({}));

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
  const [lists, setLists] = React.useState<TaskList[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const [nameError, setNameError] = React.useState('');

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = React.useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      setNameError('');
      let nameForm = '';
      try {
        nameForm = z.string().min(3).parse(name);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setNameError(error.issues[0]?.message ?? '');
        } else {
          console.error(error);
        }
        return;
      }

      createTaskList({ name: nameForm, description }).then(() => {
        setName('');
        setDescription('');
        getTaskLists().then((lists) => {
          setLists(lists);
        });
      });
    },
    [nameError, name, description]
  );

  const closeSnackbar = React.useCallback(() => setIsSnackbarOpen(false), []);

  React.useEffect(() => {
    let isMounted = true;
    getTaskLists()
      .then((lists) => {
        isMounted && setLists(lists as any);
      })
      .catch((error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          navigate('/login', { replace: true });
          return;
        }
        if (isMounted) {
          setSnackbarMessage('Failed to fetch tasks');
          setIsSnackbarOpen(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbarMessage}
        color={colors.red['600']}
      />
      <div>
        <Typography variant="h1" align="center" gutterBottom>
          Your TODO lists
        </Typography>
      </div>
      <Grid container spacing={2}>
        {lists.map((list) => (
          <Grid size={lists.length >= 3 ? 4 : 12 / lists.length}>
            <Card variant="outlined" style={{ padding: '10px' }}>
              <Typography component="h4">
                <NavLink to={`todos/${list.id}`}>{list.name}</NavLink>
              </Typography>
              {list.description ? <Typography component="p">{list.description}</Typography> : null}
              <Typography component="p" color="textSecondary">
                {list.tasks?.length ?? 0} tasks
              </Typography>
            </Card>
          </Grid>
        ))}

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
                variant="outlined"
                color={nameError ? 'error' : 'primary'}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <TextareaAutosize
                name="description"
                placeholder="TODO list description"
                id="description"
                autoComplete="current-description"
                color="primary"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
                minRows={10}
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
              Create
            </Button>
          </Box>
        </FormCard>
      </Grid>
    </Box>
  );
};

export default Dashboard;

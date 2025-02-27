import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router';
import { getTaskList } from 'src/lib/api/taskListsApi';
import type { TaskList } from '@todoiti/common';
import { Button, colors, Container, Snackbar } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';

const Card = styled(MuiCard)(({ theme }) => ({}));

export default function TaskList(props: { disableCustomTheme?: boolean }) {
  const params = useParams();
  const [taskList, setTaskList] = React.useState<TaskList | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const closeSnackbar = React.useCallback(() => setIsSnackbarOpen(false), []);
  const addTaskToTaskList = React.useCallback(() => {}, [params.id]);

  React.useEffect(() => {
    if (params.id) {
      getTaskList(params.id)
        .then((list) => {
          setTaskList(list);
        })
        .catch(() => {
          setSnackbarMessage('Failed to get todo list');
          setIsSnackbarOpen(true);
        });
    }
  }, [params.id]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbarMessage}
        color={colors.red['600']}
      />
      {taskList ? (
        <Card variant="outlined" style={{ padding: '15px' }}>
          <Typography component="h1" variant="h1">{taskList.name}</Typography>
          {taskList.description ? (
            <Typography component="p">{taskList.description}</Typography>
          ) : null}
          {(taskList.tasks || []).length > 0 ? 

            <>
          <Typography component="h2" variant="h2">tasks</Typography>
          {
            taskList.tasks!.map((task) => (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography>{task.name}</Typography>
                  <Typography>{task.description}</Typography>
                  <Typography>{task.status}</Typography>
                </Grid>
              </Grid>
            ))
          }</> : (
            <Typography component="p" color="textSecondary">
              {taskList.tasks?.length ?? 0} tasks
            </Typography>
          )}
        </Card>
      ) : null}
    </Box>
  );
}

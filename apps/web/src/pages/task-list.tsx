import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router';
import { getTaskList } from 'src/lib/api/taskListsApi';
import type { TaskList, TaskListWithTasks } from '@todoiti/common';
import { Button, colors, Container, Snackbar } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';

const Card = styled(MuiCard)(({ theme }) => ({}));

export default function TaskList(props: { disableCustomTheme?: boolean }) {
  const params = useParams();
  const [taskList, setTaskList] = React.useState<TaskListWithTasks | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const closeSnackbar = React.useCallback(() => setIsSnackbarOpen(false), []);
  const addTaskToTaskList = React.useCallback(() => {}, [params.id]);

  React.useEffect(() => {
    if (params.id) {
      getTaskList(params.id, true)
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
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
    >
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbarMessage}
        color={colors.red['600']}
      />
      {taskList ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>
            <Typography variant="h1" align="center" gutterBottom>
              {taskList.name}
            </Typography>
          </div>
          <Grid container spacing={2}>
            {taskList.tasks.map((task) => (
              <Grid size={12}>
                <Card variant="outlined" style={{ padding: '10px' }}>
                  <Typography component="h1" variant="h4">
                    {task.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button onClick={addTaskToTaskList}>Add Task</Button>
      </Box>
      ) : null}
    </Container>
  );
}

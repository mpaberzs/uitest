import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { colors, Container, Grid2 as Grid, Snackbar } from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import { getTaskLists } from 'src/lib/api/taskListsApi';
import { TaskList } from '@todoiti/common';

const Card = styled(MuiCard)(({ theme }) => ({}));

const Dashboard = () => {
  const navigate = useNavigate();
  const [lists, setLists] = React.useState<TaskList[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const closeSnackbar = React.useCallback(() => setIsSnackbarOpen(false), []);

  React.useEffect(() => {
    getTaskLists()
      .then((lists) => {
        setLists(lists as any);
      })
      .catch((error) => {
        if (error.response.status === 401 || error.response.status === 403) {
          navigate('/login');
          return;
        }
        setSnackbarMessage('Failed to fetch tasks');
        setIsSnackbarOpen(true);
      });
  }, []);

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>
          <Typography variant="h1" align="center" gutterBottom>
            Your TODO lists
          </Typography>
        </div>
        <Grid container spacing={2}>
          {lists.map((list) => (
            <Grid size={6}>
              <Card variant="outlined" style={{padding: '10px'}}>
                <Typography component="h1" variant="h4">
                  <NavLink to={`todos/${list.id}`}>{list.name}</NavLink>
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;

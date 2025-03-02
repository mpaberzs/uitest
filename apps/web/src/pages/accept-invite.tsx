import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { redirect, useLocation, useNavigate, useParams } from 'react-router';
import { type TaskList as AcceptInvite } from '@todoiti/common';
import { Button, CircularProgress } from '@mui/material';
import { acceptInvite } from 'src/lib/api/invitesApi';
import { HttpStatusCode } from 'axios';
import { UserContext } from 'src/app';
import { useCallback, useContext, useEffect, useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';

const AcceptInvite = () => {
  const params = useParams();
  const context = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [acceptInviteError, setAcceptInviteError] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (params.hash) {
      acceptInvite(params.hash)
        .then(({ taskListId }) => {
          navigate(`/tasks/${taskListId}`, { replace: true });
        })
        .catch((error) => {
          if (error?.response?.status === HttpStatusCode.Unauthorized) {
            navigate(`/login`, { replace: true, state: { inviteProcess: true, nextUrl: location.pathname } });
          }
          setAcceptInviteError(error?.response?.data?.message || error?.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params.id]);

  const handleGoToDashboard = useCallback(() => navigate('/', { replace: true }), [navigate]);
  const handleGoToLogin = useCallback(() => navigate('/login', { replace: true }), [navigate]);

  return (
    <>
      <Box>
        <Button
          onClick={context?.user?.id ? handleGoToDashboard : handleGoToLogin}
          color="secondary"
          startIcon={<HomeIcon />}
        >
          {context?.user?.id ? 'Go to Dashboard' : 'Go to login page'}
        </Button>
      </Box>
      {isLoading ? (
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
      ) : acceptInviteError ? (
        <Box sx={{ padding: '20px' }}>
          <Typography component="h1" variant="h3" align="center">
            {acceptInviteError}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ padding: '20px' }}>
          <Typography component="h1" variant="h3" align="center">
            Redirecting...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default AcceptInvite;

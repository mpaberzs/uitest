import { useCallback, useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Box, Button, colors, Container, styled, Typography } from '@mui/material';
import { logout, whoami } from './lib/api/authApi';
import { HttpStatusCode } from 'axios';
import { useNotifications } from '@toolpad/core/useNotifications';
import { UserContext } from './app';

const ProtectedRouteContainer = styled(Container)(({ theme }) => ({
  padding: '60px 0',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.common.white,
}));

const ProtectedRoute = () => {
  const ctx = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  useEffect(() => {
    let isMounted = true;
    whoami()
      .then((user) => {
        isMounted &&
          ctx.setUser({
            id: user.id,
            lastName: user.last_name,
            firstName: user.first_name,
            email: user.email,
          });
      })
      .catch((error: any) => {
        if (error?.response?.status === HttpStatusCode.Unauthorized) {
          isMounted &&
            navigate('/login', {
              state: {
                nextUrl: location.pathname,
                isInviteProcess: location.pathname.includes('accept-invite'),
              },
              replace: true,
            });
        } else {
          console.error(`error in whoami request: ${error?.response?.data || error?.message}`);
          isMounted &&
            navigate('/error', {
              replace: true,
              state: { errorMessage: 'Something went wrong, contact web app administator' },
            });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = useCallback(() => {
    logout()
      .then((result) => {
        if (result.success) {
          ctx.setUser(null);
        }
        navigate('/login', { replace: true });
      })
      .catch((error) => {
        notifications.show(
          `Error while logging out ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 30_000,
          }
        );
      });
  }, []);

  const userString = ctx.user?.id
    ? ctx.user?.firstName
      ? `${ctx.user?.firstName}${ctx.user?.lastName ? ` ${ctx.user?.lastName}` : ''}`
      : ctx.user?.email
    : '';

  return (
    <ProtectedRouteContainer maxWidth="lg">
      {userString ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '15px 0',
          }}
        >
          <Box>
            <Typography component="p" variant="body1">
              {userString}
            </Typography>
          </Box>
          <Box sx={{ marginRight: '15px' }}>
            <Button onClick={handleLogout}>Logout</Button>
          </Box>
        </Box>
      ) : null}
      {ctx.user?.id ? <Outlet /> : <></>}
    </ProtectedRouteContainer>
  );
};

export default ProtectedRoute;

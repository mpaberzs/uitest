import { useCallback, useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Box, Button, colors, Container, styled, Typography } from '@mui/material';
import { logout, whoami } from './lib/api/authApi';
import { HttpStatusCode } from 'axios';
import { NotificationsProvider, useNotifications } from '@toolpad/core/useNotifications';
import { DialogsProvider } from '@toolpad/core/useDialogs';
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
          isMounted && navigate('login', { replace: true });
        } else {
          console.error(`error in whoami request: ${error?.response?.data || error?.message}`);
          isMounted && navigate('error', { replace: true });
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
        navigate('/login');
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
    <NotificationsProvider>
      <DialogsProvider>
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
          <Outlet />
        </ProtectedRouteContainer>
      </DialogsProvider>
    </NotificationsProvider>
  );
};

export default ProtectedRoute;

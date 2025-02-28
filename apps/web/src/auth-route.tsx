import { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Card, colors, Stack, styled } from '@mui/material';
import { HttpStatusCode } from 'axios';
import { whoami } from './lib/api/authApi';
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { UserContext } from './app';

const AuthRouteContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  margin: 0,
  minHeight: '100%',
  backgroundColor: colors.orange['300'],
}));

const AuthRouteCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  margin: 'auto',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

const AuthRoute = () => {
  const ctx = useContext(UserContext);
  const navigate = useNavigate();

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
          }) &&
          navigate('/', { replace: true });
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

  return (
    <NotificationsProvider>
      <AuthRouteContainer>
        <AuthRouteCard>
          <Outlet />
        </AuthRouteCard>
      </AuthRouteContainer>
    </NotificationsProvider>
  );
};

export default AuthRoute;

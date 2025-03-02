import { Outlet, useNavigate } from 'react-router';
import { Card, colors, Stack, styled } from '@mui/material';
import { useContext, useEffect } from 'react';
import { UserContext } from './app';
import { whoami } from './lib/api/authApi';
import { HttpStatusCode } from 'axios';

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
    // check if the user actually needs to auth
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
        if (error?.response?.status !== HttpStatusCode.Unauthorized) {
          console.error(`error in whoami request: ${error?.response?.data || error?.message}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthRouteContainer>
      <AuthRouteCard>
        <Outlet />
      </AuthRouteCard>
    </AuthRouteContainer>
  );
};

export default AuthRoute;

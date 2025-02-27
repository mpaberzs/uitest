import { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { UserContext } from './lib/user-context';
import { colors, Container, Stack, styled } from '@mui/material';
import { whoami } from './lib/api/authApi';
import { HttpStatusCode } from 'axios';

const ProtectedStack = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  margin: 0,
  minHeight: '100%',
  backgroundColor: colors.orange['300'],
}));

const ProtectedRoute = () => {
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

  return (
    <ProtectedStack>
      <Container
        maxWidth="lg"
        component="main"
        sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
      >
        <Outlet />
      </Container>
    </ProtectedStack>
  );
};

export default ProtectedRoute;

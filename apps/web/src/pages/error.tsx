import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router';
import { Button, colors, Container, styled } from '@mui/material';
import { useCallback, useContext } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import { UserContext } from 'src/app';

const ErrorPageContainer = styled(Container)(({ theme }) => ({
  padding: '60px 0',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.common.white,
}));

const ErrorPage = () => {
  const context = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoToDashboard = useCallback(() => navigate('/', { replace: true }), [navigate]);
  const handleGoToLogin = useCallback(() => navigate('/login', { replace: true }), [navigate]);

  return (
    <ErrorPageContainer maxWidth="lg">
      <Box>
        <Button
          onClick={context?.user?.id ? handleGoToDashboard : handleGoToLogin}
          color="secondary"
          startIcon={<HomeIcon />}
        >
          {context?.user?.id ? 'Go to Dashboard' : 'Go to login page'}
        </Button>
      </Box>
      <Box sx={{ padding: '20px' }}>
        <Typography component="h1" variant="h3" align="center">
          {location.state?.errorMessage || 'Something went wrong'}
        </Typography>
      </Box>
    </ErrorPageContainer>
  );
};

export default ErrorPage;

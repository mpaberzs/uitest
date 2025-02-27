import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { colors, Snackbar } from '@mui/material';
import z from 'zod';
import { login } from 'src/lib/api/authApi';
import { NavLink, useNavigate } from 'react-router';
import { axiosInstance } from 'src/lib/api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState(false);

  const closeSnackbar = React.useCallback(() => setIsSnackbarOpen(false), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    let parsedEmail = '';
    try {
      parsedEmail = z.string().email().toLowerCase().parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.issues[0]?.message ?? '');
      } else {
        console.error(error);
      }
      return;
    }

    try {
      z.string().min(8).parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.issues[0]?.message ?? '');
      } else {
        console.error(error);
      }
      return;
    }

    login(email, password)
      .then(({ accessToken }) => {
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
        navigate('/', { replace: true });
      })
      .catch((error: any) => {
        setSnackbarText(error?.response?.data?.message || error?.message);
        setIsSnackbarOpen(true);
      });
  };

  return (
    <>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbarText}
        color={colors.red['600']}
      />
      <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 2,
        }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={Boolean(emailError)}
            helperText={emailError}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? 'error' : 'primary'}
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <TextField
            error={Boolean(passwordError)}
            helperText={passwordError}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
          />
        </FormControl>
        <Button type="submit" fullWidth variant="contained">
          Sign in
        </Button>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <NavLink to="/signup" replace>
            Sign up
          </NavLink>
        </Typography>
      </Box>
    </>
  );
};
export default Login;

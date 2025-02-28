import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import z from 'zod';
import { signup } from 'src/lib/api/authApi';
import { NavLink, useNavigate } from 'react-router';
import { useNotifications } from '@toolpad/core/useNotifications';

const Signup = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setEmailError('');
    setPasswordError('');

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

    signup(parsedEmail, password)
      .then(() => {
        setPassword('');
        setEmail('');
        navigate('/login', { replace: true });
      })
      .catch((err) => {
        notifications.show(err?.response?.data?.message || err?.message, {
          severity: 'error',
          autoHideDuration: 10_000,
        })
      });
  };

  return (
    <>
      <Typography component="h1" variant="h4" sx={{ width: '100%' }}>
        Sign up
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
          Sign up
        </Button>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ textAlign: 'center' }}>
          Already have an account? <NavLink to="login">Log in</NavLink>
        </Typography>
      </Box>
    </>
  );
};
export default Signup;

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { colors } from '@mui/material';
import z from 'zod';
import { signup } from 'src/lib/api/authApi';

const Card = styled(MuiCard)(({ theme }) => ({
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

const AuthContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  margin: 0,
  minHeight: '100%',
  backgroundColor: colors.orange['300'],
}));

const Signup = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

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

    signup(email, password).then(() => { alert('y')}).catch((err) => alert(err.message));
  };

  return (
    <AuthContainer>
      <Card variant="outlined">
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
            Already have an account?{' '}
            <Link
              href="login"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </Card>
    </AuthContainer>
  );
};
export default Signup;

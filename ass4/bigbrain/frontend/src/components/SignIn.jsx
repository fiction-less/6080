import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { apiCall } from '../App.jsx';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const theme = createTheme();

function SignIn (onSuccess) {
  const [error, setError] = React.useState(false);
  const [errContent, setErrContent] = React.useState('');
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // login api call
    const options = {
      method: 'POST',
      url: '/admin/auth/login',
      body: JSON.stringify({
        email: data.get('email'),
        password: data.get('password'),
      })
    };
    apiCall(onSuccess, options)
      .then((res) => {
        if (res) {
          // set error msg if api call returns error
          setErrContent(`Error: ${res}`);
          setError(true);
        } else {
          navigate('/dashboard');
        }
      });
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={login} noValidate sx={{ mt: 1 }}>
            <div>
              {error ? <Alert severity='error'>{errContent}</Alert> : <></> }
            </div>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="text"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              name="sign in"
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignIn;

import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { apiCall } from '../App';

// Navigtate to play game screen
const navPlayGame = (data, params) => {
  params.nav(`/quiz/${data.playerId}/play`);
}

// Attempt to join session
function attemptJoin (navigate, sessionId, playerName) {
  const options = {
    method: 'POST',
    url: `/play/join/${sessionId}`,
    body: JSON.stringify({
      name: playerName,
    }),
  };
  const params = {
    nav: navigate,
  };

  apiCall(navPlayGame, options, params);
}

export function PlayJoinComponent () {
  const nav = useNavigate();
  const params = useParams();
  const [isJoining, setIsJoining] = React.useState(true);
  const [name, setName] = React.useState('');
  const [sessionId, setSessionId] = React.useState(0);
  const [isIdSet, setIsIdSet] = React.useState(false);

  // Join session page component
  const joinSessionPage = () => {
    return (
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 10, display: 'flex' },
        }}
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          if (!isIdSet) {
            setSessionId(params.sessionId);
          }
          e.preventDefault();
          // transition to enter name page
          setIsJoining(false);
        }}
      >
        <Stack spacing={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5">Join via session id</Typography>
          { params.sessionId === undefined
            ? <TextField id="outlined-basic" label="Enter session id" variant="outlined" required
            onChange={(e) => {
              setSessionId(e.target.value);
              setIsIdSet(true);
            }}/>
            : <TextField id="outlined-basic" label="Session id" variant="outlined" value={params.sessionId}/>
          }
          <Button type='submit' sx={{ width: '26ch' }} variant="contained">Continue</Button>
        </Stack>
      </Box>
    );
  };

  // Enter name page component
  const enterNamePage = () => {
    return (
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 10, display: 'flex' },
        }}
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          attemptJoin(nav, sessionId, name);
        }}
      >
        <Stack spacing={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5">Enter your name</Typography>
          <TextField id="outlined-basic" name='name' label="Name" variant="outlined" required onChange={(e) => setName(e.target.value)} value={name}/>
          <Button type='submit' sx={{ width: '26ch' }} variant="contained">Join!</Button>
        </Stack>
      </Box>
    );
  };

  return (
    <div style={{ paddingTop: 90 }}>
    { isJoining === true
      ? joinSessionPage()
      : enterNamePage()
    }
    </div>
  );
}

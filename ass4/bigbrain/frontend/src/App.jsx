import React from 'react';
import Config from './config.json'
import { Context, initialValue } from './context';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

import SignIn from './components/SignIn';
import Register from './components/Register';
import { DashboardComponent, NewGameComponent } from './components/dashboard';
import { EditQuestionComponent } from './components/editQuestion';
import { EditGameComponent } from './components/editGame';
import { StartGameComponent } from './components/session';
import { GameResultsComponent } from './components/results';
import { PlayJoinComponent } from './components/playJoin';
import { PlayGameComponent } from './components/playGame';
import Modal from '@mui/material/Modal';

const PORT = Config.BACKEND_PORT;

export async function apiCall (onSuccess, options, ...optional) {
  const url = `http://localhost:${PORT}${options.url}`;
  const params = {
    method: options.method,
    headers: {
      'Content-type': 'application/json',
    },
    body: options.body
  }

  if (localStorage.getItem('token')) {
    params.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }

  const response = await fetch(url, params);
  const data = await response.json();
  if (data.error) {
    return data.error;
  } else {
    console.log(data);
    return onSuccess(data, ...optional);
  }
}

// Component for signed out nav bar
const SignedOutNav = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🧠 BigBrain
          </Typography>
          <Button color="inherit"><span><Link to="/quiz/join" style={{ textDecoration: 'none', color: 'white' }}>Join game</Link></span></Button>
          <Button color="inherit"><span><Link to="/login" style={{ textDecoration: 'none', color: 'white' }}>Login</Link></span></Button>
          <Button color="inherit"><span><Link to="/register" style={{ textDecoration: 'none', color: 'white' }}>Register</Link></span></Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

// Component for signed in nav bar
const SignedInNav = ({ logout }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar sx={{ flexGrow: 1, marginBottom: 5 }} position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🧠 BigBrain
          </Typography>

          <Button color="inherit"><span><Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>Dashboard</Link></span></Button>
          <Button id="createBtn" color="secondary" variant="filled" startIcon={<LibraryAddIcon />} onClick={handleOpen}>
            Create
          </Button>
          {NewGameComponent(open, handleClose)}
          <Button id="logoutBtn" color="inherit" onClick={logout}><span><Link to="/login" style={{ textDecoration: 'none', color: 'white' }}>Logout</Link></span></Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const LoginComponent = ({ onSuccess }) => {
  return SignIn(onSuccess);
};

const RegisterComponent = ({ onSuccess }) => {
  return Register(onSuccess);
};

// Component for error modal
export function ErrModal ({ errMsg, open, handleClose }) {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="Error modal"
        aria-describedby="An error has occurred"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            An error has occurred
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {errMsg}
          </Typography>
          <Button variant="contained" sx={{ float: 'right' }} onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
}

function App () {
  const [token, setToken] = React.useState(null);
  const [quizzes, setQuizzes] = React.useState(initialValue.quizzes);
  const [stoppedSessionId, setStoppedSessionId] = React.useState(0);

  // sets user login token
  function manageTokenSet (data) {
    setToken(data.token);
    localStorage.setItem('token', (data.token));
  }

  // logs out, removes token from local storage
  function logout () {
    const options = {
      method: 'POST',
      url: '/admin/auth/logout',
    };
    apiCall(() => {}, options);
    setToken(null);
    localStorage.removeItem('token');
  }

  React.useEffect(function () {
    if (localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const getters = {
    quizzes,
    stoppedSessionId,
  }
  const setters = {
    setQuizzes,
    setStoppedSessionId,
  }
  return (
    <Context.Provider value = {{ getters, setters }}>
    <header>
    {token === null
      ? <BrowserRouter>
        <SignedOutNav />
        <Routes>
          <Route path="/login" element={<LoginComponent onSuccess={manageTokenSet}/>} />
          <Route path="/register" element={<RegisterComponent onSuccess={manageTokenSet}/>}/>
          <Route path="/quiz/:sessionId/join" element={<PlayJoinComponent />} />
          <Route path="/quiz/join" element={<PlayJoinComponent />} />
          <Route path="/quiz/:playerId/play" element={<PlayGameComponent />} />
        </Routes>
      </BrowserRouter>
      : <BrowserRouter>
        <SignedInNav logout={logout}/>
        <Routes>
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/dashboard/editGame/:id" element={<EditGameComponent />} />
          <Route path="//dashboard/editGame/:id/:questionId" element={<EditQuestionComponent />} />
          <Route path="/quiz/:id/start" element={<StartGameComponent />} />
          <Route path="/quiz/:sessionId/results" element={<GameResultsComponent />} />
          <Route path="/quiz/:sessionId/join" element={<PlayJoinComponent />} />
          <Route path="/quiz/join" element={<PlayJoinComponent />} />
          <Route path="/quiz/:playerId/play" element={<PlayGameComponent />} />
        </Routes>
      </BrowserRouter>
    }
    </header>
    <main>
    </main>
    </Context.Provider>
  );
}

export default App;

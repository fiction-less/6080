import React from 'react';
import { ErrModal, apiCall } from '../App.jsx';
import { useContext, Context } from '../context';
import { useNavigate } from 'react-router-dom';
import { playGame, EndGameModalComponent, stopGame } from './session.jsx';
import Media from 'react-media';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Container } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// import FaceIcon from '@mui/icons-material/Face';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleIcon from '@mui/icons-material/StopCircle';

let timeRequired = [];
let numQuestions = [];
const updateDashboard = (data, setQuizzes) => {
  fetchAllQuizzes(setQuizzes);
}

async function createGame (quizName, setQuizzes) {
  const options = {
    method: 'POST',
    url: '/admin/quiz/new',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      name: quizName,
    })
  }
  apiCall(updateDashboard, options, setQuizzes);
}
const fetchAllQuizzes = (setQuizzes) => {
  const options = {
    method: 'GET',
    url: '/admin/quiz',
    headers: {
      'Content-type': 'application/json',
    }
  }
  apiCall(loadDashboard, options, setQuizzes);
}

// ////////

const getTime = (data, quiz) => {
  let time = 0;
  for (let i = 0; i < data.questions.length; i++) {
    time += data.questions[i].timeLimit;
  }
  console.log(time);
  return time;
}

const getNumGames = (data, quiz) => {
  console.log(data.questions.length);
  return data.questions.length;
}

async function getDetails (gameId, quiz, onSuccess) {
  const options = {
    method: 'GET',
    url: `/admin/quiz/${gameId}`,
    headers: {
      'Content-type': 'application/json',
    },
  }
  const res = await apiCall(onSuccess, options, quiz);
  console.log(res);
  return res;
}
// gets all quiizes

export function DashboardComponent () {
  const [errOpen, setErrOpen] = React.useState(false);
  const handleErrClose = () => setErrOpen(false);
  const [errMsg, setErrMsg] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const { getters, setters } = useContext(Context);
  const navigate = useNavigate();

  React.useEffect(async () => {
    fetchAllQuizzes(setters.setQuizzes);
    console.log(getters.quizzes.length);
  }, []);

  let noGames = false;
  if (getters.quizzes.length === 0) noGames = true;
  return <>
    { errOpen
      ? <ErrModal errMsg={errMsg} open={errOpen} handleClose={handleErrClose}/>
      : <></> }
    <Typography variant="h6" sx={{ padding: '2%', paddingTop: 10 }}>
    USER DASHBOARD
    </Typography>
    {EndGameModalComponent(navigate, open, handleClose)}

    { noGames
      ? <div style={{ paddingTop: '10%', paddingLeft: '45%', fontFamily: 'Arial', fontStyle: 'italic', color: 'gray' }}>Nothing to Show . . .</div>
      : getters.quizzes.map((quiz, i) => (
      <> {createGameCard(quiz, navigate, setOpen, errMsg,
        setErrMsg, errOpen, setErrOpen, handleErrClose, i)}<br /></>
      ))}
  </>;
}

async function loadDashboard (data, setQuizzes) {
  let arr = [];
  let games = [];
  for (let i = 0; i < [data][0].quizzes.length; i++) {
    const time = await getDetails([data][0].quizzes[i].id, [data][0].quizzes[i], getTime);
    const numQ = await getDetails([data][0].quizzes[i].id, [data][0].quizzes[i], getNumGames)
    arr = [...arr, time];
    games = [...games, numQ];
  }
  timeRequired = arr;
  numQuestions = games;
  console.log(numQuestions)
  setQuizzes([...data.quizzes]);
}

// opens a modal for creaing a new game

const createGameCard = (quiz, navigate, setOpen, errMsg, setErrMsg, errOpen, setErrOpen, handleErrClose, index) => {
  let thumbnail = require('../images/default-image.png');
  if (quiz.thumbnail !== null) thumbnail = quiz.thumbnail;

  const { setters } = useContext(Context);
  // const allButtons =
  //   <Box sx={{ display: 'flex', marginLeft: 'auto', marginTop: 'auto', pl: 1, pb: 1 }}>
  //   <IconButton onClick={() => { deleteGame(quiz.id, setters.setQuizzes) }} aria-label="delete quiz">
  //     <DeleteIcon />
  //   </IconButton>
  // </Box>

  const sessionB = <IconButton aria-label="start session" onClick={() => playGame(navigate, quiz.id) !== 0}>
          <PlayCircleOutlineIcon />
        </IconButton>
  const stopSessionB =
  <IconButton aria-label="stop session" onClick={() => {
    setters.setStoppedSessionId(quiz.active);
    if (quiz.active !== null) {
      stopGame(quiz.id);
      setOpen(true);
    } else {
      setErrOpen(true);
      setErrMsg('Session is not active');
    }
  }}>
    <StopCircleIcon/>
  </IconButton>

  const editb = <IconButton aria-label="edit quiz" onClick={() => editGame(navigate, quiz.id)}>
  <EditIcon/>
</IconButton>

  const deleteB = <IconButton onClick={() => { deleteGame(quiz.id, setters.setQuizzes) }} aria-label="delete quiz">
  <DeleteIcon />
</IconButton>
  return (<>
    { errOpen
      ? <ErrModal errMsg={errMsg} open={errOpen} handleClose={handleErrClose}/>
      : <></> }
    <Card sx={{ display: 'flex', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <Container sx={{ height: 170, width: 300, border: '1px solid gray', display: 'flex', justifyContent: 'center' }}>
            <img
            style={{ height: '99.8%', width: '100%', objectFit: 'cover' }}
            src={thumbnail}
            alt="Image to aid question"
          />
          </Container>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
      <CardContent>
          <Typography component="div" variant="h5">
            {quiz.name}
          </Typography>
        </CardContent>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" color="text.secondary" component="div">
                {/* <IconButton aria-label="user Icon">
                  <FaceIcon sx={{ height: 25, width: 25 }} />
                </IconButton>CREATOR: {quiz.owner} */}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" component="div">
              Questions: {numQuestions[index]}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" component="div">
              Estimated Game Time: {timeRequired[index]} secs
              </Typography>
        </Box>

        </CardContent>
        <Media query = '(min-width: 700px)'>
            {matches => {
              return matches
                ? <>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}>
                  <Box sx={{ display: 'flex', marginLeft: 'auto', marginTop: 'auto', pl: 1, pb: 1 }}>
                  {sessionB}
                  {stopSessionB}
                  {editb}
                  {deleteB}
                  </Box>
              </Box>
              </>
                : <>
                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                  {sessionB}
                  {stopSessionB}
                  {editb}
                  {deleteB}
              </Box>
              </>
            }}
        </Media>
    </Card>
  </>);
}
export function NewGameComponent (open, handleClose) {
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
    <>
      <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={open}>
                <Box sx={style}>
                    <Typography component={'span'} id="transition-modal-description" sx={{ mt: 2 }}>
                      {newGameModal(handleClose)}
                    </Typography>
                </Box>
            </Fade>
        </Modal>

    </>
  );
}

function newGameModal (handleClose) {
  const { setters } = useContext(Context);
  const [quizName, setQuizName] = React.useState('');
  let emptyStr = false;
  quizName === '' ? emptyStr = true : emptyStr = false;
  return (<>
  <h2>New game</h2>
  <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
  >
      <TextField id="filled-basic" label="Game Title" variant="filled" value={quizName} onChange={e => setQuizName(e.target.value)} />
  </Box>

  <Stack direction="row" spacing={2}>
      <Button id="createNewGameButton" disabled={emptyStr} variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => { handleClose(); createGame(quizName, setters.setQuizzes); setQuizName('') }}>Create</Button>
      <Button variant="contained" onClick={() => handleClose()}>
          Cancel
      </Button>
  </Stack>
  </>);
}

const editGame = (navigate, gameId) => {
  navigate('/dashboard/editGame/' + gameId);
}

const deleteGame = (gameId, setQuizzes) => {
  const options = {
    method: 'DELETE',
    url: `/admin/quiz/${gameId}`,
    headers: {
      'Content-type': 'application/json',
    },
  }
  apiCall(updateDashboard, options, setQuizzes);
}

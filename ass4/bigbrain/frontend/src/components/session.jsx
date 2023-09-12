import React from 'react';
import { apiCall } from '../App';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, Context } from '../context';

// Navigate to play screen
const navPlayScreen = (data, params) => {
  params.nav(`/quiz/${params.id}/start`);
}

// Start game api call
export function playGame (navigate, quizId) {
  const options = {
    method: 'POST',
    url: `/admin/quiz/${quizId}/start`,
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      quizid: quizId,
    })
  };
  const params = {
    id: quizId,
    nav: navigate,
  };
  apiCall(navPlayScreen, options, params)
    .then((res) => {
      if (res) {
        return res;
      } else {
        return 0;
      }
    });
}

// Navigate to results screen
function navResults (nav, sessionId) {
  nav(`/quiz/${sessionId}/results`);
}

// Stop game api call
export function stopGame (quizId) {
  const options = {
    method: 'POST',
    url: `/admin/quiz/${quizId}/end`,
  };
  apiCall(() => {}, options);
}

export function StartGameComponent () {
  const params = useParams();
  const quizId = params.id;
  const [sessionModalOpen, setSessionModalOpen] = React.useState(true);
  const [sessionEnded, setSessionEnded] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(0);
  let numQuestions = 0;
  const handleSessionModalClose = () => setSessionModalOpen(false);

  const nav = useNavigate();

  // Runs on first render, checks if session has ended
  React.useEffect(() => {
    const options = {
      method: 'GET',
      url: `/admin/quiz/${quizId}`,
    }
    apiCall((data) => {
      if (data.active === null) {
        setSessionEnded(true);
      } else {
        setSessionId(data.active);
      }
    }, options);
  }, [])

  // api call to get next question
  const getNextQuestion = () => {
    let options = {
      method: 'GET',
      url: `/admin/session/${sessionId}/status`,
    }

    apiCall((data) => {
      numQuestions = data.results.questions.length;
    }, options)
      .then(() => {
        options = {
          method: 'POST',
          url: `/admin/quiz/${quizId}/advance`,
        };

        apiCall((data) => {
          if (data.stage === (numQuestions - 1) || numQuestions === 0) {
            setSessionEnded(true);
          }
        }, options)
          .then((res) => {
            if (res) {
              setSessionEnded(true);
            }
          });
      }
      );
  }

  return (<>
    <Box sx={{ display: 'flex', paddingTop: 10 }}>
      {SessionModalComponent(sessionModalOpen, handleSessionModalClose, quizId)}
      <div style={{ paddingTop: 90, display: 'flex', justifyContent: 'center' }}>
        <Button id="getQuestionBtn" sx={{ width: 400, height: 100, marginRight: 10, minWidth: 200 }} variant="contained" color="primary" onClick={() => {
          if (sessionEnded) {
            stopGame(quizId);
            navResults(nav, sessionId);
          }
          getNextQuestion();
        }}>
          { sessionEnded
            ? 'Get results!'
            : 'Advance to next question' }
        </Button>
        <Button id="endGameBtn" sx={{ width: 400, height: 100, minWidth: 200 }} onClick={() => {
          stopGame(quizId);
          navResults(nav, sessionId);
        }} variant="contained" color="error">
          End game
        </Button>
      </div>
    </Box>
    </>)
}

// End game modal, asking to view results
export function EndGameModalComponent (nav, open, handleClose) {
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
                        {endGameModal(handleClose, nav)}
                      </Typography>
                  </Box>
              </Fade>
          </Modal>

      </>
  );
}

function endGameModal (handleClose, navigate) {
  const { getters } = useContext(Context);
  return (<>
      <Box
          component="form"
          sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
          noValidate
          autoComplete="off"
      >
        <h2>Would you like to view the results?</h2>
      </Box>

      <Stack direction="row" spacing={1} sx={{ float: 'right' }}>

          <Button variant="contained" onClick={() => {
            navResults(navigate, getters.stoppedSessionId);
          }
            }>Yes!</Button>
          <Button variant="contained" onClick={handleClose}>No</Button>
      </Stack>
    </>);
}

export function SessionModalComponent (open, handleClose, quizId) {
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
    <div style={{ paddingTop: 90 }}>
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
                        {newSessionModal(handleClose, quizId)}
                      </Typography>
                  </Box>
              </Fade>
          </Modal>

      </div>
  );
}

function newSessionModal (handleClose, quizId) {
  const [sessionId, setSessionId] = React.useState(0);
  const retSessionId = (data) => {
    setSessionId(data.active);
  }
  const [open, setOpen] = React.useState(false)
  const handleClick = () => {
    setOpen(true);
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${sessionId}/join`);
  }

  // gets sessionId from backend
  const options = {
    method: 'GET',
    url: `/admin/quiz/${quizId}`,
  }
  apiCall(retSessionId, options);

  return (<>
      <Box
          component="form"
          sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
          noValidate
          autoComplete="off"
      >
        <h2>Copy session url</h2>
      <>
          <Button variant="text" onClick={handleClick}>{sessionId}</Button>
          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            autoHideDuration={1000}
            message="Copied session url to clipboard"
          />
        </>
      </Box>

      <Stack direction="row" spacing={1} sx={{ float: 'right' }}>
          <Button id="doneBtn" variant="contained" onClick={handleClose}>Done!</Button>
      </Stack>
    </>);
}

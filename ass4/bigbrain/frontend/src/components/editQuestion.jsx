import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameId, initialEditingQ, updateQuestions, createEmptyQuestion, fetchGameDetails, quizItems } from './editGame.jsx';
import ReactPlayer from 'react-player';
import Media from 'react-media';
import { useMediaQuery } from '@mui/material';
// import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import Container from '@mui/material/Container';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CancelIcon from '@mui/icons-material/Cancel';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

// global variables
let editedGameData = '';
let currActiveQuestion = '';
let renderCounter = 2000;
let selectText = 'Players can only choose one correct answer'
// EDITING GAMES

export function EditQuestionComponent () {
  const [preGame, setPregame] = React.useState([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(initialEditingQ);
  const [mediaModalOpen, setMediaModalOpen] = React.useState(false);
  const [forceRender, setForceRender] = React.useState(0);

  const navigate = useNavigate();
  const params = useParams();
  React.useEffect(async () => {
    fetchGameDetails(gameId, setPregame);
  }, []);

  for (let i = 1; i <= quizItems[0].questions.length; i++) {
    if (quizItems[0].questions[i - 1].id === currentQuestion) {
      currActiveQuestion = i;
      break;
    }
  }
  const mediaModal = openMediaModal(mediaModalOpen, setMediaModalOpen, params, forceRender, setForceRender);
  return <>
      <br />
      {swipingDrawer(setForceRender, currentQuestion)}
      {buildQuestions(quizItems, currentQuestion, setCurrentQuestion, mediaModal, navigate, setForceRender, preGame)}

    </>;
}

const buildQuestions = (quizItems, currentQuestion, setCurrentQuestion, mediaModal, navigate, setForceRender, preGame) => {
  editedGameData = quizItems[0];
  const match = useMediaQuery('(min-width: 700px)');
  let drawerWidth = 0;
  match ? drawerWidth = 200 : drawerWidth = 100
  let createdNewQuiz = true;
  // if currentQ = 0 and theres no questions, means its fresh, and need to create new Q
  // else, if current question != 0 but doesnt exist in current questions, then new Q has been created.
  if (currentQuestion === 0 && quizItems[0].questions.length !== 0) {
    createdNewQuiz = false;
  } else {
    for (let i = 0; i < quizItems[0].questions.length; i++) {
      if (currentQuestion === quizItems[0].questions[i].id) { createdNewQuiz = false; break; }
    }
  }

  const questionTitle = quizItems[0].questions.map((question, index) => (
    <>
    {currentQuestion === question.id
      ? <TextField InputProps={{
        inputProps: {
          style: { textAlign: 'center', fontSize: 25, fontWeight: 'bold', paddingTop: '2%' },
        }
      }}
      multiline fullWidth variant="standard" placeholder='Add your Question' defaultValue={question.question} onBlur={(e) => { editQuestionField(question.id, e.target.value, gameId) }} />
      : () => {}}
    </>
  ))

  return (
      <>

      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            zIndex: 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Toolbar variant='dense' />
              <Box sx={{ overflow: 'auto' }}>
                <List>

                {quizItems[0].questions.map((question, index) => (
                      <> <br />
                      {createDrawerQuestionCard(index + 1, setCurrentQuestion, question.id, navigate)}
                  </>
                ))}

                </List>
              </Box>
              <Box sx={{ padding: 1.5, paddingBottom: 5 }}>
              <Media query = '(max-width: 700px)'>
              {matches => {
                return matches
                  ? <>
                 <div><Button onClick={() => { navigateToGame(navigate) }} sx={{ width: '100%' }} variant="text" startIcon={<CancelIcon />}></Button></div>
              {/* <div><Button onClick={() => { discardChanges(navigate, preGame) }} sx={{ width: '100%' }} variant="text" startIcon={<RestoreIcon />}></Button></div> */}
                </>
                  : <>
                 <div><Button onClick={() => { navigateToGame(navigate) }} sx={{ width: '100%' }} variant="outlined" startIcon={<CancelIcon />}>Stop Editing</Button></div>
              {/* <div><Button onClick={() => { discardChanges(navigate, preGame) }} sx={{ width: '100%' }} variant="outlined" startIcon={<RestoreIcon />}>Discard Edits</Button></div> */}
                </>
              }}
          </Media>

             </Box>
            </Drawer>
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Typography component={'span'} paragraph>
            <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { m: 1, width: '45%' }
                }}
                noValidate
                  >
            </Box>
          </Typography>
          <Typography component={'span'} paragraph>

            {createdNewQuiz === false
              ? quizItems[0].questions.map((question, index) => (
                <>
                {currentQuestion === question.id
                  ? (createQuestion(question, mediaModal, gameId, questionTitle, setForceRender))
                  : () => {}}
              </>
              ))
              : currentQuestion !== 0
                ? createEmptyQuestion(gameId, editedGameData, false)
                : createEmptyQuestion(gameId, editedGameData, true)
              }

          </Typography>
        </Box>
      </Box>
    </>
  );
}

/******************************************************************************
                      creating Questions + question cards
*******************************************************************************/

const createDrawerQuestionCard = (quizNum, setCurrentQuestion, questionId, navigate, pregame) => {
  let cardStyle = {};
  (quizNum === currActiveQuestion)
    ? cardStyle = {
      border: '3px solid #1876d1',
      borderRadius: 2,
      '&:hover': { bgcolor: 'grey.100', cursor: 'pointer' }
    }
    : cardStyle = {
      '&:hover': { bgcolor: 'grey.100', cursor: 'pointer' }
    }
  return (
      <Stack sx={cardStyle} spacing={1} padding={2} onClick={(e) => { currActiveQuestion = quizNum; navigateToQuestion(navigate, setCurrentQuestion, questionId) }}>
         <Media query = '(max-width: 700px)'>
            {matches => {
              return matches
                ? <div> Quiz {quizNum} </div>
                : <>
                <div> Quiz {quizNum} </div>
                {/* For variant="text", adjust the height via font-size */}
                <Skeleton animation={false} variant="rounded" width={'45%'} height={15} sx={{ fontSize: '1rem' }} />
                {/* For other variants, adjust the size with `width` and `height` */}
                <Skeleton animation={false} variant="square" width={'35%'} height={50} style={{ marginLeft: 'auto', marginRight: 'auto' }}/>
                <Skeleton animation={false} variant="rounded" width={'100%'} height={15} />
                <Skeleton animation={false} variant="rounded" width={'100%'} height={15} />
                </>
            }}
          </Media>
      </Stack>
  );
}
// creates the question cards that you can edit
const createQuestion = (question, mediaModal, quizId, questionTitle, setForceRender) => {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const Answer = (props) => {
    return (
          <Grid item xs={6}>
          <Item>
          <TextField
        id="standard-textarea"
        // value={props.value}
        onBlur={props.onChange}
        placeholder={props.placeholder}
        multiline
        defaultValue={props.answer}
        variant="standard"
        style = {{ width: '87%' }}
      />
      <Checkbox checked={question.answers[props.num]} onChange={(e) => { editCheckBox(question.id, e.target.checked, props.num); setForceRender(renderCounter + 1); renderCounter++ }}{...label} />
      </Item>
        </Grid>
    );
  }
  const allAnswers = <>
  <Answer placeholder="Add Answer 1 (required)" answer={question.choices.one} value={question.choices.one} num='one' onChange={(e) => { editAnswerField(question.id, 'one', e.target.value, quizId) }}/>
          <Answer placeholder="Add Answer 2 (required)" answer={question.choices.two} value={question.choices.two} num='two' onChange={(e) => { editAnswerField(question.id, 'two', e.target.value, quizId) }}/>
          <Answer placeholder="Add Answer 3" answer={question.choices.three} value={question.choices.three} num='three' onChange={(e) => { editAnswerField(question.id, 'three', e.target.value, quizId) }}/>
          <Answer placeholder="Add Answer 4" answer={question.choices.four} value={question.choices.four} num='four' onChange={(e) => { editAnswerField(question.id, 'four', e.target.value, quizId) }}/>
          <Answer placeholder="Add Answer 5" answer={question.choices.five} value={question.choices.five} num='five' onChange={(e) => { editAnswerField(question.id, 'five', e.target.value, quizId) }}/>
          <Answer placeholder="Add Answer 6" answer={question.choices.six} value={question.choices.six} num='six' onChange={(e) => { editAnswerField(question.id, 'six', e.target.value, quizId) }}/>
  </>
  return (
        <Box sx={{ width: '100%', alignItems: 'center', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
          {questionTitle}
        <CssBaseline />
        <Container sx={{ padding: '5%' }} maxWidth="sm">
          <Box sx={{
            border: '1px solid grey',
            height: '35vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2
          }}>
          {question.YoutubeURL === '' && question.imageURL === ''
            ? <>
              <div>INSERT MEDIA</div>
              {mediaModal}
              </>
            : question.imageURL === ''
              ? <><ReactPlayer width='100%' height='100%' borderRadius='5'
                  url={question.YoutubeURL}
                />
                <Button variant="text" onClick={() => { editYoutube('', question.id); setForceRender(renderCounter + 1); renderCounter++ }} sx={{ right: 0, bottom: 0, '&:hover': { cursor: 'pointer' } }}> Remove</Button>
                </>
              : <>
              <div style={{ height: '90%', width: '100%' }} >
              <img
            style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: 7, borderTop: '1px solid grey', }}
            src={question.imageURL}
            alt="Image to aid question"
          />
              </div>

            <Button variant="text" onClick={() => { editQuestionImage('', question.id); setForceRender(renderCounter + 1); renderCounter++ }} sx={{ right: 0, bottom: 0, '&:hover': { cursor: 'pointer' } }}> Remove</Button>
            </>
          }
          </Box>
        </Container>
          <Media query = '(min-width: 700px)'>
            {matches => {
              return matches
                ? <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {allAnswers}
              </Grid>
                : <Grid container rowSpacing={2} columns={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {allAnswers}
              </Grid>
            }}
          </Media>
        </Box>
  );
}

/******************************************************************************
                              editing Questions
*******************************************************************************/
// id = quizID
const editAnswerField = (id, answerNum, newAnswer) => {
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      editedGameData.questions[i].choices[answerNum] = newAnswer;
      break;
    }
  }
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editQuestionField = (id, newTitle) => {
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      editedGameData.questions[i].question = newTitle
      break;
    }
  }
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editQuestionImage = (url, id) => {
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      editedGameData.questions[i].imageURL = url;
      break;
    }
  }
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editYoutube = (url, id) => {
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      editedGameData.questions[i].YoutubeURL = url;
      break;
    }
  }
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editCheckBox = (id, checked, answerNum) => {
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      if (editedGameData.questions[i].selection === 'multi') {
        editedGameData.questions[i].answers[answerNum] = checked;
        break;
      } else {
        for (const key of Object.keys(editedGameData.questions[i].answers)) {
          if (key !== answerNum) {
            editedGameData.questions[i].answers[key] = false;
          } else {
            editedGameData.questions[i].answers[key] = true;
          }
        }
      }
    }
  }
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }

  updateQuestions(gameId, newDat);
}

const editDropDown = (key, newSelection, id) => {
  if (editedGameData === '') return;
  for (let i = 0; i < editedGameData.questions.length; i++) {
    if (editedGameData.questions[i].id === id) {
      editedGameData.questions[i][key] = newSelection;

      if (newSelection === 'single') {
        let count = 0;
        for (const key of Object.keys(editedGameData.questions[i].answers)) {
          if (editedGameData.questions[i].answers[key] === true) count++;
        }
        if (count > 1) {
          for (const key of Object.keys(editedGameData.questions[i].answers)) {
            editedGameData.questions[i].answers[key] = false
          }
        }
      }
      break;
    }
  }

  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }

  updateQuestions(gameId, newDat);
  // editedGameData[key] = newSelection;
}

// const discardChanges = (navigate, preGame) => {
//   const newDat = {
//     questions: preGame.questions,
//     name: preGame.name,
//     thumbnail: preGame.thumbnail
//   }

//   updateQuestions(gameId, newDat);
//   navigateToGame(navigate)
// }

/******************************************************************************
                          Drawers, dropdowns + modals
*******************************************************************************/
const openMediaModal = (open, setOpen, param, forceRender, setForceRender) => {
  const id = param.questionId;
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300',
    height: '200',
    bgcolor: 'background.paper',
    border: '1px solid grey',
    borderRadius: 4,
    p: 4,
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  let youTubeURL = ''
  return (
      <div>
        <Button onClick={handleOpen}><AddBoxIcon sx={{ fontSize: 60, color: '#d1d1d1', '&:hover': { color: 'grey', cursor: 'pointer' } }}/></Button>
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
              <Typography id="transition-modal-title" variant="h6" component="h2">
                {uploadButtons(id, forceRender, setForceRender, handleClose)}
              </Typography>
              <Divider/>
              <Typography>
            <h4>1. Open YouTube and find a video to add to your question</h4>
            <Button variant='outlined' onClick={() => { window.open('https://www.youtube.com/', '_blank') }}> Open Youtube</Button>
            <h4>2. Click the share icon on YouTube and copy the link</h4>
            <h4>3. Paste the link below</h4>
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 1, display: 'flex' }}>
                <TextField size='small' fullWidth placeholder='Youtube URL' onChange={(e) => { youTubeURL = e.target.value }}></TextField>
                <Button variant='contained' onClick={() => { handleClose(); editYoutube(youTubeURL, id); }}> Add </Button>

              </Typography>
            </Box>
          </Fade>
        </Modal>
      </div>
  );
}

// s
const swipingDrawer = (setForceRender, currentQuestion) => {
  const [state, setState] = React.useState({ right: false, });
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
          event.type === 'keydown' &&
          (event.key === 'Tab' || event.key === 'Shift')
    ) return;

    setState({ ...state, [anchor]: open });
  };

  const gameSelection = [
    <MenuItem key={'Single Select'} value={'single'}>Single Select</MenuItem>,
    <MenuItem key={'Multi Select'}value={'multi'}> Multi Select</MenuItem>
  ]

  const pointsOptions = [
      <MenuItem key={'standard'} value={10}> Standard</MenuItem>,
      <MenuItem key={'double'} value={20}>Double</MenuItem>,
      <MenuItem key={'none'} value={0}>No Points</MenuItem>
  ];

  const timeDrop = [
      <MenuItem key={1} value={5}>5 seconds</MenuItem>,
      <MenuItem key={2} value={10}>10 seconds</MenuItem>,
      <MenuItem key={3} value={20}>20 seconds</MenuItem>,
      <MenuItem key={4} value={30}>30 seconds</MenuItem>,
      <MenuItem key={5} value={60}>1 minute</MenuItem>,
      <MenuItem key={6} value={90}>1 minute 30 seconds</MenuItem>,
      <MenuItem key={7} value={120}>2 minute</MenuItem>,
      <MenuItem key={8} value={180}>3 minute</MenuItem>,
      <MenuItem key={9} value={240}>4 minute</MenuItem>,
  ];

  const timeDropDown = () => { return (timeDrop); }
  const pointsDropdown = () => { return (pointsOptions); }
  const selectDropDown = () => { return (gameSelection); }

  let dropDown = ''
  let dropDownTime = ''
  let dropDownPoints = ''

  if (editedGameData !== '') {
    for (let i = 0; i < editedGameData.questions.length; i++) {
      if (editedGameData.questions[i].id === currentQuestion) {
        dropDown = editedGameData.questions[i].selection;
        dropDownTime = editedGameData.questions[i].timeLimit;
        dropDownPoints = editedGameData.questions[i].points;
        break;
      }
    }
  }
  const subtitleStyle = {
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  }

  const typoStyle = {
    paddingTop: 20,
    alignItems: 'center',
    color: 'GrayText',
  }

  const list = (anchor) => (
        <Box
          sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
          role="presentation"
          // onClick={toggleDrawer(anchor, false)}
          onKeyDown={toggleDrawer(anchor, false)}
        >
          <List>
          <div style={subtitleStyle}>
              <QuestionAnswerIcon /> <span style={{ paddingLeft: 4 }}>Question Type</span>
              <Typography variant='subtitle2' style={typoStyle}>
            {selectText}</Typography>
            </div>

            {createDropDown(dropDown, selectDropDown, 'selection', currentQuestion, setForceRender)}
          </List>
          <Divider />
          <List>
          <div style={subtitleStyle}>
              <HourglassTopIcon/> <span style={{ paddingLeft: 4 }}>Time Limit</span>
            </div>
            {createDropDown(dropDownTime, timeDropDown, 'timeLimit', currentQuestion, setForceRender)}
            <div style={subtitleStyle}>
              <MilitaryTechIcon /> <span style={{ paddingLeft: 4 }}>Points</span>
            </div>
            {createDropDown(dropDownPoints, pointsDropdown, 'points', currentQuestion, setForceRender)}
          </List>
          <br />
          <Divider />
          <div style={subtitleStyle}>
            <Typography variant='subtitle2' style={typoStyle}> All changes are autosaved</Typography>
          </div>
        </Box>
  );

  return (
      <Box sx={{ paddingLeft: '30px', paddingTop: '50px', Left: 0, zIndex: 1, position: 'fixed' }}>
          {['right'].map((anchor) => (
            <React.Fragment key={anchor}>
              <Media query = '(max-width: 700px)'>
              {matches => {
                return matches
                  ? <>
                <Button sx={{ background: 'white' }} onClick={toggleDrawer(anchor, true)}><SettingsIcon aria-label="Game Settings"/></Button>
                <Divider />
                </>
                  : <>
                  <Button sx={{ background: 'white' }} onClick={toggleDrawer(anchor, true)}>QUIZ SETTINGS <SettingsIcon aria-label="Game Settings"/></Button>
                  <Divider />
                </>
              }}
          </Media>
              <SwipeableDrawer
                anchor={anchor}
                BackdropProps={{ invisible: true }}
                open={state[anchor]}
                onBackdropClick={toggleDrawer(anchor, false)}
                // onClose={toggleDrawer(anchor, false)}
                // onOpen={toggleDrawer(anchor, true)}
              >
                {list(anchor)}
                <br />
              </SwipeableDrawer>
            </React.Fragment>
          ))}
        </Box>
  );
}

// three types:
// selection, timeLimit + points
const createDropDown = (dropDownSelectedValue, setMenu, type, currentQuestion, setUpdateDrawer) => {
  const handleChange = (event) => {
    editDropDown(type, event.target.value, currentQuestion)
    // we cant use even.target.value bc sometimes the values overlap

    setUpdateDrawer(renderCounter + 1);
    renderCounter++;
  };

  if (dropDownSelectedValue === 'single') selectText = 'Players must select one correct answer'
  if (dropDownSelectedValue === 'multi') selectText = 'Players must select all valid answers'

  return (
      <FormControl sx={{ m: 1, width: 230 }} size="small">
        <Select
          labelId="drop-down-selection"
          id="drop-down-selection"
          value={dropDownSelectedValue}
          onChange={handleChange}
          fullWidth
        >
          {setMenu()}
        </Select>
      </FormControl>
  );
}

/******************************************************************************
                              miscallaneous
*******************************************************************************/

// uploading helpers
const uploadButtons = (id, render, setRender, handleClose) => {
  return (
      <Stack direction="row" alignItems="center" spacing={-1}>
        <IconButton color="primary" aria-label="upload picture" component="label">
          <input hidden accept="image/*" type="file" />
          <UploadIcon />
        </IconButton>
        <Button component="label">
          Upload Image
          <input hidden accept="image/*" multiple type="file" onChange={(e) => { uploadImage(e.target.files[0], id, render, setRender); handleClose(); }} />
        </Button>
      </Stack>
  );
}

async function uploadImage (file, id, render, setRender) {
  const imageURL = await fileToDataUrl(file);
  editQuestionImage(imageURL, id)
  setRender(render + 1);
}

export function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

export function navigateToQuestion (navigate, setCurrentQuestion, questionId) {
  setCurrentQuestion(questionId)
  navigate(`/dashboard/editGame/${gameId}/${questionId}`);
}

export function navigateToGame (navigate) {
  navigate(`/dashboard/editGame/${gameId}`);
}

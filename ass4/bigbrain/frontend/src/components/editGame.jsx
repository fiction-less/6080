
import React from 'react';
import { apiCall } from '../App.jsx';
import { fileToDataUrl } from './editQuestion.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import UploadIcon from '@mui/icons-material/Upload';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Tooltip from '@mui/material/Tooltip';
import { Container } from '@mui/material';

export let gameId = '';
export let quizItems = '';
export let initialEditingQ = 0;
let questionId = 0;

const navigateToEditingQuestion = (navigate, gameId, questionId) => {
  initialEditingQ = questionId;
  navigate(`/dashboard/editGame/${gameId}/${questionId}`);
}

export function fetchGameDetails (gameId, onSuccess, setQuiz) {
  const options = {
    method: 'GET',
    url: `/admin/quiz/${gameId}`,
    headers: {
      'Content-type': 'application/json',
    },
  }
  apiCall(onSuccess, options, setQuiz);
}

const loadGameComponents = (data, setQuiz) => {
  setQuiz([data]);
}

export function EditGameComponent () {
  const [quiz, setQuiz] = React.useState([]);
  const [counter, setCounter] = React.useState(0);
  const params = useParams();
  const quizId = params.id;
  gameId = quizId;
  const navigate = useNavigate();

  React.useEffect(async () => {
    fetchGameDetails(gameId, loadGameComponents, setQuiz);
  }, []);

  quizItems = quiz
  let editButton = <></>;

  (localStorage.getItem('questionId'))
    ? questionId = localStorage.getItem('questionId')
    : localStorage.setItem('questionId', 10000);
  console.log(quizItems);

  if (quizItems.length !== 0) {
    let thumbnail = require('../images/default-image.png');
    if (quizItems[0].thumbnail !== null) thumbnail = quizItems[0].thumbnail;
    quizItems[0].questions.length > 0
      ? editButton = <Button variant="text" sx={{ width: '5rem' }} onClick={() => { navigateToEditingQuestion(navigate, gameId, quizItems[0].questions[0].id) }} startIcon={<EditIcon />}/>
      : editButton = <Button disabled="true" variant="text" sx={{ width: '5rem' }} startIcon={<EditIcon />}/>
    return (
        <>
        <br />
        <br />
        <br />
        <br />
        <div style={{ position: 'fixed', right: 0, top: 200, display: 'flex', flexDirection: 'column' }}>
                {createTooltipButton(editButton, 'Edit all Questions')}
                {createTooltipButton(
                    <Button sx={{ width: '5rem' }} variant="text" onClick={() => { createEmptyQuestion(gameId, quizItems[0]); questionId++; localStorage.setItem('questionId', (questionId)); setCounter(counter + 1) }} startIcon={<AddBoxIcon />}/>,
                    'Add an empty Question')}
            </div>

        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <TextField label="Game Name" id="outlined-size-normal" defaultValue={quizItems[0].name} onBlur={ (e) => { editGameTitle(e.target.value) }} sx={{ paddingBottom: 2, width: '55%', marginLeft: 'auto', marginRight: 'auto' }}/>
            <Container sx={{ height: 200, width: '50%', border: '1px solid silver', display: 'flex', justifyContent: 'center' }}>
            <img
            style={{ height: '99.8%', width: '100%', objectFit: 'contain' }}
            src={thumbnail}
            alt="Image to aid question"
          />
            </Container>
            <Button component="label" variant="text" startIcon={<UploadIcon aria-label="Edit Game Thumbnail"/>}>
                Edit Thumbnail
                <input hidden accept="image/*" multiple type="file" onChange={(e) => { uploadImage(e.target.files[0], counter, setCounter) }} />
            </Button>

        </Box>

        {buildGamePage(navigate, setCounter, counter)}
        </>
    );
  } else { return (<> </>) }
}

export function createTooltipButton (element, descrip) {
  return (
      <div>
        <Tooltip placement="left" title={descrip}>
          {element}
        </Tooltip>
      </div>
  );
}

const noQuestions = () => {
  return (
    <div style={{ paddingTop: '10%', paddingLeft: '45%', fontFamily: 'Arial', fontStyle: 'italic', color: 'gray' }}>Nothing to Show . . .</div>
  )
}
const buildGamePage = (navigate, setCounter, counter) => {
  return (<>
        <Box sx={{ maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto', paddingTop: '5%', paddingBottom: '20%' }}>
            {quizItems[0].questions.map((question, index) => (
            <> <br />
                {createQuestionCard(question, index + 1, navigate, setCounter, counter)}
            </>
            ))}
        </Box>
        {quizItems[0].questions.length === 0 ? noQuestions() : () => {} }
      </>
  )
}

const createQuestionCard = (question, quizId, navigate, setCounter, counter) => {
  let thumbnail = require('../images/default-image.png');
  if (question.imageURL !== '') thumbnail = question.imageURL;
  console.log(question);
  return (
      <Card elevation={0} sx={{ display: 'flex', padding: '1%', paddingLeft: '2%', border: '1px solid gray', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
         <Container sx={{ height: 130, width: 200, borderRadius: 2, border: '1px solid silver' }}>
            <img
            style={{ height: '99.9%', width: '100%', objectFit: 'contain' }}
            src={thumbnail}
            alt="Image to aid question"
            />
       </Container>

        <CardContent sx={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        <Typography component="div" variant="subtitle1" sx={{ color: 'GrayText' }}>
              {'Quiz - ' + quizId}
            </Typography>
            <Typography component="div" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {question.question}
            </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>

          <Box sx={{ display: 'flex', marginLeft: 'auto', marginTop: 'auto', pl: 1, pb: 1 }}>
            <IconButton aria-label="edit quiz">
              <EditIcon onClick={() => { navigateToEditingQuestion(navigate, gameId, question.id) }}/>
            </IconButton>
            <IconButton aria-label="delete quiz" sx={{ paddingRight: 5 }}>
              <DeleteIcon onClick={ () => { deleteQuestion(question.id); setCounter(counter + 1) } }/>
            </IconButton>
          </Box>

        </Box>
      </Card>
  );
}

async function uploadImage (file, counter, setCounter) {
  const imageURL = await fileToDataUrl(file);
  editGameThumbnail(imageURL)
  setCounter(counter + 1);
}

/******************************************************************************
                        adding/deleting Questions
*******************************************************************************/

const deleteQuestion = (questionId) => {
  const remove = (value, index, arr) => {
    if (value.id === questionId) {
      return false;
    }
    return true;
  }

  const newArr = quizItems[0].questions.filter(remove);
  quizItems[0].questions = newArr;

  const newDat = {
    questions: quizItems[0].questions,
    name: quizItems[0].title,
    thumbnail: quizItems[0].thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editGameTitle = (newTitle) => {
  quizItems[0].name = newTitle;
  const newDat = {
    questions: quizItems[0].questions,
    name: newTitle,
    thumbnail: quizItems[0].thumbnail
  }
  updateQuestions(gameId, newDat);
}

const editGameThumbnail = (imageURL) => {
  quizItems[0].thumbnail = imageURL;
  const newDat = {
    questions: quizItems[0].questions,
    name: quizItems[0].title,
    thumbnail: imageURL
  }
  updateQuestions(gameId, newDat);
}

/******************************************************************************
                    creating and updating Question JSON
*******************************************************************************/

export function createEmptyQuestion (quizId, editedGameData, first) {
  const data = createQuestionJSON();

  let temp = questionId;
  if (first) temp--;
  data.id = temp;
  const concatDat = (editedGameData.questions).concat(data);
  editedGameData.questions = concatDat;
  const newDat = {
    questions: editedGameData.questions,
    name: editedGameData.name,
    thumbnail: editedGameData.thumbnail
  }
  updateQuestions(quizId, newDat)
}

export function updateQuestions (quizId, questionObj) {
  const options = {
    method: 'PUT',
    url: `/admin/quiz/${quizId}`,
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(questionObj)
  }
  apiCall((data) => {}, options);
}

// selections : 'single' or 'multi'
export function createQuestionJSON () {
  const question =
{
  id: '',
  YoutubeURL: '',
  imageURL: '',
  timeLimit: 20,
  points: 10,
  selection: 'single',
  question: '',
  choices: {
    one: '',
    two: '',
    three: '',
    four: '',
    five: '',
    six: ''
  },
  answers: {
    one: false,
    two: false,
    three: false,
    four: false,
    five: false,
    six: false

  }
}
  return question;
}

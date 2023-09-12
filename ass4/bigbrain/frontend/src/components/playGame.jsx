import React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Media from 'react-media';
import ReactPlayer from 'react-player';
import { apiCall } from '../App';
import Container from '@mui/material/Container';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Timer } from './Timer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { createTooltipButton } from './editGame';
import SetMealIcon from '@mui/icons-material/SetMeal';

const setQuestionData = (data, setQuestion) => {
  const newQuestion = data.question;
  setQuestion(newQuestion);
}

const setAnswersData = (data, setAnswers) => {
  setAnswers(data.answerIds);
}

const getAnswers = (playerId, setAnswers) => {
  const options = {
    method: 'GET',
    url: `/play/${playerId}/answer`,
  };
  apiCall(setAnswersData, options, setAnswers);
}

// api call to submit player answers after any modification
const submitPlayerAnswers = (playerId) => {
  const playerAnswers = localStorage.getItem('playerAnswers').split(' ').filter(answer => answer !== '');
  const options = {
    method: 'PUT',
    url: `/play/${playerId}/answer`,
    body: JSON.stringify({
      answerIds: playerAnswers,
    }),
  };
  apiCall(() => {}, options);
}

// Player results table with question, if they got the question correct and the time they took to answer
function ResultsTable ({ rows }) {
  return (
    <Container sx={{ minWidth: 300, maxWidth: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
      <TableContainer component={Paper} sx={{ minWidth: 300, maxWidth: 500 }}>
        <Table aria-label="results table" sx={{ minWidth: 300, maxWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Time taken to answer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.key}>
                <TableCell>{index + 1}</TableCell>
                <TableCell scope="row">
                  {row.correct ? 'Correct' : 'Incorrect'}
                </TableCell>
                <TableCell>{(new Date(row.answeredAt).getTime() - new Date(row.questionStartedAt).getTime()) / 1000} secs</TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export function PlayGameComponent () {
  const [question, setQuestion] = React.useState({});
  const [questionsList, setQuestionsList] = React.useState([]);
  const [answers, setAnswers] = React.useState([]);
  const [isAnswer, setIsAnswer] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [facts, setFact] = React.useState('null');
  const [loading, setLoading] = React.useState('');
  let intervalId = 0;
  let started = false;
  const [currActiveQuestion, setCurrActiveQuestion] = React.useState(<></>);

  const params = useParams();
  const playerId = params.playerId;

  // api call to get results
  const getResults = () => {
    setShowResults(true);
    clearInterval(intervalId);

    const options = {
      method: 'GET',
      url: `/play/${playerId}/results`,
    };
    apiCall((data) => setResults(data), options, setQuestion);
  }

  // get question data
  function getQuestion (playerId) {
    const options = {
      method: 'GET',
      url: `/play/${playerId}/question`,
    };
    apiCall(setQuestionData, options, setQuestion)
      .then((res) => {
        // no more questions
        if (res) {
          if (started) {
            getResults();
          }
        } else {
          // quiz has started
          started = true;
        }
      });
  }

  React.useEffect(() => {
    localStorage.setItem('playerAnswers', '');
    intervalId = setInterval(function () { getQuestion(playerId); }, 1000);
  }, []);

  // checks if admin has advanced question
  // if advanced, goes to next question page
  React.useEffect(() => {
    if (!questionsList.includes(question.id) && Object.keys(question).length > 0) {
      const newQuestionsList = questionsList.slice();
      newQuestionsList.push(question.id);

      setQuestionsList(newQuestionsList);
      setIsAnswer(false);
      setCurrActiveQuestion(createQuestionDisplay(question, playerId, setAnswers, setIsAnswer))
      localStorage.setItem('playerAnswers', '');
    }
  }, [question]);

  return (
    <div style={{ padding: 80 }}>
    { showResults
      ? (<ResultsTable rows={results}/>)
      : (isAnswer === false
          ? (Object.keys(question).length > 0
              ? currActiveQuestion
              : <>
              {getFacts(facts, setFact, loading, setLoading)}</>)
          : (answers.length > 0
              ? createAnswerDisplay(question, answers)
              : (<Typography variant="subtitle2">Loading...</Typography>))
        )
    }
  </div>);
}

const getFacts = (facts, setFact, loading, setLoading) => {
  const catImage = require('../images/cat.png');
  return (<>
    <Typography variant='h4' >In Lobby</Typography>
    <br />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid gray', borderRadius: 7, padding: 10, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
    <img
            style={{ height: 200, objectFit: 'contain' }}
            src={catImage}
            alt="Image to aid question"
            />
  {createTooltipButton(<SetMealIcon variant="outlined" sx={{ marginTop: 16, '&:hover': { bgcolor: 'grey.100', cursor: 'pointer' } }} onClick={() => (catFacts(facts, setFact, loading, setLoading))}>
    </SetMealIcon>, 'Discretion advised. Some facts may not be kid-friendly')}

    </Box>
    <br />
    <div style={{ display: 'flex', jusfityContent: 'center', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
    {loading === 'success' && facts !== 'null'
      ? <Typography>{ facts }</Typography>
      : <Typography>{ loading }</Typography>}

    </div>
  </>)
}

async function catFacts (facts, setFact, loading, setLoading) {
  const CATS_URL = 'https://cat-fact.herokuapp.com/facts/random';
  setLoading('Loading . . .')
  const response = await fetch(CATS_URL);
  const json = await response.json();
  setFact(json.text)
  setLoading('success');
  return (
    <>{facts}</>
  )
}

// Answer display with indication of wrong/right answer
const createAnswerDisplay = (question, answers) => {
  const choices = question.choices;
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  // Component for correct choice
  const CorrectChoice = (props) => {
    return (
      <Grid item xs={6}>
      <Item sx={{ color: 'green', display: 'flex', justifyContent: 'center' }}>
          <Grid sx={{ direction: 'row' }}>
            {props.choice}
            <CheckCircleOutlineIcon sx={{ color: 'green' }}/>
          </Grid>
        </Item>
      </Grid>
    );
  }

  // Component for wrong choice
  const WrongChoice = (props) => {
    return (
      <Grid item xs={6}>
      <Item sx={{ color: 'red', display: 'flex', justifyContent: 'center' }}>
          <Grid sx={{ direction: 'row' }}>
            {props.choice}
            <CancelIcon sx={{ color: 'red' }}/>
          </Grid>
        </Item>
      </Grid>
    );
  }

  return (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <Box sx={{ width: '100%', alignItems: 'center', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <CssBaseline />
        <Container sx={{ padding: '5%' }} maxWidth="sm">
          <h1 style={{ textAlign: 'center' }}>{question.question}</h1>
          <Box sx={{
            border: '1px solid grey',
            height: '35vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2
          }}>
            { question.imageURL !== ''
              ? <img
              style={{ height: '99.9%', width: '100%', objectFit: 'contain' }}
              src={question.imageURL}
              alt="Image to aid question"
              />
              : question.YoutubeURL !== ''
                ? <ReactPlayer width='100%' height='100%' borderRadius='5'
                url={question.YoutubeURL}
              />
                : <></>
            }
          </Box>
        </Container>
          <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {Object.entries(choices).map(([key, value]) => {
            if (value !== '') {
              if (answers.includes(key)) {
                return <CorrectChoice choice={value} key={key}/>
              } else {
                return <WrongChoice choice={value} key={key}/>
              }
            }
            return <></>
          })}
          </Grid>
        </Box>
      </Box>
  );
}

// Question display
const createQuestionDisplay = (question, playerId, setAnswers, setIsAnswer) => {
  const choices = question.choices;
  const timeCountdown = new Date();
  timeCountdown.setSeconds(timeCountdown.getSeconds() + question.timeLimit);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  // on click of checkbox, submits player answers
  const Choice = (props) => {
    return (
      <Grid item xs={6}>
        <Item>
          {props.choice}
          <Checkbox {...label} onClick={(e) => {
            if (e.target.checked) {
              localStorage.setItem('playerAnswers', localStorage.getItem('playerAnswers') + `${props.answerId} `);
              submitPlayerAnswers(playerId);
            } else {
              localStorage.setItem('playerAnswers', localStorage.getItem('playerAnswers').replace(`${props.answerId} `, ''));
              submitPlayerAnswers(playerId);
            }
          }}/>
        </Item>
      </Grid>
    );
  }

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const countDown = <Timer expiryTimestamp={timeCountdown}
  expired={() => {
    getAnswers(playerId, setAnswers);
    setIsAnswer(true);
  }}
  ></Timer>
  return (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <Box sx={{ width: '100%', alignItems: 'center', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <CssBaseline />
        <Media query = '(max-width: 700px)'>
            {matches => {
              return matches
                ? <>{ countDown }</>
                : <></>
            }}
          </Media>
        <Container sx={{ padding: '5%' }} maxWidth="sm">
          <h1 style={{ textAlign: 'center' }}>{question.question}</h1>
          <Box sx={{
            border: '1px solid grey',
            height: '35vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2
          }}>
            { question.imageURL !== ''
              ? <img
              style={{ height: '99.9%', width: '100%', objectFit: 'contain' }}
              src={question.imageURL}
              alt="Image to aid question"
              />
              : question.YoutubeURL !== ''
                ? <ReactPlayer width='100%' height='100%' borderRadius='5'
                url={question.YoutubeURL}
              />
                : <></>
            }
          </Box>
        </Container>

          <Media query = '(min-width: 700px)'>
            {matches => {
              return matches
                ? <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {Object.entries(choices).map(([key, value]) => {
                if (value !== '') {
                  return <Choice choice={value} key={key} answerId={key}/>
                }
                return <></>
              })}
              </Grid>
                : <Grid container rowSpacing={2} columns={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {Object.entries(choices).map(([key, value]) => {
                if (value !== '') {
                  return <Choice choice={value} key={key} answerId={key}/>
                }
                return <></>
              })}
              </Grid>
            }}
          </Media>
        </Box>
        <Media query = '(min-width: 700px)'>
            {matches => {
              return matches
                ? <>{ countDown } </>
                : <></>
            }}
          </Media>
      </Box>
  );
}

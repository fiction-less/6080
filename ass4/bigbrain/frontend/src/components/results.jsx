import React from 'react';
import { useParams } from 'react-router-dom';
import { apiCall } from '../App';
import { Container, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

let rows = [];
let data = [];

// Returns if item is in list
const isInList = (item, list) => {
  Object.entries(list).forEach(([key, value]) => {
    if (item === value.key) {
      return true;
    }
  });
  return false;
}

// Get time difference in seconds from iso dates
function getTimeDiff (answeredAt, questionStartedAt) {
  return (new Date(answeredAt).getTime() - new Date(questionStartedAt).getTime()) / 1000;
}

// Using data from apiCall, create data for graphs/tables
function createData (status, results) {
  data = [];
  const questions = status.questions;
  let playersScore = [];
  const percentageScore = [];

  // loop through results, adding data to playerScores and percentageScore to generate
  // data for graphs
  for (let i = 0; i < results.length; i++) {
    let total = 0;
    const answers = results[i].answers;

    for (let i = 0; i < answers.length; i++) {
      // player answered correctly
      if (answers[i].correct) {
        total += questions[i].points;
      }
      if (isInList(i + 1, percentageScore)) {
        // in percentage scores
        if (answers[i].correct) {
          percentageScore[i + 1].percentage += 1;
        }
        percentageScore[i + 1].avgTime += getTimeDiff(answers[i].answeredAt, answers[i].questionStartedAt);
      } else {
        // not in percentage scores
        if (answers[i].correct) {
          percentageScore.push({ key: i + 1, percentage: 1, avgTime: getTimeDiff(answers[i].answeredAt, answers[i].questionStartedAt) });
        } else {
          percentageScore.push({ key: i + 1, percentage: 0, avgTime: getTimeDiff(answers[i].answeredAt, answers[i].questionStartedAt) });
        }
      }
    }

    const newPlayerScore = [...playersScore];
    // add playerScores data
    if (isInList(results[i].name, playersScore)) {
      newPlayerScore[results[i].name] += total;
    } else {
      newPlayerScore.push({ key: results[i].name, score: total })
    }
    playersScore = newPlayerScore;
  }

  let averageTime = 0;
  // loop through percentageScores and calculate averages/percentages
  for (let i = 0; i < percentageScore.length; i++) {
    if (status.players.length === 0) {
      percentageScore[i].percentage = 0;
    } else {
      percentageScore[i].percentage = (percentageScore[i].percentage / status.players.length) * 100;
      averageTime = percentageScore[i].avgTime / status.players.length;
    }
    data.push({ questionNo: i + 1, percentage: percentageScore[i].percentage, avgTime: averageTime });
  }
  rows = playersScore;
}

// Line graph component for percentage of players who got certain questions correct
function LineGraph () {
  return (
    <div className="row">
      <div className="section col-md-6">
        <h3 className="section-title" style={{ textAlign: 'center' }}>Percentage of players who got questions correct</h3>
        <div className="section-content">
          <ResponsiveContainer width={500} height={300}>
            <LineChart data={data} margin={{ top: 15, right: 0, bottom: 15, left: 0 }}>
              <Tooltip />
              <XAxis dataKey="questionNo" label={{ value: 'Question no.' }}/>
              <YAxis label={{ value: 'Percentage of players', angle: -90 }}/>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Legend/>
              <Line type="monotone" dataKey="percentage" stroke="#FB8833" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// Score table component for user total scores
export function ScoresTable ({ rows }) {
  // sort by score
  rows.sort(function (first, second) {
    return second.score - first.score;
  });

  // takes top 5 users
  const newRows = rows.slice(0, 5);
  return (
    <Container sx={{ minWidth: 300, maxWidth: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10, flexDirection: 'column' }}>
      <TableContainer component={Paper} sx={{ minWidth: 300, maxWidth: 500, display: 'flex', justifyItems: 'center' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: 'center' }}>User</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newRows.map((row) => (
              <TableRow
                key={row.key}>
                <TableCell scope="row" sx={{ textAlign: 'center' }}>
                  {row.key}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{row.score}</TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

// Table component for average question response time
function TimeTable ({ rows }) {
  return (
    <Container sx={{ minWidth: 300, maxWidth: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10, flexDirection: 'column' }}>
      <TableContainer component={Paper} sx={{ minWidth: 300, maxWidth: 500, display: 'flex', justifyItems: 'center' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: 'center' }}>Question</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Average answer time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow sx={{ textAlign: 'center' }}
                key={row.key}>
                <TableCell scope="row" sx={{ textAlign: 'center' }}>
                  {row.questionNo}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{row.avgTime} secs</TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

function finishedGame (status, results) {
  createData(status, results);
  return (<>
  <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <Typography variant="h5" sx={{ marginBottom: 1 }}>Results</Typography>
    <ScoresTable rows={rows}/>
    <LineGraph/>
    <TimeTable rows={data}/>
  </Container>
  </>)
}

export function GameResultsComponent () {
  const params = useParams();
  const sessionId = params.sessionId;
  const [status, setStatus] = React.useState({});
  const [results, setResults] = React.useState([]);

  const retQuizStatus = (data) => {
    setStatus(data.results);
  }

  const retResults = (data) => {
    if (data.results !== results) {
      setResults(data.results);
    }
  }

  React.useEffect(() => {
    let options = {
      method: 'GET',
      url: `/admin/session/${sessionId}/status`,
    };

    apiCall(retQuizStatus, options);

    options = {
      method: 'GET',
      url: `/admin/session/${sessionId}/results`,
    };
    apiCall(retResults, options);
  }, []);

  return (<div style={{ paddingTop: 90 }}>
    { Object.keys(status).length === 0
      ? <>Loading...</>
      : finishedGame(status, results)
    }
  </div>)
}

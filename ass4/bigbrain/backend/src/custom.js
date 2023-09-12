/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a "player"
*/
export const quizQuestionPublicReturn = question => {
  console.log('See question: ', question);
  return question;
};

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = question => {
  let answers = [];
  for (const [answerKey, isAnswer] of Object.entries(question.answers)) {
    if (isAnswer) {
      answers.push(answerKey);
    }
  }
  return answers;
};

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = question => {
  let answers = [];
  for (const [answerKey, isAnswer] of Object.entries(question.answers)) {
    answers.push(answerKey);
  }
  return answers;
};

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = question => {
  return question.timeLimit;
};

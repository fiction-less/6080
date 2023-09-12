import React, { createContext } from 'react';

export const initialValue = {
  quizzes: [],
}

export const Context = createContext(initialValue);
export const useContext = React.useContext;

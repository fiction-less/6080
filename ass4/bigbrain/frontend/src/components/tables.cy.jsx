import React from 'react'
import { ScoresTable } from './results.jsx'

describe('<ScoresTable />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ScoresTable rows={[]}/>);
  })

  it('score table renders with no user data, renders blank table', () => {
    cy.mount(<ScoresTable rows={[]}/>);

    // renders headers for table
    cy.get('th').should('contains.text', 'User');
    cy.get('th').should('contains.text', 'Score');
  })

  it('score table renders given data', () => {
    const user1 = "ursad";
    const score1 = 80;

    const user2 = "FunkyMonkey";
    const score2 = 9;

    const rows = [
        { key: user1, score: score1 },
        { key: user2, score: score2 }
    ];

    cy.mount(<ScoresTable rows={rows}/>);
    cy.get('td').should('contains.text', user1);
    cy.get('td').should('contains.text', score1);
    cy.get('td').should('contains.text', user2);
    cy.get('td').should('contains.text', score2);
  })

  it('score table renders given data up to top 5 users in score order', () => {
    const user1 = "ursad";
    const score1 = 80;

    const user2 = "FunkyMonkey";
    const score2 = 9;

    const user3 = "Rebecca Bunch";
    const score3 = 70;

    const user4 = "Paula";
    const score4 = 934;

    const user5 = "Guitar Dan";
    const score5 = 80;

    const user6 = "Bad";
    const score6 = 3;

    const rows = [
        { key: user1, score: score1 },
        { key: user2, score: score2 },
        { key: user3, score: score3 },
        { key: user4, score: score4 },
        { key: user5, score: score5 },
        { key: user6, score: score6 },
    ];

    cy.mount(<ScoresTable rows={rows}/>);
    cy.get('td').should('contains.text', user1);
    cy.get('td').should('contains.text', score1);
    cy.get('td').should('contains.text', user2);
    cy.get('td').should('contains.text', score2);
    cy.get('td').should('contains.text', user3);
    cy.get('td').should('contains.text', score3);
    cy.get('td').should('contains.text', user4);
    cy.get('td').should('contains.text', score4);
    cy.get('td').should('contains.text', user5);
    cy.get('td').should('contains.text', score5);

  })
})
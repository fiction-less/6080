import React from 'react'
import { NewGameComponent } from './dashboard'

describe('<NewGameComponent />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<NewGameComponent />)
  })
})

it('doesnt allow users to create without game without a name', () => {
  cy.mount(<NewGameComponent />)
  cy.get('#filled-basic').should('contains.text', '');
  cy.get('#createNewGameButton').should('be.disabled');
})
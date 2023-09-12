import React from 'react'
import { ErrModal } from '../App.jsx'

const handleClose = () => {  };

describe('<ErrModal />', () => {
  it('renders error modal and close button', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ErrModal errMsg={''} open={true} handleClose={handleClose}/>);
    cy.get('h2').should('contains.text', 'An error has occurred');
    cy.get('button').should('contains.text', 'Close');
  })

  it('renders with appropriate error message', () => {
    const errorMsg = 'This is the error message';
    cy.mount(<ErrModal errMsg={errorMsg} open={true} handleClose={handleClose}/>);

    cy.get('p').should('contains.text', errorMsg);
  })
});
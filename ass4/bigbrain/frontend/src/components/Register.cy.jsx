import React from 'react'
import Register from './Register'
import { BrowserRouter } from 'react-router-dom'

const noop = () => {}

describe('<Register />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>)
  })
})

it('renders the name field, email field, password field and register button', () => {
  cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>);

  cy.get("button").should('contains.text', 'Register');
  cy.get("form").should('be.visible');
  cy.get('input[name="name"]').should('contains.text', '');
  cy.get('input[name="email"]').should('contains.text', '');
  cy.get('input[name="password"]').should('contains.text', '');
})

it('renders the error message for name if no name given', () => {
  cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>);

  cy.get('input[name="name"]').focus();
  cy.get('input[name="name"]').blur();

  cy.get('p[id="name-helper-text"]').should('contains.text', 'Name must not be empty');
})

it('renders the error message for email if invalid email given', () => {
  cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>);

  cy.get('input[name="email"]').type("not email");
  cy.get('p[id="email-helper-text"]').should('contains.text', 'Email must be valid');
})

it('renders the error message for password if no password given', () => {
  cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>);

  cy.get('input[name="password"]').focus();
  cy.get('input[name="password"]').blur();

  cy.get('p[id="password-helper-text"]').should('contains.text', 'Password must not be empty');
})

it('renders the no error messages for valid inputs', () => {
  cy.mount(<BrowserRouter><Register onSuccess = {noop}/></BrowserRouter>);

  const inputs = {
    name: "name",
    password: "password",
    email: "valid.email@gmail.com"
  };

  cy.get('input[name="name"]').type(inputs.name);
  cy.get('input[name="email"]').type(inputs.email);
  cy.get('input[name="password"]').type(inputs.password);

  cy.get('p[id="name-helper-text"]').should('not.exist');
  cy.get('p[id="email-helper-text"]').should('not.exist');
  cy.get('p[id="password-helper-text"]').should('not.exist');
})

import { v4 as uuidv4 } from 'uuid';
// Write a test for the "happy path" of an admin that is described as:
// Registers successfully
// Creates a new game successfully
// (Not required) Updates the thumbnail and name of the game successfully (yes, it will have no questions)
// Starts a game successfully
// Ends a game successfully (yes, no one will have played it)
// Loads the results page successfully
// Logs out of the application successfully
// Logs back into the application successfully

describe('template spec', () => {
  it('should navigate to register screen', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
  })

  it('should register new account successfully', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(`randomemail${uuidv4()}@gmail.com`);
    cy.get('input[name="password"]')
      .focus()
      .type('randompassword');

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');
  })

  it('should create new game successfully', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(`randomemail${uuidv4()}@gmail.com`);
    cy.get('input[name="password"]')
      .focus()
      .type('randompassword');

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');

    // click create btn on navbar
    cy.get("button[id='createBtn']").click();

    cy.get("input").type('game name');
    cy.get("button[id='createGameBtn']").click();
  })

  it('should start the game', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(`randomemail${uuidv4()}@gmail.com`);
    cy.get('input[name="password"]')
      .focus()
      .type('randompassword');

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');

    // click create btn on navbar
    cy.get("button[id='createBtn']").click();

    cy.get("input").type('game name');
    cy.get("button[id='createGameBtn']").click();

    cy.get("button[aria-label='start session']").click();
    cy.get("button[id='doneBtn']").click();
  })

  it('should end the game and navigate to results page', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(`randomemail${uuidv4()}@gmail.com`);
    cy.get('input[name="password"]')
      .focus()
      .type('randompassword');

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');

    // click create btn on navbar
    cy.get("button[id='createBtn']").click();

    cy.get("input").type('game name');
    cy.get("button[id='createGameBtn']").click();

    cy.get("button[aria-label='start session']").click();
    cy.get("button[id='doneBtn']").click();

    // ends game
    cy.get("button[id='endGameBtn']").click();
    cy.url().should('include', '/results');
  })

  it('should logout and navigate to login screen', () => {
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(`randomemail${uuidv4()}@gmail.com`);
    cy.get('input[name="password"]')
      .focus()
      .type('randompassword');

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');

    // click create btn on navbar
    cy.get("button[id='createBtn']").click();

    cy.get("input").type('game name');
    cy.get("button[id='createGameBtn']").click();

    cy.get("button[aria-label='start session']").click();
    cy.get("button[id='doneBtn']").click();

    // ends game
    cy.get("button[id='endGameBtn']").click();
    cy.url().should('include', '/results');

    // logout
    cy.get("button[id='logoutBtn']").click();
    cy.url().should('include', '/login');
  })

  it('should log back in', () => {
    const email = `randomemail${uuidv4()}@gmail.com`;
    const password = 'randompassword';
    cy.visit('localhost:3000/register');
    cy.url().should('include', '/register');
    // register inputs
    cy.get('input[name="name"]')
      .focus()
      .type('randomname');
    cy.get('input[name="email"]')
      .focus()
      .type(email);
    cy.get('input[name="password"]')
      .focus()
      .type(password);

    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');

    // click create btn on navbar
    cy.get("button[id='createBtn']").click();

    cy.get("input").type('game name');
    cy.get("button[id='createGameBtn']").click();

    cy.get("button[aria-label='start session']").click();
    cy.get("button[id='doneBtn']").click();

    // ends game
    cy.get("button[id='endGameBtn']").click();
    cy.url().should('include', '/results');

    // logout
    cy.get("button[id='logoutBtn']").click();
    cy.url().should('include', '/login');

    // login inputs
    cy.get('input[name="email"]')
      .focus()
      .type(email);
    cy.get('input[name="password"]')
      .focus()
      .type(password);

      // log back in
    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard');
  })
})
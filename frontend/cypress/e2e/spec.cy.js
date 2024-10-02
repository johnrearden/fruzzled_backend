describe('My First Test', () => {
  it('passes', () => {
    cy.visit(Cypress.env('HOSTNAME'));
    cy.contains('Sudoku').click();
    cy.url().should('include', '/sudoku_home');
  })
})
describe('Test Login Functionality', () => {
    it('passes', () => {
        cy.visit(Cypress.env('HOSTNAME'));
        cy.get('[data-cy="login-button"]').click();
        cy.get('[data-cy="username-input"]').type('tester');
        cy.get('[data-cy="password-input"]').type('Eleventeen11');
        cy.get('[data-cy="submit-button"]').click();

        cy.get('[data-cy="crossword-link"]').should('exist');

    })
})
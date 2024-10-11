describe('Test jwt login and logout functionality', () => {

    beforeEach(() => {
        cy.clearCookies();
    })

    it('logs in successfully', () => {
        cy.visit(Cypress.env('HOSTNAME'));
        cy.get('[data-cy="login-button"]').click();
        cy.get('[data-cy="username-input"]').type('tester');
        cy.get('[data-cy="password-input"]').type('Eleventeen11');
        cy.get('[data-cy="submit-button"]').click();

        cy.get('[data-cy="crossword-link"]').should('exist');

    });

    it('logs out successfully', () => {
        cy.visit(Cypress.env('HOSTNAME'));

        // Login first
        cy.get('[data-cy="login-button"]').click();
        cy.get('[data-cy="username-input"]').type('tester');
        cy.get('[data-cy="password-input"]').type('Eleventeen11');
        cy.get('[data-cy="submit-button"]').click();

        cy.get('[data-cy="crossword-link"]').should('exist');

        // Now try logging out
        cy.get('[data-cy="logout-button"]').click();
        cy.get('[data-cy="login-button"]').should('exist');
    })
})
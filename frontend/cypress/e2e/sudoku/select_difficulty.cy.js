describe('Test sudoku difficulty level selection', () => {
    
    beforeEach(() => {
        cy.visit(Cypress.env('HOSTNAME'));
        cy.get('[data-cy="sudoku-link"]').click();
    });

    it('gets a easy puzzle correctly', () => {
        cy.get('[data-cy="easy-difficulty-button"]').click();
        cy.get('[data-cy="difficulty-display"]').should('have.text', 'EASY');
    });

    it('gets a medium puzzle correctly', () => {
        cy.get('[data-cy="medium-difficulty-button"]').click();
        cy.get('[data-cy="difficulty-display"]').should('have.text', 'MEDIUM');
    });

    it('gets a tricky puzzle correctly', () => {
        cy.get('[data-cy="tricky-difficulty-button"]').click();
        cy.get('[data-cy="difficulty-display"]').should('have.text', 'HARD');
    });

    it('gets a hard puzzle correctly', () => {
        cy.get('[data-cy="hard-difficulty-button"]').click();
        cy.get('[data-cy="difficulty-display"]').should('have.text', 'DIFFICULT');
    });
});
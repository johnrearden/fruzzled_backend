describe('Test that entering a duplicate digit in same row displays error classes', () => {

    beforeEach(() => {
        cy.visit(Cypress.env('HOSTNAME'));
        cy.get('[data-cy="sudoku-link"]'.click());
    
        // Mock the API request to GET an easy puzzle
        const url = '**api/get_random_puzzle/0/';
        cy.intercept(url, {fixture: 'sudoku/easy_sudoku.json'}).as('getEasySudoku');

        // Visit the sudoku puzzle solver page
        cy.get('[data-cy="easy-difficulty-button"]').click();

        // Wait for the intercepted request
        cy.wait(['@getEasySudoku']);
    });

});
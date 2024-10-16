describe('Test that clicking a valid combination of cell and digit fills the cell legally', () => {
    
    beforeEach(() => {
        cy.visit(Cypress.env('HOSTNAME'));
        cy.get('[data-cy="sudoku-link"]').click();

        // Mock the API request to GET an easy puzzle
        const url = '**api/get_random_puzzle/0/';
        cy.intercept(url, {fixture: 'sudoku/easy_sudoku.json'}).as('getEasySudoku');

        // Visit the sudoku puzzle solver page
        cy.get('[data-cy="easy-difficulty-button"]').click();

        // Wait for the intercepted request
        cy.wait(['@getEasySudoku']);
    });

    it('Clicking a cell and then a valid digit results in the digit appearing in the cell', () => {
        
        
    })
});
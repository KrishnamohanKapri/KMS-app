it('Add new staff to the system', function() {
    cy.viewport(1920, 1080);
    cy.visit('https://kitchen-planner-fe.vercel.app/')
    cy.get('[routerlink="/login"] .mdc-button__label').click();
    cy.get('[placeholder="Username"]').click().type('admin@example.com');
    cy.get('[type="password"]').click().type('admin12345');
    cy.get('button:nth-child(5)').click();
    cy.get('[routerlink="/admin/staff-management"]').click();
    cy.get('.add-staff-btn').click();
    cy.get('#mat-input-4').click().type('Cypress');
    cy.get('#mat-input-5').click().type('E2e');
    const randomEmail = `user_${Math.random().toString(36).substring(2, 8)}@example.com`;
    cy.get('#mat-input-6').click().type(randomEmail);
    cy.get('#mat-select-1 svg').click();
    cy.get('#mat-option-3').click();
     cy.get('#mat-input-7').click();
    cy.get('#mat-input-7').clear();
    cy.get('#mat-input-7').type('password123');
    cy.get('#mat-mdc-dialog-0 .mat-mdc-raised-button .mdc-button__label').click();
});
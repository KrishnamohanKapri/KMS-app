it('should login with admin and should able to update the stock', () => {
  cy.viewport(1920, 1080);
  cy.visit('localhost:4200');
  
  cy.get('[routerlink="/login"] .mdc-button__label').click();
  cy.get('[placeholder="Username"]').type('admin@example.com');
  cy.get('[type="password"]').type('admin12345');
  cy.get('button:nth-child(5)').click();
  cy.get('#mat-expansion-panel-header-0 .mat-expansion-panel-header-title').click();
  cy.get('#cdk-accordion-child-0 [routerlink="/admin/stock-management"]').click();
  cy.get('#mat-input-3').click();
  cy.get('#mat-input-3').clear();
  cy.get('#mat-input-3').type('C');
  cy.get('#mat-input-3').clear();
  cy.get('#mat-input-3').type('Ca');
  cy.get('#mat-input-3').clear();
  cy.get('#mat-input-3').type('Car');
  cy.get('#mat-input-3').clear();
  cy.get('#mat-input-3').type('Carrot');
  cy.get('tr:nth-child(1) button:nth-child(2) .mdc-button__label').click();
  cy.get('#mat-input-4').clear();
  cy.get('#mat-input-4').type('1');
  cy.get('#mat-input-4').clear();
  cy.get('#mat-input-4').type('100');
  cy.get('#mat-input-4').clear();
  cy.get('#mat-input-4').type('10000');
  cy.get('#mat-mdc-dialog-0 .mat-mdc-raised-button .mdc-button__label').click();
});
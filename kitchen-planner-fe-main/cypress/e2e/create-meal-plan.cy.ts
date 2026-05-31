it('should create a new meal plan', () => {
  cy.viewport(1920, 1080);
  cy.visit('localhost:4200');
  
  cy.get('[routerlink="/login"] .mdc-button__label').click();
  cy.get('[placeholder="Username"]').type('admin@example.com');
  cy.get('[type="password"]').type('admin12345');
  cy.get('button:nth-child(5)').click();
  
  cy.get('[routerlink="/admin/weekly-planner"]').click();
  cy.get('.top-bar button').click();
  
  cy.get('[data-cy="plan-type-dropdown"]').click();
  cy.get('[data-cy="plan-type-week"]').click();
  
  cy.get('[data-cy="meal-time-type-dropdown"]').click();
  cy.get('[data-cy="meal-time-type-lunch"]').click();
  
  cy.get('[data-cy="plan-start-date-input"]').type('2025-09-22');
  cy.get('[data-cy="plan-end-date-input"]').type('2025-09-26');
  
  cy.get('[data-cy="add-meal-btn"]').click();
  cy.get('[data-cy="plan-meal-dropdown"]').first().click();
  cy.get('[data-cy^="plan-meal-option-"]').first().click();
  cy.get('[data-cy="plan-meal-servings-input"]').first().clear().type('5');
  
  cy.get('[data-cy="plan-staff-dropdown"]').click();
  cy.get('[data-cy^="plan-staff-option-"]').first().click();
  cy.get('body').type('{esc}');
  
  cy.get('[data-cy="plan-notes-input"]').type('Automated meal plan test');
  
  cy.get('[data-cy="save-plan-btn"]').click();
  
  cy.contains('Plan created').should('exist');
  cy.get('.mat-mdc-paginator-navigation-last .mat-mdc-button-touch-target').click();
  cy.get('tr:nth-child(4) button:nth-child(3)').click();
});

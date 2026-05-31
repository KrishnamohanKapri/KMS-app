it('Place an order and complete the process ', function() {
  cy.viewport(1920, 1080);
  cy.visit('localhost:4200');
  
  cy.get('[routerlink="/login"] .mdc-button__label').click();
  cy.get('[placeholder="Username"]').type('hassan@example.com');
  cy.get('[type="password"]').type('password123');
  cy.get('button:nth-child(5)').click();
  
  cy.get('mat-card:nth-child(3) .mdc-button__label').click();
  cy.get('[routerlink="/checkout/cart"] .mat-icon').click();
  cy.get('.next-btn').click();
  
  cy.get('#mat-input-9').clear().type('51');
  cy.get('#mat-input-10').clear().type('68165');
  cy.get('.next-btn').click();
  
  cy.get('#mat-mdc-checkbox-0-input').check({ force: true });
  cy.get('.same-billing-card').click();
  cy.get('.next-btn').click();
  
  cy.get('.payment-options label').first().click();
  cy.get('#card-element iframe', { timeout: 10000 }).should('be.visible');
  cy.visit('http://localhost:4200/checkout/success');
  cy.get('.mdc-button__label span').click();
  cy.get('#mat-menu-panel-1 [routerlink="/customer/customer-own-order"]').click();
  cy.get('.mat-mdc-paginator-touch-target').click();
  cy.get('#mat-option-3').click();
  cy.get('.mat-mdc-paginator-navigation-next .mat-mdc-button-touch-target').click();
  cy.get('.mdc-button__label span').click();
  cy.get('#mat-menu-panel-3 .logout .mat-icon').click();
});

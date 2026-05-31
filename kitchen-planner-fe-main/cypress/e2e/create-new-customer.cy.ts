it('create new Customer', function() {
    cy.viewport(1920, 1080);
    cy.visit('localhost:4200')
    cy.get('[routerlink="/signup"] .mdc-button__label').click();
    const randomEmail = `cypress_${Date.now()}@test.com`;
    cy.get('[data-cy="signup-firstname-input"]').clear().type('Cypress');
    cy.get('[data-cy="signup-lastname-input"]').clear().type('E2E');
    cy.get('[data-cy="signup-email-input"]').clear().type(randomEmail);
    cy.get('[data-cy="signup-password-input"]').clear().type('password123');
    cy.get('[data-cy="signup-submit-btn"]').click();

    cy.get('[placeholder="Username"]').clear().type(randomEmail);
    cy.get('[type="password"]').clear().type('password123');
    cy.get('button:nth-child(5)').click();

    cy.get('[data-cy="profile-phone-input"]').clear().type('0123456789');
    cy.get('[data-cy="profile-street-input"]').clear().type('Ehrengerstr 29');
    cy.get('[data-cy="profile-city-input"]').clear().type('Ilmenau');
    cy.get('[data-cy="profile-zipcode-input"]').clear().type('98693');
    cy.get('[data-cy="profile-state-input"]').clear().type('Thuringia');
    cy.get('[data-cy="profile-country-dropdown"]').click();
    cy.get('[data-cy^="profile-country-option-"]').contains(/^germany$/i).click();
    cy.get('body').type('{esc}');

    cy.get('[data-cy="profile-allergies-dropdown"]').click();
    cy.get('[data-cy^="profile-allergen-option-"]').first().click();
    cy.get('body').type('{esc}');
    cy.get('[data-cy="profile-payment-dropdown"]').click();
    cy.get('[data-cy^="profile-payment-option-"]').first().click();
    cy.get('body').type('{esc}');
    cy.get('[data-cy="profile-save-btn"]').click();

});
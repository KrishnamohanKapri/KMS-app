it('create new meal', function() {
    cy.viewport(1920, 1080);
    cy.visit('localhost:4200')
    cy.get('[routerlink="/login"] .mdc-button__label').click();
    cy.get('[placeholder="Username"]').click().type('admin@example.com');
    cy.get('[type="password"]').click().type('admin12345');
    cy.get('button:nth-child(5)').click();
    cy.get('[routerlink="/admin/meal-manager"]').click();
    cy.get('.mat-mdc-raised-button').click();
    
    cy.get('[data-cy="meal-title-input"]').click().clear().type('Test Meal for Cypress');
    cy.get('[data-cy="meal-description-input"]').click().clear().type('A meal created by Cypress test');
    cy.get('[data-cy="meal-servings-input"]').click().clear().type('2');
    cy.get('[data-cy="meal-price-input"]').click().clear().type('20');
    cy.get('[data-cy="meal-cooktime-input"]').click().clear().type('30');
    
    cy.get('[data-cy="meal-type-dropdown"]').click();
    cy.get('[data-cy="meal-type-lunch"]').click();
    
    cy.get('[data-cy="serving-start-input"]').clear().type('12:00');
    cy.get('[data-cy="serving-end-input"]').clear().type('14:00');
    
    cy.get('[data-cy="category-dropdown"]').click();
    cy.get('[data-cy^="category-option-"]').first().click();
    
    cy.get('[data-cy="ingredient-name-dropdown"]').click();
    cy.get('[data-cy^="ingredient-option-"]').first().click();
    cy.get('[data-cy="ingredient-qty-input"]').clear().type('200');
    cy.get('[data-cy="add-ingredient-btn"]').click();
    
    cy.get('[data-cy="tags-dropdown"]').click();
    cy.get('[data-cy^="tag-option-"]').first().click();
    cy.get('body').type('{esc}');
    
    cy.get('[data-cy="allergens-dropdown"]').click();
    cy.get('[data-cy^="allergen-option-"]').first().click();
    cy.get('body').type('{esc}');
    
    cy.get('[data-cy="upload-image-btn"]').click();
    cy.get('[data-cy="image-input"]').attachFile('burger.jpg');
    
    cy.get('[data-cy="submit-btn"]').click();
    cy.get('.mat-mdc-paginator-touch-target').click();
    cy.get('#mat-option-121 .mdc-list-item__primary-text').click();
    cy.get('.mat-mdc-paginator-navigation-last .mat-mdc-button-touch-target').click();
    cy.get('tr:nth-child(3) button:nth-child(3)').click();
});
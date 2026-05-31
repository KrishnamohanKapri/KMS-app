const fs = require('fs');
const path = require('path');

// Import all models
const Meal = require('../models/Meals/meals');
const Category = require('../models/Meals/category');
const NutritionalInfo = require('../models/Meals/nutritionalInfo');
const Allergen = require('../models/Meals/allergen');
const MealAllergen = require('../models/Meals/mealAllergen');
const DietaryInfo = require('../models/Meals/dietaryInfo');
const Ingredient = require('../models/Meals/ingredient');
const MealIngredient = require('../models/Meals/mealIngredient');
const Tag = require('../models/Meals/tag');
const MealTag = require('../models/Meals/mealTag');

// Define the ERD structure
const erdData = {
  entities: [
    {
      name: 'Meal',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'title', type: 'String', required: true },
        { name: 'description', type: 'String', required: true },
        { name: 'servings', type: 'Number', required: true },
        { name: 'price', type: 'Number', required: true },
        { name: 'stock', type: 'Number', required: true },
        { name: 'discount', type: 'Number', required: true },
        { name: 'images', type: '[String]', required: true },
        { name: 'isActive', type: 'Boolean', default: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: '1:1', target: 'Category', field: 'category' },
        { type: '1:1', target: 'NutritionalInfo', field: 'nutritionalInfo' },
        { type: '1:1', target: 'DietaryInfo', field: 'dietaryInfo' }
      ]
    },
    {
      name: 'Category',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'name', type: 'String', required: true },
        { name: 'isActive', type: 'Boolean', default: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: '1:N', target: 'Meal', field: 'meals' }
      ]
    },
    {
      name: 'NutritionalInfo',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'mealId', type: 'ObjectId', required: true, unique: true },
        { name: 'energy', type: '{value: Number, unit: String}' },
        { name: 'fat', type: '{value: Number, unit: String}' },
        { name: 'saturatedFat', type: '{value: Number, unit: String}' },
        { name: 'carbohydrates', type: '{value: Number, unit: String}' },
        { name: 'sugar', type: '{value: Number, unit: String}' },
        { name: 'protein', type: '{value: Number, unit: String}' },
        { name: 'salt', type: '{value: Number, unit: String}' },
        { name: 'fiber', type: '{value: Number, unit: String}' },
        { name: 'nutriScore', type: 'String (A-E)', required: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: '1:1', target: 'Meal', field: 'meal' }
      ]
    },
    {
      name: 'DietaryInfo',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'mealId', type: 'ObjectId', required: true, unique: true },
        { name: 'vegetarian', type: 'Boolean', default: false },
        { name: 'vegan', type: 'Boolean', default: false },
        { name: 'glutenFree', type: 'Boolean', default: false },
        { name: 'lactoseFree', type: 'Boolean', default: false },
        { name: 'halal', type: 'Boolean', default: false },
        { name: 'kosher', type: 'Boolean', default: false },
        { name: 'nutFree', type: 'Boolean', default: false },
        { name: 'soyFree', type: 'Boolean', default: false },
        { name: 'eggFree', type: 'Boolean', default: false },
        { name: 'fishFree', type: 'Boolean', default: false },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: '1:1', target: 'Meal', field: 'meal' }
      ]
    },
    {
      name: 'Allergen',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'name', type: 'String', required: true, unique: true },
        { name: 'description', type: 'String', required: true },
        { name: 'isActive', type: 'Boolean', default: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:M', target: 'Meal', through: 'MealAllergen' }
      ]
    },
    {
      name: 'Ingredient',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'name', type: 'String', required: true, unique: true },
        { name: 'description', type: 'String', required: true },
        { name: 'category', type: 'String (enum)', required: true },
        { name: 'isActive', type: 'Boolean', default: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:M', target: 'Meal', through: 'MealIngredient' }
      ]
    },
    {
      name: 'Tag',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'name', type: 'String', required: true, unique: true },
        { name: 'description', type: 'String', required: true },
        { name: 'color', type: 'String', default: '#3B82F6' },
        { name: 'isActive', type: 'Boolean', default: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:M', target: 'Meal', through: 'MealTag' }
      ]
    },
    {
      name: 'MealAllergen',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'mealId', type: 'ObjectId', required: true },
        { name: 'allergenId', type: 'ObjectId', required: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:1', target: 'Meal', field: 'meal' },
        { type: 'N:1', target: 'Allergen', field: 'allergen' }
      ]
    },
    {
      name: 'MealIngredient',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'mealId', type: 'ObjectId', required: true },
        { name: 'ingredientId', type: 'ObjectId', required: true },
        { name: 'quantity', type: 'Number', required: true },
        { name: 'unit', type: 'String', required: true },
        { name: 'isOptional', type: 'Boolean', default: false },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:1', target: 'Meal', field: 'meal' },
        { type: 'N:1', target: 'Ingredient', field: 'ingredient' }
      ]
    },
    {
      name: 'MealTag',
      attributes: [
        { name: '_id', type: 'ObjectId', primary: true },
        { name: 'mealId', type: 'ObjectId', required: true },
        { name: 'tagId', type: 'ObjectId', required: true },
        { name: 'createdAt', type: 'Date' },
        { name: 'updatedAt', type: 'Date' }
      ],
      relationships: [
        { type: 'N:1', target: 'Meal', field: 'meal' },
        { type: 'N:1', target: 'Tag', field: 'tag' }
      ]
    }
  ]
};

// Generate Mermaid ERD
function generateMermaidERD() {
  let mermaid = 'erDiagram\n';
  
  // Add entities with simplified syntax
  erdData.entities.forEach(entity => {
    mermaid += `    ${entity.name} {\n`;
    entity.attributes.forEach(attr => {
      // Simplified attribute format for better Mermaid compatibility
      let attrLine = `        ${attr.name}`;
      if (attr.primary) attrLine += ' PK';
      if (attr.required) attrLine += ' NOT NULL';
      attrLine += ` ${attr.type}`;
      mermaid += attrLine + '\n';
    });
    mermaid += '    }\n';
  });
  
  // Add relationships
  erdData.entities.forEach(entity => {
    entity.relationships.forEach(rel => {
      if (rel.type === '1:1') {
        mermaid += `    ${entity.name} ||--|| ${rel.target} : "${rel.field}"\n`;
      } else if (rel.type === '1:N') {
        mermaid += `    ${entity.name} ||--o{ ${rel.target} : "${rel.field}"\n`;
      } else if (rel.type === 'N:1') {
        mermaid += `    ${entity.name} }o--|| ${rel.target} : "${rel.field}"\n`;
      } else if (rel.type === 'N:M') {
        mermaid += `    ${entity.name} }o--o{ ${rel.target} : "${rel.through}"\n`;
      }
    });
  });
  
  return mermaid;
}

// Generate PlantUML ERD
function generatePlantUMLERD() {
  let plantuml = '@startuml\n';
  plantuml += '!define table(x) class x << (T,#FFAAAA) >>\n';
  plantuml += '!define primary_key(x) <u>x</u>\n';
  plantuml += '!define foreign_key(x) <i>x</i>\n';
  plantuml += '!define not_null(x) <b>x</b>\n\n';
  
  // Add entities
  erdData.entities.forEach(entity => {
    plantuml += `table(${entity.name}) {\n`;
    entity.attributes.forEach(attr => {
      let field = attr.name;
      if (attr.primary) field = `primary_key(${field})`;
      else if (attr.name.includes('Id') && !attr.primary) field = `foreign_key(${field})`;
      if (attr.required) field = `not_null(${field})`;
      plantuml += `  ${field} : ${attr.type}\n`;
    });
    plantuml += '}\n\n';
  });
  
  // Add relationships
  erdData.entities.forEach(entity => {
    entity.relationships.forEach(rel => {
      if (rel.type === '1:1') {
        plantuml += `${entity.name} ||--|| ${rel.target} : ${rel.field}\n`;
      } else if (rel.type === '1:N') {
        plantuml += `${entity.name} ||--o{ ${rel.target} : ${rel.field}\n`;
      } else if (rel.type === 'N:1') {
        plantuml += `${entity.name} }o--|| ${rel.target} : ${rel.field}\n`;
      } else if (rel.type === 'N:M') {
        plantuml += `${entity.name} }o--o{ ${rel.target} : ${rel.through}\n`;
      }
    });
  });
  
  plantuml += '@enduml';
  return plantuml;
}

// Generate JSON schema documentation
function generateJSONSchema() {
  return JSON.stringify(erdData, null, 2);
}

// Main function
function generateERD() {
  console.log('Generating ERD diagrams...');
  
  // Generate Mermaid ERD
  const mermaidERD = generateMermaidERD();
  fs.writeFileSync(path.join(__dirname, '../../erd-mermaid.md'), mermaidERD);
  console.log('✅ Mermaid ERD saved to: erd-mermaid.md');
  
  // Generate PlantUML ERD
  const plantUMLERD = generatePlantUMLERD();
  fs.writeFileSync(path.join(__dirname, '../../erd-plantuml.puml'), plantUMLERD);
  console.log('✅ PlantUML ERD saved to: erd-plantuml.puml');
  
  // Generate JSON schema
  const jsonSchema = generateJSONSchema();
  fs.writeFileSync(path.join(__dirname, '../../erd-schema.json'), jsonSchema);
  console.log('✅ JSON schema saved to: erd-schema.json');
  
  console.log('\n📋 How to view the ERD:');
  console.log('1. Mermaid ERD: Copy content from erd-mermaid.md and paste into https://mermaid.live/');
  console.log('2. PlantUML ERD: Copy content from erd-plantuml.puml and paste into http://www.plantuml.com/plantuml/uml/');
  console.log('3. JSON Schema: Open erd-schema.json in any text editor');
  
  console.log('\n🎯 Your normalized schema includes:');
  console.log(`   • ${erdData.entities.length} entities`);
  console.log('   • Proper normalization (1NF, 2NF, 3NF)');
  console.log('   • Many-to-many relationships via junction tables');
  console.log('   • Referential integrity through foreign keys');
}

// Run if called directly
if (require.main === module) {
  generateERD();
}

module.exports = { generateERD, generateMermaidERD, generatePlantUMLERD, generateJSONSchema }; 
# Kitchen Management System (KMS) - Complete Normalized Schema Documentation

## 📋 Overview

This document describes the complete normalized database schema for the Kitchen Management System (KMS). The system has been transformed from a denormalized structure to a fully normalized, scalable architecture that supports advanced features like meal planning, batch-based inventory management, and comprehensive staff management.

## 🔄 Schema Normalization Summary

### Before (Denormalized)
- Meals contained embedded arrays/objects for nutritional info, allergens, dietary info, ingredients, tags, stock, and discount
- Data duplication and performance issues
- Difficult to maintain and scale

### After (Normalized)
- Separate collections for all complex data
- Proper relationships through ObjectId references
- Junction tables for many-to-many relationships
- Improved performance and maintainability

## 🏗️ Complete Entity Structure

### 🧑‍💼 User Management

#### User
**Purpose**: Core user entity with authentication and role-based access control
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: "user", "admin", "chef", default: "user"),
  profileImage: String,
  isActive: Boolean (default: true),
  status: String (enum: "active", "inactive", default: "active"),
  kitchenNo: String (default: "001"),
  createdAt: Date
}
```

#### Attendance
**Purpose**: Tracks staff attendance for meal planning and resource management
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  date: Date (required),
  isPresent: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 📧 Newsletter

#### Newsletter
**Purpose**: Email subscription management for marketing
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  isSubscribed: Boolean (default: true),
  createdAt: Date
}
```

### 🍽️ Meals & Categories

#### Category
**Purpose**: Meal categorization (e.g., Breakfast, Lunch, Dinner)
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdAt: Date
}
```

#### Meal
**Purpose**: Core meal entity with basic information and references to normalized data
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  servings: Number (required),
  price: Number (required),
  category: ObjectId (ref: Category),
  images: [String] (required),
  isActive: Boolean (default: true),
  nutritionalInfo: ObjectId (ref: NutritionalInfo),
  dietaryInfo: ObjectId (ref: DietaryInfo),
  createdAt: Date,
  updatedAt: Date
}
```

### 🥗 Nutritional & Dietary Information

#### NutritionalInfo
**Purpose**: Detailed nutritional breakdown (calories, protein, etc.)
```javascript
{
  _id: ObjectId,
  calories: Number,
  protein: Number,
  carbohydrates: Number,
  fat: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### DietaryInfo
**Purpose**: Dietary restrictions and preferences (vegetarian, gluten-free, etc.)
```javascript
{
  _id: ObjectId,
  isVegetarian: Boolean (default: false),
  isVegan: Boolean (default: false),
  isGlutenFree: Boolean (default: false),
  isDairyFree: Boolean (default: false),
  isNutFree: Boolean (default: false),
  isHalal: Boolean (default: false),
  isKosher: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 🚨 Allergens

#### Allergen
**Purpose**: Allergen definitions (nuts, dairy, etc.)
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdAt: Date
}
```

#### MealAllergen
**Purpose**: Many-to-many relationship between meals and allergens
```javascript
{
  _id: ObjectId,
  mealId: ObjectId (ref: Meal, required),
  allergenId: ObjectId (ref: Allergen, required),
  createdAt: Date
}
```

### 🥬 Ingredients & Stock Management

#### Ingredient
**Purpose**: Ingredient definitions with stock management
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (required),
  category: String (enum: "vegetable", "fruit", "meat", "dairy", "grain", "spice", "herb", "other", required),
  stock: Number (required, default: 0, min: 0),
  unit: String (enum: "g", "kg", "ml", "l", "tbsp", "tsp", "cup", "piece", "slice", "whole", default: "g"),
  reorderLevel: Number (required, default: 10, min: 0),
  costPerUnit: Number (required, default: 0, min: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### IngredientBatch
**Purpose**: Batch tracking with expiry dates for inventory management
```javascript
{
  _id: ObjectId,
  ingredientId: ObjectId (ref: Ingredient, required),
  quantity: Number (required, min: 0),
  expiryDate: Date (required),
  receivedDate: Date (default: Date.now),
  batchNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### MealIngredient
**Purpose**: Many-to-many relationship between meals and ingredients with quantities
```javascript
{
  _id: ObjectId,
  mealId: ObjectId (ref: Meal, required),
  ingredientId: ObjectId (ref: Ingredient, required),
  quantity: Number (required),
  unit: String (required),
  createdAt: Date
}
```

### 🏷️ Tags

#### Tag
**Purpose**: Flexible tagging system for meals (e.g., "Spicy", "Chef's Special")
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdAt: Date
}
```

#### MealTag
**Purpose**: Many-to-many relationship between meals and tags
```javascript
{
  _id: ObjectId,
  mealId: ObjectId (ref: Meal, required),
  tagId: ObjectId (ref: Tag, required),
  createdAt: Date
}
```

### 📅 Meal Planning

#### MealPlan
**Purpose**: Daily/weekly meal planning with staff assignments
```javascript
{
  _id: ObjectId,
  date: Date (required),
  meals: [{
    mealId: ObjectId (ref: Meal, required),
    servings: Number (required)
  }],
  type: String (enum: "day", "week", default: "day"),
  createdBy: ObjectId (ref: User),
  assignedStaff: [ObjectId] (ref: User),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 🛒 Orders

#### Order
**Purpose**: Customer order management with payment tracking
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  items: [{
    mealId: ObjectId (ref: Meal, required),
    quantity: Number (required),
    price: Number (required)
  }],
  totalAmount: Number (required),
  status: String (enum: "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"),
  paymentStatus: String (enum: "pending", "paid", "failed"),
  createdAt: Date,
  updatedAt: Date
}
```

### 🔔 Notifications

#### Notification
**Purpose**: User notification system for alerts and updates
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required),
  message: String (required),
  type: String (enum: "info", "warning", "error", "success"),
  isRead: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔗 Relationships

### One-to-Many Relationships
- **User → Attendance**: User has multiple attendance records
- **User → Order**: User places multiple orders
- **User → Notification**: User receives multiple notifications
- **User → MealPlan**: User creates multiple meal plans
- **Category → Meal**: Category contains multiple meals
- **Meal → MealAllergen**: Meal has multiple allergen relationships
- **Allergen → MealAllergen**: Allergen belongs to multiple meal relationships
- **Meal → MealIngredient**: Meal contains multiple ingredients
- **Ingredient → MealIngredient**: Ingredient used in multiple meals
- **Meal → MealTag**: Meal has multiple tags
- **Tag → MealTag**: Tag applied to multiple meals
- **Meal → MealPlan**: Meal planned in multiple meal plans
- **Meal → Order**: Meal ordered in multiple orders
- **Ingredient → IngredientBatch**: Ingredient has multiple batches

### One-to-One Relationships
- **Meal → NutritionalInfo**: Meal has one nutritional info record
- **Meal → DietaryInfo**: Meal has one dietary info record

### Many-to-Many Relationships (via Junction Tables)
- **Meal ↔ Allergen**: Through MealAllergen
- **Meal ↔ Ingredient**: Through MealIngredient
- **Meal ↔ Tag**: Through MealTag

## 🚀 Key Features

### 🔄 Normalized Schema
- **Benefits**: Better performance, reduced duplication, improved integrity
- **Implementation**: All complex data separated into dedicated collections
- **Relationships**: Maintained through ObjectId references and junction tables

### 📊 Advanced Stock Management
- **Batch Tracking**: Each ingredient can have multiple batches with expiry dates
- **Automatic Calculation**: Stock is calculated from non-expired batches only
- **Cost Management**: Track cost per unit for each ingredient
- **Reorder Alerts**: Automatic low stock notifications

### 👥 Staff Management
- **Role-Based Access**: admin, chef, user roles with different permissions
- **Attendance Tracking**: Monitor staff presence for resource planning
- **Meal Plan Assignment**: Assign staff to specific meal plans
- **Resource Validation**: Check staff availability before planning

### 🏷️ Flexible Tagging
- **Dynamic Categories**: Create tags without hardcoding
- **Easy Filtering**: Filter meals by multiple tags
- **Scalable System**: Add new tags without schema changes

### 📈 Meal Planning
- **Daily/Weekly Plans**: Support for both daily and weekly planning
- **Resource Checking**: Validate staff and ingredient availability
- **Stock Validation**: Ensure sufficient ingredients for planned meals
- **Integration**: Works with attendance and stock management

## 📁 File Structure

```
src/models/
├── Meals/
│   ├── meals.js (simplified core meal entity)
│   ├── category.js (meal categories)
│   ├── nutritionalInfo.js (nutritional data)
│   ├── dietaryInfo.js (dietary restrictions)
│   ├── allergen.js (allergen definitions)
│   ├── ingredient.js (ingredient with stock management)
│   ├── ingredientBatch.js (batch tracking)
│   ├── tag.js (flexible tagging)
│   ├── mealAllergen.js (junction table)
│   ├── mealIngredient.js (junction table)
│   ├── mealTag.js (junction table)
│   └── mealPlan.js (meal planning)
├── User/
│   ├── user.js (authentication and roles)
│   ├── attendance.js (staff attendance)
│   ├── order.js (customer orders)
│   └── notification.js (user notifications)
└── Newsletter/
    └── newsletter.js (email subscriptions)
```

## 🔧 Migration & Setup

### Migration Scripts
- `migrateToNormalizedSchema.js`: Transforms existing denormalized data
- `seedNormalizedData.js`: Seeds new entities with sample data
- `setupLocalDB.js`: Initial database setup

### Key Changes Made
1. **Removed embedded data** from meals (stock, discount, nutritional info, etc.)
2. **Created separate collections** for all complex data
3. **Added junction tables** for many-to-many relationships
4. **Implemented batch tracking** for inventory management
5. **Added meal planning** with staff assignment
6. **Enhanced user management** with attendance tracking

## 📊 Performance Benefits

### Query Optimization
- **Faster searches**: Indexed fields in separate collections
- **Reduced document size**: Smaller meal documents
- **Efficient joins**: Proper ObjectId references
- **Scalable queries**: Can handle thousands of meals

### Data Integrity
- **Consistent updates**: Single source of truth for each entity
- **Referential integrity**: Proper foreign key relationships
- **Validation**: Schema-level constraints and validation
- **Audit trail**: Timestamps on all entities

## 🎯 Business Impact

### Operational Efficiency
- **Reduced food waste**: Expiry tracking prevents spoilage
- **Better staff utilization**: Attendance and planning integration
- **Improved inventory management**: Batch-based tracking
- **Enhanced customer experience**: Flexible tagging and filtering

### Technical Advantages
- **Scalable architecture**: Can grow with business needs
- **Maintainable codebase**: Clear separation of concerns
- **Better performance**: Optimized queries and indexing
- **Future-proof design**: Easy to add new features

## 🔍 Testing & Validation

### API Endpoints
- **Normalized entities**: CRUD operations for all new collections
- **Stock management**: Batch operations and stock calculations
- **Meal planning**: Plan creation and resource validation
- **User management**: Authentication and role-based access

### Data Validation
- **Schema validation**: MongoDB schema constraints
- **Business logic**: Custom validation in controllers
- **Error handling**: Proper HTTP status codes and messages
- **Testing scripts**: Automated data validation

This normalized schema provides a solid foundation for a professional-grade kitchen management system that can scale with your business needs while maintaining excellent performance and data integrity. 
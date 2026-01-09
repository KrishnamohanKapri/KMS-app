/**
 * Unit Converter Utility for KMS
 * Handles packaging units, base units, and conversions
 */

class UnitConverter {
  /**
   * Convert packaging units to base units
   * @param {number} packageQuantity - Number of packages
   * @param {number} packagingQuantity - Base units per package
   * @returns {number} Total base units
   */
  static packagesToBaseUnits(packageQuantity, packagingQuantity) {
    return packageQuantity * packagingQuantity;
  }

  /**
   * Convert base units to packaging units
   * @param {number} baseUnits - Total base units needed
   * @param {number} packagingQuantity - Base units per package
   * @returns {number} Number of packages needed
   */
  static baseUnitsToPackages(baseUnits, packagingQuantity) {
    return Math.ceil(baseUnits / packagingQuantity);
  }

  /**
   * Calculate cost per base unit from package cost
   * @param {number} costPerPackage - Cost per package
   * @param {number} packagingQuantity - Base units per package
   * @returns {number} Cost per base unit
   */
  static getCostPerBaseUnit(costPerPackage, packagingQuantity) {
    return costPerPackage / packagingQuantity;
  }

  /**
   * Calculate total cost for a given quantity in base units
   * @param {number} baseUnits - Quantity in base units
   * @param {number} costPerPackage - Cost per package
   * @param {number} packagingQuantity - Base units per package
   * @returns {number} Total cost
   */
  static calculateTotalCost(baseUnits, costPerPackage, packagingQuantity) {
    const packagesNeeded = this.baseUnitsToPackages(baseUnits, packagingQuantity);
    return packagesNeeded * costPerPackage;
  }

  /**
   * Format quantity for display
   * @param {number} packageQuantity - Number of packages
   * @param {string} packagingUnit - Packaging unit (sack, bag, etc.)
   * @param {number} baseUnits - Total base units
   * @param {string} baseUnit - Base unit (kg, g, etc.)
   * @returns {string} Formatted display string
   */
  static formatQuantity(packageQuantity, packagingUnit, baseUnits, baseUnit) {
    return `${packageQuantity} ${packagingUnit} (${baseUnits} ${baseUnit})`;
  }

  /**
   * Check if stock is sufficient for required base units
   * @param {number} availablePackages - Available packages in stock
   * @param {number} packagingQuantity - Base units per package
   * @param {number} requiredBaseUnits - Required base units
   * @returns {object} Sufficiency check result
   */
  static checkStockSufficiency(availablePackages, packagingQuantity, requiredBaseUnits) {
    const availableBaseUnits = this.packagesToBaseUnits(availablePackages, packagingQuantity);
    const isSufficient = availableBaseUnits >= requiredBaseUnits;
    const shortfall = isSufficient ? 0 : requiredBaseUnits - availableBaseUnits;
    const packagesNeeded = this.baseUnitsToPackages(shortfall, packagingQuantity);

    return {
      isSufficient,
      availableBaseUnits,
      requiredBaseUnits,
      shortfall,
      packagesNeeded,
      availablePackages
    };
  }

  /**
   * Get common packaging units for different ingredient categories
   * @param {string} category - Ingredient category
   * @returns {Array} Array of common packaging units
   */
  static getCommonPackagingUnits(category) {
    const packagingUnits = {
      'grain': ['sack', 'bag', 'box', 'pack'],
      'vegetable': ['bag', 'box', 'bundle', 'pack'],
      'fruit': ['box', 'pack', 'bundle', 'piece'],
      'meat': ['pack', 'piece', 'kg'],
      'dairy': ['bottle', 'pack', 'piece', 'carton'],
      'spice': ['jar', 'pack', 'bottle', 'box'],
      'herb': ['bundle', 'pack', 'piece'],
      'other': ['piece', 'pack', 'box', 'bottle']
    };

    return packagingUnits[category] || ['piece'];
  }

  /**
   * Get common base units for different ingredient categories
   * @param {string} category - Ingredient category
   * @returns {Array} Array of common base units
   */
  static getCommonBaseUnits(category) {
    const baseUnits = {
      'grain': ['kg', 'g'],
      'vegetable': ['kg', 'g', 'piece'],
      'fruit': ['kg', 'g', 'piece'],
      'meat': ['kg', 'g'],
      'dairy': ['l', 'ml', 'piece'],
      'spice': ['g', 'tbsp', 'tsp'],
      'herb': ['g', 'bundle', 'piece'],
      'other': ['piece', 'g', 'ml']
    };

    return baseUnits[category] || ['g'];
  }

  /**
   * Validate unit combination
   * @param {string} packagingUnit - Packaging unit
   * @param {string} baseUnit - Base unit
   * @param {string} category - Ingredient category
   * @returns {boolean} Whether combination is valid
   */
  static validateUnitCombination(packagingUnit, baseUnit, category) {
    const validPackagingUnits = this.getCommonPackagingUnits(category);
    const validBaseUnits = this.getCommonBaseUnits(category);

    return validPackagingUnits.includes(packagingUnit) && validBaseUnits.includes(baseUnit);
  }
}

module.exports = UnitConverter; 
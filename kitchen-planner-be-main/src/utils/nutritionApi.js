const axios = require('axios');

const calculateNutriScore = nutritionalInfo => {
  // Nutri-Score calculation based on German standards
  let score = 0;

  // Negative points (0-10)
  const energy = nutritionalInfo.energy.value;
  const sugar = nutritionalInfo.sugar.value;
  const saturatedFat = nutritionalInfo.saturatedFat.value;
  const salt = nutritionalInfo.salt.value;

  // Energy points (0-10)
  if (energy <= 335) score -= 0;
  else if (energy <= 670) score -= 1;
  else if (energy <= 1005) score -= 2;
  else if (energy <= 1340) score -= 3;
  else if (energy <= 1675) score -= 4;
  else if (energy <= 2010) score -= 5;
  else if (energy <= 2345) score -= 6;
  else if (energy <= 2680) score -= 7;
  else if (energy <= 3015) score -= 8;
  else if (energy <= 3350) score -= 9;
  else score -= 10;

  // Sugar points (0-10)
  if (sugar <= 4.5) score -= 0;
  else if (sugar <= 9) score -= 1;
  else if (sugar <= 13.5) score -= 2;
  else if (sugar <= 18) score -= 3;
  else if (sugar <= 22.5) score -= 4;
  else if (sugar <= 27) score -= 5;
  else if (sugar <= 31) score -= 6;
  else if (sugar <= 36) score -= 7;
  else if (sugar <= 40) score -= 8;
  else if (sugar <= 45) score -= 9;
  else score -= 10;

  // Saturated fat points (0-10)
  if (saturatedFat <= 1) score -= 0;
  else if (saturatedFat <= 2) score -= 1;
  else if (saturatedFat <= 3) score -= 2;
  else if (saturatedFat <= 4) score -= 3;
  else if (saturatedFat <= 5) score -= 4;
  else if (saturatedFat <= 6) score -= 5;
  else if (saturatedFat <= 7) score -= 6;
  else if (saturatedFat <= 8) score -= 7;
  else if (saturatedFat <= 9) score -= 8;
  else if (saturatedFat <= 10) score -= 9;
  else score -= 10;

  // Salt points (0-10)
  if (salt <= 0.9) score -= 0;
  else if (salt <= 1.8) score -= 1;
  else if (salt <= 2.7) score -= 2;
  else if (salt <= 3.6) score -= 3;
  else if (salt <= 4.5) score -= 4;
  else if (salt <= 5.4) score -= 5;
  else if (salt <= 6.3) score -= 6;
  else if (salt <= 7.2) score -= 7;
  else if (salt <= 8.1) score -= 8;
  else if (salt <= 9) score -= 9;
  else score -= 10;

  // Positive points (0-5)
  const protein = nutritionalInfo.protein.value;
  const fiber = nutritionalInfo.fiber.value;

  // Protein points (0-5)
  if (protein >= 8) score += 5;
  else if (protein >= 6.4) score += 4;
  else if (protein >= 4.8) score += 3;
  else if (protein >= 3.2) score += 2;
  else if (protein >= 1.6) score += 1;

  // Fiber points (0-5)
  if (fiber >= 4.7) score += 5;
  else if (fiber >= 3.7) score += 4;
  else if (fiber >= 2.8) score += 3;
  else if (fiber >= 1.9) score += 2;
  else if (fiber >= 0.9) score += 1;

  // Convert score to Nutri-Score letter
  if (score <= -1) return 'A';
  else if (score <= 2) return 'B';
  else if (score <= 10) return 'C';
  else if (score <= 18) return 'D';
  else return 'E';
};

const searchProduct = async (query) => {
  try {
    console.log(`Searching OpenFoodFacts for: ${query}`);
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
      params: {
        search_terms: query,
        json: 1,
        page_size: 1
      }
    });
    console.log(`Found product:`, response.data.products[0]?.product_name);
    return response.data.products[0];
  } catch (error) {
    console.error('Error searching product:', error);
    return null;
  }
};

  const analyzeNutrition = async (ingredients) => {
    try {
      let totalNutritionalInfo = {
        energy: { value: 0, unit: 'kcal' },
        fat: { value: 0, unit: 'g' },
        saturatedFat: { value: 0, unit: 'g' },
        carbohydrates: { value: 0, unit: 'g' },
        sugar: { value: 0, unit: 'g' },
        protein: { value: 0, unit: 'g' },
        salt: { value: 0, unit: 'g' },
        fiber: { value: 0, unit: 'g' }
      };

      let allergens = new Set();
      let healthLabels = new Set();
      let nutriScores = []; // Collect Nutri-Scores from individual ingredients

      // Process each ingredient
      for (const ingredient of ingredients) {
        // Extract quantity and ingredient name
        const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tbsp|tsp)?\s+(.+)$/);
        if (!match) {
          console.log(`Skipping ingredient (no match): ${ingredient}`);
          continue;
        }

        const [, quantity, unit, name] = match;
        const searchQuery = name.trim();
        const product = await searchProduct(searchQuery);

        if (product) {
          // Convert quantity to grams/ml if needed
          let quantityInG = parseFloat(quantity);
          if (unit === 'tbsp') quantityInG *= 15;
          else if (unit === 'tsp') quantityInG *= 5;

          // Calculate proportion based on serving size (OpenFoodFacts data is per 100g)
          const proportion = quantityInG / 100;

          console.log(`Processing ${name} (${quantityInG}g)`);

          // Add nutritional values
          if (product.nutriments) {
            totalNutritionalInfo.energy.value += (product.nutriments['energy-kcal_100g'] || 0) * proportion;
            totalNutritionalInfo.fat.value += (product.nutriments.fat_100g || 0) * proportion;
            totalNutritionalInfo.saturatedFat.value += (product.nutriments['saturated-fat_100g'] || 0) * proportion;
            totalNutritionalInfo.carbohydrates.value += (product.nutriments.carbohydrates_100g || 0) * proportion;
            totalNutritionalInfo.sugar.value += (product.nutriments.sugars_100g || 0) * proportion;
            totalNutritionalInfo.protein.value += (product.nutriments.proteins_100g || 0) * proportion;
            totalNutritionalInfo.salt.value += (product.nutriments.salt_100g || 0) * proportion;
            totalNutritionalInfo.fiber.value += (product.nutriments.fiber_100g || 0) * proportion;

            console.log('score is:' + product.nutriments.score);
            console.log('nutri score is:' + product.nutriments.nutriScore);
            
            // Collect Nutri-Score if available
            if (product.nutriments.nutriScore && ['a', 'b', 'c', 'd', 'e'].includes(product.nutriments.nutriScore.toLowerCase())) {
              nutriScores.push({
                score: product.nutriments.nutriScore.toUpperCase(),
                proportion: proportion
              });
            }
          }

          // Add allergens
          if (product.allergens_tags) {
            product.allergens_tags.forEach(allergen =>
              allergens.add(allergen.replace('en:', '').toUpperCase())
            );
          }

          // Add labels
          if (product.labels_tags) {
            product.labels_tags.forEach(label => {
              if (label.includes('vegan')) healthLabels.add('vegan');
              if (label.includes('vegetarian')) healthLabels.add('vegetarian');
              if (label.includes('gluten_free')) healthLabels.add('gluten-free');
            });
          }
        } else {
          console.log(`No product found for: ${searchQuery}`);
        }
      }

      // Round all values to 2 decimal places
      Object.keys(totalNutritionalInfo).forEach(key => {
        totalNutritionalInfo[key].value = Math.round(totalNutritionalInfo[key].value * 100) / 100;
      });

      console.log('Final nutritional info:', totalNutritionalInfo);

      // Determine Nutri-Score: use OpenFoodFacts data if available, otherwise calculate
      let nutriScore;
      if (nutriScores.length > 0) {
        // Use weighted average of Nutri-Scores from ingredients
        const scoreWeights = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
        let totalWeight = 0;
        let weightedSum = 0;
        
        nutriScores.forEach(({ score, proportion }) => {
          totalWeight += proportion;
          weightedSum += scoreWeights[score] * proportion;
        });
        
        const averageScore = weightedSum / totalWeight;
        
        // Convert back to letter grade
        if (averageScore <= 1.5) nutriScore = 'A';
        else if (averageScore <= 2.5) nutriScore = 'B';
        else if (averageScore <= 3.5) nutriScore = 'C';
        else if (averageScore <= 4.5) nutriScore = 'D';
        else nutriScore = 'E';
        
        console.log(`Using weighted Nutri-Score from OpenFoodFacts: ${nutriScore}`);
      } else {
        // Fallback to manual calculation
        nutriScore = calculateNutriScore(totalNutritionalInfo);
        console.log(`Using calculated Nutri-Score: ${nutriScore}`);
      }

      return {
        nutritionalInfo: totalNutritionalInfo,
        nutriScore,
        healthLabels: Array.from(healthLabels),
        allergens: Array.from(allergens)
      };
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      throw new Error('Failed to analyze nutrition data');
    }
  };

module.exports = {
  analyzeNutrition,
  calculateNutriScore
}; 
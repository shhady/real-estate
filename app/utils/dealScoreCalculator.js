import Property from '../models/Property';

/**
 * Calculate deal scores for all properties in a specific city
 * Deal score is calculated as: (city_avg_price_per_m - property_price_per_m) / city_avg_price_per_m * 100
 * Score > 0 means below market price (good deal)
 * Score <= 0 means at or above market price (no badge shown)
 */
export async function calculateDealScoresForCity(city) {
  try {
    console.log(`🏘️ Calculating deal scores for city: ${city}`);
    
    // Get all properties in the city with valid price and area
    const properties = await Property.find({
      location: { $regex: new RegExp(city, 'i') }, // Case insensitive search
      price: { $gt: 0 },
      area: { $gt: 0 }
    }).select('_id title price area location dealScore');

    if (properties.length === 0) {
      console.log(`❌ No properties found for city: ${city}`);
      return { success: false, message: 'No properties found for this city' };
    }

    console.log(`📊 Found ${properties.length} properties in ${city}`);

    // Calculate price per meter for each property
    const propertiesWithPricePerM = properties.map(property => ({
      ...property.toObject(),
      pricePerMeter: property.price / property.area
    }));

    // Calculate city average price per meter
    const totalPricePerM = propertiesWithPricePerM.reduce((sum, prop) => sum + prop.pricePerMeter, 0);
    const cityAvgPricePerM = totalPricePerM / propertiesWithPricePerM.length;

    console.log(`💰 City average price per meter: ₪${cityAvgPricePerM.toFixed(2)}`);

    // Calculate deal scores and update properties
    const updatePromises = propertiesWithPricePerM.map(property => {
      // Deal score: how much below market price (in percentage)
      const dealScore = Math.round(((cityAvgPricePerM - property.pricePerMeter) / cityAvgPricePerM) * 100);
      
      // Only store positive scores (below market price)
      const finalScore = dealScore > 0 ? Math.min(dealScore, 100) : 0;

      console.log(`🏠 ${property.title}: ₪${property.pricePerMeter.toFixed(2)}/m² → Deal Score: ${finalScore}%`);

      return Property.findByIdAndUpdate(
        property._id,
        {
          dealScore: finalScore,
          dealScoreCalculatedAt: new Date()
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    const goodDeals = propertiesWithPricePerM.filter(p => {
      const score = Math.round(((cityAvgPricePerM - p.pricePerMeter) / cityAvgPricePerM) * 100);
      return score > 0;
    }).length;

    console.log(`✅ Updated ${properties.length} properties. ${goodDeals} properties are below market price.`);

    return {
      success: true,
      city,
      propertiesUpdated: properties.length,
      goodDeals,
      cityAvgPricePerM: cityAvgPricePerM.toFixed(2)
    };

  } catch (error) {
    console.error('❌ Error calculating deal scores:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate deal scores for all cities
 */
export async function calculateDealScoresForAllCities() {
  try {
    console.log('🌍 Starting deal score calculation for all cities...');

    // Get all unique cities
    const cities = await Property.distinct('location', {
      price: { $gt: 0 },
      area: { $gt: 0 }
    });

    console.log(`📍 Found ${cities.length} cities with properties`);

    const results = [];
    
    for (const city of cities) {
      const result = await calculateDealScoresForCity(city);
      results.push(result);
    }

    const successfulUpdates = results.filter(r => r.success).length;
    const totalGoodDeals = results.reduce((sum, r) => sum + (r.goodDeals || 0), 0);

    console.log(`🎉 Completed deal score calculation for ${successfulUpdates}/${cities.length} cities`);
    console.log(`🏆 Total properties below market price: ${totalGoodDeals}`);

    return {
      success: true,
      citiesProcessed: successfulUpdates,
      totalCities: cities.length,
      totalGoodDeals,
      results
    };

  } catch (error) {
    console.error('❌ Error calculating deal scores for all cities:', error);
    return { success: false, error: error.message };
  }
}

// Client-side utilities have been moved to dealScoreUtils.js
// This file now contains only server-side functions that use the Property model 
import { NextResponse } from 'next/server';
import { calculateDealScoresForCity, calculateDealScoresForAllCities } from '../../utils/dealScoreCalculator';
import connectDB from '../../lib/mongodb';

export async function POST(request) {
  try {
    await connectDB();
    
    const { city } = await request.json();

    console.log('🎯 Deal score calculation requested');

    let result;
    
    if (city) {
      // Calculate for specific city
      console.log(`📍 Calculating deal scores for city: ${city}`);
      result = await calculateDealScoresForCity(city);
    } else {
      // Calculate for all cities
      console.log('🌍 Calculating deal scores for all cities');
      result = await calculateDealScoresForAllCities();
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: city 
          ? `Deal scores updated for ${city}`
          : 'Deal scores updated for all cities',
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in deal scores API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
      await connectDB();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const city = searchParams.get('city');

    if (action === 'calculate') {
      console.log('🎯 Deal score calculation requested via GET');
      
      let result;
      
      if (city) {
        console.log(`📍 Calculating deal scores for city: ${city}`);
        result = await calculateDealScoresForCity(city);
      } else {
        console.log('🌍 Calculating deal scores for all cities');
        result = await calculateDealScoresForAllCities();
      }

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? (city ? `Deal scores updated for ${city}` : 'Deal scores updated for all cities')
          : result.error || result.message,
        data: result
      });
    }

    // Default: return info about the endpoint
    return NextResponse.json({
      message: 'Deal Scores API',
      endpoints: {
        'POST /api/deal-scores': 'Calculate deal scores. Body: { city?: string }',
        'GET /api/deal-scores?action=calculate&city=<city>': 'Calculate deal scores for specific city',
        'GET /api/deal-scores?action=calculate': 'Calculate deal scores for all cities'
      }
    });

  } catch (error) {
    console.error('❌ Error in deal scores API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 
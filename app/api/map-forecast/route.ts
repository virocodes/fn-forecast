import { NextResponse } from 'next/server';

// Simple linear regression function
function linearRegression(x: number[], y: number[]) {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Calculate weekly seasonality from historical data
function calculateSeasonality(dayOfWeekArr: number[], values: number[]) {
  const weeklyPattern = new Array(7).fill(0);
  const weeklyCount = new Array(7).fill(0);

  dayOfWeekArr.forEach((dayOfWeek, i) => {
    weeklyPattern[dayOfWeek] += values[i];
    weeklyCount[dayOfWeek]++;
  });

  // Calculate average for each day of week
  const avgPattern = weeklyPattern.map((sum, i) => 
    weeklyCount[i] > 0 ? sum / weeklyCount[i] : 0
  );

  // Calculate overall average
  const overallAvg = avgPattern.reduce((a, b) => a + b, 0) / 7;

  // Convert to multipliers (1.0 means no change from average)
  return avgPattern.map(avg => avg / overallAvg);
}

// Add controlled randomness
function addRandomVariation(value: number, maxVariationPercent: number = 15) {
  const variation = (Math.random() * 2 - 1) * (maxVariationPercent / 100);
  return Math.max(0, Math.round(value * (1 + variation)));
}

// Function to predict future values
function predictFutureValues(
  slope: number, 
  intercept: number, 
  lastX: number, 
  days: number,
  seasonality: number[],
  lastDate: Date
) {
  const predictions = [];
  for (let i = 1; i <= days; i++) {
    const x = lastX + i;
    const baseValue = Math.max(0, Math.round(slope * x + intercept));
    
    // Get day of week (0-6)
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // Apply seasonality
    const seasonalValue = baseValue * seasonality[dayOfWeek];
    
    // Add controlled randomness
    const finalValue = addRandomVariation(seasonalValue);
    
    predictions.push(finalValue);
  }
  return predictions;
}

export async function POST(request: Request) {
  try {
    // Get the historical data from the request body
    const historicalData = await request.json();
    console.log('Received historical data:', historicalData);

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length < 2) {
      return NextResponse.json(
        { error: 'Insufficient historical data for forecasting' },
        { status: 400 }
      );
    }

    // Extract values
    const values = historicalData.map((row: string[]) => parseInt(row[1].replace(/,/g, '')));
    const xValues = values.map((_, i) => i); // 0, 1, 2, ..., N-1

    // Calculate linear regression
    const { slope, intercept } = linearRegression(xValues, values);

    // Calculate weekly seasonality using index as day of week
    const seasonality = calculateSeasonality(xValues.map(i => i % 7), values);
    console.log('Calculated seasonality:', seasonality);

    // Use today as the last date
    const lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);
    const lastX = xValues[xValues.length - 1];

    // Predict next 30 days
    const predictions = predictFutureValues(slope, intercept, lastX, 30, seasonality, lastDate);

    // Format the forecast data
    const forecastData = predictions.map((value, index) => {
      const date = new Date(lastDate);
      date.setDate(lastDate.getDate() + index + 1);
      return [
        date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        }),
        value.toLocaleString()
      ];
    });

    console.log('Generated forecast data:', forecastData);
    return NextResponse.json({ data: forecastData });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
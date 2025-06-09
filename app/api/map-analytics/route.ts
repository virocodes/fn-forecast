import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the map code from the request body
    const mapCode = await request.text();
    console.log(`Received map code: ${mapCode}`);

    if (!mapCode) {
      return NextResponse.json(
        { error: 'Map code is required' },
        { status: 400 }
      );
    }

    // Call the local endpoint with just the map code
    console.log(`Calling local endpoint for map code: ${mapCode}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scrape/${mapCode}`);
    const data = await response.json();
    
    console.log('Response from local endpoint:', data);
    
    if (data.data) {
      // Filter out entries without dates
      const filteredData = data.data.filter((row: string[]) => row[0] && row[0].trim() !== '');
      return NextResponse.json({ data: filteredData });
    } else {
      return NextResponse.json(
        { error: 'Failed to get data from local endpoint' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
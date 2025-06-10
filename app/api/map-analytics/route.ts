import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function scrapeHead(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const head = dom.window.document.head;

  // Find all <link rel="preload"> tags
  const preloadLinks = [...head.querySelectorAll('link[rel="preload"]')];

  // Try to extract ID from any link href containing 'player-count-graph'
  let id = null;
  for (const link of preloadLinks) {
    const href = link.getAttribute('href');
    if (href && href.includes('player-count-graph')) {
      const urlObj = new URL(href, url); // resolve relative URL
      id = urlObj.searchParams.get('id');
      break; // stop after first match
    }
  }

  return { id };
}

export async function POST(request: Request) {
  try {
    const mapCode = await request.text();
    const url = `https://fortnite.gg/island?code=${mapCode}`;
    const { id } = await scrapeHead(url);
    console.log(id);

    const response = await fetch(`https://fortnite.gg/player-count-graph?range=1m&id=${id}`);
    const data = await response.json() as { data: { values: number[] } };
    console.log(data);

    const values = data.data.values

    // Group values into days and get peak per day
    function getDailyPeaks(values: number[]) {
      const result = [];
      const now = new Date(); // current date and time
      const totalHours = values.length;
      const totalDays = Math.ceil(totalHours / 24);

      for (let day = 0; day < totalDays; day++) {
        // Calculate the index range for this day
        const endIdx = values.length - (day * 24);
        const startIdx = Math.max(0, endIdx - 24);
        const dayValues = values.slice(startIdx, endIdx);

        // Find the peak for this day
        const peak = Math.max(...dayValues);

        // Calculate the date for this day (subtracting 'day' days from now)
        const date = new Date(now);
        date.setHours(0, 0, 0, 0); // set to midnight
        date.setDate(date.getDate() - day);

        // Format date as 'Sunday, Jun 8'
        const dateStr = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });

        result.unshift({ date: dateStr, peak }); // unshift to keep chronological order
      }

      return result;
    }

    const dailyPeaks = getDailyPeaks(values);

    return NextResponse.json({ values, dailyPeaks });
  } catch (error) {
    console.error('Error:', error);
  }
}
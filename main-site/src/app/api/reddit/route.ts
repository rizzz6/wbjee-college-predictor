
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://www.reddit.com/r/wbjee/about.json", {
      headers: {
        'User-Agent': 'wbjee-college-predictor/1.0 by /u/rizzz6'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Reddit API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Reddit subreddit data:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

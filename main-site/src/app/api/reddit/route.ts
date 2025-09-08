
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://www.reddit.com/r/wbjee/about.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Reddit subreddit data:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://www.reddit.com/r/wbjee/about.json", {
      headers: {
        "User-Agent": "wbjee-college-predictor-web:v1.0 (by /u/rizzz6)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Reddit API route:", error);
    return NextResponse.json(
      { error: "Error fetching data from Reddit." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get("https://old.reddit.com/r/wbjee/about.json", {
      headers: {
        "User-Agent": "wbjee-college-predictor-web:v1.0 (by /u/rizzz6)",
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error in Reddit API route (axios):", error.response?.data || error.message);
      return NextResponse.json(
        { error: `Failed to fetch from Reddit: ${error.response?.statusText || error.message}` },
        { status: error.response?.status || 500 }
      );
    }
    console.error("Error in Reddit API route:", error);
    return NextResponse.json(
      { error: "An unknown error occurred while fetching from Reddit." },
      { status: 500 }
    );
  }
}

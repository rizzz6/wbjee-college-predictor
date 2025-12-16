import { NextResponse } from 'next/server';

export async function GET() {
  const fallbackData = {
    name: 'wbjee',
    icon_img: 'https://styles.redditmedia.com/t5_910ggt/styles/communityIcon_2hpHGZf1d9R8e5R3cG5W5.png?width=256',
    display_name_prefixed: 'r/wbjee',
    subscribers: 1500,
    public_description: 'Join the discussion about WBJEE, college predictions, and engineering admissions in West Bengal!',
    banner_background_image: 'https://styles.redditmedia.com/t5_910ggt/styles/bannerBackgroundImage_87tgbzaljjxe1.png?width=4000',
    display_name: 'wbjee'
  };

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwqQ3kiymWa7tsFye46OG-3P-GaLufOgW6XFV-9ZdlmNQg6YszHqh47NLvCYsb2SJ0/exec", {
      // Handle redirects from the Google Apps Script
      redirect: 'follow',
    });
    
    // Get the raw text of the response to inspect it.
    const responseText = await response.text();
    console.log("Raw response from Google Apps Script:", responseText);

    let responseData;
    try {
      // Parse the response text as JSON
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Failed to parse response as JSON:", jsonError);
      // If parsing fails, throw an error to be caught by the outer catch block.
      throw new Error("Invalid JSON response from the server.");
    }

    // Handle API response structure: {success: true, data: {...}}
    const data = responseData.success ? responseData.data : responseData;

    // Clean URLs by removing query parameters and provide fallbacks
    const cleanedData = {
      ...fallbackData,
      ...data,
      // Handle different possible property names from the API
      icon_img: (data.icon_img || data.community_icon) ? (data.icon_img || data.community_icon).split('?')[0] : fallbackData.icon_img.split('?')[0],
      banner_background_image: data.banner_background_image ? data.banner_background_image.split('?')[0] : fallbackData.banner_background_image.split('?')[0],
      // Map common Reddit API response properties to expected names
      subscribers: data.subscribers || data.accounts_active || fallbackData.subscribers,
      public_description: data.public_description || data.description || data.title || fallbackData.public_description,
      display_name_prefixed: data.display_name_prefixed || `r/${data.display_name || data.name || 'wbjee'}`,
      display_name: data.display_name || data.name || 'wbjee',
      name: data.name || 'wbjee'
    };
    
    console.log("Processed subreddit data:", cleanedData);
    return NextResponse.json(cleanedData);
  } catch (error) {
    // This will catch network errors, JSON parsing errors, or any other exceptions.
    console.error("Final error in subreddit API route:", error);
    
    // In case of any error, return the predefined fallback data
    console.log("Returning fallback data due to error:", fallbackData);
    return NextResponse.json(fallbackData);
  }
}
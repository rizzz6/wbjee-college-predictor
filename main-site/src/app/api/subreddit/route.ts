import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the working Google Apps Script URL
    const response = await fetch("https://script.google.com/macros/s/AKfycbwhH3C47_fe2kJqyrhDBNHCPtPDTI-wCFZEFmo88yjyaAGGHS4ojwmn8JztS3NHB4Q/exec");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const jsonData = await response.text();
    
    // Handle the response that comes back as JSONP callback format
    // Extract just the JSON part (remove callback function wrapper)
    const jsonMatch = jsonData.match(/^\w+\((.*)\);?$/);
    if (!jsonMatch) {
      throw new Error('Invalid JSONP response format');
    }
    
    const parsedData = JSON.parse(jsonMatch[1]);
    
    // Check if the response is valid like in the working implementation
    if (!parsedData || !parsedData.success || !parsedData.data) {
      let errorMsg = parsedData.error || 'Invalid data structure from API.';
      if (parsedData.error && parsedData.error.includes("No data found")) {
        errorMsg = "The script's 'safe deposit box' is empty. Please run the 'fetchAndStoreRedditData' function in the Google Apps Script editor one time to fill it.";
      }
      throw new Error(errorMsg);
    }
    
    const data = parsedData.data;
    
    // Get the banner URL (prefer banner, fallback to mobile banner) like working implementation
    const bannerUrl = data.banner_background_image || data.mobile_banner_image || '';
    
    // Clean the banner URL (remove query string)
    const cleanedBannerUrl = bannerUrl.split('?')[0];
    
    // Set icon - handle both icon_img and community_icon like working code
    const iconUrl = data.icon_img || data.community_icon || '';
    const cleanedIconUrl = iconUrl ? iconUrl.split('?')[0] : '';
    
    // Extract only the required fields and clean URLs, matching working implementation
    const cleanedData = {
      name: data.name || 'wbjee',
      icon_img: cleanedIconUrl,
      display_name_prefixed: data.display_name_prefixed || 'r/wbjee',
      subscribers: data.subscribers || 0,
      public_description: data.public_description || 'No description provided.',
      banner_background_image: cleanedBannerUrl,
      active_user_count: data.active_user_count || 0,
      display_name: data.display_name || 'wbjee'
    };
    
    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error("Error fetching subreddit data:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch subreddit data",
        fallback: {
          name: 'wbjee',
          icon_img: '',
          display_name_prefixed: 'r/wbjee',
          subscribers: 0,
          public_description: 'Join the discussion!',
          banner_background_image: '',
          active_user_count: 0,
          display_name: 'wbjee'
        }
      },
      { status: 500 }
    );
  }
}
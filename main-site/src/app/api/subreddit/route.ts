import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try the original Google Apps Script URL from the task
    const response = await fetch("https://script.google.com/macros/s/AKfycbwlZtHuGLeBBxvln-R2Aial341TOLosPmpDyhgFwqZDOeuqHLduWAn4Oti19w1mlCE/exec");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clean URLs by removing query parameters
    const cleanedData = {
      name: data.name || 'wbjee',
      icon_img: data.icon_img ? data.icon_img.split('?')[0] : '',
      display_name_prefixed: data.display_name_prefixed || 'r/wbjee',
      subscribers: data.subscribers || 0,
      public_description: data.public_description || 'Join the discussion!',
      banner_background_image: data.banner_background_image ? data.banner_background_image.split('?')[0] : '',
      active_user_count: data.active_user_count || 0,
      display_name: data.display_name || 'wbjee'
    };
    
    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error("Error fetching subreddit data:", error);
    
    // Return fallback data instead of error
    return NextResponse.json({
      name: 'wbjee',
      icon_img: '',
      display_name_prefixed: 'r/wbjee',
      subscribers: 0,
      public_description: 'Join the discussion!',
      banner_background_image: '',
      active_user_count: 0,
      display_name: 'wbjee'
    });
  }
}
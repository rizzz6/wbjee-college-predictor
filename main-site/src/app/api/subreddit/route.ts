import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwhH3C47_fe2kJqyrhDBNHCPtPDTI-wCFZEFmo88yjyaAGGHS4ojwmn8JztS3NHB4Q/exec");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract only the required fields and clean URLs
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
    return NextResponse.json(
      { 
        error: "Failed to fetch subreddit data",
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
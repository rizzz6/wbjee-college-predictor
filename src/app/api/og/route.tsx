import { ImageResponse } from 'next/og';
/* oxlint-disable @next/next/no-img-element */
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Params extraction
    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || 'rwbjee.com';
    const image = searchParams.get('image');
    const meta = searchParams.get('meta'); // e.g. "5 min read" or "Engineering"
    const location = searchParams.get('location'); // for colleges

    // Common Styles
    const brandColor = '#dc2626'; // Red-600

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // slate-900
            color: 'white',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Grid Pattern Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* LAYOUT: BLOG POST */}
          {type === 'post' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                padding: '80px',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {image && (
                <img
                  src={image}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.4,
                    maskImage: 'linear-gradient(to left, black, transparent)',
                  }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', width: '60%', zIndex: 10 }}>
                <div style={{ color: brandColor, fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '0.1em' }}>
                  BLOG POST
                </div>
                <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {title}
                </div>
                {meta && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', color: '#94a3b8' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: brandColor }} />
                    {meta}
                  </div>
                )}
              </div>
              
              {/* Logo Bottom Left */}
              <div style={{ position: 'absolute', bottom: '60px', left: '80px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>rwbjee<span style={{ color: brandColor }}>.com</span></div>
              </div>
            </div>
          )}

          {/* LAYOUT: COLLEGE PROFILE */}
          {type === 'college' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                padding: '60px',
                border: `24px solid ${brandColor}`,
                position: 'relative',
              }}
            >
              {/* Background accent */}
              <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', backgroundColor: '#fef2f2', borderRadius: '50%', zIndex: 0 }} />
              
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ backgroundColor: brandColor, color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', width: 'fit-content' }}>
                    OFFICIAL COLLEGE PROFILE
                  </div>
                </div>
                {image && (
                  <div style={{ width: '140px', height: '140px', backgroundColor: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                    <img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', zIndex: 10 }}>
                <div style={{ fontSize: '84px', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: '20px' }}>
                  {title}
                </div>
                {location && (
                  <div style={{ fontSize: '36px', color: '#64748b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    📍 {location}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', zIndex: 10 }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>
                  rwbjee<span style={{ color: brandColor }}>.com</span>
                </div>
                <div style={{ fontSize: '24px', color: '#94a3b8', fontWeight: 'medium' }}>
                  Engineering Admissions 2026
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK/DEFAULT */}
          {type === 'default' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>rwbjee<span style={{ color: brandColor }}>.com</span></div>
               <div style={{ fontSize: '32px', color: '#94a3b8' }}>WBJEE 2026 Prep & Predictor</div>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : 'Unknown error');
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06080d 0%, #0f1420 40%, #1a1040 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            L
          </div>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#e8ecf4',
              letterSpacing: '-1px',
            }}
          >
            Linked
            <span style={{ color: '#818cf8' }}>Genie</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#8694ad',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: 1.4,
          }}
        >
          AI-Powered LinkedIn Content Suite
        </div>

        {/* Features row */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '40px',
          }}
        >
          {['Posts', 'Profile', 'Messages', 'Replies'].map((item) => (
            <div
              key={item}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '16px',
            color: '#5a6a84',
          }}
        >
          linkedgenie.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

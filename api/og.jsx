import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  const chipStyle = {
    padding: '10px 24px',
    borderRadius: '10px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8',
    fontSize: '18px',
    fontWeight: 600,
  };

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
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            L
          </div>
          <div style={{ fontSize: '46px', fontWeight: 700, color: '#e8ecf4', display: 'flex' }}>
            <span>Linked</span>
            <span style={{ color: '#818cf8' }}>Genie</span>
          </div>
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#8694ad',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          AI-Powered LinkedIn Content Suite
        </div>

        <div style={{ display: 'flex', gap: '24px', marginTop: '40px' }}>
          <div style={chipStyle}>Posts</div>
          <div style={chipStyle}>Profile</div>
          <div style={chipStyle}>Messages</div>
          <div style={chipStyle}>Replies</div>
        </div>

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
    { width: 1200, height: 630 }
  );
}

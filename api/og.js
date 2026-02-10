import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

function e(type, props, ...children) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export default function handler() {
  const chip = (icon, text) => e('div', {
    style: {
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 28px', borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.08))',
      border: '1.5px solid rgba(99,102,241,0.3)',
      color: '#a5b4fc', fontSize: '22px', fontWeight: 600,
      boxShadow: '0 4px 12px rgba(99,102,241,0.1)'
    }
  }, icon, text);

  return new ImageResponse(
    e('div', {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        background: 'linear-gradient(145deg, #06080d 0%, #0c1221 30%, #151332 60%, #1a1040 100%)',
        fontFamily: 'sans-serif', overflow: 'hidden'
      }
    },
      // Background glow effects
      e('div', {
        style: {
          position: 'absolute', top: '-120px', right: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          display: 'flex'
        }
      }),
      e('div', {
        style: {
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)',
          display: 'flex'
        }
      }),

      // Logo icon
      e('div', {
        style: {
          width: '80px', height: '80px', borderRadius: '22px',
          background: 'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '44px', color: '#fff', fontWeight: 800,
          boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)',
          marginBottom: '28px'
        }
      }, 'L'),

      // Brand name
      e('div', {
        style: {
          display: 'flex', alignItems: 'baseline', gap: '4px',
          marginBottom: '16px'
        }
      },
        e('span', {
          style: { fontSize: '64px', fontWeight: 700, color: '#e8ecf4', letterSpacing: '-1px' }
        }, 'Linked'),
        e('span', {
          style: { fontSize: '64px', fontWeight: 700, color: '#818cf8', letterSpacing: '-1px' }
        }, 'Genie')
      ),

      // Tagline
      e('div', {
        style: {
          fontSize: '26px', color: '#8694ad', textAlign: 'center',
          marginBottom: '48px', fontWeight: 400, letterSpacing: '0.5px'
        }
      }, 'AI-Powered LinkedIn Content Suite'),

      // Feature chips
      e('div', {
        style: { display: 'flex', gap: '20px' }
      },
        chip('\u270D\uFE0F', 'Posts'),
        chip('\uD83D\uDC64', 'Profile'),
        chip('\u2709\uFE0F', 'Messages'),
        chip('\uD83D\uDCAC', 'Replies')
      ),

      // Bottom bar
      e('div', {
        style: {
          position: 'absolute', bottom: '0', left: '0', right: '0',
          height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(to top, rgba(6,8,13,0.9), transparent)',
          fontSize: '18px', color: '#5a6a84', fontWeight: 500, letterSpacing: '1px'
        }
      }, 'linkedgenie.co')
    ),
    { width: 1200, height: 630 }
  );
}

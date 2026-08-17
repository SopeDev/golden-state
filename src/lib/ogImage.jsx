import { ImageResponse } from 'next/og'

export const ogImageAlt = 'Golden State Capital Management'
export const ogImageSize = { width: 1200, height: 630 }
export const ogImageContentType = 'image/png'

export const createOgImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0d2642',
          padding: '72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#ac8b49',
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          Golden State Capital Management
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920 }}>
          <div
            style={{
              color: 'white',
              fontSize: 58,
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            Premium California real estate investment
          </div>
          <div
            style={{
              marginTop: 24,
              color: 'rgba(255,255,255,0.72)',
              fontSize: 26,
            }}
          >
            Accredited investors · California and Mexico
          </div>
        </div>
      </div>
    ),
    { ...ogImageSize }
  )

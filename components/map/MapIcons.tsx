import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// ── Star polygon points ────────────────────────────────────────────────────
// 5-pointed star centred at (8,8) in a 16×16 viewBox.
// Outer radius = 7, inner radius = 2.8 (≈ R × 0.4).
const STAR_POINTS =
  '8,1 9.65,5.73 14.66,5.84 10.66,8.87 12.11,13.66 8,10.8 3.89,13.66 5.34,8.87 1.34,5.84 6.36,5.73'

// ── DiamondIcon ────────────────────────────────────────────────────────────

export interface DiamondIconProps {
  bg?: string
  label?: string
}

/**
 * Diamond-shaped marker used for regular landmarks.
 */
export function DiamondIcon({ bg = '#4a90d9', label }: DiamondIconProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: 14,
          height: 14,
          background: bg,
          border: '2px solid #fff',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 4px #000',
        }}
      />
      {label && (
        <span
          style={{
            marginTop: 6,
            whiteSpace: 'nowrap',
            color: '#fff',
            fontSize: 12,
            textShadow: '1px 1px 2px #000',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export interface StarIconProps {
  color?: string
  label?: string
}

export function StarIcon({ color = '#FFD700', label }: StarIconProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={28}
        height={28}
        viewBox="0 0 16 16"
        style={{ filter: 'drop-shadow(0 0 4px #000)' }}
      >
        <polygon
          points={STAR_POINTS}
          fill={color}
          stroke="#fff"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span
          style={{
            marginTop: 6,
            whiteSpace: 'nowrap',
            color: '#fff',
            fontSize: 12,
            textShadow: '1px 1px 2px #000',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

// ── Leaflet icon factories ──────────────────────────────────────────────────

/**
 * Creates a Leaflet divIcon from a DiamondIcon.
 */
export function createDiamondIcon(bg?: string, label?: string): L.DivIcon {
  const html = renderToStaticMarkup(<DiamondIcon bg={bg} label={label} />)
  return L.divIcon({
    className: '',
    html,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

/**
 * Creates a Leaflet divIcon from a StarIcon.
 */
export function createStarIcon(color?: string, label?: string): L.DivIcon {
  const html = renderToStaticMarkup(<StarIcon color={color} label={label} />)
  return L.divIcon({
    className: '',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

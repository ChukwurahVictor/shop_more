import type { FC, CSSProperties } from 'react';
import type { BadgeTier } from '../types';

interface BadgeDisplayProps {
  badgeName: BadgeTier | null;
}

const BADGE_COLORS: Record<BadgeTier, string> = {
  Bronze: '#cd7f32',
  Silver: '#a8a9ad',
  Gold: '#FFD700',
  Platinum: '#6a0dad',
};

const BadgeDisplay: FC<BadgeDisplayProps> = ({ badgeName }) => {
  if (!badgeName) {
    return (
      <div style={styles.wrapper} aria-label="No badge earned yet">
        <div style={styles.circle}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="#f5f5f5" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e0dfdf" strokeWidth="8" />
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fontSize="36"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="#c5c5c5"
            >
              ?
            </text>
          </svg>
        </div>
        <p style={{ ...styles.label, color: '#c5c5c5' }}>No badge yet</p>
      </div>
    );
  }

  const color = BADGE_COLORS[badgeName];
  const isPlatinum = badgeName === 'Platinum';

  return (
    <div style={styles.wrapper} aria-label={`Current badge: ${badgeName}`}>
      <style>{`
        @keyframes badgeEnter {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes shimmer {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -314; }
        }
        .badge-circle {
          animation: badgeEnter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .badge-ring-shimmer {
          stroke-dasharray: 12 4;
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      <div className="badge-circle" style={styles.circle}>
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#ffffff" />

          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            opacity={isPlatinum ? 0.35 : 1}
          />

          {isPlatinum && (
            <circle
              className="badge-ring-shimmer"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}

          <text
            x="60"
            y="68"
            textAnchor="middle"
            fontSize="36"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill={color}
          >
            {badgeName[0]}
          </text>
        </svg>
      </div>

      <p style={styles.label}>{badgeName}</p>
    </div>
  );
};

export default BadgeDisplay;

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '0.5px',
  },
};

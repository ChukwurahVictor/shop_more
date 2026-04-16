import type { FC, CSSProperties } from 'react';
import type { BadgeTier } from '../types';

interface BadgeEntry {
  name: BadgeTier;
  color: string;
}

interface BadgeJourneyProps {
  currentBadge: BadgeTier | null;
}

const BADGES: BadgeEntry[] = [
  { name: 'Bronze',   color: '#cd7f32' },
  { name: 'Silver',   color: '#a8a9ad' },
  { name: 'Gold',     color: '#FFD700' },
  { name: 'Platinum', color: '#6a0dad' },
];

const BadgeJourney: FC<BadgeJourneyProps> = ({ currentBadge }) => {
  const currentIndex = BADGES.findIndex((b) => b.name === currentBadge);

  return (
    <section aria-label="Badge journey" style={styles.wrapper}>
      <div style={styles.row}>
        {BADGES.map((badge, index) => {
          const isReached = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === BADGES.length - 1;
          const nextBadge = BADGES[index + 1];

          const nodeStyle: CSSProperties = {
            ...styles.node,
            ...(isReached
              ? { background: badge.color, borderColor: badge.color }
              : styles.nodeUnreached),
            ...(isCurrent ? styles.nodeCurrent : {}),
          };

          return (
            <div key={badge.name} style={styles.stepGroup}>
              <div
                style={nodeStyle}
                aria-current={isCurrent ? 'step' : undefined}
                title={badge.name}
              >
                {isCurrent && <span style={{ ...styles.dot, background: '#fff' }} />}
              </div>

              <span
                style={{
                  ...styles.label,
                  color: isReached ? badge.color : '#c5c5c5',
                  fontWeight: isCurrent ? '700' : '500',
                }}
              >
                {badge.name}
              </span>

              {!isLast && nextBadge && (
                <div
                  style={{
                    ...styles.connector,
                    background: index < currentIndex ? nextBadge.color : '#e0dfdf',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BadgeJourney;

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
  },
  stepGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  node: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 200ms ease, border-color 200ms ease',
    zIndex: 1,
    position: 'relative',
  },
  nodeUnreached: {
    background: '#f1f0f0',
    borderColor: '#d5d4d4',
  },
  nodeCurrent: {
    boxShadow: '0 0 0 4px rgba(29,158,117,0.15)',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  label: {
    marginTop: '8px',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    width: '56px',
  },
  connector: {
    position: 'absolute',
    top: '16px',
    left: '32px',
    width: '56px',
    height: '3px',
    zIndex: 0,
    transition: 'background 200ms ease',
  },
};

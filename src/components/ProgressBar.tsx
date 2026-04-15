import { useState, useEffect, type FC, type CSSProperties } from 'react';
import type { BadgeTier } from '../types';

interface ProgressBarProps {
  current: number;
  remaining: number;
  nextBadge: BadgeTier | null;
  currentBadge: BadgeTier | null;
}

const ProgressBar: FC<ProgressBarProps> = ({ current, remaining, nextBadge, currentBadge }) => {
  const isPlatinum = currentBadge === 'Platinum';
  const isNewUser = currentBadge === null && nextBadge === null;
  const total = current + remaining;
  const percent = isPlatinum ? 100 : total > 0 ? Math.min((current / total) * 100, 100) : 0;

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWidth(percent));
    });
    return () => cancelAnimationFrame(id);
  }, [percent]);

  if (isPlatinum) {
    return (
      <section style={styles.wrapper} aria-label="Badge progress">
        <style>{`
          @keyframes celebrate {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.04); }
          }
          .celebrate-text {
            animation: celebrate 1.6s ease-in-out infinite;
            display: inline-block;
          }
        `}</style>
        <div style={styles.platinumBanner}>
          <span className="celebrate-text" style={styles.platinumText}>
            🏆 You've reached the highest badge!
          </span>
        </div>
      </section>
    );
  }

  if (isNewUser) {
    return (
      <section style={styles.wrapper} aria-label="Badge progress">
        <p style={styles.label}>Start making purchases to earn achievements and unlock your first badge!</p>
        <div style={styles.track} role="progressbar" aria-valuenow={0} aria-valuemax={1} aria-label="No progress yet">
          <div style={{ ...styles.fill, width: '0%' }} />
        </div>
        <p style={styles.counts}>0 achievements unlocked</p>
      </section>
    );
  }

  return (
    <section style={styles.wrapper} aria-label="Badge progress">
      <p style={styles.label}>
        <strong>{remaining}</strong> more achievement{remaining !== 1 ? 's' : ''} to reach{' '}
        <strong>{nextBadge}</strong>
      </p>

      <div
        style={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemax={total}
        aria-label={`${current} of ${total} achievements unlocked`}
      >
        <div style={{ ...styles.fill, width: `${width}%` }} />
      </div>

      <p style={styles.counts}>
        {current} / {total} achievements unlocked
      </p>
    </section>
  );
};

export default ProgressBar;

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    margin: 0,
    fontSize: '14px',
    color: '#444',
  },
  track: {
    height: '12px',
    background: '#ebebeb',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1d9e75 0%, #26c68e 100%)',
    borderRadius: '100px',
    transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  counts: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
  },
  platinumBanner: {
    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    border: '1px solid #d8b4fe',
    borderRadius: '12px',
    padding: '16px 24px',
    textAlign: 'center',
  },
  platinumText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6a0dad',
  },
};

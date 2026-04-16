import type { FC, CSSProperties } from 'react';

const SkeletonLoader: FC = () => (
  <div style={styles.wrapper} aria-busy="true" aria-label="Loading dashboard">
    <style>{`
      @keyframes skeletonPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
      .skeleton-block {
        background: #e8e8e8;
        border-radius: 8px;
        animation: skeletonPulse 1.5s ease-in-out infinite;
      }
    `}</style>

    <div style={styles.headerRow}>
      <div className="skeleton-block" style={{ width: '200px', height: '32px' }} />
      <div className="skeleton-block" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
    </div>

    <div style={styles.badgeRow}>
      <div style={styles.card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="skeleton-block" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
          <div className="skeleton-block" style={{ width: '80px', height: '18px' }} />
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
          {([0, 1, 2, 3] as const).map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div className="skeleton-block" style={{ width: '48px', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={styles.card}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton-block" style={{ width: '220px', height: '16px' }} />
        <div className="skeleton-block" style={{ width: '100%', height: '12px', borderRadius: '100px' }} />
        <div className="skeleton-block" style={{ width: '120px', height: '12px' }} />
      </div>
    </div>

    <div style={styles.card}>
      <div className="skeleton-block" style={{ width: '160px', height: '20px', marginBottom: '16px' }} />
      <div style={styles.chipGrid}>
        {([0, 1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className="skeleton-block"
            style={{ width: '140px', height: '140px', borderRadius: '12px' }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonLoader;

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  badgeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: '12px',
    padding: '24px',
  },
  chipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
  },
};

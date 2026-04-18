import type { FC } from 'react';

const SkeletonLoader: FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
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

    <div className="flex justify-between items-center flex-wrap gap-4">
      <div className="skeleton-block" style={{ width: '200px', height: '32px' }} />
      <div className="skeleton-block" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
    </div>

    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton-block" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
          <div className="skeleton-block" style={{ width: '80px', height: '18px' }} />
        </div>
      </div>
      <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
        <div className="flex justify-between items-center gap-8">
          {([0, 1, 2, 3] as const).map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div className="skeleton-block" style={{ width: '48px', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
      <div className="flex flex-col gap-2">
        <div className="skeleton-block" style={{ width: '220px', height: '16px' }} />
        <div className="skeleton-block" style={{ width: '100%', height: '12px', borderRadius: '100px' }} />
        <div className="skeleton-block" style={{ width: '120px', height: '12px' }} />
      </div>
    </div>

    <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
      <div className="skeleton-block mb-4" style={{ width: '160px', height: '20px' }} />
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
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

import type { FC, ReactNode } from 'react';

interface AchievementChipProps {
  name: string;
  description: string;
  icon: ReactNode;
  unlocked: boolean;
  nextAvailable?: boolean;
}

const CheckmarkBadge: FC = () => (
  <span className="absolute top-2 right-2 flex items-center justify-center" aria-label="Unlocked">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="#1d9e75" />
      <path
        d="M4 7.2L6.1 9.5L10 5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const AchievementChip: FC<AchievementChipProps> = ({
  name,
  description,
  icon,
  unlocked,
  nextAvailable = false,
}) => (
  <article
    className={[
      'relative w-[140px] min-h-[140px] rounded-xl p-4 flex flex-col items-center justify-center gap-2 border cursor-default transition-[transform,box-shadow] duration-200 text-center group-hover:scale-[1.03] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
      unlocked ? 'bg-[#e6f7f1] border-[#b3e8d4]' : 'bg-[#f1f0f0] border-[#e0dfdf]',
      nextAvailable && !unlocked ? 'animate-pulse-ring' : '',
    ].join(' ')}
  >
    {unlocked && <CheckmarkBadge />}
    <div
      className={`w-12 h-12 flex items-center justify-center rounded-full mb-1 ${unlocked ? 'bg-[#c4eddf]' : 'bg-[#e2e1e1]'}`}
      aria-hidden="true"
    >
      {icon}
    </div>
    <p className={`m-0 text-[13px] font-semibold leading-tight ${unlocked ? 'text-[#0f6e56]' : 'text-[#9a9a9a]'}`}>
      {name}
    </p>
    <p className={`m-0 text-[11px] leading-snug ${unlocked ? 'text-[#2d7a64]' : 'text-[#b5b5b5]'}`}>
      {description}
    </p>
  </article>
);

export default AchievementChip;

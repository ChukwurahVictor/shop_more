import type { FC } from 'react';
import type { BadgeTier } from '../types';
import { BADGE_TIERS, BADGE_COLOR } from "../constants/badges";

interface BadgeJourneyProps {
  currentBadge: BadgeTier | null;
}

const BadgeJourney: FC<BadgeJourneyProps> = ({ currentBadge }) => {
  const BADGES = BADGE_TIERS.map((name) => ({
    name,
    color: BADGE_COLOR[name],
  }));
  const currentIndex = BADGES.findIndex((b) => b.name === currentBadge);

  return (
    <section aria-label="Badge journey" className="flex items-center justify-center py-2">
      <div className="flex items-start gap-0">
        {BADGES.map((badge, index) => {
          const isReached = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === BADGES.length - 1;
          const nextBadge = BADGES[index + 1];

          return (
            <div key={badge.name} className="flex flex-col items-center relative">
              <div
                className={[
                  'w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-[background,border-color] duration-200 z-10 relative',
                  isReached ? '' : 'bg-[#f1f0f0] border-[#d5d4d4]',
                  isCurrent ? 'shadow-[0_0_0_4px_rgba(29,158,117,0.15)]' : '',
                ].join(' ')}
                style={isReached ? { background: badge.color, borderColor: badge.color } : undefined}
                aria-current={isCurrent ? 'step' : undefined}
                title={badge.name}
              >
                {isCurrent && (
                  <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                )}
              </div>

              <span
                className={`mt-2 text-[11px] whitespace-nowrap text-center w-14 ${isCurrent ? 'font-bold' : 'font-medium'}`}
                style={{ color: isReached ? badge.color : '#c5c5c5' }}
              >
                {badge.name}
              </span>

              {!isLast && nextBadge && (
                <div
                  className="absolute top-4 left-8 w-14 h-[3px] z-0 transition-[background] duration-200"
                  style={{ background: index < currentIndex ? nextBadge.color : '#e0dfdf' }}
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

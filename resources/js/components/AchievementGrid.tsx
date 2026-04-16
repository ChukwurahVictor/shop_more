import type { FC, ReactNode } from 'react';
import AchievementChip from './AchievementChip';
import { StarIcon, BagIcon, HeartIcon, TrophyIcon, CrownIcon } from './icons';

interface AchievementDef {
  name: string;
  description: string;
  icon: (unlocked: boolean) => ReactNode;
}

interface AchievementGridProps {
  unlockedAchievements?: string[];
  nextAvailableAchievements?: string[];
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    name: 'First Steps',
    description: 'Made your first purchase',
    icon: (unlocked) => <StarIcon color={unlocked ? '#0f6e56' : '#c5c5c5'} />,
  },
  {
    name: 'Regular Shopper',
    description: 'Completed 5 purchases',
    icon: (unlocked) => <BagIcon color={unlocked ? '#0f6e56' : '#c5c5c5'} />,
  },
  {
    name: 'Loyal Customer',
    description: 'Reached 10 purchases',
    icon: (unlocked) => <HeartIcon color={unlocked ? '#0f6e56' : '#c5c5c5'} />,
  },
  {
    name: 'Super Fan',
    description: 'Hit 20 purchases',
    icon: (unlocked) => <TrophyIcon color={unlocked ? '#0f6e56' : '#c5c5c5'} />,
  },
  {
    name: 'Legend',
    description: '50 purchases achieved',
    icon: (unlocked) => <CrownIcon color={unlocked ? '#0f6e56' : '#c5c5c5'} />,
  },
];

const AchievementGrid: FC<AchievementGridProps> = ({
  unlockedAchievements = [],
  nextAvailableAchievements = [],
}) => {
  const unlockedSet = new Set(unlockedAchievements);
  const nextSet = new Set(nextAvailableAchievements);

  return (
    <section aria-label="Achievement grid">
      <style>{`
        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        .next-available-chip {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(29, 158, 117, 0.25);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(29, 158, 117, 0);
          }
        }
        .achievement-chip-wrapper:hover article {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
      `}</style>
      <div className="achievement-grid">
        {ALL_ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedSet.has(achievement.name);
          const nextAvailable = nextSet.has(achievement.name);
          return (
            <div key={achievement.name} className="achievement-chip-wrapper">
              <AchievementChip
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon(unlocked)}
                unlocked={unlocked}
                nextAvailable={nextAvailable}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AchievementGrid;

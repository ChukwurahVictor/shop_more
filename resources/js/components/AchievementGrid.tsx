import type { FC } from "react";
import AchievementChip from "./AchievementChip";
import { ALL_ACHIEVEMENTS } from "../constants/achievements";

interface AchievementGridProps {
    unlockedAchievements?: string[];
    nextAvailableAchievements?: string[];
}

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
                        <div
                            key={achievement.name}
                            className="achievement-chip-wrapper"
                        >
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

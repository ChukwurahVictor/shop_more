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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
                {ALL_ACHIEVEMENTS.map((achievement) => {
                    const unlocked = unlockedSet.has(achievement.name);
                    const nextAvailable = nextSet.has(achievement.name);
                    return (
                        <div key={achievement.name} className="group">
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

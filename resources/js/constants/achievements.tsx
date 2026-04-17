import type { ReactNode } from 'react';
import { StarIcon, BagIcon, HeartIcon, TrophyIcon, CrownIcon } from '../components/icons';
import { ACHIEVEMENT_UNLOCKED_COLOR, ACHIEVEMENT_LOCKED_COLOR } from './colors';

export interface AchievementDef {
    name:        string;
    description: string;
    icon:        (unlocked: boolean) => ReactNode;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
    {
        name:        'First Steps',
        description: 'Made your first purchase',
        icon: (unlocked) => <StarIcon   color={unlocked ? ACHIEVEMENT_UNLOCKED_COLOR : ACHIEVEMENT_LOCKED_COLOR} />,
    },
    {
        name:        'Regular Shopper',
        description: 'Completed 5 purchases',
        icon: (unlocked) => <BagIcon    color={unlocked ? ACHIEVEMENT_UNLOCKED_COLOR : ACHIEVEMENT_LOCKED_COLOR} />,
    },
    {
        name:        'Loyal Customer',
        description: 'Reached 10 purchases',
        icon: (unlocked) => <HeartIcon  color={unlocked ? ACHIEVEMENT_UNLOCKED_COLOR : ACHIEVEMENT_LOCKED_COLOR} />,
    },
    {
        name:        'Super Fan',
        description: 'Hit 20 purchases',
        icon: (unlocked) => <TrophyIcon color={unlocked ? ACHIEVEMENT_UNLOCKED_COLOR : ACHIEVEMENT_LOCKED_COLOR} />,
    },
    {
        name:        'Legend',
        description: '50 purchases achieved',
        icon: (unlocked) => <CrownIcon  color={unlocked ? ACHIEVEMENT_UNLOCKED_COLOR : ACHIEVEMENT_LOCKED_COLOR} />,
    },
];

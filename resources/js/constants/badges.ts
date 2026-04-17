import type { BadgeTier } from '../types';

/** Ordered progression of badge tiers. */
export const BADGE_TIERS: readonly BadgeTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

/**
 * Primary display colour per tier — used in SVG circles, journey dots, and
 * any context that needs the "metallic" canonical badge colour.
 */
export const BADGE_COLOR: Record<BadgeTier, string> = {
    Bronze:   '#cd7f32',
    Silver:   '#a8a9ad',
    Gold:     '#FFD700',
    Platinum: '#6a0dad',
};

/**
 * Hero-card / modal gradient per tier.
 */
export const BADGE_GRADIENT: Record<BadgeTier, string> = {
    Bronze:   'linear-gradient(135deg, #a0522d 0%, #cd7f32 100%)',
    Silver:   'linear-gradient(135deg, #5a5a5a 0%, #9e9e9e 100%)',
    Gold:     'linear-gradient(135deg, #b8730a 0%, #f5c518 100%)',
    Platinum: 'linear-gradient(135deg, #3a006f 0%, #7b2cbf 100%)',
};

/**
 * Accent / highlight colour per tier — used for glows, pill borders,
 * badge-letter colour in the hero card, and modal text.
 */
export const BADGE_ACCENT: Record<BadgeTier, string> = {
    Bronze:   '#cd7f32',
    Silver:   '#c0c0c0',
    Gold:     '#f5c518',
    Platinum: '#c77dff',
};

/** Short member label shown on the hero card. */
export const BADGE_LABEL: Record<BadgeTier, string> = {
    Bronze:   'Bronze Member',
    Silver:   'Silver Member',
    Gold:     'Gold Member',
    Platinum: 'Platinum Member ✦',
};

/** Emoji icon used in the badge-unlock modal. */
export const BADGE_EMOJI: Record<BadgeTier, string> = {
    Bronze:   '🥉',
    Silver:   '🥈',
    Gold:     '🥇',
    Platinum: '💎',
};

// ─── Fallbacks for users with no badge yet ───────────────────────────────────

export const NO_BADGE_GRADIENT = 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)';
export const NO_BADGE_ACCENT   = '#26c68e';
export const NO_BADGE_LABEL    = 'New Member — start shopping to earn your first badge!';

// ─── Purchase milestones ─────────────────────────────────────────────────────

/**
 * Purchase counts that unlock each achievement, in order.
 * Mirrors AchievementService::MILESTONES on the backend.
 */
export const PURCHASE_MILESTONES = [
    { purchases: 1,  name: 'First Steps'     },
    { purchases: 5,  name: 'Regular Shopper' },
    { purchases: 10, name: 'Loyal Customer'  },
    { purchases: 20, name: 'Super Fan'       },
    { purchases: 50, name: 'Legend'          },
] as const;

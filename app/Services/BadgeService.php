<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\BadgeUnlocked;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Contracts\Events\Dispatcher;

class BadgeService
{
    /**
     * Badge tiers: name => minimum achievements required.
     * Ordered from lowest to highest so the loop can find the highest applicable.
     *
     * @var array<string, int>
     */
    private const TIERS = [
        'Bronze'   => 0,
        'Silver'   => 2,
        'Gold'     => 4,
        'Platinum' => 5,
    ];

    public function __construct(
        private readonly Dispatcher $events,
    ) {}

    /**
     * Compute the user's current badge based on number of unlocked achievements.
     */
    public function currentBadge(User $user): string
    {
        $count = $user->userAchievements()->count();
        $badge = 'Bronze';

        foreach (self::TIERS as $name => $minAchievements) {
            if ($count >= $minAchievements) {
                $badge = $name;
            }
        }

        return $badge;
    }

    /**
     * Return the name of the next badge tier, or null if already Platinum.
     */
    public function nextBadge(User $user): ?string
    {
        $current = $this->currentBadge($user);
        $tiers   = array_keys(self::TIERS);
        $index   = array_search($current, $tiers, true);

        return $tiers[$index + 1] ?? null;
    }

    /**
     * Return how many more achievements are needed to reach the next badge tier.
     * Returns 0 if the user is already Platinum.
     */
    public function remainingToNextBadge(User $user): int
    {
        $next = $this->nextBadge($user);

        if ($next === null) {
            return 0;
        }

        $count = $user->userAchievements()->count();

        return self::TIERS[$next] - $count;
    }

    /**
     * If the user's current badge has changed from $previousBadge, persist a
     * new UserBadge record and fire a BadgeUnlocked event.
     */
    public function evaluate(User $user, string $previousBadge): void
    {
        $currentBadge = $this->currentBadge($user);

        if ($currentBadge === $previousBadge) {
            return;
        }

        UserBadge::create([
            'user_id'    => $user->id,
            'badge_name' => $currentBadge,
            'awarded_at' => now(),
        ]);

        $this->events->dispatch(new BadgeUnlocked($user, $currentBadge));
    }
}

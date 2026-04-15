<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\AchievementUnlocked;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class AchievementService
{
    /**
     * Ordered achievement milestones: name => required purchase count.
     *
     * @var array<string, int>
     */
    private const MILESTONES = [
        'First Steps'      => 1,
        'Regular Shopper'  => 5,
        'Loyal Customer'   => 10,
        'Super Fan'        => 20,
        'Legend'           => 50,
    ];

    public function __construct(
        private readonly Dispatcher $events,
    ) {}

    /**
     * Return the names of all achievements the user has already unlocked,
     * in milestone order.
     *
     * @return list<string>
     */
    public function getUnlockedAchievements(User $user): array
    {
        $unlocked = $user->userAchievements()->pluck('achievement_name')->all();

        return array_values(
            array_filter(
                array_keys(self::MILESTONES),
                static fn(string $name): bool => in_array($name, $unlocked, true),
            )
        );
    }

    /**
     * Return the name(s) of the next achievement(s) the user is closest to
     * unlocking. Returns a single-element array with the immediately next
     * achievement, or an empty array if all are unlocked.
     *
     * @return list<string>
     */
    public function getNextAchievements(User $user): array
    {
        $unlocked = $this->getUnlockedAchievements($user);

        foreach (array_keys(self::MILESTONES) as $name) {
            if (!in_array($name, $unlocked, true)) {
                return [$name];
            }
        }

        return [];
    }

    /**
     * Compare the user's purchase count against every milestone and create
     * a UserAchievement record for each newly reached threshold, firing an
     * AchievementUnlocked event for every new unlock.
     */
    public function evaluate(User $user): void
    {
        $purchaseCount = $user->purchases()->count();

        DB::transaction(function () use ($user, $purchaseCount): void {
            foreach (self::MILESTONES as $name => $threshold) {
                if ($purchaseCount >= $threshold) {
                    try {
                        $record = UserAchievement::firstOrCreate(
                            [
                                'user_id'          => $user->id,
                                'achievement_name' => $name,
                            ],
                            ['unlocked_at' => now()],
                        );

                        if ($record->wasRecentlyCreated) {
                            $this->events->dispatch(new AchievementUnlocked($user, $name));
                        }
                    } catch (UniqueConstraintViolationException) {
                        // Another concurrent request already created this record; safe to skip.
                    }
                }
            }
        });
    }
}

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Services\AchievementService;
use App\Services\BadgeService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $achievementService = app(AchievementService::class);
        $badgeService       = app(BadgeService::class);

        // Known test user for manual/frontend testing
        $testUser = User::firstOrCreate(
            ['email' => 'test@bumpa.com'],
            [
                'name'     => 'Test User',
                'password' => Hash::make('password'),
            ]
        );

        /** @var list<array{purchases: int}> $scenarios */
        $scenarios = [
            ['purchases' => 1],   // User 1 – First Steps               (1 ach.)  → Bronze
            ['purchases' => 5],   // User 2 – Regular Shopper           (2 ach.)  → Silver
            ['purchases' => 10],  // User 3 – Loyal Customer            (3 ach.)  → Silver
            ['purchases' => 20],  // User 4 – Super Fan                 (4 ach.)  → Gold
            ['purchases' => 50],  // User 5 – Legend / all achievements (5 ach.)  → Platinum
        ];

        foreach ($scenarios as $scenario) {
            /** @var User $user */
            $user = User::factory()->create();

            for ($i = 0; $i < $scenario['purchases']; $i++) {
                $user->purchases()->create(['amount' => 100.00]);
            }

            $previousBadge = $badgeService->currentBadge($user);
            $achievementService->evaluate($user);
            $badgeService->evaluate($user, $previousBadge);
        }
    }
}

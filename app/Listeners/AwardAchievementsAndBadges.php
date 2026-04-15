<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\PurchaseCompleted;
use App\Services\AchievementService;
use App\Services\BadgeService;

class AwardAchievementsAndBadges
{
    public function __construct(
        private readonly AchievementService $achievementService,
        private readonly BadgeService $badgeService,
    ) {}

    public function handle(PurchaseCompleted $event): void
    {
        $user           = $event->user;
        $previousBadge  = $this->badgeService->currentBadge($user);

        $this->achievementService->evaluate($user);
        $this->badgeService->evaluate($user, $previousBadge);
    }
}

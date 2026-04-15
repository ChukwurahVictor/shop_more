<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AchievementService;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;

class AchievementController extends Controller
{
    public function __construct(
        private readonly AchievementService $achievementService,
        private readonly BadgeService $badgeService,
    ) {}

    public function show(int $user): JsonResponse
    {
        $model = User::find($user);

        if ($model === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        return response()->json([
            'unlocked_achievements'          => $this->achievementService->getUnlockedAchievements($model),
            'next_available_achievements'    => $this->achievementService->getNextAchievements($model),
            'current_badge'                  => $this->badgeService->currentBadge($model),
            'next_badge'                     => $this->badgeService->nextBadge($model),
            'remaining_to_unlock_next_badge' => $this->badgeService->remainingToNextBadge($model),
        ]);
    }
}

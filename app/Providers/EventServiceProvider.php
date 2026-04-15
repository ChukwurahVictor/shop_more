<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\BadgeUnlocked;
use App\Events\PurchaseCompleted;
use App\Listeners\AwardAchievementsAndBadges;
use App\Listeners\ProcessBadgeCashback;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PurchaseCompleted::class => [
            AwardAchievementsAndBadges::class,
        ],
        BadgeUnlocked::class => [
            ProcessBadgeCashback::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}

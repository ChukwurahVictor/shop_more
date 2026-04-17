<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\BadgeUnlocked;
use App\Services\CashbackService;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessBadgeCashback implements ShouldQueue
{
    public function __construct(
        private readonly CashbackService $cashbackService,
    ) {}

    public function handle(BadgeUnlocked $event): void
    {
        $this->cashbackService->issueBadgeCashback($event->user, $event->badgeName);
    }
}

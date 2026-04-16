<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\BadgeUnlocked;
use App\Services\CashbackService;


class ProcessBadgeCashback
{
    public function __construct(
private readonlyCashbackService $cashbackService,

    ) {}

    public function handle(BadgeUnlocked $event): void
    {
$this->cashbackService->issueBadgeCashback($event->user, $event->badgeName);

    }
}

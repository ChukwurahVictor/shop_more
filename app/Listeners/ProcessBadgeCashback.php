<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\BadgeUnlocked;
use Illuminate\Log\LogManager;

class ProcessBadgeCashback
{
    public function __construct(
        private readonly LogManager $logManager,
    ) {}

    public function handle(BadgeUnlocked $event): void
    {
        $this->logManager->channel('payments')->info('Cashback initiated', [
            'user_id'    => $event->user->id,
            'badge_name' => $event->badgeName,
            'amount'     => 300,
            'currency'   => 'NGN',
            'timestamp'  => now()->toIso8601String(),
        ]);

        // TODO: replace with real payment gateway call e.g. Paystack
    }
}

<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\User;

class BadgeUnlocked
{
    public function __construct(
        public readonly User $user,
        public readonly string $badgeName,
    ) {}
}

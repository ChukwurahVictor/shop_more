<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Purchase;
use App\Models\User;

class PurchaseCompleted
{
    public function __construct(
        public readonly User $user,
        public readonly Purchase $purchase,
    ) {}
}

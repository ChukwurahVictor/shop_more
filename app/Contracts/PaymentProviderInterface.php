<?php

declare(strict_types=1);

namespace App\Contracts;

interface PaymentProviderInterface
{
    /**
     * Disburse funds to a user.
     *
     * @return array{reference: string, status: string, amount: int, currency: string, message: string}
     */
    public function disburse(
        int    $userId,
        int    $amountKobo,
        string $currency,
        string $reference,
    ): array;
}

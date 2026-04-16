<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\PaymentProviderInterface;
use App\Models\User;
use Illuminate\Log\LogManager;

class CashbackService
{
    /** Fixed cashback amount in Naira */
    private const CASHBACK_AMOUNT_NAIRA = 300;

    /** Currency code */
    private const CURRENCY = 'NGN';

    public function __construct(
        private readonly PaymentProviderInterface $paymentProvider,
        private readonly LogManager $log,
    ) {}

    /**
     * Issue a cashback reward to the user upon badge unlock.
     */
    public function issueBadgeCashback(User $user, string $badgeName): void
    {
        $reference = $this->generateReference($user->id, $badgeName);
        $amountKobo = self::CASHBACK_AMOUNT_NAIRA * 100; // convert to kobo (smallest unit)

        $this->log->channel('payments')->info('Cashback initiated', [
            'user_id'    => $user->id,
            'user_email' => $user->email,
            'badge'      => $badgeName,
            'amount_ngn' => self::CASHBACK_AMOUNT_NAIRA,
            'currency'   => self::CURRENCY,
            'reference'  => $reference,
            'timestamp'  => now()->toIso8601String(),
        ]);

        $result = $this->paymentProvider->disburse(
            userId:      $user->id,
            amountKobo:  $amountKobo,
            currency:    self::CURRENCY,
            reference:   $reference,
        );

        $this->log->channel('payments')->info('Cashback result', [
            'user_id'   => $user->id,
            'reference' => $reference,
            'status'    => $result['status'],
            'message'   => $result['message'],
        ]);
    }

    /**
     * Generate a unique idempotency reference for the cashback payment.
     */
    private function generateReference(int $userId, string $badgeName): string
    {
        $slug = strtolower(str_replace(' ', '-', $badgeName));

        return sprintf(
            'cashback-%d-%s-%s',
            $userId,
            $slug,
            now()->format('YmdHis'),
        );
    }
}

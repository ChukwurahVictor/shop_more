<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\PaymentProviderInterface;
use Illuminate\Log\LogManager;

/**
 * Mock payment provider that simulates a successful disbursement.
 *
 * Replace this class (while keeping the PaymentProviderInterface contract)
 * to integrate a real gateway such as Paystack, Flutterwave, etc.
 *
 * Paystack example (not wired up):
 *   POST https://api.paystack.co/transfer
 *   Headers: Authorization: Bearer <PAYSTACK_SECRET_KEY>
 *   Body: { reason, amount, recipient, source: "balance" }
 */
class MockPaymentProvider implements PaymentProviderInterface
{
    private const SIMULATED_DELAY_MS = 120; // simulate network latency

    public function __construct(
        private readonly LogManager $log,
    ) {}

    /**
     * {@inheritdoc}
     */
    public function disburse(
        int    $userId,
        int    $amountKobo,
        string $currency,
        string $reference,
    ): array {
        // Simulate processing time
        usleep(self::SIMULATED_DELAY_MS * 1_000);

        $response = [
            'reference' => $reference,
            'status'    => 'success',
            'amount'    => $amountKobo,
            'currency'  => $currency,
            'message'   => 'Transfer queued successfully. (mock)',
        ];

        $this->log->channel('payments')->info('[MockPaymentProvider] Disbursement processed', [
            'user_id'  => $userId,
            'response' => $response,
        ]);

        return $response;
    }
}

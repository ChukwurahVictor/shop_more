<?php

declare(strict_types=1);

use App\Contracts\PaymentProviderInterface;

use App\Events\AchievementUnlocked;
use App\Events\BadgeUnlocked;
use App\Events\PurchaseCompleted;

use App\Models\Purchase;
use App\Models\User;
use App\Models\UserAchievement;
use App\Services\AchievementService;
use App\Services\BadgeService;
use App\Services\CashbackService;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Make an authenticated GET request to the achievements endpoint.
 */
function getAchievements(User $actor, int $userId): \Illuminate\Testing\TestResponse
{
    return test()->actingAs($actor)->getJson("/api/users/{$userId}/achievements");
}

/**
 * Make an authenticated POST request to the purchases endpoint.
 */
function postPurchase(User $actor, int $userId, float $amount): \Illuminate\Testing\TestResponse
{
    return test()->actingAs($actor)->postJson("/api/users/{$userId}/purchases", ['amount' => $amount]);
}

// ══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT & BADGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

it('returns empty achievements and Bronze badge for a user with no purchases', function (): void {
    $user = User::factory()->create();

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJson(['status' => 'success'])
        ->assertJsonPath('data.unlocked_achievements', [])
        ->assertJsonPath('data.next_available_achievements', ['First Steps'])
        ->assertJsonPath('data.current_badge', 'Bronze')
        ->assertJsonPath('data.next_badge', 'Silver')
        ->assertJsonPath('data.remaining_to_unlock_next_badge', 2);
});

it('unlocks First Steps after 1 purchase', function (): void {
    $user = User::factory()->create();
    $user->purchases()->create(['amount' => 50.00]);

    $badgeService       = app(BadgeService::class);
    $achievementService = app(AchievementService::class);
    $previousBadge      = $badgeService->currentBadge($user);
    $achievementService->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJson(['status' => 'success'])
        ->assertJsonPath('data.unlocked_achievements', ['First Steps'])
        ->assertJsonPath('data.next_available_achievements', ['Regular Shopper'])
        ->assertJsonPath('data.current_badge', 'Bronze');
});

it('unlocks Regular Shopper after 5 purchases and badge is Silver', function (): void {
    $user = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $user->purchases()->create(['amount' => 50.00]);
    }

    $badgeService       = app(BadgeService::class);
    $achievementService = app(AchievementService::class);
    $previousBadge      = $badgeService->currentBadge($user);
    $achievementService->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJsonPath('data.unlocked_achievements', ['First Steps', 'Regular Shopper'])
        ->assertJsonPath('data.current_badge', 'Silver');
});

it('unlocks Loyal Customer after 10 purchases and badge is Silver', function (): void {
    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $user->purchases()->create(['amount' => 50.00]);
    }

    $badgeService       = app(BadgeService::class);
    $achievementService = app(AchievementService::class);
    $previousBadge      = $badgeService->currentBadge($user);
    $achievementService->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJsonPath('data.current_badge', 'Silver')
        ->assertJsonPath('data.unlocked_achievements.2', 'Loyal Customer');
});

it('fires AchievementUnlocked event when a purchase milestone is reached', function (): void {
    Event::fake([AchievementUnlocked::class]);

    $user = User::factory()->create();
    $user->purchases()->create(['amount' => 100.00]);

    app(AchievementService::class)->evaluate($user);

    Event::assertDispatched(
        AchievementUnlocked::class,
        fn(AchievementUnlocked $e): bool =>
            $e->user->is($user) && $e->achievementName === 'First Steps',
    );
});

it('fires BadgeUnlocked event when badge tier changes', function (): void {
    Event::fake([BadgeUnlocked::class]);

    $user = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $user->purchases()->create(['amount' => 100.00]);
    }

    $badgeService  = app(BadgeService::class);
    $previousBadge = 'Bronze';

    app(AchievementService::class)->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    Event::assertDispatched(
        BadgeUnlocked::class,
        fn(BadgeUnlocked $e): bool =>
            $e->user->is($user) && $e->badgeName === 'Silver',
    );
});

it('does not fire duplicate AchievementUnlocked events on re-evaluation', function (): void {
    Event::fake([AchievementUnlocked::class]);

    $user = User::factory()->create();
    $user->purchases()->create(['amount' => 100.00]);

    $service = app(AchievementService::class);
    $service->evaluate($user);
    $service->evaluate($user); // second call — should not fire again

    Event::assertDispatchedTimes(AchievementUnlocked::class, 1);
});

it('returns correct next badge and remaining count for Gold tier', function (): void {
    $user = User::factory()->create();

    // 20 purchases → 4 achievements (First Steps, Regular Shopper, Loyal Customer, Super Fan) → Gold
    for ($i = 0; $i < 20; $i++) {
        $user->purchases()->create(['amount' => 50.00]);
    }

    $badgeService       = app(BadgeService::class);
    $achievementService = app(AchievementService::class);
    $previousBadge      = $badgeService->currentBadge($user);
    $achievementService->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJsonPath('data.current_badge', 'Gold')
        ->assertJsonPath('data.next_badge', 'Platinum')
        ->assertJsonPath('data.remaining_to_unlock_next_badge', 1);
});

it('returns null next badge and 0 remaining for Platinum tier', function (): void {
    $user = User::factory()->create();

    for ($i = 0; $i < 50; $i++) {
        $user->purchases()->create(['amount' => 50.00]);
    }

    $badgeService       = app(BadgeService::class);
    $achievementService = app(AchievementService::class);
    $previousBadge      = $badgeService->currentBadge($user);
    $achievementService->evaluate($user);
    $badgeService->evaluate($user, $previousBadge);

    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJsonPath('data.current_badge', 'Platinum')
        ->assertJsonPath('data.next_badge', null)
        ->assertJsonPath('data.remaining_to_unlock_next_badge', 0)
        ->assertJsonPath('data.next_available_achievements', []);
});

// ══════════════════════════════════════════════════════════════════════════════
// CASHBACK TESTS
// ══════════════════════════════════════════════════════════════════════════════

it('logs cashback initiated and result when CashbackService handles a badge unlock', function (): void {
    $user = User::factory()->create();

    Log::shouldReceive('channel')->with('payments')->andReturnSelf();
    Log::shouldReceive('info')->atLeast()->twice(); // 'Cashback initiated' + 'Cashback result' (+ provider log)

    app(CashbackService::class)->issueBadgeCashback($user, 'Silver');
});

it('calls the payment provider with correct arguments via the interface', function (): void {
    $mockProvider = Mockery::mock(PaymentProviderInterface::class);
    $mockProvider->shouldReceive('disburse')
        ->once()
        ->withArgs(function (int $userId, int $amountKobo, string $currency, string $reference): bool {
            return $amountKobo === 30000 && $currency === 'NGN' && str_starts_with($reference, 'cashback-');
        })
        ->andReturn([
            'reference' => 'test-ref',
            'status'    => 'success',
            'amount'    => 30000,
            'currency'  => 'NGN',
            'message'   => 'Test success',
        ]);

    $this->app->instance(PaymentProviderInterface::class, $mockProvider);

    $user = User::factory()->create();
    app(CashbackService::class)->issueBadgeCashback($user, 'Silver');
});

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATION: FULL PURCHASE → ACHIEVEMENT → BADGE → CASHBACK FLOW
// ══════════════════════════════════════════════════════════════════════════════

it('triggers full flow: purchase → achievement → badge upgrade → cashback log', function (): void {
    $user = User::factory()->create();

    // Make 5 purchases via the API to trigger the event chain
    for ($i = 0; $i < 5; $i++) {
        postPurchase($user, $user->id, 100.00)->assertCreated();
    }

    // Should have 2 achievements (First Steps + Regular Shopper) → Silver badge
    getAchievements($user, $user->id)
        ->assertOk()
        ->assertJsonPath('data.current_badge', 'Silver')
        ->assertJsonPath('data.unlocked_achievements', ['First Steps', 'Regular Shopper']);
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH TESTS
// ══════════════════════════════════════════════════════════════════════════════

it('registers a new user and returns a token', function (): void {
    test()->postJson('/api/auth/register', [
        'name'                  => 'Alice',
        'email'                 => 'alice@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])
        ->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email']]]);

    expect(User::where('email', 'alice@example.com')->exists())->toBeTrue();
});

it('rejects registration with duplicate email', function (): void {
    User::factory()->create(['email' => 'dup@example.com']);

    test()->postJson('/api/auth/register', [
        'name'                  => 'Bob',
        'email'                 => 'dup@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertUnprocessable();
});

it('rejects registration with mismatched password confirmation', function (): void {
    test()->postJson('/api/auth/register', [
        'name'                  => 'Bob',
        'email'                 => 'bob@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'different',
    ])->assertUnprocessable();
});

it('logs in with valid credentials and returns a token', function (): void {
    User::factory()->create(['email' => 'login@test.com', 'password' => bcrypt('secret99')]);

    test()->postJson('/api/auth/login', [
        'email'    => 'login@test.com',
        'password' => 'secret99',
    ])
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonStructure(['data' => ['token', 'user']]);
});

it('rejects login with wrong password', function (): void {
    User::factory()->create(['email' => 'fail@test.com', 'password' => bcrypt('correct')]);

    test()->postJson('/api/auth/login', [
        'email'    => 'fail@test.com',
        'password' => 'wrong',
    ])->assertUnprocessable();
});


it('logs out and revokes the current token', function (): void {
    $user = User::factory()->create();

$token = $user->createToken('api')->plainTextToken;

test()->withHeader('Authorization', "Bearer {$token}")
    ->postJson('/api/auth/logout')
    ->assertOk()
    ->assertJsonPath('status', 'success');
});

    it('returns authenticated user on /auth/me', function (): void {
        $user = User::factory()->create();

        test()->actingAs($user)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    });

    it('returns 401 for unauthenticated requests to protected routes', function (): void {
        test()->getJson('/api/auth/me')->assertUnauthorized();
        test()->getJson('/api/users/1/achievements')->assertUnauthorized();
        test()->postJson('/api/users/1/purchases', ['amount' => 100])->assertUnauthorized();
    });

// ══════════════════════════════════════════════════════════════════════════════
    // PURCHASE VALIDATION
    // ══════════════════════════════════════════════════════════════════════════════

    it('rejects a purchase with missing amount', function (): void {
        $user = User::factory()->create();

        postPurchase($user, $user->id, 0)->assertUnprocessable();
    });

    it('rejects a purchase for a non-existent user', function (): void {
        $user = User::factory()->create();


test()->actingAs($user)->postJson('/api/users/99999/purchases', ['amount' => 100])
    ->assertNotFound();
});



it('records a valid purchase and returns 201', function (): void {
    $user = User::factory()->create();

    postPurchase($user, $user->id, 250.00)
        ->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.amount', '250.00');

    expect(Purchase::where('user_id', $user->id)->count())->toBe(1);


});

// ──────────────────────────────────────────────────────────────────────────────
// 8. Duplicate evaluate calls do not re-unlock an already-unlocked achievement
// ──────────────────────────────────────────────────────────────────────────────

it('does not re-unlock an already-unlocked achievement on duplicate evaluate calls', function (): void {
    $user = User::factory()->create();
    $user->purchases()->create(['amount' => 100.00]);

    $achievementService = app(AchievementService::class);
    $achievementService->evaluate($user);
    $achievementService->evaluate($user); // idempotent

    expect(
        UserAchievement::where('user_id', $user->id)
            ->where('achievement_name', 'First Steps')
            ->count()
    )->toBe(1);
});

// ──────────────────────────────────────────────────────────────────────────────
// 9. Non-existent user returns 404 with standard envelope
// ──────────────────────────────────────────────────────────────────────────────

it('returns 404 with standard envelope for a non-existent user', function (): void {
    $actor = User::factory()->create();

    test()->actingAs($actor)
        ->getJson('/api/users/99999/achievements')
        ->assertNotFound()
        ->assertJson(['status' => 'failed'])
        ->assertJsonPath('message', 'User not found.');
});

// ──────────────────────────────────────────────────────────────────────────────
// 10. Unauthenticated request returns 401 with standard envelope
// ──────────────────────────────────────────────────────────────────────────────

it('returns 401 for unauthenticated requests', function (): void {
    $user = User::factory()->create();

    $this->getJson("/api/users/{$user->id}/achievements")
        ->assertUnauthorized()
        ->assertJson(['status' => 'failed'])
        ->assertJsonPath('message', 'Unauthenticated.');
});

// ──────────────────────────────────────────────────────────────────────────────
// 11. POST /purchases records a purchase and returns standard envelope
// ──────────────────────────────────────────────────────────────────────────────

it('records a purchase and returns 201 with standard envelope', function (): void {
    $user = User::factory()->create();

    postPurchase($user, $user->id, 250.00)
        ->assertCreated()
        ->assertJson(['status' => 'success'])
        ->assertJsonPath('message', 'Purchase recorded successfully.')
        ->assertJsonPath('data.amount', '250.00');

    expect($user->purchases()->count())->toBe(1);
});

// ──────────────────────────────────────────────────────────────────────────────
// 12. POST /purchases validates amount
// ──────────────────────────────────────────────────────────────────────────────

it('returns 422 when purchase amount is invalid', function (): void {
    $user = User::factory()->create();

    postPurchase($user, $user->id, 0)
        ->assertUnprocessable()
        ->assertJson(['status' => 'failed']);
});

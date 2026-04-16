<?php

declare(strict_types=1);

use App\Events\AchievementUnlocked;
use App\Events\BadgeUnlocked;
use App\Events\PurchaseCompleted;
use App\Listeners\ProcessBadgeCashback;
use App\Models\Purchase;
use App\Models\User;
use App\Models\UserAchievement;
use App\Services\AchievementService;
use App\Services\BadgeService;
use Illuminate\Log\LogManager;
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

// ──────────────────────────────────────────────────────────────────────────────
// 1. New user with 0 purchases
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 2. After 1 purchase – "First Steps" is unlocked
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 3. After 5 purchases – "Regular Shopper" is unlocked, badge → Silver
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 4. After 10 purchases – "Loyal Customer" unlocked; badge stays Silver (3 ach.)
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 5. AchievementUnlocked event is fired when a milestone is hit
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 6. BadgeUnlocked event is fired when badge changes
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// 7. ProcessBadgeCashback logs the cashback message on BadgeUnlocked
// ──────────────────────────────────────────────────────────────────────────────

it('logs cashback info when ProcessBadgeCashback handles a BadgeUnlocked event', function (): void {
    $user  = User::factory()->create();
    $event = new BadgeUnlocked($user, 'Silver');

    $mockLogger = Mockery::mock(\Psr\Log\LoggerInterface::class);
    $mockLogger->shouldReceive('info')
        ->once()
        ->withArgs(function (string $message, array $context) use ($user): bool {
            return $message === 'Cashback initiated'
                && $context['user_id']    === $user->id
                && $context['badge_name'] === 'Silver'
                && $context['amount']     === 300
                && $context['currency']   === 'NGN'
                && isset($context['timestamp']);
        });

    $mockLogManager = Mockery::mock(LogManager::class);
    $mockLogManager->shouldReceive('channel')
        ->with('payments')
        ->once()
        ->andReturn($mockLogger);

    $listener = new ProcessBadgeCashback($mockLogManager);
    $listener->handle($event);
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

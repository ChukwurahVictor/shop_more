<?php

namespace App\Providers;

use App\Services\MockPaymentProvider;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
// Bind the payment provider. Swap MockPaymentProvider for a real
// implementation (e.g. PaystackPaymentProvider) without touching
// any other code.
$this->app->bind(PaymentProviderInterface::class, MockPaymentProvider::class);

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->softDeletes();
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->softDeletes();
        });

        Schema::table('user_achievements', function (Blueprint $table): void {
            $table->softDeletes();
        });

        Schema::table('user_badges', function (Blueprint $table): void {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });

        Schema::table('user_achievements', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });

        Schema::table('user_badges', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });
    }
};

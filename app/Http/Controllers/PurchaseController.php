<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\PurchaseCompleted;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function store(Request $request, int $user): JsonResponse
    {
        $model = User::find($user);

        if ($model === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:1000000'],
        ]);

        /** @var Purchase $purchase */
        $purchase = DB::transaction(function () use ($model, $validated): Purchase {
            $purchase = $model->purchases()->create($validated);
            event(new PurchaseCompleted($model, $purchase));
            return $purchase;
        });

        return response()->json($purchase, 201);
    }
}

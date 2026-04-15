<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\PurchaseCompleted;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function store(Request $request, int $user): JsonResponse
    {
        $model = User::find($user);

        if ($model === null) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        /** @var Purchase $purchase */
        $purchase = $model->purchases()->create($validated);

        event(new PurchaseCompleted($model, $purchase));

        return response()->json($purchase, 201);
    }
}

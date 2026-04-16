<?php

declare(strict_types=1);

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data = [], string $message = 'Data retrieved successfully', int $status = 200): JsonResponse
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    protected function created(mixed $data = [], string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function error(string $message = 'An error occurred', mixed $error = null, int $status = 400): JsonResponse
    {
        $body = [
            'status'  => 'failed',
            'message' => $message,
            'data'    => [],
        ];

        if ($error !== null) {
            $body['error'] = $error;
        }

        return response()->json($body, $status);
    }
}

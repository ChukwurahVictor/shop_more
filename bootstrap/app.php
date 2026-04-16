<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Unauthenticated
        $exceptions->render(function (AuthenticationException $e): JsonResponse {
            return response()->json([
                'status'  => 'failed',
                'message' => 'Unauthenticated.',
                'data'    => [],
                'error'   => $e->getMessage(),
            ], 401);
        });

        // Validation errors
        $exceptions->render(function (ValidationException $e): JsonResponse {
            return response()->json([
                'status'  => 'failed',
                'message' => 'Validation failed.',
                'data'    => [],
                'error'   => $e->errors(),
            ], 422);
        });

        // Generic HTTP errors (403, 404, 429, 500, etc.)
        $exceptions->render(function (HttpException $e): JsonResponse {
            return response()->json([
                'status'  => 'failed',
                'message' => $e->getMessage() ?: 'An error occurred.',
                'data'    => [],
                'error'   => class_basename($e),
            ], $e->getStatusCode());
        });
    })->create();

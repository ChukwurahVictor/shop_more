<?php

declare(strict_types=1);

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
| Apply the Laravel TestCase to all Feature and Unit tests so the
| application is booted, facades are available, and HTTP helpers work.
*/

uses(TestCase::class)->in('Feature', 'Unit');

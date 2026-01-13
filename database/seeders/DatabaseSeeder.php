<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AreaSeeder::class,
            CategorySeeder::class,
            UserSeeder::class,
            UserAreaResponsibilitySeeder::class,
            DocumentSeeder::class,
            FeedbackSeeder::class,
        ]);
    }
}
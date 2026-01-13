<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeedbackSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('feedbacks')->insert([
            'message' => 'Mohon perbaiki format laporan dan lengkapi data pendukung.',
            'user_id' => 2, // AMO Region
            'document_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

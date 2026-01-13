<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('documents')->insert([
            'judul' => 'Program cicilan 12 bulan di Amskin Beauty Clinic',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'On Process',
            'file_name' => 'program_cicilan_amskin.docx',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'file_size' => 2048,
            'file_type' => 'docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
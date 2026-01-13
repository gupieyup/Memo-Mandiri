<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('documents')->insert([
            'id'=> 1,
            'judul' => 'Dokumen 1',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Draft',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 2,
            'judul' => 'Dokumen 2',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'On Process',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 3,
            'judul' => 'Dokumen 3',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Revision by AMO Region',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 4,
            'judul' => 'Dokumen 4',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Revision by MO',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 5,
            'judul' => 'Dokumen 5',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Revision by CCH',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 6,
            'judul' => 'Dokumen 6',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Accept by AMO Region',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 7,
            'judul' => 'Dokumen 7',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Accept by MO',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('documents')->insert([
            'id'=> 8,
            'judul' => 'Dokumen 8',
            'periode_mulai' => '2026-01-04',
            'periode_selesai'=>'2026-12-31',
            'status' => 'Accept by CCH',
            'file_path' => 'documents/program_cicilan_amskin.docx',
            'area_id' => 1,
            'user_id' => 6,
            'category_id' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

    }
}
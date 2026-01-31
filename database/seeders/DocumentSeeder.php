<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan folder documents ada di storage
        if (!Storage::disk('public')->exists('documents')) {
            Storage::disk('public')->makeDirectory('documents');
        }

        // Salin file document.pdf dari public ke storage jika belum ada
        $sourcePath = public_path('documents/documents.pdf');
        $destinationPath = 'documents/documents.pdf';
        
        if (File::exists($sourcePath)) {
            // Jika file sudah ada di storage, gunakan yang ada
            // Jika belum, salin dari public
            if (!Storage::disk('public')->exists($destinationPath)) {
                Storage::disk('public')->put(
                    $destinationPath,
                    File::get($sourcePath)
                );
            }
            
            // Dapatkan ukuran file yang sebenarnya
            $fileSize = Storage::disk('public')->size($destinationPath);
        } else {
            // Jika file tidak ada di public, gunakan ukuran default
            $fileSize = 204800; // 200KB default
        }

        DB::table('documents')->insert([
            [
                'judul' => 'Dokumen 1',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Draft',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 2,
                'user_id' => 2,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 2',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'On Process',                
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 1,
                'user_id' => 3,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 3',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Draft',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 6,
                'user_id' => 4,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 4',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'On Process',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 2,
                'user_id' => 5,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 5',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Revision by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 1,
                'user_id' => 6,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            [
                'judul' => 'Dokumen 6',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by AMO Region',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 2,
                'user_id' => 7,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 7',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by MO',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 3,
                'user_id' => 8,
                'category_id' => 10,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 8',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 4,
                'user_id' => 9,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 9',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 5,
                'user_id' => 10,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 10',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 6,
                'user_id' => 11,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 11',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 7,
                'user_id' => 12,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 12',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 8,
                'user_id' => 13,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Dokumen 13',
                'periode_mulai' => '2026-01-04',
                'periode_selesai' => '2026-12-31',
                'status' => 'Accept by CCH',
                'file_name' => 'documents.pdf',
                'file_path' => 'documents/documents.pdf',
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'area_id' => 4,
                'user_id' => 7,
                'category_id' => 11,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
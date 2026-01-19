<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('areas')->insert([
            'id'=> 1,
            'nama' => 'Semarang Pahlawan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 2,
            'nama' => 'Semarang Pemuda',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 3,
            'nama' => 'Yogyakarta',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 4,
            'nama' => 'Solo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 5,
            'nama' => 'Purwokerto',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 6,
            'nama' => 'Tegal',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 7,
            'nama' => 'Magelang',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 8,
            'nama' => 'Kudus',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('areas')->insert([
            'id'=> 9,
            'nama' => 'Region',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

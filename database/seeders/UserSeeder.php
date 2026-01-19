<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // MO
        DB::table('users')->insert([
            'id'=> 1,
            'nama' => 'Manager Operasional',
            'email' => 'mo@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'MO',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // AMO Region
        DB::table('users')->insert([
            'id'=> 2,
            'nama' => 'AMO Region 1',
            'email' => 'amoregion1@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Region',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 3,
            'nama' => 'AMO Region 2',
            'email' => 'amoregion2@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Region',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 4,
            'nama' => 'AMO Region 3',
            'email' => 'amoregion3@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Region',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 5,
            'nama' => 'AMO Region 4',
            'email' => 'amoregion4@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Region',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 6,
            'nama' => 'AMO Semarang Pahlawan',
            'email' => 'amoarea1@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 7,
            'nama' => 'AMO Semarang Pemuda',
            'email' => 'amoarea2@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 8,
            'nama' => 'AMO Yogyakarta',
            'email' => 'amoarea3@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 9,
            'nama' => 'AMO Solo',
            'email' => 'amoarea4@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 10,
            'nama' => 'AMO Purwokerto',
            'email' => 'amoarea5@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 11,
            'nama' => 'AMO Tegal',
            'email' => 'amoarea6@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 6,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 12,
            'nama' => 'AMO Magelang',
            'email' => 'amoarea7@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 7,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 13,
            'nama' => 'AMO Kudus',
            'email' => 'amoarea8@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'AMO Area',
            'area_id' => 8,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id'=> 14,
            'nama' => 'Credit Card Head',
            'email' => 'cch@mandiri.com',
            'password' => Hash::make('password'),
            'role' => 'CCH',
            'area_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
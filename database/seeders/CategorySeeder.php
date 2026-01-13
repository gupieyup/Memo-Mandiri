<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table("categories")->insert([
            'id'=> 1,
            'nama' => 'Automotive',
        ]);

        DB::table('categories')->insert([
            'id'=> 2,
            'nama'=> 'Education',
        ]);

        DB::table('categories')->insert([
            'id'=> 3,
            'nama'=> 'E-Commerce',
        ]);

        DB::table('categories')->insert([
            'id'=> 4,
            'nama'=> 'Cafe and Resto',
        ]);

        DB::table('categories')->insert([
            'id'=> 5,
            'nama'=> 'Electronic and Gadgets',
        ]);

        DB::table('categories')->insert([
            'id'=> 6,
            'nama'=> 'Household',
        ]);

        DB::table('categories')->insert([
            'id'=> 7,
            'nama'=> 'Hotel',
        ]);

        DB::table('categories')->insert([
            'id'=> 8,
            'nama'=> 'Travel',
        ]);

        DB::table('categories')->insert([
            'id'=> 9,
            'nama'=> 'Groceries',
        ]);

        DB::table('categories')->insert([
            'id'=> 10,
            'nama'=> 'Fashion and Beauty',
        ]);

        DB::table('categories')->insert([
            'id'=> 11,
            'nama'=> 'Health Services',
        ]);

        DB::table('categories')->insert([
            'id'=> 12,
            'nama'=> 'Hobbies',
        ]);

        DB::table('categories')->insert([
            'id'=> 13,
            'nama'=> 'Others',
        ]);
    }
}

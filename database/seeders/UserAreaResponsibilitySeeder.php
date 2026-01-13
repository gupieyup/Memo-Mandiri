<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserAreaResponsibilitySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $data = [
            // MO → semua area
            ['supervisor_id' => 1, 'area_id' => 1],
            ['supervisor_id' => 1, 'area_id' => 2],
            ['supervisor_id' => 1, 'area_id' => 3],
            ['supervisor_id' => 1, 'area_id' => 4],
            ['supervisor_id' => 1, 'area_id' => 5],
            ['supervisor_id' => 1, 'area_id' => 6],
            ['supervisor_id' => 1, 'area_id' => 7],
            ['supervisor_id' => 1, 'area_id' => 8],

            // AMO Region 1
            ['supervisor_id' => 2, 'area_id' => 1],
            ['supervisor_id' => 2, 'area_id' => 2],

            // AMO Region 2
            ['supervisor_id' => 3, 'area_id' => 3],
            ['supervisor_id' => 3, 'area_id' => 4],

            // AMO Region 3
            ['supervisor_id' => 4, 'area_id' => 5],
            ['supervisor_id' => 4, 'area_id' => 6],

            // AMO Region 4
            ['supervisor_id' => 5, 'area_id' => 7],
            ['supervisor_id' => 5, 'area_id' => 8],
        ];

        foreach ($data as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }

        DB::table('user_area_responsibilities')->insert($data);
    }
}

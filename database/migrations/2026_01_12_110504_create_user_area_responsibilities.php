<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_area_responsibilities', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('supervisor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('area_id')->constrained('areas')->cascadeOnDelete();

            $table->unique(['supervisor_id', 'area_id']);
        });
    }

    public function down(): void
    {
        Schema::table('user_area_responsibilities', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropForeign(['area_id']);
        });
        Schema::dropIfExists('user_area_responsibilities');
    }
};
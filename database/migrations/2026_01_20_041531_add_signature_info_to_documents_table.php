<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->integer('signature_page')->nullable()->after('notes');
            $table->decimal('signature_x', 10, 2)->nullable()->after('signature_page');
            $table->decimal('signature_y', 10, 2)->nullable()->after('signature_x');
            $table->decimal('signature_width', 10, 2)->nullable()->after('signature_y');
            $table->decimal('signature_height', 10, 2)->nullable()->after('signature_width');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'signature_page',
                'signature_x',
                'signature_y',
                'signature_width',
                'signature_height'
            ]);
        });
    }
};
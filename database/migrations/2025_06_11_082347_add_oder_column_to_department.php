<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->integer('order')->default(0)->after('icon_path');
        });

        // Populate existing departments with order values
        $departments = DB::table('departments')->orderBy('id')->get();
        foreach ($departments as $index => $department) {
            DB::table('departments')
                ->where('id', $department->id)
                ->update(['order' => $index]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('department', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};

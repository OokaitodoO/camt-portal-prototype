<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // First drop the existing foreign key constraint
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->dropForeign(['task_id']);
        });

        // Then recreate it with cascade delete
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->foreign('task_id')
                  ->references('id')
                  ->on('tasks')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->dropForeign(['task_id']);
            $table->foreign('task_id')
                  ->references('id')
                  ->on('tasks');
        });
    }
}; 
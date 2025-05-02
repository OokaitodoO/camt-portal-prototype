<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksTable extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('department_id')->constrained('departments');
            $table->string('link')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('members');
            $table->foreignId('assigned_by')->nullable()->constrained('members');
            $table->date('deadline');
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });

        // Create subtasks table
        Schema::create('subtasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('subtasks');
    }
}

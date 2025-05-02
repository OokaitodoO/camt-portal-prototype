<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('fullname');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->enum('role', ['admin', 'staff', 'manager', 'headstaff'])->default('staff');
            $table->string('department_name')->nullable();
            $table->string('profileImage')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->foreign('department_name')
                  ->references('name')
                  ->on('departments')
                  ->onUpdate('CASCADE')
                  ->onDelete('SET NULL');
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');
    }
};
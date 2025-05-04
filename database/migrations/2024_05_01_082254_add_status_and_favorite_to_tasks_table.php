<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusAndFavoriteToTasksTable extends Migration
{
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'status')) {
                $table->string('status')->default('pending')->after('link');
            }
            if (!Schema::hasColumn('tasks', 'is_favorite')) {
                $table->boolean('is_favorite')->default(false)->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['status', 'is_favorite']);
        });
    }
} 
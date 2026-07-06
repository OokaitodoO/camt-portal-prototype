<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Member;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->integer('order')->nullable()->after('profile_picture');
        });

        // Populate existing members with order values
        $members = Member::orderBy('id')->get();
        foreach ($members as $index => $member) {
            $member->update(['order' => $index + 1]);
        }

        // Make order non-nullable after populating
        Schema::table('members', function (Blueprint $table) {
            $table->integer('order')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};

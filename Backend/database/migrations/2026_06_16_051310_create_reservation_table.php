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
        Schema::create('reservation', function (Blueprint $table) {
            $table->id();
            $table->string('fullname');
            $table->date('date');
            $table->time('time_start');
            $table->time('time_end');
            $table->enum('payment_type', ['cash', 'gcash'])->nullable();
            $table->decimal('reservation_amount', 10, 2);
            $table->decimal('payment_amount', 10, 2);
            $table->string('or_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_status')->nullable();
            $table->enum('reservation_status', ['active', 'expired'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation');
    }
};

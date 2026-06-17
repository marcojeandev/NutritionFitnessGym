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
        Schema::create('contract_payment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contract')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('trainer_id')->nullable()->constrained('trainers')->onDelete('cascade');
            $table->enum('trainer_package', ['trainer_15_days', 'trainer_1_month'])->nullable();
            $table->string('payment_type')->nullable();
            $table->decimal('contract_amount', 10, 2);
            $table->decimal('payment_amount', 10, 2);
            $table->string('or_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_payment');
    }
};

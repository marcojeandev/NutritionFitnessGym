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
        Schema::create('product_paycheck', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sold_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('paid_by')->constrained('users')->onDelete('cascade')->nullable();
            $table->string('paid_by_name')->nullable();
            $table->enum('payment_type', ['cash', 'gcash']);
            $table->string('or_number');
            $table->string('transaction_id')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('paid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_paycheck');
    }
};

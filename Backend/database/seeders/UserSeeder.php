<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'firstname' => 'Admin',
            'lastname'  => 'User',
            'email'     => 'admin@example.com',
            'username'     => 'admin@example.com',
            'password'  => Hash::make('Password@123'),
            'role'      => 'admin',
            'status'      => 'active',
        ]);

        User::create([
            'firstname' => 'Cashier',
            'lastname'  => 'User',
            'email'     => 'cashier@example.com',
            'username'     => 'cashier@example.com',
            'password'  => Hash::make('Password@123'),
            'role'      => 'cashier',
            'status'      => 'active',
        ]);

        User::create([
            'firstname' => 'Member',
            'lastname'  => 'User',
            'email'     => 'member@example.com',
            'username'     => 'member@example.com',
            'password'  => Hash::make('Password@123'),
            'role'      => 'member',
            'status'      => 'active',
        ]);
    } 
}
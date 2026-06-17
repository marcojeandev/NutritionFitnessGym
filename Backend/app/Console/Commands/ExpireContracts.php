<?php

namespace App\Console\Commands;

use App\Models\Contract;
use Illuminate\Console\Command;

class ExpireContracts extends Command
{
    protected $signature = 'contracts:expire';
    protected $description = 'Expire contracts where end_date has passed';

    public function handle()
    {
        $count = Contract::where('status', 'active')
            ->where('end_date', '<', now())
            ->update(['status' => 'expired']);
        
        $this->info("Expired {$count} contracts.");
        
        return Command::SUCCESS;
    }
}
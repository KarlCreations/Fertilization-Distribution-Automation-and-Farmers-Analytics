<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SampleSale extends Model
{
    protected $table = 'sample_sales';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_number',
        'quantity_ordered',
        'price_each',
        'order_line_number',
        'sales',
        'order_date',
        'status',
        'qtr_id',
        'month_id',
        'year_id',
        'product_line',
        'msrp',
        'product_code',
        'customer_name',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'territory',
        'contact_last_name',
        'contact_first_name',
        'deal_size',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_number' => 'integer',
            'quantity_ordered' => 'integer',
            'price_each' => 'decimal:2',
            'order_line_number' => 'integer',
            'sales' => 'decimal:2',
            'order_date' => 'datetime',
            'qtr_id' => 'integer',
            'month_id' => 'integer',
            'year_id' => 'integer',
            'msrp' => 'decimal:2',
        ];
    }
}

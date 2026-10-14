<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UpdateSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('sale')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'sale_date' => ['required', 'date', 'before_or_equal:today'],
            'farmer_id' => ['required', 'integer', Rule::exists('erp_farmers', 'id')],
            'commodity_id' => ['required', 'integer', Rule::exists('erp_commodities', 'id')],
            'depot_id' => ['required', 'integer', Rule::exists('erp_depots', 'id')],
            'zone_id' => ['required', 'integer', Rule::exists('erp_zones', 'id')],
            'distributor' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
            'unit_price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'amount_paid' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'payment_status' => ['required', Rule::in(['paid', 'partial', 'unpaid'])],
            'confirm_duplicate' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['sale_date', 'farmer_id', 'commodity_id', 'depot_id', 'quantity', 'unit_price', 'payment_status'])) {
                return;
            }

            $total = round((float) $this->input('quantity') * (float) $this->input('unit_price'), 2);
            $amountPaid = (float) $this->input('amount_paid', 0);
            $paymentStatus = $this->string('payment_status')->toString();

            if ($paymentStatus === 'paid' && round($amountPaid, 2) !== $total) {
                $validator->errors()->add('amount_paid', 'A paid sale must show the full amount received.');
            }

            if ($paymentStatus === 'unpaid' && $amountPaid !== 0.0) {
                $validator->errors()->add('amount_paid', 'An unpaid sale cannot include an amount received.');
            }

            if ($paymentStatus === 'partial' && ($amountPaid <= 0 || $amountPaid >= $total)) {
                $validator->errors()->add('amount_paid', 'For a partial payment, enter an amount greater than zero and less than the sale total.');
            }

            if ($this->boolean('confirm_duplicate')) {
                return;
            }

            $sale = $this->route('sale');
            $matchingSaleExists = DB::table('erp_sales')
                ->whereDate('sale_date', $this->date('sale_date')->toDateString())
                ->where('farmer_id', $this->integer('farmer_id'))
                ->where('commodity_id', $this->integer('commodity_id'))
                ->where('depot_id', $this->integer('depot_id'))
                ->where('quantity', $this->input('quantity'))
                ->where('unit_price', $this->input('unit_price'))
                ->where('id', '!=', $sale instanceof Sale ? $sale->id : 0)
                ->exists();

            if ($matchingSaleExists) {
                $validator->errors()->add('confirm_duplicate', 'A matching sale was recorded today. Confirm that this is a separate transaction before saving.');
            }
        }];
    }
}

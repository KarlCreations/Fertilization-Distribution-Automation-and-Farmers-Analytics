<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'role', 'password', 'preferences', 'profile_photo_path',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['avatar'];

    protected function avatar(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->profile_photo_path
            ? '/storage/'.$this->profile_photo_path
            : null);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
            'finance_notification_preferences' => 'array',
        ];
    }

    public function canAccessSales(): bool
    {
        return $this->hasSalesAdministrationAccess() || in_array($this->role, ['sales', 'sales_staff'], true);
    }

    public function hasSalesAdministrationAccess(): bool
    {
        return in_array($this->role, ['executive', 'admin', 'operations_director'], true);
    }
}

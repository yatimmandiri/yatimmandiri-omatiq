<?php

namespace App\Http\Requests\Core;

use App\Models\Core\User;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['required'],
            'email' => ['required', 'string', 'email', 'max:100', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed'],
            'role' => ['required'],
        ];
    }

    protected function prepareForValidation()
    {
        $cekEmail = User::where('email', $this->email)->first();

        if ($cekEmail) {
            $this->request->remove('email');
        }

        if ($this->password == null) {
            $this->request->remove('password');
        }
    }
}

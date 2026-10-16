<?php

namespace App\Http\Controllers\Student;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParticipantPaymentController extends Controller
{
    use LogActivity, UploadFiles;

    /**
     * Upload or re-upload payment proof for the authenticated participant.
     */
    public function uploadProof(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $participant = $user->participant
            ?? Participant::where('user_id', $user->id)->first()
            ?? Participant::whereHas('student', fn ($q) => $q->where('user_id', $user->id))->first();

        if (! $participant) {
            return back()->withErrors(['payment_proof' => 'Data pendaftaran peserta tidak ditemukan.']);
        }

        $request->validate([
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ], [
            'payment_proof.required' => 'File bukti transfer wajib diunggah.',
            'payment_proof.file' => 'Bukti transfer harus berupa file dokumen atau gambar.',
            'payment_proof.mimes' => 'Format bukti transfer harus berupa JPG, PNG, atau PDF.',
            'payment_proof.max' => 'Ukuran file bukti transfer maksimal 4MB.',
        ]);

        $oldPath = $participant->payment_proof_path;
        $filePath = $this->uploadFile($oldPath, $request->file('payment_proof'), 'participants/payment_proofs');

        $previousStatus = $participant->status;
        $updates = [
            'payment_proof_path' => $filePath,
            'payment_status' => 'waiting_confirmation',
        ];

        // Jika sebelumnya ditolak, reset status pendaftaran kembali ke submitted (menunggu verifikasi)
        if ($previousStatus === 'rejected') {
            $updates['status'] = 'submitted';
        }

        $participant->update($updates);

        $this->logActivity('info', 'PARTICIPANT_UPLOAD_PAYMENT_PROOF', 'Partisipan mengunggah bukti transfer', [
            'participant_id' => $participant->id,
            'registration_number' => $participant->registration_number,
            'previous_status' => $previousStatus,
            'new_status' => $participant->status,
            'file_path' => $filePath,
        ]);

        return back()->with('success', 'Bukti transfer berhasil diunggah! Pihak panitia/keuangan akan segera memverifikasi pembayaran Anda.');
    }
}

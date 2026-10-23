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

        // Kunci jika pembayaran sudah lunas atau status sudah terverifikasi
        if ($participant->payment_status === 'paid' || $participant->status === 'verified') {
            return back()->withErrors(['payment_proof' => 'Pembayaran Anda sudah diverifikasi oleh panitia/keuangan sehingga bukti transfer tidak dapat diunggah ulang.']);
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

    /**
     * Upload or re-upload student card / document for the authenticated participant.
     */
    public function uploadDocument(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $participant = $user->participant
            ?? Participant::where('user_id', $user->id)->first()
            ?? Participant::whereHas('student', fn ($q) => $q->where('user_id', $user->id))->first();

        if (! $participant || ! $participant->student) {
            return back()->withErrors(['student_card' => 'Data santri / peserta tidak ditemukan.']);
        }

        // Kunci jika peserta sudah terverifikasi
        if ($participant->status === 'verified') {
            return back()->withErrors(['student_card' => 'Berkas pendaftaran Anda sudah diverifikasi oleh panitia sehingga dokumen tidak dapat diunggah ulang.']);
        }

        $request->validate([
            'student_card' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ], [
            'student_card.required' => 'File Kartu Pelajar / Dokumen wajib diunggah.',
            'student_card.file' => 'Berkas dokumen harus berupa file atau gambar.',
            'student_card.mimes' => 'Format berkas harus berupa JPG, PNG, atau PDF.',
            'student_card.max' => 'Ukuran berkas dokumen maksimal 4MB.',
        ]);

        $student = $participant->student;
        $oldPath = $student->student_card_path;
        $filePath = $this->uploadFile($oldPath, $request->file('student_card'), 'students/student_cards');

        $student->update([
            'student_card_path' => $filePath,
        ]);

        $previousStatus = $participant->status;
        // Jika sebelumnya ditolak, kembalikan status ke submitted untuk verifikasi ulang berkas
        if ($previousStatus === 'rejected') {
            $participant->update([
                'status' => 'submitted',
            ]);
        }

        $this->logActivity('info', 'PARTICIPANT_UPLOAD_DOCUMENT', 'Partisipan mengunggah kartu pelajar / dokumen', [
            'participant_id' => $participant->id,
            'student_id' => $student->id,
            'registration_number' => $participant->registration_number,
            'previous_status' => $previousStatus,
            'new_status' => $participant->status,
            'file_path' => $filePath,
        ]);

        return back()->with('success', 'Kartu Pelajar / Dokumen berhasil diperbarui! Panitia akan segera memverifikasi berkas Anda.');
    }
}

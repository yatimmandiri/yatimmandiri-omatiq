<?php

namespace App\Http\Controllers\Student;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Settings\SiteSettings;
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

    /**
     * Submit or re-submit national stage re-registration documents.
     */
    public function uploadNationalReRegistration(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $participant = $user->participant
            ?? Participant::where('user_id', $user->id)->first()
            ?? Participant::whereHas('student', fn ($q) => $q->where('user_id', $user->id))->first();

        if (! $participant) {
            return back()->withErrors(['availability_letter' => 'Data pendaftaran peserta tidak ditemukan.']);
        }

        $national = $participant->national;
        if (! $national) {
            return back()->withErrors(['availability_letter' => 'Anda belum terdaftar sebagai peserta yang lolos ke Babak Nasional.']);
        }

        if (! app(SiteSettings::class)->registration_national_open) {
            return back()->withErrors(['availability_letter' => 'Pendaftaran ulang babak nasional saat ini belum dibuka atau telah ditutup oleh panitia pusat.']);
        }

        if ($national->status === 'verified') {
            return back()->withErrors(['availability_letter' => 'Pendaftaran ulang babak nasional Anda sudah diverifikasi oleh panitia.']);
        }

        $isBinaan = (bool) $participant->student?->is_binaan;

        $rules = [
            'availability_letter' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ];
        $messages = [
            'availability_letter.required' => 'Surat kesediaan hadir wajib diunggah.',
            'availability_letter.file' => 'Surat kesediaan harus berupa file dokumen atau gambar.',
            'availability_letter.mimes' => 'Format surat kesediaan harus berupa JPG, PNG, atau PDF.',
            'availability_letter.max' => 'Ukuran file surat kesediaan maksimal 4MB.',
        ];

        if (! $isBinaan) {
            $rules['national_payment_proof'] = ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'];
            $messages['national_payment_proof.required'] = 'Bukti transfer biaya babak nasional wajib diunggah untuk peserta umum.';
            $messages['national_payment_proof.file'] = 'Bukti transfer harus berupa file dokumen atau gambar.';
            $messages['national_payment_proof.mimes'] = 'Format bukti transfer harus berupa JPG, PNG, atau PDF.';
            $messages['national_payment_proof.max'] = 'Ukuran file bukti transfer maksimal 4MB.';
        }

        $request->validate($rules, $messages);

        // Upload Surat Kesediaan
        $letterPath = $this->uploadFile(
            $national->availability_letter_path,
            $request->file('availability_letter'),
            'national/availability_letters'
        );

        $updates = [
            'availability_letter_path' => $letterPath,
            'registered_at' => now(),
        ];

        if ($isBinaan) {
            // Santri Binaan: 100% Gratis & Auto-Verified
            $updates['status'] = 'verified';
            $updates['payment_status'] = 'paid';
            $updates['payment_amount'] = 0;
        } else {
            // Peserta Umum: Upload Bukti Transfer & Status Menunggu Konfirmasi
            $proofPath = $this->uploadFile(
                $national->payment_proof_path,
                $request->file('national_payment_proof'),
                'national/payment_proofs'
            );
            $updates['payment_proof_path'] = $proofPath;
            $updates['status'] = 'waiting_confirmation';
            $updates['payment_status'] = 'waiting_confirmation';
        }

        $national->update($updates);

        $this->logActivity('info', 'PARTICIPANT_NATIONAL_RE_REGISTRATION', 'Partisipan mengunggah berkas daftar ulang babak nasional', [
            'participant_id' => $participant->id,
            'national_participant_id' => $national->id,
            'registration_number' => $participant->registration_number,
            'is_binaan' => $isBinaan,
            'status' => $updates['status'],
        ]);

        $successMsg = $isBinaan
            ? 'Selamat! Pendaftaran ulang babak nasional Anda berhasil diselesaikan. Kartu peserta nasional Anda sudah aktif.'
            : 'Berkas daftar ulang dan bukti transfer berhasil diunggah! Panitia/keuangan akan segera memverifikasi pembayaran Anda.';

        return back()->with('success', $successMsg);
    }

    /**
     * Submit decline / withdrawal from national stage.
     */
    public function declineNational(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $participant = $user->participant
            ?? Participant::where('user_id', $user->id)->first()
            ?? Participant::whereHas('student', fn ($q) => $q->where('user_id', $user->id))->first();

        if (! $participant) {
            return back()->withErrors(['decline_reason' => 'Data pendaftaran peserta tidak ditemukan.']);
        }

        $national = $participant->national;
        if (! $national) {
            return back()->withErrors(['decline_reason' => 'Anda belum terdaftar sebagai peserta yang lolos ke Babak Nasional.']);
        }

        if ($national->status === 'verified') {
            return back()->withErrors(['decline_reason' => 'Pendaftaran ulang babak nasional Anda sudah terverifikasi resmi oleh panitia. Mohon hubungi panitia jika ada kendala mendesak.']);
        }

        $request->validate([
            'decline_category' => ['required', 'string', 'max:50'],
            'decline_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'decline_category.required' => 'Kategori alasan pengunduran diri wajib dipilih.',
            'decline_reason.required' => 'Alasan pengunduran diri wajib diisi.',
            'decline_reason.min' => 'Alasan pengunduran diri minimal 5 karakter.',
            'decline_reason.max' => 'Alasan pengunduran diri maksimal 1000 karakter.',
        ]);

        $national->update([
            'status' => 'declined',
            'decline_category' => $request->decline_category,
            'decline_reason' => $request->decline_reason,
            'declined_at' => now(),
            'notes' => "[MENGUNDURKAN DIRI MANDIRI - {$request->decline_category}] {$request->decline_reason}",
        ]);

        $this->logActivity('info', 'PARTICIPANT_DECLINE_NATIONAL', 'Partisipan mengonfirmasi pengunduran diri dari babak nasional', [
            'participant_id' => $participant->id,
            'national_participant_id' => $national->id,
            'registration_number' => $participant->registration_number,
            'decline_category' => $request->decline_category,
            'decline_reason' => $request->decline_reason,
        ]);

        return back()->with('success', 'Konfirmasi pengunduran diri dari Babak Final Nasional berhasil dicatat. Terima kasih atas partisipasi Anda di OMATIQ 2026.');
    }
}

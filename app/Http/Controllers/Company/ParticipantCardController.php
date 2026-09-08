<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Services\BarcodeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParticipantCardController extends Controller
{
    public function __construct(
        private readonly BarcodeService $barcodeService,
    ) {}

    public function print(Request $request, string|int $identifier)
    {
        $participant = Participant::query()
            ->with([
                'olimpiade:id,name,category,event_year',
                'student:id,full_name,nik,nis,school_name,school_level,grade,photo_path,regency_id,parent_phone,mentor_name',
                'student.regency:id,name',
                'mentor:id,name',
                'user:id,name,email',
            ])
            ->where(function ($q) use ($identifier) {
                $q->where('registration_number', $identifier);
                if (is_numeric($identifier)) {
                    $q->orWhere('id', (int) $identifier);
                }
            })
            ->firstOrFail();

        // 1. Check verified status
        if ($participant->status !== 'verified') {
            abort(403, 'Kartu tanda peserta hanya dapat dicetak untuk peserta yang telah diverifikasi (status Terverifikasi).');
        }

        // 2. Authorization check if logged in
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->hasRole('Teacher') && ! $user->hasRole('Administrators')) {
                if ($participant->mentor_id !== $user->id && ! $user->can('view-participant')) {
                    abort(403, 'Anda tidak memiliki akses untuk mencetak kartu peserta ini.');
                }
            } elseif ($user->hasRole('Participant') && ! $user->hasRole('Administrators')) {
                if ($participant->user_id !== $user->id && $participant->student?->user_id !== $user->id) {
                    abort(403, 'Anda tidak memiliki akses untuk mencetak kartu peserta ini.');
                }
            }
        }

        $regNo = $participant->registration_number;
        $barcodeSvg = $this->barcodeService->generateCode128Svg($regNo, height: 36, barWidth: 1.2, color: '#17524A');
        $verifyUrl = url('/pendaftaran/kartu/'.$regNo);
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 85, color: '#17524A');

        $data = [
            'participant' => $participant,
            'student' => $participant->student,
            'barcodeSvg' => $barcodeSvg,
            'qrCodeSvg' => $qrCodeSvg,
        ];

        if ($request->query('format') === 'pdf') {
            $pdf = Pdf::loadView('cards.participant-card', $data)
                ->setPaper('a5', 'landscape');

            return $pdf->stream("Kartu-OMATIQ-{$regNo}.pdf");
        }

        return view('cards.participant-card', $data);
    }
}

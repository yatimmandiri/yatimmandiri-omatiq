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
                'student:id,full_name,nik,nis,school_name,school_level,grade,photo_path,regency_id,parent_phone,mentor_name,is_binaan',
                'student.regency:id,name',
                'mentor:id,name',
                'user:id,name,email',
                'national',
            ])
            ->where(function ($q) use ($identifier) {
                $q->where('registration_number', $identifier);
                if (is_numeric($identifier)) {
                    $q->orWhere('id', (int) $identifier);
                }
            })
            ->firstOrFail();

        // 1. Check status (only allow submitted and verified; block rejected)
        if ($participant->status === 'rejected') {
            abort(403, 'Pendaftaran untuk peserta ini ditolak. Kartu atau bukti pendaftaran tidak dapat dicetak.');
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
        $wantsNational = $request->query('stage') === 'national' || $request->boolean('national');
        $hasNational = $participant->national !== null;
        $isNational = $wantsNational || $hasNational;

        if ($wantsNational && ! $hasNational) {
            abort(403, 'Peserta belum terdaftar pada Babak Final Nasional.');
        }

        $isNationalVerified = $hasNational && $participant->national->status === 'verified';
        $isVerified = $isNational ? $isNationalVerified : ($participant->status === 'verified');

        $verifyUrl = url('/verifikasi/'.$regNo);
        $qrCodeColor = $isVerified ? '#09767a' : '#94a3b8';
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 180, color: $qrCodeColor);
        $barcodeSvg = $this->barcodeService->generateCode128Svg($regNo, height: 28, barWidth: 1.1, color: $qrCodeColor);

        $isPdf = $request->query('format') === 'pdf';

        $sponsors = [
            ['name' => 'Telkomsel', 'file' => 'telkomsel.png'],
            ['name' => 'Telkom Indonesia', 'file' => 'telkom.png'],
            ['name' => 'Chickin', 'file' => 'chickin.png'],
            ['name' => 'Bank Al-Timtara', 'file' => 'bankaltimtara.png'],
            ['name' => 'Bank BJB', 'file' => 'bankbjb.png'],
            ['name' => 'YBM PLN', 'file' => 'ybmpln.png'],
            ['name' => 'Nurul Hidayah', 'file' => 'nurulhidayah.png'],
            ['name' => 'LinkAja', 'file' => 'linkaja.png'],
            ['name' => 'LinkAja Syariah', 'file' => 'linkaja-syariah.png'],
        ];

        $data = [
            'participant' => $participant,
            'student' => $participant->student,
            'qrCodeSvg' => $qrCodeSvg,
            'barcodeSvg' => $barcodeSvg,
            'verifyUrl' => $verifyUrl,
            'isPdf' => $isPdf,
            'isNational' => $isNational,
            'isVerified' => $isVerified,
            'sponsors' => $sponsors,
        ];

        if ($request->query('format') === 'pdf') {
            $pdf = Pdf::loadView('cards.participant-card', $data)
                ->setPaper('a5', 'portrait');

            return $pdf->stream("Kartu-OMATIQ-{$regNo}.pdf");
        }

        return view('cards.participant-card', $data);
    }
}

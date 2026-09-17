<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class HealTeacherParticipants extends Command
{
    protected $signature = 'omatiq:heal-teachers {--dry-run : Only show changes without applying them} {--fix : Apply the fixes to database}';

    protected $description = 'Heal corrupted teacher accounts and re-link participants to their genuine Penyaluran mentor';

    public function handle(PenyaluranService $penyaluranService): int
    {
        $isDryRun = ! $this->option('fix');

        if ($isDryRun) {
            $this->warn('Running in DRY-RUN mode. Pass --fix to apply changes to database.');
        } else {
            $this->info('Running in FIX mode. Applying updates to database.');
        }

        // 1. Fetch all Penyaluran teachers as single source of truth
        $this->info('Fetching master teachers list from Penyaluran API...');
        $token = User::role('Teacher')->whereNotNull('penyaluran_token')->value('penyaluran_token');

        $teachersById = [];
        $teachersByCode = [];
        $teachersByPhone = [];

        try {
            $req = Http::timeout(30);
            if ($token) {
                $req = $req->withToken($token);
            }

            $page = 1;
            do {
                $res = $req->get('https://penyaluran.yatimmandiri.org/api/v1/guru/all-teachers?page='.$page);
                if (! $res->successful()) {
                    break;
                }
                $json = $res->json();
                $items = $json['data']['data'] ?? ($json['data'] ?? []);
                if (empty($items)) {
                    break;
                }
                foreach ($items as $item) {
                    $id = $item['id'] ?? null;
                    $code = $item['code'] ?? null;
                    $phone = $item['phone'] ?? null;

                    if ($id) {
                        $teachersById[$id] = $item;
                    }
                    if ($code) {
                        $teachersByCode[$code] = $item;
                    }
                    if ($phone) {
                        $clean = preg_replace('/\D+/', '', $phone);
                        $norm = preg_replace('/^(628|08|8)/', '8', $clean);
                        $teachersByPhone[$norm][] = $item;
                    }
                }
                $lastPage = $json['data']['last_page'] ?? ($json['last_page'] ?? 1);
                $page++;
            } while ($page <= $lastPage);
        } catch (\Throwable $e) {
            $this->error('Failed to fetch teachers from Penyaluran: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('Loaded '.count($teachersById).' Penyaluran teachers.');

        // 2. Resolve and fuse multi-account teachers (merging completed profile with official Penyaluran data)
        $this->info('Auditing and fusing teacher accounts...');
        $restoredAccounts = 0;
        $fusedAccounts = 0;

        foreach ($teachersById as $pt) {
            $pId = $pt['id'];
            $pCode = $pt['code'] ?? null;
            $pPhone = $pt['phone'];
            $pName = $pt['name'];
            $pKantor = $pt['kantor_name'] ?? null;

            $cleanP = preg_replace('/\D+/', '', $pPhone);
            $norm = preg_replace('/^(628|08|8)/', '8', $cleanP);
            $firstToken = mb_strtolower(explode(' ', trim($pName))[0] ?? '');

            // Find all matching local accounts
            $matches = User::role('Teacher')
                ->where(function ($q) use ($pId, $pCode, $cleanP, $norm, $firstToken) {
                    if ($pCode) {
                        $q->orWhere('penyaluran_code', $pCode);
                    }
                    if ($pId) {
                        $q->orWhere('penyaluran_id', $pId);
                    }
                    $q->orWhere(function ($sq) use ($cleanP, $norm, $firstToken) {
                        $sq->where(function ($sub) use ($cleanP, $norm) {
                            $sub->where('phone', $cleanP)
                                ->orWhere('phone', '0'.$norm)
                                ->orWhere('phone', '62'.$norm)
                                ->orWhere('phone', 'like', '%'.$norm);
                        });
                        if ($firstToken !== '') {
                            $sq->whereRaw('LOWER(name) LIKE ?', ['%'.$firstToken.'%']);
                        }
                    });
                })
                ->get();

            if ($matches->count() > 1) {
                // Priority: completed real email > has participants > has students > lowest ID
                $primary = $matches->sortByDesc(function ($u) {
                    $hasRealEmail = ! str_ends_with($u->email, '@penyaluran.local') && ! str_contains($u->email, '.merged_');
                    $pCount = Participant::where('mentor_id', $u->id)->count();
                    $sCount = Student::where('mentor_id', $u->id)->count();

                    return ($hasRealEmail ? 1000 : 0) + ($u->teacher_profile_completed_at ? 500 : 0) + ($pCount * 100) + ($sCount * 10) - $u->id;
                })->first();

                $secondaries = $matches->where('id', '!=', $primary->id);

                $this->line("Fusing {$pName} -> Primary User ID {$primary->id} ({$primary->email}) [Code: {$pCode}, Phone: {$pPhone}]");

                if (! $isDryRun) {
                    foreach ($secondaries as $sec) {
                        // Move any participants/students
                        Participant::where('mentor_id', $sec->id)->update(['mentor_id' => $primary->id]);
                        Student::where('mentor_id', $sec->id)->update(['mentor_id' => $primary->id]);

                        // Release unique keys
                        $sec->forceFill(['penyaluran_id' => null, 'penyaluran_code' => null])->save();

                        // If secondary is placeholder/merged, remove it
                        if (str_ends_with($sec->email, '@penyaluran.local') || str_contains($sec->email, '.merged_')) {
                            $sec->delete();
                        }
                    }

                    // Release unique keys held by any other user before updating primary
                    if ($pId) {
                        User::where('penyaluran_id', $pId)->where('id', '!=', $primary->id)->update(['penyaluran_id' => null]);
                    }
                    if ($pCode) {
                        User::where('penyaluran_code', $pCode)->where('id', '!=', $primary->id)->update(['penyaluran_code' => null]);
                    }

                    // Update primary with authentic Penyaluran metadata
                    $primary->forceFill([
                        'name' => $pName,
                        'phone' => $pPhone,
                        'penyaluran_id' => $pId,
                        'penyaluran_code' => $pCode,
                        'branch' => $pKantor,
                    ])->save();
                }
                $fusedAccounts++;
            } elseif ($matches->count() === 1) {
                // Single account, ensure its code and phone are up to date
                $single = $matches->first();
                if ($single->penyaluran_code !== $pCode || $single->phone !== $pPhone || $single->penyaluran_id !== $pId) {
                    if (! $isDryRun) {
                        if ($pId) {
                            User::where('penyaluran_id', $pId)->where('id', '!=', $single->id)->update(['penyaluran_id' => null]);
                        }
                        if ($pCode) {
                            User::where('penyaluran_code', $pCode)->where('id', '!=', $single->id)->update(['penyaluran_code' => null]);
                        }
                        $single->forceFill([
                            'name' => $pName,
                            'phone' => $pPhone,
                            'penyaluran_id' => $pId,
                            'penyaluran_code' => $pCode,
                            'branch' => $pKantor,
                        ])->save();
                    }
                }
            }
        }

        // 3. Re-link participants to their genuine teacher user
        $this->info('Auditing participants and re-linking to genuine mentors...');
        $participants = Participant::with(['student'])->get();
        $relinkedCount = 0;

        // Pre-load all teachers
        $allTeacherUsers = User::role('Teacher')->get();

        foreach ($participants as $p) {
            $student = $p->student;
            if (! $student) {
                continue;
            }

            $recordedMentorPhone = $student->mentor_phone;
            $recordedMentorName = $student->mentor_name;

            if (! $recordedMentorPhone && ! $recordedMentorName) {
                continue;
            }

            // Match master Penyaluran teacher
            $targetPenyaluranTeacher = null;
            if ($recordedMentorPhone) {
                $cleanP = preg_replace('/\D+/', '', $recordedMentorPhone);
                $norm = preg_replace('/^(628|08|8)/', '8', $cleanP);
                if (isset($teachersByPhone[$norm])) {
                    $candidates = $teachersByPhone[$norm];
                    if (count($candidates) === 1) {
                        $targetPenyaluranTeacher = $candidates[0];
                    } else {
                        $firstToken = mb_strtolower(explode(' ', trim($recordedMentorName ?? ''))[0] ?? '');
                        foreach ($candidates as $c) {
                            if (stripos(mb_strtolower($c['name']), $firstToken) !== false) {
                                $targetPenyaluranTeacher = $c;
                                break;
                            }
                        }
                    }
                }
            }

            if (! $targetPenyaluranTeacher && $recordedMentorName) {
                $targetPenyaluranTeacher = collect($teachersById)->firstWhere('name', $recordedMentorName);
            }

            if ($targetPenyaluranTeacher) {
                $pCode = $targetPenyaluranTeacher['code'] ?? null;
                $pId = $targetPenyaluranTeacher['id'] ?? null;
                $pName = $targetPenyaluranTeacher['name'];
                $pPhone = $targetPenyaluranTeacher['phone'];
                $pKantor = $targetPenyaluranTeacher['kantor_name'] ?? null;

                // Find local user in memory or DB
                $teacherUser = null;
                if ($pCode) {
                    $teacherUser = $allTeacherUsers->firstWhere('penyaluran_code', $pCode);
                }
                if (! $teacherUser && $pId) {
                    $teacherUser = $allTeacherUsers->firstWhere('penyaluran_id', $pId);
                }
                if (! $teacherUser && $pPhone) {
                    $clean = preg_replace('/\D+/', '', $pPhone);
                    $norm = preg_replace('/^(628|08|8)/', '8', $clean);
                    $firstToken = mb_strtolower(explode(' ', trim($pName))[0] ?? '');
                    $teacherUser = $allTeacherUsers->first(function ($u) use ($clean, $norm, $firstToken) {
                        $uClean = preg_replace('/\D+/', '', $u->phone ?? '');
                        $uNorm = preg_replace('/^(628|08|8)/', '8', $uClean);
                        $phoneMatches = ($uClean === $clean || $uNorm === $norm);
                        $nameMatches = stripos(mb_strtolower($u->name), $firstToken) !== false;

                        return $phoneMatches && $nameMatches;
                    });
                }

                // If user doesn't exist yet, create placeholder teacher user
                if (! $teacherUser && ! $isDryRun) {
                    $teacherUser = User::create([
                        'name' => $pName,
                        'email' => 'guru'.$pId.'@penyaluran.local',
                        'phone' => $pPhone,
                        'penyaluran_id' => $pId,
                        'penyaluran_code' => $pCode,
                        'branch' => $pKantor,
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                    ]);
                    $teacherUser->assignRole('Teacher');
                    $allTeacherUsers->push($teacherUser);
                }

                if ($teacherUser && ($p->mentor_id !== $teacherUser->id || $student->mentor_id !== $teacherUser->id)) {
                    $this->line("Re-linking Participant {$p->registration_number} ({$student->full_name}) -> Mentor: {$pName} [User ID {$teacherUser->id}]");

                    if (! $isDryRun) {
                        $p->update(['mentor_id' => $teacherUser->id]);
                        $student->update([
                            'mentor_id' => $teacherUser->id,
                            'mentor_name' => $pName,
                            'mentor_phone' => $pPhone,
                        ]);
                    }
                    $relinkedCount++;
                }
            }
        }

        $this->newLine();
        $this->info("Audit Complete: Fused {$fusedAccounts} teacher accounts, re-linked {$relinkedCount} participant registrations.");

        return self::SUCCESS;
    }
}

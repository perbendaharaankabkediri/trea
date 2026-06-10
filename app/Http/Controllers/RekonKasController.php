<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\RekonService;
use App\Models\Skpd;
use App\Models\RekonKas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\RekonKasExport;
use App\Exports\RekapRekonExport;
use Maatwebsite\Excel\Facades\Excel;

class RekonKasController extends Controller
{
    protected $rekonService;

    // 3. Buat Constructor untuk meng-inject RekonService ke dalam Controller
    public function __construct(RekonService $rekonService)
    {
        $this->rekonService = $rekonService;
    }

    public function index(Request $request)
    {
        $tahun = session('tahun', 2026);
        
        // Ambil daftar SKPD untuk dropdown filter
        $listSkpd = DB::table('tabel_skpd')->where('tahun', $tahun)->orderBy('kode_skpd')->get();
        $selectedSkpd = $request->kode_skpd;

        
        $list = $this->rekonService->getDataIndex($tahun, $selectedSkpd);

        return Inertia::render('Icsa/rekonKas/Index', [
            'title'        => 'Rekon Kas',
            'listSkpd'     => $listSkpd,
            'selectedSkpd' => $selectedSkpd,
            'list'         => $list,
            'tahun'        => $tahun
        ]);
    }

    /* ================= CREATE (Inertia) ================= */
    public function create(Request $request)
    {
        $tahun = session('tahun');

        $listSkpd = Skpd::where('tahun', $tahun)
                        ->orderBy('skpd')
                        ->get(['kode_skpd', 'skpd']); // Ambil field yang diperlukan saja

        return Inertia::render('Icsa/rekonKas/Create', [
            'title' => 'Tambah Rekonsiliasi',
            'listSkpd' => $listSkpd,
            'selectedSkpd' => $request->query('kode_skpd'), // Menangkap parameter query jika ada
        ]);
    }

    /* ================= STORE HEADER (Inertia) ================= */
    public function store(Request $request)
    {
        $request->validate([
            'kode_skpd' => 'required|string',
            'bulan'     => 'required|numeric|min:1|max:12'
        ]);

        $tahun    = session('tahun');
        $bulan    = str_pad($request->bulan, 2, '0', STR_PAD_LEFT);
        $kodeSkpd = $request->kode_skpd;

        // Cek Duplikat Rekon
        $sudahAda = RekonKas::where('tahun', $tahun)
            ->where('bulan', $bulan)
            ->where('kode_skpd', $kodeSkpd)
            ->exists();

        if ($sudahAda) {
            return back()->withErrors([
                'bulan' => 'Rekonsiliasi untuk SKPD dan bulan tersebut sudah ada.'
            ]);
        }

        try {
            $no_rekon = null;

            DB::transaction(function () use ($tahun, $bulan, $kodeSkpd, &$no_rekon) {
                // Generate nomor rekon sesuai logic bawaan app lama
                $no_rekon = $this->generateNoRekon($tahun, $kodeSkpd, $bulan);

                RekonKas::create([
                    'no_rekon'      => $no_rekon,
                    'tahun'         => $tahun,
                    'bulan'         => $bulan,
                    'kode_skpd'     => $kodeSkpd,
                    'tanggal_rekon' => now()->toDateString(),
                    'created'       => Auth::user()->name ?? 'system',
                    'date_created'  => now()
                ]);
            });

            // Redirect ke halaman edit bawaan Inertia dengan membawa flash session success
            return redirect()
                ->route('icsa.rekonsiliasi.edit', $no_rekon)
                ->with('success', 'Rekonsiliasi berhasil dibuat. Silakan lengkapi data kas.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Gagal membuat rekonsiliasi: ' . $e->getMessage()
            ]);
        }
    }

    /* ================= GENERATOR NO REKON (Tetap Dipertahankan) ================= */
    private function generateNoRekon($tahun, $kodeSkpd, $bulan)
    {
        $last = RekonKas::where('tahun', $tahun)
            ->where('kode_skpd', $kodeSkpd)
            ->where('bulan', $bulan)
            ->orderByDesc('no_rekon')
            ->first();

        $urut = 1;
        if ($last) {
            $urut = (int) substr($last->no_rekon, -4) + 1;
        }

        return sprintf('REKON/%s/%s/%s/%04d', $tahun, $kodeSkpd, $bulan, $urut);
    }

    public function destroy($noRekon)
    {
        if (!$noRekon) {
            return back()->with('error', 'No Rekon tidak valid');
        }

        /* ================= HEADER REKON ================= */
        $rekon = DB::table('tabel_rekon')
            ->where('no_rekon', $noRekon)
            ->first();

        if (!$rekon) {
            return back()->with('error', 'Data rekonsiliasi tidak ditemukan');
        }

        $tahun     = (int) $rekon->tahun;
        $bulan     = (int) $rekon->bulan;
        $kodeSkpd  = $rekon->kode_skpd;

        /* ================= LOCK BULAN BERANTAI ================= */
        $cekBulanSetelahnya = DB::table('tabel_rekon')
            ->where('tahun', $tahun)
            ->where('kode_skpd', $kodeSkpd)
            ->where('bulan', '>', $bulan)
            ->exists();

        if ($cekBulanSetelahnya) {
            return redirect()
                ->route('icsa.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('error', 'Rekonsiliasi tidak dapat dihapus karena bulan setelahnya masih ada');
        }

        /* ================= DELETE TRANSACTION ================= */
        try {

            DB::transaction(function () use ($noRekon) {

                $tables = [
                    'tabel_sp2d',
                    'tabel_spj',
                    'tabel_sts',
                    'tabel_bku',
                    'tabel_posisi_kas',
                    'tabel_selisih',
                    'tabel_rekon', // terakhir header
                ];

                foreach ($tables as $tbl) {
                    DB::table($tbl)
                        ->where('no_rekon', $noRekon)
                        ->delete();
                }

            });

            return redirect()
                ->route('icsa.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('success', 'Rekonsiliasi berhasil dihapus');

        } catch (\Throwable $e) {

            return redirect()
                ->route('icsa.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('error', 'Gagal menghapus rekonsiliasi');
        }
    }

    /* ================= EDIT / PROSES REKONSILIASI (Inertia) ================= */
    public function edit($noRekon)
    {
        // Decode kembali jika nomor rekon dikirim via URL dengan slash ter-encode
        $noRekon = urldecode($noRekon);

        // Lakukan LEFT JOIN ke tabel master SKPD untuk mengambil kolom nama_skpd
        $rekon = DB::table('tabel_rekon')
            ->leftJoin('tabel_skpd', 'tabel_rekon.kode_skpd', '=', 'tabel_skpd.kode_skpd') // 💡 Sesuaikan 'tabel_skpd' dengan nama tabel master SKPD Anda
            ->where('tabel_rekon.no_rekon', $noRekon)
            ->select('tabel_rekon.*', 'tabel_skpd.skpd') // 💡 Mengambil semua data rekon + nama_skpd
            ->first();

        if (!$rekon) {
            return redirect()->route('icsa.rekonsiliasi.index')
                ->with('error', 'Data rekonsiliasi tidak ditemukan.');
        }

        // Ambil seluruh paket data komplit dari Service
        $paketData = $this->rekonService->getDetailTransaksiRekon(
            $rekon->no_rekon, 
            $rekon->tahun, 
            $rekon->bulan, 
            $rekon->kode_skpd
        );

        return Inertia::render('Icsa/rekonKas/Edit', [
            'title'     => 'Proses Rekon Kas',
            'rekon'     => $rekon,
            'dataRekon' => $paketData // Data terstruktur dari Service siap pakai di frontend!
        ]);
    }

    public function update(Request $request, $no_rekon)
    {
        // Decode kembali nomor rekon jika terdapat karakter '/' ter-encode dari URL
        $noRekon = urldecode($no_rekon);

        try {
            // 💡 Ambil kode_skpd dari tabel sebelum/saat proses update untuk dipakai di redirect rute index
            $kodeSkpd = DB::table('tabel_rekon')->where('no_rekon', $noRekon)->value('kode_skpd');

            // Panggil fungsi pemrosesan update dari rekonService
            $this->rekonService->updateRekonKas($noRekon, $request->all());

            // 💡 Kirim parameter 'kode_skpd' ke route index agar dropdown otomatis ter-filter
            return redirect()
                ->route('icsa.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('success', 'Data Rekonsiliasi Kas berhasil diperbarui.');

        } catch (\Exception $e) {
            // Jika gagal, kembalikan ke halaman sebelumnya dan tampilkan pesan error
            return back()->with('error', 'Gagal memperbarui data: ' . $e->getMessage());
        }
    }

    public function cetak($no_rekon)
    {
        // Decode jika nomor rekon dikirim via URL dengan slash ter-encode
        $noRekon = urldecode($no_rekon);

        $data = $this->rekonService->getCetakData($noRekon);
        $data['title'] = 'Cetak Rekonsiliasi';

        // Bersihkan nomor rekon dari karakter slash untuk nama file download
        $safeFileName = str_replace(['/', '\\'], '-', $noRekon);

        // Load view blade konvensional (bukan Inertia::render)
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('icsa.cetakpdf', $data)
                ->setPaper([0, 0, 609.4488, 935.433], 'portrait'); // Ukuran F4 Presisi

        return $pdf->stream('Rekon_' . $safeFileName . '.pdf');
    }

    public function excel($no_rekon)
    {
        $noRekon = urldecode($no_rekon);

        // 💡 Ambil data yang sama persis dengan fungsi cetak PDF
        $data = $this->rekonService->getCetakData($noRekon);
        
        $safeFileName = str_replace(['/', '\\'], '-', $noRekon);

        // Download langsung sebagai file .xlsx
        return Excel::download(
            new RekonKasExport($data), 
            'Rekon_' . $safeFileName . '.xlsx'
        );
    }

    // 1. FUNGSI UNTUK TAMPILKAN DI REACT SCREEN
    public function rekapdata(Request $request)
    {
        $tahun = session('tahun');
        $bulan = $request->bulan ? (int)$request->bulan : null;

        // Ambil data dari fungsi private bersama
        $rekap = $this->getSharedRekapData($bulan, $tahun);

        return Inertia::render('Icsa/rekonKas/RekapData', [
            'title'         => 'Rekap Kas',
            'dataRealisasi' => $rekap['dataRealisasi'],
            'grandTotal'    => $rekap['grandTotal'],
            'bulanNama'     => $this->bulanNama(),
            'filters'       => [
                'bulan' => $request->bulan ?? ''
            ]
        ]);
    }

    // 2. FUNGSI KHUSUS DOWNLOAD EXCEL (Panggil data yang sama)
    public function exportExcel(Request $request)
    {
        $tahun = session('tahun');
        $bulan = (int)$request->bulan;

        // Panggil fungsi private yang sama persis, data dijamin sinkron!
        $rekap = $this->getSharedRekapData($bulan, $tahun);

        // TIPS: Konversi grandTotal menjadi object (object) agar di template blade 
        // bisa dipanggil dengan panah ($grandTotal->total_sp2d) tanpa error
        $grandTotalObject = $rekap['grandTotal'] ? (object)$rekap['grandTotal'] : null;

        return Excel::download(
            new RekapRekonExport($rekap['dataRealisasi'], $grandTotalObject), 
            'Rekap_Realisasi_Bulan_' . $bulan . '.xlsx'
        );
    }

    // 3. FUNGSI PRIVATE (Pusat Logika Pengumpulan Data)
    private function getSharedRekapData($bulan, $tahun)
    {
        $dataRealisasi = [];
        $grandTotal = null;

        if ($bulan) {
            $skpds = DB::table('tabel_skpd')->orderBy('kode_skpd')->get();

            foreach ($skpds as $skpd) {
                $rekon = DB::table('tabel_rekon')
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->where('kode_skpd', $skpd->kode_skpd)
                    ->first();

                if ($rekon) {
                    $detail = $this->rekonService->getCetakData($rekon->no_rekon);
                    
                    $p = $detail['dataA']['penerimaan'] ?? [];
                    $q = $detail['dataA']['pengeluaran'] ?? [];

                    $total_sp2d = (float)(($p['ls'] ?? 0) + ($p['up_gu'] ?? 0) + ($p['tu'] ?? 0) + ($p['gukkpd'] ?? 0));
                    $total_spj  = (float)(($q['spj_ls'] ?? 0) + ($q['spj_up_gu'] ?? 0) + ($q['spj_tu'] ?? 0) + ($q['spj_gukkpd'] ?? 0));
                    $total_sts  = (float)(($q['sts_up_gu'] ?? 0) + ($q['sts_tu'] ?? 0) + ($q['cp_ls'] ?? 0) + ($q['cp_up_gu'] ?? 0) + ($q['cp_tu'] ?? 0));

                    $dataRealisasi[] = (object) [
                        'kode_skpd'   => $skpd->kode_skpd,
                        'nama_skpd'   => $skpd->skpd,
                        
                        // SP2D Rinci
                        'sp2d_ls'     => (float)($p['ls'] ?? 0),
                        'sp2d_upgu'   => (float)($p['up_gu'] ?? 0),
                        'sp2d_tu'     => (float)($p['tu'] ?? 0),
                        'sp2d_gukkpd' => (float)($p['gukkpd'] ?? 0),
                        'total_sp2d'  => $total_sp2d,
                        
                        // SPJ Rinci
                        'spj_ls'      => (float)($q['spj_ls'] ?? 0),
                        'spj_upgu'    => (float)($q['spj_up_gu'] ?? 0),
                        'spj_tu'      => (float)($q['spj_tu'] ?? 0),
                        'spj_gukkpd'  => (float)($q['spj_gukkpd'] ?? 0),
                        'total_spj'   => $total_spj,
                        
                        // STS Rinci (SEBELUMNYA KETINGGALAN DI SINI)
                        'sts_up_gu'   => (float)($q['sts_up_gu'] ?? 0),
                        'sts_tu'      => (float)($q['sts_tu'] ?? 0),
                        'cp_ls'       => (float)($q['cp_ls'] ?? 0),
                        'cp_up_gu'    => (float)($q['cp_up_gu'] ?? 0),
                        'cp_tu'       => (float)($q['cp_tu'] ?? 0),
                        'total_sts'   => $total_sts,
                        
                        // Kas & Selisih
                        'kas_sipd'    => (float)($detail['tabA']['saldo_kas'] ?? 0),
                        'kas_bank'    => (float)($detail['totalKasBank'] ?? 0),
                        'kas_tunai'   => (float)($detail['totalKasTunai'] ?? 0),
                        'selisih'     => (float)($detail['selisihAC'] ?? 0),
                    ];
                } else {
                    $dataRealisasi[] = (object) [
                        'kode_skpd' => $skpd->kode_skpd, 'nama_skpd' => $skpd->skpd,
                        'sp2d_ls' => 0, 'sp2d_upgu' => 0, 'sp2d_tu' => 0, 'sp2d_gukkpd' => 0, 'total_sp2d' => 0,
                        'spj_ls' => 0, 'spj_upgu' => 0, 'spj_tu' => 0, 'spj_gukkpd' => 0, 'total_spj' => 0,
                        
                        // Batalkan nilai kosong untuk rincian STS di sini juga
                        'sts_up_gu' => 0, 'sts_tu' => 0, 'cp_ls' => 0, 'cp_up_gu' => 0, 'cp_tu' => 0,
                        'total_sts' => 0, 
                        
                        'kas_sipd' => 0, 'kas_bank' => 0, 'kas_tunai' => 0, 'selisih' => 0,
                    ];
                }
            }

            $collection = collect($dataRealisasi);
            $grandTotal = [
                'total_sp2d' => $collection->sum('total_sp2d'),
                'total_spj'  => $collection->sum('total_spj'),
                'total_sts'  => $collection->sum('total_sts'),
                'kas_sipd'   => $collection->sum('kas_sipd'),
                'kas_bank'   => $collection->sum('kas_bank'),
                'kas_tunai'  => $collection->sum('kas_tunai'),
                'selisih'    => $collection->sum('selisih'),
            ];
        }

        return compact('dataRealisasi', 'grandTotal');
    }

    private function bulanNama()
    {
        return [
            1=>'Januari',2=>'Februari',3=>'Maret',4=>'April',
            5=>'Mei',6=>'Juni',7=>'Juli',8=>'Agustus',
            9=>'September',10=>'Oktober',11=>'November',12=>'Desember'
        ];
    }

    public function rekapmonitoring(Request $request)
    {
        $tahun    = session('tahun');
        $kodeSkpd = $request->kode_skpd;
        $bulan    = $request->bulan;
        $statusFilter = $request->status ?? 'all';

        $dataRekap = collect();
        
        // DEFAULT VALUE SUMMARY
        $summary = [
            'total'  => 0,
            'sudah'  => 0,
            'proses' => 0,
            'belum'  => 0,
        ];

        if (!empty($bulan)) {
            $querySkpd = DB::table('tabel_skpd');
            if ($kodeSkpd && $kodeSkpd !== 'all') {
                $querySkpd->where('kode_skpd', $kodeSkpd);
            }
            $listTampil = $querySkpd->orderBy('kode_skpd')->get();

            // Query Agregat
            $sp2d = DB::table('tabel_sp2d')->where('tahun', $tahun)->where('bulan', $bulan)->selectRaw("kode_skpd, SUM(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total")->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $spj = DB::table('tabel_spj')->where('tahun', $tahun)->where('bulan', $bulan)->selectRaw("kode_skpd, SUM(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total")->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $sts = DB::table('tabel_sts')->where('tahun', $tahun)->where('bulan', $bulan)->selectRaw("kode_skpd, SUM(sts_upgu + sts_tu + cp_ls + cp_upgu + cp_tu) as total")->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $kasReal = DB::table('tabel_posisi_kas')->where('tahun', $tahun)->where('bulan', $bulan)->selectRaw("kode_skpd, SUM(kas_di_bank + kas_tunai) as total")->groupBy('kode_skpd')->pluck('total', 'kode_skpd');

            $rekonRef = DB::table('tabel_rekon')->where('tahun', $tahun)->where('bulan', $bulan)->pluck('no_rekon', 'kode_skpd');
            $selisihKet = DB::table('tabel_selisih')->where('tahun', $tahun)->where('bulan', $bulan)->pluck('keterangan_posisi_kas', 'kode_skpd');

            $dataRekap = $listTampil->map(function ($s) use ($tahun, $bulan, $sp2d, $spj, $sts, $kasReal, $rekonRef, $selisihKet) {
                $saldoAwal = $this->rekonService->hitungSaldoAwal($tahun, (int)$bulan, $s->kode_skpd);
                $kasSipd   = $saldoAwal + (float)($sp2d[$s->kode_skpd] ?? 0) - (float)($spj[$s->kode_skpd] ?? 0) - (float)($sts[$s->kode_skpd] ?? 0);
                $totalKasReal = (float)($kasReal[$s->kode_skpd] ?? 0);
                $selisih      = (float)number_format($kasSipd - $totalKasReal, 2, '.', '');
                $noRekon      = $rekonRef[$s->kode_skpd] ?? null;
                
                $status = 'BELUM';
                if ($noRekon) {
                    $status = ($selisih == 0 || isset($selisihKet[$s->kode_skpd])) ? 'SUDAH' : 'PROSES';
                }

                // Ubah ke array biasa agar mulus di-serialize ke JSON oleh Inertia
                return [
                    'kode_skpd'    => $s->kode_skpd,
                    'skpd'         => $s->skpd,
                    'bulan'        => (int)$bulan,
                    'kas_sipd'     => $kasSipd,
                    'kas_real'     => $totalKasReal,
                    'selisih'      => $selisih,
                    'no_rekon'     => $noRekon,
                    'keterangan'   => $selisihKet[$s->kode_skpd] ?? null,
                    'status_rekon' => $status
                ];
            });

            // HITUNG SUMMARY
            $summary = [
                'total'  => $dataRekap->count(),
                'sudah'  => $dataRekap->where('status_rekon', 'SUDAH')->count(),
                'proses' => $dataRekap->where('status_rekon', 'PROSES')->count(),
                'belum'  => $dataRekap->where('status_rekon', 'BELUM')->count(),
            ];

            // FILTER STATUS JIKA BUKAN ALL (.values() untuk me-reset index array)
            if ($statusFilter !== 'all') {
                $dataRekap = $dataRekap->where('status_rekon', strtoupper($statusFilter))->values();
            }
        }

        return Inertia::render('Icsa/rekonKas/RekapMonitoring', [
            'title'        => 'Monitoring Kas',
            'dataRekap'    => $dataRekap,
            'listSkpd'     => \App\Models\Skpd::all(),
            'bulanNama'    => $this->bulanNama(),
            'summary'      => (object)$summary,
            'sessionTahun' => $tahun,
            'filters'      => [
                'kode_skpd' => $kodeSkpd ?? 'all',
                'bulan'     => $bulan ?? '',
                'status'    => $statusFilter,
            ]
        ]);
    }
}

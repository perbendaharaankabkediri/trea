<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RekonService
{
    /**
     * Mengambil dan mengalkulasi data rekonsiliasi kas untuk halaman index utama
     */
    public function getDataIndex($tahun, $selectedSkpd = null)
    {
        // 1. Ambil data dasar rekon dengan join SKPD
        $query = DB::table('tabel_rekon as r')
            ->leftJoin('tabel_skpd as s', function ($join) {
                $join->on('s.kode_skpd', '=', 'r.kode_skpd')
                     ->on('s.tahun', '=', 'r.tahun');
            })
            ->where('r.tahun', $tahun);

        if ($selectedSkpd) {
            $query->where('r.kode_skpd', $selectedSkpd);
        }

        $rekonRows = $query->select('r.*', 's.skpd as nama_skpd')
            ->orderBy('r.kode_skpd')
            ->orderBy('r.bulan')
            ->get();

        if ($rekonRows->isEmpty()) {
            return collect();
        }

        $noRekonList = $rekonRows->pluck('no_rekon')->toArray();

        // 2. Batch query untuk performa halaman utama (In-Memory Processing)
        $sp2dMap = DB::table('tabel_sp2d')
            ->whereIn('no_rekon', $noRekonList)
            ->select('no_rekon', 'nilai_ls', 'nilai_upgu', 'nilai_tu', 'nilai_gukkpd', DB::raw('(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total'))
            ->get()->keyBy('no_rekon');

        $spjMap = DB::table('tabel_spj')
            ->whereIn('no_rekon', $noRekonList)
            ->select('no_rekon', 'nilai_ls', 'nilai_upgu', 'nilai_tu', 'nilai_gukkpd', DB::raw('(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total'))
            ->get()->keyBy('no_rekon');

        $stsMap = DB::table('tabel_sts')
            ->whereIn('no_rekon', $noRekonList)
            ->select('no_rekon', 'sts_upgu', 'sts_tu', 'cp_ls', 'cp_upgu', 'cp_tu', DB::raw('(sts_upgu + sts_tu + cp_ls + cp_upgu + cp_tu) as total'))
            ->get()->keyBy('no_rekon');

        $kasMap = DB::table('tabel_posisi_kas')
            ->whereIn('no_rekon', $noRekonList)
            ->select('no_rekon', DB::raw('SUM(kas_tunai + kas_di_bank) as total'))
            ->groupBy('no_rekon')->get()->keyBy('no_rekon');

        $selisihMap = DB::table('tabel_selisih')
            ->whereIn('no_rekon', $noRekonList)
            ->select('no_rekon', 'keterangan_posisi_kas')
            ->get()->keyBy('no_rekon');

        // Kelompokkan data rekon berdasarkan SKPD untuk mempermudah kalkulasi saldo awal sekuensial
        $rekonBySkpd = $rekonRows->groupBy('kode_skpd');
        $calculatedData = collect();

        foreach ($rekonBySkpd as $kodeSkpd => $rows) {
            // Urutkan dari bulan terkecil (01, 02, dst)
            $sortedRows = $rows->sortBy('bulan');
            $runningSaldoAwal = 0.0;

            foreach ($sortedRows as $rekon) {
                $noRekon = $rekon->no_rekon;
                $bulan   = $rekon->bulan;

                $totalSp2d = (float) ($sp2dMap[$noRekon]->total ?? 0);
                $totalSpj  = (float) ($spjMap[$noRekon]->total  ?? 0);
                $totalSts  = (float) ($stsMap[$noRekon]->total  ?? 0);
                $kasRiil   = (float) ($kasMap[$noRekon]->total  ?? 0);

                // Menggunakan running total saldo awal secara in-memory (0 Query tambahan)
                $kasSipd   = $runningSaldoAwal + $totalSp2d - $totalSpj - $totalSts;
                $selisihAC = round($kasSipd - $kasRiil, 2);

                $selisihRow = $selisihMap[$noRekon] ?? null;
                $status     = ($selisihAC == 0 || !empty($selisihRow?->keterangan_posisi_kas)) ? 'SUDAH' : 'PROSES';

                $calculatedData->push([
                    'no_rekon'      => $noRekon,
                    'kode_skpd'     => $rekon->kode_skpd,
                    'nama_skpd'     => $rekon->nama_skpd,
                    'tahun'         => $rekon->tahun,
                    'bulan'         => (int) $bulan,
                    'tanggal_rekon' => $rekon->tanggal_rekon,
                    'total_sp2d'    => $totalSp2d,
                    'total_spj'     => $totalSpj,
                    'total_sts'     => $totalSts,
                    'kas_sipd'      => $kasSipd,
                    'kas_riil'      => $kasRiil,
                    'selisih_ac'    => $selisihAC,
                    'status'        => $status,
                    'keterangan'    => $selisihRow?->keterangan_posisi_kas ?? null,
                ]);

                // Akumulasi untuk saldo awal bulan berikutnya: Saldo Awal + Penerimaan - Pengeluaran
                $sp2dRow = $sp2dMap[$noRekon] ?? null;
                $spjRow  = $spjMap[$noRekon] ?? null;
                $stsRow  = $stsMap[$noRekon] ?? null;

                $penerimaanBulanIni = (float)($sp2dRow->nilai_ls ?? 0) + (float)($sp2dRow->nilai_upgu ?? 0) + (float)($sp2dRow->nilai_tu ?? 0) + (float)($sp2dRow->nilai_gukkpd ?? 0);
                $pengeluaranBulanIni = (float)($spjRow->nilai_ls ?? 0) + (float)($spjRow->nilai_upgu ?? 0) + (float)($spjRow->nilai_tu ?? 0) + (float)($spjRow->nilai_gukkpd ?? 0)
                                     + (float)($stsRow->sts_upgu ?? 0) + (float)($stsRow->sts_tu ?? 0) + (float)($stsRow->cp_ls ?? 0) + (float)($stsRow->cp_upgu ?? 0) + (float)($stsRow->cp_tu ?? 0);

                $runningSaldoAwal = $runningSaldoAwal + $penerimaanBulanIni - $pengeluaranBulanIni;
            }
        }

        // Kembalikan urutan sesuai struktur awal (berdasarkan bulan)
        return $calculatedData->sortBy('bulan')->values();
    }

    /**
     * Hitung Saldo Awal Tab A (SIPD) secara Rekursif (Tetap dipertahankan untuk halaman Detail/Cetak tunggal)
     */
    public function hitungSaldoAwal($tahun, $bulan, $kodeSkpd)
    {
        $bulanInt = (int) $bulan;
        if ($bulanInt === 1) return 0;

        $prevBulanInt = $bulanInt - 1;
        $prevBulanStr = str_pad($prevBulanInt, 2, '0', STR_PAD_LEFT);

        $prevRekon = DB::table('tabel_rekon')
            ->where('tahun', $tahun)
            ->where('bulan', $prevBulanStr)
            ->where('kode_skpd', $kodeSkpd)
            ->orderByDesc('no_rekon')
            ->first();

        if (!$prevRekon) return 0;

        $saldoAwalPrev = $this->hitungSaldoAwal($tahun, $prevBulanStr, $kodeSkpd);
        $dataPrev = $this->getTabADataRaw($prevRekon->no_rekon);
        
        $penerimaanPrev = array_sum($dataPrev['penerimaan']);
        $pengeluaranPrev = array_sum($dataPrev['pengeluaran']);

        return $saldoAwalPrev + $penerimaanPrev - $pengeluaranPrev;
    }

    /**
     * Hitung Saldo Awal Tab B (BKU) secara Rekursif
     */
    public function hitungSaldoAwalBku($tahun, $bulan, $kodeSkpd)
    {
        $bulanInt = (int) $bulan;
        if ($bulanInt === 1) return 0;

        $prevBulanInt = $bulanInt - 1;
        $prevBulanStr = str_pad($prevBulanInt, 2, '0', STR_PAD_LEFT);

        $prevRekon = DB::table('tabel_rekon')
            ->where('tahun', $tahun)
            ->where('bulan', $prevBulanStr)
            ->where('kode_skpd', $kodeSkpd)
            ->orderByDesc('no_rekon')
            ->first();

        if (!$prevRekon) return 0;

        $bkuPrev = DB::table('tabel_bku')
            ->where('no_rekon', $prevRekon->no_rekon)
            ->first();

        if (!$bkuPrev) return 0;

        $saldoAwalBulanLalu = $this->hitungSaldoAwalBku($tahun, $prevBulanStr, $kodeSkpd);

        return $saldoAwalBulanLalu 
            + (float) ($bkuPrev->penerimaan ?? 0) 
            - (float) ($bkuPrev->pengeluaran ?? 0);
    }

    /**
     * Helper untuk mengambil data mentah Tab A (SP2D, SPJ, STS)
     */
    public function getTabADataRaw($noRekon)
    {
        $sp2d = DB::table('tabel_sp2d')->where('no_rekon', $noRekon)->first();
        $spj  = DB::table('tabel_spj')->where('no_rekon', $noRekon)->first();
        $sts  = DB::table('tabel_sts')->where('no_rekon', $noRekon)->first();

        return [
            'penerimaan' => [
                'ls'       => (float) ($sp2d->nilai_ls ?? 0),
                'up_gu'    => (float) ($sp2d->nilai_upgu ?? 0),
                'tu'       => (float) ($sp2d->nilai_tu ?? 0),
                'gukkpd'   => (float) ($sp2d->nilai_gukkpd ?? 0),
            ],
            'pengeluaran' => [
                'spj_ls'    => (float) ($spj->nilai_ls ?? 0),
                'spj_up_gu' => (float) ($spj->nilai_upgu ?? 0),
                'spj_tu'    => (float) ($spj->nilai_tu ?? 0),
                'spj_gukkpd'=> (float) ($spj->nilai_gukkpd ?? 0),
                'sts_up_gu' => (float) ($sts->sts_upgu ?? 0),
                'sts_tu'    => (float) ($sts->sts_tu ?? 0),
                'cp_ls'     => (float) ($sts->cp_ls ?? 0),
                'cp_up_gu'  => (float) ($sts->cp_upgu ?? 0),
                'cp_tu'     => (float) ($sts->cp_tu ?? 0),
            ]
        ];
    }

    /**
     * Mengumpulkan SEMUA data yang dibutuhkan oleh halaman Edit Rekon Kas
     */
    public function getDetailTransaksiRekon($noRekon, $tahun, $bulan, $kodeSkpd)
    {
        $tabA = $this->getTabADataRaw($noRekon);
        $saldoAwalA = $this->hitungSaldoAwal($tahun, $bulan, $kodeSkpd);

        $tabB = DB::table('tabel_bku')->where('no_rekon', $noRekon)->first() ?? [
            'penerimaan' => 0,
            'pengeluaran' => 0
        ];
        $saldoAwalB = $this->hitungSaldoAwalBku($tahun, $bulan, $kodeSkpd);

        $posisiKas = DB::table('tabel_posisi_kas')->where('no_rekon', $noRekon)->get();
        $listBendahara = DB::table('tabel_bendahara')
            ->where('tahun', $tahun)
            ->where('kode_skpd', $kodeSkpd)
            ->get();

        $selisih = DB::table('tabel_selisih')->where('no_rekon', $noRekon)->first();

        return [
            'tabA' => [
                'saldo_awal' => $saldoAwalA,
                'penerimaan' => $tabA['penerimaan'],
                'pengeluaran' => $tabA['pengeluaran'],
            ],
            'tabB' => [
                'saldo_awal' => $saldoAwalB,
                'penerimaan' => (float) ($tabB->penerimaan ?? 0),
                'pengeluaran' => (float) ($tabB->pengeluaran ?? 0),
            ],
            'tabC' => [
                'posisi_kas' => $posisiKas,
                'list_bendahara' => $listBendahara
            ],
            'keterangan_selisih' => [
                'keterangan_bku' => $selisih->keterangan_bku ?? '',
                'keterangan_posisi_kas' => $selisih->keterangan_posisi_kas ?? '',
            ]
        ];
    }

    /**
     * Memproses update data komplit 6 tabel rekonsiliasi kas
     */
    public function updateRekonKas($noRekon, array $rawData)
    {
        $data = isset($rawData['data']) ? $rawData['data'] : $rawData;

        DB::beginTransaction();

        try {
            $rekon = DB::table('tabel_rekon')->where('no_rekon', $noRekon)->first();

            if (!$rekon) {
                throw new \Exception("Data induk rekonsiliasi dengan nomor {$noRekon} tidak ditemukan.");
            }

            $operator = Auth::user()->name ?? 'system';
            $now = now();

            DB::table('tabel_sp2d')->updateOrInsert(
                ['no_rekon' => $noRekon],
                [
                    'tahun'         => $rekon->tahun,
                    'bulan'         => $rekon->bulan,
                    'kode_skpd'     => $rekon->kode_skpd,
                    'nilai_ls'      => $this->cleanNumber($data['sp2d_ls'] ?? 0),
                    'nilai_upgu'    => $this->cleanNumber($data['sp2d_upgu'] ?? 0),
                    'nilai_tu'      => $this->cleanNumber($data['sp2d_tu'] ?? 0),
                    'nilai_gukkpd'  => $this->cleanNumber($data['sp2d_gukkpd'] ?? 0),
                    'modified'      => $operator,
                    'date_modified' => $now
                ]
            );

            DB::table('tabel_spj')->updateOrInsert(
                ['no_rekon' => $noRekon],
                [
                    'tahun'         => $rekon->tahun,
                    'bulan'         => $rekon->bulan,
                    'kode_skpd'     => $rekon->kode_skpd,
                    'nilai_ls'      => $this->cleanNumber($data['spj_ls'] ?? 0),
                    'nilai_upgu'    => $this->cleanNumber($data['spj_upgu'] ?? 0),
                    'nilai_tu'      => $this->cleanNumber($data['spj_tu'] ?? 0),
                    'nilai_gukkpd'  => $this->cleanNumber($data['spj_gukkpd'] ?? 0),
                    'modified'      => $operator,
                    'date_modified' => $now
                ]
            );

            DB::table('tabel_sts')->updateOrInsert(
                ['no_rekon' => $noRekon],
                [
                    'tahun'         => $rekon->tahun,
                    'bulan'         => $rekon->bulan,
                    'kode_skpd'     => $rekon->kode_skpd,
                    'sts_upgu'      => $this->cleanNumber($data['sts_upgu'] ?? 0),
                    'sts_tu'        => $this->cleanNumber($data['sts_tu'] ?? 0),
                    'cp_ls'         => $this->cleanNumber($data['cp_ls'] ?? 0),
                    'cp_upgu'       => $this->cleanNumber($data['cp_upgu'] ?? 0),
                    'cp_tu'         => $this->cleanNumber($data['cp_tu'] ?? 0),
                    'modified'      => $operator,
                    'date_modified' => $now
                ]
            );

            DB::table('tabel_bku')->updateOrInsert(
                ['no_rekon' => $noRekon],
                [
                    'tahun'         => $rekon->tahun,
                    'bulan'         => $rekon->bulan,
                    'kode_skpd'     => $rekon->kode_skpd,
                    'penerimaan'    => $this->cleanNumber($data['bku_penerimaan'] ?? 0),
                    'pengeluaran'   => $this->cleanNumber($data['bku_pengeluaran'] ?? 0),
                    'modified'      => $operator,
                    'date_modified' => $now
                ]
            );

            if (isset($data['posisi_kas']) && is_array($data['posisi_kas'])) {
                DB::table('tabel_posisi_kas')->where('no_rekon', $noRekon)->delete();

                foreach ($data['posisi_kas'] as $row) {
                    DB::table('tabel_posisi_kas')->insert([
                        'no_rekon'         => $noRekon,
                        'tahun'            => $rekon->tahun,
                        'bulan'            => $rekon->bulan,
                        'kode_skpd'        => $rekon->kode_skpd,
                        'jenis_bendahara'  => $row['jenis_bendahara'],
                        'bidang_bendahara' => $row['bidang_bendahara'] ?? '',
                        'kas_tunai'        => $this->cleanNumber($row['kas_tunai'] ?? 0),
                        'kas_di_bank'      => $this->cleanNumber($row['kas_di_bank'] ?? 0),
                    ]);
                }
            }

            DB::table('tabel_selisih')->updateOrInsert(
                ['no_rekon' => $noRekon],
                [
                    'tahun'                 => $rekon->tahun,
                    'bulan'                 => $rekon->bulan,
                    'kode_skpd'             => $rekon->kode_skpd,
                    'selisih_bku'           => $this->cleanNumber($data['selisih_ab'] ?? 0),
                    'selisih_posisi_kas'    => $this->cleanNumber($data['selisih_ac'] ?? 0),
                    'keterangan_bku'        => $data['keterangan_bku'] ?? null,
                    'keterangan_posisi_kas' => $data['keterangan_posisi_kas'] ?? null,
                    'modified'              => $operator,
                    'date_modified'         => $now
                ]
            );

            DB::table('tabel_rekon')
                ->where('no_rekon', $noRekon)
                ->update([
                    'tanggal_rekon' => $data['tanggal_rekon'] ?? null,
                    'modified'      => $operator,
                    'date_modified' => $now
                ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function cleanNumber($val)
    {
        if (is_numeric($val)) return (float) $val;
        if (!$val) return 0.0;

        $str = preg_replace('/[^0-9.,-]/', '', $val);

        if (strpos($str, '.') !== false && strpos($str, ',') !== false) {
            $str = str_replace('.', '', $str);
            $str = str_replace(',', '.', $str);
        } elseif (strpos($str, ',') !== false) {
            $str = str_replace(',', '.', $str);
        }

        return is_numeric($str) ? (float) $str : 0.0;
    }

    public function getCetakData($noRekon)
    {
        $rekon = DB::table('tabel_rekon as r')
            ->leftJoin('tabel_skpd as s', function($j){
                $j->on('s.kode_skpd','=','r.kode_skpd')->on('s.tahun','=','r.tahun');
            })
            ->where('r.no_rekon',$noRekon)
            ->select('r.*','s.skpd')
            ->first();

        if(!$rekon) abort(404);

        $tanggal = Carbon::parse($rekon->tanggal_rekon);
        $bulan = (int) $rekon->bulan;
        $tahun = (int) $rekon->tahun;
        $kodeSkpd = $rekon->kode_skpd;

        $bulanMap = [
            1=>'Januari',2=>'Februari',3=>'Maret',4=>'April',
            5=>'Mei',6=>'Juni',7=>'Juli',8=>'Agustus',
            9=>'September',10=>'Oktober',11=>'November',12=>'Desember'
        ];

        $hariMap = [
            'Monday'=>'Senin','Tuesday'=>'Selasa','Wednesday'=>'Rabu',
            'Thursday'=>'Kamis','Friday'=>'Jumat','Saturday'=>'Sabtu','Sunday'=>'Minggu'
        ];

        $hari = $hariMap[$tanggal->format('l')] ?? '';
        $bulanCetak = $bulanMap[$tanggal->month];
        $bulanNama = $bulanMap[(int)$rekon->bulan];

        $dataA = $this->getTabA($noRekon);

        $saldoAwal = $this->hitungSaldoAwal($rekon->tahun, (int)$rekon->bulan, $rekon->kode_skpd);
        $penerimaan = array_sum($dataA['penerimaan']);
        $pengeluaran = array_sum($dataA['pengeluaran']);
        $saldoKas = $saldoAwal + $penerimaan - $pengeluaran;

        $tabA = [
            'saldo_awal'=>$saldoAwal,
            'penerimaan'=>$penerimaan,
            'pengeluaran'=>$pengeluaran,
            'saldo_kas'=>$saldoKas
        ];

        $bku = DB::table('tabel_bku')->where('no_rekon',$noRekon)->first();

        $tabB = [
            'penerimaan'=>$bku->penerimaan ?? 0,
            'pengeluaran'=>$bku->pengeluaran ?? 0
        ];

        $saldoAwalBku = $this->hitungSaldoAwalBku($tahun, $bulan, $kodeSkpd);
        $saldoAkhirBku = $saldoAwalBku + $tabB['penerimaan'] - $tabB['pengeluaran'];
        $selisihAB = $saldoKas - $saldoAkhirBku;

        $posisiKas = DB::table('tabel_posisi_kas')->where('no_rekon',$noRekon)->get();
        $listBendahara = DB::table('tabel_bendahara')
            ->where('tahun', $rekon->tahun)
            ->where('kode_skpd', $rekon->kode_skpd)
            ->get();

        $kasTunaiBP  = 0;
        $kasTunaiBPP = 0;
        $kasBank = [];

        $kasBank['001|'] = [
            'label' => 'Bendahara Pengeluaran',
            'nilai' => 0
        ];

        foreach ($listBendahara as $b) {
            if ($b->jenis_bendahara !== '001') {
                $key = $b->jenis_bendahara.'|'.($b->bidang_bendahara ?? '');
                $kasBank[$key] = [
                    'label' => 'BPP '.$b->bidang_bendahara,
                    'nilai' => 0
                ];
            }
        }

        foreach ($posisiKas as $row) {
            $key = $row->jenis_bendahara.'|'.($row->bidang_bendahara ?? '');

            if ($row->jenis_bendahara === '001') {
                $kasTunaiBP += $row->kas_tunai;
            } else {
                $kasTunaiBPP += $row->kas_tunai;
            }

            if (isset($kasBank[$key])) {
                $kasBank[$key]['nilai'] = $row->kas_di_bank;
            }
        }

        $totalKasTunai = $kasTunaiBP + $kasTunaiBPP;
        $totalKasBank = array_sum(array_column($kasBank, 'nilai'));
        $jumlahKas = $totalKasTunai + $totalKasBank;
        $selisihAC = $saldoKas - $jumlahKas;

        $skpdNama = $rekon->skpd ?? '-';

        $selisihRow = DB::table('tabel_selisih')->where('no_rekon', $noRekon)->first();
        $ketSelisihB = $selisihRow->keterangan_bku ?? '-';
        $ketSelisihC = $selisihRow->keterangan_posisi_kas ?? '-';

        $bendahara = DB::table('tabel_bendahara')
            ->where('jenis_bendahara','001')
            ->where('kode_skpd',$rekon->kode_skpd)
            ->where('tahun',$rekon->tahun)
            ->first();

        $kabid = DB::table('tabel_kabid')->where('tahun',$rekon->tahun)->first();

        return compact(
            'rekon', 'hari', 'tanggal', 'bulanCetak', 'bulanNama', 'skpdNama',
            'dataA', 'saldoAwal', 'tabA', 'tabB', 'saldoAwalBku', 'saldoAkhirBku',
            'selisihAB', 'ketSelisihB', 'kasTunaiBP', 'kasTunaiBPP', 'kasBank',
            'totalKasTunai', 'totalKasBank', 'jumlahKas', 'selisihAC', 'ketSelisihC',
            'bendahara', 'kabid'
        );
    }

    private function getTabA($noRekon)
    {
        $sp2d = DB::table('tabel_sp2d')->where('no_rekon',$noRekon)->first();
        $spj = DB::table('tabel_spj')->where('no_rekon',$noRekon)->first();
        $sts = DB::table('tabel_sts')->where('no_rekon',$noRekon)->first();

        return [
            'penerimaan'=>[
                'ls'=>$sp2d->nilai_ls ?? 0,
                'up_gu'=>$sp2d->nilai_upgu ?? 0,
                'tu'=>$sp2d->nilai_tu ?? 0,
                'gukkpd'=>$sp2d->nilai_gukkpd ?? 0,
            ],
            'pengeluaran'=>[
                'spj_ls'=>$spj->nilai_ls ?? 0,
                'spj_up_gu'=>$spj->nilai_upgu ?? 0,
                'spj_tu'=>$spj->nilai_tu ?? 0,
                'spj_gukkpd'=>$spj->nilai_gukkpd ?? 0,
                'sts_up_gu'=>$sts->sts_upgu ?? 0,
                'sts_tu'=>$sts->sts_tu ?? 0,
                'cp_ls'=>$sts->cp_ls ?? 0,
                'cp_up_gu'=>$sts->cp_upgu ?? 0,
                'cp_tu'=>$sts->cp_tu ?? 0,
            ]
        ];
    }
}
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SaldoAwal;
use App\Models\MutasiBank;
use App\Models\BkuPemda;
use App\Models\RekonBank;
use App\Models\RekonBankDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;


class KasdaController extends Controller
{
    // ... method kamu yang lain (rekapdata, dll) ...

    /**
     * Menampilkan Halaman Utama Menu Import Kasda
     */
    public function importIndex()
    {
        $tahun = session('tahun');
        $saldo = SaldoAwal::where('tahun', $tahun)->first();

        return Inertia::render('Kasda/Import/Index', [
            'title' => 'Import Data Kasda',
            'saldo' => $saldo,
            'tahun' => $tahun,
        ]);
    }

    /**
     * Menyimpan atau Mengupdate Saldo Awal
     */
    public function saveSaldoAwal(Request $request)
    {
        $tahun = session('tahun');

        SaldoAwal::updateOrCreate(
            ['tahun' => $tahun],
            [
                'saldo_awal_bku' => $this->cleanNumber($request->saldo_bku),
                'saldo_awal_mutasi' => $this->cleanNumber($request->saldo_mutasi),
            ]
        );

        return back()->with('success', 'Saldo awal berhasil disimpan.');
    }

    /**
     * Helper untuk membersihkan format angka string ke float
     */
    private function cleanNumber(mixed $value)
    {
        if (empty($value)) return 0;

        if (is_numeric($value)) {
            return (float) $value;
        }

        // Menangani jika inputan dikirim dengan format ribuan/desimal lokal (jika ada)
        $clean = str_replace('.', '', $value);
        $clean = str_replace(',', '.', $clean);

        return (float) $clean;
    }

    /**
     * Tampilkan Form Upload BKU
     */
    public function bkuForm()
    {
        return Inertia::render('Kasda/Import/Bku/Form', [
            'title' => 'Import BKU Pemda'
        ]);
    }

    /**
     * Proses Validasi Nama File & Tampilkan Data Preview Excel
     */
    public function bkuPreview(Request $request)
    {
        $request->validate([
            'file_bku' => 'required|mimes:xls,xlsx'
        ]);

        $file = $request->file('file_bku');
        $originalName = $file->getClientOriginalName();

        // Ambil nama tanpa ekstensi
        $filename = pathinfo($originalName, PATHINFO_FILENAME);

        // Validasi format: 001 Januari - 012 Desember
        if (!preg_match('/^(00[1-9]|01[0-2]) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/', $filename)) {
            return redirect()->back()->with('error', 
                'Nama file BKU harus format: 001 Januari - 012 Desember. Contoh: 005 Mei.xlsx'
            );
        }

        // Simpan file sementara
        $path = $file->store('temp');

        // Baca data excel
        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0]);

        // Buang header baris pertama
        $rows = $rows->skip(1)->values();

        // Buang baris kosong (kolom tanggal kosong)
        $rows = $rows->filter(function ($row) {
            return !empty($row[1]);
        })->values()->all(); // Konversi ke array biasa agar mulus dikonversi ke JSON

        return Inertia::render('Kasda/Import/Bku/Preview', [
            'title' => 'Preview Import BKU',
            'rows' => $rows,
            'path' => $path,
            'originalName' => $originalName
        ]);
    }

    /**
     * Proses Final: Simpan Data Preview ke Database Produksi
     */
    public function bkuStore(Request $request)
    {
        $path = $request->file_path;
        $originalName = $request->original_name;

        if (!$path || !Storage::exists($path)) {
            return redirect()->route('kasda.import.index')
                ->with('error', 'File temporer tidak ditemukan atau sudah kedaluwarsa.');
        }

        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0])->skip(1)->values();
        $tahun = session('tahun');

        DB::transaction(function () use ($rows, $tahun, $originalName) {
            // Hapus data lama yang bersumber dari nama file yang sama (Replace System)
            BkuPemda::where('sumber_file', $originalName)->delete();

            foreach ($rows as $row) {
                if (empty($row[1])) continue;

                BkuPemda::create([
                    'tanggal'        => Carbon::parse($row[1])->format('Y-m-d'),
                    'nama_skpd'      => $row[2] ?? '',
                    'nama_sub_skpd'  => $row[3] ?? '',
                    'nomor_bukti'    => $row[4] ?? '',
                    'jenis_dokumen'  => $row[5] ?? '',
                    'uraian'         => $row[6] ?? '',
                    'penerimaan'     => $this->cleanNumber($row[7]),
                    'pengeluaran'    => $this->cleanNumber($row[8]),
                    'saldo'          => $this->cleanNumber($row[9]),
                    'tahun'          => $tahun,
                    'sumber_file'    => $originalName
                ]);
            }
        });

        // Hapus file excel temporer dari storage
        Storage::delete($path);

        return redirect()->route('kasda.import.index')
            ->with('success', 'Data Bku Pemda berhasil diperbarui berdasarkan file ' . $originalName);
    }

    public function mutasiForm()
    {
        return Inertia::render('Kasda/Import/Mutasi/Form', [
            'title' => 'Import Mutasi Rekening'
        ]);
    }

    /**
     * Preview Data Excel Mutasi Bank
     */
    public function mutasiPreview(Request $request)
    {
        $request->validate([
            'file_mutasi' => 'required|mimes:xls,xlsx'
        ]);

        $file = $request->file('file_mutasi');
        $originalName = $file->getClientOriginalName();
        $filename = pathinfo($originalName, PATHINFO_FILENAME);

        // Validasi format file: 01 Januari - 12 Desember
        if (!preg_match('/^(0[1-9]|1[0-2]) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/', $filename)) {
            return redirect()->back()->with('error', 
                'Nama file Mutasi harus format: 01 Januari - 12 Desember. Contoh: 05 Mei.xlsx'
            );
        }

        $path = $file->store('temp');
        $data = Excel::toArray([], $path, 'local');
        
        // Ambil sheet pertama, buang baris header pertama
        $rows = collect($data[0])->skip(1)->values();

        // Filter baris kosong (Posting Date tidak kosong)
        $filteredRows = $rows->filter(function ($row) {
            return !empty($row[1]);
        });

        // 💡 Transformasi data ke format Associative Array agar mudah dibaca oleh React Component
        $previewData = $filteredRows->map(function ($row) {
            return [
                'posting_date'   => !empty($row[1]) ? ExcelDate::excelToDateTimeObject($row[1])->format('d-m-Y H:i') : '',
                'effective_date' => !empty($row[2]) ? ExcelDate::excelToDateTimeObject($row[2])->format('d-m-Y') : '',
                'account'        => $row[3] ?? '',
                'name'           => $row[4] ?? '',
                'description'    => $row[5] ?? '',
                'currency'       => $row[6] ?? '',
                'debit'          => $row[7] ?? 0,
                'credit'         => $row[8] ?? 0,
                'balance'        => $row[9] ?? 0,
                'reference_no'   => $row[10] ?? '',
            ];
        })->values()->all();

        // Cek apakah file dengan nama yang sama sudah pernah diimport
        $exists = MutasiBank::where('sumber_file', $originalName)->exists();

        return Inertia::render('Kasda/Import/Mutasi/Preview', [
            'title'        => 'Preview Mutasi Bank',
            'rows'         => $previewData,
            'path'         => $path,
            'originalName' => $originalName,
            'exists'       => $exists
        ]);
    }

    /**
     * Simpan Permanen Data Mutasi ke Database
     */
    public function mutasiStore(Request $request)
    {
        $path = $request->file_path;
        $originalName = $request->original_name;

        if (!$path || !Storage::exists($path)) {
            return redirect()->route('kasda.import.mutasi.form')
                ->with('error', 'File temporer tidak ditemukan.');
        }

        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0])->skip(1)->values();
        $tahun = session('tahun');

        DB::transaction(function () use ($rows, $tahun, $originalName) {
            // Hapus data lama berdasarkan nama berkas asal (Replace System)
            MutasiBank::where('sumber_file', $originalName)->delete();

            foreach ($rows as $row) {
                if (empty($row[1])) continue;

                MutasiBank::create([
                    'posting_date'   => ExcelDate::excelToDateTimeObject($row[1])->format('Y-m-d H:i:s'),
                    'effective_date' => ExcelDate::excelToDateTimeObject($row[2])->format('Y-m-d'),
                    'account'        => $row[3] ?? '',
                    'name'           => $row[4] ?? '',
                    'description'    => $row[5] ?? '',
                    'currency'       => $row[6] ?? '',
                    'debit'          => $this->cleanNumber($row[7]),
                    'credit'         => $this->cleanNumber($row[8]),
                    'balance'        => $this->cleanNumber($row[9]),
                    'reference_no'   => $row[10] ?? '',
                    'tahun'          => $tahun,
                    'sumber_file'    => $originalName
                ]);
            }
        });

        Storage::delete($path);

        return redirect()->route('kasda.import.index')
            ->with('success', 'Data mutasi rekening berhasil diimport.');
    }

    public function monitoringBulanan(Request $request)
    {
        $tahun     = session('tahun');
        $tgl_awal  = $request->tgl_awal;
        $tgl_akhir = $request->tgl_akhir;

        $rows       = collect();
        $isFiltered = false;

        $totalBankPenerimaan     = 0;
        $totalBkuPenerimaan      = 0;
        $totalSelisihPenerimaan  = 0;
        $totalBankPengeluaran    = 0;
        $totalBkuPengeluaran     = 0;
        $totalSelisihPengeluaran = 0;
        $saldoAkhirBank          = 0;
        $saldoAkhirBku           = 0;
        $saldoAkhirSelisih       = 0;

        if ($tgl_awal && $tgl_akhir) {

            if (
                Carbon::parse($tgl_awal)->year  != $tahun ||
                Carbon::parse($tgl_akhir)->year != $tahun
            ) {
                return back()->with('error', 'Tanggal harus dalam tahun ' . $tahun);
            }

            if ($tgl_awal > $tgl_akhir) {
                return back()->with('error', 'Tanggal awal tidak boleh lebih besar dari tanggal akhir');
            }

            $isFiltered = true;

            $bankData = DB::table('mutasi_bank')
                ->selectRaw("effective_date as tanggal, SUM(credit) as penerimaan, SUM(debit) as pengeluaran")
                ->whereBetween('effective_date', [$tgl_awal, $tgl_akhir])
                ->groupBy('effective_date')
                ->get()
                ->keyBy('tanggal');

            $bkuData = DB::table('bku_pemda')
                ->selectRaw("tanggal, SUM(penerimaan) as penerimaan, SUM(pengeluaran) as pengeluaran")
                ->whereBetween('tanggal', [$tgl_awal, $tgl_akhir])
                ->groupBy('tanggal')
                ->get()
                ->keyBy('tanggal');

            $saldoAwal = DB::table('saldo_awal')
                ->where('tahun', $tahun)
                ->first();

            if (!$saldoAwal) {
                return back()->with('error', 'Saldo awal tahun belum diset');
            }

            $saldoBank = $saldoAwal->saldo_awal_mutasi;
            $saldoBku  = $saldoAwal->saldo_awal_bku;

            $period = CarbonPeriod::create($tgl_awal, $tgl_akhir);

            foreach ($period as $date) {
                $tgl = $date->format('Y-m-d');

                $bank = $bankData[$tgl] ?? null;
                $bku  = $bkuData[$tgl]  ?? null;

                $bankMasuk  = $bank->penerimaan  ?? 0;
                $bankKeluar = $bank->pengeluaran ?? 0;
                $bkuMasuk   = $bku->penerimaan   ?? 0;
                $bkuKeluar  = $bku->pengeluaran  ?? 0;

                $saldoBank += ($bankMasuk - $bankKeluar);
                $saldoBku  += ($bkuMasuk  - $bkuKeluar);

                $rows->push([
                    'tanggal'             => $tgl,
                    'bank_penerimaan'     => (float) $bankMasuk,
                    'bku_penerimaan'      => (float) $bkuMasuk,
                    'selisih_penerimaan'  => (float) ($bankMasuk - $bkuMasuk),
                    'bank_pengeluaran'    => (float) $bankKeluar,
                    'bku_pengeluaran'     => (float) $bkuKeluar,
                    'selisih_pengeluaran' => (float) ($bankKeluar - $bkuKeluar),
                    'saldo_bank'          => (float) $saldoBank,
                    'saldo_bku'           => (float) $saldoBku,
                    'selisih_saldo'       => (float) ($saldoBank - $saldoBku),
                ]);
            }

            $totalBankPenerimaan     = (float) $rows->sum('bank_penerimaan');
            $totalBkuPenerimaan      = (float) $rows->sum('bku_penerimaan');
            $totalSelisihPenerimaan  = (float) ($totalBankPenerimaan - $totalBkuPenerimaan);

            $totalBankPengeluaran    = (float) $rows->sum('bank_pengeluaran');
            $totalBkuPengeluaran     = (float) $rows->sum('bku_pengeluaran');
            $totalSelisihPengeluaran = (float) ($totalBankPengeluaran - $totalBkuPengeluaran);

            $saldoAkhirBank    = (float) ($rows->last()['saldo_bank'] ?? 0);
            $saldoAkhirBku     = (float) ($rows->last()['saldo_bku']  ?? 0);
            $saldoAkhirSelisih = (float) ($saldoAkhirBank - $saldoAkhirBku);
        }

        // 💡 Kirim data ke komponen React via Inertia
        return Inertia::render('Kasda/Monitoring/Bulanan', [
            'tgl_awal'                => $tgl_awal,
            'tgl_akhir'               => $tgl_akhir,
            'rows'                    => $rows->toArray(),
            'isFiltered'              => $isFiltered,
            'totalBankPenerimaan'     => $totalBankPenerimaan,
            'totalBkuPenerimaan'      => $totalBkuPenerimaan,
            'totalSelisihPenerimaan'  => $totalSelisihPenerimaan,
            'totalBankPengeluaran'    => $totalBankPengeluaran,
            'totalBkuPengeluaran'     => $totalBkuPengeluaran,
            'totalSelisihPengeluaran' => $totalSelisihPengeluaran,
            'saldoAkhirBank'          => $saldoAkhirBank,
            'saldoAkhirBku'           => $saldoAkhirBku,
            'saldoAkhirSelisih'       => $saldoAkhirSelisih,
            'title'                   => 'Monitoring Bulanan'
        ]);
    }

    public function monitoringHarian(Request $request)
    {
        $tanggal = $request->input('tanggal');
        $status  = $request->input('status');
        $source  = $request->input('source');
        $desc1   = $request->input('desc1');
        $desc2   = $request->input('desc2');

        $data = collect();
        $total = 0;
        $totalMatched = 0;
        $totalUnmatched = 0;
        $totalNominalMatched = 0;
        $totalNominalUnmatched = 0;

        if ($tanggal) {
            $query = DB::table('monitoring_harian as m')
                ->leftJoin('bku_pemda as b', function ($join) {
                    $join->on('m.source_id', '=', 'b.id')
                        ->where('m.source', '=', 'bku');
                })
                ->leftJoin('mutasi_bank as mb', function ($join) {
                    $join->on('m.source_id', '=', 'mb.id')
                        ->where('m.source', '=', 'bank');
                })
                ->select(
                    'm.id', 
                    'm.source', 
                    'm.source_id',
                    'm.jenis', 
                    'm.nominal', 
                    'm.status', 
                    'm.group_id',
                    DB::raw("CONCAT(m.source, '_', m.source_id) as unique_id"),
                    DB::raw("
                        CASE
                            WHEN m.source='bku'  THEN b.uraian
                            WHEN m.source='bank' THEN mb.description
                        END as keterangan
                    ")
                )
                ->whereDate('m.tanggal', $tanggal);

            // Filter Berdasarkan Form
            if ($status) { $query->where('m.status', $status); }
            if ($source) { $query->where('m.source', $source); }

            if ($desc1 || $desc2) {
                $query->where(function ($q) use ($desc1, $desc2) {
                    if ($desc1) {
                        $q->orWhereRaw("LOWER(CASE WHEN m.source='bku' THEN b.uraian WHEN m.source='bank' THEN mb.description END) LIKE ?", ['%' . strtolower($desc1) . '%']);
                    }
                    if ($desc2) {
                        $q->orWhereRaw("LOWER(CASE WHEN m.source='bku' THEN b.uraian WHEN m.source='bank' THEN mb.description END) LIKE ?", ['%' . strtolower($desc2) . '%']);
                    }
                });
            }

            $data = $query->orderBy('m.group_id', 'asc')->orderBy('m.id', 'asc')->get();

            // 💡 Statistik dihitung aman di sini tanpa query UNION yang error
            $total                 = $data->count();
            $totalMatched          = $data->where('status', 'matched')->count();
            $totalUnmatched        = $data->where('status', 'unmatched')->count();
            $totalNominalMatched   = $data->where('status', 'matched')->sum('nominal');
            $totalNominalUnmatched = $data->where('status', 'unmatched')->sum('nominal');
        }

        return Inertia::render('Kasda/Monitoring/Harian', [
            'tanggal'               => $tanggal,
            'status'                => $status,
            'source'                => $source,
            'desc1'                 => $desc1,
            'desc2'                 => $desc2,
            'data'                  => $data,
            'total'                 => $total,
            'totalMatched'          => $totalMatched,
            'totalUnmatched'        => $totalUnmatched,
            'totalNominalMatched'   => (float) $totalNominalMatched,
            'totalNominalUnmatched' => (float) $totalNominalUnmatched,
        ]);
    }

    /**
     * Memproses Otomatisasi Rekonsiliasi (3 Fase - Alur Lama)
     */
    public function prosesMonitoringHarian(Request $request)
    {
        set_time_limit(0); 
        $tanggal = $request->input('tanggal');

        if (!$tanggal) {
            return redirect()->back()->with('error', 'Tanggal wajib dipilih');
        }

        DB::beginTransaction();
        try {
            // Reset data rekonsiliasi lama pada tanggal terkait
            DB::table('monitoring_harian')->whereDate('tanggal', $tanggal)->delete();
            DB::table('monitoring_groups')->whereDate('tanggal', $tanggal)->delete();

            // Ambil dan Insert Data BKU Pemda
            $bkuRows = DB::table('bku_pemda')->whereDate('tanggal', $tanggal)->get();
            foreach ($bkuRows as $row) {
                $jenis   = $row->penerimaan > 0 ? 'masuk' : 'keluar';
                $nominal = $row->penerimaan > 0 ? $row->penerimaan : $row->pengeluaran;

                DB::table('monitoring_harian')->insert([
                    'tanggal'    => $tanggal,
                    'source'     => 'bku',
                    'source_id'  => $row->id,
                    'jenis'      => $jenis,
                    'nominal'    => $nominal,
                    'status'     => 'unmatched',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Ambil dan Insert Data Mutasi Bank
            $bankRows = DB::table('mutasi_bank')->whereDate('effective_date', $tanggal)->get();
            foreach ($bankRows as $row) {
                $jenis   = $row->credit > 0 ? 'masuk' : 'keluar';
                $nominal = $row->credit > 0 ? $row->credit : $row->debit;

                DB::table('monitoring_harian')->insert([
                    'tanggal'    => $tanggal,
                    'source'     => 'bank',
                    'source_id'  => $row->id,
                    'jenis'      => $jenis,
                    'nominal'    => $nominal,
                    'status'     => 'unmatched',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Jalankan Engine Pencocokan Otomatis Inherited
            $this->fase1ExactMatch($tanggal);
            $this->fase2OneToManyMatch($tanggal);

            DB::commit();
            return redirect()->back()->with('success', 'Rekonsiliasi otomatis (3 fase) berhasil diproses.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memproses: ' . $e->getMessage());
        }
    }

    /**
     * FASE 1 — Exact Match 1:1
     */
    private function fase1ExactMatch(string $tanggal): void
    {
        $items = DB::table('monitoring_harian')
            ->whereDate('tanggal', $tanggal)
            ->where('status', 'unmatched')
            ->get();

        $bkuByJenis  = $items->where('source', 'bku')->groupBy('jenis');
        $bankByJenis = $items->where('source', 'bank')->groupBy('jenis');

        foreach (['masuk', 'keluar'] as $jenis) {
            $bkuList  = collect($bkuByJenis->get($jenis, []));
            $bankList = collect($bankByJenis->get($jenis, []));
            $usedBankIds = [];

            foreach ($bkuList as $bku) {
                $pair = $bankList->first(function ($b) use ($bku, $usedBankIds) {
                    return $b->nominal == $bku->nominal && !in_array($b->id, $usedBankIds);
                });

                if (!$pair) continue;
                $usedBankIds[] = $pair->id;

                $groupId = DB::table('monitoring_groups')->insertGetId([
                    'tanggal'    => $tanggal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('monitoring_harian')
                    ->whereIn('id', [$bku->id, $pair->id])
                    ->update([
                        'group_id'   => $groupId,
                        'status'     => 'matched',
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    /**
     * FASE 2 — Auto Match 1 BKU -> N Bank (Subset Sum)
     */
    private function fase2OneToManyMatch(string $tanggal): void
    {
        foreach (['masuk', 'keluar'] as $jenis) {
            $bkuList = DB::table('monitoring_harian')
                ->whereDate('tanggal', $tanggal)
                ->where('source', 'bku')
                ->where('jenis', $jenis)
                ->where('status', 'unmatched')
                ->orderBy('nominal', 'desc')
                ->get();

            $bankList = DB::table('monitoring_harian')
                ->whereDate('tanggal', $tanggal)
                ->where('source', 'bank')
                ->where('jenis', $jenis)
                ->where('status', 'unmatched')
                ->orderBy('nominal', 'desc')
                ->get()
                ->values();

            if ($bkuList->isEmpty() || $bankList->isEmpty()) continue;
            $usedBankIds = [];

            foreach ($bkuList as $bku) {
                $available = $bankList->filter(function ($b) use ($usedBankIds) {
                    return !in_array($b->id, $usedBankIds);
                })->values();

                if ($available->isEmpty()) break;

                $combo = $this->findSubsetSum($available, $bku->nominal);
                if ($combo === null) continue;

                foreach ($combo as $b) {
                    $usedBankIds[] = $b->id;
                }

                $groupId = DB::table('monitoring_groups')->insertGetId([
                    'tanggal'    => $tanggal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $matchedIds = array_merge([$bku->id], collect($combo)->pluck('id')->toArray());

                DB::table('monitoring_harian')
                    ->whereIn('id', $matchedIds)
                    ->update([
                        'group_id'   => $groupId,
                        'status'     => 'matched',
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    private function findSubsetSum($items, $target): ?array
    {
        $arr    = $items->values()->all();
        $result = [];

        if ($this->backtrack($arr, 0, $target, [], $result)) {
            return $result;
        }
        return null;
    }

    private function backtrack(array $arr, int $start, $remaining, array $current, array &$result): bool
    {
        if (abs($remaining) < 0.001) {
            $result = $current;
            return true;
        }

        if ($remaining < 0 || $start >= count($arr)) {
            return false;
        }

        for ($i = $start; $i < count($arr); $i++) {
            $item = $arr[$i];
            if ($item->nominal > $remaining + 0.001) continue;

            $current[] = $item;
            if ($this->backtrack($arr, $i + 1, $remaining - $item->nominal, $current, $result)) {
                return true;
            }
            array_pop($current);
        }
        return false;
    }

    /**
     * Memproses Pencocokan Manual (Membawa Kembali Proteksi Bisnis Yang Ketat 🛡️)
     */
    public function manualMatch(Request $request)
    {
        $ids     = $request->input('selected'); // Array ID dari tabel monitoring_harian
        $tanggal = $request->input('tanggal');

        if (!$ids || count($ids) < 2) {
            return redirect()->back()->with('error', 'Pilih minimal 2 transaksi untuk dijodohkan');
        }

        // Ambil data berdasarkan ID perantara m.id
        $rows = DB::table('monitoring_harian')
            ->whereIn('id', $ids)
            ->whereNull('group_id')
            ->get();

        if ($rows->count() != count($ids)) {
            return redirect()->back()->with('error', 'Ada transaksi terpilih yang sudah berpasangan (ter-group)');
        }

        if ($rows->pluck('jenis')->unique()->count() > 1) {
            return redirect()->back()->with('error', 'Jenis transaksi tidak sepadan (Harus masuk semua atau keluar semua)');
        }

        $bkuTotal  = $rows->where('source', 'bku')->sum('nominal');
        $bankTotal = $rows->where('source', 'bank')->sum('nominal');

        if ($bkuTotal == 0 || $bankTotal == 0) {
            return redirect()->back()->with('error', 'Kombinasi salah. Harus melibatkan minimal 1 data BKU dan 1 data Bank');
        }

        if (abs($bkuTotal - $bankTotal) > 0.001) {
            return redirect()->back()->with('error', 'Nominal tidak seimbang (Unbalanced)! Selisih: ' . abs($bkuTotal - $bankTotal));
        }

        DB::beginTransaction();
        try {
            $groupId = DB::table('monitoring_groups')->insertGetId([
                'tanggal'    => $tanggal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('monitoring_harian')
                ->whereIn('id', $ids)
                ->update([
                    'group_id'   => $groupId,
                    'status'     => 'matched',
                    'updated_at' => now(),
                ]);

            DB::commit();
            return redirect()->back()->with('success', 'Pencocokan manual berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Melepas Ikatan Pasangan / Unmatch Group
     */
    public function unmatchGroup(Request $request)
    {
        $groupId = $request->input('group_id');
        $tanggal = $request->input('tanggal');

        if (!$groupId) {
            return redirect()->back()->with('error', 'Group tidak valid');
        }

        $group = DB::table('monitoring_groups')
            ->where('id', $groupId)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$group) {
            return redirect()->back()->with('error', 'Group tidak ditemukan pada sistem');
        }

        DB::beginTransaction();
        try {
            DB::table('monitoring_harian')
                ->where('group_id', $groupId)
                ->update([
                    'group_id'   => null,
                    'status'     => 'unmatched',
                    'updated_at' => now(),
                ]);

            DB::table('monitoring_groups')->where('id', $groupId)->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Ikatan Group #' . $groupId . ' berhasil dilepas.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Menghapus Seluruh Hasil Rekonsiliasi pada Tanggal Terpilih
     */
    public function deleteRekonsiliasi(Request $request)
    {
        $tanggal = $request->input('tanggal');

        if (!$tanggal) {
            return redirect()->back()->with('error', 'Tanggal wajib dipilih');
        }

        DB::beginTransaction();
        try {
            DB::table('monitoring_groups')->whereDate('tanggal', $tanggal)->delete();
            DB::table('monitoring_harian')->whereDate('tanggal', $tanggal)->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Seluruh data monitoring dan status rekonsiliasi pada tanggal tersebut berhasil dibersihkan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function rekonIndex()
    {
        // Mengambil data esensial rekon bank
        $data = RekonBank::select(['id', 'periode_rekon', 'saldo_buku_akhir', 'saldo_bank_akhir', 'selisih'])
            ->orderBy('periode_rekon', 'desc')
            ->get();

        return Inertia::render('Kasda/Rekonsiliasi/Index', [
            'title' => 'Daftar Rekonsiliasi Bank',
            'data'  => $data
        ]);
    }
}
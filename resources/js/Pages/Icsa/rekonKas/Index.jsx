import { useState, useEffect } from 'react'; // Tambah useEffect
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react'; // Tambah usePage
import { Landmark, Plus, Search, X, Edit, Trash2, Printer, FileSpreadsheet, Info, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default function Index({ title, listSkpd = [], selectedSkpd = '', list = [], tahun }) {
    const [search, setSearch] = useState('');
    
    // Ambil flash message dari shared props Inertia (kiriman dari Controller)
    const { flash } = usePage().props;

    // Listener untuk memunculkan SweetAlert saat ada flash message sukses/gagal
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                timer: 2500,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        }

        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Perhatian / Gagal!',
                text: flash.error,
                confirmButtonColor: '#3b82f6', // Warna biru slate/primary
            });
        }
    }, [flash]);
    
    // State untuk mengontrol Pop-up Keterangan Selisih
    const [modalDetail, setModalDetail] = useState({
        isOpen: false,
        bulan: '',
        text: ''
    });

    const bulanNama = {
        1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 5: 'Mei', 6: 'Juni',
        7: 'Juli', 8: 'Agustus', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
    };

    // Auto-routing saat filter SKPD diubah
    const handleSkpdChange = (e) => {
        const value = e.target.value;
        router.get(route('icsa.rekonsiliasi.index'), 
            { kode_skpd: value }, 
            { preserveState: true }
        );
    };

    // Filter lokal (Live Search) untuk mempermudah pencarian per bulan/nominal/status
    const filteredList = list.filter((row) => {
        const keyword = search.toLowerCase();
        const namaBulan = (bulanNama[row.bulan] || '').toLowerCase();
        return (
            namaBulan.includes(keyword) ||
            row.status.toLowerCase().includes(keyword) ||
            row.keterangan?.toLowerCase().includes(keyword) ||
            row.no_rekon.toLowerCase().includes(keyword)
        );
    });

    // REFACTORING: Menggunakan SweetAlert2 untuk Konfirmasi Hapus yang Aman dan Cantik
    const handleDelete = (noRekon, bulan) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data rekonsiliasi Bulan ${bulanNama[bulan]} akan dihapus permanen beserta seluruh data transaksi terkait (SP2D, SPJ, STS, BKU).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // Red-500 untuk aksi destruktif
            cancelButtonColor: '#64748b',  // Slate-500 untuk batal
            confirmButtonText: 'Ya, Hapus Data!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Menaruh tombol Batal di sebelah kiri
        }).then((result) => {
            if (result.isConfirmed) {
                // Eksekusi pemanggilan route destroy manual via Inertia router
                router.delete(route('icsa.rekonsiliasi.destroy', noRekon), {
                    preserveScroll: true, // Menjaga posisi scroll tabel agar tidak melompat ke atas
                });
            }
        });
    };

    // Format nilai Rupiah Standar Akuntansi
    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val || 0);
    };

    // Hitung ringkasan status box
    const totalAll = list.length;
    const totalSudah = list.filter(r => r.status === 'SUDAH').length;
    const totalProses = totalAll - totalSudah;

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

            {/* FILTER SKPD CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
                <div className="flex flex-col md:flex-row items-end justify-between gap-4">
                    <div className="w-full md:flex-1">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Unit Kerja / SKPD</label>
                        <select
                            value={selectedSkpd || ''}
                            onChange={handleSkpdChange}
                            className="w-full rounded-lg border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- Pilih SKPD --</option>
                            {listSkpd.map((skpd) => (
                                <option key={skpd.kode_skpd} value={skpd.kode_skpd}>
                                    {skpd.kode_skpd} - {skpd.skpd}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-auto">
                        <Link
                            href={selectedSkpd ? `${route('icsa.rekonsiliasi.create')}?kode_skpd=${encodeURIComponent(selectedSkpd)}` : '#'}
                            className={`w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
                                selectedSkpd ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed pointer-events-none'
                            }`}
                        >
                            <Plus size={16} /> <span>Tambah Rekon</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* KONDISI DATA REKON */}
            {selectedSkpd && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* PANEL HEADER */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-slate-800 font-bold">
                                <Landmark size={18} className="text-blue-600" />
                                <span>Histori Hasil Rekonsiliasi</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />Total: <b>{totalAll}</b> Bulan</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />Sudah Beres: <b>{totalSudah}</b></span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />Selisih/Proses: <b>{totalProses}</b></span>
                            </div>
                        </div>

                        {/* LIVE SEARCH FILTER BOX */}
                        <div className="relative w-full sm:w-64">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search size={14} />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari bulan atau status..."
                                className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {list.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium">
                            Belum ada data rekonsiliasi kas untuk SKPD ini pada T.A. {tahun}.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4 text-center w-12">No</th>
                                        <th className="py-3 px-4">Bulan</th>
                                        <th className="py-3 px-4 text-center">Tgl Rekon</th>
                                        <th className="py-3 px-4 text-right">SP2D (+)</th>
                                        <th className="py-3 px-4 text-right">SPJ (-)</th>
                                        <th className="py-3 px-4 text-right">STS (-)</th>
                                        <th className="py-3 px-4 text-right">Kas SIPD</th>
                                        <th className="py-3 px-4 text-right">Kas Riil</th>
                                        <th className="py-3 px-4 text-right">Selisih</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center w-36">Ket Selisih</th>
                                        <th className="py-3 px-4 text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                    {filteredList.map((row, idx) => {
                                        const isBalance = row.selisih_ac === 0;
                                        return (
                                            <tr key={row.no_rekon} className={`transition-colors hover:bg-slate-50/50 ${row.status === 'PROSES' ? 'bg-amber-50/30' : ''}`}>
                                                <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold text-slate-800">{bulanNama[row.bulan] || row.bulan}</td>
                                                <td className="py-3 px-4 text-center text-slate-500">
                                                    {row.tanggal_rekon ? new Date(row.tanggal_rekon).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatIDR(row.total_sp2d)}</td>
                                                <td className="py-3 px-4 text-right text-slate-700">{formatIDR(row.total_spj)}</td>
                                                <td className="py-3 px-4 text-right text-slate-700">{formatIDR(row.total_sts)}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-slate-900 bg-slate-50/40">{formatIDR(row.kas_sipd)}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatIDR(row.kas_riil)}</td>
                                                
                                                {/* Kolom Selisih */}
                                                <td className="py-3 px-4 text-right">
                                                    {isBalance ? (
                                                        <span className="text-emerald-600 font-semibold flex items-center justify-end"><CheckCircle2 size={12} className="mr-1" /> Balance</span>
                                                    ) : (
                                                        <span className={`font-bold flex items-center justify-end ${row.keterangan ? 'text-slate-500' : 'text-red-600'}`}>
                                                            {formatIDR(Math.abs(row.selisih_ac))}
                                                            {row.keterangan && <Info size={12} className="ml-1 text-slate-400" title={row.keterangan} />}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom Status Badge */}
                                                <td className="py-3 px-4 text-center">
                                                    {row.status === 'SUDAH' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium ring-1 ring-inset ring-emerald-600/10"><CheckCircle2 size={10} className="mr-1" /> SUDAH</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium ring-1 ring-inset ring-amber-600/10"><Clock size={10} className="mr-1" /> PROSES</span>
                                                    )}
                                                </td>

                                                {/* Kolom Keterangan Tersembunyi (Trigger Modal) */}
                                                <td className="py-3 px-4 text-center">
                                                    {row.keterangan ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setModalDetail({
                                                                isOpen: true,
                                                                bulan: bulanNama[row.bulan] || row.bulan,
                                                                text: row.keterangan
                                                            })}
                                                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors font-medium text-[11px]"
                                                        >
                                                            <MessageSquare size={12} />
                                                            <span>Lihat Catatan</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>

                                                {/* Kumpulan Tombol Aksi */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="inline-flex items-center -space-x-px rounded-md shadow-sm border border-slate-200 bg-white">
                                                        {/* REFACTOR: Mengirimkan kode_skpd ke halaman edit sebagai parameter agar flow UX terjaga */}
                                                        <Link 
                                                            href={route('icsa.rekonsiliasi.edit', { no_rekon: row.no_rekon, kode_skpd: selectedSkpd })} 
                                                            className="p-2 text-blue-600 hover:bg-slate-50 rounded-l-md" 
                                                            title="Isi & Koreksi Data Keuangan"
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                        <a href={route('icsa.rekonsiliasi.cetak', row.no_rekon)} target="_blank" rel="noreferrer" className="p-2 text-red-600 hover:bg-slate-50 border-l border-slate-200" title="Cetak Berita Acara (PDF)">
                                                            <Printer size={14} />
                                                        </a>
                                                        <a href={route('icsa.rekonsiliasi.excel', row.no_rekon)} className="p-2 text-emerald-600 hover:bg-slate-50 border-l border-slate-200" title="Download Format Excel (.xlsx)">
                                                            <FileSpreadsheet size={14} />
                                                        </a>
                                                        <button onClick={() => handleDelete(row.no_rekon, row.bulan)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-r-md border-l border-slate-200" title="Hapus Data">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL POP-UP UNTUK DETAIL KETERANGAN SELISIH */}
            {modalDetail.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
                        {/* Header Modal */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-slate-800 font-bold">
                                <Info size={16} className="text-blue-600" />
                                <span>Keterangan Selisih - Bulan {modalDetail.bulan}</span>
                            </div>
                            <button 
                                onClick={() => setModalDetail({ isOpen: false, bulan: '', text: '' })}
                                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Body Isi Keterangan */}
                        <div className="p-5">
                            <div className="text-sm text-slate-700 leading-relaxed bg-amber-50/50 border border-amber-100 p-4 rounded-lg italic text-center whitespace-pre-wrap">
                                "{modalDetail.text}"
                            </div>
                        </div>
                        
                        {/* Footer Modal */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setModalDetail({ isOpen: false, bulan: '', text: '' })}
                                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
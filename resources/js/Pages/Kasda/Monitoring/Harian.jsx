import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Harian({
    auth,
    flash = {},
    tanggal = '',
    status = '',
    source = '',
    desc1 = '',
    desc2 = '',
    data = [],
    total = 0,
    totalMatched = 0,
    totalUnmatched = 0,
    totalNominalMatched = 0,
    totalNominalUnmatched = 0,
}) {
    // State untuk menampung ID transaksi unmatched yang diceklis
    const [selectedIds, setSelectedIds] = useState([]);
    
    // State untuk mengontrol kemunculan Loading Overlay ala Blade lama
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState({ title: '', desc: '' });

    // STATE BARU: Untuk mengontrol Modal Konfirmasi Kustom
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        desc: '',
        onConfirm: () => {},
        confirmText: 'Ya, Lanjutkan',
        confirmBtnClass: 'bg-indigo-600 hover:bg-indigo-700'
    });

    // State Filter Form lokal
    const [filters, setFilters] = useState({
        tanggal: tanggal || '',
        status: status || '',
        source: source || '',
        desc1: desc1 || '',
        desc2: desc2 || '',
    });

    // Sinkronisasi loading overlay jika ada flash redirect dari backend
    useEffect(() => {
        setIsLoading(false);
    }, [data, flash]);

    // Format Rupiah presisi dengan 2 desimal seperti format Blade lama
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Filter submit (Tampilkan data)
    const handleSearch = (e) => {
        e.preventDefault();
        setSelectedIds([]); 
        router.get(route('kasda.monitoring.harian'), filters, {
            preserveState: true,
        });
    };

    // Ceklis Tunggal
    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Master Ceklis untuk semua data yang berstatus 'unmatched'
    const handleSelectAllUnmatched = (e) => {
        if (e.target.checked) {
            const unmatchedIds = data
                .filter(item => item.status === 'unmatched')
                .map(item => item.id || item.unique_id);
            setSelectedIds(unmatchedIds);
        } else {
            setSelectedIds([]);
        }
    };

    // LOGIKA SELECTION BAR
    const selectionSummary = useMemo(() => {
        let count = selectedIds.length;
        let bkuTotal = 0;
        let bankTotal = 0;

        selectedIds.forEach(id => {
            const item = data.find(d => (d.id === id || d.unique_id === id));
            if (item) {
                const nominal = parseFloat(item.nominal || 0);
                if (item.source === 'bku') bkuTotal += nominal;
                if (item.source === 'bank') bankTotal += nominal;
            }
        });

        const selisih = bkuTotal - bankTotal;
        const isBalanced = Math.abs(selisih) < 0.001;

        return { count, bkuTotal, bankTotal, selisih, isBalanced };
    }, [selectedIds, data]);

    // Helper untuk menutup modal konfirmasi
    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    // AKSI MODAL: Proses Otomatis
    const handleProsesOtomatis = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Proses Rekonsiliasi?',
            desc: 'Data rekonsiliasi lama akan dihapus dan diproses ulang. Semakin banyak transaksi, proses akan semakin lama.',
            confirmText: '🚀 Ya, Proses',
            confirmBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            onConfirm: () => {
                closeConfirmModal();
                setLoadingText({
                    title: 'Memproses Rekonsiliasi',
                    desc: 'Sedang mencocokkan transaksi BKU dan Bank...'
                });
                setIsLoading(true);
                router.post(route('kasda.monitoring.harian.proses'), { tanggal: filters.tanggal });
            }
        });
    };

    // AKSI MODAL: Delete Rekonsiliasi
    const handleResetHarian = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Rekonsiliasi Hari Ini?',
            desc: 'Seluruh data rekonsiliasi tanggal ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
            confirmText: '🗑️ Ya, Hapus Semua',
            confirmBtnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
            onConfirm: () => {
                closeConfirmModal();
                setLoadingText({
                    title: 'Menghapus Data',
                    desc: 'Mengembalikan seluruh status transaksi menjadi unmatched...'
                });
                setIsLoading(true);
                router.post(route('kasda.monitoring.harian.delete'), { tanggal: filters.tanggal }, {
                    onSuccess: () => setSelectedIds([])
                });
            }
        });
    };

    // AKSI MODAL: Match Manual
    const handleMatchManual = (e) => {
        e.preventDefault();
        if (selectedIds.length < 2) return alert('Centang minimal 2 transaksi untuk dicocokkan!');
        
        setConfirmModal({
            isOpen: true,
            title: 'Hubungkan Transaksi Secara Manual?',
            desc: `Anda akan menjodohkan ${selectedIds.length} transaksi terpilih secara manual. Pastikan nilai nominal sudah seimbang (balance).`,
            confirmText: '🔗 Ya, Jodohkan',
            confirmBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
            onConfirm: () => {
                closeConfirmModal();
                router.post(route('kasda.monitoring.harian.manual'), {
                    selected: selectedIds,
                    tanggal: filters.tanggal,
                    desc1: filters.desc1,
                    desc2: filters.desc2,
                    source: filters.source,
                    status: filters.status,
                }, {
                    onSuccess: () => setSelectedIds([])
                });
            }
        });
    };

    // AKSI MODAL: Lepas Ikatan Per Group
    const handleUnmatchGroup = (groupId) => {
        setConfirmModal({
            isOpen: true,
            title: `Lepas Ikatan Group #${groupId}?`,
            desc: 'Semua transaksi di dalam kelompok ID group ini akan dipisahkan kembali menjadi status Unmatched.',
            confirmText: '🔓 Ya, Lepaskan',
            confirmBtnClass: 'bg-slate-700 hover:bg-slate-800 text-white',
            onConfirm: () => {
                closeConfirmModal();
                router.post(route('kasda.monitoring.harian.unmatch'), {
                    group_id: groupId,
                    tanggal: filters.tanggal
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kas Daerah</h2>}
        >
            <Head title="Monitoring Rekonsiliasi Harian" />

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .animate-shimmer {
                    background-size: 200% 100%;
                    animation: shimmer 1.8s infinite linear;
                }
            `}</style>

            {/* ================= CUSTOM CONFIRMATION MODAL (REPLACES BROWSER POP-UP) ================= */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                💡 Konfirmasi Tindakan
                            </h3>
                            <p className="font-semibold text-slate-700 mt-3 text-sm">{confirmModal.title}</p>
                            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{confirmModal.desc}</p>
                        </div>
                        <div className="bg-slate-50 px-6 py-3.5 flex justify-end gap-2.5 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={closeConfirmModal} 
                                className="px-4 py-2 bg-white hover:bg-slate-100 border text-slate-700 rounded-md font-medium text-xs transition"
                            >
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={confirmModal.onConfirm} 
                                className={`px-4 py-2 rounded-md font-semibold text-xs transition shadow-sm ${confirmModal.confirmBtnClass}`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= LOADING OVERLAY ================= */}
            {isLoading && (
                <div className="fixed inset-0 bg-slate-900/75 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-10 text-center max-w-md w-[90%] shadow-2xl border">
                        <div className="mb-5 flex justify-center">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="28" stroke="#e2e8f0" stroke-width="6"/>
                                <path d="M32 4 A28 28 0 0 1 60 32" stroke="#3b82f6" stroke-width="6" stroke-linecap="round" className="origin-[32px_32px] animate-spin" />
                            </svg>
                        </div>
                        <h5 className="font-bold text-xl text-slate-800 mb-2">{loadingText.title}</h5>
                        <p className="text-slate-500 text-sm mb-6">{loadingText.desc}</p>
                        
                        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-shimmer w-full"></div>
                        </div>
                        <p className="text-slate-400 text-xs mt-4">
                            Semakin banyak transaksi, proses akan semakin lama. Harap tunggu.
                        </p>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* FLASH ALERTS */}
                    {flash.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between">
                            <span className="text-sm font-medium">⚠️ {flash.error}</span>
                        </div>
                    )}
                    {flash.success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-4 rounded-xl shadow-sm space-y-2">
                            <p className="font-bold text-sm">🎉 Rekonsiliasi Selesai / Berhasil!</p>
                            <p className="text-xs text-emerald-700 leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                                <strong>Langkah selanjutnya:</strong> Periksa kembali hasil pencocokan transaksi di tabel. Apabila ada yang salah cocok, klik tombol Lepas pada baris tersebut, lalu gunakan Match Manual untuk mencocokkan ulang sesuai transaksi yang sebenarnya.
                            </p>
                        </div>
                    )}

                    {/* ================= FILTER PANEL ================= */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b">
                            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">🔍 Filter Data</h3>
                        </div>
                        <form onSubmit={handleSearch} className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                <input type="date" name="tanggal" value={filters.tanggal} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500">
                                    <option value="">-- Semua --</option>
                                    <option value="matched">Matched</option>
                                    <option value="unmatched">Unmatched</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Source</label>
                                <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500">
                                    <option value="">-- Semua --</option>
                                    <option value="bku">BKU</option>
                                    <option value="bank">BANK</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi 1</label>
                                <input type="text" name="desc1" value={filters.desc1} onChange={handleFilterChange} placeholder="Kata kunci..." className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi 2 (OR)</label>
                                <input type="text" name="desc2" value={filters.desc2} onChange={handleFilterChange} placeholder="Alternatif..." className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500" />
                            </div>
                            <div>
                                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 text-sm transition">
                                    Tampilkan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================= ACTION BUTTONS REKONSILIASI ================= */}
                    {tanggal && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                            <button onClick={handleProsesOtomatis} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-700 text-sm transition">
                                🚀 Proses Rekonsiliasi
                            </button>
                            <button onClick={handleResetHarian} className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-md shadow-sm hover:bg-rose-700 text-sm transition">
                                🗑️ Delete Rekonsiliasi
                            </button>
                        </div>
                    )}

                    {/* ================= STATISTIK PANEL ================= */}
                    {tanggal && data.length > 0 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Total Transaksi</p>
                                    <p className="text-2xl font-black text-slate-800 mt-1">{total}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-emerald-500">
                                    <p className="text-xs font-bold text-emerald-600 uppercase">Matched</p>
                                    <p className="text-2xl font-black text-emerald-700 mt-1">{totalMatched}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-rose-500">
                                    <p className="text-xs font-bold text-rose-600 uppercase">Unmatched</p>
                                    <p className="text-2xl font-black text-rose-700 mt-1">{totalUnmatched}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-cyan-500">
                                    <p className="text-xs font-bold text-cyan-600 uppercase">Nominal Matched</p>
                                    <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(totalNominalMatched)}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-amber-500">
                                    <p className="text-xs font-bold text-amber-600 uppercase">Nominal Unmatched</p>
                                    <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(totalNominalUnmatched)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= UTAMA: SELECTION BAR & TABEL TRANSAKSI ================= */}
                    {tanggal && (
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            {data.length === 0 ? (
                                <div className="p-8 text-center bg-amber-50 border border-amber-200 text-amber-800 rounded-xl m-4">
                                    ⚠️ Tidak ada data untuk tanggal <strong>{filters.tanggal}</strong>.<br />
                                    Pastikan data BKU dan Bank sudah diimport, lalu klik <strong>Proses Rekonsiliasi</strong>.
                                </div>
                            ) : (
                                <form onSubmit={handleMatchManual}>
                                    
                                    {/* SELECTION BAR */}
                                    {selectionSummary.count > 0 && (
                                        <div className="px-4 py-2 bg-indigo-50/80 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 transition-all">
                                            <div className="text-slate-700 space-x-2">
                                                <span>📊 <strong>{selectionSummary.count}</strong> transaksi dipilih</span>
                                                <span>|</span>
                                                <span>BKU: <strong>{formatRupiah(selectionSummary.bkuTotal)}</strong></span>
                                                <span>|</span>
                                                <span>Bank: <strong>{formatRupiah(selectionSummary.bankTotal)}</strong></span>
                                                <span>|</span>
                                                {selectionSummary.isBalanced ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">✓ Balance</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">⚠️ Selisih: {formatRupiah(Math.abs(selectionSummary.selisih))}</span>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setSelectedIds([])} className="text-rose-600 font-medium hover:underline">
                                                ✕ Batal pilih semua
                                            </button>
                                        </div>
                                    )}

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-slate-100 border-b text-slate-700 text-xs font-bold uppercase tracking-wider">
                                                    <th className="p-3 w-10 text-center">
                                                        <input type="checkbox" id="checkAll" onChange={handleSelectAllUnmatched} checked={data.filter(i => i.status === 'unmatched').length > 0 && data.filter(i => i.status === 'unmatched').every(i => selectedIds.includes(i.id || i.unique_id))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                    </th>
                                                    <th className="p-3 w-24">Source</th>
                                                    <th className="p-3">Keterangan</th>
                                                    <th className="p-3 w-20 text-center">Jenis</th>
                                                    <th className="p-3 w-40 text-right">Nominal</th>
                                                    <th className="p-3 w-20 text-center">Group</th>
                                                    <th className="p-3 w-28 text-center">Status</th>
                                                    <th className="p-3 w-16 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {data.map((row) => {
                                                    const rowId = row.id || row.unique_id;
                                                    const isUnmatched = row.status === 'unmatched';
                                                    const isChecked = selectedIds.includes(rowId);
                                                    
                                                    return (
                                                        <tr key={rowId} className={`transition ${isUnmatched ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'} ${isChecked ? '!bg-indigo-50/60' : ''}`}>
                                                            <td className="p-3 text-center">
                                                                {isUnmatched && (
                                                                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(rowId)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${row.source === 'bku' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-cyan-100 border-cyan-300 text-cyan-800'}`}>
                                                                    {row.source}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-slate-700 max-w-sm break-words text-xs">{row.keterangan}</td>
                                                            <td className="p-3 text-center">
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${row.jenis === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {row.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-semibold text-slate-900">{formatRupiah(row.nominal)}</td>
                                                            <td className="p-3 text-center">
                                                                {row.group_id ? <span className="text-xs bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200">#{row.group_id}</span> : <span className="text-slate-400">-</span>}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${!isUnmatched ? 'bg-emerald-200 border-emerald-400 text-emerald-900' : 'bg-red-200 border-red-400 text-red-900'}`}>
                                                                    {!isUnmatched ? 'MATCHED' : 'UNMATCHED'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                {!isUnmatched && row.group_id && (
                                                                    <button type="button" onClick={() => handleUnmatchGroup(row.group_id)} title={`Lepas group #${row.group_id}`} className="text-slate-400 hover:text-amber-600 transition p-1">
                                                                        🔗 <span className="text-xs hover:underline">Lepas</span>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* FOOTER TABEL */}
                                    <div className="px-4 py-3 bg-slate-50 border-t flex items-center gap-3">
                                        <button type="submit" disabled={selectedIds.length < 2} className={`px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition ${selectedIds.length >= 2 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
                                            🔗 Match Manual
                                        </button>
                                        <p className="text-xs text-slate-400">
                                            Centang minimal 2 transaksi (harus ada BKU + Bank, jenis sama, nominal balance).
                                        </p>
                                    </div>
                                    
                                </form>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
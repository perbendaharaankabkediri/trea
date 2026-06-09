import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Bulanan({
    tgl_awal,
    tgl_akhir,
    rows = [],
    isFiltered,
    totalBankPenerimaan,
    totalBkuPenerimaan,
    totalSelisihPenerimaan,
    totalBankPengeluaran,
    totalBkuPengeluaran,
    totalSelisihPengeluaran,
    saldoAkhirBank,
    saldoAkhirBku,
    saldoAkhirSelisih,
    title
}) {
    const { flash } = usePage().props;

    // Inisialisasi Form Filter
    const { data, setData, get, processing } = useForm({
        tgl_awal: tgl_awal || '',
        tgl_akhir: tgl_akhir || '',
    });

    // Helper format rupiah desimal (id-ID)
    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num ?? 0);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        get(route('kasda.monitoring.bulanan'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={title} />

            {/* Header & Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Monitoring perbandingan mutasi bank dan BKU harian</p>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                    <span>Kasda</span> <span className="mx-1.5 text-gray-300">&gt;</span> <span className="text-gray-600 font-semibold">Monitoring Bulanan</span>
                </div>
            </div>

            {/* Flash Session Notification */}
            {flash?.success && (
                <div className="mb-5 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl text-green-700 flex items-center gap-2.5 shadow-sm text-sm">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 flex items-center gap-2.5 shadow-sm text-sm">
                    <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Card Filter Periode */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <h2 className="text-sm font-bold text-gray-700">Filter Periode</h2>
                </div>
                
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Awal</label>
                        <input 
                            type="date" 
                            className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-gray-50/50 border text-gray-700"
                            value={data.tgl_awal}
                            onChange={e => setData('tgl_awal', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Akhir</label>
                        <input 
                            type="date" 
                            className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-gray-50/50 border text-gray-700"
                            value={data.tgl_akhir}
                            onChange={e => setData('tgl_akhir', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            className="w-full md:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition duration-150 flex items-center justify-center gap-2"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                    <span>Memuat...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <span>Tampilkan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Main Workspace Area */}
            {!isFiltered ? (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm">
                        Silakan pilih rentang tanggal lalu klik <span className="font-bold">Tampilkan</span> untuk melihat perbandingan kas.
                    </p>
                </div>
            ) : (
                <>
                    {/* Ringkasan Panel (KPI Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                        {/* Penerimaan */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Total Penerimaan
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2.5">
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">Bank</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(totalBankPenerimaan)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">BKU</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(totalBkuPenerimaan)}</span>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-medium">Selisih:</span>
                                <span className={`text-sm font-extrabold ${totalSelisihPenerimaan !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatNumber(totalSelisihPenerimaan)}
                                </span>
                            </div>
                        </div>

                        {/* Pengeluaran */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Total Pengeluaran
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2.5">
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">Bank</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(totalBankPengeluaran)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">BKU</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(totalBkuPengeluaran)}</span>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-medium">Selisih:</span>
                                <span className={`text-sm font-extrabold ${totalSelisihPengeluaran !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatNumber(totalSelisihPengeluaran)}
                                </span>
                            </div>
                        </div>

                        {/* Saldo Akhir */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Saldo Akhir Periode
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2.5">
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">Bank</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(saldoAkhirBank)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-medium">BKU</span>
                                    <span className="text-sm font-bold text-gray-700">{formatNumber(saldoAkhirBku)}</span>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-medium">Selisih:</span>
                                <span className={`text-sm font-extrabold ${saldoAkhirSelisih !== 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                    {formatNumber(saldoAkhirSelisih)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table Wrapper */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-gray-600 border-collapse">
                                <thead className="bg-gray-50/70 text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                    <tr className="text-center divide-x divide-gray-200">
                                        <th rowSpan="2" className="p-3 align-middle bg-gray-50">Tanggal</th>
                                        <th colSpan="3" className="p-2 bg-green-50/40 text-green-800">Penerimaan</th>
                                        <th colSpan="3" className="p-2 bg-red-50/40 text-red-800">Pengeluaran</th>
                                        <th colSpan="3" className="p-2 bg-blue-50/40 text-blue-800">Saldo Rekonsiliasi</th>
                                    </tr>
                                    <tr className="text-center divide-x divide-gray-200 border-t border-gray-200 text-[10px]">
                                        <th className="p-2 bg-green-50/10">Bank</th>
                                        <th className="p-2 bg-green-50/10">BKU</th>
                                        <th className="p-2 bg-green-50/30">Selisih</th>
                                        <th className="p-2 bg-red-50/10">Bank</th>
                                        <th className="p-2 bg-red-50/10">BKU</th>
                                        <th className="p-2 bg-red-50/30">Selisih</th>
                                        <th className="p-2 bg-blue-50/10">Bank</th>
                                        <th className="p-2 bg-blue-50/10">BKU</th>
                                        <th className="p-2 bg-blue-50/30">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.length > 0 ? (
                                        rows.map((row, index) => {
                                            const hasWarning = row.selisih_penerimaan !== 0 || row.selisih_pengeluaran !== 0 || row.selisih_saldo !== 0;
                                            return (
                                                <tr key={index} className={`hover:bg-gray-50/80 transition-colors divide-x divide-gray-100 ${hasWarning ? 'bg-yellow-50/30 hover:bg-yellow-50/60' : ''}`}>
                                                    <td className="p-2.5 font-medium text-center text-gray-800">
                                                        <Link 
                                                            href={route('kasda.monitoring.harian', { tanggal: row.tanggal })}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                                        >
                                                            {row.tanggal}
                                                        </Link>
                                                    </td>
                                                    {/* Penerimaan */}
                                                    <td className="p-2.5 text-right">{formatNumber(row.bank_penerimaan)}</td>
                                                    <td className="p-2.5 text-right">{formatNumber(row.bku_penerimaan)}</td>
                                                    <td className={`p-2.5 text-right font-bold ${row.selisih_penerimaan !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {formatNumber(row.selisih_penerimaan)}
                                                    </td>
                                                    {/* Pengeluaran */}
                                                    <td className="p-2.5 text-right">{formatNumber(row.bank_pengeluaran)}</td>
                                                    <td className="p-2.5 text-right">{formatNumber(row.bku_pengeluaran)}</td>
                                                    <td className={`p-2.5 text-right font-bold ${row.selisih_pengeluaran !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {formatNumber(row.selisih_pengeluaran)}
                                                    </td>
                                                    {/* Saldo */}
                                                    <td className="p-2.5 text-right">{formatNumber(row.saldo_bank)}</td>
                                                    <td className="p-2.5 text-right">{formatNumber(row.saldo_bku)}</td>
                                                    <td className={`p-2.5 text-right font-bold ${row.selisih_saldo !== 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                        {formatNumber(row.selisih_saldo)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center text-gray-400 py-10 bg-gray-50/30">
                                                <svg className="w-6 h-6 mx-auto mb-1.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.89 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.89 8-4M4 7c0-2.21 3.582-4 8-4s8 1.89 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.89-8-4" /></svg>
                                                <span>Tidak ada data pada periode terpilih</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {rows.length > 0 && (
                                    <tfoot className="bg-gray-50 font-bold text-gray-800 border-t border-gray-200 text-right divide-x divide-gray-200">
                                        <tr>
                                            <td className="p-2.5 text-center text-[10px] tracking-wider bg-gray-100/80">TOTAL PERIODE</td>
                                            <td className="p-2.5">{formatNumber(totalBankPenerimaan)}</td>
                                            <td className="p-2.5">{formatNumber(totalBkuPenerimaan)}</td>
                                            <td className={`p-2.5 ${totalSelisihPenerimaan !== 0 ? 'text-red-500' : 'text-green-500'}`}>{formatNumber(totalSelisihPenerimaan)}</td>
                                            <td className="p-2.5">{formatNumber(totalBankPengeluaran)}</td>
                                            <td className="p-2.5">{formatNumber(totalBkuPengeluaran)}</td>
                                            <td className={`p-2.5 ${totalSelisihPengeluaran !== 0 ? 'text-red-500' : 'text-green-500'}`}>{formatNumber(totalSelisihPengeluaran)}</td>
                                            <td className="p-2.5">{formatNumber(saldoAkhirBank)}</td>
                                            <td className="p-2.5">{formatNumber(saldoAkhirBku)}</td>
                                            <td className={`p-2.5 ${saldoAkhirSelisih !== 0 ? 'text-red-500' : 'text-blue-500'}`}>{formatNumber(saldoAkhirSelisih)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
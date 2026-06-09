import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function RekapMonitoring({ auth, title, dataRekap, listSkpd, bulanNama, summary, sessionTahun, filters }) {
    
    const { data, setData, get, processing } = useForm({
        kode_skpd: filters.kode_skpd || 'all',
        bulan: filters.bulan || '',
        status: filters.status || 'all',
    });

    const rupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(angka);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('icsa.rekapmonitoring'), {
            preserveState: true
        });
    };

    const pctSudah  = summary.total > 0 ? Math.round((summary.sudah / summary.total) * 100) : 0;
    const pctProses = summary.total > 0 ? Math.round((summary.proses / summary.total) * 100) : 0;
    const pctBelum  = summary.total > 0 ? Math.round((summary.belum / summary.total) * 100) : 0;

    const totalKasSipd = dataRekap.reduce((sum, item) => sum + Number(item.kas_sipd), 0);
    const totalKasReal = dataRekap.reduce((sum, item) => sum + Number(item.kas_real), 0);
    const totalSelisih = dataRekap.reduce((sum, item) => sum + Number(item.selisih), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<span>{title}</span>}
        >
            <Head title={title} />
            
            
                
                

                {/* ===================== FILTER CARD ===================== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h6 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            📂 Filter Data
                        </h6>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">SKPD / Unit Kerja</label>
                                <select 
                                    value={data.kode_skpd} 
                                    onChange={e => setData('kode_skpd', e.target.value)} 
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="all">-- SEMUA SKPD --</option>
                                    {listSkpd.map((s) => (
                                        <option key={s.kode_skpd} value={s.kode_skpd}>
                                            {s.kode_skpd} - {s.skpd}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Bulan</label>
                                <select 
                                    value={data.bulan} 
                                    onChange={e => setData('bulan', e.target.value)} 
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    required
                                >
                                    <option value="">-- Pilih Bulan --</option>
                                    {Object.entries(bulanNama).map(([index, nama]) => (
                                        <option key={index} value={index}>{nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Filter Status</label>
                                <select 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)} 
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="all">-- SEMUA --</option>
                                    <option value="sudah">SUDAH REKON</option>
                                    <option value="proses">DALAM PROSES</option>
                                    <option value="belum">BELUM REKON</option>
                                </select>
                            </div>

                            <div>
                                <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition text-sm disabled:opacity-50">
                                    🔍 Tampilkan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ===================== SUMMARY CARDS ===================== */}
                {filters.bulan && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total SKPD */}
                        <div className="bg-white border-l-4 border-blue-500 rounded-xl shadow-sm p-4 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total SKPD</div>
                                <div className="text-2xl font-extrabold text-gray-900">{summary.total}</div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 w-24">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <span className="text-2xl">🏛️</span>
                        </div>

                        {/* Sudah Rekon */}
                        <div className="bg-white border-l-4 border-green-500 rounded-xl shadow-sm p-4 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Sudah Rekon</div>
                                <div className="text-2xl font-extrabold text-gray-900">
                                    {summary.sudah} <span className="text-xs font-normal text-gray-500">({pctSudah}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 w-24">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pctSudah}%` }}></div>
                                </div>
                            </div>
                            <span className="text-2xl">✅</span>
                        </div>

                        {/* Dalam Proses */}
                        <div className="bg-white border-l-4 border-yellow-500 rounded-xl shadow-sm p-4 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Dalam Proses</div>
                                <div className="text-2xl font-extrabold text-gray-900">
                                    {summary.proses} <span className="text-xs font-normal text-gray-500">({pctProses}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 w-24">
                                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${pctProses}%` }}></div>
                                </div>
                            </div>
                            <span className="text-2xl">⏳</span>
                        </div>

                        {/* Belum Rekon */}
                        <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-sm p-4 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Belum Rekon</div>
                                <div className="text-2xl font-extrabold text-gray-900">
                                    {summary.belum} <span className="text-xs font-normal text-gray-500">({pctBelum}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 w-24">
                                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${pctBelum}%` }}></div>
                                </div>
                            </div>
                            <span className="text-2xl">❌</span>
                        </div>
                    </div>
                )}

                {/* ===================== TABEL MONITORING ===================== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h6 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            📊 Monitoring Rekonsiliasi Kas
                        </h6>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            {filters.bulan && (
                                <span className="px-2 py-1 bg-gray-100 rounded-md border text-gray-700 font-medium">
                                    {bulanNama[filters.bulan]}
                                </span>
                            )}
                            <span>TA: <strong className="text-gray-900">{sessionTahun}</strong></span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                <tr>
                                    <th className="px-4 py-3 w-12">No</th>
                                    <th className="px-6 py-3 text-left">SKPD</th>
                                    <th className="px-6 py-3 text-right">Saldo SIPD (A)</th>
                                    <th className="px-6 py-3 text-right">Bank + Tunai (B)</th>
                                    <th className="px-6 py-3 text-right w-36">Selisih (A−B)</th>
                                    <th className="px-6 py-3 w-40">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataRekap.length > 0 ? (
                                    dataRekap.map((row, index) => {
                                        const hasError = row.selisih != 0;
                                        return (
                                            <tr key={row.kode_skpd} className="hover:bg-gray-50/70 transition">
                                                <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">{index + 1}</td>
                                                <td className="px-6 py-3">
                                                    <span className="block font-semibold text-gray-900">{row.skpd}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{row.kode_skpd}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-gray-700">{rupiah(row.kas_sipd)}</td>
                                                <td className="px-6 py-3 text-right font-mono text-gray-700">{rupiah(row.kas_real)}</td>
                                                <td className={`px-6 py-3 text-right font-mono font-bold ${hasError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    {hasError ? rupiah(row.selisih) : '✓ Balance'}
                                                </td>
                                                <td className="px-6 py-3 text-center whitespace-nowrap">
                                                    {row.status_rekon === 'SUDAH' && (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">✓ SUDAH</span>
                                                            {row.selisih != 0 && <span className="text-[10px] text-blue-500 mt-1 font-medium">💬 Ada Ket.</span>}
                                                        </div>
                                                    )}
                                                    {row.status_rekon === 'PROSES' && (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">⏳ PROSES</span>
                                                            <span className="text-[10px] text-yellow-600 mt-1">✍️ Input Ket...</span>
                                                        </div>
                                                    )}
                                                    {row.status_rekon === 'BELUM' && (
                                                        <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">✕ BELUM</span>
                                                    )}
                                                    {row.no_rekon && (
                                                        <span className="block text-[10px] text-gray-400 font-mono mt-1">{row.no_rekon}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            <span className="block text-3xl mb-2">🔍</span>
                                            Tidak ada data yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* ===== FOOTER TOTAL ===== */}
                            {dataRekap.length > 0 && (
                                <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                                    <tr>
                                        <td colSpan="2" className="px-6 py-3 text-right text-xs text-gray-500 uppercase">
                                            Total {dataRekap.length} SKPD
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-gray-900">{rupiah(totalKasSipd)}</td>
                                        <td className="px-6 py-3 text-right font-mono text-gray-900">{rupiah(totalKasReal)}</td>
                                        <td className={`px-6 py-3 text-right font-mono font-bold ${totalSelisih != 0 ? 'text-red-600 bg-red-50/50' : 'text-green-600 bg-green-50/50'}`}>
                                            {totalSelisih != 0 ? rupiah(totalSelisih) : '✓ Balance'}
                                        </td>
                                        <td className="px-6 py-3 text-center text-xs text-gray-500">
                                            <span className="text-green-600 font-bold">{summary.sudah}</span> / {' '}
                                            <span className="text-yellow-600 font-bold">{summary.proses}</span> / {' '}
                                            <span className="text-red-600 font-bold">{summary.belum}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            
        </AuthenticatedLayout>
    );
}
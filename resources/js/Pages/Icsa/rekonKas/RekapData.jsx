import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react'; // <-- Sudah ditambahkan Head
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function RekapData({ title, dataRealisasi, grandTotal, bulanNama, filters }) {
    const [selectedBulan, setSelectedBulan] = useState(filters.bulan || '');

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('icsa.rekapdata'), { bulan: selectedBulan }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            {/* Menyisipkan judul ke tab browser di sebelah favicon */}
            <Head title={title} />

            {/* FILTER CARD */}
            <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h5 className="font-semibold text-primary flex items-center gap-2">
                        <span>📁</span> Filter Periode
                    </h5>
                    {selectedBulan && bulanNama[selectedBulan] && (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium">
                            Periode: {bulanNama[selectedBulan]}
                        </span>
                    )}
                </div>
                <div className="p-6">
                    <form onSubmit={handleFilterSubmit} className="flex items-end gap-4">
                        <div className="w-full max-w-xs">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Bulan</label>
                            <select
                                value={selectedBulan}
                                onChange={(e) => setSelectedBulan(e.target.value)}
                                className="w-full border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                required
                            >
                                <option value="">-- Pilih Bulan --</option>
                                {Object.entries(bulanNama).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm shadow-sm transition-colors">
                            🔍 Tampilkan
                        </button>

                        {filters.bulan && (
                            <a
                                href={route('icsa.rekapdata.export', { bulan: filters.bulan })}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm shadow-sm transition-colors ml-auto flex items-center gap-2"
                            >
                                📄 Export Excel
                            </a>
                        )}
                    </form>
                </div>
            </div>

            {/* MATRIX TABLE CARD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {filters.bulan && dataRealisasi.length > 0 && (
                    <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-gray-50">
                        <div>Menampilkan <strong>{dataRealisasi.length}</strong> SKPD</div>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1"><span className="text-blue-500">■</span> SP2D</span>
                            <span className="flex items-center gap-1"><span className="text-emerald-500">■</span> SPJ</span>
                            <span className="flex items-center gap-1"><span className="text-amber-500">■</span> STS</span>
                            <span className="flex items-center gap-1"><span className="text-purple-500">■</span> Posisi Kas</span>
                        </div>
                    </div>
                )}

                <div className="overflow-auto max-h-[650px] custom-table-scroll">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-gray-800 text-white text-center uppercase tracking-wider font-semibold sticky top-0 z-30">
                                <th rowSpan={2} className="p-3 border border-gray-700 bg-gray-800 sticky left-0 z-40 min-w-[45px] w-[45px]">No</th>
                                <th rowSpan={2} className="p-3 border border-gray-700 bg-gray-800 text-left sticky left-[45px] z-40 min-w-[240px] max-w-[240px]">Satuan Kerja (SKPD)</th>
                                <th colSpan={5} className="p-2 border border-gray-700 bg-blue-900 text-blue-100" style={{ borderTop: '3px solid #3b82f6' }}>Realisasi SP2D</th>
                                <th colSpan={5} className="p-2 border border-gray-700 bg-emerald-900 text-emerald-100" style={{ borderTop: '3px solid #10b981' }}>Total SPJ</th>
                                <th colSpan={1} className="p-2 border border-gray-700 bg-amber-900 text-amber-100" style={{ borderTop: '3px solid #f59e0b' }}>STS</th>
                                <th colSpan={4} className="p-2 border border-gray-700 bg-purple-900 text-purple-100" style={{ borderTop: '3px solid #8b5cf6' }}>Posisi Kas & Selisih</th>
                            </tr>
                            <tr className="bg-gray-100 text-gray-700 text-center font-bold sticky top-[37px] z-30">
                                <th className="p-2 border border-gray-200 bg-blue-50 text-blue-700">LS</th>
                                <th className="p-2 border border-gray-200 bg-blue-50 text-blue-700">UP/GU</th>
                                <th className="p-2 border border-gray-200 bg-blue-50 text-blue-700">TU</th>
                                <th className="p-2 border border-gray-200 bg-blue-50 text-blue-700">KKPD</th>
                                <th className="p-2 border border-gray-200 bg-blue-100 text-blue-900">TOTAL</th>
                                <th className="p-2 border border-gray-200 bg-emerald-50 text-emerald-700">LS</th>
                                <th className="p-2 border border-gray-200 bg-emerald-50 text-emerald-700">UP/GU</th>
                                <th className="p-2 border border-gray-200 bg-emerald-50 text-emerald-700">TU</th>
                                <th className="p-2 border border-gray-200 bg-emerald-50 text-emerald-700">KKPD</th>
                                <th className="p-2 border border-gray-200 bg-emerald-100 text-emerald-900">TOTAL</th>
                                <th className="p-2 border border-gray-200 bg-amber-100 text-amber-900">TOTAL</th>
                                <th className="p-2 border border-gray-200 bg-purple-50 text-purple-700">KAS SIPD</th>
                                <th className="p-2 border border-gray-200 bg-purple-50 text-purple-700">KAS BANK</th>
                                <th className="p-2 border border-gray-200 bg-purple-50 text-purple-700">KAS TUNAI</th>
                                <th className="p-2 border border-purple-900 bg-purple-900 text-white font-black">SELISIH</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 font-mono">
                            {dataRealisasi.length > 0 ? (
                                dataRealisasi.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 group">
                                        <td className="p-2 text-center sticky left-0 z-20 bg-white group-hover:bg-gray-50 border-r border-gray-200 text-gray-400 font-sans">
                                            {index + 1}
                                        </td>
                                        <td className="p-2 sticky left-[45px] z-20 bg-white group-hover:bg-gray-50 border-r-2 border-gray-300 font-sans min-w-[240px] max-w-[240px] truncate">
                                            <span className="block text-[10px] text-gray-400 font-medium">{row.kode_skpd}</span>
                                            <span className="block font-semibold text-gray-700 leading-tight whitespace-normal">{row.nama_skpd}</span>
                                        </td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.sp2d_ls)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.sp2d_upgu)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.sp2d_tu)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.sp2d_gukkpd)}</td>
                                        <td className="p-2 text-right border-r border-gray-200 font-bold bg-blue-50/50">{formatRupiah(row.total_sp2d)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.spj_ls)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.spj_upgu)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.spj_tu)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.spj_gukkpd)}</td>
                                        <td className="p-2 text-right border-r border-gray-200 font-bold bg-emerald-50/50">{formatRupiah(row.total_spj)}</td>
                                        <td className="p-2 text-right border-r border-gray-200 font-bold bg-amber-50/50">{formatRupiah(row.total_sts)}</td>
                                        <td className="p-2 text-right border-r border-gray-200 text-blue-600">{formatRupiah(row.kas_sipd)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.kas_bank)}</td>
                                        <td className="p-2 text-right border-r border-gray-200">{formatRupiah(row.kas_tunai)}</td>
                                        <td className={`p-2 text-right font-bold ${row.selisih !== 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600'}`}>
                                            {row.selisih !== 0 ? formatRupiah(row.selisih) : '✓'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={16} className="text-center py-16 text-gray-400 font-sans">
                                        <div className="text-2xl mb-2">🔍</div>
                                        {selectedBulan ? 'Tidak ada data rekonsiliasi untuk bulan ini.' : 'Silakan pilih bulan periode untuk menampilkan data.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {dataRealisasi.length > 0 && grandTotal && (
                            <tfoot className="sticky bottom-0 z-30 font-bold text-white bg-gray-800">
                                <tr>
                                    <td colSpan={2} className="p-3 text-center sticky left-0 z-40 bg-gray-900 border-r-2 border-gray-700 tracking-wider font-sans">
                                        GRAND TOTAL
                                    </td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right bg-blue-900 text-blue-100 border-r border-gray-700">{formatRupiah(grandTotal.total_sp2d)}</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right text-gray-400 border-r border-gray-700">-</td>
                                    <td className="p-2 text-right bg-emerald-900 text-emerald-100 border-r border-gray-700">{formatRupiah(grandTotal.total_spj)}</td>
                                    <td className="p-2 text-right bg-amber-950 text-amber-100 border-r border-gray-700">{formatRupiah(grandTotal.total_sts)}</td>
                                    <td className="p-2 text-right text-blue-300 border-r border-gray-700">{formatRupiah(grandTotal.kas_sipd)}</td>
                                    <td className="p-2 text-right border-r border-gray-700">{formatRupiah(grandTotal.kas_bank)}</td>
                                    <td className="p-2 text-right border-r border-gray-700">{formatRupiah(grandTotal.kas_tunai)}</td>
                                    <td className={`p-2 text-right border-l border-gray-700 ${grandTotal.selisih !== 0 ? 'text-amber-400 bg-red-950' : 'text-emerald-400'}`}>
                                        {grandTotal.selisih !== 0 ? formatRupiah(grandTotal.selisih) : '✓ Balance'}
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
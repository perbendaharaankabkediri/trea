import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Search, FileSpreadsheet } from 'lucide-react';

export default function RekapData({ title, dataRealisasi, grandTotal, bulanNama, filters }) {
    const [selectedBulan, setSelectedBulan] = useState(filters.bulan || '');

    const fmt = (value) => {
        if (!value || value === 0) return null;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const Num = ({ value, bold = false }) => {
        const str = fmt(value);
        if (!str) return <span className="text-slate-600">-</span>;
        return (
            <span className={`tabular-nums ${bold ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
                {str}
            </span>
        );
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('icsa.rekapdata'), { bulan: selectedBulan }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

            {/* ─── TOOLBAR ─── */}
            <div className="bg-[#0d1424] border border-white/[0.07] rounded-xl px-4 py-3.5 mb-4 flex items-end gap-3 flex-wrap">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] font-semibold text-slate-600 uppercase tracking-wide">
                        Bulan Periode
                    </label>
                    <select
                        value={selectedBulan}
                        onChange={(e) => setSelectedBulan(e.target.value)}
                        required
                        className="h-[34px] bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[12px] text-slate-300 outline-none focus:border-blue-500/40 transition-colors min-w-[160px]"
                        style={{ colorScheme: 'dark' }}
                    >
                        <option value="" className="bg-[#0d1424]">-- Pilih Bulan --</option>
                        {Object.entries(bulanNama).map(([key, name]) => (
                            <option key={key} value={key} className="bg-[#0d1424]">{name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleFilterSubmit}
                    className="h-[34px] flex items-center gap-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-[12px] font-semibold text-white transition-colors"
                >
                    <Search size={13} />
                    Tampilkan
                </button>

                {filters.bulan && (
                    <>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] ml-1">
                            <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-[10.5px] font-semibold text-blue-400 tracking-wide">
                                Periode: {bulanNama[filters.bulan]}
                            </span>
                        </div>

                        <a
                            href={route('icsa.rekapdata.export', { bulan: filters.bulan })}
                            className="h-[34px] flex items-center gap-1.5 px-4 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-[12px] font-medium text-emerald-400 transition-colors ml-auto"
                        >
                            <FileSpreadsheet size={13} />
                            Export Excel
                        </a>
                    </>
                )}
            </div>

            {/* ─── TABLE CARD ─── */}
            <div className="bg-[#0d1424] border border-white/[0.07] rounded-xl overflow-hidden">

                {/* Meta row */}
                {filters.bulan && dataRealisasi.length > 0 && (
                    <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-4 text-[11px] text-slate-600">
                        <span>
                            <span className="text-slate-300 font-medium">{dataRealisasi.length}</span> SKPD
                        </span>
                        <div className="flex items-center gap-3 ml-2">
                            {[
                                { color: '#3b82f6', label: 'SP2D' },
                                { color: '#10b981', label: 'SPJ' },
                                { color: '#f59e0b', label: 'STS' },
                                { color: '#8b5cf6', label: 'Posisi Kas' },
                            ].map(({ color, label }) => (
                                <span key={label} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-auto max-h-[calc(100vh-260px)]">
                    <table className="w-full border-collapse text-[11.5px]" style={{ minWidth: '1400px' }}>
                        <thead>
                            {/* Group row */}
                            <tr className="bg-[#080d1a]">
                                <th rowSpan={2} className="px-3 py-2 text-center text-[10px] font-medium text-slate-600 border-b border-white/[0.05] sticky left-0 z-30 bg-[#080d1a] w-[36px]">
                                    No
                                </th>
                                <th rowSpan={2} className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 border-b border-r border-white/[0.08] sticky left-[36px] z-30 bg-[#080d1a] min-w-[220px]">
                                    Satuan Kerja (SKPD)
                                </th>
                                {[
                                    { label: 'Realisasi SP2D', color: '#3b82f6', span: 5 },
                                    { label: 'Total SPJ', color: '#10b981', span: 5 },
                                    { label: 'STS', color: '#f59e0b', span: 1 },
                                    { label: 'Posisi Kas & Selisih', color: '#8b5cf6', span: 4 },
                                ].map(({ label, color, span }) => (
                                    <th
                                        key={label}
                                        colSpan={span}
                                        className="px-3 py-2 text-center text-[10px] font-semibold border-b border-white/[0.05] border-l border-white/[0.04]"
                                        style={{ borderTop: `2px solid ${color}`, color }}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                            {/* Sub-column row */}
                            <tr className="bg-[#0a0f1e]">
                                {['LS','UP/GU','TU','KKPD','Total','LS','UP/GU','TU','KKPD','Total','Total','Kas SIPD','Kas Bank','Kas Tunai','Selisih'].map((col, i) => (
                                    <th
                                        key={i}
                                        className={`px-3 py-2 text-right text-[10px] font-medium text-slate-500 border-b border-white/[0.05] whitespace-nowrap ${
                                            [4,5,10,11,15].includes(i) ? 'border-l border-white/[0.07] text-slate-400' : ''
                                        } ${[4,10].includes(i) ? 'font-semibold' : ''}`}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {dataRealisasi.length > 0 ? (
                                dataRealisasi.map((row, index) => {
                                    const totalSp2d = (row.sp2d_ls || 0) + (row.sp2d_upgu || 0) + (row.sp2d_tu || 0) + (row.sp2d_gukkpd || 0);
                                    const totalSpj  = (row.spj_ls  || 0) + (row.spj_upgu  || 0) + (row.spj_tu  || 0) + (row.spj_gukkpd  || 0);
                                    const selisih   = row.selisih ?? 0;

                                    return (
                                        <tr
                                            key={index}
                                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* No */}
                                            <td className="px-3 py-2 text-center text-[10.5px] text-slate-600 sticky left-0 bg-[#0d1424] group-hover:bg-[#111827] z-10 w-[36px]">
                                                {index + 1}
                                            </td>
                                            {/* SKPD */}
                                            <td className="px-3 py-2 sticky left-[36px] bg-[#0d1424] group-hover:bg-[#111827] z-10 border-r border-white/[0.06] min-w-[220px]">
                                                <span className="block text-[10px] text-slate-700">{row.kode_skpd}</span>
                                                <span className="block text-[12px] font-medium text-slate-300 leading-tight">{row.nama_skpd}</span>
                                            </td>
                                            {/* SP2D */}
                                            <td className="px-3 py-2 text-right border-l border-white/[0.04]"><Num value={row.sp2d_ls} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.sp2d_upgu} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.sp2d_tu} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.sp2d_gukkpd} /></td>
                                            <td className="px-3 py-2 text-right border-l border-white/[0.07]"><Num value={totalSp2d} bold /></td>
                                            {/* SPJ */}
                                            <td className="px-3 py-2 text-right border-l border-white/[0.07]"><Num value={row.spj_ls} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.spj_upgu} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.spj_tu} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.spj_gukkpd} /></td>
                                            <td className="px-3 py-2 text-right border-l border-white/[0.07]"><Num value={totalSpj} bold /></td>
                                            {/* STS */}
                                            <td className="px-3 py-2 text-right border-l border-white/[0.07]"><Num value={row.total_sts} bold /></td>
                                            {/* Posisi Kas */}
                                            <td className="px-3 py-2 text-right border-l border-white/[0.07]"><Num value={row.kas_sipd} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.kas_bank} /></td>
                                            <td className="px-3 py-2 text-right"><Num value={row.kas_tunai} /></td>
                                            {/* Selisih */}
                                            <td className={`px-3 py-2 text-right font-medium border-l border-white/[0.07] ${
                                                selisih !== 0 ? 'text-red-400' : 'text-emerald-500'
                                            }`}>
                                                {selisih !== 0
                                                    ? new Intl.NumberFormat('id-ID').format(selisih)
                                                    : '✓'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={17} className="py-16 text-center text-[12px] text-slate-700">
                                        {selectedBulan
                                            ? 'Tidak ada data rekonsiliasi untuk bulan ini.'
                                            : 'Silakan pilih bulan periode untuk menampilkan data.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {/* Grand Total */}
                        {dataRealisasi.length > 0 && grandTotal && (
                            <tfoot>
                                <tr className="border-t border-white/[0.1] bg-[#080d1a] sticky bottom-0 z-20">
                                    <td
                                        colSpan={2}
                                        className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-400 tracking-wider sticky left-0 bg-[#080d1a] z-30 border-r border-white/[0.07]"
                                        style={{ left: 0 }}
                                    >
                                        Grand Total
                                    </td>
                                    {/* SP2D cols */}
                                    {[null,null,null,null].map((_,i) => (
                                        <td key={i} className="px-3 py-2.5 text-right text-slate-600 border-l border-white/[0.04] text-[10.5px]">-</td>
                                    ))}
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-200 border-l border-white/[0.07] tabular-nums">
                                        {fmt(grandTotal.total_sp2d)}
                                    </td>
                                    {[null,null,null,null].map((_,i) => (
                                        <td key={i} className={`px-3 py-2.5 text-right text-slate-600 text-[10.5px] ${i===0?'border-l border-white/[0.07]':''}`}>-</td>
                                    ))}
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-200 border-l border-white/[0.07] tabular-nums">
                                        {fmt(grandTotal.total_spj)}
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-200 border-l border-white/[0.07] tabular-nums">
                                        {fmt(grandTotal.total_sts)}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-slate-400 border-l border-white/[0.07] tabular-nums">{fmt(grandTotal.kas_sipd)}</td>
                                    <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums">{fmt(grandTotal.kas_bank)}</td>
                                    <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums">{fmt(grandTotal.kas_tunai)}</td>
                                    <td className={`px-3 py-2.5 text-right font-semibold border-l border-white/[0.07] tabular-nums ${
                                        grandTotal.selisih !== 0 ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                        {grandTotal.selisih !== 0
                                            ? new Intl.NumberFormat('id-ID').format(grandTotal.selisih)
                                            : '✓ Balance'}
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

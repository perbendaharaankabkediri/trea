import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Preview({ title, rows, path, originalName }) {
    
    const { post, processing } = useForm({
        file_path: path,
        original_name: originalName
    });

    const rupiah = (angka) => {
        if (!angka || isNaN(angka)) return '0,00';
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(angka);
    };

    const handleConfirmStore = (e) => {
        e.preventDefault();
        if (confirm('Data lama dengan nama berkas ini akan diganti sepenuhnya (Replace). Lanjutkan?')) {
            post(route('kasda.import.bku.store'));
        }
    };

    return (
        <AuthenticatedLayout title={title}>
            <Head title={title} />

            {/* BREADCRUMB */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Preview Import BKU</h1>
                <p className="text-sm text-gray-500">Kasda / Import / Preview Berkas</p>
            </div>

            {/* WARNING ALERT */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl shadow-sm flex items-start gap-2.5">
                <span className="text-lg">⚠️</span>
                <div className="text-xs font-medium leading-relaxed">
                    <strong>Sistem Penggantian Otomatis (Replace System):</strong> Jika file bernama <span className="underline font-bold text-gray-900">"{originalName}"</span> sudah pernah diunggah sebelumnya, menekan tombol simpan akan menghapus seluruh rekaman data lama tersebut untuk menghindari duplikasi data.
                </div>
            </div>

            {/* TABLE PREVIEW */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h6 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        📋 Data Preview (Belum Tersimpan ke Database)
                    </h6>
                    <span className="text-xs text-gray-400 font-mono font-medium">File: {originalName}</span>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-center sticky top-0 z-10 border-b shadow-sm">
                            <tr>
                                <th className="px-3 py-3 border-r w-12">No</th>
                                <th className="px-4 py-3 border-r text-left">Tanggal</th>
                                <th className="px-5 py-3 border-r text-left">Nama SKPD</th>
                                <th className="px-5 py-3 border-r text-left">Nama Sub SKPD</th>
                                <th className="px-4 py-3 border-r text-left">Nomor Bukti</th>
                                <th className="px-4 py-3 border-r text-left">Jenis Dokumen</th>
                                <th className="px-6 py-3 border-r text-left">Uraian</th>
                                <th className="px-5 py-3 border-r text-right">Penerimaan</th>
                                <th className="px-5 py-3 border-r text-right">Pengeluaran</th>
                                <th className="px-5 py-3 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 font-mono text-gray-700">
                            {rows.length > 0 ? (
                                rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/80 transition">
                                        <td className="px-3 py-2 text-center text-gray-400 font-sans border-r">{index + 1}</td>
                                        <td className="px-4 py-2 border-r whitespace-nowrap text-left font-sans">{row[1] || ''}</td>
                                        <td className="px-5 py-2 border-r max-w-xs truncate text-left font-sans" title={row[2]}>{row[2] || ''}</td>
                                        <td className="px-5 py-2 border-r max-w-xs truncate text-left font-sans" title={row[3]}>{row[3] || ''}</td>
                                        <td className="px-4 py-2 border-r whitespace-nowrap text-left">{row[4] || ''}</td>
                                        <td className="px-4 py-2 border-r whitespace-nowrap text-left font-sans">{row[5] || ''}</td>
                                        <td className="px-6 py-2 border-r text-left whitespace-normal font-sans" style={{ minWidth: '220px' }}>{row[6] || ''}</td>
                                        <td className="px-5 py-2 border-r text-right text-blue-600">{rupiah(row[7])}</td>
                                        <td className="px-5 py-2 border-r text-right text-red-600">{rupiah(row[8])}</td>
                                        <td className="px-5 py-2 text-right font-bold bg-gray-50/50 text-gray-900">{rupiah(row[9])}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-12 text-gray-400 font-sans">
                                        📭 File kosong atau tidak memiliki baris data yang valid.
                                    </td>
                                        </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BUTTON BAR */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <Link 
                    href={route('kasda.import.bku.form')} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded text-sm transition shadow-sm"
                >
                    ← Batal & Kembali
                </Link>

                <form onSubmit={handleConfirmStore}>
                    <button
                        type="submit"
                        disabled={processing || rows.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <span>💾</span> {processing ? 'Menyimpan Data...' : 'Simpan ke Database'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
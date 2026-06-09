import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Preview({ title, rows, path, originalName, exists }) {
    
    const { post, processing } = useForm({
        file_path: path,
        original_name: originalName
    });

    const formatRupiah = (number) => {
        if (!number || isNaN(number)) return '0,00';
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    const handleConfirmSave = (e) => {
        e.preventDefault();
        const msg = exists 
            ? 'Perhatian! Berkas ini sudah ada di database. Sistem akan menghapus data lama dan menggantinya dengan data baru. Lanjutkan?'
            : 'Apakah Anda yakin ingin menyimpan seluruh data mutasi ini ke database?';
            
        if (confirm(msg)) {
            post(route('kasda.import.mutasi.store'));
        }
    };

    return (
        <AuthenticatedLayout title={title}>
            <Head title={title} />

            {/* BREADCRUMB */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Preview Data Mutasi Bank</h1>
                <p className="text-sm text-gray-500">Kasda / Import / Preview Mutasi</p>
            </div>

            {/* EXISTS ALERT WARNING */}
            {exists && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-xs font-medium leading-relaxed">
                        <strong>File Terdeteksi Duplikat:</strong> Berkas bernama <span className="underline font-bold">"{originalName}"</span> tercatat sudah pernah diunggah sebelumnya. Proses simpan akan melakukan <strong>Overwriting (Replace)</strong> terhadap mutasi pada dokumen tersebut.
                    </div>
                </div>
            )}

            {/* PREVIEW CONTAINER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h6 className="text-sm font-semibold text-gray-700">
                        📋 Detail Isi Dokumen Mutasi Bank
                    </h6>
                    <span className="text-xs bg-gray-200 font-mono text-gray-700 px-2 py-1 rounded font-medium">File: {originalName}</span>
                </div>

                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-center sticky top-0 z-10 border-b shadow-sm">
                            <tr>
                                <th className="px-4 py-3 border-r text-left">Posting Date</th>
                                <th className="px-4 py-3 border-r text-left">Effective Date</th>
                                <th className="px-4 py-3 border-r text-left">Account</th>
                                <th className="px-5 py-3 border-r text-left">Name</th>
                                <th className="px-6 py-3 border-r text-left">Description</th>
                                <th className="px-3 py-3 border-r">Currency</th>
                                <th className="px-5 py-3 border-r text-right">Debit</th>
                                <th className="px-5 py-3 border-r text-right">Credit</th>
                                <th className="px-5 py-3 border-r text-right">Balance</th>
                                <th className="px-4 py-3 text-left">Reference No</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 font-mono text-gray-700">
                            {rows.length > 0 ? (
                                rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/80 transition">
                                        <td className="px-4 py-2 border-r whitespace-nowrap text-left font-sans">{row.posting_date}</td>
                                        <td className="px-4 py-2 border-r whitespace-nowrap text-left font-sans">{row.effective_date}</td>
                                        <td className="px-4 py-2 border-r text-left font-sans">{row.account}</td>
                                        <td className="px-5 py-2 border-r text-left max-w-xs truncate font-sans" title={row.name}>{row.name}</td>
                                        <td className="px-6 py-2 border-r text-left max-w-sm whitespace-normal font-sans" style={{ minWidth: '200px' }}>{row.description}</td>
                                        <td className="px-3 py-2 border-r text-center font-sans text-gray-400">{row.currency}</td>
                                        <td className="px-5 py-2 border-r text-right text-red-600">{formatRupiah(row.debit)}</td>
                                        <td className="px-5 py-2 border-r text-right text-emerald-600">{formatRupiah(row.credit)}</td>
                                        <td className="px-5 py-2 border-r text-right font-bold text-gray-900">{formatRupiah(row.balance)}</td>
                                        <td className="px-4 py-2 text-left whitespace-nowrap">{row.reference_no}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-12 text-gray-400 font-sans">
                                        📭 Baris data mutasi tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <Link 
                    href={route('kasda.import.mutasi.form')} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded text-sm transition shadow-sm"
                >
                    ← Batalkan & Kembali
                </Link>

                <form onSubmit={handleConfirmSave}>
                    <button
                        type="submit"
                        disabled={processing || rows.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <span>💾</span> {processing ? 'Menyimpan...' : 'Simpan Mutasi ke Database'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
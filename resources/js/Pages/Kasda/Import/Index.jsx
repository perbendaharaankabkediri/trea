import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'; // Sesuaikan path layout Anda

export default function Index({ title, saldo, tahun }) {
    // Mengambil flash message success jika ada proses simpan yang berhasil
    const { flash } = usePage().props;

    // Inisialisasi Form menggunakan useForm Inertia
    const { data, setData, post, processing, errors } = useForm({
        saldo_bku: saldo?.saldo_awal_bku || 0,
        saldo_mutasi: saldo?.saldo_awal_mutasi || 0,
    });

    const handleSubmitSaldo = (e) => {
        e.preventDefault();
        post(route('kasda.import.saldo'), {
            preserveScroll: true, // Layar tidak otomatis scroll ke atas saat submit
        });
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

        

            {/* NOTIFIKASI SUKSES */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-sm flex items-center gap-2">
                    <span>✅</span>
                    <span className="text-sm font-medium">{flash.success}</span>
                </div>
            )}

            {/* ================= MENU IMPORT CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Opsi 1: Import BKU */}
                <Link 
                    href={route('kasda.import.bku.form')} // Nanti disesuaikan di tahap berikutnya
                    className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
                >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                        <span className="text-3xl">📊</span>
                    </div>
                    <h5 className="text-lg font-bold text-gray-800 mb-1">
                        Import BKU Pemda
                    </h5>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        Upload dan simpan data Buku Kas Umum Pemerintah Daerah dari file Excel.
                    </p>
                </Link>

                {/* Opsi 2: Import Mutasi */}
                <Link 
                    href={route('kasda.import.mutasi.form')} // Nanti disesuaikan di tahap berikutnya
                    className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                        <span className="text-3xl">🔄</span>
                    </div>
                    <h5 className="text-lg font-bold text-gray-800 mb-1">
                        Import Mutasi Rekening
                    </h5>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        Upload dan simpan data mutasi rekening koran bank Kas Daerah.
                    </p>
                </Link>

            </div>

            {/* ================= CONFIG SALDO AWAL FORM ================= */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Header Form */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <span className="text-xl">💼</span>
                        <h6 className="font-bold text-gray-800">
                            Saldo Awal Tahun Anggaran {tahun || '-'}
                        </h6>
                    </div>

                    {/* Body Form */}
                    <form onSubmit={handleSubmitSaldo} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Input Saldo BKU */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                    Saldo Awal BKU
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xs font-mono">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.saldo_bku}
                                        onChange={(e) => setData('saldo_bku', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm text-right font-mono"
                                        placeholder="0"
                                    />
                                </div>
                                {errors.saldo_bku && <p className="text-red-500 text-xs mt-1">{errors.saldo_bku}</p>}
                            </div>

                            {/* Input Saldo Mutasi */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                    Saldo Awal Mutasi
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xs font-mono">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.saldo_mutasi}
                                        onChange={(e) => setData('saldo_mutasi', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm text-right font-mono"
                                        placeholder="0"
                                    />
                                </div>
                                {errors.saldo_mutasi && <p className="text-red-500 text-xs mt-1">{errors.saldo_mutasi}</p>}
                            </div>

                        </div>

                        {/* Tombol Simpan */}
                        <div className="text-center pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm shadow-sm transition-colors flex items-center gap-2 mx-auto ${
                                    processing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <span>💾</span>
                                {processing ? 'Menyimpan...' : 'Simpan Saldo Awal'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
import React from 'react';
import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function Create({ auth, title, listSkpd, selectedSkpd }) {
    const { session } = usePage().props; 
    const tahunAnggaran = session?.tahun || new Date().getFullYear();

    const daftarBulan = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
        { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        kode_skpd: selectedSkpd || '',
        bulan: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.kode_skpd) {
            Swal.fire('Peringatan', 'Silakan pilih SKPD terlebih dahulu.', 'warning');
            return;
        }
        if (!data.bulan) {
            Swal.fire('Peringatan', 'Silakan pilih bulan rekonsiliasi.', 'warning');
            return;
        }

        Swal.fire({
            title: 'Simpan Rekonsiliasi?',
            text: 'Pastikan SKPD dan Bulan yang Anda pilih sudah sesuai.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5', // Warna Indigo Tailwind
            cancelButtonColor: '#6b7280', // Warna Gray Tailwind
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('icsa.rekonsiliasi.store'));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<span>{title}</span>}
        >
            <Head title={title} />
            
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Card Container */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        
                        {/* Card Header */}
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-lg">
                                <svg className="w-5 height-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Form Tambah Rekonsiliasi</span>
                            </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    
                                    {/* TAHUN ANGGARAN (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Anggaran</label>
                                        <input 
                                            type="text" 
                                            className="w-full rounded-md border-transparent bg-gray-100 text-gray-500 text-sm focus:border-gray-200 focus:ring-0 cursor-not-allowed" 
                                            value={tahunAnggaran} 
                                            readOnly 
                                        />
                                    </div>

                                    {/* DROPDOWN SKPD */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SKPD <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            className={`w-full rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                                errors.kode_skpd ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                            value={data.kode_skpd}
                                            onChange={e => setData('kode_skpd', e.target.value)}
                                            disabled={!!selectedSkpd}
                                        >
                                            <option value="">-- Pilih SKPD --</option>
                                            {listSkpd.map((skpd) => (
                                                <option key={skpd.kode_skpd} value={skpd.kode_skpd}>
                                                    {skpd.kode_skpd} - {skpd.skpd}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.kode_skpd && <p className="mt-1 text-xs text-red-600">{errors.kode_skpd}</p>}
                                    </div>

                                    {/* DROPDOWN BULAN */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            className={`w-full rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                                errors.bulan ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                            value={data.bulan}
                                            onChange={e => setData('bulan', e.target.value)}
                                        >
                                            <option value="">-- Pilih Bulan --</option>
                                            {daftarBulan.map((b) => (
                                                <option key={b.value} value={b.value}>
                                                    {b.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.bulan && <p className="mt-1 text-xs text-red-600">{errors.bulan}</p>}
                                    </div>

                                </div>

                                {errors.error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                        {errors.error}
                                    </div>
                                )}

                                {/* Footer Form */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <span className="text-xs text-gray-500"><span className="text-red-500">*</span> Wajib diisi</span>
                                    <div className="flex space-x-3">
                                        <Link 
                                            href={route('icsa.rekonsiliasi.index')} 
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Kembali
                                        </Link>
                                        <button 
                                            type="submit" 
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm disabled:opacity-50"
                                            disabled={processing}
                                        >
                                            {processing ? 'Memproses...' : 'Simpan Rekonsiliasi'}
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
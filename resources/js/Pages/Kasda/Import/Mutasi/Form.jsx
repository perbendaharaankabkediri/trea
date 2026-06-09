import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Form({ title }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        file_mutasi: null,
    });

    const handleSubmitPreview = (e) => {
        e.preventDefault();
        post(route('kasda.import.mutasi.preview'));
    };

    return (
        <AuthenticatedLayout title={title}>
            <Head title={title} />

            

            {/* ERROR FLASH NOTIFICATION */}
            {flash?.error && (
                <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <div className="text-sm font-medium">{flash.error}</div>
                </div>
            )}

            {/* UPLOAD CARD */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-xl text-blue-600">🏦</span>
                        <h6 className="font-bold text-gray-800">Upload File Mutasi Rekening</h6>
                    </div>

                    <form onSubmit={handleSubmitPreview} className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                File Excel Mutasi Rekening
                            </label>
                            
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    <span className="text-4xl block mb-2">📊</span>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file_mutasi" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            <span>Pilih file Excel</span>
                                            <input 
                                                id="file_mutasi" 
                                                name="file_mutasi" 
                                                type="file" 
                                                accept=".xls,.xlsx"
                                                className="sr-only" 
                                                onChange={e => setData('file_mutasi', e.target.files[0])}
                                                required
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">Ekstensi dokumen valid: .xls / .xlsx</p>
                                </div>
                            </div>
                            
                            {data.file_mutasi && (
                                <div className="mt-3 text-xs bg-emerald-50 text-emerald-700 font-medium px-3 py-2 rounded border border-emerald-100 flex items-center gap-2">
                                    <span>📎</span> Berkas siap diunggah: <strong>{data.file_mutasi.name}</strong>
                                </div>
                            )}
                            
                            {errors.file_mutasi && <p className="text-red-500 text-xs mt-1">{errors.file_mutasi}</p>}
                        </div>

                        {/* NAV BUTTONS */}
                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                            <Link 
                                href={route('kasda.import.index')} 
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded text-sm transition shadow-sm"
                            >
                                ← Kembali
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded text-sm shadow-sm transition disabled:opacity-50"
                            >
                                {processing ? 'Membaca Excel...' : 'Pratinjau Data (Preview)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
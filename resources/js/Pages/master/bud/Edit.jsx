import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Landmark, ArrowLeft, Save } from 'lucide-react';

export default function Edit({ title, bud }) {
    
    const { data, setData, put, processing, errors } = useForm({
        tahun: bud.tahun || '',
        nip: bud.nip || '',
        nama: bud.nama || '',
        jabatan: bud.jabatan || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('bud.update', bud.id));
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center space-x-2 text-slate-800 font-bold">
                    <Landmark size={18} className="text-amber-600" />
                    <span>Form Koreksi Informasi Pejabat BUD</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            {/* FIELD TAHUN */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Tahun Anggaran <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={data.tahun}
                                    onChange={e => setData('tahun', e.target.value)}
                                    className={`w-full py-2 px-3 border ${errors.tahun ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                />
                                {errors.tahun && <p className="text-red-500 text-xs mt-1">{errors.tahun}</p>}
                            </div>

                            {/* FIELD NIP */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">NIP Pejabat <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    maxLength="20"
                                    value={data.nip}
                                    onChange={e => setData('nip', e.target.value)}
                                    className={`w-full py-2 px-3 border ${errors.nip ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                />
                                {errors.nip && <p className="text-red-500 text-xs mt-1">{errors.nip}</p>}
                            </div>

                            {/* FIELD NAMA */}
                            <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap Pejabat <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
                                    className={`w-full py-2 px-3 border ${errors.nama ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>

                            {/* FIELD JABATAN */}
                            <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Jabatan Pokok</label>
                                <input
                                    type="text"
                                    value={data.jabatan}
                                    onChange={e => setData('jabatan', e.target.value)}
                                    className={`w-full py-2 px-3 border ${errors.jabatan ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                />
                                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
                            </div>

                        </div>
                    </div>

                    {/* STRIP TOMBOL AKSI */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium"><span className="text-red-500">*</span> Wajib diisi</span>
                        <div className="flex items-center space-x-2">
                            <Link href={route('bud.index')} className="inline-flex items-center space-x-1 py-1.5 px-3 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                                <ArrowLeft size={14} /> <span>Batal</span>
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center space-x-1 py-1.5 px-3.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Save size={14} /> <span>{processing ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
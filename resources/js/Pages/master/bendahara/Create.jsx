import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';

export default function Create({ title, listSkpd = [], jenis = [] }) {
    // Mesin Pengelola Form Otomatis dari Inertia
    const { data, setData, post, processing, errors } = useForm({
        kode_skpd: '',
        nip: '',
        nama: '',
        jenis_bendahara: '',
        bidang_bendahara: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bendahara.store'));
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center space-x-2 text-slate-800 font-bold">
                    <UserPlus size={18} className="text-blue-600" />
                    <span>Form Pendaftaran Bendahara Baru</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* FIELD SKPD */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">SKPD <span className="text-red-500">*</span></label>
                                <select
                                    value={data.kode_skpd}
                                    onChange={e => setData('kode_skpd', e.target.value)}
                                    className={`w-full py-2 px-3 bg-white border ${errors.kode_skpd ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                >
                                    <option value="">-- Pilih Satuan Kerja --</option>
                                    {listSkpd.map(s => (
                                        <option key={s.kode_skpd} value={s.kode_skpd}>{s.skpd}</option>
                                    ))}
                                </select>
                                {errors.kode_skpd && <p className="text-red-500 text-xs mt-1">{errors.kode_skpd}</p>}
                            </div>

                            {/* FIELD NIP */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">NIP Pegawai <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    maxLength="18"
                                    value={data.nip}
                                    onChange={e => setData('nip', e.target.value)}
                                    placeholder="Masukkan 18 digit NIP"
                                    className={`w-full py-2 px-3 border ${errors.nip ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                />
                                {errors.nip && <p className="text-red-500 text-xs mt-1">{errors.nip}</p>}
                            </div>

                            {/* FIELD NAMA */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
                                    placeholder="Nama tanpa gelar jika diperlukan"
                                    className={`w-full py-2 px-3 border ${errors.nama ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>

                            {/* FIELD JENIS BENDAHARA */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Jabatan / Jenis <span className="text-red-500">*</span></label>
                                <select
                                    value={data.jenis_bendahara}
                                    onChange={e => {
                                        setData(data => ({
                                            ...data,
                                            jenis_bendahara: e.target.value,
                                            // Reset input bidang otomatis jika bukan BPP
                                            bidang_bendahara: e.target.value !== '002' ? '' : data.bidang_bendahara
                                        }));
                                    }}
                                    className={`w-full py-2 px-3 bg-white border ${errors.jenis_bendahara ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                    required
                                >
                                    <option value="">-- Pilih Jenis Jabatan --</option>
                                    {jenis.map(j => (
                                        <option key={j.jenis_bendahara} value={j.jenis_bendahara}>{j.bendahara}</option>
                                    ))}
                                </select>
                                {errors.jenis_bendahara && <p className="text-red-500 text-xs mt-1">{errors.jenis_bendahara}</p>}
                            </div>

                            {/* 🚀 AUTO TOGGLE BIDANG (Replaces jQuery hide/show script) */}
                            {data.jenis_bendahara === '002' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nama Bidang Kerja <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.bidang_bendahara}
                                        onChange={e => setData('bidang_bendahara', e.target.value)}
                                        placeholder="Contoh: Bidang Pengairan / Sekretariat"
                                        className={`w-full py-2 px-3 border ${errors.bidang_bendahara ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500`}
                                        required
                                    />
                                    {errors.bidang_bendahara && <p className="text-red-500 text-xs mt-1">{errors.bidang_bendahara}</p>}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* ACTIONS PANEL */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium"><span className="text-red-500">*</span> Wajib diisi</span>
                        <div className="flex items-center space-x-2">
                            <Link href={route('bendahara.index')} className="inline-flex items-center space-x-1 py-1.5 px-3 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                                <ArrowLeft size={14} /> <span>Kembali</span>
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center space-x-1 py-1.5 px-3.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Save size={14} /> <span>{processing ? 'Menyimpan...' : 'Simpan Data'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
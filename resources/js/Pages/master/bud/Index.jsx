import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Landmark, Plus, Search, X, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function Index({ title, list = [] }) {
    const { flash, tahun } = usePage().props;
    const [search, setSearch] = useState('');
    const [modalDelete, setModalDelete] = useState({ open: false, id: null, nama: '' });

    // Live Search Client-side 
    const filteredList = list.filter((row) => {
        const keyword = search.toLowerCase();
        return (
            row.nama?.toLowerCase().includes(keyword) ||
            row.nip?.toLowerCase().includes(keyword) ||
            row.jabatan?.toLowerCase().includes(keyword) ||
            row.tahun?.toString().includes(keyword)
        );
    });

    const handleDelete = () => {
        router.delete(route('bud.destroy', modalDelete.id), {
            onSuccess: () => setModalDelete({ open: false, id: null, nama: '' })
        });
    };

    return (
        <AuthenticatedLayout header={<span>{title}</span>}>
            <Head title={title} />

            {/* FLASH NOTIFIKASI */}
            {flash?.success && (
                <div className="mb-4 flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm shadow-sm">
                    <span className="font-medium mr-2">Sukses!</span> {flash.success}
                </div>
            )}

            {list.length === 0 ? (
                /* KONDISI DATA KOSONG */
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <Landmark className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-base font-semibold text-slate-800 mb-1">Data BUD Belum Tersedia</h3>
                    <p className="text-sm text-slate-500 mb-5">Data Bendahara Umum Daerah untuk T.A. {tahun} belum diinput.</p>
                    <Link href={route('bud.create')} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
                        <Plus size={16} /> <span>Tambah BUD</span>
                    </Link>
                </div>
            ) : (
                /* UTAMA: CARD TABLE */
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* PANEL HEADER */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-slate-800 font-bold">
                                <Landmark size={20} className="text-blue-600" />
                                <span>Manajemen Pejabat BUD</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Total: {list.length} Pejabat Aktif &mdash; T.A. {tahun}</p>
                        </div>
                        <Link href={route('bud.create')} className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                            <Plus size={16} /> <span>Tambah BUD</span>
                        </Link>
                    </div>

                    {/* LIVE SEARCH */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-80">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIP, atau jabatan..."
                                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DATA TABEL */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-4 text-center w-12">No</th>
                                    <th className="py-3.5 px-4 text-center w-24">Tahun</th>
                                    <th className="py-3.5 px-4">Nama Lengkap</th>
                                    <th className="py-3.5 px-4 w-52">NIP</th>
                                    <th className="py-3.5 px-4">Jabatan Pokok</th>
                                    <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                                            Data pencarian BUD tidak ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((row, idx) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {row.tahun}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-800">{row.nama}</td>
                                            <td className="py-3 px-4"><code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{row.nip}</code></td>
                                            <td className="py-3 px-4 font-medium text-slate-600">{row.jabatan || '-'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center -space-x-px rounded-md shadow-sm border border-slate-200 bg-white">
                                                    <Link href={route('bud.edit', row.id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-l-md" title="Ubah Data">
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button onClick={() => setModalDelete({ open: true, id: row.id, nama: row.nama })} className="p-2 text-red-600 hover:bg-red-50 rounded-r-md border-l border-slate-200" title="Hapus Data">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS TAILWIND */}
            {modalDelete.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-red-600 text-white px-5 py-3 flex items-center space-x-2">
                            <AlertTriangle size={18} />
                            <span className="font-semibold text-sm">Konfirmasi Hapus BUD</span>
                        </div>
                        <div className="p-5 text-sm text-slate-600">
                            Apakah Anda yakin ingin menghapus data pejabat BUD berikut:<br />
                            <strong className="text-red-600 block mt-1 font-semibold">{modalDelete.nama}</strong>
                            <p className="text-xs text-slate-400 mt-2">*Data yang dihapus tidak dapat dikembalikan.</p>
                        </div>
                        <div className="px-5 py-3.5 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
                            <button onClick={() => setModalDelete({ open: false, id: null, nama: '' })} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
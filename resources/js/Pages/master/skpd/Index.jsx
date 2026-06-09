import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ title, list = [] }) {
    return (
        <AuthenticatedLayout
            header={<span>{title}</span>} // Mengirim judul ke Topbar
        >
            <Head title={title} />

            
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* CARD TABLE (Menggantikan .card Bootstrap) */}
                    <div className="overflow-hidden bg-white shadow-md sm:rounded-xl border border-slate-200">
                        
                        {/* CARD HEADER */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                            <h3 className="text-lg font-medium text-blue-600 flex items-center">
                                {/* Menggunakan SVG bawaan atau class FontAwesome jika CDN-nya kamu pasang */}
                                <span className="mr-2">🏢</span> Tabel SKPD
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                                Total: {list.length}
                            </span>
                        </div>

                        {/* CARD BODY & TABLE */}
                        <div className="p-6 bg-white overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="w-16 px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">No</th>
                                        <th scope="col" className="w-48 px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Kode SKPD</th>
                                        <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">Nama SKPD</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* MENGGANTIKAN @forelse di Blade */}
                                    {list.length > 0 ? (
                                        list.map((row, index) => (
                                            <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 text-center text-gray-600 border-r border-gray-200">{index + 1}</td>
                                                <td className="px-6 py-3 text-center font-mono text-gray-700 border-r border-gray-200">{row.kode_skpd}</td>
                                                <td className="px-6 py-3 text-gray-900">{row.skpd}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        /* MENGGANTIKAN @empty di Blade */
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-3xl mb-2">🗄️</span>
                                                    <div className="text-base font-medium text-gray-600">Data SKPD belum tersedia.</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    {/* END CARD TABLE */}

                </div>
            
        </AuthenticatedLayout>
    );
}
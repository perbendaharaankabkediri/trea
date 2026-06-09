import React, { useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, title, data }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                showConfirmButton: false,
                timer: 2500,
                customClass: { popup: 'rounded-lg' }
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: flash.error,
                showConfirmButton: true,
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-lg' }
            });
        }
    }, [flash]);

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPeriode = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: "Berita acara dan rincian selisihnya akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            focusCancel: true,
            customClass: { popup: 'rounded-lg' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('kasda.rekon.destroy', id), {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={title} />

            {/* Header Section */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                <div>
                    <h1 className="h3 text-dark font-weight-bold mb-1" style={{ letterSpacing: '-0.5px' }}>
                        {title}
                    </h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 bg-transparent p-0" style={{ fontSize: '0.85rem' }}>
                            <li className="breadcrumb-item text-muted">Kasda</li>
                            <li className="breadcrumb-item active text-secondary font-weight-medium" aria-current="page">
                                Rekonsiliasi Bank
                            </li>
                        </ol>
                    </nav>
                </div>
                <div>
                    <Link 
                        href={route('kasda.rekon.create')} 
                        className="btn btn-primary btn-md px-4 rounded-lg shadow-sm d-inline-flex align-items-center font-weight-medium transition shadow-button"
                        style={{ gap: '8px', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        <i className="fas fa-plus fa-sm"></i>
                        <span>Tambah Berita Acara</span>
                    </Link>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="card border-0 shadow-soft rounded-lg overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
                            <thead className="thead-custom text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                <tr>
                                    <th width="5%" className="text-center py-3">No</th>
                                    <th width="20%" className="py-3">Periode Rekon</th>
                                    <th width="22%" className="text-right py-3">Saldo Buku Akhir</th>
                                    <th width="22%" className="text-right py-3">Saldo Bank Akhir</th>
                                    <th width="18%" className="text-center py-3">Status / Selisih</th>
                                    <th width="13%" className="text-center py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-dark" style={{ fontSize: '0.875rem' }}>
                                {data.length > 0 ? (
                                    data.map((item, key) => {
                                        const hasDifference = item.selisih !== 0;
                                        return (
                                            <tr key={item.id} className="transition-all table-row-custom">
                                                <td className="text-center text-muted font-weight-medium">{key + 1}</td>
                                                <td className="font-weight-medium text-dark">
                                                    <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                        <i className="far fa-calendar-alt text-muted" style={{ fontSize: '1rem' }}></i>
                                                        <span>{formatPeriode(item.periode_rekon)}</span>
                                                    </div>
                                                </td>
                                                <td className="text-right font-weight-mono text-secondary">{formatRupiah(item.saldo_buku_akhir)}</td>
                                                <td className="text-right font-weight-mono text-secondary">{formatRupiah(item.saldo_bank_akhir)}</td>
                                                <td className="text-center">
                                                    {hasDifference ? (
                                                        <div className="d-inline-flex flex-column align-items-center">
                                                            <span className="badge-custom badge-danger mb-1">
                                                                <span className="badge-dot badge-dot-danger"></span> Selisih
                                                            </span>
                                                            <span className="font-weight-mono text-danger font-weight-medium" style={{ fontSize: '0.8rem' }}>
                                                                {formatRupiah(item.selisih)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="badge-custom badge-success">
                                                            <span className="badge-dot badge-dot-success"></span> Seimbang
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center align-items-center" style={{ gap: '4px' }}>
                                                        <Link 
                                                            href={route('kasda.rekon.show', item.id)} 
                                                            className="btn-action btn-action-info"
                                                            title="Detail Rincian"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <a 
                                                            href={route('kasda.rekon.print', item.id)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="btn-action btn-action-danger"
                                                            title="Cetak Berita Acara"
                                                        >
                                                            <i className="fas fa-file-pdf"></i>
                                                        </a>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDelete(item.id)} 
                                                            className="btn-action btn-action-muted"
                                                            title="Hapus"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted bg-white">
                                            <div className="d-flex flex-column align-items-center justify-content-center py-4" style={{ opacity: 0.7 }}>
                                                <div className="empty-state-icon mb-3">
                                                    <i className="fas fa-folder-open fa-2x text-muted"></i>
                                                </div>
                                                <p className="mb-1 font-weight-bold text-dark" style={{ fontSize: '1rem' }}>Belum Ada Data Berita Acara</p>
                                                <small className="text-muted">Klik tombol "Tambah Berita Acara" untuk membuat dokumen baru.</small>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Premium Style Injection */}
            <style dangerouslySetInnerHTML={{__html: `
                .rounded-lg { border-radius: 0.75rem !important; }
                .font-weight-medium { font-weight: 500 !important; }
                .font-weight-bold { font-weight: 600 !important; }
                
                /* Monospace khusus angka keuangan agar rapi tegak lurus */
                .font-weight-mono { 
                    font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace !important; 
                    letter-spacing: -0.2px;
                }
                
                /* Custom Shadow Dashboard */
                .shadow-soft {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
                    border: 1px solid rgba(229, 231, 235, 0.6) !important;
                }
                .shadow-button:hover {
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
                    opacity: 0.95;
                }

                /* Header Tabel */
                .thead-custom {
                    background-color: #f9fafb;
                    border-bottom: 2px solid #f3f4f6;
                }
                .thead-custom th {
                    font-weight: 600 !important;
                    color: #4b5563 !important;
                }

                /* Row style */
                .table-row-custom td {
                    padding-top: 1rem !important;
                    padding-bottom: 1rem !important;
                    border-bottom: 1px solid #f3f4f6;
                }
                .table-hover tbody tr:hover { 
                    background-color: #f8fafc !important; 
                }

                /* Premium Minimalist Badge */
                .badge-custom {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                .badge-success { background-color: #ecfdf5; color: #059669; }
                .badge-danger { background-color: #fef2f2; color: #dc2626; }
                
                .badge-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .badge-dot-success { background-color: #10b981; }
                .badge-dot-danger { background-color: #ef4444; }

                /* Action Button Polishing */
                .btn-action {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content-center;
                    border: 1px solid #e5e7eb;
                    background-color: #ffffff;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                .btn-action-info { color: #2563eb; }
                .btn-action-info:hover { background-color: #eff6ff; border-color: #bfdbfe; }
                
                .btn-action-danger { color: #dc2626; }
                .btn-action-danger:hover { background-color: #fef2f2; border-color: #fecaca; }
                
                .btn-action-muted { color: #6b7280; }
                .btn-action-muted:hover { background-color: #f3f4f6; border-color: #d1d5db; color: #111827; }

                /* Empty State */
                .empty-state-icon {
                    width: 60px;
                    height: 60px;
                    background-color: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content-center;
                    color: #9ca3af;
                }
                
                .transition-all { transition: all 0.2s ease-in-out; }
            `}} />
        </AuthenticatedLayout>
    );
}
import { Head, Link } from '@inertiajs/react';
import {
    LayoutDashboard, RefreshCw, Database, Landmark,
    BarChart3, Users, Settings, LogIn, ArrowRight
} from 'lucide-react';

const modules = [
    {
        icon: Database,
        name: 'Master Data',
        desc: 'Data SKPD, Bendahara, dan BUD',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
    },
    {
        icon: RefreshCw,
        name: 'ICSA',
        desc: 'Rekonsiliasi kas, rekap data & monitoring',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: Landmark,
        name: 'Kasda',
        desc: 'Import, monitoring harian & bulanan',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    {
        icon: BarChart3,
        name: 'Pelaporan',
        desc: 'Ekspor Excel & laporan cetak siap pakai',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
    },
    {
        icon: Users,
        name: 'Pengguna',
        desc: 'Manajemen akses dan hak pengguna',
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
    },
    {
        icon: Settings,
        name: 'Pengaturan',
        desc: 'Konfigurasi sistem dan tahun anggaran',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
    },
];

export default function Welcome({ auth, tahun }) {
    const currentYear = tahun || new Date().getFullYear();

    return (
        <>
            <Head title="Selamat Datang" />

            <div className="min-h-screen bg-[#060b17] text-slate-400 font-sans antialiased relative overflow-hidden">

                {/* Grid background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)',
                    }}
                />

                {/* Blue glow */}
                <div
                    className="absolute z-0 pointer-events-none"
                    style={{
                        top: '-160px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '700px',
                        height: '400px',
                        background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)',
                    }}
                />

                <div className="relative z-10">

                    {/* ─── TOPBAR ─── */}
                    <nav className="h-[46px] flex items-center justify-between px-6 border-b border-white/[0.05] bg-[#0f172a]/80 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="w-[26px] h-[26px] rounded-[7px] bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-white">T</span>
                            </div>
                            <span className="text-[13px] font-bold tracking-[4px] text-white">TREA</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <LayoutDashboard size={13} />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
                                    >
                                        <LogIn size={13} />
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* ─── HERO ─── */}
                    <div className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <span className="w-[5px] h-[5px] rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-blue-400 tracking-wide">
                                2026
                            </span>
                        </div>

                        <h1 className="text-[clamp(28px,5vw,42px)] font-bold leading-[1.15] tracking-tight text-white mb-4">
                            Trea
                            <span className="text-blue-400">sury</span>
                        </h1>

                        <p className="text-[14px] leading-[1.75] text-slate-500 max-w-md mx-auto mb-8">
                            "my tools"
                        </p>

                        <div className="flex items-center justify-center gap-2.5 flex-wrap">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                                >
                                    <LayoutDashboard size={14} />
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                                    >
                                        <LayoutDashboard size={14} />
                                        Buka Dashboard
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-medium text-slate-500 border border-white/[0.08] hover:bg-white/[0.04] hover:text-slate-300 transition-colors"
                                    >
                                        <ArrowRight size={14} />
                                        Daftar Akun
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── STATS ─── */}
                    {/* <div className="flex justify-center gap-8 flex-wrap px-6 mb-12">
                        {[
                            { num: '3', label: 'Modul Aktif' },
                            { num: String(currentYear), label: 'Tahun Anggaran' },
                            { num: 'T.A.', label: 'Berjalan' },
                        ].map(({ num, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-[22px] font-bold text-white leading-none">{num}</div>
                                <div className="text-[11px] text-slate-700 mt-1">{label}</div>
                            </div>
                        ))}
                    </div> */}

                    {/* ─── DIVIDER ─── */}
                    <div className="max-w-xl mx-auto px-6">
                        <div className="h-px bg-white/[0.04]" />
                    </div>

                    {/* ─── MODULES ─── */}
                    {/* <div className="max-w-2xl mx-auto px-6 py-12">
                        <p className="text-[10px] font-bold tracking-[0.1em] text-slate-800 uppercase text-center mb-5">
                            Modul Sistem
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {modules.map(({ icon: Icon, name, desc, color, bg }) => (
                                <div
                                    key={name}
                                    className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 hover:bg-white/[0.04] hover:border-white/[0.09] transition-colors"
                                >
                                    <div className={`w-[30px] h-[30px] rounded-[7px] ${bg} ${color} flex items-center justify-center mb-2.5`}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="text-[12px] font-semibold text-slate-300 mb-0.5">{name}</div>
                                    <div className="text-[11px] text-slate-700 leading-[1.5]">{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* ─── FOOTER ─── */}
                    {/* <footer className="py-5 text-center text-[11px] text-slate-800">
                        TREA&nbsp;{' '}
                        <span className="text-slate-700">T.A. {currentYear}</span>
                    </footer> */}

                </div>
            </div>
        </>
    );
}

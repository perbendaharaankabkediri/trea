import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, Database, Building2, UserCheck, Wallet, 
    RefreshCw, FileSpreadsheet, BarChart3, DownloadCloud, 
    Clock, CalendarDays, Landmark, Settings, LogOut, Menu, X,
    Bell, ChevronDown, User
} from 'lucide-react';

function SidebarGroup({ icon: Icon, label, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-2.5 py-[7px] rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all duration-150 mt-1"
            >
                <div className="flex items-center gap-2">
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="text-[11.5px] font-semibold">{label}</span>
                </div>
                <ChevronDown
                    size={12}
                    className={`text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <div className={`overflow-hidden transition-all duration-250 ease-in-out pl-2.5 ${open ? 'max-h-60' : 'max-h-0'}`}>
                <div className="space-y-0.5 py-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

function SubItem({ href, label, active = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[11.5px] transition-all duration-150 ${
                active
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`}
        >
            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? 'bg-blue-400' : 'bg-slate-600'}`} />
            {label}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, tahun } = usePage().props;
    const url = usePage().url;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const isActive = (path) => url.startsWith(path);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="flex h-screen bg-slate-100 font-sans antialiased">

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex w-[210px] flex-col bg-[#080d1a] text-slate-400 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* HEADER */}
                <div className="flex h-[46px] items-center justify-between px-3.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                        <div className="w-[26px] h-[26px] rounded-[7px] bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <img src="/trea.png" alt="Logo" className="w-4 h-4 object-contain" 
                                onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="text-[10px] font-black text-white">T</span>'; }}
                            />
                        </div>
                        <span className="text-[13px] font-bold tracking-[4px] text-white">TREA</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-white/5 text-slate-500 lg:hidden">
                        <X size={16} />
                    </button>
                </div>

                {/* MENU */}
                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">

                    {/* Dashboard */}
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[12px] font-medium transition-all duration-150 ${
                            isActive('/dashboard')
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                        }`}
                    >
                        <LayoutDashboard size={15} />
                        <span>Dashboard</span>
                    </Link>

                    {/* Master Data */}
                    <SidebarGroup icon={Database} label="Master Data" defaultOpen={
                        isActive('/skpd') || isActive('/bendahara') || isActive('/bud')
                    }>
                        <SubItem href={route('skpd.index')} label="Data SKPD" active={isActive('/skpd')} />
                        <SubItem href={route('bendahara.index')} label="Data Bendahara" active={isActive('/bendahara')} />
                        <SubItem href={route('bud.index')} label="Data BUD" active={isActive('/bud')} />
                    </SidebarGroup>

                    {/* ICSA Group */}
                    <SidebarGroup icon={RefreshCw} label="ICSA" defaultOpen={
                        isActive('/icsa/rekonsiliasi') || isActive('/icsa/rekapdata') || isActive('/icsa/rekapmonitoring')
                    }>
                        <SubItem 
                            href={route('icsa.rekonsiliasi.index')} 
                            label="Rekonsiliasi Kas" 
                            active={isActive('/icsa/rekonsiliasi')} 
                        />
                        <SubItem 
                            href={route('icsa.rekapdata')} 
                            label="Rekap Data" 
                            active={isActive('/icsa/rekapdata')} 
                        />
                        <SubItem 
                            href={route('icsa.rekapmonitoring')} 
                            label="Rekap Monitoring" 
                            active={isActive('/icsa/rekapmonitoring')} 
                        />
                    </SidebarGroup>

                    {/* Kasda */}
                    <SidebarGroup icon={Landmark} label="Kasda" defaultOpen={
                        isActive('/kasda/import') || isActive('/kasda/monitoring/harian') || isActive('/kasda/monitoring/bulanan')
                    }>
                        <SubItem href={route('kasda.import.index')} label="Import" active={isActive('/kasda/import')} />
                        <SubItem href={route('kasda.monitoring.harian')} label="Monitoring Harian" active={isActive('/kasda/monitoring/harian')} />
                        <SubItem href={route('kasda.monitoring.bulanan')} label="Monitoring Bulanan" active={isActive('/kasda/monitoring/bulanan')} />
                        <SubItem href="#" label="Rekonsiliasi Bank" active={false} />
                    </SidebarGroup>

                </div>
            </aside>

            {/* Backdrop mobile */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
            )}

            {/* CONTENT AREA */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* TOPBAR */}
                <header className="flex h-[46px] items-center justify-between bg-[#0f172a] border-b border-white/[0.06] px-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 transition-colors lg:hidden">
                            <Menu size={18} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-[12px]">
                            <span className="text-slate-500">TREA</span>
                            <span className="text-slate-700">›</span>
                            <span className="text-slate-200 font-semibold">{header || 'Dashboard'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* T.A. Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                            <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">T.A. {tahun || '2026'}</span>
                        </div>

                        {/* Notifikasi */}
                        <button className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all border border-white/[0.06]">
                            <Bell size={14} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 pl-[3px] pr-2.5 py-[3px] rounded-[8px] bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all"
                            >
                                <div className="w-[26px] h-[26px] rounded-[6px] bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                    {(auth?.user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-[11.5px] font-medium text-slate-400">
                                    {auth?.user?.name || 'User'}
                                </span>
                                <ChevronDown
                                    size={12}
                                    className={`text-slate-600 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown */}
                            {profileOpen && (
                                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#0f172a] rounded-xl border border-white/[0.08] shadow-2xl py-1.5 z-50">
                                    <div className="px-3.5 py-2.5 border-b border-white/[0.06]">
                                        <p className="text-[13px] font-semibold text-slate-200">{auth?.user?.name || 'User'}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{auth?.user?.email || ''}</p>
                                    </div>
                                    <div className="pt-1 px-1.5">
                                        <Link href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                                            <User size={13} className="text-slate-600" />
                                            Profil Saya
                                        </Link>
                                        <Link href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                                            <Settings size={13} className="text-slate-600" />
                                            Pengaturan
                                        </Link>
                                    </div>
                                    <div className="my-1.5 border-t border-white/[0.05]" />
                                    <div className="px-1.5 pb-1">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                                        >
                                            <LogOut size={13} />
                                            Logout
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#060b17] font-sans antialiased relative overflow-hidden">

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

            {/* Topbar */}
            <nav className="relative z-10 h-[46px] flex items-center justify-between px-6 border-b border-white/[0.05] bg-[#0f172a]/95 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-[26px] h-[26px] rounded-[7px] bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <img
                            src="/trea.png"
                            alt="Logo"
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<span class="text-[10px] font-black text-white">T</span>';
                            }}
                        />
                    </div>
                    <span className="text-[13px] font-bold tracking-[4px] text-white">TREA</span>
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-[11.5px] text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors"
                >
                    <ArrowLeft size={13} />
                    Kembali
                </Link>
            </nav>

            {/* Content */}
            <div className="relative z-10 flex min-h-[calc(100vh-46px)] items-center justify-center px-4 py-10">
                {children}
            </div>
        </div>
    );
}

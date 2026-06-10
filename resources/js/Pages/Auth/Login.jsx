import Checkbox from '@/components/Checkbox';
import InputError from '@/components/InputError';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, Mail, Lock, ChevronDown } from 'lucide-react';

const tahunOptions = ['2024', '2025', '2026', '2027'];

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        tahun: String(new Date().getFullYear()),
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="w-full max-w-[360px]">

                {/* Card */}
                <div className="bg-[#0d1424] border border-white/[0.07] rounded-[14px] p-7">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                            <LogIn size={18} className="text-blue-400" />
                        </div>
                        <h1 className="text-[16px] font-bold text-white mb-1">Masuk ke TREA</h1>
                        <p className="text-[11.5px] text-slate-600">Masukkan kredensial akun Anda</p>
                    </div>

                    {/* T.A. Badge */}
                    <div className="flex justify-center mb-5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15]">
                            <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="text-[10.5px] font-semibold text-blue-400 tracking-wide">
                                T.A. {data.tahun}
                            </span>
                        </div>
                    </div>

                    {status && (
                        <div className="mb-4 text-[11.5px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3.5">

                        {/* Email */}
                        <div>
                            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@pemda.go.id"
                                    className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1.5 text-[11px]" />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1.5 text-[11px]" />
                        </div>

                        {/* Tahun Anggaran */}
                        <div>
                            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                                Tahun Anggaran
                            </label>
                            <div className="relative">
                                <select
                                    id="tahun"
                                    name="tahun"
                                    value={data.tahun}
                                    onChange={(e) => setData('tahun', e.target.value)}
                                    required
                                    className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] px-3 text-[12px] text-slate-300 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors appearance-none"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    {tahunOptions.map((t) => (
                                        <option key={t} value={t} className="bg-[#0d1424]">{t}</option>
                                    ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                            </div>
                            <InputError message={errors.tahun} className="mt-1.5 text-[11px]" />
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-[11.5px] text-slate-600">Ingat saya</span>
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-[38px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-colors mt-1"
                        >
                            <LogIn size={14} />
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>

            </div>
        </GuestLayout>
    );
}

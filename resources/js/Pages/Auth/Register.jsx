import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldOff, LogIn } from 'lucide-react';

export default function Register() {
    return (
        <GuestLayout>
            <Head title="Pendaftaran Ditutup — TREA" />

            <div className="w-full max-w-[360px]">
                <div className="bg-[#0d1424] border border-white/[0.07] rounded-[14px] p-7">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                            <ShieldOff size={18} className="text-amber-400" />
                        </div>
                        <h1 className="text-[16px] font-bold text-white mb-1">Pendaftaran Ditutup</h1>
                        <p className="text-[11.5px] text-slate-600 leading-relaxed max-w-[220px] mx-auto">
                            Registrasi akun baru saat ini tidak tersedia. Hubungi administrator sistem untuk mendapatkan akses.
                        </p>
                    </div>

                    {/* Info box */}
                    <div className="bg-amber-500/[0.06] border border-amber-500/[0.15] rounded-[10px] p-4 mb-5">
                        <p className="text-[11.5px] text-amber-600/80 leading-relaxed text-center">
                            Akses ke sistem TREA diberikan oleh admin kepada pengguna yang berwenang.
                        </p>
                    </div>

                    {/* Back to login */}
                    <Link
                        href={route('login')}
                        className="w-full h-[38px] bg-blue-600 hover:bg-blue-700 rounded-[8px] text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogIn size={14} />
                        Kembali ke Halaman Masuk
                    </Link>

                </div>
            </div>
        </GuestLayout>
    );
}



// NORMAL

// import InputError from '@/components/InputError';
// import GuestLayout from '@/layouts/GuestLayout';
// import { Head, Link, useForm } from '@inertiajs/react';
// import { UserPlus, User, Mail, Lock, LockOpen } from 'lucide-react';

// export default function Register() {
//     const { data, setData, post, processing, errors, reset } = useForm({
//         name: '',
//         email: '',
//         password: '',
//         password_confirmation: '',
//     });

//     const submit = (e) => {
//         e.preventDefault();
//         post(route('register'), {
//             onFinish: () => reset('password', 'password_confirmation'),
//         });
//     };

//     return (
//         <GuestLayout>
//             <Head title="Daftar — TREA" />

//             <div className="w-full max-w-[360px]">
//                 <div className="bg-[#0d1424] border border-white/[0.07] rounded-[14px] p-7">

//                     {/* Header */}
//                     <div className="text-center mb-6">
//                         <div className="w-[38px] h-[38px] rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
//                             <UserPlus size={18} className="text-emerald-400" />
//                         </div>
//                         <h1 className="text-[16px] font-bold text-white mb-1">Buat Akun Baru</h1>
//                         <p className="text-[11.5px] text-slate-600">Isi data untuk mendaftar ke sistem TREA</p>
//                     </div>

//                     <form onSubmit={submit} className="space-y-3.5">

//                         {/* Nama */}
//                         <div>
//                             <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
//                                 Nama Lengkap
//                             </label>
//                             <div className="relative">
//                                 <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
//                                 <input
//                                     id="name"
//                                     name="name"
//                                     type="text"
//                                     value={data.name}
//                                     autoComplete="name"
//                                     autoFocus
//                                     required
//                                     onChange={(e) => setData('name', e.target.value)}
//                                     placeholder="Nama Lengkap"
//                                     className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-colors"
//                                 />
//                             </div>
//                             <InputError message={errors.name} className="mt-1.5 text-[11px]" />
//                         </div>

//                         {/* Email */}
//                         <div>
//                             <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
//                                 Email
//                             </label>
//                             <div className="relative">
//                                 <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
//                                 <input
//                                     id="email"
//                                     type="email"
//                                     name="email"
//                                     value={data.email}
//                                     autoComplete="username"
//                                     required
//                                     onChange={(e) => setData('email', e.target.value)}
//                                     placeholder="email@pemda.go.id"
//                                     className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-colors"
//                                 />
//                             </div>
//                             <InputError message={errors.email} className="mt-1.5 text-[11px]" />
//                         </div>

//                         {/* Password */}
//                         <div>
//                             <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
//                                 Password
//                             </label>
//                             <div className="relative">
//                                 <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
//                                 <input
//                                     id="password"
//                                     type="password"
//                                     name="password"
//                                     value={data.password}
//                                     autoComplete="new-password"
//                                     required
//                                     onChange={(e) => setData('password', e.target.value)}
//                                     placeholder="Min. 8 karakter"
//                                     className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-colors"
//                                 />
//                             </div>
//                             <InputError message={errors.password} className="mt-1.5 text-[11px]" />
//                         </div>

//                         {/* Konfirmasi Password */}
//                         <div>
//                             <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
//                                 Konfirmasi Password
//                             </label>
//                             <div className="relative">
//                                 <LockOpen size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
//                                 <input
//                                     id="password_confirmation"
//                                     type="password"
//                                     name="password_confirmation"
//                                     value={data.password_confirmation}
//                                     autoComplete="new-password"
//                                     required
//                                     onChange={(e) => setData('password_confirmation', e.target.value)}
//                                     placeholder="Ulangi password"
//                                     className="w-full h-[36px] bg-white/[0.03] border border-white/[0.07] rounded-[7px] pl-8 pr-3 text-[12px] text-slate-300 placeholder-slate-800 outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-colors"
//                                 />
//                             </div>
//                             <InputError message={errors.password_confirmation} className="mt-1.5 text-[11px]" />
//                         </div>

//                         {/* Submit */}
//                         <button
//                             type="submit"
//                             disabled={processing}
//                             className="w-full h-[38px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-colors mt-1"
//                         >
//                             <UserPlus size={14} />
//                             {processing ? 'Memproses...' : 'Daftar'}
//                         </button>

//                         {/* Link login */}
//                         <p className="text-center text-[11.5px] text-slate-600 pt-1">
//                             Sudah punya akun?{' '}
//                             <Link
//                                 href={route('login')}
//                                 className="text-blue-500 hover:text-blue-400 transition-colors"
//                             >
//                                 Masuk di sini
//                             </Link>
//                         </p>
//                     </form>
//                 </div>
//             </div>
//         </GuestLayout>
//     );
// }

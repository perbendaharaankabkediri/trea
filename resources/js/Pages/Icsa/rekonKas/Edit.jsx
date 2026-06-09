import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function Edit({ auth, title, rekon, dataRekon }) {
    // 1. State Navigasi Tab
    const [activeTab, setActiveTab] = useState('tabA');

    // State pelacak kursor aktif untuk pemformatan on-blur
    const [focusedField, setFocusedField] = useState(null);

    // 2. State Lokal untuk Tools Perhitungan (Tab A & Tab B)
    const [tools, setTools] = useState({
        // Kalkulator Pembantu SP2D LS
        sp2d_ls_gaji: '',
        sp2d_ls_barjas: '',
        // Kalkulator Pembantu SPJ LS
        spj_ls_gaji: '',
        spj_ls_barjas: '',
        // Kalkulator Pembantu Tab B
        bku_penerimaan_total: '',
        bku_penerimaan_sblm: '',
        bku_pengeluaran_total: '',
        bku_pengeluaran_sblm: '',
    });

    // 3. Inisialisasi React Form Hook dari Inertia
    const { data, setData, put, processing, errors } = useForm({
        tanggal_rekon: rekon.tanggal_rekon ? rekon.tanggal_rekon.substring(0, 10) : '',
        
        // Tab A Fields (Menggunakan nilai default dari database)
        sp2d_ls: dataRekon.tabA.penerimaan.ls ?? 0,
        sp2d_upgu: dataRekon.tabA.penerimaan.up_gu ?? 0,
        sp2d_tu: dataRekon.tabA.penerimaan.tu ?? 0,
        sp2d_gukkpd: dataRekon.tabA.penerimaan.gukkpd ?? 0,

        spj_ls: dataRekon.tabA.pengeluaran.spj_ls ?? 0,
        spj_upgu: dataRekon.tabA.pengeluaran.spj_up_gu ?? 0,
        spj_tu: dataRekon.tabA.pengeluaran.spj_tu ?? 0,
        spj_gukkpd: dataRekon.tabA.pengeluaran.spj_gukkpd ?? 0,
        sts_upgu: dataRekon.tabA.pengeluaran.sts_up_gu ?? 0,
        sts_tu: dataRekon.tabA.pengeluaran.sts_tu ?? 0,
        cp_ls: dataRekon.tabA.pengeluaran.cp_ls ?? 0,
        cp_upgu: dataRekon.tabA.pengeluaran.cp_up_gu ?? 0,
        cp_tu: dataRekon.tabA.pengeluaran.cp_tu ?? 0,

        // Tab B Fields
        bku_penerimaan: dataRekon.tabB.penerimaan ?? 0,
        bku_pengeluaran: dataRekon.tabB.pengeluaran ?? 0,
        keterangan_bku: dataRekon.keterangan_selisih.keterangan_bku || '',

        // Tab C Fields
        posisi_kas: dataRekon.tabC.list_bendahara.map((b) => {
            const match = dataRekon.tabC.posisi_kas.find(
                (p) => p.jenis_bendahara === b.jenis_bendahara && p.bidang_bendahara === b.bidang_bendahara
            );
            return {
                jenis_bendahara: b.jenis_bendahara,
                bidang_bendahara: b.bidang_bendahara || '',
                label: b.jenis_bendahara === '001' ? 'Bendahara Pengeluaran' : `BPP ${b.bidang_bendahara || ''}`,
                kas_tunai: match ? match.kas_tunai : 0,
                kas_di_bank: match ? match.kas_di_bank : 0,
            };
        }),
        keterangan_posisi_kas: dataRekon.keterangan_selisih.keterangan_posisi_kas || '',
    });

    // 4. Helper Pemformatan Rupiah Terstandarisasi (Hanya untuk VIEW Teks)
    const formatRupiah = (num) => {
        const cleanNum = parseNum(num);
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(cleanNum);
    };

    // Helper Super Kuat: Mampu membersihkan awalan "Rp", spasi, titik ribuan, dan mengonversi koma desimal ke float JS murni
    const parseNum = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        
        // Bersihkan semua karakter kecuali Angka, Koma, Titik, dan Minus
        let str = val.toString().replace(/[^0-9.,-]/g, '');
        
        // Kasus 1: Ada titik ribuan DAN koma desimal (contoh: 2.247.643.557,00)
        if (str.includes('.') && str.includes(',')) {
            str = str.replace(/\./g, '').replace(/,/g, '.');
        } 
        // Kasus 2: Hanya ada koma desimal tanpa titik ribuan (contoh: 1250000,50)
        else if (str.includes(',')) {
            str = str.replace(/,/g, '.');
        } 
        // Kasus 3: Hanya ada titik (Bisa jadi ribuan 1.500.000 atau pecahan desimal sistem luar 1500.50)
        else if (str.includes('.')) {
            const dotCount = (str.match(/\./g) || []).length;
            if (dotCount > 1) {
                str = str.replace(/\./g, ''); // Lebih dari 1 titik pasti ribuan
            } else {
                const parts = str.split('.');
                if (parts[1] && parts[1].length === 3) {
                    str = str.replace(/\./g, ''); // Akhiran 3 angka setelah titik kemungkinan besar ribuan lokal
                }
            }
        }
        
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
    };

    const bulanNama = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // ✅ HELPER: Handler onFocus universal — set focused field + select all teks
    const handleFocus = (fieldKey, e) => {
        setFocusedField(fieldKey);
        const target = e.target; // simpan referensi dulu sebelum masuk setTimeout
        setTimeout(() => target.select(), 0);
    };

    // 5. CALCULATION ENGINE (Real-time update data tanpa merusak kursor ketik)
    const totalPenerimaanA = parseNum(data.sp2d_ls) + parseNum(data.sp2d_upgu) + parseNum(data.sp2d_tu) + parseNum(data.sp2d_gukkpd);
    const totalPengeluaranA = parseNum(data.spj_ls) + parseNum(data.spj_upgu) + parseNum(data.spj_tu) + parseNum(data.spj_gukkpd) + 
                             parseNum(data.sts_upgu) + parseNum(data.sts_tu) + parseNum(data.cp_ls) + parseNum(data.cp_upgu) + parseNum(data.cp_tu);
    const saldoKasA = parseNum(dataRekon.tabA.saldo_awal) + totalPenerimaanA - totalPengeluaranA;

    const saldoKasB = parseNum(dataRekon.tabB.saldo_awal) + parseNum(data.bku_penerimaan) - parseNum(data.bku_pengeluaran);
    const selisihAB = saldoKasA - saldoKasB;

    const totalKasTunai = data.posisi_kas.reduce((acc, curr) => acc + parseNum(curr.kas_tunai), 0);
    const totalKasBank = data.posisi_kas.reduce((acc, curr) => acc + parseNum(curr.kas_di_bank), 0);
    const jumlahKasRiilC = totalKasTunai + totalKasBank;
    const selisihAC = saldoKasA - jumlahKasRiilC;

    // Hitung akumulasi nilai internal tools pembantu Tab A
    const totalSp2dLsCalc = parseNum(tools.sp2d_ls_gaji) + parseNum(tools.sp2d_ls_barjas);
    const totalSpjLsCalc = parseNum(tools.spj_ls_gaji) + parseNum(tools.spj_ls_barjas);

    // 6. SINKRONISASI OTOMATIS (Khusus Tab B via useEffect)
    useEffect(() => {
        if (tools.bku_penerimaan_total !== '' || tools.bku_penerimaan_sblm !== '') {
            setData('bku_penerimaan', parseNum(tools.bku_penerimaan_total) - parseNum(tools.bku_penerimaan_sblm));
        }
    }, [tools.bku_penerimaan_total, tools.bku_penerimaan_sblm]);

    useEffect(() => {
        if (tools.bku_pengeluaran_total !== '' || tools.bku_pengeluaran_sblm !== '') {
            setData('bku_pengeluaran', parseNum(tools.bku_pengeluaran_total) - parseNum(tools.bku_pengeluaran_sblm));
        }
    }, [tools.bku_pengeluaran_total, tools.bku_pengeluaran_sblm]);

    // Aksi tombol manual pemindah nilai kalkulator pembantu Tab A
    const applySp2dLsCalculator = () => {
        setData('sp2d_ls', totalSp2dLsCalc);
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Diterapkan',
            text: `Nilai SP2D LS berhasil diperbarui menjadi ${formatRupiah(totalSp2dLsCalc)}`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    const applySpjLsCalculator = () => {
        setData('spj_ls', totalSpjLsCalc);
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Diterapkan',
            text: `Nilai SPJ LS berhasil diperbarui menjadi ${formatRupiah(totalSpjLsCalc)}`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handlePosisiKasChange = (index, field, value) => {
        const updated = [...data.posisi_kas];
        updated[index][field] = value;
        setData('posisi_kas', updated);
    };

    const handlePosisiKasBlur = (index, field) => {
        setFocusedField(null);
        const updated = [...data.posisi_kas];
        updated[index][field] = parseNum(updated[index][field]);
        setData('posisi_kas', updated);
    };

    // 7. ACTION SUBMIT FORM UTAMA
    const handleSubmit = (e) => {
        e.preventDefault();
        let warningText = "Pastikan semua data perubahan rekonsiliasi sudah benar.";
        let icon = "question";

        if (selisihAB !== 0 || selisihAC !== 0) {
            warningText = "Masih terdeteksi SELISIH saldo keuangan. Tetap simpan berkas perubahan?";
            icon = "warning";
        }

        Swal.fire({
            title: 'Update Rekonsiliasi?',
            text: warningText,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const formattedPosisiKas = data.posisi_kas.map((item) => ({
                    ...item,
                    kas_tunai: parseNum(item.kas_tunai),
                    kas_di_bank: parseNum(item.kas_di_bank),
                }));

                put(route('icsa.rekonsiliasi.update', encodeURIComponent(rekon.no_rekon)), {
                    data: {
                        ...data,
                        sp2d_ls: parseNum(data.sp2d_ls),
                        sp2d_upgu: parseNum(data.sp2d_upgu),
                        sp2d_tu: parseNum(data.sp2d_tu),
                        sp2d_gukkpd: parseNum(data.sp2d_gukkpd),
                        spj_ls: parseNum(data.spj_ls),
                        spj_upgu: parseNum(data.spj_upgu),
                        spj_tu: parseNum(data.spj_tu),
                        spj_gukkpd: parseNum(data.spj_gukkpd),
                        sts_upgu: parseNum(data.sts_upgu),
                        sts_tu: parseNum(data.sts_tu),
                        cp_ls: parseNum(data.cp_ls),
                        cp_upgu: parseNum(data.cp_upgu),
                        cp_tu: parseNum(data.cp_tu),
                        bku_penerimaan: parseNum(data.bku_penerimaan),
                        bku_pengeluaran: parseNum(data.bku_pengeluaran),
                        posisi_kas: formattedPosisiKas,
                        total_penerimaan: totalPenerimaanA,
                        total_pengeluaran: totalPengeluaranA,
                        saldo_kas_a: saldoKasA,
                        saldo_kas_b: saldoKasB,
                        selisih_ab: selisihAB,
                        jumlah_kas: jumlahKasRiilC,
                        selisih_ac: selisihAC
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<span>{title}</span>}
        >
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* BREADCRUMB */}
                    <div className="text-sm text-gray-500 px-4 sm:px-0">
                        ICSA / <Link href={route('icsa.rekonsiliasi.index')} className="text-blue-600 hover:underline">Rekon Kas</Link> / Edit Data
                    </div>

                    {/* METADATA ATAS */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mx-4 sm:mx-0">
                        <div className="border-b pb-2 mb-4">
                            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2">
                                ℹ️ Informasi Rekonsiliasi ({rekon.no_rekon})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400 block">Tahun</span>
                                <span className="font-semibold text-gray-800">{rekon.tahun}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Bulan</span>
                                <span className="font-semibold text-gray-800">{bulanNama[parseInt(rekon.bulan)] || rekon.bulan}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">SKPD</span>
                                <span className="font-semibold text-gray-800">{rekon.skpd || dataRekon.skpdNama || '-'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Tanggal Rekon</span>
                                <input 
                                    type="date" 
                                    className="w-full mt-1 border-gray-300 rounded shadow-sm text-sm p-1 text-right font-medium"
                                    value={data.tanggal_rekon}
                                    onChange={e => setData('tanggal_rekon', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION MENU TAB */}
                    <div className="mx-4 sm:mx-0">
                        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <button
                                type="button"
                                onClick={() => setActiveTab('tabA')}
                                className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-all ${activeTab === 'tabA' ? 'border-blue-600 text-blue-600 bg-white rounded-tl-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                📊 TAB A: REALISASI
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('tabB')}
                                className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-all ${activeTab === 'tabB' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                📖 TAB B: BKU
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('tabC')}
                                className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-all ${activeTab === 'tabC' ? 'border-blue-600 text-blue-600 bg-white rounded-tr-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                💰 TAB C: POSISI KAS
                            </button>
                        </div>

                        {/* CONTAINER MASTER FORM */}
                        <form onSubmit={handleSubmit} className="bg-white border border-t-0 border-gray-200 shadow-sm rounded-b-lg p-6">
                            
                            {/* ========================================================
                                PANEL TAB A: REALISASI SIPD
                                ======================================================== */}
                            {activeTab === 'tabA' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">A. Realisasi Penerimaan dan Pengeluaran SIPD</h3>
                                    <table className="w-full border-collapse border border-gray-200 text-sm">
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="p-3 w-3/5 bg-gray-50 font-medium">1. Saldo Awal</td>
                                                <td className="p-2 text-right font-semibold text-gray-600 bg-gray-100 pr-3 font-mono">
                                                    {formatRupiah(dataRekon.tabA.saldo_awal)}
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-100 font-bold"><td colSpan="2" className="p-2 px-3 text-gray-700">2. Penerimaan</td></tr>
                                            
                                            {/* BARIS UTAMA SP2D LS */}
                                            <tr className="border-b">
                                                <td className="p-2 pl-6 align-middle">a. SP2D LS</td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        className="w-full text-right border-gray-300 rounded p-1 font-mono font-medium" 
                                                        value={focusedField === 'sp2d_ls' ? data.sp2d_ls : formatRupiah(data.sp2d_ls)} 
                                                        onFocus={(e) => handleFocus('sp2d_ls', e)}
                                                        onBlur={() => { setFocusedField(null); setData('sp2d_ls', parseNum(data.sp2d_ls)); }} 
                                                        onChange={e => setData('sp2d_ls', e.target.value)} 
                                                    />
                                                </td>
                                            </tr>
                                            {/* INLINE KALKULATOR PEMBANTU SP2D LS */}
                                            <tr>
                                                <td colSpan="2" className="p-2 pt-0 pb-3 pl-8 bg-gray-50/50">
                                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 shadow-sm">
                                                        <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                                                            🧮 Kalkulator Pembantu (SP2D LS)
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4 text-xs">
                                                            <div>
                                                                <label className="block text-gray-600 mb-0.5 font-medium">LS Gaji</label>
                                                                <input 
                                                                    type="text" inputMode="decimal" placeholder="Gaji" 
                                                                    className="w-36 text-right p-1 border-gray-300 rounded shadow-sm focus:ring-amber-500 font-mono" 
                                                                    value={focusedField === 'tools.sp2d_ls_gaji' ? tools.sp2d_ls_gaji : formatRupiah(tools.sp2d_ls_gaji)} 
                                                                    onFocus={(e) => handleFocus('tools.sp2d_ls_gaji', e)}
                                                                    onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, sp2d_ls_gaji: parseNum(tools.sp2d_ls_gaji) })); }}
                                                                    onChange={e => setTools({...tools, sp2d_ls_gaji: e.target.value})} 
                                                                />
                                                            </div>
                                                            <div className="font-bold text-gray-400 pt-3">+</div>
                                                            <div>
                                                                <label className="block text-gray-600 mb-0.5 font-medium">LS Barang & Jasa</label>
                                                                <input 
                                                                    type="text" inputMode="decimal" placeholder="Barjas" 
                                                                    className="w-36 text-right p-1 border-gray-300 rounded shadow-sm focus:ring-amber-500 font-mono" 
                                                                    value={focusedField === 'tools.sp2d_ls_barjas' ? tools.sp2d_ls_barjas : formatRupiah(tools.sp2d_ls_barjas)} 
                                                                    onFocus={(e) => handleFocus('tools.sp2d_ls_barjas', e)}
                                                                    onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, sp2d_ls_barjas: parseNum(tools.sp2d_ls_barjas) })); }}
                                                                    onChange={e => setTools({...tools, sp2d_ls_barjas: e.target.value})} 
                                                                />
                                                            </div>
                                                            <div className="pt-3">
                                                                <button
                                                                    type="button" onClick={applySp2dLsCalculator}
                                                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow transition-all text-xs"
                                                                >
                                                                    ➡️ Terapkan Ke SP2D LS (Total: {formatRupiah(totalSp2dLsCalc)})
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* BARIS METODE MAP REPETITIF TAB A */}
                                            {[
                                                { k: 'sp2d_upgu', l: 'b. SP2D UP / GU' },
                                                { k: 'sp2d_tu', l: 'c. SP2D TU' },
                                                { k: 'sp2d_gukkpd', l: 'd. SP2D GU KKPD' },
                                            ].map((item) => (
                                                <tr key={item.k} className="border-b">
                                                    <td className="p-2 pl-6">{item.l}</td>
                                                    <td className="p-2">
                                                        <input 
                                                            type="text" inputMode="decimal" className="w-full text-right border-gray-300 rounded p-1 font-mono" 
                                                            value={focusedField === item.k ? data[item.k] : formatRupiah(data[item.k])} 
                                                            onFocus={(e) => handleFocus(item.k, e)}
                                                            onBlur={() => { setFocusedField(null); setData(item.k, parseNum(data[item.k])); }} 
                                                            onChange={e => setData(item.k, e.target.value)} 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            <tr className="border-b font-bold bg-blue-50 text-blue-900">
                                                <td className="p-3 pl-3">Jumlah Penerimaan</td>
                                                <td className="p-2 text-right px-3 font-mono text-base">{formatRupiah(totalPenerimaanA)}</td>
                                            </tr>

                                            <tr className="bg-gray-100 font-bold"><td colSpan="2" className="p-2 px-3 text-gray-700">3. Pengeluaran</td></tr>
                                            
                                            {/* BARIS UTAMA SPJ LS */}
                                            <tr className="border-b">
                                                <td className="p-2 pl-6 align-middle">a. SPJ LS</td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" inputMode="decimal" className="w-full text-right border-blue-300 bg-blue-50/30 rounded p-1 font-mono font-bold" 
                                                        value={focusedField === 'spj_ls' ? data.spj_ls : formatRupiah(data.spj_ls)} 
                                                        onFocus={(e) => handleFocus('spj_ls', e)}
                                                        onBlur={() => { setFocusedField(null); setData('spj_ls', parseNum(data.spj_ls)); }} 
                                                        onChange={e => setData('spj_ls', e.target.value)} 
                                                    />
                                                </td>
                                            </tr>
                                            {/* INLINE KALKULATOR PEMBANTU SPJ LS */}
                                            <tr>
                                                <td colSpan="2" className="p-2 pt-0 pb-3 pl-8 bg-gray-50/50">
                                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 shadow-sm">
                                                        <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                                                            🧮 Kalkulator Pembantu (SPJ LS)
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4 text-xs">
                                                            <div>
                                                                <label className="block text-gray-600 mb-0.5 font-medium">LS Gaji</label>
                                                                <input 
                                                                    type="text" inputMode="decimal" placeholder="Gaji" 
                                                                    className="w-36 text-right p-1 border-gray-300 rounded shadow-sm focus:ring-amber-500 font-mono" 
                                                                    value={focusedField === 'tools.spj_ls_gaji' ? tools.spj_ls_gaji : formatRupiah(tools.spj_ls_gaji)} 
                                                                    onFocus={(e) => handleFocus('tools.spj_ls_gaji', e)}
                                                                    onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, spj_ls_gaji: parseNum(tools.spj_ls_gaji) })); }}
                                                                    onChange={e => setTools({...tools, spj_ls_gaji: e.target.value})} 
                                                                />
                                                            </div>
                                                            <div className="font-bold text-gray-400 pt-3">+</div>
                                                            <div>
                                                                <label className="block text-gray-600 mb-0.5 font-medium">LS Barang & Jasa</label>
                                                                <input 
                                                                    type="text" inputMode="decimal" placeholder="Barjas" 
                                                                    className="w-36 text-right p-1 border-gray-300 rounded shadow-sm focus:ring-amber-500 font-mono" 
                                                                    value={focusedField === 'tools.spj_ls_barjas' ? tools.spj_ls_barjas : formatRupiah(tools.spj_ls_barjas)} 
                                                                    onFocus={(e) => handleFocus('tools.spj_ls_barjas', e)}
                                                                    onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, spj_ls_barjas: parseNum(tools.spj_ls_barjas) })); }}
                                                                    onChange={e => setTools({...tools, spj_ls_barjas: e.target.value})} 
                                                                />
                                                            </div>
                                                            <div className="pt-3">
                                                                <button
                                                                    type="button" onClick={applySpjLsCalculator}
                                                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow transition-all text-xs"
                                                                >
                                                                    ➡️ Terapkan Ke SPJ LS (Total: {formatRupiah(totalSpjLsCalc)})
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {[
                                                { k: 'spj_upgu', l: 'b. SPJ UP / GU' },
                                                { k: 'spj_tu', l: 'c. SPJ TU' },
                                                { k: 'spj_gukkpd', l: 'd. SPJ GU KKPD' },
                                                { k: 'sts_upgu', l: 'e. STS UP / GU' },
                                                { k: 'sts_tu', l: 'f. STS TU' },
                                                { k: 'cp_ls', l: 'g. Pengembalian Belanja LS' },
                                                { k: 'cp_upgu', l: 'h. Pengembalian Belanja UP / GU' },
                                                { k: 'cp_tu', l: 'i. Pengembalian Belanja TU' },
                                            ].map((item) => (
                                                <tr key={item.k} className="border-b">
                                                    <td className="p-2 pl-6">{item.l}</td>
                                                    <td className="p-2">
                                                        <input 
                                                            type="text" inputMode="decimal" className="w-full text-right border-gray-300 rounded p-1 font-mono" 
                                                            value={focusedField === item.k ? data[item.k] : formatRupiah(data[item.k])} 
                                                            onFocus={(e) => handleFocus(item.k, e)}
                                                            onBlur={() => { setFocusedField(null); setData(item.k, parseNum(data[item.k])); }} 
                                                            onChange={e => setData(item.k, e.target.value)} 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}

                                            <tr className="border-b font-bold bg-red-50 text-red-900">
                                                <td className="p-3 pl-3">Jumlah Pengeluaran</td>
                                                <td className="p-2 text-right px-3 font-mono text-base">{formatRupiah(totalPengeluaranA)}</td>
                                            </tr>
                                            <tr className="font-bold bg-green-100 text-green-900 text-base">
                                                <td className="p-3 px-3">4. Saldo Kas Akhir Bulan (A)</td>
                                                <td className="p-2 text-right px-3 font-mono text-lg">{formatRupiah(saldoKasA)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ========================================================
                                PANEL TAB B: BUKU KAS UMUM (BKU)
                                ======================================================== */}
                            {activeTab === 'tabB' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">B. Buku Kas Umum (BKU)</h3>
                                    <table className="w-full border-collapse border border-gray-200 text-sm">
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="p-3 w-3/5 bg-gray-50 font-medium">1. Saldo Awal BKU Bulan Ini</td>
                                                <td className="p-2 text-right font-semibold text-gray-600 bg-gray-100 pr-3 font-mono">
                                                    {formatRupiah(dataRekon.tabB.saldo_awal)}
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="p-2 px-3 align-middle">
                                                    <span className="font-medium block">2. Penerimaan Bulan Ini</span>
                                                    <div className="mt-1 flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200 w-fit text-xs">
                                                        <span className="font-bold text-blue-800">Kalkulator:</span>
                                                        <input 
                                                            type="text" inputMode="decimal" placeholder="Total s/d Bulan Ini" className="w-32 p-1 border-gray-300 rounded text-right font-mono" 
                                                            value={focusedField === 'tools.bku_penerimaan_total' ? tools.bku_penerimaan_total : formatRupiah(tools.bku_penerimaan_total)} 
                                                            onFocus={(e) => handleFocus('tools.bku_penerimaan_total', e)}
                                                            onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, bku_penerimaan_total: parseNum(tools.bku_penerimaan_total) })); }}
                                                            onChange={e => setTools({...tools, bku_penerimaan_total: e.target.value})} 
                                                        />
                                                        <span>&minus;</span>
                                                        <input 
                                                            type="text" inputMode="decimal" placeholder="Total s/d Bulan Lalu" className="w-32 p-1 border-gray-300 rounded text-right font-mono" 
                                                            value={focusedField === 'tools.bku_penerimaan_sblm' ? tools.bku_penerimaan_sblm : formatRupiah(tools.bku_penerimaan_sblm)} 
                                                            onFocus={(e) => handleFocus('tools.bku_penerimaan_sblm', e)}
                                                            onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, bku_penerimaan_sblm: parseNum(tools.bku_penerimaan_sblm) })); }}
                                                            onChange={e => setTools({...tools, bku_penerimaan_sblm: e.target.value})} 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-2 align-middle">
                                                    <input 
                                                        type="text" inputMode="decimal" className="w-full text-right font-bold bg-gray-50 border-gray-300 rounded p-1 font-mono" 
                                                        value={focusedField === 'bku_penerimaan' ? data.bku_penerimaan : formatRupiah(data.bku_penerimaan)} 
                                                        onFocus={(e) => handleFocus('bku_penerimaan', e)}
                                                        onBlur={() => { setFocusedField(null); setData('bku_penerimaan', parseNum(data.bku_penerimaan)); }}
                                                        onChange={e => setData('bku_penerimaan', e.target.value)} 
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="p-2 px-3 align-middle">
                                                    <span className="font-medium block">3. Pengeluaran Bulan Ini</span>
                                                    <div className="mt-1 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200 w-fit text-xs">
                                                        <span className="font-bold text-red-800">Kalkulator:</span>
                                                        <input 
                                                            type="text" inputMode="decimal" placeholder="Total s/d Bulan Ini" className="w-32 p-1 border-gray-300 rounded text-right font-mono" 
                                                            value={focusedField === 'tools.bku_pengeluaran_total' ? tools.bku_pengeluaran_total : formatRupiah(tools.bku_pengeluaran_total)} 
                                                            onFocus={(e) => handleFocus('tools.bku_pengeluaran_total', e)}
                                                            onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, bku_pengeluaran_total: parseNum(tools.bku_pengeluaran_total) })); }}
                                                            onChange={e => setTools({...tools, bku_pengeluaran_total: e.target.value})} 
                                                        />
                                                        <span>&minus;</span>
                                                        <input 
                                                            type="text" inputMode="decimal" placeholder="Total s/d Bulan Lalu" className="w-32 p-1 border-gray-300 rounded text-right font-mono" 
                                                            value={focusedField === 'tools.bku_pengeluaran_sblm' ? tools.bku_pengeluaran_sblm : formatRupiah(tools.bku_pengeluaran_sblm)} 
                                                            onFocus={(e) => handleFocus('tools.bku_pengeluaran_sblm', e)}
                                                            onBlur={() => { setFocusedField(null); setTools(prev => ({ ...prev, bku_pengeluaran_sblm: parseNum(tools.bku_pengeluaran_sblm) })); }}
                                                            onChange={e => setTools({...tools, bku_pengeluaran_sblm: e.target.value})} 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-2 align-middle">
                                                    <input 
                                                        type="text" inputMode="decimal" className="w-full text-right font-bold bg-gray-50 border-gray-300 rounded p-1 font-mono" 
                                                        value={focusedField === 'bku_pengeluaran' ? data.bku_pengeluaran : formatRupiah(data.bku_pengeluaran)} 
                                                        onFocus={(e) => handleFocus('bku_pengeluaran', e)}
                                                        onBlur={() => { setFocusedField(null); setData('bku_pengeluaran', parseNum(data.bku_pengeluaran)); }}
                                                        onChange={e => setData('bku_pengeluaran', e.target.value)} 
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="border-b font-bold bg-green-100 text-green-900">
                                                <td className="p-3 px-3">4. Saldo Kas BKU (B)</td>
                                                <td className="p-2 text-right px-3 font-mono text-base">{formatRupiah(saldoKasB)}</td>
                                            </tr>
                                            <tr className={`border-b font-bold text-base ${selisihAB !== 0 ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-800'}`}>
                                                <td className="p-3 px-3">5. Selisih Saldo Antara Realisasi & BKU (A &minus; B)</td>
                                                <td className="p-2 text-right px-3 font-mono text-lg">{formatRupiah(selisihAB)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 px-3 valign-top font-medium">6. Keterangan Selisih BKU</td>
                                                <td className="p-2">
                                                    <textarea className="w-full border-gray-300 rounded text-sm p-2" rows="3" placeholder="Wajib diisi apabila terdapat selisih pencatatan BKU..." value={data.keterangan_bku} onChange={e => setData('keterangan_bku', e.target.value)} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ========================================================
                                PANEL TAB C: KAS FISIK RIIL
                                ======================================================== */}
                            {activeTab === 'tabC' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">C. Rekapitulasi Posisi Saldo Kas Riil</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-200 text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-700 font-bold border-b">
                                                    <th className="p-2 border text-left">Nama / Jabatan Bendahara</th>
                                                    <th className="p-2 border text-right w-1/3">1. Nilai Kas Tunai (Rp)</th>
                                                    <th className="p-2 border text-right w-1/3">2. Nilai Kas Bank (Rp)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.posisi_kas.map((b, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium text-gray-800">{b.label}</td>
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" inputMode="decimal" className="w-full text-right border-gray-300 rounded p-1 font-mono"
                                                                value={focusedField === `posisi_kas.${idx}.kas_tunai` ? b.kas_tunai : formatRupiah(b.kas_tunai)} 
                                                                onFocus={(e) => handleFocus(`posisi_kas.${idx}.kas_tunai`, e)}
                                                                onBlur={() => handlePosisiKasBlur(idx, 'kas_tunai')}
                                                                onChange={e => handlePosisiKasChange(idx, 'kas_tunai', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" inputMode="decimal" className="w-full text-right border-gray-300 rounded p-1 font-mono"
                                                                value={focusedField === `posisi_kas.${idx}.kas_di_bank` ? b.kas_di_bank : formatRupiah(b.kas_di_bank)} 
                                                                onFocus={(e) => handleFocus(`posisi_kas.${idx}.kas_di_bank`, e)}
                                                                onBlur={() => handlePosisiKasBlur(idx, 'kas_di_bank')}
                                                                onChange={e => handlePosisiKasChange(idx, 'kas_di_bank', e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 border-t font-semibold text-gray-700 text-xs">
                                                    <td className="p-2 px-3">Subtotal Akumulasi Fisik Kas</td>
                                                    <td className="p-2 text-right px-3 font-mono">Tunai: {formatRupiah(totalKasTunai)}</td>
                                                    <td className="p-2 text-right px-3 font-mono">Bank: {formatRupiah(totalKasBank)}</td>
                                                </tr>
                                                <tr className="border-b font-bold bg-green-100 text-green-900">
                                                    <td className="p-3 px-3">3. Jumlah Kas Fisik Riil Keseluruhan (C)</td>
                                                    <td colSpan="2" className="p-2 text-right px-3 font-mono text-lg">{formatRupiah(jumlahKasRiilC)}</td>
                                                </tr>
                                                <tr className={`border-b font-bold text-base ${selisihAC !== 0 ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-800'}`}>
                                                    <td className="p-3 px-3">4. Selisih Saldo Kas Sipd & Kas Riil (A &minus; C)</td>
                                                    <td colSpan="2" className="p-2 text-right px-3 font-mono text-lg">{formatRupiah(selisihAC)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 px-3 font-medium">5. Keterangan Selisih Kas Riil</td>
                                                    <td colSpan="2" className="p-2">
                                                        <textarea className="w-full border-gray-300 rounded text-sm p-2" rows="3" placeholder="Wajib diisi apabila terdapat selisih kas fisik nyata..." value={data.keterangan_posisi_kas} onChange={e => setData('keterangan_posisi_kas', e.target.value)} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* CONTAINER TOMBOL ACTION */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                <Link 
                                    href={route('icsa.rekonsiliasi.index', { kode_skpd: rekon.kode_skpd })} 
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                                >
                                    ⬅️ Batal / Kembali
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    💾 {processing ? 'Memproses...' : 'Update Data Rekon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

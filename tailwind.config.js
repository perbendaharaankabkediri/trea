import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            // 🏢 TAMBAHKAN PALETTE WARNA KEUANGAN DI SINI
            colors: {
                finance: {
                    dark: '#0f172a',     // Deep Navy/Slate 900 (Untuk background Sidebar)
                    sidebarText: '#94a3b8', // Light Slate (Untuk teks menu non-aktif)
                    active: '#3b82f6',    // Bright Blue (Untuk penanda menu aktif)
                    primary: '#1e40af',   // Deep Blue (Untuk tombol utama & header)
                    bg: '#f1f5f9',        // Slate Gray Light (Untuk background halaman belakang)
                }
            }
        },
    },

    plugins: [forms],
};
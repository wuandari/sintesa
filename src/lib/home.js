// Beranda sesuai peran (dipisah dari auth.js supaya bisa dipakai di mana saja).
export const homeFor = (role) => (role === 'MURID' ? '/siswa' : '/guru');

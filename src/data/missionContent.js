// Materi, soal, komponen 3D, dan permainan "hubungkan komponen" tiap misi — dwibahasa (id / en).
// Hanya dipakai di server: kunci jawaban (`jawab`, urutan pasangan) tidak boleh dikirim ke browser (pakai publicContent).
// part.id = id komponen pada model GLB (nama material sebelum "__"), lihat scripts/models/models.mjs.

export const PASS_PERCENT = 60;

const T = (id, en) => ({ id, en });
const L = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) && 'id' in v ? (v[lang] ?? v.id) : v);

// P(id, warna, nama[id,en], info[id,en], fungsi[id,en])
const P = (id, color, name, info, fungsi) => ({ id, color, name: T(...name), info: T(...info), fungsi: T(...fungsi) });
// M(judul[id,en], isi[id,en])
const M = (judul, isi) => ({ judul: T(...judul), isi: T(...isi) });
// S(pertanyaan[id,en], opsi[id[],en[]], jawab, penjelasan[id,en])
const S = (q, o, jawab, e) => ({ q: T(...q), o: T(...o), jawab, e: T(...e) });

export const CONTENT = {
  // ───────────────────────── Sistem Komputer ─────────────────────────
  'sistem-komputer': {
    materi: [
      M(['Input – Proses – Output', 'Input – Process – Output'], [
        'Komputer bekerja dalam tiga tahap: menerima data (input), mengolahnya (proses), lalu menampilkan hasilnya (output). Contoh: kamu mengetik di keyboard (input), CPU menghitung (proses), hasilnya muncul di monitor (output).',
        'A computer works in three stages: it receives data (input), processes it, then shows the result (output). Example: you type on the keyboard (input), the CPU calculates (process), and the result appears on the monitor (output).']),
      M(['CPU dan Memori', 'CPU and Memory'], [
        'CPU adalah otak komputer yang menjalankan instruksi. RAM menyimpan data sementara yang sedang dipakai dan hilang saat komputer mati, sedangkan penyimpanan (HDD/SSD) menyimpan data secara permanen.',
        'The CPU is the computer\'s brain that runs instructions. RAM holds the data currently in use and is cleared when the computer is turned off, while storage (HDD/SSD) keeps data permanently.']),
      M(['Perangkat Lunak', 'Software'], [
        'Sistem komputer = perangkat keras + perangkat lunak + pengguna (brainware). Sistem operasi seperti Windows atau Linux mengatur seluruh perangkat keras dan menjalankan aplikasi.',
        'A computer system = hardware + software + the user (brainware). An operating system such as Windows or Linux manages all the hardware and runs applications.']),
    ],
    soal: [
      S(['Keyboard termasuk perangkat…', 'A keyboard is a…'], [['Input', 'Proses', 'Output', 'Penyimpanan'], ['Input device', 'Processing device', 'Output device', 'Storage device']], 0,
        ['Keyboard memasukkan data ke komputer, jadi perangkat input.', 'A keyboard sends data into the computer, so it is an input device.']),
      S(['Bagian yang disebut "otak" komputer adalah…', 'The part called the computer\'s "brain" is the…'], [['Monitor', 'CPU', 'Mouse', 'Speaker'], ['Monitor', 'CPU', 'Mouse', 'Speaker']], 1,
        ['CPU memproses instruksi dan perhitungan.', 'The CPU processes instructions and calculations.']),
      S(['Data di RAM akan…', 'Data in RAM will…'], [['Tersimpan selamanya', 'Hilang saat komputer mati', 'Dikirim ke internet', 'Berpindah ke monitor'], ['Be kept forever', 'Be lost when the computer is turned off', 'Be sent to the internet', 'Move to the monitor']], 1,
        ['RAM bersifat sementara (volatile).', 'RAM is temporary (volatile) memory.']),
      S(['Monitor termasuk perangkat…', 'A monitor is a…'], [['Input', 'Proses', 'Output', 'Jaringan'], ['Input device', 'Processing device', 'Output device', 'Network device']], 2,
        ['Monitor menampilkan hasil pengolahan data.', 'A monitor displays the result of data processing.']),
      S(['Windows dan Linux adalah contoh…', 'Windows and Linux are examples of…'], [['Perangkat keras', 'Sistem operasi', 'Perangkat output', 'Kabel jaringan'], ['Hardware', 'Operating systems', 'Output devices', 'Network cables']], 1,
        ['Keduanya sistem operasi yang mengatur perangkat dan aplikasi.', 'Both are operating systems that manage devices and applications.']),
    ],
    parts: [
      P('Monitor', '#2f6df0', ['Monitor', 'Monitor'],
        ['Monitor adalah perangkat output yang menampilkan hasil pengolahan komputer dalam bentuk gambar dan teks.', 'The monitor is an output device that shows the computer\'s results as images and text.'],
        ['Menampilkan hasil pengolahan berupa gambar dan teks (output)', 'Shows the results as images and text (output)']),
      P('CPU', '#2c323e', ['CPU (casing)', 'CPU (case)'],
        ['CPU (Central Processing Unit) menjalankan instruksi program dan melakukan perhitungan. Ia disebut otak komputer; casingnya menyimpan komponen-komponen utama.', 'The CPU (Central Processing Unit) runs program instructions and does the calculations. It is called the computer\'s brain; the case houses the main components.'],
        ['Menjalankan instruksi dan memproses data (otak komputer)', 'Runs instructions and processes data (the computer\'s brain)']),
      P('Keyboard', '#e3e8f1', ['Keyboard', 'Keyboard'],
        ['Keyboard adalah perangkat input untuk memasukkan huruf, angka, dan perintah ke komputer.', 'The keyboard is an input device for entering letters, numbers and commands into the computer.'],
        ['Memasukkan huruf, angka, dan perintah (input)', 'Enters letters, numbers and commands (input)']),
      P('Mouse', '#2f6df0', ['Mouse', 'Mouse'],
        ['Mouse adalah perangkat input penunjuk untuk menggerakkan kursor dan memilih objek di layar.', 'The mouse is a pointing input device used to move the cursor and select objects on screen.'],
        ['Menggerakkan kursor dan memilih objek di layar (input)', 'Moves the cursor and selects objects on screen (input)']),
      P('Speaker', '#1d2129', ['Speaker', 'Speaker'],
        ['Speaker adalah perangkat output yang mengubah sinyal audio menjadi suara.', 'The speaker is an output device that turns audio signals into sound.'],
        ['Mengeluarkan suara dari komputer (output)', 'Plays sound from the computer (output)']),
    ],
  },

  'perangkat-keras': {
    materi: [
      M(['Motherboard dan Prosesor', 'Motherboard and Processor'], [
        'Motherboard (papan induk) adalah papan sirkuit tempat semua komponen dipasang dan saling terhubung. Prosesor (CPU) dipasang di soketnya dan menjalankan instruksi program. Karena cepat panas, prosesor diberi heatsink dan kipas pendingin.',
        'The motherboard is the circuit board where every component is mounted and connected. The processor (CPU) sits in its socket and runs program instructions. Because it heats up quickly, it gets a heatsink and a cooling fan.']),
      M(['Memori dan Penyimpanan', 'Memory and Storage'], [
        'RAM menyimpan data sementara yang sedang dipakai sehingga cepat diakses, tetapi hilang saat komputer mati. SSD dan HDD menyimpan sistem operasi, aplikasi, dan berkas secara permanen. SSD tidak punya bagian bergerak sehingga lebih cepat dan tahan guncangan.',
        'RAM holds the data currently in use so it can be reached quickly, but it is cleared when the power is off. SSDs and HDDs keep the operating system, apps and files permanently. An SSD has no moving parts, so it is faster and more shock-resistant.']),
      M(['Daya dan Grafis', 'Power and Graphics'], [
        'Power Supply Unit (PSU) mengubah listrik dari stopkontak menjadi tegangan rendah yang aman bagi komponen. Kartu grafis (VGA/GPU) mengolah gambar dan video sebelum dikirim ke monitor; berguna untuk gim dan desain.',
        'The Power Supply Unit (PSU) converts mains electricity into the low voltages components can safely use. The graphics card (VGA/GPU) processes images and video before sending them to the monitor; it helps with games and design.']),
    ],
    soal: [
      S(['Papan sirkuit utama tempat semua komponen terhubung adalah…', 'The main circuit board that connects all components is the…'], [['PSU', 'Motherboard', 'SSD', 'Kipas'], ['PSU', 'Motherboard', 'SSD', 'Fan']], 1,
        ['Motherboard menghubungkan prosesor, RAM, penyimpanan, dan kartu grafis.', 'The motherboard connects the processor, RAM, storage and graphics card.']),
      S(['Komponen yang mengubah listrik PLN menjadi tegangan untuk komputer adalah…', 'The component that converts mains power to the voltages a computer needs is the…'], [['RAM', 'VGA', 'PSU', 'Prosesor'], ['RAM', 'VGA', 'PSU', 'Processor']], 2,
        ['PSU (Power Supply Unit) menyuplai daya ke seluruh komponen.', 'The PSU (Power Supply Unit) supplies power to all components.']),
      S(['Kelebihan SSD dibanding HDD adalah…', 'An advantage of an SSD over an HDD is…'], [['Lebih lambat tetapi murah', 'Tanpa bagian bergerak sehingga lebih cepat', 'Data hilang saat dimatikan', 'Hanya bisa menyimpan teks'], ['Slower but cheaper', 'No moving parts, so it is faster', 'Data is lost when powered off', 'It can only store text']], 1,
        ['SSD memakai memori flash, bukan piringan berputar.', 'An SSD uses flash memory instead of spinning platters.']),
      S(['Kipas pada prosesor berfungsi untuk…', 'The fan on the processor is used to…'], [['Menambah RAM', 'Mendinginkan prosesor', 'Mengisi baterai', 'Menampilkan gambar'], ['Add RAM', 'Cool the processor', 'Charge the battery', 'Display images']], 1,
        ['Panas berlebih menurunkan kinerja dan bisa merusak prosesor.', 'Too much heat lowers performance and can damage the processor.']),
      S(['Kartu grafis (VGA) bertugas…', 'The graphics card (VGA) is responsible for…'], [['Mengolah gambar dan video untuk monitor', 'Menyimpan sistem operasi', 'Menyuplai listrik', 'Menghubungkan ke internet'], ['Processing images and video for the monitor', 'Storing the operating system', 'Supplying power', 'Connecting to the internet']], 0,
        ['VGA/GPU menangani pengolahan grafis.', 'The VGA/GPU handles graphics processing.']),
    ],
    parts: [
      P('Motherboard', '#0f6d3f', ['Motherboard', 'Motherboard'],
        ['Motherboard adalah papan induk tempat prosesor, RAM, penyimpanan, dan kartu grafis dipasang dan saling terhubung.', 'The motherboard is the main board where the processor, RAM, storage and graphics card are installed and connected.'],
        ['Papan induk tempat semua komponen terhubung', 'The main board where every component connects']),
      P('Prosesor', '#aeb7c6', ['Prosesor + heatsink', 'Processor + heatsink'],
        ['Prosesor (CPU) menjalankan instruksi program. Sirip logam (heatsink) di atasnya membuang panas.', 'The processor (CPU) runs program instructions. The metal fins (heatsink) on top carry heat away.'],
        ['Menjalankan instruksi program (otak komputer)', 'Runs program instructions (the computer\'s brain)']),
      P('Kipas', '#3f93f0', ['Kipas pendingin', 'Cooling fan'],
        ['Kipas meniupkan udara melewati heatsink sehingga prosesor tidak terlalu panas.', 'The fan blows air across the heatsink so the processor does not overheat.'],
        ['Mendinginkan prosesor agar tidak terlalu panas', 'Cools the processor so it does not overheat']),
      P('RAM', '#e5483a', ['RAM', 'RAM'],
        ['RAM menyimpan data dan program yang sedang berjalan agar cepat diakses; isinya hilang saat komputer mati.', 'RAM holds the data and programs that are running so they can be reached quickly; its contents vanish when the power is off.'],
        ['Menyimpan data sementara yang sedang dipakai', 'Holds the data currently in use (temporary)']),
      P('VGA', '#171a22', ['Kartu grafis (VGA)', 'Graphics card (VGA)'],
        ['Kartu grafis mengolah gambar, video, dan gim, lalu mengirimnya ke monitor.', 'The graphics card processes images, video and games, then sends them to the monitor.'],
        ['Mengolah dan mengirim gambar ke monitor', 'Processes images and sends them to the monitor']),
      P('SSD', '#c7ccd6', ['SSD', 'SSD'],
        ['SSD menyimpan sistem operasi, aplikasi, dan berkas secara permanen dengan kecepatan tinggi.', 'The SSD stores the operating system, apps and files permanently at high speed.'],
        ['Menyimpan data dan program secara permanen dengan cepat', 'Stores data and programs permanently and quickly']),
      P('PSU', '#1c2029', ['Power Supply (PSU)', 'Power Supply (PSU)'],
        ['PSU mengubah listrik dari stopkontak menjadi tegangan yang aman untuk semua komponen.', 'The PSU converts mains electricity into voltages that are safe for every component.'],
        ['Mengubah listrik PLN menjadi tegangan untuk komponen', 'Converts mains power into voltages for the components']),
    ],
  },

  // ───────────────────────── Informatika ─────────────────────────
  'jaringan-komputer': {
    materi: [
      M(['Apa itu Jaringan Komputer?', 'What is a Computer Network?'], [
        'Jaringan komputer adalah sekumpulan perangkat yang saling terhubung untuk bertukar data dan berbagi sumber daya seperti printer atau internet.',
        'A computer network is a group of devices connected to one another to exchange data and share resources such as printers or the internet.']),
      M(['Perangkat Jaringan', 'Network Devices'], [
        'Router menghubungkan jaringan berbeda dan meneruskan paket ke tujuan. Switch menghubungkan perangkat dalam satu jaringan lokal (LAN). Server menyediakan layanan, misalnya situs web atau berkas. Kabel UTP dengan konektor RJ45 membawa data antar perangkat.',
        'A router connects different networks and forwards packets to their destination. A switch connects devices within one local network (LAN). A server provides services such as websites or files. UTP cables with RJ45 connectors carry data between devices.']),
      M(['Alamat IP', 'IP Address'], [
        'Setiap perangkat memiliki alamat IP, seperti alamat rumah, agar data sampai ke tujuan yang tepat. Contoh IPv4: 192.168.1.10.',
        'Every device has an IP address, like a home address, so data reaches the right destination. IPv4 example: 192.168.1.10.']),
    ],
    soal: [
      S(['Perangkat yang menghubungkan jaringan lokal ke internet adalah…', 'The device that connects a local network to the internet is the…'], [['Switch', 'Router', 'Keyboard', 'Printer'], ['Switch', 'Router', 'Keyboard', 'Printer']], 1,
        ['Router meneruskan paket antar jaringan, termasuk ke internet.', 'A router forwards packets between networks, including to the internet.']),
      S(['Switch dipakai untuk…', 'A switch is used to…'], [['Menghubungkan banyak perangkat dalam satu LAN', 'Mencetak dokumen', 'Menyimpan video', 'Memperbesar layar'], ['Connect many devices within one LAN', 'Print documents', 'Store videos', 'Enlarge the screen']], 0,
        ['Switch menghubungkan perangkat dalam satu jaringan lokal.', 'A switch connects devices within a local network.']),
      S(['Fungsi alamat IP adalah…', 'The purpose of an IP address is to…'], [['Mempercepat CPU', 'Mengenali perangkat di jaringan', 'Menambah RAM', 'Mengunci layar'], ['Speed up the CPU', 'Identify a device on the network', 'Add RAM', 'Lock the screen']], 1,
        ['IP adalah identitas perangkat di jaringan.', 'An IP address identifies a device on the network.']),
      S(['LAN adalah jaringan…', 'A LAN is a network…'], [['Antar negara', 'Dalam area terbatas seperti sekolah', 'Hanya nirkabel', 'Khusus server'], ['Between countries', 'Within a limited area such as a school', 'That is wireless only', 'Made only for servers']], 1,
        ['LAN (Local Area Network) mencakup area kecil.', 'A LAN (Local Area Network) covers a small area.']),
      S(['Komputer yang menyediakan layanan bagi perangkat lain disebut…', 'A computer that provides services to other devices is called a…'], [['Client', 'Server', 'Monitor', 'Modem kabel'], ['Client', 'Server', 'Monitor', 'Cable modem']], 1,
        ['Server melayani permintaan dari client.', 'A server answers requests from clients.']),
    ],
    parts: [
      P('Router', '#f3f5f9', ['Router', 'Router'],
        ['Router meneruskan paket data antar jaringan dan menghubungkan jaringan lokal ke internet. Antenanya memancarkan Wi-Fi.', 'The router forwards data packets between networks and connects the local network to the internet. Its antennas broadcast Wi-Fi.'],
        ['Meneruskan paket antar jaringan ke internet', 'Forwards packets between networks to the internet']),
      P('Switch', '#6d7686', ['Switch', 'Switch'],
        ['Switch menghubungkan banyak perangkat dalam satu jaringan lokal dan mengirim data hanya ke perangkat tujuan.', 'The switch connects many devices in one local network and sends data only to the destination device.'],
        ['Menghubungkan banyak perangkat dalam satu LAN', 'Connects many devices in one LAN']),
      P('Server', '#262b34', ['Server', 'Server'],
        ['Server menyediakan layanan seperti situs web, basis data, atau berkas untuk perangkat lain.', 'The server provides services such as websites, databases or files for other devices.'],
        ['Menyediakan layanan dan berkas bagi perangkat lain', 'Provides services and files to other devices']),
      P('Laptop', '#b9c0cd', ['Laptop (client)', 'Laptop (client)'],
        ['Laptop adalah perangkat client yang meminta layanan dari server melalui jaringan.', 'The laptop is a client device that requests services from the server over the network.'],
        ['Perangkat pengguna yang meminta layanan dari server', 'The user device that requests services from the server']),
      P('Internet', '#6f86a8', ['Internet (awan)', 'Internet (cloud)'],
        ['Internet adalah jaringan raksasa yang menghubungkan jutaan jaringan di seluruh dunia.', 'The internet is a giant network connecting millions of networks around the world.'],
        ['Jaringan global yang menghubungkan jutaan jaringan', 'The global network linking millions of networks']),
      P('Kabel', '#2f8cf0', ['Kabel UTP', 'UTP cable'],
        ['Kabel UTP berkonektor RJ45 membawa data antar perangkat jaringan kabel.', 'A UTP cable with RJ45 connectors carries data between wired network devices.'],
        ['Membawa data antar perangkat lewat konektor RJ45', 'Carries data between devices through RJ45 connectors']),
    ],
  },

  'keamanan-data': {
    materi: [
      M(['Password Kuat', 'Strong Passwords'], [
        'Gunakan minimal 12 karakter dengan kombinasi huruf besar-kecil, angka, dan simbol. Jangan memakai password yang sama di banyak akun, dan aktifkan verifikasi dua langkah.',
        'Use at least 12 characters mixing upper- and lower-case letters, numbers and symbols. Do not reuse a password across accounts, and turn on two-step verification.']),
      M(['Phishing dan Malware', 'Phishing and Malware'], [
        'Phishing menipu korban lewat pesan atau situs palsu untuk mencuri data. Malware adalah perangkat lunak berbahaya. Jangan klik tautan mencurigakan dan jangan pasang aplikasi dari sumber tidak jelas.',
        'Phishing tricks victims with fake messages or websites to steal data. Malware is harmful software. Do not click suspicious links and do not install apps from unclear sources.']),
      M(['Backup dan Proteksi', 'Backup and Protection'], [
        'Backup rutin menyalin data ke tempat lain agar bisa dipulihkan. Firewall menyaring lalu lintas jaringan, dan antivirus mendeteksi malware.',
        'Regular backups copy data somewhere else so it can be restored. A firewall filters network traffic, and antivirus software detects malware.']),
    ],
    soal: [
      S(['Password yang paling kuat adalah…', 'The strongest password is…'], [['12345678', 'namaku2008', 'T!ga#Kopi_92xQ', 'password'], ['12345678', 'myname2008', 'T!ga#Kopi_92xQ', 'password']], 2,
        ['Panjang dan campuran karakter membuatnya sulit ditebak.', 'Length and a mix of characters make it hard to guess.']),
      S(['Penipuan lewat situs/pesan palsu untuk mencuri data disebut…', 'Fraud using fake sites or messages to steal data is called…'], [['Backup', 'Phishing', 'Firewall', 'Enkripsi'], ['Backup', 'Phishing', 'Firewall', 'Encryption']], 1,
        ['Itu ciri phishing.', 'That is the mark of phishing.']),
      S(['Tujuan backup data adalah…', 'The purpose of a data backup is to…'], [['Mempercepat internet', 'Memulihkan data bila hilang', 'Menghapus virus', 'Mengganti password'], ['Speed up the internet', 'Restore data if it is lost', 'Remove viruses', 'Change the password']], 1,
        ['Backup memungkinkan pemulihan data.', 'A backup makes recovering data possible.']),
      S(['Firewall berfungsi…', 'A firewall is used to…'], [['Menyaring lalu lintas jaringan', 'Mencetak dokumen', 'Menambah RAM', 'Mengedit foto'], ['Filter network traffic', 'Print documents', 'Add RAM', 'Edit photos']], 0,
        ['Firewall mengizinkan atau memblokir lalu lintas.', 'A firewall allows or blocks traffic.']),
      S(['Tindakan terbaik saat menerima tautan hadiah dari nomor tak dikenal adalah…', 'The best action on receiving a prize link from an unknown number is to…'], [['Langsung klik', 'Bagikan ke teman', 'Abaikan dan laporkan', 'Isi data pribadi'], ['Click it right away', 'Share it with friends', 'Ignore and report it', 'Enter personal details']], 2,
        ['Tautan seperti itu sering phishing.', 'Links like that are often phishing.']),
    ],
    parts: [
      P('Laptop', '#b9c0cd', ['Laptop (login)', 'Laptop (login)'],
        ['Layar login meminta identitas pengguna. Password kuat dan verifikasi dua langkah menjaga akunmu.', 'The login screen asks who the user is. A strong password and two-step verification protect your account.'],
        ['Tempat pengguna masuk dengan password', 'Where users sign in with a password']),
      P('Gembok', '#e0b13a', ['Gembok', 'Padlock'],
        ['Gembok melambangkan perlindungan akses: enkripsi mengunci data sehingga hanya pemilik kunci yang bisa membukanya.', 'The padlock stands for access protection: encryption locks data so only the key holder can open it.'],
        ['Mengunci data lewat enkripsi dan kata sandi', 'Locks data through encryption and passwords']),
      P('Perisai', '#2f7be8', ['Perisai (antivirus)', 'Shield (antivirus)'],
        ['Perisai melambangkan antivirus yang mendeteksi dan menghapus malware sebelum merusak data.', 'The shield stands for antivirus software that detects and removes malware before it damages data.'],
        ['Mendeteksi dan menghapus malware', 'Detects and removes malware']),
      P('Firewall', '#b8472f', ['Firewall', 'Firewall'],
        ['Firewall seperti dinding api: ia menyaring lalu lintas jaringan dan memblokir akses yang tidak diizinkan.', 'A firewall works like a fire wall: it filters network traffic and blocks access that is not allowed.'],
        ['Menyaring lalu lintas dan memblokir akses ilegal', 'Filters traffic and blocks unauthorised access']),
      P('Backup', '#9aa3b4', ['Hard disk backup', 'Backup hard drive'],
        ['Perangkat backup menyimpan salinan data supaya bisa dipulihkan saat data asli rusak atau hilang.', 'A backup device keeps a copy of your data so it can be restored if the original is damaged or lost.'],
        ['Menyimpan salinan data untuk dipulihkan', 'Keeps a copy of data so it can be restored']),
    ],
  },

  // ───────────────────────── Dasar-dasar PPLG ─────────────────────────
  'algoritma-flowchart': {
    materi: [
      M(['Apa itu Algoritma?', 'What is an Algorithm?'], [
        'Algoritma adalah urutan langkah logis untuk menyelesaikan masalah. Contoh: langkah membuat mi instan atau langkah menentukan bilangan genap. Algoritma yang baik jelas, berurutan, dan berakhir.',
        'An algorithm is a logical sequence of steps for solving a problem, such as the steps for making instant noodles or checking whether a number is even. A good algorithm is clear, ordered and finite.']),
      M(['Simbol Flowchart', 'Flowchart Symbols'], [
        'Flowchart menggambarkan algoritma dengan simbol: oval (terminator) untuk mulai/selesai, jajar genjang untuk input/output, persegi panjang untuk proses, belah ketupat untuk keputusan, dan panah untuk arah alur.',
        'A flowchart draws an algorithm with symbols: an oval (terminator) for start/end, a parallelogram for input/output, a rectangle for a process, a diamond for a decision, and arrows for the flow direction.']),
      M(['Variabel dan Percabangan', 'Variables and Branching'], [
        'Variabel menyimpan nilai yang bisa berubah, misalnya nilai = 80. Percabangan (if–else) memilih langkah berdasarkan kondisi, misalnya: jika nilai ≥ 75 maka "Lulus", jika tidak maka "Remedial".',
        'A variable stores a value that can change, for example score = 80. Branching (if–else) chooses a step based on a condition, for example: if score ≥ 75 then "Pass", otherwise "Retake".']),
    ],
    soal: [
      S(['Algoritma adalah…', 'An algorithm is…'], [['Bahasa mesin', 'Urutan langkah menyelesaikan masalah', 'Jenis komputer', 'Program antivirus'], ['Machine language', 'A sequence of steps to solve a problem', 'A type of computer', 'An antivirus program']], 1,
        ['Algoritma = langkah-langkah logis dan berurutan.', 'An algorithm = logical, ordered steps.']),
      S(['Struktur if–else digunakan untuk…', 'The if–else structure is used for…'], [['Mengulang', 'Memilih berdasarkan kondisi', 'Menyimpan file', 'Mencetak'], ['Repeating', 'Choosing based on a condition', 'Saving files', 'Printing']], 1,
        ['if–else adalah percabangan.', 'if–else is branching.']),
      S(['Variabel berfungsi untuk…', 'A variable is used to…'], [['Menyimpan nilai', 'Menggambar', 'Menghapus program', 'Menghubungkan kabel'], ['Store a value', 'Draw', 'Delete a program', 'Connect cables']], 0,
        ['Variabel menyimpan nilai yang bisa berubah.', 'A variable stores a value that can change.']),
      S(['Simbol oval pada flowchart menandakan…', 'The oval symbol in a flowchart means…'], [['Keputusan', 'Proses', 'Mulai/Selesai', 'Input saja'], ['Decision', 'Process', 'Start/End', 'Input only']], 2,
        ['Oval (terminator) menandai awal dan akhir.', 'The oval (terminator) marks the start and end.']),
      S(['Simbol belah ketupat dipakai untuk…', 'The diamond symbol is used for a…'], [['Proses perhitungan', 'Keputusan (ya/tidak)', 'Input data', 'Mulai program'], ['Calculation process', 'Decision (yes/no)', 'Data input', 'Program start']], 1,
        ['Belah ketupat menguji kondisi lalu memilih jalur.', 'The diamond tests a condition and then picks a path.']),
    ],
    parts: [
      P('Terminal', '#2fb872', ['Terminal (Mulai/Selesai)', 'Terminal (Start/End)'],
        ['Terminal (oval) menandai awal dan akhir sebuah algoritma.', 'The terminal (oval) marks the start and end of an algorithm.'],
        ['Menandai awal dan akhir algoritma', 'Marks the start and end of an algorithm']),
      P('InputOutput', '#8b5cf6', ['Input/Output', 'Input/Output'],
        ['Jajar genjang menandai langkah memasukkan data (input) atau menampilkan hasil (output).', 'The parallelogram marks a step that reads data (input) or shows a result (output).'],
        ['Menandai langkah memasukkan atau menampilkan data', 'Marks a step that reads or displays data']),
      P('Proses', '#2f7be8', ['Proses', 'Process'],
        ['Persegi panjang menandai langkah pengolahan, misalnya menghitung atau mengubah nilai variabel.', 'The rectangle marks a processing step, such as calculating or changing a variable.'],
        ['Menandai langkah pengolahan/perhitungan', 'Marks a processing or calculation step']),
      P('Keputusan', '#f59a2c', ['Keputusan', 'Decision'],
        ['Belah ketupat menguji kondisi (ya/tidak) lalu memilih jalur langkah berikutnya, seperti if–else.', 'The diamond tests a condition (yes/no) and then chooses the next path, like if–else.'],
        ['Menguji kondisi lalu memilih jalur ya/tidak', 'Tests a condition and picks the yes/no path']),
      P('Alur', '#394255', ['Panah alur', 'Flow arrow'],
        ['Panah menunjukkan arah dan urutan langkah dari satu simbol ke simbol berikutnya.', 'Arrows show the direction and order of steps from one symbol to the next.'],
        ['Menunjukkan arah dan urutan langkah', 'Shows the direction and order of the steps']),
    ],
  },

  'alat-programmer': {
    materi: [
      M(['Perangkat Kerja Programmer', 'A Programmer\'s Hardware'], [
        'Programmer menulis kode di laptop atau komputer. Layar tambahan (monitor eksternal) membuat kode, dokumentasi, dan hasil program bisa terlihat berdampingan. Keyboard dan mouse yang nyaman membuat kerja lebih cepat dan tidak mudah lelah.',
        'Programmers write code on a laptop or computer. An extra monitor lets code, documentation and the program\'s output sit side by side. A comfortable keyboard and mouse make work faster and less tiring.']),
      M(['Editor Kode dan IDE', 'Code Editors and IDEs'], [
        'Kode ditulis di editor teks atau IDE (Integrated Development Environment) seperti Visual Studio Code. Fitur seperti pewarnaan sintaks, penyelesaian otomatis, dan debugger membantu menemukan kesalahan lebih cepat.',
        'Code is written in a text editor or an IDE (Integrated Development Environment) such as Visual Studio Code. Features like syntax highlighting, autocomplete and a debugger help you find mistakes faster.']),
      M(['Penyimpanan dan Kolaborasi', 'Storage and Collaboration'], [
        'Flashdisk berguna memindahkan berkas proyek antar komputer, tetapi mudah hilang, jadi simpan juga salinan di tempat lain. Kerja tim biasanya memakai Git dan repositori daring untuk mencatat perubahan. Headset membantu rapat daring dan fokus saat belajar.',
        'A flash drive moves project files between computers, but it is easy to lose, so keep a copy elsewhere too. Teams usually use Git and online repositories to track changes. A headset helps with online meetings and with focusing while you study.']),
    ],
    soal: [
      S(['Aplikasi untuk menulis kode yang dilengkapi pewarnaan sintaks dan debugger disebut…', 'An application for writing code with syntax highlighting and a debugger is called an…'], [['Browser', 'IDE', 'Spreadsheet', 'Antivirus'], ['Browser', 'IDE', 'Spreadsheet', 'Antivirus']], 1,
        ['IDE menyatukan editor, penyorot sintaks, dan debugger.', 'An IDE combines an editor, syntax highlighting and a debugger.']),
      S(['Monitor tambahan berguna bagi programmer karena…', 'An extra monitor helps programmers because…'], [['Membuat internet lebih cepat', 'Kode dan hasil program dapat dilihat berdampingan', 'Menambah RAM', 'Menghilangkan error'], ['It makes the internet faster', 'Code and the program output can be seen side by side', 'It adds RAM', 'It removes errors']], 1,
        ['Area layar lebih luas memudahkan membandingkan banyak jendela.', 'More screen space makes it easier to compare several windows.']),
      S(['Flashdisk paling tepat dipakai untuk…', 'A flash drive is best used to…'], [['Memproses instruksi', 'Memindahkan berkas antar komputer', 'Mendinginkan prosesor', 'Menampilkan gambar'], ['Process instructions', 'Move files between computers', 'Cool the processor', 'Display images']], 1,
        ['Flashdisk adalah penyimpanan portabel.', 'A flash drive is portable storage.']),
      S(['Git dipakai untuk…', 'Git is used to…'], [['Mencatat dan mengelola perubahan kode', 'Mengedit foto', 'Mencetak dokumen', 'Menambah kecepatan Wi-Fi'], ['Track and manage code changes', 'Edit photos', 'Print documents', 'Boost Wi-Fi speed']], 0,
        ['Git adalah sistem kontrol versi.', 'Git is a version control system.']),
      S(['Perangkat input yang dipakai programmer untuk mengetik kode adalah…', 'The input device a programmer uses to type code is the…'], [['Speaker', 'Monitor', 'Keyboard', 'Headset'], ['Speaker', 'Monitor', 'Keyboard', 'Headset']], 2,
        ['Keyboard memasukkan teks dan perintah.', 'The keyboard enters text and commands.']),
    ],
    parts: [
      P('Laptop', '#b9c0cd', ['Laptop', 'Laptop'],
        ['Laptop adalah komputer portabel untuk menulis dan menjalankan kode di mana saja.', 'A laptop is a portable computer for writing and running code anywhere.'],
        ['Komputer portabel untuk menulis dan menjalankan kode', 'A portable computer for writing and running code']),
      P('Monitor', '#12151b', ['Monitor eksternal', 'External monitor'],
        ['Monitor eksternal memberi layar lebih luas, sehingga editor kode dan hasil program bisa dilihat berdampingan.', 'An external monitor gives more screen space, so the code editor and the program output can sit side by side.'],
        ['Layar tambahan yang lebih luas untuk kode dan hasil', 'An extra, larger screen for code and results']),
      P('Keyboard', '#e3e8f1', ['Keyboard', 'Keyboard'],
        ['Keyboard dipakai mengetik kode, perintah, dan pintasan keyboard di editor.', 'The keyboard is used to type code, commands and editor shortcuts.'],
        ['Mengetik kode dan perintah (input)', 'Types code and commands (input)']),
      P('Mouse', '#2f6df0', ['Mouse', 'Mouse'],
        ['Mouse memilih teks, menu, dan tombol dengan cepat di editor atau peramban.', 'The mouse picks text, menus and buttons quickly in the editor or browser.'],
        ['Menunjuk dan memilih objek di layar (input)', 'Points at and selects objects on screen (input)']),
      P('Flashdisk', '#e8452f', ['Flashdisk', 'Flash drive'],
        ['Flashdisk menyimpan berkas proyek secara portabel untuk dipindahkan atau dicadangkan.', 'A flash drive stores project files portably so they can be moved or backed up.'],
        ['Memindahkan dan mencadangkan berkas secara portabel', 'Moves and backs up files portably']),
      P('Headset', '#2f6df0', ['Headset', 'Headset'],
        ['Headset dipakai untuk rapat daring, mendengarkan tutorial, dan fokus tanpa mengganggu orang lain.', 'A headset is used for online meetings, listening to tutorials and focusing without disturbing others.'],
        ['Mendengar dan berbicara saat rapat atau belajar daring', 'Lets you listen and speak in online meetings and lessons']),
    ],
  },
};

export function getContent(slug, lang = 'id') {
  const c = CONTENT[slug];
  if (!c) return null;
  return {
    materi: c.materi.map((m) => ({ judul: L(m.judul, lang), isi: L(m.isi, lang) })),
    soal: c.soal.map((s) => ({ q: L(s.q, lang), o: L(s.o, lang), jawab: s.jawab, e: L(s.e, lang) })),
    parts: c.parts.map((p) => ({ id: p.id, color: p.color, name: L(p.name, lang), info: L(p.info, lang), fungsi: L(p.fungsi, lang) })),
  };
}

// ----- permainan "hubungkan komponen ke fungsinya" -----
// Pilihan fungsi ditampilkan dalam urutan terputar (bukan urutan komponen); kunci hanya ada di server.
const SHIFT = 2;
const pairOrder = (n) => Array.from({ length: n }, (_, j) => (j + SHIFT) % n); // pilihan ke-j menampilkan fungsi komponen order[j]

export function pairGame(slug, lang = 'id') {
  const c = getContent(slug, lang);
  if (!c) return null;
  const order = pairOrder(c.parts.length);
  return {
    parts: c.parts.map(({ id, name, color }) => ({ id, name, color })),
    options: order.map((pi, j) => ({ key: j, text: c.parts[pi].fungsi })),
  };
}

// links: { [partId]: indeksPilihan }. Mengembalikan hasil per komponen.
export function checkPairs(slug, links) {
  const c = CONTENT[slug];
  if (!c || !links || typeof links !== 'object') return null;
  const order = pairOrder(c.parts.length);
  const results = {};
  let right = 0;
  c.parts.forEach((p, i) => {
    const choice = links[p.id];
    const ok = Number.isInteger(choice) && order[choice] === i;
    results[p.id] = ok;
    if (ok) right += 1;
  });
  const linked = Object.values(links).filter((v) => Number.isInteger(v)).length;
  return { results, right, total: c.parts.length, linked };
}

// Versi aman untuk browser: tanpa kunci jawaban dan tanpa urutan pasangan.
export function publicContent(slug, lang = 'id') {
  const c = getContent(slug, lang);
  if (!c) return null;
  return {
    materi: c.materi,
    soal: c.soal.map((s) => ({ q: s.q, o: s.o })),
    parts: c.parts.map(({ id, color, name }) => ({ id, color, name })),
    pairs: pairGame(slug, lang),
  };
}

// Nilai kuis (0–100) dari jawaban murid. answers = array indeks.
export function gradeQuiz(slug, answers, lang = 'id') {
  const c = CONTENT[slug];
  if (!c || !Array.isArray(answers)) return null;
  let right = 0;
  const review = c.soal.map((s, i) => {
    const ok = Number(answers[i]) === s.jawab;
    if (ok) right += 1;
    return { correct: ok, answer: s.jawab, explanation: L(s.e, lang) };
  });
  const score = Math.round((right / c.soal.length) * 100);
  return { score, right, total: c.soal.length, passed: score >= PASS_PERCENT, review };
}

// Cek satu jawaban (untuk umpan balik langsung). Mengungkap kunci hanya setelah murid menjawab.
export function checkAnswer(slug, index, choice, lang = 'id') {
  const s = CONTENT[slug]?.soal[index];
  const n = s ? L(s.o, 'id').length : 0;
  if (!s || !Number.isInteger(choice) || choice < 0 || choice >= n) return null;
  return { correct: choice === s.jawab, answer: s.jawab, explanation: L(s.e, lang) };
}

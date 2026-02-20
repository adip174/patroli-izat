import React, { useState, useEffect } from 'react';
import { Trash2, Search, Check, X, Shield, LogOut, UserPlus, LogIn, AlertTriangle, Pencil, Briefcase, Calendar, Filter, Save, Cloud, Loader2, Database, Moon, Sun } from 'lucide-react';

// --- IMPORT FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";

// --- KONFIGURASI FIREBASE ---
// ⚠️ GANTI BAGIAN INI DENGAN CONFIG DARI FIREBASE CONSOLE ANDA ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyDucVWlnKthCWpmR5dUyoOi4W6Oai67U8M",
  authDomain: "patroli-izat.firebaseapp.com",
  projectId: "patroli-izat",
  storageBucket: "patroli-izat.firebasestorage.app",
  messagingSenderId: "297262663036",
  appId: "1:297262663036:web:120fbe2ba50ced29e290f9"
};

// Inisialisasi Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase belum disetting dengan benar. Masukkan config Anda.");
}

// --- DATA AWAL LENGKAP (64 ORANG) ---
const INITIAL_DATA_SEED = [
    { name: "ABD.RACHMAN.S", jabatan: "-", status: true },
    { name: "ABD. RAHMAN", jabatan: "-", status: true },
    { name: "ABDUL BAYAM", jabatan: "-", status: true },
    { name: "AGUS RAUF", jabatan: "-", status: true },
    { name: "AHMAD", jabatan: "-", status: true },
    { name: "AMIR", jabatan: "-", status: true },
    { name: "AMRAN", jabatan: "-", status: true },
    { name: "MUH. ADRIAN", jabatan: "-", status: true },
    { name: "ANDI ARFAN", jabatan: "-", status: false }, // NO 9
    { name: "ANUGRAH ZAIDAR", jabatan: "-", status: true },
    { name: "ARINI PUSPITA", jabatan: "-", status: true },
    { name: "BAKRI T. MAKKA", jabatan: "-", status: true },
    { name: "BASRI", jabatan: "-", status: true },
    { name: "ELISA AGUS KAMBA", jabatan: "-", status: true },
    { name: "FAISAL PALAWA", jabatan: "-", status: true },
    { name: "FERINANDUS", jabatan: "-", status: true },
    { name: "HAMKA HABIB", jabatan: "-", status: true },
    { name: "HERI SUTRISNO", jabatan: "-", status: true },
    { name: "HERY SUANDY", jabatan: "-", status: true },
    { name: "IBRAHIM HASAN", jabatan: "-", status: true },
    { name: "IRMAN", jabatan: "-", status: true },
    { name: "IRWAN", jabatan: "-", status: true },
    { name: "JAMES ANDREW LANSART", jabatan: "-", status: false }, // NO 23
    { name: "JUSDAR", jabatan: "-", status: true },
    { name: "KAHARUDDIN K", jabatan: "-", status: true },
    { name: "KHAERIL DAHLAN", jabatan: "-", status: false }, // NO 26
    { name: "LUSIANA AHMAD", jabatan: "-", status: false }, // NO 27
    { name: "MAHATIR SAPRIL MUHAMMAD", jabatan: "-", status: true },
    { name: "MAKMUR PADU", jabatan: "-", status: true },
    { name: "MASNUR", jabatan: "-", status: false }, // NO 30
    { name: "MASSA", jabatan: "-", status: true },
    { name: "M. BASRI A", jabatan: "-", status: true },
    { name: "MUHAMMAD FAUZI", jabatan: "-", status: true },
    { name: "MUHAMMAD SALENG SAID", jabatan: "-", status: true },
    { name: "MUH. JASRI PRAJA", jabatan: "-", status: false }, // NO 35
    { name: "MUH. RUMANSIS", jabatan: "-", status: true },
    { name: "MUH. TAHIR BAKENG", jabatan: "-", status: true },
    { name: "NAWING", jabatan: "-", status: true },
    { name: "NUR AINUN JARYAH", jabatan: "-", status: false }, // NO 39
    { name: "NURILAHI", jabatan: "-", status: true },
    { name: "RISWAN R", jabatan: "-", status: true },
    { name: "RUSMAL", jabatan: "-", status: true },
    { name: "SAFRIADI KAIDIR", jabatan: "-", status: true },
    { name: "SUKARNO", jabatan: "-", status: true },
    { name: "SULAEMAN BAHTIAR", jabatan: "-", status: true },
    { name: "SULTAN MUDI", jabatan: "-", status: true },
    { name: "SUPRAHMAD. A S", jabatan: "-", status: true },
    { name: "SYAHRUDDIN", jabatan: "-", status: true },
    { name: "SYAMSUDDIN", jabatan: "-", status: true },
    { name: "TRISAKTI YUDI CAKRA", jabatan: "-", status: true },
    { name: "VERDIANATA KURAS", jabatan: "-", status: true },
    { name: "WAHYUDY JAYA", jabatan: "-", status: false }, // NO 52
    { name: "YULIUS PAKIDING RABA", jabatan: "-", status: false }, // NO 53
    { name: "YUSPI ALAM", jabatan: "-", status: true },
    { name: "ZULFITRAH RAUF", jabatan: "-", status: true },
    { name: "ZULFITRAH.W", jabatan: "-", status: true },
    { name: "ZULKIFLI", jabatan: "-", status: true },
    { name: "NUR ALAM", jabatan: "-", status: false }, // NO 58
    { name: "GIANT AUGUST ANUGRAH", jabatan: "-", status: true },
    { name: "BENNY KURNIADY", jabatan: "-", status: true },
    { name: "ANDI MUH FAJAR", jabatan: "-", status: true },
    { name: "HERYADI TAHIR", jabatan: "-", status: true },
    { name: "ANDI RUSTAM", jabatan: "-", status: true },
    { name: "MUH. KURNIAWAN", jabatan: "-", status: true }
];

// --- Komponen Pie Chart ---
const SimplePieChart = ({ data, isDarkMode }) => {
    const total = data.length;
    const done = data.filter(d => d.status).length;
    const notDone = total - done;
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const donePercent = total > 0 ? (done / total) : 0;
    const doneOffset = circumference * (1 - donePercent);

    if (total === 0) return <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Menunggu data...</div>;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="20" />
                    <circle 
                        cx="60" cy="60" r="50" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="20" 
                        strokeDasharray={circumference}
                        strokeDashoffset={doneOffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {Math.round(donePercent * 100)}%
                    </span>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>COMPLETED</span>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Sudah ({done})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Belum ({notDone})</span>
                </div>
            </div>
        </div>
    );
};

// --- Komponen Utama ---
export default function App() {
    const [users, setUsers] = useState([]);
    const [headerDate, setHeaderDate] = useState("Memuat Tanggal...");
    const [loading, setLoading] = useState(true);
    
    // Theme State (Dark Mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode === 'dark' ? true : false;
    });
    
    // Auth & UI State
    const [isAdmin, setIsAdmin] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    
    // Modals State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    
    // Form Inputs
    const [editingId, setEditingId] = useState(null); 
    const [nameInput, setNameInput] = useState("");
    const [jabatanInput, setJabatanInput] = useState("");
    const [startDateInput, setStartDateInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");

    // --- Efek Menyimpan Mode Gelap ---
    useEffect(() => {
        localStorage.setItem('themeMode', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // --- 1. READ DATA (Realtime dari Firebase) ---
    useEffect(() => {
        if (!db) return;

        // Listener untuk Data Anggota
        const q = query(collection(db, "patrols"), orderBy("name"));
        const unsubscribeUsers = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        // Listener untuk Config
        const unsubscribeConfig = onSnapshot(doc(db, "config", "main"), (doc) => {
            if (doc.exists()) {
                setHeaderDate(doc.data().period || "1 - 28 Februari 2026");
            } else {
                setHeaderDate("1 - 28 Februari 2026");
            }
        });

        return () => {
            unsubscribeUsers();
            unsubscribeConfig();
        };
    }, []);

    // --- SEED DATA (Admin Only) ---
    const handleSeedData = async () => {
        if (!confirm("Apakah Anda yakin ingin mengimpor 64 data awal? Data ganda mungkin terjadi jika sudah ada data sebelumnya.")) return;
        
        setLoading(true);
        try {
            const batch = writeBatch(db);
            INITIAL_DATA_SEED.forEach((user) => {
                const docRef = doc(collection(db, "patrols")); // Auto-ID
                batch.set(docRef, {
                    name: user.name.toUpperCase(),
                    jabatan: user.jabatan,
                    status: user.status,
                    createdAt: new Date()
                });
            });
            await batch.commit();
            alert("Berhasil mengimpor 64 data!");
        } catch (error) {
            console.error("Error seeding data:", error);
            alert("Gagal mengimpor data.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. CREATE / UPDATE USER (Firebase) ---
    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        
        const upperName = nameInput.toUpperCase();
        const upperJabatan = jabatanInput.trim() ? jabatanInput.toUpperCase() : "-";

        try {
            if (editingId) {
                // Update Existing
                const userRef = doc(db, "patrols", editingId);
                await updateDoc(userRef, {
                    name: upperName,
                    jabatan: upperJabatan
                });
            } else {
                // Add New
                await addDoc(collection(db, "patrols"), {
                    name: upperName,
                    jabatan: upperJabatan,
                    status: false,
                    createdAt: new Date()
                });
            }
            setShowFormModal(false);
            setNameInput("");
            setJabatanInput("");
            setEditingId(null);
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Gagal menyimpan data. Cek koneksi internet.");
        }
    };

    // --- 3. DELETE USER (Firebase) ---
    const handleDeleteUser = async (id) => {
        if (confirm("Yakin ingin menghapus anggota ini?")) {
            try {
                await deleteDoc(doc(db, "patrols", id));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Gagal menghapus data.");
            }
        }
    };

    // --- 4. TOGGLE STATUS (Firebase) ---
    const toggleStatus = async (user) => {
        try {
            const userRef = doc(db, "patrols", user.id);
            await updateDoc(userRef, {
                status: !user.status
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- 5. UPDATE DATE (Firebase) ---
    const handleSaveDate = async (e) => {
        e.preventDefault();
        if (startDateInput && endDateInput) {
            const start = new Date(startDateInput);
            const end = new Date(endDateInput);
            
            const startDay = start.getDate();
            const endMonth = end.toLocaleDateString('id-ID', { month: 'long' });
            const endYear = end.getFullYear();
            const startMonth = start.toLocaleDateString('id-ID', { month: 'long' });
            const startYear = start.getFullYear();

            let formattedDate = "";
            if (startYear === endYear && startMonth === endMonth) {
                formattedDate = `${startDay} - ${end.getDate()} ${startMonth} ${startYear}`;
            } else if (startYear === endYear) {
                formattedDate = `${startDay} ${startMonth} - ${end.getDate()} ${endMonth} ${startYear}`;
            } else {
                 formattedDate = `${startDay} ${startMonth} ${startYear} - ${end.getDate()} ${endMonth} ${endYear}`;
            }

            try {
                const { setDoc } = await import("firebase/firestore"); 
                const configRef = doc(db, "config", "main");
                await setDoc(configRef, { period: formattedDate }, { merge: true });
                setShowDateModal(false);
            } catch (error) {
                console.error("Error saving date:", error);
                alert("Gagal menyimpan tanggal.");
            }
        }
    };

    // --- Handler Lainnya ---
    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === "admin") {
            setIsAdmin(true);
            setShowLoginModal(false);
            setPasswordInput("");
        } else {
            alert("Password salah!");
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setNameInput("");
        setJabatanInput("");
        setShowFormModal(true);
    };

    const openEditModal = (user) => {
        setEditingId(user.id);
        setNameInput(user.name);
        setJabatanInput(user.jabatan);
        setShowFormModal(true);
    };

    const openDateModal = () => {
        setStartDateInput("");
        setEndDateInput("");
        setShowDateModal(true);
    };

    // --- Filter & Kalkulasi ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                              (user.jabatan && user.jabatan.toLowerCase().includes(search.toLowerCase()));
        
        const matchesFilter = filterStatus === 'ALL' 
            ? true 
            : filterStatus === 'SUDAH' 
                ? user.status === true 
                : user.status === false;

        return matchesSearch && matchesFilter;
    });

    const totalUsers = users.length;
    const completed = users.filter(u => u.status).length;
    const pending = totalUsers - completed;

    return (
        <div className={`min-h-screen pb-10 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 md:p-6 shadow-lg relative">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                Monitoring Patroli IZAT
                            </h1>
                            {/* Tombol Dark Mode untuk Mobile (tampil di kanan atas layar kecil) */}
                            <button 
                                onClick={toggleDarkMode} 
                                className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition ml-2"
                                title="Ganti Tema"
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 md:mt-1">
                            <p className="text-blue-200 text-xs md:text-sm">Periode: {headerDate}</p>
                            {isAdmin && (
                                <button 
                                    onClick={openDateModal}
                                    className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition text-white/80 hover:text-white"
                                    title="Ubah Tanggal"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0 items-center gap-2">
                        {/* Tombol Dark Mode untuk Desktop */}
                        <button 
                            onClick={toggleDarkMode} 
                            className="hidden md:flex p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition items-center justify-center mr-2"
                            title="Ganti Tema"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {!isAdmin ? (
                            <button 
                                onClick={() => setShowLoginModal(true)}
                                className="bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Login Admin
                            </button>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-2">
                                <button 
                                    onClick={handleSeedData}
                                    className="bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-lg text-xs md:text-sm font-bold shadow-md transition flex items-center gap-1 md:gap-2"
                                    title="Masukkan 64 nama otomatis ke Database"
                                >
                                    <Database className="w-4 h-4" />
                                    <span className="hidden sm:inline">Import Data</span>
                                </button>
                                <button 
                                    onClick={openAddModal}
                                    className="bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-xs md:text-sm font-bold shadow-md transition flex items-center gap-1 md:gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Tambah
                                </button>
                                <button 
                                    onClick={() => setIsAdmin(false)}
                                    className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-xs md:text-sm font-bold shadow-md transition flex items-center gap-1 md:gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Kolom Kiri: Statistik */}
                <div className="md:col-span-1 space-y-6">
                    <div className={`rounded-xl shadow-sm border p-6 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-lg font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Statistik Pelaksanaan</h2>
                        <SimplePieChart data={users} isDarkMode={isDarkMode} />
                    </div>

                    <div className={`rounded-xl shadow-sm border p-6 space-y-4 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Ringkasan</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-lg text-center transition-colors ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Total</p>
                                <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{totalUsers}</p>
                            </div>
                            <div className={`p-3 rounded-lg text-center transition-colors ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                                <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Sudah</p>
                                <p className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>{completed}</p>
                            </div>
                            <div className={`p-3 rounded-lg text-center col-span-2 transition-colors ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Belum Melaksanakan</p>
                                <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{pending}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`rounded-xl p-4 text-sm transition-colors ${isDarkMode ? 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-200' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'}`}>
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4" /> 
                            Catatan Penting
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Lokasi: All area kerja</li>
                            <li>Temuan disampaikan via aplikasi I-Zat</li>
                            <li>Tiap karyawan minimal 1 temuan</li>
                        </ul>
                    </div>
                </div>

                {/* Kolom Kanan: Daftar Anggota */}
                <div className="md:col-span-2">
                    <div className={`rounded-xl shadow-sm border overflow-hidden flex flex-col h-full min-h-[500px] md:min-h-[600px] transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-3 transition-colors ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                            <h2 className={`font-bold flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start ${isDarkMode ? 'text-slate-100' : 'text-gray-700'}`}>
                                <span>Daftar Petugas</span>
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className={`w-full sm:w-auto pl-8 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="ALL">Semua</option>
                                        <option value="SUDAH">✅ Sudah</option>
                                        <option value="BELUM">❌ Belum</option>
                                    </select>
                                    <Filter className={`absolute left-2.5 top-2.5 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                                </div>

                                <div className="relative w-full sm:w-auto">
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={`w-full sm:w-48 pl-9 pr-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:sm:w-60 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    />
                                    <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-y-auto overflow-x-auto flex-1 p-2">
                            {loading ? (
                                <div className={`text-center py-20 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    Memuat data dari database...
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead className={`text-xs uppercase sticky top-0 z-10 transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>
                                        <tr>
                                            <th className="p-3">No</th>
                                            <th className="p-3">Nama Anggota</th>
                                            <th className="p-3">Jabatan</th>
                                            <th className="p-3 text-center">Status</th>
                                            {isAdmin && <th className="p-3 text-center">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredUsers.map((user, index) => (
                                            <tr key={user.id} className={`border-b transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                                <td className={`p-3 font-mono w-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{index + 1}</td>
                                                <td className={`p-3 font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{user.name}</td>
                                                <td className={`p-3 text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{user.jabatan}</td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={() => toggleStatus(user)}
                                                        className={`px-3 py-1.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 mx-auto cursor-pointer whitespace-nowrap ${
                                                            user.status 
                                                            ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200')
                                                            : (isDarkMode ? 'bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-900/60' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200')
                                                        }`}
                                                        title="Klik untuk mengubah status (Otomatis tersimpan)"
                                                    >
                                                        {user.status ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        {user.status ? 'SUDAH' : 'BELUM'}
                                                    </button>
                                                </td>
                                                {isAdmin && (
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(user)}
                                                                className={`transition p-1 rounded ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className={`transition p-1 rounded ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={`text-center py-10 flex flex-col items-center ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                                    <Search className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                                    Data tidak ditemukan.
                                </div>
                            )}
                        </div>
                        <div className={`p-3 text-xs text-center border-t transition-colors ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                            Total Data Ditampilkan: {filteredUsers.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className={`max-w-5xl mx-auto mt-6 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                <p>Salam Safety &copy; 2026 - Aplikasi Verifikasi Patroli Izat</p>
            </footer>

            {/* MODAL LOGIN */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <LogIn className="w-5 h-5" />
                            Login Admin
                        </h3>
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Password</label>
                                <input 
                                    type="password" 
                                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Masukkan password..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowLoginModal(false)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md"
                                >
                                    Masuk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL UBAH TANGGAL (Admin) */}
            {showDateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`rounded-xl shadow-2xl p-6 w-full max-w-sm ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Ubah Periode Patroli
                        </h3>
                        <form onSubmit={handleSaveDate}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Tanggal Mulai</label>
                                <input 
                                    type="date" 
                                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-gray-900'}`}
                                    value={startDateInput}
                                    onChange={(e) => setStartDateInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Tanggal Selesai</label>
                                <input 
                                    type="date" 
                                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-gray-900'}`}
                                    value={endDateInput}
                                    onChange={(e) => setEndDateInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowDateModal(false)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FORM ANGGOTA (Tambah / Edit) */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`rounded-xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            {editingId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                            {editingId ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                        </h3>
                        <form onSubmit={handleSaveUser}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="NAMA PETUGAS..."
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Jabatan</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                        value={jabatanInput}
                                        onChange={(e) => setJabatanInput(e.target.value)}
                                        placeholder="CONTOH: STAFF, SPV..."
                                    />
                                    <Briefcase className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFormModal(false)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md"
                                >
                                    {editingId ? 'Simpan Perubahan' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
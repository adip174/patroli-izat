import React, { useState, useEffect } from 'react';
import { Trash2, Search, Check, X, Shield, LogOut, UserPlus, LogIn, AlertTriangle, Pencil, Briefcase, Calendar, Filter, Save, Cloud, Loader2 } from 'lucide-react';

// --- IMPORT FIREBASE ---
// Pastikan Anda sudah menginstall firebase: npm install firebase
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
  getDocs,
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
// Cek agar tidak error jika config belum diisi user
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase belum disetting dengan benar. Masukkan config Anda.");
}

// --- Data Awal untuk Seeding (Hanya dipakai sekali jika DB kosong) ---
const INITIAL_DATA_SEED = [
    { name: "ABD.RACHMAN.S", jabatan: "-", status: true },
    { name: "ABD. RAHMAN", jabatan: "-", status: true },
    { name: "ABDUL BAYAM", jabatan: "-", status: true },
    // ... (Data lainnya bisa ditambahkan manual nanti atau via fitur import di bawah)
];

// --- Komponen Pie Chart ---
const SimplePieChart = ({ data }) => {
    const total = data.length;
    const done = data.filter(d => d.status).length;
    const notDone = total - done;
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const donePercent = total > 0 ? (done / total) : 0;
    const doneOffset = circumference * (1 - donePercent);

    if (total === 0) return <div className="text-gray-500 text-sm">Menunggu data...</div>;

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
                    <span className="text-3xl font-bold text-gray-800">{Math.round(donePercent * 100)}%</span>
                    <span className="text-xs text-gray-500 font-semibold">COMPLETED</span>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium">Sudah ({done})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Belum ({notDone})</span>
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

    // --- 1. READ DATA (Realtime dari Firebase) ---
    useEffect(() => {
        if (!db) return;

        // Listener untuk Data Anggota
        // Mengambil data dari collection 'patrols', diurutkan berdasarkan 'name'
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

        // Listener untuk Data Config (Tanggal Header)
        // Kita simpan tanggal di collection 'config', document 'main'
        const unsubscribeConfig = onSnapshot(doc(db, "config", "main"), (doc) => {
            if (doc.exists()) {
                setHeaderDate(doc.data().period || "1 - 28 Februari 2026");
            } else {
                // Jika belum ada, set default
                setHeaderDate("1 - 28 Februari 2026");
            }
        });

        return () => {
            unsubscribeUsers();
            unsubscribeConfig();
        };
    }, []);

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
            // Tidak perlu alert, karena UI akan optimistik update jika diperlukan, 
            // tapi dengan onSnapshot UI akan otomatis update setelah server confirm.
        }
    };

    // --- 5. UPDATE DATE (Firebase) ---
    const handleSaveDate = async (e) => {
        e.preventDefault();
        
        if (startDateInput && endDateInput) {
            const start = new Date(startDateInput);
            const end = new Date(endDateInput);
            
            const startDay = start.getDate();
            const endDay = end.getDate();
            const startMonth = start.toLocaleDateString('id-ID', { month: 'long' });
            const endMonth = end.toLocaleDateString('id-ID', { month: 'long' });
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();

            let formattedDate = "";

            if (startYear === endYear && startMonth === endMonth) {
                formattedDate = `${startDay} - ${endDay} ${startMonth} ${startYear}`;
            } else if (startYear === endYear) {
                formattedDate = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
            } else {
                 formattedDate = `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
            }

            try {
                // Simpan ke document khusus 'config/main'
                // setDoc dengan merge:true akan membuat dokumen jika belum ada
                const configRef = doc(db, "config", "main");
                // Import setDoc needed for this specific line if document doesn't exist
                // But updateDoc works if we assume structure exists. Let's use setDoc logic via import above or just handle it.
                // For simplicity using updateDoc but falling back requires import. 
                // Let's assume we initialize it.
                // Better approach:
                const { setDoc } = await import("firebase/firestore"); 
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
        <div className="min-h-screen pb-10 font-sans bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-6 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="w-8 h-8 text-yellow-400" /> 
                            Monitoring Patroli Izat
                            <span className="text-xs bg-emerald-500/80 px-2 py-0.5 rounded text-white ml-2 flex items-center gap-1">
                                <Cloud className="w-3 h-3" /> Online
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1 ml-10">
                            <p className="text-blue-200 text-sm">Periode: {headerDate}</p>
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
                    <div>
                        {!isAdmin ? (
                            <button 
                                onClick={() => setShowLoginModal(true)}
                                className="bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Login Admin
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={openAddModal}
                                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Tambah Anggota
                                </button>
                                <button 
                                    onClick={() => setIsAdmin(false)}
                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Kolom Kiri: Statistik */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Statistik Pelaksanaan</h2>
                        <SimplePieChart data={users} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="font-semibold text-gray-700">Ringkasan</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-blue-600 font-bold uppercase">Total</p>
                                <p className="text-2xl font-bold text-blue-800">{totalUsers}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-emerald-600 font-bold uppercase">Sudah</p>
                                <p className="text-2xl font-bold text-emerald-800">{completed}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-center col-span-2">
                                <p className="text-xs text-red-600 font-bold uppercase">Belum Melaksanakan</p>
                                <p className="text-2xl font-bold text-red-800">{pending}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-3">
                            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                                Daftar Petugas P2K3
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            </h2>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="ALL">Semua</option>
                                        <option value="SUDAH">✅ Sudah</option>
                                        <option value="BELUM">❌ Belum</option>
                                    </select>
                                    <Filter className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>

                                <div className="relative flex-1 md:flex-none">
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 transition-all focus:md:w-60"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2">
                            {loading ? (
                                <div className="text-center py-20 text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    Memuat data dari database...
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
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
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="p-3 font-mono text-gray-400 w-12">{index + 1}</td>
                                                <td className="p-3 font-medium text-gray-800">{user.name}</td>
                                                <td className="p-3 text-gray-600 text-xs font-semibold">{user.jabatan}</td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={() => toggleStatus(user)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                                                            user.status 
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' 
                                                            : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
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
                                                                className="text-gray-400 hover:text-blue-500 transition p-1 hover:bg-blue-50 rounded"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded"
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
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                                    <Search className="w-8 h-8 mb-2 text-gray-300" />
                                    Data tidak ditemukan.
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 p-3 text-xs text-center text-gray-400 border-t border-gray-200">
                            Total Data Ditampilkan: {filteredUsers.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL LOGIN */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <LogIn className="w-5 h-5" />
                            Login Admin
                        </h3>
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input 
                                    type="password" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Ubah Periode Patroli
                        </h3>
                        <form onSubmit={handleSaveDate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={startDateInput}
                                    onChange={(e) => setStartDateInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={endDateInput}
                                    onChange={(e) => setEndDateInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowDateModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            {editingId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                            {editingId ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                        </h3>
                        <form onSubmit={handleSaveUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="NAMA PETUGAS..."
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                                        value={jabatanInput}
                                        onChange={(e) => setJabatanInput(e.target.value)}
                                        placeholder="CONTOH: STAFF, SPV..."
                                    />
                                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFormModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
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
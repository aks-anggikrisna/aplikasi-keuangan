/* global __firebase_config, __app_id */
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, doc, onSnapshot, 
    addDoc, updateDoc, deleteDoc, setDoc, getDoc
} from 'firebase/firestore';
import { 
    getAuth, onAuthStateChanged, GoogleAuthProvider, 
    signInWithPopup, signOut 
} from "firebase/auth";
import { 
    TrendingUp, TrendingDown, PiggyBank, Landmark, 
    Calendar, PlusCircle, Edit, Trash2, X, Sparkles, BrainCircuit, Bot,
    Grip, Percent, AlertCircle, Award, DollarSign, LogOut, PieChart, LayoutDashboard
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell
} from 'recharts';


// --- STYLING untuk Efek Liquid Glass ---
const GlobalStyles = () => (
    <style>{`
        .input-glass {
            background-color: rgba(40, 50, 80, 0.5);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s;
        }
        .input-glass:focus {
            outline: none;
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .button-glass-violet {
            background-color: rgba(139, 92, 246, 0.8);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .button-glass-violet:hover {
            background-color: rgba(139, 92, 246, 1);
        }
        .button-glass-emerald {
            background-color: rgba(16, 185, 129, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s;
        }
        .button-glass-emerald:hover {
            background-color: rgba(16, 185, 129, 1);
        }
         .button-glass-slate {
            background-color: rgba(100, 116, 139, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
        .button-glass-slate:hover {
            background-color: rgba(100, 116, 139, 1);
        }
         .button-glass-sky {
            background-color: rgba(14, 165, 233, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
         .button-glass-sky:hover {
            background-color: rgba(14, 165, 233, 1);
        }
         .button-glass-red {
            background-color: rgba(239, 68, 68, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
         .button-glass-red:hover {
            background-color: rgba(239, 68, 68, 1);
        }
    `}</style>
);

const AuroraBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-sky-500/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-pink-500/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>
);

const GlassCard = ({ children, className = '' }) => (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);

// --- Konfigurasi Firebase ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "AIzaSyB0YgXKJOHnM69grObXUVFz7MGHlh-cjCg", authDomain: "my-project-1553267196543.firebaseapp.com", projectId: "my-project-1553267196543", storageBucket: "my-project-1553267196543.firebasestorage.app", messagingSenderId: "204615769880", appId: "1:204615769880:web:e075913abc658bde27886d" };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-finance-app';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Helper & Komponen UI ---
const formatCurrency = (amount, currency = 'IDR') => {
  if (isNaN(amount)) amount = 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-white/20 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className={`p-3 rounded-full ${color}`}><Icon className="text-white" size={24} /></div>
      <div><p className="text-sm text-slate-200">{title}</p><p className="text-xl font-bold text-white">{value}</p></div>
    </div>
);

const Clock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return <div className="text-sm text-slate-300 font-mono">{time.toLocaleTimeString('en-GB')}</div>;
};

// --- KOMPONEN UTAMA ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'report'
  
  const [debts, setDebts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [assets, setAssets] = useState({ savings: 0, investments: 0, financialFreedomGoal: 1000000000 });
  const [futureIncome, setFutureIncome] = useState({ source: '', amount: 0, currency: 'USD', notes: '' });
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); 
  const [currentItem, setCurrentItem] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setCurrentUser(user);
        const checkDoc = doc(db, `artifacts/${appId}/users/${user.uid}/appData`, 'initialCheck');
        if (!(await getDoc(checkDoc)).exists()) {
          console.log("User baru, inisialisasi data...");
          await initializeUserData(user.uid);
          await setDoc(checkDoc, { initialized: true, initializedAt: new Date(), email: user.email });
        }
      } else { setCurrentUser(null); }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const basePath = `artifacts/${appId}/users/${currentUser.uid}`;
    const unsubs = [
        onSnapshot(collection(db, `${basePath}/debts`), s => setDebts(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, `${basePath}/incomes`), s => setIncomes(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, `${basePath}/budgets`), s => setBudgets(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, `${basePath}/expenses`), s => setExpenses(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(doc(db, `${basePath}/assets`, 'main'), d => {
            if(d.exists()){
                const data = d.data();
                setAssets({ savings: data.savings||0, investments: data.investments||0, financialFreedomGoal: data.financialFreedomGoal||1000000000 });
                setFutureIncome(data.futureIncome || { source: '', amount: 0, currency: 'USD', notes: '' });
            }
        })
    ];
    return () => unsubs.forEach(unsub => unsub());
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { console.error("Error signing-in:", error); }
  };
  const handleSignOut = async () => { await signOut(auth); };

  const handleAdd = async (col, data) => { if(!currentUser) return; await addDoc(collection(db, `artifacts/${appId}/users/${currentUser.uid}/${col}`), data); };
  const handleUpdate = async (col, id, data) => { if(!currentUser) return; await updateDoc(doc(db, `artifacts/${appId}/users/${currentUser.uid}/${col}`, id), data); };
  const handleUpdateAssets = async (data) => { if(!currentUser) return; await setDoc(doc(db, `artifacts/${appId}/users/${currentUser.uid}/assets`, 'main'), data, { merge: true }); };
  const handleDelete = async (col, id) => { if(!currentUser) return; await deleteDoc(doc(db, `artifacts/${appId}/users/${currentUser.uid}/${col}`, id)); };
  
  const openModal = (mode, item = null) => { setModalMode(mode); setCurrentItem(item); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalMode(null); setCurrentItem(null); };
  
  const summary = useMemo(() => {
    const totalMonthlyIncome = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalMonthlyDebtPayment = debts.reduce((s, i) => s + Number(i.monthlyPayment || 0), 0);
    const totalAssets = Number(assets.savings || 0) + Number(assets.investments || 0);
    const ffProgress = assets.financialFreedomGoal > 0 ? (totalAssets / assets.financialFreedomGoal) * 100 : 0;
    return { totalMonthlyIncome, totalMonthlyDebtPayment, totalAssets, ffProgress };
  }, [debts, incomes, assets]);
  
  const handleAiAnalysis = async ({type, data}) => {
      setIsAiLoading(true); setAiAnalysis(null); setAiError(null);
      setModalMode('aiAnalysis'); setIsModalOpen(true);
      
      let prompt = '';
      if (type === "savingsPlan") {
        const incomeSummary = incomes.map(i => `- ${i.source}: ${formatCurrency(i.amount)}`).join('\n');
        const budgetSummary = budgets.map(b => `- ${b.name}: ${formatCurrency(b.limit)}`).join('\n');
        prompt = `Buatkan "Rencana Menabung Cerdas" untuk saya. Tujuan Kebebasan Finansial: ${formatCurrency(assets.financialFreedomGoal)}. Data Keuangan:\nPemasukan Bulanan:\n${incomeSummary}\n\nUtang Bulanan:\n${debts.map(d=>`- ${d.name}: ${formatCurrency(d.monthlyPayment)}`).join('\n')}\n\nAnggaran:\n${budgetSummary}\n\nTotal Aset: ${formatCurrency(summary.totalAssets)}\n\nBerikan rencana (Markdown): 1. Evaluasi Kemampuan Menabung. 2. Strategi Alokasi. 3. Potensi Penghematan. 4. Proyeksi & Motivasi.`;
      } else if (type === "debtPlan") {
        prompt = `Buatkan "Rencana Pelunasan Utang" untuk saya. Data Keuangan:\nPemasukan Bulanan:\n${incomes.map(i=>`- ${i.source}: ${formatCurrency(i.amount)}`).join('\n')}\n\nUtang Bulanan:\n${debts.map(d=>`- ${d.name}: ${formatCurrency(d.monthlyPayment)}`).join('\n')}\n\nBerikan rencana (Markdown): 1. Strategi (Snowball/Avalanche) & Alasan. 2. Urutan Prioritas. 3. Alokasi Dana Tambahan. 4. Tips Motivasi.`;
      } else if (type === "reportAnalysis") {
          prompt = `Analisis laporan keuangan saya untuk periode ${data.startDate} hingga ${data.endDate}.\n\nData Laporan:\n- Total Pemasukan: ${formatCurrency(data.totalIncome)}\n- Total Pengeluaran: ${formatCurrency(data.totalExpense)}\n- Arus Kas Bersih: ${formatCurrency(data.totalIncome - data.totalExpense)}\n- Rincian Pengeluaran:\n${data.expenseByCategory.map(e => `  - ${e.name}: ${formatCurrency(e.value)}`).join('\n')}\n\nBerikan analisis (Markdown):\n1. **Ringkasan Aktivitas:** Jelaskan secara singkat aktivitas keuangan utama pada periode ini.\n2. **Analisis Pengeluaran:** Kategori mana yang paling boros? Apakah ada pengeluaran tak terduga?\n3. **Perbandingan Pemasukan & Pengeluaran:** Apakah arus kas positif atau negatif? Berikan saran berdasarkan perbandingan ini.\n4. **Saran & Observasi:** Berikan satu atau dua saran kunci untuk perbaikan di periode berikutnya.`;
      }
      
      try {
          const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
          const apiKey = "AIzaSyCWUWiHa-KyDp00Z52plQjrV899CNOQsNE";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
          const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
          const result = await response.json();
          setAiAnalysis(result.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal memproses respons AI.");
      } catch (err) { console.error(err); setAiError(err.message); } 
      finally { setIsAiLoading(false); }
  };

  if (isLoading) { return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Memuat...</div>; }
  if (!currentUser) { return <LoginScreen onLogin={handleGoogleSignIn} />; }

  const commonProps = {
      currentUser, debts, incomes, assets, futureIncome, budgets, expenses, summary,
      openModal, closeModal, handleAdd, handleUpdate, handleUpdateAssets, handleDelete, handleAiAnalysis
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans p-2 sm:p-4 lg:p-6 relative">
        <GlobalStyles />
        <AuroraBackground />
        <div className="max-w-screen-xl mx-auto relative z-10">
            <header className="mb-6 flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-10 h-10 rounded-full border-2 border-white/50"/>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-shadow">{currentPage === 'dashboard' ? `Dasbor ${currentUser.displayName?.split(' ')[0] || 'Pengguna'}` : 'Laporan Keuangan'}</h1>
                        <p className="text-slate-300 text-xs">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Clock/>
                    {currentPage === 'dashboard' ? (
                         <button onClick={() => setCurrentPage('report')} className="bg-indigo-500/80 hover:bg-indigo-500/100 backdrop-blur-sm border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center transition-all text-sm shadow-lg"><PieChart size={18} className="mr-2"/> Laporan</button>
                    ) : (
                        <button onClick={() => setCurrentPage('dashboard')} className="bg-indigo-500/80 hover:bg-indigo-500/100 backdrop-blur-sm border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center transition-all text-sm shadow-lg"><LayoutDashboard size={18} className="mr-2"/> Dasbor</button>
                    )}
                    <button onClick={handleSignOut} className="bg-red-500/80 hover:bg-red-500/100 backdrop-blur-sm border border-white/10 font-bold p-2 rounded-lg flex items-center transition-all text-sm shadow-lg"><LogOut size={18}/></button>
                </div>
            </header>
            
            {currentPage === 'dashboard' ? <Dashboard {...commonProps} /> : <ReportPage {...commonProps} />}
            
            {isModalOpen && modalMode && !modalMode.includes('ai') && <CrudModal {...{mode: modalMode, item: currentItem, assets, futureIncome, onClose: closeModal, onAdd: handleAdd, onUpdate: handleUpdate, onUpdateAssets: handleUpdateAssets}}/>}
            {isModalOpen && modalMode === 'aiAnalysis' && <FinancialAnalysisModal {...{isLoading: isAiLoading, analysis: aiAnalysis, error: aiError, onClose: () => { setAiAnalysis(null); closeModal(); }}} />}
        </div>
    </div>
  )
}

// --- KOMPONEN LOGINSCREEN ---
const LoginScreen = ({ onLogin }) => (
  <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-white text-center p-4 relative overflow-hidden">
    <AuroraBackground />
    <div className="relative z-10 bg-black/20 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center">
        <Award size={64} className="text-amber-400 mb-4"/>
        <h1 className="text-4xl font-bold mb-2">Selamat Datang di Dasbor Keuangan Cerdas</h1>
        <p className="text-slate-300 max-w-xl mb-8">Ambil kendali penuh atas keuangan Anda. Lacak pengeluaran, buat anggaran, dan capai kebebasan finansial dengan bantuan AI.</p>
        <button onClick={onLogin} className="bg-white text-slate-800 font-bold py-3 px-6 rounded-lg flex items-center transition-transform hover:scale-105 shadow-lg">
            <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Masuk dengan Google
        </button>
    </div>
  </div>
);

// --- KOMPONEN DASHBOARD ---
const Dashboard = (props) => {
    const { debts, incomes, assets, futureIncome, budgets, expenses, summary, openModal, handleAdd, handleUpdate, handleDelete, handleUpdateAssets, handleAiAnalysis } = props;
    
    return (
        <>
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => handleAiAnalysis({type:"savingsPlan"})} className="bg-green-500/80 hover:bg-green-500/100 backdrop-blur-sm border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center transition-all text-sm shadow-lg"><DollarSign size={18} className="mr-2"/> Rencana Menabung</button>
                <button onClick={() => openModal('addDebt')} className="bg-sky-500/80 hover:bg-sky-500/100 backdrop-blur-sm border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center transition-all text-sm shadow-lg"><PlusCircle size={18} className="mr-2"/> Tambah Tagihan</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <StatCard icon={TrendingUp} title="Pemasukan Bulanan" value={formatCurrency(summary.totalMonthlyIncome)} color="bg-emerald-500/80" onClick={() => openModal('addIncome')}/>
                <StatCard icon={TrendingDown} title="Tagihan Bulanan" value={formatCurrency(summary.totalMonthlyDebtPayment)} color="bg-red-500/80" />
                <StatCard icon={PiggyBank} title="Total Aset" value={formatCurrency(summary.totalAssets)} color="bg-sky-500/80" onClick={() => openModal('editAssets')} />
                <div className="bg-amber-500/20 backdrop-blur-lg border border-amber-500/50 p-4 rounded-2xl shadow-lg flex flex-col justify-between cursor-pointer hover:bg-amber-500/30 transition-all" onClick={() => openModal('editAssets')}>
                    <div className="flex justify-between items-center"><h3 className="text-sm text-amber-200 font-semibold">Tujuan Kebebasan Finansial</h3><Award size={24} className="text-amber-400"/></div>
                    <div><p className="text-xl font-bold text-white">{formatCurrency(assets.financialFreedomGoal)}</p><div className="w-full bg-slate-700/50 rounded-full h-2.5 mt-2"><div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${Math.min(summary.ffProgress, 100)}%` }}></div></div><p className="text-xs text-amber-200 mt-1 text-right">{summary.ffProgress.toFixed(2)}% Tercapai</p></div>
                </div>
            </div>

            <BudgetAndExpenseSection budgets={budgets} expenses={expenses} onAddExpense={handleAdd} onAddBudget={handleAdd} onUpdateBudget={handleUpdate} onDeleteBudget={handleDelete} />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
                <GlassCard className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-bold">Tagihan dan Cicilan Tetap</h2>
                        <button onClick={() => handleAiAnalysis({type:"debtPlan"})} className="bg-purple-500/80 hover:bg-purple-500/100 backdrop-blur-sm border border-white/10 text-white text-sm font-semibold py-1 px-3 rounded-lg flex items-center transition-all shadow-lg"><BrainCircuit size={16} className="mr-2"/> Rencana Pelunasan AI</button>
                    </div>
                    <DebtSection title="Kartu Kredit" debts={debts.filter(d => d.type === 'Credit Card')} onEdit={(i) => openModal('editDebt', i)} onDelete={(id) => handleDelete('debts', id)} onUpdate={handleUpdate}/>
                    <DebtSection title="Pay Later" debts={debts.filter(d => d.type === 'Pay Later')} onEdit={(i) => openModal('editDebt', i)} onDelete={(id) => handleDelete('debts', id)} onUpdate={handleUpdate}/>
                </GlassCard>
                <div className="space-y-6 sm:space-y-8">
                    <InfoCard title="Pemasukan" icon={TrendingUp} color="emerald" onAdd={() => openModal('addIncome')}>
                        {incomes.map(i => <InfoItem key={i.id} item={{...i, label:i.source, value:formatCurrency(i.amount)}} onEdit={() => openModal('editIncome', i)} onDelete={() => handleDelete('incomes', i.id)}/>)}
                    </InfoCard>
                    <InfoCard title="Aset & Tujuan" icon={PiggyBank} color="sky" onAdd={() => openModal('editAssets')}>
                        <InfoItem item={{label: "Tabungan", value: formatCurrency(assets.savings)}} onEdit={() => openModal('editAssets', assets)}/>
                        <InfoItem item={{label: "Investasi", value: formatCurrency(assets.investments)}} onEdit={() => openModal('editAssets', assets)}/>
                    </InfoCard>
                    <InfoCard title="Pemasukan Akan Datang" icon={Calendar} color="amber" onAdd={() => openModal('editFutureIncome')}>
                        <InfoItem item={{label: futureIncome.source || "N/A", value: formatCurrency(futureIncome.amount, futureIncome.currency), notes: futureIncome.notes}} onEdit={() => openModal('editFutureIncome', futureIncome)}/>
                    </InfoCard>
                </div>
            </main>
        </>
    );
};

// --- KOMPONEN REPORT PAGE ---
const ReportPage = ({ incomes, expenses, debts, assets, budgets, handleAiAnalysis }) => {
    const getMonthRange = () => {
        const start = new Date();
        start.setDate(1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    }
    const [dateRange, setDateRange] = useState(getMonthRange());

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => e.date >= dateRange.startDate && e.date <= dateRange.endDate);
    }, [expenses, dateRange]);
    
    const reportData = useMemo(() => {
        const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpense = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalDebt = debts.reduce((sum, item) => {
            if (item.paymentType === 'Angsuran' && item.totalPayments > item.paymentsMade) {
                return sum + (item.totalPayments - item.paymentsMade) * item.monthlyPayment;
            }
            if (item.paymentType === 'Penuh') { return sum + item.monthlyPayment; }
            return sum;
        }, 0);
        
        const expenseByCategory = budgets.map(budget => {
            const spent = filteredExpenses.filter(e => e.category === budget.name).reduce((sum, e) => sum + e.amount, 0);
            return { name: budget.name, value: spent };
        }).filter(item => item.value > 0);

        const cashflowData = [
            { name: 'Pemasukan', value: totalIncome, fill: '#10b981' },
            { name: 'Pengeluaran', value: totalExpense, fill: '#ef4444' },
        ];

        return { totalIncome, totalExpense, totalDebt, cashflowData, expenseByCategory };
    }, [incomes, filteredExpenses, debts, budgets]);

    const handleDateChange = (e) => {
        setDateRange(prev => ({...prev, [e.target.name]: e.target.value }));
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

    return (
        <div className="space-y-8">
            <GlassCard>
                <div className="flex flex-wrap items-center justify-between gap-4">
                     <h3 className="text-lg font-bold">Filter Laporan</h3>
                     <div className="flex items-center gap-2">
                        <label htmlFor="startDate">Dari:</label>
                        <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="input-glass"/>
                     </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="endDate">Hingga:</label>
                        <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="input-glass"/>
                     </div>
                     <button onClick={() => handleAiAnalysis({type: 'reportAnalysis', data: {...reportData, ...dateRange}})} className="bg-violet-500/80 hover:bg-violet-500/100 backdrop-blur-sm border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center transition-all text-sm shadow-lg"><Sparkles size={18} className="mr-2"/> Analisis Laporan AI</button>
                </div>
            </GlassCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <GlassCard className="text-center">
                    <p className="text-sm text-slate-300">Total Pemasukan (Bulanan)</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(reportData.totalIncome)}</p>
                </GlassCard>
                <GlassCard className="text-center">
                    <p className="text-sm text-slate-300">Pengeluaran Periode Ini</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(reportData.totalExpense)}</p>
                </GlassCard>
                <GlassCard className="text-center">
                    <p className="text-sm text-slate-300">Arus Kas Bersih (Est.)</p>
                    <p className={`text-2xl font-bold ${reportData.totalIncome - reportData.totalExpense >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>
                        {formatCurrency(reportData.totalIncome - reportData.totalExpense)}
                    </p>
                </GlassCard>
                 <GlassCard className="text-center">
                    <p className="text-sm text-slate-300">Total Utang Aktif</p>
                    <p className="text-2xl font-bold text-amber-400">{formatCurrency(reportData.totalDebt)}</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard>
                    <h3 className="text-lg font-bold mb-4">Komposisi Pengeluaran Periode Ini</h3>
                    {reportData.expenseByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData.expenseByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {reportData.expenseByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400">
                           <p>Tidak ada data pengeluaran pada periode ini.</p>
                        </div>
                    )}
                </GlassCard>
                <GlassCard>
                    <h3 className="text-lg font-bold mb-4">Pemasukan vs Pengeluaran Periode Ini</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.cashflowData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                           <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} stroke="rgba(255, 255, 255, 0.7)"/>
                           <YAxis type="category" dataKey="name" stroke="rgba(255, 255, 255, 0.7)"/>
                           <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}/>
                           <Bar dataKey="value" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>
        </div>
    );
};

const BudgetAndExpenseSection = ({ budgets, expenses, onAddExpense, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
    const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
    const categorySpending = useMemo(() => {
        const spending = {};
        budgets.forEach(b => { spending[b.name] = 0; });
        expenses.forEach(e => { if (spending[e.category] !== undefined) spending[e.category] += Number(e.amount || 0); });
        return spending;
    }, [budgets, expenses]);

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold">Anggaran & Pengeluaran</h2>
                <button onClick={() => setBudgetModalOpen(true)} className="bg-sky-500/80 hover:bg-sky-500/100 backdrop-blur-sm border border-white/10 text-white text-sm font-semibold py-1 px-3 rounded-lg flex items-center transition-all shadow-lg"><Grip size={16} className="mr-2"/>Kelola Anggaran</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {budgets.map(budget => {
                    const spent = categorySpending[budget.name] || 0;
                    const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                    return (
                        <div key={budget.id} className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-slate-200">{budget.name}</p>
                            <p className="text-xs text-slate-400">{formatCurrency(spent)}/{formatCurrency(budget.limit)}</p>
                            <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                                <div className={`${progress > 100 ? 'bg-red-500' : 'bg-green-500'} h-2 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                            </div>
                        </div>
                    );
                })}
                 {budgets.length === 0 && <p className="text-slate-400 text-sm col-span-full">Belum ada anggaran.</p>}
            </div>
            <ExpenseInputForm budgets={budgets} onAddExpense={onAddExpense} />
            {isBudgetModalOpen && <ManageBudgetModal budgets={budgets} onClose={() => setBudgetModalOpen(false)} onAdd={onAddBudget} onUpdate={onUpdateBudget} onDelete={onDeleteBudget}/>}
        </GlassCard>
    );
};

const ExpenseInputForm = ({ budgets, onAddExpense }) => {
    const [textInput, setTextInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parsedExpense, setParsedExpense] = useState(null);
    const handleParseExpense = async () => {
        if (!textInput.trim()) return;
        setIsParsing(true);
        setParsedExpense(null);
        const categoryNames = budgets.map(b => b.name).length > 0 ? budgets.map(b => b.name) : ["Makanan", "Transportasi", "Hiburan", "Belanja", "Tagihan", "Lainnya"];
        const prompt = `Analisis teks pengeluaran: "${textInput}". Ekstrak ke JSON. Kategori valid: [${categoryNames.map(c => `"${c}"`).join(', ')}]. Jika tidak cocok, gunakan "Lainnya".`;
        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { name: { type: "STRING" }, amount: { type: "NUMBER" }, category: { type: "STRING", enum: categoryNames } }, required: ["name", "amount", "category"] } } };
            const apiKey = "AIzaSyCWUWiHa-KyDp00Z52plQjrV899CNOQsNE";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
                setParsedExpense({ ...parsedJson, date: new Date().toISOString().split('T')[0] });
            } else throw new Error("Gagal parsing.");
        } catch (err) {
            console.error(err);
            setParsedExpense({ name: textInput, amount: 0, category: categoryNames[0], date: new Date().toISOString().split('T')[0] });
        } finally {
            setIsParsing(false);
        }
    };
    const handleAddClick = () => { onAddExpense('expenses', parsedExpense); setParsedExpense(null); setTextInput(''); };
    const handleFieldChange = (field, value) => { setParsedExpense(prev => ({ ...prev, [field]: value })); };
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
            {!parsedExpense ? (
                <div className="flex gap-2">
                    <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Cth: Makan siang sate padang 35rb" className="input-glass w-full" disabled={isParsing} />
                    <button onClick={handleParseExpense} disabled={isParsing || !textInput.trim()} className="button-glass-violet font-semibold px-4 flex items-center">
                        {isParsing ? <Sparkles size={18} className="animate-spin" /> : "Proses"}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <input type="text" value={parsedExpense.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Nama" className="input-glass w-full" />
                    <input type="number" value={parsedExpense.amount} onChange={e => handleFieldChange('amount', e.target.value)} placeholder="Jumlah" className="input-glass w-full" />
                    <select value={parsedExpense.category} onChange={e => handleFieldChange('category', e.target.value)} className="input-glass w-full">
                        {budgets.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        {!budgets.find(b => b.name === parsedExpense.category) && <option value={parsedExpense.category}>{parsedExpense.category}</option>}
                    </select>
                    <div className="flex gap-2">
                        <button onClick={handleAddClick} className="button-glass-emerald w-full">Tambah</button>
                        <button onClick={() => setParsedExpense(null)} className="button-glass-slate p-2"><X size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ManageBudgetModal=({budgets,onClose,onAdd,onUpdate,onDelete})=>{const[localBudgets,setLocalBudgets]=useState([...budgets]);const handleAddRow=()=>setLocalBudgets([...localBudgets,{name:'',limit:0,isNew:true}]);const handleChange=(index,field,value)=>{const updated=[...localBudgets];updated[index][field]=field==='limit'?Number(value):value;setLocalBudgets(updated)};const handleSave=async(index)=>{const budget=localBudgets[index];if(!budget.name||budget.limit<=0)return;const{isNew,...budgetData}=budget;if(isNew){await onAdd('budgets',budgetData)}else{await onUpdate('budgets',budget.id,budgetData)}onClose()};const handleDeleteClick=async(index)=>{if(window.confirm("Hapus kategori?")){const budget=localBudgets[index];if(!budget.isNew)await onDelete('budgets',budget.id);setLocalBudgets(localBudgets.filter((_,i)=>i!==index))}};return(<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Kelola Anggaran</h2><button onClick={onClose}><X size={24}/></button></div><div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">{localBudgets.map((budget,index)=>(<div key={budget.id||index} className="flex gap-2 items-center"><input type="text" value={budget.name} onChange={e=>handleChange(index,'name',e.target.value)} placeholder="Nama Kategori" className="input-glass w-full"/><input type="number" value={budget.limit} onChange={e=>handleChange(index,'limit',e.target.value)} placeholder="Batas Anggaran" className="input-glass w-full"/><button onClick={()=>handleSave(index)} className="button-glass-sky p-2"><PlusCircle size={18}/></button><button onClick={()=>handleDeleteClick(index)} className="button-glass-red p-2"><Trash2 size={18}/></button></div>))}</div><button onClick={handleAddRow} className="mt-4 button-glass-slate w-full">Tambah Kategori</button></div></div>)};
const DebtSection=({title,debts,onEdit,onDelete,onUpdate})=>(<div className="mb-6"><h3 className="text-lg font-semibold mb-3 text-slate-200 border-b border-white/10 pb-2">{title}</h3><div className="space-y-4">{debts.length>0?debts.map(d=><DebtItem key={d.id} debt={d} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate}/>):<p className="text-slate-400 text-sm italic">Belum ada data untuk {title}.</p>}</div></div>);
const DebtItem=({debt,onEdit,onDelete,onUpdate})=>{const{id,name,monthlyPayment,paymentType,paymentsMade=0,totalPayments=0,notes,interestRate,dueDate,creditLimit}=debt;const dueDateStatus=useMemo(()=>{if(!dueDate)return{text:'',color:'text-slate-400'};const today=new Date();const currentDay=today.getDate();const daysInMonth=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();let diff=dueDate-currentDay;if(diff<-5){diff+=daysInMonth}if(diff<0)return{text:`Terlambat`,color:'text-red-300',iconColor:'text-red-400'};if(diff<=7)return{text:`Jatuh tempo ${diff} hari lagi`,color:'text-yellow-300',iconColor:'text-yellow-400'};return{text:`Tgl ${dueDate}`,color:'text-slate-400',iconColor:'text-slate-400'}},[dueDate]);const progress=totalPayments>0?(paymentsMade/totalPayments)*100:0;const handleMarkPaid=()=>{if(paymentsMade<totalPayments){onUpdate('debts',id,{paymentsMade:paymentsMade+1})}};const outstandingBalance=paymentType==='Angsuran'?(totalPayments-paymentsMade)*monthlyPayment:monthlyPayment;const limitUsage=creditLimit>0?(outstandingBalance/creditLimit)*100:0;return(<div className="bg-slate-900/50 p-4 rounded-lg group relative border border-white/10"><div className="flex justify-between items-start gap-4"><div className="flex-grow"><div className="flex items-center space-x-3"><Landmark className="text-cyan-400" size={20}/><span className="font-semibold">{name}</span></div></div><span className="font-bold text-lg text-red-400 flex-shrink-0">{formatCurrency(monthlyPayment)}</span></div><div className="mt-3 flex flex-wrap justify-between items-center text-xs gap-2"><div className="flex items-center gap-4">{interestRate&&<span className="flex items-center text-slate-400"><Percent size={14} className="mr-1 text-slate-500"/>{interestRate}%</span>}{dueDate&&<span className={`flex items-center ${dueDateStatus.color}`}><AlertCircle size={14} className={`mr-1 ${dueDateStatus.iconColor}`}/>{dueDateStatus.text}</span>}</div></div>{creditLimit>0&&(<div className="mt-3"><p className="text-xs text-slate-400">Limit Terpakai: {formatCurrency(outstandingBalance)} dari {formatCurrency(creditLimit)}</p><div className="w-full bg-slate-700/50 rounded-full h-2 mt-1"><div className="bg-red-500 h-2 rounded-full" style={{width:`${limitUsage}%`}}></div></div></div>)}{paymentType==='Angsuran'&&totalPayments>0&&(<div className="mt-3"><p className="text-xs text-slate-400">Progress Cicilan</p><div className="flex items-center space-x-2"><div className="w-full bg-slate-700/50 h-2.5 rounded-full"><div className="bg-cyan-500 h-2.5 rounded-full" style={{width:`${progress}%`}}></div></div>{paymentsMade<totalPayments&&<button onClick={handleMarkPaid} className="bg-emerald-500/80 text-xs px-2 py-1 rounded border border-white/10">Bayar</button>}</div><p className="text-xs text-slate-400 mt-1 text-right">{`${paymentsMade}/${totalPayments}`}</p></div>)}{notes&&<p className="text-xs text-amber-300 italic mt-2">Catatan: {notes}</p>}<div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>onEdit(debt)} className="button-glass-slate p-1"><Edit size={14}/></button><button onClick={()=>{if(window.confirm(`Hapus ${name}?`))onDelete(id)}} className="button-glass-slate p-1"><Trash2 size={14}/></button></div></div>)};
const InfoCard=({title,icon:Icon,color,onAdd,children})=>(<GlassCard><div className="flex justify-between items-center mb-4"><h2 className={`text-xl font-bold flex items-center text-${color}-300`}><Icon className="mr-2"/>{title}</h2><button onClick={onAdd} className="p-1 hover:bg-white/20 rounded-full"><PlusCircle size={20}/></button></div><div className="space-y-3">{children}</div></GlassCard>);
const InfoItem=({item,onEdit,onDelete})=>(<div className="bg-slate-900/50 p-3 rounded-lg group flex justify-between items-center border border-white/10"><div><div className="flex items-center gap-2"><span className="text-slate-200">{item.label}</span>{item.type&&<span className={`text-xs px-2 py-0.5 rounded-full ${item.type==='fixed'?'bg-blue-900/50 text-blue-200':'bg-green-900/50 text-green-200'}`}>{item.type}</span>}</div>{item.notes&&<p className="text-xs text-slate-400">{item.notes}</p>}</div><div className="flex items-center space-x-2"><span className="font-bold">{item.value}</span><div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">{onEdit&&<button onClick={()=>onEdit(item)} className="p-1 hover:bg-white/20 rounded-full"><Edit size={14}/></button>}{onDelete&&<button onClick={()=>{if(window.confirm(`Hapus ${item.label}?`))onDelete(item.id)}} className="p-1 hover:bg-white/20 rounded-full"><Trash2 size={14}/></button>}</div></div></div>);
const CrudModal = ({ mode, item, assets, futureIncome, onClose, onAdd, onUpdate, onUpdateAssets }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        const getData = () => {
            if (mode?.startsWith('edit') && item) return item;
            if (mode === 'editAssets') return assets;
            if (mode === 'editFutureIncome') return futureIncome;
            if (mode === 'addDebt') return { name: '', monthlyPayment: 0, type: 'Credit Card', paymentType: 'Penuh', paymentsMade: 0, totalPayments: 0, notes: '', interestRate: 0, dueDate: 15, creditLimit: 0 };
            if (mode === 'addIncome') return { source: '', amount: 0, type: 'manual' };
            return {};
        };
        setFormData(getData())
    }, [mode, item, assets, futureIncome]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }))
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { isNew, ...dataToSave } = formData;
        if (mode === 'addDebt') onAdd('debts', dataToSave);
        else if (mode === 'editDebt') onUpdate('debts', item.id, dataToSave);
        else if (mode === 'addIncome') onAdd('incomes', dataToSave);
        else if (mode === 'editIncome') onUpdate('incomes', item.id, dataToSave);
        else if (mode === 'editAssets') onUpdateAssets({ savings: dataToSave.savings, investments: dataToSave.investments, financialFreedomGoal: dataToSave.financialFreedomGoal });
        else if (mode === 'editFutureIncome') onUpdateAssets({ futureIncome: dataToSave });
        onClose()
    };
    
    const title = { addDebt: "Tambah Tagihan", editDebt: "Edit Tagihan", addIncome: "Tambah Pemasukan", editIncome: "Edit Pemasukan", editAssets: "Edit Aset & Tujuan", editFutureIncome: "Edit Pemasukan Akan Datang" }[mode] || "Form";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">{title}</h2><button onClick={onClose}><X size={24}/></button></div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {(mode === 'addDebt' || mode === 'editDebt') && <>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nama Tagihan" className="input-glass w-full" required/>
                        <input type="number" name="monthlyPayment" value={formData.monthlyPayment || ''} onChange={handleChange} placeholder="Pembayaran Bulanan" className="input-glass w-full" required/>
                        <input type="number" name="creditLimit" value={formData.creditLimit || ''} onChange={handleChange} placeholder="Total Limit Kredit" className="input-glass w-full" />
                        <div className="flex gap-4">
                            <input type="number" name="interestRate" value={formData.interestRate || ''} onChange={handleChange} placeholder="Bunga (%)" className="input-glass w-full"/>
                            <input type="number" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} placeholder="Tgl Jatuh Tempo" className="input-glass w-full" min="1" max="31"/>
                        </div>
                        <select name="type" value={formData.type || 'Credit Card'} onChange={handleChange} className="input-glass w-full"><option value="Credit Card">Kartu Kredit</option><option value="Pay Later">Pay Later</option></select>
                        <select name="paymentType" value={formData.paymentType || 'Penuh'} onChange={handleChange} className="input-glass w-full"><option value="Penuh">Pembayaran Penuh</option><option value="Angsuran">Angsuran</option></select>
                        {formData.paymentType === 'Angsuran' && <>
                            <input type="number" name="paymentsMade" value={formData.paymentsMade || ''} onChange={handleChange} placeholder="Pembayaran Telah Dibuat" className="input-glass w-full"/>
                            <input type="number" name="totalPayments" value={formData.totalPayments || ''} onChange={handleChange} placeholder="Total Bulan Angsuran" className="input-glass w-full"/>
                        </>}
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Catatan (opsional)" className="input-glass w-full h-20"></textarea>
                    </>}
                    {(mode === 'addIncome' || mode === 'editIncome') && <>
                        <input type="text" name="source" value={formData.source || ''} onChange={handleChange} placeholder="Sumber Pemasukan" className="input-glass w-full" required/>
                        <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="Jumlah" className="input-glass w-full" required/>
                        <select name="type" value={formData.type || 'manual'} onChange={handleChange} className="input-glass w-full">
                            <option value="manual">Manual</option>
                            <option value="fixed">Fixed</option>
                        </select>
                    </>}
                    {(mode === 'editAssets') && <>
                        <label className="text-sm text-slate-400">Uang di Tabungan</label><input type="number" name="savings" value={formData.savings || ''} onChange={handleChange} className="input-glass w-full"/>
                        <label className="text-sm text-slate-400">Nilai Investasi</label><input type="number" name="investments" value={formData.investments || ''} onChange={handleChange} className="input-glass w-full"/>
                        <label className="text-sm text-slate-400">Tujuan Kebebasan Finansial</label><input type="number" name="financialFreedomGoal" value={formData.financialFreedomGoal || ''} onChange={handleChange} className="input-glass w-full"/>
                    </>}
                     <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={onClose} className="button-glass-slate py-2 px-4">Batal</button><button type="submit" className="button-glass-sky py-2 px-4">Simpan</button></div>
                </form>
            </div>
        </div>
    )
};

const FinancialAnalysisModal=({isLoading,analysis,error,onClose})=>{const renderMarkdown=(text)=>{if(!text)return null;return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')};return(<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold flex items-center"><Bot size={24} className="mr-3 text-violet-400"/>Analisis AI</h2><button onClick={onClose}><X size={24}/></button></div><div className="overflow-y-auto text-slate-300 prose prose-invert">{isLoading&&<div className="flex flex-col items-center p-8"><Sparkles className="animate-spin text-violet-400 h-12 w-12"/></div>}{error&&<div className="text-red-300">Error: {error}</div>}{analysis&&<div dangerouslySetInnerHTML={{__html:renderMarkdown(analysis)}}/>}</div></div></div>)};

const initializeUserData=async(userId)=>{const basePath=`artifacts/${appId}/users/${userId}`;const initialAssets={savings:0,investments:0,financialFreedomGoal:1000000000,futureIncome:{source:"",amount:0,currency:"USD",notes:""}};await setDoc(doc(db,`${basePath}/assets`,'main'),initialAssets)};

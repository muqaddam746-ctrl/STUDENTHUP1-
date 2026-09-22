import React, { useState } from 'react';
import {
  Shield,
  Users,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Settings,
  Send,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  BarChart2,
  Check,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  UserCheck,
  RefreshCw,
  Gift,
  HelpCircle,
} from 'lucide-react';
import {
  AIOrder,
  AIServiceConfig,
  Language,
  PlatformStats,
  Transaction,
  User,
} from '../types';
import { translations } from '../i18n/translations';

interface AdminPanelProps {
  language: Language;
  currentUser: User | null;
  stats: PlatformStats;
  users: User[];
  transactions: Transaction[];
  aiServices: AIServiceConfig[];
  aiOrders: AIOrder[];
  telegramPaymentAddress: string;
  onUpdateTelegramAddress: (newAddress: string) => void;
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string) => void;
  onToggleUserBlock: (userId: string) => void;
  onAdjustUserBalance: (userId: string, deltaAmount: number) => void;
  onAdminDirectDeposit?: (
    userId: string,
    amount: number,
    isDeposit: boolean,
    paymentMethod: 'payme' | 'click' | 'telegram' | 'admin_bonus' | 'internal_balance',
    note: string
  ) => void;
  onUpdateAIServicePrice: (serviceId: string, newPrice: number) => void;
  onAssignAdminRole: (userId: string, role: 'admin' | 'student', department?: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  currentUser,
  stats,
  users,
  transactions,
  aiServices,
  aiOrders,
  telegramPaymentAddress,
  onUpdateTelegramAddress,
  onApproveTransaction,
  onRejectTransaction,
  onToggleUserBlock,
  onAdjustUserBalance,
  onAdminDirectDeposit,
  onUpdateAIServicePrice,
  onAssignAdminRole,
}) => {
  const t = translations[language];
  const isSuperAdmin = currentUser?.role === 'superadmin' && currentUser?.email === 'shovqiddin45@gmail.com';

  const [activeTab, setActiveTab] = useState<'deposit' | 'payments' | 'users' | 'stats' | 'aiConfig' | 'settings'>('deposit');
  const [telegramInput, setTelegramInput] = useState(telegramPaymentAddress);
  const [telegramSaved, setTelegramSaved] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Direct Deposit / Balance recharge state
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const firstStudent = users.find((u) => u.role !== 'superadmin');
    return firstStudent ? firstStudent.id : (users[0]?.id || '');
  });
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [depositOperation, setDepositOperation] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'payme' | 'click' | 'telegram' | 'admin_bonus' | 'internal_balance'>('payme');
  const [depositNote, setDepositNote] = useState<string>('Kassadan to‘lov qabul qilindi');
  const [depositSuccessNotice, setDepositSuccessNotice] = useState<{
    userName: string;
    userId: string;
    amount: number;
    newBalance: number;
    isDeposit: boolean;
  } | null>(null);

  // Quick preset amounts
  const presetAmounts = [10000, 25000, 50000, 100000, 200000, 500000];

  // Quick reason presets
  const reasonPresets = [
    'Kassadan to‘lov qabul qilindi',
    'Payme / Click to‘g‘ridan-to‘g‘ri to‘lov',
    'Admin bonusi va rag‘batlantirish',
    'Dasturiy xatolik kompensatsiyasi',
    'Olimpiada / Faollik sovg‘asi',
    'Balansni to‘g‘rilash (Hisob tuzatish)',
  ];

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');

  // Filtered users for search in deposit tab
  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.university && u.university.toLowerCase().includes(q))
    );
  });

  const selectedTargetUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTelegramAddress(telegramInput.trim());
    setTelegramSaved(true);
    setTimeout(() => setTelegramSaved(false), 2000);
  };

  const handleStartEditPrice = (service: AIServiceConfig) => {
    setEditingPriceId(service.id);
    setTempPrice(service.price);
  };

  const handleSavePrice = (serviceId: string) => {
    onUpdateAIServicePrice(serviceId, tempPrice);
    setEditingPriceId(null);
  };

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetUser || depositAmount <= 0) return;

    const isAdd = depositOperation === 'deposit';

    if (onAdminDirectDeposit) {
      onAdminDirectDeposit(
        selectedTargetUser.id,
        depositAmount,
        isAdd,
        depositPaymentMethod,
        depositNote.trim()
      );
    } else {
      onAdjustUserBalance(selectedTargetUser.id, isAdd ? depositAmount : -depositAmount);
    }

    const newBal = isAdd
      ? selectedTargetUser.balance + depositAmount
      : Math.max(0, selectedTargetUser.balance - depositAmount);

    setDepositSuccessNotice({
      userName: selectedTargetUser.name,
      userId: selectedTargetUser.id,
      amount: depositAmount,
      newBalance: newBal,
      isDeposit: isAdd,
    });

    // Auto clear notification after 8s
    setTimeout(() => {
      setDepositSuccessNotice(null);
    }, 8000);
  };

  // Recent admin deposit transactions
  const recentAdminTransactions = transactions.filter(
    (t) =>
      t.id.startsWith('TX-ADM-') ||
      t.paymentMethod === 'admin_bonus' ||
      (t.serviceName && t.serviceName.includes('Admin'))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>
              {isSuperAdmin ? 'Super Admin Nazorati (shovqiddin45@gmail.com)' : 'Admin Boshqaruv Markazi'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{t.admin.title}</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Foydalanuvchilar hisobini to‘ldirish, to‘lovlarni tasdiqlash va platforma boshqaruvi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('deposit')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Hisobga pul to‘ldirish</span>
          </button>

          {/* Quick pending approval count badge */}
          {pendingTransactions.length > 0 && (
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{pendingTransactions.length} ta tasdiq kutmoqda</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-2xl overflow-x-auto text-xs font-bold no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'deposit'
              ? 'bg-blue-600 text-white shadow-sm font-black'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pul to‘ldirish</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
            Kassadan
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'payments'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t.admin.pendingPayments}</span>
          {pendingTransactions.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-900 font-bold flex items-center justify-center text-[10px]">
              {pendingTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar va Balanslar</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>{t.admin.stats}</span>
        </button>

        <button
          onClick={() => setActiveTab('aiConfig')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'aiConfig'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.admin.aiPricing}</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.admin.settings}</span>
          </button>
        )}
      </div>

      {/* 1. DIRECT USER BALANCE TOP UP SECTION */}
      {activeTab === 'deposit' && (
        <div className="space-y-6">
          {/* Success Banner Notice */}
          {depositSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Amaliyot muvaffaqiyatli bajarildi!</h4>
                  <p className="text-xs mt-0.5">
                    Foydalanuvchi <strong>{depositSuccessNotice.userName}</strong> (ID: {depositSuccessNotice.userId}) hisobiga{' '}
                    <strong>{depositSuccessNotice.isDeposit ? '+' : '-'}{depositSuccessNotice.amount.toLocaleString()} UZS</strong>{' '}
                    {depositSuccessNotice.isDeposit ? "to‘ldirildi" : "yechildi"}. Yangi balans: <strong>{depositSuccessNotice.newBalance.toLocaleString()} UZS</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Talabaga avtomatik bildirishnoma yuborildi va to‘lovlar tarixiga qayd etildi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDepositSuccessNotice(null)}
                className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: User Selection */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>1. Talabani / Foydalanuvchini tanlang</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    {filteredUsers.length} ta mavjud
                  </span>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Ism, 8 xonali ID yoki email..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-2 text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Users List */}
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredUsers.map((u) => {
                    const isSelected = u.id === selectedUserId;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm'
                            : 'bg-white dark:bg-neutral-800/60 border-neutral-200/80 dark:border-neutral-700/60 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                                {u.name}
                              </span>
                              {u.role === 'superadmin' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                  Super
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate">
                              ID: <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">{u.id}</span> • {u.university?.split('(')[0] || 'OTM'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                            {u.balance.toLocaleString()} UZS
                          </span>
                          <span className="text-[10px] text-neutral-400">Joriy balans</span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Qidiruv bo‘yicha talaba topilmadi
                    </div>
                  )}
                </div>
              </div>

              {/* Selected User Highlight Card */}
              {selectedTargetUser && (
                <div className="p-4 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Tanlangan talaba profili
                  </span>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedTargetUser.name}</h4>
                      <p className="text-xs text-neutral-400">
                        {selectedTargetUser.email} • {selectedTargetUser.phone}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        ID: <span className="font-mono font-bold text-white">{selectedTargetUser.id}</span> • {selectedTargetUser.faculty} ({selectedTargetUser.course}-kurs)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">Hozirgi hisob:</span>
                      <span className="text-lg font-black text-emerald-400">
                        {selectedTargetUser.balance.toLocaleString()} UZS
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Deposit Form */}
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleExecuteDeposit}
                className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>2. To‘lov parametrlarini belgilash</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Summani kiriting, to‘lov manbasi va izohini ko‘rsating
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDepositOperation('deposit')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        depositOperation === 'deposit'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      + Kirim (Qo‘shish)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositOperation('withdraw')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        depositOperation === 'withdraw'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      - Chiqim (Ayirish)
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {depositOperation === 'deposit' ? 'To‘ldiriladigan summa' : 'Yechiladigan summa'} (UZS):
                    </label>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {depositAmount.toLocaleString()} UZS
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step={5000}
                      min={1000}
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-4 pr-16 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-lg font-black text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-neutral-400">
                      UZS
                    </span>
                  </div>

                  {/* Preset Quick Amount Chips */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2.5">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          depositAmount === amt
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                      >
                        +{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method / Source */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    To‘lov manbasi / Usuli:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'payme', label: 'Payme', icon: '💳' },
                      { id: 'click', label: 'Click', icon: '📱' },
                      { id: 'internal_balance', label: 'Naqd pul (Kassa)', icon: '💵' },
                      { id: 'admin_bonus', label: 'Admin Bonusi', icon: '🎁' },
                      { id: 'telegram', label: 'Telegram / Chek', icon: '✈️' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDepositPaymentMethod(m.id as any)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          depositPaymentMethod === m.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-base">{m.icon}</span>
                        <span className="text-[11px] text-center leading-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note / Reason */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Sabab / Izoh (Foydalanuvchiga bildirishnomada ko‘rsatiladi):
                  </label>
                  <input
                    type="text"
                    required
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    placeholder="Masalan: Kassadan naqd to‘lov qabul qilindi"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />

                  {/* Preset reasons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {reasonPresets.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDepositNote(r)}
                        className="text-[10px] font-medium px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Calculation Preview Box */}
                {selectedTargetUser && (
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Joriy hisob balansi:</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {selectedTargetUser.balance.toLocaleString()} UZS
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>
                        {depositOperation === 'deposit' ? 'Qo‘shilayotgan mablag‘:' : 'Yechilayotgan mablag‘:'}
                      </span>
                      <span
                        className={`font-bold ${
                          depositOperation === 'deposit' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {depositOperation === 'deposit' ? '+' : '-'}
                        {depositAmount.toLocaleString()} UZS
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                      <span>Amaliyotdan keyingi kutilayotgan yangi balans:</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                        {(depositOperation === 'deposit'
                          ? selectedTargetUser.balance + depositAmount
                          : Math.max(0, selectedTargetUser.balance - depositAmount)
                        ).toLocaleString()}{' '}
                        UZS
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!selectedTargetUser || depositAmount <= 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  <span>
                    {depositOperation === 'deposit'
                      ? `${selectedTargetUser?.name || 'Foydalanuvchi'} hisobiga ${depositAmount.toLocaleString()} UZS to‘ldirish`
                      : `${selectedTargetUser?.name || 'Foydalanuvchi'} hisobidan ${depositAmount.toLocaleString()} UZS yechish`}
                  </span>
                </button>
              </form>

              {/* History of Admin Deposits */}
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>Oxirgi amalga oshirilgan to‘lovlar (Admin orqali)</span>
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    Jami: {recentAdminTransactions.length} ta
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {recentAdminTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{tx.userName || `Foydalanuvchi (${tx.userId})`}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                            {tx.orderNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {tx.serviceName} • {tx.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-xs ${
                            tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}
                          {tx.amount.toLocaleString()} UZS
                        </span>
                        <span className="block text-[10px] text-emerald-500 font-semibold">
                          Bajarildi ✓
                        </span>
                      </div>
                    </div>
                  ))}

                  {recentAdminTransactions.length === 0 && (
                    <p className="py-4 text-center text-neutral-400 text-xs">
                      Hozircha admin orqali to‘ldirishlar amalga oshirilmagan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PAYMENTS APPROVAL SECTION */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Kutilayotgan to‘lovlar va cheklar
                </h3>
                <p className="text-xs text-neutral-400">
                  Tasdiqlash tugmasini bosganingizda talabaning balansi avtomatik to‘ldiriladi
                </p>
              </div>
              <button
                onClick={() => setActiveTab('deposit')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Qo‘lda to‘ldirish</span>
              </button>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                  Barcha to‘lovlar ko‘rib chiqilgan
                </p>
                <p>Yangi to‘lov so‘rovlari kelib tushganda shu yerda ko‘rinadi.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 mt-2">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {tx.userName || 'Talaba'}
                        </span>
                        <span className="text-neutral-400 font-mono">({tx.orderNumber})</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-bold">
                          Kutilmoqda
                        </span>
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        {tx.serviceName} • {tx.telegramUsername || 'Telegram'} • {tx.date}
                      </p>
                      {tx.telegramReceiptUrl && (
                        <a
                          href={tx.telegramReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold text-[11px] mt-1"
                        >
                          <span>To‘lov chekini ko‘rish →</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        +{tx.amount.toLocaleString()} UZS
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApproveTransaction(tx.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tasdiqlash</span>
                        </button>
                        <button
                          onClick={() => onRejectTransaction(tx.id)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 text-neutral-600 dark:text-neutral-300 font-bold text-xs"
                        >
                          Rad etish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. USERS MANAGEMENT SECTION */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Foydalanuvchilar va rollar
              </h3>
              <p className="text-xs text-neutral-400">
                Foydalanuvchilar balansini to‘ldirish, bloklash yoki admin tayinlash
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-500">Jami: {users.length} nafar</span>
              <button
                onClick={() => setActiveTab('deposit')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hisob to‘ldirish</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID / Ism</th>
                  <th className="py-2.5 px-3">Email & Telefon</th>
                  <th className="py-2.5 px-3">Rol & OTM</th>
                  <th className="py-2.5 px-3">Balans</th>
                  <th className="py-2.5 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">ID: {u.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-neutral-400">{u.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === 'superadmin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : u.role === 'admin'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}
                        >
                          {u.role === 'superadmin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'Talaba'}
                        </span>
                        {u.isBlocked && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            Bloklangan
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{u.university}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {u.balance.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Top Up Button */}
                        <button
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setActiveTab('deposit');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-[11px]"
                          title="Foydalanuvchi hisobiga pul to‘ldirish"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pul to‘ldirish</span>
                        </button>

                        {/* Super Admin role assignment */}
                        {isSuperAdmin && u.role !== 'superadmin' && (
                          <button
                            onClick={() =>
                              onAssignAdminRole(
                                u.id,
                                u.role === 'admin' ? 'student' : 'admin',
                                u.role === 'admin' ? undefined : 'materials'
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-blue-600 font-semibold"
                          >
                            {u.role === 'admin' ? 'Talaba qilish' : 'Admin tayinlash'}
                          </button>
                        )}

                        {/* Block/Unblock */}
                        {u.role !== 'superadmin' && (
                          <button
                            onClick={() => onToggleUserBlock(u.id)}
                            className={`p-1.5 rounded-lg ${
                              u.isBlocked
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            title={u.isBlocked ? 'Blokdan chiqarish' : 'Foydalanuvchini bloklash'}
                          >
                            {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PLATFORM STATS SECTION */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider block">
                {t.admin.totalUsers}
              </span>
              <span className="text-3xl font-black text-neutral-900 dark:text-white mt-1 block">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-emerald-600 text-xs font-semibold mt-2 block">
                +{stats.todayActiveUsers} bugun faol
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider block">
                {t.admin.totalRevenue}
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.totalRevenue.toLocaleString()} UZS
              </span>
              <span className="text-neutral-400 text-xs font-semibold mt-2 block">
                Jami platforma aylanmasi
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider block">
                {t.admin.aiOrdersCount}
              </span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {stats.aiOrdersCount.toLocaleString()}
              </span>
              <span className="text-neutral-400 text-xs font-semibold mt-2 block">
                Generatsiya qilingan buyurtmalar
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider block">
                Materiallar & Testlar
              </span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {stats.materialsCount + stats.testsTakenCount}
              </span>
              <span className="text-neutral-400 text-xs font-semibold mt-2 block">
                {stats.testsTakenCount} ta topshirilgan test
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI CONFIGURATION & PRICING */}
      {activeTab === 'aiConfig' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {t.admin.aiPricing} va xizmat parametrlari
              </h3>
              <p className="text-xs text-neutral-400">
                11 ta AI xizmatlarining narxini va taxminiy bajarilish vaqtini sozlash
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiServices.map((srv) => {
              const isEditing = editingPriceId === srv.id;
              return (
                <div
                  key={srv.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/70 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{srv.description}</p>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      Vaqt: ~{srv.estimatedTime}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={1000}
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 text-xs font-bold rounded border bg-white dark:bg-neutral-700"
                        />
                        <button
                          onClick={() => handleSavePrice(srv.id)}
                          className="p-1 rounded bg-emerald-600 text-white"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {srv.price.toLocaleString()} UZS
                        </span>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleStartEditPrice(srv)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Tahrirlash</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. SUPER ADMIN SETTINGS & TELEGRAM BILLING ADDRESS */}
      {activeTab === 'settings' && isSuperAdmin && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Platforma boshqaruv sozlamalari (Super Admin)
            </h3>
            <p className="text-xs text-neutral-400">
              Telegram to‘lov manzili va asosiy tizim o‘zgaruvchilarini belgilash
            </p>
          </div>

          <form onSubmit={handleSaveTelegram} className="max-w-md space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Super Admin belgilagan Telegram to‘lov manzili:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  placeholder="@studyhub_billing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Talabalar balans to‘ldirish tugmasini bosganda aynan shu Telegram bot yoki profiliga yo‘naltiriladi.
              </p>
            </div>

            {telegramSaved && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Telegram to‘lov manzili muvaffaqiyatli saqlandi!</span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

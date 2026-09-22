import React, { useState } from 'react';
import {
  X,
  Wallet,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Language, Transaction, User } from '../types';
import { translations } from '../i18n/translations';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: User | null;
  transactions: Transaction[];
  telegramPaymentAddress: string;
  onRequestDeposit: (amount: number, paymentMethod: 'telegram' | 'payme' | 'click', notes: string) => void;
}

export const BalanceModal: React.FC<BalanceModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  transactions,
  telegramPaymentAddress,
  onRequestDeposit,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [amount, setAmount] = useState<number>(50000);
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Generate an instant order ID for tracking
  const [currentOrderNumber] = useState(
    () => `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const presetAmounts = [20000, 50000, 100000, 200000, 500000];

  const handleCopy = (text: string, type: 'id' | 'order') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  const handleSendRequest = () => {
    onRequestDeposit(amount, 'telegram', notes);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setActiveTab('history');
    }, 2000);
  };

  // Open Telegram with prefilled message
  const handleOpenTelegram = () => {
    const cleanAddress = telegramPaymentAddress.replace('@', '');
    const message = encodeURIComponent(
      `Assalomu alaykum! StudyHub orqali balans to'ldirish:\n` +
      `👤 Foydalanuvchi ID: ${currentUser?.id || '84920153'}\n` +
      `📄 Buyurtma raqami: ${currentOrderNumber}\n` +
      `💰 To'lov miqdori: ${amount.toLocaleString()} so'm\n` +
      `To'lov chekini ushbu xabarga biriktiryapman.`
    );
    window.open(`https://t.me/${cleanAddress}?text=${message}`, '_blank');
    handleSendRequest();
  };

  const userTransactions = transactions.filter(
    (tx) => tx.userId === currentUser?.id || currentUser?.role === 'superadmin'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {t.balance.myBalance}
              </span>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                {(currentUser?.balance ?? 0).toLocaleString()}{' '}
                <span className="text-sm font-semibold text-neutral-500">{t.common.currency}</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-6 pt-3">
          <button
            onClick={() => setActiveTab('topup')}
            className={`pb-3 text-sm font-bold border-b-2 mr-6 transition-colors ${
              activeTab === 'topup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.balance.topUp}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.balance.paymentHistory} ({userTransactions.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'topup' ? (
            <div className="space-y-5">
              {/* Unique ID & Order banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">{t.balance.userId}</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                    <span>{currentUser?.id || '84920153'}</span>
                    <button
                      onClick={() => handleCopy(currentUser?.id || '84920153', 'id')}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                      title="Nusxalash"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">{t.balance.orderNumber}</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                    <span>{currentOrderNumber}</span>
                    <button
                      onClick={() => handleCopy(currentOrderNumber, 'order')}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                      title="Nusxalash"
                    >
                      {copiedOrder ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  To‘ldirish miqdorini tanlang ({t.common.currency}):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        amount === val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                          : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {(val / 1000).toFixed(0)}k so‘m
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={1000}
                    min={5000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Boshqa miqdor..."
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-neutral-400 font-bold">
                    {t.common.currency}
                  </span>
                </div>
              </div>

              {/* Telegram Payment Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                      {t.balance.telegramPayment}
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed mt-0.5">
                      {t.balance.telegramDesc}:{' '}
                      <strong className="underline">{telegramPaymentAddress}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white/70 dark:bg-neutral-900/60 p-2.5 rounded-xl space-y-1">
                  <p>1. "Telegram orqali to‘lovga o‘tish" tugmasini bosing</p>
                  <p>2. Ochilgan chatda 8 xonali ID va to‘lov chekini yuboring</p>
                  <p>3. Admin tekshirgach, balansingiz avtomatik yangilanadi</p>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleOpenTelegram}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>{t.balance.sendViaTelegram}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {submittedMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t.balance.depositSuccessNotice}</span>
                </div>
              )}
            </div>
          ) : (
            /* Transactions History */
            <div className="space-y-3">
              {userTransactions.length === 0 ? (
                <p className="text-center py-8 text-xs text-neutral-400">
                  Hozircha to‘lovlar yoki xarajatlar mavjud emas.
                </p>
              ) : (
                userTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isDeposit
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {tx.serviceName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                            <span>{tx.orderNumber}</span>
                            <span>•</span>
                            <span>{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-black ${
                            isDeposit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-900 dark:text-neutral-200'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}
                          {tx.amount.toLocaleString()} {t.common.currency}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 px-1.5 py-0.2 rounded-full ${
                            tx.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : tx.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {tx.status === 'completed' ? (
                            <CheckCircle className="w-2.5 h-2.5" />
                          ) : tx.status === 'pending' ? (
                            <Clock className="w-2.5 h-2.5" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5" />
                          )}
                          {tx.status === 'completed'
                            ? t.balance.approved
                            : tx.status === 'pending'
                            ? t.balance.pendingApproval
                            : t.balance.rejected}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

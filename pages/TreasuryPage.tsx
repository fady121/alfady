import React, { useMemo, useState, useEffect } from 'react';
// FIX: Import LogEntry type.
import type { Invoice, Transaction, LogEntry, Payment, PaymentMethod } from '../types';
import { TransactionType, PaymentMethod as PaymentMethodEnum } from '../types';
import { TransactionTable } from '../components/TransactionTable';
import { CashIcon, UserGroupIcon, ReceiptRefundIcon, SearchIcon, ArrowCircleDownIcon, ArrowCircleUpIcon, WalletIcon, CreditCardIcon } from '../components/icons/Icons';

interface TreasuryPageProps {
  sales: Invoice[];
  transactions: Transaction[];
  balance: number;
  walletBalances: Record<PaymentMethod, number>;
  applyPayment: (invoiceId: string, payment: Omit<Payment, 'id' | 'date'>, type: 'DEBT' | 'CREDIT') => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  initialView: 'log' | 'debts' | 'credits';
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(dateString));
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: 'كاش',
    E_WALLET: 'محفظة إلكترونية',
    INSTAPAY: 'انستا باي',
    FAWRY: 'فوري',
};


const TreasuryMovementForm: React.FC<{onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void}> = ({ onAdd }) => {
    const [type, setType] = useState<TransactionType.DEPOSIT | TransactionType.EXPENSE>(TransactionType.DEPOSIT);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethodEnum.CASH);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('يرجى إدخال وصف صحيح ومبلغ إيجابي.');
            return;
        }
        
        onAdd({ type, description, amount: parsedAmount, paymentMethod });

        // Reset form
        setDescription('');
        setAmount('');
        setError('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">إضافة حركة للخزنة</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setType(TransactionType.DEPOSIT)} className={`flex items-center justify-center w-full py-2 px-4 rounded-md font-semibold transition-all ${type === TransactionType.DEPOSIT ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <ArrowCircleDownIcon className="me-2" /> إيداع
                    </button>
                    <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex items-center justify-center w-full py-2 px-4 rounded-md font-semibold transition-all ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <ArrowCircleUpIcon className="me-2" /> مصروف
                    </button>
                </div>
                 <div>
                    <label htmlFor="treasury-payment-method" className="block text-sm font-medium text-gray-700">طريقة الدفع/الإيداع</label>
                    <select id="treasury-payment-method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                         {Object.entries(paymentMethodLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="treasury-desc" className="block text-sm font-medium text-gray-700">الوصف</label>
                    <input type="text" id="treasury-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder={type === TransactionType.DEPOSIT ? 'مثال: إيداع رأس مال' : 'مثال: مصاريف كهرباء'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required/>
                </div>
                 <div>
                    <label htmlFor="treasury-amount" className="block text-sm font-medium text-gray-700">المبلغ</label>
                    <input type="number" id="treasury-amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" required/>
                </div>
                <button type="submit" className={`w-full py-2.5 px-4 text-white font-bold rounded-lg shadow-md transition-colors ${type === TransactionType.DEPOSIT ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    تسجيل الحركة
                </button>
            </form>
        </div>
    );
};


export const TreasuryPage: React.FC<TreasuryPageProps> = ({ sales, transactions, balance, walletBalances, applyPayment, addTransaction, initialView }) => {
  const [view, setView] = useState(initialView);
  const [debtSearch, setDebtSearch] = useState('');
  const [creditSearch, setCreditSearch] = useState('');
  const [paymentInputs, setPaymentInputs] = useState<Record<string, { amount: string, method: PaymentMethod }>>({});

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handlePaymentInputChange = (invoiceId: string, field: 'amount' | 'method', value: string) => {
    setPaymentInputs(prev => ({ 
        ...prev, 
        [invoiceId]: {
            ...prev[invoiceId],
            [field]: value
        } 
    }));
  };

  const handleApplyDebtPayment = (invoice: Invoice) => {
    const input = paymentInputs[invoice.id] || { amount: '', method: PaymentMethodEnum.CASH };
    const amount = parseFloat(input.amount);
    if (isNaN(amount) || amount <= 0 || amount > invoice.remainingBalance) {
      alert('الرجاء إدخال مبلغ صحيح لا يتجاوز المتبقي.');
      return;
    }
    applyPayment(invoice.id, { amount, method: input.method }, 'DEBT');
    handlePaymentInputChange(invoice.id, 'amount', ''); // Clear input amount
  };
  
  const handleApplyCreditPayment = (invoice: Invoice) => {
    const input = paymentInputs[invoice.id] || { amount: '', method: PaymentMethodEnum.CASH };
    const amount = parseFloat(input.amount);
    const absoluteBalance = Math.abs(invoice.remainingBalance);
    if (isNaN(amount) || amount <= 0 || amount > absoluteBalance) {
        alert('الرجاء إدخال مبلغ صحيح لا يتجاوز المستحق.');
        return;
    }
    applyPayment(invoice.id, { amount, method: input.method }, 'CREDIT');
    handlePaymentInputChange(invoice.id, 'amount', ''); // Clear input amount
  };

  // FIX: Map sales and transactions to LogEntry to match the TransactionTable's expected prop type.
  const allTransactionsForLog = useMemo<LogEntry[]>(() => {
    const mappedSales: LogEntry[] = sales.map(s => ({ ...s, recordType: 'invoice' }));
    const mappedTransactions: LogEntry[] = transactions.map(t => ({ ...t, recordType: 'general' }));
    return [...mappedSales, ...mappedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, transactions]);

  const customerDebts = useMemo(() => {
    return sales
      .filter(inv => inv.remainingBalance > 0.01)
      .filter(inv => inv.customer.phone.includes(debtSearch.trim()));
  }, [sales, debtSearch]);
  
  const customerCredits = useMemo(() => {
    return sales
      .filter(inv => inv.remainingBalance < -0.01)
      .filter(inv => 
        inv.customer.name.toLowerCase().includes(creditSearch.trim().toLowerCase()) ||
        inv.customer.phone.includes(creditSearch.trim())
      );
  }, [sales, creditSearch]);

  const renderView = () => {
    switch (view) {
      case 'debts':
        return (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-red-100 bg-opacity-50">
              <h3 className="text-lg font-bold text-red-700">متبقي على العميل</h3>
              <div className="mt-4 relative">
                <input 
                  type="text"
                  placeholder="بحث برقم التليفون..."
                  value={debtSearch}
                  onChange={(e) => setDebtSearch(e.target.value)}
                  className="w-full p-2 ps-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <SearchIcon className="text-gray-400"/>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {customerDebts.length > 0 ? (
                customerDebts.map(inv => (
                  <div key={inv.id} className="bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800 text-lg">{inv.customer.name || 'عميل غير مسجل'}</p>
                            <p className="text-sm text-gray-600">{inv.customer.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">{`فاتورة بتاريخ: ${formatDate(inv.date)}`}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-red-800">المتبقي</p>
                            <p className="font-bold text-red-600 text-3xl">{formatCurrency(inv.remainingBalance)}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                        <span>{`اجمالي الفاتورة: ${formatCurrency(inv.netTotal)}`}</span>
                        <span className="mx-2">|</span>
                        <span>{`المدفوع: ${formatCurrency(inv.amountPaid)}`}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input 
                            type="number"
                            placeholder="أدخل مبلغ الدفعة"
                            value={paymentInputs[inv.id]?.amount || ''}
                            onChange={(e) => handlePaymentInputChange(inv.id, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            max={inv.remainingBalance}
                            step="0.01"
                            min="0"
                        />
                        <select 
                            value={paymentInputs[inv.id]?.method || 'CASH'}
                            onChange={(e) => handlePaymentInputChange(inv.id, 'method', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                             {Object.entries(paymentMethodLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button onClick={() => handleApplyDebtPayment(inv)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors whitespace-nowrap">
                            تسجيل دفعة
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">لا توجد ديون مستحقة على العملاء.</p>
              )}
            </div>
          </div>
        );
      case 'credits':
         return (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-green-100 bg-opacity-50">
              <h3 className="text-lg font-bold text-green-700">مستحق للعميل</h3>
               <div className="mt-4 relative">
                <input 
                  type="text"
                  placeholder="بحث بالاسم أو رقم التليفون..."
                  value={creditSearch}
                  onChange={(e) => setCreditSearch(e.target.value)}
                  className="w-full p-2 ps-10 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <SearchIcon className="text-gray-400"/>
                </div>
              </div>
            </div>
             <div className="p-4 space-y-3">
              {customerCredits.length > 0 ? (
                customerCredits.map(inv => (
                   <div key={inv.id} className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800 text-lg">{inv.customer.name}</p>
                            <p className="text-sm text-gray-600">{inv.customer.phone}</p>
                             <p className="text-xs text-gray-500 mt-1">{`فاتورة بتاريخ: ${formatDate(inv.date)}`}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-green-800">المستحق له</p>
                            <p className="font-bold text-green-600 text-3xl">{formatCurrency(Math.abs(inv.remainingBalance))}</p>
                        </div>
                    </div>
                     <div className="text-xs text-gray-600 mt-2">
                        <span>{`اجمالي الفاتورة: ${formatCurrency(inv.netTotal)}`}</span>
                        <span className="mx-2">|</span>
                        <span>{`المدفوع: ${formatCurrency(inv.amountPaid)}`}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input 
                            type="number"
                            placeholder="أدخل مبلغ السداد"
                            value={paymentInputs[inv.id]?.amount || ''}
                            onChange={(e) => handlePaymentInputChange(inv.id, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            max={Math.abs(inv.remainingBalance)}
                            step="0.01"
                            min="0"
                        />
                        <select 
                            value={paymentInputs[inv.id]?.method || 'CASH'}
                            onChange={(e) => handlePaymentInputChange(inv.id, 'method', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                             {Object.entries(paymentMethodLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button onClick={() => handleApplyCreditPayment(inv)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors whitespace-nowrap">
                            سداد دفعة
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">لا توجد مبالغ مستحقة للعملاء.</p>
              )}
            </div>
          </div>
        );
      case 'log':
      default:
        return (
          <TransactionTable 
            transactions={allTransactionsForLog} 
            title="سجل المعاملات الكامل"
            colorClass="bg-gray-100"
          />
        );
    }
  };
  
  const WalletCard: React.FC<{title: string, balance: number, icon: React.ReactNode, color: string}> = ({ title, balance, icon, color }) => (
    <div className={`p-4 rounded-lg shadow-md flex items-center ${color}`}>
        <div className="p-3 rounded-full bg-white bg-opacity-30 mr-4">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-2xl font-bold text-white">{formatCurrency(balance)}</p>
        </div>
    </div>
);


  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800">الخزنة</h2>
        <p className="text-gray-500">عرض الرصيد الحالي وسجل جميع المعاملات وحسابات العملاء.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
                 <h3 className="text-xl font-bold">إجمالي الرصيد النقدي</h3>
                 <p className={`text-5xl font-extrabold mt-2 ${balance >= 0 ? 'text-white' : 'text-yellow-300'}`}>
                    {formatCurrency(balance)}
                 </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <WalletCard title="الكاش" balance={walletBalances.CASH} icon={<CashIcon size={6} className="text-green-800"/>} color="bg-gradient-to-br from-green-500 to-emerald-600" />
                 <WalletCard title="المحفظة" balance={walletBalances.E_WALLET} icon={<WalletIcon size={6} className="text-sky-800"/>} color="bg-gradient-to-br from-sky-500 to-cyan-600" />
                 <WalletCard title="انستا باي" balance={walletBalances.INSTAPAY} icon={<CreditCardIcon size={6} className="text-purple-800"/>} color="bg-gradient-to-br from-purple-500 to-violet-600" />
                 <WalletCard title="فوري" balance={walletBalances.FAWRY} icon={<CreditCardIcon size={6} className="text-amber-800"/>} color="bg-gradient-to-br from-amber-500 to-orange-600" />
            </div>
        </div>
        <TreasuryMovementForm onAdd={addTransaction} />
      </div>


      <div className="grid grid-cols-3 gap-2 md:gap-4 p-2 bg-gray-200 rounded-lg">
        <button onClick={() => setView('log')} className={`flex items-center justify-center p-3 rounded-md font-bold transition-all ${view === 'log' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-white/50'}`}>
          <span className="hidden md:inline">سجل المعاملات</span>
          <span className="md:hidden">السجل</span>
        </button>
         <button onClick={() => setView('debts')} className={`flex items-center justify-center p-3 rounded-md font-bold transition-all ${view === 'debts' ? 'bg-white text-red-600 shadow' : 'bg-transparent text-gray-600 hover:bg-white/50'}`}>
          <UserGroupIcon className="me-2" />
          <span>متبقي على العميل</span>
        </button>
         <button onClick={() => setView('credits')} className={`flex items-center justify-center p-3 rounded-md font-bold transition-all ${view === 'credits' ? 'bg-white text-green-600 shadow' : 'bg-transparent text-gray-600 hover:bg-white/50'}`}>
          <ReceiptRefundIcon className="me-2" />
           <span>مستحق للعميل</span>
        </button>
      </div>

      <div>
        {renderView()}
      </div>

    </div>
  );
};

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Trader, TraderCategory, TraderTransaction } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, SearchIcon } from '../components/icons/Icons';

interface PurchasesPageProps {
  traders: Trader[];
  addTrader: (trader: Omit<Trader, 'id'>) => void;
  updateTrader: (id: string, trader: Omit<Trader, 'id'>) => void;
  deleteTrader: (id: string) => void;
  traderTransactions: TraderTransaction[];
  addTraderTransaction: (transaction: Omit<TraderTransaction, 'id'>) => void;
  updateTraderTransaction: (id: string, transaction: Omit<TraderTransaction, 'id' | 'traderId'>) => void;
  deleteTraderTransaction: (id: string) => void;
  recordToEditId: string | null;
  onDoneEditing: () => void;
}

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(dateString));
};

const formatWeight = (weight: number) => {
    return `${weight.toFixed(3)} جرام`;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const TraderListItem: React.FC<{
    trader: Trader;
    account: any;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ trader, account, isSelected, onSelect, onEdit, onDelete }) => {
    const isGold = trader.category === 'GOLD';
    const cashBalance = account.totalWorkmanshipFee - account.totalCashPayment;
    const balance = isGold ? account.goldBalance : account.silverBalance;
    const isOwedToTrader = balance > 0.001;
    const isOwedByTrader = balance < -0.001;
    const cashOwedToTrader = cashBalance > 0.01;
    const cashOwedByTrader = cashBalance < -0.01;


    const baseClasses = "w-full text-right p-3 rounded-lg cursor-pointer transition-all duration-150 border";
    const selectedClasses = isGold ? 'bg-amber-100 border-amber-400' : 'bg-slate-100 border-slate-400';
    const unselectedClasses = 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300';
    
    const theme = {
        tagBg: isGold ? 'bg-amber-200' : 'bg-slate-200',
        tagText: isGold ? 'text-amber-800' : 'text-slate-800',
    };

    return (
        <div onClick={onSelect} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800">{trader.name}</p>
                    <p className="text-sm text-gray-500">{trader.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${theme.tagBg} ${theme.tagText}`}>
                        {isGold ? 'ذهب' : 'فضة'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"><PencilIcon size={4}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon size={4}/></button>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200/60 text-xs">
                <p className="font-semibold text-gray-600">الرصيد:</p>
                {isGold ? (
                    <div className="flex justify-between items-center mt-1">
                        <span>ذهب: <span className={`font-bold ${isOwedToTrader ? 'text-red-600' : isOwedByTrader ? 'text-green-600' : 'text-gray-800'}`}>
                             {formatWeight(Math.abs(balance))} {isOwedToTrader ? 'علينا' : isOwedByTrader ? 'لهم' : ''}
                        </span></span>
                        <span>نقدية: <span className={`font-bold ${cashOwedToTrader ? 'text-red-600' : cashOwedByTrader ? 'text-green-600' : 'text-gray-800'}`}>
                             {formatCurrency(Math.abs(cashBalance))} {cashOwedToTrader ? 'علينا' : cashOwedByTrader ? 'لهم' : ''}
                        </span></span>
                    </div>
                ) : (
                    <p className={`font-bold mt-1 ${isOwedToTrader ? 'text-red-600' : isOwedByTrader ? 'text-green-600' : 'text-gray-800'}`}>
                       {formatCurrency(Math.abs(balance))} {isOwedToTrader ? 'علينا' : isOwedByTrader ? 'لهم' : ''}
                    </p>
                )}
            </div>
        </div>
    );
};


export const PurchasesPage: React.FC<PurchasesPageProps> = ({
  traders,
  addTrader,
  updateTrader,
  deleteTrader,
  traderTransactions,
  addTraderTransaction,
  updateTraderTransaction,
  deleteTraderTransaction,
  recordToEditId,
  onDoneEditing,
}) => {
    const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
    const [editingTrader, setEditingTrader] = useState<Trader | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TraderCategory>('GOLD');
    
    // Trader Form State
    const [traderName, setTraderName] = useState('');
    const [traderPhone, setTraderPhone] = useState('');
    const [traderCategory, setTraderCategory] = useState<TraderCategory>('GOLD');

    // Transaction Form State
    const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
    const [transDesc, setTransDesc] = useState('');
    const [workWeight, setWorkWeight] = useState('');
    const [scrapWeight, setScrapWeight] = useState('');
    const [workmanshipFee, setWorkmanshipFee] = useState('');
    const [cashPayment, setCashPayment] = useState('');
    const [silverPrice, setSilverPrice] = useState('');
    
    const clearTransactionForm = useCallback(() => {
        setEditingTransactionId(null);
        setTransDate(new Date().toISOString().split('T')[0]);
        setTransDesc('');
        setWorkWeight('');
        setScrapWeight('');
        setWorkmanshipFee('');
        setCashPayment('');
        setSilverPrice('');
    }, []);

    useEffect(() => {
        // When switching categories, if the selected trader is not in the new category, deselect them.
        if (selectedTrader && selectedTrader.category !== selectedCategory) {
            setSelectedTrader(null);
            clearTransactionForm();
        }
    }, [selectedCategory, selectedTrader, clearTransactionForm]);

    const filteredTraders = useMemo(() => {
        return traders
            .filter(trader =>
                trader.category === selectedCategory &&
                (trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trader.phone && trader.phone.includes(searchQuery)))
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [traders, searchQuery, selectedCategory]);


    useEffect(() => {
        if (editingTrader) {
            setTraderName(editingTrader.name);
            setTraderPhone(editingTrader.phone);
            setTraderCategory(editingTrader.category);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setTraderName('');
            setTraderPhone('');
            setTraderCategory('GOLD');
        }
    }, [editingTrader]);

    const handleSaveTrader = (e: React.FormEvent) => {
        e.preventDefault();
        if (!traderName.trim()) return;
        const traderData = {
            name: traderName.trim(),
            phone: traderPhone.trim(),
            category: traderCategory,
        };

        if (editingTrader) {
            updateTrader(editingTrader.id, traderData);
            setEditingTrader(null); // This will trigger the useEffect to clear the form
        } else {
            addTrader(traderData);
            // Clear form manually for new entries
            setTraderName('');
            setTraderPhone('');
        }
    };
    

    const handleSaveTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrader) return;
        
        const transactionData: Omit<TraderTransaction, 'id' | 'traderId'> = {
            date: new Date(`${transDate}T00:00:00`).toISOString(),
            description: transDesc.trim(),
            workWeight: parseFloat(workWeight) || 0,
            scrapWeight: parseFloat(scrapWeight) || 0,
            workmanshipFee: parseFloat(workmanshipFee) || 0,
            cashPayment: parseFloat(cashPayment) || 0,
            silverPricePerGram: selectedTrader.category === 'SILVER' ? (parseFloat(silverPrice) || 0) : undefined,
        };

        if (editingTransactionId) {
            updateTraderTransaction(editingTransactionId, transactionData);
        } else {
            addTraderTransaction({
                ...transactionData,
                traderId: selectedTrader.id,
            });
        }
        
        clearTransactionForm();
    };
    
    const handleStartEditTransaction = useCallback((transaction: TraderTransaction) => {
        setEditingTransactionId(transaction.id);
        setTransDate(new Date(transaction.date).toISOString().split('T')[0]);
        setTransDesc(transaction.description);
        setWorkWeight(String(transaction.workWeight || ''));
        setScrapWeight(String(transaction.scrapWeight || ''));
        setWorkmanshipFee(String(transaction.workmanshipFee || ''));
        setCashPayment(String(transaction.cashPayment || ''));
        setSilverPrice(String(transaction.silverPricePerGram || ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (recordToEditId) {
            const transaction = traderTransactions.find(t => t.id === recordToEditId);
            if (transaction) {
                const trader = traders.find(t => t.id === transaction.traderId);
                if (trader) {
                    setSelectedTrader(trader); // Select the correct trader
                    handleStartEditTransaction(transaction); // Then populate the form
                }
            }
            onDoneEditing(); // Consume the edit request
        }
    }, [recordToEditId, onDoneEditing, traders, traderTransactions, handleStartEditTransaction]);


    const handleDeleteTransaction = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
            deleteTraderTransaction(id);
        }
    };

    const traderAccounts = useMemo(() => {
        const accounts: Record<string, {
            totalWorkWeight: number;
            totalScrapWeight: number;
            totalWorkmanshipFee: number;
            totalCashPayment: number;
            silverBalance: number; // in cash
            goldBalance: number; // in grams
        }> = {};

        traders.forEach(trader => {
            const relatedTransactions = traderTransactions.filter(t => t.traderId === trader.id);
            const account = {
                totalWorkWeight: relatedTransactions.reduce((sum, t) => sum + t.workWeight, 0),
                totalScrapWeight: relatedTransactions.reduce((sum, t) => sum + t.scrapWeight, 0),
                totalWorkmanshipFee: relatedTransactions.reduce((sum, t) => sum + t.workmanshipFee, 0),
                totalCashPayment: relatedTransactions.reduce((sum, t) => sum + t.cashPayment, 0),
                silverBalance: 0,
                goldBalance: 0,
            };

            if (trader.category === 'GOLD') {
                account.goldBalance = account.totalWorkWeight - account.totalScrapWeight;
            } else { // SILVER
                account.silverBalance = relatedTransactions.reduce((balance, t) => {
                    const workValue = t.workWeight * (t.silverPricePerGram || 0);
                    return balance + (workValue + t.workmanshipFee - t.cashPayment);
                }, 0);
            }
            accounts[trader.id] = account;
        });

        return accounts;
    }, [traders, traderTransactions]);

    const selectedTraderTransactions = useMemo(() => {
        if (!selectedTrader) return [];
        return traderTransactions
            .filter(t => t.traderId === selectedTrader.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedTrader, traderTransactions]);
    
    // Real-time calculation for Silver transaction form
    const totalRequiredForSilver = useMemo(() => {
        const workValue = (parseFloat(workWeight) || 0) * (parseFloat(silverPrice) || 0);
        const fee = parseFloat(workmanshipFee) || 0;
        return workValue + fee;
    }, [workWeight, silverPrice, workmanshipFee]);

    const silverTransactionBalance = useMemo(() => {
        return totalRequiredForSilver - (parseFloat(cashPayment) || 0);
    }, [totalRequiredForSilver, cashPayment]);

    const renderTransactionForm = () => {
        if (!selectedTrader) return null;
        const isGoldTrader = selectedTrader.category === 'GOLD';
        const theme = {
            headerBg: isGoldTrader ? 'bg-amber-50' : 'bg-slate-50',
            headerBorder: isGoldTrader ? 'border-amber-200' : 'border-slate-200',
            titleText: isGoldTrader ? 'text-amber-800' : 'text-slate-800',
            highlightText: isGoldTrader ? 'text-amber-600' : 'text-slate-600',
            formSectionBg: isGoldTrader ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200',
            formLabelText: isGoldTrader ? 'text-amber-800' : 'text-slate-800',
            buttonBg: isGoldTrader ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-600 hover:bg-slate-700',
        };
        
        return (
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg space-y-6">
                <div className={`flex justify-between items-center p-4 rounded-t-lg -m-6 mb-0 ${theme.headerBg} border-b ${theme.headerBorder}`}>
                    <div>
                        <h3 className={`text-xl font-bold ${theme.titleText}`}>{editingTransactionId ? 'تعديل معاملة للتاجر:' : 'إضافة معاملة للتاجر:'} <span className={theme.highlightText}>{selectedTrader.name}</span></h3>
                        <p className="text-sm text-gray-500">
                            {isGoldTrader ? 'حسابات الذهب بالجرامات والأجرة بالنقد.' : 'حسابات الفضة بالنقد.'}
                        </p>
                    </div>
                    <button onClick={() => { setSelectedTrader(null); clearTransactionForm(); }} className="text-sm text-gray-600 hover:text-red-600 font-semibold">إغلاق</button>
                </div>
                
                <form onSubmit={handleSaveTransaction} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                            <input type="date" value={transDate} onChange={e => setTransDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700">الوصف</label>
                            <input type="text" value={transDesc} onChange={e => setTransDesc(e.target.value)} placeholder="وصف المعاملة..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                    </div>

                    {isGoldTrader ? (
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 ${theme.formSectionBg} border rounded-lg`}>
                            <div>
                                <label className={`block text-sm font-medium ${theme.formLabelText}`}>وزن الشغل (له)</label>
                                <input type="number" value={workWeight} onChange={e => setWorkWeight(e.target.value)} placeholder="0.000" step="0.001" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme.formLabelText}`}>وزن الكسر (عليه)</label>
                                <input type="number" value={scrapWeight} onChange={e => setScrapWeight(e.target.value)} placeholder="0.000" step="0.001" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme.formLabelText}`}>الأجرة (له)</label>
                                <input type="number" value={workmanshipFee} onChange={e => setWorkmanshipFee(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                    ) : (
                        <div className={`space-y-4 p-4 ${theme.formSectionBg} border rounded-lg`}>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${theme.formLabelText}`}>وزن الشغل</label>
                                    <input type="number" value={workWeight} onChange={e => setWorkWeight(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                 <div>
                                    <label className={`block text-sm font-medium ${theme.formLabelText}`}>سعر الجرام</label>
                                    <input type="number" value={silverPrice} onChange={e => setSilverPrice(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme.formLabelText}`}>الأجرة (إن وجدت)</label>
                                    <input type="number" value={workmanshipFee} onChange={e => setWorkmanshipFee(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                           </div>
                           <div className="bg-blue-50 p-3 rounded-md text-center border border-blue-200">
                                <p className="text-sm text-gray-600">إجمالي القيمة المطلوبة (شغل + أجرة)</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRequiredForSilver)}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700">دفعة نقدية (عليه)</label>
                         <input type="number" value={cashPayment} onChange={e => setCashPayment(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                         <p className="text-xs text-gray-500 mt-1">هذه الدفعة سيتم تسجيلها كمصروف في الخزنة تلقائياً.</p>
                    </div>

                    {!isGoldTrader && (
                        <div className="bg-gray-100 p-3 rounded-md text-center">
                            <p className="text-sm text-gray-600">الرصيد المتبقي (لهذه المعاملة)</p>
                            <p className={`text-2xl font-bold ${silverTransactionBalance > 0 ? 'text-red-600' : silverTransactionBalance < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                {formatCurrency(Math.abs(silverTransactionBalance))} {silverTransactionBalance > 0 ? 'علينا' : silverTransactionBalance < 0 ? 'لهم' : ''}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                        <button type="submit" className={`w-full flex justify-center items-center text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition-all ${theme.buttonBg}`}>
                            <PlusIcon />
                            <span className="ms-2 font-semibold">{editingTransactionId ? 'تحديث المعاملة' : 'إضافة المعاملة'}</span>
                        </button>
                        {editingTransactionId && (
                            <button type="button" onClick={clearTransactionForm} className="w-full flex justify-center items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition-colors">
                                إلغاء التعديل
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800">إدارة المشتريات والتجار</h2>
                <p className="text-gray-500">إضافة التجار ومتابعة حساباتهم.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg self-start space-y-6">
                    {/* Add/Edit Trader Form */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{editingTrader ? 'تعديل بيانات التاجر' : 'إضافة تاجر جديد'}</h3>
                        <form onSubmit={handleSaveTrader} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">اسم التاجر</label>
                                <input type="text" value={traderName} onChange={e => setTraderName(e.target.value)} placeholder="اسم التاجر" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">رقم التليفون</label>
                                <input type="tel" value={traderPhone} onChange={e => setTraderPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">التصنيف</label>
                                <select value={traderCategory} onChange={e => setTraderCategory(e.target.value as TraderCategory)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="GOLD">تاجر ذهب</option>
                                    <option value="SILVER">تاجر فضة</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <button type="submit" className="w-full flex justify-center items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">
                                    <PlusIcon />
                                    <span className="ms-2">{editingTrader ? 'تحديث التاجر' : 'إضافة تاجر'}</span>
                                </button>
                                {editingTrader && (
                                    <button type="button" onClick={() => setEditingTrader(null)} className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600">
                                        إلغاء
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Traders Lists */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">قائمة التجار</h3>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setSelectedCategory('GOLD')}
                                className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                                    selectedCategory === 'GOLD'
                                        ? 'bg-amber-500 text-white shadow'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                تجار الذهب
                            </button>
                            <button
                                onClick={() => setSelectedCategory('SILVER')}
                                className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                                    selectedCategory === 'SILVER'
                                        ? 'bg-slate-500 text-white shadow'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                تجار الفضة
                            </button>
                        </div>
                        
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="ابحث بالاسم أو رقم التليفون..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full p-2 ps-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <SearchIcon className="text-gray-400"/>
                            </div>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                             {filteredTraders.length > 0 ? filteredTraders.map(trader => (
                                <TraderListItem 
                                    key={trader.id}
                                    trader={trader}
                                    account={traderAccounts[trader.id]}
                                    isSelected={selectedTrader?.id === trader.id}
                                    onSelect={() => { setSelectedTrader(trader); clearTransactionForm(); }}
                                    onEdit={() => setEditingTrader(trader)}
                                    onDelete={() => deleteTrader(trader.id)}
                                />
                            )) : <p className="text-center text-gray-500 py-4">لا يوجد تجار مطابقون للبحث.</p>}
                        </div>
                    </div>
                </div>
                
                {selectedTrader ? renderTransactionForm() : (
                    <div className="lg:col-span-3 bg-gray-50 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h3 className="text-xl font-bold text-gray-700">اختر تاجرًا</h3>
                        <p className="text-gray-500 mt-2">اختر تاجرًا من القائمة لعرض أو إضافة معاملاته.</p>
                    </div>
                )}
            </div>

            {selectedTrader && (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden mt-6">
                     <div className={`p-4 border-b ${selectedTrader.category === 'GOLD' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <h3 className={`text-lg font-bold ${selectedTrader.category === 'GOLD' ? 'text-amber-800' : 'text-slate-800'}`}>سجل معاملات: {selectedTrader.name}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        {selectedTraderTransactions.length > 0 ? (
                            <table className="w-full text-sm text-right text-gray-600">
                                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">التاريخ</th>
                                        <th scope="col" className="px-6 py-3">الوصف</th>
                                        <th scope="col" className="px-6 py-3">شغل (له)</th>
                                        {selectedTrader.category === 'SILVER' && <th scope="col" className="px-6 py-3">سعر الجرام</th>}
                                        {selectedTrader.category === 'GOLD' && <th scope="col" className="px-6 py-3">كسر (عليه)</th>}
                                        <th scope="col" className="px-6 py-3">أجرة (له)</th>
                                        <th scope="col" className="px-6 py-3">مدفوع نقدي (عليه)</th>
                                        <th scope="col" className="px-6 py-3">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTraderTransactions.map(t => (
                                        <tr key={t.id} className="bg-white border-b hover:bg-gray-50/70">
                                            <td className="px-6 py-4">{formatDate(t.date)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{t.description}</td>
                                            <td className="px-6 py-4 text-green-600 font-semibold">{t.workWeight > 0 ? formatWeight(t.workWeight) : '-'}</td>
                                            {selectedTrader.category === 'SILVER' && <td className="px-6 py-4">{t.silverPricePerGram ? formatCurrency(t.silverPricePerGram) : '-'}</td>}
                                            {selectedTrader.category === 'GOLD' && <td className="px-6 py-4 text-red-600 font-semibold">{t.scrapWeight > 0 ? formatWeight(t.scrapWeight) : '-'}</td>}
                                            <td className="px-6 py-4 text-blue-600 font-semibold">{t.workmanshipFee > 0 ? formatCurrency(t.workmanshipFee) : '-'}</td>
                                            <td className="px-6 py-4 text-red-600 font-semibold">{t.cashPayment > 0 ? formatCurrency(t.cashPayment) : '-'}</td>
                                            <td className="px-6 py-4 flex items-center space-s-2">
                                                <button onClick={() => handleStartEditTransaction(t)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors">
                                                    <PencilIcon />
                                                </button>
                                                <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 p-8">لا توجد معاملات لهذا التاجر.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Transaction, InvoiceItem, SaleType, ProductCategory, Karat, WorkmanshipType, Invoice, SaleChannel, Payment, PaymentMethod } from '../types';
import { TransactionType, PaymentMethod as PaymentMethodEnum } from '../types';
import { TransactionTable } from '../components/TransactionTable';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon, WhatsAppIcon, SearchIcon, CreditCardIcon, WalletIcon } from '../components/icons/Icons';

interface SalesPageProps {
  sales: Invoice[];
  addSale: (invoice: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance'>) => void;
  updateSale: (id: string, invoice: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance'>) => void;
  deleteSale: (id: string, type: TransactionType | 'invoice') => void;
  onInvoiceClick: (invoice: Invoice) => void;
  recordToEditId: string | null;
  onDoneEditing: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: 'كاش',
    E_WALLET: 'محفظة إلكترونية',
    INSTAPAY: 'انستا باي',
    FAWRY: 'فوري',
};

const sendInvoiceWhatsApp = (
    customerPhone: string,
    netInvoiceTotal: number,
    paymentAmount: number,
    remainingBalance: number,
    items: InvoiceItem[]
) => {
    if (!customerPhone || customerPhone.length !== 11) {
        alert('يرجى إدخال رقم هاتف صحيح مكون من 11 رقمًا.');
        return;
    }
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const roundedBalance = Math.round(remainingBalance);
    const balanceText = roundedBalance > 0
        ? `*المبلغ المتبقي: ${formatCurrency(roundedBalance)}*`
        : roundedBalance < 0
        ? `*المبلغ المستحق لكم: ${formatCurrency(Math.abs(roundedBalance))}*`
        : `*الرصيد: ${formatCurrency(0)}*`;
    
    const itemsText = items.map(item => {
        const type = item.saleType === 'SELL' ? 'بيع' : 'شراء';
        const category = item.category === 'GOLD' ? `ذهب ${item.karat}` : 'فضة';
        const desc = item.description ? `(${item.description})` : '';
        return `- *${type}*: ${category} ${desc} - وزن: ${item.weight.toFixed(2)} جم - إجمالي: ${formatCurrency(item.total)}`;
    }).join('\n');


    const message = `
*فاتورة من الفادي للمجوهرات*
--------------------
*تفاصيل الفاتورة:*
${itemsText}
--------------------
*ملخص:*
- إجمالي وزن القطع: ${totalWeight.toFixed(2)} جرام
- صافي الفاتورة: ${formatCurrency(netInvoiceTotal)}
- المبلغ المدفوع: ${formatCurrency(paymentAmount)}
${balanceText}
--------------------
شكراً لك!
`.trim().replace(/\n\s*\n/g, '\n');

    const whatsappUrl = `https://wa.me/2${customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};


export const SalesPage: React.FC<SalesPageProps> = ({ sales, addSale, updateSale, deleteSale, onInvoiceClick, recordToEditId, onDoneEditing }) => {
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [currentPayments, setCurrentPayments] = useState<Payment[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state for item
    const [saleType, setSaleType] = useState<SaleType>('SELL');
    const [category, setCategory] = useState<ProductCategory>('GOLD');
    const [karat, setKarat] = useState<Karat>(21);
    const [weight, setWeight] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerGram, setPricePerGram] = useState('');
    const [workmanshipType, setWorkmanshipType] = useState<WorkmanshipType>('PER_GRAM');
    const [workmanshipValue, setWorkmanshipValue] = useState('');
    const [discount, setDiscount] = useState('');
    const [cashBack, setCashBack] = useState('');

    // Form state for invoice details
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [saleChannel, setSaleChannel] = useState<SaleChannel>('STORE');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [shipping, setShipping] = useState('');
    const [notes, setNotes] = useState('');
    
    // Payment form state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethodEnum.CASH);
    const [paymentAmount, setPaymentAmount] = useState('');

    const itemTotal = useMemo(() => {
        const numWeight = parseFloat(weight) || 0;
        const numPricePerGram = parseFloat(pricePerGram) || 0;
        if (numWeight <= 0) return 0;

        if (saleType === 'BUY_BACK') {
            if (category === 'GOLD' && karat === 24) {
                const numCashBack = parseFloat(cashBack) || 0;
                const effectivePrice = numPricePerGram + numCashBack;
                return numWeight * effectivePrice;
            } else {
                const basePrice = numWeight * numPricePerGram;
                const numDiscount = parseFloat(discount) || 0;
                const discountAmount = basePrice * (numDiscount / 100);
                return basePrice - discountAmount;
            }
        }

        // SaleType === 'SELL' logic remains the same
        const basePrice = numWeight * numPricePerGram;
        const numWorkmanshipValue = parseFloat(workmanshipValue) || 0;
        const workmanshipCost = workmanshipType === 'PER_GRAM' 
            ? numWeight * numWorkmanshipValue
            : numWorkmanshipValue;
        return basePrice + workmanshipCost;

    }, [weight, pricePerGram, workmanshipType, workmanshipValue, saleType, discount, category, karat, cashBack]);

    const salesTotalInInvoice = useMemo(() => invoiceItems.filter(i => i.saleType === 'SELL').reduce((sum, item) => sum + item.total, 0), [invoiceItems]);
    const purchasesTotalInInvoice = useMemo(() => invoiceItems.filter(i => i.saleType === 'BUY_BACK').reduce((sum, item) => sum + item.total, 0), [invoiceItems]);
    const shippingCost = useMemo(() => saleChannel === 'ONLINE' ? (parseFloat(shipping) || 0) : 0, [shipping, saleChannel]);
    const netInvoiceTotal = useMemo(() => salesTotalInInvoice - purchasesTotalInInvoice + shippingCost, [salesTotalInInvoice, purchasesTotalInInvoice, shippingCost]);
    
    const totalPaidOnInvoice = useMemo(() => currentPayments.reduce((sum, p) => sum + p.amount, 0), [currentPayments]);

    const isCreditToCustomer = useMemo(() => netInvoiceTotal < 0, [netInvoiceTotal]);

    const remainingBalance = useMemo(() => netInvoiceTotal - totalPaidOnInvoice, [netInvoiceTotal, totalPaidOnInvoice]);


    const balanceDisplay = useMemo(() => {
        const roundedBalance = Math.round(remainingBalance);
    
        if (roundedBalance > 0) {
            return {
                label: 'المتبقي على العميل',
                value: formatCurrency(roundedBalance),
                containerClass: 'bg-red-50',
                labelClass: 'text-red-800',
                valueClass: 'text-red-600',
            };
        } else if (roundedBalance < 0) {
            return {
                label: 'مستحق للعميل',
                value: formatCurrency(Math.abs(roundedBalance)),
                containerClass: 'bg-blue-50',
                labelClass: 'text-blue-800',
                valueClass: 'text-blue-600',
            };
        } else {
            return {
                label: 'الرصيد',
                value: formatCurrency(0),
                containerClass: 'bg-gray-100',
                labelClass: 'text-gray-800',
                valueClass: 'text-gray-900',
            };
        }
    }, [remainingBalance]);

    const clearForm = useCallback(() => {
        setWeight('');
        setDescription('');
        setPricePerGram('');
        setWorkmanshipValue('');
        setDiscount('');
        setCashBack('');
        setEditingItemId(null);
    }, []);

    const resetInvoice = useCallback(() => {
        setInvoiceItems([]);
        setCurrentPayments([]);
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setSaleChannel('STORE');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setShipping('');
        setNotes('');
        setPaymentAmount('');
        clearForm();
        setEditingInvoiceId(null);
    }, [clearForm]);

    const handleStartEdit = useCallback((invoiceId: string) => {
        const invoiceToEdit = sales.find(inv => inv.id === invoiceId);
        if (!invoiceToEdit) return;
    
        setEditingInvoiceId(invoiceId);
    
        // Populate form with invoice data
        setInvoiceItems(invoiceToEdit.items);
        setCurrentPayments(invoiceToEdit.payments || []);
        setInvoiceDate(new Date(invoiceToEdit.date).toISOString().split('T')[0]);
        setSaleChannel(invoiceToEdit.channel);
        setCustomerName(invoiceToEdit.customer.name);
        setCustomerPhone(invoiceToEdit.customer.phone);
        setCustomerAddress(invoiceToEdit.customer.address);
        setShipping(String(invoiceToEdit.shipping));
        setNotes(invoiceToEdit.notes);
        
        clearForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [sales, clearForm]);

    useEffect(() => {
        if (recordToEditId) {
            const saleExists = sales.some(s => s.id === recordToEditId);
            if (saleExists) {
                handleStartEdit(recordToEditId);
                onDoneEditing(); // Consume the edit request
            }
        }
    }, [recordToEditId, onDoneEditing, sales, handleStartEdit]);


    const handleEditItem = useCallback((item: InvoiceItem) => {
        setEditingItemId(item.id);
        setSaleType(item.saleType);
        setCategory(item.category);
        setKarat(item.karat ?? 21);
        setWeight(String(item.weight));
        setDescription(item.description ?? '');
        setPricePerGram(String(item.pricePerGram));
        setWorkmanshipType(item.workmanshipType ?? 'PER_GRAM');
        setWorkmanshipValue(String(item.workmanshipValue ?? ''));
        setDiscount(String(item.discountPercentage ?? ''));
        setCashBack(String(item.cashBackPerGram ?? ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleGenerateDescription = async () => {
        if (!weight || !category) {
            alert("يرجى إدخال الوزن وتصنيف المنتج أولاً.");
            return;
        }
        setIsGenerating(true);
        try {
            const prompt = `اكتب وصفاً موجزاً وأنيقاً لقطعة مجوهرات ليتم استخدامها في فاتورة. القطعة هي ${category === 'GOLD' ? `ذهب عيار ${karat}` : 'فضة'} بوزن ${weight} جرام. اجعل الوصف باللغة العربية.`;
            
            const response = await fetch('/api/ask-gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to get response from server");
            }
    
            setDescription(data.response);
        } catch (error) {
            console.error("Error generating description:", error);
            alert("فشل إنشاء الوصف. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (itemTotal <= 0) return;

        const sharedData = {
            saleType,
            category,
            karat: category === 'GOLD' ? karat : null,
            weight: parseFloat(weight),
            description: description.trim(),
            pricePerGram: parseFloat(pricePerGram),
            total: itemTotal,
            workmanshipType: saleType === 'SELL' ? workmanshipType : undefined,
            workmanshipValue: saleType === 'SELL' ? (parseFloat(workmanshipValue) || undefined) : undefined,
            discountPercentage: saleType === 'BUY_BACK' && !(category === 'GOLD' && karat === 24) ? (parseFloat(discount) || undefined) : undefined,
            cashBackPerGram: saleType === 'BUY_BACK' && category === 'GOLD' && karat === 24 ? (parseFloat(cashBack) || undefined) : undefined,
        };

        if (editingItemId) {
            setInvoiceItems(items => items.map(item => item.id === editingItemId ? { ...item, ...sharedData } : item));
        } else {
            setInvoiceItems(prev => [...prev, { id: crypto.randomUUID(), ...sharedData }]);
        }
        clearForm();
    };
    
    const handleDeleteItem = (id: string) => {
        setInvoiceItems(items => items.filter(item => item.id !== id));
    };

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        const newPayment: Payment = {
            id: crypto.randomUUID(),
            method: paymentMethod,
            amount: isCreditToCustomer ? -amount : amount,
            date: new Date().toISOString(),
        };
        setCurrentPayments(prev => [...prev, newPayment]);
        setPaymentAmount('');
    };

    const handleDeletePayment = (id: string) => {
        setCurrentPayments(prev => prev.filter(p => p.id !== id));
    };

    const handleSaveInvoice = () => {
        if (invoiceItems.length === 0) return;

        const generatedDescription = invoiceItems.map(item => item.description || `${item.category === 'GOLD' ? `ذهب ${item.karat}` : 'فضة'} - ${item.weight} جرام`).join('، ');

        const invoiceData: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance'> = {
            type: TransactionType.SALE,
            date: new Date(`${invoiceDate}T00:00:00`).toISOString(),
            description: generatedDescription,
            amount: netInvoiceTotal,
            items: invoiceItems,
            payments: currentPayments,
            customer: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
            },
            channel: saleChannel,
            shipping: shippingCost,
            notes: notes,
            netTotal: netInvoiceTotal,
        };
        
        if (editingInvoiceId) {
            updateSale(editingInvoiceId, invoiceData);
        } else {
            addSale(invoiceData);
        }

        // Send WhatsApp if phone number is valid
        if (customerPhone && customerPhone.trim().length === 11) {
            sendInvoiceWhatsApp(
                customerPhone.trim(),
                netInvoiceTotal,
                totalPaidOnInvoice,
                remainingBalance,
                invoiceItems
            );
        }

        resetInvoice();
    };
    
    const isPhoneValid = customerPhone.trim().length === 11;

    const filteredSales = useMemo(() => {
        if (!searchQuery.trim()) {
            return sales;
        }

        const lowerCaseQuery = searchQuery.toLowerCase().trim();

        return sales.filter(inv =>
            inv.customer.name.toLowerCase().includes(lowerCaseQuery) ||
            inv.customer.phone.includes(lowerCaseQuery)
        );
    }, [sales, searchQuery]);

    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{editingInvoiceId ? 'تعديل فاتورة' : 'إنشاء فاتورة'}</h2>
            <p className="text-gray-500">إدارة فواتير بيع أو شراء الذهب/الفضة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Item Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg self-start">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{editingItemId ? 'تعديل القطعة' : 'إضافة قطعة للفاتورة'}</h3>
            <form onSubmit={handleSubmitItem} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع العملية</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setSaleType('SELL')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${saleType === 'SELL' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>بيع</button>
                        <button type="button" onClick={() => setSaleType('BUY_BACK')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${saleType === 'BUY_BACK' ? 'bg-orange-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>شراء ذهب (مستعمل)</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">تصنيف المنتج</label>
                    <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="GOLD">ذهب</option>
                        <option value="SILVER">فضة</option>
                    </select>
                </div>
                {category === 'GOLD' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">العيار</label>
                        <select value={karat} onChange={e => setKarat(Number(e.target.value) as Karat)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="24">24</option>
                            <option value="21">21</option>
                            <option value="18">18</option>
                        </select>
                    </div>
                )}
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">الوزن (جرام)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">سعر الجرام</label>
                        <input type="number" value={pricePerGram} onChange={e => setPricePerGram(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">الوصف</label>
                    <div className="flex items-center space-s-2 mt-1">
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="وصف القطعة..." className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
                            <SparklesIcon />
                        </button>
                    </div>
                </div>
                {saleType === 'SELL' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">المصنعية</label>
                        <div className="flex mt-1">
                            <select value={workmanshipType} onChange={e => setWorkmanshipType(e.target.value as WorkmanshipType)} className="w-1/2 px-3 py-2 border border-gray-300 rounded-s-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="PER_GRAM">بالجرام</option>
                                <option value="PER_PIECE">بالقطعة</option>
                            </select>
                            <input type="number" value={workmanshipValue} onChange={e => setWorkmanshipValue(e.target.value)} placeholder="0.00" className="w-1/2 px-3 py-2 border border-s-0 border-gray-300 rounded-e-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" />
                        </div>
                    </div>
                ) : (
                    <>
                        {category === 'GOLD' && karat === 24 ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">كاش باك (يضاف لسعر الجرام)</label>
                                <input type="number" value={cashBack} onChange={e => setCashBack(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" step="0.01" min="0" />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الخصم (%)</label>
                                 <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" step="0.1" min="0" />
                            </div>
                        )}
                    </>
                )}
                
                 <div className="bg-gray-100 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">إجمالي سعر القطعة</p>
                    <p className={`text-2xl font-bold ${saleType === 'SELL' ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(itemTotal)}</p>
                </div>
                <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                    <PlusIcon />
                    <span className="ms-2">{editingItemId ? 'تحديث القطعة' : 'إضافة للفاتورة'}</span>
                </button>
                 {editingItemId && <button type="button" onClick={clearForm} className="w-full text-center mt-2 text-sm text-gray-600 hover:text-gray-800">إلغاء التعديل</button>}
            </form>
        </div>

        {/* Invoice Preview & Details */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg space-y-6">
             <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">الفاتورة الحالية</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {invoiceItems.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">الفاتورة فارغة.</p>
                    ) : (
                        invoiceItems.map(item => (
                            <div key={item.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className={`font-bold ${item.saleType === 'SELL' ? 'text-gray-800' : 'text-orange-700'}`}>{item.category === 'GOLD' ? `ذهب عيار ${item.karat}` : 'فضة'} ({item.saleType === 'SELL' ? 'بيع' : 'شراء'})</p>
                                    <p className="text-sm text-gray-600">{item.weight} جرام</p>
                                    {item.description && <p className="text-xs text-gray-500 mt-1 italic">"{item.description}"</p>}
                                </div>
                                <div className="text-left">
                                    <p className={`font-semibold ${item.saleType === 'SELL' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.total)}</p>
                                    <div className="flex items-center space-s-2 mt-1">
                                        <button onClick={() => handleEditItem(item)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"><PencilIcon/></button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>

            {invoiceItems.length > 0 && (
            <div className="space-y-6 border-t pt-4">
                {/* Invoice Details Form */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">تفاصيل الفاتورة والعميل</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">تاريخ الفاتورة</label>
                            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">قناة البيع</label>
                            <select value={saleChannel} onChange={e => setSaleChannel(e.target.value as SaleChannel)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="STORE">في المحل</option>
                                <option value="ONLINE">أون لاين</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">اسم العميل</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="اسم العميل" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">رقم تليفون العميل</label>
                            <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="01xxxxxxxxx" pattern="\\d{11}" title="يجب أن يتكون الرقم من 11 رقمًا" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">العنوان</label>
                        <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="عنوان العميل" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    {saleChannel === 'ONLINE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">مصاريف الشحن</label>
                            <input type="number" value={shipping} onChange={e => setShipping(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ملاحظات</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                </div>

                {/* Payments Section */}
                <div className="space-y-4 pt-4 border-t">
                     <h3 className="text-xl font-bold text-gray-800 border-b pb-2">المدفوعات</h3>
                     <div className="space-y-2 text-lg">
                        <div className="flex justify-between items-center"><span className="font-medium text-gray-600">إجمالي المبيعات:</span> <span className="font-bold text-green-600">{formatCurrency(salesTotalInInvoice)}</span></div>
                        <div className="flex justify-between items-center"><span className="font-medium text-gray-600">إجمالي المشتريات (مستعمل):</span> <span className="font-bold text-red-600">-{formatCurrency(purchasesTotalInInvoice)}</span></div>
                        {saleChannel === 'ONLINE' && <div className="flex justify-between items-center"><span className="font-medium text-gray-600">مصاريف الشحن:</span> <span className="font-bold text-gray-700">{formatCurrency(shippingCost)}</span></div>}
                        <div className="flex justify-between items-center text-3xl font-bold border-t pt-2 mt-2"><span className="">صافي الفاتورة:</span> <span className="text-blue-700">{formatCurrency(netInvoiceTotal)}</span></div>
                     </div>
                     
                     <div className="space-y-4">
                        <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                    {Object.entries(paymentMethodLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">{isCreditToCustomer ? 'المبلغ المدفوع للعميل' : 'المدفوع من العميل'}</label>
                                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                            <button type="submit" className="md:col-span-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">إضافة دفعة</button>
                        </form>
                        
                        {currentPayments.length > 0 && (
                            <div className="space-y-2">
                                {currentPayments.map(p => (
                                    <div key={p.id} className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">{paymentMethodLabels[p.method]}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-lg ${p.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(p.amount)}</span>
                                            <button onClick={() => handleDeletePayment(p.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon size={4}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4 border-t">
                        <div className="bg-green-50 p-3 rounded-md text-center">
                            <p className="text-sm font-medium text-green-800">إجمالي المدفوع</p>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaidOnInvoice)}</p>
                        </div>
                         <div className={`${balanceDisplay.containerClass} p-3 rounded-md text-center`}>
                            <p className={`text-sm font-medium ${balanceDisplay.labelClass}`}>{balanceDisplay.label}</p>
                            <p className={`text-3xl font-bold ${balanceDisplay.valueClass}`}>{balanceDisplay.value}</p>
                        </div>
                     </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <button onClick={handleSaveInvoice} className={`w-full flex items-center justify-center px-4 py-3 rounded-lg shadow text-lg font-bold transition-colors ${isPhoneValid ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {isPhoneValid && <WhatsAppIcon size={5} className="me-2" />}
                        {editingInvoiceId ? 'تحديث الفاتورة' : (isPhoneValid ? 'حفظ وإرسال الفاتورة' : 'حفظ الفاتورة')}
                    </button>
                    {editingInvoiceId && (
                         <button onClick={resetInvoice} className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg shadow hover:bg-gray-600 transition-colors text-lg font-bold">
                            إلغاء التعديل
                         </button>
                    )}
                </div>
            </div>
            )}
        </div>
      </div>
      
      <TransactionTable 
        transactions={filteredSales.map(s => ({...s, recordType: 'invoice'}))} 
        onDelete={(id, type) => deleteSale(id, 'invoice')}
        onEdit={(id) => handleStartEdit(id)}
        title="سجل الفواتير المحفوظة"
        colorClass="bg-green-100"
        onRowClick={(item) => {
            // FIX: Changed check from 'items' in item to item.recordType === 'invoice' for consistency
            // and better type safety after updating TransactionTable's onRowClick prop type.
            if (item.recordType === 'invoice') {
                onInvoiceClick(item);
            }
        }}
        headerActions={
            <div className="relative">
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 p-2 ps-10 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <SearchIcon className="text-gray-400"/>
                </div>
            </div>
        }
      />

    </div>
  );
};

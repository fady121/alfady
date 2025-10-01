

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SalesPage } from './pages/SalesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TreasuryPage } from './pages/TreasuryPage';
import { LoginPage } from './pages/LoginPage';
import { useLocalStorage } from './hooks/useLocalStorage';
// FIX: Import PaymentMethod as a value for enum access, and remove it from type-only import.
import type { Page, Transaction, Invoice, SalesSummary, Trader, TraderTransaction, PurchasesSummary, LogEntry, RecordType, TraderTransactionWithDetails, TraderCategory, InvoiceItem, Karat, Payment } from './types';
import { TransactionType, PaymentMethod } from './types';

// Declare external libraries loaded via CDN
declare var XLSX: any;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [activePage, setActivePage] = useState<Page>('home');
  const [sales, setSales] = useLocalStorage<Invoice[]>('sales', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [traders, setTraders] = useLocalStorage<Trader[]>('traders', []);
  const [traderTransactions, setTraderTransactions] = useLocalStorage<TraderTransaction[]>('traderTransactions', []);
  const [treasuryInitialView, setTreasuryInitialView] = useState<'log' | 'debts' | 'credits'>('log');
  const [recordToEditId, setRecordToEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      setIsLoggedIn(false);
    }
  };

  // FIX: Updated function signature to be more specific, allowing for correct type narrowing.
  // This resolves an issue where the compiler couldn't infer all properties of an Invoice.
  const addRecord = (record: Omit<Invoice, 'id'> | Omit<Transaction, 'id' | 'date'>) => {
    if ('items' in record) { // It's an Invoice
        // FIX: Explicitly typed the 'sum' accumulator to resolve potential type inference issues.
        const amountPaid = record.payments.reduce((sum: number, p) => sum + p.amount, 0);
        const remainingBalance = record.netTotal - amountPaid;
        const newSale: Invoice = {
            ...record,
            id: crypto.randomUUID(),
            amountPaid,
            remainingBalance,
        };
        setSales(prev => [newSale, ...prev]);
    } else { // It's a simple Transaction
        const newTransaction: Transaction = {
            ...record,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const addTrader = (traderInfo: Omit<Trader, 'id'>) => {
    const newTrader: Trader = {
        ...traderInfo,
        id: crypto.randomUUID(),
    };
    setTraders(prev => [newTrader, ...prev]);
  };

  const updateTrader = (id: string, updatedData: Omit<Trader, 'id'>) => {
    setTraders(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTrader = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التاجر وكل معاملاته؟ لا يمكن التراجع عن هذه العملية.')) {
        setTraders(prev => prev.filter(t => t.id !== id));
        setTraderTransactions(prev => prev.filter(t => t.traderId !== id));
    }
  };
  
  const addTraderTransaction = (traderTransaction: Omit<TraderTransaction, 'id'>) => {
    const newTransaction: TraderTransaction = {
      ...traderTransaction,
      id: crypto.randomUUID(),
    };
    setTraderTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTraderTransaction = (id: string, updatedData: Omit<TraderTransaction, 'id' | 'traderId'>) => {
    setTraderTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTraderTransaction = (id: string) => {
      setTraderTransactions(prev => prev.filter(t => t.id !== id));
  };


  const updateInvoice = (id: string, updatedInvoiceData: Omit<Invoice, 'id'>) => {
      // FIX: Explicitly typed the 'sum' accumulator to resolve potential type inference issues.
      const amountPaid = updatedInvoiceData.payments.reduce((sum: number, p) => sum + p.amount, 0);
      const remainingBalance = updatedInvoiceData.netTotal - amountPaid;

      setSales(prevSales =>
          prevSales.map(inv =>
              inv.id === id ? { ...updatedInvoiceData, id: id, amountPaid, remainingBalance } : inv
          )
      );
  };

  const deleteRecord = (id: string, recordType: RecordType | TransactionType) => {
    if (recordType === 'invoice' || recordType === TransactionType.SALE) {
        setSales(prev => prev.filter(s => s.id !== id));
    } else if (recordType === 'traderTransaction') {
        setTraderTransactions(prev => prev.filter(t => t.id !== id));
    } else { // general or other TransactionType
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleStartEdit = (id: string, type: RecordType) => {
    if (type === 'invoice') {
        setRecordToEditId(id);
        setActivePage('sales');
    } else if (type === 'traderTransaction') {
        setRecordToEditId(id);
        setActivePage('purchases');
    }
    // No edit for 'general' for now.
  };

  const clearEditState = () => {
      setRecordToEditId(null);
  };

  const applyPayment = (invoiceId: string, payment: Omit<Payment, 'id' | 'date'>, type: 'DEBT' | 'CREDIT') => {
    const updatedSales = sales.map(inv => {
      if (inv.id === invoiceId) {
        // For credit payments, we are paying the customer, so the amount is an outflow (negative)
        const paymentAmount = type === 'DEBT' ? payment.amount : -payment.amount;

        const newPayment: Payment = {
          ...payment,
          amount: paymentAmount,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        };

        const updatedPayments = [...(inv.payments || []), newPayment];
        // FIX: Explicitly typed the 'sum' accumulator to resolve potential type inference issues.
        const newAmountPaid = updatedPayments.reduce((sum: number, p) => sum + p.amount, 0);

        return {
          ...inv,
          payments: updatedPayments,
          amountPaid: newAmountPaid,
          remainingBalance: inv.netTotal - newAmountPaid,
        };
      }
      return inv;
    });
    setSales(updatedSales);
  };


  const navigateToTreasuryForInvoice = (invoice: Invoice) => {
    if (invoice.remainingBalance > 0.01) {
      setTreasuryInitialView('debts');
      setActivePage('treasury');
    } else if (invoice.remainingBalance < -0.01) {
      setTreasuryInitialView('credits');
      setActivePage('treasury');
    }
  };

  useEffect(() => {
    if (activePage !== 'treasury') {
        setTreasuryInitialView('log');
    }
  }, [activePage]);
  
  const allTransactionsForLog = useMemo<LogEntry[]>(() => {
    const mappedSales: (Invoice & { recordType: 'invoice' })[] = sales.map(s => ({ ...s, recordType: 'invoice' }));
    
    const mappedTransactions: (Transaction & { recordType: 'general' })[] = transactions.map(t => ({ ...t, recordType: 'general' }));

    const traderIdToTraderMap = new Map(traders.map(t => [t.id, { name: t.name, category: t.category }]));
    
    const mappedTraderTransactions: (TraderTransactionWithDetails & { recordType: 'traderTransaction' })[] = traderTransactions.map(tt => {
        const trader = traderIdToTraderMap.get(tt.traderId);
        return {
            ...tt,
            traderName: trader?.name || 'تاجر محذوف',
            traderCategory: trader?.category || 'GOLD',
            recordType: 'traderTransaction'
        };
    });

    const combined = [...mappedSales, ...mappedTransactions, ...mappedTraderTransactions];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, transactions, traders, traderTransactions]);
  
  // New definitions for HomePage stat cards
  const totalSalesForDisplay = useMemo(() => {
    return sales
      .flatMap(inv => inv.items)
      .filter(item => item.saleType === 'SELL')
      // FIX: Added an explicit type for the 'sum' accumulator to help TypeScript's inference.
      .reduce((sum: number, item) => sum + item.total, 0);
  }, [sales]);
  
  // FIX: Added an explicit type for the 'sum' accumulator to help TypeScript's inference,
  // resolving an issue where the return type of useMemo was inferred as 'unknown'.
  const totalTraderPayments = useMemo(() => traderTransactions.reduce((sum: number, t) => sum + t.cashPayment, 0), [traderTransactions]);
  // FIX: Added an explicit type for the 'sum' accumulator to help TypeScript's inference,
  // resolving an issue where the return type of useMemo was inferred as 'unknown'.
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum: number, t) => sum + t.amount, 0), [transactions]);

  const totalPurchasesForDisplay = useMemo(() => {
    // Total cash out from negative-balance invoices (credits we paid)
    const cashPaidToCustomers = sales.flatMap(inv => inv.payments || [])
                                      .filter(p => p.amount < 0)
                                      // FIX: Added an explicit type for the 'sum' accumulator to resolve a type inference issue.
                                      .reduce((sum: number, p) => sum + Math.abs(p.amount), 0);

    return cashPaidToCustomers + totalTraderPayments + totalExpenses;
  }, [sales, totalTraderPayments, totalExpenses]);

    // Wallet balance calculations
    const walletBalances = useMemo(() => {
        const balances: Record<PaymentMethod, number> = {
            CASH: 0,
            E_WALLET: 0,
            INSTAPAY: 0,
            FAWRY: 0,
        };

        // Inflows from sales
        sales.flatMap(inv => inv.payments || []).forEach(p => {
            if (p.method in balances) {
                balances[p.method] += p.amount;
            }
        });

        // Inflows/Outflows from general transactions
        transactions.forEach(t => {
            const method = t.paymentMethod || 'CASH';
            if (method in balances) {
                if (t.type === TransactionType.DEPOSIT) {
                    balances[method] += t.amount;
                } else if (t.type === TransactionType.EXPENSE) {
                    balances[method] -= t.amount;
                }
            }
        });
        
        // Outflows for trader payments (assumed CASH)
        balances.CASH -= totalTraderPayments;
        
        return balances;
    }, [sales, transactions, totalTraderPayments]);

    const treasuryBalance = useMemo(() => {
        // FIX: Explicitly typed the 'sum' accumulator to resolve potential type inference issues.
        // FIX: Explicitly typed the 'balance' parameter because `walletBalances` type was not being inferred correctly.
        return Object.values(walletBalances).reduce((sum: number, balance: number) => sum + balance, 0);
    }, [walletBalances]);

    const handleExportData = useCallback((isAutoBackup: boolean = false): boolean => {
      try {
          const wb = XLSX.utils.book_new();

          const flattenInvoiceItems = (invoice: Invoice) => {
              return invoice.items.map(item => ({
                  'ID الفاتورة': invoice.id,
                  'تاريخ الفاتورة': new Date(invoice.date),
                  'اسم العميل': invoice.customer.name,
                  'هاتف العميل': invoice.customer.phone,
                  'عنوان العميل': invoice.customer.address,
                  'ملاحظات': invoice.notes,
                  'صافي الفاتورة': invoice.netTotal,
                  'المدفوع': invoice.amountPaid,
                  'المتبقي': invoice.remainingBalance,
                  'المدفوعات': JSON.stringify(invoice.payments || []), // Export payments array
                  'الشحن': invoice.channel === 'ONLINE' ? invoice.shipping : undefined,
                  'ID القطعة': item.id,
                  'نوع العملية': item.saleType,
                  'التصنيف': item.category,
                  'العيار': item.karat,
                  'الوصف': item.description,
                  'الوزن (جم)': item.weight,
                  'سعر الجرام': item.pricePerGram,
                  'نوع المصنعية': item.workmanshipType,
                  'قيمة المصنعية': item.workmanshipValue,
                  'الخصم (%)': item.discountPercentage,
                  'إجمالي القطعة': item.total,
              }));
          };

          const storeSalesData = sales.filter(s => s.channel === 'STORE').flatMap(flattenInvoiceItems);
          if (storeSalesData.length > 0) {
              const wsStore = XLSX.utils.json_to_sheet(storeSalesData);
              XLSX.utils.book_append_sheet(wb, wsStore, "مبيعات المحل");
          }

          const onlineSalesData = sales.filter(s => s.channel === 'ONLINE').flatMap(flattenInvoiceItems);
          if (onlineSalesData.length > 0) {
              const wsOnline = XLSX.utils.json_to_sheet(onlineSalesData);
              XLSX.utils.book_append_sheet(wb, wsOnline, "مبيعات اون لاين");
          }
          
          if (traders.length > 0) {
              const tradersData = traders.map(t => ({
                  'ID التاجر': t.id,
                  'الاسم': t.name,
                  'الهاتف': t.phone,
                  'التصنيف': t.category,
              }));
              const wsTraders = XLSX.utils.json_to_sheet(tradersData);
              XLSX.utils.book_append_sheet(wb, wsTraders, "التجار");
          }

          if (transactions.length > 0) {
            const generalData = transactions.map(t => ({...t, date: new Date(t.date)}));
            const wsGeneral = XLSX.utils.json_to_sheet(generalData);
            XLSX.utils.book_append_sheet(wb, wsGeneral, "المعاملات العامة");
          }

          const sanitizeSheetName = (name: string) => name.replace(/[\[\]\*\/\\\?]/g, '_').substring(0, 31);

          traders.forEach(trader => {
              const transactionsForTrader = traderTransactions
                  .filter(tt => tt.traderId === trader.id)
                  .map(tt => ({
                      ...tt,
                      date: new Date(tt.date)
                  }));
              
              if (transactionsForTrader.length > 0) {
                  const ws = XLSX.utils.json_to_sheet(transactionsForTrader);
                  const sheetName = sanitizeSheetName(`${trader.category === 'GOLD' ? 'ذهب' : 'فضة'} - ${trader.name}`);
                  XLSX.utils.book_append_sheet(wb, ws, sheetName);
              }
          });
          
          if (wb.SheetNames.length === 0) {
              if (!isAutoBackup) {
                  alert("لا توجد بيانات لتصديرها.");
              }
              return false;
          }

          const filename = isAutoBackup 
            ? 'alfadi-daily-backup.xlsx' 
            : `alfadi-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
            
          XLSX.writeFile(wb, filename);
          return true;

      } catch (error) {
          console.error("Failed to export data:", error);
          if (!isAutoBackup) {
            alert("فشل تصدير البيانات. تحقق من الكونسول لمزيد من التفاصيل.");
          }
          return false;
      }
    }, [sales, transactions, traders, traderTransactions]);

    useEffect(() => {
        const checkAutoBackup = () => {
            const lastBackupTimestamp = localStorage.getItem('lastAutoBackupTimestamp');
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (!lastBackupTimestamp || (now - parseInt(lastBackupTimestamp, 10)) > twentyFourHours) {
                console.log("Attempting automatic daily backup...");
                const success = handleExportData(true);
                if (success) {
                    console.log("Automatic backup successful.");
                    localStorage.setItem('lastAutoBackupTimestamp', now.toString());
                } else {
                    console.log("Automatic backup skipped (no data or error).");
                }
            }
        };

        const timer = setTimeout(checkAutoBackup, 3000); 
        return () => clearTimeout(timer);
    }, [handleExportData]);


    const triggerImport = () => {
      fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              if (!e.target?.result) throw new Error("File content is not readable.");
              
              const data = e.target.result;
              const workbook = XLSX.read(data, { type: 'array', cellDates: true });

              // --- Start of New Import Logic ---
              let importedTraders: Trader[] = [];
              let importedGeneralTransactions: Transaction[] = [];
              const importedTraderTransactions: TraderTransaction[] = [];
              const salesMap = new Map<string, Invoice>();
              
              // 1. Import Traders (Must be first to link transactions)
              if (workbook.Sheets['التجار']) {
                  const tradersData = XLSX.utils.sheet_to_json(workbook.Sheets['التجار']);
                  importedTraders = tradersData.map((t: any) => ({
                      id: t['ID التاجر'],
                      name: t['الاسم'],
                      phone: t['الهاتف'],
                      category: t['التصنيف'] as TraderCategory,
                  }));
              }
              const traderNameMap = new Map(importedTraders.map(t => [t.name, t.id]));

              // 2. Import General Transactions
              if (workbook.Sheets['المعاملات العامة']) {
                  const generalData = XLSX.utils.sheet_to_json(workbook.Sheets['المعاملات العامة']);
                  importedGeneralTransactions = generalData.map((t: any) => ({
                      ...t,
                      date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
                      amount: Number(t.amount || 0),
                  }));
              }

              // 3. Loop through all sheets to process Sales and Trader Transactions
              workbook.SheetNames.forEach(sheetName => {
                  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                  if (sheetData.length === 0) return;

                  // Process Sales Sheets
                  if (sheetName === "مبيعات المحل" || sheetName === "مبيعات اون لاين") {
                      const channel = sheetName === "مبيعات المحل" ? 'STORE' : 'ONLINE';
                      sheetData.forEach((row: any) => {
                          const invoiceId = row['ID الفاتورة'];
                          if (!invoiceId) return;

                          // Create invoice if it doesn't exist
                          if (!salesMap.has(invoiceId)) {
                              let payments: Payment[] = [];
                              if (row['المدفوعات']) {
                                  try {
                                      payments = JSON.parse(row['المدفوعات']);
                                  } catch (e) { console.error("Could not parse payments for invoice", invoiceId); }
                              } else if (row['المدفوع'] && Number(row['المدفوع']) !== 0) {
                                  // Backward compatibility for old format
                                  payments.push({
                                      id: crypto.randomUUID(),
                                      // FIX: Use the PaymentMethod enum instead of a string literal to match the expected type.
                                      method: PaymentMethod.CASH,
                                      amount: Number(row['المدفوع']),
                                      date: row['تاريخ الفاتورة'] instanceof Date ? row['تاريخ الفاتورة'].toISOString() : new Date().toISOString()
                                  });
                              }
                              
                              const newInvoice: Invoice = {
                                  id: invoiceId,
                                  type: TransactionType.SALE,
                                  date: row['تاريخ الفاتورة'] instanceof Date ? row['تاريخ الفاتورة'].toISOString() : new Date().toISOString(),
                                  customer: { name: row['اسم العميل'], phone: row['هاتف العميل'], address: row['عنوان العميل'] },
                                  channel: channel,
                                  notes: row['ملاحظات'],
                                  netTotal: Number(row['صافي الفاتورة'] || 0),
                                  amountPaid: Number(row['المدفوع'] || 0),
                                  remainingBalance: Number(row['المتبقي'] || 0),
                                  shipping: Number(row['الشحن'] || 0),
                                  items: [],
                                  payments,
                                  // Temporary fields, will be overwritten by the last item
                                  description: '', 
                                  amount: Number(row['صافي الفاتورة'] || 0),
                              };
                              salesMap.set(invoiceId, newInvoice);
                          }
                          
                          // Add item to the invoice
                          const invoice = salesMap.get(invoiceId)!;
                          const newItem: InvoiceItem = {
                              id: row['ID القطعة'],
                              saleType: row['نوع العملية'],
                              category: row['التصنيف'],
                              // FIX: Cast the 'karat' value to the Karat type to resolve the type error.
                              karat: row['العيار'] ? Number(row['العيار']) as Karat : null,
                              description: row['الوصف'],
                              weight: Number(row['الوزن (جم)'] || 0),
                              pricePerGram: Number(row['سعر الجرام'] || 0),
                              workmanshipType: row['نوع المصنعية'],
                              workmanshipValue: row['قيمة المصنعية'] ? Number(row['قيمة المصنعية']) : undefined,
                              discountPercentage: row['الخصم (%)'] ? Number(row['الخصم (%)']) : undefined,
                              total: Number(row['إجمالي القطعة'] || 0),
                          };
                          invoice.items.push(newItem);
                      });
                  }
                  // Process Trader Sheets
                  else if (sheetName.startsWith('ذهب - ') || sheetName.startsWith('فضة - ')) {
                      const traderName = sheetName.replace(/^(ذهب - |فضة - )/, '');
                      const traderId = traderNameMap.get(traderName);
                      if (traderId) {
                          sheetData.forEach((row: any) => {
                              const newTrans: TraderTransaction = {
                                  id: row.id,
                                  traderId: traderId,
                                  date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
                                  description: row.description,
                                  workWeight: Number(row.workWeight || 0),
                                  scrapWeight: Number(row.scrapWeight || 0),
                                  workmanshipFee: Number(row.workmanshipFee || 0),
                                  cashPayment: Number(row.cashPayment || 0),
                                  silverPricePerGram: row.silverPricePerGram ? Number(row.silverPricePerGram) : undefined,
                              };
                              importedTraderTransactions.push(newTrans);
                          });
                      }
                  }
              });

              const importedSales = Array.from(salesMap.values());
              // --- End of New Import Logic ---

              if (window.confirm("هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف. لا يمكن التراجع عن هذه العملية.")) {
                  try {
                      window.localStorage.setItem('sales', JSON.stringify(importedSales));
                      window.localStorage.setItem('transactions', JSON.stringify(importedGeneralTransactions));
                      window.localStorage.setItem('traders', JSON.stringify(importedTraders));
                      window.localStorage.setItem('traderTransactions', JSON.stringify(importedTraderTransactions));
                      
                      alert("تم استيراد البيانات بنجاح! سيتم تحديث الصفحة الآن.");
                      window.location.reload();
                  } catch (storageError) {
                      console.error("Failed to save imported data to localStorage:", storageError);
                      alert("فشل حفظ البيانات المستوردة. قد تكون مساحة التخزين ممتلئة.");
                  }
              }
          } catch (error) {
              console.error("Failed to import data:", error);
              alert(`فشل استيراد البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
          } finally {
              if (event.target) {
                  event.target.value = '';
              }
          }
      };
      reader.onerror = () => {
          alert("فشل قراءة الملف.");
          if (event.target) {
              event.target.value = '';
          }
      };
      reader.readAsArrayBuffer(file);
    };


  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage 
                  totalSales={totalSalesForDisplay} 
                  totalPurchases={totalPurchasesForDisplay} 
                  treasuryBalance={treasuryBalance} 
                  allTransactions={allTransactionsForLog}
                  sales={sales}
                  traders={traders}
                  traderTransactions={traderTransactions}
                  onEditRecord={handleStartEdit}
                  onDeleteRecord={deleteRecord}
                  onInvoiceClick={navigateToTreasuryForInvoice}
                />;
      case 'sales':
        return <SalesPage sales={sales} addSale={addRecord} updateSale={updateInvoice} deleteSale={deleteRecord} onInvoiceClick={navigateToTreasuryForInvoice} recordToEditId={recordToEditId} onDoneEditing={clearEditState} />;
      case 'purchases':
        return <PurchasesPage 
                    traders={traders} 
                    addTrader={addTrader} 
                    updateTrader={updateTrader}
                    deleteTrader={deleteTrader}
                    traderTransactions={traderTransactions}
                    addTraderTransaction={addTraderTransaction}
                    updateTraderTransaction={updateTraderTransaction}
                    deleteTraderTransaction={deleteTraderTransaction}
                    recordToEditId={recordToEditId} 
                    onDoneEditing={clearEditState}
                />;
      case 'treasury':
        return <TreasuryPage 
                  sales={sales} 
                  transactions={transactions} 
                  balance={treasuryBalance} 
                  walletBalances={walletBalances}
                  applyPayment={applyPayment} 
                  addTransaction={addRecord}
                  initialView={treasuryInitialView}
                />;
      default:
        return <HomePage 
                  totalSales={totalSalesForDisplay} 
                  totalPurchases={totalPurchasesForDisplay} 
                  treasuryBalance={treasuryBalance} 
                  allTransactions={allTransactionsForLog}
                  sales={sales}
                  traders={traders}
                  traderTransactions={traderTransactions}
                  onEditRecord={handleStartEdit}
                  onDeleteRecord={deleteRecord}
                  onInvoiceClick={navigateToTreasuryForInvoice}
                />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        style={{ display: 'none' }}
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onExport={() => handleExportData(false)}
        onImport={triggerImport}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
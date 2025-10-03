
import React, { useState, useMemo } from 'react';
import type { Transaction, Invoice, SalesSummary, SalesSummaryItem, PurchasesSummary, LogEntry, RecordType, Trader, TraderTransaction } from '../types';
import { StatCard } from '../components/StatCard';
import { TransactionTable } from '../components/TransactionTable';
import { ChartPieIcon, ShoppingBagIcon, CashIcon, TrendingUpIcon, DocumentReportIcon, ScaleIcon, SparklesIcon, SearchIcon } from '../components/icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';
type SummaryTab = 'store' | 'online' | 'buyBack' | 'silver';
type TraderSummaryTab = 'gold' | 'silver';

interface HomePageProps {
  totalSales: number;
  totalPurchases: number;
  treasuryBalance: number;
  allTransactions: LogEntry[];
  sales: Invoice[];
  traders: Trader[];
  traderTransactions: TraderTransaction[];
  onEditRecord: (id: string, type: RecordType) => void;
  onDeleteRecord: (id: string, type: RecordType | any) => void;
  onInvoiceClick: (invoice: Invoice) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatWeight = (weight: number) => {
    return `${weight.toFixed(3)} جرام`;
};

const SalesSummaryDetails: React.FC<{title: string, data: SalesSummaryItem, valueColorClass?: string}> = ({title, data, valueColorClass = 'text-blue-600'}) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
        <span className="font-semibold text-gray-700">{title}</span>
        <div className="text-left">
            <p className={`text-base font-bold ${valueColorClass}`}>{formatCurrency(data.cash)}</p>
            <p className="text-xs text-gray-500">{`${data.weight.toFixed(2)} جرام`}</p>
        </div>
    </div>
);

const PurchaseSummaryDetails: React.FC<{title: string, value: string, valueClass?: string}> = ({title, value, valueClass = 'text-gray-800'}) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-b-0">
        <span className="font-semibold text-gray-700">{title}</span>
        <p className={`text-base font-bold ${valueClass}`}>{value}</p>
    </div>
);


export const HomePage: React.FC<HomePageProps> = ({ 
    totalSales, 
    totalPurchases, 
    treasuryBalance, 
    allTransactions, 
    sales,
    traders,
    traderTransactions,
    onEditRecord,
    onDeleteRecord,
    onInvoiceClick 
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeSummaryTab, setActiveSummaryTab] = useState<SummaryTab>('store');
  const [activeTraderSummaryTab, setActiveTraderSummaryTab] = useState<TraderSummaryTab>('gold');
  const [insights, setInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryFilter, setSummaryFilter] = useState<SummaryTab | null>(null);

  const timeFilteredSales = useMemo(() => {
    if (timeRange === 'all') return sales;
    
    const now = new Date();
    return sales.filter(t => {
      const transactionDate = new Date(t.date);
      switch (timeRange) {
        case 'today': {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          return transactionDate >= startOfToday && transactionDate <= endOfToday;
        }
        case 'week': {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          oneWeekAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneWeekAgo;
        }
        case 'month': {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          oneMonthAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneMonthAgo;
        }
        case 'year': {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          oneYearAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneYearAgo;
        }
        case 'custom': {
          if (!customStartDate || !customEndDate) return false;
          const start = new Date(`${customStartDate}T00:00:00`);
          const end = new Date(`${customEndDate}T23:59:59`);
          return transactionDate >= start && transactionDate <= end;
        }
        default:
          return false;
      }
    });
  }, [sales, timeRange, customStartDate, customEndDate]);

  const timeFilteredTraderTransactions = useMemo(() => {
    if (timeRange === 'all') return traderTransactions;

    const now = new Date();
    return traderTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      switch (timeRange) {
        case 'today': {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          return transactionDate >= startOfToday && transactionDate <= endOfToday;
        }
        case 'week': {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          oneWeekAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneWeekAgo;
        }
        case 'month': {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          oneMonthAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneMonthAgo;
        }
        case 'year': {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          oneYearAgo.setHours(0, 0, 0, 0);
          return transactionDate >= oneYearAgo;
        }
        case 'custom': {
          if (!customStartDate || !customEndDate) return false;
          const start = new Date(`${customStartDate}T00:00:00`);
          const end = new Date(`${customEndDate}T23:59:59`);
          return transactionDate >= start && transactionDate <= end;
        }
        default:
          return false;
      }
    });
  }, [traderTransactions, timeRange, customStartDate, customEndDate]);

    const salesSummary = useMemo<SalesSummary>(() => {
    const summary: SalesSummary = {
        store: {
            gold24: { weight: 0, cash: 0 },
            gold21: { weight: 0, cash: 0 },
            gold18: { weight: 0, cash: 0 },
        },
        online: {
            gold24: { weight: 0, cash: 0 },
            gold21: { weight: 0, cash: 0 },
            gold18: { weight: 0, cash: 0 },
        },
        buyBack: {
            gold24: { weight: 0, cash: 0 },
            gold21: { weight: 0, cash: 0 },
            gold18: { weight: 0, cash: 0 },
            silver: { weight: 0, cash: 0 },
        },
        silver: { weight: 0, cash: 0 },
    };

    timeFilteredSales.forEach(invoice => {
        invoice.items.forEach(item => {
            if (item.category === 'SILVER') {
                if (item.saleType === 'SELL') {
                    summary.silver.weight += item.weight;
                    summary.silver.cash += item.total;
                } else if (item.saleType === 'BUY_BACK') {
                    summary.buyBack.silver.weight += item.weight;
                    summary.buyBack.silver.cash += item.total;
                }
            } else if (item.category === 'GOLD') {
                if (item.saleType === 'SELL') {
                    const channel = invoice.channel === 'ONLINE' ? summary.online : summary.store;
                    switch (item.karat) {
                        case 24:
                            channel.gold24.weight += item.weight;
                            channel.gold24.cash += item.total;
                            break;
                        case 21:
                            channel.gold21.weight += item.weight;
                            channel.gold21.cash += item.total;
                            break;
                        case 18:
                            channel.gold18.weight += item.weight;
                            channel.gold18.cash += item.total;
                            break;
                    }
                } else if (item.saleType === 'BUY_BACK') {
                    const channel = summary.buyBack;
                    switch (item.karat) {
                        case 24:
                            channel.gold24.weight += item.weight;
                            channel.gold24.cash += item.total;
                            break;
                        case 21:
                            channel.gold21.weight += item.weight;
                            channel.gold21.cash += item.total;
                            break;
                        case 18:
                            channel.gold18.weight += item.weight;
                            channel.gold18.cash += item.total;
                            break;
                    }
                }
            }
        });
    });

    return summary;
  }, [timeFilteredSales]);

    const purchasesSummary = useMemo<PurchasesSummary>(() => {
        const summary: PurchasesSummary = {
            gold: {
                totalWorkWeight: 0,
                totalWorkmanshipFee: 0,
                totalScrapWeight: 0,
                netGoldBalance: 0,
            },
            silver: {
                totalWorkWeight: 0,
                totalRequiredCash: 0,
                totalCashPaid: 0,
                netCashBalance: 0,
            },
        };

        const goldTraders = traders.filter(t => t.category === 'GOLD').map(t => t.id);
        const silverTraders = traders.filter(t => t.category === 'SILVER').map(t => t.id);

        timeFilteredTraderTransactions.forEach(trans => {
            if (goldTraders.includes(trans.traderId)) {
                summary.gold.totalWorkWeight += trans.workWeight;
                summary.gold.totalWorkmanshipFee += trans.workmanshipFee;
                summary.gold.totalScrapWeight += trans.scrapWeight;
            } else if (silverTraders.includes(trans.traderId)) {
                const workValue = trans.workWeight * (trans.silverPricePerGram || 0);
                summary.silver.totalWorkWeight += trans.workWeight;
                summary.silver.totalRequiredCash += workValue + trans.workmanshipFee;
                summary.silver.totalCashPaid += trans.cashPayment;
            }
        });

        summary.gold.netGoldBalance = summary.gold.totalWorkWeight - summary.gold.totalScrapWeight;
        summary.silver.netCashBalance = summary.silver.totalRequiredCash - summary.silver.totalCashPaid;

        return summary;
    }, [traders, timeFilteredTraderTransactions]);

  const netProfit = totalSales - totalPurchases;

  const goldBalance = purchasesSummary.gold.netGoldBalance;
  const silverBalance = purchasesSummary.silver.netCashBalance;
  
  const totalStoreGold21Equivalent = salesSummary.store.gold21.weight +
                                   (salesSummary.store.gold24.weight * 24 / 21) +
                                   (salesSummary.store.gold18.weight * 18 / 21);

  const totalOnlineGold21Equivalent = salesSummary.online.gold21.weight +
                                   (salesSummary.online.gold24.weight * 24 / 21) +
                                   (salesSummary.online.gold18.weight * 18 / 21);

  const totalBuyBackGold21Equivalent = salesSummary.buyBack.gold21.weight +
                                   (salesSummary.buyBack.gold24.weight * 24 / 21) +
                                   (salesSummary.buyBack.gold18.weight * 18 / 21);

  const totalStoreCash = salesSummary.store.gold24.cash + salesSummary.store.gold21.cash + salesSummary.store.gold18.cash;
  const totalOnlineCash = salesSummary.online.gold24.cash + salesSummary.online.gold21.cash + salesSummary.online.gold18.cash;
  const totalBuyBackCash = salesSummary.buyBack.gold24.cash + salesSummary.buyBack.gold21.cash + salesSummary.buyBack.gold18.cash;

  // These should be all time balances, so they use the original unfiltered data
  const totalGoldInStore = useMemo(() => {
    const allTimePurchasesSummary = (() => {
        const summary = { netGoldBalance: 0 };
        const goldTraders = traders.filter(t => t.category === 'GOLD').map(t => t.id);
        traderTransactions.forEach(trans => {
            if (goldTraders.includes(trans.traderId)) {
                summary.netGoldBalance += trans.workWeight - trans.scrapWeight;
            }
        });
        return summary;
    })();

    const allTimeSalesSummary = (() => {
        const summary = {
            storeGold21Eq: 0,
            onlineGold21Eq: 0,
            buyBackGold21Eq: 0
        };
        sales.forEach(invoice => {
            invoice.items.forEach(item => {
                if (item.category === 'GOLD') {
                    const weight21Eq = item.weight * (item.karat ?? 21) / 21;
                    if (item.saleType === 'SELL') {
                        if (invoice.channel === 'STORE') summary.storeGold21Eq += weight21Eq;
                        else summary.onlineGold21Eq += weight21Eq;
                    } else if (item.saleType === 'BUY_BACK') {
                        summary.buyBackGold21Eq += weight21Eq;
                    }
                }
            });
        });
        return summary;
    })();

    return allTimePurchasesSummary.netGoldBalance + allTimeSalesSummary.buyBackGold21Eq - (allTimeSalesSummary.storeGold21Eq + allTimeSalesSummary.onlineGold21Eq);
  }, [sales, traders, traderTransactions]);

  const totalSilverInStore = useMemo(() => {
    const totalPurchasedFromTraders = traderTransactions
        .filter(tt => traders.find(t => t.id === tt.traderId)?.category === 'SILVER')
        .reduce((sum, tt) => sum + tt.workWeight, 0);

    const silverMovementWithCustomers = sales.flatMap(inv => inv.items)
        .filter(item => item.category === 'SILVER')
        .reduce((acc, item) => {
            if (item.saleType === 'BUY_BACK') acc.bought += item.weight;
            else if (item.saleType === 'SELL') acc.sold += item.weight;
            return acc;
        }, { bought: 0, sold: 0 });

    return totalPurchasedFromTraders + silverMovementWithCustomers.bought - silverMovementWithCustomers.sold;
  }, [sales, traders, traderTransactions]);


  // Sales Chart data
  const storeChartData = useMemo(() => [
    { name: 'عيار 24', value: salesSummary.store.gold24.cash },
    { name: 'عيار 21', value: salesSummary.store.gold21.cash },
    { name: 'عيار 18', value: salesSummary.store.gold18.cash },
  ], [salesSummary.store]);

  const onlineChartData = useMemo(() => [
    { name: 'عيار 24', value: salesSummary.online.gold24.cash },
    { name: 'عيار 21', value: salesSummary.online.gold21.cash },
    { name: 'عيار 18', value: salesSummary.online.gold18.cash },
  ], [salesSummary.online]);

  const buyBackChartData = useMemo(() => [
    { name: 'عيار 24', value: salesSummary.buyBack.gold24.cash },
    { name: 'عيار 21', value: salesSummary.buyBack.gold21.cash },
    { name: 'عيار 18', value: salesSummary.buyBack.gold18.cash },
  ], [salesSummary.buyBack]);

  const silverChartData = useMemo(() => [
    { name: 'مبيعات فضة', value: salesSummary.silver.cash },
    { name: 'مشتريات فضة', value: salesSummary.buyBack.silver.cash },
  ], [salesSummary.silver, salesSummary.buyBack.silver]);

  // Purchases Chart data
  const goldTraderChartData = useMemo(() => [
    { name: 'شغل مستلم', value: purchasesSummary.gold.totalWorkWeight },
    { name: 'كسر مسلم', value: purchasesSummary.gold.totalScrapWeight },
  ], [purchasesSummary.gold]);

  const silverTraderChartData = useMemo(() => [
    { name: 'نقدية مطلوبة', value: purchasesSummary.silver.totalRequiredCash },
    { name: 'نقدية مدفوعة', value: purchasesSummary.silver.totalCashPaid },
  ], [purchasesSummary.silver]);

    const trendData = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const dailyData: { [key: string]: { sales: number; purchases: number } } = {};

        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            dailyData[dateString] = { sales: 0, purchases: 0 };
        }

        allTransactions.forEach(t => {
            const transactionDate = new Date(t.date);
            if (transactionDate >= thirtyDaysAgo) {
                const dateString = transactionDate.toISOString().split('T')[0];
                if (dailyData[dateString]) {
                    if (t.recordType === 'invoice') {
                        const salesAmount = t.items.filter(i => i.saleType === 'SELL').reduce((sum, i) => sum + i.total, 0);
                        const buyBackAmount = t.items.filter(i => i.saleType === 'BUY_BACK').reduce((sum, i) => sum + i.total, 0);
                        dailyData[dateString].sales += salesAmount;
                        dailyData[dateString].purchases += buyBackAmount;
                    } else if (t.recordType === 'traderTransaction') {
                        dailyData[dateString].purchases += t.cashPayment;
                    } else if (t.recordType === 'general' && t.type === 'EXPENSE') {
                        dailyData[dateString].purchases += t.amount;
                    }
                }
            }
        });

        return Object.keys(dailyData)
            .map(date => ({
                date,
                'المبيعات': dailyData[date].sales,
                'المشتريات': dailyData[date].purchases,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    let results = allTransactions;

    // Time filtering
    if (timeRange !== 'all') {
      const now = new Date();
      results = results.filter(t => {
        const transactionDate = new Date(t.date);
        switch (timeRange) {
          case 'today': {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            return transactionDate >= startOfToday && transactionDate <= endOfToday;
          }
          case 'week': {
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            oneWeekAgo.setHours(0, 0, 0, 0);
            return transactionDate >= oneWeekAgo;
          }
          case 'month': {
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            oneMonthAgo.setHours(0, 0, 0, 0);
            return transactionDate >= oneMonthAgo;
          }
          case 'year': {
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            oneYearAgo.setHours(0, 0, 0, 0);
            return transactionDate >= oneYearAgo;
          }
          case 'custom': {
            if (!customStartDate || !customEndDate) return false;
            const start = new Date(`${customStartDate}T00:00:00`);
            const end = new Date(`${customEndDate}T23:59:59`);
            return transactionDate >= start && transactionDate <= end;
          }
          default:
            return false;
        }
      });
    }

    // Summary Tab Filtering
    if (summaryFilter) {
      results = results.filter(t => {
        if (t.recordType !== 'invoice') {
          return false;
        }
        // Now t is guaranteed to be an Invoice
        switch (summaryFilter) {
          case 'store':
            return t.channel === 'STORE';
          case 'online':
            return t.channel === 'ONLINE';
          case 'buyBack':
            return t.items.some(item => item.saleType === 'BUY_BACK' && item.category === 'GOLD');
          case 'silver':
            return t.items.some(item => item.category === 'SILVER');
          default:
            return false;
        }
      });
    }

    // Search filtering
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      results = results.filter(t => {
        if (t.recordType === 'invoice') {
          return (
            t.customer.name.toLowerCase().includes(lowerCaseQuery) ||
            t.customer.phone.includes(lowerCaseQuery)
          );
        }
        if (t.recordType === 'traderTransaction') {
          return t.traderName.toLowerCase().includes(lowerCaseQuery);
        }
        // 'general'
        return t.description.toLowerCase().includes(lowerCaseQuery);
      });
    }
    
    return results;
  }, [allTransactions, timeRange, customStartDate, customEndDate, searchQuery, summaryFilter]);


  const transactionTableTitle = useMemo(() => {
    let title = '';
    if (summaryFilter) {
        switch (summaryFilter) {
            case 'store': title = 'فواتير المحل'; break;
            case 'online': title = 'فواتير أون لاين'; break;
            case 'buyBack': title = 'فواتير مشتريات ذهب مستعمل'; break;
            case 'silver': title = 'فواتير حركة الفضة'; break;
        }
        title += ' | ';
    }
    
    switch (timeRange) {
        case 'today': return title + 'معاملات اليوم';
        case 'week': return title + 'معاملات آخر أسبوع';
        case 'month': return title + 'معاملات آخر شهر';
        case 'year': return title + 'معاملات آخر سنة';
        case 'custom': return `معاملات من ${customStartDate} إلى ${customEndDate}`;
        case 'all': return title.length > 0 ? title.slice(0, -3).trim() : 'جميع المعاملات';
        default: return title + 'سجل المعاملات';
    }
  }, [timeRange, customStartDate, customEndDate, summaryFilter]);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    setInsights('');
    try {
        const dataForAI = trendData.filter(d => d['المبيعات'] > 0 || d['المشتريات'] > 0);
        if (dataForAI.length < 3) {
            setInsights('لا توجد بيانات كافية لإنشاء تحليلات. يرجى تسجيل المزيد من المعاملات.');
            return;
        }

        const prompt = `
أنت مستشار أعمال خبير لمحل مجوهرات. بناءً على بيانات المبيعات والمشتريات اليومية التالية، قدم 3 نصائح عملية وموجزة لصاحب المحل لتحسين أعماله. يجب أن تكون النصائح على شكل قائمة نقطية.

البيانات (آخر 30 يوم):
${JSON.stringify(dataForAI)}

اكتب ردك باللغة العربية.
`;
        
        const response = await fetch('/api/ask-gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'فشل الاتصال بالخادم');
        }

        setInsights(data.response);

    } catch (error) {
        console.error("Error generating insights:", error);
        setInsights("عذراً، حدث خطأ أثناء إنشاء التحليلات. يرجى المحاولة مرة أخرى.");
    } finally {
        setIsGeneratingInsights(false);
    }
  };

  const timeRangeOptions: { key: TimeRange; label: string }[] = [
    { key: 'today', label: 'اليوم' },
    { key: 'week', label: 'أسبوع' },
    { key: 'month', label: 'شهر' },
    { key: 'year', label: 'سنة' },
    { key: 'all', label: 'الكل' },
    { key: 'custom', label: 'مدة مخصصة' },
  ];

  const summaryTabs: { key: SummaryTab; label: string }[] = [
      { key: 'store', label: 'مبيعات المحل' },
      { key: 'online', label: 'مبيعات أون لاين' },
      { key: 'buyBack', label: 'مشتريات ذهب مستعمل' },
      { key: 'silver', label: 'حركة الفضة' },
  ];

  const traderSummaryTabs: { key: TraderSummaryTab; label: string }[] = [
      { key: 'gold', label: 'تجار الذهب' },
      { key: 'silver', label: 'تجار الفضة' },
  ];

  const SummaryChart: React.FC<{
    data: any[], 
    barColor: string, 
    dataKey: string, 
    name: string, 
    unit?: string
  }> = ({data, barColor, dataKey, name, unit = ''}) => (
      <div className="h-80 w-full">
          <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('ar-EG', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                  <Tooltip formatter={(value) => `${new Intl.NumberFormat('ar-EG').format(value as number)} ${unit}`} />
                  <Legend />
                  <Bar dataKey={dataKey} name={name} fill={barColor} />
              </BarChart>
          </ResponsiveContainer>
      </div>
  );

  const netProfitColorClass = netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
  const treasuryBalanceColorClass = treasuryBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={formatCurrency(totalSales)} 
          icon={<ChartPieIcon />} 
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard 
          title="إجمالي المشتريات" 
          value={formatCurrency(totalPurchases)} 
          icon={<ShoppingBagIcon />} 
          colorClass="bg-red-100 text-red-600"
        />
        <StatCard 
          title="صافي الربح" 
          value={formatCurrency(netProfit)} 
          icon={<TrendingUpIcon />} 
          colorClass={netProfitColorClass}
        />
        <StatCard 
          title="رصيد الخزنة" 
          value={formatCurrency(treasuryBalance)} 
          icon={<CashIcon />} 
          colorClass={treasuryBalanceColorClass}
        />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">تصفية حسب الفترة الزمنية</h3>
          <div className="flex flex-wrap items-center gap-2">
            {timeRangeOptions.map(option => (
                <button
                    key={option.key}
                    onClick={() => setTimeRange(option.key)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                        timeRange === option.key
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {option.label}
                </button>
            ))}
          </div>
        </div>
        {timeRange === 'custom' && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border animate-fade-in">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">من تاريخ</label>
                    <input
                        type="date"
                        id="start-date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">إلى تاريخ</label>
                    <input
                        type="date"
                        id="end-date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        )}
      </div>
      
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">أداء آخر 30 يومًا</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('ar-EG', {day: 'numeric', month: 'short'})} />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('ar-EG', { notation: 'compact' }).format(value as number)} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="المبيعات" stroke="#16a34a" strokeWidth={2} name="المبيعات" />
                    <Line type="monotone" dataKey="المشتريات" stroke="#dc2626" strokeWidth={2} name="المشتريات" />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
      
       <div className="bg-gradient-to-br from-yellow-100 to-amber-200 p-6 rounded-xl shadow-lg border border-amber-300">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-amber-800">إجمالي الذهب الموجود في المحل</h3>
                <p className="text-sm text-amber-700">الرصيد الصافي للذهب (معادل عيار 21)</p>
            </div>
            <div className="p-4 bg-white/50 rounded-full">
                <ScaleIcon className="text-amber-600" size={8} />
            </div>
        </div>
        <div className="mt-4 text-center">
            <p className={`text-6xl font-extrabold ${totalGoldInStore >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatWeight(totalGoldInStore)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
                (رصيد التجار + مشتريات العملاء - إجمالي المبيعات)
            </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-100 to-slate-200 p-6 rounded-xl shadow-lg border border-slate-300">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-slate-800">إجمالي الفضة الموجودة في المحل</h3>
                <p className="text-sm text-slate-700">الرصيد الصافي للفضة بالجرامات</p>
            </div>
            <div className="p-4 bg-white/50 rounded-full">
                <ScaleIcon className="text-slate-600" size={8} />
            </div>
        </div>
        <div className="mt-4 text-center">
            <p className={`text-6xl font-extrabold ${totalSilverInStore >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatWeight(totalSilverInStore)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
                (رصيد التجار + مشتريات العملاء - إجمالي المبيعات)
            </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center mb-4 pb-4 border-b">
            <DocumentReportIcon className="text-indigo-600" size={7}/>
            <h3 className="text-xl font-bold text-gray-800 ms-3">ملخص المبيعات والمشتريات</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 border-b-2 pb-2 mb-4">
            {summaryTabs.map(tab => (
                 <button
                    key={tab.key}
                    onClick={() => {
                        setActiveSummaryTab(tab.key);
                        setSummaryFilter(tab.key);
                    }}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeSummaryTab === tab.key
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
            {summaryFilter && (
                <button 
                    onClick={() => setSummaryFilter(null)} 
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 hover:bg-red-200 animate-fade-in flex items-center gap-1"
                    title="إلغاء فلترة جدول المعاملات حسب الملخص"
                >
                    <span className="font-bold">&times;</span>
                    <span>إلغاء الفلتر</span>
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
             {activeSummaryTab === 'store' && (
                <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-gray-700 mb-2">مبيعات المحل</h4>
                        <div className="space-y-1">
                            <SalesSummaryDetails title="ذهب عيار 24" data={salesSummary.store.gold24} valueColorClass="text-green-600" />
                            <SalesSummaryDetails title="ذهب عيار 21" data={salesSummary.store.gold21} valueColorClass="text-green-600" />
                            <SalesSummaryDetails title="ذهب عيار 18" data={salesSummary.store.gold18} valueColorClass="text-green-600" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                            <div className="flex justify-between items-center"><span className="font-bold text-green-800">إجمالي النقدية</span><p className="text-lg font-extrabold text-green-700">{formatCurrency(totalStoreCash)}</p></div>
                            <div className="flex justify-between items-center"><span className="font-bold text-blue-800">إجمالي ذهب (معادل عيار 21)</span><p className="text-lg font-extrabold text-blue-700">{formatWeight(totalStoreGold21Equivalent)}</p></div>
                        </div>
                    </div>
                    <SummaryChart data={storeChartData} barColor="#4f46e5" dataKey="value" name="القيمة النقدية" unit="ج.م" />
                </>
             )}
              {activeSummaryTab === 'online' && (
                <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-gray-700 mb-2">مبيعات أون لاين</h4>
                        <div className="space-y-1">
                            <SalesSummaryDetails title="ذهب عيار 24" data={salesSummary.online.gold24} valueColorClass="text-green-600" />
                            <SalesSummaryDetails title="ذهب عيار 21" data={salesSummary.online.gold21} valueColorClass="text-green-600" />
                            <SalesSummaryDetails title="ذهب عيار 18" data={salesSummary.online.gold18} valueColorClass="text-green-600" />
                        </div>
                         <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                            <div className="flex justify-between items-center"><span className="font-bold text-green-800">إجمالي النقدية</span><p className="text-lg font-extrabold text-green-700">{formatCurrency(totalOnlineCash)}</p></div>
                            <div className="flex justify-between items-center"><span className="font-bold text-blue-800">إجمالي ذهب (معادل عيار 21)</span><p className="text-lg font-extrabold text-blue-700">{formatWeight(totalOnlineGold21Equivalent)}</p></div>
                        </div>
                    </div>
                    <SummaryChart data={onlineChartData} barColor="#2563eb" dataKey="value" name="القيمة النقدية" unit="ج.م" />
                </>
             )}
             {activeSummaryTab === 'buyBack' && (
                <>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-bold text-lg text-orange-800 mb-2">مشتريات الذهب (مستعمل)</h4>
                        <div className="space-y-1">
                            <SalesSummaryDetails title="ذهب عيار 24" data={salesSummary.buyBack.gold24} valueColorClass="text-red-600" />
                            <SalesSummaryDetails title="ذهب عيار 21" data={salesSummary.buyBack.gold21} valueColorClass="text-red-600" />
                            <SalesSummaryDetails title="ذهب عيار 18" data={salesSummary.buyBack.gold18} valueColorClass="text-red-600" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                             <div className="flex justify-between items-center"><span className="font-bold text-red-800">إجمالي النقدية المدفوعة</span><p className="text-lg font-extrabold text-red-700">{formatCurrency(totalBuyBackCash)}</p></div>
                             <div className="flex justify-between items-center"><span className="font-bold text-yellow-800">إجمالي ذهب (معادل عيار 21)</span><p className="text-lg font-extrabold text-yellow-700">{formatWeight(totalBuyBackGold21Equivalent)}</p></div>
                        </div>
                    </div>
                     <SummaryChart data={buyBackChartData} barColor="#f97316" dataKey="value" name="القيمة النقدية" unit="ج.م" />
                </>
             )}
              {activeSummaryTab === 'silver' && (
                <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-gray-700 mb-2">حركة الفضة (العملاء)</h4>
                        <div className="space-y-1">
                            <SalesSummaryDetails title="مبيعات فضة" data={salesSummary.silver} valueColorClass="text-green-600" />
                            <SalesSummaryDetails title="مشتريات فضة (مستعمل)" data={salesSummary.buyBack.silver} valueColorClass="text-red-600" />
                        </div>
                    </div>
                     <SummaryChart data={silverChartData} barColor="#64748b" dataKey="value" name="القيمة النقدية" unit="ج.م" />
                </>
             )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center mb-4 pb-4 border-b">
            <ShoppingBagIcon className="text-indigo-600" size={7}/>
            <h3 className="text-xl font-bold text-gray-800 ms-3">ملخص مشتريات التجار</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b-2 pb-2 mb-4">
            {traderSummaryTabs.map(tab => (
                 <button
                    key={tab.key}
                    onClick={() => setActiveTraderSummaryTab(tab.key)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTraderSummaryTab === tab.key
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {activeTraderSummaryTab === 'gold' && (
                <>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-bold text-lg text-yellow-800 mb-2">مشتريات الذهب</h4>
                        <div className="space-y-1">
                            <PurchaseSummaryDetails title="إجمالي الشغل" value={formatWeight(purchasesSummary.gold.totalWorkWeight)} />
                            <PurchaseSummaryDetails title="إجمالي الأجور" value={formatCurrency(purchasesSummary.gold.totalWorkmanshipFee)} valueClass="text-blue-600" />
                            <PurchaseSummaryDetails title="إجمالي الكسر" value={formatWeight(purchasesSummary.gold.totalScrapWeight)} />
                            <PurchaseSummaryDetails 
                                title="رصيد الذهب" 
                                value={`${formatWeight(Math.abs(goldBalance))} ${goldBalance >= 0.001 ? 'علينا' : goldBalance <= -0.001 ? 'لهم' : ''}`} 
                                valueClass={goldBalance >= 0.001 ? 'text-red-600' : goldBalance <= -0.001 ? 'text-green-600' : 'text-gray-800'} 
                            />
                        </div>
                    </div>
                    <SummaryChart data={goldTraderChartData} barColor="#f59e0b" dataKey="value" name="الوزن" unit="جرام" />
                </>
            )}
            {activeTraderSummaryTab === 'silver' && (
                <>
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-lg text-gray-700 mb-2">مشتريات الفضة</h4>
                        <div className="space-y-1">
                            <PurchaseSummaryDetails title="إجمالي الشغل" value={formatWeight(purchasesSummary.silver.totalWorkWeight)} />
                            <PurchaseSummaryDetails title="إجمالي النقدية المطلوبة" value={formatCurrency(purchasesSummary.silver.totalRequiredCash)} valueClass="text-blue-600" />
                            <PurchaseSummaryDetails title="إجمالي النقدية المدفوعة" value={formatCurrency(purchasesSummary.silver.totalCashPaid)} valueClass="text-green-600" />
                            <PurchaseSummaryDetails 
                                title="رصيد النقدية" 
                                value={`${formatCurrency(Math.abs(silverBalance))} ${silverBalance >= 0.01 ? 'علينا' : silverBalance <= -0.01 ? 'لهم' : ''}`} 
                                valueClass={silverBalance >= 0.01 ? 'text-red-600' : silverBalance <= -0.01 ? 'text-green-600' : 'text-gray-800'}
                            />
                        </div>
                    </div>
                    <SummaryChart data={silverTraderChartData} barColor="#475569" dataKey="value" name="القيمة النقدية" unit="ج.م" />
                </>
            )}
        </div>
      </div>
      
       <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold">تحليلات ذكية بواسطة Gemini</h3>
                <p className="opacity-80">احصل على نصائح مخصصة لتحسين أداء محلك.</p>
            </div>
            <SparklesIcon size={10} className="text-yellow-300" />
        </div>
        <div className="mt-4">
            <button
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights}
                className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
                {isGeneratingInsights ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                    <>
                        <SparklesIcon size={5} className="me-2" />
                        <span>{insights ? 'إعادة إنشاء التحليل' : 'إنشاء تحليل الآن'}</span>
                    </>
                )}
            </button>
        </div>
        {insights && (
            <div className="mt-4 bg-black bg-opacity-20 p-4 rounded-lg animate-fade-in">
                <h4 className="font-bold mb-2">نصائح مخصصة لك:</h4>
                <div className="whitespace-pre-wrap text-sm space-y-2">
                    {insights.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                </div>
            </div>
        )}
      </div>

      <TransactionTable 
        transactions={filteredTransactions} 
        title={transactionTableTitle} 
        colorClass="bg-gray-100"
        onDelete={onDeleteRecord}
        onEdit={onEditRecord}
        onRowClick={(item) => {
// FIX: Check for recordType to correctly identify an invoice and pass it to onInvoiceClick.
            if (item.recordType === 'invoice') {
                onInvoiceClick(item);
            }
        }}
        headerActions={
            <div className="relative">
                <input
                    type="text"
                    placeholder="ابحث بالاسم، هاتف، أو وصف..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 p-2 ps-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

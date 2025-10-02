
import React from 'react';
import type { Transaction, Invoice, LogEntry, RecordType, InvoiceItem } from '../types';
import { TransactionType } from '../types';
import { TrashIcon, PencilIcon, ShoppingBagIcon } from './icons/Icons';

interface TransactionTableProps {
  transactions: LogEntry[];
  onDelete?: (id: string, type: RecordType | TransactionType) => void;
  onEdit?: (id: string, type: RecordType) => void;
  // FIX: Updated type to LogEntry to allow access to recordType property in parent components.
  onRowClick?: (item: LogEntry) => void;
  title: string;
  colorClass: string;
  headerActions?: React.ReactNode;
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

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
};

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit, title, colorClass, onRowClick, headerActions }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className={`p-4 border-b ${colorClass} bg-opacity-10 flex flex-wrap justify-between items-center gap-4`}>
        <h3 className={`text-lg font-bold ${colorClass.replace('bg','text').replace('-100', '-700')}`}>{title}</h3>
        {headerActions && <div className="flex-grow sm:flex-grow-0">{headerActions}</div>}
      </div>
      <div className="overflow-x-auto">
        {transactions.length > 0 ? (
          <table className="w-full text-sm text-right text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">العميل / الوصف</th>
                <th scope="col" className="px-6 py-3">تفاصيل</th>
                <th scope="col" className="px-6 py-3">المبلغ المطلوب / له</th>
                <th scope="col" className="px-6 py-3">المدفوع / عليه</th>
                <th scope="col" className="px-6 py-3">المتبقي</th>
                <th scope="col" className="px-6 py-3">التاريخ</th>
                {(onDelete || onEdit) && <th scope="col" className="px-6 py-3">إجراء</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {

                if (t.recordType === 'invoice') {
                  const invoice = t;
                  const totalWeight = invoice.items.reduce((sum, item) => sum + item.weight, 0);
                  const hasBalance = invoice.remainingBalance < -0.01 || invoice.remainingBalance > 0.01;
                  const rowClass = `bg-white border-b hover:bg-gray-50 ${onRowClick && hasBalance ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`;

                  return (
                     <tr 
                        key={invoice.id} 
                        className={rowClass}
                        onClick={() => onRowClick && hasBalance && onRowClick(invoice)}
                        title={onRowClick && hasBalance ? "اضغط لعرض تفاصيل الدين في الخزنة" : ""}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{invoice.customer.name || 'عميل'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                              {(() => {
                                  const hasSellItems = invoice.items.some(item => item.saleType === 'SELL');
                                  const hasBuyBackItems = invoice.items.some(item => item.saleType === 'BUY_BACK');

                                  let invoiceType = '';
                                  let typeClass = '';
                                  if (hasSellItems && hasBuyBackItems) {
                                      invoiceType = 'بيع وشراء';
                                      typeClass = 'bg-purple-100 text-purple-800';
                                  } else if (hasSellItems) {
                                      invoiceType = 'فاتورة بيع';
                                      typeClass = 'bg-green-100 text-green-800';
                                  } else if (hasBuyBackItems) {
                                      invoiceType = 'فاتورة شراء';
                                      typeClass = 'bg-orange-100 text-orange-800';
                                  }

                                  return <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${typeClass}`}>{invoiceType}</span>;
                              })()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                              const weights: { [key: string]: number } = {}; // e.g., 'ذهب 21', 'فضة'
                              invoice.items.forEach((item: InvoiceItem) => {
                                  const key = item.category === 'GOLD' 
                                      ? `ذهب ${item.karat}` 
                                      : 'فضة';
                                  if (!weights[key]) {
                                      weights[key] = 0;
                                  }
                                  weights[key] += item.weight;
                              });

                              const details = Object.entries(weights)
                                  .map(([key, weight]) => `${key}: ${weight.toFixed(2)} جرام`)
                                  .join(' | ');

                              return (
                                  <div>
                                      <div className="font-semibold text-gray-800">{formatWeight(totalWeight)}</div>
                                      {Object.keys(weights).length > 1 ? (
                                        <div className="text-xs text-gray-500 mt-1">{details}</div>
                                      ) : (
                                        <div className="text-xs text-gray-500 mt-1">{Object.keys(weights)[0]}</div>
                                      )}
                                  </div>
                              );
                          })()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-base">{formatCurrency(invoice.netTotal)}</td>
                        <td className="px-6 py-4 font-semibold text-green-600 text-base">{formatCurrency(invoice.amountPaid)}</td>
                        <td className={`px-6 py-4 font-semibold text-base ${invoice.remainingBalance > 0 ? 'text-red-600' : 'text-blue-600'}`}>{formatCurrency(invoice.remainingBalance)}</td>
                        <td className="px-6 py-4">{formatDate(invoice.date)}</td>
                        {(onDelete || onEdit) && (
                            <td className="px-6 py-4 flex items-center space-s-2">
                              {onEdit && (
                                <button onClick={(e) => { e.stopPropagation(); onEdit(invoice.id, 'invoice'); }} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors">
                                  <PencilIcon />
                                </button>
                              )}
                              {onDelete && (
                                <button onClick={(e) => { e.stopPropagation(); onDelete(invoice.id, 'invoice'); }} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                  <TrashIcon />
                                </button>
                              )}
                            </td>
                        )}
                    </tr>
                  );
                }

                if (t.recordType === 'traderTransaction') {
                    const transaction = t;
                    const requiredCash = transaction.traderCategory === 'GOLD' 
                        ? transaction.workmanshipFee 
                        : (transaction.workWeight * (transaction.silverPricePerGram || 0)) + transaction.workmanshipFee;

                    return (
                        <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{transaction.traderName}</div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <ShoppingBagIcon size={4} className="me-1 text-gray-400" />
                                    <span>{transaction.description || 'معاملة تاجر'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                                {transaction.workWeight > 0 && <div>شغل: <span className="font-semibold text-green-700 text-base">{formatWeight(transaction.workWeight)}</span></div>}
                                {transaction.scrapWeight > 0 && <div>كسر: <span className="font-semibold text-red-700 text-base">{formatWeight(transaction.scrapWeight)}</span></div>}
                            </td>
                            <td className="px-6 py-4 font-semibold text-blue-600 text-base">{formatCurrency(requiredCash)}</td>
                            <td className="px-6 py-4 font-semibold text-red-600 text-base">{formatCurrency(transaction.cashPayment)}</td>
                            <td className="px-6 py-4 text-gray-400">-</td>
                            <td className="px-6 py-4">{formatDate(transaction.date)}</td>
                             {(onDelete || onEdit) && (
                                <td className="px-6 py-4 flex items-center space-s-2">
                                  {onEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(transaction.id, 'traderTransaction'); }} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors">
                                      <PencilIcon />
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(transaction.id, 'traderTransaction'); }} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                      <TrashIcon />
                                    </button>
                                  )}
                                </td>
                            )}
                        </tr>
                    );
                }

                
                // Fallback for simple Transactions (Expense, Deposit)
                const transaction = t;
                const isOutflow = [TransactionType.EXPENSE, TransactionType.CREDIT_PAYMENT].includes(transaction.type);
                const isInflow = [TransactionType.DEPOSIT, TransactionType.DEBT_PAYMENT].includes(transaction.type);
                
                return (
                    <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50 opacity-90">
                      <td className="px-6 py-4 font-medium text-gray-800">{transaction.description}</td>
                      <td className="px-6 py-4 text-gray-400">-</td>
                      <td className={`px-6 py-4 font-semibold text-base ${isOutflow ? 'text-red-600' : 'text-gray-500'}`}>{isOutflow ? formatCurrency(transaction.amount) : '-'}</td>
                      <td className={`px-6 py-4 font-semibold text-base ${isInflow ? 'text-green-600' : 'text-gray-500'}`}>{isInflow ? formatCurrency(transaction.amount) : '-'}</td>
                      <td className="px-6 py-4 text-gray-400">-</td>
                      <td className="px-6 py-4">{formatDate(transaction.date)}</td>
                       {onDelete && (
                            <td className="px-6 py-4">
                              <button onClick={() => onDelete(transaction.id, transaction.type)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                <TrashIcon />
                              </button>
                            </td>
                        )}
                    </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p>لا توجد معاملات لعرضها.</p>
          </div>
        )}
      </div>
    </div>
  );
};
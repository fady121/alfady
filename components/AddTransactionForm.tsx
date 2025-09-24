
import React, { useState } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface AddTransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  transactionType: TransactionType;
  onClose: () => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAdd, transactionType, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('يرجى إدخال وصف صحيح ومبلغ إيجابي.');
      return;
    }
    
    onAdd({
      type: transactionType,
      description: description.trim(),
      amount: parsedAmount,
    });
    
    onClose();
  };

  const isSale = transactionType === TransactionType.SALE;
  const title = isSale ? 'إضافة عملية بيع جديدة' : 'إضافة عملية شراء جديدة';
  const buttonColor = isSale ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">الوصف</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={isSale ? "مثال: بيع منتج أ" : "مثال: شراء مواد خام"}
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">المبلغ (ج.م)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex justify-end space-s-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md transition-colors ${buttonColor}`}
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

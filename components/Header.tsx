import React from 'react';
import type { Page } from '../types';
import { CashIcon, ChartPieIcon, HomeIcon, ShoppingBagIcon, DownloadIcon, UploadIcon, LogoutIcon } from './icons/Icons';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onExport: () => void;
  onImport: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onExport, onImport, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: <HomeIcon /> },
    { id: 'sales', label: 'المبيعات', icon: <ChartPieIcon /> },
    { id: 'purchases', label: 'المشتريات', icon: <ShoppingBagIcon /> },
    { id: 'treasury', label: 'الخزنة', icon: <CashIcon /> },
  ];

  const actionButtons = (
      <div className="flex items-center gap-2">
        <button
            onClick={onImport}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
            title="استيراد بيانات من ملف"
        >
            <UploadIcon size={5} className="me-2" />
            <span>رفع نسخة</span>
        </button>
        <button
            onClick={onExport}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
            title="تصدير البيانات الحالية إلى ملف"
        >
            <DownloadIcon size={5} className="me-2" />
            <span>تنزيل نسخة</span>
        </button>
        {onLogout && (
             <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                title="تسجيل الخروج"
            >
                <LogoutIcon size={5} className="me-2" />
                <span>خروج</span>
            </button>
        )}
    </div>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">دفتر حسابات الفادي</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center space-s-8">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as Page)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activePage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <span className="me-2">{item.icon}</span>
                    {item.label}
                </button>
                ))}
            </nav>
            <div className="border-s border-gray-200 ps-4">
                {actionButtons}
            </div>
          </div>
        </div>
         {/* Mobile Nav */}
        <div className="md:hidden">
            <nav className="flex items-center justify-around bg-gray-50 p-2 border-t">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as Page)}
                    className={`flex flex-col items-center justify-center w-full p-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                    activePage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <span className="mb-1">{item.icon}</span>
                    {item.label}
                </button>
                ))}
            </nav>
            <div className="flex items-center justify-center gap-2 bg-gray-100 p-2 border-t">
              {actionButtons}
            </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const Icon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-${size} w-${size} ${className}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        {/* Path will be injected by specific icon components */}
    </svg>
);


export const HomeIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

export const ChartPieIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

export const CashIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const ReceiptRefundIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
);

export const DocumentReportIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ArrowCircleDownIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

export const ArrowCircleUpIcon: React.FC<IconProps> = ({ size = 5, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.472 5.373 5.562-1.451zm4.925-6.183c-.272-.136-1.606-.79-1.855-.879-.247-.088-.427-.136-.607.136-.179.273-.7 1.057-.857 1.271-.157.214-.314.243-.582.083-.27-.16-.921-.341-1.753-1.076-.65-.572-1.087-1.275-1.217-1.489-.133-.214-.014-.328.118-.443.118-.102.273-.273.409-.409.135-.136.179-.227.272-.38.093-.153.045-.285-.023-.416-.068-.132-.607-1.449-.832-1.986-.214-.512-.43-.443-.607-.443-.171 0-.363-.022-.534-.022s-.477.067-.727.339c-.25.273-1.057 1.027-1.057 2.502 0 1.46.93 2.899 1.057 3.099.128.2.983 1.58 2.394 2.203.387.162.684.258.904.331.22.072.414.064.55.038.163-.03.942-.383 1.077-.752.129-.355.129-.66.093-.752-.036-.093-.135-.135-.272-.243z"/>
    </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// FIX: Added missing ScaleIcon component
export const ScaleIcon: React.FC<IconProps> = ({ size = 6, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-${size} w-${size} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);
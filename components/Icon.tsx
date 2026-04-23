import React from 'react';

export type IconName = 
  | 'home' | 'search' | 'box' | 'heart' | 'shopping-bag' | 'bell' | 'user'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'arrow-left' | 'arrow-right' | 'arrow-up'
  | 'times' | 'plus' | 'check' | 'trash' | 'trash-alt' | 'pen' | 'edit'
  | 'star' | 'star-outline' | 'map-marker' | 'map-marker-alt' | 'store' | 'store-slash' | 'lock' | 'unlock'
  | 'motorcycle' | 'truck' | 'inbox' | 'ticket' | 'ticket-alt' | 'headset'
  | 'microphone' | 'stop' | 'phone' | 'phone-alt' | 'images' | 'shield' | 'crown'
  | 'camera' | 'print' | 'copy' | 'info' | 'info-circle' | 'exclamation' | 'exclamation-triangle' | 'menu' | 'eye'
  | 'bars' | 'shopping-cart' | 'facebook-f' | 'google' | 'apple' | 'whatsapp' | 'sign-out-alt' | 'history' | 'lightbulb' | 'bolt' | 'sync-alt' | 'expand-alt' | 'cubes' | 'user-shield' | 'user-cog' | 'truck-moving' | 'truck-fast' | 'shield-check' | 'shield-virus' | 'shield-alt' | 'sliders-h' | 'chart-line' | 'undo' | 'bullhorn' | 'id-badge' | 'file-invoice-dollar' | 'file-csv' | 'user-slash' | 'telegram-plane' | 'fire'
  | 'default';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  solid?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, className = '', solid = false, ...props }) => {
  const baseClass = `inline-block shrink-0 ${className}`;
  const accent = "text-emerald-500";
  const cc = "currentColor";
  const cleanName = name.replace(/fa[sbrl]?\s+fa-/, '').replace('fa-', '').replace('-alt', '');

  switch (cleanName) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 2L3 9v11a2 2 0 002 2h14a2 2 0 002-2V9l-9-7z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'bars':
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M4 6h16" stroke={cc} strokeWidth="2" strokeLinecap="round" />
          <path d="M4 12h16" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M4 18h16" stroke={cc} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="11" cy="11" r="7" stroke={cc} strokeWidth="2" />
          <path d="M20 20l-4-4" stroke={cc} className={accent} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'user':
    case 'users':
    case 'user-cog':
    case 'user-shield':
    case 'user-slash':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="12" cy="7" r="4" stroke={cc} strokeWidth="2" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" fill={solid ? cc : "none"} xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={solid ? '' : accent}/>
        </svg>
      );
    case 'shopping-bag':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6h18" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 10a4 4 0 01-8 0" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'shopping-cart':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="9" cy="21" r="1.5" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="21" r="1.5" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'cart':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="9" cy="21" r="2" stroke={cc} className={accent} strokeWidth="1.5" />
          <circle cx="20" cy="21" r="2" stroke={cc} className={accent} strokeWidth="1.5" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke={cc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 01-3.46 0" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'box':
    case 'box-open':
    case 'cubes':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'arrow-left':
    case 'chevron-left':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M15 18l-6-6 6-6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12h0" stroke={cc} className={accent} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'arrow-right':
    case 'chevron-right':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M9 18l6-6-6-6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'arrow-up':
    case 'chevron-up':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M18 15l-6-6-6 6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M6 9l6 6 6-6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'times':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M18 6L6 18M6 6l12 12" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12h0" stroke={cc} className={accent} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 5v14M5 12h14" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12h0" stroke={cc} className={accent} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M20 6L9 17l-5-5" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={accent}/>
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11v6M14 11v6" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'pen':
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 5l4 4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill={solid ? cc : "none"} xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={solid ? '' : accent}/>
        </svg>
      );
    case 'map-marker':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke={cc} className={accent} strokeWidth="2" />
        </svg>
      );
    case 'store':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'unlock':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 019.9-1" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'motorcycle':
    case 'truck-moving':
    case 'truck-fast':
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="5.5" cy="18.5" r="2.5" stroke={cc} className={accent} strokeWidth="2"/>
          <circle cx="18.5" cy="18.5" r="2.5" stroke={cc} className={accent} strokeWidth="2"/>
        </svg>
      );
    case 'inbox':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'ticket':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="2" y="5" width="20" height="14" rx="2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12a2 2 0 002-2V8M2 16v-2a2 2 0 002-2v6zM15 5v14M9 5v14" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4"/>
        </svg>
      );
    case 'headset':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1M3 19a2 2 0 002 2h1" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 18H5a2 2 0 01-2-2v-2a2 2 0 012-2h3M16 18h3a2 2 0 002-2v-2a2 2 0 00-2-2h-3" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'images':
    case 'image':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke={cc} className={accent} strokeWidth="2"/>
          <path d="M21 15l-5-5L5 21" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'shield':
    case 'shield-check':
    case 'shield-virus':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'info':
    case 'info-circle':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="12" cy="12" r="10" stroke={cc} strokeWidth="2" />
          <path d="M12 16v-4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="8" r="1.5" fill={cc} className={accent} />
        </svg>
      );
    case 'exclamation':
    case 'exclamation-triangle':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 9v4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="17" r="1" fill={cc} className={accent} />
        </svg>
      );
    case 'microphone':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'stop':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="6" y="6" width="12" height="12" rx="2" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'phone':
    case 'phone-alt':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke={cc} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={accent}/>
        </svg>
      );
    case 'camera':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke={cc} className={accent} strokeWidth="2"/>
        </svg>
      );
    case 'eye':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke={cc} className={accent} strokeWidth="2"/>
        </svg>
      );
    case 'copy':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'sign-out-alt':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16 17 21 12 16 7" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'print':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <polyline points="6 9 6 2 18 2 18 9" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="6" y="14" width="12" height="8" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'sync-alt':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
           <path d="M23 4v6h-6M1 20v-6h6" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
           <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'history':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
           <path d="M12 22a10 10 0 10-8.5-4.8" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
           <path d="M12 6v6l4 2" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bolt':
    case 'fire':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
           <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={accent}/>
        </svg>
      );
    case 'lightbulb':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
           <path d="M9 18h6M10 22h4" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
           <path d="M12 2a7 7 0 00-7 7c0 2 1.5 3.5 2.5 5h9c1-1.5 2.5-3 2.5-5a7 7 0 00-7-7z" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'facebook-f':
    case 'google':
    case 'apple':
    case 'whatsapp':
    case 'telegram-plane':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
           <circle cx="12" cy="12" r="10" stroke={cc} strokeWidth="2" />
           <circle cx="12" cy="12" r="4" stroke={cc} className={accent} strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClass} height="1em" width="1em" {...props}>
          <circle cx="12" cy="12" r="10" stroke={cc} strokeWidth="2" />
          <path d="M12 8v8M8 12h8" stroke={cc} className={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

export default Icon;

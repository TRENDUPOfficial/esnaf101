interface IconProps {
  className?: string;
}

const base = "h-5 w-5";

export function HomeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V21h14V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function ReceiptIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function BoxIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7.5 8.5-4 8.5 4-8.5 4-8.5-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7.5v9l8.5 4m0-9v9m0-9 8.5-4v9l-8.5 4" />
    </svg>
  );
}

export function UsersIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="9" cy="8" r="3.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 6.5A3.25 3.25 0 1 1 16 13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 14.5c2.8.3 5 2 5 5.5" />
    </svg>
  );
}

export function PlugIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v5M15 3v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 8h11v3.5A5.5 5.5 0 0 1 12 17a5.5 5.5 0 0 1-5.5-5.5V8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
    </svg>
  );
}

export function TrendingUpIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 16.5 10 10l4 4 6.5-6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 7.5h5v5" />
    </svg>
  );
}

export function CartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
      <circle cx="9.5" cy="20" r="1.25" />
      <circle cx="17" cy="20" r="1.25" />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4.5" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.6 3.5-8.4 15A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.3-2.25l-8.4-15a1.5 1.5 0 0 0-2.6 0Z" />
    </svg>
  );
}

export function LogoutIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h11m0 0-3-3m3 3-3 3" />
    </svg>
  );
}

export function BuildingIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 21h20M7 8h3M7 12h3M7 16h3M17 14h1M17 17h1" />
    </svg>
  );
}

export function ChevronDownIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function StoreIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18l-1 3.2a2 2 0 0 1-2 1.4v6.4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6.4a2 2 0 0 1-2-1.4L3 9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-4.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V21" />
    </svg>
  );
}

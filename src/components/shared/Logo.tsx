interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-7 w-7" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="112" y="136" width="288" height="248" rx="36" stroke="#2E5BFF" strokeWidth="20" />
      <rect x="150" y="104" width="36" height="52" rx="18" fill="#2E5BFF" />
      <rect x="326" y="104" width="36" height="52" rx="18" fill="#2E5BFF" />
      <circle cx="172" cy="212" r="28" stroke="#2E5BFF" strokeWidth="6" fill="none" />
      <circle cx="172" cy="212" r="18" fill="#2E5BFF" fillOpacity="0.15" />
      <circle cx="256" cy="212" r="28" stroke="#2E5BFF" strokeWidth="6" fill="none" />
      <circle cx="256" cy="212" r="18" fill="#2E5BFF" fillOpacity="0.15" />
      <circle cx="340" cy="212" r="28" stroke="#2E5BFF" strokeWidth="6" fill="none" />
      <circle cx="340" cy="212" r="18" fill="#2E5BFF" fillOpacity="0.15" />
      <circle cx="172" cy="296" r="28" stroke="#2E5BFF" strokeWidth="6" fill="none" />
      <circle cx="172" cy="296" r="18" fill="#2E5BFF" fillOpacity="0.15" />
      <circle cx="256" cy="296" r="28" fill="#2E5BFF" />
      <circle cx="256" cy="296" r="14" fill="white" />
      <circle cx="340" cy="296" r="28" stroke="#2E5BFF" strokeWidth="6" fill="none" />
      <circle cx="340" cy="296" r="18" fill="#2E5BFF" fillOpacity="0.15" />
    </svg>
  );
}

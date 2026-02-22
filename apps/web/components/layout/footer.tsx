'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/group') {
    return (
      <footer className="w-full border-t-2 border-black h-24 flex items-center justify-center">
        <button
          className="w-3/4 h-12 bg-black text-white rounded-lg text-base font-semibold"
        >
          Create Group
        </button>
      </footer>
    );
  };

  const tabs = [
    { name: 'meet', path: '/meet' },
    { name: 'schedule', path: '/schedule' },
    { name: 'profile', path: '/profile' },
    { name: 'setting', path: '/setting' },
  ];

  return (
    <footer className="w-full bg-white border-t-2 border-black h-20 flex items-center">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.name}
            className={`flex-1 text-center text-base ${isActive ? 'font-bold' : ''}`}
            onClick={() => router.push(tab.path)}
          >
            {tab.name}
          </button>
        );
      })}
    </footer>
  );
}
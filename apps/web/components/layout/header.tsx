'use client';

import { usePathname } from 'next/navigation';
import { Oswald } from 'next/font/google';

const topFont = Oswald({
    subsets: ['latin'],
  });

export function Header() {
  const pathname = usePathname();

  let pageTitle = '';
  if (pathname === '/profile') pageTitle = 'You';
  else if (pathname === '/meet') pageTitle = 'Meet';
  else if (pathname === '/schedule') pageTitle = 'Schedule';
  else pageTitle = '';

  return (
    <header className="w-full bg-white border-b-2 border-black flex justify-center items-center h-24">
      <h1 className="text-3xl font-semibold tracking-wide">
        {pageTitle && (
          <>
            <span className={`${topFont.className} text-5xl leading-none`}>{pageTitle[0]}</span>
            {pageTitle.slice(1)}
          </>
        )}
      </h1>
    </header>
  );
}
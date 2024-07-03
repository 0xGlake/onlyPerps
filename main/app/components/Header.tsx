'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed bg-gray-800 text-white p-4 flex justify-between items-center h-10 w-full">
      <Link href="/" className="hover:text-gray-300 transition-colors hover:bg-gray-700 rounded-full px-2">
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-10">
          <Image 
            src="/logo.png" 
            alt="OnlyPerps Logo"
            fill
            style={{objectFit: "contain"}}
            priority
          />
        </div>
        <span className="text-2xl font-bold">OnlyPerps</span>
      </div>
      </Link>
    </header>
  );
};

export default Header;

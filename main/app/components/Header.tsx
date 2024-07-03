'use client';

import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-1 flex justify-between items-center px-8">
      <Link href="/" className="hover:text-gray-300 transition-colors hover:bg-gray-700 p-3 rounded-full">
        <div className="text-2xl font-bold">OnlyPerps</div>
      </Link>
    </header>
  );
};

export default Header;

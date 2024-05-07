"use client"

import React, { useState } from 'react';

const TimeDropDown: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState('1D');
  const [isOpen, setIsOpen] = useState(false);

  const handleDropDownChange = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="hs-dropdown [--trigger:hover] relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <button
        id="hs-dropdown-hover-event"
        type="button"
        className="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
        {selectedOption}
        <svg
          className={`hs-dropdown-open:rotate-180 size-4 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="invisible-bridge absolute top-full left-0 w-full h-2 bg-transparent"
        onMouseEnter={handleMouseEnter}>
      </div>
      <div
        className={`hs-dropdown-menu absolute top-full left-0 transition-[opacity,margin] duration-300 hs-dropdown-open:opacity-100 mt-2 ${
          isOpen ? 'opacity-100' : 'opacity-0 invisible'
        } min-w-40 bg-white shadow-md rounded-lg`}
        aria-labelledby="hs-dropdown-hover-event">
        <a
          className={`flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
            selectedOption === '1D' ? 'bg-gray-100' : ''
          }`}
          href="#"
          onClick={() => handleDropDownChange('1D')}>
          1D
        </a>
        <a
          className={`flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
            selectedOption === '3D' ? 'bg-gray-100' : ''
          }`}
          href="#"
          onClick={() => handleDropDownChange('3D')}>
          3D
        </a>
        <a
          className={`flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
            selectedOption === '7D' ? 'bg-gray-100' : ''
          }`}
          href="#"
          onClick={() => handleDropDownChange('7D')}>
          7D
        </a>
      </div>
    </div>
  );
};

export default TimeDropDown;

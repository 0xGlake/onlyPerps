"use client"
import React, { useState } from 'react';

interface TimeDropDownProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

const TimeDropDown: React.FC<TimeDropDownProps> = ({ selectedOption, setSelectedOption }) => {
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
        className="hs-dropdown-toggle py-3 px-6 inline-flex items-center text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-300 text-gray-600 shadow-sm disabled:opacity-50 disabled:pointer-events-none">
        {selectedOption.replace(/-/g, ' ')}
        <svg
          className={`hs-dropdown-open:rotate-180 size-4 ml-1 ${
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
      className={`hs-dropdown-menu absolute top-full left-0 transition-[opacity,margin] duration-300 hs-dropdown-open:opacity-100 mt-2
        ${isOpen ? 'opacity-100' : 'opacity-0 invisible'} max-w-fit bg-white shadow-md rounded-lg`}
      aria-labelledby="hs-dropdown-hover-event">

      {['1-Day', '3-Days', '7-Days'].map((option) => {
        const isSelected = selectedOption === option;
        const itemClass = `flex items-center gap-x-3.5 py-2 px-7 rounded-lg text-sm text-gray-800 hover:bg-gray-300 focus:outline-none focus:bg-gray-100 ${
          isSelected ? 'bg-blue-300' : ''
        }`;

        return (
          <a
            key={option}
            className={itemClass}
            href="#"
            onClick={() => handleDropDownChange(option)}
          >
            {option.replace(/-/g, ' ')}
          </a>
        );
      })}
    </div>
    </div>
  );
};

export default TimeDropDown;

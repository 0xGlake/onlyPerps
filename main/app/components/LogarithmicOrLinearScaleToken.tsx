"use client"

import React from 'react';

interface LogarithmicOrLinearScaleTokenProps {
  isLogarithmic: boolean;
  setIsLogarithmic: (option: boolean) => void;
}

const LogarithmicOrLinearScaleToken: React.FC<LogarithmicOrLinearScaleTokenProps> = ({ isLogarithmic, setIsLogarithmic }) => {
  const handleCheckboxChange = () => {
    setIsLogarithmic(!isLogarithmic)
  }
  return (
    <>
      <label className='themeSwitcherTwo shadow-card relative inline-flex cursor-pointer select-none items-center justify-center rounded-md bg-white p-1 hover:bg-gray-300'>
        <input
          type='checkbox'
          className='sr-only'
          checked={isLogarithmic}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-300 ${
            !isLogarithmic ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}
        >
          <svg 
            className={`mr-1.5 ${!isLogarithmic ? 'stroke-current text-white' : 'stroke-current text-gray-500'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="21" x2="21" y2="21" />
            <line x1="3" y1="21" x2="3" y2="3" />
            <line x1="3" y1="21" x2="21" y2="3" />
          </svg>
          Linear
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-300 ${
            isLogarithmic ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}
        >
          <svg 
            className={`mr-1.5 ${isLogarithmic ? 'stroke-current text-white' : 'stroke-current text-gray-500'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="21" x2="21" y2="21" />
            <line x1="3" y1="21" x2="3" y2="3" />
            <path d="M3 21C7 14 13 7 21 3" />
          </svg>
          Logarithmic
        </span>
      </label>
    </>
  );

};

export default LogarithmicOrLinearScaleToken;

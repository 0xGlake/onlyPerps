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
          <svg className={`mr-1.5 ${!isLogarithmic ? 'stroke-current text-white' : 'stroke-current text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="20" x2="22" y2="20"></line><line x1="2" y1="4" x2="22" y2="4"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
          Linear
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-300 ${
            isLogarithmic ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}
        >
          <svg className={`mr-1.5 ${isLogarithmic ? 'stroke-current text-white' : 'stroke-current text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2v20h20"></path><path d="M2 20l7-8 4 4 7-8"></path></svg>
          Logarithmic
        </span>
      </label>
    </>
  )
};

export default LogarithmicOrLinearScaleToken;

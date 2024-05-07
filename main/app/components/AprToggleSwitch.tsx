"use client"
import React, { useState } from 'react';

const AprToggleSwitch: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <>
      <label className='themeSwitcherTwo shadow-card relative inline-flex cursor-pointer select-none items-center justify-center rounded-md bg-white p-1'>
        <input
          type='checkbox'
          className='sr-only'
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-500 ${
            !isChecked ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}
        >
          <svg className={`mr-1.5 ${isChecked ? 'stroke-current text-gray-500' : 'stroke-current text-white'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
          APR
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-500 ${
            isChecked ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}
        >
          <svg className={`mr-1.5 ${isChecked ? 'stroke-current text-white' : 'stroke-current text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Hourly Rate
        </span>
      </label>
    </>
  )
};

export default AprToggleSwitch;

"use client"
import React, { useState } from 'react';

interface AssetBaseToggleSwitchProps {
  isBase: boolean;
  setIsBase: (option: boolean) => void;
}

const AssetBaseToggleSwitch: React.FC<AssetBaseToggleSwitchProps> = ({ isBase, setIsBase }) => {

  const handleCheckboxChange = () => {
    setIsBase(!isBase)
  }

  return (
    <>
      <label className='themeSwitcherTwo shadow-card relative inline-flex cursor-pointer select-none items-center justify-center rounded-md bg-white p-1 hover:bg-gray-300'>
        <input
          type='checkbox'
          className='sr-only'
          checked={!isBase}
          onChange={handleCheckboxChange}/>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-300 ${
            isBase ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}>
          {/* <svg className={`mr-1.5 ${!isBase ? 'stroke-current text-gray-500' : 'stroke-current text-white'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg> */}
          <svg className={`mr-1.5 ${!isBase ? 'stroke-current text-gray-500 fill-gray-500' : 'stroke-current text-white fill-white'}`} width="20" height="20" viewBox="0 0 1024 1024" strokeWidth="0.0072">
            <path d="M200.99 814.55c-23.52-39.54-24.45-87.29-2.48-127.71l214.17-394.27h127.24l119.46 218.25 64.14-35.11-100.24-183.14h35.02v-73.14h-33.39l69.95-146.29H256l76.33 146.29h-39.76v73.14h36.84l-195.2 359.34c-34.39 63.34-32.93 138.11 3.91 200.04s101.86 98.91 173.91 98.91h89.3v-73.14h-89.3c-46-0.01-87.52-23.61-111.04-63.17z m175.68-668.26h202.14l-34.98 73.14H414.84l-38.17-73.14z" />
            <path d="M914.29 731.43V548.57H475.44v109.71H402.3v182.86h73.14v109.71H914.29V768h-73.14v-36.57h73.14z m-73.14-109.72v36.57h-36.57v-36.57h36.57z m-292.57 0h182.86v36.57H548.58v-36.57z m-73.14 109.72H658.3V768H475.44v-36.57z m73.14 146.28v-36.57h182.85v36.57H548.58z m292.57 0h-36.57v-36.57h36.57v36.57zM731.44 768v-36.57h36.57V768h-36.57z" />
          </svg>
          Base Amount
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[16px] text-sm font-medium transition-colors duration-300 ${
            !isBase ? 'text-white bg-[#3e538d]' : 'text-gray-500'
          }`}>
          <svg className={`mr-1.5 ${isBase ? 'stroke-current text-gray-500 fill-gray-500' : 'stroke-current text-white fill-white'}`} width="24" height="20" viewBox="15 3 40 50" strokeWidth="0.0072">
            <g id="SVGRepo_bgCarrier" strokeWidth="1"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.576"></g>
            <g id="SVGRepo_iconCarrier">
              <title>money</title>
              <path d="M59.16,11.18H12.83a5.39,5.39,0,0,0-5.22,5.56V39.18a6.77,6.77,0,0,0,1.88,4.38,5.54,5.54,0,0,0,3.34,1.26H59.16a5.47,5.47,0,0,0,5.23-5.64V16.74A5.4,5.4,0,0,0,59.16,11.18Zm1.34,21.7a12.27,12.27,0,0,0-7,7.74h-35a13,13,0,0,0-7-7.66V23A11.59,11.59,0,0,0,16,19.79a13,13,0,0,0,2.53-4.48h35a11.52,11.52,0,0,0,7,7.76v9.81Z"></path>
              <path d="M36,18c-5.09,0-9.21,4.45-9.21,9.94s4.12,9.93,9.21,9.93,9.21-4.45,9.21-9.93S41,18,36,18Zm.75,15.62v1.86H35.09V33.79a6.25,6.25,0,0,1-2.9-.79l.5-2.14a5.68,5.68,0,0,0,2.82.8c1,0,1.63-.4,1.63-1.13s-.54-1.14-1.8-1.6c-1.82-.66-3.06-1.58-3.06-3.36a3.31,3.31,0,0,1,2.88-3.27V20.55h1.68v1.63a5.82,5.82,0,0,1,2.45.6l-.49,2.08a5.26,5.26,0,0,0-2.46-.63c-1.1,0-1.46.51-1.46,1s.59,1,2,1.58c2,.77,2.83,1.78,2.83,3.43A3.43,3.43,0,0,1,36.71,33.66Z"></path>
            </g>
          </svg>
          USD Amount
        </span>
      </label>
    </>
  )
};

export default AssetBaseToggleSwitch;

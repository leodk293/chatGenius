import React from 'react'
import './styles.css'

export default function Loader() {
  return (
    <div className=' mt-10 flex flex-col items-center gap-5 h-auto'>
        <p className='font-bold text-2xl text-[#59509c]'>Loading</p>
        <span className='loader' />
    </div>
  )
}
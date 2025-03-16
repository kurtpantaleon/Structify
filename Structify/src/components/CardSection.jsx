import React from 'react'

function CardSection({title, subtitle, progress, active}) { //yyung active para sa pag highlight ng card
  return (
    <div className='relative w-83 h-55 rounded-xl border-2 border-white flex flex-col justify-between bg-[#30418B] cursor-pointer'>  
      <div>
        {/** place holder ng image */}
      </div>
      <div className=" h-20 border-t-2 border-white p-2  rounded-b-xl bg-[#1F274D] "> 
        <h3 className="text-white font-bold text-base">{title}</h3>
        <div className='flex justify-between items-center text-white'>              
          <span className=' font-light text-sm'>{subtitle}</span>
          {progress}
        </div>
      </div>
    </div>
  )
}

export default CardSection
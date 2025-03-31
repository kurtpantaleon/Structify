import React from 'react'
import { useState } from 'react';
import Header from '../../components/AdminHeader'
import AdminNavigationBar from '../../components/AdminNavigationBar'
import AdminSubHeading from '../../components/AdminSubHeading'

function adminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
        <Header />
        
        <AdminSubHeading 
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        />
        
        {isNavOpen && (
          <div className="w-20 border-r border-r border-white/20 bg-[#141a35]">
            <AdminNavigationBar />
          </div>
        )}
        
    </>
  )
}

export default adminPage;
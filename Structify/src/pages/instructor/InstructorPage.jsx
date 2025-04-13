import React, { useState } from 'react'
import Header from '../../components/AdminHeader'
import AdminSubHeading from '../../components/SubHeading'
import AdminNavigationBar from '../../components/AdminNavigationBar';

function instructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div>
        <Header/>
        <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Class" />
        {isNavOpen && (
            <div className="w-20 border-r border-white/20 bg-[#141a35]">
            <AdminNavigationBar />
            </div>
        )}
    </div>
  )
}

export default instructorPage
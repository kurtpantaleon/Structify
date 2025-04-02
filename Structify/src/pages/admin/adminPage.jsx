import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import SectionCard from '../../components/SectionCard';

function AdminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false); 

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Class"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        {/* Add Student Button inside Grid */}
        <div className="flex justify-end col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 py-3">
          <button className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition">
            Add Class
          </button>
        </div>
        <div className="max-w-7xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-scroll pr-2 space-y-6">
        
          {/* Section Cards */}
          <SectionCard sectionName="BSIT 3-1" instructor="Kurt Pantaleon" studentCount={50} />
          <SectionCard sectionName="BSIT 3-2" instructor="LeBron James" studentCount={45} />
          <SectionCard sectionName="BSIT 2-1" instructor="John Doe" studentCount={35} />
          <SectionCard sectionName="BSIT 1-2" instructor="Jane Smith" studentCount={40} />
          <SectionCard sectionName="BSIT 3-1" instructor="Kurt Pantaleon" studentCount={50} />
          <SectionCard sectionName="BSIT 3-2" instructor="LeBron James" studentCount={45} />
        </div>
      </div>
      
    </div>
  );
}

export default AdminPage;

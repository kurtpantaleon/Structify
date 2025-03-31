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

      {/* Card Grid */}
      <div className="max-w-7xl my-8 mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
        <SectionCard sectionName="BSIT 3-1" instructor="Kurt Pantaleon" studentCount={50} />
        <SectionCard sectionName="BSIT 3-2" instructor="LeBron James" studentCount={45} />
        <SectionCard sectionName="BSIT 2-1" instructor="John Doe" studentCount={35} />
        <SectionCard sectionName="BSIT 1-2" instructor="Jane Smith" studentCount={40} />
      </div>
    </div>
  );
}

export default AdminPage;

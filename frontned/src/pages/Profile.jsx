import React, { useState } from 'react';
import ProfileStats from '../components/Profile/ProfileStats';
import { FaUser, FaProjectDiagram, FaCog, FaLock } from 'react-icons/fa';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaLock /> }
  ];

  return (
    <div className="theme-bg pt-[80px]">
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent">
            <img 
              src="https://i.pravatar.cc/150?img=1" 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = '/default-avatar.png'}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold theme-text">John Doe</h1>
            <p className="theme-text-secondary">Full Stack Developer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b dark:border-light/10 border-primary/10 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-6 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-accent text-accent' 
                  : 'theme-text-secondary hover:text-accent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-80">
          {activeTab === 'overview' && <ProfileStats />}
          {/* Other tab contents will be added here */}
        </div>
      </div>
    </div>
  );
};

export default Profile;

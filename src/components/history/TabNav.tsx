import React from 'react';

export type TabType = 'history' | 'deals';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'history' as TabType, label: 'Try-On History' },
    { id: 'deals' as TabType, label: 'Deals For You' }
  ];

  return (
    <div className="flex items-center justify-center border-b border-gray-200 bg-white">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-base font-medium transition-colors duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'text-black border-black'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TabNav);
import React, { useState } from 'react';
import Header from '@/components/history/Header';
import Content from '@/components/history/Content';
import DealsContent from '@/components/history/DealsContent';
import TabNav, { TabType } from '@/components/history/TabNav';

const History: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  const [activeTab, setActiveTab] = useState<TabType>('history');

  return (
    <main>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'history' ? (
        <Content searchQuery={searchQuery} />
      ) : (
        <DealsContent searchQuery={searchQuery} />
      )}
    </main>
  );
};

export default React.memo(History);
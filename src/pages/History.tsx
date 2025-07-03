import React, { useState } from 'react';
import Header from '@/components/history/Header';
import Content from '@/components/history/Content';

const History: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(''); 

  return (
    <main>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Content searchQuery={searchQuery} />
    </main>
  );
};

export default React.memo(History);

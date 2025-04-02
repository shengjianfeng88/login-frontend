import Header from '@/components/history/Header'
import React from 'react'
import Content from '@/components/history/Content'
const History = () => {
  return (
    <main>
        <Header />
        <Content />
    </main>
  )
}

export default React.memo(History)
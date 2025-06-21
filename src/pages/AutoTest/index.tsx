import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './Upload';
import ResultsPage from './Results';
import HistoryPage from './History';
import { TestResult } from './Results';

const AutoTest: React.FC = () => {
  const [userImages, setUserImages] = useState<string[]>([]);
  const [clothingImages, setClothingImages] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImagesSelected = (
    newUserImages: string[],
    newClothingImages: string[]
  ) => {
    setUserImages(newUserImages);
    setClothingImages(newClothingImages);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <Routes>
          <Route
            path='/'
            element={<Navigate to='/auto-test/upload' replace />}
          />
          <Route
            path='/upload'
            element={<UploadPage onImagesSelected={handleImagesSelected} />}
          />
          <Route
            path='/results'
            element={
              userImages.length > 0 && clothingImages.length > 0 ? (
                <ResultsPage
                  userImages={userImages}
                  clothingImages={clothingImages}
                  testResults={testResults}
                  setTestResults={setTestResults}
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys}
                  loading={loading}
                  setLoading={setLoading}
                />
              ) : (
                <Navigate to='/auto-test/upload' replace />
              )
            }
          />
          <Route path='/history' element={<HistoryPage />} />
          <Route
            path='/*'
            element={<Navigate to='/auto-test/upload' replace />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default AutoTest;

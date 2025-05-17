import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './Upload';
import ResultsPage from './Results';

const AutoTest: React.FC = () => {
    const [userImages, setUserImages] = useState<string[]>([]);
    const [clothingImages, setClothingImages] = useState<string[]>([]);

    const handleImagesSelected = (newUserImages: string[], newClothingImages: string[]) => {
        setUserImages(newUserImages);
        setClothingImages(newClothingImages);
    };

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/auto-test/upload" replace />}
            />
            <Route
                path="/upload"
                element={
                    <UploadPage onImagesSelected={handleImagesSelected} />
                }
            />
            <Route
                path="/results"
                element={
                    userImages.length > 0 && clothingImages.length > 0 ? (
                        <ResultsPage
                            userImages={userImages}
                            clothingImages={clothingImages}
                        />
                    ) : (
                        <Navigate to="/auto-test/upload" replace />
                    )
                }
            />
            <Route
                path="*"
                element={<Navigate to="/auto-test/upload" replace />}
            />
        </Routes>
    );
};

export default AutoTest; 
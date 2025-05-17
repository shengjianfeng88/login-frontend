import React, { useState } from 'react';
import { Button, Typography, Upload, Modal, Tabs, message } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

interface UploadProps {
    onImagesSelected: (userImages: string[], clothingImages: string[]) => void;
}

const UploadPage: React.FC<UploadProps> = ({ onImagesSelected }) => {
    const [userImages, setUserImages] = useState<string[]>([]);
    const [clothingImages, setClothingImages] = useState<string[]>([]);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadType, setUploadType] = useState<'user' | 'clothing'>('user');
    const navigate = useNavigate();

    const handleUploadUser = () => {
        setUploadType('user');
        setUploadModalVisible(true);
    };

    const handleUploadClothing = () => {
        setUploadType('clothing');
        setUploadModalVisible(true);
    };

    const handleAddImage = (type: 'user' | 'clothing') => {
        const newImage = type === 'user'
            ? 'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20a%20diverse%20person%20in%20casual%20clothing%20against%20neutral%20background%2C%20studio%20lighting%2C%20fashion%20photography%2C%20natural%20poses%2C%20minimalist%20style%2C%20high%20quality&width=300&height=400&seq=' + Date.now() + '&orientation=portrait'
            : 'https://readdy.ai/api/search-image?query=elegant%20clothing%20item%20on%20white%20background%2C%20fashion%20product%20photography%2C%20studio%20lighting%2C%20clean%20presentation%2C%20high%20quality%20clothing%20item&width=300&height=400&seq=' + Date.now() + '&orientation=portrait';
        if (type === 'user') {
            setUserImages(prev => [...prev, newImage]);
        } else {
            setClothingImages(prev => [...prev, newImage]);
        }
    };

    const handleRemoveUserImage = (index: number) => {
        setUserImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveClothingImage = (index: number) => {
        setClothingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartCombinations = () => {
        if (userImages.length > 0 && clothingImages.length > 0) {
            onImagesSelected(userImages, clothingImages);
            navigate('/auto-test/results');
        } else {
            message.warning('请至少上传一张用户图片和一张服装图片');
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        beforeUpload: (file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    if (uploadType === 'user') {
                        setUserImages(prev => [...prev, e.target.result as string]);
                    } else {
                        setClothingImages(prev => [...prev, e.target.result as string]);
                    }
                }
            };
            reader.readAsDataURL(file);
            return false;
        },
        showUploadList: false,
        onChange: (info: any) => {
            if (info.file.status === 'done') {
                setUploadModalVisible(false);
            }
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Title level={2} className="mb-8 text-center">Virtual Try-On Model Testing System</Title>
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <Title level={4} className="m-0">INPUT 1 (USER IMAGE)</Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleUploadUser}
                                className="!rounded-button whitespace-nowrap"
                            >
                                Add Images
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {userImages.map((image, index) => (
                                    <div key={index} className="relative w-full h-48 overflow-hidden rounded-md">
                                        <img src={image} alt={`User ${index + 1}`} className="w-full h-full object-cover object-top" />
                                        <Button
                                            icon={<DeleteOutlined />}
                                            className="absolute top-2 right-2 !rounded-button whitespace-nowrap bg-white/80 hover:bg-white/90"
                                            onClick={() => handleRemoveUserImage(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                            {userImages.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={handleUploadUser}
                                >
                                    <UploadOutlined className="text-4xl text-gray-400 mb-4" />
                                    <p className="text-gray-500">Click to upload user images</p>
                                    <p className="text-gray-400 text-sm">Recommended size: 600x800px</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <Title level={4} className="m-0">INPUT 2 (CLOTHING)</Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleUploadClothing}
                                className="!rounded-button whitespace-nowrap"
                            >
                                Add Images
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {clothingImages.map((image, index) => (
                                    <div key={index} className="relative w-full h-48 overflow-hidden rounded-md">
                                        <img src={image} alt={`Clothing ${index + 1}`} className="w-full h-full object-cover object-top" />
                                        <Button
                                            icon={<DeleteOutlined />}
                                            className="absolute top-2 right-2 !rounded-button whitespace-nowrap bg-white/80 hover:bg-white/90"
                                            onClick={() => handleRemoveClothingImage(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                            {clothingImages.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={handleUploadClothing}
                                >
                                    <UploadOutlined className="text-4xl text-gray-400 mb-4" />
                                    <p className="text-gray-500">Click to upload clothing images</p>
                                    <p className="text-gray-400 text-sm">Recommended size: 600x800px</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <Button
                        type="primary"
                        size="large"
                        disabled={userImages.length === 0 || clothingImages.length === 0}
                        onClick={handleStartCombinations}
                        className="px-8 !rounded-button whitespace-nowrap"
                    >
                        Start Combinations ({userImages.length} × {clothingImages.length} = {userImages.length * clothingImages.length} combinations)
                    </Button>
                </div>
            </div>
            <Modal
                title={`Upload ${uploadType === 'user' ? 'User' : 'Clothing'} Images`}
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setUploadModalVisible(false)} className="!rounded-button whitespace-nowrap">
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                            handleAddImage(uploadType);
                            setUploadModalVisible(false);
                        }}
                        className="!rounded-button whitespace-nowrap"
                    >
                        Add Sample Image
                    </Button>,
                ]}
                width={600}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Upload Files" key="1">
                        <Dragger {...uploadProps} className="mb-4">
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag files to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for single or bulk upload. Recommended size: 600x800px
                            </p>
                        </Dragger>
                    </TabPane>
                    <TabPane tab="From Folder" key="2">
                        <div className="p-4 border border-dashed border-gray-300 rounded-md">
                            <div className="flex items-center justify-between mb-4">
                                <Text>Select folder to import images</Text>
                                <Button
                                    type="primary"
                                    icon={<i className="fas fa-folder-open mr-2" />}
                                    className="!rounded-button whitespace-nowrap"
                                >
                                    Browse Folders
                                </Button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <Text type="secondary">No folder selected</Text>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
};

export default UploadPage; 
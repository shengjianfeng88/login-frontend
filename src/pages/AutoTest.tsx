// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from 'react';
import { Button, Table, Checkbox, Dropdown, Menu, Rate, Tooltip, Progress, Typography, Card, Tabs, Upload, Modal } from 'antd';
import { UploadOutlined, StarOutlined, EditOutlined, FilterOutlined, CaretDownOutlined, DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as echarts from 'echarts';
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;
interface TestResult {
    key: string;
    testNo: string;
    userImage: string;
    clothingImage: string;
    generatedResult: string;
    rating: number;
    previousResult: string;
    previousRating: string;
}
interface TestHistory {
    id: number;
    name: string;
    version: string;
    date: string;
    score: number;
}
const AutoTest: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'upload' | 'results'>('upload');
    const [userImages, setUserImages] = useState<string[]>([]);
    const [clothingImages, setClothingImages] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadType, setUploadType] = useState<'user' | 'clothing'>('user');
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    useEffect(() => {
        if (currentPage === 'results') {
            const generateTestResults = () => {
                const results: TestResult[] = [];
                let counter = 1;
                userImages.forEach((userImg) => {
                    clothingImages.forEach((clothingImg) => {
                        results.push({
                            key: counter.toString(),
                            testNo: `#${counter.toString().padStart(3, '0')}`,
                            userImage: userImg,
                            clothingImage: clothingImg,
                            generatedResult: `https://readdy.ai/api/search-image?query=person%20wearing%20fashionable%20clothing%2C%20full%20body%20shot%2C%20neutral%20background%2C%20studio%20lighting%2C%20fashion%20photography%2C%20professional%20pose%2C%20high%20quality&width=120&height=150&seq=${counter + 2000}&orientation=portrait`,
                            rating: Math.floor(Math.random() * 3) + 3,
                            previousResult: `https://readdy.ai/api/search-image?query=person%20in%20stylish%20outfit%2C%20full%20body%20shot%2C%20neutral%20background%2C%20studio%20lighting%2C%20fashion%20photography%2C%20professional%20pose%2C%20high%20quality&width=120&height=150&seq=${counter + 3000}&orientation=portrait`,
                            previousRating: `评分: ${Math.floor(Math.random() * 3) + 2}/5`,
                        });
                        counter++;
                    });
                });
                setTestResults(results);
            };
            generateTestResults();
        }
    }, [currentPage, userImages, clothingImages]);
    const testHistory: TestHistory[] = [
        { id: 1, name: 'Initial Test', version: 'v10', date: '2025-05-15 10:30', score: 3.8 },
        { id: 2, name: 'Beta Test', version: 'v9', date: '2025-05-14 15:45', score: 3.5 },
        { id: 3, name: 'Alpha Test', version: 'v8', date: '2025-05-13 09:20', score: 3.2 },
    ];
    const columns: ColumnsType<TestResult> = [
        {
            title: 'TEST NO.',
            dataIndex: 'testNo',
            key: 'testNo',
            width: 80,
            className: 'whitespace-nowrap',
        },
        {
            title: 'INPUT 1 (USER IMAGE)',
            dataIndex: 'userImage',
            key: 'userImage',
            width: 150,
            render: (image) => (
                <div className="w-28 h-36 overflow-hidden">
                    <img src={image} alt="User" className="w-full h-full object-cover object-top" />
                </div>
            ),
        },
        {
            title: 'INPUT 2 (CLOTHING)',
            dataIndex: 'clothingImage',
            key: 'clothingImage',
            width: 150,
            render: (image) => (
                <div className="w-28 h-36 overflow-hidden">
                    <img src={image} alt="Clothing" className="w-full h-full object-cover object-top" />
                </div>
            ),
        },
        {
            title: 'GENERATED RESULT (V11)',
            dataIndex: 'generatedResult',
            key: 'generatedResult',
            width: 150,
            render: (image) => (
                <div className="w-28 h-36 overflow-hidden">
                    <img src={image} alt="Generated Result" className="w-full h-full object-cover object-top" />
                </div>
            ),
        },
        {
            title: 'RATING (1-5)',
            dataIndex: 'rating',
            key: 'rating',
            width: 150,
            render: (rating) => <Rate disabled defaultValue={rating} />,
        },
        {
            title: 'PREVIOUS RESULT (V10)',
            dataIndex: 'previousResult',
            key: 'previousResult',
            width: 150,
            render: (image, record) => (
                <div className="w-28 h-36 overflow-hidden relative">
                    <img src={image} alt="Previous Result" className="w-full h-full object-cover object-top" />
                    <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-xs">
                        {record.previousRating}
                    </div>
                </div>
            ),
        },
    ];
    const handleStartCombinations = () => {
        if (userImages.length > 0 && clothingImages.length > 0) {
            setCurrentPage('results');
        }
    };
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
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const handleFilterRating = (rating: number | null) => {
        setFilterRating(rating);
        setDropdownVisible(false);
    };
    const filterMenu = (
        <Menu className="py-2 bg-white shadow-lg rounded-md">
            <div className="px-4 py-2 border-b border-gray-100">
                <Text strong>Filter by Rating</Text>
            </div>
            <Menu.Item key="1" onClick={() => handleFilterRating(1)}>
                <div className="flex items-center px-2">
                    <span>1 Star</span>
                </div>
            </Menu.Item>
            <Menu.Item key="2" onClick={() => handleFilterRating(2)}>
                <div className="flex items-center px-2">
                    <span>2 Stars</span>
                </div>
            </Menu.Item>
            <Menu.Item key="3" onClick={() => handleFilterRating(3)}>
                <div className="flex items-center px-2">
                    <span>3 Stars</span>
                </div>
            </Menu.Item>
            <Menu.Item key="4" onClick={() => handleFilterRating(4)}>
                <div className="flex items-center px-2">
                    <span>4 Stars</span>
                </div>
            </Menu.Item>
            <Menu.Item key="5" onClick={() => handleFilterRating(5)}>
                <div className="flex items-center px-2">
                    <span>5 Stars</span>
                </div>
            </Menu.Item>
            <div className="mt-2 px-4 py-2 border-t border-gray-100">
                <Button
                    className="w-full !rounded-button whitespace-nowrap"
                    onClick={() => handleFilterRating(null)}
                >
                    Clear Filter
                </Button>
            </div>
        </Menu>
    );
    useEffect(() => {
        if (currentPage === 'results') {
            const chartDom = document.getElementById('improvement-chart');
            if (chartDom) {
                const myChart = echarts.init(chartDom);
                const option = {
                    animation: false,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['v8', 'v9', 'v10', 'v11'],
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            min: 3,
                            max: 5
                        }
                    ],
                    series: [
                        {
                            name: 'Average Score',
                            type: 'bar',
                            barWidth: '60%',
                            data: [
                                { value: 3.2, itemStyle: { color: '#8884d8' } },
                                { value: 3.5, itemStyle: { color: '#8884d8' } },
                                { value: 3.8, itemStyle: { color: '#8884d8' } },
                                { value: 4.2, itemStyle: { color: '#4caf50' } }
                            ]
                        }
                    ]
                };
                myChart.setOption(option);
            }
        }
    }, [currentPage]);
    const filteredResults = filterRating
        ? testResults.filter(item => item.rating === filterRating)
        : testResults;
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
    if (currentPage === 'upload') {
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
                    visible={uploadModalVisible}
                    onCancel={() => setUploadModalVisible(false)}
                    footer={[
                        <Button key="back" onClick={() => setUploadModalVisible(false)} className="!rounded-button whitespace-nowrap">
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={() => {
                                // Add a sample image for demo purposes
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
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <Title level={3} className="m-0">Virtual Try-On Model Testing System</Title>
                    <div className="flex gap-4">
                        <Button
                            className="!rounded-button whitespace-nowrap"
                            onClick={() => setCurrentPage('upload')}
                            icon={<UploadOutlined />}
                        >
                            Upload Images
                        </Button>
                        <Button
                            type="primary"
                            disabled={selectedRowKeys.length === 0}
                            className="!rounded-button whitespace-nowrap"
                        >
                            Test Selected
                        </Button>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <Text strong>Test Progress</Text>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <Text type="secondary">Current Version (v11) Avg Score</Text>
                                <div className="text-2xl font-bold">4.2</div>
                            </div>
                            <div className="text-center">
                                <Text type="secondary">Previous Version (v10) Avg Score</Text>
                                <div className="text-2xl font-bold">3.8</div>
                            </div>
                            <div className="text-center">
                                <Text type="secondary">Improvement</Text>
                                <div className="text-2xl font-bold text-green-500">+10.5%</div>
                            </div>
                        </div>
                    </div>
                    <Progress percent={100} showInfo={false} strokeColor="#4caf50" />
                    <div className="flex justify-between mt-2">
                        <Text type="secondary">5/5 Completed</Text>
                        <div className="h-6 w-32" id="improvement-chart"></div>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="flex-grow">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Checkbox onChange={(e) => e.target.checked ? setSelectedRowKeys(testResults.map(item => item.key)) : setSelectedRowKeys([])}>
                                    Select All
                                </Checkbox>
                                <div className="flex items-center">
                                    <Text className="mr-2">Filter by Rating:</Text>
                                    <Dropdown
                                        overlay={filterMenu}
                                        trigger={['click']}
                                        visible={dropdownVisible}
                                        onVisibleChange={(visible) => setDropdownVisible(visible)}
                                    >
                                        <Button
                                            className="flex items-center !rounded-button whitespace-nowrap"
                                            icon={<FilterOutlined />}
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            {filterRating ? `${filterRating} Star${filterRating > 1 ? 's' : ''}` : 'All Ratings'} <CaretDownOutlined />
                                        </Button>
                                    </Dropdown>
                                </div>
                            </div>
                            <Table
                                rowSelection={rowSelection}
                                columns={columns}
                                dataSource={filteredResults}
                                pagination={false}
                                rowKey="key"
                                className="test-results-table"
                            />
                        </div>
                    </div>
                    <div className="w-80">
                        <Card className="shadow-md">
                            <Title level={4} className="mb-4">Test History</Title>
                            {testHistory.map((test) => (
                                <Card
                                    key={test.id}
                                    className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <Text strong>{test.name}</Text>
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            size="small"
                                            className="!rounded-button whitespace-nowrap"
                                        />
                                    </div>
                                    <div className="text-gray-500 text-sm mb-2">
                                        {test.version}
                                        <br />
                                        {test.date}
                                    </div>
                                    <Rate disabled defaultValue={test.score} />
                                    <Text className="ml-2">{test.score.toFixed(1)}</Text>
                                </Card>
                            ))}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AutoTest

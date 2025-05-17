import React, { useState, useEffect } from 'react';
import { Button, Table, Checkbox, Dropdown, Menu, Rate, Typography, Card, Progress, message } from 'antd';
import { UploadOutlined, EditOutlined, FilterOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import { tryonApi } from '../../api/tryon';

const { Title, Text } = Typography;

interface TestResult {
    key: string;
    testNo: string;
    userImage: string;
    clothingImage: string;
    generatedResult: string;
    rating: number;
    previousResult: string;
    previousRating: string;
    progress?: boolean;
    completedSteps?: number;
    estimatedSteps?: number;
}

interface TestHistory {
    id: number;
    name: string;
    version: string;
    date: string;
    score: number;
}

interface ResultsProps {
    userImages: string[];
    clothingImages: string[];
}

const ResultsPage: React.FC<ResultsProps> = ({ userImages, clothingImages }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    useEffect(() => {
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
    }, [userImages, clothingImages]);

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
            title: 'GENERATED RESULT',
            dataIndex: 'generatedResult',
            key: 'generatedResult',
            width: 150,
            render: (image, record: TestResult) => (
                <div className="w-28 h-36 overflow-hidden relative">
                    <img src={image} alt="Generated Result" className="w-full h-full object-cover object-top" />
                    {record.progress && record.completedSteps !== undefined && record.estimatedSteps !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                            <Progress
                                percent={Math.round((record.completedSteps / record.estimatedSteps) * 100)}
                                size="small"
                                showInfo={false}
                                strokeColor="#4caf50"
                            />
                        </div>
                    )}
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
            title: 'PREVIOUS RESULT',
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

    const handleTestSelected = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要测试的项目');
            return;
        }

        setLoading(true);
        const selectedResults = testResults.filter(item => selectedRowKeys.includes(item.key));
        const newProcessingTasks = new Set<string>();

        try {
            const tryonPromises = selectedResults.map(async (result) => {
                try {
                    const response = await tryonApi.startTryon(result.userImage, result.clothingImage);
                    newProcessingTasks.add(response.task_id);
                    return response;
                } catch (error) {
                    message.error(`试穿请求失败: ${result.testNo}`);
                    return null;
                }
            });

            const responses = await Promise.all(tryonPromises);
            setProcessingTasks(newProcessingTasks);

            const taskIds = responses.filter(r => r !== null).map(r => r!.task_id);
            if (taskIds.length > 0) {
                pollTaskStatus(taskIds);
            }
        } catch (error) {
            message.error('批量试穿请求失败');
        } finally {
            setLoading(false);
        }
    };

    const pollTaskStatus = async (taskIds: string[]) => {
        const checkStatus = async () => {
            const statusPromises = taskIds.map(async (taskId) => {
                try {
                    const status = await tryonApi.getTaskStatus(taskId);
                    return { taskId, status };
                } catch (error) {
                    console.error(`获取任务状态失败: ${taskId}`, error);
                    return null;
                }
            });

            const results = await Promise.all(statusPromises);
            const completedTasks = new Set<string>();

            results.forEach((result) => {
                if (result) {
                    const { taskId, status } = result;
                    const resultIndex = testResults.findIndex(r => r.key === selectedRowKeys[taskIds.indexOf(taskId)]);

                    if (resultIndex !== -1) {
                        if (status.status === 'COMPLETED') {
                            completedTasks.add(taskId);
                            if (status.image_urls && status.image_urls.length > 0) {
                                const newResults = [...testResults];
                                newResults[resultIndex] = {
                                    ...newResults[resultIndex],
                                    generatedResult: status.image_urls[0],
                                    rating: Math.floor(Math.random() * 3) + 3,
                                    previousResult: newResults[resultIndex].generatedResult,
                                    previousRating: `评分: ${newResults[resultIndex].rating}/5`,
                                    progress: undefined,
                                    completedSteps: undefined,
                                    estimatedSteps: undefined
                                };
                                setTestResults(newResults);
                                message.success(`测试项 ${newResults[resultIndex].testNo} 已完成`);
                            }
                        } else if (status.status === 'FAILED') {
                            completedTasks.add(taskId);
                            message.error(`试穿任务失败: ${taskId}`);
                        } else if (status.status === 'IN_PROGRESS' || status.status === 'IN_QUEUE') {
                            const newResults = [...testResults];
                            newResults[resultIndex] = {
                                ...newResults[resultIndex],
                                progress: true,
                                completedSteps: status.completed_steps,
                                estimatedSteps: status.estimated_steps
                            };
                            setTestResults(newResults);
                            const progress = Math.round((status.completed_steps / status.estimated_steps) * 100);
                            message.loading(`测试项 ${testResults[resultIndex].testNo} 处理中: ${progress}%`);
                        }
                    }
                }
            });

            setProcessingTasks(prev => {
                const newSet = new Set(prev);
                completedTasks.forEach(taskId => newSet.delete(taskId));
                return newSet;
            });

            if (completedTasks.size < taskIds.length) {
                setTimeout(checkStatus, 5000); // 每5秒检查一次
            } else {
                message.success('所有测试项处理完成');
            }
        };

        checkStatus();
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
    }, []);

    const filteredResults = filterRating
        ? testResults.filter(item => item.rating === filterRating)
        : testResults;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <Title level={3} className="m-0">Virtual Try-On Model Testing System</Title>
                    <div className="flex gap-4">
                        <Button
                            className="!rounded-button whitespace-nowrap"
                            onClick={() => navigate('/auto-test/upload')}
                            icon={<UploadOutlined />}
                        >
                            Upload Images
                        </Button>
                        <Button
                            type="primary"
                            disabled={selectedRowKeys.length === 0 || loading}
                            loading={loading}
                            onClick={handleTestSelected}
                            className="!rounded-button whitespace-nowrap"
                        >
                            {loading ? 'Processing...' : 'Test Selected'}
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

export default ResultsPage; 
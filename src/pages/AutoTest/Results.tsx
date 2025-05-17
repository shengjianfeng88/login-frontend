import React, { useState, useEffect } from 'react';
import { Button, Table, Checkbox, Dropdown, Menu, Rate, Typography, Card, Progress, message, Image } from 'antd';
import { UploadOutlined, EditOutlined, FilterOutlined, CaretDownOutlined, HistoryOutlined, SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import { tryonApi } from '../../api/tryon';

const { Title, Text } = Typography;

export interface TestResult {
    key: string;
    testNo: string;
    userImage: string;
    clothingImage: string;
    generatedResult: string;
    taskId?: string;
    status?: string;
    progress?: boolean;
    completedSteps?: number;
    estimatedSteps?: number;
    error?: string;
    executionTime?: number;
    delayTime?: number;
    cost?: number;
}

interface TestHistory {
    id: number;
    name: string;
    version: string;
    date: string;
    score: number;
}

export interface TestResultsTableProps {
    testResults: TestResult[];
    selectedRowKeys: React.Key[];
    onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({
    testResults,
    selectedRowKeys,
    onSelectChange,
}) => {
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
                    <Image
                        src={image}
                        alt="User"
                        className="w-full h-full object-cover object-top"
                        preview={{
                            mask: '点击预览',
                            maskClassName: 'flex items-center justify-center'
                        }}
                    />
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
                    <Image
                        src={image}
                        alt="Clothing"
                        className="w-full h-full object-cover object-top"
                        preview={{
                            mask: '点击预览',
                            maskClassName: 'flex items-center justify-center'
                        }}
                    />
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
                    {record.status === 'COMPLETED' && image ? (
                        <Image
                            src={image}
                            alt="Generated Result"
                            className="w-full h-full object-cover object-top"
                            preview={{
                                mask: '点击预览',
                                maskClassName: 'flex items-center justify-center'
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            {record.progress && record.completedSteps !== undefined && record.estimatedSteps !== undefined ? (
                                <>
                                    <Progress
                                        percent={Math.round((record.completedSteps / record.estimatedSteps) * 100)}
                                        size="small"
                                        showInfo={false}
                                        strokeColor="#4caf50"
                                    />
                                    <Text type="secondary" className="mt-1 text-xs">
                                        {record.completedSteps}/{record.estimatedSteps}
                                    </Text>
                                </>
                            ) : record.status === 'FAILED' ? (
                                <Text type="danger">Failed</Text>
                            ) : (
                                <Text type="secondary">Waiting</Text>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'TASK ID',
            dataIndex: 'taskId',
            key: 'taskId',
            width: 200,
            className: 'whitespace-nowrap',
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            className: 'whitespace-nowrap',
            render: (status) => (
                <span className={`${status === 'COMPLETED' ? 'text-green-500' :
                    status === 'FAILED' ? 'text-red-500' :
                        status === 'IN_PROGRESS' || status === 'IN_QUEUE' || status === 'EXECUTING' ? 'text-blue-500' :
                            'text-gray-500'
                    }`}>
                    {status || 'Not Started'}
                </span>
            ),
        },
        {
            title: 'INFO',
            dataIndex: 'info',
            key: 'info',
            width: 200,
            className: 'whitespace-nowrap',
            render: (_, record) => {
                if (record.status === 'COMPLETED') {
                    return (
                        <div className="text-xs">
                            <div>执行时间: {record.executionTime?.toFixed(2)}ms</div>
                            <div>延迟时间: {record.delayTime?.toFixed(2)}ms</div>
                            <div>成本: {record.cost?.toFixed(4)}</div>
                        </div>
                    );
                }
                return '-';
            },
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <Checkbox onChange={(e) => e.target.checked ? onSelectChange(testResults.map(item => item.key)) : onSelectChange([])}>
                    Select All
                </Checkbox>
            </div>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={testResults}
                pagination={false}
                rowKey="key"
                className="test-results-table"
            />
        </div>
    );
};

export interface ResultsProps {
    userImages: string[];
    clothingImages: string[];
    testResults: TestResult[];
    setTestResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    processingTasks: Set<string>;
    setProcessingTasks: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const ResultsPage: React.FC<ResultsProps> = ({
    userImages,
    clothingImages,
    testResults,
    setTestResults,
    selectedRowKeys,
    setSelectedRowKeys,
    loading,
    setLoading,
    processingTasks,
    setProcessingTasks
}) => {
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // 只在 testResults 为空时初始化
        if (testResults.length === 0) {
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
                            generatedResult: '',
                            taskId: undefined,
                            status: undefined,
                            progress: false,
                            completedSteps: 0,
                            estimatedSteps: 1,
                            error: undefined
                        });
                        counter++;
                    });
                });
                setTestResults(results);
            };
            generateTestResults();
        }
    }, [userImages, clothingImages, setTestResults, testResults.length]);

    const handleTestSelected = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要测试的项目');
            return;
        }

        setLoading(true);
        const selectedResults = testResults.filter(item => selectedRowKeys.includes(item.key));
        const newProcessingTasks = new Set<string>();

        try {
            // 先获取所有任务的响应
            const responses = await Promise.all(
                selectedResults.map(result =>
                    tryonApi.startTryon(result.userImage, result.clothingImage)
                        .catch(error => {
                            message.error(`试穿请求失败: ${result.testNo}`);
                            return null;
                        })
                )
            );

            // 过滤出成功的响应
            const validResponses = responses.filter(r => r !== null);

            // 一次性更新所有任务的状态
            const newResults = [...testResults];
            validResponses.forEach((response, index) => {
                if (response) {
                    const resultIndex = newResults.findIndex(r => r.key === selectedResults[index].key);
                    if (resultIndex !== -1) {
                        newProcessingTasks.add(response.task_id);
                        newResults[resultIndex] = {
                            ...newResults[resultIndex],
                            taskId: response.task_id,
                            status: 'IN_QUEUE',
                            progress: true,
                            completedSteps: 0,
                            estimatedSteps: response.estimated_steps || 1,
                            error: undefined
                        };
                    }
                }
            });

            // 一次性更新状态
            setTestResults(newResults);
            setProcessingTasks(newProcessingTasks);

            // 开始轮询任务状态
            const taskIds = validResponses.map(r => r!.task_id);
            if (taskIds.length > 0) {
                pollTaskStatus(taskIds, newResults);
            }
        } catch (error) {
            message.error('批量试穿请求失败');
        } finally {
            setLoading(false);
        }
    };

    const pollTaskStatus = async (taskIds: string[], newResults: TestResult[]) => {
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

            console.log(results, '~~~~~~1111122222');
            results.forEach((result) => {
                if (result) {
                    const { taskId, status } = result;
                    const resultIndex = newResults.findIndex(r =>
                        selectedRowKeys.includes(r.key) && r.taskId === taskId
                    );

                    console.log(resultIndex, newResults, taskId, '~~~~~~111114444444');
                    if (resultIndex !== -1) {
                        if (status.status === 'COMPLETED') {
                            completedTasks.add(taskId);
                            newResults[resultIndex] = {
                                ...newResults[resultIndex],
                                generatedResult: status.image_urls?.[0] || '',
                                status: status.status,
                                progress: false,
                                completedSteps: status.completed_steps,
                                estimatedSteps: status.estimated_steps,
                                executionTime: status.execution_time,
                                delayTime: status.delay_time,
                                cost: status.cost,
                                error: status.error
                            };
                        } else if (status.status === 'FAILED') {
                            completedTasks.add(taskId);
                            newResults[resultIndex] = {
                                ...newResults[resultIndex],
                                status: status.status,
                                error: status.error || '任务执行失败',
                                completedSteps: status.completed_steps,
                                estimatedSteps: status.estimated_steps
                            };
                            message.error(`试穿任务失败: ${taskId}`);
                        } else if (status.status === 'EXECUTING' || status.status === 'IN_QUEUE' || status.status === 'IN_PROGRESS') {
                            newResults[resultIndex] = {
                                ...newResults[resultIndex],
                                status: status.status,
                                progress: true,
                                completedSteps: status.completed_steps,
                                estimatedSteps: status.estimated_steps
                            };
                            console.log(newResults, '~~~~~~111113333333');
                        }
                    }
                }
            });

            setTestResults(newResults);
            setProcessingTasks(prev => {
                const newSet = new Set(prev);
                completedTasks.forEach(taskId => newSet.delete(taskId));
                return newSet;
            });

            if (completedTasks.size < taskIds.length) {
                setTimeout(checkStatus, 2000);
            } else {
                message.success('所有测试项处理完成');
            }
        };

        checkStatus();
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

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

    const handleSaveResults = async () => {
        if (testResults.length === 0) {
            message.warning('没有可保存的测试结果');
            return;
        }

        // 检查是否所有任务都已完成
        const hasUnfinishedTasks = testResults.some(
            result => result.status && ['IN_PROGRESS', 'IN_QUEUE', 'EXECUTING'].includes(result.status)
        );

        if (hasUnfinishedTasks) {
            message.warning('请等待所有测试任务完成后再保存');
            return;
        }

        setSaving(true);
        try {
            // 准备要保存的数据
            const resultsToSave = testResults.map(result => ({
                testNo: result.testNo,
                userImage: result.userImage,
                clothingImage: result.clothingImage,
                generatedResult: result.generatedResult,
                taskId: result.taskId,
                status: result.status,
                completedSteps: result.completedSteps,
                estimatedSteps: result.estimatedSteps,
                executionTime: result.executionTime,
                delayTime: result.delayTime,
                cost: result.cost,
                error: result.error
            }));

            // 调用保存接口
            await tryonApi.saveTestResults(resultsToSave);
            message.success('测试结果保存成功');
        } catch (error) {
            console.error('保存测试结果失败:', error);
            message.error('保存测试结果失败');
        } finally {
            setSaving(false);
        }
    };

    const handleViewHistory = () => {
        navigate('/auto-test/history');
    };

    // 检查是否所有任务都已完成
    const allTasksCompleted = testResults.length > 0 && testResults.every(
        result => result.status === 'COMPLETED' || result.status === 'FAILED'
    );

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
                        <Button
                            type="primary"
                            icon={<HistoryOutlined />}
                            onClick={handleViewHistory}
                            className="!rounded-button whitespace-nowrap"
                        >
                            查看历史记录
                        </Button>
                        {allTasksCompleted && (
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={saving}
                                onClick={handleSaveResults}
                                className="!rounded-button whitespace-nowrap"
                            >
                                保存结果
                            </Button>
                        )}
                    </div>
                </div>
                {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                </div> */}
                <div className="flex gap-6">
                    <div className="flex-grow">
                        <TestResultsTable
                            testResults={testResults}
                            selectedRowKeys={selectedRowKeys}
                            onSelectChange={onSelectChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage; 
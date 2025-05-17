import React, { useState, useEffect } from 'react';
import { Button, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { tryonApi } from '../../api/tryon';
import { TestResultsTable, TestResult } from './Results';

const { Title } = Typography;

const HistoryPage: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTestHistory();
    }, []);

    const fetchTestHistory = async () => {
        setLoading(true);
        try {
            const response = await tryonApi.getTestHistory();
            const formattedResults = response.map((result: any, index: number) => ({
                key: result.id || index.toString(),
                testNo: `#${(index + 1).toString().padStart(3, '0')}`,
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
                error: result.error,
                createdAt: result.createdAt
            }));
            setTestResults(formattedResults);
        } catch (error) {
            console.error('获取测试历史记录失败:', error);
            message.error('获取测试历史记录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/auto-test/results');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBack}
                            className="!rounded-button"
                        >
                            返回
                        </Button>
                        <Title level={3} className="m-0">测试历史记录</Title>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="flex-grow">
                        <TestResultsTable
                            testResults={testResults}
                            selectedRowKeys={selectedRowKeys}
                            onSelectChange={setSelectedRowKeys}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage; 
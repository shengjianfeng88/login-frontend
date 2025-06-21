import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, message, Input, Card } from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { tryonApi, TestHistoryItem } from '../../api/tryon';
import { TestResultsTable, TestResult } from './Results';

const { Title } = Typography;
const { Search } = Input;

const HistoryPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTaskId, setSearchTaskId] = useState<string>('');
  const navigate = useNavigate();
  const isRequesting = useRef(false);

  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    if (isRequesting.current) {
      return;
    }

    isRequesting.current = true;
    setLoading(true);

    try {
      const response = await tryonApi.getTestHistory();
      const formattedResults = response.map(
        (result: TestHistoryItem, index: number) => ({
          key: result._id || index.toString(),
          userImage: result.userImage,
          clothingImage: result.clothingImage,
          generatedResult: result.generatedResult,
          taskId: result.taskId,
          status: result.status,
          executionTime: result.executionTime,
          error: result.error || undefined,
          score: result.score,
        })
      );
      setTestResults(formattedResults);
    } catch (error) {
      console.error('获取测试历史记录失败:', error);
      message.error('获取测试历史记录失败');
    } finally {
      setLoading(false);
      isRequesting.current = false;
    }
  };

  const handleSearchByTaskId = async (taskId: string) => {
    if (!taskId.trim()) {
      message.warning('请输入 taskId');
      return;
    }

    setSearchLoading(true);
    try {
      const result = await tryonApi.getTestResultByTaskId(taskId.trim());

      // 将单个结果转换为数组格式
      const formattedResult: TestResult = {
        key: result._id,
        userImage: result.userImage,
        clothingImage: result.clothingImage,
        generatedResult: result.generatedResult,
        taskId: result.taskId,
        status: result.status,
        executionTime: result.executionTime,
        error: result.error || undefined,
        score: result.score,
      };

      setTestResults([formattedResult]);
      message.success('检索成功');
    } catch (error) {
      console.error('检索失败:', error);
      message.error('未找到对应的测试结果');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchTaskId('');
    fetchTestHistory();
  };

  const handleScoreUpdate = async (taskId: string, score: number) => {
    try {
      const updatedResult = await tryonApi.updateScore(taskId, score);

      // 更新本地状态
      setTestResults((prev) =>
        prev.map((result) =>
          result.taskId === taskId
            ? { ...result, score: updatedResult.score }
            : result
        )
      );

      return updatedResult;
    } catch (error) {
      console.error('更新分数失败:', error);
      throw error;
    }
  };

  const handleDeleteSelected = async (keys?: string[]) => {
    try {
      // 在 History 页面，需要通过 taskId 调用后端 API
      // 获取选中项的 taskId
      const selectedTaskIds = testResults
        .filter(
          (item) =>
            keys?.includes(item.key) || selectedRowKeys.includes(item.key)
        )
        .map((item) => item.taskId)
        .filter(Boolean) as string[];

      if (selectedTaskIds.length === 0) {
        message.warning('选中的项目没有有效的 taskId');
        return;
      }

      const result = await tryonApi.deleteTestResults(selectedTaskIds);

      // 从本地状态中移除已删除的项目
      setTestResults((prev) =>
        prev.filter((result) => !selectedTaskIds.includes(result.taskId!))
      );

      // 清空选中状态
      setSelectedRowKeys([]);

      message.success(`成功删除 ${result.deletedCount} 个测试结果`);
    } catch (error) {
      console.error('删除测试结果失败:', error);
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/auto-test/results');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-4'>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className='!rounded-button'
            >
              返回
            </Button>
            <Title level={3} className='m-0'>
              测试历史记录
            </Title>
          </div>
        </div>

        {/* 检索区域 */}
        <Card className='mb-6'>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <Search
                placeholder='请输入 taskId 进行检索'
                value={searchTaskId}
                onChange={(e) => setSearchTaskId(e.target.value)}
                onSearch={handleSearchByTaskId}
                loading={searchLoading}
                enterButton={
                  <Button type='primary' icon={<SearchOutlined />}>
                    检索
                  </Button>
                }
                className='!rounded-button'
              />
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetSearch}
              className='!rounded-button'
            >
              重置
            </Button>
          </div>
          <div className='mt-2 text-sm text-gray-500'>
            提示：输入完整的 taskId
            可以精确检索单个测试结果，点击重置可以恢复显示所有记录
          </div>
        </Card>

        <div className='flex gap-6'>
          <div className='flex-grow'>
            <TestResultsTable
              testResults={testResults}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={setSelectedRowKeys}
              onScoreUpdate={handleScoreUpdate}
              onDeleteSelected={handleDeleteSelected}
            />
            {loading && (
              <div className='text-center py-4'>
                <span>正在加载历史记录...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

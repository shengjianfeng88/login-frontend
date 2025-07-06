import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Table,
  Checkbox,
  Typography,
  message,
  Image,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  HistoryOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
// import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import { tryonApi } from '../../api/tryon';

const { Title, Text } = Typography;

export interface TestResult {
  key: string;
  userImage: string;
  clothingImage: string;
  generatedResult?: string;
  taskId?: string;
  status?: string;
  error?: string;
  executionTime?: number;
  score?: number;
  savedAt?: string;
  modelId?: string;
}

export interface TestResultsTableProps {
  testResults: TestResult[];
  selectedRowKeys: React.Key[];
  onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
  onDeleteSelected?: (taskIds?: string[]) => Promise<void>;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
    pageSizeOptions?: string[];
  };
  onTableChange?: (...args: unknown[]) => void;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({
  testResults,
  selectedRowKeys,
  onSelectChange,
  onDeleteSelected,
  pagination,
  onTableChange,
}) => {
  const handleDeleteButtonClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }

    // 获取选中项
    const selectedItems = testResults.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the selected ${selectedItems.length} test results? This action cannot be undone.`,
      okText: 'Confirm Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        if (onDeleteSelected) {
          try {
            // 传递选中的 key 数组
            const selectedKeys = selectedItems.map((item) => item.key);
            await onDeleteSelected(selectedKeys);
            // 成功消息在 onDeleteSelected 中处理
          } catch (error) {
            console.error('Delete failed:', error);
            message.error('Delete failed');
          }
        }
      },
    });
  };

  const columns: ColumnsType<TestResult> = [
    {
      title: 'INPUT 1 (USER IMAGE)',
      dataIndex: 'userImage',
      key: 'userImage',
      width: 150,
      render: (image) => (
        <div className='w-28 h-36 overflow-hidden'>
          <Image
            src={image}
            alt='User'
            className='w-full h-full object-cover object-top'
            preview={{
              mask: 'Click to preview',
              maskClassName: 'flex items-center justify-center',
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
        <div className='w-28 h-36 overflow-hidden'>
          <Image
            src={image}
            alt='Clothing'
            className='w-full h-full object-cover object-top'
            preview={{
              mask: 'Click to preview',
              maskClassName: 'flex items-center justify-center',
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
        <div className='w-28 h-36 overflow-hidden relative'>
          {record.status === 'success' && record.generatedResult ? (
            <Image
              src={record.generatedResult}
              alt='Generated Result'
              className='w-full h-full object-cover object-top'
              preview={{
                mask: 'Click to preview',
                maskClassName: 'flex items-center justify-center',
              }}
            />
          ) : record.status === 'FAILED' ? (
            <Text type='danger'>Failed</Text>
          ) : record.status === 'CANCELLED' ? (
            <Text type='warning'>Cancelled</Text>
          ) : (
            <Text type='secondary'>Waiting</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Execution Time',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 120,
      className: 'whitespace-nowrap',
      render: (time, record) => {
        if (record.status === 'success' && time) {
          return `${(time / 1000).toFixed(2)}s`;
        } else if (record.status === 'FAILED') {
          return <span className='text-red-500'>Failed</span>;
        } else if (record.status === 'IN_PROGRESS') {
          return <span className='text-blue-500'>Processing</span>;
        } else if (record.status === 'CANCELLED') {
          return <span className='text-orange-500'>Cancelled</span>;
        }
        return '-';
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (score, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }
        return <span className='font-medium'>{score || '-'}</span>;
      },
    },
    {
      title: 'TASK ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 200,
      className: 'whitespace-nowrap',
    },
    {
      title: 'MODEL ID',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 150,
      className: 'whitespace-nowrap',
      render: (modelId, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }
        return <span className='font-mono text-sm'>{modelId || '-'}</span>;
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-center mb-4'>
        <Checkbox
          onChange={(e) =>
            e.target.checked
              ? onSelectChange(testResults.map((item) => item.key))
              : onSelectChange([])
          }
        >
          Select All
        </Checkbox>
        {selectedRowKeys.length > 0 && (
          <Button
            type='primary'
            danger
            onClick={handleDeleteButtonClick}
            className='!rounded-button whitespace-nowrap'
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        )}
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={testResults}
        pagination={pagination || false}
        rowKey='key'
        className='test-results-table'
        onChange={pagination ? onTableChange : undefined}
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
}) => {
  const [saving, setSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 只在 testResults 为空时初始化
    if (testResults.length === 0) {
      const generateTestResults = () => {
        const results: TestResult[] = [];
        let counter = 1;
        userImages.forEach((userImg) => {
          clothingImages.forEach((clothingImg) => {
            results.push({
              key: `${counter}`,
              userImage: userImg,
              clothingImage: clothingImg,
              generatedResult: undefined,
              taskId: undefined,
              status: undefined,
              error: undefined,
              savedAt: undefined,
              modelId: undefined,
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
      message.warning('Please select items to test');
      return;
    }

    setLoading(true);
    setIsCancelling(false);
    abortControllerRef.current = new AbortController();

    const selectedResults = testResults.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    try {
      for (const test of selectedResults) {
        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        try {
          // Record start time
          const startTime = Date.now();

          // Set initial status to processing
          setTestResults((prev) =>
            prev.map((item) => {
              if (item.key === test.key) {
                return {
                  ...item,
                  status: 'IN_PROGRESS',
                };
              }
              return item;
            })
          );

          // Call tryon API, pass signal for abort
          const response = await tryonApi.startTryon(
            test.userImage,
            test.clothingImage,
            abortControllerRef.current?.signal
          );

          // Add debug information
          console.log('API response:', response);
          console.log('image field:', response.image);
          console.log('result_image_url field:', response.result_image_url);

          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            // Update status to cancelled
            setTestResults((prev) =>
              prev.map((item) => {
                if (item.key === test.key) {
                  return {
                    ...item,
                    status: 'CANCELLED',
                    error: 'User cancelled generation',
                    savedAt: new Date().toISOString(),
                  };
                }
                return item;
              })
            );
            break;
          }

          // Calculate execution time
          const executionTime = Date.now() - startTime;

          // Update test result status
          setTestResults((prev) =>
            prev.map((item) => {
              if (item.key === test.key) {
                return {
                  ...item,
                  status: response.image ? 'success' : 'FAILED',
                  taskId: response.uuid,
                  generatedResult: response.result_image_url || response.image,
                  executionTime: executionTime,
                  savedAt: new Date().toISOString(),
                  modelId: response.modelId,
                };
              }
              return item;
            })
          );
        } catch (error) {
          // Check if abort error
          if (error instanceof Error && error.name === 'AbortError') {
            // Update status to cancelled
            setTestResults((prev) =>
              prev.map((item) => {
                if (item.key === test.key) {
                  return {
                    ...item,
                    status: 'CANCELLED',
                    error: 'User cancelled generation',
                    savedAt: new Date().toISOString(),
                  };
                }
                return item;
              })
            );
            break;
          }

          console.error('Test failed:', error);
          message.error(`Test ${test.key} failed`);

          // Update failed status
          setTestResults((prev) =>
            prev.map((item) => {
              if (item.key === test.key) {
                return {
                  ...item,
                  status: 'FAILED',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  savedAt: new Date().toISOString(),
                };
              }
              return item;
            })
          );
        }
      }
    } catch (error) {
      console.error('Batch test failed:', error);
      message.error('Batch test failed');
    } finally {
      setLoading(false);
      setIsCancelling(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsCancelling(true);
      message.info('正在终止生成...');
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleViewHistory = () => {
    navigate('/auto-test/history');
  };

  // 处理上传图片按钮点击
  const handleUploadClick = () => {
    Modal.confirm({
      title: '确认上传新图片',
      content: '上传新图片将清空当前的任务列表，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // 清空所有状态
        setTestResults([]);
        setSelectedRowKeys([]);
        // 导航到上传页面
        // navigate('/auto-test/upload');
        window.location.href = '/auto-test/upload';
      },
    });
  };

  const handleSaveResults = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select test results to save');
      return;
    }

    setSaving(true);
    try {
      // 获取选中的测试结果
      const selectedResults = testResults.filter((result) =>
        selectedRowKeys.includes(result.key)
      );

      // 过滤出已完成的测试结果
      const completedResults = selectedResults.filter(
        (result) => result.status === 'success' || result.status === 'FAILED'
      );

      if (completedResults.length === 0) {
        message.warning('No completed test results to save among selected items');
        return;
      }

      // 转换为 API 期望的格式，保存原始的 generatedResult 数据
      const apiResults = completedResults.map((result) => ({
        userImage: result.userImage,
        clothingImage: result.clothingImage,
        generatedResult: result.generatedResult,
        status: result.status || 'unknown',
        taskId: result.taskId,
        executionTime: result.executionTime,
        savedAt: result.savedAt,
        modelId: result.modelId,
      }));

      // 调用保存接口
      await tryonApi.saveTestResults(apiResults);
      message.success(`Successfully saved ${completedResults.length} test results`);
    } catch (error) {
      console.error('Failed to save test results:', error);
      message.error('Failed to save test results');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async (keys?: string[]) => {
    try {
      // 在 Results 页面，直接通过选中的 key 删除
      const keysToDelete = keys || selectedRowKeys.map(String);

      // 从本地状态中移除选中的项目
      setTestResults((prev) =>
        prev.filter((result) => !keysToDelete.includes(result.key))
      );

      // 清空选中状态
      setSelectedRowKeys([]);

      message.success(`成功删除 ${keysToDelete.length} 个测试结果`);
    } catch (error) {
      console.error('删除测试结果失败:', error);
      message.error('删除失败');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex justify-between items-center mb-6'>
          <Title level={3} className='m-0'>
            Virtual Try-On Model Testing System
          </Title>
          <div className='flex gap-4'>
            <Button
              className='!rounded-button whitespace-nowrap'
              onClick={handleUploadClick}
              icon={<UploadOutlined />}
            >
              Upload Images
            </Button>
            <Button
              type='primary'
              loading={loading}
              onClick={handleTestSelected}
              className='!rounded-button whitespace-nowrap'
            >
              {loading ? 'Processing...' : 'Test Selected'}
            </Button>
            {loading && (
              <Button
                type='primary'
                danger
                loading={isCancelling}
                onClick={handleCancelGeneration}
                className='!rounded-button whitespace-nowrap'
              >
                {isCancelling ? '终止中...' : '终止生成'}
              </Button>
            )}
            <Button
              type='primary'
              icon={<HistoryOutlined />}
              onClick={handleViewHistory}
              className='!rounded-button whitespace-nowrap'
            >
              查看历史记录
            </Button>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveResults}
              className='!rounded-button whitespace-nowrap'
            >
              保存结果
            </Button>
          </div>
        </div>
        <div className='flex gap-6'>
          <div className='flex-grow'>
            <TestResultsTable
              testResults={testResults}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={onSelectChange}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

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
import { StarFilled, StarOutlined } from '@ant-design/icons';

// 自定义样式
const customModalStyles = `
  .custom-preview-modal .ant-modal-close {
    top: -5px !important;
    right: -5px !important;
  }
  .custom-preview-modal .ant-modal-close-x {
    width: 32px !important;
    height: 32px !important;
    line-height: 32px !important;
    font-size: 18px !important;
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customModalStyles;
  document.head.appendChild(styleElement);
}

// 五星评分组件
const StarRating: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!disabled) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer transition-colors duration-200 ${disabled ? 'cursor-not-allowed' : ''
            }`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
        >
          {displayValue >= star ? (
            <StarFilled className="text-yellow-400 text-lg" />
          ) : (
            <StarOutlined className="text-gray-300 text-lg hover:text-yellow-400" />
          )}
        </span>
      ))}
    </div>
  );
};
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

// 自定义预览组件
const CustomImagePreview: React.FC<{
  userImage: string;
  clothingImage: string;
  generatedResult?: string;
  status?: string;
}> = ({ userImage, clothingImage, generatedResult, status }) => {
  return (
    <div className='flex gap-4 justify-center items-center p-4 bg-black'>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>INPUT 1 (USER IMAGE)</div>
        <img
          src={userImage}
          alt='User'
          className='max-w-md max-h-[1800px] object-contain'
        />
      </div>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>INPUT 2 (CLOTHING)</div>
        <img
          src={clothingImage}
          alt='Clothing'
          className='max-w-md max-h-[1800px] object-contain'
        />
      </div>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>GENERATED RESULT</div>
        {status === 'success' && generatedResult ? (
          <img
            src={generatedResult}
            alt='Generated Result'
            className='max-w-md max-h-[1800px] object-contain'
          />
        ) : status === 'FAILED' ? (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-red-400'>
            Failed
          </div>
        ) : status === 'CANCELLED' ? (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-orange-400'>
            Cancelled
          </div>
        ) : (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-gray-400'>
            Waiting
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<TestResult | null>(null);

  const handlePreview = (record: TestResult) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };

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
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          <img
            src={image}
            alt='User'
            className='w-full h-full object-cover object-top'
          />
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'INPUT 2 (CLOTHING)',
      dataIndex: 'clothingImage',
      key: 'clothingImage',
      width: 150,
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          <img
            src={image}
            alt='Clothing'
            className='w-full h-full object-cover object-top'
          />
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'GENERATED RESULT',
      dataIndex: 'generatedResult',
      key: 'generatedResult',
      width: 150,
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden relative cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          {record.status === 'success' && record.generatedResult ? (
            <img
              src={record.generatedResult}
              alt='Generated Result'
              className='w-full h-full object-cover object-top'
            />
          ) : record.status === 'FAILED' ? (
            <div className='w-full h-full bg-red-100 flex items-center justify-center'>
              <Text type='danger'>Failed</Text>
            </div>
          ) : record.status === 'CANCELLED' ? (
            <div className='w-full h-full bg-orange-100 flex items-center justify-center'>
              <Text type='warning'>Cancelled</Text>
            </div>
          ) : (
            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
              <Text type='secondary'>Waiting</Text>
            </div>
          )}
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
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
      width: 150,
      render: (score, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }

        const handleScoreChange = async (newScore: number) => {
          try {
            if (record.taskId) {
              // 调用API更新分数
              await tryonApi.updateScore(record.taskId, newScore);
              message.success(`Score updated to ${newScore}`);
            } else {
              message.warning('Task ID not available for scoring');
            }
          } catch (error) {
            console.error('Score update failed:', error);
            message.error('Score update failed');
          }
        };

        return (
          <div className="flex items-center gap-2">
            <StarRating
              value={score || 0}
              onChange={handleScoreChange}
              disabled={false}
            />
            {score && <span className="text-sm text-gray-500">({score})</span>}
          </div>
        );
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

      {/* 自定义预览模态框 */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={2000}
        centered
        destroyOnClose
        className="custom-preview-modal"
      >
        {previewData && (
          <CustomImagePreview
            userImage={previewData.userImage}
            clothingImage={previewData.clothingImage}
            generatedResult={previewData.generatedResult}
            status={previewData.status}
          />
        )}
      </Modal>
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

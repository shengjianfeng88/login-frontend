import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  message,
  Input,
  Card,
  Table,
  Checkbox,
  Image,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { tryonApi, TestHistoryItem } from '../../api/tryon';
import { TestResult } from './Results';

const { Title, Text } = Typography;
const { Search } = Input;

// 辅助函数：将 base64 转换为 blob URL
const base64ToBlobUrl = (base64Data: string): string => {
  try {
    // 检查是否已经是 URL
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data;
    }

    // 检查是否包含 data URL 前缀
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }

    // 假设是纯 base64 数据，添加前缀并转换为 blob URL
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('转换 base64 失败:', error);
    return '';
  }
};

interface HistoryTableProps {
  testResults: TestResult[];
  selectedRowKeys: React.Key[];
  onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
  onScoreUpdate?: (taskId: string, score: number) => void;
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
    hideOnSinglePage?: boolean;
    onShowSizeChange?: (current: number, size: number) => void;
  };
  onTableChange?: (...args: unknown[]) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  testResults,
  selectedRowKeys,
  onSelectChange,
  onScoreUpdate,
  onDeleteSelected,
  pagination,
  onTableChange,
}) => {
  const [scoringTaskId, setScoringTaskId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState<number>(0);

  const handleScoreSubmit = async (taskId: string) => {
    if (onScoreUpdate) {
      try {
        await onScoreUpdate(taskId, scoreValue);
        setScoringTaskId(null);
        setScoreValue(0);
        message.success('分数更新成功');
      } catch (error) {
        console.error('分数更新失败:', error);
        message.error('分数更新失败');
      }
    }
  };

  const handleDeleteButtonClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项目');
      return;
    }

    // 获取选中项
    const selectedItems = testResults.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedItems.length} 个测试结果吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        if (onDeleteSelected) {
          try {
            // 传递选中的 key 数组
            const selectedKeys = selectedItems.map((item) => item.key);
            await onDeleteSelected(selectedKeys);
            // 成功消息在 onDeleteSelected 中处理
          } catch (error) {
            console.error('删除失败:', error);
            message.error('删除失败');
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
              mask: '点击预览',
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
              mask: '点击预览',
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
          {record.status === 'success' && image ? (
            <Image
              src={base64ToBlobUrl(image)}
              alt='Generated Result'
              className='w-full h-full object-cover object-top'
              preview={{
                mask: '点击预览',
                maskClassName: 'flex items-center justify-center',
              }}
            />
          ) : record.status === 'FAILED' ? (
            <Text type='danger'>Failed</Text>
          ) : (
            <Text type='secondary'>Waiting</Text>
          )}
        </div>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 120,
      className: 'whitespace-nowrap',
      sorter: (a, b) => {
        // 处理 undefined 和 null 值
        const timeA = a.executionTime || 0;
        const timeB = b.executionTime || 0;
        return timeA - timeB;
      },
      render: (time, record) => {
        if (record.status === 'success' && time) {
          return `${(time / 1000).toFixed(2)}s`;
        } else if (record.status === 'FAILED') {
          return <span className='text-red-500'>失败</span>;
        } else if (record.status === 'IN_PROGRESS') {
          return <span className='text-blue-500'>处理中</span>;
        }
        return '-';
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      sorter: (a, b) => {
        // 处理 undefined 和 null 值
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return scoreA - scoreB;
      },
      render: (score, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }

        if (scoringTaskId === record.taskId) {
          return (
            <div className='flex items-center gap-2'>
              <input
                type='number'
                min='0'
                max='100'
                value={scoreValue}
                onChange={(e) => setScoreValue(Number(e.target.value))}
                className='w-16 px-2 py-1 border rounded text-sm'
                placeholder='分数'
              />
              <Button
                size='small'
                type='primary'
                onClick={() => handleScoreSubmit(record.taskId!)}
                className='!rounded-button'
              >
                提交
              </Button>
              <Button
                size='small'
                onClick={() => {
                  setScoringTaskId(null);
                  setScoreValue(0);
                }}
                className='!rounded-button'
              >
                取消
              </Button>
            </div>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{score || '-'}</span>
            {record.taskId && (
              <Button
                size='small'
                onClick={() => {
                  setScoringTaskId(record.taskId!);
                  setScoreValue(score || 0);
                }}
                className='!rounded-button'
              >
                打分
              </Button>
            )}
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
            删除选中 ({selectedRowKeys.length})
          </Button>
        )}
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={testResults}
        pagination={pagination}
        rowKey='key'
        className='test-results-table'
        onChange={onTableChange}
      />
    </div>
  );
};

const HistoryPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTaskId, setSearchTaskId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const isRequesting = useRef(false);

  useEffect(() => {
    fetchTestHistory(1, pageSize);
  }, []);

  const fetchTestHistory = async (page?: number, limit?: number) => {
    if (isRequesting.current) {
      return;
    }

    isRequesting.current = true;
    setLoading(true);

    try {
      const response = await tryonApi.getTestHistory(
        page || currentPage,
        limit || pageSize
      );

      const formattedResults = response.data.map(
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

      // 使用后端返回的分页信息
      setTestResults(formattedResults);

      // 使用 totalPages * limit 来计算正确的 total 值
      const correctTotal =
        response.pagination.totalPages * response.pagination.limit;

      setTotal(correctTotal);
      setCurrentPage(response.pagination.page);
      setPageSize(response.pagination.limit);

      // 调试信息
      console.log('分页信息:', {
        originalTotal: response.pagination.total,
        totalPages: response.pagination.totalPages,
        limit: response.pagination.limit,
        calculatedTotal: correctTotal,
        page: response.pagination.page,
        dataLength: formattedResults.length,
      });
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
      setTotal(1);
      setCurrentPage(1);
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
    setCurrentPage(1);
    setPageSize(10);
    fetchTestHistory(1, 10);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);

    // 页码或页面大小改变时，重新请求接口
    fetchTestHistory(page, size);
  };

  const handleTableChange = (...args: unknown[]) => {
    // 处理排序变化
    const sorter = args[2] as {
      field?: string;
      order?: 'ascend' | 'descend' | null;
    };

    if (sorter && sorter.field) {
      // 排序时重新请求接口，传递排序参数
      // 这里可以根据需要添加排序参数到 API 调用中
      fetchTestHistory(currentPage, pageSize);
    }
  };

  const handleScoreUpdate = async (taskId: string, score: number) => {
    try {
      const updatedResult = await tryonApi.updateScore(taskId, score);

      // 打分后重新请求当前页的数据
      fetchTestHistory(currentPage, pageSize);

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

      // 删除后重新请求当前页的数据
      fetchTestHistory(currentPage, pageSize);

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
            <HistoryTable
              testResults={testResults}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={setSelectedRowKeys}
              onScoreUpdate={handleScoreUpdate}
              onDeleteSelected={handleDeleteSelected}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: handlePageChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: [number, number]) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50', '100'],
                hideOnSinglePage: false,
                onShowSizeChange: (current: number, size: number) => {
                  console.log('页面大小改变:', { current, size });
                },
              }}
              onTableChange={handleTableChange}
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

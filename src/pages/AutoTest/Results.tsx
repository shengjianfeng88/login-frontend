import React, { useState, useEffect } from 'react';
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

export interface TestResult {
  key: string;
  userImage: string;
  clothingImage: string;
  generatedResult: string;
  taskId?: string;
  status?: string;
  error?: string;
  executionTime?: number;
  score?: number;
}

export interface TestResultsTableProps {
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
  };
  onTableChange?: (...args: unknown[]) => void;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({
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
              key: `${counter}`,
              userImage: userImg,
              clothingImage: clothingImg,
              generatedResult: '',
              taskId: undefined,
              status: undefined,
              error: undefined,
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
    const selectedResults = testResults.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    try {
      for (const test of selectedResults) {
        try {
          // 记录开始时间
          const startTime = Date.now();

          // 设置初始状态为处理中
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

          // 调用试穿接口
          const response = await tryonApi.startTryon(
            test.userImage,
            test.clothingImage
          );

          // 计算耗时
          const executionTime = Date.now() - startTime;

          // 更新测试结果状态
          setTestResults((prev) =>
            prev.map((item) => {
              if (item.key === test.key) {
                return {
                  ...item,
                  status: response.image ? 'success' : 'FAILED',
                  taskId: response.uuid,
                  generatedResult: response.image,
                  executionTime: executionTime,
                };
              }
              return item;
            })
          );
        } catch (error) {
          console.error('测试失败:', error);
          message.error(`测试 ${test.key} 失败`);

          // 更新失败状态
          setTestResults((prev) =>
            prev.map((item) => {
              if (item.key === test.key) {
                return {
                  ...item,
                  status: 'FAILED',
                  error: error instanceof Error ? error.message : '未知错误',
                };
              }
              return item;
            })
          );
        }
      }
    } catch (error) {
      console.error('批量测试失败:', error);
      message.error('批量测试失败');
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // useEffect(() => {
  //     const chartDom = document.getElementById('improvement-chart');
  //     if (chartDom) {
  //         const myChart = echarts.init(chartDom);
  //         const option = {
  //             animation: false,
  //             tooltip: {
  //                 trigger: 'axis',
  //                 axisPointer: {
  //                     type: 'shadow'
  //                 }
  //             },
  //             grid: {
  //                 left: '3%',
  //                 right: '4%',
  //                 bottom: '3%',
  //                 containLabel: true
  //             },
  //             xAxis: [
  //                 {
  //                     type: 'category',
  //                     data: ['v8', 'v9', 'v10', 'v11'],
  //                     axisTick: {
  //                         alignWithLabel: true
  //                     }
  //                 }
  //             ],
  //             yAxis: [
  //                 {
  //                     type: 'value',
  //                     min: 3,
  //                     max: 5
  //                 }
  //             ],
  //             series: [
  //                 {
  //                     name: 'Average Score',
  //                     type: 'bar',
  //                     barWidth: '60%',
  //                     data: [
  //                         { value: 3.2, itemStyle: { color: '#8884d8' } },
  //                         { value: 3.5, itemStyle: { color: '#8884d8' } },
  //                         { value: 3.8, itemStyle: { color: '#8884d8' } },
  //                         { value: 4.2, itemStyle: { color: '#4caf50' } }
  //                     ]
  //                 }
  //             ]
  //         };
  //         myChart.setOption(option);
  //     }
  // }, []);

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
      message.warning('请选择要保存的测试结果');
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
        message.warning('选中的项目中没有已完成的测试结果可保存');
        return;
      }

      // 转换为 API 期望的格式，保存原始的 generatedResult 数据
      const apiResults = completedResults.map((result) => ({
        userImage: result.userImage,
        clothingImage: result.clothingImage,
        generatedResult: 'test_result_placeholder', // 暂时用字符串替代，避免 base64 数据过大
        status: result.status || 'unknown',
        taskId: result.taskId,
        executionTime: result.executionTime,
      }));

      // 调用保存接口
      await tryonApi.saveTestResults(apiResults);
      message.success(`成功保存 ${completedResults.length} 个测试结果`);
    } catch (error) {
      console.error('保存测试结果失败:', error);
      message.error('保存测试结果失败');
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
                        <Text type="secondary">5/5 success</Text>
                        <div className="h-6 w-32" id="improvement-chart"></div>
                    </div>
                </div> */}
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

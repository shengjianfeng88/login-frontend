import React, { useState } from 'react';
import { Upload, Button, message, Card, Image, Typography } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface ConvertedImage {
  originalFile: UploadFile;
  convertedUrl: string;
  convertedName: string;
  convertedSize: number;
}

const ImageConvertTest: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [converting, setConverting] = useState(false);

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // 限制文件数量，这里设置为最多5张图片
    newFileList = newFileList.slice(0, 5);

    setFileList(newFileList);

    // 处理上传状态
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);

    // 同时移除转换后的图片
    setConvertedImages((prev) =>
      prev.filter((item) => item.originalFile.uid !== file.uid)
    );

    message.success(`${file.name} 已删除`);
  };

  const convertImage = async (
    file: UploadFile
  ): Promise<{ url: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file.originFileObj as File);

    const response = await fetch(
      'http://localhost:3001/api/auth/convert-image',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '转换失败');
    }

    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      size: blob.size,
    };
  };

  const handleConvertAll = async () => {
    if (fileList.length === 0) {
      message.warning('请先上传图片');
      return;
    }

    setConverting(true);
    const newConvertedImages: ConvertedImage[] = [];

    try {
      for (const file of fileList) {
        try {
          message.loading(`正在转换 ${file.name}...`, 0);
          const { url, size } = await convertImage(file);
          const convertedName = file.name.replace(/\.[^/.]+$/, '.jpg');

          newConvertedImages.push({
            originalFile: file,
            convertedUrl: url,
            convertedName,
            convertedSize: size,
          });

          message.destroy();
          message.success(`${file.name} 转换成功`);
        } catch (error) {
          message.destroy();
          message.error(`${file.name} 转换失败: ${(error as Error).message}`);
        }
      }

      setConvertedImages(newConvertedImages);
      if (newConvertedImages.length > 0) {
        message.success(`成功转换 ${newConvertedImages.length} 张图片`);
      }
    } catch (error) {
      message.error(`转换过程中出现错误: ${(error as Error).message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleClearAll = () => {
    setFileList([]);
    setConvertedImages([]);
    message.success('已清空所有图片');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange: handleChange,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      return false;
    },
    onRemove: handleRemove,
    accept: 'image/*',
    customRequest: () => {},
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <Title level={2} className='mb-2'>
            图片转换测试
          </Title>
          <Text type='secondary'>
            上传图片进行TIFF到JPG格式转换，支持多种图片格式
          </Text>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 上传区域 */}
          <Card title='图片上传' className='h-fit'>
            <Dragger {...uploadProps} className='mb-4'>
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>点击或拖拽图片到此区域上传</p>
              <p className='ant-upload-hint'>支持单个或批量上传</p>
            </Dragger>

            <div className='text-center'>
              <Text type='secondary'>已上传 {fileList.length} 张图片</Text>
            </div>
          </Card>

          {/* 图片预览区域 */}
          <Card title='图片预览' className='h-fit'>
            {fileList.length === 0 ? (
              <div className='text-center py-12'>
                <InboxOutlined className='text-4xl text-gray-300 mb-4' />
                <Text type='secondary'>暂无图片，请先上传</Text>
              </div>
            ) : (
              <div className='space-y-4'>
                {fileList.map((file) => (
                  <div
                    key={file.uid}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <Text strong>{file.name}</Text>
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(file)}
                        size='small'
                      >
                        删除
                      </Button>
                    </div>
                    <div className='flex justify-center'>
                      <Image
                        src={
                          file.url ||
                          URL.createObjectURL(file.originFileObj as Blob)
                        }
                        alt={file.name}
                        className='max-w-full max-h-64 object-contain'
                        preview={{
                          mask: '点击预览',
                          maskClassName: 'flex items-center justify-center',
                        }}
                      />
                    </div>
                    <div className='mt-2 text-center'>
                      <Text type='secondary' className='text-sm'>
                        大小: {(file.size! / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 转换后的图片区域 */}
        {convertedImages.length > 0 && (
          <Card title='转换后的图片' className='mt-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {convertedImages.map((converted, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='mb-2'>
                    <Text strong>{converted.convertedName}</Text>
                  </div>
                  <div className='flex justify-center mb-2'>
                    <Image
                      src={converted.convertedUrl}
                      alt={converted.convertedName}
                      className='max-w-full max-h-48 object-contain'
                      preview={{
                        mask: '点击预览',
                        maskClassName: 'flex items-center justify-center',
                      }}
                    />
                  </div>
                  <div className='text-center'>
                    <Button
                      type='primary'
                      size='small'
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = converted.convertedUrl;
                        link.download = converted.convertedName;
                        link.click();
                      }}
                    >
                      下载
                    </Button>
                    <div className='mt-2'>
                      <Text type='secondary' className='text-sm'>
                        大小:{' '}
                        {(converted.convertedSize / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 操作按钮区域 */}
        {fileList.length > 0 && (
          <Card className='mt-8'>
            <div className='flex justify-center space-x-4'>
              <Button
                type='primary'
                size='large'
                loading={converting}
                icon={converting ? <LoadingOutlined /> : null}
                onClick={handleConvertAll}
                disabled={converting}
              >
                {converting ? '转换中...' : '开始转换'}
              </Button>
              <Button
                size='large'
                onClick={handleClearAll}
                disabled={converting}
              >
                清空所有
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageConvertTest;

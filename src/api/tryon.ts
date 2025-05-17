import axios from 'axios';

// API 基础 URL
const BASE_URL = '/api/api_endpoints/1ddbztbz0f6wgv';  // 修改为相对路径，将通过代理访问

// 类型定义
export interface TryonInput {
    title: string;
    value: string;
}

export interface TryonRequest {
    inputs: {
        '594981c08d5bbf10': TryonInput;
        '5dfee988692c6a98': TryonInput;
    };
}

export interface TryonResponse {
    task_id: string;
    status: string;
    estimated_steps: number;
}

export interface TaskStatusResponse {
    task_id: string;
    status: string;
    estimated_steps: number;
    completed_steps: number;
    image_urls: string[];
    video_urls: string[];
    execution_time: number;
    error_message?: string;
    cost?: number;
    error?: string;
}

export interface TestHistoryResponse {
    id: string;
    userImage: string;
    clothingImage: string;
    generatedResult: string;
    taskId: string;
    status: string;
    completedSteps: number;
    estimatedSteps: number;
    executionTime: number;
    delayTime: number;
    cost: number;
    error?: string;
    createdAt: string;
}

// 辅助函数：将图片 URL 转换为 base64
const getBase64FromUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                // 移除 data:image/jpeg;base64, 前缀
                const base64 = base64data.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('转换图片失败:', error);
        throw error;
    }
};

// API 函数
export const tryonApi = {
    // 发起试穿请求
    async startTryon(userImage: string, clothingImage: string): Promise<TryonResponse> {
        try {
            // 转换图片为 base64
            const [userBase64, clothingBase64] = await Promise.all([
                getBase64FromUrl(userImage),
                getBase64FromUrl(clothingImage)
            ]);

            const response = await axios.post(
                `${BASE_URL}/run_task`,
                {
                    inputs: {
                        '594981c08d5bbf10': {
                            title: 'Load Image',
                            value: clothingBase64
                        },
                        '5dfee988692c6a98': {
                            title: 'Load Image',
                            value: userBase64
                        }
                    }
                },
                {
                    headers: {
                        'Authorization': 'Bearer y7nf4qVOytqiL6dhfWV6rg',
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('试穿请求失败:', error);
            throw error;
        }
    },

    // 获取任务状态
    async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
        try {
            const response = await axios.get(
                `${BASE_URL}/task_status/${taskId}`,
                {
                    headers: {
                        'Authorization': 'Bearer y7nf4qVOytqiL6dhfWV6rg',
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('获取任务状态失败:', error);
            throw error;
        }
    },

    // 获取测试历史记录
    getTestHistory: async (): Promise<TestHistoryResponse[]> => {
        const response = await fetch('/api/test-history');
        if (!response.ok) {
            throw new Error('获取测试历史记录失败');
        }
        return response.json();
    },

    // 保存测试结果
    saveTestResults: async (results: any[]): Promise<void> => {
        const response = await fetch('/api/test-results-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(results),
        });
        if (!response.ok) {
            throw new Error('保存测试结果失败');
        }
    },
}; 
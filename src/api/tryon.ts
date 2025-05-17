import axiosInstance from '../utils/axiosInstance';

// API 基础 URL
const BASE_URL = 'https://api.instasd.com/api_endpoints/1ddbztbz0f6wgv';

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
    status: 'CREATED' | 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    estimated_steps: number;
}

export interface TaskStatusResponse {
    task_id: string;
    status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    estimated_steps: number;
    completed_steps: number;
    image_urls: string[];
    video_urls: string[];
    delay_time: number;
    execution_time: number;
    cost: number;
}

// API 函数
export const tryonApi = {
    // 发起试穿请求
    async startTryon(userImage: string, clothingImage: string): Promise<TryonResponse> {
        const requestBody: TryonRequest = {
            inputs: {
                '594981c08d5bbf10': {
                    title: 'Load Image',
                    value: userImage
                },
                '5dfee988692c6a98': {
                    title: 'Load Image',
                    value: clothingImage
                }
            }
        };

        try {
            const response = await axiosInstance.post(`${BASE_URL}/run_task`, requestBody, {
                headers: {
                    'Authorization': 'Bearer y7nf4qVOytqiL6dhfWV6rg'
                }
            });
            return response.data;
        } catch (error) {
            console.error('试穿请求失败:', error);
            throw error;
        }
    },

    // 获取任务状态
    async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/task_status/${taskId}`, {
                headers: {
                    'Authorization': 'Bearer y7nf4qVOytqiL6dhfWV6rg'
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取任务状态失败:', error);
            throw error;
        }
    }
}; 
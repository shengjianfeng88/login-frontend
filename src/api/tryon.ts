import axios from 'axios';

// 创建 axios 实例
const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// 类型定义
type GetTryOnParams = {
    access_token: string
    face: string
    model: string
}

export type TryOnResponse = {
    image: string
    uuid?: string
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
    async startTryon(userImage: string, clothingImage: string): Promise<TryOnResponse> {
        try {
            // 转换图片为 base64
            const [userBase64, clothingBase64] = await Promise.all([
                getBase64FromUrl(userImage),
                getBase64FromUrl(clothingImage)
            ]);

            const response = await axiosInstance.post(
                '/upload/images',
                {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODM5MzVmZWIzMjliNTI0MTNkOGQ2YTUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSVN5dHEtQnNWcTItRTNXNGFoTG9CZTdYRVdZb0h1RmhoU3V4VjRLTy02cEdUTHlBPXM5Ni1jIiwiZW1haWwiOiJqaWFuZmVuZ3NoZW5nMEBnbWFpbC5jb20iLCJpYXQiOjE3NDk4ODg4NTgsImV4cCI6MTc0OTg4OTc1OH0.woufGJfaaL9fz6DDJmAc3GAxm4Bg2aGMLFqgxlbAhaA',
                    face: userBase64,
                    model: clothingBase64,
                    prompt: ''
                }
            );
            return response.data;
        } catch (error) {
            console.error('试穿请求失败:', error);
            throw error;
        }
    },
    // 获取测试历史记录
    getTestHistory: async (): Promise<any[]> => {
        try {
            const response = await axiosInstance.get('/test/history');
            return response.data;
        } catch (error) {
            console.error('获取测试历史记录失败:', error);
            throw error;
        }
    },

    // 保存测试结果
    saveTestResults: async (results: any[]): Promise<void> => {
        try {
            await axiosInstance.post('/test/results', { results });
        } catch (error) {
            console.error('保存测试结果失败:', error);
            throw error;
        }
    },
}; 
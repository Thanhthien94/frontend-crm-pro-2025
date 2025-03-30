import api from '@/lib/api';
import { DealFormData } from '@/types/deal';
import { mapFormDataToApiData } from '@/utils/deals-mapper';

export const dealService = {
  // Lấy danh sách deals với các filter
  getDeals: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return api.get(`/deals?${queryParams}`);
  },
  
  // Lấy chi tiết deal
  getDeal: async (id: string) => {
    return api.get(`/deals/${id}`);
  },
  
  // Tạo deal mới
  createDeal: async (dealData: DealFormData) => {
    const apiData = mapFormDataToApiData(dealData);
    return api.post('/deals', apiData);
  },
  
  // Cập nhật deal
  updateDeal: async (id: string, dealData: Partial<DealFormData>) => {
    const apiData = mapFormDataToApiData(dealData as DealFormData);
    return api.patch(`/deals/${id}`, apiData);
  },
  
  // Xóa deal
  deleteDeal: async (id: string) => {
    return api.delete(`/deals/${id}`);
  },
  
  // Lấy tổng hợp deal
  getDealSummary: async () => {
    return api.get('/deals/summary');
  },
  
  // Thay đổi stage cho deal
  changeDealStage: async (id: string, stage: string) => {
    return api.patch(`/deals/${id}`, { stage });
  }
};

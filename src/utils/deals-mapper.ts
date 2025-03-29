/**
 * Utility để map giữa dữ liệu form và dữ liệu API
 */
import { Deal, DealFormData } from '@/types/deal';

/**
 * Chuyển đổi từ dữ liệu form sang dữ liệu API
 * @param formData Dữ liệu từ form (sử dụng name)
 * @returns Dữ liệu cho API (sử dụng title)
 */
export function mapFormDataToApiData(formData: DealFormData) {
  const { name, ...rest } = formData;
  
  const apiData = {
    title: name, // Chuyển name thành title
    ...rest
  };
  
  return apiData;
}

/**
 * Chuyển đổi từ dữ liệu API sang dữ liệu form
 * @param apiData Dữ liệu từ API (sử dụng title)
 * @returns Dữ liệu cho form (sử dụng name)
 */
export function mapApiDataToFormData(apiData: Deal): DealFormData & { name: string } {
  const formData = {
    name: apiData.title, // Chuyển title thành name
    value: apiData.value,
    stage: apiData.stage,
    expectedCloseDate: apiData.expectedCloseDate,
    customer: apiData.customer._id,
    assignedTo: apiData.assignedTo?._id,
    notes: apiData.notes,
    probability: apiData.probability,
    status: apiData.status,
  };
  
  return formData;
}
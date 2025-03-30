import { Deal, DealFormData } from '@/types/deal';

export function mapFormDataToApiData(formData: DealFormData) {
  const { name, ...rest } = formData;
  
  return {
    title: name, // Chuyển name thành title
    ...rest
  };
}

export function mapApiDataToFormData(apiData: Deal): DealFormData & { name: string } {
  return {
    name: apiData.title, // Chuyển title thành name
    value: apiData.value,
    stage: apiData.stage,
    expectedCloseDate: apiData.expectedCloseDate,
    customer: apiData.customer._id,
    assignedTo: apiData.assignedTo?._id,
    notes: apiData.notes,
    probability: apiData.probability,
    status: apiData.status || 'active',
    customFields: apiData.customFields
  };
}
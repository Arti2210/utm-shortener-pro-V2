import axios from 'axios';
import { GeneratedLink } from '../store/appStore';

export interface GenerateLinksPayload {
  baseUrl: string;
  campaignName: string;
  selectedPlatforms: string[];
  selectedMediums: string[];
  apiKey?: string;
}

export interface GenerateLinksResponse {
  success: boolean;
  data?: GeneratedLink[];
  error?: string;
}

export async function generateLinks(payload: GenerateLinksPayload): Promise<GenerateLinksResponse> {
  const response = await axios.post<GenerateLinksResponse>('/api/links/generate', payload, {
    timeout: 30000,
  });
  return response.data;
}

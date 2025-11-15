// frontend/src/adapters/infrastructure/api/ApiClient.ts
import axios from 'axios';
import type { IApiClient }  from '../../../core/ports/api.port';
import type { ComparisonData, Route } from '../../../core/domain/types';

// The backend is running on http://localhost:3001
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export class ApiClient implements IApiClient {

  async getRoutes(): Promise<Route[]> {
    const response = await api.get('/routes');
    return response.data;
  }

  async setBaseline(routeId: string): Promise<void> {
    await api.post(`/routes/${routeId}/baseline`);
  }

  async getComparison(): Promise<ComparisonData> {
    const response = await api.get('/routes/comparison');
    return response.data;
  }
}

// Create a single instance for the app to use
export const apiClient = new ApiClient();
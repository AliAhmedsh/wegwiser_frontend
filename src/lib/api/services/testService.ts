import { API_CONFIG, getCookie } from '../../config/api';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  duration: number;
  failureMessages: string[];
  filePath: string;
}

export interface TestSuiteResult {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: TestResult[];
  error: string | null;
}

export interface RunTestsResponse {
  success: boolean;
  testType: string;
  results: TestSuiteResult;
  timestamp: string;
}

export interface AvailableTestsResponse {
  success: boolean;
  testFiles: string[];
  count: number;
  timestamp: string;
}

class TestService {
  private baseURL = `${API_CONFIG.BASE_URL}/tests`;

  async runTests(testType: 'unit' | 'integration' | 'accessibility' | 'performance' | 'all' = 'all'): Promise<RunTestsResponse> {
    try {
      console.log(`🧪 Running ${testType} tests via API...`);
      
      // Get token from cookies (same pattern as other services)
      let token = getCookie('access_token');
      if (!token) {
        token = getCookie('token');
      }

      const response = await fetch(`${this.baseURL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ testType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RunTestsResponse = await response.json();
      
      return data;
      
    } catch (error) {
      console.error(`Error running ${testType} tests:`, error);
      throw error;
    }
  }

  async getAvailableTests(): Promise<AvailableTestsResponse> {
    try {
      // Get token from cookies (same pattern as other services)
      let token = getCookie('access_token');
      if (!token) {
        token = getCookie('token');
      }

      const response = await fetch(`${this.baseURL}/available`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AvailableTestsResponse = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error getting available tests:', error);
      throw error;
    }
  }
}

export const testService = new TestService();


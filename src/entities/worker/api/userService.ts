import { CreateWorkerDto, WorkerListProps } from '../type';
import useUserStore from './mock/userStore';

class UserApiService {
  private static _instance: UserApiService | null = null;

  private constructor() {}

  static getInstance(): UserApiService {
    if (!UserApiService._instance) {
      UserApiService._instance = new UserApiService();
    }
    return UserApiService._instance;
  }

  async getAll(): Promise<WorkerListProps[]> {
    return new Promise((res) =>
      setTimeout(() => res([...useUserStore.getState().users]), 400)
    );
  }

  async create(data: CreateWorkerDto): Promise<WorkerListProps> {
    return new Promise((res) =>
      setTimeout(() => {
        const newUser = useUserStore.getState().addUser(data);
        res(newUser);
      }, 700)
    );
  }
}

export const userApiService = UserApiService.getInstance();

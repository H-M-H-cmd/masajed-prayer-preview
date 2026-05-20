import { BaseService } from './base.service';

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

class TransactionsService extends BaseService {
  constructor() {
    super('/transactions');
  }

  // Add transaction-specific methods here
  async getTransactionStats() {
    const { data } = await this.api.get(`${this.endpoint}/stats`);
    return data;
  }
}

export const transactionsService = new TransactionsService(); 
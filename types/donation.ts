export interface Donation {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  donor: {
    id: string;
    name: string;
    phone: string;
  };
  paymentMethod: string;
  transactionId: string;
  mosque: {
    id: string;
    name: string;
  };
  referenceNumber: string;
  accountNumber: string;
  bankName: string;
  cardNumber: string;
  cardLastDigits: string;
}

export interface DonationRow extends Donation {
}

export interface DonationPaginatedResponse {
	data: Donation[];
	meta: {
		current_page: number;
		from: number;
		last_page: number;
		per_page: number;
		to: number;
		total: number;
	};
}
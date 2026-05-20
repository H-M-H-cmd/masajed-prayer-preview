export interface Need {
	id: string;
	title: string;
	status: 'new' | 'progress' | 'completed' | 'cancelled';
	date: string;
	contractor: {
		id: string;
		name: string;
	};
	cost: number;
	execution_time: string;
	donors_count: number;
	remaining_amount: number;
	total_amount: number;
}

export interface NeedRow extends Need {
}

export interface NeedPaginatedResponse {
	data: Need[];
	meta: {
		current_page: number;
		from: number;
		last_page: number;
		per_page: number;
		to: number;
		total: number;
	};
}

export interface CreateNeedData {
	title: string;
	status: 'new' | 'progress' | 'completed' | 'cancelled';
	date: string;
	contractor_id: string;
	cost: number;
	mosque_id: string;
}
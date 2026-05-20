import { ApiResponse } from "@/types/api";
import { Need, NeedPaginatedResponse, CreateNeedData } from "@/types/need";
import { BaseService } from "./base.service";

// Mock data
const mockNeeds: Need[] = [
	{
		id: "qwr12dsf314",
		title: "ترميم الحمامات",
		status: "progress",
		date: "20-12-2024",
		contractor: {
			id: "tewt3234",
			name: "احمد محمد",
		},
		cost: 12000,
		execution_time: "20-12-2024",
		donors_count: 29,
		total_amount: 4500,
		remaining_amount: 2500
	},
	{
		id: "qwr12dsf315",
		title: "صيانة المكيفات",
		status: "new",
		date: "25-12-2024",
		contractor: {
			id: "tewt3235",
			name: "محمد احمد",
		},
		cost: 15000,
		execution_time: "20-12-2024",
		donors_count: 29,
		total_amount: 4500,
		remaining_amount: 2500
	},
	{
		id: "qwr12dsf316",
		title: "تغيير السجاد",
		status: "completed",
		date: "15-12-2024",
		contractor: {
			id: "tewt3236",
			name: "خالد محمد",
		},
		cost: 8000,
		execution_time: "20-12-2024",
		donors_count: 29,
		total_amount: 4500,
		remaining_amount: 2500
	}
];

class NeedService extends BaseService {
	constructor() {
		super("/needs");
	}

	async getNeeds(params?: {
		page?: number;
		perPage?: number;
		search?: string;
		sort?: { key: keyof Need; direction: "asc" | "desc" };
		mosque_id?: string;
	}): Promise<ApiResponse<NeedPaginatedResponse>> {
		// Mock implementation
		let filteredNeeds = [...mockNeeds];

		// Apply search
		if (params?.search) {
			const searchLower = params.search.toLowerCase();
			filteredNeeds = filteredNeeds.filter(
				need => need.title.toLowerCase().includes(searchLower)
			);
		}

		// Apply sorting
		if (params?.sort) {
			filteredNeeds.sort((a, b) => {
				const aValue = a[params.sort!.key];
				const bValue = b[params.sort!.key];
				const direction = params.sort!.direction === "asc" ? 1 : -1;
				return aValue > bValue ? direction : -direction;
			});
		}

		// Apply pagination
		const page = params?.page || 1;
		const perPage = params?.perPage || 10;
		const start = (page - 1) * perPage;
		const end = start + perPage;
		const paginatedNeeds = filteredNeeds.slice(start, end);

		return {
			data: {
				data: paginatedNeeds,
				meta: {
					current_page: page,
					from: start + 1,
					last_page: Math.ceil(filteredNeeds.length / perPage),
					per_page: perPage,
					to: Math.min(end, filteredNeeds.length),
					total: filteredNeeds.length,
				},
			},
			message: "Success",
			status: 200,
		};
	}

	async getNeed(id: string): Promise<ApiResponse<Need>> {
		const need = mockNeeds.find(n => n.id === id);
		if (!need) {
			throw new Error("Need not found");
		}
		return {
			data: need,
			message: "Success",
			status: 200,
		};
	}

	async createNeed(data: CreateNeedData): Promise<ApiResponse<Need>> {
		const newNeed: Need = {
			id: Math.random().toString(36).substring(7),
			...data,
			contractor: {
				id: data.contractor_id,
				name: "New Contractor", // Mock name
			},
			execution_time: "20-12-2024",
			donors_count: 29,
			total_amount: 4500,
			remaining_amount: 2500
		};
		mockNeeds.push(newNeed);
		return {
			data: newNeed,
			message: "Success",
			status: 200,
		};
	}

	async updateNeed(id: string, data: Partial<CreateNeedData>): Promise<ApiResponse<Need>> {
		const index = mockNeeds.findIndex(n => n.id === id);
		if (index === -1) {
			throw new Error("Need not found");
		}
		const updatedNeed = {
			...mockNeeds[index],
			...data,
			contractor: data.contractor_id ? {
				id: data.contractor_id,
				name: "Updated Contractor", // Mock name
			} : mockNeeds[index].contractor,
		};
		mockNeeds[index] = updatedNeed;
		return {
			data: updatedNeed,
			message: "Success",
			status: 200,
		};
	}

	async deleteNeed(id: string): Promise<ApiResponse<void>> {
		const index = mockNeeds.findIndex(n => n.id === id);
		if (index === -1) {
			throw new Error("Need not found");
		}
		mockNeeds.splice(index, 1);
		return {
			data: undefined,
			message: "Success",
			status: 200,
		};
	}
}

export const needService = new NeedService();
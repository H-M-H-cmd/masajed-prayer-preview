import { ApiResponse } from "@/types/api";
import { Donation, DonationPaginatedResponse } from "@/types/donation";
import { BaseService } from "./base.service";

// Mock data
const mockDonations: Donation[] = [
  {
    id: "don1",
    title: "تبرع لصيانة المكيفات",
    amount: 5000,
    status: "approved",
    date: "2024-02-15",
    donor: {
      id: "dr1",
      name: "عبدالله محمد",
      phone: "0501234567"
    },
    paymentMethod: "bank_transfer",
    transactionId: "TR123456",
    mosque: {
      id: "msq1",
      name: "مسجد النور"
    },
    referenceNumber: "1234567890",
    accountNumber: "1234567890",
    bankName: "Al-Rajhi Bank",
    cardNumber: "1234567890",
    cardLastDigits: "1234"
  },
  {
    id: "don2",
    title: "تبرع لتجديد السجاد",
    amount: 3000,
    status: "pending",
    date: "2024-02-16",
    donor: {
      id: "dr2",
      name: "خالد احمد",
      phone: "0507654321"
    },
    paymentMethod: "card",
    transactionId: "TR123457",
    mosque: {
      id: "msq1",
      name: "مسجد النور"
    },
    referenceNumber: "1234567890",
    accountNumber: "1234567890",
    bankName: "Al-Rajhi Bank",
    cardNumber: "1234567890",
    cardLastDigits: "1234"
  },
  {
    id: "don3",
    title: "تبرع لصيانة دورات المياه",
    amount: 2000,
    status: "approved",
    date: "2024-02-14",
    donor: {
      id: "dr3",
      name: "محمد سعيد",
      phone: "0509876543"
    },
    paymentMethod: "cash",
    transactionId: "TR123458",
    mosque: {
      id: "msq1",
      name: "مسجد النور"
    },
    referenceNumber: "1234567890",
    accountNumber: "1234567890",
    bankName: "Al-Rajhi Bank",
    cardNumber: "1234567890",
    cardLastDigits: "1234"
  },
  {
    id: "don4",
    title: "تبرع عام",
    amount: 1000,
    status: "rejected",
    date: "2024-02-13",
    donor: {
      id: "dr4",
      name: "فهد عبدالله",
      phone: "0503456789"
    },
    paymentMethod: "online",
    transactionId: "TR123459",
    mosque: {
      id: "msq1",
      name: "مسجد النور"
    },
    referenceNumber: "1234567890",
    accountNumber: "1234567890",
    bankName: "Al-Rajhi Bank",
    cardNumber: "1234567890",
    cardLastDigits: "1234"
  },
  {
    id: "don5",
    title: "تبرع لصيانة الإنارة",
    amount: 1500,
    status: "approved",
    date: "2024-02-12",
    donor: {
      id: "dr5",
      name: "سعد محمد",
      phone: "0502345678"
    },
    paymentMethod: "bank_transfer",
    transactionId: "TR123460",
    mosque: {
      id: "msq1",
      name: "مسجد النور"
    },
    referenceNumber: "1234567890",
    accountNumber: "1234567890",
    bankName: "Al-Rajhi Bank",
    cardNumber: "1234567890",
    cardLastDigits: "1234"
  }
];

class DonationService extends BaseService {
  constructor() {
    super("/donations");
  }

  async getDonations(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    sort?: { key: keyof Donation; direction: "asc" | "desc" };
    mosque_id?: string;
  }): Promise<ApiResponse<DonationPaginatedResponse>> {
    // Mock implementation
    let filteredDonations = [...mockDonations];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredDonations = filteredDonations.filter(
        donation => donation.title.toLowerCase().includes(searchLower)
      );
    }

    if (params?.mosque_id) {
      filteredDonations = filteredDonations.filter(
        donation => donation.mosque.id === params.mosque_id
      );
    }

    if (params?.sort) {
      filteredDonations.sort((a, b) => {
        const aValue = a[params.sort!.key];
        const bValue = b[params.sort!.key];
        const direction = params.sort!.direction === "asc" ? 1 : -1;
        return aValue > bValue ? direction : -direction;
      });
    }

    const page = params?.page || 1;
    const perPage = params?.perPage || 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedDonations = filteredDonations.slice(start, end);

    return {
      data: {
        data: paginatedDonations,
        meta: {
          current_page: page,
          from: start + 1,
          last_page: Math.ceil(filteredDonations.length / perPage),
          per_page: perPage,
          to: Math.min(end, filteredDonations.length),
          total: filteredDonations.length,
        },
      },
      message: "Success",
      status: 200,
    };
  }

  async getDonation(id: string): Promise<ApiResponse<Donation>> {
    const donation = mockDonations.find(d => d.id === id);
    if (!donation) {
      throw new Error("Donation not found");
    }
    return {
      data: donation,
      message: "Success",
      status: 200,
    };
  }
}

export const donationService = new DonationService();

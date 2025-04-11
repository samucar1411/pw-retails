import { api } from "./api";

import { Company, CompanyUpdateInput } from "@/types/company";

const ENDPOINT = "/api/companys/";

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const response = await api.get(ENDPOINT, {
      params: { format: "json" },
    });
  
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

export const getCompanyById = async (id: string): Promise<Company | null> => {
  if (!id) {
    console.error("Invalid company ID provided");
    return null;
  }

  try {
    const url = `${ENDPOINT}${id}/`;
    const response = await api.get(url, {
      params: { format: "json" },
    });

    if (!response?.data) {
      return null;
    }

    // Validate the response data structure
    const company = response.data;
    if (!company.id || !company.name) {
      console.warn("Invalid company data received:", company);
      return null;
    }

    return company;
  } catch (error: any) {
    // Handle specific error cases
    if (!error.response) {
      console.error("Network error:", error);
      throw new Error("Error de conexión");
    }

    if (error.response.status === 404) {
      return null;
    }

    if (error.response.status === 401) {
      throw new Error("No autorizado");
    }

    console.error("API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw new Error(
      error.response?.data?.detail || 
      error.response?.data?.message || 
      "Error al cargar el cliente"
    );
  }
};

export const updateCompany = async (
  id: string,
  data: Partial<Company>
): Promise<Company | null> => {
  try {
    const response = await api.put(`${ENDPOINT}${id}/`, data, {
      headers: { "Content-Type": "application/json" },
      params: { format: "json" },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al actualizar el cliente"
    );
  }
};

export const createCompany = async (
  data: FormData
): Promise<Company | null> => {
  try {
    const response = await api.post(ENDPOINT, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { format: "json" },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al crear el cliente"
    );
  }
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${ENDPOINT}${id}/`, {
      params: { format: "json" },
    });
    return true;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al eliminar el cliente"
    );
  }
};

class CompanyService {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  async deleteCompany(companyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/companies/${companyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete company");
    }
  }

  async updateCompany(
    companyId: string,
    data: CompanyUpdateInput
  ): Promise<Company> {
    const transformedData = {
      name: data.name,
      emp_qty: data.emp_qty,
      businessName: data.business_name,
      identificationNumber: data.identification_number,
      legalNames: data.legal_names,
      legalLastNames: data.legal_last_names,
      legalIdentificationNumber: data.legal_identification_number,
      economyActivity: data.economy_activity,
      personalNames: data.contact,
      email: data.email,
      country: data.country,
    };

    const response = await fetch(`${this.baseUrl}/companies/${companyId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      throw new Error("Failed to update company");
    }

    return response.json();
  }
}

export const companyService = new CompanyService();

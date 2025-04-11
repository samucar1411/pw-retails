import { notFound, redirect } from "next/navigation";

import { EditCompanyForm } from "./edit-form";

import { getCompanyById } from "@/services/company-service";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ClientDetailPage({ params }: Props) {
  const id = (await params).id;

  try {
    console.log("[Client Detail Page] Fetching company with ID:", id);
    const company = await getCompanyById(id);

    if (!company) {
      return notFound();
    }

    return <EditCompanyForm company={company} />;
  } catch (error) {
    console.error("[Client Detail Page] Error loading company:", error);
    redirect("/dashboard/clientes");
  }
}

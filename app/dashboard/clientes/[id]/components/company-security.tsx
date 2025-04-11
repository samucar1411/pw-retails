"use client";

import { useEffect, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { OfficeCamManager } from "@/types/office-cam-manager";

import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanySecurityProps {
  companyId: string;
}

// Mock data
const mockCamManagers: OfficeCamManager[] = [
  {
    id: 1,
    Address: "192.168.1.100",
    Port: 8080,
    Enable: true,
    EnableAuthentication: true,
    Company: 1,
    Office: 1,
    Name: "Cámara Principal",
    Description: "Entrada principal",
    User: "admin",
    Username: "admin",
    Password: "****",
    syncVersion: null,
    Closed: false,
    Type: {
      id: 1,
      Code: "HIKVISION",
      syncVersion: null,
      Closed: false,
    },
    Path: "/stream",
  },
  {
    id: 2,
    Address: "192.168.1.101",
    Port: 8081,
    Enable: false,
    EnableAuthentication: true,
    Company: 1,
    Office: 1,
    Name: "Cámara Estacionamiento",
    Description: "Estacionamiento sur",
    User: "admin",
    Username: "admin",
    Password: "****",
    syncVersion: null,
    Closed: false,
    Type: {
      id: 1,
      Code: "HIKVISION",
      syncVersion: null,
      Closed: false,
    },
    Path: "/stream",
  },
  {
    id: 3,
    Address: "192.168.1.102",
    Port: 8082,
    Enable: true,
    EnableAuthentication: true,
    Company: 1,
    Office: 2,
    Name: "Cámara Depósito",
    Description: "Área de depósito",
    User: "admin",
    Username: "admin",
    Password: "****",
    syncVersion: null,
    Closed: false,
    Type: {
      id: 1,
      Code: "HIKVISION",
      syncVersion: null,
      Closed: false,
    },
    Path: "/stream",
  },
];

export function CompanySecurity({ companyId }: CompanySecurityProps) {
  const [camManagers, setCamManagers] = useState<OfficeCamManager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Filter mock data by company ID
      const filteredCamManagers = mockCamManagers.filter(
        (cam) => cam.Company.toString() === companyId
      );
      setCamManagers(filteredCamManagers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [companyId]);

  const columns: ColumnDef<OfficeCamManager>[] = [
    {
      accessorKey: "Name",
      header: "Nombre",
    },
    {
      accessorKey: "Address",
      header: "Dirección IP",
    },
    {
      accessorKey: "Port",
      header: "Puerto",
    },
    {
      accessorKey: "Description",
      header: "Descripción",
    },
    {
      accessorKey: "Enable",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={row.getValue("Enable") ? "text-green-600" : "text-red-600"}
        >
          {row.getValue("Enable") ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Cámaras</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={camManagers} loading={loading} />
        </CardContent>
      </Card>

      {/* Add more security-related cards */}
    </div>
  );
}

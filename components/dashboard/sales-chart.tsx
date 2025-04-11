"use client"

interface SalesData {
  name: string;
  clientes: number;
  ventas: number;
}

interface SalesChartProps {
  data: SalesData[];
  loading?: boolean;
}

export function SalesChart({ data, loading = false }: SalesChartProps) {
  // Si está cargando, mostrar un esqueleto de carga
  if (loading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center bg-gray-50/10 rounded-md">
        <div className="animate-pulse space-y-4 w-full px-4">
          <div className="h-40 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  // Encontrar el valor máximo para escalar la gráfica
  const maxVentas = Math.max(...data.map(item => item.ventas));
  const maxClientes = Math.max(...data.map(item => item.clientes));
  
  // Función para normalizar un valor al rango 0-100 para la altura de la barra
  const normalizeVentas = (value: number) => (value / maxVentas) * 100;
  const normalizeClientes = (value: number) => (value / maxClientes) * 100;

  return (
    <div className="w-full h-[350px] relative">
      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Ventas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Clientes</span>
        </div>
      </div>
      
      {/* Gráfica simplificada */}
      <div className="flex h-64 items-end justify-between gap-2 border-b border-l border-gray-200 pt-6 pb-2 pl-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full">
            {/* Barras de ventas */}
            <div className="relative w-full h-full flex justify-center items-end">
              <div 
                className="w-4 bg-purple-500 rounded-t opacity-75" 
                style={{ height: `${normalizeVentas(item.ventas)}%` }}
                title={`Ventas: ${item.ventas}`}
              ></div>
              <div 
                className="w-4 bg-green-500 rounded-t opacity-75 ml-1" 
                style={{ height: `${normalizeClientes(item.clientes)}%` }}
                title={`Clientes: ${item.clientes}`}
              ></div>
            </div>
            {/* Etiquetas en el eje X */}
            <div className="text-xs text-gray-500 truncate w-full text-center mt-2">
              {item.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Valores máximos en el eje Y */}
      <div className="absolute left-0 top-0 h-64 flex flex-col justify-between pb-2">
        <span className="text-xs text-gray-500">Max</span>
        <span className="text-xs text-gray-500">
          Ventas: {maxVentas}
        </span>
        <span className="text-xs text-gray-500">
          Clientes: {maxClientes}
        </span>
        <span className="text-xs text-gray-500">0</span>
      </div>
      
      {/* Mensaje cuando no hay datos */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
}
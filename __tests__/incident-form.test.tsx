import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { IncidentForm } from '@/components/incident-form';

// Mock de dependencias externas
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  })
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('IncidentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente el formulario completo', () => {
    render(<IncidentForm />);
    
    // Verificar que las secciones principales existen
    expect(screen.getByText('Información básica')).toBeInTheDocument();
    expect(screen.getByText('Descripción del hecho')).toBeInTheDocument();
    expect(screen.getByText('Pérdidas / montos')).toBeInTheDocument();
    expect(screen.getByText('Sospechosos & adjuntos')).toBeInTheDocument();
    expect(screen.getByText('Notas finales & enviar')).toBeInTheDocument();
    
    // Verificar campos principales
    expect(screen.getByLabelText(/Seleccionar sucursal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hora/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de incidente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    
    // Verificar que el botón de envío existe
    expect(screen.getByRole('button', { name: /Enviar reporte/i })).toBeInTheDocument();
  });

  it('calcula automáticamente el total de pérdidas', async () => {
    render(<IncidentForm />);
    
    // Obtener los campos de entrada
    const cashInput = screen.getByLabelText(/Efectivo/i);
    const merchandiseInput = screen.getByLabelText(/Mercadería/i);
    const otherLossesInput = screen.getByLabelText(/Otras pérdidas/i);
    const totalInput = screen.getByLabelText(/Total/i);
    
    // Verificar que el total inicial es 0
    expect(totalInput).toHaveValue(0);
    
    // Ingresar valores en los campos
    await userEvent.clear(cashInput);
    await userEvent.type(cashInput, '1000');
    
    await userEvent.clear(merchandiseInput);
    await userEvent.type(merchandiseInput, '2000');
    
    await userEvent.clear(otherLossesInput);
    await userEvent.type(otherLossesInput, '500');
    
    // Verificar que el total se actualiza correctamente
    await waitFor(() => {
      expect(totalInput).toHaveValue(3500);
    });
  });

  it('muestra errores de validación cuando los campos requeridos están vacíos', async () => {
    render(<IncidentForm />);
    
    // Hacer clic en el botón de envío sin completar los campos requeridos
    const submitButton = screen.getByRole('button', { name: /Enviar reporte/i });
    await userEvent.click(submitButton);
    
    // Verificar que aparecen mensajes de error
    await waitFor(() => {
      expect(screen.getByText(/Seleccione una sucursal/i)).toBeInTheDocument();
      expect(screen.getByText(/Proporcione una descripción detallada/i)).toBeInTheDocument();
    });
  });

  it('envía el formulario correctamente con datos válidos', async () => {
    const { router, toast } = vi.hoisted(() => ({
      router: { push: vi.fn() },
      toast: { success: vi.fn() }
    }));
    
    render(<IncidentForm />);
    
    // Completar el formulario con valores válidos
    // Seleccionar sucursal
    const branchSelect = screen.getByLabelText(/Seleccionar sucursal/i);
    await userEvent.click(branchSelect);
    await userEvent.click(screen.getByText('PUNTO 560'));
    
    // Completar descripción
    const descriptionInput = screen.getByLabelText(/Descripción/i);
    await userEvent.type(descriptionInput, 'Esto es una descripción detallada del incidente que cumple con los requisitos mínimos.');
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /Enviar reporte/i });
    await userEvent.click(submitButton);
    
    // Verificar que se muestra el mensaje de éxito y redirige
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith({
        title: "Incidente registrado",
        description: "El incidente ha sido registrado exitosamente",
      });
      expect(router.push).toHaveBeenCalledWith('/dashboard/incidentes');
    });
  });
}); 
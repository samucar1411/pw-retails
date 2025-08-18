'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import { ArrowLeft, Loader2, FileText, DollarSign, Users, Plus, X } from 'lucide-react';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Components
import { CurrencyInput } from '@/components/incident-form/currency-input';
import { SuspectSelector } from '@/components/incident-form/suspect-selector';

// Services
import { getIncidentById, updateIncident } from '@/services/incident-service';
import { createIncidentItemLoss, updateIncidentItemLoss, deleteIncidentItemLoss } from '@/services/incident-item-losses-service';
import { getIncidentTypes } from '@/services/incident-service';
import { getAllOfficesComplete } from '@/services/office-service';
import { trackMultipleChanges } from '@/services/change-history-service';

// Hooks
import { useAuth } from '@/context/auth-context';

// Types and Validators
import { Incident } from '@/types/incident';
import { IncidentFormValues, incidentFormSchema } from '@/validators/incident';

interface IncidentEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function IncidentEditPage(props: IncidentEditPageProps) {
  const { id } = use(props.params);
  const router = useRouter();
  const { userInfo } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [originalIncident, setOriginalIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [incidentTypes, setIncidentTypes] = useState<{id: number; Name: string}[]>([]);
  const [offices, setOffices] = useState<{id: number; Name: string; Address: string}[]>([]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      date: '',
      time: '',
      incidentTypeId: 0,
      officeId: 0,
      description: '',
      notes: '',
      cashLoss: 0,
      merchandiseLoss: 0,
      otherLosses: 0,
      selectedSuspects: [],
      incidentLossItem: [],
      attachments: [],
    },
  });

  const { fields: merchandiseFields, append: appendMerchandise, remove: removeMerchandise } = useFieldArray({
    control: form.control,
    name: 'incidentLossItem',
  });

  // Fetch incident data and populate form
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch incident, types and offices in parallel
        const [incidentData, typesResponse, officesData] = await Promise.all([
          getIncidentById(id),
          getIncidentTypes(),
          getAllOfficesComplete()
        ]);

        setIncident(incidentData);
        setOriginalIncident(incidentData); // Store original data for change tracking
        setIncidentTypes(typesResponse.results || []);
        setOffices(officesData || []);

        // Populate form with incident data
        if (incidentData) {
          const formData: IncidentFormValues = {
            date: incidentData.Date ? incidentData.Date.split('T')[0] : '',
            time: incidentData.Time || '',
            incidentTypeId: incidentData.IncidentType || 0,
            officeId: typeof incidentData.Office === 'number' ? incidentData.Office : (incidentData.Office?.id || 0),
            description: incidentData.Description || '',
            notes: incidentData.Notes || '',
            cashLoss: parseFloat(incidentData.CashLoss || '0'),
            cashFondo: parseFloat(incidentData.Tags?.cashFondo || '0'),
            cashRecaudacion: parseFloat(incidentData.Tags?.cashRecaudacion || '0'),
            merchandiseLoss: parseFloat(incidentData.MerchandiseLoss || '0'),
            otherLosses: parseFloat(incidentData.OtherLosses || '0'),
            totalLoss: parseFloat(incidentData.TotalLoss || '0'),
            selectedSuspects: incidentData.Suspects?.map(suspectId => ({
              apiId: suspectId,
              alias: 'Cargando...',
              statusId: 1,
              description: '',
              image: '',
              isNew: false,
            })) || [],
            incidentLossItem: (incidentData.IncidentItemLosses || incidentData.incidentLossItem)?.map(item => {
              // Handle both API format (IncidentItemLosses) and form format (incidentLossItem)
              const isApiFormat = 'Description' in item;
              return {
                id: item.id,
                description: isApiFormat ? (item as { Description?: string }).Description || '' : (item as { description?: string }).description || '',
                quantity: isApiFormat ? (item as { Quantity?: number }).Quantity || 0 : (item as { quantity?: number }).quantity || 0,
                unitPrice: parseFloat(String(isApiFormat ? (item as { UnitPrice?: number }).UnitPrice || 0 : (item as { unitPrice?: number }).unitPrice || 0)),
                total: parseFloat(String(isApiFormat ? (item as { TotalValue?: number }).TotalValue || 0 : (item as { total?: number }).total || 0)),
                type: (isApiFormat ? (item as { ItemType?: string }).ItemType || 'mercaderia' : (item as { type?: string }).type || 'mercaderia') as 'mercaderia' | 'material',
              };
            }) || [],
            attachments: incidentData.Attachments?.map(attachment => ({
              id: attachment.id || Date.now(),
              url: attachment.url,
              name: attachment.name || 'Archivo adjunto',
              contentType: attachment.contentType || 'application/octet-stream'
            })) || [],
          };
          
          form.reset(formData);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del incidente',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  // Calculate merchandise total
  const calculateMerchandiseTotal = useCallback(() => {
    return merchandiseFields.reduce((total, item) => {
      const quantity = form.watch(`incidentLossItem.${merchandiseFields.indexOf(item)}.quantity`) || 0;
      const unitPrice = form.watch(`incidentLossItem.${merchandiseFields.indexOf(item)}.unitPrice`) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }, [merchandiseFields, form]);

  // Update merchandise loss when items change
  useEffect(() => {
    const total = calculateMerchandiseTotal();
    form.setValue('merchandiseLoss', total);
  }, [merchandiseFields, form, calculateMerchandiseTotal]);

  const onSubmit = async (values: IncidentFormValues) => {
    if (!incident || !originalIncident || !userInfo?.user_id) {
      return;
    }

    setSaving(true);
    try {
      const cashFondo = values.cashFondo || 0;
      const cashRecaudacion = values.cashRecaudacion || 0;
      const cashLoss = cashFondo + cashRecaudacion;
      const totalLoss = cashLoss + values.merchandiseLoss + values.otherLosses;

      const updateData = {
        Date: values.date,
        Time: values.time,
        IncidentType: values.incidentTypeId,
        Office: values.officeId,
        Description: values.description,
        Notes: values.notes,
        CashLoss: cashLoss.toString(),
        MerchandiseLoss: values.merchandiseLoss.toString(),
        OtherLosses: values.otherLosses.toString(),
        TotalLoss: totalLoss.toString(),
        Tags: {
          cashFondo: cashFondo.toString(),
          cashRecaudacion: cashRecaudacion.toString()
        },
        Attachments: values.attachments,
        Suspects: values.selectedSuspects?.map(s => s.apiId).filter((id): id is string => Boolean(id)) || [],
      };

      // Update the incident
      await updateIncident(id, updateData);

      // Update incident item losses
      if (values.incidentLossItem && values.incidentLossItem.length > 0) {
        // Get existing incident item losses
        const existingLosses = incident.IncidentItemLosses || [];
        const existingLossIds = existingLosses.map(loss => loss.id);
        
        for (const item of values.incidentLossItem) {
          const lossItemPayload = {
            ItemType: item.type,
            Description: item.description || '',
            Quantity: item.quantity,
            UnitPrice: item.unitPrice,
            TotalValue: item.quantity * item.unitPrice,
            Incident: parseInt(id)
          };
          
          try {
            if (item.id && existingLossIds.includes(item.id)) {
              // Update existing item
              await updateIncidentItemLoss(item.id, lossItemPayload);
            } else {
              // Create new item
              await createIncidentItemLoss(lossItemPayload);
            }
          } catch (error) {
            console.error('Error updating loss item:', error);
            // Continue with other items even if one fails
          }
        }
        
        // Delete items that were removed (exist in original but not in current)
        const currentItemIds = values.incidentLossItem.map(item => item.id).filter(Boolean);
        const itemsToDelete = existingLosses.filter(loss => 
          loss.id && !currentItemIds.includes(loss.id)
        );
        
        for (const itemToDelete of itemsToDelete) {
          try {
            if (itemToDelete.id) {
              await deleteIncidentItemLoss(itemToDelete.id);
            }
          } catch (error) {
            console.error('Error deleting loss item:', error);
            // Continue with other deletions even if one fails
          }
        }
      }

      // Track changes in history
      try {
        await trackMultipleChanges(
          'incident',
          id,
          {
            Date: originalIncident.Date,
            Time: originalIncident.Time,
            IncidentType: originalIncident.IncidentType,
            Office: originalIncident.Office,
            Description: originalIncident.Description,
            Notes: originalIncident.Notes,
            CashLoss: originalIncident.CashLoss,
            MerchandiseLoss: originalIncident.MerchandiseLoss,
            OtherLosses: originalIncident.OtherLosses,
            TotalLoss: originalIncident.TotalLoss,
            Suspects: originalIncident.Suspects,
          },
          updateData,
          userInfo.user_id.toString(),
          ['Date', 'Time', 'IncidentType', 'Office', 'Description', 'Notes', 'CashLoss', 'MerchandiseLoss', 'OtherLosses', 'TotalLoss', 'Suspects']
        );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
        // Don't fail the update if change tracking fails
      }

      toast({
        title: 'Éxito',
        description: 'Incidente actualizado correctamente',
      });

      router.push(`/dashboard/incidentes/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      if (axiosError.response?.data) {
        const backendErrors = axiosError.response.data;
        Object.entries(backendErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            // Map backend field names to form field names if needed
            const formField = field as keyof IncidentFormValues;
            form.setError(formField, {
              type: 'manual',
              message: errors[0]
            });
          }
        });
      }

      toast({
        title: 'Error',
        description: 'No se pudo actualizar el incidente',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos del incidente...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          <p>No se pudo encontrar el incidente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/incidentes">Incidentes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/incidentes/${id}`}>
                {incident.id}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/incidentes/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Editar Incidente</h1>
              <p className="text-sm text-muted-foreground">ID: {incident.id}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Información Básica</h3>
                    <p className="text-sm text-muted-foreground">Detalles generales del incidente</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha del incidente</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora del incidente</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de incidente</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.Name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="officeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sucursal</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la sucursal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {offices.map((office) => (
                              <SelectItem key={office.id} value={office.id.toString()}>
                                {office.Name} - {office.Address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del incidente</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe detalladamente lo ocurrido..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Información adicional relevante..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Losses Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-destructive/10 p-2">
                    <DollarSign className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Pérdidas</h3>
                    <p className="text-sm text-muted-foreground">Detalle de los montos perdidos</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cashLoss"
                    render={({ field }) => (
                      <FormItem>
                        <CurrencyInput
                          label="Efectivo perdido"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherLosses"
                    render={({ field }) => (
                      <FormItem>
                        <CurrencyInput
                          label="Otras pérdidas"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Merchandise Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Mercadería perdida</h4>
                      <p className="text-xs text-muted-foreground">
                        Total: {new Intl.NumberFormat('es-PY').format(calculateMerchandiseTotal())} Gs.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendMerchandise({ description: '', quantity: 1, unitPrice: 0, total: 0, type: 'mercaderia' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar ítem
                    </Button>
                  </div>

                  {merchandiseFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name={`incidentLossItem.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Descripción del ítem" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`incidentLossItem.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Cantidad"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`incidentLossItem.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Precio unitario"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMerchandise(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suspects Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Sospechosos</h3>
                    <p className="text-sm text-muted-foreground">Personas involucradas en el incidente</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SuspectSelector control={form.control} />
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
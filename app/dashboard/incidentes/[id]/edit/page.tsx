'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import { ArrowLeft, Loader2, FileText, DollarSign, Users, Plus, X, Image as ImageIcon, Trash, UploadCloud } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { FileUploader } from '@/components/FileUploader';
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
import { getSuspectById } from '@/services/suspect-service';
import { authService } from '@/services/auth-service';
import { createIncidentImageMetadata, IncidentImageMetadataCreateInput } from '@/services/incident-image-metadata-service';

// Hooks
import { useAuth } from '@/context/auth-context';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useFileUpload } from '@/hooks/useFileUpload';

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
  
  // Upload hooks
  const { uploadImage, isUploading: isImageUploading } = useImageUpload();
  const { uploadFile, isUploading: isFileUploading } = useFileUpload();

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
      incidentImages: [],
    },
  });

  const { fields: merchandiseFields, append: appendMerchandise, remove: removeMerchandise } = useFieldArray({
    control: form.control,
    name: 'incidentLossItem',
  });

  // Fetch incident data and populate form
  const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch incident, types and offices in parallel
        const [incidentData, typesResponse, officesData] = await Promise.all([
          getIncidentById(id),
          getIncidentTypes(),
          getAllOfficesComplete()
        ]);

        console.log('fetchData - Incident data loaded:', {
          incidentData: !!incidentData,
          incidentId: incidentData?.id,
          typesCount: typesResponse.results?.length || 0,
          officesCount: officesData?.length || 0
        });

        if (!incidentData) {
          throw new Error('No se pudieron cargar los datos del incidente');
        }

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
            selectedSuspects: [], // Will be loaded separately below
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
            incidentImages: incidentData.Images?.map(image => ({
              id: image.id || Date.now(),
              url: image.url,
              name: image.name || 'Imagen del incidente',
              contentType: 'image/jpeg'
            })) || [],
          };
          
          form.reset(formData);
          
          // Load suspect details separately
          if (incidentData.Suspects && incidentData.Suspects.length > 0) {
            const suspectPromises = incidentData.Suspects.map(async (suspectId: string) => {
              try {
                const suspect = await getSuspectById(suspectId);
                return {
                  apiId: suspectId,
                  alias: suspect.Alias || 'Sin alias',
                  statusId: 1,
                  description: suspect.PhysicalDescription || '',
                  image: suspect.PhotoUrl || '',
                  isNew: false,
                };
              } catch (error) {
                console.error(`Failed to load suspect ${suspectId}:`, error);
                return {
                  apiId: suspectId,
                  alias: 'Error al cargar',
                  statusId: 1,
                  description: '',
                  image: '',
                  isNew: false,
                };
              }
            });
            
            // Wait for all suspects to load and update form
            Promise.all(suspectPromises).then((loadedSuspects) => {
              form.setValue('selectedSuspects', loadedSuspects);
            });
          }
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

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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


  // Remove attachment
  const removeAttachment = (index: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', currentAttachments.filter((_, i) => i !== index));
  };

  // Remove image
  const removeImage = (index: number) => {
    const currentImages = form.getValues('incidentImages') || [];
    form.setValue('incidentImages', currentImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: IncidentFormValues) => {
    // Debug logging to identify what's missing
    console.log('onSubmit - Debug info:', {
      incident: !!incident,
      originalIncident: !!originalIncident,
      hasToken: !!authService.getToken(),
      formValues: values
    });

    // Check what specific data is missing (solo lo esencial)
    const missingData = [];
    if (!incident) missingData.push('datos del incidente');
    if (!originalIncident) missingData.push('datos originales del incidente');
    
    if (missingData.length > 0) {
      console.error('Missing data for incident update:', missingData);
      toast({
        title: 'Error de datos',
        description: `Faltan: ${missingData.join(', ')}. Por favor recarga la página.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields with specific messages
    const missingFields = [];
    if (!values.date) missingFields.push('Fecha del incidente');
    if (!values.incidentTypeId) missingFields.push('Tipo de incidente');
    if (!values.officeId) missingFields.push('Sucursal');
    if (!values.description || values.description.trim() === '') missingFields.push('Descripción del incidente');
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos obligatorios faltantes',
        description: `Por favor completa: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
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
        Attachments: values.attachments || [],
        Images: values.incidentImages || [],
        Suspects: values.selectedSuspects?.map(s => s.apiId).filter((id): id is string => Boolean(id)) || [],
      };

      // Process images: create IncidentImageMetadata for new images
      const imageIds: number[] = [];
      
      if (values.incidentImages && values.incidentImages.length > 0) {
        const existingImages = incident!.Images || [];
        const existingImageIds = existingImages.map(img => img.id).filter(Boolean);
        
        for (const image of values.incidentImages) {
          // If image already exists, use its ID
          if (image.id && existingImageIds.includes(image.id)) {
            imageIds.push(Number(image.id));
          } else {
            // Create new IncidentImageMetadata for new images
            try {
              // Download image from Cloudinary to create File object
              const response = await fetch(image.url);
              const blob = await response.blob();
              const file = new File([blob], image.name, { type: image.contentType || 'image/jpeg' });
              
              const imageMetadataInput: IncidentImageMetadataCreateInput = {
                filename: image.name,
                user_id: userInfo?.user_id?.toString() || 'anonymous',
                description: image.name || 'Imagen del incidente',
                img_file: file,
                Tags: null
              };
              
              const createdMetadata = await createIncidentImageMetadata(imageMetadataInput);
              if (createdMetadata.id) {
                imageIds.push(createdMetadata.id);
              }
            } catch (error) {
              console.error('Error creating image metadata:', error);
              toast({
                title: 'Advertencia',
                description: `Error al procesar imagen: ${image.name}`,
                variant: 'destructive',
              });
            }
          }
        }
      }
      
      // Update Images in payload to use IDs
      const updateDataWithImageIds = { ...updateData, Images: imageIds };

      // Update the incident
      const updatedIncident = await updateIncident(id, updateDataWithImageIds as unknown as Partial<Incident>);
      
      if (!updatedIncident) {
        throw new Error('No se pudo actualizar el incidente');
      }


      // Update incident item losses
      if (values.incidentLossItem && values.incidentLossItem.length > 0) {
        // Get existing incident item losses
        const existingLosses = incident!.IncidentItemLosses || [];
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
              const newItem = await createIncidentItemLoss(lossItemPayload);
              // Update the item with the new ID from backend
              if (newItem && newItem.id) {
                item.id = newItem.id;
              }
            }
          } catch (error) {
            console.error('Error updating loss item:', error);
            toast({
              title: 'Advertencia',
              description: `Error al procesar ítem: ${item.description}`,
              variant: 'destructive',
            });
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
            toast({
              title: 'Advertencia',
              description: `Error al eliminar ítem: ${itemToDelete.Description || 'Ítem sin nombre'}`,
              variant: 'destructive',
            });
          }
        }
      }

      // Track changes in history (skip if no userInfo)
      if (userInfo?.user_id) {
        try {
          await trackMultipleChanges(
            'incident',
            id,
            {
              Date: originalIncident!.Date,
              Time: originalIncident!.Time,
              IncidentType: originalIncident!.IncidentType,
              Office: originalIncident!.Office,
              Description: originalIncident!.Description,
              Notes: originalIncident!.Notes,
              CashLoss: originalIncident!.CashLoss,
              MerchandiseLoss: originalIncident!.MerchandiseLoss,
              OtherLosses: originalIncident!.OtherLosses,
              TotalLoss: originalIncident!.TotalLoss,
              Suspects: originalIncident!.Suspects,
            },
            updateData,
            userInfo.user_id.toString(),
            ['Date', 'Time', 'IncidentType', 'Office', 'Description', 'Notes', 'CashLoss', 'MerchandiseLoss', 'OtherLosses', 'TotalLoss', 'Suspects']
          );
        } catch (error) {
          console.error('Error tracking changes:', error);
          // Don't fail the update if change tracking fails
        }
      }

      toast({
        title: 'Éxito',
        description: 'Incidente actualizado correctamente',
      });

      // Refresh the form with updated data
      await fetchData();
      
      router.push(`/dashboard/incidentes/${id}`);
    } catch (error) {
      console.error('Error updating incident:', error);
      
      const axiosError = error as AxiosError<Record<string, string[]>>;
      let errorMessage = 'No se pudo actualizar el incidente';
      
      if (axiosError.response?.data) {
        const backendErrors = axiosError.response.data;
        Object.entries(backendErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors) && errors.length > 0) {
            // Map backend field names to form field names if needed
            const fieldMapping: Record<string, keyof IncidentFormValues> = {
              'Date': 'date',
              'Time': 'time',
              'IncidentType': 'incidentTypeId',
              'Office': 'officeId',
              'Description': 'description',
              'Notes': 'notes'
            };
            
            const formField = fieldMapping[field] || field as keyof IncidentFormValues;
            form.setError(formField, {
              type: 'manual',
              message: errors[0]
            });
            
            errorMessage = errors[0];
          }
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
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

  if (!incident || !originalIncident) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          <p>No se pudo encontrar el incidente o faltan datos necesarios</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
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
                {/* Cash breakdown section */}
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="text-sm font-medium">Desglose de Efectivo</h4>
                    <p className="text-xs text-muted-foreground">Especifica el fondo de caja y la recaudación</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cashFondo"
                      render={({ field }) => (
                        <FormItem>
                          <CurrencyInput
                            label="Fondo de caja"
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
                      name="cashRecaudacion"
                      render={({ field }) => (
                        <FormItem>
                          <CurrencyInput
                            label="Recaudación"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Efectivo:</span>
                      <span className="text-sm font-bold">
                        {new Intl.NumberFormat('es-PY').format(
                          (form.watch('cashFondo') || 0) + (form.watch('cashRecaudacion') || 0)
                        )} Gs.
                      </span>
                    </div>
                  </div>
                </div>

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

            {/* Attachments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <UploadCloud className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Archivos Adjuntos</h3>
                    <p className="text-sm text-muted-foreground">Documentos relacionados al incidente</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="space-y-4">
                  <FileUploader
                    onFileUpload={async (file) => {
                      try {
                        const url = await uploadFile(file);
                        const newAttachment = {
                          id: Date.now() + Math.random(),
                          url: url,
                          name: file.name,
                          contentType: file.type || 'application/octet-stream'
                        };
                        
                        const currentAttachments = form.getValues('attachments') || [];
                        form.setValue('attachments', [...currentAttachments, newAttachment]);
                        
                        toast({
                          title: 'Éxito',
                          description: `${file.name} se ha subido correctamente`,
                        });
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        toast({
                          title: 'Error',
                          description: `No se pudo subir ${file.name}`,
                          variant: 'destructive',
                        });
                      }
                    }}
                    isUploading={isFileUploading}
                    disabled={saving}
                    multiple={true}
                    maxFiles={10}
                    acceptedTypes="documents"
                    className="w-full"
                  />
                </div>

                {/* Existing Attachments */}
                {form.watch('attachments') && form.watch('attachments')!.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Archivos adjuntos:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {form.watch('attachments')!.map((attachment, index) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment.contentType}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                            className="text-destructive hover:text-destructive"
                            disabled={saving}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Imágenes del Incidente</h3>
                    <p className="text-sm text-muted-foreground">Fotografías del lugar y evidencias visuales</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="space-y-4">
                  <ImageUploader
                    onImageUpload={async (file) => {
                      try {
                        const url = await uploadImage(file);
                        const newImage = {
                          id: Date.now() + Math.random(),
                          url: url,
                          name: file.name,
                          contentType: file.type
                        };
                        
                        const currentImages = form.getValues('incidentImages') || [];
                        form.setValue('incidentImages', [...currentImages, newImage]);
                        
                        toast({
                          title: 'Éxito',
                          description: `Imagen ${file.name} se ha subido correctamente`,
                        });
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        toast({
                          title: 'Error',
                          description: `No se pudo subir la imagen ${file.name}`,
                          variant: 'destructive',
                        });
                      }
                    }}
                    isUploading={isImageUploading}
                    disabled={saving}
                    multiple={true}
                    maxFiles={10}
                    className="w-full min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex items-center justify-center"
                  />
                </div>

                {/* Existing Images */}
                {form.watch('incidentImages') && form.watch('incidentImages')!.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Imágenes del incidente:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {form.watch('incidentImages')!.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <img 
                              src={image.url} 
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={saving}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <Button type="submit" disabled={saving || loading || !incident}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
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
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIncident } from '@/context/incident-context';
import { getAllOfficesComplete } from '@/services/office-service';
import { IncidentFormValues, incidentSchema } from '@/validators/incident';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { ArrowLeft, Loader2, DollarSign, Paperclip, X, Check, ChevronsUpDown, UploadCloud, Info } from 'lucide-react';
import { SuspectSelector } from './incident-form/suspect-selector';
import { CurrencyInput } from './incident-form/currency-input';
import { useGuaraniFormatter } from '@/hooks/useGuaraniFormatter';
import { useQuery } from '@tanstack/react-query';

// Types for Section and IndexButton props
interface SectionProps {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

interface IndexButtonProps {
  id: string;
  icon: React.ElementType;
  label: string;
  activeSection: string;
  onClick: (id: string) => void;
}

// Section component
const Section = React.memo(({ id, icon: Icon, title, subtitle, children }: SectionProps) => (
  <section id={id} className="space-y-4 rounded-lg border bg-card p-6">
    <div className="flex items-center space-x-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
));

Section.displayName = 'Section';

// IndexButton component
const IndexButton = React.memo(({ id, icon: Icon, label, activeSection, onClick }: IndexButtonProps) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      'flex w-full items-center space-x-2 rounded-md p-3 text-left transition-colors',
      activeSection === id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
    )}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
));

IndexButton.displayName = 'IndexButton';

export function IncidentForm() {
  const router = useRouter();
  const { createIncident, incidentTypes } = useIncident();
  const [loading, setLoading] = useState(false);
  const [officePopoverOpen, setOfficePopoverOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { formatCurrency } = useGuaraniFormatter();

  // Fetch all offices using React Query like in the dashboard
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery({
    queryKey: ['all-offices-complete'],
    queryFn: getAllOfficesComplete,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const form = useForm<IncidentFormValues>({
    defaultValues: {
      officeId: undefined,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      incidentTypeId: undefined,
      description: '',
      cashLoss: 0,
      merchandiseLoss: 0,
      otherLosses: 0,
      totalLoss: 0,
      notes: '',
      selectedSuspects: [],
    },
    resolver: zodResolver(incidentSchema),
  });

  // Watch only the loss fields (not totalLoss to avoid infinite loop)
  const watchedLosses = form.watch(['cashLoss', 'merchandiseLoss', 'otherLosses']);
  
  // Auto-update total loss whenever any loss value changes
  useEffect(() => {
    const [cash, merchandise, other] = watchedLosses;
    const total = (cash || 0) + (merchandise || 0) + (other || 0);
    
    // Only update if the calculated total is different from current totalLoss
    const currentTotal = form.getValues('totalLoss');
    if (currentTotal !== total) {
      form.setValue('totalLoss', total, { shouldValidate: false });
    }
  }, [watchedLosses, form]);

  // Set default incident type when types are loaded
  useEffect(() => {
    if (incidentTypes.length > 0 && !form.getValues('incidentTypeId')) {
      form.setValue('incidentTypeId', incidentTypes[0].id);
    }
  }, [incidentTypes, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5 - attachments.length);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };


  const onSubmit = async (values: IncidentFormValues) => {
    // Calculate total loss directly from current values to ensure accuracy
    const cashLoss = values.cashLoss || 0;
    const merchandiseLoss = values.merchandiseLoss || 0;
    const otherLosses = values.otherLosses || 0;
    const calculatedTotal = cashLoss + merchandiseLoss + otherLosses;
    
    // Update form with calculated total
    form.setValue('totalLoss', calculatedTotal);
    

    
    const suspectIds = values.selectedSuspects
      ?.filter(suspect => {
        // Include suspects that have a valid apiId (either existing or newly created)
        return suspect.apiId && suspect.apiId.trim() !== '';
      })
      .map(suspect => suspect.apiId!) || [];
    
    // Validate that required fields are present
    if (!values.officeId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar una oficina',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const incidentData = {
        officeId: values.officeId,
        date: values.date,
        time: values.time,
        incidentTypeId: values.incidentTypeId,
        description: values.description?.trim(),
        cashLoss: cashLoss,
        merchandiseLoss: merchandiseLoss,
        otherLosses: otherLosses,
        totalLoss: calculatedTotal, // Use the directly calculated total
        notes: values.notes?.trim(),
        suspects: suspectIds, // Use the suspects field directly
      };



      await createIncident(incidentData);
      
      toast({ title: 'Incidente creado exitosamente' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el incidente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen p-4 md:p-6 gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Incidente</h1>
        </div>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              // Show first validation error
              const firstError = Object.values(errors)[0];
              if (firstError) {
                toast({
                  title: 'Error de validación',
                  description: firstError.message || 'Por favor complete todos los campos requeridos',
                  variant: 'destructive',
                });
              }
            })} 
            className="space-y-6"
          >
            {/* Details Section */}
            <Section
              id="details"
              icon={Info}
              title="Detalles del Incidente"
              subtitle="Información básica del incidente"
            >
              <FormField
                control={form.control}
                name="officeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Oficina <span className="text-destructive">*</span></FormLabel>
                    <Popover open={officePopoverOpen} onOpenChange={setOfficePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingOffices}
                          >
                            {isLoadingOffices ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cargando sucursales...
                              </>
                            ) : field.value ? (
                              offices.find((office) => office.id === field.value)?.Name
                            ) : (
                              "Seleccionar oficina"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar oficina..." />
                          <CommandList>
                            {offices.map((office) => (
                              <CommandItem
                                value={office.Name}
                                key={office.id}
                                onSelect={() => {
                                  form.setValue("officeId", office.id);
                                  setOfficePopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    office.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {office.Name}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha <span className="text-destructive">*</span></FormLabel>
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
                      <FormLabel>Hora <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="incidentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Incidente <span className="text-destructive">*</span></FormLabel>
                    {incidentTypes.length === 0 ? (
                      <div className="flex items-center justify-center p-4 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando tipos de incidentes...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {incidentTypes.map((type) => (
                          <Button
                            key={type.id}
                            type="button"
                            variant={field.value === type.id ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => field.onChange(type.id)}
                          >
                            {type.Name}
                          </Button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el incidente en detalle..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            {/* Losses Section */}
            <Section
              id="losses"
              icon={DollarSign}
              title="Pérdidas Económicas"
              subtitle="Especifique las pérdidas en guaraníes"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cashLoss"
                  render={({ field }) => (
                    <FormItem>
                      <CurrencyInput
                        label="Pérdida en Efectivo"
                        value={field.value || 0}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="0"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="merchandiseLoss"
                  render={({ field }) => (
                    <FormItem>
                      <CurrencyInput
                        label="Pérdida en Mercancía"
                        value={field.value || 0}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
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
                        label="Otras Pérdidas"
                        value={field.value || 0}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="0"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalLoss"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          Total de Pérdidas
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(field.value || 0)}
                          </span>
                        </FormLabel>
                        <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed">
                          <p className="text-sm text-muted-foreground">
                            Calculado automáticamente
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Suspects Section */}
            <section id="suspects" className="space-y-4 rounded-lg border bg-card p-6">
              <SuspectSelector control={form.control} />
            </section>

            {/* Attachments Section */}
            <Section
              id="attachments"
              icon={Paperclip}
              title="Archivos Adjuntos"
              subtitle="Adjunte fotos o documentos relacionados"
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agregue cualquier información adicional relevante..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <span>Subir archivos</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, PDF o DOCX (máx. 5 archivos)
                    </p>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Archivos seleccionados:</p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Incidente
              </Button>
            </div>
          </form>
        </Form>
      </div>

    </div>
  );
}
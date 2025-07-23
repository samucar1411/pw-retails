'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIncident } from '@/context/incident-context';
import { getAllOfficesComplete } from '@/services/office-service';
import { IncidentFormValues, incidentFormSchema } from '@/validators/incident';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, ChevronsUpDown, Check, Info, DollarSign, Users, UploadCloud, ChevronDown, ChevronUp, Package, Archive, PlusCircle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ImageUploader } from '@/components/ImageUploader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createSuspect } from '@/services/suspect-service';
import { toast } from 'sonner';
import { searchSuspects } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown as ChevronDownIcon, Trash } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useGuaraniFormatter } from '@/hooks/useGuaraniFormatter';
import { useImageUpload } from '@/hooks/useImageUpload';

// Stepper steps definition
const steps = [
  { id: 'details', label: 'Detalles', icon: Info },
  { id: 'losses', label: 'Pérdidas', icon: DollarSign },
  { id: 'suspects', label: 'Sospechosos', icon: Users },
  { id: 'attachments', label: 'Adjuntos', icon: UploadCloud },
];

// Custom square select group
type SquareSelectOption = { label: string; value: string };
interface SquareSelectGroupProps {
  options: SquareSelectOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}
function SquareSelectGroup({ options, value, onChange, className = '' }: SquareSelectGroupProps) {
  return (
    <div
      className={`flex flex-row gap-[10px] overflow-x-auto pb-2 mt-2 ${className}`}
    >
      {options.map((opt: SquareSelectOption, idx: number) => {
        const selected = String(value) === String(opt.value);
        return (
          <button
            key={`${opt.value}-${idx}`}
            type="button"
            onClick={() => onChange(String(opt.value))}
            className={
              'min-w-[100px] w-[100px] h-[100px] rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-colors outline-none ' +
              (selected
                ? 'bg-primary/40 border-2 border-primary text-primary-foreground'
                : 'bg-background border border-border text-foreground hover:border-primary hover:bg-muted/60')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CurrencyInputField({ value, onChange, onBlur }: { value: number; onChange: (v: number) => void; onBlur?: () => void }) {
  const { formatInputValue, parseNumber } = useGuaraniFormatter();
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // Solo inicializar el inputValue una vez cuando el componente se monta
  React.useEffect(() => {
    setInputValue(value > 0 ? formatInputValue(value) : '');
  }, []); // Solo se ejecuta una vez al montar

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Formatear el valor cuando pierde el foco
    setInputValue(value > 0 ? formatInputValue(value) : '');
    if (onBlur) onBlur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setInputValue(raw);
    onChange(parseNumber(raw));
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
        ₲
      </span>
      <input
        type="text"
        value={isFocused ? inputValue : (value > 0 ? formatInputValue(value) : '')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-full pl-8 px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </div>
  );
}

function LossItemCollapsible({ idx, remove, control, form }: {
  idx: number;
  remove: (idx: number) => void;
  control: Control<IncidentFormValues>;
  form: UseFormReturn<IncidentFormValues>;
}) {
  const { formatInputValue } = useGuaraniFormatter();
  const [open, setOpen] = React.useState(true);
  const [localTotal, setLocalTotal] = React.useState(() => {
    const q = Number(form.getValues(`incidentLossItem.${idx}.quantity`)) || 0;
    const p = Number(form.getValues(`incidentLossItem.${idx}.unitPrice`)) || 0;
    return q * p;
  });

  const handleBlur = () => {
    const q = Number(form.getValues(`incidentLossItem.${idx}.quantity`)) || 0;
    const p = Number(form.getValues(`incidentLossItem.${idx}.unitPrice`)) || 0;
    setLocalTotal(q * p);
  };

  return (
    <Collapsible.Root open={open}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Collapsible.Trigger asChild>
          <div
            className="w-full flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            role="button"
          >
            <span className="text-lg font-semibold">Item #{idx + 1}</span>
            <ChevronDownIcon className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Fila 1 */}
            <div>
              <label className="block text-sm mb-1">Descripción del item</label>
              <Controller
                control={control}
                name={`incidentLossItem.${idx}.description`}
                render={({ field }) => (
                  <Input {...field} placeholder="Insertar nombre del artículo" className="w-full" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Cantidad</label>
              <Controller
                control={control}
                name={`incidentLossItem.${idx}.quantity`}
                render={({ field }) => (
                  <Input type="number" {...field} className="w-full" placeholder="0" onBlur={() => { field.onBlur(); handleBlur(); }} />
                )}
              />
            </div>
            {/* Fila 2 */}
            <div>
              <label className="block text-sm mb-1">Precio unitario</label>
              <Controller
                control={control}
                name={`incidentLossItem.${idx}.unitPrice`}
                render={({ field }) => (
                  <CurrencyInputField value={Number(field.value) || 0} onChange={field.onChange} onBlur={handleBlur} />
                )}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Total</label>
              <Input value={formatInputValue(localTotal)} readOnly disabled className="w-full" placeholder="0" />
            </div>
          </div>
          <hr className="my-4 border-border" />
          <div className="flex">
            <button
              type="button"
              onClick={() => remove(idx)}
              className="bg-destructive text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Eliminar item
            </button>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}

// Utilidad para renderizar previsualización de archivos (solo para adjuntos del incidente)
function FilePreviewList({ files, onRemove }: { files: { url: string; name: string; contentType: string }[]; onRemove: (idx: number) => void }) {
  return (
    <div className="flex gap-4 mt-4">
      {files.map((file, idx) => {
        const isImage = file.contentType.startsWith('image/');
        const isPdf = file.contentType === 'application/pdf';
        const isDoc = file.contentType.includes('word') || file.contentType.includes('doc');
        return (
          <div key={file.url} className="relative flex flex-col items-center w-24">
            {isImage ? (
              <img src={file.url} alt={file.name} className="w-20 h-20 object-cover rounded border" />
            ) : isPdf ? (
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded border text-2xl">📄</div>
            ) : isDoc ? (
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded border text-2xl">📝</div>
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded border text-2xl">📎</div>
            )}
            <div className="text-xs mt-1 truncate w-full text-center">{file.name}</div>
            <button type="button" onClick={() => onRemove(idx)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-destructive/80">
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function IncidentForm() {
  const router = useRouter();
  const { incidentTypes } = useIncident();
  const [officePopoverOpen, setOfficePopoverOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  // Track which suspect card is open
  const [openSuspectIdx, setOpenSuspectIdx] = useState<number | null>(0);
  // Simple state for suspect tags
  const [suspectTags, setSuspectTags] = useState<Record<number, Record<string, unknown>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadImage, isUploading: isImageUploading } = useImageUpload();


  // Fetch all offices
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery({
    queryKey: ['all-offices-complete'],
    queryFn: getAllOfficesComplete,
    staleTime: 10 * 60 * 1000,
  });

  const form = useForm<IncidentFormValues>({
    defaultValues: {
      officeId: undefined,
      date: '',
      time: '',
      incidentTypeId: undefined,
      description: '',
      cashLoss: 0,
      suspects: [], // Initialize suspects array
      incidentLossItem: [], // Initialize incidentLossItem array
    },
    resolver: zodResolver(incidentFormSchema),
  });

  // Use selectedSuspects for the field array
  const {
    fields: suspectFields,
    append: appendSuspect,
    remove: removeSuspect,
  } = useFieldArray({
    control: form.control,
    name: 'selectedSuspects',
  });

  // 1. Importa IncidentLossItem y usa useFieldArray para incidentLossItem
  const {
    fields: lossFields,
    append: appendLoss,
    remove: removeLoss,
  } = useFieldArray({
    control: form.control,
    name: 'incidentLossItem',
  });


  // Set default incident type when types are loaded
  useEffect(() => {
    if (incidentTypes.length > 0 && !form.getValues('incidentTypeId')) {
      form.setValue('incidentTypeId', incidentTypes[0].id);
    }
  }, [incidentTypes, form]);

  // UI for the right sidebar stepper
  function Stepper() {
    const handleStepClick = async (stepIndex: number) => {
      // Solo permitir navegación a pasos anteriores o al paso actual
      if (stepIndex > activeStep) {
        // Validar campos del paso actual antes de avanzar
        let isValid = true;
        
        if (activeStep === 0) {
          const result = await form.trigger(['officeId', 'date', 'time', 'incidentTypeId', 'description']);
          isValid = result;
        } else if (activeStep === 1) {
          // Validar que cada sospechoso tenga la información requerida
          const selectedSuspects = form.getValues('selectedSuspects') || [];
          
          if (selectedSuspects.length === 0) {
            toast.error('Debe agregar al menos un sospechoso');
            return;
          }
          
          // Validar cada sospechoso individualmente
          for (let i = 0; i < selectedSuspects.length; i++) {
            const suspect = selectedSuspects[i];
            
            // Validar alias (requerido)
            if (!suspect.alias || suspect.alias.trim() === '') {
              toast.error(`El sospechoso #${i + 1} debe tener un alias`);
              return;
            }
            
            // Validar statusId (requerido)
            if (!suspect.statusId || suspect.statusId <= 0) {
              toast.error(`El sospechoso #${i + 1} debe tener un estado válido`);
              return;
            }
          }
          
          isValid = true;
        }
        
        if (!isValid) {
          toast.error('Por favor, complete todos los campos requeridos antes de continuar');
          return;
        }
      }
      
      setActiveStep(stepIndex);
    };

    return (
      <aside className="hidden lg:block w-64 ml-8">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer',
                idx === activeStep
                  ? 'bg-primary/10 text-primary font-semibold'
                  : idx < activeStep
                    ? 'hover:bg-accent/50 text-foreground'
                    : 'text-muted-foreground opacity-50'
              )}
              onClick={() => handleStepClick(idx)}
            >
              <step.icon className={cn('h-5 w-5', idx === activeStep ? 'text-primary' : 'text-muted-foreground')} />
              <span>{step.label}</span>
              {idx === activeStep && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // Example tag options (expand as needed)
  const genderOptions = [
    { label: 'Hombre', value: 'male' },
    { label: 'Mujer', value: 'female' },
    { label: 'Desconocido', value: 'unknown' },
  ];

  // Add more tag options
  const contexturaOptions = [
    { label: 'Flaco', value: 'flaco' },
    { label: 'Normal', value: 'normal' },
    { label: 'Musculoso', value: 'musculoso' },
    { label: 'Sobrepeso', value: 'sobrepeso' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const alturaOptions = [
    { label: 'Bajo (<1.60m)', value: 'bajo' },
    { label: 'Normal (1.60m-1.75m)', value: 'normal' },
    { label: 'Alto (1.76m-1.85m)', value: 'alto' },
    { label: 'Muy Alto (>1.85m)', value: 'muy_alto' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const pielOptions = [
    { label: 'Clara', value: 'clara' },
    { label: 'Trigueña', value: 'triguena' },
    { label: 'Oscura', value: 'oscura' },
    { label: 'Negra', value: 'negra' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const piercingsOptions = [
    { label: 'Nariz', value: 'nariz' },
    { label: 'Oreja', value: 'oreja' },
    { label: 'Cejas', value: 'cejas' },
    { label: 'Lengua', value: 'lengua' },
    { label: 'Labios', value: 'labios' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const tatuajesOptions = [
    { label: 'Brazos', value: 'brazos' },
    { label: 'Cara', value: 'cara' },
    { label: 'Cuello', value: 'cuello' },
    { label: 'Piernas', value: 'piernas' },
    { label: 'Mano', value: 'mano' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const accesoriosOptions = [
    { label: 'Lentes de sol', value: 'lentes_sol' },
    { label: 'Bolsa', value: 'bolsa' },
    { label: 'Lentes', value: 'lentes' },
    { label: 'Casco', value: 'casco' },
    { label: 'Mochila', value: 'mochila' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const comportamientoOptions = [
    { label: 'Nervioso', value: 'nervioso' },
    { label: 'Agresivo', value: 'agresivo' },
    { label: 'Portaba Armas', value: 'portaba_armas' },
    { label: 'Abuso Físico', value: 'abuso_fisico' },
    { label: 'Alcoholizado/Drogado', value: 'alcohol_droga' },
  ];
  const dificultanIdOptions = [
    { label: 'Mascarilla/barbijo', value: 'mascarilla' },
    { label: 'Casco', value: 'casco' },
    { label: 'Pasamontañas', value: 'pasamontanas' },
    { label: 'Capucha', value: 'capucha' },
    { label: 'Lentes Oscuros', value: 'lentes_oscuros' },
  ];

  // Simple functions to get/set tags
  function getTagValue(idx: number, key: string): string {
    return (suspectTags[idx]?.[key] as string) || '';
  }
  
  function setTagValue(idx: number, key: string, value: unknown) {
    setSuspectTags(prev => {
      const newTags = {
        ...prev,
        [idx]: {
          ...prev[idx],
          [key]: value
        }
      };
      console.log(`Sospechoso ${idx} - ${key}:`, value);
      console.log('JSON completo:', newTags[idx]);
      return newTags;
    });
  }
  
  function getTagArray(idx: number, key: string): string[] {
    return Array.isArray(suspectTags[idx]?.[key]) ? suspectTags[idx][key] : [];
  }

  // Function to generate Suspect object from form data






  // Render suspects step
  function SuspectsStep() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Suspect[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await searchSuspects(searchTerm);
          setSearchResults(res.results || []);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Sospechosos</h3>
            <p className="text-sm text-muted-foreground">Información sobre posibles sospechosos</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Command className="w-full max-w-md">
            <CommandInput
              placeholder="Buscar sospechosos en base de datos..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full"
            />
            <CommandList>
              {isSearching && (
                <div className="flex items-center justify-center p-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando...
                </div>
              )}
              {!isSearching && searchResults.length === 0 && searchTerm && (
                <div className="p-2 text-muted-foreground">No se encontraron sospechosos</div>
              )}
              {searchResults.map(suspect => (
                <CommandItem
                  key={suspect.id}
                  value={suspect.Alias}
                  onSelect={() => {
                    // No agregar si ya está en la lista
                    if (form.getValues('selectedSuspects')?.some((s: import('@/validators/incident').SelectedSuspectFormValues) => s.apiId === suspect.id)) {
                      toast('Este sospechoso ya está agregado');
                      return;
                    }
                    appendSuspect({
                      alias: suspect.Alias,
                      statusId: suspect.Status || 1,
                      image: suspect.PhotoUrl || '',
                      apiId: suspect.id,
                      isNew: false,
                      notes: suspect.PhysicalDescription || '',
                    });
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                >
                  <span>{suspect.Alias}</span>
                  {suspect.PhysicalDescription && (
                    <span className="ml-2 text-xs text-muted-foreground">{suspect.PhysicalDescription}</span>
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              appendSuspect({ alias: '', statusId: 1, image: null, isNew: true });
              const newIdx = suspectFields.length;
              setOpenSuspectIdx(newIdx);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Sospechoso
          </Button>
        </div>
        <div className="space-y-4">
          {suspectFields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-xl border border-muted bg-muted/30"
            >
              {/* Header clickable */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-8 py-6 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-t-xl transition-colors"
                onClick={() => setOpenSuspectIdx(openSuspectIdx === idx ? null : idx)}
                aria-expanded={openSuspectIdx === idx}
              >
                <span>Sospechoso #{idx + 1}</span>
                {openSuspectIdx === idx ? (
                  <ChevronUp className="h-6 w-6 text-primary" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              {/* Content */}
              {openSuspectIdx === idx && (
                <div className="p-8 pt-4 space-y-6 bg-card rounded-b-xl border-t border-muted">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`selectedSuspects.${idx}.alias`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo (Alias)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre o alias del sospechoso" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`selectedSuspects.${idx}.statusId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado del sospechoso</FormLabel>
                          <Select
                            value={String(field.value || 1)}
                            onValueChange={value => field.onChange(Number(value))}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Libre</SelectItem>
                              <SelectItem value="2">Detenido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Upload de foto estilo dropzone */}
                  <div>
                    <FormLabel>Fotos del sospechoso</FormLabel>
                    <ImageUploader
                      onImageUpload={async (file) => {
                        try {
                          // Subir imagen a Cloudinary
                          const cloudinaryUrl = await uploadImage(file);
                          
                          // Agregar a los adjuntos del formulario
                          const currentAttachments = form.getValues('attachments') || [];
                          const newAttachment = {
                            id: Date.now(),
                            name: file.name,
                            url: cloudinaryUrl,
                            contentType: file.type || 'image/jpeg'
                          };
                          form.setValue('attachments', [...currentAttachments, newAttachment]);
                          
                          toast.success('Imagen subida correctamente');
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          toast.error('Error al subir la imagen');
                        }
                      }}
                      onUploadComplete={async () => {
                        // Esta función se llama después de onImageUpload
                        // No necesitamos hacer nada adicional aquí
                      }}
                      maxSizeMB={5}
                      multiple={true}
                      maxFiles={5}
                      disabled={isSubmitting || isImageUploading}
                    />
                  </div>
                  {/* Gender */}
                  <div>
                    <FormLabel>Género</FormLabel>
                    <SquareSelectGroup
                      options={genderOptions}
                      value={getTagValue(idx, 'gender') || ''}
                      onChange={(value) => setTagValue(idx, 'gender', value)}
                    />
                  </div>
                  {/* Contextura */}
                  <div>
                    <FormLabel>Contextura</FormLabel>
                    <SquareSelectGroup
                      options={contexturaOptions}
                      value={getTagValue(idx, 'contextura') || ''}
                      onChange={(value) => setTagValue(idx, 'contextura', value)}
                    />
                  </div>
                  {/* Altura estimada */}
                  <div>
                    <FormLabel>Altura estimada</FormLabel>
                    <SquareSelectGroup
                      options={alturaOptions}
                      value={getTagValue(idx, 'altura') || ''}
                      onChange={(value) => setTagValue(idx, 'altura', value)}
                    />
                  </div>
                  {/* Tono de piel */}
                  <div>
                    <FormLabel>Tono de piel</FormLabel>
                    <SquareSelectGroup
                      options={pielOptions}
                      value={getTagValue(idx, 'piel') || ''}
                      onChange={(value) => setTagValue(idx, 'piel', value)}
                    />
                  </div>
                                    {/* Piercings */}
                  <div>
                    <FormLabel>Piercings</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {piercingsOptions.map(opt => {
                        const piercings = getTagArray(idx, 'piercings');
                        return (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`piercings-${idx}-${opt.value}`}
                              checked={piercings.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const newPiercings = checked
                                  ? [...piercings, opt.value]
                                  : piercings.filter((v: string) => v !== opt.value);
                                setTagValue(idx, 'piercings', newPiercings);
                              }}
                            />
                            <label htmlFor={`piercings-${idx}-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                                    {/* Tatuajes */}
                  <div>
                    <FormLabel>Tatuajes</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {tatuajesOptions.map(opt => {
                        const tatuajes = getTagArray(idx, 'tatuajes');
                        return (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tatuajes-${idx}-${opt.value}`}
                              checked={tatuajes.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const newTatuajes = checked
                                  ? [...tatuajes, opt.value]
                                  : tatuajes.filter((v: string) => v !== opt.value);
                                setTagValue(idx, 'tatuajes', newTatuajes);
                              }}
                            />
                            <label htmlFor={`tatuajes-${idx}-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                                    {/* Otros accesorios */}
                  <div>
                    <FormLabel>Otros accesorios</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {accesoriosOptions.map(opt => {
                        const accesorios = getTagArray(idx, 'accesorios');
                        return (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`accesorios-${idx}-${opt.value}`}
                              checked={accesorios.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const newAccesorios = checked
                                  ? [...accesorios, opt.value]
                                  : accesorios.filter((v: string) => v !== opt.value);
                                setTagValue(idx, 'accesorios', newAccesorios);
                              }}
                            />
                            <label htmlFor={`accesorios-${idx}-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Comportamiento */}
                  <div>
                    <FormLabel>Comportamiento</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {comportamientoOptions.map(opt => {
                        const comportamiento = getTagArray(idx, 'comportamiento');
                        return (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`comportamiento-${idx}-${opt.value}`}
                              checked={comportamiento.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const newComportamiento = checked
                                  ? [...comportamiento, opt.value]
                                  : comportamiento.filter((v: string) => v !== opt.value);
                                setTagValue(idx, 'comportamiento', newComportamiento);
                              }}
                            />
                            <label htmlFor={`comportamiento-${idx}-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Elementos que dificultan identificación */}
                  <div>
                    <FormLabel>Elementos que dificultan identificación</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {dificultanIdOptions.map(opt => {
                        const dificultanId = getTagArray(idx, 'dificultan_id');
                        return (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dificultan-${idx}-${opt.value}`}
                              checked={dificultanId.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const newDificultanId = checked
                                  ? [...dificultanId, opt.value]
                                  : dificultanId.filter((v: string) => v !== opt.value);
                                setTagValue(idx, 'dificultan_id', newDificultanId);
                              }}
                            />
                            <label htmlFor={`dificultan-${idx}-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Observaciones adicionales */}
                  <div>
                    <FormField
                      control={form.control}
                      name={`selectedSuspects.${idx}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones adicionales</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Observaciones relevantes sobre el sospechoso..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button type="button" variant="destructive" onClick={() => removeSuspect(idx)}>
                      Eliminar Sospechoso
                    </Button>
                  </div>
                  {/* Debug: Objeto Suspect completo */}
                  {/* <pre className="text-xs bg-black/50 text-green-400 p-2 rounded mt-2">
                    {JSON.stringify(generateSuspectObject(idx), null, 2)}
                  </pre> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Renderiza el bloque de pérdidas
  function LossesStep() {
    const { formatInputValue } = useGuaraniFormatter();
    const cashLoss = Number(form.watch('cashLoss') || 0);
    
    interface LossItem {
      id: string;
      type: 'mercaderia' | 'material';
      description: string;
      quantity: number | string;
      unitPrice: number | string;
      total: number;
    }

    const allItems = (form.getValues('incidentLossItem') || []).map(item => ({
      ...item,
      id: item.id ? String(item.id) : '',
    })) as LossItem[];

    const merchandiseItems = allItems.filter(i => i.type === 'mercaderia');
    const damageItems      = allItems.filter(i => i.type === 'material');

    const merchandiseLoss = merchandiseItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + q * p;
    }, 0);
    const otherLosses = damageItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + q * p;
    }, 0);
    const totalLoss = cashLoss + merchandiseLoss + otherLosses;

    // Elimina los estados openMerchIdx, setOpenMerchIdx, openDamageIdx, setOpenDamageIdx

    return (
      <div className="space-y-6 mt-6 pb-32">
        {/* 1. Robo en Efectivo */}
        <section className="rounded-xl border bg-card p-4 md:p-6 mb-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="ml-2">
              <h3 className="text-base md:text-lg font-medium">Robo en Efectivo</h3>
              <p className="text-sm text-muted-foreground">
                Indique los valores estimados de las pérdidas
              </p>
            </div>
          </div>
          <FormItem>
            <FormLabel>Pérdida en efectivo</FormLabel>
            <Controller
              control={form.control}
              name="cashLoss"
              render={({ field }) => (
                <CurrencyInputField 
                  value={Number(field.value) || 0} 
                  onChange={field.onChange} 
                  onBlur={field.onBlur} 
                />
              )}
            />
            <FormMessage />
          </FormItem>
        </section>

        {/* 2. Robo de mercaderías */}
        <section className="rounded-xl border bg-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2 md:gap-0">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base md:text-lg font-medium">Robo de mercaderías</h3>
                <p className="text-sm text-muted-foreground">
                  Indique los valores estimados de las pérdidas
                </p>
              </div>
            </div>
            <Button className="w-full md:w-auto" onClick={() => appendLoss({ description: '', quantity: 1, unitPrice: 0, type: 'mercaderia', total: 0 })}>
              <PlusCircle className="h-5 w-5 mr-2" /> Registrar Item
            </Button>
          </div>
          <div className="space-y-4">
            {lossFields.map((field, idx) =>
              form.getValues(`incidentLossItem.${idx}.type`) === 'mercaderia' ? (
                <LossItemCollapsible key={field.id} idx={idx} remove={removeLoss} control={form.control} form={form} />
              ) : null
            )}
          </div>
        </section>

        {/* 3. Daños materiales */}
        <section className="rounded-xl border bg-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2 md:gap-0">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base md:text-lg font-medium">Daños materiales</h3>
                <p className="text-sm text-muted-foreground">
                  Indique los valores estimados de las pérdidas
                </p>
              </div>
            </div>
            <Button className="w-full md:w-auto" onClick={() => appendLoss({ description: '', quantity: 1, unitPrice: 0, type: 'material', total: 0 })}>
              <PlusCircle className="h-5 w-5 mr-2" /> Registrar Daño
            </Button>
          </div>
          <div className="space-y-4">
            {lossFields.map((field, idx) =>
              form.getValues(`incidentLossItem.${idx}.type`) === 'material' ? (
                <LossItemCollapsible key={field.id} idx={idx} remove={removeLoss} control={form.control} form={form} />
              ) : null
            )}
          </div>
        </section>

        {/* 4. Total de pérdidas */}
        <section className="rounded-xl border border-destructive bg-destructive/10 p-4 md:p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-destructive" />
            <h3 className="ml-2 text-base md:text-lg font-medium text-destructive">
              Total de pérdidas
            </h3>
          </div>
          <Input readOnly disabled value={formatInputValue(totalLoss)} className="w-full" />
        </section>
        {/* Sticky navigation buttons */}
      </div>
    );
  }

  async function onSubmit(data: IncidentFormValues) {
    console.log('onSubmit called with data:', data);
    
    // Validar todo el formulario antes de enviar
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Form validation failed');
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Crear sospechosos y obtener sus IDs
      const suspectIds: string[] = [];
      for (let idx = 0; idx < (data.selectedSuspects ?? []).length; idx++) {
        const physicalDescription = getTagValue(idx, 'notes');
        const photoUrl = (data.selectedSuspects ?? [])[idx].image;
        const tags = suspectTags[idx];
        
        const suspectObj: Partial<Suspect> = {
          Alias: (data.selectedSuspects ?? [])[idx].alias,
          Status: (data.selectedSuspects ?? [])[idx].statusId,
          // Valores por defecto requeridos por el backend
          PhysicalDescription: physicalDescription && physicalDescription.trim() ? physicalDescription : 'Sin descripción física',
          PhotoUrl: photoUrl && photoUrl.trim() ? photoUrl : 'https://res.cloudinary.com/dfwqg73mf/image/upload/fl_preserve_transparency/v1747695722/image_lfizgf.jpg?_s=public-apps',
        };
        
        // Solo agregar tags si tienen valor
        if (tags && Object.keys(tags).length > 0) {
          // Convertir el objeto de tags a un array de valores
          const tagValues = Object.values(tags)
            .filter(value => value && String(value).trim() !== '')
            .map(value => String(value).replace(/_/g, ' '));
          
          suspectObj.Tags = tagValues;
        }
        console.log('Creating suspect with data:', suspectObj);
        try {
          const created = await createSuspect(suspectObj);
          if (!created?.id) {
            toast.error(`Error al crear el sospechoso: ${suspectObj.Alias || 'Sin nombre'}`);
            setIsSubmitting(false);
            return;
          }
          suspectIds.push(created.id);
        } catch (error) {
          console.error('Error creating suspect:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          toast.error(`Error al crear el sospechoso: ${suspectObj.Alias || 'Sin nombre'} - ${errorMessage}`);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Procesar los items de pérdida
      const lossItems = (data.incidentLossItem || []).map(item => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const total = quantity * unitPrice;

        return {
          ItemType: item.type === 'mercaderia' ? 'merchandise' : 'damage',
          Description: item.description,
          Quantity: quantity,
          UnitPrice: unitPrice,
          TotalValue: total,
          Incident: null // Se asignará cuando se cree el incidente
        };
      });

      // 3. Calcular totales
      const merchandiseLoss = lossItems
        .filter(item => item.ItemType === 'merchandise')
        .reduce((sum, item) => sum + (item.TotalValue || 0), 0);

      const otherLosses = lossItems
        .filter(item => item.ItemType === 'damage')
        .reduce((sum, item) => sum + (item.TotalValue || 0), 0);

      const cashLoss = Number(data.cashLoss) || 0;
      const totalLoss = cashLoss + merchandiseLoss + otherLosses;

      // 4. Construir el payload del incidente
      const incidentPayload = {
        TransDate: new Date().toISOString(),
        Date: data.date,
        Time: data.time,
        Description: data.description,
        CashLoss: cashLoss,
        MerchandiseLoss: merchandiseLoss,
        OtherLosses: otherLosses,
        TotalLoss: totalLoss,
        Notes: data.notes,
        Attachments: data.attachments,
        Report: null,
        Office: data.officeId,
        IncidentType: data.incidentTypeId,
        Suspects: suspectIds,
        IncidentItemLosses: lossItems
      };

      // 5. Enviar el incidente usando el servicio de API configurado
      const { api } = await import('@/services/api');
      
      // Debug: verificar token
      const token = localStorage.getItem('auth_token');
      console.log('Token disponible:', !!token);
      console.log('Payload del incidente:', incidentPayload);
      
      try {
        const response = await api.post('/api/incidents/', incidentPayload);
        
        if (response.status === 201 || response.status === 200) {
          toast.success('Incidente registrado correctamente');
          router.push('/dashboard/incidentes');
        } else {
          toast.error('Error al registrar el incidente');
        }
      } catch (error: unknown) {
        console.error('Error creating incident:', error);
        
        // Type guard para el error
        const isApiError = (err: unknown): err is { status?: number; data?: { detail?: string }; message?: string } => {
          return typeof err === 'object' && err !== null;
        };
        
        if (isApiError(error)) {
          console.error('Error details:', {
            status: error.status,
            data: error.data,
            message: error.message
          });
          
          let errorMsg = 'Error al registrar el incidente';
          if (error.data?.detail) {
            errorMsg = error.data.detail;
          } else if (error.message) {
            errorMsg = error.message;
          }
          toast.error(errorMsg);
        } else {
          toast.error('Error inesperado al registrar el incidente');
        }
      }
    } catch {
      toast.error('Error inesperado al registrar el incidente');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Only render the first step for now
  return (
    <div className="flex min-h-screen p-4 md:p-6 gap-6">
      <div className="flex-1">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Registrar incidente</h1>
            <p className="text-sm text-muted-foreground">Monitorear actividad principal</p>
          </div>
        </div>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
            id="incident-form"
          >
            {activeStep === 0 && (
              <section className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Detalles del incidente</h3>
                    <p className="text-sm text-muted-foreground">Datos principales del incidente</p>
                  </div>
                </div>
                <div className="space-y-4">
              <FormField
                control={form.control}
                name="officeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                        <FormLabel>Seleccionar sucursal</FormLabel>
                    <Popover open={officePopoverOpen} onOpenChange={setOfficePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
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
                                  'Seleccionar sucursal'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                              <CommandInput placeholder="Buscar sucursal..." />
                          <CommandList>
                            {offices.map((office) => (
                              <CommandItem
                                value={office.Name}
                                key={office.id}
                                onSelect={() => {
                                      form.setValue('officeId', office.id);
                                  setOfficePopoverOpen(false);
                                }}
                                className="hover:bg-secondary"
                              >
                                <Check
                                  className={cn(
                                        'mr-2 h-4 w-4',
                                    office.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{office.Name}</span>
                                  {office.Address && (
                                    <span className="text-xs text-muted-foreground">{office.Address}</span>
                                  )}
                                </div>
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
                          <FormLabel>Fecha</FormLabel>
                      <FormControl>
                            <Input type="date" placeholder="dd-mm-aaaa" {...field} />
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
                          <FormLabel>Hora</FormLabel>
                      <FormControl>
                            <Input type="time" placeholder="--:-- --" {...field} />
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
                        <FormLabel>Tipo de incidente</FormLabel>
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
                                variant={field.value === type.id ? 'default' : 'outline'}
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
                        <FormLabel>Descripción del hecho</FormLabel>
                    <FormControl>
                      <Textarea
                            placeholder="Describa brevemente lo ocurrido..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </section>
            )}
            {activeStep === 1 && <LossesStep />}
            {activeStep === 2 && <SuspectsStep />}
            {activeStep === 3 && (
              <section className="space-y-6 mt-6 pb-32">
                <div className="rounded-xl border bg-card p-4 md:p-6">
                  <div className="flex items-center mb-4">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <div className="ml-2">
                      <h3 className="text-lg font-semibold">Adjuntos</h3>
                      <p className="text-sm text-muted-foreground">Indique los valores estimados de las pérdidas</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <FormLabel>Imágenes del hecho</FormLabel>
                    <ImageUploader
                      onImageUpload={async (file) => {
                        try {
                          // Subir imagen a Cloudinary
                          const cloudinaryUrl = await uploadImage(file);
                          
                          // Agregar a los adjuntos del formulario
                          const currentAttachments = form.getValues('attachments') || [];
                          const newAttachment = {
                            id: Date.now(),
                            name: file.name,
                            url: cloudinaryUrl,
                            contentType: file.type || 'image/jpeg'
                          };
                          form.setValue('attachments', [...currentAttachments, newAttachment]);
                          
                          toast.success('Imagen subida correctamente');
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          toast.error('Error al subir la imagen');
                        }
                      }}
                      onUploadComplete={async () => {
                        // Esta función se llama después de onImageUpload
                        // No necesitamos hacer nada adicional aquí
                      }}
                      maxSizeMB={5}
                      multiple={true}
                      maxFiles={5}
                      disabled={isSubmitting || isImageUploading}
                    />
                    <FilePreviewList
                      files={form.watch('attachments') || []}
                      onRemove={removeIdx => {
                        type AttachmentType = { id: number; url: string; name: string; contentType: string };
                        const prev = (form.getValues('attachments') || []).filter((a: unknown): a is AttachmentType => typeof a === 'object' && a !== null && 'url' in a);
                        form.setValue('attachments', prev.filter((_: AttachmentType, i: number) => i !== removeIdx));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <FormLabel className="font-semibold">Notas Adicionales</FormLabel>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Agregue cualquier información adicional relevante"
                            className="min-h-[80px] mt-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            )}
          </form>
        </Form>
      </div>
      <Stepper />
      {/* Footer fijo global para los botones de navegación */}
      <div className="fixed bottom-0 right-0 py-4 px-6 bg-background/80 backdrop-blur-sm border-t z-40 ml-[calc(var(--sidebar-width))] w-[calc(100%-var(--sidebar-width))] data-[state=collapsed]:ml-[calc(var(--sidebar-width-icon))] data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]">
        <div className="w-full max-w-3xl mx-auto flex justify-end gap-4">
          {activeStep > 0 && (
            <Button 
              variant="outline" 
              onClick={async () => {
                // Validar solo los campos del paso actual antes de retroceder
                let isValid = true;
                
                if (activeStep === 0) {
                  // Validar campos del primer paso
                  const result = await form.trigger(['officeId', 'date', 'time', 'incidentTypeId', 'description']);
                  isValid = result;
                }
                
                if (isValid) {
                  setActiveStep(activeStep - 1);
                } else {
                  toast.error('Por favor, complete todos los campos requeridos antes de continuar');
                }
              }}
            >
              Anterior
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button 
              onClick={async () => {
                // Validar solo los campos del paso actual
                let isValid = true;
                
                if (activeStep === 0) {
                  // Validar campos del primer paso
                  const result = await form.trigger(['officeId', 'date', 'time', 'incidentTypeId', 'description']);
                  isValid = result;
                }
                
                if (isValid) {
                  setActiveStep(activeStep + 1);
                } else {
                  toast.error('Por favor, complete todos los campos requeridos antes de continuar');
                }
              }}
            >
              Siguiente
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button 
              type="button" 
              disabled={isSubmitting}
              onClick={async () => {
                console.log('Submit button clicked');
                const formData = form.getValues();
                console.log('Form data:', formData);
                await onSubmit(formData);
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar incidente'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
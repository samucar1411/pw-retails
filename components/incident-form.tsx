'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, ChevronsUpDown, Check, Info, DollarSign, Users, UploadCloud, ChevronDown, ChevronUp, Package, Archive, PlusCircle, Plus, User, Search } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ImageUploader } from '@/components/ImageUploader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createSuspect } from '@/services/suspect-service';
import { useAllSuspects } from '@/hooks/useAllSuspects';
import { toast } from 'sonner';
import { Suspect } from '@/types/suspect';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown as ChevronDownIcon, Trash } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useGuaraniFormatter } from '@/hooks/useGuaraniFormatter';
import { useImageUpload } from '@/hooks/useImageUpload';
import { createIncidentImageMetadata, IncidentImageMetadataCreateInput, IncidentImageMetadata } from '@/services/incident-image-metadata-service';
// import { SuspectSelector } from '@/components/incident-form/suspect-selector';

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

  // Initialize inputValue when component mounts or value changes externally
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value > 0 ? value.toString() : '');
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Set raw number value for editing
    const rawValue = value > 0 ? value.toString() : '';
    setInputValue(rawValue);
    // Set cursor to end
    setTimeout(() => {
      e.target.setSelectionRange(rawValue.length, rawValue.length);
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setInputValue(raw);
    const numValue = parseNumber(raw);
    onChange(numValue);
  };

  // Use consistent display value logic
  const displayValue = React.useMemo(() => {
    if (isFocused) {
      return inputValue;
    }
    return value > 0 ? formatInputValue(value) : '';
  }, [isFocused, inputValue, value, formatInputValue]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
        ₲
      </span>
      <input
        type="text"
        value={displayValue}
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
              <Image src={file.url} alt={file.name} width={80} height={80} className="w-20 h-20 object-cover rounded border" />
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

// Component for handling incident image metadata (separate from regular attachments)
function IncidentImageMetadataUploader({ 
  images, 
  onAddImage, 
  onRemoveImage, 
  onUpdateDescription,
  onUploadImage,
  isSubmitting 
}: {
  images: { id: string; file: File; description: string; isUploading: boolean; uploadedData?: IncidentImageMetadata }[];
  onAddImage: (file: File) => void;
  onRemoveImage: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUploadImage: (imageId: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          onAddImage(file);
        } else {
          toast.error('Solo se permiten archivos de imagen');
        }
      });
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Análisis de Imágenes del Incidente</h4>
          <p className="text-xs text-muted-foreground">
            Estas imágenes serán procesadas para análisis de similitud y detección automática
          </p>
        </div>
        <div className="relative">
          <input
            type="file"
            id="incident-metadata-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={isSubmitting}
          />
          <label
            htmlFor="incident-metadata-upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Agregar Imágenes para Análisis
          </label>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image) => (
            <div key={image.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
              {/* Image Preview */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={URL.createObjectURL(image.file)}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Info and Description */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate">{image.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!image.uploadedData && !image.isUploading && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUploadImage(image.id)}
                        disabled={isSubmitting}
                        className="text-xs"
                      >
                        <UploadCloud className="h-3 w-3 mr-1" />
                        Procesar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveImage(image.id)}
                      disabled={isSubmitting || image.isUploading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Descripción de la imagen
                  </label>
                  <Textarea
                    placeholder="Describa qué se puede ver en esta imagen..."
                    value={image.description}
                    onChange={(e) => onUpdateDescription(image.id, e.target.value)}
                    disabled={isSubmitting || image.isUploading}
                    className="text-sm min-h-[60px] resize-none"
                  />
                </div>
                
                {image.isUploading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Procesando imagen...
                  </div>
                )}
                
                {image.uploadedData && typeof image.uploadedData === 'object' && image.uploadedData !== null && (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        image.uploadedData?.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {image.uploadedData?.status}
                      </span>
                    </div>
                    {image.uploadedData?.similarity_percentage !== null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Similitud:</span>
                        <span className="text-muted-foreground">
                          {image.uploadedData?.similarity_percentage}%
                        </span>
                      </div>
                    )}
                    {image.uploadedData?.is_match && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-orange-600">⚠️ Coincidencia detectada</span>
                      </div>
                    )}
                    {image.uploadedData?.is_blacklisted && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600">🚫 En lista negra</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground mb-2">
            No hay imágenes para análisis
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Las imágenes agregadas aquí serán procesadas automáticamente para detectar similitudes
          </p>
          <label
            htmlFor="incident-metadata-upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Agregar Primera Imagen
          </label>
        </div>
      )}
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
  
  // State for incident image metadata (separate from attachments)
  const [incidentImageMetadata, setIncidentImageMetadata] = useState<{
    id: string;
    file: File;
    description: string;
    isUploading: boolean;
    uploadedData?: IncidentImageMetadata;
  }[]>([]);


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
      cashFondo: 0,
      cashRecaudacion: 0,
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
    { label: 'Hombre', value: 'masculino' },
    { label: 'Mujer', value: 'femenino' },
    { label: 'Desconocido', value: 'desconocido' },
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
    { label: 'Muy Alto (>1.85m)', value: 'muy alto' },
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
    { label: 'Lentes de sol', value: 'lentes sol' },
    { label: 'Bolsa', value: 'bolsa' },
    { label: 'Lentes', value: 'lentes' },
    { label: 'Casco', value: 'casco' },
    { label: 'Mochila', value: 'mochila' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const comportamientoOptions = [
    { label: 'Nervioso', value: 'nervioso' },
    { label: 'Agresivo', value: 'agresivo' },
    { label: 'Portaba Armas', value: 'portaba armas' },
    { label: 'Abuso Físico', value: 'abuso fisico' },
    { label: 'Alcoholizado/Drogado', value: 'alcohol droga' },
    { label: 'Amenazante', value: 'amenazante' },
    { label: 'Calmado', value: 'calmado' },
    { label: 'Huyó', value: 'huyo' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  
  const transporteOptions = [
    { label: 'Auto', value: 'auto' },
    { label: 'Camioneta', value: 'camioneta' },
    { label: 'Motocicleta', value: 'motocicleta' },
    { label: 'Bicicleta', value: 'bicicleta' },
    { label: 'A pie', value: 'a_pie' },
    { label: 'Desconocido', value: 'desconocido' },
  ];
  const dificultanIdOptions = [
    { label: 'Mascarilla/barbijo', value: 'mascarilla' },
    { label: 'Casco', value: 'casco' },
    { label: 'Pasamontañas', value: 'pasamontanas' },
    { label: 'Capucha', value: 'capucha' },
    { label: 'Lentes Oscuros', value: 'lentes oscuros' },
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


  // Handlers for incident image metadata
  const handleAddIncidentImage = (file: File) => {
    const newImage = {
      id: Date.now().toString(),
      file,
      description: '',
      isUploading: false,
      uploadedData: undefined,
    };
    setIncidentImageMetadata(prev => [...prev, newImage]);
  };

  const handleRemoveIncidentImage = (id: string) => {
    setIncidentImageMetadata(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdateIncidentImageDescription = (id: string, description: string) => {
    setIncidentImageMetadata(prev => 
      prev.map(img => img.id === id ? { ...img, description } : img)
    );
  };

  const handleUploadIncidentImageMetadata = async (imageId: string) => {
    const image = incidentImageMetadata.find(img => img.id === imageId);
    if (!image) return;

    // Update uploading state
    setIncidentImageMetadata(prev => 
      prev.map(img => img.id === imageId ? { ...img, isUploading: true } : img)
    );

    try {
      // Get current user ID from localStorage or context
      const userToken = localStorage.getItem('auth_token');
      const userId = userToken ? 'current_user' : 'anonymous'; // You might want to decode this properly

      const uploadData: IncidentImageMetadataCreateInput = {
        filename: image.file.name,
        user_id: userId,
        description: image.description || `Imagen del incidente - ${image.file.name}`,
        img_file: image.file,
        Tags: null, // Can be extended later
      };

      const result = await createIncidentImageMetadata(uploadData);
      
      // Update with uploaded data
      setIncidentImageMetadata(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, isUploading: false, uploadedData: result }
            : img
        )
      );

      toast.success('Imagen procesada correctamente');
    } catch (error) {
      console.error('Error uploading incident image metadata:', error);
      toast.error('Error al procesar la imagen');
      
      // Reset uploading state on error
      setIncidentImageMetadata(prev => 
        prev.map(img => img.id === imageId ? { ...img, isUploading: false } : img)
      );
    }
  };

  // Function to generate Suspect object from form data







  // Render suspects step with tags-based search - exact same logic as suspects page
  function SuspectsStep() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{tags?: string}>({});
    const [suspectPopoverOpen, setSuspectPopoverOpen] = useState(false);
    
    // Use the same hook as the suspects page
    const {
      data,
      isLoading: isSearching
    } = useAllSuspects({
      page: 1,
      pageSize: 25,
      filters: {
        ...filters,
        tags: searchTerm || undefined,
        search: undefined // Ensure search parameter is not used
      }
    });

    const searchResults = data?.suspects || [];

    const handleSearchChange = (value: string) => {
      setSearchTerm(value);
      
      // Update filters to use tags parameter instead of search - same as suspects page
      const updatedFilters = { 
        ...filters, 
        tags: value || undefined,
        search: undefined // Remove search parameter
      };
      setFilters(updatedFilters);
    };

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
          <div className="flex-1 max-w-md">
            <Popover open={suspectPopoverOpen} onOpenChange={setSuspectPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-muted-foreground"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando sospechosos...
                    </>
                  ) : (
                    'Buscar y agregar sospechoso existente'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar por alias, descripción física, tags o características..."
                    value={searchTerm}
                    onValueChange={handleSearchChange}
                  />
                  <CommandList className="max-h-80">
                    {isSearching && (
                      <div className="flex items-center justify-center p-4 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando...
                      </div>
                    )}
                    {!isSearching && searchResults.length === 0 && searchTerm && (
                      <div className="flex flex-col items-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground mb-2">No se encontraron sospechosos</p>
                        <p className="text-sm text-muted-foreground mb-3 max-w-sm">
                          Intente buscar por alias, descripción física, tags o características específicas
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Ejemplo: &ldquo;Juan&rdquo; - buscar por alias</p>
                          <p>• Ejemplo: &ldquo;alto musculoso&rdquo; - descripción física</p>
                          <p>• Ejemplo: &ldquo;tatuaje brazos&rdquo; - características específicas</p>
                          <p>• Ejemplo: &ldquo;nervioso agresivo&rdquo; - comportamiento</p>
                        </div>
                      </div>
                    )}
                    {!searchTerm && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Comience a escribir para buscar sospechosos existentes...
                      </div>
                    )}
                    {searchResults.length > 0 && searchTerm && (
                      <div className="px-3 py-2 text-xs text-muted-foreground bg-blue-50 border-b">
                        🔍 Búsqueda avanzada por alias, descripción física, tags y características
                      </div>
                    )}
                    {searchResults.map(suspect => (
                      <CommandItem
                        key={suspect.id}
                        value={suspect.Alias}
                        onSelect={() => {
                          // No agregar si ya está en la lista
                          if (form.getValues('selectedSuspects')?.some((s: import('@/validators/incident').SelectedSuspectFormValues) => s.apiId === suspect.id)) {
                            toast.error('Este sospechoso ya está agregado');
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
                          setFilters({});
                          setSuspectPopoverOpen(false);
                        }}
                        className="cursor-pointer p-0"
                      >
                        <div className="flex items-center gap-3 w-full p-3 hover:bg-accent/50 rounded-md">
                          {/* Foto del sospechoso */}
                          <div className="flex-shrink-0">
                            {suspect.PhotoUrl ? (
                        <Image
                          src={suspect.PhotoUrl}
                          alt={suspect.Alias}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border-2 border-border">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Información del sospechoso */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {suspect.Alias}
                        </p>
                        {suspect.IncidentsCount && suspect.IncidentsCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {suspect.IncidentsCount} incidente{suspect.IncidentsCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Descripción física */}
                      {suspect.PhysicalDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {suspect.PhysicalDescription}
                        </p>
                      )}
                      
                      {/* Última vez visto */}
                      {suspect.LastSeen && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Última vez visto: {new Date(suspect.LastSeen).toLocaleDateString('es-ES')}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {suspect.Tags && Array.isArray(suspect.Tags) && suspect.Tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(suspect.Tags) && suspect.Tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {Array.isArray(suspect.Tags) && suspect.Tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{suspect.Tags.length - 3} características más
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botón de agregar */}
                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </Button>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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
                  {/* Check if this is a pre-created suspect */}
                  {!field.isNew && field.apiId ? (
                    /* Pre-created suspect - Read-only display */
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-info/10 border border-info/20 rounded-lg">
                        {/* Suspect Photo */}
                        <div className="flex-shrink-0">
                          {field.image ? (
                            <Image
                              src={field.image}
                              alt={field.alias}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-full object-cover border-2 border-info/30"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-info/20 border-2 border-info/30">
                              <User className="h-8 w-8 text-info" />
                            </div>
                          )}
                        </div>
                        
                        {/* Suspect Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-foreground">{field.alias}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Sospechoso existente
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Estado:</span> {
                              field.statusId === 1 ? 'Detenido' : 
                              field.statusId === 2 ? 'Libre' : 
                              field.statusId === 3 ? 'Preso' : 
                              'Desconocido'
                            }</p>
                            {field.notes && (
                              <p><span className="font-medium">Descripción:</span> {field.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <div className="flex-shrink-0">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSuspect(idx)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        Este sospechoso ya existe en el sistema y no puede ser editado.
                      </div>
                    </div>
                  ) : (
                    /* New suspect - Editable form */
                    <>
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
                                  <SelectItem value="1">Detenido</SelectItem>
                                  <SelectItem value="2">Libre</SelectItem>
                                  <SelectItem value="3">Preso</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                  </div>
                  {/* Foto de perfil del sospechoso */}
                  <FormField
                    control={form.control}
                    name={`selectedSuspects.${idx}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto del sospechoso</FormLabel>
                        <div className="space-y-4">
                          {/* Current photo preview */}
                          {field.value && (
                            <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={field.value}
                                  alt="Foto del sospechoso"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Foto cargada</p>
                                <p className="text-xs text-muted-foreground">Foto de perfil del sospechoso</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange(null)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Upload area */}
                          <ImageUploader
                            onImageUpload={async (file) => {
                              try {
                                // Subir imagen a Cloudinary
                                const cloudinaryUrl = await uploadImage(file);
                                
                                // Establecer la URL como foto del sospechoso
                                field.onChange(cloudinaryUrl);
                                
                                toast.success('Foto del sospechoso subida correctamente');
                              } catch (error) {
                                console.error('Error uploading suspect photo:', error);
                                toast.error('Error al subir la foto del sospechoso');
                              }
                            }}
                            onUploadComplete={async () => {
                              // Esta función se llama después de onImageUpload
                              // No necesitamos hacer nada adicional aquí
                            }}
                            maxSizeMB={5}
                            multiple={false}
                            maxFiles={1}
                            disabled={isSubmitting || isImageUploading}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Sexo */}
                  <div>
                    <FormLabel>Sexo</FormLabel>
                    <SquareSelectGroup
                      options={genderOptions}
                      value={getTagValue(idx, 'sexo') || ''}
                      onChange={(value) => setTagValue(idx, 'sexo', value)}
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
                  {/* Transporte Utilizado */}
                  <div>
                    <FormLabel>Transporte Utilizado</FormLabel>
                    <SquareSelectGroup
                      options={transporteOptions}
                      value={getTagValue(idx, 'transporte') || ''}
                      onChange={(value) => {
                        setTagValue(idx, 'transporte', value);
                        // Clear license plate if transport doesn't require it
                        if (value !== 'auto' && value !== 'camioneta' && value !== 'motocicleta') {
                          setTagValue(idx, 'placa', '');
                        }
                      }}
                    />
                  </div>
                  {/* Placa del Vehículo - Conditional field */}
                  {(getTagValue(idx, 'transporte') === 'auto' || 
                    getTagValue(idx, 'transporte') === 'camioneta' || 
                    getTagValue(idx, 'transporte') === 'motocicleta') && (
                    <div>
                      <FormLabel>Placa del Vehículo</FormLabel>
                      <Input
                        placeholder="Ingrese la placa del vehículo (opcional)"
                        value={getTagValue(idx, 'placa') || ''}
                        onChange={(e) => setTagValue(idx, 'placa', e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Campo opcional para identificación del vehículo
                      </p>
                    </div>
                  )}
                  {/* Elementos que dificultan identificación */}
                  <div>
                    <FormLabel>Elementos que dificultan identificación</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
                      {dificultanIdOptions.map(opt => {
                                            const dificultanId = getTagArray(idx, 'dificulta_identificacion');
                    return (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dificultan-${idx}-${opt.value}`}
                          checked={dificultanId.includes(opt.value)}
                          onCheckedChange={(checked) => {
                            const newDificultanId = checked
                              ? [...dificultanId, opt.value]
                              : dificultanId.filter((v: string) => v !== opt.value);
                            setTagValue(idx, 'dificulta_identificacion', newDificultanId);
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
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Renderiza el bloque de pérdidas
  const LossesStep = useMemo(() => {
    return function LossesStepComponent() {
      const { formatInputValue } = useGuaraniFormatter();
      // El cashLoss total es la suma de efectivo fondo + efectivo recaudación
      const cashFondo = form.watch('cashFondo') || 0;
      const cashRecaudacion = form.watch('cashRecaudacion') || 0;
      const cashLoss = cashFondo + cashRecaudacion;
    
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
                Indique los valores estimados de las pérdidas por tipo de efectivo
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Efectivo Fondo */}
            <div>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Fondo
                </span>
                Efectivo fondo
              </FormLabel>
              <div className="mt-2">
                <Controller
                  control={form.control}
                  name="cashFondo"
                  render={({ field }) => (
                    <CurrencyInputField 
                      value={Number(field.value) || 0} 
                      onChange={field.onChange} 
                    />
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dinero destinado para cambio y operaciones diarias
              </p>
            </div>

            {/* Efectivo Recaudación */}
            <div>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Recaudación
                </span>
                Efectivo recaudación
              </FormLabel>
              <div className="mt-2">
                <Controller
                  control={form.control}
                  name="cashRecaudacion"
                  render={({ field }) => (
                    <CurrencyInputField 
                      value={Number(field.value) || 0} 
                      onChange={field.onChange} 
                    />
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dinero recaudado de las ventas del día
              </p>
            </div>

            {/* Total de efectivo */}
            <div className="border-t pt-4">
              <FormLabel className="text-sm font-medium text-primary">Total efectivo robado</FormLabel>
              <div className="mt-2">
                <Input 
                  readOnly 
                  disabled 
                  value={formatInputValue(cashFondo + cashRecaudacion)} 
                  className="w-full bg-primary/5 border-primary/20 font-medium text-primary" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Suma automática de efectivo fondo + efectivo recaudación
              </p>
            </div>
          </div>
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
    };
  }, [form, lossFields, appendLoss, removeLoss]);

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
      // 0. Process incident image metadata first (separate from attachments)
      if (incidentImageMetadata.length > 0) {
        console.log('Processing incident image metadata...');
        for (const image of incidentImageMetadata) {
          if (!image.uploadedData) {
            await handleUploadIncidentImageMetadata(image.id);
          }
        }
      }

      // 1. Procesar sospechosos (crear nuevos o usar existentes)
      const suspectIds: string[] = [];
      for (let idx = 0; idx < (data.selectedSuspects ?? []).length; idx++) {
        const suspectData = (data.selectedSuspects ?? [])[idx];
        
        // Si es un sospechoso existente, usar su ID directamente
        if (!suspectData.isNew && suspectData.apiId) {
          console.log('Using existing suspect ID:', suspectData.apiId);
          suspectIds.push(suspectData.apiId);
          continue;
        }
        
        // Si es un nuevo sospechoso, crearlo primero
        const physicalDescription = getTagValue(idx, 'notes');
        const photoUrl = suspectData.image;
        const tags = suspectTags[idx];
        
        const suspectObj: Partial<Suspect> = {
          Alias: suspectData.alias,
          Status: suspectData.statusId,
          // Valores por defecto requeridos por el backend
          PhysicalDescription: physicalDescription && physicalDescription.trim() ? physicalDescription : 'Sin descripción física',
          PhotoUrl: photoUrl && photoUrl.trim() ? photoUrl : 'https://res.cloudinary.com/dfwqg73mf/image/upload/fl_preserve_transparency/v1747695722/image_lfizgf.jpg?_s=public-apps',
        };
        
        // Solo agregar tags si tienen valor
        if (tags && Object.keys(tags).length > 0) {
          // Convertir el objeto de tags a formato JSON
          const tagValues = Object.entries(tags)
            .filter(([, value]) => value && String(value).trim() !== '')
            .reduce((acc, [key, value]) => {
              acc[key] = String(value).replace(/_/g, ' ');
              return acc;
            }, {} as Record<string, string>);
          
          suspectObj.Tags = tagValues;
        }
        
        console.log('Creating new suspect with data:', suspectObj);
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

      const cashFondo = data.cashFondo || 0;
      const cashRecaudacion = data.cashRecaudacion || 0;
      const cashLoss = cashFondo + cashRecaudacion;
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
        Tags: {
          cashFondo: cashFondo.toString(),
          cashRecaudacion: cashRecaudacion.toString()
        },
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
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    {office.Province && (
                                      <div className="font-medium text-blue-600">{office.Province}</div>
                                    )}
                                    {office.Address && (
                                      <div>{office.Address}</div>
                                    )}
                                  </div>
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
                {/* Regular Attachments Section */}
                <div className="rounded-xl border bg-card p-4 md:p-6">
                  <div className="flex items-center mb-4">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <div className="ml-2">
                      <h3 className="text-lg font-semibold">Adjuntos del Incidente</h3>
                      <p className="text-sm text-muted-foreground">Documentos, imágenes y archivos relacionados al incidente</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <FormLabel>Archivos del incidente</FormLabel>
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
                          
                          toast.success('Archivo subido correctamente');
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          toast.error('Error al subir el archivo');
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

                {/* Incident Image Metadata Section - Separate from attachments */}
                <div className="rounded-xl border bg-card p-4 md:p-6">
                  <IncidentImageMetadataUploader
                    images={incidentImageMetadata}
                    onAddImage={handleAddIncidentImage}
                    onRemoveImage={handleRemoveIncidentImage}
                    onUpdateDescription={handleUpdateIncidentImageDescription}
                    onUploadImage={handleUploadIncidentImageMetadata}
                    isSubmitting={isSubmitting}
                  />
                </div>

                {/* Additional Notes */}
                <div className="rounded-xl border bg-card p-4 md:p-6">
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
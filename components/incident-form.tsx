'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useIncident } from '@/context/incident-context';
import { getAllOffices } from '@/services/office-service';
import { searchSuspects as searchSuspectsApi, createSuspect } from '@/services/suspect-service';
import { IncidentFormValues, Office, Suspect } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { ArrowLeft, Loader2, DollarSign, Users, Paperclip, X, Check, ChevronsUpDown, UploadCloud, UserPlus, Info, Image as ImageIcon } from 'lucide-react';

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

const incidentTypes = [
  { value: 1, label: 'Hurto' },
  { value: 2, label: 'Robo' },
  { value: 3, label: 'Robo agravado' },
  { value: 4, label: 'Hurto de vehículo' },
  { value: 5, label: 'Robo de vehículo' },
  { value: 6, label: 'Daños a la propiedad' },
  { value: 7, label: 'Otro' },
];

export function IncidentForm() {
  const router = useRouter();
  const { createIncident } = useIncident();
  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [, setIsLoadingOffices] = useState(false);
  const [officePopoverOpen, setOfficePopoverOpen] = useState(false);
  const [suspectSearchQuery, setSuspectSearchQuery] = useState('');
  const [suspectSearchResults, setSuspectSearchResults] = useState<Suspect[]>([]);
  const [isSearchingSuspects, setIsSearchingSuspects] = useState(false);
  const [showSuspectDropdown, setShowSuspectDropdown] = useState(false);
  const [isAddingSuspect, setIsAddingSuspect] = useState(false);
  const [isSubmittingSuspect, setIsSubmittingSuspect] = useState(false);
  const [newSuspectAlias, setNewSuspectAlias] = useState('');
  const [newSuspectDescription, setNewSuspectDescription] = useState('');
  const [newSuspectImage, setNewSuspectImage] = useState<File | undefined>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeSection, setActiveSection] = useState('details');

  const form = useForm<IncidentFormValues>({
    defaultValues: {
      officeId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      incidentTypeId: 1,
      description: '',
      cashLoss: 0,
      merchandiseLoss: 0,
      otherLosses: 0,
      totalLoss: 0,
      notes: '',
      selectedSuspects: [],
    },
  });

  const { fields: suspectFields, append: appendSuspect, remove: removeSuspect } = useFieldArray({
    control: form.control,
    name: 'selectedSuspects',
  });

  // Fetch offices on mount
  useEffect(() => {
    const fetchOffices = async () => {
      setIsLoadingOffices(true);
      try {
        const data = await getAllOffices();
        setOffices(data);
      } catch (error) {
        console.error('Error fetching offices:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las oficinas',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingOffices(false);
      }
    };

    fetchOffices();
  }, []);

  // Search suspects with debounce
  const performSuspectSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuspectSearchResults([]);
      return;
    }

    setIsSearchingSuspects(true);
    try {
      const results = await searchSuspectsApi(query);
      setSuspectSearchResults(results);
    } catch (error) {
      console.error('Error searching suspects:', error);
      toast({
        title: 'Error',
        description: 'No se pudo realizar la búsqueda',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingSuspects(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSuspectSearch, 300, { leading: true }),
    [performSuspectSearch]
  );

  const handleSuspectSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSuspectSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelectSuspect = useCallback((suspect: Suspect) => {
    const exists = suspectFields.some(s => s.apiId === suspect.id);
    if (exists) {
      toast({ title: 'Este sospechoso ya fue agregado' });
    } else {
      appendSuspect({
        apiId: suspect.id,
        alias: suspect.Alias,
        statusId: suspect.Status,
        description: suspect.PhysicalDescription || '',
        image: suspect.PhotoUrl || '',
        isNew: false,
      });
    }
    setShowSuspectDropdown(false);
    setSuspectSearchQuery('');
  }, [suspectFields, appendSuspect]);

  const handleSuspectSubmit = useCallback(async (data: { alias: string; statusId: number; description?: string; image?: File | string | null }) => {
    setIsSubmittingSuspect(true);
    try {
      const formData = new FormData();
      formData.append('Alias', data.alias);
      formData.append('Status', data.statusId.toString());
      if (data.description) formData.append('PhysicalDescription', data.description);
      if (data.image instanceof File) formData.append('image', data.image);
      
      const newSuspect = await createSuspect(formData);
      appendSuspect({
        apiId: newSuspect.id,
        alias: newSuspect.Alias,
        statusId: newSuspect.Status,
        description: newSuspect.PhysicalDescription || '',
        image: newSuspect.PhotoUrl || '',
        isNew: false,
      });
      setIsAddingSuspect(false);
      toast({ title: 'Sospechoso creado exitosamente' });
    } catch (error) {
      console.error('Error creating suspect:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el sospechoso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingSuspect(false);
    }
  }, [appendSuspect]);

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

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const sections = [
    { id: 'details', icon: Info, label: 'Detalles' },
    { id: 'losses', icon: DollarSign, label: 'Pérdidas' },
    { id: 'suspects', icon: Users, label: 'Sospechosos' },
    { id: 'attachments', icon: Paperclip, label: 'Adjuntos' },
  ];

  const onSubmit = async (values: IncidentFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add basic fields
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'selectedSuspects' && value != null) {
          formData.append(key, value.toString());
        }
      });

      // Add suspects
      values.selectedSuspects.forEach((suspect, index) => {
        formData.append(`suspects[${index}][apiId]`, suspect.apiId.toString());
        formData.append(`suspects[${index}][alias]`, suspect.alias);
        formData.append(`suspects[${index}][statusId]`, suspect.statusId.toString());
        if (suspect.description) {
          formData.append(`suspects[${index}][description]`, suspect.description);
        }
        if (suspect.image instanceof File) {
          formData.append(`suspects[${index}][image]`, suspect.image);
        }
      });

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      await createIncident(formData);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormLabel>Oficina</FormLabel>
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
                          >
                            {field.value
                              ? offices.find((office) => office.id.toString() === field.value)?.Name
                              : "Seleccionar oficina"}
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
                                  form.setValue("officeId", office.id.toString());
                                  setOfficePopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    office.id.toString() === field.value
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
                      <FormLabel>Fecha</FormLabel>
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
                      <FormLabel>Hora</FormLabel>
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
                    <FormLabel>Tipo de Incidente</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {incidentTypes.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant={field.value === type.value ? "default" : "outline"}
                          size="sm"
                          className="rounded-full"
                          onClick={() => field.onChange(type.value)}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
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
              title="Pérdidas"
              subtitle="Especifique las pérdidas económicas"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cashLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pérdida en Efectivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="merchandiseLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pérdida en Mercancía</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otras Pérdidas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Pérdidas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Suspects Section */}
            <Section
              id="suspects"
              icon={Users}
              title="Sospechosos"
              subtitle="Agregue personas involucradas"
            >
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar sospechoso por alias o descripción..."
                      value={suspectSearchQuery}
                      onChange={handleSuspectSearchChange}
                      onFocus={() => setShowSuspectDropdown(true)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingSuspect(true)}
                      className="shrink-0"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nuevo
                    </Button>
                  </div>

                  {showSuspectDropdown && suspectSearchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
                      {isSearchingSuspects ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Buscando...</span>
                        </div>
                      ) : (
                        <Command>
                          <CommandList>
                            {suspectSearchResults.map((suspect) => (
                              <CommandItem
                                key={suspect.id}
                                onSelect={() => handleSelectSuspect(suspect)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  {suspect.PhotoUrl ? (
                                    <Image
                                      src={suspect.PhotoUrl}
                                      alt={suspect.Alias}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">{suspect.Alias}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {suspect.PhysicalDescription || 'Sin descripción'}
                                    </p>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      )}
                    </div>
                  )}
                </div>

                {isAddingSuspect && (
                  <div className="mt-4 p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Alias"
                              value={newSuspectAlias}
                              onChange={(e) => setNewSuspectAlias(e.target.value)}
                              disabled={isSubmittingSuspect}
                            />
                            <Input
                              placeholder="Descripción física"
                              value={newSuspectDescription}
                              onChange={(e) => setNewSuspectDescription(e.target.value)}
                              disabled={isSubmittingSuspect}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">
                              Foto del sospechoso
                            </label>
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="suspect-image"
                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                              >
                                {newSuspectImage ? (
                                  <div className="relative w-full h-full">
                                    <Image
                                      src={URL.createObjectURL(newSuspectImage)}
                                      alt="Preview"
                                      fill
                                      className="object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <UploadCloud className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center p-2 text-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">Subir imagen</span>
                                  </div>
                                )}
                                <input
                                  id="suspect-image"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setNewSuspectImage(file);
                                    }
                                  }}
                                  disabled={isSubmittingSuspect}
                                />
                              </label>
                              {newSuspectImage && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/90"
                                  onClick={() => setNewSuspectImage(undefined)}
                                  disabled={isSubmittingSuspect}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (!newSuspectAlias.trim()) {
                                toast({
                                  title: 'Error',
                                  description: 'El alias es requerido',
                                  variant: 'destructive',
                                });
                                return;
                              }
                              
                              setIsSubmittingSuspect(true);
                              try {
                                const formData = new FormData();
                                formData.append('Alias', newSuspectAlias);
                                formData.append('Status', '1'); // Default status
                                if (newSuspectDescription) {
                                  formData.append('PhysicalDescription', newSuspectDescription);
                                }
                                if (newSuspectImage) {
                                  formData.append('image', newSuspectImage);
                                }
                                
                                await handleSuspectSubmit({
                                  alias: newSuspectAlias,
                                  statusId: 1,
                                  description: newSuspectDescription,
                                  image: newSuspectImage,
                                });
                                
                                setNewSuspectAlias('');
                                setNewSuspectDescription('');
                                setNewSuspectImage(undefined);
                                setIsAddingSuspect(false);
                              } catch (error) {
                                console.error('Error adding suspect:', error);
                                toast({
                                  title: 'Error',
                                  description: 'No se pudo agregar el sospechoso',
                                  variant: 'destructive',
                                });
                              } finally {
                                setIsSubmittingSuspect(false);
                              }
                            }}
                            disabled={isSubmittingSuspect || !newSuspectAlias.trim()}
                          >
                            {isSubmittingSuspect && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Agregar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingSuspect(false);
                              setNewSuspectAlias('');
                              setNewSuspectDescription('');
                              setNewSuspectImage(undefined);
                            }}
                            disabled={isSubmittingSuspect}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setIsAddingSuspect(false)}
                        disabled={isSubmittingSuspect}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {suspectFields.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sospechosos seleccionados:</p>
                    <div className="space-y-2">
                      {suspectFields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center space-x-3">
                            {field.image ? (
                              <Image
                                src={field.image}
                                alt={field.alias}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{field.alias}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {field.description || 'Sin descripción'}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeSuspect(idx)}
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
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Incidente
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Sidebar Navigation - Moved to right side */}
      <div className="hidden w-48 md:block">
        <div className="sticky top-6 space-y-1">
          {sections.map((section) => (
            <IndexButton
              key={section.id}
              id={section.id}
              icon={section.icon}
              label={section.label}
              activeSection={activeSection}
              onClick={scrollToSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
// Temporarily comment out unused imports
// import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Trash2, DollarSign, Users, Paperclip, Info, Search, UploadCloud, UserPlus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { incidentSchema, IncidentFormValues, SelectedSuspectFormValues } from '@/validators/incident'; 
import { IncidentFormValues, SelectedSuspectFormValues } from '@/validators/incident'; // Keep types needed
import { useIncident } from '@/context/incident-context';
// import { useOffice } from '@/context/office-context'; 
import { searchSuspects as searchSuspectsApi } from '@/services/suspect-service'; 
import { Suspect } from '@/types/suspect'; 
import { debounce } from 'lodash'; 
import { cn } from '@/lib/utils';

const incidentTypes = [
  { value: 1, label: 'Hurto' },
  { value: 2, label: 'Robo' },
  { value: 3, label: 'Robo agravado' },
  { value: 4, label: 'Vandalismo' },
  { value: 5, label: 'Lesión de confianza' },
  { value: 6, label: 'Otro' },
];

const officeOptions = [
  { id: 1, name: 'PUNTO 560' },
  { id: 2, name: 'Sucursal Norte' },
  { id: 3, name: 'Sucursal Sur' },
];

export function IncidentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeSection, setActiveSection] = useState('details');
  const [suspectSearchQuery, setSuspectSearchQuery] = useState('');
  const [suspectSearchResults, setSuspectSearchResults] = useState<Suspect[]>([]);
  const [isSearchingSuspects, setIsSearchingSuspects] = useState(false);
  const [showSuspectDropdown, setShowSuspectDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { createIncident, error: incidentError } = useIncident();
  const isLoadingOffices = false;

  const form = useForm<IncidentFormValues>({
    // Temporarily disable resolver to test validation impact
    // resolver: zodResolver(incidentSchema),
    defaultValues: {
      officeId: undefined,
      date: '',
      time: '',
      incidentTypeId: 1,
      description: '',
      cashLoss: 0,
      merchandiseLoss: 0,
      otherLosses: 0,
      totalLoss: 0,
      notes: '',
      selectedSuspects: []
    }
  });

  const { fields: suspectFields, append: appendSuspect, remove: removeSuspect } = useFieldArray({
    control: form.control,
    name: 'selectedSuspects'
  });

  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    form.setValue('date', currentDate);
    form.setValue('time', currentTime);
  }, [form]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) { 
        setSuspectSearchResults([]);
        setIsSearchingSuspects(false);
        // Keep dropdown open if query exists (even if too short) to show create option
        // setShowSuspectDropdown(query.length > 0); // Commented out
        return;
      }
      setIsSearchingSuspects(true);
      // setShowSuspectDropdown(true); // Commented out - Ensure dropdown stays open during search
      console.log("[debouncedSearch] Starting API call for:", query);
      try {
        const results = await searchSuspectsApi(query);
        console.log("[debouncedSearch] API call finished. Results count:", results.length);
        setSuspectSearchResults(results);
      } catch (error) {
        console.error("[debouncedSearch] Error searching suspects:", error);
        toast({ title: "Error", description: "No se pudieron buscar sospechosos", variant: "destructive" });
        setSuspectSearchResults([]);
      } finally {
        console.log("[debouncedSearch] Setting isSearchingSuspects to false.");
        setIsSearchingSuspects(false);
        console.log("[debouncedSearch] State after setting isSearchingSuspects to false.");
        // setShowSuspectDropdown(true); // Commented out - Keep open after search completes
      }
    }, 500), 
    []
  );

  const handleSuspectSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    console.log(`[handleSuspectSearchChange] Query changed: "${query}"`);
    setSuspectSearchQuery(query);
    if (query.length === 0) {
        console.log("[handleSuspectSearchChange] Query empty, hiding dropdown and canceling debounce.");
        setShowSuspectDropdown(false); 
        setSuspectSearchResults([]);
        setIsSearchingSuspects(false); // Ensure searching is false if query becomes empty
        debouncedSearch.cancel(); 
    } else {
        console.log("[handleSuspectSearchChange] Setting isSearchingSuspects to true.");
        setIsSearchingSuspects(true); 
        console.log("[handleSuspectSearchChange] State after setting isSearchingSuspects to true. Calling debouncedSearch.");
        // setShowSuspectDropdown(true); // Commented out - Open dropdown when typing starts
        debouncedSearch(query);
    }
  };

  const handleSelectSuspect = (suspect: Suspect) => {
    const alreadyAdded = suspectFields.some(field => (field as SelectedSuspectFormValues).apiId === suspect.id);
    if (alreadyAdded) {
       toast({ title: "Sospechoso ya agregado", variant: "default" });
       setShowSuspectDropdown(false);
       return;
    }
    
    appendSuspect({
      apiId: suspect.id,
      alias: suspect.alias ?? '',
      statusId: suspect.statusId || 1,
      description: suspect.physicalDescription ?? '',
      image: suspect.photoUrl || undefined,
      isNew: false
    } as SelectedSuspectFormValues);
    setSuspectSearchQuery('');
    setSuspectSearchResults([]);
    setShowSuspectDropdown(false);
  };

  const handleAddNewSuspect = (alias?: string) => {
    appendSuspect({
      apiId: undefined,
      alias: alias || '',
      statusId: 1,
      description: '',
      image: undefined,
      isNew: true
    } as SelectedSuspectFormValues);
    setSuspectSearchQuery('');
    setSuspectSearchResults([]);
    setShowSuspectDropdown(false);
  };

  const onSubmit = async (values: IncidentFormValues) => {
    setLoading(true);
    console.log("Form Data:", values);
    console.log("Attachments:", attachments);
    try {
      const formData = new FormData();
      formData.append('officeId', values.officeId?.toString() || '');
      formData.append('date', values.date);
      formData.append('time', values.time);
      formData.append('incidentTypeId', values.incidentTypeId?.toString() || '');
      formData.append('description', values.description || '');
      formData.append('cashLoss', values.cashLoss?.toString() || '0');
      formData.append('merchandiseLoss', values.merchandiseLoss?.toString() || '0');
      formData.append('otherLosses', values.otherLosses?.toString() || '0');
      formData.append('totalLoss', values.totalLoss?.toString() || '0');
      formData.append('notes', values.notes || '');
      
      const suspectDataForApi = values.selectedSuspects?.map(s => ({
          id: s.apiId,
          alias: s.alias,
          statusId: s.statusId,
          physicalDescription: s.description,
          isNew: s.isNew
      })) || [];
      formData.append('suspects', JSON.stringify(suspectDataForApi));

      values.selectedSuspects?.forEach((suspect, index) => {
          if (suspect.image instanceof File) {
              formData.append(`suspectImage_${index}`, suspect.image, suspect.image.name);
          }
      });

      attachments.forEach((file) => {
        formData.append('attachments', file, file.name);
      });

      console.log("Submitting FormData:", Object.fromEntries(formData));
      const newIncident = await createIncident(formData);

      if (newIncident) {
        toast({ title: "Incidente registrado", description: "Incidente creado exitosamente." });
        router.push('/dashboard');
      } else {
        toast({ title: "Error", description: incidentError || "No se pudo registrar el incidente", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
      toast({ title: "Error", description: "Ocurrió un error inesperado.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const currentFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...currentFiles].slice(0, 5));
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const Section = ({ id, icon: Icon, title, subtitle, children }: {
    id: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => (
    <section id={id} className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex gap-3 items-center mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );

  const IndexButton = ({ id, icon: Icon, label }: { id: string; icon: React.ElementType; label: string }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        activeSection === id && "bg-muted"
      )}
      onClick={() => scrollToSection(id)}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="flex min-h-screen p-4 md:p-6">
      <div className="flex-1 pr-4 md:pr-6 pb-24">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Registrar incidente</h1>
            <p className="text-sm text-muted-foreground">Monitorear actividad principal</p>
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            <Section id="details" icon={Info} title="Detalles del incidente" subtitle="Datos principales del incidente">
              <FormField
                control={form.control}
                name="officeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar sucursal</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingOffices}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOffices ? "Cargando oficinas..." : "Seleccionar sucursal"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingOffices ? (
                           <SelectItem value="loading" disabled>Cargando...</SelectItem>
                        ) : (
                           officeOptions?.map((office) => (
                             <SelectItem key={office.id} value={office.id.toString()}>
                               {office.name}
                             </SelectItem>
                           ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} placeholder="dd-mm-aaaa"/>
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
                        <Input type="time" {...field} placeholder="--:-- --" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Tipo de incidente</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {incidentTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={form.watch('incidentTypeId') === type.value ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "rounded-full px-3 py-1 text-xs h-auto",
                      )}
                      onClick={() => form.setValue('incidentTypeId', type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

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
            </Section>

            <Section id="losses" icon={DollarSign} title="Pérdidas/Montos" subtitle="Indique los valores estimados de las pérdidas">
               <div className="grid grid-cols-2 gap-4">
                 <FormField
                   control={form.control}
                   name="cashLoss"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Efectivo ($)</FormLabel>
                       <FormControl>
                         <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="0" />
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
                       <FormLabel>Mercadería ($)</FormLabel>
                       <FormControl>
                         <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="0"/>
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
                       <FormLabel>Otras pérdidas ($)</FormLabel>
                       <FormControl>
                         <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="0"/>
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
                       <FormLabel>Total ($)</FormLabel>
                       <FormControl>
                         <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="0"/>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>
            </Section>

            <Section id="suspects" icon={Users} title="Sospechosos" subtitle="Información sobre posibles sospechosos">
              <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                 <Input 
                   ref={searchInputRef}
                   placeholder="Buscar sospechoso por alias o descripción..."
                   className="pl-10 pr-10" 
                   value={suspectSearchQuery}
                   onChange={handleSuspectSearchChange}
                   onBlur={() => setTimeout(() => setShowSuspectDropdown(false), 150)}
                   autoComplete="off"
                 />
                 {isSearchingSuspects && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />} 
                
                 {showSuspectDropdown && (
                   <div className="absolute z-10 w-full mt-1 rounded-md border bg-background shadow-lg max-h-60 overflow-y-auto text-sm">
                     {isSearchingSuspects ? (
                       <div className="p-3 text-center text-muted-foreground">Buscando...</div>
                     ) : (
                       <> 
                         {suspectSearchResults.length > 0 ? (
                           suspectSearchResults.map(suspect => (
                             <Button 
                               key={suspect.id} 
                               variant="ghost"
                               className="w-full justify-start h-auto py-2 px-3 text-left rounded-none border-b last:border-b-0 hover:bg-muted"
                               onClick={() => handleSelectSuspect(suspect)}
                             >
                               <div>
                                  <div className="font-medium">{suspect.alias}</div>
                                  {suspect.physicalDescription && <div className="text-xs text-muted-foreground">{suspect.physicalDescription.substring(0, 50)}...</div>}
                               </div>
                             </Button>
                           ))
                         ) : (
                            suspectSearchQuery && (
                              <> 
                               <div className="px-3 py-2 text-center text-muted-foreground">
                                 No se encontraron sospechosos con ese criterio.
                               </div>
                               <Button 
                                 variant="ghost"
                                 className="w-full justify-start h-auto py-2 px-3 text-left rounded-none border-t hover:bg-muted"
                                 onClick={() => handleAddNewSuspect(suspectSearchQuery)}
                               >
                                  <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Crear Nuevo Sospechoso: &quot;{suspectSearchQuery}&quot;
                               </Button>
                              </> 
                            )
                         )}
                       </>
                     )}
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                  {suspectFields.map((field, index) => (
                     <div key={field.id} className="border p-4 rounded-md bg-background relative">
                          <Button 
                         type="button" 
                         variant="ghost" 
                         size="icon"
                         className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                         onClick={() => removeSuspect(index)}
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                       
                       <p className="text-sm font-medium mb-2">
                         { (field as SelectedSuspectFormValues).isNew ? `Nuevo Sospechoso ${index + 1}` : `Sospechoso: ${(field as SelectedSuspectFormValues).alias}` }
                       </p>
                       
                       <div className="space-y-3">
                         <FormField
                           control={form.control}
                           name={`selectedSuspects.${index}.alias`} 
                           render={({ field: suspectField }) => (
                             <FormItem>
                               <FormLabel className="text-xs">Alias</FormLabel>
                               <FormControl>
                                 <Input {...suspectField} placeholder="Alias del sospechoso" />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         <FormField
                           control={form.control}
                           name={`selectedSuspects.${index}.description`} 
                           render={({ field: suspectField }) => (
                             <FormItem>
                               <FormLabel className="text-xs">Descripción Física</FormLabel>
                               <FormControl>
                                 <Textarea {...suspectField} placeholder="Características físicas, vestimenta..." />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         <FormField
                           control={form.control}
                           name={`selectedSuspects.${index}.image`} 
                           render={({ field: { onChange, value, ...rest } }) => (
                             <FormItem>
                               <FormLabel className="text-xs">Foto del Sospechoso</FormLabel>
                               {typeof value === 'string' && value && (
                                  <div className="mb-2">
                                    <img src={value} alt="Foto actual" className="h-20 w-20 object-cover rounded" />
                                    <Button type="button" variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => onChange(null)}>Cambiar foto</Button>
                                  </div>
                               )}
                               {(typeof value !== 'string' || !value) && (
                                 <FormControl>
                                   <Input
                                     type="file"
                                     accept="image/*"
                                     onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       onChange(file || null);
                                     }}
                                     {...rest}
                                   />
                                 </FormControl>
                               )} 
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       </div>
                     </div>
                  ))}
               </div>
            </Section>

            <Section id="attachments" icon={Paperclip} title="Adjuntos adicionales" subtitle="Agrega fotos, videos o documentos relevantes">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones, detalles extra..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Adjuntar archivos (máx. 5)</FormLabel>
                <FormControl>
                   <div className="flex items-center justify-center w-full">
                     <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
                         <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                             <UploadCloud className="w-8 h-8 mb-2" />
                             <p className="mb-1 text-sm"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                             <p className="text-xs">JPG, PNG, PDF, MP4 (Máx 5MB c/u)</p>
                         </div>
                         <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.mp4" />
                     </label>
                   </div> 
                </FormControl>
                {attachments.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
                    <ul className="list-disc list-inside pl-4">
                      {attachments.map((file, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          {file.name} 
                          <Button type="button" variant="ghost" size="sm" className="ml-2 h-auto p-0 text-destructive hover:text-destructive/80" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </Form>
      </div>

      <div className="w-[220px] hidden md:block sticky top-4 self-start p-4 border-l h-[calc(100vh-2rem)] overflow-y-auto">
        <nav className="space-y-2">
          <IndexButton id="details" icon={Info} label="Detalles" />
          <IndexButton id="losses" icon={DollarSign} label="Pérdidas" />
          <IndexButton id="suspects" icon={Users} label="Sospechosos" />
          <IndexButton id="attachments" icon={Paperclip} label="Adjuntos" />
        </nav>
      </div>

      <div className="fixed bottom-0 left-0 md:left-auto right-0 w-full md:w-[calc(100%-220px)] border-t bg-background/80 backdrop-blur-sm p-4 z-50">
        <div className="flex justify-end gap-3 max-w-6xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
             type="button" 
             onClick={form.handleSubmit(onSubmit)} 
             disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Incidente'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 

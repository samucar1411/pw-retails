'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { createSuspect, getSuspectStatuses, getAllSuspects } from '@/services/suspect-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  UserPlus, 
  X, 
  Search, 
  User, 
  Image as ImageIcon,
  Plus,
  Users,
  Save
} from 'lucide-react';
import { Suspect, SuspectStatus } from '@/types/suspect';
import { IncidentFormValues } from '@/validators/incident';

// Same tag options as the suspects page for consistency
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUSPECT_TAG_OPTIONS = {
  'Género': [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'desconocido', label: 'Desconocido' }
  ],
  'Altura': [
    { value: 'bajo', label: 'Bajo' },
    { value: 'normal', label: 'Normal' },
    { value: 'alto', label: 'Alto' },
    { value: 'muy_alto', label: 'Muy Alto' }
  ],
  'Contextura': [
    { value: 'flaco', label: 'Flaco' },
    { value: 'normal', label: 'Normal' },
    { value: 'musculoso', label: 'Musculoso' },
    { value: 'sobrepeso', label: 'Sobrepeso' }
  ],
  'Tono de Piel': [
    { value: 'clara', label: 'Clara' },
    { value: 'triguena', label: 'Trigueña' },
    { value: 'oscura', label: 'Oscura' },
    { value: 'negra', label: 'Negra' }
  ],
  'Piercings': [
    { value: 'nariz', label: 'Nariz' },
    { value: 'oreja', label: 'Oreja' },
    { value: 'cejas', label: 'Cejas' },
    { value: 'lengua', label: 'Lengua' },
    { value: 'labios', label: 'Labios' }
  ],
  'Tatuajes': [
    { value: 'brazos', label: 'Brazos' },
    { value: 'cara', label: 'Cara' },
    { value: 'cuello', label: 'Cuello' },
    { value: 'piernas', label: 'Piernas' },
    { value: 'mano', label: 'Mano' }
  ],
  'Accesorios': [
    { value: 'lentes_sol', label: 'Lentes de sol' },
    { value: 'bolsa', label: 'Bolsa' },
    { value: 'lentes', label: 'Lentes' },
    { value: 'casco', label: 'Casco' },
    { value: 'mochila', label: 'Mochila' }
  ],
  'Comportamiento': [
    { value: 'nervioso', label: 'Nervioso' },
    { value: 'agresivo', label: 'Agresivo' },
    { value: 'portaba_armas', label: 'Portaba Armas' },
    { value: 'abuso_fisico', label: 'Abuso Físico' },
    { value: 'alcohol_droga', label: 'Alcoholizado/Drogado' }
  ],
  'Elementos que Dificultan ID': [
    { value: 'mascarilla', label: 'Mascarilla/barbijo' },
    { value: 'casco', label: 'Casco' },
    { value: 'pasamontanas', label: 'Pasamontañas' },
    { value: 'capucha', label: 'Capucha' },
    { value: 'lentes_oscuros', label: 'Lentes Oscuros' }
  ]
};

interface SuspectSelectorProps {
  control: Control<IncidentFormValues>;
}

interface NewSuspectCard {
  id: string;
  alias: string;
  name: string;
  lastName: string;
  lastName2: string;
  nationality: string;
  description: string;
  statusId: number;
  image: File | null;
  isSubmitting: boolean;
}

export function SuspectSelector({ control }: SuspectSelectorProps) {
  const { fields: suspectFields, append: appendSuspect, remove: removeSuspect } = useFieldArray({
    control,
    name: 'selectedSuspects',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Suspect[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [newSuspectCards, setNewSuspectCards] = useState<NewSuspectCard[]>([]);
  const [suspectStatuses, setSuspectStatuses] = useState<SuspectStatus[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);

  // Debug: Log when suspectFields changes
  useEffect(() => {
    // Suspects updated
  }, [suspectFields]);

  // Load suspect statuses on component mount
  useEffect(() => {
    const loadSuspectStatuses = async () => {
      try {
        setIsLoadingStatuses(true);
        const statuses = await getSuspectStatuses();
        setSuspectStatuses(statuses);
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estados de sospechosos',
          variant: 'destructive',
        });
        // Fallback to basic statuses
        setSuspectStatuses([
          { id: 1, Name: 'Libre' },
          { id: 2, Name: 'Detenido' }
        ]);
      } finally {
        setIsLoadingStatuses(false);
      }
    };

    loadSuspectStatuses();
  }, []);

  // Search suspects with debounce - now using tags-based search like the suspects page
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setTotalResults(0);
      return;
    }

    console.log('🔍 Buscando sospechosos con query:', query);
    setIsSearching(true);
    
    try {
      // Use the same search parameters as the suspects page for consistency
      const searchParams = {
        page: 1,
        pageSize: 25,
        filters: {
          tags: query, // Use tags parameter instead of search for better results
          search: undefined // Remove search parameter as in suspects page
        }
      };
      
      console.log('📡 Enviando parámetros:', searchParams);
      
      const response = await getAllSuspects(searchParams);
      
      console.log('✅ Respuesta recibida:', {
        count: response?.count,
        results: response?.results?.length,
        firstResult: response?.results?.[0]
      });
      
      const results = response?.results || [];
      const count = response?.count || 0;
      
      setSearchResults(results);
      setTotalResults(count);
      setShowResults(true);
      
    } catch (error) {
      console.error('❌ Error searching suspects:', error);
      
      // Fallback: try simple search with tags parameter
      try {
        console.log('🔄 Intentando fallback con búsqueda simple...');
        const fallbackResponse = await getAllSuspects({
          tags: query,
          page: 1,
          page_size: 50,
          format: 'json'
        });
        
        const results = fallbackResponse?.results || [];
        console.log('✅ Fallback exitoso:', results.length, 'resultados');
        
        setSearchResults(results);
        setTotalResults(fallbackResponse?.count || 0);
        setShowResults(true);
        
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
        toast({
          title: 'Error',
          description: 'No se pudo realizar la búsqueda',
          variant: 'destructive',
        });
        setShowResults(false);
        setTotalResults(0);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setTotalResults(0);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleSelectSuspect = useCallback((suspect: Suspect) => {
    // Keep the suspect ID as string (it's a UUID)
    const suspectId = suspect.id;
    
    // Check if the ID exists
    if (!suspectId) {
      toast({
        title: 'Error',
        description: 'ID de sospechoso faltante',
        variant: 'destructive',
      });
      return;
    }
    
    const exists = suspectFields.some(s => s.apiId === suspectId);
    if (exists) {
      // Just return without showing any notification
      return;
    }

    try {
      const suspectToAdd = {
        apiId: suspectId, // Keep as string
        alias: suspect.Alias || 'Sin alias',
        statusId: suspect.Status || 1,
        description: suspect.PhysicalDescription || '',
        image: suspect.PhotoUrl || '',
        isNew: false,
      };
      
      appendSuspect(suspectToAdd);
      
      // Clear search and hide results
      setShowResults(false);
      setSearchQuery('');
      setSearchResults([]);
      setTotalResults(0);
    } catch {
      // Only show error notifications for actual errors
      toast({
        title: 'Error',
        description: 'No se pudo agregar el sospechoso',
        variant: 'destructive',
      });
    }
  }, [suspectFields, appendSuspect]);

  const addNewSuspectCard = () => {
    const newCard: NewSuspectCard = {
      id: Date.now().toString(),
      alias: '',
      name: '',
      lastName: '',
      lastName2: '',
      nationality: '',
      description: '',
      statusId: 1,
      image: null,
      isSubmitting: false,
    };
    setNewSuspectCards(prev => [...prev, newCard]);
  };

  const updateNewSuspectCard = (id: string, updates: Partial<NewSuspectCard>) => {
    setNewSuspectCards(prev => 
      prev.map(card => {
        if (card.id === id) {
          const updatedCard = { ...card, ...updates };
          // Ensure statusId is always defined
          if (updatedCard.statusId === undefined || updatedCard.statusId === null) {
            updatedCard.statusId = 1;
          }
          return updatedCard;
        }
        return card;
      })
    );
  };

  const removeNewSuspectCard = (id: string) => {
    setNewSuspectCards(prev => prev.filter(card => card.id !== id));
  };

  const handleCreateSuspect = async (cardId: string) => {
    const card = newSuspectCards.find(c => c.id === cardId);
    if (!card) return;

    if (!card.alias.trim()) {
      toast({
        title: 'Error',
        description: 'El alias es requerido',
        variant: 'destructive',
      });
      return;
    }

    updateNewSuspectCard(cardId, { isSubmitting: true });

    try {
      let finalPhotoUrl = '';

      // 1. Upload image if a new file is provided
      if (card.image) {
        const formData = new FormData();
        formData.append('image', card.image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          toast({
            title: 'Error de Subida',
            description: `No se pudo subir la imagen: ${uploadResult.message || 'Error desconocido'}`,
            variant: 'destructive',
          });
          return;
        }
        finalPhotoUrl = uploadResult.url;
      }

      // 2. Prepare suspect data for creation
      const suspectDataToCreate = {
        Alias: card.alias.trim(),
        Name: card.name.trim() || '',
        LastName: card.lastName.trim() || '',
        LastName2: card.lastName2.trim() || '',
        Nationality: card.nationality.trim() || '',
        PhysicalDescription: card.description.trim() || '',
        Status: card.statusId, // Use the selected status instead of hardcoding
        PhotoUrl: finalPhotoUrl,
      };

      // 3. Create the suspect
      const createdSuspect = await createSuspect(suspectDataToCreate);
      
      if (createdSuspect) {
        // Add to form
        const suspectToAdd = {
          apiId: createdSuspect.id, // Keep as string (UUID)
          alias: createdSuspect.Alias,
          statusId: createdSuspect.Status,
          description: createdSuspect.PhysicalDescription || '',
          image: createdSuspect.PhotoUrl || '',
          isNew: false,
        };
        
        appendSuspect(suspectToAdd);

        // Remove the card
        removeNewSuspectCard(cardId);
      } else {
        throw new Error('No se pudo crear el sospechoso');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo crear el sospechoso. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      updateNewSuspectCard(cardId, { isSubmitting: false });
    }
  };

  const handleImageUpload = (cardId: string, file: File | null) => {
    updateNewSuspectCard(cardId, { image: file });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Sospechosos</h3>
          <p className="text-sm text-muted-foreground">Agregue personas involucradas en el incidente</p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por alias, descripción física, tags o características..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addNewSuspectCard}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Nuevo
          </Button>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="relative">
            <div className="absolute z-10 w-full rounded-md border bg-popover shadow-lg">
              <Command>
                <CommandList className="max-h-80">
                  {searchResults.length === 0 ? (
                    <CommandEmpty>
                      <div className="flex flex-col items-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground mb-2">No se encontraron sospechosos</p>
                        <p className="text-sm text-muted-foreground mb-3 max-w-sm">
                          Intente buscar por alias, descripción física, tags o características específicas
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Ejemplo: &quot;Juan&quot; - buscar por alias</p>
                          <p>• Ejemplo: &quot;alto musculoso&quot; - descripción física</p>
                          <p>• Ejemplo: &quot;tatuaje brazos&quot; - características específicas</p>
                          <p>• Ejemplo: &quot;nervioso agresivo&quot; - comportamiento</p>
                        </div>
                      </div>
                    </CommandEmpty>
                  ) : (
                    <>
                      {totalResults > searchResults.length && (
                        <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b">
                          Mostrando {searchResults.length} de {totalResults} resultados. 
                          Refine su búsqueda para ver más específicos.
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground bg-blue-50 border-b">
                          🔍 Búsqueda avanzada por alias, descripción física, tags y características
                        </div>
                      )}
                      {searchResults.map((suspect) => (
                        <CommandItem
                          key={suspect.id}
                          onSelect={() => {
                            handleSelectSuspect(suspect);
                          }}
                          className="cursor-pointer"
                        >
                          <div 
                            className="flex items-center gap-3 w-full p-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectSuspect(suspect);
                            }}
                          >
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
                                  handleSelectSuspect(suspect);
                                }}
                              >
                                <Plus className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        )}
      </div>

      {/* New Suspect Cards */}
      {newSuspectCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Nuevos Sospechosos</h4>
            <Badge variant="outline" className="text-xs">
              {newSuspectCards.length}
            </Badge>
          </div>
          
          {newSuspectCards.map((card) => (
            <div key={card.id} className="rounded-lg border bg-card p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground">Nuevo Sospechoso</h5>
                    <p className="text-xs text-muted-foreground">Complete la información del sospechoso</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNewSuspectCard(card.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={card.isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Form Content */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nombre</label>
                      <Input
                        placeholder="Nombre del sospechoso"
                        value={card.name}
                        onChange={(e) => updateNewSuspectCard(card.id, { name: e.target.value })}
                        disabled={card.isSubmitting}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Apellido Paterno</label>
                      <Input
                        placeholder="Apellido paterno del sospechoso"
                        value={card.lastName}
                        onChange={(e) => updateNewSuspectCard(card.id, { lastName: e.target.value })}
                        disabled={card.isSubmitting}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Apellido Materno</label>
                      <Input
                        placeholder="Apellido materno del sospechoso"
                        value={card.lastName2}
                        onChange={(e) => updateNewSuspectCard(card.id, { lastName2: e.target.value })}
                        disabled={card.isSubmitting}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nacionalidad</label>
                      <Input
                        placeholder="Nacionalidad del sospechoso"
                        value={card.nationality}
                        onChange={(e) => updateNewSuspectCard(card.id, { nationality: e.target.value })}
                        disabled={card.isSubmitting}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Alias <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Ingrese el alias del sospechoso"
                      value={card.alias}
                      onChange={(e) => updateNewSuspectCard(card.id, { alias: e.target.value })}
                      disabled={card.isSubmitting}
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Descripción Física</label>
                    <Textarea
                      placeholder="Describa las características físicas del sospechoso"
                      value={card.description}
                      onChange={(e) => updateNewSuspectCard(card.id, { description: e.target.value })}
                      disabled={card.isSubmitting}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <Select
                    value={(card.statusId || 1).toString()}
                    onValueChange={(value) => updateNewSuspectCard(card.id, { statusId: Number(value) })}
                    disabled={card.isSubmitting || isLoadingStatuses}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStatuses ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cargando estados...
                          </div>
                        </SelectItem>
                      ) : (
                        suspectStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.Name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Fotografía</label>
                  
                  {!card.image ? (
                    <label
                      htmlFor={`suspect-image-upload-${card.id}`}
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex flex-col items-center text-center p-4">
                        <div className="rounded-full bg-muted p-3 mb-2 group-hover:bg-muted-foreground/10">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">Subir fotografía</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</p>
                      </div>
                      <input
                        id={`suspect-image-upload-${card.id}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(card.id, e.target.files?.[0] || null)}
                        disabled={card.isSubmitting}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={URL.createObjectURL(card.image)}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{card.image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(card.image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleImageUpload(card.id, null)}
                        disabled={card.isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeNewSuspectCard(card.id)}
                  disabled={card.isSubmitting}
                  className="text-muted-foreground"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="button"
                  onClick={() => handleCreateSuspect(card.id)}
                  disabled={card.isSubmitting || !card.alias.trim()}
                  className="min-w-[140px]"
                >
                  {card.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear y Agregar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Suspects */}
      {suspectFields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Sospechosos Seleccionados</h4>
            <Badge variant="secondary" className="text-xs">
              {suspectFields.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {suspectFields.map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-accent/5 transition-colors"
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
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{field.alias}</p>
                    {field.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {field.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={field.statusId === 1 ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {suspectStatuses.find(status => status.id === field.statusId)?.Name || `Status ${field.statusId}`}
                      </Badge>
                      {field.isNew && (
                        <Badge variant="outline" className="text-xs">
                          Nuevo
                        </Badge>
                      )}
                    </div>
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

      {/* Empty State */}
      {suspectFields.length === 0 && newSuspectCards.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground mb-2">
            No hay sospechosos agregados
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Busque un sospechoso existente o cree uno nuevo
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addNewSuspectCard}
            className="mx-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Primer Sospechoso
          </Button>
        </div>
      )}
    </div>
  );
} 
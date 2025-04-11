'use client';

import { useEffect, useState } from 'react';
import { useEvents } from '@/context/event-context';
import { EventModal } from './columns';
import { Event } from '@/types/event';
import { EventCard } from './components/event-card';
import { SearchFilterBar } from './components/search-filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EventsPage() {
  const { 
    loading, 
    error, 
    events, 
    perPage, 
    fetchEvents,
    hasNewEvents,
    markNewEventsAsSeen
  } = useEvents();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, officeFilter, deviceFilter, dateFilter]);

  // Handle new events notification
  useEffect(() => {
    if (hasNewEvents) {
      // Reset to first page and clear filters when new events arrive
      setCurrentPage(1);
      setSearchQuery('');
      setOfficeFilter('all');
      setDeviceFilter('all');
      setDateFilter('all');
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Mark events as seen
      markNewEventsAsSeen();
    }
  }, [hasNewEvents, markNewEventsAsSeen]);

  const offices = Array.from(new Set(events.map(event => event.office_name)));
  const devices = Array.from(new Set(events.map(event => event.device_name)));

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.office_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOffice = officeFilter === 'all' || event.office_name === officeFilter;
    const matchesDevice = deviceFilter === 'all' || event.device_name === deviceFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.created_at);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = eventDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = eventDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesDate = eventDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesOffice && matchesDevice && matchesDate;
  });

  const totalFilteredEvents = filteredEvents.length;
  const totalPages = Math.ceil(totalFilteredEvents / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-4 gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">
              Gestiona y monitorea todos los eventos del sistema
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48" />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">
              Gestiona y monitorea todos los eventos del sistema
            </p>
          </div>
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-500">Error: {error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona y monitorea todos los eventos del sistema
          </p>
        </div>
        {hasNewEvents && (
          <div className="animate-bounce bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
            ¡Nuevos eventos disponibles!
          </div>
        )}
      </div>

      <div className="space-y-4">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          officeFilter={officeFilter}
          onOfficeFilterChange={setOfficeFilter}
          deviceFilter={deviceFilter}
          onDeviceFilterChange={setDeviceFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          offices={offices}
          devices={devices}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-lg text-muted-foreground">No se encontraron eventos</div>
            </div>
          ) : (
            currentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              />
            ))
          )}
        </div>

        {totalFilteredEvents > perPage && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalFilteredEvents)} de {totalFilteredEvents} eventos
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="order-1 sm:order-2"
            />
          </div>
        )}
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 
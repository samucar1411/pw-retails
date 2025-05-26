'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { getSuspectById, updateSuspect, uploadSuspectPhoto } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';

export default function EditSuspectPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspect, setSuspect] = useState<Partial<Suspect>>({});

  useEffect(() => {
    const fetchSuspect = async () => {
      try {
        const suspectId = Number(params.id);
        const data = await getSuspectById(suspectId);
        if (data) {
          setSuspect(data);
        } else {
          toast({
            title: 'Error',
            description: 'Suspect not found',
            variant: 'destructive',
          });
          router.push('/dashboard/sospechosos');
        }
      } catch (error) {
        console.error('Error fetching suspect:', error);
        toast({
          title: 'Error',
          description: 'Failed to load suspect data',
          variant: 'destructive',
        });
        router.push('/dashboard/sospechosos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuspect();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const updatedSuspect = await updateSuspect(Number(params.id), {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        identification_number: formData.get('identification_number') as string,
        date_of_birth: formData.get('date_of_birth') as string || undefined,
        gender: formData.get('gender') as string || undefined,
        email: formData.get('email') as string || undefined,
        phone_number: formData.get('phone_number') as string || undefined,
        address: formData.get('address') as string || undefined,
        city: formData.get('city') as string || undefined,
        postal_code: formData.get('postal_code') as string || undefined,
        country: formData.get('country') as string || undefined,
        alias: formData.get('alias') as string || undefined,
        physical_description: formData.get('physical_description') as string || undefined,
        notes: formData.get('notes') as string || undefined,
        status: formData.get('status') as string || 'active',
      });

      if (updatedSuspect) {
        // Handle photo upload if a new file was selected
        const photoFile = (formData.get('photo') as File)?.size > 0 
          ? formData.get('photo') as File 
          : null;
          
        if (photoFile) {
          try {
            await uploadSuspectPhoto(updatedSuspect.id, photoFile);
            toast({
              title: 'Success',
              description: 'Photo uploaded successfully',
              variant: 'default',
            });
          } catch (error) {
            console.error('Error uploading photo:', error);
            toast({
              title: 'Error',
              description: 'Failed to upload photo',
              variant: 'destructive',
            });
          }
        }

        toast({
          title: 'Success',
          description: 'Suspect updated successfully',
          variant: 'default',
        });
        
        router.push(`/dashboard/sospechosos/${updatedSuspect.id}`);
      } else {
        throw new Error('Failed to update suspect');
      }
    } catch (error) {
      console.error('Error updating suspect:', error);
      toast({
        title: 'Error',
        description: 'Failed to update suspect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/sospechosos/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Suspect</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Suspect Information</CardTitle>
          <CardDescription>Update the suspect&apos;s details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input 
                  id="first_name" 
                  name="first_name" 
                  required 
                  defaultValue={suspect.first_name}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  name="last_name" 
                  required 
                  defaultValue={suspect.last_name}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identification_number">ID Number *</Label>
                <Input 
                  id="identification_number" 
                  name="identification_number" 
                  required 
                  defaultValue={suspect.identification_number}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input 
                  id="date_of_birth" 
                  name="date_of_birth" 
                  type="date" 
                  defaultValue={suspect.date_of_birth?.split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" defaultValue={suspect.gender} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unspecified">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  name="status" 
                  defaultValue={suspect.status || 'active'} 
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={suspect.email}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input 
                    id="phone_number" 
                    name="phone_number" 
                    defaultValue={suspect.phone_number}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    defaultValue={suspect.address}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    defaultValue={suspect.city}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input 
                    id="postal_code" 
                    name="postal_code" 
                    defaultValue={suspect.postal_code}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    defaultValue={suspect.country}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Alias/Nickname</Label>
              <Input 
                id="alias" 
                name="alias" 
                defaultValue={suspect.alias}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="physical_description">Physical Description</Label>
              <Textarea
                id="physical_description"
                name="physical_description"
                rows={4}
                placeholder="Enter physical description details..."
                defaultValue={suspect.physical_description}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Enter any additional notes..."
                defaultValue={suspect.notes}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Update Photo</Label>
              <Input 
                id="photo" 
                name="photo" 
                type="file" 
                accept="image/*" 
                disabled={isSubmitting}
              />
              {suspect.photo_url && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Current photo:</p>
                  <div className="relative h-24 w-24 mt-2">
                    <Image
                      src={suspect.photo_url}
                      alt={`${suspect.first_name || ''} ${suspect.last_name || ''}`}
                      fill
                      className="rounded-md object-cover"
                      sizes="96px"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                onClick={() => router.push(`/dashboard/sospechosos/${params.id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

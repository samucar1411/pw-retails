'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { createSuspect } from '@/services/suspect-service';

export default function NewSuspectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await createSuspect({
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

      if (response) {
        toast({
          title: 'Success',
          description: 'Suspect created successfully',
          variant: 'default',
        });
        
        // Handle photo upload if a file was selected
        const photoFile = (formData.get('photo') as File)?.size > 0 
          ? formData.get('photo') as File 
          : null;
          
        if (photoFile) {
          try {
            await uploadSuspectPhoto(response.id, photoFile);
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
        
        router.push(`/dashboard/suspects/${response.id}`);
      } else {
        throw new Error('Failed to create suspect');
      }
    } catch (error) {
      console.error('Error creating suspect:', error);
      toast({
        title: 'Error',
        description: 'Failed to create suspect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/suspects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Suspect</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suspect Information</CardTitle>
          <CardDescription>Enter the suspect's details below.</CardDescription>
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  name="last_name" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identification_number">ID Number *</Label>
                <Input 
                  id="identification_number" 
                  name="identification_number" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input 
                  id="date_of_birth" 
                  name="date_of_birth" 
                  type="date" 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" disabled={isSubmitting}>
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
                <Select name="status" defaultValue="active" disabled={isSubmitting}>
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
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input 
                    id="phone_number" 
                    name="phone_number" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input 
                    id="postal_code" 
                    name="postal_code" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input 
                id="photo" 
                name="photo" 
                type="file" 
                accept="image/*" 
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                asChild
              >
                <Link href="/dashboard/suspects">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Suspect'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

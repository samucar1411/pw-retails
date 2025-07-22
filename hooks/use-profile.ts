import { useState } from 'react';
import { userService, UpdateProfileData } from '@/services/user-service';
import { User } from '@/types/user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProfile() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: () => userService.getCurrentUser(),
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return {
    profile,
    isLoadingProfile,
    updateProfile,
    isUpdating,
    error,
  };
} 
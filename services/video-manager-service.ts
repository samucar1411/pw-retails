import { VideoManager, VideoManagerCreateInput, VideoManagerUpdateInput } from '@/types/video-manager';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/videoManagers/';  // Updated to include /api prefix

export const videoManagerService = {
  getVideoManagers: async (): Promise<VideoManager[]> => {
    const response = await getResource<VideoManager[]>(ENDPOINT);
    return response.data;
  },

  getVideoManager: async (id: number): Promise<VideoManager> => {
    const response = await getResource<VideoManager>(ENDPOINT, id.toString());
    return response.data;
  },

  createVideoManager: async (data: VideoManagerCreateInput): Promise<VideoManager> => {
    const response = await createResource<VideoManager>(ENDPOINT, data);
    return response.data;
  },

  updateVideoManager: async (id: number, data: VideoManagerUpdateInput): Promise<VideoManager> => {
    const response = await updateResource<VideoManager>(ENDPOINT, id.toString(), data);
    return response.data;
  },

  deleteVideoManager: async (id: number): Promise<void> => {
    await deleteResource(ENDPOINT, id.toString());
  },
}; 
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ProfileState {
  recordProfileVisit: (profileId: string) => Promise<void>;
  getProfileStats: (profileId: string) => Promise<{
    totalLikes: number;
    totalViews: number;
    totalVideos: number;
  }>;
}

export const useProfileStore = create<ProfileState>(() => ({
  recordProfileVisit: async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === profileId) return; // Don't record self-visits

      await supabase.rpc('record_profile_visit', {
        p_profile_id: profileId,
        p_visitor_id: user.id
      });
    } catch (error) {
      console.error('Error recording profile visit:', error);
    }
  },

  getProfileStats: async (profileId: string) => {
    try {
      // Get total likes received
      const { data: likesData } = await supabase
        .from('likes')
        .select('id')
        .eq('content_type', 'video')
        .in('content_id', 
          supabase
            .from('videos')
            .select('id')
            .eq('user_id', profileId)
        );

      // Get total views
      const { data: viewsData } = await supabase
        .from('video_views')
        .select('id')
        .in('video_id',
          supabase
            .from('videos')
            .select('id')
            .eq('user_id', profileId)
        );

      // Get total videos
      const { count: totalVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      return {
        totalLikes: likesData?.length || 0,
        totalViews: viewsData?.length || 0,
        totalVideos: totalVideos || 0
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      return {
        totalLikes: 0,
        totalViews: 0,
        totalVideos: 0
      };
    }
  }
}));
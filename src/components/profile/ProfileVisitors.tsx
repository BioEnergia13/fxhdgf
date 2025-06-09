import React, { useState, useEffect } from 'react';
import { Eye, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ProfileVisitorsProps {
  profileId: string;
}

interface Visitor {
  id: string;
  username: string;
  avatar_url?: string;
  visited_at: string;
}

const ProfileVisitors: React.FC<ProfileVisitorsProps> = ({ profileId }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, [profileId]);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_visitors')
        .select(`
          visited_at,
          visitor:profiles!visitor_id(
            id,
            username,
            avatar_url
          )
        `)
        .eq('profile_id', profileId)
        .order('visited_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const visitorsList = data?.map(item => ({
        ...item.visitor,
        visited_at: item.visited_at
      })).filter(Boolean) || [];

      setVisitors(visitorsList);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Eye size={20} />
          <h3 className="font-semibold">Recent Visitors</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Eye size={20} />
          <h3 className="font-semibold">Recent Visitors</h3>
        </div>
        <div className="text-center py-4">
          <Eye size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm">No recent visitors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Eye size={20} />
        <h3 className="font-semibold">Recent Visitors</h3>
      </div>
      <div className="space-y-3">
        {visitors.map((visitor) => (
          <Link
            key={visitor.id}
            to={`/profile/${visitor.id}`}
            className="flex items-center space-x-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            {visitor.avatar_url ? (
              <img
                src={visitor.avatar_url}
                alt={visitor.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">@{visitor.username}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(visitor.visited_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileVisitors;
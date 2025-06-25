'use client';

import { useEffect, useState } from 'react';
import { RaceCard } from '@/components/match/RaceCard';
import { F1Race } from '@/lib/types/f1';
import { supabase } from '@/lib/supabase/client';

interface RecentActivityProps {
  username: string;
}

export function RecentActivity({ username }: RecentActivityProps) {
  const [loading, setLoading] = useState(true);
  const [recentRaces, setRecentRaces] = useState<F1Race[]>([]);

  useEffect(() => {
    async function loadRecentActivity() {
      try {
        // Get user ID first
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (!userData) return;

        // Get user's recent logs
        const { data: logs } = await supabase
          .from('logs')
          .select('match_id, watched_at')
          .eq('user_id', userData.id)
          .order('watched_at', { ascending: false })
          .limit(8);

        if (!logs?.length) {
          setRecentRaces([]);
          return;
        }

        // Get the corresponding races
        const { data: races } = await supabase
          .from('f1_races')
          .select('*')
          .in('race_id', logs.map(log => log.match_id))
          .order('race_date', { ascending: false });

        if (races) {
          setRecentRaces(races as F1Race[]);
        }
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setRecentRaces([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecentActivity();
  }, [username]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (recentRaces.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">No races watched yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentRaces.map((race) => (
          <RaceCard
            key={race.race_id}
            raceId={race.race_id}
            name={race.race_name}
            imageUrl={race.poster_url || ''}
            date={race.year.toString()}
            round={race.round}
            circuit={race.circuit}
          />
        ))}
      </div>
    </div>
  );
} 
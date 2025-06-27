'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserId } from '@/lib/auth/useUserId';

interface Notification {
  id: number;
  type: 'follow' | 'review_like' | 'friend_review_race';
  actor_id: string;
  race_id: number | null;
  review_id: number | null;
  created_at: string;
  read_at: string | null;
  data: {
    follower_username?: string;
    username?: string;
    race_name?: string;
  };
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const userId = useUserId();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications and setup real-time subscription
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    async function loadNotifications() {
      try {
        console.log('Loading notifications...');
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }
        
        console.log('Loaded notifications:', data);
        setNotifications(data || []);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Initial load
    loadNotifications();

    // Setup real-time subscription
    const channel = supabase.channel('notifications-' + userId)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Notification change received:', payload);
          
          // Refresh the entire notifications list to ensure consistency
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!error && data) {
            console.log('Updated notifications:', data);
            setNotifications(data);
          }
        }
      )
      .subscribe(async (status, err) => {
        console.log('Subscription status:', status, err);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        }
        if (err) {
          console.error('Subscription error:', err);
        }
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up notification subscription');
      channel.unsubscribe();
    };
  }, [userId]);

  // Mark notifications as read
  const markAsRead = async (ids: number[]) => {
    try {
      await supabase.rpc('mark_notifications_read', { notification_ids: ids });
      setNotifications(prev =>
        prev.map(n => ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead([notification.id]);
    }

    setIsOpen(false);

    if (notification.type === 'follow') {
      router.push(`/profile/${notification.data.follower_username}`);
    } else if (notification.type === 'review_like' || notification.type === 'friend_review_race') {
      router.push(`/races/${notification.race_id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `${notification.data.follower_username} followed you`;
      case 'review_like':
        return `${notification.data.username} liked your review of ${notification.data.race_name}`;
      case 'friend_review_race':
        return `${notification.data.username} also reviewed ${notification.data.race_name}`;
      default:
        return 'New notification';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => {
          console.log('Current notifications:', notifications);
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-hala-orange text-xs text-white text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-hala-blue-darker border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-medium text-white">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hala-orange mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors duration-200 border-b border-white/5 ${
                      !notification.read_at ? 'bg-white/5' : ''
                    }`}
                  >
                    <p className="text-sm text-white">
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => markAsRead(notifications.map(n => n.id))}
                className="text-sm text-hala-orange hover:text-hala-orange-dark"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
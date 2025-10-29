'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

type SpendingStreakProps = {
  userId: string;
};

export function SpendingStreak({ userId }: SpendingStreakProps) {
  const [streak, setStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(15);

  useEffect(() => {
    // TODO: Fetch actual streak data from Firestore
    const fetchStreak = async () => {
      // Mock data for now - replace with actual Firestore query
      // const userStreak = await getStreakData(userId);
      // setStreak(userStreak.current);
      // setLongestStreak(userStreak.longest);
    };
    
    fetchStreak();
  }, [userId]);

  const getStreakMessage = () => {
    if (streak === 0) return "Start your tracking journey today!";
    if (streak < 3) return "Keep it up!";
    if (streak < 7) return "You're on a roll!";
    if (streak < 14) return "Impressive streak!";
    if (streak < 30) return "You're crushing it!";
    return "Legendary dedication!";
  };

  const getStreakColor = () => {
    if (streak === 0) return "text-gray-400";
    if (streak < 7) return "text-orange-500";
    if (streak < 14) return "text-orange-600";
    return "text-red-500";
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getStreakColor()}`} />
          Tracking Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getStreakColor()}`}>
                {streak}
              </span>
              <span className="text-2xl text-gray-600">days</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{getStreakMessage()}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Longest: {longestStreak} days</span>
            </div>
          </div>
          <div className="text-6xl">
            {streak > 0 ? '🔥' : '📊'}
          </div>
        </div>
        
        {/* Progress to next milestone */}
        {streak > 0 && streak < 30 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Next milestone</span>
              <span>{streak < 7 ? '7 days' : streak < 14 ? '14 days' : '30 days'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(streak / (streak < 7 ? 7 : streak < 14 ? 14 : 30)) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Motivational message */}
        {streak === 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Log at least one transaction daily to build your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

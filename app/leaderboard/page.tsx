'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Zap,
  Crown,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LeaderboardSkill {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  slug: string;
  author: {
    name: string;
    avatar?: string;
  };
  stats: {
    installs: number;
    weeklyUsage: number;
    rating?: number;
    trend: 'up' | 'down' | 'stable';
  };
  category: string;
  description: string;
}

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState('daily');
  const [leaderboardSkills, setLeaderboardSkills] = useState<LeaderboardSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      const mockLeaderboard: LeaderboardSkill[] = [
        {
          id: '1',
          rank: 1,
          previousRank: 2,
          name: 'Literature Review Assistant',
          slug: 'literature-review',
          author: { name: 'Kael Team', avatar: '' },
          stats: {
            installs: 45230,
            weeklyUsage: 128500,
            rating: 4.9,
            trend: 'up'
          },
          category: 'Academic',
          description: 'Comprehensive literature review with citation management'
        },
        {
          id: '2',
          rank: 2,
          previousRank: 1,
          name: 'Smart Flashcards',
          slug: 'smart-flashcards',
          author: { name: 'EduTools', avatar: '' },
          stats: {
            installs: 38900,
            weeklyUsage: 115000,
            rating: 4.8,
            trend: 'down'
          },
          category: 'Academic',
          description: 'AI-powered flashcard generation with spaced repetition'
        },
        {
          id: '3',
          rank: 3,
          previousRank: 3,
          name: 'Code Review Pro',
          slug: 'code-review',
          author: { name: 'DevTools Inc', avatar: '' },
          stats: {
            installs: 32100,
            weeklyUsage: 98000,
            rating: 4.7,
            trend: 'stable'
          },
          category: 'Programming',
          description: 'Automated code review with best practices'
        },
        {
          id: '4',
          rank: 4,
          previousRank: 6,
          name: 'Data Analysis Wizard',
          slug: 'data-analysis',
          author: { name: 'DataLab', avatar: '' },
          stats: {
            installs: 28700,
            weeklyUsage: 89000,
            rating: 4.8,
            trend: 'up'
          },
          category: 'Programming',
          description: 'Statistical analysis and visualization from datasets'
        },
        {
          id: '5',
          rank: 5,
          previousRank: 4,
          name: 'Mind Map Generator',
          slug: 'mind-mapper',
          author: { name: 'CreativeTools', avatar: '' },
          stats: {
            installs: 25600,
            weeklyUsage: 78000,
            rating: 4.6,
            trend: 'down'
          },
          category: 'Academic',
          description: 'Visual mind maps from any content'
        },
      ];

      // Add more skills for a fuller leaderboard
      for (let i = 6; i <= 20; i++) {
        mockLeaderboard.push({
          id: i.toString(),
          rank: i,
          previousRank: i + (Math.random() > 0.5 ? 1 : -1),
          name: `Skill #${i}`,
          slug: `skill-${i}`,
          author: { name: `Author ${i}`, avatar: '' },
          stats: {
            installs: Math.floor(Math.random() * 20000) + 5000,
            weeklyUsage: Math.floor(Math.random() * 50000) + 10000,
            rating: +(Math.random() * 2 + 3).toFixed(1),
            trend: Math.random() > 0.66 ? 'up' : Math.random() > 0.33 ? 'down' : 'stable'
          },
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `Description for skill ${i}`
        });
      }

      setLeaderboardSkills(mockLeaderboard);
      setLoading(false);
    }, 500);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getTrendIcon = (skill: LeaderboardSkill) => {
    if (!skill.previousRank) return null;

    if (skill.rank < skill.previousRank) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span className="text-xs">{skill.previousRank - skill.rank}</span>
        </div>
      );
    } else if (skill.rank > skill.previousRank) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span className="text-xs">{skill.rank - skill.previousRank}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-3 w-3" />
        </div>
      );
    }
  };

  const categories = [
    'Job Hunting',
    'Health & Lifestyle',
    'Academic',
    'Business',
    'Programming',
    'Marketing',
    'Image Generator',
    'Prompt Generator',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Skills Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the most popular and trending skills in the marketplace
          </p>
        </div>

        {/* Time Range Tabs */}
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top 3 Winners */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {leaderboardSkills.slice(0, 3).map((skill, index) => (
                    <Card
                      key={skill.id}
                      className={cn(
                        "relative overflow-hidden transition-all hover:shadow-xl",
                        index === 0 && "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50",
                        index === 1 && "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50",
                        index === 2 && "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
                      )}
                    >
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-3">
                          {getRankIcon(skill.rank)}
                        </div>
                        <CardTitle className="text-xl">{skill.name}</CardTitle>
                        <CardDescription>by {skill.author.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex justify-center gap-4 mb-4">
                          <div>
                            <p className="text-2xl font-bold">{(skill.stats.installs / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-muted-foreground">Installs</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{(skill.stats.weeklyUsage / 1000).toFixed(0)}k</p>
                            <p className="text-xs text-muted-foreground">Weekly Uses</p>
                          </div>
                        </div>
                        <Link href={`/skills/${skill.slug}`}>
                          <Button className="w-full" variant={index === 0 ? "default" : "outline"}>
                            View Skill
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Full Leaderboard */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Full Rankings</CardTitle>
                    <CardDescription>
                      Top performing skills based on usage and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {leaderboardSkills.map((skill) => (
                        <Link key={skill.id} href={`/skills/${skill.slug}`}>
                          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Rank */}
                              <div className="w-12 flex justify-center">
                                {skill.rank <= 3 ? getRankIcon(skill.rank) : (
                                  <span className="text-lg font-bold text-muted-foreground">
                                    {skill.rank}
                                  </span>
                                )}
                              </div>

                              {/* Trend */}
                              <div className="w-12">
                                {getTrendIcon(skill)}
                              </div>

                              {/* Skill Info */}
                              <div className="flex-1">
                                <p className="font-medium group-hover:text-primary transition-colors">
                                  {skill.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {skill.description}
                                </p>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{(skill.stats.installs / 1000).toFixed(1)}k</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="h-4 w-4 text-muted-foreground" />
                                  <span>{(skill.stats.weeklyUsage / 1000).toFixed(0)}k/wk</span>
                                </div>
                                {skill.stats.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{skill.stats.rating}</span>
                                  </div>
                                )}
                              </div>

                              {/* Category */}
                              <Badge variant="outline">{skill.category}</Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

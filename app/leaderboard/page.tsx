'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SkillCardNew from '@/components/SkillCardNew';
import { Skill, SkillCategory } from '@/types/skill';
import {
  Search,
  Filter,
  Trophy,
  Loader2,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const categories: SkillCategory[] = [
  'Career',
  'Health',
  'Academic',
  'Business',
  'Programming',
  'Marketing',
  'Image',
  'Prompt',
];

const timeRanges = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'All Time', value: 'all' }
];

export default function LeaderboardPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTimeRange, selectedCategory]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      const params = new URLSearchParams();
      params.append('sort', 'popular');
      params.append('limit', '24');
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/skills?${params}`);
      const data = await response.json();

      // Add ranking to skills
      const rankedSkills = data.skills.map((skill: Skill, index: number) => ({
        ...skill,
        rank: index + 1
      }));

      setSkills(rankedSkills);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    // Only show badges for top 10
    if (rank > 10) return null;

    if (rank === 1) {
      return (
        <div className="absolute -top-2 -left-2 z-20 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
          1
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="absolute -top-2 -left-2 z-20 bg-gradient-to-br from-gray-300 to-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
          2
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="absolute -top-2 -left-2 z-20 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
          3
        </div>
      );
    } else {
      return (
        <div className="absolute -top-2 -left-2 z-20 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
          {rank}
        </div>
      );
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (searchQuery) {
      return skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             skill.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 lg:px-6 xl:px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-full">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Top Ranked Skills</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover the most popular and trending AI skills in our marketplace
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">10,000+ Skills</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="font-medium">Updated Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Real-time Rankings</span>
            </div>
          </div>
        </div>
        {/* Decorative wave - responsive */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="relative block w-full h-12">
            <path fill="rgb(249 250 251)" fillOpacity="1" d="M0,30 C400,60 800,0 1200,30 L1200,60 L0,60 Z"></path>
          </svg>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white">
        <div className="px-4 lg:px-6 xl:px-8 py-5">
          <h2 className="text-2xl font-bold text-gray-900">Top Ranked</h2>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white sticky top-0 z-40">
        <div className="px-4 lg:px-6 xl:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Buttons - Visible and clickable */}
            <div className="flex items-center gap-2">
              {timeRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    selectedTimeRange === range.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px] bg-gray-50">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-gray-300 transition-colors"
              />
            </div>

            {/* All Filters Button */}
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 hidden sm:flex">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              All Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 xl:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-100 p-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 lg:gap-4">
              {filteredSkills.map((skill: any) => (
                <div key={skill.id} className="relative">
                  {/* Add padding wrapper to prevent badge from covering content */}
                  <div className="pt-3">
                    {getRankBadge(skill.rank)}
                    <SkillCardNew
                      skill={skill}
                      onUseSkill={() => {
                        toast({
                          title: 'Opening in Kael',
                          description: `Loading ${skill.name} in Kael chat...`,
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                size="lg"
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Load More
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
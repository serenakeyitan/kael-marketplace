'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SkillCardNew from '@/components/SkillCardNew';
import SkillAnalyticsChart from '@/components/SkillAnalyticsChart';
import { Skill, SkillCategory } from '@/types/skill';
import {
  Search,
  Filter,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Flame,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const useCaseCategories: SkillCategory[] = [
  'Career',
  'Health',
  'Academic',
  'Business',
  'Programming',
  'Marketing',
  'Image',
  'Prompt',
];

const categories = ['For you', ...useCaseCategories] as const;
type CategoryFilter = (typeof categories)[number];

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('trending');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('For you');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'For you') params.append('category', selectedCategory);

      // Different sorting based on tab
      if (selectedTab === 'trending') {
        params.append('sort', 'usage');
      } else if (selectedTab === 'recent') {
        params.append('sort', 'new');
      } else if (selectedTab === 'top') {
        params.append('sort', 'popular');
      } else {
        params.append('sort', 'popular');
      }

      params.append('page', '1');
      params.append('limit', '12');

      const response = await fetch(`/api/skills?${params}`);
      const data = await response.json();

      setSkills(data.skills);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skills. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedTab, toast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Analytics Chart - Full width section */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 lg:px-6 xl:px-8 py-3">
          <SkillAnalyticsChart />
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 lg:px-6 xl:px-8">
          {/* Category Pills */}
          <div className="pt-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all",
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar and Time Filters Row */}
          <div className="pb-4">
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search AI skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-gray-300 transition-colors"
                />
              </div>

              {/* Time/Trending Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTab('trending')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                    selectedTab === 'trending'
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Flame className="h-3.5 w-3.5" />
                  Trending
                </button>
                <button
                  onClick={() => setSelectedTab('recent')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                    selectedTab === 'recent'
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Recent
                </button>
                <button
                  onClick={() => setSelectedTab('top')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                    selectedTab === 'top'
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Top Rated
                </button>
                <button
                  onClick={() => setSelectedTab('most-used')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                    selectedTab === 'most-used'
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Most Used
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 lg:px-6 xl:px-8 py-6">
        <div>
          {/* Active Filters Display */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Showing:</span>
            <span className="font-medium text-gray-900">{selectedCategory}</span>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-900">
              {selectedTab === 'trending' && 'Trending'}
              {selectedTab === 'recent' && 'Recently Added'}
              {selectedTab === 'top' && 'Top Rated'}
              {selectedTab === 'most-used' && 'Most Used'}
            </span>
            {searchQuery && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Search: "{searchQuery}"</span>
              </>
            )}
          </div>

          {/* Skills Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-gray-100 p-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 lg:gap-4">
                {skills.map(skill => (
                  <SkillCardNew
                    key={skill.id}
                    skill={skill}
                    onUseSkill={() => {
                      toast({
                        title: 'Opening in Kael',
                        description: `Loading ${skill.name} in Kael chat...`,
                      });
                    }}
                  />
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
    </div>
  );
}

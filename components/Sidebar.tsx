'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Trophy,
  Gift,
  Plus,
  User,
  Sparkles,
  Clock,
  Heart,
  ArrowUpRight,
  Upload,
  Code2,
  FileArchive,
  Image,
  Loader2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@daveyplate/better-auth-ui';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import AddNewSkillModal from '@/components/AddNewSkillModal';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Explore', href: '/', icon: Home },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Bounty', href: '/bounty', icon: Gift },
];

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCreator, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  // Real recent and favorites data
  const [recentSkills, setRecentSkills] = useState<any[]>([]);
  const [favoriteSkills, setFavoriteSkills] = useState<any[]>([]);

  // Load recent skills from database and favorites
  useEffect(() => {
    const loadRecentSkills = async () => {
      // First try to load from database
      try {
        const response = await fetch('/api/recent-skills');
        if (response.ok) {
          const data = await response.json();
          if (data.skills && data.skills.length > 0) {
            setRecentSkills(data.skills.slice(0, 3)); // Only show top 3
            return;
          }
        }
      } catch (error) {
        console.error('Error loading recent skills from database:', error);
      }

      // Fall back to localStorage for anonymous users or if database fails
      const stored = localStorage.getItem('recentSkills');
      if (stored) {
        try {
          const skills = JSON.parse(stored);
          setRecentSkills(skills.slice(0, 3)); // Only show top 3
        } catch (e) {
          console.error('Error loading recent skills from localStorage:', e);
        }
      }
    };

    const loadFavoriteSkills = async () => {
      // First try to load from database
      try {
        const response = await fetch('/api/liked-skills');
        if (response.ok) {
          const data = await response.json();
          if (data.skills && data.skills.length > 0) {
            setFavoriteSkills(data.skills);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading favorite skills from database:', error);
      }

      // Fall back to localStorage for anonymous users or if database fails
      const likedSkillIds = JSON.parse(localStorage.getItem('likedSkills') || '[]');
      if (likedSkillIds.length > 0) {
        try {
          // Fetch skill details for liked skills
          const response = await fetch('/api/skills?limit=100');
          if (response.ok) {
            const data = await response.json();
            const likedSkillsData = data.skills.filter((skill: any) =>
              likedSkillIds.includes(skill.id)
            );
            setFavoriteSkills(likedSkillsData);
          }
        } catch (error) {
          console.error('Error loading favorite skills from localStorage:', error);
        }
      }
    };

    loadRecentSkills();
    loadFavoriteSkills();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadRecentSkills();
      loadFavoriteSkills();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('skillsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('skillsUpdated', handleStorageChange);
    };
  }, []);

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to create a skill');
      return;
    }
    setIsAddSkillModalOpen(true);
  };

  return (
    <div className={cn("h-full flex flex-col bg-gray-50 border-r", className)}>
      {/* Logo */}
      <div className="p-4 border-b bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">KAEL</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Main Nav */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isCreator && (
            <button
              onClick={handleCreateClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </button>
          )}
        </div>

        {/* Create Skill Button - Highlighted */}
        <div className="mt-4 px-3">
          <Button
            onClick={handleCreateClick}
            className="w-full justify-between bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span>Create</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Quick Actions */}
        <div className="space-y-1">
          <Link
            href="/my-skills"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === '/my-skills'
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>My Skills</span>
          </Link>

          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === '/profile'
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Recent Activity - Only show 3 */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent
          </h3>
          <div className="space-y-1">
            {recentSkills.length > 0 ? (
              recentSkills.slice(0, 3).map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.slug}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{skill.name}</span>
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-gray-400 italic">No recent skills</p>
            )}
          </div>
        </div>

        {/* Favorites - Scrollable */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Favorites
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {favoriteSkills.length > 0 ? (
              favoriteSkills.map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.slug}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="truncate">{skill.name}</span>
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-gray-400 italic">No favorite skills</p>
            )}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t bg-white">
        <SignedIn>
          <UserButton
            size="default"
            variant="ghost"
            className="w-full justify-between rounded-lg hover:bg-gray-50"
            align="start"
            side="top"
            sideOffset={8}
          />
        </SignedIn>
        <SignedOut>
          <Link href="/auth/sign-in" className="block">
            <Button
              variant="ghost"
              className="w-full justify-between rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Sign in</span>
            </Button>
          </Link>
        </SignedOut>
      </div>

      {/* Add New Skill Modal */}
      <AddNewSkillModal
        open={isAddSkillModalOpen}
        onOpenChange={setIsAddSkillModalOpen}
      />
    </div>
  );
}

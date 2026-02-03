'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Trophy,
  Gift,
  Plus,
  Settings,
  LogOut,
  User,
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  ExternalLink,
  ArrowUpRight,
  Upload,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const { user, isCreator } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleContinue = () => {
    window.open('https://kael.im/create', '_blank');
    setShowCreateDialog(false);
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
            <Link
              href="/create"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === '/create'
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Link>
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

        {/* Recent Activity */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="truncate">Literature Review</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="truncate">Code Assistant</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="truncate">Data Analysis</span>
            </button>
          </div>
        </div>

        {/* Favorites */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Favorites
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="truncate">Smart Flashcards</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="truncate">Mind Mapper</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Skill Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a New Skill</DialogTitle>
            <DialogDescription className="pt-2">
              Choose how you want to add a skill to the marketplace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Create New Skill Option */}
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                 onClick={handleContinue}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                  <Code2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Create from Scratch</h3>
                  <p className="text-sm text-gray-600">
                    Build a new AI-powered skill using Kael.im's development environment with guided templates and AI assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Existing Skill Option */}
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                 onClick={() => {
                   // Handle upload action
                   window.open('https://kael.im/upload', '_blank');
                   setShowCreateDialog(false);
                 }}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Existing Skill</h3>
                  <p className="text-sm text-gray-600">
                    Import a skill you've already built. Supports JSON, YAML, and ZIP formats for easy migration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-900">
              Tip: Skills created on Kael.im are automatically optimized for better performance and user experience.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Code2,
  FileArchive,
  Image,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  const router = useRouter();
  const { user, isCreator } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedZip, setUploadedZip] = useState<File | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Mock recent and favorites data - connected to API
  const [recentSkills] = useState([
    { id: '1', name: 'Literature Review', slug: 'literature-review' },
    { id: '2', name: 'Code Reviewer', slug: 'code-reviewer' },
    { id: '3', name: 'Data Analysis', slug: 'data-analysis' }
  ]);

  const [favoriteSkills] = useState([
    { id: '1', name: 'Flashcards', slug: 'flashcards' },
    { id: '2', name: 'Mind Mapper', slug: 'mind-mapper' },
    { id: '3', name: 'Essay Assistant', slug: 'essay-assistant' },
    { id: '4', name: 'Code Reviewer', slug: 'code-reviewer' },
    { id: '5', name: 'Quiz Generator', slug: 'quiz-generator' },
    { id: '6', name: 'Creative Writing', slug: 'creative-writing' },
    { id: '7', name: 'Citation Checker', slug: 'citation-checker' },
    { id: '8', name: 'Business Plan', slug: 'business-plan' }
  ]);

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  // Removed handleContinue since Create from Scratch is now completely disabled

  const handleUploadClick = () => {
    setShowCreateDialog(false);
    setShowUploadDialog(true);
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadedZip(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a ZIP file',
        variant: 'destructive',
      });
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
      setUploadedBanner(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitUpload = async () => {
    if (!uploadedZip) {
      toast({
        title: 'Missing file',
        description: 'Please upload a ZIP file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      toast({
        title: 'Success!',
        description: 'Your skill has been uploaded successfully',
      });
      setShowUploadDialog(false);
      setUploadedZip(null);
      setUploadedBanner(null);
      setIsUploading(false);
      router.push('/my-skills?tab=uploaded');
    }, 2000);
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

        {/* Recent Activity - Only show 3 */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent
          </h3>
          <div className="space-y-1">
            {recentSkills.slice(0, 3).map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.slug}`}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="truncate">{skill.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Favorites - Scrollable */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Favorites
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {favoriteSkills.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.slug}`}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Heart className="h-4 w-4 text-red-400" />
                <span className="truncate">{skill.name}</span>
              </Link>
            ))}
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
            {/* Create New Skill Option - DISABLED */}
            <div className="p-4 border rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Code2 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-500">Create from Scratch</h3>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-500">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    Build a new AI-powered skill using Kael.im's development environment with guided templates and AI assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Existing Skill Option */}
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                 onClick={handleUploadClick}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Existing Skill</h3>
                  <p className="text-sm text-gray-600">
                    Import a skill you've already built. Only ZIP format is supported for skill packages.
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

      {/* Upload Skill Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Your Skill</DialogTitle>
            <DialogDescription className="pt-2">
              Upload your skill package and optionally add a banner image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* ZIP Upload */}
            <div className="space-y-2">
              <Label htmlFor="zip-upload" className="text-sm font-medium">
                Skill Package (ZIP) <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => zipInputRef.current?.click()}
                >
                  <input
                    ref={zipInputRef}
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="hidden"
                  />
                  <FileArchive className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  {uploadedZip ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">{uploadedZip.name}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(uploadedZip.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">Drop your ZIP file here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Only ZIP format is allowed. Maximum file size: 50MB
                </p>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label htmlFor="banner-upload" className="text-sm font-medium">
                Banner Image (Optional)
              </Label>
              <div className="space-y-2">
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <input
                    ref={bannerInputRef}
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  {uploadedBanner ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">{uploadedBanner.name}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(uploadedBanner.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">Add a banner image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended dimensions: 1200x630px for best display
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setUploadedZip(null);
                setUploadedBanner(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpload}
              disabled={!uploadedZip || isUploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Skill
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlugFromFilename } from '@/lib/slug-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SkillCategory } from '@/types/skill';
import {
  Upload,
  Code2,
  FileArchive,
  Trophy,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  CheckCircle,
  Github,
} from 'lucide-react';

interface AddNewSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedBounty?: string;
}

const categories: SkillCategory[] = [
  'productivity',
  'creative',
  'development',
  'research',
  'communication',
  'education',
  'entertainment',
  'other',
];

// Helper function to format category names for display
const formatCategoryDisplay = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const mockBounties = [
  { id: '1', name: 'AI Research Assistant - $5000' },
  { id: '2', name: 'Code Generation Challenge - $4000' },
  { id: '3', name: 'Creative Content Tools - $3500' },
];

export default function AddNewSkillModal({
  open,
  onOpenChange,
  preSelectedBounty
}: AddNewSkillModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Form state for upload dialog
  const [uploadedZip, setUploadedZip] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [isPublished, setIsPublished] = useState(true);
  const [participateInBounty, setParticipateInBounty] = useState(!!preSelectedBounty);
  const [selectedBounty, setSelectedBounty] = useState(preSelectedBounty || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
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

  const handleSubmitUpload = async () => {
    // Validation
    if (!uploadedZip) {
      toast({
        title: 'Missing file',
        description: 'Please upload a ZIP file containing your skill',
        variant: 'destructive',
      });
      return;
    }

    if (participateInBounty && !selectedBounty) {
      toast({
        title: 'Bounty required',
        description: 'Please select a bounty to participate in',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate skill creation from ZIP
      const skillData = {
        name: uploadedZip.name.replace('.zip', '') || 'New Skill',
        slug: generateSlugFromFilename(uploadedZip.name) || 'new-skill',
        shortDescription: 'Uploaded skill from ZIP file',
        longDescription: 'This skill was uploaded from a ZIP file containing all necessary components.',
        category: selectedCategory || 'education',
        audienceTags: ['All users'],
        demoPrompt: 'Try out this uploaded skill',
        examples: ['Example usage of the skill'],
        version: '1.0.0',
        bountyId: participateInBounty ? selectedBounty : undefined,
        status: isPublished ? 'published' : 'private',
        githubUrl: githubUrl || undefined,
      };

      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillData),
      });

      if (response.ok) {
        const result = await response.json();

        // Signal that skills have been updated
        localStorage.setItem('skillsUpdated', 'true');

        let successMessage = '';

        // Check if slug was modified
        if (result.slugModified) {
          successMessage = participateInBounty
            ? `Skill uploaded as "${result.finalSlug}" and entered into bounty! (name adjusted for uniqueness)`
            : `Skill uploaded successfully as "${result.finalSlug}"! (name adjusted for uniqueness)`;
        } else {
          successMessage = participateInBounty
            ? 'Skill uploaded and entered into bounty competition!'
            : 'Skill uploaded successfully!';
        }

        toast({
          title: 'Success!',
          description: successMessage,
          duration: result.slugModified ? 6000 : 4000, // Show longer if slug was modified
        });

        resetForm();
        onOpenChange(false);

        // Navigate to the created skill page
        if (result.skill?.slug) {
          router.push(`/skills/${result.skill.slug}`);
        } else {
          router.push('/my-skills?tab=uploaded');
        }
      } else if (response.status === 409) {
        const error = await response.json();
        toast({
          title: 'Name Conflict',
          description: error.error || 'A skill with this name already exists. Please choose a different name.',
          variant: 'destructive',
        });
      } else if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to create skills.',
          variant: 'destructive',
        });
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to create skill' }));
        throw new Error(error.error || 'Failed to create skill');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload skill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setShowUploadDialog(false);
    setUploadedZip(null);
    setSelectedCategory('');
    setGithubUrl('');
    setIsPublished(true);
    setParticipateInBounty(!!preSelectedBounty);
    setSelectedBounty(preSelectedBounty || '');
  };

  return (
    <>
      {/* Step 1: Choose Option Modal */}
      <Dialog open={open && !showUploadDialog} onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}>
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2: Upload Skill Dialog with Metadata */}
      <Dialog open={showUploadDialog} onOpenChange={(newOpen) => {
        if (!newOpen) {
          setShowUploadDialog(false);
          setUploadedZip(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Your Skill</DialogTitle>
            <DialogDescription className="pt-2">
              Upload your skill package and configure its settings
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
                      <p className="text-xs text-gray-500">{(uploadedZip.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Click to upload ZIP file</p>
                      <p className="text-xs text-gray-500 mt-1">Contains skill configuration and assets</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category for your skill" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategoryDisplay(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Help users discover your skill by selecting a relevant category
              </p>
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github-url" className="text-sm font-medium">
                GitHub Repository (Optional)
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="github-url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Link to your skill's source code repository
              </p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {isPublished ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  Visibility
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPublished
                    ? 'Your skill will be visible in the marketplace'
                    : 'Your skill will be private (only you can see it)'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(checked as boolean)}
                />
                <Label htmlFor="publish" className="cursor-pointer">
                  Publish to marketplace
                </Label>
              </div>
            </div>

            {/* Bounty Participation */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bounty"
                  checked={participateInBounty}
                  onCheckedChange={(checked) => {
                    setParticipateInBounty(checked as boolean);
                    if (!checked) setSelectedBounty('');
                  }}
                />
                <Label htmlFor="bounty" className="cursor-pointer flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  Participate in a bounty
                </Label>
              </div>

              {participateInBounty && (
                <div className="ml-6 space-y-2">
                  <Select value={selectedBounty} onValueChange={setSelectedBounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bounty track (required)" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBounties.map((bounty) => (
                        <SelectItem key={bounty.id} value={bounty.id}>
                          {bounty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Your skill will be entered into the selected competition
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setUploadedZip(null);
              }}
              disabled={isUploading}
            >
              Back
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
    </>
  );
}
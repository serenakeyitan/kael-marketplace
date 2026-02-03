'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SkillCategory, AudienceTag } from '@/types/skill';
import {
  Plus,
  X,
  Upload,
  Code,
  Users,
  Tag,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
} from 'lucide-react';

const categories: SkillCategory[] = [
  'Job Hunting',
  'Health & Lifestyle',
  'Academic',
  'Business',
  'Programming',
  'Marketing',
  'Image Generator',
  'Prompt Generator',
];

const audienceTags: AudienceTag[] = [
  // Students
  'Exam-focused students',
  'Coursework-heavy students',
  'Cram / test-prep students',
  'Graduate students',
  'Undergraduate students',
  // Researchers
  'PhD students',
  'Academic researchers',
  'Literature review focused users',
  'Data scientists',
  // Educators
  'Teachers',
  'Professors',
  'Teaching assistants',
  'Course designers',
  // Professionals
  'Consultants',
  'Analysts',
  'Knowledge workers',
  'Writers',
  'Engineers',
  'Product managers',
  // Creators
  'Indie builders',
  'Content creators',
  'Tool makers',
  'Open source contributors',
];

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  shortDescription: z.string()
    .min(10, 'Short description must be at least 10 characters')
    .max(100, 'Short description must be less than 100 characters'),
  longDescription: z.string()
    .min(50, 'Long description must be at least 50 characters')
    .max(1000, 'Long description must be less than 1000 characters'),
  category: z.enum(categories as [string, ...string[]]),
  audienceTags: z.array(z.string()).min(1, 'Select at least one audience tag').max(5, 'Select up to 5 audience tags'),
  demoPrompt: z.string().min(10, 'Demo prompt must be at least 10 characters'),
  examples: z.array(z.string()).min(1, 'Add at least one example').max(5, 'Add up to 5 examples'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z'),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateSkillPage() {
  const router = useRouter();
  const { user, isCreator } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentExample, setCurrentExample] = useState('');
  const [currentTab, setCurrentTab] = useState('basic');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      longDescription: '',
      category: 'Academic',
      audienceTags: [],
      demoPrompt: '',
      examples: [],
      version: '1.0.0',
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success!',
          description: 'Your skill has been created successfully.',
        });
        router.push('/my-skills?tab=uploaded');
      } else {
        throw new Error('Failed to create skill');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create skill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExample = () => {
    if (currentExample.trim()) {
      const currentExamples = form.getValues('examples');
      if (currentExamples.length < 5) {
        form.setValue('examples', [...currentExamples, currentExample.trim()]);
        setCurrentExample('');
      }
    }
  };

  const handleRemoveExample = (index: number) => {
    const currentExamples = form.getValues('examples');
    form.setValue('examples', currentExamples.filter((_, i) => i !== index));
  };

  const handleTagToggle = (tag: AudienceTag) => {
    const currentTags = form.getValues('audienceTags');
    if (currentTags.includes(tag)) {
      form.setValue('audienceTags', currentTags.filter(t => t !== tag));
    } else if (currentTags.length < 5) {
      form.setValue('audienceTags', [...currentTags, tag]);
    }
  };

  if (!isCreator) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Creator Mode Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to switch to Creator mode to upload skills
            </p>
            <Button onClick={() => router.push('/my-skills')}>
              Go to My Skills
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Skill</h1>
        <p className="text-muted-foreground">
          Share your expertise with the Kael community by creating a new skill
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your skill
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Literature Review Assistant"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('name'))) {
                                form.setValue('slug', generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive name for your skill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., literature-review-assistant" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used in the skill's URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief one-line description of what your skill does"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This appears in skill cards and search results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of your skill's capabilities and benefits..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a comprehensive overview of your skill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the category that best fits your skill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use semantic versioning (major.minor.patch)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                  <CardDescription>
                    Select who would benefit most from your skill (max 5 tags)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="audienceTags"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            {/* Selected Tags */}
                            {field.value.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                                {field.value.map((tag) => (
                                  <Badge key={tag} variant="default">
                                    {tag}
                                    <X
                                      className="ml-1 h-3 w-3 cursor-pointer"
                                      onClick={() => handleTagToggle(tag as AudienceTag)}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Tag Groups */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-3">Students</h4>
                                <div className="flex flex-wrap gap-2">
                                  {audienceTags.filter(tag => tag.includes('student') || tag.includes('Cram')).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant={field.value.includes(tag) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-colors"
                                      onClick={() => handleTagToggle(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Researchers</h4>
                                <div className="flex flex-wrap gap-2">
                                  {audienceTags.filter(tag => tag.includes('PhD') || tag.includes('researcher') || tag.includes('Literature') || tag.includes('Data scientist')).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant={field.value.includes(tag) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-colors"
                                      onClick={() => handleTagToggle(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Educators</h4>
                                <div className="flex flex-wrap gap-2">
                                  {audienceTags.filter(tag => tag.includes('Teacher') || tag.includes('Professor') || tag.includes('Teaching') || tag.includes('Course')).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant={field.value.includes(tag) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-colors"
                                      onClick={() => handleTagToggle(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Professionals</h4>
                                <div className="flex flex-wrap gap-2">
                                  {audienceTags.filter(tag => tag.includes('Consultant') || tag.includes('Analyst') || tag.includes('Knowledge') || tag.includes('Writer') || tag.includes('Engineer') || tag.includes('Product manager')).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant={field.value.includes(tag) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-colors"
                                      onClick={() => handleTagToggle(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Creators</h4>
                                <div className="flex flex-wrap gap-2">
                                  {audienceTags.filter(tag => tag.includes('builder') || tag.includes('creator') || tag.includes('maker') || tag.includes('contributor')).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant={field.value.includes(tag) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-colors"
                                      onClick={() => handleTagToggle(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demo & Examples</CardTitle>
                  <CardDescription>
                    Help users understand how to use your skill
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="demoPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Help me conduct a literature review on machine learning in healthcare"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a sample prompt that showcases your skill's capabilities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="examples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Example Use Cases</FormLabel>
                        <FormDescription>
                          Add 1-5 examples of how users can use your skill
                        </FormDescription>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter an example use case..."
                              value={currentExample}
                              onChange={(e) => setCurrentExample(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddExample();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleAddExample}
                              disabled={field.value.length >= 5}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {field.value.length > 0 && (
                            <div className="space-y-2">
                              {field.value.map((example, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-400">
                                    {index + 1}
                                  </span>
                                  <span className="flex-1 text-sm">{example}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleRemoveExample(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Skill</CardTitle>
                  <CardDescription>
                    Make sure everything looks good before creating your skill
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{form.watch('name') || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slug:</span>
                        <span className="font-medium">{form.watch('slug') || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{form.watch('category')}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-medium">{form.watch('version')}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {form.watch('shortDescription') || 'No short description provided'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('longDescription') || 'No long description provided'}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('audienceTags').length > 0 ? (
                        form.watch('audienceTags').map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No audience tags selected</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Examples ({form.watch('examples').length})</h4>
                    {form.watch('examples').length > 0 ? (
                      <ul className="space-y-1">
                        {form.watch('examples').map((example, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">No examples provided</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab('basic')}
                  >
                    Back to Edit
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Create Skill
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

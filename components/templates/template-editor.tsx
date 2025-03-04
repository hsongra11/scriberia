'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Template } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateCategory } from '@/lib/templates/default-templates';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Markdown } from '@/components/markdown';

interface TemplateEditorProps {
  template?: Partial<Template>;
  onSave: (templateData: {
    name: string;
    description: string;
    content: string;
    category: TemplateCategory;
  }) => void;
  onCancel?: () => void;
  saving?: boolean;
}

export function TemplateEditor({
  template,
  onSave,
  onCancel,
  saving = false,
}: TemplateEditorProps) {
  const initialData = {
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    category: (template?.category as TemplateCategory) || 'custom',
  };

  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<string>('edit');
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as TemplateCategory }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return; // Don't submit if name is empty
    }
    
    onSave(formData);
  };
  
  const categories: { value: TemplateCategory; label: string }[] = [
    { value: 'brain-dump', label: 'Brain Dump' },
    { value: 'journal', label: 'Journal' },
    { value: 'to-do', label: 'To-Do' },
    { value: 'mood-tracking', label: 'Mood Tracking' },
    { value: 'custom', label: 'Custom' },
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {template?.id ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Template Name</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this template"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Template Content</label>
            <p className="text-xs text-muted-foreground mb-2">
              Use Markdown formatting. You can use placeholders like {'{{date}}'} or {'{{title}}'} that will be replaced when creating a note.
            </p>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="border rounded-md mt-2">
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="# Note Title&#10;&#10;Your content here..."
                  className="min-h-[200px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview" className="border rounded-md p-4 min-h-[200px] mt-2">
                {formData.content ? (
                  <Markdown>{formData.content}</Markdown>
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    Preview will appear here
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={saving || !formData.name.trim()}
          >
            {saving ? 'Saving...' : (template?.id ? 'Update Template' : 'Create Template')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 
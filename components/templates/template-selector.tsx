'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Template } from '@/lib/db/schema';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { TemplateCategory } from '@/lib/templates/default-templates';

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (templateId: string, title: string) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export function TemplateSelector({
  templates,
  onSelect,
  trigger,
  title = 'Choose a Template',
  description = 'Select a template to start a new note.',
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Filter templates whenever search query or category changes
  useEffect(() => {
    let filtered = templates;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) || 
        (template.description && template.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => 
        template.category === selectedCategory
      );
    }
    
    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, templates]);
  
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplateId(template.id);
    // If the note doesn't have a title yet, suggest the template name
    if (!noteTitle) {
      setNoteTitle(template.name);
    }
  };
  
  const handleConfirm = () => {
    if (selectedTemplateId && noteTitle.trim()) {
      onSelect(selectedTemplateId, noteTitle);
      setOpen(false);
      // Reset state
      setSearchQuery('');
      setSelectedCategory('all');
      setNoteTitle('');
      setSelectedTemplateId(null);
    }
  };
  
  // Extract unique categories from templates
  const categories = ['all', ...new Set(templates.map(t => t.category))];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            Choose Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' 
                    ? 'All Categories' 
                    : category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[300px] overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-md p-3 cursor-pointer transition-all hover:border-primary/50 ${
                  selectedTemplateId === template.id 
                    ? 'border-primary bg-primary/10' 
                    : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="font-medium">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No templates found. Try a different search or category.
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Input
            placeholder="Enter note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full"
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedTemplateId || !noteTitle.trim()}
          >
            Create Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
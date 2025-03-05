'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NoteFilterProps {
  className?: string;
}

const categories = [
  { id: 'all', name: 'All Notes' },
  { id: 'brain-dump', name: 'Brain Dumps' },
  { id: 'journal', name: 'Journal Entries' },
  { id: 'to-do', name: 'To-Do Lists' },
  { id: 'mood-tracking', name: 'Mood Tracking' },
  { id: 'custom', name: 'Custom Notes' },
  { id: 'audio', name: 'Audio Notes' },
  { id: 'archived', name: 'Archived Notes' },
];

export function NoteFilter({ className }: NoteFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', value);
    }
    
    // Reset to page 1 when filter changes
    if (params.has('page')) {
      params.set('page', '1');
    }
    
    router.push(`/notes?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={filter}
      onValueChange={handleFilterChange}
      value={filter}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Filter notes" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 
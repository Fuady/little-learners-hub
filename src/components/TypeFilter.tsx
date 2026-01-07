import React from 'react';
import { Button } from '@/components/ui/button';
import { Material } from '@/services/api';

interface TypeFilterProps {
  selected: Material['type'] | null;
  onSelect: (type: Material['type'] | null) => void;
}

const types: { id: Material['type']; label: string; emoji: string }[] = [
  { id: 'worksheet', label: 'Worksheets', emoji: '📝' },
  { id: 'activity_book', label: 'Activity Books', emoji: '📖' },
  { id: 'drawing', label: 'Drawing', emoji: '🎨' },
  { id: 'puzzle', label: 'Puzzles', emoji: '🧩' },
  { id: 'game', label: 'Games', emoji: '🎮' },
];

export function TypeFilter({ selected, onSelect }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selected === null ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSelect(null)}
      >
        🌟 All Types
      </Button>
      {types.map((type) => (
        <Button
          key={type.id}
          variant={selected === type.id ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onSelect(type.id)}
          className="gap-1"
        >
          {type.emoji} {type.label}
        </Button>
      ))}
    </div>
  );
}

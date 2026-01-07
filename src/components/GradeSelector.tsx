import React from 'react';
import { Button } from '@/components/ui/button';

interface GradeSelectorProps {
  selected: string | null;
  onSelect: (grade: string | null) => void;
}

const grades = [
  { id: 'kindergarten', label: 'Kindergarten', emoji: '🌟', color: 'lavender' as const },
  { id: 'grade1', label: 'Grade 1', emoji: '🚀', color: 'coral' as const },
  { id: 'grade2', label: 'Grade 2', emoji: '🌈', color: 'mint' as const },
  { id: 'grade3', label: 'Grade 3', emoji: '🎯', color: 'sunshine' as const },
  { id: 'grade4', label: 'Grade 4', emoji: '🏆', color: 'sky' as const },
  { id: 'grade5', label: 'Grade 5', emoji: '⚡', color: 'lavender' as const },
];

export function GradeSelector({ selected, onSelect }: GradeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        className="gap-2"
      >
        📚 All Grades
      </Button>
      {grades.map((grade) => (
        <Button
          key={grade.id}
          variant={selected === grade.id ? grade.color : 'outline'}
          onClick={() => onSelect(grade.id)}
          className="gap-2"
        >
          {grade.emoji} {grade.label}
        </Button>
      ))}
    </div>
  );
}

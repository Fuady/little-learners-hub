import React, { useState, useEffect } from 'react';
import { api, Material } from '@/services/api';
import { MaterialCard } from '@/components/MaterialCard';
import { GradeSelector } from '@/components/GradeSelector';

export default function Games() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      const result = await api.getMaterials({
        type: 'game',
        gradeLevel: selectedGrade as Material['gradeLevel'] | undefined,
      });
      if (result.success && result.data) {
        setMaterials(result.data);
      }
      setIsLoading(false);
    };
    loadMaterials();
  }, [selectedGrade]);

  // Add puzzles too
  useEffect(() => {
    const loadPuzzles = async () => {
      const result = await api.getMaterials({
        type: 'puzzle',
        gradeLevel: selectedGrade as Material['gradeLevel'] | undefined,
      });
      if (result.success && result.data) {
        setMaterials(prev => [...prev, ...result.data!]);
      }
    };
    loadPuzzles();
  }, [selectedGrade]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bubble text-5xl text-primary mb-4">
            Games & Puzzles 🎮
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn while having fun with our interactive games and brain-teasing puzzles!
          </p>
        </div>

        {/* Animated Game Characters */}
        <div className="flex justify-center gap-8 mb-8">
          <span className="text-6xl animate-bounce-soft">🎯</span>
          <span className="text-6xl animate-bounce-soft" style={{ animationDelay: '0.3s' }}>🧩</span>
          <span className="text-6xl animate-bounce-soft" style={{ animationDelay: '0.6s' }}>🎲</span>
          <span className="text-6xl animate-bounce-soft" style={{ animationDelay: '0.9s' }}>🏆</span>
        </div>

        {/* Grade Filter */}
        <div className="mb-8">
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20">
            <span className="text-6xl animate-bounce-soft">🎮</span>
            <p className="mt-4 text-muted-foreground">Loading games...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🎯</span>
            <h3 className="font-bubble text-2xl mt-4">No games found</h3>
            <p className="text-muted-foreground mt-2">Try selecting a different grade level</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import * as api from '@/services/api';
import { Material } from '@/services/api';
import { MaterialCard } from '@/components/MaterialCard';
import { GradeSelector } from '@/components/GradeSelector';
import { TypeFilter } from '@/components/TypeFilter';

export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(
    searchParams.get('grade')
  );
  const [selectedType, setSelectedType] = useState<Material['type'] | null>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const result = await api.getMaterials({
          gradeLevel: selectedGrade as Material['gradeLevel'] | undefined,
          type: selectedType || undefined,
          search: search || undefined,
        });
        setMaterials(result.items);
      } catch (error) {
        console.error('Failed to load materials:', error);
        setMaterials([]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(loadMaterials, 300);
    return () => clearTimeout(debounce);
  }, [selectedGrade, selectedType, search]);

  const handleGradeChange = (grade: string | null) => {
    setSelectedGrade(grade);
    if (grade) {
      setSearchParams({ grade });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bubble text-5xl text-primary mb-4">
            Learning Materials 📚
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover worksheets, games, puzzles, and activities for every grade level!
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <Input
              placeholder="Search for materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 text-lg rounded-3xl"
            />
          </div>
        </div>

        {/* Grade Filter */}
        <div className="mb-6">
          <GradeSelector selected={selectedGrade} onSelect={handleGradeChange} />
        </div>

        {/* Type Filter */}
        <div className="mb-8">
          <TypeFilter selected={selectedType} onSelect={setSelectedType} />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20">
            <span className="text-6xl animate-bounce-soft">⏳</span>
            <p className="mt-4 text-muted-foreground">Loading materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🔍</span>
            <h3 className="font-bubble text-2xl mt-4">No materials found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              Showing {materials.length} material{materials.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

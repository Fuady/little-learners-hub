import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as api from '@/services/api';
import { Material } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const materialTypes: { id: Material['type']; label: string; emoji: string }[] = [
  { id: 'worksheet', label: 'Worksheet', emoji: '📝' },
  { id: 'activity_book', label: 'Activity Book', emoji: '📖' },
  { id: 'drawing', label: 'Drawing/Coloring', emoji: '🎨' },
  { id: 'puzzle', label: 'Puzzle', emoji: '🧩' },
  { id: 'game', label: 'Game', emoji: '🎮' },
];

const gradeLevels: { id: Material['gradeLevel']; label: string }[] = [
  { id: 'kindergarten', label: 'Kindergarten' },
  { id: 'grade1', label: 'Grade 1' },
  { id: 'grade2', label: 'Grade 2' },
  { id: 'grade3', label: 'Grade 3' },
  { id: 'grade4', label: 'Grade 4' },
  { id: 'grade5', label: 'Grade 5' },
];

export default function Submit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Material['type']>('worksheet');
  const [gradeLevel, setGradeLevel] = useState<Material['gradeLevel']>('kindergarten');
  const [isInteractive, setIsInteractive] = useState(false);
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="font-bubble text-2xl mb-4">Login Required</h2>
          <p className="text-muted-foreground">Please login to submit materials.</p>
        </Card>
      </div>
    );
  }

  if (user.role !== 'educator') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <span className="text-6xl mb-4 block">👨‍🏫</span>
          <h2 className="font-bubble text-2xl mb-4">Educators Only</h2>
          <p className="text-muted-foreground">
            Only educators can submit materials. If you're an educator, please register as one.
          </p>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.submitMaterial({
        title,
        description,
        type,
        gradeLevel,
        isInteractive,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        file: selectedFile || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/materials'), 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit material');
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="max-w-md text-center p-8 animate-pop">
          <span className="text-6xl mb-4 block">🎉</span>
          <h2 className="font-bubble text-2xl text-primary mb-4">Material Submitted!</h2>
          <p className="text-muted-foreground">Redirecting to materials...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-float">
          <CardHeader className="text-center">
            <span className="text-5xl mb-4 block">📤</span>
            <CardTitle className="font-bubble text-3xl text-primary">
              Submit New Material
            </CardTitle>
            <p className="text-muted-foreground">
              Share your educational resources with learners everywhere!
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a fun, descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe what kids will learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="flex min-h-24 w-full rounded-2xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all font-nunito resize-none"
                />
              </div>

              {/* Material Type */}
              <div className="space-y-2">
                <Label className="font-bold">Material Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {materialTypes.map((t) => (
                    <Button
                      key={t.id}
                      type="button"
                      variant={type === t.id ? 'default' : 'outline'}
                      onClick={() => setType(t.id)}
                      className="gap-2"
                    >
                      {t.emoji} {t.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grade Level */}
              <div className="space-y-2">
                <Label className="font-bold">Grade Level</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gradeLevels.map((g) => (
                    <Button
                      key={g.id}
                      type="button"
                      variant={gradeLevel === g.id ? 'mint' : 'outline'}
                      onClick={() => setGradeLevel(g.id)}
                      size="sm"
                    >
                      {g.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Interactive Toggle */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isInteractive ? 'sky' : 'outline'}
                  onClick={() => setIsInteractive(!isInteractive)}
                  className="gap-2"
                >
                  {isInteractive ? '✅' : '⬜'} Interactive Material
                </Button>
                <span className="text-sm text-muted-foreground">
                  Check if this is a digital game or puzzle
                </span>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="font-bold">Tags</Label>
                <Input
                  id="tags"
                  placeholder="math, addition, fun (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="font-bold">Upload File (Optional)</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-mint bg-mint/10' : 'border-primary/30 bg-muted/30 hover:bg-muted/50'
                    }`}
                >
                  <span className="text-4xl block mb-2">
                    {selectedFile ? '✅' : '📁'}
                  </span>
                  <p className="text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'PDF, images, or interactive files'}
                  </p>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      Remove File
                    </Button>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Material'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

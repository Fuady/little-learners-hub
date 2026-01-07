import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Material, api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface MaterialCardProps {
  material: Material;
}

const variantMap: Record<string, 'lavender' | 'coral' | 'mint' | 'sunshine' | 'sky'> = {
  worksheet: 'lavender',
  activity_book: 'coral',
  drawing: 'mint',
  puzzle: 'sunshine',
  game: 'sky',
};

const gradeLabels: Record<string, string> = {
  kindergarten: 'Kindergarten',
  grade1: 'Grade 1',
  grade2: 'Grade 2',
  grade3: 'Grade 3',
  grade4: 'Grade 4',
  grade5: 'Grade 5',
};

export function MaterialCard({ material }: MaterialCardProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(material.likes);
  const [downloads, setDownloads] = useState(material.downloads);
  const [isLiking, setIsLiking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const variant = variantMap[material.type] || 'default';

  const handleLike = async () => {
    setIsLiking(true);
    const result = await api.likeMaterial(material.id);
    if (result.success && result.data) {
      setLikes(result.data.likes);
    }
    setIsLiking(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const result = await api.downloadMaterial(material.id);
    if (result.success) {
      setDownloads(downloads + 1);
      // In a real app, this would trigger a file download
      alert('Download started! (Mock)');
    }
    setIsDownloading(false);
  };

  const handlePlay = () => {
    alert(`Opening interactive ${material.type}: ${material.title} (Mock)`);
  };

  const handlePrint = () => {
    alert(`Opening print dialog for: ${material.title} (Mock)`);
  };

  return (
    <Card variant={variant} className="h-full flex flex-col overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-5xl group-hover:animate-wiggle">{material.thumbnail}</span>
          <Badge variant={variant} className="capitalize">
            {material.type.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-3 line-clamp-2">{material.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {material.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {gradeLabels[material.gradeLevel]}
          </Badge>
          {material.isInteractive && (
            <Badge variant="sky" className="text-xs">
              ✨ Interactive
            </Badge>
          )}
        </div>

        <div className="flex gap-1 flex-wrap">
          {material.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span>👤 {material.authorName}</span>
          <div className="flex gap-3">
            <span>⬇️ {downloads}</span>
            <span>❤️ {likes}</span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="flex-1"
            >
              {isLiking ? '...' : '❤️'}
            </Button>
          )}

          {material.isInteractive ? (
            <Button
              variant={variant}
              size="sm"
              onClick={handlePlay}
              className="flex-1"
            >
              🎮 Play
            </Button>
          ) : (
            <>
              <Button
                variant={variant}
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1"
              >
                {isDownloading ? '...' : '⬇️ Download'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1"
              >
                🖨️ Print
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

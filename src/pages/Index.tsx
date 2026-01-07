import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Material } from '@/services/api';
import { MaterialCard } from '@/components/MaterialCard';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';

const features = [
  { emoji: '📝', title: 'Worksheets', description: 'Printable activities for practice', color: 'lavender' },
  { emoji: '📖', title: 'Activity Books', description: 'Fun learning adventures', color: 'coral' },
  { emoji: '🎨', title: 'Drawing & Art', description: 'Creative coloring pages', color: 'mint' },
  { emoji: '🧩', title: 'Digital Puzzles', description: 'Brain-teasing challenges', color: 'sunshine' },
  { emoji: '🎮', title: 'Learning Games', description: 'Interactive fun learning', color: 'sky' },
];

const gradeCards = [
  { grade: 'kindergarten', label: 'Kindergarten', emoji: '🌟', ages: 'Ages 4-5' },
  { grade: 'grade1', label: 'Grade 1', emoji: '🚀', ages: 'Ages 5-6' },
  { grade: 'grade2', label: 'Grade 2', emoji: '🌈', ages: 'Ages 6-7' },
  { grade: 'grade3', label: 'Grade 3', emoji: '🎯', ages: 'Ages 7-8' },
  { grade: 'grade4', label: 'Grade 4', emoji: '🏆', ages: 'Ages 8-9' },
  { grade: 'grade5', label: 'Grade 5', emoji: '⚡', ages: 'Ages 9-10' },
];

export default function Index() {
  const { user } = useAuth();
  const [featuredMaterials, setFeaturedMaterials] = useState<Material[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({ materials: 0, downloads: 0 });

  useEffect(() => {
    const loadData = async () => {
      const [materialsRes, statsRes] = await Promise.all([api.getMaterials(), api.getStats()]);
      if (materialsRes.success && materialsRes.data) setFeaturedMaterials(materialsRes.data.slice(0, 4));
      if (statsRes.success && statsRes.data) setStats({ materials: statsRes.data.totalMaterials, downloads: statsRes.data.totalDownloads });
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero py-16 md:py-24 overflow-hidden relative">
        <div className="absolute top-10 left-10 text-6xl animate-float opacity-50">⭐</div>
        <div className="absolute top-20 right-20 text-5xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🌈</div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-bubble text-5xl md:text-7xl text-primary mb-6 animate-pop">Welcome to KidLearn! ✨</h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-8">Where learning meets fun! Discover worksheets, games, puzzles, and more for kids from Kindergarten to Grade 5.</p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link to="/materials"><Button variant="hero" size="xl" className="gap-3">🎯 Explore Materials</Button></Link>
            {!user && <Button variant="outline" size="xl" onClick={() => setShowLoginModal(true)} className="gap-3">👋 Join as Parent or Educator</Button>}
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="bg-card rounded-3xl px-8 py-4 shadow-lg"><span className="text-3xl font-bubble text-primary">{stats.materials}+</span><p className="text-muted-foreground">Learning Materials</p></div>
            <div className="bg-card rounded-3xl px-8 py-4 shadow-lg"><span className="text-3xl font-bubble text-primary">{stats.downloads}+</span><p className="text-muted-foreground">Downloads</p></div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-bubble text-4xl text-center text-primary mb-12">What Can Kids Do Here? 🎉</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} variant={feature.color as any} className="text-center hover:scale-105 transition-transform cursor-pointer">
                <CardHeader className="pb-2"><span className="text-5xl mb-2 block">{feature.emoji}</span><CardTitle className="text-lg">{feature.title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-bubble text-4xl text-center text-primary mb-4">Choose Your Grade Level 📚</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {gradeCards.map((grade, index) => (
              <Link key={grade.grade} to={`/materials?grade=${grade.grade}`}>
                <Card variant="interactive" className="text-center py-6">
                  <span className="text-5xl mb-3 block animate-bounce-soft" style={{ animationDelay: `${index * 0.2}s` }}>{grade.emoji}</span>
                  <h3 className="font-bubble text-lg text-foreground">{grade.label}</h3>
                  <p className="text-sm text-muted-foreground">{grade.ages}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-bubble text-4xl text-primary">Popular This Week ⭐</h2>
            <Link to="/materials"><Button variant="outline">See All →</Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{featuredMaterials.map((material) => <MaterialCard key={material.id} material={material} />)}</div>
        </div>
      </section>
      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3"><span className="text-4xl">⭐</span><span className="font-bubble text-2xl text-primary">KidLearn</span></div>
          <p className="text-muted-foreground text-center">Made with ❤️ for young learners everywhere</p>
        </div>
      </footer>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

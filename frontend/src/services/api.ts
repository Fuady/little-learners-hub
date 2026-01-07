/**
 * Centralized API Service
 * All backend calls are mocked here and can be replaced with real API calls later
 */

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'educator';
  avatar?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'worksheet' | 'activity_book' | 'drawing' | 'puzzle' | 'game';
  gradeLevel: 'kindergarten' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5';
  thumbnail: string;
  downloadUrl?: string;
  isInteractive: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  downloads: number;
  likes: number;
  tags: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'parent' | 'educator';
}

export interface SubmitMaterialRequest {
  title: string;
  description: string;
  type: Material['type'];
  gradeLevel: Material['gradeLevel'];
  file?: File;
  isInteractive: boolean;
  tags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'parent@example.com',
    name: 'Sarah Johnson',
    role: 'parent',
    avatar: '👩‍👧',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    email: 'teacher@example.com',
    name: 'Mr. Thompson',
    role: 'educator',
    avatar: '👨‍🏫',
    createdAt: '2024-01-10',
  },
];

const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'ABC Tracing Fun',
    description: 'Learn to trace letters A-Z with colorful guides and fun characters!',
    type: 'worksheet',
    gradeLevel: 'kindergarten',
    thumbnail: '📝',
    downloadUrl: '/materials/abc-tracing.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-01',
    downloads: 1250,
    likes: 89,
    tags: ['alphabet', 'writing', 'tracing'],
  },
  {
    id: '2',
    title: 'Number Puzzle Adventure',
    description: 'Solve puzzles while learning numbers 1-100!',
    type: 'puzzle',
    gradeLevel: 'grade1',
    thumbnail: '🧩',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-28',
    downloads: 890,
    likes: 156,
    tags: ['numbers', 'math', 'puzzle'],
  },
  {
    id: '3',
    title: 'Animal Coloring Book',
    description: 'Color beautiful animals from around the world!',
    type: 'drawing',
    gradeLevel: 'kindergarten',
    thumbnail: '🎨',
    downloadUrl: '/materials/animals-coloring.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-25',
    downloads: 2100,
    likes: 234,
    tags: ['animals', 'coloring', 'art'],
  },
  {
    id: '4',
    title: 'Math Monsters Game',
    description: 'Battle friendly monsters with your math skills!',
    type: 'game',
    gradeLevel: 'grade2',
    thumbnail: '👾',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-20',
    downloads: 3500,
    likes: 567,
    tags: ['math', 'addition', 'subtraction', 'game'],
  },
  {
    id: '5',
    title: 'Science Activity Book',
    description: 'Explore the wonders of science with hands-on activities!',
    type: 'activity_book',
    gradeLevel: 'grade3',
    thumbnail: '🔬',
    downloadUrl: '/materials/science-activities.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-15',
    downloads: 780,
    likes: 123,
    tags: ['science', 'experiments', 'activities'],
  },
  {
    id: '6',
    title: 'Reading Comprehension Stories',
    description: 'Fun stories with questions to boost reading skills!',
    type: 'worksheet',
    gradeLevel: 'grade4',
    thumbnail: '📚',
    downloadUrl: '/materials/reading-stories.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-10',
    downloads: 920,
    likes: 178,
    tags: ['reading', 'comprehension', 'stories'],
  },
  {
    id: '7',
    title: 'Fraction Pizza Party',
    description: 'Learn fractions by making virtual pizzas!',
    type: 'game',
    gradeLevel: 'grade5',
    thumbnail: '🍕',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-05',
    downloads: 1450,
    likes: 289,
    tags: ['fractions', 'math', 'game'],
  },
  {
    id: '8',
    title: 'Shape Explorer Puzzle',
    description: 'Match and learn geometric shapes through puzzles!',
    type: 'puzzle',
    gradeLevel: 'grade1',
    thumbnail: '🔷',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-01',
    downloads: 670,
    likes: 98,
    tags: ['shapes', 'geometry', 'puzzle'],
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Class
class ApiService {
  private currentUser: User | null = null;

  // Auth endpoints
  async login(request: LoginRequest): Promise<ApiResponse<User>> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === request.email);
    if (user && request.password === 'password123') {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: user };
    }
    
    return { success: false, error: 'Invalid email or password' };
  }

  async register(request: RegisterRequest): Promise<ApiResponse<User>> {
    await delay(800);
    
    if (mockUsers.some(u => u.email === request.email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: request.email,
      name: request.name,
      role: request.role,
      avatar: request.role === 'parent' ? '👨‍👩‍👧' : '👨‍🏫',
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    mockUsers.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
    return { success: true, data: newUser };
  }

  async logout(): Promise<ApiResponse<null>> {
    await delay(300);
    this.currentUser = null;
    localStorage.removeItem('user');
    return { success: true };
  }

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(300);
    
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return { success: true, data: this.currentUser };
    }
    
    return { success: true, data: null };
  }

  // Materials endpoints
  async getMaterials(filters?: {
    type?: Material['type'];
    gradeLevel?: Material['gradeLevel'];
    search?: string;
  }): Promise<ApiResponse<Material[]>> {
    await delay(500);
    
    let filtered = [...mockMaterials];
    
    if (filters?.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    
    if (filters?.gradeLevel) {
      filtered = filtered.filter(m => m.gradeLevel === filters.gradeLevel);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    return { success: true, data: filtered };
  }

  async getMaterialById(id: string): Promise<ApiResponse<Material>> {
    await delay(300);
    
    const material = mockMaterials.find(m => m.id === id);
    if (material) {
      return { success: true, data: material };
    }
    
    return { success: false, error: 'Material not found' };
  }

  async submitMaterial(request: SubmitMaterialRequest): Promise<ApiResponse<Material>> {
    await delay(1000);
    
    if (!this.currentUser || this.currentUser.role !== 'educator') {
      return { success: false, error: 'Only educators can submit materials' };
    }
    
    const typeEmojis: Record<Material['type'], string> = {
      worksheet: '📝',
      activity_book: '📖',
      drawing: '🎨',
      puzzle: '🧩',
      game: '🎮',
    };
    
    const newMaterial: Material = {
      id: String(mockMaterials.length + 1),
      title: request.title,
      description: request.description,
      type: request.type,
      gradeLevel: request.gradeLevel,
      thumbnail: typeEmojis[request.type],
      isInteractive: request.isInteractive,
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      downloads: 0,
      likes: 0,
      tags: request.tags,
    };
    
    mockMaterials.push(newMaterial);
    return { success: true, data: newMaterial };
  }

  async downloadMaterial(id: string): Promise<ApiResponse<{ url: string }>> {
    await delay(500);
    
    const material = mockMaterials.find(m => m.id === id);
    if (material) {
      // Increment download count
      material.downloads += 1;
      return { success: true, data: { url: material.downloadUrl || '/mock-download' } };
    }
    
    return { success: false, error: 'Material not found' };
  }

  async likeMaterial(id: string): Promise<ApiResponse<{ likes: number }>> {
    await delay(300);
    
    const material = mockMaterials.find(m => m.id === id);
    if (material) {
      material.likes += 1;
      return { success: true, data: { likes: material.likes } };
    }
    
    return { success: false, error: 'Material not found' };
  }

  // Stats endpoints
  async getStats(): Promise<ApiResponse<{
    totalMaterials: number;
    totalDownloads: number;
    totalUsers: number;
    gradeBreakdown: Record<string, number>;
  }>> {
    await delay(400);
    
    const gradeBreakdown: Record<string, number> = {};
    let totalDownloads = 0;
    
    mockMaterials.forEach(m => {
      gradeBreakdown[m.gradeLevel] = (gradeBreakdown[m.gradeLevel] || 0) + 1;
      totalDownloads += m.downloads;
    });
    
    return {
      success: true,
      data: {
        totalMaterials: mockMaterials.length,
        totalDownloads,
        totalUsers: mockUsers.length,
        gradeBreakdown,
      },
    };
  }
}

// Export singleton instance
export const api = new ApiService();

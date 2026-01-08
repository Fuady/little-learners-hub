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
  {
    id: '3',
    email: 'educator@example.com',
    name: 'Ms. Rivera',
    role: 'educator',
    avatar: '👩‍🏫',
    createdAt: '2024-02-01',
  },
];

const mockMaterials: Material[] = [
  // ============ WORKSHEETS ============
  // Kindergarten Worksheets
  {
    id: '1',
    title: 'ABC Tracing Fun',
    description: 'Learn to trace letters A-Z with colorful guides and fun characters! Each letter comes with a cute animal friend.',
    type: 'worksheet',
    gradeLevel: 'kindergarten',
    thumbnail: '✏️',
    downloadUrl: '/materials/abc-tracing.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-01',
    downloads: 1250,
    likes: 89,
    tags: ['alphabet', 'writing', 'tracing', 'letters'],
  },
  {
    id: '2',
    title: 'Numbers 1-10 Practice',
    description: 'Count and write numbers from 1 to 10 with fun pictures of fruits, animals, and toys!',
    type: 'worksheet',
    gradeLevel: 'kindergarten',
    thumbnail: '🔢',
    downloadUrl: '/materials/numbers-1-10.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-28',
    downloads: 980,
    likes: 76,
    tags: ['numbers', 'counting', 'math basics'],
  },
  {
    id: '3',
    title: 'Shape Recognition',
    description: 'Identify circles, squares, triangles, and more! Color each shape and find them in real-world objects.',
    type: 'worksheet',
    gradeLevel: 'kindergarten',
    thumbnail: '🔵',
    downloadUrl: '/materials/shapes.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-20',
    downloads: 756,
    likes: 54,
    tags: ['shapes', 'geometry', 'recognition'],
  },
  // Grade 1 Worksheets
  {
    id: '4',
    title: 'Addition Adventures',
    description: 'Master addition with numbers up to 20! Solve fun problems featuring rockets, dinosaurs, and ice cream.',
    type: 'worksheet',
    gradeLevel: 'grade1',
    thumbnail: '➕',
    downloadUrl: '/materials/addition-adventures.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-05',
    downloads: 1450,
    likes: 112,
    tags: ['math', 'addition', 'numbers'],
  },
  {
    id: '5',
    title: 'Sight Words Practice',
    description: 'Learn and practice 50 essential sight words through tracing, writing, and sentence building!',
    type: 'worksheet',
    gradeLevel: 'grade1',
    thumbnail: '👀',
    downloadUrl: '/materials/sight-words.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-15',
    downloads: 2100,
    likes: 189,
    tags: ['reading', 'sight words', 'vocabulary'],
  },
  // Grade 2 Worksheets
  {
    id: '6',
    title: 'Subtraction Safari',
    description: 'Go on a safari adventure while learning subtraction! Problems up to 100 with animal themes.',
    type: 'worksheet',
    gradeLevel: 'grade2',
    thumbnail: '➖',
    downloadUrl: '/materials/subtraction-safari.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-10',
    downloads: 890,
    likes: 67,
    tags: ['math', 'subtraction', 'animals'],
  },
  {
    id: '7',
    title: 'Grammar Galaxy',
    description: 'Explore nouns, verbs, and adjectives in this space-themed grammar adventure!',
    type: 'worksheet',
    gradeLevel: 'grade2',
    thumbnail: '🚀',
    downloadUrl: '/materials/grammar-galaxy.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-25',
    downloads: 1120,
    likes: 98,
    tags: ['grammar', 'language arts', 'nouns', 'verbs'],
  },
  // Grade 3 Worksheets
  {
    id: '8',
    title: 'Multiplication Mountain',
    description: 'Climb the multiplication mountain! Master times tables from 1-12 with progressive difficulty.',
    type: 'worksheet',
    gradeLevel: 'grade3',
    thumbnail: '✖️',
    downloadUrl: '/materials/multiplication-mountain.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-08',
    downloads: 1780,
    likes: 156,
    tags: ['math', 'multiplication', 'times tables'],
  },
  {
    id: '9',
    title: 'Reading Comprehension Stories',
    description: 'Fun stories about adventures, friendship, and mystery with comprehension questions!',
    type: 'worksheet',
    gradeLevel: 'grade3',
    thumbnail: '📖',
    downloadUrl: '/materials/reading-stories.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-10',
    downloads: 920,
    likes: 178,
    tags: ['reading', 'comprehension', 'stories'],
  },
  // Grade 4 Worksheets
  {
    id: '10',
    title: 'Division Discovery',
    description: 'Discover the magic of division! Learn long division with step-by-step guides and practice problems.',
    type: 'worksheet',
    gradeLevel: 'grade4',
    thumbnail: '➗',
    downloadUrl: '/materials/division-discovery.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-12',
    downloads: 1340,
    likes: 134,
    tags: ['math', 'division', 'long division'],
  },
  {
    id: '11',
    title: 'States & Capitals',
    description: 'Learn all 50 US states and their capitals through maps, matching, and fun facts!',
    type: 'worksheet',
    gradeLevel: 'grade4',
    thumbnail: '🗺️',
    downloadUrl: '/materials/states-capitals.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-05',
    downloads: 2340,
    likes: 267,
    tags: ['geography', 'states', 'capitals', 'USA'],
  },
  // Grade 5 Worksheets
  {
    id: '12',
    title: 'Fraction Fundamentals',
    description: 'Master fractions with visual models, equivalent fractions, and word problems!',
    type: 'worksheet',
    gradeLevel: 'grade5',
    thumbnail: '🥧',
    downloadUrl: '/materials/fractions.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-15',
    downloads: 1560,
    likes: 189,
    tags: ['math', 'fractions', 'equivalent fractions'],
  },
  {
    id: '13',
    title: 'Essay Writing Workshop',
    description: 'Learn to write compelling essays with this structured guide covering introductions, body paragraphs, and conclusions.',
    type: 'worksheet',
    gradeLevel: 'grade5',
    thumbnail: '✍️',
    downloadUrl: '/materials/essay-writing.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-01',
    downloads: 890,
    likes: 123,
    tags: ['writing', 'essays', 'language arts'],
  },

  // ============ PUZZLES ============
  // Kindergarten Puzzles
  {
    id: '14',
    title: 'Animal Match Puzzle',
    description: 'Match baby animals with their parents! Drag and drop to find the matching pairs.',
    type: 'puzzle',
    gradeLevel: 'kindergarten',
    thumbnail: '🐣',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-02',
    downloads: 890,
    likes: 156,
    tags: ['animals', 'matching', 'memory'],
  },
  {
    id: '15',
    title: 'Color Pattern Puzzle',
    description: 'Complete the color patterns! Learn sequences and patterns with colorful blocks.',
    type: 'puzzle',
    gradeLevel: 'kindergarten',
    thumbnail: '🌈',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-22',
    downloads: 670,
    likes: 78,
    tags: ['patterns', 'colors', 'sequences'],
  },
  // Grade 1 Puzzles
  {
    id: '16',
    title: 'Number Sequence Challenge',
    description: 'Fill in the missing numbers! Practice counting forward and backward.',
    type: 'puzzle',
    gradeLevel: 'grade1',
    thumbnail: '🔢',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-28',
    downloads: 780,
    likes: 89,
    tags: ['numbers', 'sequences', 'counting'],
  },
  {
    id: '17',
    title: 'Shape Explorer Puzzle',
    description: 'Match and learn geometric shapes through puzzles! Find shapes hidden in pictures.',
    type: 'puzzle',
    gradeLevel: 'grade1',
    thumbnail: '🔷',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-01',
    downloads: 670,
    likes: 98,
    tags: ['shapes', 'geometry', 'puzzle'],
  },
  // Grade 2 Puzzles
  {
    id: '18',
    title: 'Word Builder Puzzle',
    description: 'Unscramble letters to build words! Perfect for spelling practice.',
    type: 'puzzle',
    gradeLevel: 'grade2',
    thumbnail: '🔤',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-03',
    downloads: 920,
    likes: 112,
    tags: ['spelling', 'words', 'vocabulary'],
  },
  {
    id: '19',
    title: 'Clock Time Puzzle',
    description: 'Learn to tell time! Match digital times with analog clocks.',
    type: 'puzzle',
    gradeLevel: 'grade2',
    thumbnail: '🕐',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-18',
    downloads: 1150,
    likes: 145,
    tags: ['time', 'clocks', 'telling time'],
  },
  // Grade 3 Puzzles
  {
    id: '20',
    title: 'Sudoku for Kids',
    description: 'Kid-friendly 4x4 and 6x6 Sudoku puzzles with pictures and numbers!',
    type: 'puzzle',
    gradeLevel: 'grade3',
    thumbnail: '🧮',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-07',
    downloads: 1340,
    likes: 178,
    tags: ['logic', 'sudoku', 'problem solving'],
  },
  {
    id: '21',
    title: 'Geography Jigsaw',
    description: 'Put together maps of continents and countries! Learn geography through puzzles.',
    type: 'puzzle',
    gradeLevel: 'grade3',
    thumbnail: '🌍',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-12',
    downloads: 890,
    likes: 123,
    tags: ['geography', 'maps', 'continents'],
  },
  // Grade 4 Puzzles
  {
    id: '22',
    title: 'Crossword Quest',
    description: 'Educational crosswords covering vocabulary, science, and social studies!',
    type: 'puzzle',
    gradeLevel: 'grade4',
    thumbnail: '📝',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-09',
    downloads: 1120,
    likes: 156,
    tags: ['crossword', 'vocabulary', 'words'],
  },
  {
    id: '23',
    title: 'Logic Grid Mysteries',
    description: 'Solve logic puzzles using clues! Develop critical thinking skills.',
    type: 'puzzle',
    gradeLevel: 'grade4',
    thumbnail: '🔍',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-08',
    downloads: 780,
    likes: 134,
    tags: ['logic', 'critical thinking', 'deduction'],
  },
  // Grade 5 Puzzles
  {
    id: '24',
    title: 'Math Code Breaker',
    description: 'Solve math problems to crack secret codes! Covers all operations.',
    type: 'puzzle',
    gradeLevel: 'grade5',
    thumbnail: '🔐',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-11',
    downloads: 1450,
    likes: 189,
    tags: ['math', 'codes', 'problem solving'],
  },
  {
    id: '25',
    title: 'Word Search Challenge',
    description: 'Advanced word searches with science, history, and vocabulary themes!',
    type: 'puzzle',
    gradeLevel: 'grade5',
    thumbnail: '🔎',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-03',
    downloads: 980,
    likes: 145,
    tags: ['word search', 'vocabulary', 'spelling'],
  },

  // ============ DRAWING / COLORING ============
  // Kindergarten Drawing
  {
    id: '26',
    title: 'Animal Coloring Book',
    description: 'Color beautiful animals from around the world! Lions, elephants, butterflies, and more.',
    type: 'drawing',
    gradeLevel: 'kindergarten',
    thumbnail: '🦁',
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
    id: '27',
    title: 'Alphabet Art Pages',
    description: 'Color letters and objects that start with each letter! A is for Apple, B is for Ball...',
    type: 'drawing',
    gradeLevel: 'kindergarten',
    thumbnail: '🎨',
    downloadUrl: '/materials/alphabet-art.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-20',
    downloads: 1560,
    likes: 178,
    tags: ['alphabet', 'coloring', 'letters'],
  },
  // Grade 1 Drawing
  {
    id: '28',
    title: 'Under the Sea Coloring',
    description: 'Explore the ocean with fish, dolphins, octopus, and coral reef scenes to color!',
    type: 'drawing',
    gradeLevel: 'grade1',
    thumbnail: '🐠',
    downloadUrl: '/materials/ocean-coloring.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-04',
    downloads: 1890,
    likes: 212,
    tags: ['ocean', 'sea animals', 'coloring'],
  },
  {
    id: '29',
    title: 'How to Draw Animals',
    description: 'Step-by-step guides to draw cute animals! Perfect for young artists.',
    type: 'drawing',
    gradeLevel: 'grade1',
    thumbnail: '✏️',
    downloadUrl: '/materials/draw-animals.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-15',
    downloads: 2340,
    likes: 289,
    tags: ['drawing', 'animals', 'art tutorial'],
  },
  // Grade 2 Drawing
  {
    id: '30',
    title: 'Dinosaur World Coloring',
    description: 'Travel back in time! Color T-Rex, Triceratops, Brachiosaurus, and more prehistoric creatures.',
    type: 'drawing',
    gradeLevel: 'grade2',
    thumbnail: '🦕',
    downloadUrl: '/materials/dinosaur-coloring.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-06',
    downloads: 2560,
    likes: 312,
    tags: ['dinosaurs', 'coloring', 'prehistoric'],
  },
  {
    id: '31',
    title: 'Mandala Designs for Kids',
    description: 'Simple mandala patterns perfect for young colorists! Promotes focus and creativity.',
    type: 'drawing',
    gradeLevel: 'grade2',
    thumbnail: '🎭',
    downloadUrl: '/materials/mandalas-kids.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-10',
    downloads: 1120,
    likes: 156,
    tags: ['mandala', 'patterns', 'mindfulness'],
  },
  // Grade 3 Drawing
  {
    id: '32',
    title: 'Space Exploration Coloring',
    description: 'Color rockets, planets, astronauts, and galaxies! Learn about space while creating art.',
    type: 'drawing',
    gradeLevel: 'grade3',
    thumbnail: '🚀',
    downloadUrl: '/materials/space-coloring.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-08',
    downloads: 1780,
    likes: 234,
    tags: ['space', 'planets', 'astronauts'],
  },
  {
    id: '33',
    title: 'How to Draw Cartoons',
    description: 'Learn to draw your favorite cartoon characters with easy step-by-step instructions!',
    type: 'drawing',
    gradeLevel: 'grade3',
    thumbnail: '🎬',
    downloadUrl: '/materials/draw-cartoons.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-05',
    downloads: 1890,
    likes: 267,
    tags: ['cartoons', 'drawing', 'characters'],
  },
  // Grade 4 Drawing
  {
    id: '34',
    title: 'World Landmarks Coloring',
    description: 'Color famous landmarks: Eiffel Tower, Great Wall, Pyramids, and more!',
    type: 'drawing',
    gradeLevel: 'grade4',
    thumbnail: '🗼',
    downloadUrl: '/materials/landmarks-coloring.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-10',
    downloads: 1340,
    likes: 178,
    tags: ['landmarks', 'world', 'geography'],
  },
  {
    id: '35',
    title: 'Perspective Drawing Basics',
    description: 'Introduction to 1-point and 2-point perspective for young artists!',
    type: 'drawing',
    gradeLevel: 'grade4',
    thumbnail: '📐',
    downloadUrl: '/materials/perspective-drawing.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-01',
    downloads: 890,
    likes: 123,
    tags: ['perspective', 'art techniques', 'drawing'],
  },
  // Grade 5 Drawing
  {
    id: '36',
    title: 'Nature Sketching Guide',
    description: 'Learn to sketch flowers, trees, mountains, and wildlife with detailed tutorials.',
    type: 'drawing',
    gradeLevel: 'grade5',
    thumbnail: '🌺',
    downloadUrl: '/materials/nature-sketching.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-12',
    downloads: 1120,
    likes: 156,
    tags: ['nature', 'sketching', 'art'],
  },
  {
    id: '37',
    title: 'Comic Strip Creator',
    description: 'Design your own comic strips! Templates, character guides, and storytelling tips.',
    type: 'drawing',
    gradeLevel: 'grade5',
    thumbnail: '💬',
    downloadUrl: '/materials/comic-creator.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-04-28',
    downloads: 1560,
    likes: 212,
    tags: ['comics', 'storytelling', 'creative writing'],
  },

  // ============ GAMES ============
  // Kindergarten Games
  {
    id: '38',
    title: 'Letter Sound Safari',
    description: 'Hunt for letters and learn their sounds! Interactive phonics adventure.',
    type: 'game',
    gradeLevel: 'kindergarten',
    thumbnail: '🦒',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-01',
    downloads: 2340,
    likes: 345,
    tags: ['phonics', 'letters', 'sounds'],
  },
  {
    id: '39',
    title: 'Count the Stars',
    description: 'Count twinkling stars to help characters solve problems! Numbers 1-20.',
    type: 'game',
    gradeLevel: 'kindergarten',
    thumbnail: '⭐',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-22',
    downloads: 1890,
    likes: 267,
    tags: ['counting', 'numbers', 'stars'],
  },
  // Grade 1 Games
  {
    id: '40',
    title: 'Word Family Farm',
    description: 'Build words on the farm! Learn -at, -an, -ig, -op word families and more.',
    type: 'game',
    gradeLevel: 'grade1',
    thumbnail: '🌾',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-03',
    downloads: 1670,
    likes: 212,
    tags: ['word families', 'phonics', 'reading'],
  },
  {
    id: '41',
    title: 'Addition Arcade',
    description: 'Play classic arcade games while mastering addition! Earn points and badges.',
    type: 'game',
    gradeLevel: 'grade1',
    thumbnail: '🕹️',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-18',
    downloads: 2100,
    likes: 289,
    tags: ['addition', 'math', 'arcade'],
  },
  // Grade 2 Games
  {
    id: '42',
    title: 'Math Monsters Game',
    description: 'Battle friendly monsters with your math skills! Addition, subtraction, and more.',
    type: 'game',
    gradeLevel: 'grade2',
    thumbnail: '👾',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-20',
    downloads: 3500,
    likes: 567,
    tags: ['math', 'addition', 'subtraction', 'monsters'],
  },
  {
    id: '43',
    title: 'Spelling Bee Championship',
    description: 'Compete in a virtual spelling bee! Practice words and win trophies.',
    type: 'game',
    gradeLevel: 'grade2',
    thumbnail: '🐝',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-12',
    downloads: 1890,
    likes: 234,
    tags: ['spelling', 'words', 'competition'],
  },
  // Grade 3 Games
  {
    id: '44',
    title: 'Multiplication Quest',
    description: 'Embark on an epic quest to master times tables! RPG-style learning adventure.',
    type: 'game',
    gradeLevel: 'grade3',
    thumbnail: '⚔️',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-05',
    downloads: 2890,
    likes: 456,
    tags: ['multiplication', 'times tables', 'RPG'],
  },
  {
    id: '45',
    title: 'Reading Race',
    description: 'Race against time to answer reading comprehension questions! Improves speed and understanding.',
    type: 'game',
    gradeLevel: 'grade3',
    thumbnail: '🏎️',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-08',
    downloads: 1560,
    likes: 198,
    tags: ['reading', 'comprehension', 'speed'],
  },
  // Grade 4 Games
  {
    id: '46',
    title: 'Science Lab Experiments',
    description: 'Conduct virtual science experiments! Learn about chemistry, physics, and biology.',
    type: 'game',
    gradeLevel: 'grade4',
    thumbnail: '🔬',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-07',
    downloads: 2340,
    likes: 378,
    tags: ['science', 'experiments', 'lab'],
  },
  {
    id: '47',
    title: 'Geography Explorer',
    description: 'Travel the world! Learn countries, capitals, and landmarks through interactive maps.',
    type: 'game',
    gradeLevel: 'grade4',
    thumbnail: '🌎',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-02',
    downloads: 1780,
    likes: 267,
    tags: ['geography', 'countries', 'maps'],
  },
  // Grade 5 Games
  {
    id: '48',
    title: 'Fraction Pizza Party',
    description: 'Learn fractions by making virtual pizzas! Add, subtract, and compare fractions.',
    type: 'game',
    gradeLevel: 'grade5',
    thumbnail: '🍕',
    isInteractive: true,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-05',
    downloads: 1450,
    likes: 289,
    tags: ['fractions', 'math', 'food'],
  },
  {
    id: '49',
    title: 'History Time Machine',
    description: 'Travel through time to learn about ancient civilizations, inventors, and world events!',
    type: 'game',
    gradeLevel: 'grade5',
    thumbnail: '⏰',
    isInteractive: true,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-04-25',
    downloads: 1890,
    likes: 312,
    tags: ['history', 'civilizations', 'time travel'],
  },

  // ============ ACTIVITY BOOKS ============
  // Kindergarten Activity Books
  {
    id: '50',
    title: 'My First Learning Book',
    description: 'All-in-one activity book with letters, numbers, colors, and shapes for little learners!',
    type: 'activity_book',
    gradeLevel: 'kindergarten',
    thumbnail: '📚',
    downloadUrl: '/materials/first-learning.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-02',
    downloads: 3200,
    likes: 456,
    tags: ['comprehensive', 'early learning', 'basics'],
  },
  {
    id: '51',
    title: 'Seasons Activity Fun',
    description: 'Learn about spring, summer, fall, and winter through crafts, coloring, and activities!',
    type: 'activity_book',
    gradeLevel: 'kindergarten',
    thumbnail: '🌸',
    downloadUrl: '/materials/seasons-activities.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-18',
    downloads: 1670,
    likes: 198,
    tags: ['seasons', 'weather', 'nature'],
  },
  // Grade 1 Activity Books
  {
    id: '52',
    title: 'Reading Adventures Book',
    description: 'Stories, phonics activities, and reading games all in one colorful book!',
    type: 'activity_book',
    gradeLevel: 'grade1',
    thumbnail: '📖',
    downloadUrl: '/materials/reading-adventures.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-04',
    downloads: 2100,
    likes: 289,
    tags: ['reading', 'phonics', 'stories'],
  },
  {
    id: '53',
    title: 'Math Fun Pack',
    description: 'Addition, subtraction, counting, and number puzzles for grade 1 mathematicians!',
    type: 'activity_book',
    gradeLevel: 'grade1',
    thumbnail: '🔢',
    downloadUrl: '/materials/math-fun-pack.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-12',
    downloads: 1890,
    likes: 234,
    tags: ['math', 'addition', 'subtraction'],
  },
  // Grade 2 Activity Books
  {
    id: '54',
    title: 'Grammar & Writing Workbook',
    description: 'Practice sentences, punctuation, and creative writing with fun exercises!',
    type: 'activity_book',
    gradeLevel: 'grade2',
    thumbnail: '✏️',
    downloadUrl: '/materials/grammar-writing.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-06',
    downloads: 1560,
    likes: 198,
    tags: ['grammar', 'writing', 'sentences'],
  },
  {
    id: '55',
    title: 'Money & Time Workbook',
    description: 'Learn to count money and tell time with hands-on activities and practice problems!',
    type: 'activity_book',
    gradeLevel: 'grade2',
    thumbnail: '💰',
    downloadUrl: '/materials/money-time.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-06',
    downloads: 1340,
    likes: 178,
    tags: ['money', 'time', 'life skills'],
  },
  // Grade 3 Activity Books
  {
    id: '56',
    title: 'Science Activity Book',
    description: 'Explore the wonders of science with hands-on activities and experiments!',
    type: 'activity_book',
    gradeLevel: 'grade3',
    thumbnail: '🔬',
    downloadUrl: '/materials/science-activities.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-05-15',
    downloads: 1780,
    likes: 234,
    tags: ['science', 'experiments', 'activities'],
  },
  {
    id: '57',
    title: 'Multiplication Mastery Book',
    description: 'Master all times tables with practice sheets, games, and tips!',
    type: 'activity_book',
    gradeLevel: 'grade3',
    thumbnail: '✖️',
    downloadUrl: '/materials/multiplication-mastery.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-05-01',
    downloads: 2100,
    likes: 289,
    tags: ['multiplication', 'times tables', 'math'],
  },
  // Grade 4 Activity Books
  {
    id: '58',
    title: 'Social Studies Explorer',
    description: 'Discover US history, government, and geography through maps, timelines, and activities!',
    type: 'activity_book',
    gradeLevel: 'grade4',
    thumbnail: '🏛️',
    downloadUrl: '/materials/social-studies.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-08',
    downloads: 1450,
    likes: 189,
    tags: ['social studies', 'history', 'geography'],
  },
  {
    id: '59',
    title: 'Fractions & Decimals Workbook',
    description: 'Build strong foundations in fractions and decimals with visual models and practice!',
    type: 'activity_book',
    gradeLevel: 'grade4',
    thumbnail: '🥧',
    downloadUrl: '/materials/fractions-decimals.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-04-28',
    downloads: 1670,
    likes: 212,
    tags: ['fractions', 'decimals', 'math'],
  },
  // Grade 5 Activity Books
  {
    id: '60',
    title: 'STEM Challenges Book',
    description: 'Engineering, coding concepts, and science challenges for curious minds!',
    type: 'activity_book',
    gradeLevel: 'grade5',
    thumbnail: '🤖',
    downloadUrl: '/materials/stem-challenges.pdf',
    isInteractive: false,
    authorId: '2',
    authorName: 'Mr. Thompson',
    createdAt: '2024-06-10',
    downloads: 1890,
    likes: 267,
    tags: ['STEM', 'engineering', 'coding'],
  },
  {
    id: '61',
    title: 'Research & Report Writing',
    description: 'Learn to research topics and write reports with this comprehensive guide!',
    type: 'activity_book',
    gradeLevel: 'grade5',
    thumbnail: '📋',
    downloadUrl: '/materials/research-writing.pdf',
    isInteractive: false,
    authorId: '3',
    authorName: 'Ms. Rivera',
    createdAt: '2024-04-20',
    downloads: 1120,
    likes: 156,
    tags: ['research', 'writing', 'reports'],
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

  // Get featured/popular materials
  async getFeaturedMaterials(): Promise<ApiResponse<Material[]>> {
    await delay(400);
    
    // Return top 6 by likes
    const featured = [...mockMaterials]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6);
    
    return { success: true, data: featured };
  }

  // Get materials by type
  async getMaterialsByType(type: Material['type']): Promise<ApiResponse<Material[]>> {
    await delay(400);
    
    const filtered = mockMaterials.filter(m => m.type === type);
    return { success: true, data: filtered };
  }
}

// Export singleton instance
export const api = new ApiService();

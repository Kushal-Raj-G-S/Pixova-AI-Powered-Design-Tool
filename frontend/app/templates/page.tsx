'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Mock templates data
const templates = [
  {
    id: 1,
    name: 'Tech Startup Logo',
    category: 'logo',
    style: 'modern',
    image: 'https://picsum.photos/seed/template1/400/400',
    favorites: 234,
    views: 1520,
  },
  {
    id: 2,
    name: 'Instagram Post - Sale',
    category: 'social',
    style: 'vibrant',
    image: 'https://picsum.photos/seed/template2/400/400',
    favorites: 456,
    views: 3200,
  },
  {
    id: 3,
    name: 'Mobile App Login',
    category: 'mobile',
    style: 'minimalist',
    image: 'https://picsum.photos/seed/template3/400/600',
    favorites: 189,
    views: 980,
  },
  {
    id: 4,
    name: 'Corporate Business Card',
    category: 'business-card',
    style: 'corporate',
    image: 'https://picsum.photos/seed/template4/400/250',
    favorites: 312,
    views: 1890,
  },
  {
    id: 5,
    name: 'Landing Page Hero',
    category: 'landing',
    style: 'modern',
    image: 'https://picsum.photos/seed/template5/600/400',
    favorites: 567,
    views: 4100,
  },
  {
    id: 6,
    name: 'Event Flyer',
    category: 'flyer',
    style: 'creative',
    image: 'https://picsum.photos/seed/template6/400/600',
    favorites: 298,
    views: 2100,
  },
  {
    id: 7,
    name: 'Minimalist Logo',
    category: 'logo',
    style: 'minimalist',
    image: 'https://picsum.photos/seed/template7/400/400',
    favorites: 423,
    views: 2800,
  },
  {
    id: 8,
    name: 'Social Media Story',
    category: 'social',
    style: 'vibrant',
    image: 'https://picsum.photos/seed/template8/400/700',
    favorites: 334,
    views: 2500,
  },
  {
    id: 9,
    name: 'App Dashboard',
    category: 'mobile',
    style: 'modern',
    image: 'https://picsum.photos/seed/template9/400/600',
    favorites: 245,
    views: 1600,
  },
];

const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'logo', name: 'Logos' },
  { id: 'social', name: 'Social Media' },
  { id: 'mobile', name: 'Mobile Apps' },
  { id: 'landing', name: 'Landing Pages' },
  { id: 'business-card', name: 'Business Cards' },
  { id: 'flyer', name: 'Flyers' },
];

const styles = [
  { id: 'all', name: 'All Styles' },
  { id: 'modern', name: 'Modern' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'creative', name: 'Creative' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'vibrant', name: 'Vibrant' },
  { id: 'elegant', name: 'Elegant' },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || template.style === selectedStyle;
    return matchesSearch && matchesCategory && matchesStyle;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-white">Templates Library</h1>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 space-y-6"
            >
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Style</h3>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedStyle === style.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
            >
              {/* Template Image */}
              <div className="aspect-[4/3] bg-white/10 relative overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
                      Use Template
                    </button>
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  {favorites.includes(template.id) ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {template.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {template.views}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs capitalize">
                    {template.style}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStyle('all');
              }}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

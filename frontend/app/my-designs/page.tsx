'use client';

import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { deleteDesign, getRecentDesigns, toggleFavorite, type Design } from '@/lib/database';
import {
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyDesignsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All Designs');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Load user's designs
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadDesigns();
    }
  }, [user, authLoading, router]);

  const loadDesigns = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getRecentDesigns(user.id, 100); // Load up to 100 designs
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (authLoading || loading) {
    return <LoadingScreen message="Loading your designs..." />;
  }

  if (!user) {
    return null;
  }

  // Extract unique folders from designs
  const folders = [
    { name: 'All Designs', count: designs.length },
    ...Array.from(new Set(designs.map(d => d.folder).filter(Boolean)))
      .map(folder => ({
        name: folder as string,
        count: designs.filter(d => d.folder === folder).length
      }))
  ];

  const handleToggleFavorite = async (designId: string, currentStatus: boolean) => {
    const success = await toggleFavorite(designId, currentStatus);
    if (success) {
      setDesigns((prev) =>
        prev.map((design) =>
          design.id === designId ? { ...design, favorite: !currentStatus } : design
        )
      );
    }
  };

  const handleDelete = async (designId: string, designName: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      const success = await deleteDesign(designId, designName);
      if (success) {
        setDesigns((prev) => prev.filter((design) => design.id !== designId));
      }
    }
  };

  const handleDownload = async (imageUrl: string, name: string) => {
    try {
      // Use backend proxy endpoint for better CORS support
      const downloadUrl = `http://localhost:8000/api/download?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const filteredDesigns = designs
    .filter((design) => {
      const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder =
        selectedFolder === 'All Designs' || design.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-white">My Designs</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Folders */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Folders</h3>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <PlusIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedFolder === folder.name
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:bg-white/5'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4" />
                      {folder.name}
                    </span>
                    <span className="text-xs">{folder.count}</span>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Designs</span>
                  <span className="text-white font-medium">{designs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Favorites</span>
                  <span className="text-white font-medium">
                    {designs.filter((d) => d.favorite).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Folders</span>
                  <span className="text-white font-medium">{folders.length - 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designs..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>

              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400'
                    }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400'
                    }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Designs Grid/List */}
            {filteredDesigns.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                {designs.length === 0 ? (
                  <>
                    <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No designs yet</h3>
                    <p className="text-gray-400 mb-6">
                      Create your first AI-powered design to get started
                    </p>
                    <a
                      href="/generate"
                      className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      Create New Design
                    </a>
                  </>
                ) : (
                  <>
                    <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No designs found</h3>
                    <p className="text-gray-400 mb-6">
                      {searchQuery
                        ? 'Try adjusting your search query'
                        : `No designs in ${selectedFolder}`}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredDesigns.map((design, index) => (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl group hover:border-purple-500/50 transition-all overflow-visible ${viewMode === 'list' ? 'flex items-center' : ''
                      }`}
                    style={{ position: 'relative', zIndex: openMenuId === design.id ? 100 : 1 }}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`bg-white/10 relative ${viewMode === 'grid' ? 'aspect-[4/3] rounded-t-xl' : 'w-32 h-32 flex-shrink-0 rounded-l-xl'
                        } overflow-hidden`}
                    >
                      {design.thumbnail_url || design.image_url ? (
                        <img
                          src={design.thumbnail_url || design.image_url}
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <SparklesIcon className="w-12 h-12 text-purple-400" />
                        </div>
                      )}
                      <button
                        onClick={() => handleToggleFavorite(design.id, design.favorite)}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                      >
                        {design.favorite ? (
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{design.name}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(design.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          {design.folder && (
                            <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {design.folder}
                            </span>
                          )}
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === design.id ? null : design.id);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                          </button>
                          {openMenuId === design.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[999]"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-2xl z-[1000] overflow-hidden">
                                <a
                                  href={`/editor?id=${design.id}`}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/5"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <PencilIcon className="w-4 h-4" />
                                  Edit
                                </a>
                                <button
                                  onClick={() => {
                                    handleDownload(design.image_url, design.name);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/5 text-left"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(design.id, design.name);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

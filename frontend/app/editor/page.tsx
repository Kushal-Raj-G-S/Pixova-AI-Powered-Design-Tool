'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PaintBrushIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

interface Design {
  id: string;
  name: string;
  image_url: string;
  type: string;
}

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [canvasColor, setCanvasColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const exportFormats = ['PNG', 'JPG', 'PDF', 'SVG'];

  const tools = [
    { id: 'resize', name: 'Resize', icon: ArrowsPointingOutIcon },
    { id: 'color', name: 'Recolor', icon: PaintBrushIcon },
    { id: 'text', name: 'Edit Text', icon: PencilIcon },
    { id: 'delete', name: 'Delete Element', icon: TrashIcon },
  ];

  // Load design from database
  useEffect(() => {
    if (!user) return;

    const designId = searchParams.get('id');
    if (!designId) {
      router.push('/my-designs');
      return;
    }

    loadDesign(designId);
  }, [searchParams, user]);

  // Initialize canvas when design loads
  useEffect(() => {
    if (design && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.onerror = () => {
        console.error('Failed to load image');
        alert('Failed to load design image');
      };
      img.src = design.image_url;
    }
  }, [design]);

  const loadDesign = async (designId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('designs')
        .select('id, name, image_url, type')
        .eq('id', designId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Design not found');
      }

      setDesign(data);
    } catch (error: any) {
      console.error('Error loading design:', error);
      alert(`Failed to load design: ${error.message || 'Unknown error'}`);
      router.push('/my-designs');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      setHistoryStep(historyStep - 1);
      ctx.putImageData(history[historyStep - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      setHistoryStep(historyStep + 1);
      ctx.putImageData(history[historyStep + 1], 0, 0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'color') {
      startDrawing(x, y);
    } else if (selectedTool === 'text') {
      addText(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'color') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    draw(x, y);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const addText = (x: number, y: number) => {
    if (!currentText.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.font = `${fontSize}px Inter`;
    ctx.fillStyle = textColor;
    ctx.fillText(currentText, x, y);
    saveToHistory();
  };

  const changeBackgroundColor = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    setCanvasColor(color);
    saveToHistory();
  };

  const resizeCanvas = (width: number, height: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  const handleExport = (format: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${design?.name || 'design'}_edited.${format.toLowerCase()}`;

    if (format === 'PNG' || format === 'JPG') {
      link.href = canvas.toDataURL(`image/${format.toLowerCase()}`);
    } else if (format === 'PDF') {
      // PDF export would require a library like jsPDF
      alert('PDF export coming soon!');
      return;
    } else if (format === 'SVG') {
      alert('SVG export coming soon!');
      return;
    }

    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/my-designs"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </a>
              <h1 className="text-xl font-bold text-white">Design Editor</h1>
              <span className="text-sm text-gray-400">{design?.name || 'Untitled Design'}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Undo/Redo */}
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={undo}
                  disabled={historyStep <= 0}
                  className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUturnLeftIcon className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyStep >= history.length - 1}
                  className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUturnRightIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-50">
                  {exportFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-purple-500/20 transition-colors"
                    >
                      Export as {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-6 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-3 rounded-lg transition-all ${selectedTool === tool.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              title={tool.name}
            >
              <tool.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-800/50">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="bg-white rounded-lg shadow-2xl cursor-crosshair max-w-full max-h-full"
            style={{
              cursor: selectedTool === 'color' ? 'crosshair' : selectedTool === 'text' ? 'text' : 'default'
            }}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-6">Properties</h3>

          <div className="space-y-6">
            {/* Resize Tool */}
            {selectedTool === 'resize' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Width</label>
                  <input
                    type="number"
                    defaultValue={canvasRef.current?.width || 800}
                    onChange={(e) => {
                      const height = canvasRef.current?.height || 800;
                      resizeCanvas(Number(e.target.value), height);
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Height</label>
                  <input
                    type="number"
                    defaultValue={canvasRef.current?.height || 800}
                    onChange={(e) => {
                      const width = canvasRef.current?.width || 800;
                      resizeCanvas(width, Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  />
                </div>
              </motion.div>
            )}

            {/* Color Tool */}
            {selectedTool === 'color' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Draw Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Brush Size: {brushSize}px</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={canvasColor}
                    onChange={(e) => changeBackgroundColor(e.target.value)}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                </div>

                {/* Preset Colors */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Preset Colors</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'].map(
                      (color) => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className="w-full aspect-square rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Text Tool */}
            {selectedTool === 'text' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Text Content</label>
                  <textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="Type text here..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white resize-none placeholder-gray-500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-2">Click on canvas to place text</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Font Family</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded text-white [&>option]:bg-gray-900 [&>option]:text-white">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Poppins</option>
                    <option>Montserrat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Font Weight</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded text-white [&>option]:bg-gray-900 [&>option]:text-white">
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Default state */}
            {!selectedTool && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  Select a tool from the sidebar to edit your design
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors">
                Duplicate Design
              </button>
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors">
                Save to Library
              </button>
              <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors">
                Delete Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createDesign, getUserProfileWithPlan, hasEnoughCredits } from '@/lib/database';
import { uploadImageFromUrl } from '@/lib/supabase';
import { applyTextToImage, calculateOptimalFontSize } from '@/lib/textOverlay';
import {
  ArrowPathIcon,
  CloudArrowDownIcon,
  PaintBrushIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Design types
const designTypes = [
  { id: 'logo', name: 'Logo', icon: SparklesIcon, description: 'Brand logos & icons' },
  // { id: 'social', name: 'Social Media', icon: PhotoIcon, description: 'Posts & banners' },
  // { id: 'mobile', name: 'Mobile App', icon: DevicePhoneMobileIcon, description: 'App screens' },
  // { id: 'landing', name: 'Landing Page', icon: GlobeAltIcon, description: 'Web pages' },
  // { id: 'business-card', name: 'Business Card', icon: CreditCardIcon, description: 'Professional cards' },
  // { id: 'flyer', name: 'Flyer/Poster', icon: DocumentTextIcon, description: 'Print materials' },
];

// Style presets
const stylePresets = [
  { id: 'modern', name: 'Modern', colors: ['#6366F1', '#8B5CF6', '#EC4899'] },
  { id: 'corporate', name: 'Corporate', colors: ['#1E40AF', '#0F172A', '#475569'] },
  { id: 'creative', name: 'Creative', colors: ['#F59E0B', '#EF4444', '#8B5CF6'] },
  { id: 'minimalist', name: 'Minimalist', colors: ['#000000', '#FFFFFF', '#9CA3AF'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#EC4899', '#F59E0B', '#10B981'] },
  { id: 'elegant', name: 'Elegant', colors: ['#1F2937', '#D1D5DB', '#9333EA'] },
];

// Format presets
const formatPresets = {
  logo: [
    { name: 'Square', width: 1000, height: 1000 },
  ],
  social: [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
  ],
  mobile: [
    { name: 'iPhone 14', width: 390, height: 844 },
    { name: 'Android', width: 360, height: 800 },
  ],
  landing: [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
  ],
  'business-card': [
    { name: 'Standard (3.5×2)', width: 1050, height: 600 },
    { name: 'Square', width: 1000, height: 1000 },
  ],
  flyer: [
    { name: 'A4', width: 2480, height: 3508 },
    { name: 'Letter', width: 2550, height: 3300 },
  ],
};

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('logo');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [numVariations, setNumVariations] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [userPlanId, setUserPlanId] = useState('free');

  // Text overlay controls
  const [textMode, setTextMode] = useState<'none' | 'manual' | 'ai'>('none'); // none = no text at all
  const [brandText, setBrandText] = useState('');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [addStroke, setAddStroke] = useState(true);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0); // 0.5 to 2.0
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Essential font library (6 professional fonts)
  const fonts = [
    { name: 'Inter', family: 'Inter, system-ui, sans-serif', style: 'Modern & Clean' },
    { name: 'Playfair Display', family: 'Playfair Display, serif', style: 'Elegant & Luxury' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', style: 'Bold & Geometric' },
    { name: 'Poppins', family: 'Poppins, sans-serif', style: 'Friendly & Modern' },
    { name: 'Bebas Neue', family: 'Bebas Neue, cursive', style: 'Compact & Powerful' },
    { name: 'Space Mono', family: 'Space Mono, monospace', style: 'Tech & Retro' },
  ];

  // Track which designs have text overlay applied
  const [designsWithText, setDesignsWithText] = useState<Record<string, string>>({});

  // Fetch user's plan on mount
  useEffect(() => {
    if (user) {
      getUserProfileWithPlan(user.id).then(profile => {
        if (profile) {
          setUserPlanId(profile.plan.id);
        }
      });
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check if user is logged in
    if (!user) {
      alert('Please sign in to generate designs');
      router.push('/auth/login');
      return;
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(user.id, numVariations);
    if (!hasCredits) {
      alert('Insufficient credits! Please upgrade your plan or purchase more credits.');
      router.push('/dashboard');
      return;
    }

    console.log('🚀 Starting generation...');
    console.log('Prompt:', prompt);
    console.log('Type:', selectedType);
    console.log('Style:', selectedStyle);
    console.log('🔍 CRITICAL - Selected Style State:', selectedStyle);

    setIsGenerating(true);
    setShowResults(false);
    setProgressPercent(0);
    setProgressMessage('Preparing your design...');

    try {
      console.log('📡 Sending request to backend...');
      console.log('🌐 Request URL: http://localhost:8000/api/generate');

      // Simulate progress while waiting
      const progressInterval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 90) return 90; // Cap at 90% until actually done
          return prev + 5;
        });
      }, 1000);

      // Update message based on variations
      setTimeout(() => setProgressMessage(`Generating ${numVariations} variation${numVariations > 1 ? 's' : ''}...`), 500);
      setTimeout(() => setProgressMessage('AI is creating your design...'), 3000);
      setTimeout(() => setProgressMessage('Almost there...'), 8000);

      // Get the selected format details
      const formatDetails = formatPresets[selectedType as keyof typeof formatPresets][selectedFormat];

      const requestBody = {
        user_id: user.id, // Get from auth context
        prompt: prompt.trim(),
        design_type: selectedType,
        style: selectedStyle,  // CRITICAL: Must match selected state
        num_variations: numVariations,
        quality: 'high', // Default to high quality (1536x1536)
        brand_text: textMode === 'manual' ? brandText : null,  // Optional text for overlay
        include_text_in_ai: textMode === 'ai',  // Whether AI should generate text
        format: {
          name: formatDetails.name,
          width: formatDetails.width,
          height: formatDetails.height,
        },
      };
      console.log('📦 Request body:', requestBody);
      console.log('🔍 VERIFY - Style being sent:', requestBody.style);

      // Call the backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received:', response.status, response.statusText);

      clearInterval(progressInterval);
      setProgressPercent(95);
      setProgressMessage('Finalizing your designs...');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Generation result:', result);

      setProgressPercent(98);
      setProgressMessage('Saving to your library...');

      // Handle both single and multiple variations
      const designs = [];
      if (result.variations && Array.isArray(result.variations)) {
        // Multiple variations - save each to database
        for (const [index, variation] of result.variations.entries()) {
          // Upload image to Supabase Storage for permanent storage
          const permanentUrl = await uploadImageFromUrl(
            variation.image_url,
            user.id,
            prompt,
            `${selectedType}_${index + 1}`,
            userPlanId
          );

          const savedDesign = await createDesign({
            name: `${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''} (${index + 1})`,
            type: selectedType,
            style: selectedStyle,
            prompt: prompt,
            image_url: permanentUrl,
            thumbnail_url: permanentUrl,
            width: formatDetails.width,
            height: formatDetails.height,
            format: 'png',
            model_used: variation.model_used,
            generation_time_ms: variation.generation_time_ms,
            credits_used: 1,
            metadata: {
              variation_number: variation.variation_number || (index + 1),
              text_mode: textMode,
              brand_text: brandText || null
            }
          });

          designs.push({
            id: savedDesign?.id || `design-${Date.now()}-${index}`,
            url: permanentUrl,
            prompt: variation.prompt || prompt,
            type: selectedType,
            style: selectedStyle,
            format: formatDetails,
            success: variation.success,
            model: variation.model_used,
            credit_cost: 1,
            variation_number: variation.variation_number || (index + 1),
          });
        }
      } else {
        // Single design
        // Upload image to Supabase Storage for permanent storage
        const permanentUrl = await uploadImageFromUrl(
          result.image_url,
          user.id,
          prompt,
          selectedType,
          userPlanId
        );

        const savedDesign = await createDesign({
          name: `${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`,
          type: selectedType,
          style: selectedStyle,
          prompt: prompt,
          image_url: permanentUrl,
          thumbnail_url: permanentUrl,
          width: formatDetails.width,
          height: formatDetails.height,
          format: 'png',
          model_used: result.model_used,
          generation_time_ms: result.generation_time_ms,
          credits_used: 1,
          metadata: {
            text_mode: textMode,
            brand_text: brandText || null
          }
        });

        designs.push({
          id: savedDesign?.id || `design-${Date.now()}`,
          url: permanentUrl,
          prompt: result.prompt || prompt,
          type: selectedType,
          style: selectedStyle,
          format: formatDetails,
          success: result.success,
          model: result.model_used,
          credit_cost: 1,
        });
      }

      setGeneratedDesigns(designs);
      setProgressPercent(100);
      setProgressMessage('Complete!');
      setShowResults(true);
    } catch (error) {
      console.error('❌ Generation failed:', error);
      alert('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply text overlay to a specific design
  const handleApplyText = async (designId: string, imageUrl: string) => {
    if (!brandText) return;

    try {
      console.log('📝 Applying text overlay to design:', designId);

      const baseFontSize = calculateOptimalFontSize(1536, 1536, brandText.length);
      const adjustedFontSize = baseFontSize * fontSizeMultiplier;

      const config = {
        text: brandText,
        fontFamily: selectedFont || 'Inter',
        fontSize: adjustedFontSize,
        color: textColor,
        position: textPosition,
        // PROFESSIONAL DEFAULTS: subtle outline, auto-calculated
        strokeColor: addStroke ? (textColor === '#FFFFFF' ? '#000000' : '#FFFFFF') : undefined,
        strokeWidth: addStroke ? 1 : undefined, // Will be auto-calculated in textOverlay.ts
      };

      const imageWithText = await applyTextToImage(imageUrl, config);

      // Update state with text-overlaid version
      setDesignsWithText(prev => ({
        ...prev,
        [designId]: imageWithText
      }));

      console.log('✅ Text overlay applied successfully');
    } catch (error) {
      console.error('❌ Failed to apply text overlay:', error);
      alert('Failed to apply text. Please try again.');
    }
  };

  // Apply text to all designs at once
  const handleApplyTextToAll = async () => {
    if (!brandText || generatedDesigns.length === 0) return;

    for (const design of generatedDesigns) {
      await handleApplyText(design.id, design.url);
    }
  };

  // Remove text overlay from a specific design (UNDO)
  const handleRemoveText = (designId: string) => {
    setDesignsWithText(prev => {
      const updated = { ...prev };
      delete updated[designId];
      return updated;
    });
    console.log('🔄 Text overlay removed from design:', designId);
    console.log('✅ Design restored to original state');
  };

  // Remove text from all designs
  const handleRemoveTextFromAll = () => {
    setDesignsWithText({});
    console.log('🔄 Text overlay removed from all designs');
  };

  // Generate live preview of text placement
  const handleGeneratePreview = async () => {
    if (!brandText || generatedDesigns.length === 0) return;

    try {
      setShowPreview(true);
      const firstDesign = generatedDesigns[0];
      const baseFontSize = calculateOptimalFontSize(1536, 1536, brandText.length);
      const adjustedFontSize = baseFontSize * fontSizeMultiplier;

      const config = {
        text: brandText,
        fontFamily: selectedFont || 'Inter',
        fontSize: adjustedFontSize,
        color: textColor,
        position: textPosition,
        strokeColor: addStroke ? (textColor === '#FFFFFF' ? '#000000' : '#FFFFFF') : undefined,
        strokeWidth: addStroke ? 1 : undefined,
      };

      const preview = await applyTextToImage(firstDesign.url, config);
      setPreviewImage(preview);
      console.log('👁️ Live preview generated');
    } catch (error) {
      console.error('❌ Failed to generate preview:', error);
    }
  };

  const handleDownload = async (design: any) => {
    try {
      console.log('🔽 Downloading design:', design.id);

      // Use text-overlaid version if available, otherwise original
      const imageToDownload = designsWithText[design.id] || design.url;

      if (designsWithText[design.id]) {
        // Text-overlaid version is already a data URL, download directly
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `pixova_${design.type}_${brandText || 'logo'}_${design.variation_number || 1}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Downloaded text-overlaid version');
      } else {
        // Original version - use backend proxy endpoint for better CORS support
        const downloadUrl = `http://localhost:8000/api/download?url=${encodeURIComponent(imageToDownload)}`;
        const response = await fetch(downloadUrl);
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pixova_${design.type}_${design.variation_number || 1}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Downloaded original version');
      }
    } catch (error) {
      console.error('❌ Download failed:', error);
      // Fallback: open in new tab
      window.open(design.url, '_blank');
    }
  };

  const currentFormats = formatPresets[selectedType as keyof typeof formatPresets] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-white">AI Design Generator</h1>
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
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Step 1: Design Type */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-sm">1</span>
                  Choose Design Type
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {designTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setSelectedFormat(0);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${selectedType === type.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <type.icon className={`w-8 h-8 mx-auto mb-2 ${selectedType === type.id ? 'text-purple-400' : 'text-gray-400'
                        }`} />
                      <p className="text-sm font-medium text-white text-center">{type.name}</p>
                      <p className="text-xs text-gray-400 text-center mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Style Preset */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-sm">2</span>
                  Select Style
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {stylePresets.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${selectedStyle === style.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex gap-1 mb-2">
                        {style.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-full h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-white text-center">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Format */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-sm">3</span>
                  Choose Format
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {currentFormats.map((format, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFormat(index)}
                      className={`p-4 rounded-lg border-2 transition-all ${selectedFormat === index
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <p className="text-sm font-medium text-white text-center">{format.name}</p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        {format.width} × {format.height}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Prompt */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-sm">4</span>
                  Describe Your Design
                </h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'A modern tech startup logo with blue and purple colors, minimalist design with abstract geometric shapes'"
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-400">
                      Variations:
                      <select
                        value={numVariations}
                        onChange={(e) => setNumVariations(Number(e.target.value))}
                        className="ml-2 px-3 py-1 bg-gray-900 border border-white/10 rounded text-white [&>option]:bg-gray-900 [&>option]:text-white"
                      >
                        <option value={1}>1</option>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    {prompt.length} / 500 characters
                  </p>
                </div>
              </div>

              {/* Step 5: Text Overlay Controls */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-sm">5</span>
                  Text Handling
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                    ⚡ Fix AI Typos
                  </span>
                </h2>

                {/* Toggle: No Text / Manual Text / AI Text */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTextMode('none')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${textMode === 'none'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${textMode === 'none' ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                          }`}>
                          {textMode === 'none' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <h3 className="font-semibold text-white text-sm">No Text</h3>
                      </div>
                      <p className="text-xs text-gray-300">
                        Clean icon only, no text at all
                      </p>
                    </button>

                    <button
                      onClick={() => setTextMode('manual')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${textMode === 'manual'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${textMode === 'manual' ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                          }`}>
                          {textMode === 'manual' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <h3 className="font-semibold text-white text-sm">Add My Text</h3>
                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-300 rounded-full">Best</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Perfect text, no typos
                      </p>
                    </button>

                    <button
                      onClick={() => setTextMode('ai')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${textMode === 'ai'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${textMode === 'ai' ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                          }`}>
                          {textMode === 'ai' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <h3 className="font-semibold text-white text-sm">AI Text</h3>
                      </div>
                      <p className="text-xs text-gray-300">
                        May have typos
                      </p>
                    </button>
                  </div>

                  {/* Custom Text Input (shown when manual mode selected) */}
                  {textMode === 'manual' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Brand Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={brandText}
                          onChange={(e) => setBrandText(e.target.value.slice(0, 50))}
                          placeholder="e.g., LUXURY, TechCorp, StartupName"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">{brandText.length} / 50 characters</p>
                      </div>

                      {/* Font Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Font Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {fonts.map((font) => (
                            <button
                              key={font.name}
                              onClick={() => setSelectedFont(font.name)}
                              className={`p-3 rounded-lg border transition-all text-left ${selectedFont === font.name
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                            >
                              <div className="text-sm font-semibold text-white" style={{ fontFamily: font.family }}>
                                {font.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {font.style}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {brandText && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              Position
                              <span className="text-xs text-gray-500 font-normal">(Auto-adjusts for best fit)</span>
                            </label>
                            <div className="flex gap-2">
                              {(['top', 'center', 'bottom'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  onClick={() => setTextPosition(pos)}
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-all ${textPosition === pos
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                  {pos}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Smart layout detects icon position
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Text Color
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-12 h-10 rounded border border-white/10 cursor-pointer bg-white/10"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setTextColor('#FFFFFF')}
                                  className={`px-3 py-2 rounded text-sm transition-all ${textColor === '#FFFFFF'
                                    ? 'bg-white text-black font-semibold'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                  White
                                </button>
                                <button
                                  onClick={() => setTextColor('#000000')}
                                  className={`px-3 py-2 rounded text-sm transition-all border border-white/20 ${textColor === '#000000'
                                    ? 'bg-black text-white font-semibold'
                                    : 'bg-black/20 text-white hover:bg-black/40'
                                    }`}
                                >
                                  Black
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Current: {textColor}</p>
                          </div>
                        </div>
                      )}

                      {brandText && (
                        <>
                          {/* Font Size Slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
                              <span>Font Size</span>
                              <span className="text-xs text-purple-400 font-mono">
                                {fontSizeMultiplier.toFixed(1)}x {fontSizeMultiplier < 1 ? '(Smaller)' : fontSizeMultiplier > 1 ? '(Larger)' : '(Default)'}
                              </span>
                            </label>
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={fontSizeMultiplier}
                                onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Smaller (0.5x)</span>
                                <span>Default (1.0x)</span>
                                <span>Larger (2.0x)</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Adjusts text size while maintaining perfect padding
                            </p>
                          </div>

                          {/* Stroke Toggle */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="addStroke"
                              checked={addStroke}
                              onChange={(e) => setAddStroke(e.target.checked)}
                              className="w-4 h-4 rounded border-white/20"
                            />
                            <label htmlFor="addStroke" className="text-sm text-gray-300">
                              Add text outline for better visibility
                            </label>
                          </div>

                          {/* Live Preview Button */}
                          <div className="pt-2 border-t border-white/10">
                            <button
                              onClick={handleGeneratePreview}
                              disabled={generatedDesigns.length === 0}
                              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview Text Placement
                            </button>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                              See how your text will look before applying to all designs
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Preview Modal */}
                {showPreview && previewImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPreview(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-2xl w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Live Preview
                        </h3>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="w-6 h-6 text-gray-400" />
                        </button>
                      </div>
                      <div className="aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={previewImage}
                          alt="Text overlay preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-sm text-purple-200">
                          <strong>Text:</strong> {brandText} • <strong>Font:</strong> {selectedFont} • <strong>Size:</strong> {fontSizeMultiplier.toFixed(1)}x • <strong>Position:</strong> {textPosition}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => setShowPreview(false)}
                          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            handleApplyTextToAll();
                            setShowPreview(false);
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all"
                        >
                          Apply to All Designs
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6" />
                      Generate Design{numVariations > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              </div>

              {/* Progress Indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 max-w-md mx-auto space-y-3"
                >
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] animate-shimmer"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Progress Text */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{progressMessage}</span>
                    <span className="text-purple-400 font-semibold">{progressPercent}%</span>
                  </div>

                  {/* Variation Counter (if multiple) */}
                  {numVariations > 1 && (
                    <div className="text-center text-xs text-gray-400">
                      Generating {numVariations} variations
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Generated Designs</h2>
                  <p className="text-gray-400">
                    {generatedDesigns.length} variation{generatedDesigns.length > 1 ? 's' : ''} based on your prompt
                  </p>
                </div>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Create New Design
                </button>
              </div>

              {/* Text Overlay Controls (if manual text mode is enabled and text is provided) */}
              {textMode === 'manual' && brandText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        Text Overlay Ready
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Click "Add Text" on any design to overlay "{brandText}" with perfect typography
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApplyTextToAll}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Apply to All
                      </button>
                      {Object.keys(designsWithText).length > 0 && (
                        <button
                          onClick={handleRemoveTextFromAll}
                          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-lg transition-colors border border-red-500/30 flex items-center gap-2"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          Undo All ({Object.keys(designsWithText).length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Text Preview */}
                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Preview Settings:</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-white/10 rounded">Text: {brandText}</span>
                        <span className="px-2 py-1 bg-white/10 rounded">Position: {textPosition}</span>
                        <span className="px-2 py-1 bg-white/10 rounded">
                          Color: <span style={{ color: textColor }}>●</span> {textColor}
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded">Font: {selectedFont}</span>
                        {addStroke && <span className="px-2 py-1 bg-white/10 rounded">✓ With Outline</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generated Designs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedDesigns.map((design, index) => (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group"
                  >
                    <div className="aspect-square bg-white/10 relative overflow-hidden">
                      {/* Show text-overlaid version if available, otherwise original */}
                      <img
                        key={designsWithText[design.id] ? `text-${design.id}` : `original-${design.id}`}
                        src={designsWithText[design.id] || design.url}
                        alt={`Generated design ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', {
                            designId: design.id,
                            hasTextOverlay: !!designsWithText[design.id],
                            currentSrc: e.currentTarget.src,
                            originalUrl: design.url
                          });
                          // Fallback: if text overlay fails, try original
                          if (designsWithText[design.id] && e.currentTarget.src !== design.url) {
                            console.log('🔄 Falling back to original URL');
                            e.currentTarget.src = design.url;
                          }
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', {
                            designId: design.id,
                            hasTextOverlay: !!designsWithText[design.id],
                            source: designsWithText[design.id] ? 'text-overlay' : 'original'
                          });
                        }}
                      />
                      {/* Badge showing if text was applied */}
                      {designsWithText[design.id] ? (
                        <div className="absolute top-2 left-2 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                          ✓ With Text
                          <span className="text-[10px] opacity-80">(Click ✕ to undo)</span>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 px-3 py-1.5 bg-gray-700/80 text-white text-xs font-medium rounded-full shadow-lg">
                          Original
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(design)}
                          className="p-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                          title="Download"
                        >
                          <CloudArrowDownIcon className="w-6 h-6 text-white" />
                        </button>
                        {textMode === 'manual' && brandText && (
                          <>
                            <button
                              onClick={() => handleApplyText(design.id, design.url)}
                              className={`p-3 rounded-lg transition-colors ${designsWithText[design.id]
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-white/20 hover:bg-white/30'
                                }`}
                              title={designsWithText[design.id] ? 'Text Applied' : 'Add Text Overlay'}
                            >
                              <PaintBrushIcon className="w-6 h-6 text-white" />
                            </button>
                            {designsWithText[design.id] && (
                              <button
                                onClick={() => handleRemoveText(design.id)}
                                className="p-3 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
                                title="Undo - Remove Text & Reset"
                              >
                                <XMarkIcon className="w-6 h-6 text-white" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-400 mb-2">
                        {design.format.name} • {design.style}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {design.prompt}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
          }
        </AnimatePresence >
      </main >
    </div >
  );
}

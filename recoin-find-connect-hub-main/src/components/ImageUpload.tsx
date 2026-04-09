import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { imageApi } from "@/services/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, isAI?: boolean) => void;
  description?: string;
  title?: string;
  category?: string;
  label?: string;
}

// Local SVG fallback when backend is offline
function generateSVGPlaceholder(description: string, title: string): string {
  const colors: Record<string, string[]> = {
    black: ['#1a1a2e', '#16213e'], white: ['#e8e8e8', '#d0d0d0'],
    red: ['#7f1d1d', '#991b1b'], blue: ['#1e3a5f', '#1d4ed8'],
    green: ['#14532d', '#15803d'], yellow: ['#713f12', '#a16207'],
    purple: ['#4a1d96', '#6d28d9'], gray: ['#374151', '#4b5563'],
    silver: ['#6b7280', '#9ca3af'], gold: ['#78350f', '#d97706'],
  };
  const items: Record<string, string> = {
    laptop: '💻', macbook: '💻', phone: '📱', mobile: '📱', samsung: '📱', iphone: '📱',
    bag: '🎒', backpack: '🎒', wallet: '👛', key: '🔑', keys: '🔑',
    ring: '💍', watch: '⌚', book: '📚', glasses: '👓', headphone: '🎧',
    charger: '🔌', tablet: '📱', card: '💳', bottle: '🍶',
  };
  const text = `${description} ${title}`.toLowerCase();
  let emoji = '📦';
  for (const [k, v] of Object.entries(items)) { if (text.includes(k)) { emoji = v; break; } }
  let bg1 = '#1e3a5f', bg2 = '#0f172a';
  for (const [k, v] of Object.entries(colors)) { if (text.includes(k)) { [bg1, bg2] = v; break; } }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
    </linearGradient></defs>
    <rect width="300" height="200" fill="url(#bg)" rx="12"/>
    <text x="150" y="95" font-size="60" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="150" y="155" font-size="11" fill="#94a3b8" text-anchor="middle" font-family="system-ui">AI Generated Preview</text>
    <text x="150" y="172" font-size="9" fill="#64748b" text-anchor="middle" font-family="system-ui">✨ Based on description</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, description = '', title = '', category = '', label = 'Item Image' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [isAI, setIsAI] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setIsAI(false); onChange(reader.result as string, false); };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Try backend Gemini API first
      const url = await imageApi.generate(title, description, category);
      if (url) {
        setIsAI(true);
        onChange(url, true);
      } else {
        // Fallback to local SVG
        const svg = generateSVGPlaceholder(description, title);
        setIsAI(true);
        onChange(svg, true);
      }
    } catch {
      const svg = generateSVGPlaceholder(description, title);
      setIsAI(true);
      onChange(svg, true);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="relative">
          <img src={value} alt="Item" className="w-full h-40 object-cover rounded-lg border border-border/50" />
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 bg-background/80"
            onClick={() => { setIsAI(false); onChange('', false); }}>
            <X className="h-3 w-3" />
          </Button>
          {isAI && (
            <span className="absolute bottom-2 left-2 text-xs bg-primary/80 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Generated
            </span>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center space-y-3">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Upload a photo or let AI generate one</p>
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleGenerate}
              disabled={generating || (!description && !title)}
              className="border-primary/50 text-primary hover:bg-primary/10">
              {generating ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</> : <><Sparkles className="h-3 w-3 mr-1" /> AI Generate</>}
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

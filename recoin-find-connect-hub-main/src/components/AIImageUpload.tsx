import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Sparkles, Loader2, Image as ImageIcon, Wand2 } from 'lucide-react';
import { imageApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AIImageUploadProps {
  onImageSelect: (image: string, analysis?: any) => void;
  itemDetails?: {
    title: string;
    description: string;
    category: string;
  };
}

const AIImageUpload: React.FC<AIImageUploadProps> = ({ onImageSelect, itemDetails }) => {
  const [image, setImage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      onImageSelect(base64);

      // Analyze image with AI
      setIsAnalyzing(true);
      try {
        const result = await imageApi.analyze(base64);
        if (result?.success) {
          setAnalysis(result);
          toast({
            title: '🤖 AI Analysis Complete',
            description: 'Image analyzed successfully',
          });
        }
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!itemDetails) {
      toast({
        title: 'Missing Details',
        description: 'Please provide item title and category first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await imageApi.generate(
        itemDetails.title,
        itemDetails.description,
        itemDetails.category
      );

      if (result) {
        setImage(result);
        onImageSelect(result);
        toast({
          title: '✨ Image Generated',
          description: 'AI-generated placeholder created',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="glass">
        <CardContent className="p-6">
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium mb-1">Click to upload image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={image}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setImage('');
                  setAnalysis(null);
                }}
                className="absolute top-2 right-2"
              >
                Change
              </Button>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Analyzing with AI...</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {analysis?.description && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">AI Analysis</p>
                <p className="text-xs text-muted-foreground">{analysis.description}</p>
                {analysis.features && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.features.colors?.map((color: string) => (
                      <span
                        key={color}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Placeholder */}
      {!image && itemDetails && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">— or —</p>
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate AI Placeholder
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIImageUpload;

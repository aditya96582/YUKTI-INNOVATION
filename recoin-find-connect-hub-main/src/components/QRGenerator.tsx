import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";

interface QRGeneratorProps {
  itemId: string;
  itemTitle: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ itemId, itemTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      const url = `${window.location.origin}/lost-items?scan=${itemId}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        color: { dark: '#60a5fa', light: '#0f172a' },
        margin: 2,
      });
    }
  }, [open, itemId]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qr-${itemId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <QrCode className="h-3 w-3" /> QR
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong max-w-xs text-center">
        <DialogHeader>
          <DialogTitle className="text-sm">QR Code</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-3 truncate">{itemTitle}</p>
        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <p className="text-xs text-muted-foreground mb-3">Attach this to your item. Finder scans → you get notified instantly.</p>
        <Button onClick={handleDownload} size="sm" className="w-full gap-2">
          <Download className="h-4 w-4" /> Download QR
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QRGenerator;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, ScanLine } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';

interface QRScannerModalProps {
  onScan: (result: string) => void;
  trigger?: React.ReactNode;
}

export function QRScannerModal({ onScan, trigger }: QRScannerModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary">
            <QrCode className="size-4" />
            Scan QR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md border-white/10 bg-[#0a0a0a]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5 text-primary" />
            Scan Member QR
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-xl overflow-hidden border border-white/10 relative bg-black/50 aspect-square flex items-center justify-center">
          {open ? (
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  const scannedValue = result[0].rawValue;
                  setOpen(false);
                  onScan(scannedValue);
                }
              }}
              onError={(error: any) => {
                // Ignore AbortErrors that happen when the camera is quickly unmounted
                if (error?.name === 'AbortError' || error?.message?.includes('play() request was interrupted')) {
                  return;
                }
                
                console.error("Camera Error:", error);
                if (error?.name === 'NotAllowedError') {
                  toast.error("Camera permission denied. Please allow camera access in your browser settings.");
                } else if (error?.message?.includes('getUserMedia')) {
                  toast.error("Camera blocked: Mobile browsers require HTTPS to use the camera. Try using localhost or a secure tunnel (like ngrok).");
                } else {
                  toast.error("Unable to access camera. Please check permissions.");
                }
              }}
            />
          ) : (
             <div className="text-muted-foreground text-sm">Initializing camera...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

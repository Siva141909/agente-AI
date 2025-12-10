import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
}

const VoiceModal = ({ open, onClose }: VoiceModalProps) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (open) {
      setIsListening(true);
      const timer = setTimeout(() => {
        setIsListening(false);
        setTimeout(onClose, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Speak Now</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-12 h-12 text-primary" />
            </div>
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-primary/20"
              />
            )}
          </motion.div>
          <p className="mt-6 text-muted-foreground text-center">
            {isListening ? "Listening..." : "Processing..."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Say something like "I spent 150 on lunch"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceModal;

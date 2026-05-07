import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
}

const ScanModal = ({ open, onClose }: ScanModalProps) => {
  const [scanned, setScanned] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTimeout(() => {
        setScanned(true);
        toast.success("Bill scanned successfully!");
      }, 1500);
    }
  };

  const handleClose = () => {
    setScanned(false);
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>
        <div className="py-8">
          <AnimatePresence mode="wait">
            {!scanned ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Upload className="w-16 h-16 text-muted-foreground" />
                  </div>
                </label>
                <p className="mt-4 text-muted-foreground">
                  {file ? "Processing..." : "Tap to upload receipt"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-success" />
                </div>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant:</span>
                    <span className="font-semibold">Big Bazaar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-expense">₹850</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold">Groceries</span>
                  </div>
                </div>
                <Button className="w-full bg-primary" onClick={handleClose}>
                  Add Transaction
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanModal;

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    className?: string;
}

export function ImageUpload({ images, onChange, maxImages = 5, className }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processingCount, setProcessingCount] = useState(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFiles(Array.from(e.target.files));
        }
        // Reset input for same file selection
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processFiles = async (files: File[]) => {
        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) return;

        const filesToProcess = files.slice(0, remainingSlots);
        setProcessingCount(prev => prev + filesToProcess.length);

        const newImages: string[] = [];

        for (const file of filesToProcess) {
            if (!file.type.startsWith('image/')) continue;
            try {
                const base64 = await compressImage(file);
                newImages.push(base64);
            } catch (error) {
                console.error("Image processing error", error);
            }
        }

        onChange([...images, ...newImages]);
        setProcessingCount(prev => Math.max(0, prev - filesToProcess.length));
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] group",
                    isDragging
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]"
                        : "border-slate-200 hover:border-[var(--primary)] hover:bg-slate-50",
                    images.length >= maxImages ? "opacity-50 cursor-not-allowed hidden" : ""
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => images.length < maxImages && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={images.length >= maxImages}
                />

                <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {processingCount > 0 ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-700 mb-1">
                    {processingCount > 0 ? "Processing..." : "Click or Drag Photos Here"}
                </h3>
                <p className="text-sm text-slate-400">
                    Up to {maxImages} photos (JPG/PNG)
                </p>
                <p className="text-xs text-[var(--accent)] mt-2 font-medium">
                    {images.length} / {maxImages} Photos Selected
                </p>
            </div>

            {/* Preview Grid */}
            <AnimatePresence>
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    >
                        {images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                                className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 shadow-sm group"
                            >
                                <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    Photo {idx + 1}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

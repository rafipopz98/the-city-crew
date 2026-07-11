"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  allImages?: string[];
}

export const ImageLightbox = ({
  src,
  alt,
  caption,
  allImages = [src],
}: ImageLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Thumbnail */}
      <figure
        className="relative group cursor-pointer"
        onClick={() => openLightbox()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="w-full rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-2xl flex items-center justify-center">
          <ZoomIn
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            size={32}
          />
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-[#06182e]/50 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={32} />
          </button>

          {/* Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight size={48} />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh] relative">
            <Image
              src={allImages[currentIndex]}
              alt={alt}
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {caption && (
              <p className="text-center text-white/70 mt-4 text-sm">
                {caption}
              </p>
            )}
          </div>

          {/* Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

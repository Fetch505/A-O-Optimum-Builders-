"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface FolderData {
  id: string;
  images: string[];
  thumbnail: string;
}

const MediaSection: React.FC = () => {
  const pathname = usePathname();
  const service = pathname.split("/").pop()?.toLowerCase();
  const capitalized = service
    ? service.charAt(0).toUpperCase() + service.slice(1)
    : "";

  const imageBase = `/categories/image/${capitalized}`;
  
  // State management
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [flatImages, setFlatImages] = useState<string[]>([]);
  const [isNested, setIsNested] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const MAX_FOLDERS = 50;
  const MAX_IMAGES_PER_FOLDER = 200;
  const MAX_FLAT_IMAGES = 200;

  const videos = useMemo(
    () => [
      { name: "Kitchen", src: "/categories/video/Kitchen.mp4" },
      { name: "Concrete", src: "/categories/video/Concrete.mp4" },
    ],
    []
  );

  const matchedVideo = useMemo(
    () => videos.find((v) => v.name.toLowerCase() === service),
    [videos, service]
  );

  // Check if structure is nested or flat
  const detectStructure = useCallback(async () => {
    setIsLoading(true);
    
    // First, try to detect nested structure (folder/image pattern)
    let foundNested = false;
    const detectedFolders: FolderData[] = [];

    for (let folderId = 1; folderId <= MAX_FOLDERS; folderId++) {
      const testUrl = `${imageBase}/${folderId}/1.jpg`;
      
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = testUrl;
        });
        
        foundNested = true;
        
        // Load all images in this folder
        const folderImages: string[] = [];
        for (let imgId = 1; imgId <= MAX_IMAGES_PER_FOLDER; imgId++) {
          const imgUrl = `${imageBase}/${folderId}/${imgId}.jpg`;
          try {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = imgUrl;
            });
            folderImages.push(`${imgId}.jpg`);
          } catch {
            break;
          }
        }
        
        if (folderImages.length > 0) {
          detectedFolders.push({
            id: String(folderId),
            images: folderImages,
            thumbnail: `${folderId}/1.jpg`
          });
        }
      } catch {
        if (folderId === 1) {
          // If folder 1 doesn't exist, it's likely a flat structure
          break;
        }
        // If we found folders before but this one doesn't exist, we're done
        if (foundNested) {
          break;
        }
      }
    }

    if (foundNested && detectedFolders.length > 0) {
      setIsNested(true);
      setFolders(detectedFolders);
      setIsLoading(false);
      return;
    }

    // Fallback to flat structure
    const flatImgs: string[] = [];
    for (let i = 1; i <= MAX_FLAT_IMAGES; i++) {
      const url = `${imageBase}/${i}.jpg`;
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        });
        flatImgs.push(`${i}.jpg`);
      } catch {
        break;
      }
    }

    setIsNested(false);
    setFlatImages(flatImgs);
    setIsLoading(false);
  }, [imageBase]);

  useEffect(() => {
    detectStructure();
  }, [detectStructure]);

  // Modal controls
  const openModal = (folderId: string, startIndex: number = 0) => {
    setSelectedFolder(folderId);
    setCurrentImageIndex(startIndex);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedFolder(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "";
  };

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFolder) return;
    
    const folder = folders.find(f => f.id === selectedFolder);
    if (folder) {
      setCurrentImageIndex((prev) => (prev + 1) % folder.images.length);
    }
  }, [selectedFolder, folders]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFolder) return;
    
    const folder = folders.find(f => f.id === selectedFolder);
    if (folder) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + folder.images.length) % folder.images.length
      );
    }
  }, [selectedFolder, folders]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedFolder) return;
      
      if (e.key === "ArrowRight") {
        const folder = folders.find(f => f.id === selectedFolder);
        if (folder) {
          setCurrentImageIndex((prev) => (prev + 1) % folder.images.length);
        }
      } else if (e.key === "ArrowLeft") {
        const folder = folders.find(f => f.id === selectedFolder);
        if (folder) {
          setCurrentImageIndex((prev) => 
            (prev - 1 + folder.images.length) % folder.images.length
          );
        }
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedFolder, folders]);

  // Get current modal image
  const currentModalImage = useMemo(() => {
    if (!selectedFolder) return null;
    const folder = folders.find(f => f.id === selectedFolder);
    if (!folder) return null;
    return `${imageBase}/${selectedFolder}/${folder.images[currentImageIndex]}`;
  }, [selectedFolder, currentImageIndex, folders, imageBase]);

  const currentFolder = useMemo(() => 
    folders.find(f => f.id === selectedFolder),
    [folders, selectedFolder]
  );

  // Render loading state
  if (isLoading) {
    return (
      <section className="w-full outerPadding flex flex-col justify-between">
        <main className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
            <p className="text-gray-600 font-medium">Loading media...</p>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex flex-col">
        {/* Video or First Image */}
        {matchedVideo ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video object-cover"
            >
              <source src={matchedVideo.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        ) : isNested && folders.length > 0 ? (
          <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
            onClick={() => openModal(folders[0].id, 0)}
          >
            <img
              src={`${imageBase}/${folders[0].thumbnail}`}
              alt={`${capitalized} preview`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 group-hover:from-black/60 transition-all duration-300" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm font-medium opacity-90 mb-1">Collection {folders[0].id}</p>
              <p className="text-2xl font-bold">{folders[0].images.length} Photos</p>
            </div>
          </div>
        ) : flatImages.length > 0 ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={`${imageBase}/${flatImages[0]}`}
              alt={`${capitalized} preview`}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>
        ) : null}

        {/* Thumbnail Grid - Show first image from each folder (nested) or first 3 images (flat) */}
        {isNested && folders.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.slice(1, 4).map((folder) => (
              <div
                key={folder.id}
                className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                onClick={() => openModal(folder.id, 0)}
              >
                <img
                  src={`${imageBase}/${folder.thumbnail}`}
                  alt={`Collection ${folder.id}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:from-black/70 transition-all duration-300" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-medium opacity-90 mb-0.5">Collection {folder.id}</p>
                  <p className="text-lg font-bold">{folder.images.length} Photos</p>
                </div>
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-xl transition-all duration-300" />
              </div>
            ))}
          </div>
        )}

        {!isNested && flatImages.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flatImages.slice(1, 4).map((file, idx) => (
              <div
                key={idx}
                className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <img
                  src={`${imageBase}/${file}`}
                  alt={`${capitalized} ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Enhanced Image Modal */}
      {selectedFolder && currentModalImage && currentFolder && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex items-center justify-between z-10">
              <div className="text-white">
                <p className="text-sm md:text-base font-medium opacity-75">Collection {selectedFolder}</p>
                <p className="text-lg md:text-xl font-bold">
                  {currentImageIndex + 1} / {currentFolder.images.length}
                </p>
              </div>
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90"
                onClick={closeModal}
                aria-label="Close"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {currentFolder.images.length > 1 && (
              <>
                <button
                  className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 z-10"
                  onClick={handlePrev}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 z-10"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={currentModalImage}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-h-[80vh] max-w-full rounded-lg md:rounded-2xl shadow-2xl object-contain animate-fadeIn"
                style={{ animationDuration: "0.2s" }}
              />
            </div>

            {/* Bottom Navigation Dots */}
            {currentFolder.images.length > 1 && currentFolder.images.length <= 20 && (
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {currentFolder.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      idx === currentImageIndex
                        ? "bg-white w-8"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaSection;
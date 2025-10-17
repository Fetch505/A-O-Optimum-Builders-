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
  const heroimageBase = `/categories/Hero/${capitalized}`;
  
  // State management
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [flatImages, setFlatImages] = useState<string[]>([]);
  const [isNested, setIsNested] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  
  // Modal state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const MAX_FOLDERS = 10;
  const MAX_IMAGES_PER_FOLDER = 50;
  const MAX_FLAT_IMAGES = 50;
  
  // Supported image extensions
  const IMAGE_EXTENSIONS = ['.webp','.jpg', '.jpeg', '.png'];

  const videos = useMemo(
    () => [
      { name: "kitchen", src: "/categories/video/Kitchen.webm" },
      { name: "countertops", src: "/categories/video/Countertops.webm" },
    ],
    []
  );

  const matchedVideo = useMemo(
    () => videos.find((v) => v.name === service),
    [videos, service]
  );

  // Helper function to check if an image exists (with timeout)
  const checkImageExists = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      img.src = url;
    });
  }, []);


  



  // Load hero image from static route
  const loadHeroImage = useCallback(async () => {
    // Try to load hero image from /categories/video/{Service}.mp4 (video) or /categories/image/{Service}/hero.*
    if (matchedVideo) {
      setHeroImage(matchedVideo.src);
      return;
    }

    // Try to find a hero image
    for (const ext of IMAGE_EXTENSIONS) {
      const heroUrl = `${heroimageBase}${ext}`;
      if (await checkImageExists(heroUrl)) {
        setHeroImage(heroUrl);
        return;
      }
    }
  }, [imageBase, checkImageExists, matchedVideo]);

  // Check if structure is nested or flat
  const detectStructure = useCallback(async () => {
    console.log('Starting detection for:', capitalized);
    console.log('Image base path:', imageBase);
    setIsLoading(true);
    
    // Load hero image first
    await loadHeroImage();
    
    // First, try to detect nested structure by checking multiple folders in parallel
    const folderChecks = [];
    for (let folderId = 1; folderId <= Math.min(5, MAX_FOLDERS); folderId++) {
      const testUrl = `${imageBase}/${folderId}/1${IMAGE_EXTENSIONS[0]}`;
      folderChecks.push(
        checkImageExists(testUrl).then(exists => ({ folderId, exists }))
      );
    }
    
    const folderResults = await Promise.all(folderChecks);
    const validFolders = folderResults.filter(r => r.exists).map(r => r.folderId);
    
    console.log('Valid folders found:', validFolders);
    
    if (validFolders.length > 0) {
      // Found nested structure - load all folders
      const detectedFolders: FolderData[] = [];
      
      for (let folderId = 1; folderId <= MAX_FOLDERS; folderId++) {
        // Try all extensions for first image
        let firstImageFound = false;
        let firstImageName = '';
        
        for (const ext of IMAGE_EXTENSIONS) {
          const testUrl = `${imageBase}/${folderId}/1${ext}`;
          if (await checkImageExists(testUrl)) {
            firstImageFound = true;
            firstImageName = `1${ext}`;
            break;
          }
        }
        
        if (!firstImageFound) {
          if (folderId === 1) break;
          if (detectedFolders.length > 0) break;
          continue;
        }
        
        // Load images for this folder in batches
        const folderImages: string[] = [firstImageName];
        
        // Check images 2-10 in parallel
        const imageChecks = [];
        for (let imgId = 2; imgId <= Math.min(10, MAX_IMAGES_PER_FOLDER); imgId++) {
          for (const ext of IMAGE_EXTENSIONS) {
            imageChecks.push(
              checkImageExists(`${imageBase}/${folderId}/${imgId}${ext}`)
                .then(exists => ({ imgId, ext, exists }))
            );
            break;
          }
        }
        
        const imageResults = await Promise.all(imageChecks);
        const validImages = imageResults.filter(r => r.exists);
        
        for (const img of validImages) {
          folderImages.push(`${img.imgId}${img.ext}`);
        }
        
        // Continue checking sequentially if we found 10 images
        if (folderImages.length >= 10) {
          for (let imgId = 11; imgId <= MAX_IMAGES_PER_FOLDER; imgId++) {
            let found = false;
            for (const ext of IMAGE_EXTENSIONS) {
              if (await checkImageExists(`${imageBase}/${folderId}/${imgId}${ext}`)) {
                folderImages.push(`${imgId}${ext}`);
                found = true;
                break;
              }
            }
            if (!found) break;
          }
        }
        
        console.log(`Folder ${folderId}: ${folderImages.length} images found`);
        
        detectedFolders.push({
          id: String(folderId),
          images: folderImages,
          thumbnail: `${folderId}/${firstImageName}`
        });
      }
      
      if (detectedFolders.length > 0) {
        console.log('Total folders detected:', detectedFolders.length);
        setIsNested(true);
        setFolders(detectedFolders);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to flat structure
    console.log('Checking for flat structure...');
    const flatChecks = [];
    for (let i = 1; i <= Math.min(10, MAX_FLAT_IMAGES); i++) {
      for (const ext of IMAGE_EXTENSIONS) {
        flatChecks.push(
          checkImageExists(`${imageBase}/${i}${ext}`)
            .then(exists => ({ i, ext, exists }))
        );
        break;
      }
    }
    
    const flatResults = await Promise.all(flatChecks);
    const validFlat = flatResults.filter(r => r.exists);
    const flatImgs = validFlat.map(r => `${r.i}${r.ext}`);
    
    // Continue checking sequentially if we found 10 images
    if (flatImgs.length >= 10) {
      for (let i = 11; i <= MAX_FLAT_IMAGES; i++) {
        let found = false;
        for (const ext of IMAGE_EXTENSIONS) {
          if (await checkImageExists(`${imageBase}/${i}${ext}`)) {
            flatImgs.push(`${i}${ext}`);
            found = true;
            break;
          }
        }
        if (!found) break;
      }
    }
    
    console.log('Flat images found:', flatImgs.length);
    
    setIsNested(false);
    setFlatImages(flatImgs);
    setIsLoading(false);
  }, [imageBase, checkImageExists, capitalized, loadHeroImage]);

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
            <p className="text-gray-500 text-sm">Checking: {imageBase}</p>
          </div>
        </main>
      </section>
    );
  }

  // Check if we have any collections to show
  const hasCollections = folders.length > 0 || flatImages.length > 0;

  return (
    <section className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex flex-col">
        {/* Hero/Title Section - Always at the top from static route */}
        {heroImage && (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {matchedVideo ? (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    console.error('Failed to load video:', heroImage);
                  }}
                >
                  <source src={heroImage} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </>
            ) : (
              <>
                <img
                  src={heroImage}
                  alt={`${capitalized} hero`}
                  className="w-full aspect-video object-cover"
                  loading="eager"
                  onError={(e) => {
                    console.error('Failed to load hero image:', heroImage);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </>
            )}
          </div>
        )}

        {/* Collections Section - All folders/images displayed below hero */}
        {hasCollections && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Work</h2>
              {isNested && folders.length > 0 && (
                <p className="text-gray-600 font-medium">{folders.length} Collections</p>
              )}
              {!isNested && flatImages.length > 0 && (
                <p className="text-gray-600 font-medium">{flatImages.length} Images</p>
              )}
            </div>

            {/* Nested Structure - Show all folders as grid */}
            {isNested && folders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => (
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
                      onError={(e) => {
                        console.error('Failed to load thumbnail:', `${imageBase}/${folder.thumbnail}`);
                      }}
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

            {/* Flat Structure - Show all images as grid */}
            {!isNested && flatImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flatImages.map((file, idx) => (
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
          </>
        )}

        {/* No collections found message */}
        {!hasCollections && !heroImage && (
          <div className="flex flex-col items-center gap-4 text-center py-12">
            <p className="text-gray-600 font-medium text-xl">No media found</p>
            <p className="text-gray-500 text-sm">Path: {imageBase}</p>
            <p className="text-gray-400 text-xs">Check browser console for details</p>
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
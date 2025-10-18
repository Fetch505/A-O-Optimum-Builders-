"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Modal state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Preloading state
  const preloadedRefs = useRef<Set<string>>(new Set());
  
  const MAX_FOLDERS = 10;
  const MAX_IMAGES_PER_FOLDER = 50;
  const MAX_FLAT_IMAGES = 50;
  
  // Supported image extensions (prioritize WebP for better compression)
  const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

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

  // Optimized image check with aggressive timeout for slow connections
  const checkImageExists = useCallback((url: string, timeout = 2000): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }, []);

  // Preload adjacent images in modal
  const preloadAdjacentImages = useCallback((folderId: string, currentIndex: number) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    // Preload next 2 and previous 2 images
    const indicesToPreload = [
      (currentIndex + 1) % folder.images.length,
      (currentIndex + 2) % folder.images.length,
      (currentIndex - 1 + folder.images.length) % folder.images.length,
      (currentIndex - 2 + folder.images.length) % folder.images.length,
    ];

    indicesToPreload.forEach(idx => {
      const imgUrl = `${imageBase}/${folderId}/${folder.images[idx]}`;
      if (!preloadedRefs.current.has(imgUrl)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = imgUrl;
        document.head.appendChild(link);
        preloadedRefs.current.add(imgUrl);
      }
    });
  }, [folders, imageBase]);

  // Load hero image
  const loadHeroImage = useCallback(async () => {
    if (matchedVideo) {
      setHeroImage(matchedVideo.src);
      return;
    }

    for (const ext of IMAGE_EXTENSIONS) {
      const heroUrl = `${heroimageBase}${ext}`;
      if (await checkImageExists(heroUrl, 1500)) {
        setHeroImage(heroUrl);
        return;
      }
    }
  }, [heroimageBase, checkImageExists, matchedVideo]);

  // Optimized structure detection with parallel requests limited to 3 at a time
  const detectStructure = useCallback(async () => {
    console.log('Starting detection for:', capitalized);
    setIsLoading(true);
    
    // Load hero image first (non-blocking)
    loadHeroImage();
    
    // Check for nested structure with limited concurrency
    const BATCH_SIZE = 3;
    const testFolders = async (start: number, end: number) => {
      const checks = [];
      for (let folderId = start; folderId <= end; folderId++) {
        const testUrl = `${imageBase}/${folderId}/1${IMAGE_EXTENSIONS[0]}`;
        checks.push(
          checkImageExists(testUrl, 1500).then(exists => ({ folderId, exists }))
        );
      }
      return Promise.all(checks);
    };

    // Check first 3 folders quickly
    const firstBatch = await testFolders(1, Math.min(3, MAX_FOLDERS));
    const validFolders = firstBatch.filter(r => r.exists).map(r => r.folderId);
    
    if (validFolders.length > 0) {
      // Found nested structure - load folders efficiently
      const detectedFolders: FolderData[] = [];
      
      for (let folderId = 1; folderId <= MAX_FOLDERS; folderId++) {
        // Quick check for first image
        let firstImageFound = false;
        let firstImageName = '';
        
        for (const ext of IMAGE_EXTENSIONS) {
          const testUrl = `${imageBase}/${folderId}/1${ext}`;
          if (await checkImageExists(testUrl, 1500)) {
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
        
        // For slow connections, only check first 5 images per folder initially
        const folderImages: string[] = [firstImageName];
        
        // Check images 2-5 in smaller batches
        for (let imgId = 2; imgId <= Math.min(5, MAX_IMAGES_PER_FOLDER); imgId++) {
          for (const ext of IMAGE_EXTENSIONS) {
            if (await checkImageExists(`${imageBase}/${folderId}/${imgId}${ext}`, 1500)) {
              folderImages.push(`${imgId}${ext}`);
              break;
            }
          }
        }
        
        // Lazy load remaining images (they'll be discovered when modal opens)
        console.log(`Folder ${folderId}: ${folderImages.length} images found (initial scan)`);
        
        detectedFolders.push({
          id: String(folderId),
          images: folderImages,
          thumbnail: `${folderId}/${firstImageName}`
        });
      }
      
      if (detectedFolders.length > 0) {
        setIsNested(true);
        setFolders(detectedFolders);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to flat structure - check only first 5 images initially
    console.log('Checking for flat structure...');
    const flatImgs: string[] = [];
    
    for (let i = 1; i <= Math.min(5, MAX_FLAT_IMAGES); i++) {
      for (const ext of IMAGE_EXTENSIONS) {
        if (await checkImageExists(`${imageBase}/${i}${ext}`, 1500)) {
          flatImgs.push(`${i}${ext}`);
          break;
        }
      }
    }
    
    console.log('Flat images found:', flatImgs.length);
    
    setIsNested(false);
    setFlatImages(flatImgs);
    setIsLoading(false);
  }, [imageBase, checkImageExists, capitalized, loadHeroImage]);

  // Lazy load more images in a folder when modal opens
  const loadMoreFolderImages = useCallback(async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.images.length >= MAX_IMAGES_PER_FOLDER) return;

    const startFrom = folder.images.length + 1;
    const newImages: string[] = [];
    
    for (let imgId = startFrom; imgId <= MAX_IMAGES_PER_FOLDER; imgId++) {
      let found = false;
      for (const ext of IMAGE_EXTENSIONS) {
        if (await checkImageExists(`${imageBase}/${folderId}/${imgId}${ext}`, 1500)) {
          newImages.push(`${imgId}${ext}`);
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    if (newImages.length > 0) {
      setFolders(prev => prev.map(f => 
        f.id === folderId 
          ? { ...f, images: [...f.images, ...newImages] }
          : f
      ));
    }
  }, [folders, imageBase, checkImageExists]);

  useEffect(() => {
    detectStructure();
  }, [detectStructure]);

  // Modal controls
  const openModal = (folderId: string, startIndex: number = 0) => {
    setSelectedFolder(folderId);
    setCurrentImageIndex(startIndex);
    document.body.style.overflow = "hidden";
    
    // Start lazy loading more images in background
    loadMoreFolderImages(folderId);
    
    // Preload adjacent images
    preloadAdjacentImages(folderId, startIndex);
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
      const newIndex = (currentImageIndex + 1) % folder.images.length;
      setCurrentImageIndex(newIndex);
      preloadAdjacentImages(selectedFolder, newIndex);
    }
  }, [selectedFolder, folders, currentImageIndex, preloadAdjacentImages]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFolder) return;
    
    const folder = folders.find(f => f.id === selectedFolder);
    if (folder) {
      const newIndex = (currentImageIndex - 1 + folder.images.length) % folder.images.length;
      setCurrentImageIndex(newIndex);
      preloadAdjacentImages(selectedFolder, newIndex);
    }
  }, [selectedFolder, folders, currentImageIndex, preloadAdjacentImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedFolder) return;
      
      if (e.key === "ArrowRight") {
        const folder = folders.find(f => f.id === selectedFolder);
        if (folder) {
          const newIndex = (currentImageIndex + 1) % folder.images.length;
          setCurrentImageIndex(newIndex);
          preloadAdjacentImages(selectedFolder, newIndex);
        }
      } else if (e.key === "ArrowLeft") {
        const folder = folders.find(f => f.id === selectedFolder);
        if (folder) {
          const newIndex = (currentImageIndex - 1 + folder.images.length) % folder.images.length;
          setCurrentImageIndex(newIndex);
          preloadAdjacentImages(selectedFolder, newIndex);
        }
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedFolder, folders, currentImageIndex, preloadAdjacentImages]);

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

  // Track loaded images
  const handleImageLoad = useCallback((url: string) => {
    setLoadedImages(prev => new Set(prev).add(url));
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <section className="w-full outerPadding flex flex-col justify-between">
        <main className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
            <p className="text-gray-600 font-medium">Loading media...</p>
            <p className="text-gray-500 text-sm">Optimized for slow connections</p>
          </div>
        </main>
      </section>
    );
  }

  const hasCollections = folders.length > 0 || flatImages.length > 0;

  return (
    <section className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex flex-col">
        {/* Hero Section */}
        {heroImage && (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
            {matchedVideo ? (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video object-cover"
                  onError={(e) => console.error('Failed to load video:', heroImage)}
                >
                  <source src={heroImage} type="video/webm" />
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
                  decoding="async"
                  onError={(e) => console.error('Failed to load hero image:', heroImage)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </>
            )}
          </div>
        )}

        {/* Collections Section */}
        {hasCollections && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Work</h2>
              {isNested && folders.length > 0 && (
                <p className="text-gray-600 font-medium">{folders.length} Collections</p>
              )}
              {!isNested && flatImages.length > 0 && (
                <p className="text-gray-600 font-medium">{flatImages.length}+ Images</p>
              )}
            </div>

            {/* Nested Structure */}
            {isNested && folders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => {
                  const thumbUrl = `${imageBase}/${folder.thumbnail}`;
                  const isLoaded = loadedImages.has(thumbUrl);
                  
                  return (
                    <div
                      key={folder.id}
                      className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gray-200"
                      onClick={() => openModal(folder.id, 0)}
                    >
                      {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      <img
                        src={thumbUrl}
                        alt={`Collection ${folder.id}`}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(thumbUrl)}
                        onError={(e) => console.error('Failed to load thumbnail:', thumbUrl)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:from-black/70 transition-all duration-300" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xs font-medium opacity-90 mb-0.5">Collection {folder.id}</p>
                        <p className="text-lg font-bold">{folder.images.length}+ Photos</p>
                      </div>
                      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-xl transition-all duration-300" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Flat Structure */}
            {!isNested && flatImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flatImages.map((file, idx) => {
                  const imgUrl = `${imageBase}/${file}`;
                  const isLoaded = loadedImages.has(imgUrl);
                  
                  return (
                    <div
                      key={idx}
                      className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gray-200"
                    >
                      {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      <img
                        src={imgUrl}
                        alt={`${capitalized} ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isLoaded ? 'opacity-100 hover:scale-110' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(imgUrl)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* No collections found */}
        {!hasCollections && !heroImage && (
          <div className="flex flex-col items-center gap-4 text-center py-12">
            <p className="text-gray-600 font-medium text-xl">No media found</p>
            <p className="text-gray-500 text-sm">Path: {imageBase}</p>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedFolder && currentModalImage && currentFolder && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50"
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
                  {currentImageIndex + 1} / {currentFolder.images.length}+
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

            {/* Navigation */}
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
              {!loadedImages.has(currentModalImage) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                </div>
              )}
              <img
                src={currentModalImage}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-h-[80vh] max-w-full rounded-lg md:rounded-2xl shadow-2xl object-contain"
                loading="eager"
                decoding="async"
                onLoad={() => handleImageLoad(currentModalImage)}
              />
            </div>

            {/* Navigation Dots */}
            {currentFolder.images.length > 1 && currentFolder.images.length <= 20 && (
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {currentFolder.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      preloadAdjacentImages(selectedFolder, idx);
                    }}
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
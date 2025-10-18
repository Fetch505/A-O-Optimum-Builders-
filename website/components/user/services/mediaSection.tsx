"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface FolderData {
  id: string;
  images: string[];
  thumbnail: string;
}

const IMAGE_EXTENSIONS = ['.webp'];
const MAX_FOLDERS = 10;
const MAX_IMAGES_PER_FOLDER = 50;
const MAX_FLAT_IMAGES = 50;
const IMAGE_CHECK_TIMEOUT = 1500;
const INITIAL_IMAGES_PER_FOLDER = 5;

const MediaSection: React.FC = () => {
  const pathname = usePathname();
  const service = pathname.split("/").pop()?.toLowerCase();
  const capitalized = useMemo(() => 
    service ? service.charAt(0).toUpperCase() + service.slice(1) : "",
    [service]
  );

  const imageBase = useMemo(() => `/categories/image/${capitalized}`, [capitalized]);
  const heroImageBase = useMemo(() => `/categories/Hero/${capitalized}`, [capitalized]);
  
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
  
  // Refs
  const preloadedRefs = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, boolean>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Optimized image existence check with caching
  const checkImageExists = useCallback((url: string, timeout = IMAGE_CHECK_TIMEOUT): Promise<boolean> => {
    // Check cache first
    if (imageCache.current.has(url)) {
      return Promise.resolve(imageCache.current.get(url)!);
    }

    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.src = '';
        imageCache.current.set(url, false);
        resolve(false);
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timer);
        imageCache.current.set(url, true);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        imageCache.current.set(url, false);
        resolve(false);
      };
      img.src = url;
    });
  }, []);

  // Preload adjacent images in modal
  const preloadAdjacentImages = useCallback((folderId: string, currentIndex: number) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const indicesToPreload = [
      (currentIndex + 1) % folder.images.length,
      (currentIndex + 2) % folder.images.length,
      (currentIndex - 1 + folder.images.length) % folder.images.length,
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
      const heroUrl = `${heroImageBase}${ext}`;
      if (await checkImageExists(heroUrl, IMAGE_CHECK_TIMEOUT)) {
        setHeroImage(heroUrl);
        return;
      }
    }
  }, [heroImageBase, checkImageExists, matchedVideo]);

  // Find first valid image for a folder
  const findFirstImage = useCallback(async (folderId: number): Promise<string | null> => {
    for (const ext of IMAGE_EXTENSIONS) {
      const testUrl = `${imageBase}/${folderId}/1${ext}`;
      if (await checkImageExists(testUrl, IMAGE_CHECK_TIMEOUT)) {
        return `1${ext}`;
      }
    }
    return null;
  }, [imageBase, checkImageExists]);

  // Load images for a specific folder
  const loadFolderImages = useCallback(async (
    folderId: number, 
    maxImages: number = INITIAL_IMAGES_PER_FOLDER
  ): Promise<string[]> => {
    const images: string[] = [];
    
    for (let imgId = 1; imgId <= maxImages; imgId++) {
      let found = false;
      for (const ext of IMAGE_EXTENSIONS) {
        const imgUrl = `${imageBase}/${folderId}/${imgId}${ext}`;
        if (await checkImageExists(imgUrl, IMAGE_CHECK_TIMEOUT)) {
          images.push(`${imgId}${ext}`);
          found = true;
          break;
        }
      }
      if (!found && imgId > 1) break;
    }
    
    return images;
  }, [imageBase, checkImageExists]);

  // Detect structure with optimized checks
  const detectStructure = useCallback(async () => {
    // Cancel any previous detection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    
    // Load hero image (non-blocking)
    loadHeroImage();
    
    // Check for nested structure
    const firstImage = await findFirstImage(1);
    
    if (firstImage) {
      // Nested structure found
      const detectedFolders: FolderData[] = [];
      
      for (let folderId = 1; folderId <= MAX_FOLDERS; folderId++) {
        const folderImages = await loadFolderImages(folderId, INITIAL_IMAGES_PER_FOLDER);
        
        if (folderImages.length === 0) {
          if (detectedFolders.length > 0) break;
          continue;
        }
        
        detectedFolders.push({
          id: String(folderId),
          images: folderImages,
          thumbnail: `${folderId}/${folderImages[0]}`
        });
      }
      
      if (detectedFolders.length > 0) {
        setIsNested(true);
        setFolders(detectedFolders);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to flat structure
    const flatImgs: string[] = [];
    
    for (let i = 1; i <= Math.min(5, MAX_FLAT_IMAGES); i++) {
      for (const ext of IMAGE_EXTENSIONS) {
        if (await checkImageExists(`${imageBase}/${i}${ext}`, IMAGE_CHECK_TIMEOUT)) {
          flatImgs.push(`${i}${ext}`);
          break;
        }
      }
    }
    
    setIsNested(false);
    setFlatImages(flatImgs);
    setIsLoading(false);
  }, [imageBase, loadHeroImage, findFirstImage, loadFolderImages, checkImageExists]);

  // Lazy load more images when modal opens
  const loadMoreFolderImages = useCallback(async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.images.length >= MAX_IMAGES_PER_FOLDER) return;

    const startFrom = folder.images.length + 1;
    const newImages: string[] = [];
    
    for (let imgId = startFrom; imgId <= MAX_IMAGES_PER_FOLDER; imgId++) {
      let found = false;
      for (const ext of IMAGE_EXTENSIONS) {
        if (await checkImageExists(`${imageBase}/${folderId}/${imgId}${ext}`, IMAGE_CHECK_TIMEOUT)) {
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
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [detectStructure]);

  // Modal controls
  const openModal = useCallback((folderId: string, startIndex: number = 0) => {
    setSelectedFolder(folderId);
    setCurrentImageIndex(startIndex);
    document.body.style.overflow = "hidden";
    
    loadMoreFolderImages(folderId);
    preloadAdjacentImages(folderId, startIndex);
  }, [loadMoreFolderImages, preloadAdjacentImages]);

  const closeModal = useCallback(() => {
    setSelectedFolder(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "";
  }, []);

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
    if (!selectedFolder) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const folder = folders.find(f => f.id === selectedFolder);
      if (!folder) return;

      switch (e.key) {
        case "ArrowRight": {
          const newIndex = (currentImageIndex + 1) % folder.images.length;
          setCurrentImageIndex(newIndex);
          preloadAdjacentImages(selectedFolder, newIndex);
          break;
        }
        case "ArrowLeft": {
          const newIndex = (currentImageIndex - 1 + folder.images.length) % folder.images.length;
          setCurrentImageIndex(newIndex);
          preloadAdjacentImages(selectedFolder, newIndex);
          break;
        }
        case "Escape":
          closeModal();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedFolder, folders, currentImageIndex, preloadAdjacentImages, closeModal]);

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

  // Loading state
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
                >
                  <source src={heroImage} type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </>
            ) : (
              <>
                <img
                  src={heroImage}
                  alt={`${capitalized} showcase`}
                  className="w-full aspect-video object-cover"
                  loading="eager"
                  decoding="async"
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
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gray-200"
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
                aria-label="Close modal"
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
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 z-10"
                  onClick={handleNext}
                  aria-label="Next image"
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
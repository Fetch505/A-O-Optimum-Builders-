"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { usePathname } from "next/navigation";

const MediaSection: React.FC = () => {
  const pathname = usePathname();
  const service = pathname.split("/").pop()?.toLowerCase();
  const capitalized = service
    ? service.charAt(0).toUpperCase() + service.slice(1)
    : "";

  const imageBase = `/categories/image/${capitalized}`;

  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // UI / small states
  const [slideIndex, setSlideIndex] = useState(0);

  // zoom/drag
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // React transition for non-blocking state updates
  const [isPending, startTransition] = useTransition();

  // config
  const minZoom = 1;
  const maxZoom = 5;
  const MAX_IMAGES_SAFE = 200; // safety cap (adjust if needed)

  // Static video list (one per service)
  const videos = useMemo(
    () => [
      { name: "Kitchen", src: "/categories/video/Kitchen.mp4" },
      { name: "Concrete", src: "/categories/video/Concrete.mp4" },
    ],
    []
  );

  // matched video (memoized)
  const matchedVideo = useMemo(
    () => videos.find((v) => v.name.toLowerCase() === service),
    [videos, service]
  );

  // Prevent body scroll when modal/lightbox open
  useEffect(() => {
    document.body.style.overflow = showModal || selectedImage ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, selectedImage]);

  // Sequential preload using Image() — SINGLE pass (no HEAD requests)
  useEffect(() => {
    let mounted = true;
    setImageFiles([]); // reset when service changes
    const loadSequentialImages = async () => {
      const loaded: string[] = [];
      for (let counter = 1; counter <= MAX_IMAGES_SAFE && mounted; counter++) {
        const fileName = `${counter}.jpg`;
        const url = `${imageBase}/${fileName}`;
        try {
          // load the image via Image() — browser will fetch it once
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
          });
          if (!mounted) break;
          // update state non-blockingly
          startTransition(() => {
            setImageFiles((prev) => [...prev, fileName]);
          });
        } catch {
          // stop on first missing file (sequential)
          break;
        }
      }
      // done
    };

    loadSequentialImages();

    return () => {
      mounted = false;
    };
  }, [imageBase]);

  // derived visible images (first 3)
  const visibleImages = imageFiles.slice(0, 3);

  // slideshow (only when no matched video)
  useEffect(() => {
    if (!matchedVideo && visibleImages.length > 1) {
      const id = setInterval(() => {
        setSlideIndex((s) => (s + 1) % visibleImages.length);
      }, 3000);
      return () => clearInterval(id);
    }
  }, [matchedVideo, visibleImages]);

  // wheel zoom (useCallback for stability)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      setZoom((prev) => {
        const nextZoom =
          e.deltaY < 0 ? Math.min(prev + 0.2, maxZoom) : Math.max(prev - 0.2, minZoom);
        const zoomFactor = nextZoom / prev;

        setPosition((pos) => ({
          x: (pos.x - offsetX) * zoomFactor + offsetX,
          y: (pos.y - offsetY) * zoomFactor + offsetY,
        }));

        return nextZoom;
      });
    },
    [containerRef]
  );

  // drag handlers (stable callbacks)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const img = containerRef.current.querySelector("img") as HTMLImageElement | null;
      if (!img) return;

      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      const maxOffsetX = Math.max(0, (img.width * zoom - rect.width) / 2);
      const maxOffsetY = Math.max(0, (img.height * zoom - rect.height) / 2);

      newX = Math.max(-maxOffsetX, Math.min(newX, maxOffsetX));
      newY = Math.max(-maxOffsetY, Math.min(newY, maxOffsetY));
      setPosition({ x: newX, y: newY });
    },
    [dragging, zoom]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  // double click reset
  const handleDoubleClick = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // escape closes modal/lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setSelectedImage(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <section className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-[#EFEFEF] rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex flex-col">
        {/* Video or slideshow */}
        {matchedVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="rounded-xl shadow-md w-full aspect-video"
          >
            <source src={matchedVideo.src} type="video/mp4" />
          </video>
        ) : (
          visibleImages.length > 0 && (
            <button
              className="relative w-full h-100 aspect-video rounded-xl overflow-hidden shadow-md"
              onClick={() =>
                setSelectedImage(`${imageBase}/${visibleImages[slideIndex]}`)
              }
            >
              <img
                src={`${imageBase}/${visibleImages[slideIndex]}`}
                alt={`${capitalized} preview ${slideIndex}`}
                className="w-full h-full object-cover transition-opacity duration-700"
                loading="eager"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {visibleImages.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition ${
                      i === slideIndex ? "bg-white" : "bg-gray-500"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIndex(i);
                    }}
                  />
                ))}
              </div>
            </button>
          )
        )}

        {/* Thumbnails (first 3 loaded images) */}
        {visibleImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visibleImages.map((file, idx) => (
              <button
                key={idx}
                className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md relative group"
                onClick={() => setSelectedImage(`${imageBase}/${file}`)}
              >
                <img
                  src={`${imageBase}/${file}`}
                  alt={`${capitalized} thumbnail ${idx}`}
                  loading="lazy"
                  className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition"
                />
              </button>
            ))}
          </div>
        )}

        {/* Show More */}
        {imageFiles.length > 3 && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Show More
            </button>
          </div>
        )}
      </main>

      {/* Gallery Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] md:w-[80%] lg:w-[70%] h-[90vh] flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{capitalized} Gallery</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  aria-label="Close gallery"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
                {imageFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(`${imageBase}/${file}`)}
                    className="w-full  rounded-xl shadow-md overflow-hidden"
                  >
                    <img
                      src={`${imageBase}/${file}`}
                      alt={`${capitalized} full ${idx}`}
                      loading="lazy"
                      className="w-full object-cover aspect-[4/3] hover:scale-105 transition"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
              setZoom(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="absolute top-6 right-6 text-white text-2xl"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          <div
            ref={containerRef}
            className="max-w-[90%] max-h-[80%] overflow-auto rounded-3xl flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Selected preview"
              className="select-none"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                cursor: dragging ? "grabbing" : "grab",
                transition: dragging ? "none" : "transform 0.2s ease-out",
                maxWidth: "none", // allow native size
                maxHeight: "none",
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaSection;

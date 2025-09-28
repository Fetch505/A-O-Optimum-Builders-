"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Filter, X } from "lucide-react";

const categories = [
  { id: "kitchen", name: "Kitchen" },
  { id: "countertops", name: "Countertops" },
  { id: "partitions", name: "Partitions" },
  { id: "flooring", name: "Flooring" },
  { id: "deckpro", name: "DeckPro" },
  { id: "bath", name: "Bath Transformation" },
  { id: "fence", name: "Fence" },
  { id: "paints", name: "Paints" },
  { id: "doors", name: "Doors" },
  { id: "concrete", name: "Concrete" },
];

const CategorySection = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [usa, setUsa] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCategoryClick = (id: string) => {
    router.push(`/service/${id}?usa=${usa}`);
    setShowModal(false); // close modal after selecting
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // check if categories overflow (desktop only)
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        setShowArrow(
          scrollRef.current.scrollWidth > scrollRef.current.clientWidth
        );
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <>
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Categories (desktop only) */}
        <div className="hidden md:flex items-center gap-2 flex-1">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-amber-500 transition shrink-0"
              >
                <div className="w-12 h-12 flex items-center justify-center border rounded-lg">
                  📌
                </div>
                <span className="text-xs md:text-sm">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Arrow (only if overflow) */}
          {showArrow && (
            <button
              onClick={scrollRight}
              className="p-2 border rounded-lg hover:bg-gray-100 shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Categories button (mobile only) */}
          <button
            onClick={() => setShowModal(true)}
            className="flex md:hidden items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-100 justify-center"
          >
            <Filter size={16} />
            <span className="text-sm">Categories</span>
          </button>

          {/* USA Toggle */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-lg justify-between">
            <span className="text-sm whitespace-nowrap">Explore in USA</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usa}
                onChange={(e) => setUsa(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-amber-500 transition"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Categories Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 max-w-md rounded-lg p-5 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">All Categories</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex flex-col items-center gap-2 text-gray-700 hover:text-amber-500 transition"
                >
                  <div className="w-14 h-14 flex items-center justify-center border rounded-lg">
                    📌
                  </div>
                  <span className="text-sm text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategorySection;

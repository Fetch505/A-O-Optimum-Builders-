"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, ChevronUp,ChevronLeft } from "lucide-react";

import Kitchen from "@/assets/services/icons/Kitchen.png";
import Countertop from "@/assets/services/icons/Countertop.png";
import Partition from "@/assets/services/icons/Partition.png";
import Floor from "@/assets/services/icons/Flooring.png";
import Deskpro from "@/assets/services/icons/Deskpro.png";
import Fence from "@/assets/services/icons/Fence.png";
import Paint from "@/assets/services/icons/Paint.png";
import Door from "@/assets/services/icons/Door.png";
import Concrete from "@/assets/services/icons/Concrete.png";

const categories = [
  { id: "kitchen", name: "Kitchen", icon: Kitchen },
  { id: "countertops", name: "Countertops", icon: Countertop },
  { id: "partitions", name: "Partitions", icon: Partition },
  { id: "flooring", name: "Flooring", icon: Floor },
  { id: "deckpro", name: "DeckPro", icon: Deskpro },
  { id: "bath", name: "Bath Transformation", icon: Deskpro },
  { id: "fence", name: "Fence", icon: Fence },
  { id: "paints", name: "Paints", icon: Paint },
  { id: "doors", name: "Doors", icon: Door },
  { id: "concrete", name: "Concrete", icon: Concrete },

{ id: "kitchen", name: "Kitchen", icon: Kitchen },
  { id: "countertops", name: "Countertops", icon: Countertop },
  { id: "partitions", name: "Partitions", icon: Partition },
  { id: "flooring", name: "Flooring", icon: Floor },
  { id: "deckpro", name: "DeckPro", icon: Deskpro },
  { id: "bath", name: "Bath Transformation", icon: Deskpro },
  { id: "fence", name: "Fence", icon: Fence },
  { id: "paints", name: "Paints", icon: Paint },
  { id: "doors", name: "Doors", icon: Door },
  { id: "concrete", name: "Concrete", icon: Concrete },

  
];

const CategorySection = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [usa, setUsa] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false); // 👈 mobile dropdown state

  const handleCategoryClick = (id: string) => {
    router.push(`/services/${id}?usa=${usa}`);
    setOpenDropdown(false); // mobile dropdown close after click
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div className="w-full flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4 px-6">
      {/* Categories (desktop only) */}
      {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="p-2 border rounded-full border-gray-300 bg-white shadow hover:bg-gray-100 hidden md:block"
            >
              <ChevronLeft size={20} />
            </button>
          )}

      <div className="relative hidden md:flex items-center flex-1 md:w-7/12 lg:w-9/12">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth flex-1 px-8 select-none cursor-grab"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-1 text-gray-700 hover:text-amber-500 transition shrink-0"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-lg">
                <img src={cat.icon.src} alt={cat.name} className="w-6 h-6" />
              </div>
              <span className="text-xs md:text-sm text-gray-400">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Categories Dropdown */}
      <div className="block md:hidden w-full">
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white shadow text-gray-700"
        >
          <span>Browse Categories</span>
          {openDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {openDropdown && (
          <div className="mt-2 border rounded-lg bg-white shadow p-2 grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-amber-500 transition"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg">
                  <img src={cat.icon.src} alt={cat.name} className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-500">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center justify-center md:justify-end  ">
        <div className="flex items-center gap-2">
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="p-2 border rounded-full border-gray-300 bg-white shadow hover:bg-gray-100 hidden md:block"
            >
              <ChevronRight size={20} />
            </button>
          )}

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
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-amber-500 transition-colors"></div>
              <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;

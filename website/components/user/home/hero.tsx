"use client";

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Lightbulb, Settings, Building2 } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import Image from "next/image";

import hero1 from "@/assets/home/hero1.png";
import hero2 from "@/assets/home/hero2.png";
import hero3 from "@/assets/home/hero3.png";
import hero4 from "@/assets/home/hero4.png";
import hero5 from "@/assets/home/hero5.png";

const images = [hero1, hero2, hero3, hero4, hero5];
const icons = [Lightbulb, Settings, Building2];

const Hero = () => {
  // Memoize Swiper config so it doesn’t create new objects each render
  const swiperConfig = useMemo(
    () => ({
      modules: [Autoplay, Pagination, Navigation, EffectFade],
      slidesPerView: 1,
      loop: true,
      effect: "fade" as const,
      fadeEffect: { crossFade: true },
      autoplay: { delay: 4000, disableOnInteraction: false },
      allowTouchMove: false,
      pagination: {
        clickable: true,
        bulletClass: "swiper-pagination-bullet !bg-white",
      },
    }),
    []
  );

  return (
    <section className="w-full h-screen p-3">
      <Swiper {...swiperConfig} className="w-full h-full">
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={img}
                alt={`Hero Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0} // ✅ only first image priority
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex justify-end pt-36 p-3">
                <div className="flex flex-col gap-6 items-center md:items-start">
                  {/* Text Section */}
                  <div className="text-white max-w-lg text-center md:text-left">
                    <p className="comtext drop-shadow-md">
                      We specialize in residential and commercial construction.
                      Delivering high-quality remodeling, custom builds, and
                      concrete solutions.
                    </p>
                  </div>

                  {/* Icons Section */}
                  <div className="flex gap-6 mt-6 md:mt-0">
                    {icons.map((Icon, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
                      >
                        <Icon className="text-white w-6 h-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default React.memo(Hero);

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
import contactimg from "@/assets/contact/contact.png"
import serviceimg from "@/assets/home/hero3.png"

const icons = [Lightbulb, Settings, Building2];
type HeroProps = {
  currentpage: string;
};
const Hero = ({ currentpage }: HeroProps) => {


  return (
    <section className="w-full h-[25rem] p-3">



      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        <Image
          src={currentpage === "contactus" ? contactimg : serviceimg}
          alt={`Hero Image `}
          fill
          className="object-cover"

        />

        {/* Overlay */}
        {currentpage === "contactus" ? (<></>) : (<div className="absolute inset-0 bg-black/40 flex justify-end pt-36 p-3">
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
        </div>)}

      </div>


    </section>
  );
};

export default React.memo(Hero);

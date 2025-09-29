"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import bricks from "@/assets/home/service_benefits/bricks.png";
import hammer from "@/assets/home/service_benefits/hammer.png";
import house from "@/assets/home/service_benefits/house.png";
import notepad from "@/assets/home/service_benefits/notepad.png";
import tools from "@/assets/home/service_benefits/tools-and-utensils.png";
import partition from "@/assets/home/service_benefits/partition.png";
import sketch from "@/assets/home/service_benefits/sketch.png";
import residential from "@/assets/home/service_benefits/residential.png";

const ServiceDetailSection: React.FC = () => {

   const servicedata = [
  {
    title: "Residential & Commercial Remodeling",
    description:
      "Transform outdated spaces into modern, functional, and stylish environments—whether it’s your home, office, or retail property.",
    icon: hammer,
  },
  {
    title: "Custom Home Building & Extensions",
    description:
      "From designing dream homes to adding seamless extensions, we deliver tailored construction that blends comfort, luxury, and durability.",
    icon: house,
  },
  {
    title: "Concrete & Decking Solutions",
    description:
      "High-quality patios, driveways, pool decks, and decorative concrete surfaces engineered for strength, safety, and lasting appeal.",
    icon: bricks,
  },
  {
    title: "Repairs & Renovations",
    description:
      "Comprehensive repair and renovation services covering structural, electrical, plumbing, flooring, painting, and more.",
    icon: tools,
  },
  {
    title: "Project Management",
    description:
      "End-to-end construction project management ensuring smooth execution, quality control, budget tracking, and timely delivery.",
    icon: notepad,
  },
  {
    title: "Design & Consultation",
    description:
      "Expert guidance in planning layouts, material selection, and interior design to create spaces that reflect your vision and lifestyle.",
    icon: sketch,
  },
  {
    title: "Commercial Construction",
    description:
      "Full-scale commercial construction solutions for offices, retail, and industrial projects—delivered with precision and efficiency.",
    icon: residential,
  },
  {
    title: "Partitions & Extensions",
    description:
      "Smart partitioning and space extensions that optimize layouts, improve functionality, and enhance property value.",
    icon: partition,
  },
];



    return (
        <footer className="w-full outerPadding flex flex-col justify-between">
            <main
                className="w-full bg-[#EFEFEF] rounded-3xl h-full px-4 py-4 md:py-8 lg:py-12 gap-8 flex flex-col"
            >
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">Under Development </h2>
            </main>
        </footer>
    );
};

export default React.memo(ServiceDetailSection);

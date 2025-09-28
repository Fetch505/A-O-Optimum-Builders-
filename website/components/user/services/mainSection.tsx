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

const MainSection: React.FC = () => {

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
                <div className="w-full flex md:items-start md:justify-start  items-center justify-center font-FigtreeRegular">
                    <div
                        className="flex items-center gap-2 rounded-full px-3 py-1 border-2 border-[#C9C8C8] text-gray-800 w-fit"
                    >
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <p className="text-sm font-medium tracking-wide text-gray-800">
                            WHAT WE DO
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between  items-center justify-center font-FigtreeRegular gap-4">
                    <h2
                        className="text-xl md:text-2xl lg:text-3xl text-black text-center max-w-4xl"
                    >
                        Our Services
                    </h2>
                    <p className="text-lg text-[#9B9B9B] max-w-3xl text-center md:text-left leading-relaxed">
                        We deliver stress-free construction with reliability, craftsmanship, and customer focus—bringing your vision to life with excellence
                    </p>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    {servicedata.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white font-FigtreeRegular p-6 rounded-2xl flex flex-col items-start gap-12 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="rounded-lg border-2 border-[#9B9B9B] text-lg p-2 text-[#E4B327]">
                                <Image src={service.icon} alt="icon" width={24} height={24} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-md text-black">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-[#9B9B9B]">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </footer>
    );
};

export default React.memo(MainSection);

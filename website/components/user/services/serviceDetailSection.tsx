"use client";
import React from "react";
import { useSearchParams, usePathname } from "next/navigation";

const ServiceDetailSection: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const usa = searchParams.get("usa"); // example: "false"
  const service = pathname.split("/").pop()?.toLowerCase(); // e.g. "fence"

  const categorydescription = [
    {
      title: "kitchen",
      description:
        "We provide premium countertops crafted from granite, quartz, and engineered stone. Designed for durability and elegance, our countertops enhance kitchens, bathrooms, and workspaces with lasting beauty and easy maintenance.",
    },
    {
      title: "countertops",
      description:
        "From designing dream homes to adding seamless extensions, we deliver tailored construction that blends comfort, luxury, and durability.",
    },
    {
      title: "partitions",
      description:
        "High-quality patios, driveways, pool decks, and decorative concrete surfaces engineered for strength, safety, and lasting appeal.",
    },
    {
      title: "flooring",
      description:
        "Comprehensive repair and renovation services covering structural, electrical, plumbing, flooring, painting, and more.",
    },
    {
      title: "deckpro",
      description:
        "End-to-end construction project management ensuring smooth execution, quality control, budget tracking, and timely delivery.",
    },
    {
      title: "restroom",
      description:
        "Expert guidance in planning layouts, material selection, and interior design to create spaces that reflect your vision and lifestyle.",
    },
    {
      title: "fence",
      description:
        "Full-scale commercial construction solutions for offices, retail, and industrial projects—delivered with precision and efficiency.",
    },
    {
      title: "paints",
      description:
        "Smart partitioning and space extensions that optimize layouts, improve functionality, and enhance property value.",
    },
    {
      title: "doors",
      description:
        "Smart partitioning and space extensions that optimize layouts, improve functionality, and enhance property value.",
    },
    {
      title: "concrete",
      description:
        "Smart partitioning and space extensions that optimize layouts, improve functionality, and enhance property value.",
    },
  ];

  // 🔹 Find service by title
  const currentService = categorydescription.find(
    (item) => item.title.toLowerCase() === service
  );

  return (
    <section className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-[#EFEFEF] rounded-3xl h-full px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 gap-8 flex flex-col">
        <div className="w-full flex md:items-start md:justify-start items-center justify-center font-FigtreeRegular">
          <div className="flex items-center gap-2 rounded-full px-3 py-1 border-2 border-[#C9C8C8] text-gray-800 w-fit">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            <p className="text-sm font-medium tracking-wide text-gray-800">
              WHAT WE DO
            </p>
          </div>
        </div>

        {currentService ? (
          <>
            <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between items-center justify-center font-FigtreeRegular gap-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl text-black text-center max-w-4xl capitalize">
                {currentService.title}
              </h2>
              <p className="text-lg text-[#9B9B9B] max-w-3xl text-center md:text-left leading-relaxed">
                {currentService.description}
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">
            Service not found. Please check the URL.
          </p>
        )}
      </main>
    </section>
  );
};

export default React.memo(ServiceDetailSection);

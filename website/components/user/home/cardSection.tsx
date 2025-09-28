"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import agreement from "@/assets/home/service_benefits/agreement.png";
import bricks from "@/assets/home/service_benefits/bricks.png";
import hammer from "@/assets/home/service_benefits/hammer.png";
import house from "@/assets/home/service_benefits/house.png";
import notepad from "@/assets/home/service_benefits/notepad.png";
import tools from "@/assets/home/service_benefits/tools-and-utensils.png";

interface CardSectionProps {
    service: boolean;
}

const CardSection: React.FC<CardSectionProps> = ({ service }) => {
    const [isService, setIsService] = useState(false);

    useEffect(() => {
        if (service) {
            setIsService(true);
        }
    }, [service]);

    const heading = isService ? "We Provide" : "Benefits";
    const serviceheading = isService ? "Our Services" : "Why Choose Us ?";
    const servicepara = isService
        ? "We deliver stress-free construction with reliability, craftsmanship, and customer focus—bringing your vision to life with excellence"
        : "Choosing A&O Optimum Builders means partnering with a team dedicated to excellence, reliability, and customer satisfaction in every project we undertake.";
    const serheadingcolor = isService ? "text-black" : "text-white";
    const bgColor = isService ? "bg-[#EFEFEF]" : "bg-[#323232]";
    const headingColor = isService ? "text-gray-800" : "text-gold";
    const cardbg = isService ? "bg-white" : "bg-[#494949]";
    const headingborder = isService ? "border-gray-700" : "border-[#FF5F3A]/22";

    const servicedata = [
        {
            title: "Residential & Commercial Remodeling",
            description:
                "We renovate kitchens, bathrooms, and entire spaces with modern, functional, and stylish designs tailored to your needs.",
            icon: hammer,
        },
        {
            title: "Custom Home Building & Extensions",
            description:
                "From ground-up custom homes to seamless extensions, we deliver superior craftsmanship and detail that turns visions into reality.",
            icon: house,
        },
        {
            title: "Concrete & Decking Solutions",
            description:
                "Durable patios, driveways, pool decks, and structural concrete projects designed for strength, safety, and aesthetics.",
            icon: bricks,
        },
        {
            title: "Repairs & Renovations",
            description:
                "Complete repair services covering structural fixes, plumbing, electrical, flooring, cabinetry, painting, and fencing.",
            icon: tools,
        },
    ];

    const benefitdata = [
        {
            title: "Reliable Expertise",
            description:
                "Our skilled professionals bring years of hands-on experience, ensuring precision, quality, and consistent results in every project.",
            icon: hammer,
        },
        {
            title: "Effortless Collaboration",
            description:
                "We believe in open communication and client involvement at every step, creating a transparent process that guarantees satisfaction.",
            icon: agreement,
        },
        {
            title: "Stress-Free Project Management",
            description:
                "From budgets to timelines, our dedicated project managers handle every detail, so you can focus on your vision without the hassles.",
            icon: notepad,
        },
        {
            title: "Customer Satisfaction",
            description:
                "Your happiness is our priority. We tailor solutions to your needs, delivering spaces that are functional, durable, and beautifully designed.",
            icon: house,
        },
    ];

    const data = isService ? servicedata : benefitdata;

    return (
        <footer className="w-full outerPadding flex flex-col justify-between">
            <main
                className={`w-full ${bgColor} rounded-3xl h-full px-4 py-4 md:py-8 lg:py-12 gap-8 flex flex-col`}
            >
                <div className="w-full flex items-center justify-center font-FigtreeRegular">
                    <div
                        className={`flex items-center gap-2 rounded-full px-3 py-1 border-2 ${headingborder} w-fit`}
                    >
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <p className={`text-sm font-medium tracking-wide ${headingColor}`}>
                            {heading}
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center font-FigtreeRegular gap-4">
                    <h2
                        className={`text-xl md:text-2xl lg:text-3xl ${serheadingcolor} text-center max-w-4xl`}
                    >
                        {serviceheading}
                    </h2>
                    <p className="text-lg text-[#9B9B9B] max-w-3xl text-center leading-relaxed">
                        {servicepara}
                    </p>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    {data.map((service, index) => (
                        <div
                            key={index}
                            className={`${cardbg} font-FigtreeRegular p-6 rounded-2xl flex flex-col items-start gap-12 hover:shadow-lg transition-shadow duration-300`}
                        >
                            <div className="rounded-lg border-2 border-[#9B9B9B] text-lg p-2 text-[#E4B327]">
                                <Image src={service.icon} alt="icon" width={24} height={24} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className={`text-md ${serheadingcolor}`}>
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

export default React.memo(CardSection);

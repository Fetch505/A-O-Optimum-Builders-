"use client";
import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import faqImage from "@/assets/home/Faq.png";

const faqs = [
    {
        question: "What services do you offer?",
        answer:
            "We provide residential, commercial, remodeling, and construction solutions tailored to client needs.",
    },
    {
        question: "Do you offer customized solutions?",
        answer:
            "Yes! Every project is unique, and we work closely with you to create customized solutions.",
    },
    {
        question: "How long does a typical project take?",
        answer:
            "Project timelines vary based on complexity and scope. We provide estimated delivery times after our initial consultation.",
    },
    {
        question: "What industries do you work with?",
        answer:
            "We work across multiple industries including housing, retail, corporate, and industrial construction.",
    },
    {
        question: "Can I request ongoing support after project completion?",
        answer:
            "Absolutely! We offer ongoing support and maintenance services to ensure your project remains in top condition.",
    },
];

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full outerPadding py-12">
            <div className="w-full bg-[#F9F9F9] rounded-3xl px-4 py-8 md:px-8 lg:px-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start font-FigtreeRegular">

                {/* Left Side */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 rounded-full px-3 py-1 border-2 border-gray-200 w-fit">
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <p className="text-sm font-medium tracking-wide text-gray-800">FAQs</p>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
                        Frequently Asked <br /> Questions?
                    </h2>
                    <div className="w-full">
                        <Image
                            src={faqImage}
                            alt="FAQ Illustration"
                            className="rounded-2xl w-full object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Right Side (FAQs) */}
                <div className="flex flex-col gap-4 h-full justify-center">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-4 shadow-sm bg-white transition-all"
                        >
                            <button
                                className="w-full flex justify-between items-center text-left"
                                onClick={() => toggleFaq(index)}
                            >
                                <span className="text-base md:text-lg font-medium text-gray-900">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <Minus className="text-amber-500" size={20} />
                                ) : (
                                    <Plus className="text-gray-500" size={20} />
                                )}
                            </button>

                            {/* Smooth transition container */}
                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? "max-h-40 mt-3" : "max-h-0"
                                    }`}
                            >
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default React.memo(FaqSection);

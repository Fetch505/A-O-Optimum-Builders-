"use client";
import React, { useState } from "react";
import { Mail, Send } from "lucide-react"; 
import Blocks from "@/assets/common/blocks.svg";
import Logo from "@/assets/common/Logo.png";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleEmailChange = () => {
    console.log("Email submitted:", email);
  };

  return (
    <footer className="w-full outerPadding flex flex-col justify-between">
      <main className="w-full bg-bg_dark rounded-3xl h-full p-4 md:p-8 lg:p-12">
        {/* 1. Newsletter Section */}
        <section className="relative w-full flex flex-col md:flex-row justify-between items-center rounded-3xl p-4 md:p-8 lg:p-12 gap-6 bg-gold overflow-hidden">
          {/* Heading */}
          <h2 className="text-white font-semibold text-center md:text-left w-full md:w-1/2 lg:max-w-sm text-2xl md:text-3xl lg:text-5xl z-10">
            Signup for our newsletter
          </h2>

          {/* Newsletter Input */}
          <div className="flex items-center w-full md:w-1/2 p-1 gap-1 bg-bg_dark rounded-full relative z-10">
            <div className="absolute left-4 text-white flex items-center">
              <Mail className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              className="pl-12 pr-6 py-2 lg:py-3 comtext bg-bg_input rounded-full outline-none flex-grow min-w-0 text-white placeholder:text-faded_gray"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <button
              onClick={handleEmailChange}
              className="bg-white text-bg_dark px-4 py-2 rounded-full font-bold flex items-center justify-center flex-shrink-0"
            >
              <span className="hidden lg:inline whitespace-nowrap comtext">
                Contact Us
              </span>
              <Send className="inline lg:hidden w-4 h-4" />
            </button>
          </div>

          {/* Blocks image only on large screens */}
          <Image
            src={Blocks}
            alt="blocks"
            className="absolute bottom-0 right-0 hidden lg:block object-contain pointer-events-none -z-0 select-none"
          />
        </section>

        {/* 2. Links Section */}
        <section className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mt-12 gap-6">
          {/* Logo and Description */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                <Image
                  src={Logo}
                  alt="Logo"
                  width={25}
                  height={25}
                  className="object-contain"
                />
              </div>
              <p className="text-white max-w-md comtext">
                A&O Optimum Builders
              </p>
              <p className="text-faded_gray max-w-md comtext">
                Building Dreams, One Project at a Time.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div className="flex flex-col gap-2">
              <div className="flex gap-6 flex-wrap">
                <Link href="/" className="text-faded_gray hover:underline comtext">
                  Home
                </Link>
                <Link href="/services" className="text-faded_gray hover:underline comtext">
                  Services
                </Link>
                <Link href="/contact" className="text-faded_gray hover:underline comtext">
                  Contact
                </Link>
              </div>

              <p className="text-faded_gray comtext">
                Address: 123 Main St, New York, NY
              </p>
              <p className="text-faded_gray comtext">Phone: (123) 456-7890</p>
            </div>
          </div>
        </section>

        {/* 3. Divider and Bottom Section */}
        <hr className="my-6 border-faded_gray" />
        <section className="w-full flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-faded_gray text-sm md:text-base comtext">
            &copy; {year} Softwicks. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/privacy-policy"
              className="text-faded_gray hover:underline text-sm md:text-base comtext"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-faded_gray hover:underline text-sm md:text-base comtext"
            >
              Terms of Service
            </Link>
          </div>
        </section>
      </main>
    </footer>
  );
};

export default React.memo(Footer);

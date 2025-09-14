"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react"; // 👈 Hamburger & Close icons
import Logo from "@/assets/common/Logo.png";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
  ];

  return (
    <nav className="absolute w-full p-6 z-20">
      <section className="flex bg-white items-center rounded-2xl justify-between px-3 py-2">
        {/* Left - Logo + Desktop Links */}
        <div className="flex items-center space-x-6 font-semibold">
          <Image
            src={Logo}
            alt="Logo"
            width={50}
            height={50}
            className="object-contain"
          />

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href
                    ? "text-black"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Contact Button */}
        <div className="hidden md:block">
          <Link
            href="/contact"
            className="font-semibold text-white bg-gold hover:bg-gold/80 px-6 py-2 rounded-xl"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={28} />
        </button>
      </section>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30">
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col space-y-6">
            {/* Close Button */}
            <button
              className="self-end mb-4"
              onClick={() => setIsOpen(false)}
            >
              <X size={28} />
            </button>

            {/* Mobile Links */}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-lg font-semibold transition-colors ${
                  pathname === link.href
                    ? "text-black"
                    : "text-gray-400 hover:text-black"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Contact Button */}
            <Link
              href="/contact"
              className="font-semibold text-center text-white bg-gold hover:bg-gold/80 px-6 py-2 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);

import React from "react";
import { Mail, Send } from "lucide-react"; // ✅ Send icon use karenge mobile pe

const Footer = () => {
  return (
    <footer className="w-full outerPadding h-auto">
      <main className="w-full bg-bg_dark rounded-3xl h-full p-3 md:p-6 lg:p-12">
        <section className="w-full flex flex-col md:flex-row justify-between items-center rounded-3xl p-3 md:p-6 lg:p-12 gap-6 bg-bg_footer_section1">
          {/* Heading */}
          <h2 className="text-white font-semibold comtext text-center md:text-left w-full md:w-1/2 lg:max-w-sm text-2xl md:text-3xl lg:text-4xl">
            Signup for our newsletter
          </h2>

          {/* Newsletter Input */}
          <div className="flex  items-center w-full md:w-1/2 relative bg-bg_dark rounded-full p-1">
            {/* Mail Icon inside input */}
            <div className="absolute left-4 text-white flex items-center">
              <Mail className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              className="pl-12 pr-6 py-2 lg:py-3 comtext bg-bg_input rounded-full outline-none flex-grow text-white placeholder:text-gray-400"
            />

            {/* Button */}
            <button className="bg-white text-bg_dark cominnerPadding rounded-full w-full lg:w-auto font-bold ml-0 md:ml-4 mt-2 md:mt-0 flex items-center justify-center">
              {/* Text (visible lg+) */}
              <span className="hidden lg:inline whitespace-nowrap comtext">
                Contact Us
              </span>
              {/* Icon (visible below lg) */}
              <Send className="inline lg:hidden w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </footer>
  );
};

export default React.memo(Footer);

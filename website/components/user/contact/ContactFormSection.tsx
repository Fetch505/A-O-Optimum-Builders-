"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ContactFormSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    email: "",
    address: "",
    comment: "",
  });

  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const validate = () => {
  const newInvalidFields: string[] = [];

  // Full Name required
  if (!formData.fullName.trim()) {
    toast.error("Full Name is required.");
    setInvalidFields(["fullName"]);
    return false;
  }

  // Contact required + validation
  if (!formData.contact.trim()) {
    toast.error("Contact is required.");
    setInvalidFields(["contact"]);
    return false;
  }
  if (!/^[0-9]{10,15}$/.test(formData.contact)) {
    toast.error("Contact must be 10–15 digits only.");
    setInvalidFields(["contact"]);
    return false;
  }

  // Email required + validation
  if (!formData.email.trim()) {
    toast.error("Email is required.");
    setInvalidFields(["email"]);
    return false;
  }
  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    toast.error("Please enter a valid email address.");
    setInvalidFields(["email"]);
    return false;
  }

  // Address required
  if (!formData.address.trim()) {
    toast.error("Address is required.");
    setInvalidFields(["address"]);
    return false;
  }

  // Comment required + max length
  if (!formData.comment.trim()) {
    toast.error("Message is required.");
    setInvalidFields(["comment"]);
    return false;
  }
  if (formData.comment.length > 1500) {
    toast.error("Message cannot exceed 1500 characters.");
    setInvalidFields(["comment"]);
    return false;
  }

  // ✅ If everything is valid
  setInvalidFields([]);
  return true;
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form Submitted ✅:", formData);
      toast.success("Form submitted successfully!");
    }
  };

  return (
    <section className="w-full px-3 py-6 flex flex-col gap-8">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#EFEFEF] py-12 px-4 md:px-8">
        <div className="w-full flex items-center justify-center">
          <p className="text-3xl md:text-4xl lg:text-5xl font-FigtreeRegular text-[#101828]">
            Let&apos;s talk
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col text-xl gap-8 mt-6 items-center px-12"
        >
          {/* Row 1 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-5 bg-white rounded-lg border ${
                invalidFields.includes("fullName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:ring-amber-400"
              } focus:outline-none focus:ring-2`}
            />
            <input
              type="text"
              name="contact"
              placeholder="Contact"
              value={formData.contact}
              onChange={handleChange}
              className={`w-full px-4 py-5 bg-white rounded-lg border ${
                invalidFields.includes("contact")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:ring-amber-400"
              } focus:outline-none focus:ring-2`}
            />
          </div>

          {/* Row 2 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-5 bg-white rounded-lg border ${
                invalidFields.includes("email")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:ring-amber-400"
              } focus:outline-none focus:ring-2`}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-5 bg-white rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Comment */}
          <div className="w-full flex flex-col relative">
            <textarea
              name="comment"
              placeholder="Tell us about your project"
              value={formData.comment}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white rounded-lg border ${
                invalidFields.includes("comment")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:ring-amber-400"
              } focus:outline-none focus:ring-2 resize-none`}
              rows={4}
              maxLength={1500}
            />
            {/* Character Counter */}
            <span className="absolute bottom-2 right-4 text-sm text-gray-500">
              {formData.comment.length}/1500
            </span>
          </div>

          {/* Submit Button */}
          <div className="w-full flex items-center justify-center mt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-gold text-white rounded-lg shadow-md hover:bg-gold transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;

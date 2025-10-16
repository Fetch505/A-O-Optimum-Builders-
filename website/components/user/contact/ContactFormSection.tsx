"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Check, X, Loader2 } from "lucide-react";

interface FormData {
  fullName: string;
  contact: string;
  email: string;
  address: string;
  comment: string;
}

interface ValidationState {
  fullName: boolean | null;
  contact: boolean | null;
  email: boolean | null;
  address: boolean | null;
  comment: boolean | null;
}

const ContactFormSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    contact: "",
    email: "",
    address: "",
    comment: "",
  });

  const [validationState, setValidationState] = useState<ValidationState>({
    fullName: null,
    contact: null,
    email: null,
    address: null,
    comment: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation on change
    if (touched.has(name)) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    validateField(name as keyof FormData, value);
  };

  const validateField = (fieldName: keyof FormData, value: string): boolean => {
    let isValid = false;
    let errorMessage = "";

    switch (fieldName) {
      case "fullName":
        isValid = value.trim().length >= 2;
        errorMessage = isValid ? "" : "Full Name must be at least 2 characters";
        break;

      case "contact":
        isValid = /^[0-9]{10,15}$/.test(value.trim());
        errorMessage = isValid ? "" : "Contact must be 10-15 digits only";
        break;

      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        errorMessage = isValid ? "" : "Please enter a valid email address";
        break;

      case "address":
        isValid = value.trim().length >= 5;
        errorMessage = isValid ? "" : "Address must be at least 5 characters";
        break;

      case "comment":
        isValid = value.trim().length >= 10 && value.length <= 1500;
        errorMessage = isValid
          ? ""
          : value.length > 1500
          ? "Message cannot exceed 1500 characters"
          : "Message must be at least 10 characters";
        break;
    }

    setValidationState((prev) => ({
      ...prev,
      [fieldName]: isValid,
    }));

    return isValid;
  };

  const validateAll = (): boolean => {
    const fields: (keyof FormData)[] = [
      "fullName",
      "contact",
      "email",
      "address",
      "comment",
    ];

    let allValid = true;
    const newTouched = new Set<string>();

    fields.forEach((field) => {
      newTouched.add(field);
      const isValid = validateField(field, formData[field]);
      if (!isValid) {
        allValid = false;
      }
    });

    setTouched(newTouched);
    return allValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        
        // Reset form
        setFormData({
          fullName: "",
          contact: "",
          email: "",
          address: "",
          comment: "",
        });
        setValidationState({
          fullName: null,
          contact: null,
          email: null,
          address: null,
          comment: null,
        });
        setTouched(new Set());
      } else {
        toast.error(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass = "w-full px-4 py-5 bg-white rounded-lg border transition-all duration-200";
    
    if (!touched.has(fieldName)) {
      return `${baseClass} border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20`;
    }

    if (validationState[fieldName] === true) {
      return `${baseClass} border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20`;
    }

    if (validationState[fieldName] === false) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
    }

    return `${baseClass} border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20`;
  };

  const renderValidationIcon = (fieldName: keyof FormData) => {
    if (!touched.has(fieldName)) return null;

    if (validationState[fieldName] === true) {
      return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
          <Check className="w-5 h-5" />
        </div>
      );
    }

    if (validationState[fieldName] === false) {
      return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
          <X className="w-5 h-5" />
        </div>
      );
    }

    return null;
  };

  return (
    <section className="w-full px-3 py-6 flex flex-col gap-8">
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />

      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 md:px-8">
        <div className="w-full flex items-center justify-center mb-8">
          <div className="text-center">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Let&apos;s talk
            </p>
            <p className="text-gray-600 text-lg">
              Fill out the form below and we&apos;ll get back to you shortly
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-4 md:px-8"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("fullName")}
                disabled={isSubmitting}
              />
              {renderValidationIcon("fullName")}
            </div>

            <div className="relative">
              <input
                type="text"
                name="contact"
                placeholder="Contact Number *"
                value={formData.contact}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("contact")}
                disabled={isSubmitting}
              />
              {renderValidationIcon("contact")}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("email")}
                disabled={isSubmitting}
              />
              {renderValidationIcon("email")}
            </div>

            <div className="relative">
              <input
                type="text"
                name="address"
                placeholder="Address *"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("address")}
                disabled={isSubmitting}
              />
              {renderValidationIcon("address")}
            </div>
          </div>

          {/* Comment */}
          <div className="relative">
            <textarea
              name="comment"
              placeholder="Tell us about your project *"
              value={formData.comment}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getInputClassName("comment")} resize-none min-h-[150px] pb-8`}
              maxLength={1500}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-3">
              <span className={`text-sm ${
                formData.comment.length > 1400 
                  ? 'text-red-500 font-semibold' 
                  : 'text-gray-500'
              }`}>
                {formData.comment.length}/1500
              </span>
              {touched.has("comment") && validationState.comment !== null && (
                <div className={validationState.comment ? "text-green-500" : "text-red-500"}>
                  {validationState.comment ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full flex items-center justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-2">
            * All fields are required
          </p>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
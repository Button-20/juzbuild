"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export default function ContactUs() {
  const initialFormData: FormData = {
    name: "",
    phone: "",
    email: "",
    message: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Your message has been sent successfully!",
        });
        resetForm();
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28">
      <div className="mb-16">
        <div className="flex gap-2.5 items-center justify-center mb-3">
          <span>
            <Icon
              icon={"ph:house-simple-fill"}
              width={20}
              height={20}
              className="text-primary"
            />
          </span>
          <p className="text-base font-semibold text-badge dark:text-white/90">
            Contact us
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14">
            Have questions? ready to help!
          </h3>
          <p className="text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6">
            Looking for your dream home or ready to sell? Our expert team offers
            personalized guidance and market expertise tailored to you.
          </p>
        </div>
      </div>
      {/* form */}
      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12">
          <div className="relative w-fit">
            <Image
              src={"/images/contactUs/contactUs.jpg"}
              alt="wall"
              width={497}
              height={535}
              className="rounded-2xl brightness-50 h-full"
              unoptimized={true}
            />
            <div className="absolute top-6 left-6 lg:top-12 lg:left-12 flex flex-col gap-2">
              <h5 className="text-xl xs:text-2xl mobile:text-3xl font-medium tracking-tight text-white">
                Contact information
              </h5>
              <p className="text-sm xs:text-base mobile:text-xm font-normal text-white/80">
                Ready to find your dream home or sell your property? We’re here
                to help!
              </p>
            </div>
            <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12 flex flex-col gap-4 text-white">
              <Link href={"/"} className="w-fit">
                <div className="flex items-center gap-4 group w-fit">
                  <Icon icon={"ph:phone"} width={32} height={32} />
                  <p className="text-sm xs:text-base mobile:text-xm font-normal group-hover:text-primary">
                    +233 55 065 3404
                  </p>
                </div>
              </Link>
              <Link href={"/"} className="w-fit">
                <div className="flex items-center gap-4 group w-fit">
                  <Icon icon={"ph:envelope-simple"} width={32} height={32} />
                  <p className="text-sm xs:text-base mobile:text-xm font-normal group-hover:text-primary">
                    support@gleamer.com
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Icon icon={"ph:map-pin"} width={32} height={32} />
                <p className="text-sm xs:text-base mobile:text-xm font-normal">
                  Accra, Ghana
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1/2">
            {/* Status Messages */}
            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon={
                      submitStatus.type === "success"
                        ? "ph:check-circle"
                        : "ph:warning-circle"
                    }
                    width={20}
                    height={20}
                  />
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoComplete="name"
                    placeholder="Name*"
                    required
                    disabled={isSubmitting}
                    className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    placeholder="Phone number*"
                    required
                    disabled={isSubmitting}
                    className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  placeholder="Email address*"
                  required
                  disabled={isSubmitting}
                  className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <textarea
                  rows={8}
                  cols={50}
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write here your message"
                  required
                  disabled={isSubmitting}
                  className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-primary focus:outline disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-full mobile:w-fit hover:cursor-pointer hover:bg-dark duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        icon="ph:spinner"
                        width={20}
                        height={20}
                        className="animate-spin"
                      />
                      Sending...
                    </>
                  ) : (
                    "Send message"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

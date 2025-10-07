"use client";
import PropertyCard from "@/components/Properties/PropertyCard";
import { formatCurrencyLegacy } from "@/lib/currency";
import { PropertyHomes } from "@/types/properyHomes";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// SEO metadata generator
const generateMetadata = (property: PropertyHomes | null) => {
  if (!property) return {};

  return {
    title: `${property.name} - ${property.location} | Real Estate`,
    description:
      property.description?.slice(0, 160) ||
      `${property.beds} bed, ${property.baths} bath ${
        property.propertyType
      } in ${property.location}. ${property.area}m² - ${
        property.price
          ? formatCurrencyLegacy(property.price, property.currency || "GHS")
          : "Price on request"
      }`,
  };
};

export default function PropertyDetails() {
  const { type, slug } = useParams() as { type: string; slug: string };
  const [property, setProperty] = useState<PropertyHomes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProperties, setRelatedProperties] = useState<PropertyHomes[]>(
    []
  );
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${slug}`);

        if (!response.ok) {
          throw new Error("Property not found");
        }

        const data = await response.json();
        setProperty(data);

        // Fetch related properties
        setRelatedLoading(true);
        try {
          const relatedResponse = await fetch(
            `/api/properties/${slug}/related?limit=4`
          );
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedProperties(relatedData);
          }
        } catch (relatedError) {
          console.error("Failed to fetch related properties:", relatedError);
        } finally {
          setRelatedLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (slug && type) {
      fetchProperty();
    }
  }, [slug, type]);

  // Update document head for SEO
  useEffect(() => {
    if (property) {
      const metadata = generateMetadata(property);
      if (metadata.title) {
        document.title = metadata.title;
      }

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      if (metadata.description) {
        metaDescription.setAttribute("content", metadata.description);
      }
    }
  }, [property]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = () => {
    if (!property) return "Price on request";

    if (property.rate) {
      return property.rate;
    }
    if (property.price && property.currency) {
      return formatCurrencyLegacy(property.price, property.currency);
    }
    return "Price on request";
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          propertyName: property?.name,
          propertyUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setContactForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        });

        alert(
          data.message ||
            "Thank you for your inquiry! We'll get back to you soon."
        );
      } else {
        alert(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <section className="!pt-44 pb-20">
        <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading property...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !property) {
    return (
      <section className="!pt-44 pb-20">
        <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
          <div className="text-center py-16">
            <Icon
              icon="ph:house-x"
              className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-dark dark:text-white mb-2">
              Property Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The property you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Link
              href={`/properties/${type}`}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-block"
            >
              Back to {capitalizeFirst(type)} Properties
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="!pt-24 sm:!pt-32 lg:!pt-44 pb-12 sm:pb-16 lg:pb-20 relative">
      <div className="container mx-auto max-w-8xl px-4 sm:px-5 2xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8 overflow-x-auto">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <Icon
              icon="ph:caret-right"
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            />
            <li>
              <Link href="/properties" className="hover:text-primary">
                Properties
              </Link>
            </li>
            <Icon
              icon="ph:caret-right"
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            />
            <li>
              <Link href={`/properties/${type}`} className="hover:text-primary">
                {capitalizeFirst(type)}
              </Link>
            </li>
            <Icon
              icon="ph:caret-right"
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            />
            <li className="text-dark dark:text-white truncate">
              {property.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8">
          {/* Property Info */}
          <div className="lg:col-span-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-32 md:text-40 lg:text-52 font-semibold text-dark dark:text-white mb-2 sm:mb-3 leading-tight">
                {property.name}
              </h1>
              <div className="flex items-start sm:items-center gap-2 mb-4 sm:mb-6">
                <Icon
                  icon="ph:map-pin"
                  width={20}
                  height={20}
                  className="text-dark/50 dark:text-white/50 flex-shrink-0 mt-0.5 sm:mt-0 sm:w-6 sm:h-6"
                />
                <p className="text-dark/50 dark:text-white/50 text-base sm:text-lg leading-relaxed">
                  {property.location}
                </p>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-4 sm:mb-6">
                {formatPrice()}
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:bed-linear"
                    width={18}
                    height={18}
                    className="sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-dark dark:text-white">
                    {property.beds}{" "}
                    {property.beds === 1 ? "Bedroom" : "Bedrooms"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:bath-linear"
                    width={18}
                    height={18}
                    className="sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-dark dark:text-white">
                    {property.baths}{" "}
                    {property.baths === 1 ? "Bathroom" : "Bathrooms"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    icon="lineicons:arrow-all-direction"
                    width={18}
                    height={18}
                    className="sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-dark dark:text-white">
                    {property.area}m²
                  </span>
                </div>
              </div>
            </div>

            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 group cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <Image
                    src={
                      property.images[currentImageIndex]?.src ||
                      property.images[0].src
                    }
                    alt={
                      property.images[currentImageIndex]?.alt || property.name
                    }
                    width={800}
                    height={500}
                    className="w-full h-56 sm:h-80 lg:h-96 xl:h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={true}
                  />

                  {/* Zoom indicator */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/50 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon
                      icon="ph:magnifying-glass-plus"
                      width={16}
                      height={16}
                      className="sm:w-5 sm:h-5"
                    />
                  </div>

                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Icon
                          icon="ph:caret-left"
                          width={16}
                          height={16}
                          className="sm:w-5 sm:h-5"
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Icon
                          icon="ph:caret-right"
                          width={16}
                          height={16}
                          className="sm:w-5 sm:h-5"
                        />
                      </button>
                      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Image Thumbnails */}
                {property.images.length > 1 && (
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt || `Image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Property Description */}
            {property.description && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-medium text-dark dark:text-white mb-3 sm:mb-4">
                  Description
                </h3>
                <p className="text-dark/70 dark:text-white/70 leading-relaxed text-sm sm:text-base">
                  {property.description}
                </p>
              </div>
            )}

            {/* Property Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-medium text-dark dark:text-white mb-3 sm:mb-4">
                  Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-dark dark:text-white"
                    >
                      <Icon
                        icon="ph:check-circle"
                        className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-medium text-dark dark:text-white mb-3 sm:mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-dark dark:text-white"
                    >
                      <Icon
                        icon="ph:star"
                        className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Property Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-dark dark:text-white mb-3 sm:mb-4">
                Property Details
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Price
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-dark dark:text-white">
                    {formatPrice()}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Property Type
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-dark dark:text-white capitalize">
                    {typeof property.propertyType === "object"
                      ? property.propertyType?.name
                      : property.propertyType || "Property"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      property.status === "for-sale"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : property.status === "for-rent"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : property.status === "sold"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    }`}
                  >
                    {property.status?.replace("-", " ") || "Available"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Bedrooms
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-dark dark:text-white">
                    {property.beds}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Bathrooms
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-dark dark:text-white">
                    {property.baths}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Area
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-dark dark:text-white">
                    {property.area}m²
                  </span>
                </div>

                {property.isFeatured && (
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Featured
                    </span>
                    <Icon
                      icon="ph:star-fill"
                      className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-dark dark:text-white mb-3 sm:mb-4">
                Interested in this property?
              </h3>

              <form
                onSubmit={handleContactSubmit}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows={3}
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm sm:text-base"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="cursor-pointer w-full bg-primary text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {contactLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:paper-plane-tilt" className="w-4 h-4" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-dark dark:text-white mb-3 sm:mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <Link
                  href={`/properties/${type}`}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-dark dark:text-white text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Icon icon="ph:arrow-left" className="w-4 h-4" />
                  Back to {capitalizeFirst(type)} Properties
                </Link>

                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-dark dark:text-white text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Icon icon="ph:printer" className="w-4 h-4" />
                  Print Details
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: property.name,
                        text: `Check out this ${
                          typeof property.propertyType === "object"
                            ? property.propertyType?.name
                            : property.propertyType || "property"
                        } in ${property.location}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Property URL copied to clipboard!");
                    }
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-dark dark:text-white text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Icon icon="ph:share" className="w-4 h-4" />
                  Share Property
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-12 sm:mt-14 lg:mt-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-dark dark:text-white mb-6 sm:mb-8 text-center">
              Similar Properties
            </h2>

            {relatedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="w-full h-40 sm:h-48 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="flex gap-2 sm:gap-4">
                        <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-10 sm:w-12"></div>
                        <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-10 sm:w-12"></div>
                        <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 sm:w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProperties.map((relatedProperty) => (
                  <PropertyCard
                    key={relatedProperty._id}
                    property={relatedProperty}
                  />
                ))}
              </div>
            )}

            {relatedProperties.length >= 4 && (
              <div className="text-center mt-6 sm:mt-8">
                <Link
                  href={`/properties/${type}`}
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                >
                  View All {capitalizeFirst(type)} Properties
                  <Icon icon="ph:arrow-right" className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && property?.images && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Icon icon="ph:x" width={24} height={24} />
            </button>

            <Image
              src={
                property.images[currentImageIndex]?.src ||
                property.images[0].src
              }
              alt={property.images[currentImageIndex]?.alt || property.name}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              unoptimized={true}
            />

            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Icon icon="ph:caret-left" width={24} height={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Icon icon="ph:caret-right" width={24} height={24} />
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 z-40"
        >
          <Icon icon="ph:arrow-up" width={20} height={20} />
        </button>
      )}
    </section>
  );
}

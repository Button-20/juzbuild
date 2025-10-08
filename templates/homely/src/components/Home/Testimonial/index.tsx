"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Testimonial as TestimonialType } from "@/types/testimonial";
import { Icon } from "@iconify/react";
import Image from "next/image";
import * as React from "react";

const Testimonial = () => {
  const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [testimonials, setTestimonials] = React.useState<TestimonialType[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials);
        } else {
          console.error("Failed to fetch testimonials");
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  React.useEffect(() => {
    if (!api || testimonials.length === 0) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, testimonials]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (loading) {
    return (
      <section className="bg-dark relative overflow-hidden" id="testimonial">
        <div className="absolute right-0">
          <Image
            src="/images/testimonial/Vector.png"
            alt="victor"
            width={700}
            height={1039}
            unoptimized={true}
          />
        </div>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="animate-pulse py-16">
            <div className="h-6 bg-gray-700 rounded mb-4 w-48 mx-auto"></div>
            <div className="h-16 bg-gray-700 rounded mb-8 w-80 mx-auto"></div>
            <div className="lg:flex items-center gap-11">
              <div className="flex items-start gap-11 lg:pr-20">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-32 bg-gray-700 rounded mb-8"></div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="h-6 bg-gray-700 rounded mb-2 w-32"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-96 bg-gray-700 rounded-2xl lg:block hidden"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="bg-dark relative overflow-hidden" id="testimonial">
        <div className="absolute right-0">
          <Image
            src="/images/testimonial/Vector.png"
            alt="victor"
            width={700}
            height={1039}
            unoptimized={true}
          />
        </div>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-16">
            <p className="text-white text-base font-semibold flex gap-2 justify-center mb-4">
              <Icon
                icon="ph:house-simple-fill"
                className="text-2xl text-primary"
              />
              Testimonials
            </p>
            <h2 className="lg:text-52 text-40 font-medium text-white mb-8">
              What our clients say
            </h2>
            <Icon
              icon="ph:chat-circle"
              className="text-6xl text-gray-600 mx-auto mb-4"
            />
            <p className="text-lg text-gray-400">
              No testimonials available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-dark relative overflow-hidden py-12 sm:py-16 lg:py-20"
      id="testimonial"
    >
      <div className="absolute right-0 top-0">
        <Image
          src="/images/testimonial/Vector.png"
          alt="victor"
          width={700}
          height={1039}
          className="opacity-30 lg:opacity-100"
          unoptimized={true}
        />
      </div>
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0 relative z-10">
        <div className="text-center lg:text-left mb-8 sm:mb-12 lg:mb-16">
          <p className="text-white text-sm sm:text-base font-semibold flex gap-2 justify-center lg:justify-start mb-3 sm:mb-4">
            <Icon
              icon="ph:house-simple-fill"
              className="text-xl sm:text-2xl text-primary"
            />
            Testimonials
          </p>
          <h2 className="text-28 sm:text-32 lg:text-52 font-medium text-white">
            What our clients say
          </h2>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {testimonials.map((item, index) => (
              <CarouselItem
                key={item._id || index}
                className="mt-4 sm:mt-6 lg:mt-9"
              >
                <div className="lg:flex items-center gap-8 lg:gap-11">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-11 lg:pr-20 mb-8 lg:mb-0">
                    <div className="flex-shrink-0">
                      <Icon
                        icon="ph:house-simple"
                        width={24}
                        height={24}
                        className="text-primary sm:w-8 sm:h-8"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-lg sm:text-xl lg:text-3xl leading-relaxed mb-4 sm:mb-6 lg:mb-8">
                        {item.message || item.review || "Great service!"}
                      </h4>
                      {item.rating && (
                        <div className="flex items-center gap-1 mb-4 sm:mb-6 lg:mb-8">
                          {[...Array(item.rating)].map((_, i) => (
                            <Icon
                              key={i}
                              icon="ph:star-fill"
                              className="text-yellow-400 text-base sm:text-lg"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 sm:gap-6">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-full lg:hidden block object-cover sm:w-20 sm:h-20"
                          unoptimized={true}
                        />
                        <div>
                          <h6 className="text-white text-sm sm:text-base font-medium mb-1">
                            {item.name}
                          </h6>
                          <p className="text-white/40 text-xs sm:text-sm">
                            {item.role || item.position}
                            {item.company && `, ${item.company}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-auto lg:flex-shrink-0 rounded-2xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={320}
                      height={320}
                      className="lg:block hidden object-cover w-full h-64 sm:h-80 lg:w-80 lg:h-80"
                      unoptimized={true}
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {count > 1 && (
          <div className="flex justify-center mt-8 sm:mt-12 lg:mt-16 gap-2 sm:gap-2.5">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-300 ${
                  current === index + 1 ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonial;

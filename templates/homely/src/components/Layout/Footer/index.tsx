import { FooterLinks } from "@/app/api/footerlinks";
import { Icon } from "@iconify/react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-dark">
      <div className="container mx-auto max-w-8xl pt-14 px-4 sm:px-6 lg:px-0">
        <div className="flex lg:items-center justify-between items-start lg:gap-11 pb-14 border-b border-white/10 lg:flex-nowrap flex-wrap gap-6">
          <p className="text-white text-sm lg:max-w-1/5 w-full lg:w-auto">
            Stay updated with the latest news, promotions, and exclusive offers.
          </p>
          <div className="flex lg:flex-row flex-col items-start lg:items-center lg:gap-10 gap-4 w-full lg:w-auto">
            <div className="flex sm:flex-row flex-col gap-2 lg:order-1 order-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="rounded-full py-3 sm:py-4 px-4 sm:px-6 bg-white/10 placeholder:text-white text-white focus-visible:outline-0 text-sm sm:text-base w-full sm:w-auto min-w-0 sm:min-w-[200px]"
              />
              <button className="text-dark bg-white py-3 sm:py-4 px-6 sm:px-8 font-semibold rounded-full hover:bg-primary hover:text-white duration-300 hover:cursor-pointer text-sm sm:text-base whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-white/40 text-xs sm:text-sm lg:max-w-[45%] order-1 lg:order-2 leading-relaxed">
              By subscribing, you agree to receive our promotional emails. You
              can unsubscribe at any time.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-center lg:justify-start">
            <Link
              href="https://twitter.com/homelyrealestate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                icon="ph:x-logo-bold"
                width={20}
                height={20}
                className="text-white hover:text-primary duration-300 sm:w-6 sm:h-6"
              />
            </Link>
            <Link
              href="https://facebook.com/homelyrealestate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                icon="ph:facebook-logo-bold"
                width={20}
                height={20}
                className="text-white hover:text-primary duration-300 sm:w-6 sm:h-6"
              />
            </Link>
            <Link
              href="https://instagram.com/homelyrealestate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                icon="ph:instagram-logo-bold"
                width={20}
                height={20}
                className="text-white hover:text-primary duration-300 sm:w-6 sm:h-6"
              />
            </Link>
          </div>
        </div>
        <div className="py-12 sm:py-16 border-b border-white/10">
          <div className="grid grid-cols-12 sm:gap-10 gap-y-8">
            <div className="lg:col-span-7 md:col-span-8 col-span-12">
              <h2 className="text-white leading-[1.2] text-28 sm:text-32 lg:text-40 font-medium mb-4 sm:mb-6 lg:max-w-3/4">
                Begin your path to success contact us today.
              </h2>
              <Link
                href="/contactus"
                className="bg-primary text-sm sm:text-base font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-white hover:bg-white hover:text-dark duration-300 hover:cursor-pointer inline-block"
              >
                Get In Touch
              </Link>
            </div>
            <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-6">
              <div className="flex flex-col gap-3 sm:gap-4 w-fit">
                {FooterLinks.slice(0, 4).map((item, index) => (
                  <div key={index}>
                    <Link
                      href={item.href}
                      className="text-white/40 text-sm sm:text-base hover:text-white duration-300"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 md:col-span-12 sm:col-span-6 col-span-6">
              <div className="flex flex-col gap-3 sm:gap-4 w-fit">
                {FooterLinks.slice(4, 8).map((item, index) => (
                  <div key={index}>
                    <Link
                      href={item.href}
                      className="text-white/40 text-sm sm:text-base hover:text-white duration-300"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between md:flex-nowrap flex-wrap items-center py-4 sm:py-6 gap-4 sm:gap-6">
          <p className="text-white/40 text-xs sm:text-sm order-2 md:order-1 w-full md:w-auto text-center md:text-left">
            ©2025 Homely - Design & Developed by{" "}
            <Link
              href="https://icanvassolutions.com/"
              className="hover:text-primary duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              iCanvas Solutions
            </Link>
          </p>
          <div className="flex gap-4 sm:gap-8 items-center order-1 md:order-2 w-full md:w-auto justify-center md:justify-end">
            <Link
              href="/terms-of-service"
              className="text-white/40 hover:text-primary text-xs sm:text-sm duration-300"
            >
              Terms of service
            </Link>
            <Link
              href="/privacy-policy"
              className="text-white/40 hover:text-primary text-xs sm:text-sm duration-300"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

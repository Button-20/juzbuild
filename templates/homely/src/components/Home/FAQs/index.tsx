import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@iconify/react";
import Image from "next/image";

const FAQ: React.FC = () => {
  return (
    <section id="faqs" className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="order-2 lg:order-1 mx-auto lg:mx-0">
            <Image
              src="/images/faqs/faq-image.png"
              alt="FAQ illustration"
              width={680}
              height={644}
              className="w-full h-auto max-w-md sm:max-w-lg lg:max-w-full"
              unoptimized={true}
            />
          </div>
          <div className="order-1 lg:order-2 lg:px-8 xl:px-12">
            <p className="text-dark/75 dark:text-white/75 text-sm sm:text-base font-semibold flex gap-2 mb-3 sm:mb-4">
              <Icon
                icon="ph:house-simple-fill"
                className="text-xl sm:text-2xl text-primary"
              />
              FAQs
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-40 xl:text-52 leading-[1.2] font-medium text-dark dark:text-white mb-4 sm:mb-6">
              Everything about Homely homes
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 lg:pr-8 xl:pr-20">
              We know that buying, selling, or investing in real estate can be
              overwhelming. Here are some frequently asked questions to help
              guide you through the process
            </p>
            <div className="mt-6 sm:mt-8">
              <Accordion
                type="single"
                defaultValue="item-1"
                collapsible
                className="w-full flex flex-col gap-4 sm:gap-6"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm sm:text-base font-medium hover:no-underline py-4 sm:py-6">
                    1. Can I personalize my homely home?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-dark/70 dark:text-white/70 pb-4 sm:pb-6">
                    Discover a diverse range of premium properties, from
                    luxurious apartments to spacious villas, tailored to your
                    needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-sm sm:text-base font-medium hover:no-underline py-4 sm:py-6">
                    2. Where can I find homely homes?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-dark/70 dark:text-white/70 pb-4 sm:pb-6">
                    Discover a diverse range of premium properties, from
                    luxurious apartments to spacious villas, tailored to your
                    needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-sm sm:text-base font-medium hover:no-underline py-4 sm:py-6">
                    3. What steps to buy a homely?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-dark/70 dark:text-white/70 pb-4 sm:pb-6">
                    Discover a diverse range of premium properties, from
                    luxurious apartments to spacious villas, tailored to your
                    needs.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

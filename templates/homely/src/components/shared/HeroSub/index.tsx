import { Icon } from "@iconify/react/dist/iconify.js";
import { FC } from "react";

interface HeroSubProps {
  title: string;
  description: string;
  badge: string;
}

const HeroSub: FC<HeroSubProps> = ({ title, description, badge }) => {
  return (
    <>
      <section className="text-center bg-cover !pt-24 sm:!pt-32 lg:!pt-40 pb-12 sm:pb-16 lg:pb-20 relative overflow-x-hidden px-4 sm:px-6">
        <div className="flex gap-2 sm:gap-2.5 items-center justify-center mb-4 sm:mb-6">
          <span>
            <Icon
              icon={"ph:house-simple-fill"}
              width={16}
              height={16}
              className="text-primary sm:w-5 sm:h-5"
            />
          </span>
          <p className="text-sm sm:text-base font-semibold text-dark/75 dark:text-white/75">
            {badge}
          </p>
        </div>
        <h2 className="text-dark text-2xl sm:text-36 lg:text-52 relative font-bold dark:text-white mb-4 sm:mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-dark/50 dark:text-white/50 font-normal w-full max-w-2xl mx-auto px-4 sm:px-0">
          {description}
        </p>
      </section>
    </>
  );
};

export default HeroSub;

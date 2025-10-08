import Link from "next/link";

const GetInTouch: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
        <div className="relative rounded-t-2xl overflow-hidden">
          <video
            className="w-full h-64 sm:h-80 md:h-96 lg:h-auto absolute top-0 left-0 object-cover -z-10"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Video background showing luxurious real estate"
          >
            <source
              src="https://videos.pexels.com/video-files/7233782/7233782-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
          </video>

          <div className="bg-black/40 py-16 sm:py-20 md:py-28 lg:py-64 relative z-10">
            <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 sm:px-6">
              <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-40 xl:text-52 max-w-5xl text-center font-medium leading-tight">
                Enter a realm where exquisite design and timeless luxury come
                together.
              </h2>
              <Link
                href="/contactus"
                className="bg-white py-3 sm:py-4 px-6 sm:px-8 rounded-full text-dark hover:bg-dark hover:text-white duration-300 text-sm sm:text-base font-medium"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full py-3 sm:py-4 lg:py-5 bg-primary rounded-b-2xl overflow-hidden">
          <div className="flex items-center gap-20 sm:gap-32 lg:gap-40 animate-slide">
            <p className="text-white text-xs sm:text-sm lg:text-base whitespace-nowrap relative after:absolute after:w-12 sm:after:w-16 lg:after:w-20 after:h-px after:bg-white after:top-2 sm:after:top-2.5 lg:after:top-3 after:-right-16 sm:after:-right-24 lg:after:-right-32">
              GET A FREE PROPERTY VALUATION—SELL YOUR HOME WITH CONFIDENCE!
            </p>
            <p className="text-white text-xs sm:text-sm lg:text-base whitespace-nowrap relative after:absolute after:w-12 sm:after:w-16 lg:after:w-20 after:h-px after:bg-white after:top-2 sm:after:top-2.5 lg:after:top-3 after:-right-16 sm:after:-right-24 lg:after:-right-32">
              BROWSE THOUSANDS OF LISTINGS IN PRIME LOCATIONS AT GREAT PRICES!
            </p>
            <p className="text-white text-xs sm:text-sm lg:text-base whitespace-nowrap relative after:absolute after:w-12 sm:after:w-16 lg:after:w-20 after:h-px after:bg-white after:top-2 sm:after:top-2.5 lg:after:top-3 after:-right-16 sm:after:-right-24 lg:after:-right-32">
              GET A FREE PROPERTY VALUATION—SELL YOUR HOME WITH CONFIDENCE!
            </p>
            <p className="text-white text-xs sm:text-sm lg:text-base whitespace-nowrap relative after:absolute after:w-12 sm:after:w-16 lg:after:w-20 after:h-px after:bg-white after:top-2 sm:after:top-2.5 lg:after:top-3 after:-right-16 sm:after:-right-24 lg:after:-right-32">
              BROWSE THOUSANDS OF LISTINGS IN PRIME LOCATIONS AT GREAT PRICES!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;

import Image from "next/image";

const Logo: React.FC<{
  isHomepage?: boolean;
  sticky?: boolean;
}> = ({ isHomepage, sticky }: { isHomepage?: boolean; sticky?: boolean }) => {
  return (
    <>
      <Image
        src={"/images/header/dark-logo.svg"}
        alt="logo"
        width={150}
        height={68}
        unoptimized={true}
        className={`w-30 h-auto sm:w-32 lg:w-[180px] ${
          isHomepage
            ? sticky
              ? "block dark:hidden"
              : "hidden"
            : sticky
            ? "block dark:hidden"
            : "block dark:hidden"
        }`}
      />
      <Image
        src={"/images/header/logo.svg"}
        alt="logo"
        width={150}
        height={68}
        unoptimized={true}
        className={`w-30 h-auto sm:w-32 lg:w-[180px] ${
          isHomepage
            ? sticky
              ? "hidden dark:block"
              : "block"
            : sticky
            ? "dark:block hidden"
            : "dark:block hidden"
        }`}
      />
    </>
  );
};

export default Logo;

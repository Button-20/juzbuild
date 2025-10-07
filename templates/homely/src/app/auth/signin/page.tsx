import Signin from "@/components/Auth/SignIn";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | Homely",
};

const SigninPage = () => {
  return (
    <>
      <section className="pt-44! mx-5 md:mx-0 flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
          <Suspense fallback={<div>Loading...</div>}>
            <Signin />
          </Suspense>
        </div>
      </section>
    </>
  );
};

export default SigninPage;

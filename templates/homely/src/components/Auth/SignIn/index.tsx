"use client";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Signin = ({ signInOpen }: { signInOpen?: any }) => {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("jasonaddy51@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const authDialog = useContext(AuthDialogContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Handle redirect after successful authentication
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const redirectUrl =
        callbackUrl || (session.user.role === "admin" ? "/admin" : "/");

      if (!signInOpen) {
        // This is a standalone signin page, redirect immediately
        router.push(redirectUrl);
      } else {
        // This is a modal/dialog, close it and redirect
        setTimeout(() => {
          signInOpen(false);
          router.push(redirectUrl);
        }, 1200);
      }
    }
  }, [session, status, callbackUrl, router, signInOpen]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl || undefined,
    });

    if (result?.error) {
      setError(result.error);
      authDialog?.setIsFailedDialogOpen(true);
      setTimeout(() => {
        authDialog?.setIsFailedDialogOpen(false);
      }, 1100);
    } else if (result?.ok) {
      // Success will be handled by useEffect
      toast.success("Sign in successful!");
      if (signInOpen) {
        authDialog?.setIsSuccessDialogOpen(true);
        setTimeout(() => {
          authDialog?.setIsSuccessDialogOpen(false);
        }, 1100);
      }
    }
  };

  return (
    <>
      <div className="mb-10 text-center flex justify-center">
        <Logo />
      </div>

      <Toaster />

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {callbackUrl?.includes("admin") && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-center">
          <p className="text-sm">
            🔐 Admin access required. Please sign in with admin credentials.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border placeholder:text-gray-400 border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            required
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-primary hover:bg-transparent hover:text-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out "
          >
            Sign In
          </button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="mb-2 text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>
    </>
  );
};

export default Signin;

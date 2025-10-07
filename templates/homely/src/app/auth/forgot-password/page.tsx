"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <style jsx global>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce-slow {
            0%,
            20%,
            50%,
            80%,
            100% {
              transform: translateY(0) scale(1);
            }
            40% {
              transform: translateY(-10px) scale(1.05);
            }
            60% {
              transform: translateY(-5px) scale(1.02);
            }
          }
          @keyframes pulse-success {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.8s ease-out 0.2s both;
          }
          .animate-fade-in-delay {
            animation: fade-in 0.6s ease-out 0.4s both;
          }
          .animate-pulse-success {
            animation: pulse-success 2s infinite;
          }
        `}</style>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-black dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-pulse-success">
                <FiCheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white animate-slide-up">
                Email Sent!
              </h2>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-fade-in-delay">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {email}
                </span>
                . Check your inbox and click the link to reset your password.
              </p>
            </div>

            <div className="mt-8 animate-fade-in-delay">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p className="font-medium mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>The link will expire in 1 hour</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center animate-fade-in-delay">
              <Link
                href="/signin"
                className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-all duration-200 hover:scale-105"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-10px) scale(1.05);
          }
          60% {
            transform: translateY(-5px) scale(1.02);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.4s both;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <FiMail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white animate-slide-down">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 animate-slide-up">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <form
            className="mt-8 space-y-6 animate-slide-up"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20 transition-colors duration-200" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative appearance-none rounded-lg block w-full pl-12 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md focus:scale-[1.02]"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-fade-in">
                <div className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            )}

            <div className="animate-fade-in-delay">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] hover:shadow-lg transform active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </button>
            </div>
          </form>

          <div className="text-center animate-fade-in-delay">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

import Signin from "@/components/Auth/Signin";
import logo from "@/assets/logos/logo2.webp";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | KOPMA",
  description: "Log in to your KOPMA account",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-[#020D1A]">
      {/* Main Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
        {/* Left Side - Login Form */}
        <div className="w-full p-8 sm:p-12 md:w-1/2 md:p-16">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src={logo}
              alt="KOPMA Logo"
              width={120}
              height={50}
              className="h-auto w-auto"
              priority
            />
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold text-dark dark:text-white">
              Log in to your Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Select method to log in:
            </p>
          </div>

          {/* Sign In Form */}
          <Signin />
        </div>

        {/* Right Side - Branding (Desktop only) */}
        <div className="hidden w-1/2 bg-green-600 p-16 md:flex md:flex-col md:justify-between">
          {/* Illustration */}
          <div className="flex flex-1 items-center justify-center">
            <div className="relative">
              {/* Central Hub */}
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"></div>

              {/* App Icons */}
              <div className="relative z-10 space-y-6">
                {/* Top - Slack-like icon */}
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM24 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521 2.527 2.527 0 0 1 2.52-2.52h2.522v2.52zm-1.271 0a2.527 2.527 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.52h6.313A2.528 2.528 0 0 1 24 6.314a2.528 2.528 0 0 1-2.522 2.52h-6.313zm-3.792 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 18.937 24a2.527 2.527 0 0 1-2.52-2.522v-2.52h2.52zm0-1.271a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521v-6.313a2.528 2.528 0 0 1 2.521-2.521 2.528 2.528 0 0 1 2.521 2.521v6.313z" />
                    </svg>
                  </div>
                </div>

                {/* Left - Notion-like icon */}
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.22 2.24c-.42-.326-.98-.7-2.055-.607L3.01 2.712c-.467.047-.56.28-.374.466l1.823 1.03zM6.24 8.428v11.76c0 .653.327.887 1.074.84l14.605-.98c.747-.046.934-.513.934-1.073V6.875c0-.56-.187-.887-.84-.84l-14.82.98c-.654.047-.98.514-.98 1.074v.339h.027zm16.108-.56v11.2c0 .28-.094.467-.42.467l-13.069.84c-.327 0-.42-.14-.42-.42v-11.2c0-.28.14-.42.42-.42l13.069-.84c.326-.047.42.093.42.373zm-6.813 3.266c-.327-.373-.794-.7-1.54-.7-1.633 0-3.032 1.54-3.032 3.36 0 1.913 1.586 3.22 3.032 3.22.793 0 1.26-.327 1.54-.7v.653s-.047.28.28.28h1.586c.327 0 .374-.14.374-.42v-5.413c0-.28-.094-.42-.374-.42h-1.586c-.327 0-.28.327-.28.327v-.187zm-1.54 5.18c-1.027 0-1.82-.887-1.82-2.24 0-1.353.793-2.24 1.82-2.24 1.026 0 1.82.933 1.82 2.24 0 1.306-.794 2.24-1.82 2.24zm5.412-5.18c-.327-.373-.793-.7-1.54-.7-1.633 0-3.032 1.54-3.032 3.36 0 1.913 1.586 3.22 3.032 3.22.793 0 1.26-.327 1.54-.7v.653s-.047.28.28.28h1.586c.327 0 .374-.14.374-.42v-5.413c0-.28-.094-.42-.374-.42h-1.586c-.327 0-.28.327-.28.327v-.187zm-1.54 5.18c-1.027 0-1.82-.887-1.82-2.24 0-1.353.793-2.24 1.82-2.24 1.026 0 1.82.933 1.82 2.24 0 1.306-.794 2.24-1.82 2.24z" />
                    </svg>
                  </div>
                </div>

                {/* Right - Users illustration */}
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dashboard Mockup */}
              <div className="absolute -right-16 top-8 z-20">
                <div className="w-64 rounded-lg bg-white p-4 shadow-2xl">
                  {/* Mockup Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  {/* Mockup Content */}
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                        <div className="h-2 flex-1 rounded bg-gray-200"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                        <div className="h-2 flex-1 rounded bg-gray-200"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                        <div className="h-2 flex-1 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center text-white">
            <h3 className="mb-2 text-xl font-semibold">
              Connect with every application.
            </h3>
            <p className="text-sm text-white/80">
              Everything you need in an easily customizable dashboard.
            </p>

            {/* Carousel Dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <div className="h-2 w-2 rounded-full bg-white/40"></div>
              <div className="h-2 w-2 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

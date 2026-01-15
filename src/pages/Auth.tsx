"use client";

import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8">
        <AuthForm isSignupDefault={isSignup} />
      </div>
    </div>
  );
}

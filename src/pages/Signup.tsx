import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Signup() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is on desktop → redirect so modal can open
    if (!isMobile) {
      navigate("/", { replace: true });
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <SignupForm />
      </div>
    );
  }

  return null;
}

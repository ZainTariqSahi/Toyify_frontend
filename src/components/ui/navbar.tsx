"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, UserIcon, LogOut, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { SignupDialog } from "@/components/auth/SignupDialog";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  navigate: (path: string) => void;
  onOpenProfile?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export default function Navbar({
  navigate,
  onOpenProfile,
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isMobile = useIsMobile();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleLogin = () => {
    if (isMobile) navigate("/auth");
    else setLoginOpen(true);
  };

  const handleSignup = () => {
    if (isMobile) navigate("/signup");
    else setSignupOpen(true);
  };

  const getUsername = () => {
    if (!user) return "User";
    return user.username || user.name || user.email?.split("@")[0] || "User";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-transparent">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8">
        <div className="flex items-center h-14">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-4 text-white hover:opacity-90 transition-opacity"
          >
            <img
              src="/Logo.svg"
              alt="Toyify Logo"
              className="w-15 h-15 object-contain"
            />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-9 ml-10">
            <button onClick={() => navigate("/about")} className="nav-link">
              About
            </button>
            <button onClick={() => navigate("/contact")} className="nav-link">
              Contact
            </button>
            <button onClick={() => navigate("/privacy")} className="nav-link">
              Privacy
            </button>
            <button onClick={() => navigate("/terms")} className="nav-link">
              Terms
            </button>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <a href="/cart">
              <button className="text-white/80 hover:text-white transition-colors p-2">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </button>
            </a>

            {!user ? (
              <Button
                onClick={handleLogin}
                className="bg-[#42307D] text-white hover:bg-[#7F56D9] rounded-lg px-5 py-2 text-sm font-medium"
              >
                Sign in
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={onOpenProfile}
                  variant="ghost"
                  className="nav-auth-btn text-white hover:text-purple-600 transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Hi, {getUsername()}
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="nav-auth-btn text-white hover:text-purple-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2 ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-600/95 backdrop-blur-sm border-t border-white/10 px-4 py-4">
          <div className="flex flex-col gap-1">
            <button
              className="mobile-link"
              onClick={() => {
                navigate("/about");
                setMobileMenuOpen(false);
              }}
            >
              About
            </button>
            <button
              className="mobile-link"
              onClick={() => {
                navigate("/contact");
                setMobileMenuOpen(false);
              }}
            >
              Contact
            </button>
            <button
              className="mobile-link"
              onClick={() => {
                navigate("/privacy");
                setMobileMenuOpen(false);
              }}
            >
              Privacy
            </button>
            <button
              className="mobile-link"
              onClick={() => {
                navigate("/terms");
                setMobileMenuOpen(false);
              }}
            >
              Terms
            </button>

            <div className="border-t border-white/20 mt-3 pt-3">
              {!user ? (
                <Button
                  onClick={() => {
                    handleLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 gap-2 mt-2"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Button>
              ) : (
                <>
                  <div className="text-white hover:text-purple-400 transition-colors text-sm font-medium px-4 py-2 mb-2">
                    Hi, {getUsername()}
                  </div>
                  <Button
                    onClick={() => {
                      onOpenProfile?.();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="mobile-auth-btn"
                  >
                    <UserIcon className="w-4 h-4" /> Profile
                  </Button>
                  <Button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="mobile-auth-btn"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LOGIN DIALOG */}
      {!isMobile && (
        <>
        
          <LoginDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onSwitchToSignup={() => {
              setLoginOpen(false);
              setSignupOpen(true);
            }}
          />

          {/* Desktop sign up dialog */}
          <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} />
        </>
      )}
    </nav>
  );
}

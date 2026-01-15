import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BuzzyLanding, BuzzyLandingProps } from "@/components/BuzzyLanding";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const conceptId = searchParams.get("concept");

  console.log('sahi herer is user',user)

  // ✅ Check for stored JWT + fetch user profile
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { // 👈 
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Invalid or expired token");
      const data = await res.json();
      console.log("data is ",data)
      setUser(data.user);
    })
    .catch((e) => {
      setUser(null);
      console.log('error is ',e)

    });
}, []);


  // ✅ Logout handler (shared with BuzzyLanding)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  // ✅ Pass user + logout function to BuzzyLanding
  const landingProps: BuzzyLandingProps = {
    user,
    conceptId,
    onLogout: handleLogout, // 👈 new prop
  };

  return (
    <div>
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="gap-2"
          >
            <UserIcon className="h-4 w-4" />
            My Profile
          </Button>
        </div>
      )}
      <BuzzyLanding {...landingProps} />
    </div>
  );
};

export default Index;

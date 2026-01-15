import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { LogOut, Package, Maximize2 } from "lucide-react";

const AVATAR_ICONS = [
  "🐻", "🐼", "🦁", "🐯", "🐨", "🐰", "🦊", "🐶",
  "🐱", "🐭", "🐹", "🐷", "🐮", "🐸", "🐵", "🦄"
];

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("default");
  const [userImages, setUserImages] = useState<any[]>([]);
  const [userConcepts, setUserConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);
    await loadProfile(user.id);
    await loadUserData(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
      setUsername(data.username || "");
      setSelectedAvatar(data.avatar_icon || "default");
    }
    setLoading(false);
  };

  const loadUserData = async (userId: string) => {
    const { data: images } = await supabase
      .from("user_images")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: concepts } = await supabase
      .from("user_concepts")
      .select("*, user_images(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setUserImages(images || []);
    setUserConcepts(concepts || []);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        avatar_icon: selectedAvatar,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      loadProfile(user.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleOrderConcept = (conceptId: string) => {
    navigate(`/?concept=${conceptId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Customize your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 text-4xl">
                <AvatarFallback>
                  {selectedAvatar === "default" ? "👤" : selectedAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label>Choose Avatar</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      variant={selectedAvatar === icon ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAvatar(icon)}
                      className="text-xl"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>

            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Digital Toys</CardTitle>
            <CardDescription>
              Your uploaded images and generated concepts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userConcepts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No digital toys yet. Upload an image to create your first one!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userConcepts.map((concept) => (
                  <Card key={concept.id} className="overflow-hidden">
                    <div className="aspect-square relative group">
                      <img
                        src={concept.generated_concept_url}
                        alt="Digital toy concept"
                        className="w-full h-full object-contain bg-muted"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setPreviewImage(concept.generated_concept_url)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(concept.created_at).toLocaleDateString()}
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => handleOrderConcept(concept.id)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Order Physical Toy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
            <CardDescription>All your original uploads</CardDescription>
          </CardHeader>
          <CardContent>
            {userImages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No uploaded images yet
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userImages.map((image) => (
                  <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden group">
                    <img
                      src={image.original_image_url}
                      alt="Uploaded"
                      className="w-full h-full object-contain bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPreviewImage(image.original_image_url)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <img
            src={previewImage || ""}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

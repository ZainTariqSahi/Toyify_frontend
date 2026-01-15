import React, { useState, useEffect } from "react";
import { Check, Download, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
interface ImageUpload {
  id: number;
  file: File | null;
  preview: string | null;
  type: "generated" | "original";
}

const ToyProductPage: React.FC = () => {
  const [images, setImages] = useState<ImageUpload[]>([
    { id: 1, file: null, preview: null, type: "generated" },
    { id: 2, file: null, preview: null, type: "original" },
  ]);

  const { toast } = useToast();
  const navigate=useNavigate()
  // Load uploaded image from sessionStorage on component mount
  useEffect(() => {
    const uploadedImage = sessionStorage.getItem("uploadedImage");
    const uploadedImageName = sessionStorage.getItem("uploadedImageName");

    if (!uploadedImage) return;

    // Update the original image preview
    setImages((prev) =>
      prev.map((img) =>
        img.type === "original"
          ? { ...img, preview: uploadedImage, file: null }
          : img
      )
    );

    // Automatically call the backend to generate AI preview
    const generatePreview = async () => {
      try {
        setIsGeneratingConcept(true);
        setGenerationError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ai/toy-preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: uploadedImage }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Preview failed");

        console.log("AI preview response:", data);

        setGeneratedConceptUrl(data.previewImage);

        // Call toy story generation if needed
        generateToyStory(data.generatedCaption || "A cute toy");
      } catch (err: any) {
        console.error("Toy preview error:", err);
        setGenerationError(err.message);
      } finally {
        setIsGeneratingConcept(false);
      }
    };

    generatePreview();
  }, []);

  const readFileAsDataURL = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (
    id: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsGeneratingConcept(true);
      setGenerationError(null);

      // ✅ Properly await the file read
      const imageData = await readFileAsDataURL(file);

      // 1️⃣ Set local preview
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, file, preview: imageData } : img
        )
      );
      setUploadedImage(imageData);

      // 2️⃣ Call AI preview API
      console.log("Calling backend with imageData size:", imageData.length);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/toy-preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData }),
        }
      );

      console.log("Fetch response status:", response.status);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Preview failed");

      console.log("AI preview response:", data);
      setGeneratedConceptUrl(data.previewImage);

      toast({
        title: "Preview ready",
        description: "Toy preview generated!",
      });

      generateToyStory(data.generatedCaption || "A cute toy");
    } catch (err: any) {
      console.error("Toy preview error:", err);
      setGenerationError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  const handleDownload = (id: number) => {
    const image = images.find((img) => img.id === id);
    if (image?.preview) {
      const link = document.createElement("a");
      link.href = image.preview;
      link.download = `image-${id}.png`;
      link.click();
    }
  };

  const handleBackClick = () => {
    window.location.href = "/";
  };

// ToyProductPage.tsx
const handleAddToCart = async () => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!storedUser || !token) {
    sessionStorage.setItem("postLoginRedirect", "/cart");
    toast({
      title: "Login required",
      description: "Please log in to add items to your cart",
      variant: "destructive",
    });
    navigate("/auth");
    return;
  }

  const uploadedImageName = sessionStorage.getItem("uploadedImageName") || "drawing.jpg";

  const cartItem = {
    orderName: `${title} ${uploadedImageName}`,
    referenceImage: images.find((img) => img.id === selectedImage)?.type || "original",
    price: selectedPrice,
    type: selectedPrice === 39 ? "Fully crafted toy" : "DIY toy",
    quantity: 1,
    fileName: uploadedImageName,
    imageVersion: images.find((img) => img.id === selectedImage)?.type || "original",
    size: 30,
    description: toyStory,
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, { // ✅ endpoint fix
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ send token
      },
      body: JSON.stringify({ item: cartItem }),
    });

    if (!res.ok) throw new Error((await res.json()).message || "Failed to add to cart");

    toast({
      title: "Added to cart",
      description: "Check your cart for details",
    });

    navigate("/cart");
  } catch (err: any) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  }
};





  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      await analyzeImage(selectedFile);
    }
  };
  const analyzeImage = async (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setUploadedImage(imageData);

      // setStep(4);
      setIsGeneratingConcept(true);
      setGenerationError(null);

      try {
        // Call /toy-preview
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ai/toy-preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData }), // <-- matches backend
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Preview failed");

        setGeneratedConceptUrl(data.previewImage); // <-- matches backend response
        console.log("AI preview response:", data); // <-- Add this line

        toast({
          title: "Preview ready",
          description: "Toy preview generated!",
        });

        // Call story generation using the caption returned
        generateToyStory(data.generatedCaption || "A cute toy"); // optional fallback
      } catch (err: any) {
        console.error("Toy preview error:", err);
        setGenerationError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsGeneratingConcept(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const generateToyStory = async (description: string) => {
    try {
      setIsGeneratingStory(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/toy-story`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate toy story");

      const data = await response.json();
      setToyName(data.name || "Your Special Toy");
      setToyStory(
        data.story || "This toy is waiting for its adventure to begin."
      );
    } catch (err) {
      console.error("Error generating toy story:", err);
      setToyName("Your Special Toy");
      setToyStory("This toy is waiting for its adventure to begin.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const [file, setFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [title, setTitle] = useState("Buzzy the cutie Cat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [selectedPrice, setSelectedPrice] = useState<number>(39); // default £39
  const [selectedImage, setSelectedImage] = useState<number | null>(1);
  const [generatedConceptUrl, setGeneratedConceptUrl] = useState<string | null>(
    null
  );
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [toyName, setToyName] = useState("");
  const [toyStory, setToyStory] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!generatedConceptUrl) return;

    setImages((prev) =>
      prev.map((img) =>
        img.type === "generated"
          ? {
              ...img,
              preview: generatedConceptUrl,
              file: null,
            }
          : img
      )
    );
  }, [generatedConceptUrl]);

  console.log("Generated URL:", generatedConceptUrl);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        {isEditingTitle ? (
          <input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            className="text-2xl md:text-3xl font-bold text-[#42307D] border-b border-purple-400 bg-transparent focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTitle(tempTitle);
                setIsEditingTitle(false);
              }
              if (e.key === "Escape") {
                setTempTitle(title);
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold text-[#42307D]">
            {title}
          </h1>
        )}

        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Check
              className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-800"
              onClick={() => {
                setTitle(tempTitle);
                setIsEditingTitle(false);
              }}
            />
            <X
              className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(false);
              }}
            />
          </div>
        ) : (
          <Edit2
            className="w-5 h-5 text-[#7F56D9] cursor-pointer hover:text-[#42307D]"
            onClick={() => setIsEditingTitle(true)}
          />
        )}
      </div>

      {/* Main Grid - Images and Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        {/* Left Section: Images and Story */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative rounded-3xl p-4 transition-all ${
                  selectedImage === image.id
                    ? "border-2 border-purple-600 shadow-lg bg-[#F9F5FF]"
                    : "border-2 border-[#F9F5FF] bg-[#F9F5FF]"
                }`}
              >
                <div
                  className={`border-2 border-[#D6BBFB] rounded-2xl aspect-square flex items-center justify-center overflow-hidden relative ${
                    image.preview ? "bg-white" : "bg-purple-200"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImage === image.id}
                      onChange={() => setSelectedImage(image.id)}
                      className="w-5 h-5 text-[#7F56D9] border-2 border-[#D5D7DA] rounded focus:ring-[#7F56D9] cursor-pointer"
                    />
                  </div>

                  {image.type === "generated" ? (
                    isGeneratingConcept ? (
                      // ✅ Show skeleton while AI image is generating
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full h-full animate-pulse bg-purple-100 rounded-2xl flex items-center justify-center">
                          <p className="text-xs text-purple-400">
                            Generating AI image…
                          </p>
                        </div>
                      </div>
                    ) : generationError ? (
                      // ❌ Show error if generation fails
                      <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
                        <p className="text-xs text-red-500 mb-1">
                          Failed to generate AI image
                        </p>
                        <button
                          onClick={() => {
                            setGenerationError(null);
                            if (uploadedImage) {
                              // retry AI generation
                              handleImageUpload(image.id, {
                                target: { files: [file] },
                              } as any);
                            }
                          }}
                          className="text-xs text-purple-600 underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : image.preview ? (
                      // ✅ Show generated AI image
                      <img
                        src={image.preview}
                        alt="AI Generated Toy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Initial empty state
                      <div className="w-full h-full flex items-center justify-center text-center p-4">
                        <p className="text-xs text-gray-400">
                          AI image will appear here
                        </p>
                      </div>
                    )
                  ) : image.preview ? (
                    // ✅ Show original uploaded image
                    <img
                      src={image.preview}
                      alt={`Upload ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Upload prompt for original image
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(image.id, e)}
                        className="hidden"
                      />
                      <div className="text-center p-4">
                        <p className="text-xs text-gray-500">Click to upload</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Image Controls */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDownload(image.id)}
                    className="px-4 py-2 text-purple-700 rounded-full hover:bg-purple-200 transition flex items-center justify-center"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Toy's Story Section */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Toy's Story
            </h2>
            <div className="border-2 border-[#D5D7DA] p-4 rounded-2xl">
              <p className="text-sm text-[#717680] leading-relaxed">
                Buzzy was not just any cat toy; he was Buzzy the Cutie Cat, and
                his favorite thing in the whole wide world was the bright,
                rainbow-colored sparkle that came from the sun when it hit his
                shiny plastic nose. One Tuesday morning, Buzzy woke up on the
                edge of the dresser, stretched his little felt arms, and looked
                out the window for his morning dose of shine. But something was
                wrong.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Price Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price Card 1 - £39 */}
          <div
            className={`border-2 rounded-2xl p-5 flex flex-col bg-white relative  ${
              selectedPrice === 39
                ? "border-purple-500 shadow-lg"
                : "border-gray-300"
            }`}
          >
            {/* Checkbox */}
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={selectedPrice === 39}
                onChange={() => setSelectedPrice(39)}
                className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />

              
            </div>

            <div className="text-5xl font-bold text-gray-900 mb-1 mt-6">
              £39
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">
              Fully Crafted Toy
            </div>
            <div className="text-xs text-gray-500 mb-4">VAT included</div>

            <div className="space-y-2.5 flex-1">
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Fully crafted & colored</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Ready in 5-7 working days</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </div>
                <span>Coloring set</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>PLA (Eco-friendly)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Up to 30 cm size range</span>
              </div>
            </div>
          </div>

          {/* Price Card 2 - £29 */}
          <div
            className={`border-2 rounded-2xl p-5 flex flex-col bg-white relative ${
              selectedPrice === 29
                ? "border-purple-500 shadow-lg"
                : "border-gray-300"
            }`}
          >
            {/* Checkbox - unchecked */}
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={selectedPrice === 29}
                onChange={() => setSelectedPrice(29)}
                className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />
              
            </div>

            <div className="text-5xl font-bold text-gray-900 mb-1 mt-6">
              £29
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">DIY Toy</div>
            <div className="text-xs text-gray-500 mb-4">VAT included</div>

            <div className="space-y-2.5 flex-1">
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Uncolored</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Ready in 3-5 working days</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Coloring set</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>PLA (Eco-friendly)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Up to 30 cm size range</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox and Footer */}
      <div className="flex items-start gap-3 mb-6">
        <input
          type="checkbox"
          id="happy-checkbox"
          defaultChecked
          className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
        />
        <label
          htmlFor="happy-checkbox"
          className="text-sm text-gray-600 cursor-pointer"
        >
          I am happy with the selected name, story, and style to continue
        </label>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleBackClick}
          className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>

        <button
          onClick={handleAddToCart}
          className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Add to cart</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ToyProductPage;

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";

interface CartTotalsProps {
  subtotal: number;
  shipping: number;
  discount: number;
  onApplyVoucher?: (code: string) => void;
  onContinue?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  continueButtonText?: string;
  continueButtonDisabled?: boolean;
  termsAccepted?: boolean;
  onTermsChange?: (accepted: boolean) => void;
}

const CartTotals: React.FC<CartTotalsProps> = ({
  subtotal,
  shipping,
  discount,
  onApplyVoucher,
  onContinue,
  onBack,
  showBackButton = true,
  continueButtonText = "Continue",
  continueButtonDisabled = false,
  termsAccepted: propsTermsAccepted,
  onTermsChange: propsOnTermsChange,
}) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [internalTermsAccepted, setInternalTermsAccepted] = useState(false);

  const termsAccepted =
    typeof propsTermsAccepted !== "undefined"
      ? propsTermsAccepted
      : internalTermsAccepted;

  function setTerms(accepted: boolean) {
    if (propsOnTermsChange) {
      propsOnTermsChange(accepted);
    } else {
      setInternalTermsAccepted(accepted);
    }
  }

  const total = subtotal + shipping - discount;

  const handleApplyVoucher = () => {
    if (onApplyVoucher && voucherCode.trim()) {
      onApplyVoucher(voucherCode.trim());
    }
  };

  const handleContinue = () => {
    if (onContinue && termsAccepted) {
      onContinue();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };


  return (
    <div className="bg-[#F9F5FF] rounded-lg shadow-sm p-6 md:p-8">
      <h2 className="text-lg md:text-xl font-semibold text-[#181D27] mb-4 md:mb-6">
        Cart total
      </h2>

      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div className="flex justify-between text-sm gap-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            £{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm gap-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-[#039855]">
            {shipping === 0 ? "Free" : `£${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="pt-2 md:pt-4">
          <label className="block text-sm text-gray-600 mb-2">
            Discount Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Enter your voucher"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              className="px-4 md:px-6 py-2 bg-[#42307D] text-white text-sm font-medium rounded-md hover:bg-[#7F56D9] transition-colors flex-shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm pt-2 gap-2">
          <span className="text-gray-600">Discount</span>
          <span className="font-medium text-gray-900">
            £{discount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pt-4 mt-20 mb-4 md:mb-6">
        <div className="flex justify-between items-center gap-2">
          <span className="text-base md:text-lg font-semibold text-gray-900">
            Total price
          </span>
          <span className="text-xl md:text-2xl font-bold text-gray-900">
            £{total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mb-4 md:mb-6">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 flex-shrink-0"
          />
          <span className="text-xs md:text-sm text-gray-600">
            I've read the{" "}
            <a href="/terms" className="text-indigo-600 hover:underline">
              terms of service
            </a>{" "}
            and happy to proceed with the payment
          </span>
        </label>
      </div>

      {showBackButton && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

const BillingDetails: React.FC = () => {
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    postcode: "",
    addressLine1: "",
    addressLine2: "",
    townCity: "",
    county: "",
    deliveryInstructions: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isFindingAddress, setIsFindingAddress] = useState(false);
  const [addressLookupMessage, setAddressLookupMessage] = useState("");
  const [addressLookupError, setAddressLookupError] = useState("");
  const [postcodeValidated, setPostcodeValidated] = useState(false);


  
const isFormValid =
  !!formData.fullName.trim() &&
  !!formData.email.trim() &&
  !!formData.phoneNumber.trim() &&
  !!formData.addressLine1.trim() &&
  !!formData.townCity.trim() &&
  postcodeValidated &&
  termsAccepted &&
  cartItems.length > 0;

  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + (item.price ?? 0) * item.quantity,
    0,
  );

  const shipping = 0;
  const discount = 0;




  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

   if (name === "postcode") {
  setAddressLookupMessage("");
  setAddressLookupError("");
  setPostcodeValidated(false);
}
  };

 const handleFindAddress = async () => {
  const postcode = formData.postcode.trim();

  if (!postcode) {
    setAddressLookupError("Please enter a postcode");
    setAddressLookupMessage("");
    setPostcodeValidated(false);
    return;
  }

  try {
    setIsFindingAddress(true);
    setAddressLookupError("");
    setAddressLookupMessage("");
    setPostcodeValidated(false);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/address-lookup?postcode=${encodeURIComponent(postcode)}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to validate postcode");
    }

    setFormData((prev) => ({
      ...prev,
      postcode: data?.address?.postcode || data?.postcode || prev.postcode,
      townCity: data?.address?.townCity || prev.townCity,
      county: data?.address?.county || prev.county,
    }));

    setPostcodeValidated(true);
    setAddressLookupMessage(
      "Postcode verified. Please enter the rest of your address manually."
    );
  } catch (err: any) {
    setPostcodeValidated(false);
    setAddressLookupError(err?.message || "Address lookup failed");
    setAddressLookupMessage("");
  } finally {
    setIsFindingAddress(false);
  }
};

const validateForm = () => {
  if (!formData.fullName.trim()) return "Full name is required";
  if (!formData.email.trim()) return "Email address is required";
  if (!formData.phoneNumber.trim()) return "Phone number is required";
  if (!formData.postcode.trim()) return "Postcode is required";
  if (!postcodeValidated) return "Please validate your postcode";
  if (!formData.addressLine1.trim()) return "Address Line 1 is required";
  if (!formData.townCity.trim()) return "Town/City is required";
  if (!termsAccepted) return "Please accept the terms of service";
  if (cartItems.length === 0) return "Your cart is empty";
  return "";
};
  const handleCheckout = async () => {
    if (checkingOut) return;

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setCheckingOut(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerEmail: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: {
            postcode: formData.postcode,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            townCity: formData.townCity,
            county: formData.county,
            deliveryInstructions: formData.deliveryInstructions,
          },
          items: cartItems.map((item: any) => ({
            fileName: item.fileName,
            imageVersion: item.imageVersion,
            size: item.size,
            quantity: item.quantity,
            description: item.description || "",
            price: item.price ?? 0,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Checkout failed");
      }

      alert("Check your email! Your order has been placed.");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(err?.message || "Failed to place order");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleBackClick = () => {
    window.location.href = "/cart";
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-6 md:mb-8">
          Billing Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+44 1234 567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postcode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Postcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="Enter postcode"
                      className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleFindAddress}
                      disabled={isFindingAddress}
                      className="px-3 md:px-6 py-2 bg-[#42307D] text-white text-sm font-medium rounded-md hover:bg-[#7F56D9] transition-colors whitespace-nowrap flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isFindingAddress ? "Checking..." : "Validate address"}
                    </button>
                  </div>

                  {addressLookupMessage && (
                    <p className="text-sm text-green-600 mt-2">
                      {addressLookupMessage}
                    </p>
                  )}

                  {addressLookupError && (
                    <p className="text-sm text-red-600 mt-2">
                      {addressLookupError}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="House number and street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="townCity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Town/City *
                  </label>
                  <input
                    type="text"
                    id="townCity"
                    name="townCity"
                    value={formData.townCity}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="county"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    County
                  </label>
                  <input
                    type="text"
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    placeholder="Enter your county"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="deliveryInstructions"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Delivery instructions
                  </label>
                  <textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="Add any special delivery instructions..."
                    rows={4}
                    className="w-full px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartTotals
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              onContinue={handleCheckout}
              showBackButton={false}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleBackClick}
              className="px-8 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="lg:col-span-1">
            <button
              onClick={handleCheckout}
              disabled={!isFormValid || checkingOut}
              title={!isFormValid ? "Please complete all required fields" : ""}
              className="px-8 py-2.5 bg-[#7F56D9] text-white font-medium rounded-md hover:bg-[#6941C6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 ml-auto"
            >
              {checkingOut ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Checkout <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;

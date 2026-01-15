import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate,useLocation } from 'react-router-dom';
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
  continueButtonText = 'Continue',
  continueButtonDisabled = false,
  termsAccepted: propsTermsAccepted,
  onTermsChange: propsOnTermsChange
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [internalTermsAccepted, setInternalTermsAccepted] = useState(false);

  const termsAccepted = typeof propsTermsAccepted !== 'undefined' ? propsTermsAccepted : internalTermsAccepted;

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
      onApplyVoucher(voucherCode);
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
      <h2 className="text-lg md:text-xl font-semibold text-[#181D27] mb-4 md:mb-6">Cart total</h2>
      
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div className="flex justify-between text-sm gap-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm gap-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-[#039855]">
            {shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="pt-2 md:pt-4">
          <label className="block text-sm text-gray-600 mb-2">Discount Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Enter your voucher"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 md:px-6 py-2 bg-[#42307D] text-white text-sm font-medium rounded-md hover:bg-[#7F56D9] transition-colors flex-shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm pt-2 gap-2">
          <span className="text-gray-600">Discount</span>
          <span className="font-medium text-gray-900">£{discount.toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-4 mt-20 mb-4 md:mb-6">
        <div className="flex justify-between items-center gap-2">
          <span className="text-base md:text-lg font-semibold text-gray-900">Total price</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900">£{total.toFixed(2)}</span>
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
            I've read the <a href="/terms" className="text-indigo-600 hover:underline">terms of service</a> and happy to proceed with the payment
          </span>
        </label>
      </div>

      {showBackButton && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    postcode: '',
    addressLine1: '',
    addressLine2: '',
    townCity: '',
    deliveryInstructions: ''
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
    const location = useLocation();
  const navigate = useNavigate();
  const cartItems = location.state?.cartItems || [];

   const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );
  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFindAddress = () => {
    console.log('Finding address for postcode:', formData.postcode);
    // Address lookup logic would go here
  };

const handleCheckout = async () => {
  if (!termsAccepted || cartItems.length === 0) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerEmail: formData.email, // <-- send customerEmail!
        items: cartItems.map((item) => ({
          fileName: item.fileName,
          imageVersion: item.imageVersion,
          size: item.size,
          quantity: item.quantity,
          description: item.description || "",
          price: item.price ?? 0,
        })),
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Checkout failed");
    }

    const data = await res.json();

    alert("Check your email! Your order has been placed.");
    window.location.href = "/";
  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.message || "Failed to place order");
  }
};


  const handleBackClick = () => {
    window.location.href = '/cart';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-6 md:mb-8">
          Billing Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Billing Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Postcode with Find Address Button */}
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
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
                      onClick={handleFindAddress}
                      className="px-3 md:px-6 py-2 bg-[#42307D] text-white text-sm font-medium rounded-md hover:bg-[#7F56D9] transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      Find address
                    </button>
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 *
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

                {/* Town/City */}
                <div>
                  <label htmlFor="townCity" className="block text-sm font-medium text-gray-700 mb-2">
                    Town/City
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

                {/* Delivery Instructions */}
                <div className="md:col-span-2">
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Cart Totals Section */}
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

        {/* Bottom Buttons - Full Width Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          <div className="lg:col-span-2">
            <button 
              onClick={handleBackClick}
              className="px-8 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
          
          <div className="lg:col-span-1">
            <button
              onClick={handleCheckout}
              disabled={!termsAccepted}
              className="px-8 py-2.5 bg-[#7F56D9] text-white font-medium rounded-md hover:bg-[#6941C6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 ml-auto"
              >
                Checkout
                <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        </div>
      </div>
  );
};

export default BillingDetails;
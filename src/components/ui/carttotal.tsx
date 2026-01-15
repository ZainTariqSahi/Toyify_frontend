import React, { useState } from 'react';

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
  continueButtonDisabled = false
  , termsAccepted: propsTermsAccepted, onTermsChange: propsOnTermsChange
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

export default CartTotals;
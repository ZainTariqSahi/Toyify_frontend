// Input validation utilities

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function validateString(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    };
  }
  
  return { valid: true };
}

export function sanitizeString(value: string): string {
  // Basic sanitization - trim and remove control characters
  return value.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

export function validateOrderSize(size: string): boolean {
  // Should match format like "10cm", "15cm", "20cm"
  const sizeRegex = /^\d+cm$/;
  if (!sizeRegex.test(size)) return false;
  
  const numericSize = parseInt(size.replace('cm', ''));
  return numericSize >= 5 && numericSize <= 50;
}

export function validateOrderQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;
}

export function calculateExpectedPrice(
  size: string,
  quantity: number,
  freeShipping: boolean
): number {
  // Unified pricing logic - single source of truth
  // £25 for 15cm, £40 for 30cm (linear interpolation)
  const sizeValue = parseInt(size.replace('cm', ''));
  const minSize = 15;
  const maxSize = 30;
  const minPrice = 25;
  const maxPrice = 40;
  
  // Clamp size to valid range
  const clampedSize = Math.max(minSize, Math.min(maxSize, sizeValue));
  
  // Linear interpolation for price per toy
  const pricePerToy = minPrice + ((clampedSize - minSize) / (maxSize - minSize)) * (maxPrice - minPrice);
  
  // Total price
  return Math.round(pricePerToy * quantity * 100) / 100;
}

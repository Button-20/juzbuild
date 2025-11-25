import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from "libphonenumber-js";

// Country code mapping for phone validation
export const COUNTRY_TO_CODE: Record<string, CountryCode> = {
  "United States": "US",
  Canada: "CA",
  "United Kingdom": "GB",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Ghana: "GH",
  Nigeria: "NG",
  "South Africa": "ZA",
  Kenya: "KE",
  Spain: "ES",
  Italy: "IT",
  Netherlands: "NL",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Brazil: "BR",
  Mexico: "MX",
  Argentina: "AR",
};

// Validate phone number using libphonenumber-js
export function validatePhoneNumber(
  phoneNumber: string,
  country: string
): { isValid: boolean; error?: string } {
  if (!phoneNumber?.trim()) {
    return { isValid: false, error: "Phone number is required" };
  }

  try {
    const countryCode = (COUNTRY_TO_CODE[country] || "US") as CountryCode;

    // Try to parse the phone number with the selected country
    const parsed = parsePhoneNumber(phoneNumber.trim(), countryCode);

    if (!parsed) {
      return {
        isValid: false,
        error: `Invalid phone number for ${country}`,
      };
    }

    // Check if the parsed number is valid
    if (!isValidPhoneNumber(phoneNumber.trim(), countryCode)) {
      return {
        isValid: false,
        error: `Invalid phone number for ${country}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating phone number:", error);
    // Fallback: Accept if it looks like a phone number (contains digits and reasonable length)
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: "Please enter a valid phone number",
    };
  }
}

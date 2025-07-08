// validateCompanyEmail.js: Şirket e-posta adreslerinin doğrulama fonksiyonu.

/**
 * validateCompanyEmail fonksiyonu, verilen e-posta adresinin şirket e-postası olup olmadığını kontrol eder.
 */
export function validateCompanyEmail(email) {
  const PERSONAL_EMAIL_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "yandex.com",
    "mail.ru",
    "protonmail.com",
    "tutanota.com",
    "zoho.com",
    "gmx.com",
    "web.de",
    "fastmail.com",
    "hushmail.com",
  ];
  if (!email || !email.includes("@")) {
    return { isValid: false, isChecked: false, message: "" };
  }
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return {
      isValid: false,
      isChecked: true,
      message: "Please enter a valid email address.",
    };
  }
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      isChecked: true,
      message:
        "Personal email addresses (Gmail, Yahoo, etc.) are not allowed. Please use your company email.",
    };
  }
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
  if (!domainPattern.test(domain)) {
    return {
      isValid: false,
      isChecked: true,
      message: "Please enter a valid company email address.",
    };
  }
  const suspiciousPatterns = [
    /.*temp.*/i,
    /.*throwaway.*/i,
    /.*disposable.*/i,
    /.*10minutemail.*/i,
    /.*guerrillamail.*/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return {
        isValid: false,
        isChecked: true,
        message:
          "Temporary email addresses are not allowed. Please use your company email.",
      };
    }
  }
  return {
    isValid: true,
    isChecked: true,
    message: "Valid company email address ✓",
  };
}

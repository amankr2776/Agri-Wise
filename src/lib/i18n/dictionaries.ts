
export const UI_MESSAGES: Record<string, any> = {
  English: {
    dashboard: "Dashboard",
    welcome: "Namaste",
    field_status: "Your fields in {city} are looking healthy.",
    ai_scan: "AI Field Scan",
    report_issue: "Report New Issue",
    settings: "Settings",
    market: "Market Intelligence",
    network: "Kisan Network",
    logout: "Logout",
    save: "Save All Intelligence"
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    welcome: "नमस्ते",
    field_status: "{city} में आपके खेत स्वस्थ दिख रहे हैं।",
    ai_scan: "एआई फील्ड स्कैन",
    report_issue: "नई समस्या की रिपोर्ट करें",
    settings: "सेटिंग्स",
    market: "बाजार की जानकारी",
    network: "किसान नेटवर्क",
    logout: "लॉगआउट",
    save: "सभी जानकारी सहेजें"
  },
  Kannada: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    welcome: "ನಮಸ್ಕಾರ",
    field_status: "{city} ನಲ್ಲಿನ ನಿಮ್ಮ ಹೊಲಗಳು ಆರೋಗ್ಯಕರವಾಗಿವೆ.",
    ai_scan: "AI ಫೀಲ್ಡ್ ಸ್ಕ್ಯಾನ್",
    report_issue: "ಹೊಸ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    market: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ",
    network: "ಕಿಸಾನ್ ನೆಟ್‌ವರ್ಕ್",
    logout: "ಲಾಗ್ ಔಟ್",
    save: "ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಉಳಿಸಿ"
  }
  // Add other languages here, they will fall back to Hindi/English if keys are missing
};

// Fallback logic
export const getTranslation = (lang: string, key: string, params?: Record<string, string>) => {
  const hindiFallback = ["Bhojpuri", "Haryanvi", "Rajasthani", "Pahadi", "Magahi"];
  const targetLang = hindiFallback.includes(lang) ? "Hindi" : lang;
  
  let text = UI_MESSAGES[targetLang]?.[key] || UI_MESSAGES["English"][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  
  return text;
};

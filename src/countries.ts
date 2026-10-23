export interface Country {
  name: string;
  code: string;
  flag: string;
  region: 'Africa' | 'Europe' | 'Americas' | 'Asia' | 'Oceania';
}

export function getCountryCode(flagOrCode: string): string {
  if (!flagOrCode) return 'zw';
  const trimmed = flagOrCode.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^[A-Za-z]{2}-[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  // Check Unicode regional indicators
  const codePoints = Array.from(trimmed).map((c) => c.codePointAt(0) || 0);
  const chars = codePoints
    .filter((cp) => cp >= 127462 && cp <= 127487)
    .map((cp) => String.fromCharCode(cp - 127397));
  if (chars.length === 2) {
    return chars.join('').toLowerCase();
  }
  const found = WORLD_COUNTRIES.find(
    (c) => c.flag === trimmed || c.code.toLowerCase() === trimmed.toLowerCase() || c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (found) return found.code.toLowerCase();
  return 'zw';
}

export function getFlagImgUrl(codeOrFlag: string, width: 80 | 160 = 80): string {
  const code = getCountryCode(codeOrFlag);
  // Special handling for UK home nations in flagcdn
  if (code === 'gb-eng') return `https://flagcdn.com/w${width}/gb-eng.png`;
  if (code === 'gb-sct') return `https://flagcdn.com/w${width}/gb-sct.png`;
  if (code === 'gb-wls') return `https://flagcdn.com/w${width}/gb-wls.png`;
  if (code === 'gb-nir') return `https://flagcdn.com/w${width}/gb-nir.png`;
  return `https://flagcdn.com/w${width}/${code}.png`;
}

/**
 * Returns the vector emoji SVG URL for a country flag.
 * Generates official Twemoji vector emoji SVGs with fallback to FlagCDN SVG.
 */
export function getFlagVectorUrl(codeOrFlag: string): string {
  const code = getCountryCode(codeOrFlag).toLowerCase();
  if (code === 'zw') return '/assets/aistudio/ZIM_FLAG_71fcb92e.png';
  if (code.length === 2 && /^[a-z]{2}$/.test(code)) {
    const cp1 = (0x1f1e6 + (code.charCodeAt(0) - 97)).toString(16);
    const cp2 = (0x1f1e6 + (code.charCodeAt(1) - 97)).toString(16);
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp1}-${cp2}.svg`;
  }
  if (code === 'gb-eng') return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.svg`;
  if (code === 'gb-sct') return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.svg`;
  if (code === 'gb-wls') return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.svg`;
  return `https://flagcdn.com/${code}.svg`;
}

export function getFlagEmoji(codeOrFlag: string): string {
  if (!codeOrFlag) return '🇿🇼';
  const found = WORLD_COUNTRIES.find(
    (c) => c.code.toLowerCase() === codeOrFlag.toLowerCase() || c.flag === codeOrFlag || c.name.toLowerCase() === codeOrFlag.toLowerCase()
  );
  return found ? found.flag : codeOrFlag;
}

export const WORLD_COUNTRIES: Country[] = [
  // ========================================================
  // AFRICA (All 54 African Nations)
  // ========================================================
  { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼', region: 'Africa' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', region: 'Africa' },
  { name: 'Botswana', code: 'BW', flag: '🇧🇼', region: 'Africa' },
  { name: 'Zambia', code: 'ZM', flag: '🇿🇲', region: 'Africa' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', region: 'Africa' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', region: 'Africa' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', region: 'Africa' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Africa' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', region: 'Africa' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', region: 'Africa' },
  { name: 'Malawi', code: 'MW', flag: '🇲🇼', region: 'Africa' },
  { name: 'Mozambique', code: 'MZ', flag: '🇲🇿', region: 'Africa' },
  { name: 'Namibia', code: 'NA', flag: '🇳🇦', region: 'Africa' },
  { name: 'Lesotho', code: 'LS', flag: '🇱🇸', region: 'Africa' },
  { name: 'Eswatini', code: 'SZ', flag: '🇸🇿', region: 'Africa' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿', region: 'Africa' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴', region: 'Africa' },
  { name: 'Benin', code: 'BJ', flag: '🇧🇯', region: 'Africa' },
  { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', region: 'Africa' },
  { name: 'Burundi', code: 'BI', flag: '🇧🇮', region: 'Africa' },
  { name: 'Cabo Verde', code: 'CV', flag: '🇨🇻', region: 'Africa' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', region: 'Africa' },
  { name: 'Central African Republic', code: 'CF', flag: '🇨🇫', region: 'Africa' },
  { name: 'Chad', code: 'TD', flag: '🇹🇩', region: 'Africa' },
  { name: 'Comoros', code: 'KM', flag: '🇰🇲', region: 'Africa' },
  { name: 'Congo', code: 'CG', flag: '🇨🇬', region: 'Africa' },
  { name: 'DR Congo', code: 'CD', flag: '🇨🇩', region: 'Africa' },
  { name: "Côte d'Ivoire", code: 'CI', flag: '🇨🇮', region: 'Africa' },
  { name: 'Djibouti', code: 'DJ', flag: '🇩🇯', region: 'Africa' },
  { name: 'Equatorial Guinea', code: 'GQ', flag: '🇬🇶', region: 'Africa' },
  { name: 'Eritrea', code: 'ER', flag: '🇪🇷', region: 'Africa' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', region: 'Africa' },
  { name: 'Gabon', code: 'GA', flag: '🇬🇦', region: 'Africa' },
  { name: 'Gambia', code: 'GM', flag: '🇬🇲', region: 'Africa' },
  { name: 'Guinea', code: 'GN', flag: '🇬🇳', region: 'Africa' },
  { name: 'Guinea-Bissau', code: 'GW', flag: '🇬🇼', region: 'Africa' },
  { name: 'Liberia', code: 'LR', flag: '🇱🇷', region: 'Africa' },
  { name: 'Libya', code: 'LY', flag: '🇱🇾', region: 'Africa' },
  { name: 'Madagascar', code: 'MG', flag: '🇲🇬', region: 'Africa' },
  { name: 'Mali', code: 'ML', flag: '🇲🇱', region: 'Africa' },
  { name: 'Mauritania', code: 'MR', flag: '🇲🇷', region: 'Africa' },
  { name: 'Mauritius', code: 'MU', flag: '🇲🇺', region: 'Africa' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', region: 'Africa' },
  { name: 'Niger', code: 'NE', flag: '🇳🇪', region: 'Africa' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', region: 'Africa' },
  { name: 'São Tomé and Príncipe', code: 'ST', flag: '🇸🇹', region: 'Africa' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', region: 'Africa' },
  { name: 'Seychelles', code: 'SC', flag: '🇸🇨', region: 'Africa' },
  { name: 'Sierra Leone', code: 'SL', flag: '🇸🇱', region: 'Africa' },
  { name: 'Somalia', code: 'SO', flag: '🇸🇴', region: 'Africa' },
  { name: 'South Sudan', code: 'SS', flag: '🇸🇸', region: 'Africa' },
  { name: 'Sudan', code: 'SD', flag: '🇸🇩', region: 'Africa' },
  { name: 'Togo', code: 'TG', flag: '🇹🇬', region: 'Africa' },
  { name: 'Tunisia', code: 'TN', flag: '🇹🇳', region: 'Africa' },

  // ========================================================
  // EUROPE (All European Nations & Cue Sport Territories)
  // ========================================================
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe' },
  { name: 'England', code: 'GB-ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'Europe' },
  { name: 'Scotland', code: 'GB-SCT', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'Europe' },
  { name: 'Wales', code: 'GB-WLS', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', region: 'Europe' },
  { name: 'Northern Ireland', code: 'GB-NIR', flag: '🇬🇧', region: 'Europe' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', region: 'Europe' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱', region: 'Europe' },
  { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', region: 'Europe' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪', region: 'Europe' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', region: 'Europe' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', region: 'Europe' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮', region: 'Europe' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', region: 'Europe' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', region: 'Europe' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', region: 'Europe' },
  { name: 'Greece', code: 'GR', flag: '🇬🇷', region: 'Europe' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', region: 'Europe' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺', region: 'Europe' },
  { name: 'Romania', code: 'RO', flag: '🇷🇴', region: 'Europe' },
  { name: 'Ukraine', code: 'UA', flag: '🇺🇦', region: 'Europe' },
  { name: 'Croatia', code: 'HR', flag: '🇭🇷', region: 'Europe' },
  { name: 'Serbia', code: 'RS', flag: '🇷🇸', region: 'Europe' },
  { name: 'Slovakia', code: 'SK', flag: '🇸🇰', region: 'Europe' },
  { name: 'Bulgaria', code: 'BG', flag: '🇧🇬', region: 'Europe' },
  { name: 'Cyprus', code: 'CY', flag: '🇨🇾', region: 'Europe' },
  { name: 'Malta', code: 'MT', flag: '🇲🇹', region: 'Europe' },
  { name: 'Iceland', code: 'IS', flag: '🇮🇸', region: 'Europe' },
  { name: 'Estonia', code: 'EE', flag: '🇪🇪', region: 'Europe' },
  { name: 'Latvia', code: 'LV', flag: '🇱🇻', region: 'Europe' },
  { name: 'Lithuania', code: 'LT', flag: '🇱🇹', region: 'Europe' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱', region: 'Europe' },
  { name: 'North Macedonia', code: 'MK', flag: '🇲🇰', region: 'Europe' },
  { name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦', region: 'Europe' },
  { name: 'Montenegro', code: 'ME', flag: '🇲🇪', region: 'Europe' },
  { name: 'Slovenia', code: 'SI', flag: '🇸🇮', region: 'Europe' },
  { name: 'Luxembourg', code: 'LU', flag: '🇱🇺', region: 'Europe' },
  { name: 'Monaco', code: 'MC', flag: '🇲🇨', region: 'Europe' },
  { name: 'Liechtenstein', code: 'LI', flag: '🇱🇮', region: 'Europe' },
  { name: 'Andorra', code: 'AD', flag: '🇦🇩', region: 'Europe' },
  { name: 'San Marino', code: 'SM', flag: '🇸🇲', region: 'Europe' },
  { name: 'Moldova', code: 'MD', flag: '🇲🇩', region: 'Europe' },
  { name: 'Belarus', code: 'BY', flag: '🇧🇾', region: 'Europe' },

  // ========================================================
  // AMERICAS (North, Central, South America & Caribbean)
  // ========================================================
  { name: 'United States', code: 'US', flag: '🇺🇸', region: 'Americas' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', region: 'Americas' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', region: 'Americas' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', region: 'Americas' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴', region: 'Americas' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱', region: 'Americas' },
  { name: 'Peru', code: 'PE', flag: '🇵🇪', region: 'Americas' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪', region: 'Americas' },
  { name: 'Ecuador', code: 'EC', flag: '🇪🇨', region: 'Americas' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾', region: 'Americas' },
  { name: 'Paraguay', code: 'PY', flag: '🇵🇾', region: 'Americas' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴', region: 'Americas' },
  { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', region: 'Americas' },
  { name: 'Panama', code: 'PA', flag: '🇵🇦', region: 'Americas' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲', region: 'Americas' },
  { name: 'Cuba', code: 'CU', flag: '🇨🇺', region: 'Americas' },
  { name: 'Dominican Republic', code: 'DO', flag: '🇩🇴', region: 'Americas' },
  { name: 'Puerto Rico', code: 'PR', flag: '🇵🇷', region: 'Americas' },
  { name: 'Trinidad and Tobago', code: 'TT', flag: '🇹🇹', region: 'Americas' },
  { name: 'Guatemala', code: 'GT', flag: '🇬🇹', region: 'Americas' },
  { name: 'Honduras', code: 'HN', flag: '🇭🇳', region: 'Americas' },
  { name: 'El Salvador', code: 'SV', flag: '🇸🇻', region: 'Americas' },
  { name: 'Nicaragua', code: 'NI', flag: '🇳🇮', region: 'Americas' },
  { name: 'Bahamas', code: 'BS', flag: '🇧🇸', region: 'Americas' },
  { name: 'Barbados', code: 'BB', flag: '🇧🇧', region: 'Americas' },
  { name: 'Guyana', code: 'GY', flag: '🇬🇾', region: 'Americas' },
  { name: 'Suriname', code: 'SR', flag: '🇸🇷', region: 'Americas' },
  { name: 'Belize', code: 'BZ', flag: '🇧🇿', region: 'Americas' },
  { name: 'Haiti', code: 'HT', flag: '🇭🇹', region: 'Americas' },

  // ========================================================
  // ASIA (All Asian Nations & Cue Sport Powerhouses)
  // ========================================================
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', region: 'Asia' },
  { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia' },
  { name: 'Chinese Taipei', code: 'TW', flag: '🇹🇼', region: 'Asia' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'Asia' },
  { name: 'India', code: 'IN', flag: '🇮🇳', region: 'Asia' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Asia' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰', region: 'Asia' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Asia' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Asia' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', region: 'Asia' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', region: 'Asia' },
  { name: 'Bahrain', code: 'BH', flag: '🇧🇭', region: 'Asia' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', region: 'Asia' },
  { name: 'Jordan', code: 'JO', flag: '🇯🇴', region: 'Asia' },
  { name: 'Lebanon', code: 'LB', flag: '🇱🇧', region: 'Asia' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Asia' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱', region: 'Asia' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷', region: 'Asia' },
  { name: 'Iraq', code: 'IQ', flag: '🇮🇶', region: 'Asia' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', region: 'Asia' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', region: 'Asia' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵', region: 'Asia' },
  { name: 'Myanmar', code: 'MM', flag: '🇲🇲', region: 'Asia' },
  { name: 'Cambodia', code: 'KH', flag: '🇰🇭', region: 'Asia' },
  { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', region: 'Asia' },
  { name: 'Macau', code: 'MO', flag: '🇲🇴', region: 'Asia' },
  { name: 'Mongolia', code: 'MN', flag: '🇲🇳', region: 'Asia' },
  { name: 'Kazakhstan', code: 'KZ', flag: '🇰🇿', region: 'Asia' },
  { name: 'Uzbekistan', code: 'UZ', flag: '🇺🇿', region: 'Asia' },
  { name: 'Azerbaijan', code: 'AZ', flag: '🇦🇿', region: 'Asia' },
  { name: 'Georgia', code: 'GE', flag: '🇬🇪', region: 'Asia' },
  { name: 'Armenia', code: 'AM', flag: '🇦🇲', region: 'Asia' },
  { name: 'Kyrgyzstan', code: 'KG', flag: '🇰🇬', region: 'Asia' },
  { name: 'Tajikistan', code: 'TJ', flag: '🇹🇯', region: 'Asia' },
  { name: 'Turkmenistan', code: 'TM', flag: '🇹🇲', region: 'Asia' },
  { name: 'Laos', code: 'LA', flag: '🇱🇦', region: 'Asia' },
  { name: 'Brunei', code: 'BN', flag: '🇧🇳', region: 'Asia' },
  { name: 'Maldives', code: 'MV', flag: '🇲🇻', region: 'Asia' },
  { name: 'Palestine', code: 'PS', flag: '🇵🇸', region: 'Asia' },

  // ========================================================
  // OCEANIA (Australia, New Zealand & Pacific Islands)
  // ========================================================
  { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', region: 'Oceania' },
  { name: 'Fiji', code: 'FJ', flag: '🇫🇯', region: 'Oceania' },
  { name: 'Papua New Guinea', code: 'PG', flag: '🇵🇬', region: 'Oceania' },
  { name: 'Samoa', code: 'WS', flag: '🇼🇸', region: 'Oceania' },
  { name: 'Tonga', code: 'TO', flag: '🇹🇴', region: 'Oceania' },
  { name: 'Vanuatu', code: 'VU', flag: '🇻🇺', region: 'Oceania' },
  { name: 'Solomon Islands', code: 'SB', flag: '🇸🇧', region: 'Oceania' },
  { name: 'Guam', code: 'GU', flag: '🇬🇺', region: 'Oceania' },
  { name: 'Cook Islands', code: 'CK', flag: '🇨🇰', region: 'Oceania' }
];

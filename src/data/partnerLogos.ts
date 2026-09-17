// Default official vector logos encoded as SVG Data URIs for the 6 partner organizations

export const PARTNER_LOGOS: Record<string, string> = {
  bv108: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="shield108" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="60%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <filter id="shadow108" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Outer Shield -->
  <path d="M60 8 L104 22 C104 68 80 98 60 112 C40 98 16 68 16 22 Z" fill="url(#shield108)" filter="url(#shadow108)" stroke="#ef4444" stroke-width="2"/>
  <!-- Gold Laurel / Edge highlight -->
  <path d="M60 14 L98 26 C98 65 76 92 60 104 C44 92 22 65 22 26 Z" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3 2"/>
  <!-- Medical Red Cross with White Border -->
  <rect x="52" y="38" width="16" height="42" rx="3" fill="#ffffff"/>
  <rect x="39" y="51" width="42" height="16" rx="3" fill="#ffffff"/>
  <rect x="54.5" y="40.5" width="11" height="37" rx="2" fill="#dc2626"/>
  <rect x="41.5" y="53.5" width="37" height="11" rx="2" fill="#dc2626"/>
  <!-- Gold National Star -->
  <polygon points="60,20 63,28 71.5,28 64.5,33.5 67,41.5 60,36.5 53,41.5 55.5,33.5 48.5,28 57,28" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
  <!-- Banner Text -->
  <rect x="28" y="88" width="64" height="15" rx="7.5" fill="#ffffff" opacity="0.95"/>
  <text x="60" y="99" font-family="'Montserrat', -apple-system, sans-serif" font-weight="900" font-size="9" fill="#991b1b" text-anchor="middle" letter-spacing="1">BV 108</text>
</svg>
`)}`,

  kbit: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="kbitNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1c30"/>
      <stop offset="100%" stop-color="#152e4d"/>
    </linearGradient>
    <linearGradient id="kbitGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" fill="url(#kbitNavy)" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Stylized K Wings in Gold -->
  <path d="M42 34 L42 86 M42 60 L78 34 M55 52 L80 86" fill="none" stroke="url(#kbitGold)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Small Star Badge -->
  <circle cx="82" cy="38" r="3.5" fill="#f59e0b"/>
  <!-- Text Label -->
  <rect x="30" y="92" width="60" height="13" rx="6.5" fill="#ffffff"/>
  <text x="60" y="102" font-family="'Montserrat', sans-serif" font-weight="900" font-size="8.5" fill="#0b1c30" text-anchor="middle" letter-spacing="1.5">KBIT</text>
</svg>
`)}`,

  bv175: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="shield175" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="60%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <filter id="shadow175" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Outer Shield -->
  <path d="M60 8 L104 22 C104 68 80 98 60 112 C40 98 16 68 16 22 Z" fill="url(#shield175)" filter="url(#shadow175)" stroke="#ef4444" stroke-width="2"/>
  <!-- Gold Laurel / Edge highlight -->
  <path d="M60 14 L98 26 C98 65 76 92 60 104 C44 92 22 65 22 26 Z" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3 2"/>
  <!-- Medical Red Cross with White Border -->
  <rect x="52" y="38" width="16" height="42" rx="3" fill="#ffffff"/>
  <rect x="39" y="51" width="42" height="16" rx="3" fill="#ffffff"/>
  <rect x="54.5" y="40.5" width="11" height="37" rx="2" fill="#dc2626"/>
  <rect x="41.5" y="53.5" width="37" height="11" rx="2" fill="#dc2626"/>
  <!-- Gold National Star -->
  <polygon points="60,20 63,28 71.5,28 64.5,33.5 67,41.5 60,36.5 53,41.5 55.5,33.5 48.5,28 57,28" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
  <!-- Banner Text -->
  <rect x="30" y="88" width="60" height="15" rx="7.5" fill="#ffffff" opacity="0.95"/>
  <text x="60" y="99" font-family="'Montserrat', -apple-system, sans-serif" font-weight="900" font-size="9" fill="#991b1b" text-anchor="middle" letter-spacing="1">BV 108</text>
</svg>
`)}`,

  ksaps: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="ksapsBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#174ea6"/>
    </linearGradient>
    <linearGradient id="ksapsPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#c83271"/>
    </linearGradient>
  </defs>
  <!-- Background Disc -->
  <circle cx="60" cy="60" r="54" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Interlocking Aesthetic Arcs -->
  <path d="M60 14 A 46 46 0 0 1 106 60" fill="none" stroke="url(#ksapsBlue)" stroke-width="7" stroke-linecap="round"/>
  <path d="M106 60 A 46 46 0 0 1 60 106" fill="none" stroke="url(#ksapsPink)" stroke-width="7" stroke-linecap="round"/>
  <path d="M60 106 A 46 46 0 0 1 14 60" fill="none" stroke="url(#ksapsBlue)" stroke-width="7" stroke-linecap="round"/>
  <path d="M14 60 A 46 46 0 0 1 60 14" fill="none" stroke="#93c5fd" stroke-width="4" stroke-dasharray="4 4" stroke-linecap="round"/>
  <!-- Aesthetic Face Contour in Pink -->
  <path d="M54 34 C64 34 74 41 74 53 C74 63 67 70 65 75 C62 80 60 87 60 92" fill="none" stroke="url(#ksapsPink)" stroke-width="4" stroke-linecap="round"/>
  <!-- Complementary S-Curve in Blue -->
  <path d="M47 45 C50 54 57 59 57 69 C57 76 50 81 47 88" fill="none" stroke="url(#ksapsBlue)" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="70" cy="46" r="3.5" fill="#c83271"/>
  <!-- Label -->
  <text x="60" y="103" font-family="'Montserrat', sans-serif" font-weight="900" font-size="10" fill="#174ea6" text-anchor="middle" letter-spacing="1.2">KSAPS</text>
</svg>
`)}`,

  vsaps: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="vsapsPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#be185d"/>
      <stop offset="100%" stop-color="#9d174d"/>
    </linearGradient>
  </defs>
  <!-- Background Disc -->
  <circle cx="60" cy="60" r="54" fill="#fff5f8" stroke="#fbcfe8" stroke-width="2.5"/>
  <!-- Outer Gold Ring -->
  <circle cx="60" cy="60" r="48" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5 3"/>
  <!-- Stylized Lotus / Aesthetic Profile Petals -->
  <path d="M60 22 C70 36 82 48 82 65 C82 80 70 87 60 87 C50 87 38 80 38 65 C38 48 50 36 60 22 Z" fill="#fdf2f8" stroke="url(#vsapsPink)" stroke-width="2.5"/>
  <path d="M60 26 C65 39 75 50 75 62 C75 74 68 79 60 79" fill="none" stroke="#c83271" stroke-width="3" stroke-linecap="round"/>
  <path d="M53 47 C57 52 64 57 64 67 C64 74 57 77 52 77" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Golden Core -->
  <circle cx="60" cy="40" r="4.5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
  <!-- VSAPS Label -->
  <rect x="32" y="90" width="56" height="15" rx="7.5" fill="#be185d"/>
  <text x="60" y="101" font-family="'Montserrat', sans-serif" font-weight="900" font-size="9.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">VSAPS</text>
</svg>
`)}`,

  mohw: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="mohwBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0047a0"/>
      <stop offset="100%" stop-color="#002b66"/>
    </linearGradient>
    <linearGradient id="mohwRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cd2e3a"/>
      <stop offset="100%" stop-color="#a51c27"/>
    </linearGradient>
  </defs>
  <!-- Clean Circle Base -->
  <circle cx="60" cy="60" r="54" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Official Government of the Republic of Korea Taegeuk Whirlpool Ribbon -->
  <path d="M60 22 C78 22 92 36 92 53 C92 65 83 73 70 73 C56 73 53 56 38 56 C31 56 26 61 26 68 C26 46 41 22 60 22 Z" fill="url(#mohwBlue)"/>
  <path d="M60 96 C42 96 28 82 28 65 C28 53 37 45 50 45 C64 45 67 62 82 62 C89 62 94 57 94 50 C94 72 79 96 60 96 Z" fill="url(#mohwRed)"/>
  <circle cx="60" cy="59" r="6" fill="#ffffff"/>
  <!-- Top and Bottom Text Rings -->
  <text x="60" y="110" font-family="'Montserrat', sans-serif" font-weight="900" font-size="8" fill="#1e293b" text-anchor="middle" letter-spacing="1">MOHW KOREA</text>
</svg>
`)}`,

  khidi: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="khidiTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="khidiGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" fill="#ffffff" stroke="#e0f2fe" stroke-width="2"/>
  <!-- Health Cross with Modern Rounded Curves -->
  <path d="M60 18 C78 18 94 34 94 52 C94 72 72 88 60 96 C48 88 26 72 26 52 C26 34 42 18 60 18 Z" fill="#f0fdfa"/>
  <!-- Medical Innovation Cross (Teal & Emerald) -->
  <rect x="52" y="30" width="16" height="42" rx="5" fill="url(#khidiTeal)"/>
  <rect x="39" y="43" width="42" height="16" rx="5" fill="url(#khidiGreen)"/>
  <!-- Center Core -->
  <circle cx="60" cy="51" r="5" fill="#ffffff"/>
  <!-- KHIDI Wordmark -->
  <rect x="32" y="88" width="56" height="16" rx="8" fill="#0284c7"/>
  <text x="60" y="100" font-family="'Montserrat', sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1.2">KHIDI</text>
</svg>
`)}`,

  snubh: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="snuNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Outer Laurel Wreath in SNU Navy -->
  <path d="M28 40 C22 52 22 70 32 82 C38 88 46 92 60 94 C74 92 82 88 88 82 C98 70 98 52 92 40" fill="none" stroke="url(#snuNavy)" stroke-width="3.5" stroke-linecap="round"/>
  <!-- SNU Traditional Book Motif -->
  <path d="M42 54 C49 52 56 54 60 56 C64 54 71 52 78 54 L78 76 C71 74 64 76 60 78 C56 76 49 74 42 76 Z" fill="#eff6ff" stroke="url(#snuNavy)" stroke-width="2"/>
  <!-- Caduceus Medical Rod & Serpent in Gold -->
  <line x1="60" y1="28" x2="60" y2="82" stroke="#d97706" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="25" r="4.5" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <path d="M55 35 C65 37 65 45 55 47 C65 49 65 57 55 59" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
  <!-- SNUBH Text -->
  <rect x="30" y="88" width="60" height="15" rx="7.5" fill="#1e3a8a"/>
  <text x="60" y="99" font-family="'Montserrat', sans-serif" font-weight="900" font-size="8.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">SNUBH</text>
</svg>
`)}`,
};

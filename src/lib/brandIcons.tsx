import React from 'react';

export interface BrandIconProps {
  size?: number;
  className?: string;
}

/**
 * 1. Website (Planet Earth Globe)
 * Vibrant ocean blue with lush green continents and atmospheric depth.
 */
export function BrandWebsiteIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="earth-ocean-grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
        <clipPath id="earth-clip">
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>

      {/* Ocean Base */}
      <circle cx="12" cy="12" r="10" fill="url(#earth-ocean-grad)" />

      {/* Continents & Landmasses */}
      <g clipPath="url(#earth-clip)" fill="#22C55E">
        {/* North America */}
        <path d="M4.5 7.5C5.2 6.2 7 5.8 8.2 6.5C8.8 7.2 8.5 8.2 7.8 8.8C7 9.5 6.2 10.2 6.8 11.5C6.2 11.5 5.2 9.8 4.5 7.5Z" />
        {/* Greenland / Arctic */}
        <path d="M10 4.2C10.8 3.8 12.2 4 12.8 4.8C12.2 5.5 11 5.8 10.2 5.2Z" />
        {/* South America */}
        <path d="M6.8 13.2C8 13.2 8.8 14.5 8.6 16.2C8.2 18 7.5 19.2 6.8 19.5C6.2 19 5.8 17 6.2 15Z" />
        {/* Europe & Asia */}
        <path d="M12.5 5.5C14.2 4.5 17.5 4.8 19 6C19.5 7.2 18 8.2 16.5 8.8C17.5 9.8 19 10.2 20 9.8C20.8 11.2 19.8 12.5 17.8 12.5C15.8 12.5 14.2 10.8 13.2 10.2C12.5 10.8 12.2 9.5 12.5 5.5Z" />
        {/* Africa */}
        <path d="M12.2 11.5C14 11.5 15.8 12.2 15.6 14C15 16.2 14.2 17.8 12.8 18.2C12 17.2 11.5 15.2 11.5 13.5C11.5 12.2 11.8 11.5 12.2 11.5Z" />
        {/* Australia / Oceania */}
        <circle cx="18" cy="16.5" r="1.5" />
      </g>

      {/* Atmospheric Specular Glare */}
      <path
        d="M4.5 12A7.5 7.5 0 0 1 12 4.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Outer border definition */}
      <circle cx="12" cy="12" r="10" stroke="#0284C7" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

/**
 * 2. Instagram
 * Official camera outline on the iconic multi-stop gradient background.
 */
export function BrandInstagramIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="ig-gradient-fill" cx="25%" cy="105%" r="125%">
          <stop offset="0%" stopColor="#FED373" />
          <stop offset="15%" stopColor="#F15245" />
          <stop offset="60%" stopColor="#D92E7F" />
          <stop offset="90%" stopColor="#9B36B7" />
          <stop offset="100%" stopColor="#515BD4" />
        </radialGradient>
      </defs>
      {/* Gradient Card */}
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-gradient-fill)" />
      {/* Camera Body */}
      <rect
        x="6.2"
        y="6.2"
        width="11.6"
        height="11.6"
        rx="3.4"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      {/* Camera Lens */}
      <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.8" />
      {/* Flash Dot */}
      <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 3. YouTube
 * Official YouTube Red rounded container with solid white play button.
 */
export function BrandYoutubeIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="4.5" width="20" height="15" rx="4.5" fill="#FF0000" />
      <polygon points="10,8.2 16,12 10,15.8" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 4. WhatsApp
 * Official WhatsApp speech bubble with authentic telephone receiver.
 */
export function BrandWhatsappIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#25D366"
        d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.528 5.337L2 22l4.82-1.503a9.957 9.957 0 0 0 5.192 1.487h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.039-5.176-2.926-7.062A9.92 9.92 0 0 0 12.012 2z"
      />
      <path
        fill="#FFFFFF"
        d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.101-.2.051-.376-.025-.527-.075-.15-.676-1.63-.927-2.232-.244-.587-.492-.507-.676-.516l-.576-.01c-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.227 3.11.15.2 2.12 3.238 5.137 4.542.717.31 1.278.495 1.714.634.721.23 1.377.197 1.895.12.578-.087 1.78-.727 2.03-1.43.251-.702.251-1.304.176-1.43-.075-.125-.276-.2-.577-.35z"
      />
    </svg>
  );
}

/**
 * 5. Facebook
 * Official Facebook Blue circle with crisp white bold 'f'.
 */
export function BrandFacebookIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        d="M13.8 21.8v-7.6h2.5l.4-3h-2.9V9.3c0-.9.2-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H8.3v3h2.4v7.6c.5.1 1.1.1 1.6.1s1-.1 1.5-.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 6. X (formerly Twitter)
 * Official X logo with black background and white modern geometric glyph.
 */
export function BrandTwitterIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" />
      <path
        d="M16.9 5h2.2l-4.8 5.5 5.7 7.5h-4.5l-3.5-4.6-4.1 4.6H5.7l5.2-5.9L5.4 5h4.6l3.2 4.2zm-.8 11.7h1.2L8.5 6.2H7.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 7. LinkedIn
 * Official LinkedIn Blue square with crisp white 'in' logo.
 */
export function BrandLinkedinIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#0A66C2" />
      <path
        d="M7.8 9.3H5.2V18h2.6V9.3zM6.5 5.2c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm12.3 7.8c0-2.6-1.4-3.8-3.2-3.8-1.5 0-2.2.8-2.6 1.4v-1.2H10.4V18h2.6v-4.3c0-1.1.2-2.2 1.6-2.2 1.4 0 1.4 1.3 1.4 2.3V18h2.6v-5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 8. Google Maps
 * Official Google Maps multi-color pin (Red, Blue, Green, Yellow).
 */
export function BrandMapsIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92.3 132.3"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center White Circle */}
      <circle cx="46.2" cy="46.2" r="17.7" fill="#FFFFFF" />

      {/* Top Dark Blue Section */}
      <path
        fill="#1A73E8"
        d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"
      />

      {/* Left Red Section */}
      <path
        fill="#EA4335"
        d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"
      />

      {/* Right Blue Inner Section */}
      <path
        fill="#4285F4"
        d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"
      />

      {/* Bottom-Left Yellow Section */}
      <path
        fill="#FBBC04"
        d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"
      />

      {/* Bottom Green Section */}
      <path
        fill="#34A853"
        d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"
      />
    </svg>
  );
}

/**
 * 9. GitHub
 * Official dark badge with the crisp white Octocat silhouette.
 */
export function BrandGithubIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#24292F" />
      <path
        fill="#FFFFFF"
        d="M12 4.2a7.8 7.8 0 0 0-2.5 15.2c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.6-.9-2.6-.9-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.5-.9-3.5-3.8 0-.8.3-1.5.8-2-.1-.2-.4-1 .1-2 0 0 .6-.2 2.1.8.6-.2 1.3-.3 1.9-.3.7 0 1.4.1 2 .3 1.5-1 2.1-.8 2.1-.8.5 1 .2 1.8.1 2 .5.6.8 1.2.8 2 0 3-1.8 3.6-3.6 3.8.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A7.8 7.8 0 0 0 12 4.2z"
      />
    </svg>
  );
}

/**
 * 10. TikTok
 * Official black badge with the iconic Cyan & Magenta chromatic musical note.
 */
export function BrandTiktokIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" />
      {/* Cyan Layer */}
      <path
        d="M15.5 5.5c.6.8 1.4 1.4 2.3 1.6v2.2c-1-.1-2-.5-2.8-1.2v5.7c0 2.5-2 4.5-4.5 4.5-1.9 0-3.5-1.1-4.2-2.7.7.5 1.6.8 2.6.8 2.2 0 4-1.8 4-4V5.5h2.6z"
        fill="#25F4EE"
      />
      {/* Magenta Layer */}
      <path
        d="M14.5 4.5c.6.8 1.4 1.4 2.3 1.6v2.2c-1-.1-2-.5-2.8-1.2v5.7c0 2.5-2 4.5-4.5 4.5-1.9 0-3.5-1.1-4.2-2.7.7.5 1.6.8 2.6.8 2.2 0 4-1.8 4-4V4.5h2.6z"
        fill="#FE2C55"
      />
      {/* White Overlap Layer */}
      <path
        d="M15 5c.6.8 1.4 1.4 2.3 1.6v2.2c-1-.1-2-.5-2.8-1.2v5.7c0 2.5-2 4.5-4.5 4.5-2.5 0-4.5-2-4.5-4.5S7.5 9 10 9c.4 0 .8.1 1.2.2V11.5c-.4-.1-.8-.2-1.2-.2-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5V5H15z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 11. Telegram
 * Official bright sky blue circle with white folded paper airplane.
 */
export function BrandTelegramIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#24A1DE" />
      <path
        d="M5.4 11.8l11.5-4.5c.5-.2 1 .1.8.7l-2 9.2c-.1.6-.5.7-1 .4l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.3-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6 0-.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 12. Discord
 * Official Discord Blurple badge with white Clyde game controller face.
 */
export function BrandDiscordIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#5865F2" />
      <path
        d="M17.4 6.8a12.8 12.8 0 0 0-3.2-1 .1.1 0 0 0-.1.1c-.1.3-.3.7-.5 1a11.8 11.8 0 0 0-3.6 0c-.2-.3-.4-.7-.5-1a.1.1 0 0 0-.1-.1 12.8 12.8 0 0 0-3.2 1 .1.1 0 0 0 0 .1C4.2 9.9 3.6 13 4 16a.1.1 0 0 0 .1.1 12.9 12.9 0 0 0 3.9 2 .1.1 0 0 0 .1 0c.3-.4.6-.9.8-1.4a.1.1 0 0 0-.1-.1 8.5 8.5 0 0 1-1.2-.6.1.1 0 0 1 0-.2c.1-.1.2-.1.3-.2a9.2 9.2 0 0 0 8 0c.1.1.2.1.3.2a.1.1 0 0 1 0 .2 8.5 8.5 0 0 1-1.2.6.1.1 0 0 0-.1.1c.2.5.5 1 .8 1.4a.1.1 0 0 0 .1 0 12.9 12.9 0 0 0 3.9-2 .1.1 0 0 0 .1-.1c.5-3.5-.8-6.5-2.2-9.2a.1.1 0 0 0-.1-.1zM9.5 13.9c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6c.8 0 1.4.7 1.4 1.6s-.6 1.6-1.4 1.6zm5 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6c.8 0 1.4.7 1.4 1.6s-.6 1.6-1.4 1.6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 13. Spotify
 * Official Spotify Green circle with three black audio waves.
 */
export function BrandSpotifyIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#1DB954" />
      <path
        d="M16.8 10.3c-2-.6-4.5-.6-6.4.1-.3.1-.7 0-.8-.3-.1-.3 0-.7.3-.8 2.2-.7 5-.7 7.2 0 .3.1.5.5.4.8-.1.3-.4.4-.7.2zm-.3 2.5c-1.8-.5-3.8-.5-5.5.1-.3.1-.5 0-.6-.3-.1-.3 0-.5.3-.6 2-.6 4.3-.6 6.3 0 .3.1.4.4.3.7-.1.2-.3.3-.5.1zm-.5 2.5c-1.5-.4-3.1-.4-4.5.1-.2.1-.4 0-.5-.2-.1-.2 0-.4.2-.5 1.7-.5 3.5-.5 5.2 0 .2.1.3.3.2.5 0 .2-.2.3-.4.1z"
        fill="#121212"
        stroke="#121212"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 14. Phone
 * Vibrant emerald green circle with white telephone handset.
 */
export function BrandPhoneIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="phone-btn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#phone-btn-grad)" />
      <path
        d="M15.5 13.7c-.5-.4-1.1-.4-1.6.1l-.8.8c-1.4-.7-2.5-1.8-3.2-3.2l.8-.8c.5-.5.5-1.1.1-1.6l-1.5-2.2c-.4-.5-1.1-.6-1.6-.2l-1.2 1c-.5.4-.8 1.1-.7 1.7.4 2.8 1.9 5.3 4.1 7.2 1.9 1.6 4.3 2.6 6.9 2.5.7 0 1.3-.4 1.7-.9l1-1.2c.4-.5.3-1.2-.2-1.6l-2-1.6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 15. Email / Mail
 * Vibrant red/coral circle with crisp white envelope.
 */
export function BrandMailIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mail-btn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#mail-btn-grad)" />
      <path
        d="M5.8 8.2c0-.7.5-1.2 1.2-1.2h10c.7 0 1.2.5 1.2 1.2v7.6c0 .7-.5 1.2-1.2 1.2H7c-.7 0-1.2-.5-1.2-1.2V8.2zm1.8.8l4.4 3.3 4.4-3.3H7.6zm8.8 6.8v-5.6l-4.4 3.3-4.4-3.3v5.6h8.8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 16. Custom Link
 * Vibrant indigo/purple gradient circle with white interlocking chain link.
 */
export function BrandLinkIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="link-btn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#link-btn-grad)" />
      <path
        d="M10.8 14.8a3.5 3.5 0 0 0 4.9 0l2.5-2.5a3.5 3.5 0 0 0-4.9-4.9l-1.2 1.2a.8.8 0 1 1-1.1-1.1l1.2-1.2a5 5 0 0 1 7.1 7.1l-2.5 2.5a5 5 0 0 1-7.1 0 .8.8 0 1 1 1.1-1.1zm2.4-5.6a3.5 3.5 0 0 0-4.9 0l-2.5 2.5a3.5 3.5 0 0 0 4.9 4.9l1.2-1.2a.8.8 0 1 1 1.1 1.1l-1.2 1.2a5 5 0 0 1-7.1-7.1l2.5-2.5a5 5 0 0 1 7.1 0 .8.8 0 1 1-1.1 1.1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 17. Google Pay (GPay)
 */
export function BrandGPayIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Google G Colors */}
      <path
        d="M17.3 12.2c0-.3 0-.6-.1-.9h-5.2v1.8h3c-.1.7-.5 1.3-1.1 1.7v1.4h1.8c1-1 1.6-2.4 1.6-4z"
        fill="#4285F4"
      />
      <path
        d="M12 17.5c1.5 0 2.8-.5 3.7-1.4l-1.8-1.4c-.5.3-1.1.5-1.9.5-1.5 0-2.7-1-3.2-2.3H7v1.5c1 1.9 2.9 3.1 5 3.1z"
        fill="#34A853"
      />
      <path
        d="M8.8 12.9c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2V9H7c-.4.9-.7 1.9-.7 3s.3 2.1.7 3l1.8-1.4z"
        fill="#FBBC04"
      />
      <path
        d="M12 7.7c.8 0 1.6.3 2.2.8l1.6-1.6C14.8 6.1 13.5 5.5 12 5.5c-2.1 0-4 1.2-5 3.1l1.8 1.5c.5-1.3 1.7-2.4 3.2-2.4z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * 18. Paytm
 */
export function BrandPaytmIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#002E6E" />
      {/* Light blue Paytm accent 'P' */}
      <path
        d="M7.5 7h4c1.8 0 3 1.1 3 2.8s-1.2 2.8-3 2.8H9.8V17H7.5V7zm2.3 3.8h1.7c.6 0 1-.4 1-1s-.4-1-1-1H9.8v2z"
        fill="#00BAF2"
      />
      <circle cx="16.5" cy="15.8" r="1.2" fill="#00BAF2" />
    </svg>
  );
}

/**
 * 19. PhonePe
 */
export function BrandPhonepeIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#5F259F" />
      <path
        d="M14.8 7.5h-5.6v2h1.8v2.2c0 2.2 1.5 3.5 3.5 3.5h.3V13h-.3c-1 0-1.6-.6-1.6-1.6V9.5h1.9v-2zm-1.8 7.8l2.5 3.2h2.2l-2.8-3.6c.3-.2.6-.4.9-.7 1-1 1.4-2.2 1.4-3.7V7.5h-1.8v3c0 1.9-1.2 3.1-2.4 3.8v1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 20. Bank / Account
 */
export function BrandBankIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#0F172A" />
      <path
        d="M12 5.5L5.5 9v1.2h13V9L12 5.5zM6.8 11.2h2v4.5h-2v-4.5zm4.2 0h2v4.5h-2v-4.5zm4.2 0h2v4.5h-2v-4.5zM5.5 16.8v1.4h13v-1.4h-13z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 21. Message / SMS
 */
export function BrandMessageIcon({ size = 20, className = '' }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#10B981" />
      <path
        d="M7 8.5C7 7.7 7.7 7 8.5 7h7c.8 0 1.5.7 1.5 1.5v5c0 .8-.7 1.5-1.5 1.5H11l-2.8 2.2c-.3.2-.7 0-.7-.4V15h-.5c-.8 0-1.5-.7-1.5-1.5v-5zm2.5 1.8h5v1h-5v-1zm0 2.2h3.5v1h-3.5v-1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Registry mapping icon preset keys to their authentic brand components.
 */
export const BRAND_ICONS_MAP: Record<
  string,
  React.ComponentType<BrandIconProps>
> = {
  website: BrandWebsiteIcon,
  instagram: BrandInstagramIcon,
  youtube: BrandYoutubeIcon,
  whatsapp: BrandWhatsappIcon,
  phone: BrandPhoneIcon,
  mail: BrandMailIcon,
  facebook: BrandFacebookIcon,
  twitter: BrandTwitterIcon,
  linkedin: BrandLinkedinIcon,
  maps: BrandMapsIcon,
  github: BrandGithubIcon,
  tiktok: BrandTiktokIcon,
  telegram: BrandTelegramIcon,
  discord: BrandDiscordIcon,
  spotify: BrandSpotifyIcon,
  link: BrandLinkIcon,
  gpay: BrandGPayIcon,
  paytm: BrandPaytmIcon,
  phonepe: BrandPhonepeIcon,
  bank: BrandBankIcon,
  message: BrandMessageIcon,
};

export function hasBrandIcon(key: string): boolean {
  if (!key) return false;
  return Boolean(BRAND_ICONS_MAP[key.toLowerCase().trim()]);
}


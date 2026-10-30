import {
  InstagramIcon,
  YoutubeIcon,
  WhatsappIcon,
  Globe02Icon,
  Call02Icon,
  Mail01Icon,
  Facebook01Icon,
  NewTwitterIcon,
  Linkedin01Icon,
  Location01Icon,
  Github01Icon,
  TiktokIcon,
  TelegramIcon,
  DiscordIcon,
  SpotifyIcon,
  Link01Icon,
  QrCode01Icon,
  Copy01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete01Icon,
  Edit01Icon,
  Add01Icon,
  EyeIcon,
  Download01Icon,
  RefreshIcon,
  LogOutIcon,
  Settings01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';

export interface IconPreset {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const ICON_PRESETS: IconPreset[] = [
  { key: 'website', label: 'Website', icon: Globe02Icon },
  { key: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { key: 'youtube', label: 'YouTube', icon: YoutubeIcon },
  { key: 'whatsapp', label: 'WhatsApp', icon: WhatsappIcon },
  { key: 'phone', label: 'Phone', icon: Call02Icon },
  { key: 'mail', label: 'Email', icon: Mail01Icon },
  { key: 'facebook', label: 'Facebook', icon: Facebook01Icon },
  { key: 'twitter', label: 'X (Twitter)', icon: NewTwitterIcon },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin01Icon },
  { key: 'maps', label: 'Google Maps', icon: Location01Icon },
  { key: 'github', label: 'GitHub', icon: Github01Icon },
  { key: 'tiktok', label: 'TikTok', icon: TiktokIcon },
  { key: 'telegram', label: 'Telegram', icon: TelegramIcon },
  { key: 'discord', label: 'Discord', icon: DiscordIcon },
  { key: 'spotify', label: 'Spotify', icon: SpotifyIcon },
  { key: 'link', label: 'Custom Link', icon: Link01Icon },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIconByKey(key: string): any {
  const match = ICON_PRESETS.find((p) => p.key === key.toLowerCase());
  return match ? match.icon : Link01Icon;
}

export {
  InstagramIcon,
  YoutubeIcon,
  WhatsappIcon,
  Globe02Icon,
  Call02Icon,
  Mail01Icon,
  Facebook01Icon,
  NewTwitterIcon,
  Linkedin01Icon,
  Location01Icon,
  Github01Icon,
  TiktokIcon,
  TelegramIcon,
  DiscordIcon,
  SpotifyIcon,
  Link01Icon,
  QrCode01Icon,
  Copy01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete01Icon,
  Edit01Icon,
  Add01Icon,
  EyeIcon,
  Download01Icon,
  RefreshIcon,
  LogOutIcon,
  LogOutIcon as LogOut01Icon,
  Settings01Icon,
  Upload01Icon,
};

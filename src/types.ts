export interface RegistrationFormData {
  attendeeType: 'doctor' | 'business';
  selectedEvents: string[]; // ['SYM', 'KAT', 'CON']
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  license?: string; // Số CCHN / MST
  institution: string; // Tên Bệnh viện / Phòng khám / Doanh nghiệp
  titleRole: string; // Chức danh / chức vụ
  orgType: string; // Loại tổ chức / đơn vị
  specialty: string; // Chuyên khoa / Lĩnh vực kinh doanh
  address?: string;
  notes?: string;
  wantsCme: boolean;
  interests: string[];
  goals: string[];
  consentPrivacy: boolean;
  consentNews: boolean;
  consentData: boolean;
  // Legacy / fallback fields
  degree?: string;
  cmeNeed?: 'yes' | 'no';
  sessionPref?: 'session1' | 'session2' | 'both';
}

export interface AttendeeBadge {
  id: string;
  registrationCode: string;
  fullName: string;
  attendeeType?: 'doctor' | 'business';
  selectedEvents?: string[]; // ['SYM', 'KAT']
  degree?: string;
  institution: string;
  phone: string;
  email: string;
  city?: string;
  country?: string;
  license?: string; // Số CCHN y khoa hoặc Mã số thuế
  titleRole?: string; // Chức danh / Chức vụ
  orgType?: string;
  specialty?: string; // Chuyên khoa hoặc Ngành hàng kinh doanh
  address?: string;
  notes?: string;
  interests?: string[];
  goals?: string[];
  wantsCme?: boolean;
  cmeNeed?: 'yes' | 'no';
  sessionPref?: 'session1' | 'session2' | 'both';
  consentNews?: boolean;
  registeredAt: string;
  qrCodeUrl: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  description: string;
  session?: 'plenary' | 'session1' | 'session2' | 'break' | string;
  isKeynote?: boolean;
  isQA?: boolean;
  speakers?: string[];
  day?: 1 | 2;
  hall?: string;
}

export interface Partner {
  id: string;
  shortName: string;
  name: string;
  role: string;
  accent: 'primary' | 'secondary' | 'tertiary';
  logoUrl?: string;
  websiteUrl?: string;
}

export interface HighlightItem {
  id: string;
  metric: string;
  label: string;
  description: string;
  icon: string;
  accentColor: string;
}

export interface ExpertSpeaker {
  id: string;
  name: string;
  roleTitle: string; // "Diễn giả bài phát biểu mở màn" | "Báo cáo viên"
  bioPoints: string[]; // Các dòng tiểu sử chính xác từ poster
  country: 'KR' | 'VN';
  countryName: string;
  avatarUrl: string;
  badgeOrg: string;
  badgeColor: string;
  affiliation?: string;
  specialty?: string;
  topic?: string;
}

export interface EventDetails {
  title: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  heroHeadingLine3?: string;
  heroHeadingYear?: string;
  heroBannerHeight?: number;
  heroHeadingSpacing?: 'normal' | 'relaxed' | 'loose';
  heroVenueText?: string;
  heroCtaTag?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroDateText?: string;
  heroPatronLabel?: string;
  heroPatronLogoUrl?: string;
  heroOrgLabel?: string;
  heroKhidiLogoUrl?: string;
  heroSnubhLogoUrl?: string;
  heroKbitLogoUrl?: string;
  subtitle: string;
  dateString: string;
  timeString: string;
  timeDetail: string;
  targetDateTimeIso: string;
  venueName: string;
  venueShort: string;
  venueAddress: string;
  bannerImageUrl: string;
  mapImageUrl: string;
  googleMapsUrl: string;
  hotline: string;
  telephone: string;
  email: string;
  totalSeats: number;
  initialRegistered: number;
  coOrganizersText: string;
  hostsText: string;
  patronizeText: string;
  heroKsapsLogoUrl?: string;
  heroVsapsLogoUrl?: string;
  heroBv175LogoUrl?: string;
  heroBv108LogoUrl?: string;
  heroBgImageUrl?: string;
  heroBuildingImageUrl?: string;
  heroShowBuilding?: boolean;
  heroOverlayMode?: 'pink' | 'gradient' | 'soft' | 'none';
  heroBgFit?: 'cover' | 'contain' | 'right';
  showHighlightsHeader?: boolean;
  highlightsHostsText?: string;
  highlightsCoOrganizersText?: string;
  highlightsSubtitle?: string;
  highlightsTitle?: string;
  highlightsDescription?: string;
  venueSectionTag?: string;
  venueSectionTitle?: string;
  venueSectionDescription?: string;
  venueAddressTitle?: string;
  venueParkingTitle?: string;
  venueParkingDesc?: string;
  venueAirportTitle?: string;
  venueAirportDesc?: string;
  venueSupportTitle?: string;
  venueSupportHotline?: string;
  venueSupportEmail?: string;
  venueSupportButtonText?: string;
  mapButtonText?: string;
  highlightsTag?: string;
  hallsSectionTag?: string;
  hallsSectionTitle?: string;
  hallsSectionDescription?: string;
  expertsSectionTag?: string;
  expertsSectionTitle?: string;
  expertsSectionDescription?: string;
  agendaSectionTag?: string;
  agendaSectionTitle?: string;
  agendaSectionNote?: string;
  registrationSectionTag?: string;
  registrationSectionTitle?: string;
  registrationSectionDescription?: string;
}

export interface FooterConfig {
  brandTitle: string;
  brandDescription: string;
  tag1: string;
  tag2: string;
  organizersTitle: string;
  organizer1Name: string;
  organizer1Sub: string;
  organizer2Name: string;
  organizer2Sub: string;
  partnersTitle: string;
  partner1Name: string;
  partner1Sub: string;
  partner2Name: string;
  partner2Sub: string;
  contactTitle: string;
  hotline: string;
  email: string;
  venueName: string;
  copyrightText: string;
}

export interface AdminAccountConfig {
  username: string;
  password: string;
  lastUpdated?: string;
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
  faviconUrl?: string;
  author: string;
  robots: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleSiteVerification?: string;
  structuredDataEnabled?: boolean;
  customHeadTags?: string;
}

export interface GmailSenderAccount {
  id: string;
  email: string;
  appPassword: string; // 16-character Google App Password
  senderDisplayName?: string;
  dailyQuota: number; // default: 500
  sentToday: number; // sent count today
  lastUsedAt?: string;
  isActive: boolean;
  status: 'ready' | 'quota_reached' | 'error' | 'disabled';
  lastError?: string;
}

export interface HostingerSenderAccount {
  id: string;
  email: string;
  password: string;
  smtpHost?: string; // Default: 'smtp.hostinger.com'
  smtpPort?: number; // Default: 465 (SSL) hoặc 587 (TLS)
  secure?: boolean; // Default: true
  senderDisplayName?: string;
  dailyQuota: number; // Default: 1000 emails/day
  sentToday: number;
  lastUsedAt?: string;
  isActive: boolean;
  status: 'ready' | 'quota_reached' | 'error' | 'disabled';
  lastError?: string;
}

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  recipientType?: 'doctor' | 'business' | 'vip' | 'general';
  status: 'pending' | 'sending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
  resendEmailId?: string;
  sentByAccount?: string; // e.g. "acc1@gmail.com"
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetAudience: 'doctor' | 'business' | 'all';
}

export interface EmailCampaignConfig {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  sendProvider?: 'hostinger' | 'gmail_pool' | 'resend' | 'simulation';
  resendApiKey?: string;
  resendDomain?: string;
  gmailPool?: GmailSenderAccount[];
  gmailQuotaResetDate?: string; // YYYY-MM-DD
  hostingerPool?: HostingerSenderAccount[];
  hostingerQuotaResetDate?: string; // YYYY-MM-DD
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  recipients: EmailRecipient[];
  templates: EmailTemplate[];
  selectedTemplateId: string;
}

export interface CMSData {
  eventDetails: EventDetails;
  experts: ExpertSpeaker[];
  agenda: AgendaItem[];
  highlights: HighlightItem[];
  partners: Partner[];
  registrations: AttendeeBadge[];
  mediaLibrary: string[];
  footerConfig?: FooterConfig;
  adminAccount?: AdminAccountConfig;
  seoConfig?: SEOConfig;
  emailCampaignConfig?: EmailCampaignConfig;
}



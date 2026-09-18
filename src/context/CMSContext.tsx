import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CMSData, EventDetails, ExpertSpeaker, AgendaItem, HighlightItem, Partner, AttendeeBadge, FooterConfig, AdminAccountConfig, SEOConfig, EmailCampaignConfig, EmailRecipient, EmailTemplate } from '../types';
import {
  EVENT_DETAILS as DEFAULT_EVENT_DETAILS,
  LEADING_EXPERTS as DEFAULT_EXPERTS,
  AGENDA_ITEMS as DEFAULT_AGENDA,
  KEY_HIGHLIGHTS as DEFAULT_HIGHLIGHTS,
  PARTNERS as DEFAULT_PARTNERS,
  DEFAULT_SEO_CONFIG,
  DEFAULT_EMAIL_CAMPAIGN,
} from '../data/symposiumData';

export const STORAGE_KEY = 'viet_han_aesthetic_cms_data_v9';

// Purge all old cache versions immediately to ensure 100% fresh data
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('viet_han_aesthetic') && k !== STORAGE_KEY) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

const DEFAULT_MEDIA_LIBRARY: string[] = [
  '/BG.png',
  '/images/experts/heo-chan-young.png',
  '/images/experts/dong-woo-shin.png',
  '/images/experts/young-jin-park.png',
  '/images/experts/park-eun-soo.png',
  '/images/experts/woo-sung-lee.png',
  '/images/experts/park-bok-won.png',
  '/images/experts/min-seok-choi.png',
  '/images/experts/jin-mi-choi.png',
  '/images/experts/jin-wook-jeong.png',
  '/images/experts/jae-ik-choi.png',
  '/images/experts/lee-kyung-eun.png',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDIHJ-Vq-wq5Ptv2DpIpbDE_IQvGsvFIOWjt3jXAxjuYOI-4H-eWuqsSoDEP1igpa9kmsFCplUxu3fzYVrsHUD9yMOAM68YA85dW--acVETd0RuhMl8B0j41QaXHDLz6o2wesa4jcv4pFP-P8HDEEzJJ_YmYKqvu_FiILyCQPDXSIvVqziGXyEkA3iwZh1762s_hX3RGQ4gOrJULyBtb68z-l25uo0UyZOP-uoT61B1PwwKzbrwENE6Dw',
];

const INITIAL_REGISTRATIONS: AttendeeBadge[] = [
  {
    id: 'sample-1',
    registrationCode: 'KBIT-DOC-8899',
    fullName: 'TS.BS. Nguyễn Văn Hùng',
    attendeeType: 'doctor',
    selectedEvents: ['CONGRESS'],
    degree: 'Bác sĩ CKII',
    institution: 'Bệnh viện Trung ương Quân đội 108, Hà Nội',
    titleRole: 'Phó Trưởng Khoa Phẫu Thuật Tạo Hình',
    specialty: 'Tạo hình Thẩm mỹ',
    license: '012345/HN-CCHN',
    phone: '0908 123 456',
    email: 'dr.hungnguyen@benhvien108.vn',
    city: 'Hà Nội',
    country: 'Việt Nam',
    interests: ['Thẩm mỹ khuôn mặt', 'Tiêm chích'],
    goals: ['Học kỹ thuật mới', 'Kiến thức lâm sàng'],
    notes: 'Tham dự Congress 2026 tại BV 108',
    wantsCme: true,
    cmeNeed: 'yes',
    consentNews: true,
    sessionPref: 'both',
    registeredAt: '14/09/2026 14:20',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KBIT-DOC-8899%7CTS.BS.%20Nguy%E1%BB%85n%20V%C4%83n%20H%C3%B9ng%7CBV108',
  },
  {
    id: 'sample-2',
    registrationCode: 'KBIT-BIZ-4521',
    fullName: 'Bà Trần Mai Phương',
    attendeeType: 'business',
    selectedEvents: ['CONGRESS'],
    degree: 'Tổng Giám Đốc',
    institution: 'Công ty Cổ phần Thẩm mỹ Quốc tế K-Beauty Med',
    titleRole: 'Giám Đốc Điều Hành (CEO)',
    specialty: 'Thiết bị thẩm mỹ',
    license: '0316892345',
    phone: '0912 345 678',
    email: 'phuong.tran@kbeautymed.vn',
    city: 'Hà Nội',
    country: 'Việt Nam',
    interests: ['Thiết bị Thẩm mỹ', 'Chăm sóc Da & Dược mỹ phẩm'],
    goals: ['Tìm nhà phân phối & đối tác', 'Kết nối B2B'],
    notes: 'Quan tâm kết nối B2B với các đối tác y tế Hàn Quốc',
    wantsCme: false,
    cmeNeed: 'no',
    consentNews: true,
    sessionPref: 'both',
    registeredAt: '14/09/2026 16:05',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KBIT-BIZ-4521%7CTr%E1%BA%A7n%20Mai%20Ph%C6%B0%C6%A1ng%7CK-Beauty',
  },
];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandTitle: 'VIỆT – HÀN 2026',
  brandDescription:
    'Hội nghị Khoa học Thẩm mỹ Quốc tế quy mô lớn được bảo trợ bởi Bộ Y tế và Phúc lợi Hàn Quốc, do KSAPS và VSAPS chủ trì, BV Trung ương Quân đội 108, KHIDI, SNUBH và KBIT đồng tổ chức.',
  tag1: 'Anh – Việt – Hàn',
  tag2: 'Phiên Dịch Cabin',
  organizersTitle: 'ĐƠN VỊ ĐỒNG TỔ CHỨC & ĐĂNG CAI',
  organizer1Name: 'Bệnh viện Trung ương Quân đội 108',
  organizer1Sub: 'Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng, Hà Nội',
  organizer2Name: 'KBIT Association & KHIDI',
  organizer2Sub: 'Bộ Y tế & Phúc lợi Hàn Quốc (MOHW) Bảo trợ',
  partnersTitle: 'CƠ QUAN CHỦ TRÌ & CHUYÊN MÔN',
  partner1Name: 'KSAPS (Hàn Quốc) & VSAPS (Việt Nam)',
  partner1Sub: 'Chủ trì Học thuật & Chuyên môn Phẫu thuật Tạo hình',
  partner2Name: 'Bệnh viện Đại học Quốc gia Seoul (SNUBH)',
  partner2Sub: 'Hợp tác chuyển giao kỹ thuật y khoa',
  contactTitle: 'THÔNG TIN LIÊN HỆ & BAN THƯ KÝ',
  hotline: '+82-10-4159-8777',
  email: 'secretary@kbitassociation.com',
  venueName: 'Bệnh viện Trung ương Quân đội 108, Hà Nội',
  copyrightText: '© 2026 KBIT Association & Bệnh viện Trung ương Quân đội 108. Bảo lưu mọi quyền.',
};

export const DEFAULT_ADMIN_ACCOUNT: AdminAccountConfig = {
  username: 'admin',
  password: 'kbit@2026',
  lastUpdated: new Date().toISOString(),
};

const INITIAL_CMS_DATA: CMSData = {
  eventDetails: DEFAULT_EVENT_DETAILS,
  experts: DEFAULT_EXPERTS,
  agenda: DEFAULT_AGENDA,
  highlights: DEFAULT_HIGHLIGHTS,
  partners: DEFAULT_PARTNERS,
  registrations: INITIAL_REGISTRATIONS,
  mediaLibrary: DEFAULT_MEDIA_LIBRARY,
  footerConfig: DEFAULT_FOOTER_CONFIG,
  adminAccount: DEFAULT_ADMIN_ACCOUNT,
  seoConfig: DEFAULT_SEO_CONFIG,
  emailCampaignConfig: DEFAULT_EMAIL_CAMPAIGN,
};

interface CMSContextType {
  cmsData: CMSData;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  openAdmin: (tab?: string) => void;
  closeAdmin: () => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  updateExpert: (id: string, updated: Partial<ExpertSpeaker>) => void;
  addExpert: (expert: ExpertSpeaker) => void;
  deleteExpert: (id: string) => void;
  updateAgendaItem: (id: string, updated: Partial<AgendaItem>) => void;
  addAgendaItem: (item: AgendaItem) => void;
  deleteAgendaItem: (id: string) => void;
  setAgendaList: (agenda: AgendaItem[]) => void;
  syncDefaultAgenda: () => void;
  updateHighlight: (id: string, updated: Partial<HighlightItem>) => void;
  updatePartner: (id: string, updated: Partial<Partner>) => void;
  addPartner: (partner: Partner) => void;
  deletePartner: (id: string) => void;
  addRegistration: (attendee: AttendeeBadge) => void;
  updateRegistration: (id: string, updated: Partial<AttendeeBadge>) => void;
  deleteRegistration: (id: string) => void;
  updateFooterConfig: (updated: Partial<FooterConfig>) => void;
  updateAdminAccount: (updated: Partial<AdminAccountConfig>) => void;
  updateSEOConfig: (updated: Partial<SEOConfig>) => void;
  updateEmailCampaignConfig: (updated: Partial<EmailCampaignConfig>) => void;
  addEmailRecipient: (recipient: EmailRecipient) => void;
  removeEmailRecipient: (id: string) => void;
  updateEmailRecipientStatus: (id: string, status: EmailRecipient['status'], error?: string, resendEmailId?: string) => void;
  bulkAddEmailRecipients: (recipients: EmailRecipient[]) => void;
  resetEmailRecipientsStatus: () => void;
  resetToDefaults: () => void;
  clearAllCacheAndReload: () => void;
  exportDataToJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;
  addImageToLibrary: (imageUrl: string) => void;
  uploadImageFile: (file: File) => Promise<string>;
  isCloudDbConnected: boolean;
  refreshFromCloud: () => Promise<void>;
  saveCmsToCloud: () => Promise<boolean>;
}

export const isPathAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  return (
    path === '/admin' ||
    path === '/admin/' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#/admin') ||
    search.get('admin') === 'true'
  );
};

export const getInitialAdminTab = (): string => {
  if (typeof window === 'undefined') return 'general';
  const search = new URLSearchParams(window.location.search);
  const tabParam = search.get('tab');
  if (tabParam) return tabParam;
  const hash = window.location.hash.replace(/^#\/?admin\/?/, '').replace(/^#/, '');
  const validTabs = ['general', 'seo', 'speakers', 'agenda', 'media', 'partners', 'highlights', 'registrations', 'email', 'footer'];
  if (validTabs.includes(hash)) {
    return hash;
  }
  return 'general';
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsData, setCmsData] = useState<CMSData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // ensure missing fields get merged with defaults
        return {
          ...INITIAL_CMS_DATA,
          eventDetails: { ...DEFAULT_EVENT_DETAILS, ...(parsed.eventDetails || {}) },
          agenda: parsed.agenda && parsed.agenda.length >= DEFAULT_AGENDA.length ? parsed.agenda : DEFAULT_AGENDA,
          experts: parsed.experts && parsed.experts.length > 0
            ? parsed.experts.map((exp: any) => {
                const def = DEFAULT_EXPERTS.find((de) => de.id === exp.id);
                return {
                  ...(def || {}),
                  ...exp,
                  affiliation: exp.affiliation || def?.affiliation || '',
                  topic: exp.topic || def?.topic || '',
                };
              })
            : DEFAULT_EXPERTS,
          highlights: parsed.highlights || DEFAULT_HIGHLIGHTS,
          partners: parsed.partners && parsed.partners.length > 0
            ? parsed.partners.map((p: any) => {
                const def = DEFAULT_PARTNERS.find((dp) => dp.id === p.id);
                return {
                  ...p,
                  logoUrl: p.logoUrl || def?.logoUrl || '',
                };
              })
            : DEFAULT_PARTNERS,
          registrations: parsed.registrations || INITIAL_REGISTRATIONS,
          mediaLibrary: parsed.mediaLibrary || DEFAULT_MEDIA_LIBRARY,
          footerConfig: { ...DEFAULT_FOOTER_CONFIG, ...(parsed.footerConfig || {}) },
          adminAccount: { ...DEFAULT_ADMIN_ACCOUNT, ...(parsed.adminAccount || {}) },
          seoConfig: { ...DEFAULT_SEO_CONFIG, ...(parsed.seoConfig || {}) },
          emailCampaignConfig: { ...DEFAULT_EMAIL_CAMPAIGN, ...(parsed.emailCampaignConfig || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load CMS data from localStorage:', e);
    }
    return INITIAL_CMS_DATA;
  });

  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => isPathAdmin());
  const [activeAdminTab, setActiveAdminTabState] = useState<string>(() => getInitialAdminTab());
  const [isCloudDbConnected, setIsCloudDbConnected] = useState<boolean>(false);

  // Cloud Database Synchronization (Vercel Postgres)
  const refreshFromCloud = async () => {
    try {
      // 1. Fetch Registrations from Vercel Postgres
      const regRes = await fetch('/api/registrations');
      if (regRes.ok) {
        const regJson = await regRes.json();
        if (regJson.isDbConfigured) {
          setIsCloudDbConnected(true);
          if (regJson.success && Array.isArray(regJson.data) && regJson.data.length > 0) {
            setCmsData((prev) => ({
              ...prev,
              registrations: regJson.data,
              eventDetails: {
                ...prev.eventDetails,
                initialRegistered: Math.max(prev.eventDetails.initialRegistered, regJson.data.length),
              },
            }));
          }
        }
      }

      // 2. Fetch CMS Configuration from Vercel Postgres
      const cmsRes = await fetch('/api/cms');
      if (cmsRes.ok) {
        const cmsJson = await cmsRes.json();
        if (cmsJson.isDbConfigured) {
          setIsCloudDbConnected(true);
          if (cmsJson.success && cmsJson.hasCustomData && cmsJson.data) {
            setCmsData((prev) => ({
              ...prev,
              ...cmsJson.data,
              registrations: prev.registrations,
            }));
          }
        }
      }
    } catch {
      // Running locally or offline - localStorage fallback active
    }
  };

  const saveCmsToCloud = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIsCloudDbConnected(true);
          return true;
        }
      }
    } catch (err) {
      console.warn('Could not sync CMS to Vercel Postgres:', err);
    }
    return false;
  };

  // Initial cloud sync on mount
  useEffect(() => {
    refreshFromCloud();
  }, []);

  // URL Synchronization: Keep /admin in browser URL when CMS is opened
  const setIsAdminOpen = (open: boolean) => {
    setIsAdminOpenState(open);
    if (typeof window !== 'undefined') {
      if (open) {
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath !== '/admin' && currentPath !== '/admin/') {
          const targetUrl = activeAdminTab && activeAdminTab !== 'general' 
            ? `/admin?tab=${encodeURIComponent(activeAdminTab)}` 
            : '/admin';
          window.history.pushState({ admin: true, tab: activeAdminTab }, '', targetUrl);
        }
      } else {
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath === '/admin' || currentPath === '/admin/' || currentPath.startsWith('/admin/')) {
          window.history.pushState({ admin: false }, '', '/');
        }
      }
    }
  };

  const openAdmin = (tab?: string) => {
    if (tab) {
      setActiveAdminTabState(tab);
    }
    setIsAdminOpenState(true);
    if (typeof window !== 'undefined') {
      const selectedTab = tab || activeAdminTab;
      const targetUrl = selectedTab && selectedTab !== 'general' 
        ? `/admin?tab=${encodeURIComponent(selectedTab)}` 
        : '/admin';
      window.history.pushState({ admin: true, tab: selectedTab }, '', targetUrl);
    }
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
  };

  const setActiveAdminTab = (tab: string) => {
    setActiveAdminTabState(tab);
    if (typeof window !== 'undefined' && isAdminOpen) {
      const targetUrl = tab && tab !== 'general' 
        ? `/admin?tab=${encodeURIComponent(tab)}` 
        : '/admin';
      window.history.replaceState({ admin: true, tab }, '', targetUrl);
    }
  };

  // Sync state with browser back/forward and hash navigation
  useEffect(() => {
    const handlePopState = () => {
      const adminActive = isPathAdmin();
      setIsAdminOpenState(adminActive);
      if (adminActive) {
        const initialTab = getInitialAdminTab();
        setActiveAdminTabState(initialTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const lastSavedJsonRef = useRef<string>('');
  const isSyncingFromStorageRef = useRef<boolean>(false);

  // Debounced safe localStorage write to prevent blocking UI and ping-pong sync loops
  useEffect(() => {
    if (isSyncingFromStorageRef.current) {
      isSyncingFromStorageRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      try {
        const json = JSON.stringify(cmsData);
        if (json !== lastSavedJsonRef.current) {
          lastSavedJsonRef.current = json;
          localStorage.setItem(STORAGE_KEY, json);
        }
      } catch (err) {
        console.warn('LocalStorage quota warning or size limit, attempting safe recovery...', err);
        try {
          const safeData = {
            ...cmsData,
            mediaLibrary: cmsData.mediaLibrary.slice(0, 3),
          };
          const jsonSafe = JSON.stringify(safeData);
          lastSavedJsonRef.current = jsonSafe;
          localStorage.setItem(STORAGE_KEY, jsonSafe);
        } catch (e2) {
          console.error('Critical localStorage save failure:', e2);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [cmsData]);

  // Real-time synchronization across browser tabs without feedback loop
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        // If this event was fired from our own last write, skip!
        if (e.newValue === lastSavedJsonRef.current) return;

        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.eventDetails) {
            lastSavedJsonRef.current = e.newValue;
            isSyncingFromStorageRef.current = true;
            setCmsData((prev) => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          console.error('Cross-tab sync error:', e);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateEventDetails = (details: Partial<EventDetails>) => {
    setCmsData((prev) => ({
      ...prev,
      eventDetails: { ...prev.eventDetails, ...details },
    }));
  };

  const updateExpert = (id: string, updated: Partial<ExpertSpeaker>) => {
    setCmsData((prev) => ({
      ...prev,
      experts: prev.experts.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp)),
    }));
  };

  const addExpert = (expert: ExpertSpeaker) => {
    setCmsData((prev) => ({
      ...prev,
      experts: [...prev.experts, expert],
    }));
  };

  const deleteExpert = (id: string) => {
    setCmsData((prev) => ({
      ...prev,
      experts: prev.experts.filter((exp) => exp.id !== id),
    }));
  };

  const updateAgendaItem = (id: string, updated: Partial<AgendaItem>) => {
    setCmsData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const addAgendaItem = (item: AgendaItem) => {
    setCmsData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, item],
    }));
  };

  const deleteAgendaItem = (id: string) => {
    setCmsData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((item) => item.id !== id),
    }));
  };

  const setAgendaList = (agenda: AgendaItem[]) => {
    setCmsData((prev) => ({
      ...prev,
      agenda,
    }));
  };

  const syncDefaultAgenda = () => {
    setCmsData((prev) => ({
      ...prev,
      agenda: DEFAULT_AGENDA,
    }));
  };

  const updateHighlight = (id: string, updated: Partial<HighlightItem>) => {
    setCmsData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const updatePartner = (id: string, updated: Partial<Partner>) => {
    setCmsData((prev) => ({
      ...prev,
      partners: prev.partners.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  };

  const addPartner = (partner: Partner) => {
    setCmsData((prev) => ({
      ...prev,
      partners: [...prev.partners, partner],
    }));
  };

  const deletePartner = (id: string) => {
    setCmsData((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.id !== id),
    }));
  };

  const addRegistration = (attendee: AttendeeBadge) => {
    setCmsData((prev) => ({
      ...prev,
      registrations: [attendee, ...prev.registrations],
      eventDetails: {
        ...prev.eventDetails,
        initialRegistered: (prev.eventDetails.initialRegistered || 0) + 1,
      },
    }));

    // Async sync to Vercel Postgres
    fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendee),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setIsCloudDbConnected(true);
        }
      })
      .catch(() => {
        // Fallback: stored in localStorage
      });
  };

  const updateRegistration = (id: string, updated: Partial<AttendeeBadge>) => {
    let updatedPayload: AttendeeBadge | undefined;
    setCmsData((prev) => {
      const nextRegs = prev.registrations.map((r) => {
        if (r.id === id) {
          updatedPayload = { ...r, ...updated };
          return updatedPayload;
        }
        return r;
      });
      return { ...prev, registrations: nextRegs };
    });

    if (updatedPayload) {
      fetch('/api/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setIsCloudDbConnected(true);
          }
        })
        .catch(() => {});
    }
  };

  const deleteRegistration = (id: string) => {
    setCmsData((prev) => ({
      ...prev,
      registrations: prev.registrations.filter((r) => r.id !== id),
    }));

    fetch(`/api/registrations?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setIsCloudDbConnected(true);
        }
      })
      .catch(() => {});
  };

  const updateFooterConfig = (updated: Partial<FooterConfig>) => {
    setCmsData((prev) => ({
      ...prev,
      footerConfig: {
        ...(prev.footerConfig || DEFAULT_FOOTER_CONFIG),
        ...updated,
      },
    }));
  };

  const updateAdminAccount = (updated: Partial<AdminAccountConfig>) => {
    setCmsData((prev) => ({
      ...prev,
      adminAccount: {
        ...(prev.adminAccount || DEFAULT_ADMIN_ACCOUNT),
        ...updated,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  const updateSEOConfig = (updated: Partial<SEOConfig>) => {
    setCmsData((prev) => ({
      ...prev,
      seoConfig: {
        ...(prev.seoConfig || DEFAULT_SEO_CONFIG),
        ...updated,
      },
    }));
  };

  const updateEmailCampaignConfig = (updated: Partial<EmailCampaignConfig>) => {
    setCmsData((prev) => ({
      ...prev,
      emailCampaignConfig: {
        ...(prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN),
        ...updated,
      },
    }));
  };

  const addEmailRecipient = (recipient: EmailRecipient) => {
    setCmsData((prev) => {
      const cfg = prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN;
      return {
        ...prev,
        emailCampaignConfig: {
          ...cfg,
          recipients: [recipient, ...cfg.recipients],
        },
      };
    });
  };

  const removeEmailRecipient = (id: string) => {
    setCmsData((prev) => {
      const cfg = prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN;
      return {
        ...prev,
        emailCampaignConfig: {
          ...cfg,
          recipients: cfg.recipients.filter((r) => r.id !== id),
        },
      };
    });
  };

  const updateEmailRecipientStatus = (id: string, status: EmailRecipient['status'], error?: string, resendEmailId?: string) => {
    setCmsData((prev) => {
      const cfg = prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN;
      return {
        ...prev,
        emailCampaignConfig: {
          ...cfg,
          recipients: cfg.recipients.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  sentAt: status === 'sent' ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : r.sentAt,
                  errorMessage: error,
                  resendEmailId: resendEmailId || r.resendEmailId,
                }
              : r
          ),
        },
      };
    });
  };

  const bulkAddEmailRecipients = (recipients: EmailRecipient[]) => {
    setCmsData((prev) => {
      const cfg = prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN;
      const existingEmails = new Set(cfg.recipients.map((r) => r.email.toLowerCase()));
      const newRecipients = recipients.filter((r) => !existingEmails.has(r.email.toLowerCase()));
      return {
        ...prev,
        emailCampaignConfig: {
          ...cfg,
          recipients: [...newRecipients, ...cfg.recipients],
        },
      };
    });
  };

  const resetEmailRecipientsStatus = () => {
    setCmsData((prev) => {
      const cfg = prev.emailCampaignConfig || DEFAULT_EMAIL_CAMPAIGN;
      return {
        ...prev,
        emailCampaignConfig: {
          ...cfg,
          recipients: cfg.recipients.map((r) => ({ ...r, status: 'pending', errorMessage: undefined })),
        },
      };
    });
  };

  const addImageToLibrary = (imageUrl: string) => {
    if (!imageUrl) return;
    setCmsData((prev) => {
      if (prev.mediaLibrary.includes(imageUrl)) return prev;
      return {
        ...prev,
        mediaLibrary: [imageUrl, ...prev.mediaLibrary],
      };
    });
  };

  // Client-side image compression to guarantee lightweight storage (< 250KB) and prevent LocalStorage quota errors
  const compressImageFile = (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Vui lòng chọn định dạng file ảnh (PNG, JPG, WEBP, SVG)'));
        return;
      }

      // Keep SVGs as pure vector data URLs
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Lỗi khi đọc file SVG'));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down keeping aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const isPngWithAlpha = file.type === 'image/png';
          let dataUrl = canvas.toDataURL(isPngWithAlpha ? 'image/png' : 'image/jpeg', isPngWithAlpha ? undefined : quality);
          // If PNG is overly large (> 1.2MB), convert to optimized JPEG to guarantee smooth storage
          if (isPngWithAlpha && dataUrl.length > 1200000) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Không thể xử lý hình ảnh này'));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Lỗi khi tải file'));
      reader.readAsDataURL(file);
    });
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    const result = await compressImageFile(file);
    addImageToLibrary(result);
    return result;
  };

  const resetToDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại toàn bộ nội dung và hình ảnh gốc mặc định của trang? Tất cả thay đổi chỉnh sửa thủ công sẽ được hoàn tác.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('custom_hero_bg');
      setCmsData(INITIAL_CMS_DATA);
    }
  };

  const clearAllCacheAndReload = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ Cache, bộ nhớ tạm trình duyệt và tải lại trang mới hoàn toàn 100% không?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      } catch (e) {}
      window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
    }
  };

  const exportDataToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cmsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `viet_han_symposium_cms_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.eventDetails && parsed.experts) {
        setCmsData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
    } catch (e) {
      console.error('Import JSON error:', e);
    }
    return false;
  };

  return (
    <CMSContext.Provider
      value={{
        cmsData,
        isAdminOpen,
        setIsAdminOpen,
        openAdmin,
        closeAdmin,
        activeAdminTab,
        setActiveAdminTab,
        updateEventDetails,
        updateExpert,
        addExpert,
        deleteExpert,
        updateAgendaItem,
        addAgendaItem,
        deleteAgendaItem,
        setAgendaList,
        syncDefaultAgenda,
        updateHighlight,
        updatePartner,
        addPartner,
        deletePartner,
        addRegistration,
        updateRegistration,
        deleteRegistration,
        updateFooterConfig,
        updateAdminAccount,
        updateSEOConfig,
        updateEmailCampaignConfig,
        addEmailRecipient,
        removeEmailRecipient,
        updateEmailRecipientStatus,
        bulkAddEmailRecipients,
        resetEmailRecipientsStatus,
        resetToDefaults,
        clearAllCacheAndReload,
        exportDataToJson,
        importDataFromJson,
        addImageToLibrary,
        uploadImageFile,
        isCloudDbConnected,
        refreshFromCloud,
        saveCmsToCloud,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

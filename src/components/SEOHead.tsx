import React, { useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_SEO_CONFIG } from '../data/symposiumData';

export const SEOHead: React.FC = () => {
  const { cmsData } = useCMS();
  const seo = cmsData.seoConfig || DEFAULT_SEO_CONFIG;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Page Title
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
    }

    // Helper to set or create meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set canonical link
    const setCanonical = (href: string) => {
      if (!href) return;
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Helper to set or create link tag (e.g. favicon)
    const setLinkTag = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Full absolute URL for og:image
    const getFullImageUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fullOgImage = getFullImageUrl(seo.ogImageUrl || '/BG.png');
    const fullCanonical = seo.canonicalUrl || window.location.href;
    const faviconUrl = seo.faviconUrl || '/favicon.png';
    // Add cache-bust param so browser reloads favicon when admin changes it
    const faviconHref = faviconUrl.startsWith('data:')
      ? faviconUrl
      : `${faviconUrl}${faviconUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

    // 2. Favicon & Apple Touch Icon
    setLinkTag('icon', faviconHref);
    setLinkTag('apple-touch-icon', faviconHref);

    // 3. Standard Meta Tags
    setMetaTag('name', 'description', seo.metaDescription);
    setMetaTag('name', 'keywords', seo.metaKeywords);
    setMetaTag('name', 'author', seo.author);
    setMetaTag('name', 'robots', seo.robots || 'index, follow');
    setCanonical(fullCanonical);

    // 4. OpenGraph Tags (Facebook, Zalo, LinkedIn)
    setMetaTag('property', 'og:title', seo.metaTitle);
    setMetaTag('property', 'og:description', seo.metaDescription);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'Hội Nghị Khoa Học Thẩm Mỹ Việt – Hàn 2026');
    setMetaTag('property', 'og:locale', 'vi_VN');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.metaTitle);
    setMetaTag('name', 'twitter:description', seo.metaDescription);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // 5. Google Site Verification
    if (seo.googleSiteVerification && seo.googleSiteVerification.trim() !== '') {
      setMetaTag('name', 'google-site-verification', seo.googleSiteVerification.trim());
    }

    // 6. JSON-LD Schema (MedicalEvent)
    const existingSchema = document.getElementById('seo-structured-data');
    if (seo.structuredDataEnabled !== false) {
      const performers = (cmsData.experts || []).slice(0, 8).map((exp) => ({
        '@type': 'Person',
        name: exp.name,
        jobTitle: exp.title,
        affiliation: exp.affiliation,
      }));

      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalEvent',
        name: seo.metaTitle,
        description: seo.metaDescription,
        startDate: '2026-10-17T08:00:00+07:00',
        endDate: '2026-10-18T17:30:00+07:00',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: cmsData.eventDetails.venueName || 'Bệnh viện Trung ương Quân đội 108',
          address: {
            '@type': 'PostalAddress',
            streetAddress: cmsData.eventDetails.venueAddress || 'Số 1 Trần Hưng Đạo, P. Bạch Đằng, Q. Hai Bà Trưng',
            addressLocality: 'Hà Nội',
            addressCountry: 'VN',
          },
        },
        image: [fullOgImage],
        organizer: {
          '@type': 'Organization',
          name: 'Bệnh viện Trung ương Quân đội 108 & KBIT Association',
          url: fullCanonical,
        },
        offers: {
          '@type': 'Offer',
          url: `${fullCanonical}#dang-ky-tham-du`,
          price: '0',
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
        },
        performer: performers,
      };

      if (!existingSchema) {
        const script = document.createElement('script');
        script.id = 'seo-structured-data';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaData, null, 2);
        document.head.appendChild(script);
      } else {
        existingSchema.textContent = JSON.stringify(schemaData, null, 2);
      }
    } else if (existingSchema) {
      existingSchema.remove();
    }

    // 7. Google Analytics / GTM Injection (if valid and not placeholder)
    const gaId = seo.googleAnalyticsId?.trim();
    const gaScriptId = 'seo-ga-script';
    const existingGa = document.getElementById(gaScriptId);

    if (gaId && gaId.startsWith('G-') && gaId !== 'G-XXXXXXXXXX') {
      if (!existingGa) {
        const script = document.createElement('script');
        script.id = gaScriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'seo-ga-inline';
        inlineScript.text = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(inlineScript);
      }
    } else if (existingGa) {
      existingGa.remove();
      const inline = document.getElementById('seo-ga-inline');
      if (inline) inline.remove();
    }

    // 8. Facebook Pixel (if valid)
    const pixelId = seo.facebookPixelId?.trim();
    const pixelScriptId = 'seo-fb-pixel';
    const existingPixel = document.getElementById(pixelScriptId);

    if (pixelId && pixelId !== '') {
      if (!existingPixel) {
        const script = document.createElement('script');
        script.id = pixelScriptId;
        script.text = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }
    } else if (existingPixel) {
      existingPixel.remove();
    }
  }, [seo, cmsData.eventDetails, cmsData.experts]);

  return null;
};

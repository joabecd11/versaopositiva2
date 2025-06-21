const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FacebookAdsAPI = require('./facebook-ads-api');
const facebookAds = new FacebookAdsAPI();

const app = express();
const PORT = 3001;

// Middleware CORS mais permissivo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));

// Log todas as requisições
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Criar diretório para logs
const logsDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);

// Configurações da Browser API BrightData Premium - ENDPOINT ATUALIZADO
const BRIGHTDATA_BROWSER_API = {
  endpoint: 'wss://brd-customer-hl_db110985-zone-scraping_browser1:6y5c6w1ppjoy@brd.superproxy.io:9222',
  username: 'brd-customer-hl_db110985-zone-scraping_browser1',
  password: '6y5c6w1ppjoy'
};

// Configurações do proxy BrightData
const BRIGHTDATA_PROXY = {
  server: 'http://brd.superproxy.io:33335',
  username: 'brd-customer-hl_d740c472-zone-residential_proxy1',
  password: 'q1vyhqtlx2ux'
};

// Configurações de países com mais detalhes
const COUNTRIES = {
  mexico: { 
    lat: 19.4326, 
    lng: -99.1332, 
    timezone: 'America/Mexico_City', 
    locale: 'es-MX',
    currency: 'MXN',
    acceptLanguage: 'es-MX,es;q=0.9,en;q=0.8'
  },
  usa: { 
    lat: 39.8283, 
    lng: -98.5795, 
    timezone: 'America/New_York', 
    locale: 'en-US',
    currency: 'USD',
    acceptLanguage: 'en-US,en;q=0.9'
  },
  brazil: { 
    lat: -14.2350, 
    lng: -51.9253, 
    timezone: 'America/Sao_Paulo', 
    locale: 'pt-BR',
    currency: 'BRL',
    acceptLanguage: 'pt-BR,pt;q=0.9,en;q=0.8'
  },
  france: { 
    lat: 46.6034, 
    lng: 1.8883, 
    timezone: 'Europe/Paris', 
    locale: 'fr-FR',
    currency: 'EUR',
    acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8'
  },
  germany: { 
    lat: 51.1657, 
    lng: 10.4515, 
    timezone: 'Europe/Berlin', 
    locale: 'de-DE',
    currency: 'EUR',
    acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8'
  },
  uk: { 
    lat: 55.3781, 
    lng: -3.4360, 
    timezone: 'Europe/London', 
    locale: 'en-GB',
    currency: 'GBP',
    acceptLanguage: 'en-GB,en;q=0.9'
  },
  canada: { 
    lat: 56.1304, 
    lng: -106.3468, 
    timezone: 'America/Toronto', 
    locale: 'en-CA',
    currency: 'CAD',
    acceptLanguage: 'en-CA,en;q=0.9,fr;q=0.8'
  }
};

// User Agents mais realistas e atualizados
const USER_AGENTS = {
  iphone: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    platform: 'iPhone',
    hardwareConcurrency: 6,
    maxTouchPoints: 5
  },
  android: {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
    platform: 'Linux armv8l',
    hardwareConcurrency: 8,
    maxTouchPoints: 5
  },
  desktop: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    platform: 'Win32',
    hardwareConcurrency: 8,
    maxTouchPoints: 0
  }
};

// Configurações de idiomas
const LANGUAGES = {
  spanish: { code: 'es', locale: 'es-ES', languages: ['es-ES', 'es', 'en'] },
  english: { code: 'en', locale: 'en-US', languages: ['en-US', 'en'] },
  french: { code: 'fr', locale: 'fr-FR', languages: ['fr-FR', 'fr', 'en'] },
  german: { code: 'de', locale: 'de-DE', languages: ['de-DE', 'de', 'en'] },
  portuguese: { code: 'pt', locale: 'pt-BR', languages: ['pt-BR', 'pt', 'en'] }
};

// Configurações de referers
const REFERERS = {
  facebook: {
    referer: 'https://www.facebook.com/',
    domain: 'facebook.com',
    secFetchSite: 'cross-site'
  },
  google: {
    referer: 'https://www.google.com/',
    domain: 'google.com',
    secFetchSite: 'cross-site'
  },
  instagram: {
    referer: 'https://www.instagram.com/',
    domain: 'instagram.com',
    secFetchSite: 'cross-site'
  },
  tiktok: {
    referer: 'https://www.tiktok.com/',
    domain: 'tiktok.com',
    secFetchSite: 'cross-site'
  },
  youtube: {
    referer: 'https://www.youtube.com/',
    domain: 'youtube.com',
    secFetchSite: 'cross-site'
  }
};

// Base de dados de campanhas reais para simulação mais precisa
const REAL_CAMPAIGN_PATTERNS = {
  facebook: {
    // Padrões reais de campanhas do Facebook
    campaignNames: [
      'Traffic_Campaign_2024', 'Conversions_BF2024', 'Lead_Gen_Q4',
      'Retargeting_Dec2024', 'Lookalike_Audience_Test', 'Interest_Targeting_01'
    ],
    adsetNames: [
      'Adset_Interests_25-45', 'Lookalike_1pct_Purchasers', 'Retargeting_30days',
      'Custom_Audience_Email', 'Broad_Targeting_Auto', 'Similar_Competitors'
    ],
    adNames: [
      'Creative_Video_01', 'Static_Image_Test', 'Carousel_Products',
      'Collection_Showcase', 'Dynamic_Product_Ad', 'Lead_Form_Ad'
    ],
    placements: [
      'facebook_feeds', 'instagram_stories', 'audience_network',
      'messenger_inbox', 'instagram_reels', 'facebook_marketplace'
    ]
  },
  google: {
    campaignNames: [
      'Search_Campaign_Brand', 'Shopping_Products_Q4', 'Display_Remarketing',
      'Performance_Max_All', 'YouTube_Video_Campaign', 'App_Install_Campaign'
    ],
    adGroupNames: [
      'Brand_Keywords', 'Product_Categories', 'Competitor_Terms',
      'Long_Tail_Keywords', 'Dynamic_Search_Ads', 'Remarketing_Lists'
    ]
  },
  tiktok: {
    campaignNames: [
      'TikTok_Traffic_2024', 'Conversion_Campaign_App', 'Lead_Generation_Form',
      'Reach_Campaign_Awareness', 'Video_Views_Engagement'
    ],
    adGroupNames: [
      'Interest_Targeting_18-35', 'Custom_Audience_Lookalike', 'Behavioral_Targeting',
      'Device_Targeting_Mobile', 'Geographic_Targeting_Tier1'
    ]
  }
};

// Função para gerar timestamps realistas (últimos 30 dias)
function generateRealisticTimestamp() {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
  return Math.floor(randomTime / 1000);
}

// Função para gerar IDs únicos mais realistas
function generateRealisticId(type = 'general', length = 15) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const numbers = '0123456789';
  
  switch (type) {
    case 'facebook_id':
      // Facebook IDs são normalmente numéricos longos
      return Array.from({length: 15}, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    
    case 'google_id':
      // Google IDs são alfanuméricos
      return Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('') +
             Array.from({length: 5}, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    
    case 'click_id':
      // Click IDs geralmente são alfanuméricos com padrão específico
      return 'IwAR' + Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    default:
      return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}

// Função melhorada para gerar parâmetros de Facebook/Meta mais realistas
function generateAdvancedFacebookParams() {
  const campaign = REAL_CAMPAIGN_PATTERNS.facebook;
  
  return {
    // Parâmetros principais do Facebook
    fbclid: generateRealisticId('click_id'),
    
    // Parâmetros TWR (muito usados em cloakers)
    cwr: ['fb', 'facebook', 'meta'][Math.floor(Math.random() * 3)],
    cname: campaign.campaignNames[Math.floor(Math.random() * campaign.campaignNames.length)],
    domain: 'facebook.com',
    placement: campaign.placements[Math.floor(Math.random() * campaign.placements.length)],
    adset: campaign.adsetNames[Math.floor(Math.random() * campaign.adsetNames.length)],
    adname: campaign.adNames[Math.floor(Math.random() * campaign.adNames.length)],
    site: 'facebook',
    
    // IDs realistas
    campaign_id: generateRealisticId('facebook_id'),
    adset_id: generateRealisticId('facebook_id'),
    ad_id: generateRealisticId('facebook_id'),
    
    // Parâmetros de targeting
    xid: generateRealisticId('general', 12),
    
    // Informações de timestamp
    ts: generateRealisticTimestamp(),
    
    // Parâmetros adicionais comuns
    fb_source: ['ads', 'organic', 'page'][Math.floor(Math.random() * 3)],
    fb_ref: ['page_cta', 'photo', 'post', 'story'][Math.floor(Math.random() * 4)],
    
    // UTM padrões para Facebook
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: campaign.campaignNames[Math.floor(Math.random() * campaign.campaignNames.length)].toLowerCase(),
    utm_content: campaign.adNames[Math.floor(Math.random() * campaign.adNames.length)].toLowerCase(),
    utm_term: campaign.placements[Math.floor(Math.random() * campaign.placements.length)]
  };
}

// Função melhorada para gerar parâmetros do Google Ads
function generateAdvancedGoogleParams() {
  const campaign = REAL_CAMPAIGN_PATTERNS.google;
  
  return {
    // Click ID do Google
    gclid: generateRealisticId('google_id'),
    
    // IDs de campanha realistas
    campaign_id: generateRealisticId('facebook_id'),
    adgroup_id: generateRealisticId('facebook_id'),
    
    // Parâmetros UTM
    utm_source: 'google',
    utm_medium: ['cpc', 'display', 'shopping', 'video'][Math.floor(Math.random() * 4)],
    utm_campaign: campaign.campaignNames[Math.floor(Math.random() * campaign.campaignNames.length)].toLowerCase(),
    utm_term: ['brand+keywords', 'product+name', 'competitor+terms'][Math.floor(Math.random() * 3)],
    utm_content: campaign.adGroupNames[Math.floor(Math.random() * campaign.adGroupNames.length)].toLowerCase(),
    
    // Parâmetros específicos do Google
    keyword: ['product+keywords', 'brand+terms', 'category+search'][Math.floor(Math.random() * 3)],
    matchtype: ['e', 'p', 'b'][Math.floor(Math.random() * 3)], // exact, phrase, broad
    network: ['g', 'd', 's'][Math.floor(Math.random() * 3)], // google, display, search partners
    device: ['c', 'm', 't'][Math.floor(Math.random() * 3)], // computer, mobile, tablet
    
    // Timestamp
    ts: generateRealisticTimestamp()
  };
}

// Função melhorada para gerar parâmetros do TikTok
function generateAdvancedTikTokParams() {
  const campaign = REAL_CAMPAIGN_PATTERNS.tiktok;
  
  return {
    // Click ID do TikTok
    ttclid: generateRealisticId('general', 16),
    
    // Parâmetros específicos do TikTok
    tt_source: 'tiktok_ads',
    tt_medium: ['video', 'image', 'spark_ad'][Math.floor(Math.random() * 3)],
    tt_campaign: campaign.campaignNames[Math.floor(Math.random() * campaign.campaignNames.length)].toLowerCase(),
    tt_adgroup: campaign.adGroupNames[Math.floor(Math.random() * campaign.adGroupNames.length)].toLowerCase(),
    
    // IDs de campanha
    campaign_id: generateRealisticId('facebook_id'),
    adgroup_id: generateRealisticId('facebook_id'),
    
    // UTM padrões
    utm_source: 'tiktok',
    utm_medium: 'social',
    utm_campaign: campaign.campaignNames[Math.floor(Math.random() * campaign.campaignNames.length)].toLowerCase(),
    
    // Timestamp
    ts: generateRealisticTimestamp(),
    
    // Parâmetros de targeting específicos
    targeting_type: ['interest', 'behavior', 'lookalike', 'custom'][Math.floor(Math.random() * 4)],
    age_range: ['18-24', '25-34', '35-44', '45-54'][Math.floor(Math.random() * 4)],
    placement: ['for_you', 'video_feed', 'pangle'][Math.floor(Math.random() * 3)]
  };
}

// Função para gerar parâmetros nativos/push
function generateNativeParams() {
  return {
    // Parâmetros comuns de redes nativas
    source: ['native', 'push', 'pop', 'display'][Math.floor(Math.random() * 4)],
    campaign: 'native_campaign_' + generateRealisticId('general', 8),
    creative: 'creative_' + generateRealisticId('general', 6),
    publisher: 'pub_' + generateRealisticId('facebook_id', 10),
    
    // Click tracking
    click_id: generateRealisticId('click_id'),
    subid: generateRealisticId('general', 8),
    
    // Informações de geo e device
    geo: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'BR', 'MX'][Math.floor(Math.random() * 8)],
    device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
    os: ['android', 'ios', 'windows', 'macos'][Math.floor(Math.random() * 4)],
    
    // Timestamp
    ts: generateRealisticTimestamp()
  };
}

// Função principal melhorada para gerar URLs com parâmetros fake mais realistas
function generateAdvancedCloakerUrls(baseUrl, maxVariations = 5) {
  console.log('🔧 Gerando URLs avançadas para bypass de cloaker...');
  
  const urls = [baseUrl]; // URL original sempre primeiro
  
  try {
    // Variação 1: Facebook/Meta com parâmetros TWR realistas
    const facebookUrl = new URL(baseUrl);
    const fbParams = generateAdvancedFacebookParams();
    Object.entries(fbParams).forEach(([key, value]) => {
      facebookUrl.searchParams.set(key, value.toString());
    });
    urls.push(facebookUrl.toString());
    
    // Variação 2: Google Ads com parâmetros completos
    if (urls.length <= maxVariations) {
      const googleUrl = new URL(baseUrl);
      const googleParams = generateAdvancedGoogleParams();
      Object.entries(googleParams).forEach(([key, value]) => {
        googleUrl.searchParams.set(key, value.toString());
      });
      urls.push(googleUrl.toString());
    }
    
    // Variação 3: TikTok Ads
    if (urls.length <= maxVariations) {
      const tiktokUrl = new URL(baseUrl);
      const tiktokParams = generateAdvancedTikTokParams();
      Object.entries(tiktokParams).forEach(([key, value]) => {
        tiktokUrl.searchParams.set(key, value.toString());
      });
      urls.push(tiktokUrl.toString());
    }
    
    // Variação 4: Mix Facebook + Google (comum em campanhas multi-plataforma)
    if (urls.length <= maxVariations) {
      const mixUrl = new URL(baseUrl);
      const fbParams = generateAdvancedFacebookParams();
      const googleParams = generateAdvancedGoogleParams();
      
      // Adicionar alguns parâmetros de cada
      mixUrl.searchParams.set('fbclid', fbParams.fbclid);
      mixUrl.searchParams.set('gclid', googleParams.gclid);
      mixUrl.searchParams.set('utm_source', 'facebook');
      mixUrl.searchParams.set('utm_medium', 'cpc');
      mixUrl.searchParams.set('cwr', fbParams.cwr);
      mixUrl.searchParams.set('campaign_id', fbParams.campaign_id);
      
      urls.push(mixUrl.toString());
    }
    
    // Variação 5: Tráfego nativo/push
    if (urls.length <= maxVariations) {
      const nativeUrl = new URL(baseUrl);
      const nativeParams = generateNativeParams();
      Object.entries(nativeParams).forEach(([key, value]) => {
        nativeUrl.searchParams.set(key, value.toString());
      });
      urls.push(nativeUrl.toString());
    }
    
    console.log(`✅ Geradas ${urls.length} variações avançadas de URL`);
    
  } catch (error) {
    console.log('⚠️ Erro ao gerar URLs avançadas:', error.message);
  }
  
  return urls.slice(0, maxVariations + 1);
}

// Função para detectar tipo de página (offer vs safe)
function detectPageType(content, url, title) {
  console.log('🔍 Analisando tipo de página...');
  
  let score = 0;
  const analysis = {
    offerIndicators: [],
    safeIndicators: [],
    suspiciousElements: []
  };

  // Indicadores de OFFER PAGE (página real)
  const offerKeywords = [
    'comprar', 'buy', 'order', 'checkout', 'payment', 'precio', 'price', 'desconto', 'discount',
    'oferta', 'offer', 'limited time', 'act now', 'expires', 'bonus', 'free shipping',
    'garantia', 'guarantee', 'money back', 'risk free', 'trial', 'teste gratis'
  ];

  const offerElements = [
    'form[action*="checkout"]', 'form[action*="order"]', 'form[action*="payment"]',
    '.price', '.buy-button', '.checkout', '.order-now', '.add-to-cart',
    'input[name*="email"]', 'input[name*="phone"]', 'input[name*="name"]'
  ];

  // Indicadores de SAFE PAGE (página de segurança)
  const safeKeywords = [
    'error', 'not found', '404', 'access denied', 'forbidden', 'maintenance',
    'coming soon', 'under construction', 'temporarily unavailable',
    'blog', 'article', 'news', 'about us', 'contact', 'privacy policy'
  ];

  const safeElements = [
    '.error', '.404', '.maintenance', '.coming-soon',
    'nav', 'menu', '.blog', '.article', '.news'
  ];

  // Análise do conteúdo textual
  const lowerContent = content.toLowerCase();
  
  offerKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      score += 2;
      analysis.offerIndicators.push(`Keyword: ${keyword}`);
    }
  });

  safeKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      score -= 3;
      analysis.safeIndicators.push(`Keyword: ${keyword}`);
    }
  });

  // Análise de elementos HTML (simulada - seria feita no navegador)
  offerElements.forEach(selector => {
    if (lowerContent.includes(selector.replace(/[\[\]\.#]/g, ''))) {
      score += 3;
      analysis.offerIndicators.push(`Element: ${selector}`);
    }
  });

  safeElements.forEach(selector => {
    if (lowerContent.includes(selector.replace(/[\[\]\.#]/g, ''))) {
      score -= 2;
      analysis.safeIndicators.push(`Element: ${selector}`);
    }
  });

  // Análise de URL
  if (url.includes('offer') || url.includes('lander') || url.includes('promo')) {
    score += 3;
    analysis.offerIndicators.push('URL contains offer-related terms');
  }

  if (url.includes('error') || url.includes('404') || url.includes('safe')) {
    score -= 4;
    analysis.safeIndicators.push('URL contains safe page terms');
  }

  // Análise do título
  if (title && title.length > 0) {
    const lowerTitle = title.toLowerCase();
    if (offerKeywords.some(kw => lowerTitle.includes(kw))) {
      score += 2;
      analysis.offerIndicators.push('Title contains offer keywords');
    }
    if (safeKeywords.some(kw => lowerTitle.includes(kw))) {
      score -= 2;
      analysis.safeIndicators.push('Title contains safe keywords');
    }
  }

  // Análise de tamanho de conteúdo
  if (content.length > 5000) {
    score += 1;
    analysis.offerIndicators.push('Rich content (likely offer page)');
  } else if (content.length < 1000) {
    score -= 1;
    analysis.safeIndicators.push('Minimal content (likely safe page)');
  }

  // Determinar tipo de página
  let pageType = 'unknown';
  let confidence = 'low';

  if (score >= 3) {
    pageType = 'offer';
    confidence = score >= 6 ? 'high' : 'medium';
  } else if (score <= -3) {
    pageType = 'safe';
    confidence = score <= -6 ? 'high' : 'medium';
  }

  console.log(`📊 Análise da página: Score=${score}, Tipo=${pageType}, Confiança=${confidence}`);

  return {
    type: pageType,
    confidence,
    score,
    analysis
  };
}

// Função para gerar URLs usando parâmetros capturados
function generateUrlsFromCaptured(baseUrl, savedParams, maxVariations = 3) {
  console.log('🔧 Gerando URLs com parâmetros capturados...');
  
  const urls = [baseUrl];
  
  try {
    // Usar parâmetros reais capturados
    savedParams.slice(0, maxVariations).forEach((paramSet, index) => {
      const newUrl = new URL(baseUrl);
      
      // Aplicar parâmetros categorizados
      Object.entries(paramSet.categorized.facebook).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
      
      Object.entries(paramSet.categorized.google).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
      
      Object.entries(paramSet.categorized.generic).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
      
      Object.entries(paramSet.categorized.custom).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
      
      urls.push(newUrl.toString());
    });
    
    // Se não temos parâmetros suficientes, usar geração avançada
    while (urls.length <= maxVariations) {
      const fallbackUrls = generateAdvancedCloakerUrls(baseUrl, 1);
      if (fallbackUrls[1]) urls.push(fallbackUrls[1]);
      break;
    }
    
  } catch (error) {
    console.log('⚠️ Erro ao gerar URLs com parâmetros capturados:', error.message);
  }
  
  return urls.slice(0, maxVariations + 1);
}

// Base de dados de parâmetros capturados
let capturedParams = [];

// Função para extrair parâmetros de uma URL
function extractUrlParameters(url) {
  console.log('🔍 Extraindo parâmetros da URL:', url);
  
  try {
    const urlObj = new URL(url);
    const params = {};
    
    // Extrair todos os parâmetros
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // Categorizar parâmetros conhecidos
    const categorized = {
      facebook: {},
      google: {},
      tiktok: {},
      generic: {},
      custom: {}
    };
    
    // Parâmetros do Facebook/Meta
    const fbParams = ['fbclid', 'fb_source', 'fb_ref', 'cwr', 'cname', 'domain', 'placement', 'adset', 'adname', 'site', 'xid'];
    fbParams.forEach(param => {
      if (params[param]) categorized.facebook[param] = params[param];
    });
    
    // Parâmetros do Google
    const googleParams = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    googleParams.forEach(param => {
      if (params[param]) categorized.google[param] = params[param];
    });
    
    // Parâmetros do TikTok
    const tiktokParams = ['ttclid', 'tt_source', 'tt_medium', 'tt_campaign'];
    tiktokParams.forEach(param => {
      if (params[param]) categorized.tiktok[param] = params[param];
    });
    
    // Parâmetros genéricos UTM
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => {
      if (params[param] && !categorized.google[param]) {
        categorized.generic[param] = params[param];
      }
    });
    
    // Outros parâmetros customizados
    Object.keys(params).forEach(key => {
      const isKnown = [...fbParams, ...googleParams, ...tiktokParams, ...utmParams].includes(key);
      if (!isKnown) {
        categorized.custom[key] = params[key];
      }
    });
    
    return {
      url,
      extractedAt: new Date().toISOString(),
      allParams: params,
      categorized,
      paramCount: Object.keys(params).length
    };
    
  } catch (error) {
    console.log('❌ Erro ao extrair parâmetros:', error.message);
    return null;
  }
}

// Função para testar conexão com BrightData
async function testBrightDataConnection() {
  console.log('🔍 Testando conexão com BrightData...');
  console.log(`🌐 Endpoint: ${BRIGHTDATA_BROWSER_API.endpoint}`);
  
  let browser;
  
  try {
    const connectTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na conexão com BrightData após 15 segundos')), 15000)
    );
    
    console.log('⏳ Iniciando conexão...');
    const connectPromise = chromium.connectOverCDP(BRIGHTDATA_BROWSER_API.endpoint);
    browser = await Promise.race([connectPromise, connectTimeout]);
    
    console.log('✅ Conexão com BrightData estabelecida com sucesso');
    
    // Testar se consegue criar uma página
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log('✅ Página de teste criada com sucesso');
    await context.close();
    
    await browser.close();
    console.log('✅ Teste de conexão completo');
    return { success: true, message: 'Conectado com sucesso' };
    
  } catch (error) {
    console.error('❌ Erro detalhado na conexão com BrightData:');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   Endpoint:', BRIGHTDATA_BROWSER_API.endpoint);
    
    if (browser) {
      try { await browser.close(); } catch (e) { console.log('Erro no cleanup:', e.message); }
    }
    
    return { 
      success: false, 
      message: error.message,
      details: {
        endpoint: BRIGHTDATA_BROWSER_API.endpoint,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Health check endpoint melhorado
app.get('/health', async (req, res) => {
  console.log('🔍 Health check solicitado');
  
  try {
    const brightDataTest = await testBrightDataConnection();
    
    const healthData = {
      status: brightDataTest.success ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      port: PORT,
      brightData: {
        connected: brightDataTest.success,
        endpoint: BRIGHTDATA_BROWSER_API.endpoint,
        status: brightDataTest.success ? 'Conectado' : 'Falha na conexão',
        message: brightDataTest.message,
        details: brightDataTest.details || null
      },
      features: ['Domain Unlocking', 'CAPTCHA Solver', 'Custom Headers & Cookies', 'Cloaker Detection', 'Advanced Fake Traffic Simulation'],
      cors: 'enabled',
      memoryUsage: process.memoryUsage(),
      fakeTrafficFeatures: ['Real Campaign Patterns', 'Advanced Parameter Generation', 'Multi-Platform Simulation', 'Realistic Timestamps', 'Industry-Standard IDs']
    };
    
    const statusCode = brightDataTest.success ? 200 : 503;
    console.log(`${brightDataTest.success ? '✅' : '⚠️'} Health check concluído:`, brightDataTest.success ? 'Tudo OK' : 'Problemas detectados');
    
    res.status(statusCode).json(healthData);
  } catch (error) {
    console.error('❌ Erro crítico no health check:', error.message);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      brightData: {
        connected: false,
        endpoint: BRIGHTDATA_BROWSER_API.endpoint,
        status: 'Erro crítico na conexão'
      }
    });
  }
});

// Função simplificada para simular comportamento humano
async function simulateHumanBehavior(page) {
  console.log('🤖 Simulando comportamento humano...');
  
  try {
    // Aguardar carregamento inicial
    await page.waitForTimeout(2000);
    
    // Movimento básico do mouse
    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);
    await page.mouse.move(200, 200);
    await page.waitForTimeout(500);
    
    // Scroll simples
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1000);
    
    console.log('✅ Comportamento humano simulado');
  } catch (e) {
    console.log('⚠️ Erro na simulação, continuando...');
  }
}

// Função para capturar dados básicos
async function captureBasicData(page, sessionId) {
  console.log('📊 Capturando dados...');
  
  try {
    const currentUrl = page.url();
    let title = 'N/A';
    
    try {
      title = await page.title();
    } catch (e) {
      console.log('⚠️ Não foi possível capturar título');
    }
    
    let htmlContent = '';
    try {
      htmlContent = await page.content();
    } catch (e) {
      htmlContent = '<html><body>Erro ao capturar conteúdo</body></html>';
    }
    
    // Screenshot com timeout maior e tratamento de erro melhorado
    try {
      console.log('📸 Tentando capturar screenshot...');
      const screenshotPath = path.join(logsDir, `screenshot_${sessionId}.png`);
      
      // Aguardar um pouco para garantir que a página carregou
      await page.waitForTimeout(2000);
      
      // Capturar screenshot com configurações otimizadas
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false,
        timeout: 10000,
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 1280,
          height: 720
        }
      });
      
      // Verificar se o arquivo foi criado
      try {
        await fs.access(screenshotPath);
        console.log('📸 Screenshot capturado e salvo com sucesso:', screenshotPath);
      } catch (accessError) {
        console.log('❌ Screenshot não foi salvo corretamente');
      }
      
    } catch (screenshotError) {
      console.log('⚠️ Erro ao capturar screenshot:', screenshotError.message);
      
      // Tentar uma captura mais simples como fallback
      try {
        console.log('📸 Tentando captura de screenshot alternativa...');
        const fallbackPath = path.join(logsDir, `screenshot_${sessionId}.png`);
        await page.screenshot({ 
          path: fallbackPath,
          timeout: 5000
        });
        console.log('📸 Screenshot alternativo capturado');
      } catch (fallbackError) {
        console.log('❌ Falha total na captura de screenshot:', fallbackError.message);
      }
    }
    
    return {
      url: currentUrl,
      title,
      htmlContent,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log('⚠️ Erro ao capturar dados:', error.message);
    return {
      url: 'unknown',
      title: 'N/A',
      htmlContent: '<html><body>Erro na captura</body></html>',
      timestamp: new Date().toISOString()
    };
  }
}

// Função para injetar scripts básicos anti-detecção
async function injectBasicAntiDetection(page) {
  console.log('🛡️ Injetando proteções básicas...');
  
  await page.addInitScript(() => {
    // Remover webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    
    // Limpar traces de automação
    delete navigator.__driver_evaluate;
    delete navigator.__webdriver_evaluate;
    delete navigator.__selenium_evaluate;
    delete navigator.__playwright;
    
    // Configurar plugins básicos
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        {
          name: 'Chrome PDF Plugin',
          filename: 'internal-pdf-viewer',
          description: 'Portable Document Format'
        }
      ],
    });
  });
}

// Função para análise de uma URL específica
async function analyzeUrl(browser, url, config, sessionId) {
  console.log(`🚀 Analisando URL: ${url}`);
  
  const countryConfig = COUNTRIES[config.country];
  const userAgentConfig = USER_AGENTS[config.userAgent];
  const languageConfig = LANGUAGES[config.language];
  const refererConfig = REFERERS[config.referer];
  
  const context = await browser.newContext({
    userAgent: userAgentConfig.userAgent,
    viewport: userAgentConfig.viewport,
    locale: countryConfig.locale,
    timezoneId: countryConfig.timezone,
    geolocation: { 
      latitude: countryConfig.lat, 
      longitude: countryConfig.lng 
    },
    permissions: ['geolocation'],
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': countryConfig.acceptLanguage,
      'Referer': refererConfig.referer
    }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);
  
  await injectBasicAntiDetection(page);
  
  const redirectChain = [];
  const responseDetails = [];
  
  page.on('response', response => {
    try {
      responseDetails.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
      
      // Detectar redirecionamentos
      if ([301, 302, 303, 307, 308].includes(response.status())) {
        const location = response.headers().location;
        if (location) {
          redirectChain.push({
            from: response.url(),
            to: location,
            status: response.status(),
            timestamp: new Date().toISOString()
          });
          console.log(`📍 Redirecionamento detectado: ${response.status()} de ${response.url()} para ${location}`);
        }
      }
    } catch (e) {
      // Ignorar erros de monitoramento
    }
  });
  
  // Monitorar mudanças de URL da página
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log(`🔄 Navegação detectada para: ${frame.url()}`);
    }
  });
  
  let loadSuccess = false;
  let pageData = {
    url: 'unknown',
    title: 'N/A',
    htmlContent: '<html><body>Erro na captura</body></html>',
    timestamp: new Date().toISOString()
  };
  
  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    loadSuccess = true;
    await page.waitForTimeout(3000);
    await simulateHumanBehavior(page);
    
    // Capturar dados incluindo screenshot
    pageData = await captureBasicData(page, sessionId);
    
  } catch (error) {
    console.log(`⚠️ Erro ao carregar ${url}:`, error.message);
  }
  
  await context.close();
  
  // Analisar tipo de página
  const pageTypeAnalysis = detectPageType(pageData.htmlContent, pageData.url, pageData.title);
  
  return {
    url,
    finalUrl: pageData.url,
    title: pageData.title,
    redirectChain,
    responseDetails: responseDetails.slice(0, 5), // Limitar para evitar logs muito grandes
    loadSuccess,
    pageTypeAnalysis,
    htmlContent: pageData.htmlContent
  };
}

// Função para interceptar redirecionamentos de URLs brutas
async function interceptRedirects(browser, rawUrl, sessionId) {
  console.log(`🔍 Interceptando redirecionamentos para URL bruta: ${rawUrl}`);
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);
  
  const redirectChain = [];
  const responseDetails = [];
  let finalUrl = rawUrl;
  
  // Monitorar todas as respostas e redirecionamentos
  page.on('response', response => {
    try {
      const responseUrl = response.url();
      const status = response.status();
      
      responseDetails.push({
        url: responseUrl,
        status: status,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(Object.entries(response.headers()))
      });
      
      // Detectar redirecionamentos
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers().location;
        if (location) {
          redirectChain.push({
            from: responseUrl,
            to: location,
            status: status,
            timestamp: new Date().toISOString()
          });
          console.log(`📍 Redirecionamento detectado: ${status} de ${responseUrl} para ${location}`);
        }
      }
    } catch (e) {
      console.log('⚠️ Erro no monitoramento de resposta:', e.message);
    }
  });
  
  // Monitorar mudanças de URL da página
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      finalUrl = frame.url();
      console.log(`🔄 Navegação detectada para: ${finalUrl}`);
    }
  });
  
  try {
    console.log(`🚀 Navegando para URL bruta: ${rawUrl}`);
    
    // Navegar para a URL bruta
    await page.goto(rawUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    // Aguardar possíveis redirecionamentos adicionais
    await page.waitForTimeout(3000);
    
    // Capturar URL final
    finalUrl = page.url();
    
    console.log(`✅ Interceptação concluída. URL final: ${finalUrl}`);
    console.log(`📊 Total de redirecionamentos: ${redirectChain.length}`);
    
    // Tentar extrair a URL intermediária (antes do redirecionamento final)
    let intermediateUrl = null;
    if (redirectChain.length > 0) {
      // Pegar a última URL antes do redirecionamento final
      const lastRedirect = redirectChain[redirectChain.length - 1];
      intermediateUrl = lastRedirect.from;
      console.log(`🎯 URL intermediária detectada: ${intermediateUrl}`);
    }
    
    await context.close();
    
    return {
      originalUrl: rawUrl,
      finalUrl: finalUrl,
      intermediateUrl: intermediateUrl,
      redirectChain: redirectChain,
      responseDetails: responseDetails,
      totalRedirects: redirectChain.length,
      interceptSuccess: true
    };
    
  } catch (error) {
    console.log(`❌ Erro na interceptação: ${error.message}`);
    await context.close();
    
    return {
      originalUrl: rawUrl,
      finalUrl: rawUrl,
      intermediateUrl: null,
      redirectChain: redirectChain,
      responseDetails: responseDetails,
      totalRedirects: redirectChain.length,
      interceptSuccess: false,
      error: error.message
    };
  }
}

// Rota para salvar parâmetros capturados
app.post('/capture-params', async (req, res) => {
  const { url, description } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }
  
  console.log('📥 Capturando parâmetros de:', url);
  
  const extracted = extractUrlParameters(url);
  
  if (!extracted) {
    return res.status(400).json({ error: 'Erro ao extrair parâmetros da URL' });
  }
  
  // Adicionar descrição e ID único
  extracted.id = uuidv4();
  extracted.description = description || `Capturado em ${new Date().toLocaleString()}`;
  
  // Salvar na base de dados
  capturedParams.unshift(extracted);
  
  // Limitar a 50 parâmetros salvos
  if (capturedParams.length > 50) {
    capturedParams = capturedParams.slice(0, 50);
  }
  
  // Salvar em arquivo
  try {
    await fs.writeJSON(path.join(logsDir, 'captured_params.json'), capturedParams, { spaces: 2 });
  } catch (error) {
    console.log('⚠️ Erro ao salvar parâmetros em arquivo:', error.message);
  }
  
  console.log('✅ Parâmetros capturados e salvos:', extracted.paramCount, 'parâmetros');
  
  res.json({
    success: true,
    extracted,
    totalSaved: capturedParams.length
  });
});

// Rota para listar parâmetros capturados
app.get('/captured-params', async (req, res) => {
  try {
    // Tentar carregar de arquivo se não há nada em memória
    if (capturedParams.length === 0) {
      try {
        const saved = await fs.readJSON(path.join(logsDir, 'captured_params.json'));
        capturedParams = saved || [];
      } catch (e) {
        // Arquivo não existe ainda
      }
    }
    
    res.json({
      params: capturedParams,
      count: capturedParams.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar parâmetros capturados' });
  }
});

// Rota para deletar parâmetros capturados
app.delete('/captured-params/:id', async (req, res) => {
  const { id } = req.params;
  
  capturedParams = capturedParams.filter(p => p.id !== id);
  
  try {
    await fs.writeJSON(path.join(logsDir, 'captured_params.json'), capturedParams, { spaces: 2 });
  } catch (error) {
    console.log('⚠️ Erro ao salvar após deletar:', error.message);
  }
  
  res.json({ success: true, remaining: capturedParams.length });
});

// Rota principal atualizada para suportar URLs brutas
app.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 === NOVA ANÁLISE INICIADA ===');
  console.log('📊 Timestamp:', new Date().toISOString());
  
  const { url, config = {}, useCapturedParams = true } = req.body;
  
  if (!url) {
    console.log('❌ URL não fornecida');
    return res.status(400).json({ error: 'URL é obrigatória' });
  }
  
  console.log('🎯 URL para análise:', url);
  console.log('⚙️ Configurações:', JSON.stringify(config, null, 2));
  console.log('🔄 Usar parâmetros capturados:', useCapturedParams);
  console.log('🔗 URL bruta da biblioteca de anúncios:', config.isRawUrl || false);
  
  const country = config.country || 'mexico';
  const userAgentType = config.userAgent || 'iphone';
  const language = config.language || 'spanish';
  const refererType = config.referer || 'facebook';
  const isRawUrl = config.isRawUrl || false;
  
  const sessionId = uuidv4();
  console.log('🆔 Session ID:', sessionId);
  
  let browser;
  const ANALYSIS_TIMEOUT = 60000; // Aumentar timeout para URLs brutas
  
  try {
    console.log('🔍 Etapa 1: Testando conexão inicial com BrightData...');
    const connectionTest = await testBrightDataConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Falha na conexão inicial:', connectionTest.message);
      return res.status(503).json({ 
        error: 'Falha na conexão com BrightData',
        details: connectionTest.message,
        sessionId,
        brightDataDetails: connectionTest.details,
        suggestion: 'Verifique se as credenciais BrightData estão corretas e se o serviço está ativo'
      });
    }
    
    console.log('✅ Etapa 1 concluída: Conexão testada com sucesso');
    
    console.log('🌐 Etapa 2: Conectando à Browser API para análise...');
    const connectPromise = chromium.connectOverCDP(BRIGHTDATA_BROWSER_API.endpoint);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na conexão para análise')), ANALYSIS_TIMEOUT)
    );
    
    browser = await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Etapa 2 concluída: Conectado à Browser API');
    
    let targetUrl = url;
    let redirectInterception = null;
    
    // Se for URL bruta, primeiro interceptar os redirecionamentos
    if (isRawUrl) {
      console.log('🔗 Etapa 2.5: Interceptando redirecionamentos da URL bruta...');
      redirectInterception = await interceptRedirects(browser, url, sessionId);
      
      if (redirectInterception.interceptSuccess) {
        // Usar a URL intermediária se disponível, senão usar a final
        targetUrl = redirectInterception.intermediateUrl || redirectInterception.finalUrl;
        console.log(`🎯 URL alvo para análise: ${targetUrl}`);
      } else {
        console.log('⚠️ Falha na interceptação, usando URL original');
        targetUrl = url;
      }
    }
    
    // Carregar parâmetros capturados se solicitado
    let urlsToTest = [];
    if (useCapturedParams && capturedParams.length === 0) {
      try {
        const saved = await fs.readJSON(path.join(logsDir, 'captured_params.json'));
        capturedParams = saved || [];
      } catch (e) {
        console.log('⚠️ Nenhum parâmetro capturado encontrado, usando geração avançada');
      }
    }
    
    console.log('🔧 Etapa 3: Gerando variações de URL...');
    if (useCapturedParams && capturedParams.length > 0) {
      console.log(`📦 Usando ${capturedParams.length} conjuntos de parâmetros capturados`);
      urlsToTest = generateUrlsFromCaptured(targetUrl, capturedParams, 3);
    } else {
      console.log('🔧 Usando geração de parâmetros avançada');
      urlsToTest = generateAdvancedCloakerUrls(targetUrl, 3);
    }
    
    console.log('🔧 URLs geradas:', urlsToTest.length);
    urlsToTest.forEach((testUrl, idx) => {
      console.log(`   ${idx + 1}. ${testUrl.substring(0, 100)}${testUrl.length > 100 ? '...' : ''}`);
    });
    
    const results = [];
    let bestResult = null;
    let highestScore = -100;
    
    console.log('🧪 Etapa 4: Iniciando testes das URLs...');
    
    for (let i = 0; i < urlsToTest.length; i++) {
      const testUrl = urlsToTest[i];
      console.log(`🧪 Testando URL ${i + 1}/${urlsToTest.length}`);
      
      try {
        const result = await analyzeUrl(browser, testUrl, {
          country, userAgent: userAgentType, language, referer: refererType
        }, sessionId);
        
        console.log(`✅ Teste ${i + 1} concluído:`, {
          success: result.loadSuccess,
          pageType: result.pageTypeAnalysis?.type,
          score: result.pageTypeAnalysis?.score
        });
        
        results.push({
          attempt: i + 1,
          originalUrl: testUrl,
          ...result
        });
        
        if (result.pageTypeAnalysis.score > highestScore) {
          highestScore = result.pageTypeAnalysis.score;
          bestResult = result;
          console.log(`🏆 Novo melhor resultado encontrado com score: ${highestScore}`);
        }
        
        if (result.pageTypeAnalysis.type === 'offer' && result.pageTypeAnalysis.confidence === 'high') {
          console.log('🎯 Offer page detectada com alta confiança! Parando análise.');
          break;
        }
        
      } catch (error) {
        console.log(`❌ Erro no teste ${i + 1}:`, error.message);
        results.push({
          attempt: i + 1,
          originalUrl: testUrl,
          error: error.message,
          loadSuccess: false
        });
      }
    }
    
    console.log('✅ Etapa 4 concluída: Todos os testes finalizados');
    
    const finalResult = bestResult || results[0];
    
    if (!finalResult) {
      throw new Error('Nenhum resultado válido obtido de todas as tentativas');
    }
    
    console.log('📊 Etapa 5: Preparando resultado final...');
    
    const analysisResult = {
      sessionId,
      originalUrl: url,
      finalUrl: finalResult.finalUrl,
      pageTitle: finalResult.title,
      redirectChain: finalResult.redirectChain || [],
      responseDetails: finalResult.responseDetails || [],
      
      // Informações de interceptação de URL bruta
      rawUrlInterception: redirectInterception ? {
        isRawUrl: isRawUrl,
        originalRawUrl: url,
        finalUrlFromIntercept: redirectInterception.finalUrl,
        intermediateUrl: redirectInterception.intermediateUrl,
        redirectChain: redirectInterception.redirectChain,
        totalRedirects: redirectInterception.totalRedirects,
        interceptSuccess: redirectInterception.interceptSuccess,
        targetUrlUsed: targetUrl
      } : null,
      
      simulationConfig: {
        country: COUNTRIES[country],
        userAgent: USER_AGENTS[userAgentType],
        language: LANGUAGES[language],
        referer: REFERERS[refererType],
        loadSuccess: finalResult.loadSuccess
      },
      cloakerAnalysis: {
        urlsAttempted: urlsToTest.length,
        successfulAttempts: results.filter(r => r.loadSuccess).length,
        bestScore: highestScore,
        pageType: finalResult.pageTypeAnalysis?.type || 'unknown',
        confidence: finalResult.pageTypeAnalysis?.confidence || 'low',
        detectedOfferPage: finalResult.pageTypeAnalysis?.type === 'offer',
        detectedSafePage: finalResult.pageTypeAnalysis?.type === 'safe',
        analysis: finalResult.pageTypeAnalysis?.analysis || {},
        usedCapturedParams: useCapturedParams && capturedParams.length > 0,
        capturedParamsCount: capturedParams.length,
        usedAdvancedSimulation: !useCapturedParams || capturedParams.length === 0,
        usedRawUrlIntercept: isRawUrl,
        allAttempts: results.map(r => ({
          attempt: r.attempt,
          url: r.originalUrl?.substring(0, 100) + '...',
          success: r.loadSuccess,
          pageType: r.pageTypeAnalysis?.type || 'unknown',
          score: r.pageTypeAnalysis?.score || 0
        }))
      },
      analysis: {
        redirected: finalResult.finalUrl !== targetUrl,
        redirectCount: finalResult.redirectChain?.length || 0,
        finalDomain: finalResult.finalUrl !== 'unknown' ? new URL(finalResult.finalUrl).hostname : 'unknown',
        originalDomain: new URL(url).hostname,
        targetDomain: targetUrl !== 'unknown' ? new URL(targetUrl).hostname : 'unknown',
        cloakingDetected: finalResult.finalUrl !== targetUrl && (finalResult.redirectChain?.length || 0) > 0
      },
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };
    
    console.log('💾 Etapa 6: Salvando logs...');
    
    const logData = {
      ...analysisResult,
      htmlContent: finalResult.htmlContent,
      allResults: results
    };
    
    try {
      await fs.writeJSON(path.join(logsDir, `analysis_${sessionId}.json`), logData, { spaces: 2 });
      await fs.writeFile(path.join(logsDir, `page_${sessionId}.html`), finalResult.htmlContent || '');
      console.log('💾 Logs salvos com sucesso');
    } catch (logError) {
      console.log('⚠️ Erro ao salvar logs:', logError.message);
    }
    
    const totalTime = Date.now() - startTime;
    console.log('🎉 === ANÁLISE CONCLUÍDA COM SUCESSO ===');
    console.log(`⏱️ Tempo total: ${totalTime}ms`);
    console.log(`🆔 Session ID: ${sessionId}`);
    console.log(`📊 Tipo detectado: ${analysisResult.cloakerAnalysis.pageType} (${analysisResult.cloakerAnalysis.confidence})`);
    console.log(`🎯 URLs testadas: ${analysisResult.cloakerAnalysis.urlsAttempted}`);
    console.log(`📈 Melhor score: ${analysisResult.cloakerAnalysis.bestScore}`);
    console.log(`🔗 URL bruta interceptada: ${analysisResult.cloakerAnalysis.usedRawUrlIntercept}`);
    console.log(`🔄 Parâmetros capturados usados: ${analysisResult.cloakerAnalysis.usedCapturedParams}`);
    
    if (redirectInterception) {
      console.log(`📍 Redirecionamentos interceptados: ${redirectInterception.totalRedirects}`);
      console.log(`🎯 URL alvo final: ${targetUrl}`);
    }
    
    return res.json(analysisResult);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ === ERRO NA ANÁLISE ===');
    console.error(`⏱️ Tempo até erro: ${totalTime}ms`);
    console.error(`🆔 Session ID: ${sessionId}`);
    console.error('💥 Erro:', error.message);
    console.error('📍 Stack:', error.stack);
    
    // Erro específico de conexão
    if (error.message.includes('Timeout') || error.message.includes('conexão') || error.message.includes('connect')) {
      return res.status(503).json({ 
        error: 'Erro de conexão com BrightData',
        details: error.message,
        sessionId,
        processingTime: totalTime,
        suggestion: 'Verifique se as credenciais BrightData estão corretas e se o serviço está ativo'
      });
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message,
      sessionId,
      processingTime: totalTime,
      suggestion: 'Tente novamente em alguns instantes'
    });
    
  } finally {
    try {
      if (browser) {
        console.log('🧹 Fechando conexão do browser...');
        await browser.close();
        console.log('🧹 Browser fechado com sucesso');
      }
    } catch (e) {
      console.log('⚠️ Erro no cleanup:', e.message);
    }
  }
});

// Rota para buscar logs salvos
app.get('/logs', async (req, res) => {
  try {
    const files = await fs.readdir(logsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
    
    const logs = await Promise.all(
      jsonFiles.slice(0, 10).map(async (file) => {
        const content = await fs.readJSON(path.join(logsDir, file));
        return {
          filename: file,
          sessionId: content.sessionId,
          originalUrl: content.originalUrl,
          finalUrl: content.finalUrl,
          timestamp: content.timestamp,
          redirectCount: content.redirectChain?.length || 0,
          pageType: content.cloakerAnalysis?.pageType || 'unknown',
          isOfferPage: content.cloakerAnalysis?.detectedOfferPage || false
        };
      })
    );
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

app.get('/download/:sessionId/:type', async (req, res) => {
  const { sessionId, type } = req.params;
  
  let filename;
  let contentType;
  
  switch (type) {
    case 'json':
      filename = `analysis_${sessionId}.json`;
      contentType = 'application/json';
      break;
    case 'html':
      filename = `page_${sessionId}.html`;
      contentType = 'text/html';
      break;
    case 'screenshot':
      filename = `screenshot_${sessionId}.png`;
      contentType = 'image/png';
      break;
    default:
      return res.status(400).json({ error: 'Tipo de arquivo inválido' });
  }
  
  const filePath = path.join(logsDir, filename);
  
  try {
    await fs.access(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Rotas para gerenciamento de campanhas do Facebook Ads
app.get('/api/campaigns', (req, res) => {
  res.json(createdCampaigns);
});

app.post('/api/campaigns/create', async (req, res) => {
  try {
    const { accessToken, adAccountId, campaignName, country, budget, targetUrl, finalUrl, objective, audienceSize, autoStart } = req.body;

    console.log('Criando campanha no Facebook Ads...');
    console.log('Dados recebidos:', { campaignName, country, budget, targetUrl });

    const result = await facebookAds.createCampaign(accessToken, adAccountId, {
      campaignName,
      country,
      budget,
      targetUrl,
      finalUrl,
      objective,
      audienceSize
    });

    const campaignData = {
      id: result.campaign.id,
      name: campaignName,
      status: 'PENDING',
      country,
      budget,
      spent: 0,
      clicks: 0,
      impressions: 0,
      targetUrl,
      finalUrl,
      createdAt: new Date().toISOString(),
      adAccountId,
      accessToken, // Armazenar para futuras operações
      facebookData: {
        campaignId: result.campaign.id,
        adsetId: result.adset.id,
        adId: result.ad.id,
        creativeId: result.creative?.id
      }
    };

    createdCampaigns.unshift(campaignData);

    // Se autoStart estiver ativado, ativar a campanha
    if (autoStart) {
      setTimeout(async () => {
        await facebookAds.updateCampaignStatus(accessToken, result.campaign.id, 'ACTIVE');
        campaignData.status = 'ACTIVE';
      }, 5000); // Aguardar 5 segundos antes de ativar
    }

    console.log('Campanha criada com sucesso:', campaignData);
    res.json(campaignData);

  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({ 
      error: 'Erro ao criar campanha',
      message: error.message 
    });
  }
});

app.patch('/api/campaigns/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const campaign = createdCampaigns.find(c => c.id === id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    // Atualizar no Facebook Ads
    const success = await facebookAds.updateCampaignStatus(
      campaign.accessToken, 
      campaign.facebookData.campaignId, 
      status
    );

    if (success) {
      campaign.status = status;
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar status no Facebook' });
    }

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaignIndex = createdCampaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    const campaign = createdCampaigns[campaignIndex];

    // Pausar a campanha no Facebook antes de "deletar"
    await facebookAds.updateCampaignStatus(
      campaign.accessToken,
      campaign.facebookData.campaignId,
      'PAUSED'
    );

    // Remover da lista local
    createdCampaigns.splice(campaignIndex, 1);

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para buscar estatísticas atualizadas das campanhas
app.get('/api/campaigns/stats', async (req, res) => {
  try {
    const updatedCampaigns = await Promise.all(
      createdCampaigns.map(async (campaign) => {
        try {
          const stats = await facebookAds.getCampaignStats(
            campaign.accessToken,
            campaign.facebookData.campaignId
          );

          if (stats.data && stats.data.length > 0) {
            const latestStats = stats.data[0];
            return {
              ...campaign,
              spent: parseFloat(latestStats.spend || 0),
              clicks: parseInt(latestStats.clicks || 0),
              impressions: parseInt(latestStats.impressions || 0)
            };
          }

          return campaign;
        } catch (error) {
          console.error(`Erro ao buscar stats para campanha ${campaign.id}:`, error);
          return campaign;
        }
      })
    );

    // Atualizar a lista local com as estatísticas
    createdCampaigns = updatedCampaigns;

    res.json(updatedCampaigns);

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
});

// Handler para requisições não encontradas
app.use('*', (req, res) => {
  console.log(`❓ Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Logs salvos em: ${logsDir}`);
  console.log(`🌐 Browser API BrightData Premium: ${BRIGHTDATA_BROWSER_API.endpoint}`);
  console.log(`🛡️ Funcionalidades: Domain Unlocking, CAPTCHA Solver, Cloaker Detection`);
  console.log(`🤖 Simulação Avançada: Padrões Reais de Campanhas, IDs Realistas, Multi-Plataforma`);
  console.log(`⏰ Timeout de análise: 45 segundos`);
  console.log(`🔄 CORS habilitado para todas as origens`);
  
  // Testar conexão na inicialização
  console.log('🔄 Testando conexão inicial com BrightData...');
  testBrightDataConnection().then(result => {
    if (result.success) {
      console.log('✅ Servidor pronto para análises avançadas!');
    } else {
      console.log('⚠️ Servidor iniciado mas com problemas de conexão BrightData');
      console.log('❌ Detalhes:', result.message);
    }
  });
});

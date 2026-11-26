/* Scrib (Sketch → UI)
 * Draw on an infinite, Figma-style canvas. When you pause, the shape you drew is
 * recognised and a popover offers that component from every UI kit (or device
 * frames for a frame-shaped outline). Pick one and it replaces the sketch on the
 * canvas. Placed components and frames can be selected, edited, moved and
 * copied as React or HTML.
 */
(() => {
  'use strict';

  // =========================================================================
  // Component catalogue
  // =========================================================================
  const TYPES = {
    button:     { name: 'Button',         icon: '⬭', label: 'Continue',  size: [320, 50] },
    textfield:  { name: 'Text field',     icon: '▭', label: 'Email',     size: [320, 60] },
    search:     { name: 'Search field',   icon: '⌕', label: 'Search',    size: [320, 44] },
    chip:       { name: 'Chip',           icon: '◖', label: 'Filter',    size: [96, 34] },
    switch:     { name: 'Switch',         icon: '◑', label: '',          size: [52, 32] },
    checkbox:   { name: 'Checkbox',       icon: '☑', label: '',          size: [24, 24] },
    avatar:     { name: 'Avatar',         icon: '●', label: 'A',         size: [64, 64] },
    iconbutton: { name: 'Icon button',    icon: '⊕', label: '',          size: [52, 52] },
    media:      { name: 'Media',          icon: '▣', label: '',          size: [320, 200] },
    image:      { name: 'Image',          icon: '▨', label: '',          size: [200, 200] },
    card:       { name: 'Card',           icon: '▤', label: 'Featured',  size: [320, 280] },
    list:       { name: 'List',           icon: '☰', label: 'List item', size: [340, 200] },
    listrow:    { name: 'List row',       icon: '▬', label: 'List item', size: [340, 64] },
    navbar:     { name: 'Navigation bar', icon: '▔', label: 'Title',     size: [390, 56] },
    tabbar:     { name: 'Tab bar',        icon: '▁', label: '',          size: [390, 64] },
    title:      { name: 'Title',          icon: 'T', label: 'Welcome back', size: [300, 38] },
    body:       { name: 'Body text',      icon: '¶', label: 'A short line that explains what this is.', size: [320, 46] },
  };
  const SERIES = {
    textfield: ['Email', 'Password', 'Full name', 'Phone', 'Address'],
    button: ['Continue', 'Cancel', 'Learn more'],
    chip: ['Filter', 'Recent', 'Popular', 'Saved'],
    card: ['Featured', 'Trending', 'For you'],
  };
  const HAS_LABEL = new Set(['button', 'textfield', 'search', 'chip', 'avatar', 'card', 'list', 'listrow', 'navbar', 'title', 'body']);
  const FIXED_W = new Set(['avatar', 'iconbutton', 'switch', 'chip', 'checkbox']);

  const gen = (btn, field) => ({ checkbox: 20, button: btn, textfield: 26 + field, search: field, chip: 34, switch: 26, navbar: 56, tabbar: 64, listrow: 64, title: 38, body: 46, iconbutton: btn });
  const KITS = [
    { id: 'ios', name: 'iOS 27', style: 'Liquid Glass', tag: 'Apple', swatch: '#0088ff', margin: 20,
      h: { checkbox: 22, button: 50, textfield: 44, search: 44, chip: 34, switch: 31, navbar: 52, tabbar: 62, listrow: 60, title: 34, body: 44, iconbutton: 48 },
      names: { checkbox: 'Checkmark', button: 'Button – Liquid Glass – Text', textfield: 'Text field', search: 'Search field', chip: 'Button – Content Area', switch: 'Toggle', avatar: 'Avatar', iconbutton: 'Button – Liquid Glass – Symbol', media: 'Image well', image: 'Image well', card: 'Grouped cell', list: 'List – Inset Grouped', listrow: 'Row', navbar: 'Navigation bar – Large Title', tabbar: 'Tab Bar – iPhone', title: 'Title 1/Emphasized', body: 'Body/Regular' } },
    { id: 'm3', name: 'Material 3', style: 'Expressive', tag: 'Google', swatch: '#6750a4', margin: 16,
      h: { checkbox: 18, button: 56, textfield: 56, search: 56, chip: 32, switch: 32, navbar: 64, tabbar: 80, listrow: 72, title: 36, body: 48, iconbutton: 56 },
      names: { checkbox: 'Checkbox', button: 'Button (Round)', textfield: 'Text field – Outlined', search: 'Search bar', chip: 'Filter chip', switch: 'Switch', avatar: 'Avatar', iconbutton: 'FAB', media: 'Stacked card · media', image: 'Image', card: 'Stacked card (Filled)', list: 'List', listrow: 'List item', navbar: 'App bar (Small)', tabbar: 'Navigation bar', title: 'Headline medium', body: 'Body large' } },
    { id: 'sds', name: 'Simple Design System', style: 'Figma', tag: 'Figma', swatch: '#2c2c2c', margin: 20,
      h: { checkbox: 16, button: 40, textfield: 70, search: 40, chip: 32, switch: 24, navbar: 56, tabbar: 64, listrow: 64, title: 34, body: 44, iconbutton: 40 },
      names: { checkbox: 'Checkbox', button: 'Button (Primary)', textfield: 'Input Field', search: 'Search', chip: 'Tag', switch: 'Switch', avatar: 'Avatar', iconbutton: 'Icon Button', media: 'Image', image: 'Image', card: 'Card (Image, Stroke)', list: 'List', listrow: 'List item', navbar: 'Header', tabbar: 'Navigation', title: 'Heading', body: 'Body Base' } },
    { id: 'uber', kv: true, name: 'Uber Base', style: 'Base', tag: 'Uber', swatch: '#000000', margin: 16, h: gen(48, 48),
      names: { checkbox: 'Checkbox', button: 'Button (Primary)', textfield: 'Input', search: 'Input – Search', chip: 'Tag', switch: 'Checkbox – Toggle', avatar: 'Avatar', iconbutton: 'Button (Circle)', media: 'Image', image: 'Image', card: 'Card', list: 'List', listrow: 'ListItem', navbar: 'HeaderNavigation', tabbar: 'BottomNavigation', title: 'HeadingLarge', body: 'ParagraphMedium' } },
    { id: 'zoom', kv: true, name: 'Zoom', style: 'Zoom DS', tag: 'Zoom', swatch: '#0b5cff', margin: 20, h: gen(44, 40),
      names: { checkbox: 'Checkbox', button: 'Button (Primary)', textfield: 'Text input', search: 'Search input', chip: 'Chip', switch: 'Toggle', avatar: 'Avatar', iconbutton: 'Icon button', media: 'Thumbnail', image: 'Thumbnail', card: 'Card', list: 'List', listrow: 'List item', navbar: 'Top bar', tabbar: 'Tab bar', title: 'Heading 1', body: 'Body' } },
    { id: 'claude', kv: true, name: 'Claude', style: 'Anthropic', tag: 'Anthropic', swatch: '#d97757', margin: 20, h: gen(44, 44),
      names: { checkbox: 'Checkbox', button: 'Button (Primary)', textfield: 'Input', search: 'Search', chip: 'Pill', switch: 'Toggle', avatar: 'Avatar', iconbutton: 'Icon button', media: 'Artwork', image: 'Artwork', card: 'Card', list: 'List', listrow: 'List row', navbar: 'Header', tabbar: 'Tab bar', title: 'Heading (Serif)', body: 'Body' } },
    { id: 'shadcn', kv: true, name: 'shadcn/ui', style: 'Radix + Tailwind', tag: 'shadcn', swatch: '#18181b', margin: 20, h: gen(40, 36),
      names: { checkbox: 'Checkbox', button: 'Button', textfield: 'Label + Input', search: 'Command input', chip: 'Badge', switch: 'Switch', avatar: 'Avatar', iconbutton: 'Button (icon)', media: 'AspectRatio', image: 'AspectRatio', card: 'Card', list: 'Item group', listrow: 'Item', navbar: 'Navigation Menu', tabbar: 'Tabs', title: 'Heading h2', body: 'Muted text' } },
  ];
  const kitById = id => KITS.find(k => k.id === id);

  // Device frames, sized in points like Figma's frame presets.
  const DEVICES = [
    ['iphone-16-pro-max', 'iPhone 16 Pro Max', 'iPhone', 440, 956, 55, 'island'],
    ['iphone-16-pro', 'iPhone 16 Pro', 'iPhone', 402, 874, 55, 'island'],
    ['iphone-16-plus', 'iPhone 16 Plus', 'iPhone', 430, 932, 55, 'island'],
    ['iphone-16', 'iPhone 16', 'iPhone', 393, 852, 55, 'island'],
    ['iphone-16e', 'iPhone 16e', 'iPhone', 390, 844, 47, 'notch'],
    ['iphone-15-pro-max', 'iPhone 15 Pro Max', 'iPhone', 430, 932, 55, 'island'],
    ['iphone-15-pro', 'iPhone 15 Pro', 'iPhone', 393, 852, 55, 'island'],
    ['iphone-15', 'iPhone 15', 'iPhone', 393, 852, 55, 'island'],
    ['iphone-14-pro', 'iPhone 14 Pro', 'iPhone', 393, 852, 55, 'island'],
    ['iphone-14', 'iPhone 14', 'iPhone', 390, 844, 47, 'notch'],
    ['iphone-13-mini', 'iPhone 13 mini', 'iPhone', 375, 812, 44, 'notch'],
    ['iphone-13', 'iPhone 13 / 13 Pro', 'iPhone', 390, 844, 47, 'notch'],
    ['iphone-12-pro-max', 'iPhone 12 Pro Max', 'iPhone', 428, 926, 53, 'notch'],
    ['iphone-11-pro-max', 'iPhone 11 Pro Max', 'iPhone', 414, 896, 40, 'notch'],
    ['iphone-x', 'iPhone X / 11 Pro', 'iPhone', 375, 812, 40, 'notch'],
    ['iphone-se', 'iPhone SE (3rd gen)', 'iPhone', 375, 667, 0, 'classic'],
    ['iphone-8-plus', 'iPhone 8 Plus', 'iPhone', 414, 736, 0, 'classic'],
    ['iphone-8', 'iPhone 8', 'iPhone', 375, 667, 0, 'classic'],
    ['iphone-7-plus', 'iPhone 7 Plus', 'iPhone', 414, 736, 0, 'classic'],
    ['iphone-7', 'iPhone 7', 'iPhone', 375, 667, 0, 'classic'],
    ['pixel-9-pro-xl', 'Pixel 9 Pro XL', 'Android', 412, 921, 34, 'android'],
    ['pixel-9', 'Pixel 9', 'Android', 412, 923, 32, 'android'],
    ['pixel-8', 'Pixel 8', 'Android', 412, 915, 32, 'android'],
    ['galaxy-s24-ultra', 'Galaxy S24 Ultra', 'Android', 384, 824, 20, 'android'],
    ['galaxy-s24', 'Galaxy S24', 'Android', 360, 780, 28, 'android'],
    ['android-compact', 'Android Compact', 'Android', 412, 917, 28, 'android'],
    ['android-medium', 'Android Medium', 'Android', 700, 840, 18, 'android'],
    ['ipad-mini', 'iPad mini 8.3"', 'iPad', 744, 1133, 21, 'ipad'],
    ['ipad-air-11', 'iPad Air 11"', 'iPad', 820, 1180, 18, 'ipad'],
    ['ipad-pro-11', 'iPad Pro 11"', 'iPad', 834, 1210, 18, 'ipad'],
    ['ipad-pro-13', 'iPad Pro 13"', 'iPad', 1032, 1376, 18, 'ipad'],
    ['macbook-air', 'MacBook Air', 'Desktop', 1280, 832, 0, 'mac'],
    ['macbook-pro-14', 'MacBook Pro 14"', 'Desktop', 1512, 982, 0, 'mac'],
    ['macbook-pro-16', 'MacBook Pro 16"', 'Desktop', 1728, 1117, 0, 'mac'],
    ['desktop', 'Desktop', 'Desktop', 1440, 1024, 0, 'desktop'],
    ['desktop-hd', 'Desktop HD', 'Desktop', 1920, 1080, 0, 'desktop'],
    ['watch-ultra', 'Apple Watch Ultra 49mm', 'Watch', 205, 251, 52, 'watch'],
    ['watch-46', 'Apple Watch Series 10 46mm', 'Watch', 208, 248, 50, 'watch'],
    ['watch-42', 'Apple Watch Series 10 42mm', 'Watch', 187, 223, 44, 'watch'],
  ].map(([id, name, group, w, h, r, st]) => ({ id, name, group, w, h, r, st }));
  const DEVICE_GROUPS = ['iPhone', 'Android', 'iPad', 'Desktop', 'Watch'];
  const CHROME = { island: [54, 34], notch: [47, 34], classic: [20, 0], android: [40, 24], ipad: [24, 20], mac: [24, 0], desktop: [0, 0], watch: [28, 0], custom: [0, 0] };
  const devById = id => DEVICES.find(d => d.id === id) || { id: 'custom', name: 'Frame', group: 'Custom', r: 0, st: 'custom' };
  const chrome = o => { const [sb, home] = CHROME[devById(o.device).st] || [0, 0]; return { sb, home }; };

  // =========================================================================
  // Icons
  // =========================================================================
  const I = {
    photo: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 3.5 3.5L15 14l5 5"/></svg>`,
    shapes: s => `<svg width="${s}" height="${Math.round(s * 0.8)}" viewBox="0 0 120 96"><path d="M50 8c4-7 12-7 16 0l12 22c4 7 0 14-8 14H46c-8 0-12-7-8-14z" fill="#cac4d0"/><path d="M30 52l5 6 8-2-1 8 7 5-7 5 1 8-8-2-5 6-5-6-8 2 1-8-7-5 7-5-1-8 8 2z" fill="#cac4d0"/><rect x="64" y="52" width="40" height="40" rx="10" fill="#cac4d0" transform="rotate(4 84 72)"/></svg>`,
    search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
    plus: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    back: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
    home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>`,
    star: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>`,
    user: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>`,
    gear: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>`,
    signal: `<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`,
    wifi: `<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4C5.2.4 2.7 1.5.8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.8 6.8 0 0 0 8 4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3zM8 9.4l1.9-2a2.8 2.8 0 0 0-3.8 0z"/></svg>`,
    battery: `<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".45"/></svg>`,
    m3sys: `<svg width="52" height="14" viewBox="0 0 52 14" fill="currentColor"><path d="M8 13L0 2.5A12 12 0 0 1 16 2.5z"/><path d="M20 13L32 1v12z"/><rect x="42" y="1" width="7" height="12" rx="1.5"/></svg>`,
    check: `<svg width="70%" height="70%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    spark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"/></svg>`,
  };

  // =========================================================================
  // Rendering: components & device frames
  // =========================================================================
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function media(kit, h) {
    if (kit.id === 'm3') return `<div class="c-media">${I.shapes(Math.round(clamp(h * 0.55, 30, 120)))}</div>`;
    return `<div class="c-media">${I.photo(Math.round(clamp(h * 0.22, 20, 56)))}</div>`;
  }
  const row = (t, single) => `<div class="c-row${single ? ' single' : ''}"><span class="av"></span><div class="rt"><div class="t">${t}</div><div class="s">Supporting text</div></div><span class="chev">›</span></div>`;

  function component(kit, type, label, w, h) {
    const L = esc(label);
    switch (type) {
      case 'button': return `<button class="c-btn" type="button"><span class="c-lbl">${L || 'Button'}</span></button>`;
      case 'textfield': return `<div class="c-tf"><span class="tf-label">${L}</span><div class="c-field">${kit.id === 'ios' ? L : kit.id === 'm3' ? 'name@example.com' : 'Value'}</div></div>`;
      case 'search': return `<div class="c-search">${I.search}<span>${L}</span></div>`;
      case 'chip': return `<span class="c-chip">${L}</span>`;
      case 'switch': return `<span class="c-switch" role="switch" aria-checked="true"><i></i></span>`;
      case 'checkbox': return `<span class="c-check" role="checkbox" aria-checked="true">${I.check}</span>`;
      case 'avatar': return `<div class="c-avatar" style="font-size:${Math.round(w * 0.4)}px">${esc((label || 'A').slice(0, 1).toUpperCase())}</div>`;
      case 'iconbutton': return `<div class="c-iconbtn">${I.plus}</div>`;
      case 'media': case 'image': return media(kit, h);
      case 'card': {
        const txtH = kit.id === 'sds' ? 110 : 84;
        return `<div class="c-card">${h > txtH + 60 ? media(kit, h - txtH) : ''}<div class="c-card-body"><div class="c-card-title">${L}</div><div class="c-card-text">A short line that explains what this is.</div></div></div>`;
      }
      case 'list': return `<div class="c-list">${Array.from({ length: Math.max(2, Math.floor(h / kit.h.listrow)) }, (_, i) => row(`${L} ${i + 1}`)).join('')}</div>`;
      case 'listrow': return row(L, true);
      case 'navbar': {
        const lead = kit.id === 'sds' ? '<i></i>' : kit.kv ? I.back : I.menu;
        return `<div class="c-nav"><span class="nav-lead">${lead}</span><span class="c-nav-title">${L}</span><span class="nav-trail">${kit.id === 'sds' ? I.menu : '<i></i>'}</span></div>`;
      }
      case 'tabbar': {
        const tabs = [['Home', I.home], ['Saved', I.star], ['Profile', I.user], ['Settings', I.gear]];
        return `<div class="c-tabs">${tabs.map(([t, ic], i) => `<span class="c-tab${i === 0 ? ' on' : ''}">${kit.id === 'm3' ? `<span class="pill">${ic}</span>` : ic}${t}</span>`).join('')}</div>`;
      }
      case 'title': return `<h2 class="c-title">${L}</h2>`;
      case 'body': return `<p class="c-body">${L}</p>`;
    }
    return '';
  }

  /** A placed component. dx/dy offset the position (for nesting/export). */
  function compHTML(o, dx = 0, dy = 0, exp = false) {
    if (o.kind === 'asset') return `<div class="el asset"${exp ? '' : ` data-oid="${o.id}"`} style="left:${Math.round(o.x - dx)}px;top:${Math.round(o.y - dy)}px;width:${Math.round(o.w)}px;height:${Math.round(o.h)}px"><img src="${esc(o.src)}" alt="${esc(o.name || '')}" draggable="false" style="display:block;width:100%;height:100%"></div>`;
    const kit = kitById(o.kit) || KITS[0];
    return `<div class="el kit-scope ${kit.kv ? 'kv ' : ''}k-${kit.id}"${exp ? '' : ` data-oid="${o.id}"`} style="left:${Math.round(o.x - dx)}px;top:${Math.round(o.y - dy)}px;width:${Math.round(o.w)}px;height:${Math.round(o.h)}px">${component(kit, o.type, o.label, o.w, o.h)}</div>`;
  }

  function deviceChrome(dev, w) {
    const icons = `${I.signal}${I.wifi}${I.battery}`;
    const padL = Math.round(w * 0.13), padR = Math.round(w * 0.09);
    switch (dev.st) {
      case 'island': return [`<div class="dsb" style="height:54px;padding:0 ${padR}px 0 ${padL}px"><span>9:41</span><span class="ic">${icons}</span></div><span class="d-island"></span>`, '<span class="d-hi"></span>'];
      case 'notch': return [`<div class="dsb" style="height:47px;padding:0 ${padR}px 0 ${padL}px"><span>9:41</span><span class="ic">${icons}</span></div><span class="d-notch"></span>`, '<span class="d-hi"></span>'];
      case 'classic': return [`<div class="dsb dsb-classic"><span class="ic">${I.signal}${I.wifi}</span><span>9:41 AM</span><span class="ic">100% ${I.battery}</span></div>`, ''];
      case 'android': return [`<div class="dsb dsb-android"><span>9:30</span><span class="ic">${I.m3sys}</span></div><span class="d-punch"></span>`, '<span class="d-gesture"></span>'];
      case 'ipad': return [`<div class="dsb dsb-ipad"><span>9:41 Mon Jun 10</span><span class="ic">${I.wifi}100% ${I.battery}</span></div>`, '<span class="d-hi"></span>'];
      case 'mac': return [`<div class="dsb dsb-mac"><b>Finder</b><span>File</span><span>Edit</span><span>View</span><span>Window</span><span class="r">Mon Jun 10 9:41 AM</span></div>`, ''];
      case 'watch': return [`<div class="dsb dsb-watch"><span>10:09</span></div>`, ''];
      default: return ['', ''];
    }
  }
  function frameHTML(o, dx = 0, dy = 0, inner = '', exp = false) {
    const dev = devById(o.device);
    const [top, bottom] = deviceChrome(dev, o.w);
    const radius = o.radius ?? dev.r;
    const fill = o.fill ? `;background:${o.fill}` : '';
    const clip = o.clip === false ? ' no-clip' : '';
    return `<div class="dev d-${dev.st}${clip}"${exp ? '' : ` data-oid="${o.id}"`} style="left:${Math.round(o.x - dx)}px;top:${Math.round(o.y - dy)}px;width:${Math.round(o.w)}px;height:${Math.round(o.h)}px;border-radius:${radius}px${fill}">${top}${inner}${bottom}</div>`;
  }
  /** A layer and everything inside it, positioned relative to (dx, dy). Frames nest their children. */
  function nodeHTML(o, dx = 0, dy = 0, exp = false) {
    if (o.kind !== 'frame') return compHTML(o, dx, dy, exp);
    return frameHTML(o, dx, dy, childrenOf(o.id).map(c => nodeHTML(c, o.x, o.y, exp)).join(''), exp);
  }

  // =========================================================================
  // State
  // =========================================================================
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), world = $('#world'), ink = $('#ink'), overlay = $('#overlay'), objectsEl = $('#objects'), ghost = $('#ghost');
  const COLORS = ['#b02a2a', '#141418', '#2b6cff', '#16a34a', '#7c3aed', '#ea580c', '#db2777', '#0891b2', '#ca8a04', '#64748b', '#ffffff', '#f43f5e'];
  const WIDTHS = [1.6, 2.6, 4.5];
  const COLOR_NAMES = { '#b02a2a': 'Red', '#141418': 'Black', '#2b6cff': 'Blue', '#16a34a': 'Green', '#7c3aed': 'Violet', '#ea580c': 'Orange', '#db2777': 'Pink', '#0891b2': 'Teal', '#ca8a04': 'Ochre', '#64748b': 'Slate', '#ffffff': 'White', '#f43f5e': 'Rose' };

  let strokes = [];        // unconverted ink: { id, pts, color, width, kept? }
  let objects = [];        // placed: { id, kind: 'frame'|'comp', x, y, w, h, device? , kit?, type?, label? }
  let nextId = 1;
  let groups = [];         // recognised sketch groups (derived)
  let view = { x: 0, y: 0, z: 1 };
  let tool = 'pen';
  let penColor = COLORS[0], penWidth = WIDTHS[1];
  let selS = new Set(), selO = new Set();
  let showDetect = true;
  let hoverO = null;
  let spaceDown = false;
  let drag = null, marquee = null;
  let codeFormat = 'react';
  let modalRoots = [];
  let pop = null;          // { key, type, tab, idx, virtual? }
  let lastStrokeId = null, idleTimer = null;
  let lastPointer = null; // world position of the pointer, for pasting
  const enabled = new Set(KITS.map(k => k.id));
  const history = [], future = [];

  // Live mode plugs in here (set up near the end of the file).
  const liveHooks = { seq: () => 0, touch: null, cursor: null, view: null, restored: null, strokeDone: null, busy: null };
  const snapshot = () => JSON.stringify({ strokes, objects, nextId, lseq: liveHooks.seq() });
  function restore(s) {
    const d = JSON.parse(s); strokes = d.strokes; objects = d.objects; nextId = Math.max(nextId, d.nextId);
    if (liveHooks.restored) liveHooks.restored(d);
  }
  function commit(prev) { history.push(prev); if (history.length > 200) history.shift(); future.length = 0; }
  function undo() { if (!history.length) return; future.push(snapshot()); restore(history.pop()); clearSel(); closePop(); update(); }
  function redo() { if (!future.length) return; history.push(snapshot()); restore(future.pop()); clearSel(); closePop(); update(); }
  const clearSel = () => { selS = new Set(); selO = new Set(); };
  const objById = id => objects.find(o => o.id === id);
  const frames = () => objects.filter(o => o.kind === 'frame');
  const comps = () => objects.filter(o => o.kind !== 'frame'); // components and pasted image/vector layers

  // ---- Layer tree: every object may live inside a frame (o.parent = frame id) ----
  const parentOf = o => (o && o.parent != null ? objById(o.parent) || null : null);
  const childrenOf = id => objects.filter(o => o.parent === id);
  function descendantsOf(id, acc = []) {
    for (const c of childrenOf(id)) { acc.push(c); if (c.kind === 'frame') descendantsOf(c.id, acc); }
    return acc;
  }
  const isDescendant = (o, ancestorId) => { for (let p = parentOf(o); p; p = parentOf(p)) if (p.id === ancestorId) return true; return false; };
  const depthOf = o => { let d = 0; for (let p = parentOf(o); p; p = parentOf(p)) d++; return d; };
  const roots = () => objects.filter(o => !parentOf(o));
  const topFrames = () => frames().filter(f => !parentOf(f));
  const frameName = f => f.name || devById(f.device).name;
  /** Is (x, y) visible through every clipping frame above o? */
  function visibleAt(o, x, y) {
    for (let p = parentOf(o); p; p = parentOf(p)) if (p.clip !== false && !inside(p, x, y)) return false;
    return true;
  }
  /** Deepest visible frame under a point (the one a dropped layer would go into). */
  function frameAt(x, y, exclude = null) {
    let best = null, bd = -1;
    for (const f of frames()) {
      if (exclude && exclude.has(f.id)) continue;
      if (!inside(f, x, y) || !visibleAt(f, x, y)) continue;
      const d = depthOf(f);
      if (d > bd || (d === bd && area(f) < area(best))) { best = f; bd = d; }
    }
    return best;
  }
  /** Render order (back to front): each parent before its children, siblings in array order. */
  function renderOrder() {
    const out = [];
    const walk = list => { for (const o of list) { out.push(o); if (o.kind === 'frame') walk(childrenOf(o.id)); } };
    walk(roots());
    return out;
  }
  /** Repair the tree: drop links to missing frames, break cycles, and give legacy layers a parent. */
  function normalizeTree() {
    for (const o of objects) {
      if (o.parent == null) { o.parent = null; continue; }
      const p = objById(o.parent);
      if (!p || p.kind !== 'frame' || p.id === o.id) o.parent = null;
    }
    for (const o of objects) {
      const seen = new Set([o.id]);
      for (let p = parentOf(o); p; p = parentOf(p)) { if (seen.has(p.id)) { o.parent = null; break; } seen.add(p.id); }
    }
  }
  /** Old canvases had no parent links: adopt each layer into the smallest frame that contains its centre. */
  function migrateParents(list = objects) {
    for (const o of list) {
      if ('parent' in o) continue;
      const host = list.filter(f => f.kind === 'frame' && f !== o && area(f) > area(o) && inside(f, o.x + o.w / 2, o.y + o.h / 2))
        .sort((a, b) => area(a) - area(b))[0];
      o.parent = host ? host.id : null;
    }
  }

  // =========================================================================
  // Geometry
  // =========================================================================
  function roundness(p, x, y, w, h) {
    // How far the outline stays from the bounding-box corners: circle ≈ 0.15, box ≈ 0.02–0.05.
    const diag = Math.hypot(w, h); let sum = 0;
    for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      let m = Infinity;
      for (const q of p) { const v = Math.hypot(q[0] - cx, q[1] - cy); if (v < m) m = v; }
      sum += m;
    }
    return sum / 4 / diag;
  }
  const infoCache = new WeakMap();
  function info(s) {
    const hit = infoCache.get(s.pts);
    if (hit && hit.n === s.pts.length && hit.x0 === s.pts[0][0] && hit.y0 === s.pts[0][1]) return { ...hit.v, id: s.id };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, a = 0, len = 0;
    const p = s.pts, n = p.length;
    for (let i = 0; i < n; i++) {
      const [x, y] = p[i];
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      const [nx, ny] = p[(i + 1) % n];
      a += x * ny - nx * y;
      if (i) len += Math.hypot(x - p[i - 1][0], y - p[i - 1][1]);
    }
    const w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY), diag = Math.hypot(w, h);
    const d = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);
    const chord = d(p[0], p[n - 1]);
    // Closed when the pen comes back near where it started, overshoots included.
    const k = Math.max(2, Math.floor(n * 0.2));
    let back = chord;
    for (let i = 0; i < k && i < n; i++) back = Math.min(back, d(p[n - 1], p[i]), d(p[0], p[n - 1 - i]));
    const goesAround = n > 8 && len > diag * 1.5;
    const closed = goesAround && (back < Math.max(20, diag * 0.2) || chord < Math.max(28, diag * 0.3));
    const v = {
      id: s.id, x: minX, y: minY, w, h, diag, cx: minX + w / 2, cy: minY + h / 2, closed,
      fill: Math.abs(a / 2) / (w * h), len, straight: chord / (len || 1), p0: p[0], p1: p[n - 1],
      round: closed ? roundness(p, minX, minY, w, h) : 0,
    };
    infoCache.set(s.pts, { n, x0: p[0][0], y0: p[0][1], v });
    return { ...v };
  }
  const isShape = i => i.closed && i.diag >= 22;
  const area = r => r.w * r.h;
  const contains = (o, i) => i.x >= o.x - 4 && i.y >= o.y - 4 && i.x + i.w <= o.x + o.w + 4 && i.y + i.h <= o.y + o.h + 4;
  const inside = (o, x, y) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h;
  const centerIn = (f, o) => inside(f, o.x + o.w / 2, o.y + o.h / 2);
  const union = (a, b) => {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    const w = Math.max(a.x + a.w, b.x + b.w) - x, h = Math.max(a.y + a.h, b.y + b.h) - y;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  };
  const near = (a, b, pad) => a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h;
  const intersects = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const bbox = rs => rs.reduce((u, r) => (u ? union(u, r) : { ...r }), null);

  function cluster(list, pad) {
    const out = [];
    for (const it of list) {
      const c = out.find(c => near(c.box, it, pad));
      if (c) { c.box = union(c.box, it); c.items.push(it); } else out.push({ box: { ...it }, items: [it] });
    }
    for (let i = 0; i < out.length; i++) for (let j = out.length - 1; j > i; j--) {
      if (near(out[i].box, out[j].box, pad)) { out[i].box = union(out[i].box, out[j].box); out[i].items.push(...out[j].items); out.splice(j, 1); }
    }
    return out;
  }

  // =========================================================================
  // Recognition: unconverted strokes → groups, each one component (or a frame)
  // =========================================================================
  const hostFrame = r => frameAt(r.x + r.w / 2, r.y + r.h / 2);

  const big = u => Math.max(u.w, u.h);
  const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);

  /** Join open strokes whose ends meet (a box drawn as 2–4 separate lines) into one closed shape. */
  function mergeStrokes(units) {
    const segs = units.filter(u => !u.closed && u.len >= 40 && u.straight > 0.55);
    const tol = (a, b) => clamp(0.2 * Math.min(a.len, b.len), 14, 40);
    const meets = (e, s, o) => dist(e, o.p0) < tol(s, o) || dist(e, o.p1) < tol(s, o);
    const parent = segs.map((_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
      if (meets(segs[i].p0, segs[i], segs[j]) || meets(segs[i].p1, segs[i], segs[j])) parent[find(i)] = find(j);
    }
    const sets = {};
    segs.forEach((s, i) => (sets[find(i)] ||= []).push(s));
    const used = new Set(), out = [];
    for (const list of Object.values(sets)) {
      if (list.length < 2) continue;
      // A closed outline: every stroke end touches the end of another stroke.
      if (!list.every(s => [s.p0, s.p1].every(e => list.some(o => o !== s && meets(e, s, o))))) continue;
      const src = list.map(s => strokes.find(x => x.id === s.id).pts);
      let pts = [...src[0]];
      const rest = src.slice(1);
      while (rest.length) {
        const end = pts[pts.length - 1];
        let bi = 0, rev = false, bd = Infinity;
        rest.forEach((r, i) => { const a = dist(end, r[0]), b = dist(end, r[r.length - 1]); if (a < bd) { bd = a; bi = i; rev = false; } if (b < bd) { bd = b; bi = i; rev = true; } });
        const r = rest.splice(bi, 1)[0];
        pts = pts.concat(rev ? [...r].reverse() : r);
      }
      const u = info({ id: Math.min(...list.map(s => s.id)), pts });
      u.closed = true;
      u.round = roundness(pts, u.x, u.y, u.w, u.h);
      u.ids = list.flatMap(s => s.ids);
      list.forEach(s => used.add(s));
      out.push(u);
    }
    return units.filter(u => !used.has(u)).concat(out);
  }

  /** Group handwriting into words / lines: horizontally close, vertically aligned. */
  function clusterText(list) {
    const out = [];
    for (const it of [...list].sort((a, b) => a.x - b.x)) {
      const c = out.find(c => {
        const hh = Math.max(c.box.h, it.h);
        const gap = Math.max(it.x - (c.box.x + c.box.w), c.box.x - (it.x + it.w));
        return gap < Math.max(18, hh * 1.3) && Math.abs(it.cy - c.box.cy) < Math.max(12, hh * 0.65);
      });
      if (c) { c.box = union(c.box, it); c.items.push(it); } else out.push({ box: { ...it }, items: [it] });
    }
    for (let i = 0; i < out.length; i++) for (let j = out.length - 1; j > i; j--) {
      const a = out[i].box, b = out[j].box, hh = Math.max(a.h, b.h);
      if (near(a, b, 0) || (Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w)) < hh && Math.abs(a.cy - b.cy) < hh * 0.5)) {
        out[i].box = union(a, b); out[i].items.push(...out[j].items); out.splice(j, 1);
      }
    }
    return out;
  }

  const isBoxy = c => c.round < 0.07 && c.fill > 0.72 && c.h / c.w > 0.7 && c.h / c.w < 1.4;

  function computeGroups() {
    let units = strokes.filter(s => !s.kept).map(s => ({ ...info(s), ids: [s.id] }));
    units = mergeStrokes(units);
    let cands = units.filter(isShape);

    // Frames: big outlines that are not already inside a placed frame.
    const frameLike = s => !hostFrame(s) && ((s.h >= 240 && s.h / s.w >= 1.2) || (s.w >= 420 && s.h >= 240) || (s.h >= 150 && s.h / s.w > 1.05 && units.some(o => o !== s && contains(s, o) && big(o) > 30)));
    const frameSet = new Set(cands.filter(frameLike));

    // 1. Handwriting: loops in letters (o, a, B, d…) are closed too, but they are writing, not shapes.
    const demoted = new Set();
    for (const c of cands) {
      if (frameSet.has(c)) continue;
      const host = cands.filter(h => h !== c && !frameSet.has(h) && contains(h, c) && area(h) > area(c) * 2.5).sort((a, b) => area(a) - area(b))[0];
      if (host) {
        // Small things inside a box are its content (letters, a knob, an avatar dot), not a separate shape.
        if (c.w < host.w * 0.4 && (c.h < host.h * 0.72 || c.round > 0.08)) demoted.add(c);
        continue;
      }
      if (big(c) < 90 && !isBoxy(c)) {
        const neighbours = units.filter(o => o !== c && big(o) < 120 && o.h / c.h > 0.55 && o.h / c.h < 1.8
          && Math.abs(o.cy - c.cy) < Math.max(c.h, o.h) * 0.6
          && Math.max(o.x - (c.x + c.w), c.x - (o.x + o.w)) < Math.max(c.h, o.h) * 1.2);
        if (neighbours.length >= 2 || neighbours.some(o => !o.closed && o.len > o.w * 1.4)) demoted.add(c);
      }
    }
    cands = cands.filter(c => !demoted.has(c));
    const marks = units.filter(u => !cands.includes(u));

    // 2. Frames (outermost only).
    let frameCands = cands.filter(s => frameSet.has(s));
    frameCands = frameCands.filter(f => !frameCands.some(g => g !== f && contains(g, f)));
    const out = frameCands.map(f => ({ key: f.id, kind: 'frame', rect: f, src: f, strokeIds: f.ids, ctx: null, F: null, labels: [], kids: [] }));

    // 3. Shapes and what is drawn inside them.
    const shapes = cands.filter(c => !frameCands.includes(c)).map(s => ({ id: s.id, src: s, rect: s, labels: [], kids: [], ids: s.ids }));
    const top = [];
    for (const sh of shapes) {
      const host = shapes.filter(o => o !== sh && contains(o.rect, sh.rect)).sort((a, b) => area(a.rect) - area(b.rect))[0];
      if (host) host.kids.push(sh); else top.push(sh);
    }
    const free = [];
    for (const m of marks) {
      const host = top.filter(e => inside(e.rect, m.cx, m.cy)).sort((a, b) => area(a.rect) - area(b.rect))[0];
      if (host) host.labels.push(m); else free.push(m);
    }
    const ctxFor = r => hostFrame(r) || frameCands.find(f => inside(f, r.x + r.w / 2, r.y + r.h / 2)) || null;
    const idsOf = sh => [...sh.ids, ...sh.labels.flatMap(l => l.ids), ...sh.kids.flatMap(idsOf)];
    for (const sh of top) {
      const r = sh.rect, L = sh.labels;
      const g = { key: sh.id, kind: 'shape', rect: r, src: sh.src, labels: L, kids: sh.kids, strokeIds: idsOf(sh), ctx: ctxFor(r), F: hostFrame(r) };
      g.cross = L.filter(l => l.straight > 0.8 && l.w > r.w * 0.45 && l.h > r.h * 0.45).length >= 2;      // box with an X = image
      g.knob = r.h / r.w < 0.7 && r.w < 170 && L.some(l => l.closed && l.round > 0.07 && l.h > r.h * 0.45); // pill with a dot = switch
      // Row with an avatar: a round mark on the left that is clearly bigger than the writing beside it
      // (a letter 'O' at the start of a word is the same height as its neighbours, so it doesn't count).
      const others = L.filter(l => !(l.closed && l.round > 0.07 && l.cx < r.x + r.w * 0.3));
      const textH = others.length ? others.map(l => l.h).sort((a, b) => a - b)[Math.floor(others.length / 2)] : 0;
      g.leftDot = !g.knob && L.some(l => l.closed && l.round > 0.07 && l.cx < r.x + r.w * 0.3 && (!textH || l.h >= textH * 1.6));
      g.lines = L.filter(l => l.straight > 0.85 && l.h < l.w * 0.25 && l.w > r.w * 0.3).length;            // text lines in a card
      out.push(g);
    }
    for (const c of clusterText(free)) {
      const one = c.items.length === 1 ? c.items[0] : null;
      out.push({ key: Math.min(...c.items.map(i => i.id)), kind: 'text', rect: c.box, labels: [], kids: [], strokeIds: c.items.flatMap(i => i.ids), ctx: ctxFor(c.box), F: hostFrame(c.box), line: !!(one && one.straight > 0.9 && one.h < one.w * 0.12) });
    }
    for (const g of out) g.options = g.kind === 'frame' ? ['frame', 'media', 'card'] : suggest(g);
    // The top-most piece of writing in a screen reads as its title.
    const texts = out.filter(g => g.kind === 'text').sort((a, b) => a.rect.y - b.rect.y);
    if (texts[0] && texts[0].options[0] === 'body' && !texts[0].line) {
      const t = texts[0], sameCtx = texts.filter(o => o.ctx === t.ctx);
      if (sameCtx.length > 1 || t.rect.h >= 18) t.options = ['title', 'body'];
    }
    return out.sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x);
  }

  /** Ranked component types for a sketch group, using its frame (if any) for context. */
  function suggest(g) {
    const r = g.rect, F = g.ctx, ratio = r.h / r.w;
    const relW = F ? r.w / F.w : null;
    const relTop = F ? (r.y - F.y) / F.h : null, relBot = F ? (r.y + r.h - F.y) / F.h : null;
    if (g.kind === 'text') return g.line ? ['body', 'title'] : (F ? r.h / F.h > 0.035 : r.h > 26) ? ['title', 'body'] : ['body', 'title'];
    if (g.cross) return ['image', 'media', 'card'];
    if (g.kids.length) return ['card', 'media', 'list'];
    const sq = ratio > 0.7 && ratio < 1.4;
    // Tiny shapes: hand jitter swamps the corner test, so trust fill (square ≈ .9, circle ≈ .78).
    if (sq && big(r) < 34) return g.src.fill > 0.82 ? ['checkbox', 'avatar', 'iconbutton'] : ['avatar', 'checkbox', 'iconbutton'];
    if (sq && g.src.round >= 0.07) return ['avatar', 'iconbutton', 'image'];
    if (sq && big(r) <= 56) return ['checkbox', 'iconbutton', 'avatar'];
    if (g.knob) return ['switch', 'chip', 'button'];
    const label = g.labels.length > 0;
    if (ratio <= 0.34) {
      if (F && relTop < 0.15 && relW > 0.75) return ['navbar', 'search', 'textfield'];
      if (F && relBot > 0.86 && relW > 0.75 && !label) return ['tabbar', 'button'];
      if (g.leftDot) return ['listrow', 'button', 'textfield'];
      if (F ? relW < 0.32 : r.w < 130) return label ? ['chip', 'button', 'switch'] : ['switch', 'chip', 'button'];
      return label ? ['button', 'textfield', 'search'] : ['textfield', 'button', 'search'];
    }
    if (g.leftDot) return ['listrow', 'card', 'list'];
    if (g.lines >= 2 && ratio > 0.6) return ['list', 'card', 'media'];
    if (sq) return label ? ['card', 'image', 'iconbutton'] : ['image', 'iconbutton', 'card'];
    if (F ? r.h / F.h > 0.13 : r.h > 100) return label ? ['card', 'media', 'list', 'image'] : ['media', 'card', 'list', 'image'];
    return ['listrow', 'card', 'textfield'];
  }

  function defaultLabel(type, F) {
    if (!TYPES[type]) return '';
    const s = SERIES[type];
    if (!s) return TYPES[type].label;
    const n = comps().filter(o => o.type === type && (o.parent ?? null) === (F ? F.id : null)).length;
    return s[n % s.length];
  }

  /** Where a component of `type` from `kit` lands, given the sketch rect it replaces. */
  function placement(r, type, kit, F) {
    const fixed = kit.h[type];
    let x = r.x, w = r.w, h = fixed || Math.max(r.h, 48);
    if (F) {
      const { sb, home } = chrome(F);
      if (type === 'navbar') return { x: F.x, y: F.y + sb, w: F.w, h };
      if (type === 'tabbar') return { x: F.x, y: F.y + F.h - home - h, w: F.w, h };
      const full = r.w / F.w > 0.62 || (['list', 'listrow', 'textfield', 'search', 'title', 'body', 'card', 'media'].includes(type) && r.w / F.w > 0.45);
      if (full && !FIXED_W.has(type)) { x = F.x + kit.margin; w = F.w - 2 * kit.margin; }
    }
    if (type === 'avatar') w = h = clamp(Math.min(r.w, r.h), 32, 160);
    else if (type === 'iconbutton' || type === 'checkbox') w = h = fixed;
    else if (type === 'switch') w = { ios: 51, m3: 52, sds: 40 }[kit.id] || 44;
    else if (type === 'chip') w = clamp(r.w, 64, 240);
    if (['button', 'textfield', 'search'].includes(type)) w = Math.max(w, 120);
    if (['title', 'body'].includes(type)) w = Math.max(w, 160);
    if (!F && (type === 'navbar' || type === 'tabbar')) w = Math.max(w, 360);
    if (FIXED_W.has(type)) x = r.x + r.w / 2 - w / 2;
    const y = fixed || type === 'avatar' ? r.y + r.h / 2 - h / 2 : r.y;
    return { x, y, w, h };
  }

  // =========================================================================
  // View
  // =========================================================================
  const toWorld = (cx, cy) => [(cx - view.x) / view.z, (cy - view.y) / view.z];
  const toScreen = r => ({ x: r.x * view.z + view.x, y: r.y * view.z + view.y, w: r.w * view.z, h: r.h * view.z });
  function applyView() {
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
    const g = 18 * view.z;
    stage.style.backgroundSize = `${g}px ${g}px`;
    stage.style.backgroundPosition = `${view.x}px ${view.y}px`;
    $('#zoomLabel').textContent = Math.round(view.z * 100) + '%';
    renderOverlay(); renderBadges(); positionSelbar(); positionPop(); if (thinking) renderThinking();
    if (typeof updatePenCursor === 'function') updatePenCursor();
    if (liveHooks.view) liveHooks.view();
    if (typeof save === 'function') save();
  }
  function zoomAt(f, cx, cy) {
    const z = clamp(view.z * f, 0.05, 4);
    const [wx, wy] = toWorld(cx, cy);
    view.z = z; view.x = cx - wx * z; view.y = cy - wy * z;
    applyView();
  }
  function contentBox() {
    return bbox([...strokes.map(info), ...objects]);
  }
  function zoomToFit(boxIn) {
    const box = boxIn || contentBox();
    if (!box) { view = { x: 0, y: 0, z: 1 }; return applyView(); }
    const W = innerWidth, H = innerHeight, padX = 90, padTop = 80, padBottom = 110;
    const z = clamp(Math.min((W - 2 * padX) / box.w, (H - padTop - padBottom) / box.h), 0.05, 1.5);
    view.z = z;
    view.x = (W - box.w * z) / 2 - box.x * z;
    view.y = padTop + (H - padTop - padBottom - box.h * z) / 2 - box.y * z;
    applyView();
  }
  /** Pan so a world rect is visible (used after placing big frames). */
  function ensureVisible(r) {
    const s = toScreen(r);
    if (s.x >= 20 && s.y >= 60 && s.x + s.w <= innerWidth - 20 && s.y + s.h <= innerHeight - 90) return;
    zoomToFit(union(r, bbox([r])));
  }

  // =========================================================================
  // Rendering
  // =========================================================================
  function pathD(pts) {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    if (pts.length < 2) return d + 'l0.01 0';
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const l = pts[pts.length - 1];
    return d + `L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
  }
  const pathEl = s => `<path d="${pathD(s.pts)}" stroke="${s.color}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"${s.kept ? '' : ' opacity="0.95"'}/>`;
  function renderInk() { ink.innerHTML = strokes.map(pathEl).join(''); }

  let justPlaced = null;
  function renderObjects() {
    objectsEl.innerHTML = roots().map(o => nodeHTML(o)).join('');
    if (justPlaced) { const n = objectsEl.querySelector(`[data-oid="${justPlaced}"]`); if (n) n.classList.add('placed'); justPlaced = null; }
  }

  function selectionRects() {
    return [...strokes.filter(s => selS.has(s.id)).map(info), ...objects.filter(o => selO.has(o.id))];
  }

  function renderOverlay() {
    const z = view.z, px = v => v / z;
    let out = '';
    const tag = (x, y, text, fill) => {
      const tw = px(text.length * 6.3 + 12), th = px(17);
      return `<rect x="${x}" y="${y - th - px(4)}" width="${tw}" height="${th}" rx="${px(5)}" fill="${fill}"/><text x="${x + px(6)}" y="${y - px(8.5)}" font-size="${px(11)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="600" fill="#fff">${esc(text)}</text>`;
    };
    // Frame names (Figma-style, constant on screen)
    for (const f of topFrames()) {
      const on = selO.has(f.id) || hoverO === f.id;
      out += `<text x="${f.x}" y="${f.y - px(7)}" font-size="${px(12)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="500" fill="${on ? '#2c63e8' : '#6d6658'}">${esc(frameName(f))}</text>`;
    }
    // Drop target while dragging layers (Figma highlights the frame they will land in)
    if (drag && drag.mode === 'move' && drag.moved && drag.dropTarget != null) {
      const f = objById(drag.dropTarget);
      if (f) out += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="#2c63e8" stroke-width="${px(2)}"/>`;
    }
    // Frame being drawn with the Frame tool
    if (drag && drag.mode === 'drawFrame' && drag.r) {
      const r = drag.r, t = `${Math.round(r.w)} × ${Math.round(r.h)}`;
      out += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(255,255,255,.6)" stroke="#2c63e8" stroke-width="${px(1.5)}"/>`;
      out += `<rect x="${r.x + r.w / 2 - px(t.length * 3.4 + 8)}" y="${r.y + r.h + px(8)}" width="${px(t.length * 6.8 + 16)}" height="${px(18)}" rx="${px(4)}" fill="#2c63e8"/><text x="${r.x + r.w / 2}" y="${r.y + r.h + px(21)}" text-anchor="middle" font-size="${px(11)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="600" fill="#fff">${t}</text>`;
    }
    // Sketch detection
    if (showDetect && !(drag && drag.mode === 'pen')) {
      for (const g of groups) {
        if (thinking && thinking.key === g.key) continue; // the scan animation covers it
        const r = g.rect, active = pop && pop.key === g.key, p = px(6);
        const col = active ? '#2c63e8' : 'rgba(44,99,232,.45)';
        out += `<rect x="${r.x - p}" y="${r.y - p}" width="${r.w + 2 * p}" height="${r.h + 2 * p}" rx="${px(4)}" fill="${active ? 'rgba(44,99,232,.05)' : 'none'}" stroke="${col}" stroke-width="${px(active ? 2 : 1)}" stroke-dasharray="${px(5)} ${px(4)}"/>`;
        out += tag(r.x - p, r.y - p, active ? (pop.type === 'frame' ? 'Device frame' : TYPES[pop.type].name) : g.kind === 'frame' ? 'Frame' : 'Sketch', active ? '#2c63e8' : 'rgba(44,99,232,.8)');
      }
    }
    // Hover outline
    const ho = hoverO && objById(hoverO);
    if (ho && !selO.has(ho.id)) out += `<rect x="${ho.x}" y="${ho.y}" width="${ho.w}" height="${ho.h}" fill="none" stroke="#2c63e8" stroke-width="${px(1.5)}"/>`;
    // Selection
    const rs = selectionRects();
    for (const o of objects) if (selO.has(o.id)) out += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="none" stroke="#2c63e8" stroke-width="${px(1.5)}"/>`;
    const sb = bbox(rs);
    if (sb) {
      const p = rs.length === 1 && selO.size === 1 ? 0 : px(6), x = sb.x - p, y = sb.y - p, w = sb.w + 2 * p, h = sb.h + 2 * p, hs = px(8);
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#2c63e8" stroke-width="${px(1.5)}"/>`;
 if (tool !== 'proto') for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) out += `<rect x="${hx - hs / 2}" y="${hy - hs / 2}" width="${hs}" height="${hs}" fill="#fff" stroke="#2c63e8" stroke-width="${px(1.5)}"/>`;
      if (selO.size === 1 && !selS.size && tool !== 'proto') { const o = objById([...selO][0]); const t = `${Math.round(o.w)} × ${Math.round(o.h)}`; out += `<rect x="${x + w / 2 - px(t.length * 3.4 + 8)}" y="${y + h + px(8)}" width="${px(t.length * 6.8 + 16)}" height="${px(18)}" rx="${px(4)}" fill="#2c63e8"/><text x="${x + w / 2}" y="${y + h + px(21)}" text-anchor="middle" font-size="${px(11)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="600" fill="#fff">${t}</text>`; }
    }
    for (const g of guides) out += `<line x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}" stroke="#f24822" stroke-width="${px(1)}"/>`;
    if (marquee) out += `<rect x="${marquee.x}" y="${marquee.y}" width="${marquee.w}" height="${marquee.h}" fill="rgba(44,99,232,.08)" stroke="#2c63e8" stroke-width="${px(1)}"/>`;
    out += protoOverlay(px); // arrows and state tags
    overlay.innerHTML = out;
  }

  // Badges on sketches that are waiting for a suggestion.
  const badges = $('#badges');
  function renderBadges() {
    if ((drag && drag.mode === 'pen') || !badgesReady) { badges.innerHTML = ''; return; }
    const busy = liveHooks.busy ? liveHooks.busy() : null; // strokes someone else is still drawing
    badges.innerHTML = groups.filter(g => (!pop || pop.key !== g.key) && (!thinking || thinking.key !== g.key) && !(busy && busy.size && g.strokeIds.some(id => busy.has(id)))).map(g => {
      const s = toScreen(g.rect);
      return `<button type="button" class="badge" data-key="${g.key}" style="left:${s.x + s.w}px;top:${s.y}px" title="Find the matching component" aria-label="Find component for this sketch">${I.spark}<span class="bl">${g.kind === 'frame' ? 'Find frame' : 'Find component'}</span></button>`;
    }).join('');
  }
  badges.addEventListener('click', e => { const b = e.target.closest('.badge'); if (b) { cancelThinking(); if (pop) closePop(); startThinking(Number(b.dataset.key)); } });

  // =========================================================================
  // Processing: a short, visible "recognising" step before options appear
  // =========================================================================
  function shapeDesc(g) {
    if (g.kind === 'frame') return 'frame outline';
    if (g.kind === 'text') return g.line ? 'line (text)' : 'handwritten text';
    if (g.cross) return 'box with an X (image placeholder)';
    if (g.kids.length) return 'box with shapes inside';
    const ratio = g.rect.h / g.rect.w, sq = ratio > 0.7 && ratio < 1.4;
    if (sq && big(g.rect) < 34) return g.src.fill > 0.82 ? 'small square' : 'small circle';
    if (sq && g.src.round >= 0.07) return 'circle';
    if (sq && big(g.rect) <= 56) return 'small square';
    if (g.knob) return 'pill with a knob';
    if (g.leftDot) return 'row with a circle on the left';
    if (ratio <= 0.34) return g.labels.length ? 'thin box with writing inside' : 'thin box';
    if (g.lines >= 2) return 'box with lines inside';
    return g.labels.length ? 'box with writing inside' : 'rectangle';
  }
  const IDLE_MS = 450, STEP_MS = 320;
  let thinking = null;
  let badgesReady = true;
  const thinkEl = document.createElement('div');
  thinkEl.className = 'thinking'; thinkEl.hidden = true;
  thinkEl.innerHTML = '<div class="scan"></div><div class="think-pill" role="status" aria-live="polite"><span class="spin"></span><span class="txt"></span><span class="bar"><i></i></span></div>';
  document.body.appendChild(thinkEl);

  /** Wait for a pause in drawing, so multi-stroke sketches (a box, then writing in it) are read together. */
  function scheduleBadges() { badgesReady = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { badgesReady = true; renderBadges(); }, IDLE_MS); }
  /** Runs when the user asks: recognise the sketch, show progress, then open its options. */
  function startThinking(key) {
    if (drag) return;
    if (pop) closePop();
    const g = groupByKey(key);
    if (!g) return;
    const steps = g.kind === 'frame'
      ? ['Reading your sketch', 'Detecting a frame outline', `Matching ${DEVICES.length} device frames`, 'Preparing previews']
      : ['Reading your sketch', `Recognizing a ${shapeDesc(g)}`, `Matching ${enabledKits().length} UI libraries`, 'Building options'];
    thinking = { key: g.key, steps, step: 0 };
    renderThinking(); renderBadges(); renderOverlay();
    thinking.timer = setInterval(() => {
      if (!thinking) return;
      thinking.step++;
      if (thinking.step < thinking.steps.length) return renderThinking();
      const key = thinking.key;
      cancelThinking();
      openPop(key, { reveal: true });
    }, STEP_MS);
  }
  function cancelThinking() {
    if (thinking) clearInterval(thinking.timer);
    thinking = null; thinkEl.hidden = true;
  }
  function renderThinking() {
    const g = thinking && groupByKey(thinking.key);
    if (!g) { if (thinking) cancelThinking(); return; }
    const s = toScreen(g.rect), p = 8;
    Object.assign(thinkEl.style, { left: `${s.x - p}px`, top: `${s.y - p}px`, width: `${s.w + 2 * p}px`, height: `${s.h + 2 * p}px` });
    thinkEl.querySelector('.txt').textContent = thinking.steps[thinking.step] + '…';
    thinkEl.querySelector('.bar i').style.setProperty('--p', ((thinking.step + 1) / thinking.steps.length).toFixed(3));
    thinkEl.hidden = false;
  }

  // =========================================================================
  // Suggestion popover
  // =========================================================================
  const popEl = $('#pop');
  const enabledKits = () => KITS.filter(k => enabled.has(k.id));
  const groupByKey = k => groups.find(g => g.key === k);

  function inferDeviceGroup(r) {
    // Hand-drawn phones are usually squatter than real ones (e.g. 441×614), so portrait defaults to iPhone.
    const ar = r.h / r.w;
    if (r.w > r.h * 1.15) return 'Desktop';
    if (r.h < 260 && ar < 1.4) return 'Watch';
    if (r.h >= 1000 && ar < 1.5) return 'iPad';
    return 'iPhone';
  }

  /** The thing the popover is about: a sketch group or a virtual insert (Frame / Component tools). */
  function popTarget() {
    if (!pop) return null;
    if (pop.virtual) return pop.virtual;
    return groupByKey(pop.key) || null;
  }

  function tilesFor(t) {
    if (pop.type === 'frame') {
      const list = pop.tab === 'All' ? DEVICES : DEVICES.filter(d => d.group === pop.tab);
      const tiles = list.map(d => ({ kind: 'device', dev: d })); // newest devices first
      if (!t.virtual) tiles.push({ kind: 'device', dev: { id: 'custom', name: 'Blank frame', group: 'Custom', w: Math.round(t.rect.w), h: Math.round(t.rect.h), r: 0, st: 'custom' } });
      return tiles;
    }
    return enabledKits().map(kit => ({ kind: 'comp', kit, box: placement(t.rect, pop.type, kit, t.F) }));
  }

  function tileHTML(tile, i) {
    const PW = 120, PH = 80;
    if (tile.kind === 'device') {
      const d = tile.dev, s = Math.min(PW / d.w, PH / d.h);
      const o = { x: 0, y: 0, w: d.w, h: d.h, device: d.id };
      const inner = d.id === 'custom' ? `<div class="dev d-custom" style="left:0;top:0;width:${d.w}px;height:${d.h}px"></div>` : frameHTML(o, 0, 0, '', true);
      return `<div role="button" tabindex="-1" class="tile${i === pop.idx ? ' on' : ''}" data-i="${i}" style="--i:${i}">
        <div class="tile-prev dark"><div class="pv" style="width:${d.w * s}px;height:${d.h * s}px"><div style="transform:scale(${s})">${inner}</div></div></div>
        <div class="tile-name"><span class="nm" title="${esc(d.name)}">${esc(d.name)}</span>${i < 9 ? `<span class="kbd">${i + 1}</span>` : ''}</div>
        <div class="tile-sub">${d.w} × ${d.h} · ${esc(d.group)}</div></div>`;
    }
    const { kit } = tile;
    // Preview wide components at a readable width; the placed size is still the full box.
    const box = { ...tile.box, w: FIXED_W.has(pop.type) ? tile.box.w : Math.min(tile.box.w, 200) };
    const s = Math.min(1, PW / box.w, PH / box.h);
    const o = { ...box, kit: kit.id, type: pop.type, label: pop.label };
    return `<div role="button" tabindex="-1" class="tile${i === pop.idx ? ' on' : ''}" data-i="${i}" style="--i:${i}">
      <div class="tile-prev"><div class="pv" style="width:${box.w * s}px;height:${box.h * s}px"><div style="transform:scale(${s})">${compHTML(o, box.x, box.y, true)}</div></div></div>
      <div class="tile-name"><span class="sw" style="background:${kit.swatch}"></span><span class="nm" title="${esc(kit.name)}">${esc(kit.name)}</span>${i < 9 ? `<span class="kbd">${i + 1}</span>` : ''}</div>
      <div class="tile-sub">${esc(kit.names[pop.type])}</div></div>`;
  }

  function renderPop() {
    const t = popTarget();
    if (!t) return closePop();
    const tiles = tilesFor(t);
    pop.idx = clamp(pop.idx, 0, tiles.length - 1);
    const isFrame = pop.type === 'frame';
    const typeChips = t.virtual
      ? (isFrame ? [] : Object.keys(TYPES))
      : t.options;
    const chips = typeChips.map(o => `<button type="button" class="tchip${o === pop.type ? ' on' : ''}" data-type="${o}">${o === 'frame' ? 'Device frame' : TYPES[o].name}</button>`).join('');
    const tabs = isFrame ? ['All', ...DEVICE_GROUPS].map(g => `<button type="button" class="tchip${g === pop.tab ? ' on' : ''}" data-tab="${g}">${g}</button>`).join('') : '';
    const remaining = groups.filter(g => g.key !== pop.key).length;
    const title = t.virtual ? (isFrame ? 'Add a frame' : 'Add a component') : `Looks like: ${isFrame ? 'Device frame' : TYPES[t.options[0]].name}`;
    const seen = t.virtual ? '' : `Detected a ${shapeDesc(t)} · `;
    const sub = seen + (isFrame ? `${tiles.length} devices, placed at real size` : `${tiles.length} options${t.F ? `, ${t.virtual ? 'added' : 'snapped'} into ${esc(frameName(t.F))}` : t.virtual ? ', added at the center of your view' : ', replaces your sketch'}`);
    popEl.innerHTML = `
      <div class="pop-head"><h2 class="pop-title" id="popTitle">${title}<small>${sub}</small></h2>
        ${remaining && !t.virtual ? `<button type="button" class="linkbtn" data-act="next" title="Next sketch (Tab)">Next sketch <span class="n">${remaining} left</span></button>` : ''}
        <button type="button" class="pop-x" data-act="close" aria-label="Close suggestions (Esc)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      ${chips ? `<div class="chipbar">${chips}</div>` : ''}
      ${tabs ? `<div class="chipbar">${tabs}</div>` : ''}
      <div class="tiles${pop.anim ? ' anim' : ''}" id="tiles">${tiles.map(tileHTML).join('')}</div>
      <div class="pop-foot"><span class="hint">← → choose · Enter to place · 1–9 quick pick · Esc to close</span><span class="grow"></span>
        ${t.virtual ? '' : '<button type="button" class="linkbtn" data-act="keep">Keep as sketch</button>'}</div>`;
    popEl.hidden = false;
    popEl.classList.toggle('reveal', !!pop.reveal);
    pop.anim = false; pop.reveal = false;
    positionPop(); positionSelbar(); renderInspector();
    renderGhost();
    renderOverlay(); renderBadges();
    const on = popEl.querySelector('.tile.on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function positionPop() {
    if (!pop || popEl.hidden) return;
    const t = popTarget(); if (!t) return;
    const W = popEl.offsetWidth, H = popEl.offsetHeight;
    let x, y;
    if (t.virtual) { x = (innerWidth - W) / 2; y = innerHeight - H - 84; }
    else {
      // Sit beside the whole frame (not just the sketch) so the popover never covers the screen being built.
      const host = t.F || t.ctx;
      const s = toScreen(host ? union(t.rect, host) : t.rect), g = toScreen(t.rect);
      x = s.x + s.w + 20; y = g.y - 40;
      if (x + W > innerWidth - 16) x = s.x - W - 20;
      if (x < 16) { x = clamp(s.x + s.w / 2 - W / 2, 16, innerWidth - W - 16); y = s.y + s.h + 16; if (y + H > innerHeight - 84) y = s.y - H - 16; }
    }
    const L = clamp(x, 12, innerWidth - W - 12), T = clamp(y, 64, innerHeight - H - 84);
    popEl.style.left = L + 'px';
    popEl.style.top = T + 'px';
    // Grow from the anchor's side (Emil: origin-aware popovers).
    if (t.virtual) popEl.style.transformOrigin = '50% 100%';
    else { const g = toScreen(t.rect); popEl.style.transformOrigin = `${clamp(g.x + g.w / 2 - L, 0, W)}px ${clamp(g.y + g.h / 2 - T, 0, H)}px`; }
  }

  function openPop(key, opts = {}) {
    const g = groupByKey(key); if (!g) return;
    pop = { key, type: g.options[0], tab: inferDeviceGroup(g.rect), idx: 0, anim: true, ...opts };
    pop.label = defaultLabel(pop.type, g.F);
    renderPop();
  }
  function openVirtual(kind, at = null, host = undefined) {
    const F = host !== undefined ? host : [...selO].map(objById).find(o => o && o.kind === 'frame') || null;
    const [cx, cy] = at || (F ? [F.x + F.w / 2, F.y + F.h / 2] : toWorld(innerWidth / 2, innerHeight / 2 - 60));
    const type = kind === 'frame' ? 'frame' : 'button';
    const mk = t => { const [w, h] = TYPES[t].size; return { x: cx - w / 2, y: cy - h / 2, w, h }; };
    pop = { key: null, type, tab: 'iPhone', idx: 0, label: kind === 'frame' ? '' : defaultLabel('button', F), virtual: { virtual: true, kind, rect: kind === 'frame' ? { x: cx, y: cy, w: 1, h: 2 } : mk('button'), F, center: [cx, cy], mk } };
    renderPop();
  }
  function closePop() {
    pop = null; popEl.hidden = true; ghost.innerHTML = '';
    renderOverlay(); renderBadges(); positionSelbar(); renderInspector();
  }

  function choiceRect(t, tile) {
    if (tile.kind === 'device') {
      const d = tile.dev;
      if (t.virtual) return { x: t.center[0] - d.w / 2, y: t.center[1] - d.h / 2, w: d.w, h: d.h };
      return { x: t.rect.x, y: t.rect.y, w: d.w, h: d.h };
    }
    return tile.box;
  }

  function renderGhost() {
    const t = popTarget(); if (!t) { ghost.innerHTML = ''; return; }
    const tiles = tilesFor(t), tile = tiles[pop.idx]; if (!tile) { ghost.innerHTML = ''; return; }
    const r = choiceRect(t, tile);
    if (tile.kind === 'device') {
      ghost.innerHTML = tile.dev.id === 'custom' ? `<div class="dev d-custom" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></div>` : frameHTML({ ...r, device: tile.dev.id }, 0, 0, '', true);
    } else ghost.innerHTML = compHTML({ ...r, kit: tile.kit.id, type: pop.type, label: pop.label }, 0, 0, true);
  }

  popEl.addEventListener('pointerdown', e => e.stopPropagation());
  popEl.addEventListener('mouseover', e => {
    const b = e.target.closest('.tile'); if (!b) return;
    const i = Number(b.dataset.i); if (i === pop.idx) return;
    pop.idx = i;
    popEl.querySelectorAll('.tile').forEach((n, j) => n.classList.toggle('on', j === i));
    renderGhost();
  });
  popEl.addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    if (tile) { pop.idx = Number(tile.dataset.i); return placeCurrent(); }
    const chip = e.target.closest('[data-type]');
    if (chip) {
      pop.type = chip.dataset.type; pop.idx = 0; pop.anim = true;
      const t = popTarget();
      if (t.virtual && pop.type !== 'frame') t.rect = t.mk(pop.type);
      pop.label = defaultLabel(pop.type, t.F);
      return renderPop();
    }
    const tab = e.target.closest('[data-tab]');
    if (tab) { pop.tab = tab.dataset.tab; pop.idx = 0; pop.anim = true; return renderPop(); }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') closePop();
    else if (act === 'next') nextSketch();
    else if (act === 'keep') {
      const g = popTarget(); commit(snapshot());
      for (const s of strokes) if (g.strokeIds.includes(s.id)) s.kept = true;
      closePop(); update(); toast('Kept as a sketch. Select it and press Find component any time.');
    }
  });

  function nextSketch() {
    if (!groups.length) return closePop();
    const i = groups.findIndex(g => pop && g.key === pop.key);
    openPop(groups[(i + 1) % groups.length].key);
  }

  // =========================================================================
  // Placing
  // =========================================================================
  function remap(oldR, newR, ids, objs) {
    const sx = newR.w / oldR.w, sy = newR.h / oldR.h;
    for (const s of strokes) if (ids.has(s.id)) for (const p of s.pts) { p[0] = newR.x + (p[0] - oldR.x) * sx; p[1] = newR.y + (p[1] - oldR.y) * sy; }
    for (const o of objs) {
      const cx = newR.x + (o.x + o.w / 2 - oldR.x) * sx, cy = newR.y + (o.y + o.h / 2 - oldR.y) * sy;
      if (!FIXED_W.has(o.type)) o.w *= sx;
      o.x = cx - o.w / 2; o.y = cy - o.h / 2;
    }
  }

  function placeCurrent() {
    const t = popTarget(); if (!t) return;
    const tile = tilesFor(t)[pop.idx]; if (!tile) return;
    const prev = snapshot();
    const r = choiceRect(t, tile);
    const id = nextId++;
    if (tile.kind === 'device') {
      const host = t.virtual ? (t.F || null) : frameAt(r.x + r.w / 2, r.y + r.h / 2);
      const o = { id, kind: 'frame', ...r, device: tile.dev.id, parent: host ? host.id : null, clip: true };
      if (tile.dev.id === 'custom') Object.assign(o, { name: `Frame ${frames().length + 1}`, fill: '#ffffff', radius: 0 });
      if (!t.virtual) {
        // Bring the sketch drawn inside the outline along (scaled to the real device size) and adopt its layers.
        const old = t.rect;
        const innerStrokes = new Set(strokes.filter(s => s.id !== t.key && centerIn(old, info(s))).map(s => s.id));
        const innerObjs = objects.filter(c => (c.parent ?? null) === o.parent && centerIn(old, c));
        remap(old, r, innerStrokes, [...innerObjs, ...innerObjs.flatMap(c => descendantsOf(c.id))]);
        for (const c of innerObjs) c.parent = id;
        strokes = strokes.filter(s => !t.strokeIds.includes(s.id));
      }
      objects.push(o);
      toast(`${tile.dev.name} added · ${r.w} × ${r.h}`);
    } else {
      const host = t.F || frameAt(r.x + r.w / 2, r.y + r.h / 2);
      objects.push({ id, kind: 'comp', ...r, kit: tile.kit.id, type: pop.type, label: pop.label, parent: host ? host.id : null });
      if (!t.virtual) strokes = strokes.filter(s => !t.strokeIds.includes(s.id));
    }
    commit(prev);
    justPlaced = id;
    clearSel(); selO.add(id);
    const wasKey = pop.key;
    closePop();
    update();
    if (tile.kind === 'device') ensureVisible(r);
    // Keep converting: open the next sketch, preferring ones inside the same frame.
    if (!t.virtual && groups.length) {
      const inFrame = tile.kind === 'device' ? groups.find(g => g.F && g.F.id === id) : null;
      const next = inFrame || groups.find(g => g.key !== wasKey);
      void next; // the rest wait for you: click their ✦ tag when you're ready
    }
  }

  // =========================================================================
  // Canvas input
  // =========================================================================
  function distToStroke(s, x, y) {
    let best = Infinity; const p = s.pts;
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, ay] = p[i], [bx, by] = p[i + 1];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
      const t = clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1);
      best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
    }
    return best;
  }
  /** What is under a point: a component, a stroke (its sketch group), or a frame. */
  function hitTest(x, y) {
    // Topmost visible layer first; anything clipped away by its frame can't be hit.
    const order = renderOrder();
    for (let i = order.length - 1; i >= 0; i--) {
      const o = order[i];
      if (o.kind !== 'frame' && inside(o, x, y) && visibleAt(o, x, y)) return { objs: [o.id], strokes: [] };
    }
    const tol = 8 / view.z;
    const s = [...strokes].reverse().find(s => distToStroke(s, x, y) < tol + s.width / 2);
    if (s) { const g = groups.find(g => g.strokeIds.includes(s.id)); return { objs: [], strokes: g ? g.strokeIds : [s.id] }; }
    // A top-level frame's name label
    const lab = [...topFrames()].reverse().find(o => x >= o.x && x <= o.x + Math.max(Math.min(o.w, frameName(o).length * 7.5 / view.z + 8), 40) && y >= o.y - 20 / view.z && y < o.y);
    if (lab) return { objs: [lab.id], strokes: [], frame: true, label: true };
    const f = frameAt(x, y);
    if (f) return { objs: [f.id], strokes: [], frame: true, top: !parentOf(f) };
    return null;
  }
  const selBox = () => bbox(selectionRects());

  // ---- Resize handles (one selected object) --------------------------------
  const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const CURSOR = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };
  const SQUARE = new Set(['avatar', 'checkbox', 'iconbutton']);
  const MIN_SIZE = { checkbox: 12, switch: 28, avatar: 16, iconbutton: 20, chip: 40 };
  const handlePoints = ({ x, y, w, h }) => ({ nw: [x, y], n: [x + w / 2, y], ne: [x + w, y], e: [x + w, y + h / 2], se: [x + w, y + h], s: [x + w / 2, y + h], sw: [x, y + h], w: [x, y + h / 2] });
  const resizable = () => (selO.size === 1 && !selS.size ? objById([...selO][0]) : null);
  function hitHandle(x, y) {
    const o = resizable(); if (!o || tool !== 'select') return null;
    const tol = 7 / view.z, hp = handlePoints(o);
    return HANDLES.find(k => Math.abs(x - hp[k][0]) < tol && Math.abs(y - hp[k][1]) < tol) || null;
  }

  // ---- Smart guides & snapping (Figma-style red guides) ---------------------
  let guides = [];
  function snapTargets(exclude) {
    const xs = [], ys = [];
    for (const o of objects) {
      if (exclude.has(o.id)) continue;
      xs.push(o.x, o.x + o.w / 2, o.x + o.w); ys.push(o.y, o.y + o.h / 2, o.y + o.h);
      if (o.kind === 'frame') for (const m of [16, 20]) xs.push(o.x + m, o.x + o.w - m); // common side margins
    }
    return { xs, ys };
  }
  /** Find the nearest alignment for the given edges of box b. Returns the correction and the guide lines. */
  function snap(b, exclude, ex = [0, 0.5, 1], ey = [0, 0.5, 1]) {
    const T = snapTargets(exclude), tol = 6 / view.z;
    let bx = null, by = null;
    for (const f of ex) { const v = b.x + b.w * f; for (const t of T.xs) { const d = t - v; if (Math.abs(d) < tol && (!bx || Math.abs(d) < Math.abs(bx.d))) bx = { d, at: t }; } }
    for (const f of ey) { const v = b.y + b.h * f; for (const t of T.ys) { const d = t - v; if (Math.abs(d) < tol && (!by || Math.abs(d) < Math.abs(by.d))) by = { d, at: t }; } }
    const nb = { x: b.x + (bx ? bx.d : 0), y: b.y + (by ? by.d : 0), w: b.w, h: b.h };
    const g = [];
    const others = objects.filter(o => !exclude.has(o.id));
    const hits = (o, v, axis) => (axis === 'x' ? [o.x, o.x + o.w / 2, o.x + o.w] : [o.y, o.y + o.h / 2, o.y + o.h]).some(e => Math.abs(e - v) < 0.5) || (axis === 'x' && o.kind === 'frame' && [o.x + 16, o.x + 20, o.x + o.w - 16, o.x + o.w - 20].some(e => Math.abs(e - v) < 0.5));
    if (bx) { const rel = others.filter(o => hits(o, bx.at, 'x')); const ys = [nb.y, nb.y + nb.h, ...rel.flatMap(o => [o.y, o.y + o.h])]; g.push({ x1: bx.at, y1: Math.min(...ys), x2: bx.at, y2: Math.max(...ys) }); }
    if (by) { const rel = others.filter(o => hits(o, by.at, 'y')); const xs = [nb.x, nb.x + nb.w, ...rel.flatMap(o => [o.x, o.x + o.w])]; g.push({ x1: Math.min(...xs), y1: by.at, x2: Math.max(...xs), y2: by.at }); }
    return { dx: bx ? bx.d : 0, dy: by ? by.d : 0, guides: g };
  }

  /** Objects and strokes that move together with the selection (frames carry their contents). */
  function movingSet() {
    const movS = new Set(selS), movO = new Set(selO);
    for (const id of selO) {
      const f = objById(id);
      if (f && f.kind === 'frame') {
        descendantsOf(f.id).forEach(c => movO.add(c.id));
        strokes.filter(s => centerIn(f, info(s))).forEach(s => movS.add(s.id));
      }
    }
    return { movS, movO };
  }
  /** Selected layers that aren't inside another selected layer (they carry the rest). */
  const selRoots = () => [...selO].map(objById).filter(o => o && ![...selO].some(id => id !== o.id && isDescendant(o, id)));
  /** Copy layers (with everything inside them) and remap ids and parents. Returns old id → new id. */
  function cloneLayers(list, dx = 0, dy = 0) {
    const map = new Map();
    for (const o of list) map.set(o.id, nextId++);
    for (const o of list) objects.push({ ...o, id: map.get(o.id), x: o.x + dx, y: o.y + dy, parent: map.has(o.parent) ? map.get(o.parent) : o.parent ?? null });
    return map;
  }
  /** Alt-drag: copy the selection in place and select the copies. */
  function cloneSelectionInPlace() {
    const { movS, movO } = movingSet();
    const newSelO = new Set(), newSelS = new Set();
    const map = cloneLayers(objects.filter(o => movO.has(o.id)));
    for (const id of selO) if (map.has(id)) newSelO.add(map.get(id));
    for (const s of strokes.filter(s => movS.has(s.id))) { const n = { ...s, id: nextId++, pts: s.pts.map(p => [...p]) }; strokes.push(n); if (selS.has(s.id)) newSelS.add(n.id); }
    selO = newSelO; selS = newSelS;
    renderObjects(); renderInk();
  }

  stage.addEventListener('pointerdown', e => {
    closePalette();
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    try { stage.setPointerCapture(e.pointerId); } catch {}
    if (e.button === 1 || tool === 'hand' || spaceDown) {
      drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
      stage.classList.add('panning');
      return;
    }
    if (e.button !== 0) return;
    if (tool === 'pen') {
      clearTimeout(idleTimer);
      cancelThinking();
      if (pop) closePop();
      const s = { id: nextId++, pts: [[wx, wy]], color: penColor, width: penWidth };
      const prev = snapshot();
      strokes.push(s);
      ink.insertAdjacentHTML('beforeend', pathEl(s));
      drag = { mode: 'pen', s, el: ink.lastElementChild, prev, shift: e.shiftKey };
      if (selS.size || selO.size) { clearSel(); refreshSelection(); }
      badges.innerHTML = '';
      $('#empty').classList.add('hidden');
      return;
    }
    if (pop) closePop();
    if (tool === 'proto') {
      const so = selO.size === 1 ? objById([...selO][0]) : null;
      if (so) {
        const [px0, py0] = plusPoint(so);
        if (Math.hypot(wx - px0, wy - py0) < 11 / view.z) {
          drag = { mode: 'wire', src: so, x: wx, y: wy, target: null, prev: snapshot() };
          renderOverlay(); return;
        }
      }
      const w = wireAt(wx, wy);
      clearSel(); protoSel = null;
      if (w) { selO.add(w.o.id); protoSel = { oid: w.o.id, iid: w.it.id }; }
      else { const h = hitTest(wx, wy); if (h && h.objs.length) selO.add(h.objs[0]); }
      refreshSelection(); return;
    }
    if (tool === 'frame') {
      // Frame tool: drag to draw a frame (Shift = square); a plain click opens device presets.
      if (selS.size || selO.size) { clearSel(); refreshSelection(); }
      drag = { mode: 'drawFrame', sx: wx, sy: wy, r: null, host: frameAt(wx, wy), prev: snapshot() };
      return;
    }
    // Resize from a handle
    const hk = hitHandle(wx, wy);
    if (hk) {
      const o = resizable();
      drag = { mode: 'resize', k: hk, o, sx: wx, sy: wy, orig: { x: o.x, y: o.y, w: o.w, h: o.h }, prev: snapshot() };
      return;
    }
    const hit = hitTest(wx, wy);
    const sb = selBox();
    const inSel = sb && inside(sb, wx, wy) && (!hit || hit.objs.every(id => selO.has(id)) && hit.strokes.every(id => selS.has(id)));
    // Figma: on empty space inside a top-level frame, a click selects the frame and a drag
    // draws a selection box over the frame's contents.
    if (hit && hit.frame && hit.top && !selO.has(hit.objs[0]) && !inSel && !e.altKey) {
      if (!e.shiftKey) clearSel();
      drag = { mode: 'frameClick', fid: hit.objs[0], sx: wx, sy: wy, shift: e.shiftKey, baseS: new Set(selS), baseO: new Set(selO) };
      refreshSelection();
      return;
    }
    if (hit && !inSel) {
      if (!e.shiftKey) clearSel();
      hit.objs.forEach(id => selO.add(id)); hit.strokes.forEach(id => selS.add(id));
    }
    if (hit || inSel) {
      const prev = snapshot();
      if (e.altKey) cloneSelectionInPlace();
      const { movS, movO } = movingSet();
      const origO = new Map(objects.filter(o => movO.has(o.id)).map(o => [o.id, { x: o.x, y: o.y }]));
      const origS = new Map(strokes.filter(s => movS.has(s.id)).map(s => [s.id, s.pts.map(p => [...p])]));
      const origParents = Object.fromEntries([...selO].map(id => [id, (objById(id) || {}).parent ?? null]));
      drag = { mode: 'move', sx: wx, sy: wy, moved: false, prev, movS, movO, origO, origS, box0: selBox(), alt: e.altKey, dropTarget: null, origParents };
      refreshSelection();
      return;
    }
    if (!e.shiftKey) clearSel();
    drag = { mode: 'marquee', sx: wx, sy: wy, baseS: new Set(selS), baseO: new Set(selO) };
    marquee = { x: wx, y: wy, w: 0, h: 0 };
    refreshSelection();
  });

  stage.addEventListener('pointermove', e => {
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    lastPointer = [wx, wy];
    if (liveHooks.cursor) liveHooks.cursor(lastPointer);
    if (drag && liveHooks.touch) liveHooks.touch(); // live: others see moves, resizes and ink as they happen
    if (!drag) {
      if (tool === 'proto') {
        const so = selO.size === 1 ? objById([...selO][0]) : null, pp = so && plusPoint(so);
        const onPlus = pp && Math.hypot(wx - pp[0], wy - pp[1]) < 11 / view.z;
        stage.style.cursor = onPlus ? 'crosshair' : wireAt(wx, wy) ? 'pointer' : '';
        const h = onPlus ? null : hitTest(wx, wy), id = (h && h.objs[0]) || null;
        if (id !== hoverO) { hoverO = id; renderOverlay(); }
      }
      if (tool === 'select') {
        const hk = hitHandle(wx, wy);
        stage.style.cursor = hk ? CURSOR[hk] : '';
        const h = hk ? null : hitTest(wx, wy), id = (h && h.objs[0]) || null;
        if (id !== hoverO) { hoverO = id; renderOverlay(); }
      }
      return;
    }
    if (drag.mode === 'wire') {
      drag.x = wx; drag.y = wy;
      const own = screenOf(drag.src);
      const t = [...topFrames()].reverse().find(f => inside(f, wx, wy));
      drag.target = t && t.id !== drag.src.id && (!own || t.id !== own.id) ? t : null;
      renderOverlay(); return;
    }
    if (drag.mode === 'frameClick') {
      if (Math.hypot(wx - drag.sx, wy - drag.sy) * view.z < 3) return;
      drag = { mode: 'marquee', sx: drag.sx, sy: drag.sy, baseS: drag.baseS, baseO: drag.baseO, scope: drag.fid };
      marquee = { x: drag.sx, y: drag.sy, w: 0, h: 0 };
    }
    if (drag.mode === 'drawFrame') {
      let w = wx - drag.sx, h = wy - drag.sy;
      if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
      drag.r = { x: Math.min(drag.sx, drag.sx + w), y: Math.min(drag.sy, drag.sy + h), w: Math.abs(w), h: Math.abs(h) };
      renderOverlay();
      return;
    }
    if (drag.mode === 'pan') {
      view.x = drag.vx + e.clientX - drag.sx; view.y = drag.vy + e.clientY - drag.sy; applyView();
    } else if (drag.mode === 'pen') {
      const pts = drag.s.pts, l = pts[pts.length - 1];
      if (e.shiftKey) { // Shift: straight line, like Figma's pencil
        const [x0, y0] = pts[0];
        drag.s.pts = Array.from({ length: 21 }, (_, i) => [x0 + (wx - x0) * i / 20, y0 + (wy - y0) * i / 20]);
        drag.el.setAttribute('d', pathD(drag.s.pts));
      } else if (Math.hypot(wx - l[0], wy - l[1]) > 1.2 / view.z) { pts.push([wx, wy]); drag.el.setAttribute('d', pathD(pts)); }
    } else if (drag.mode === 'move') {
      let dx = wx - drag.sx, dy = wy - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) * view.z < 3) return;
      drag.moved = true;
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; } // axis lock
      guides = [];
      if (!(e.ctrlKey || e.metaKey) && drag.box0) { // hold Ctrl to move without snapping
        const b = { x: drag.box0.x + dx, y: drag.box0.y + dy, w: drag.box0.w, h: drag.box0.h };
        const sn = snap(b, drag.movO);
        dx += sn.dx; dy += sn.dy; guides = sn.guides;
      }
      for (const o of objects) { const p = drag.origO.get(o.id); if (p) { o.x = p.x + dx; o.y = p.y + dy; } }
      for (const s of strokes) { const p = drag.origS.get(s.id); if (p) s.pts = p.map(([x, y]) => [x + dx, y + dy]); }
      // The frame under the pointer is where the layers will land.
      drag.dropTarget = selO.size ? (frameAt(wx, wy, drag.movO) || { id: null }).id : null;
      renderInk(); renderObjects(); renderOverlay(); positionSelbar(); badges.innerHTML = '';
    } else if (drag.mode === 'resize') {
      const { k, o, orig } = drag;
      const dx = wx - drag.sx, dy = wy - drag.sy;
      let { x, y, w, h } = orig;
      if (k.includes('e')) w = orig.w + dx;
      if (k.includes('w')) { w = orig.w - dx; x = orig.x + dx; }
      if (k.includes('s')) h = orig.h + dy;
      if (k.includes('n')) { h = orig.h - dy; y = orig.y + dy; }
      guides = [];
      if (!(e.ctrlKey || e.metaKey)) { // snap the edges being dragged
        const sn = snap({ x, y, w, h }, new Set([o.id]), k.includes('w') ? [0] : k.includes('e') ? [1] : [], k.includes('n') ? [0] : k.includes('s') ? [1] : []);
        if (k.includes('w')) { x += sn.dx; w -= sn.dx; } else if (k.includes('e')) w += sn.dx;
        if (k.includes('n')) { y += sn.dy; h -= sn.dy; } else if (k.includes('s')) h += sn.dy;
        guides = sn.guides;
      }
      const keep = e.shiftKey !== (o.kind === 'asset') || (o.kind === 'comp' && SQUARE.has(o.type)); // pasted images keep proportions unless Shift
      if (keep && k.length === 2) { // keep proportions from a corner
        const s = Math.max(w / orig.w, h / orig.h);
        const nw = orig.w * s, nh = orig.h * s;
        if (k.includes('w')) x = orig.x + orig.w - nw;
        if (k.includes('n')) y = orig.y + orig.h - nh;
        w = nw; h = nh;
      }
      const mn = (o.kind === 'comp' && MIN_SIZE[o.type]) || 16;
      if (w < mn) { if (k.includes('w')) x -= mn - w; w = mn; }
      if (h < mn) { if (k.includes('n')) y -= mn - h; h = mn; }
      Object.assign(o, { x, y, w, h });
      renderObjects(); renderOverlay(); renderInspectorSize();
    } else if (drag.mode === 'marquee') {
      marquee = { x: Math.min(drag.sx, wx), y: Math.min(drag.sy, wy), w: Math.abs(wx - drag.sx), h: Math.abs(wy - drag.sy) };
      selS = new Set(drag.baseS); selO = new Set(drag.baseO);
      for (const s of strokes) if (intersects(marquee, info(s))) selS.add(s.id);
      for (const g of groups) if (g.strokeIds.some(id => selS.has(id))) g.strokeIds.forEach(id => selS.add(id));
      // Select siblings at the level the box started in (canvas, or inside a frame).
      const scope = drag.scope ?? null;
      for (const o of objects) if ((o.parent ?? null) === scope && intersects(marquee, o)) selO.add(o.id);
      renderOverlay(); positionSelbar();
    }
  });

  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    guides = [];
    stage.classList.remove('panning');
    if (d.mode === 'wire') {
      stage.style.cursor = '';
      if (!d.target) { renderOverlay(); return; }
      if ((d.src.links || []).some(l => l.to === d.target.id)) { renderOverlay(); toast(`Already connected to ${frameName(d.target)}`); return; }
      const it = newInteraction(d.target.id);
      (d.src.links = d.src.links || []).push(it);
      commit(d.prev);
      protoSel = { oid: d.src.id, iid: it.id };
      update();
      toast(`Arrow to ${frameName(d.target)}`);
      return;
    }
    if (d.mode === 'pen') {
      if (d.s.pts.length < 2) d.s.pts.push([d.s.pts[0][0] + 0.1, d.s.pts[0][1]]);
      commit(d.prev);
      lastStrokeId = d.s.id;
      if (liveHooks.strokeDone) liveHooks.strokeDone(d.s.id);
      update();
      scheduleBadges(); // tags appear after a pause; nothing opens until you click one
    } else if (d.mode === 'frameClick') {
      if (!d.shift) clearSel();
      selO.add(d.fid); refreshSelection();
    } else if (d.mode === 'drawFrame') {
      const r = d.r;
      if (!r || (r.w * view.z < 6 && r.h * view.z < 6)) { setTool('select'); openVirtual('frame', [d.sx, d.sy], d.host); update(); return; }
      const id = nextId++;
      const f = { id, kind: 'frame', device: 'custom', name: `Frame ${frames().length + 1}`, fill: '#ffffff', radius: 0, clip: true, x: r.x, y: r.y, w: Math.max(1, r.w), h: Math.max(1, r.h), parent: d.host ? d.host.id : null };
      // Figma: layers you draw a frame around move inside it.
      let adopted = 0;
      for (const o of objects) if ((o.parent ?? null) === f.parent && o.x >= r.x && o.y >= r.y && o.x + o.w <= r.x + r.w && o.y + o.h <= r.y + r.h) { o.parent = id; adopted++; }
      const firstChild = objects.findIndex(o => o.parent === id);
      if (firstChild >= 0) objects.splice(firstChild, 0, f); else objects.push(f);
      commit(d.prev);
      clearSel(); selO.add(id); justPlaced = id;
      setTool('select');
      update();
      if (adopted) toast(`${f.name} created with ${adopted} layer${adopted > 1 ? 's' : ''} inside`);
    } else if (d.mode === 'move') {
      if (d.moved) {
        // Reparent: whatever frame the pointer was over when dropped now owns the moved layers.
        const target = d.dropTarget ?? null;
        let changed = false;
        for (const o of selRoots()) {
          if ((o.parent ?? null) === target) continue;
          o.parent = target; changed = true;
          const i = objects.indexOf(o); objects.splice(i, 1); objects.push(o); // on top inside the new parent
        }
        if (changed) toast(target != null ? `Moved into ${frameName(objById(target))}` : 'Moved out of frame');
      }
      if (d.moved || d.alt) { commit(d.prev); update(); if (d.alt) toast('Duplicated'); } else refreshSelection();
    } else if (d.mode === 'resize') {
      if (d.o.w !== d.orig.w || d.o.h !== d.orig.h) commit(d.prev);
      update();
    } else if (d.mode === 'marquee') { marquee = null; refreshSelection(); }
    else renderBadges();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('dblclick', e => {
    if (tool !== 'select') return;
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    const h = hitTest(wx, wy);
    if (h && h.objs.length) { const o = objById(h.objs[0]); if (o.kind === 'comp' && HAS_LABEL.has(o.type)) { const i = $('#insLabel'); if (i) { i.focus(); i.select(); } } }
    else if (h && h.strokes.length) { const g = groups.find(g => g.strokeIds.includes(h.strokes[0])); if (g) startThinking(g.key); }
  });
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
    else { view.x -= e.deltaX; view.y -= e.deltaY; applyView(); }
  }, { passive: false });

  // =========================================================================
  // Tools & palette
  // =========================================================================
  function setTool(t) {
    const was = tool;
    tool = t; stage.dataset.tool = t;
    if (was === 'proto' || t === 'proto') { protoSel = null; if (typeof refreshSelection === 'function') refreshSelection(); }
    if (liveHooks.cursor && lastPointer) liveHooks.cursor(lastPointer);
    document.querySelectorAll('.tool[data-tool]').forEach(b => { const on = b.dataset.tool === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    if (t !== 'select' && t !== 'proto' && hoverO) { hoverO = null; renderOverlay(); }
    if (typeof updateGuide === 'function') updateGuide();
  }
  document.querySelectorAll('.tool[data-tool]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.tool === 'pen' && tool === 'pen') return togglePalette();
    setTool(b.dataset.tool); closePalette();
  }));
  $('#compTool').onclick = () => openVirtual('comp');

  const palette = $('#palette'), penBtn = $('#penColor');
  function renderPalette() {
    $('#swatches').innerHTML = COLORS.map(c => `<button type="button" class="swatch${c === penColor ? ' on' : ''}" data-c="${c}" style="background:${c}" aria-label="${COLOR_NAMES[c] || c}" aria-pressed="${c === penColor}" title="${COLOR_NAMES[c] || c}"></button>`).join('');
    $('#widths').innerHTML = WIDTHS.map(w => `<button type="button" class="wbtn${w === penWidth ? ' on' : ''}" data-w="${w}" aria-label="${['Thin', 'Medium', 'Thick'][WIDTHS.indexOf(w)]}" aria-pressed="${w === penWidth}"><i style="height:${w + 0.5}px"></i></button>`).join('');
    document.documentElement.style.setProperty('--pen', penColor === '#ffffff' ? '#cfcfd4' : penColor);
    updatePenCursor();
  }
  /** Pencil cursor: a dot in the current colour, sized to the stroke you'll draw at this zoom. */
  let penCursorKey = '';
  function updatePenCursor() {
    const d = clamp(penWidth * view.z, 3, 22), key = `${penColor}|${d.toFixed(1)}`;
    if (key === penCursorKey) return;
    penCursorKey = key;
    const light = penColor.toLowerCase() === '#ffffff';
    const svg = s => `<svg xmlns="http://www.w3.org/2000/svg" width="${32 * s}" height="${32 * s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="${(d / 2 + 1.6).toFixed(2)}" fill="none" stroke="${light ? '#1f1c17' : '#ffffff'}" stroke-width="1.6"/><circle cx="16" cy="16" r="${(d / 2).toFixed(2)}" fill="${penColor}"/><circle cx="16" cy="16" r="${(d / 2 + 2.4).toFixed(2)}" fill="none" stroke="rgba(31,28,23,.35)" stroke-width=".6"/></svg>`;
    const url = s => `url("data:image/svg+xml,${encodeURIComponent(svg(s))}")`;
    stage.style.setProperty('--cursor-pen', `image-set(${url(1)} 1x, ${url(2)} 2x) 16 16, crosshair`);
  }
  const togglePalette = () => (palette.hidden ? openPalette() : closePalette());
  function openPalette() { renderPalette(); palette.hidden = false; penBtn.setAttribute('aria-expanded', 'true'); }
  function closePalette() { palette.hidden = true; penBtn.setAttribute('aria-expanded', 'false'); }
  penBtn.addEventListener('click', () => { setTool('pen'); togglePalette(); });
  palette.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'), w = e.target.closest('[data-w]');
    if (c) penColor = c.dataset.c;
    if (w) penWidth = Number(w.dataset.w);
    if (c || w) { setTool('pen'); renderPalette(); }
  });

  $('#undo').onclick = undo;
  $('#redo').onclick = redo;
  $('#clear').onclick = () => {
    if (!strokes.length && !objects.length) return;
    commit(snapshot()); strokes = []; objects = []; clearSel(); closePop(); update(); toast('Canvas cleared. Press Ctrl Z to undo.');
  };
  $('#example').onclick = loadExample;
  $('#emptyExample').onclick = () => loadExample();
  popEl.removeAttribute('aria-label'); popEl.setAttribute('aria-labelledby', 'popTitle');
  $('#zoomIn').onclick = () => zoomAt(1.2, innerWidth / 2, innerHeight / 2);
  $('#zoomOut').onclick = () => zoomAt(1 / 1.2, innerWidth / 2, innerHeight / 2);
  $('#zoomLabel').onclick = () => zoomAt(1 / view.z, innerWidth / 2, innerHeight / 2);
  $('#zoomFit').onclick = () => zoomToFit();

  // =========================================================================
  // Inspector (right)
  // =========================================================================
  const inspector = $('#inspector');
  const AL = {
    left: '<path d="M4 3v18M8 7h10v4H8zM8 13h6v4H8z"/>', hcenter: '<path d="M12 3v18M6 7h12v4H6zM8 13h8v4H8z"/>', right: '<path d="M20 3v18M6 7h10v4H6zM10 13h6v4h-6z"/>',
    top: '<path d="M3 4h18M7 8v10h4V8zM13 8v6h4V8z"/>', vcenter: '<path d="M3 12h18M7 6v12h4V6zM13 8v8h4V8z"/>', bottom: '<path d="M3 20h18M7 6v10h4V6zM13 10v6h4v-6z"/>',
    dh: '<path d="M4 4v16M20 4v16M9 8h6v8H9z"/>', dv: '<path d="M4 4h16M4 20h16M8 9h8v6H8z"/>',
  };
  const alBtn = (k, t) => `<button type="button" class="al" data-al="${k}" title="${t}" aria-label="${t}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">${AL[k]}</svg></button>`;
  const alignRow = (dist) => `<div class="ins-field"><span>Align</span><div class="al-row">${alBtn('left', 'Align left (Alt+A)')}${alBtn('hcenter', 'Align horizontal centers (Alt+H)')}${alBtn('right', 'Align right (Alt+D)')}${alBtn('top', 'Align top (Alt+W)')}${alBtn('vcenter', 'Align vertical centers (Alt+V)')}${alBtn('bottom', 'Align bottom (Alt+S)')}${dist ? alBtn('dh', 'Distribute horizontal spacing') + alBtn('dv', 'Distribute vertical spacing') : ''}</div></div>`;
  function renderInspector() {
    if (pop || drag) { if (pop) inspector.hidden = true; return; }
    const sel = [...selO].map(objById).filter(Boolean);
    if (!sel.length || selS.size) { inspector.hidden = true; return; }
    inspector.hidden = false;
    if (tool === 'proto') return renderProtoInspector(sel);
    if (sel.length > 1) {
      const kinds = [...new Set(sel.map(o => (o.kind === 'frame' ? 'Frame' : o.kind === 'asset' ? (o.svg ? 'Vector' : 'Image') : TYPES[o.type].name)))];
      inspector.innerHTML = `<div class="ins-head"><div><div class="t">${sel.length} layers</div><div class="s">${esc(kinds.slice(0, 4).join(', '))}</div></div></div>
        ${alignRow(sel.length >= 3)}
        <div class="ins-actions"><button type="button" data-a="code">Code</button><button type="button" data-a="dup">Duplicate</button><button type="button" class="danger" data-a="del">Delete</button></div>`;
      return;
    }
    const o = sel[0];
    if (o.kind === 'frame') {
      const dev = devById(o.device);
      const opts = `<option value="custom"${o.device === 'custom' ? ' selected' : ''}>Custom size</option>` + DEVICE_GROUPS.map(g => `<optgroup label="${g}">${DEVICES.filter(d => d.group === g).map(d => `<option value="${d.id}"${d.id === o.device ? ' selected' : ''}>${esc(d.name)} · ${d.w}×${d.h}</option>`).join('')}</optgroup>`).join('');
      const kids = childrenOf(o.id).length, all = descendantsOf(o.id).length, par = parentOf(o);
      const where = `${kids ? `${kids} layer${kids === 1 ? '' : 's'} inside${all > kids ? ` (${all} in total)` : ''}` : 'Empty'}${par ? ` · in ${esc(frameName(par))}` : ''}`;
      const fill = o.fill || '#ffffff';
      inspector.innerHTML = `<div class="ins-head"><div><div class="t">${esc(frameName(o))}</div><div class="s">Frame · ${where}</div></div>${par ? '' : `<button type="button" class="present-btn" data-a="present" title="Present (Ctrl Alt Enter)"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg>Present</button>`}</div>
        ${par ? alignRow(false) : ''}
        <label class="ins-field"><span>Name</span><input data-f="name" autocomplete="off" maxlength="80" value="${esc(frameName(o))}"></label>
        ${par ? '' : `<label class="ins-field"><span>State</span><input data-p="state" autocomplete="off" maxlength="40" placeholder="e.g. Logged out, Empty, Error" value="${esc(o.state || '')}"></label>`}
        <label class="ins-field"><span>Device</span><select data-f="device">${opts}</select></label>
        <div class="ins-row"><label class="ins-field"><span>W</span><input data-f="w" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.w)}"></label><label class="ins-field"><span>H</span><input data-f="h" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.h)}"></label></div>
        <label class="clip-toggle" title="Hide anything that extends past the frame's edges"><input type="checkbox" data-f="clip"${o.clip !== false ? ' checked' : ''}><span class="box" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="lbl">Clip content</span></label>
        <div class="ins-row"><label class="ins-field"><span>Fill</span><span class="fill-input"><input data-f="fill" type="color" value="${esc(fill)}" aria-label="Fill colour"><input data-f="fillHex" class="mono" autocomplete="off" spellcheck="false" maxlength="7" value="${esc(fill.toUpperCase())}" aria-label="Fill hex"></span></label><label class="ins-field"><span>Radius</span><input data-f="radius" type="number" inputmode="numeric" min="0" autocomplete="off" value="${Math.round(o.radius ?? dev.r)}"></label></div>
        <div class="ins-actions"><button type="button" data-a="code">Code</button><button type="button" data-a="dup">Duplicate</button><button type="button" class="danger" data-a="del">Delete</button></div>
        ${kids ? '<button type="button" class="ins-link" data-a="unwrap">Remove frame, keep contents</button>' : ''}`;
    } else if (o.kind === 'asset') {
      inspector.innerHTML = `<div class="ins-head"><div><div class="t">${esc(o.name || 'Image')}</div><div class="s">${o.svg ? 'Vector (SVG)' : 'Image'}${parentOf(o) ? ` · in ${esc(frameName(parentOf(o)))}` : ''}</div></div></div>
        ${parentOf(o) ? alignRow(false) : ''}
        <div class="ins-row"><label class="ins-field"><span>W</span><input data-f="w" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.w)}"></label><label class="ins-field"><span>H</span><input data-f="h" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.h)}"></label></div>
        <div class="ins-actions"><button type="button" data-a="figma">Copy for Figma</button><button type="button" data-a="dup">Duplicate</button><button type="button" class="danger" data-a="del">Delete</button></div>`;
    } else {
      const kit = kitById(o.kit);
      inspector.innerHTML = `<div class="ins-head"><div><div class="t">${esc(kit.names[o.type])}</div><div class="s">${esc(kit.name)} · ${TYPES[o.type].name}${parentOf(o) ? ` · in ${esc(frameName(parentOf(o)))}` : ''}</div></div></div>
        ${parentOf(o) ? alignRow(false) : ''}
        <label class="ins-field"><span>Library</span><select data-f="kit">${KITS.map(k => `<option value="${k.id}"${k.id === o.kit ? ' selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label>
        <label class="ins-field"><span>Component</span><select data-f="type">${Object.keys(TYPES).map(t => `<option value="${t}"${t === o.type ? ' selected' : ''}>${TYPES[t].name}</option>`).join('')}</select></label>
        ${HAS_LABEL.has(o.type) ? `<label class="ins-field"><span>Label</span><input id="insLabel" data-f="label" autocomplete="off" maxlength="300" value="${esc(o.label)}"></label>` : ''}
        <div class="ins-row"><label class="ins-field"><span>W</span><input data-f="w" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.w)}"></label><label class="ins-field"><span>H</span><input data-f="h" type="number" inputmode="numeric" min="1" autocomplete="off" value="${Math.round(o.h)}"></label></div>
        <div class="ins-actions"><button type="button" data-a="code">Code</button><button type="button" data-a="dup">Duplicate</button><button type="button" class="danger" data-a="del">Delete</button></div>`;
    }
  }
  function renderInspectorSize() {
    const o = resizable(); if (!o) return;
    const w = inspector.querySelector('[data-f="w"]'), h = inspector.querySelector('[data-f="h"]');
    if (w) w.value = Math.round(o.w); if (h) h.value = Math.round(o.h);
  }
  /** Move an object; a frame takes its contents with it. */
  function moveBy(o, dx, dy) {
    if (o.kind === 'frame') {
      for (const c of descendantsOf(o.id)) { c.x += dx; c.y += dy; }
      for (const s of strokes) if (centerIn(o, info(s))) s.pts = s.pts.map(([x, y]) => [x + dx, y + dy]);
    }
    o.x += dx; o.y += dy;
  }
  /** Align to the selection bounds, or to the parent frame when one component is selected. */
  function align(kind) {
    const sel = [...selO].map(objById).filter(Boolean);
    if (!sel.length) return;
    const ref = sel.length === 1 ? parentOf(sel[0]) : bbox(sel);
    if (!ref) return toast('Select two or more layers, or a component inside a frame');
    const prev = snapshot();
    if (kind === 'dh' || kind === 'dv') {
      if (sel.length < 3) return;
      const hz = kind === 'dh', P = hz ? 'x' : 'y', S = hz ? 'w' : 'h';
      const list = [...sel].sort((a, b) => a[P] - b[P]);
      const span = list[list.length - 1][P] + list[list.length - 1][S] - list[0][P];
      const gap = (span - list.reduce((t, o) => t + o[S], 0)) / (list.length - 1);
      let at = list[0][P];
      for (const o of list) { const d = at - o[P]; moveBy(o, hz ? d : 0, hz ? 0 : d); at += o[S] + gap; }
    } else {
      for (const o of sel) {
        const nx = { left: ref.x, hcenter: ref.x + ref.w / 2 - o.w / 2, right: ref.x + ref.w - o.w }[kind];
        const ny = { top: ref.y, vcenter: ref.y + ref.h / 2 - o.h / 2, bottom: ref.y + ref.h - o.h }[kind];
        moveBy(o, nx === undefined ? 0 : nx - o.x, ny === undefined ? 0 : ny - o.y);
      }
    }
    commit(prev); update();
  }
  /** Re-fit a component after its kit or type changes, keeping it where it is. */
  function refit(o) {
    const F = parentOf(o);
    const r = { x: o.x, y: o.y, w: o.w, h: o.h };
    const p = placement(r, o.type, kitById(o.kit), F);
    Object.assign(o, p);
  }
  inspector.addEventListener('pointerdown', e => e.stopPropagation());
  let insPrev = null;
  inspector.addEventListener('focusin', () => { insPrev = snapshot(); });
  inspector.addEventListener('input', e => {
    const o = objById([...selO][0]); const f = e.target.dataset.f; if (!o || !f) return;
    if (f === 'label') o.label = e.target.value;
    else if (f === 'w' || f === 'h') { const v = Number(e.target.value); if (v > 0) o[f] = v; }
    else if (f === 'name') o.name = e.target.value.trim() || frameName({ device: o.device });
    else if (f === 'fill') { o.fill = e.target.value; const hx = inspector.querySelector('[data-f="fillHex"]'); if (hx) hx.value = o.fill.toUpperCase(); }
    else if (f === 'fillHex') { const v = e.target.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) { o.fill = v.toLowerCase(); const c = inspector.querySelector('[data-f="fill"]'); if (c) c.value = o.fill; } else return; }
    else if (f === 'radius') { const v = Number(e.target.value); if (v >= 0) o.radius = v; }
    else return;
    renderObjects(); renderOverlay(); if (f === 'name') renderSidebar();
  });
  inspector.addEventListener('change', e => {
    const o = objById([...selO][0]); const f = e.target.dataset.f; if (!o || !f) return;
    const prev = insPrev || snapshot();
    if (f === 'kit') { o.kit = e.target.value; refit(o); }
    else if (f === 'type') { o.type = e.target.value; o.label = defaultLabel(o.type, parentOf(o)); refit(o); }
    else if (f === 'clip') o.clip = e.target.checked;
    else if (f === 'device') {
      const d = devById(e.target.value), old = { x: o.x, y: o.y, w: o.w, h: o.h };
      if (d.id === 'custom') { o.device = 'custom'; if (!o.fill) o.fill = '#ffffff'; }
      else {
        const kids = descendantsOf(o.id); // everything inside follows the new size
        const ks = new Set(strokes.filter(s => centerIn(old, info(s))).map(s => s.id));
        o.device = d.id; o.w = d.w; o.h = d.h; delete o.radius;
        if (o.name && /^Frame \d+$/.test(o.name)) delete o.name;
        remap(old, o, ks, kids);
      }
    }
    else if (f === 'name' || f === 'fill' || f === 'fillHex' || f === 'radius' || f === 'label' || f === 'w' || f === 'h') { /* already applied live */ }
    commit(prev); insPrev = snapshot();
    update();
  });
  inspector.addEventListener('click', e => {
    const al = e.target.closest('[data-al]'); if (al) return align(al.dataset.al);
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'del') deleteSelection();
    else if (a === 'dup') duplicate();
    else if (a === 'code') openModal(exportRoots());
    else if (a === 'figma') copyForFigma();
    else if (a === 'present') present(objById([...selO][0]));
    else if (a === 'unwrap') unwrapFrame();
  });

  // =========================================================================
  // Sidebar (left): layers & libraries
  // =========================================================================
  // =========================================================================
  // Morph: a small control (pill, tab) grows into its panel and shrinks back.
  // The panel is laid out at its final size and revealed with a clip that starts
  // as the control's exact shape, so nothing is stretched; the contents rise in
  // just behind it. Springs come from Motion (motion.dev); without it, or with
  // reduced motion, panels simply appear.
  // =========================================================================
  const morphing = new Set();
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionLib = () => (window.Motion && typeof window.Motion.animate === 'function' ? window.Motion : null);
  function clipFor(r, to, radius) {
    const t = Math.max(0, r.top - to.top), rt = Math.max(0, to.right - r.right), b = Math.max(0, to.bottom - r.bottom), l = Math.max(0, r.left - to.left);
    return `inset(${t}px ${rt}px ${b}px ${l}px round ${radius}px)`;
  }
  const radiusOf = el => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
  const PAD = 48; // clip past the panel's edges at rest, so its shadow isn't cut off
  async function morphOpen(panel, from, { hideFrom = true } = {}) {
    const M = motionLib();
    const r0 = from.getBoundingClientRect(), r0Radius = radiusOf(from);
    panel.hidden = false;
    if (hideFrom) from.style.visibility = 'hidden';
    if (!M || reduceMotion() || !r0.width) {
      if (hideFrom) { from.hidden = true; from.style.visibility = ''; }
      if (reduceMotion()) panel.animate({ opacity: [0, 1] }, { duration: 140, easing: 'ease' });
      return;
    }
    morphing.add(panel);
    const to = panel.getBoundingClientRect(), radius = radiusOf(panel);
    const kids = [...panel.children];
    kids.forEach(k => { k.style.opacity = '0'; });
    const shape = M.animate(panel, { clipPath: [clipFor(r0, to, r0Radius), `inset(-${PAD}px round ${radius + PAD}px)`] }, { type: 'spring', bounce: 0.14, duration: 0.5 });
    const rise = M.animate(kids, { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'], filter: ['blur(3px)', 'blur(0px)'] }, { duration: 0.32, delay: M.stagger ? M.stagger(0.035, { startDelay: 0.08 }) : 0.08, ease: [0.23, 1, 0.32, 1] });
    await Promise.all([shape.finished, rise.finished].map(p => p.catch(() => {})));
    panel.style.clipPath = ''; kids.forEach(k => { k.style.opacity = ''; k.style.transform = ''; k.style.filter = ''; });
    if (hideFrom) { from.hidden = true; from.style.visibility = ''; }
    morphing.delete(panel);
  }
  async function morphClose(panel, into, { showInto = true } = {}) {
    const M = motionLib();
    if (showInto) { into.hidden = false; into.style.visibility = 'hidden'; }
    const r1 = into.getBoundingClientRect(), r1Radius = radiusOf(into);
    if (!M || reduceMotion() || !r1.width || panel.hidden) {
      panel.hidden = true;
      if (showInto) into.style.visibility = '';
      return;
    }
    morphing.add(panel);
    const to = panel.getBoundingClientRect(), radius = radiusOf(panel), kids = [...panel.children];
    M.animate(kids, { opacity: [1, 0] }, { duration: 0.12, ease: 'easeOut' });
    const shape = M.animate(panel, { clipPath: [`inset(-${PAD}px round ${radius + PAD}px)`, clipFor(r1, to, r1Radius)] }, { type: 'spring', bounce: 0, duration: 0.36 });
    await shape.finished.catch(() => {});
    panel.hidden = true; panel.style.clipPath = ''; kids.forEach(k => { k.style.opacity = ''; });
    if (showInto) into.style.visibility = '';
    morphing.delete(panel);
  }

  const sidebar = $('#sidebar'), sideToggle = $('#sideToggle');
  const collapsed = new Set(); // frames folded in the Layers panel
  /** The brand pill and the panel are one thing: opening swaps the pill for the panel's own header. */
  async function setSidebar(open, focus = true) {
    if (open === !sidebar.hidden || morphing.has(sidebar)) return;
    const brand = $('#brand');
    sideToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      sidebar.hidden = false; renderSidebar(); // lay out the panel's contents before it morphs in
      const go = morphOpen(sidebar, brand, { hideFrom: false });
      document.body.classList.add('side-open');
      await go;
    } else {
      document.body.classList.remove('side-open');
      await morphClose(sidebar, brand, { showInto: false });
    }
    if (focus) (open ? $('#sideClose') : sideToggle).focus({ preventScroll: true });
  }
  sideToggle.onclick = () => setSidebar(sidebar.hidden);
  $('#sideClose').onclick = () => setSidebar(false);
  function renderSidebar() {
    $('#libCount').textContent = `${enabled.size} of ${KITS.length} on`;
    if (sidebar.hidden) return;
    $('#libs').innerHTML = KITS.map(k => `<label class="lib"><input type="checkbox" data-kit="${k.id}"${enabled.has(k.id) ? ' checked' : ''}><span class="sw" style="background:${k.swatch}"></span><span class="nm">${esc(k.name)}</span><span class="tg">${esc(k.tag)}</span></label>`).join('');
    const rowC = (c, child) => c.kind === 'asset'
      ? `<button type="button" class="layer-row${child ? ' child' : ''}${selO.has(c.id) ? ' on' : ''}" data-oid="${c.id}"><span class="ic" aria-hidden="true">◧</span><span class="nm">${esc(c.name || 'Image')}</span><span class="meta">${c.svg ? 'Vector' : 'Image'}</span></button>`
      : `<button type="button" class="layer-row${child ? ' child' : ''}${selO.has(c.id) ? ' on' : ''}" data-oid="${c.id}"><span class="ic" aria-hidden="true">${TYPES[c.type].icon}</span><span class="nm">${esc(c.label || TYPES[c.type].name)}</span><span class="meta">${esc(kitById(c.kit).name)}</span></button>`;
    // Figma-style tree: topmost layer first, frames expandable, children indented under their frame.
    let html = '';
    const walk = (list, d) => {
      for (const o of [...list].reverse()) {
        const kids = o.kind === 'frame' ? childrenOf(o.id) : [];
        const open = !collapsed.has(o.id);
        const caret = kids.length ? `<button type="button" class="caret${open ? ' open' : ''}" data-toggle="${o.id}" aria-label="${open ? 'Collapse' : 'Expand'} ${esc(frameName(o))}" aria-expanded="${open}"></button>` : '<span class="caret-space"></span>';
        const row = o.kind === 'frame'
          ? `<button type="button" class="layer-row${selO.has(o.id) ? ' on' : ''}" data-oid="${o.id}"><span class="ic" aria-hidden="true">#</span><b class="nm">${esc(frameName(o))}</b><span class="meta">${Math.round(o.w)}×${Math.round(o.h)}</span></button>`
          : rowC(o, false);
        html += `<div class="layer-line" style="--d:${d}" role="treeitem" aria-level="${d + 1}"${kids.length ? ` aria-expanded="${open}"` : ''}>${caret}${row}</div>`;
        if (kids.length && open) walk(kids, d + 1);
      }
    };
    walk(roots(), 0);
    if (groups.length) html += `<button type="button" class="layer-row" data-act="sketches"><span class="ic" aria-hidden="true">✎</span><span class="nm">${groups.length} sketch${groups.length > 1 ? 'es' : ''} to convert</span><span class="meta">Find</span></button>`;
    $('#layers').innerHTML = html || '<div class="none" style="color:var(--mute)">Nothing yet. Draw something or add a frame.</div>';
  }
  $('#libs').addEventListener('change', e => {
    const id = e.target.dataset.kit; if (!id) return;
    if (e.target.checked) enabled.add(id); else if (enabled.size > 1) enabled.delete(id); else { e.target.checked = true; toast('Keep at least one library turned on'); }
    renderSidebar(); if (pop) renderPop();
  });
  $('#layers').addEventListener('click', e => {
    const t = e.target.closest('[data-toggle]');
    if (t) { const id = Number(t.dataset.toggle); collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id); renderSidebar(); return; }
    const r = e.target.closest('.layer-row'); if (!r) return;
    if (r.dataset.act === 'sketches') { if (groups[0]) { zoomToFit(groups[0].rect); startThinking(groups[0].key); } return; }
    const o = objById(Number(r.dataset.oid)); if (!o) return;
    clearSel(); selO.add(o.id); setTool('select'); refreshSelection(); ensureVisible(o);
  });
  $('#detect').onchange = e => { showDetect = e.target.checked; renderOverlay(); };

  // =========================================================================
  // Selection bar, delete, duplicate
  // =========================================================================
  const selbar = $('#selbar');
  function positionSelbar() {
    const sb = selBox();
    if (!sb || pop || tool === 'proto' || (drag && (drag.mode === 'marquee' || drag.mode === 'move'))) { selbar.hidden = true; return; }
    selbar.hidden = false;
    const nObj = selO.size, nSk = groups.filter(g => g.strokeIds.some(id => selS.has(id))).length;
    const parts = [];
    const fs = [...selO].map(objById).filter(o => o && o.kind === 'frame');
    if (fs.length) parts.push(fs.length === 1 ? frameName(fs[0]) : `${fs.length} frames`);
    const cs = nObj - fs.length; if (cs) parts.push(`${cs} component${cs > 1 ? 's' : ''}`);
    if (selS.size) parts.push(nSk ? `${nSk} sketch${nSk > 1 ? 'es' : ''}` : `${selS.size} stroke${selS.size > 1 ? 's' : ''}`);
    $('#selInfo').textContent = parts.join(' · ');
    selbar.querySelector('[data-act="suggest"]').hidden = !selS.size;
    selbar.querySelectorAll('[data-act="react"],[data-act="html"],[data-act="view"]').forEach(b => { b.hidden = !nObj; });
    const s = toScreen(sb);
    const half = selbar.offsetWidth / 2 + 8;
    selbar.style.left = clamp(s.x + s.w / 2, half, innerWidth - half) + 'px';
    // Sit above the frame's name label (≈20px above a frame) so the name stays readable.
    const labelGap = [...selO].some(id => (objById(id) || {}).kind === 'frame') ? 28 : 10;
    // Above the selection when there is room; otherwise below it, never under the top bar or toolbar.
    const h = selbar.offsetHeight;
    let top = s.y - labelGap;
    if (top - h < 64) { const below = s.y + s.h + 16 + h; top = below <= innerHeight - 84 ? below : innerHeight - 84; }
    selbar.style.top = top + 'px';
  }
  function refreshSelection() { renderOverlay(); positionSelbar(); renderInspector(); renderSidebar(); }
  selbar.addEventListener('pointerdown', e => e.stopPropagation());
  selbar.addEventListener('click', e => {
    const act = e.target.closest('button[data-act]')?.dataset.act; if (!act) return;
    if (act === 'delete') return deleteSelection();
    if (act === 'figma') { copyForFigma(); return; }
    if (act === 'suggest') {
      for (const s of strokes) if (selS.has(s.id)) s.kept = false;
      update();
      const g = groups.find(g => g.strokeIds.some(id => selS.has(id)));
      if (g) { clearSel(); refreshSelection(); startThinking(g.key); }
      return;
    }
    const roots = exportRoots(); if (!roots.length) return;
    if (act === 'view') openModal(roots); else copyCode(roots, act);
  });
  function deleteSelection() {
    if (!selS.size && !selO.size) return;
    commit(snapshot());
    const del = new Set(selO);
    for (const id of selO) descendantsOf(id).forEach(c => del.add(c.id)); // a frame takes its contents with it
    objects = objects.filter(o => !del.has(o.id));
    strokes = strokes.filter(s => !selS.has(s.id));
    clearSel(); update();
  }
  function duplicate() {
    if (!selO.size) return;
    commit(snapshot());
    const src = selRoots();
    const list = [...src, ...src.flatMap(o => descendantsOf(o.id))];
    const box = bbox(src);
    // Top-level frames duplicate beside themselves (like Figma); anything else nudges and stays in its frame.
    const beside = src.some(o => o.kind === 'frame' && !parentOf(o));
    const map = cloneLayers(list, beside ? box.w + 80 : 24, beside ? 0 : 24);
    clearSel();
    for (const o of src) selO.add(map.get(o.id));
    update();
  }
  /** Ctrl+Alt+G (Figma "Frame selection"): wrap the selected layers in a new frame that fits them. */
  function wrapInFrame() {
    const sel = selRoots();
    if (!sel.length) return toast('Select layers to put in a frame');
    const parent = sel[0].parent ?? null;
    const box = bbox(sel);
    const prev = snapshot();
    const id = nextId++;
    const f = { id, kind: 'frame', device: 'custom', name: `Frame ${frames().length + 1}`, fill: '#ffffff', radius: 0, clip: true, x: box.x, y: box.y, w: box.w, h: box.h, parent };
    objects.splice(Math.min(...sel.map(o => objects.indexOf(o))), 0, f);
    for (const o of sel) o.parent = id;
    commit(prev); clearSel(); selO.add(id); update();
    toast(`Wrapped ${sel.length} layer${sel.length > 1 ? 's' : ''} in ${f.name}`);
  }
  /** Ctrl+Shift+G: remove the selected frame but keep what's inside it. */
  function unwrapFrame() {
    const fs = selRoots().filter(o => o.kind === 'frame');
    if (!fs.length) return toast('Select a frame to remove it and keep its contents');
    const prev = snapshot();
    clearSel();
    for (const f of fs) {
      const kids = childrenOf(f.id);
      kids.forEach(c => { c.parent = f.parent ?? null; selO.add(c.id); });
      objects = objects.filter(o => o !== f);
    }
    commit(prev); update();
  }

  // =========================================================================
  // Code export
  // =========================================================================
  /** Top-level things to export: selected frames (with their contents) and loose components. */
  function exportRoots() { return selRoots(); }
  const kitsIn = roots => [...new Set(roots.flatMap(o => [o, ...descendantsOf(o.id)]).filter(o => o.kind === 'comp').map(o => kitById(o.kit)).filter(Boolean))];

  function markup(roots) {
    if (roots.length === 1 && roots[0].kind === 'frame') {
      const f = roots[0];
      return nodeHTML(f, f.x, f.y, true).replace('style="left:0px;top:0px;', 'style="position:relative;');
    }
    const box = bbox(roots);
    const inner = roots.map(o => nodeHTML(o, box.x, box.y, true)).join('');
    return `<div class="artboard" style="position:relative;width:${Math.round(box.w)}px;height:${Math.round(box.h)}px">${inner}</div>`;
  }
  function kitCSS(kits) {
    const sheet = [...document.styleSheets].find(s => (s.href || '').includes('/kits.css'));
    const ids = new Set(kits.map(k => k.id)), anyKv = kits.some(k => k.kv);
    const out = [];
    for (const r of sheet ? sheet.cssRules : []) {
      const sel = r.selectorText || '';
      if (/\.screen\b|\.hl\b/.test(sel)) continue;
      const ks = [...sel.matchAll(/\.k-([a-z0-9]+)/g)].map(m => m[1]);
      if (ks.length && !ks.some(k => ids.has(k))) continue;
      if (/\.kv\b/.test(sel) && !anyKv) continue;
      out.push(r.cssText);
    }
    return out.join('\n');
  }
  const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap';
  const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link']);
  const camel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  function attrOut(n, v, jsx) {
    if (!jsx) return ` ${n}="${esc(v)}"`;
    if (n === 'class') return ` className="${v}"`;
    if (n === 'style') return ` style={{ ${v.split(';').map(p => p.trim()).filter(Boolean).map(p => { const i = p.indexOf(':'); return `${camel(p.slice(0, i).trim())}: '${p.slice(i + 1).trim()}'`; }).join(', ')} }}`;
    if (n.startsWith('data-') || n.startsWith('aria-')) return ` ${n}="${v}"`;
    return ` ${camel(n)}="${v}"`;
  }
  function serialize(node, d, jsx) {
    const pad = '  '.repeat(d);
    if (node.nodeType === 3) { const t = node.textContent.trim(); return t ? pad + (jsx ? t.replace(/[{}<>]/g, c => `{'${c}'}`) : esc(t)) + '\n' : ''; }
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    const attrs = [...node.attributes].map(a => attrOut(a.name, a.value, jsx)).join('');
    const kids = [...node.childNodes].filter(k => k.nodeType === 1 || (k.nodeType === 3 && k.textContent.trim()));
    if (!kids.length) return jsx || VOID.has(tag) ? `${pad}<${tag}${attrs}${jsx ? ' />' : '>'}\n` : `${pad}<${tag}${attrs}></${tag}>\n`;
    if (kids.length === 1 && kids[0].nodeType === 3) return `${pad}<${tag}${attrs}>${serialize(kids[0], 0, jsx).trim()}</${tag}>\n`;
    return `${pad}<${tag}${attrs}>\n${kids.map(k => serialize(k, d + 1, jsx)).join('')}${pad}</${tag}>\n`;
  }
  const pretty = (html, d, jsx) => [...new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body.children].map(n => serialize(n, d, jsx)).join('');
  const describe = roots => roots.map(o => (o.kind === 'frame' ? frameName(o) : o.kind === 'asset' ? (o.name || 'Image') : `${TYPES[o.type].name} (${kitById(o.kit).name})`)).join(', ');

  function genHTML(roots) {
    const kits = kitsIn(roots);
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(describe(roots))}</title>
  <link href="${FONTS}" rel="stylesheet">
  <style>
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 40px; background: #ececf0; box-sizing: border-box; }
${kitCSS(kits)}
  </style>
</head>
<body>
${pretty(markup(roots), 1, false)}</body>
</html>
`;
  }
  function genReact(roots) {
    const kits = kitsIn(roots);
    const css = `@import url('${FONTS}');\n${kitCSS(kits)}`.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    const one = roots.length === 1 ? roots[0] : null;
    const name = !one ? 'Artboard' : one.kind === 'frame' ? 'Screen' : ((one.kind === 'asset' ? (one.name || 'Image') : TYPES[one.type].name).replace(/[^A-Za-z0-9]/g, '') || 'Layer').replace(/^\d/, 'L$&');
    return `// ${name}.jsx: generated by Scrib
// ${describe(roots)}${kits.length ? ` · ${kits.map(k => k.name).join(', ')}` : ''}
// Paste into any React project. The styles ship inside the component.

const css = \`
${css}
\`;

export default function ${name}() {
  return (
    <>
      <style>{css}</style>
${pretty(markup(roots), 3, true)}    </>
  );
}
`;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; }
  }
  async function copyCode(roots, fmt) {
    codeFormat = fmt;
    const ok = await copyText(fmt === 'react' ? genReact(roots) : genHTML(roots));
    toast(ok ? `Copied ${fmt === 'react' ? 'React' : 'HTML'}: ${describe(roots)}` : 'Couldn’t copy. Open Code and copy from there.');
  }

  const modal = $('#modal');
  function renderModal() {
    if (!modalRoots.length) return;
    const code = codeFormat === 'react' ? genReact(modalRoots) : genHTML(modalRoots);
    $('#code').textContent = code;
    modal.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.fmt === codeFormat));
    $('#modalTitle').textContent = describe(modalRoots);
    $('#modalSub').textContent = `${kitsIn(modalRoots).map(k => k.name).join(', ') || 'Frame only'} · ${code.split('\n').length} lines`;
  }
  let modalReturn = null;
  function openModal(roots) { if (!roots.length) return; modalReturn = document.activeElement; modalRoots = roots; modal.hidden = false; renderModal(); $('#copyCode').focus(); }
  const closeModal = () => { modal.hidden = true; if (modalReturn && document.contains(modalReturn)) modalReturn.focus(); modalReturn = null; };
  modal.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-fmt]'); if (b) { codeFormat = b.dataset.fmt; renderModal(); } });
  $('#modalClose').onclick = closeModal;
  modal.addEventListener('pointerdown', e => { if (e.target === modal) closeModal(); });
  $('#copyCode').onclick = () => copyCode(modalRoots, codeFormat);
  $('#download').onclick = () => {
    const react = codeFormat === 'react';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([react ? genReact(modalRoots) : genHTML(modalRoots)], { type: react ? 'text/javascript' : 'text/html' }));
    a.download = react ? 'Screen.jsx' : 'screen.html'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  let toastTimer;
  function toast(msg, ms = 2400) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  // =========================================================================
  // Keyboard
  // =========================================================================
  // =========================================================================
  // Present (Figma's prototype view), autosave, layer order
  // =========================================================================
  // =========================================================================
  // Arrows (wireframe flows). With the Arrow tool, drag the + on any layer onto
  // a screen to draw an arrow between them. Arrows are only documentation:
  // nothing animates. Each arrow can carry a short label, and each screen can
  // carry a state tag ("Logged out", "Error") shown above it.
  // Stored as o.links = [{ id, to, label }] and frame.state = 'text', so undo,
  // autosave and live sessions carry them like any other layer data.
  // =========================================================================
  const randKey = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const newInteraction = to => ({ id: randKey(), to, label: '' }); // one arrow
  /** The top-level frame (screen) a layer lives on. */
  const screenOf = o => { let f = o; while (f && parentOf(f)) f = parentOf(f); return f && f.kind === 'frame' ? f : null; };
  const linkOk = l => { const t = objById(l.to); return !!(t && t.kind === 'frame'); };
  const layerTitle = o => (o.kind === 'frame' ? frameName(o) : o.kind === 'asset' ? (o.name || 'Image') : (kitById(o.kit) || KITS[0]).names[o.type] || TYPES[o.type].name);
  let protoSel = null; // { oid, iid }: the arrow picked on the canvas or in the panel
  /** Older canvases stored prototype interactions; keep their arrows, drop the rest. */
  function migrateLinks(list) {
    for (const o of list) {
      if (Array.isArray(o.proto)) {
        const keep = o.proto.filter(it => it && it.to != null && ['navigate', 'overlay', 'swap'].includes(it.action));
        if (keep.length) o.links = [...(o.links || []), ...keep.map(it => ({ id: it.id || randKey(), to: it.to, label: '' }))];
        delete o.proto;
      }
      delete o.flow;
    }
  }

  // ---- Drawing the arrows ----------------------------------------------------
  function wireGeom(a, b) {
    const z = view.z, ac = [a.x + a.w / 2, a.y + a.h / 2], bc = [b.x + b.w / 2, b.y + b.h / 2];
    const dx = bc[0] - ac[0], dy = bc[1] - ac[1], inset = Math.min(10 / z, b.h / 2, b.w / 2);
    let p0, p1, n;
    if (Math.abs(dx) >= Math.abs(dy) * 0.6) {
      const r = dx >= 0; n = [r ? 1 : -1, 0];
      p0 = [r ? a.x + a.w : a.x, ac[1]];
      p1 = [r ? b.x : b.x + b.w, clamp(ac[1], b.y + inset, b.y + b.h - inset)];
    } else {
      const d = dy >= 0; n = [0, d ? 1 : -1];
      p0 = [ac[0], d ? a.y + a.h : a.y];
      p1 = [clamp(ac[0], b.x + inset, b.x + b.w - inset), d ? b.y : b.y + b.h];
    }
    const head = 9 / z, end = [p1[0] - n[0] * head, p1[1] - n[1] * head];
    const k = Math.max(36 / z, Math.hypot(end[0] - p0[0], end[1] - p0[1]) * 0.42);
    const c0 = [p0[0] + n[0] * k, p0[1] + n[1] * k], c1 = [end[0] - n[0] * k, end[1] - n[1] * k];
    const d = `M${p0[0]} ${p0[1]}C${c0[0]} ${c0[1]} ${c1[0]} ${c1[1]} ${end[0]} ${end[1]}`;
    const w = 5 / z, px0 = -n[1], py0 = n[0];
    const tri = `M${p1[0]} ${p1[1]}L${end[0] + px0 * w} ${end[1] + py0 * w}L${end[0] - px0 * w} ${end[1] - py0 * w}Z`;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t * t * t * end[0], u * u * u * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t * t * t * end[1]]);
    }
    return { d, tri, p0, pts };
  }
  const plusPoint = o => [o.x + o.w, o.y + o.h / 2];
  function distToSeg(x, y, a, b) {
    const vx = b[0] - a[0], vy = b[1] - a[1], l = vx * vx + vy * vy || 1;
    const t = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / l, 0, 1);
    return Math.hypot(x - (a[0] + vx * t), y - (a[1] + vy * t));
  }
  function wireAt(x, y) {
    let best = null, bd = 6 / view.z;
    for (const o of objects) for (const it of o.links || []) {
      if (!linkOk(it)) continue;
      const g = wireGeom(o, objById(it.to));
      for (let i = 1; i < g.pts.length; i++) { const d = distToSeg(x, y, g.pts[i - 1], g.pts[i]); if (d < bd) { bd = d; best = { o, it }; } }
    }
    return best;
  }
  const chip = (cx, cy, text, px, fill, color = '#fff') => {
    const tw = px(text.length * 6.3 + 16), th = px(19);
    return `<rect x="${cx - tw / 2}" y="${cy - th / 2}" width="${tw}" height="${th}" rx="${th / 2}" fill="${fill}"/><text x="${cx}" y="${cy + px(3.8)}" text-anchor="middle" font-size="${px(11)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="600" fill="${color}">${esc(text)}</text>`;
  };
  /** State tags and arrows: always shown; the + and picking only with the Arrow tool. */
  function protoOverlay(px) {
    const B = '#2c63e8', editing = tool === 'proto';
    let out = '';
    // State tag above each screen, on the right (the name sits on the left)
    for (const f of topFrames()) if (f.state) {
      const t = f.state, tw = px(t.length * 6.3 + 22), th = px(19), x = f.x + f.w - tw, y = f.y - th - px(5);
      out += `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="${th / 2}" fill="#1f1c17"/><circle cx="${x + px(9)}" cy="${y + th / 2}" r="${px(3)}" fill="#f5c542"/><text x="${x + px(16)}" y="${y + px(13.3)}" font-size="${px(11)}" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="600" fill="#fff">${esc(t)}</text>`;
    }
    const selId = selO.size === 1 ? [...selO][0] : null;
    for (const o of objects) for (const it of o.links || []) {
      if (!linkOk(it)) continue;
      const on = editing && (protoSel ? protoSel.oid === o.id && protoSel.iid === it.id : o.id === selId);
      const dim = editing && selId && !on && o.id !== selId;
      const g = wireGeom(o, objById(it.to));
      out += `<g opacity="${dim ? 0.35 : 1}"><path d="${g.d}" fill="none" stroke="${B}" stroke-width="${px(on ? 2.5 : 1.75)}" stroke-linecap="round"/><path d="${g.tri}" fill="${B}"/><circle cx="${g.p0[0]}" cy="${g.p0[1]}" r="${px(3.5)}" fill="${B}"/>`;
      if (it.label) out += chip(g.pts[12][0], g.pts[12][1] - px(13), it.label, px, B);
      out += '</g>';
    }
    if (!editing) return out;
    if (drag && drag.mode === 'wire') {
      const t = drag.target;
      if (t) out += `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" fill="rgba(44,99,232,.06)" stroke="${B}" stroke-width="${px(2)}"/>`;
      const g = wireGeom(drag.src, t || { x: drag.x, y: drag.y, w: 0, h: 0 });
      out += `<path d="${g.d}" fill="none" stroke="${B}" stroke-width="${px(2)}" stroke-linecap="round"/><path d="${g.tri}" fill="${B}"/>`;
    }
    const so = selId && objById(selId);
    if (so && !(drag && drag.mode === 'wire')) {
      const [x, y] = plusPoint(so);
      out += `<circle cx="${x}" cy="${y}" r="${px(8)}" fill="${B}" stroke="#fff" stroke-width="${px(1.5)}"/><path d="M${x - px(3.5)} ${y}H${x + px(3.5)}M${x} ${y - px(3.5)}V${y + px(3.5)}" stroke="#fff" stroke-width="${px(1.6)}" stroke-linecap="round"/>`;
    }
    return out;
  }

  // ---- Arrow panel ------------------------------------------------------------
  function renderProtoInspector(sel) {
    if (sel.length !== 1) {
      inspector.innerHTML = '<div class="ins-head"><div><div class="t">Arrows</div><div class="s">Select one layer, then drag its + onto a screen.</div></div></div>';
      return;
    }
    const o = sel[0], top = o.kind === 'frame' && !parentOf(o), list = (o.links || []).filter(linkOk), scr = screenOf(o);
    inspector.innerHTML = `<div class="ins-head"><div><div class="t">${esc(layerTitle(o))}</div><div class="s">Arrows${scr && scr !== o ? ` · on ${esc(frameName(scr))}` : ''}</div></div></div>
      ${top ? `<label class="ins-field"><span>State</span><input data-p="state" autocomplete="off" maxlength="40" placeholder="e.g. Logged out, Empty, Error" value="${esc(o.state || '')}"></label>` : ''}
      <div class="pi-head"><span>Arrows to</span></div>
      ${list.length ? list.map(it => {
        const on = protoSel && protoSel.oid === o.id && protoSel.iid === it.id;
        return `<div class="pi-card${on ? ' open' : ''}" data-iid="${it.id}"><div class="pi-card-head"><button type="button" class="pi-sum" data-pi="${it.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6"/></svg><span>${esc(frameName(objById(it.to)))}</span></button><button type="button" class="icon-btn pi-del" data-pdel="${it.id}" aria-label="Remove arrow to ${esc(frameName(objById(it.to)))}" title="Remove arrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
          <div class="pi-grid"><label class="ins-field"><span>Label on the arrow</span><input data-p="label" data-l="${it.id}" autocomplete="off" maxlength="40" placeholder="Optional, e.g. Tap Continue" value="${esc(it.label || '')}"></label></div></div>`;
      }).join('') : '<p class="pi-empty">Drag the blue <b>+</b> on the layer onto a screen to draw an arrow.</p>'}`;
  }
  inspector.addEventListener('change', e => {
    const el = e.target.closest('[data-p]'); if (!el || !(tool === 'proto' || el.dataset.p === 'state')) return;
    const o = objById([...selO][0]); if (!o) return;
    const prev = insPrev || snapshot();
    const v = el.value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (el.dataset.p === 'state') { if (v) o.state = v; else delete o.state; }
    else if (el.dataset.p === 'label') {
      const it = (o.links || []).find(l => l.id === el.dataset.l); if (!it) return;
      it.label = v; protoSel = { oid: o.id, iid: it.id };
    } else return;
    commit(prev); insPrev = snapshot(); update();
  });
  inspector.addEventListener('click', e => {
    if (tool !== 'proto') return;
    const o = objById([...selO][0]); if (!o) return;
    const sum = e.target.closest('[data-pi]'), del = e.target.closest('[data-pdel]');
    if (sum) { protoSel = { oid: o.id, iid: sum.dataset.pi }; renderInspector(); renderOverlay(); return; }
    if (!del) return;
    const prev = snapshot();
    o.links = (o.links || []).filter(l => l.id !== del.dataset.pdel);
    if (!o.links.length) delete o.links;
    protoSel = { oid: o.id, iid: null };
    commit(prev); update();
  });
  function removeSelectedInteraction() {
    const o = protoSel && objById(protoSel.oid);
    if (!o || !o.links || !o.links.some(l => l.id === protoSel.iid)) return false;
    const prev = snapshot();
    o.links = o.links.filter(l => l.id !== protoSel.iid);
    if (!o.links.length) delete o.links;
    protoSel = { oid: o.id, iid: null };
    commit(prev); update(); toast('Arrow removed');
    return true;
  }

  const presentEl = document.createElement('div');
  presentEl.className = 'present'; presentEl.hidden = true;
  presentEl.setAttribute('role', 'dialog'); presentEl.setAttribute('aria-label', 'Presentation');
  document.body.appendChild(presentEl);
  let presentList = [], presentIdx = 0;
  function present(f) {
    presentList = topFrames().slice().sort((a, b) => a.x - b.x || a.y - b.y);
    while (f && parentOf(f)) f = parentOf(f); // present the screen a nested frame lives in
    if (!presentList.length) return toast('Add a frame first (press F), then present it');
    presentIdx = Math.max(0, presentList.indexOf(f));
    presentEl.hidden = false; renderPresent();
  }
  function renderPresent() {
    const f = presentList[presentIdx];
    const s = Math.min((innerWidth - 120) / f.w, (innerHeight - 140) / f.h, 1.4);
    presentEl.innerHTML = `<div class="pr-bar"><span class="pr-name">${esc(frameName(f))}</span><span class="pr-count">${presentIdx + 1} / ${presentList.length}</span><span class="grow"></span><span class="pr-hint">← → switch screens · Esc to exit</span><button type="button" class="pr-x" aria-label="Exit presentation"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div class="pr-stage"><div class="pr-frame" style="width:${f.w * s}px;height:${f.h * s}px"><div style="position:absolute;left:0;top:0;transform:scale(${s});transform-origin:0 0">${markup([f])}</div></div></div>`;
  }
  const closePresent = () => { presentEl.hidden = true; presentEl.innerHTML = ''; };
  presentEl.addEventListener('click', e => { if (e.target.closest('.pr-x') || e.target === presentEl) closePresent(); });
  $('#zoomPresent').onclick = () => present([...selO].map(objById).find(o => o && o.kind === 'frame') || null);

  const SOLO_KEY = 'sketch-to-ui:v1';
  const ROOM_PARAM = (() => { const r = new URLSearchParams(location.search).get('room'); return r && /^[a-z0-9-]{4,40}$/i.test(r) ? r : null; })();
  let SAVE_KEY = ROOM_PARAM ? 'scrib:room:' + ROOM_PARAM : SOLO_KEY; // a live room keeps its own copy
  let saveTimer;
  function save() {
    if (liveHooks.touch) liveHooks.touch();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ strokes, objects, nextId, view, enabled: [...enabled], penColor, penWidth })); } catch { /* storage full or blocked */ }
    }, 300);
  }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!d || !Array.isArray(d.strokes)) return false;
      strokes = d.strokes; objects = Array.isArray(d.objects) ? d.objects : []; nextId = d.nextId || 1;
      migrateParents(objects); // canvases saved before frames owned their contents
      migrateLinks(objects); // prototype interactions from an earlier version become plain arrows
      if (d.view && isFinite(d.view.z)) view = d.view;
      if (Array.isArray(d.enabled) && d.enabled.some(k => kitById(k))) { enabled.clear(); d.enabled.forEach(k => kitById(k) && enabled.add(k)); }
      if (d.penColor) penColor = d.penColor;
      if (d.penWidth) penWidth = d.penWidth;
      return strokes.length + objects.length > 0;
    } catch { return false; }
  }

  /** Bring forward / send backward (Ctrl+] / Ctrl+[), like Figma's layer order. */
  function reorder(dir) {
    const sel = objects.filter(o => selO.has(o.id));
    if (!sel.length) return;
    const prev = snapshot();
    for (const o of dir > 0 ? [...sel].reverse() : sel) {
      const i = objects.indexOf(o), j = i + dir;
      if (j < 0 || j >= objects.length || selO.has(objects[j].id)) continue;
      [objects[i], objects[j]] = [objects[j], objects[i]];
    }
    commit(prev); update();
  }

  // =========================================================================
  // Copy / paste with Figma
  //  • Copy → an SVG Figma turns into editable layers (rects, text, vectors, named groups).
  //    The same SVG carries this canvas's own objects in <metadata>, so pasting back here
  //    restores real components.
  //  • Paste ← this canvas's copies, SVG (Figma "Copy as SVG"), images (Figma "Copy as PNG"),
  //    dropped files, or plain text.
  // =========================================================================
  const META_ID = 'sketch-to-ui';
  const xmlEsc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const b64e = str => btoa(unescape(encodeURIComponent(str)));
  const b64d = str => decodeURIComponent(escape(atob(str)));

  function parseColor(c) {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    const hex = '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    return { hex, a: +a.toFixed(3) };
  }
  const paintAttr = (pfx, c, op = 1) => { const p = parseColor(c); if (!p) return null; const a = p.a * op; return `${pfx}="${p.hex}"${a < 1 ? ` ${pfx}-opacity="${+a.toFixed(3)}"` : ''}`; };

  function radiiOf(cs, w, h) {
    const one = v => { const n = parseFloat(v) || 0; return String(v).includes('%') ? (n / 100) * Math.min(w, h) : n; };
    const lim = Math.min(w, h) / 2;
    return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => Math.min(one(cs[k]), lim));
  }
  function rrPath(x, y, w, h, [tl, tr, br, bl]) {
    const f = v => +v.toFixed(2);
    return `M${f(x + tl)} ${f(y)}H${f(x + w - tr)}${tr ? `A${f(tr)} ${f(tr)} 0 0 1 ${f(x + w)} ${f(y + tr)}` : ''}V${f(y + h - br)}${br ? `A${f(br)} ${f(br)} 0 0 1 ${f(x + w - br)} ${f(y + h)}` : ''}H${f(x + bl)}${bl ? `A${f(bl)} ${f(bl)} 0 0 1 ${f(x)} ${f(y + h - bl)}` : ''}V${f(y + tl)}${tl ? `A${f(tl)} ${f(tl)} 0 0 1 ${f(x + tl)} ${f(y)}` : ''}Z`;
  }
  /** Figma fonts: map the CSS stack to an installed family, and lead with its PostScript name.
   *  Figma's SVG import rounds numeric weights (500 → Regular, 600 → Bold); a PostScript name like
   *  "Inter-SemiBold" makes it pick the exact style. Verified with Figma's own SVG importer. */
  const PS = {
    'SF Pro': { 100: 'Ultralight', 200: 'Thin', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Heavy', 900: 'Black', ps: 'SFPro' },
    Inter: { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black', ps: 'Inter' },
    Roboto: { 100: 'Thin', 300: 'Light', 400: 'Regular', 500: 'Medium', 700: 'Bold', 900: 'Black', ps: 'Roboto' },
    'Source Serif 4': { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', ps: 'SourceSerif4' },
  };
  function figmaFont(stack, weight) {
    const fams = stack.split(',').map(f => f.trim().replace(/^["']|["']$/g, ''));
    const fam = /^(-apple-system|BlinkMacSystemFont|SF Pro)/i.test(fams[0]) ? 'SF Pro'
      : fams.find(f => PS[f]) || (fams.find(f => ['Georgia', 'Helvetica Neue', 'Lato'].includes(f))) || 'Inter';
    const t = PS[fam];
    if (!t) return fam;
    const w = Number(weight) || 400;
    const near = Object.keys(t).filter(k => k !== 'ps').map(Number).sort((a, b) => Math.abs(a - w) - Math.abs(b - w))[0];
    return `${t.ps}-${t[near]}, ${fam}`;
  }
  /** Convert rendered DOM (offscreen, scale 1) into Figma-friendly SVG. */
  function domToSVG(host) {
    const origin = host.getBoundingClientRect();
    const defs = [];
    let uid = 0;
    const rel = r => ({ x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height });

    function gradient(cs, op) {
      const g = cs.backgroundImage;
      if (!g || !g.startsWith('linear-gradient')) return null;
      const deg = (g.match(/linear-gradient\(\s*([-\d.]+)deg/) || [0, 180])[1];
      const stops = [...g.matchAll(/(rgba?\([^)]+\))\s*([\d.]+%)?/g)].map((m, i, all) => ({ c: parseColor(m[1]), at: m[2] || `${(i / Math.max(1, all.length - 1)) * 100}%` })).filter(s => s.c);
      if (stops.length < 2) return null;
      const a = (Number(deg) - 90) * Math.PI / 180;
      const id = 'g' + uid++;
      defs.push(`<linearGradient id="${id}" x1="${(0.5 - Math.cos(a) / 2).toFixed(3)}" y1="${(0.5 - Math.sin(a) / 2).toFixed(3)}" x2="${(0.5 + Math.cos(a) / 2).toFixed(3)}" y2="${(0.5 + Math.sin(a) / 2).toFixed(3)}">${stops.map(s => `<stop offset="${s.at}" stop-color="${s.c.hex}"${s.c.a * op < 1 ? ` stop-opacity="${+(s.c.a * op).toFixed(3)}"` : ''}/>`).join('')}</linearGradient>`);
      return `fill="url(#${id})"`;
    }

    function textSVG(node, cs, op) {
      const raw = node.textContent.replace(/\s+/g, ' ');
      if (!raw.trim()) return '';
      const fill = paintAttr('fill', cs.color, op);
      if (!fill) return '';
      const fs = parseFloat(cs.fontSize);
      const attrs = `font-family="${xmlEsc(figmaFont(cs.fontFamily, cs.fontWeight))}" font-size="${+fs.toFixed(2)}" font-weight="${cs.fontWeight}"${cs.fontStyle === 'italic' ? ' font-style="italic"' : ''}${cs.letterSpacing !== 'normal' ? ` letter-spacing="${parseFloat(cs.letterSpacing)}"` : ''} ${fill}`;
      // Split into the lines the browser actually laid out.
      const range = document.createRange();
      const lines = [];
      const re = /\S+\s*/g; let m;
      while ((m = re.exec(node.textContent))) {
        range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
        const r = range.getClientRects()[0]; if (!r) continue;
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.top - r.top) < fs * 0.5) { last.text += m[0]; last.right = r.right; }
        else lines.push({ text: m[0], left: r.left, right: r.right, top: r.top, h: r.height });
      }
      return lines.map(l => {
        const x = l.left - origin.left, y = l.top - origin.top + l.h / 2 + fs * 0.35;
        return `<text ${attrs} x="${+x.toFixed(2)}" y="${+y.toFixed(2)}">${xmlEsc(l.text.trimEnd())}</text>`;
      }).join('');
    }

    function iconSVG(svg, b, color, op) {
      const vb = (svg.getAttribute('viewBox') || `0 0 ${svg.getAttribute('width') || b.w} ${svg.getAttribute('height') || b.h}`).split(/[\s,]+/).map(Number);
      const sx = b.w / (vb[2] || b.w), sy = b.h / (vb[3] || b.h);
      const hex = (parseColor(color) || { hex: '#000000' }).hex;
      const carry = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].filter(a => svg.hasAttribute(a)).map(a => `${a}="${svg.getAttribute(a).replace(/currentColor/g, hex)}"`).join(' ');
      const inner = svg.innerHTML.replace(/currentColor/g, hex);
      return `<g id="Icon" transform="translate(${+(b.x - vb[0] * sx).toFixed(2)} ${+(b.y - vb[1] * sy).toFixed(2)}) scale(${+sx.toFixed(4)} ${+sy.toFixed(4)})" ${carry || 'fill="' + hex + '"'}${op < 1 ? ` opacity="${op}"` : ''}>${inner}</g>`;
    }

    function imgSVG(img, b) {
      const src = img.getAttribute('src') || '';
      const m = src.match(/^data:image\/svg\+xml[^,]*,(.*)$/);
      if (m) { // inline pasted vectors so they stay editable in Figma
        const doc = new DOMParser().parseFromString(decodeURIComponent(m[1]), 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg && svg.nodeName.toLowerCase() === 'svg') return iconSVG(svg, b, '#000', 1).replace('id="Icon"', `id="${xmlEsc(img.alt || 'Vector')}"`);
      }
      return `<image href="${xmlEsc(src)}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" preserveAspectRatio="none"/>`;
    }

    function node(el, op) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return '';
      const b = rel(el.getBoundingClientRect());
      const o = op * parseFloat(cs.opacity || 1);
      if (el.namespaceURI === 'http://www.w3.org/2000/svg' && el.tagName.toLowerCase() === 'svg') return iconSVG(el, b, cs.color, o);
      if (el.tagName === 'IMG') return imgSVG(el, b);
      let shape = '';
      const rad = radiiOf(cs, b.w, b.h);
      const fill = gradient(cs, o) || paintAttr('fill', cs.backgroundColor, o);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const sides = ['Top', 'Right', 'Bottom', 'Left'];
      const uniform = bw > 0 && cs.borderTopStyle !== 'none' && sides.every(sd => parseFloat(cs[`border${sd}Width`]) === bw && cs[`border${sd}Style`] !== 'none');
      const stroke = uniform ? paintAttr('stroke', cs.borderTopColor, o) : null;
      if ((fill || stroke) && b.w > 0 && b.h > 0) {
        const inset = stroke ? bw / 2 : 0; // CSS borders sit inside the box
        const rr = rad.map(r => Math.max(0, r - inset)), paint = `${fill || 'fill="none"'}${stroke ? ` ${stroke} stroke-width="${bw}"` : ''}`;
        const f2 = v => +v.toFixed(2);
        // Equal corners → a real <rect>, which Figma imports as an editable Rectangle with corner radius.
        shape += rr.every(r => r === rr[0])
          ? `<rect x="${f2(b.x + inset)}" y="${f2(b.y + inset)}" width="${f2(b.w - 2 * inset)}" height="${f2(b.h - 2 * inset)}"${rr[0] ? ` rx="${f2(rr[0])}"` : ''} ${paint}/>`
          : `<path d="${rrPath(b.x + inset, b.y + inset, b.w - 2 * inset, b.h - 2 * inset, rr)}" ${paint}/>`;
      }
      if (!uniform) for (const sd of sides) { // single-side borders (dividers, underlines)
        const w = parseFloat(cs[`border${sd}Width`]) || 0;
        if (!w || cs[`border${sd}Style`] === 'none') continue;
        const st = paintAttr('stroke', cs[`border${sd}Color`], o); if (!st) continue;
        const [x1, y1, x2, y2] = { Top: [b.x, b.y + w / 2, b.x + b.w, b.y + w / 2], Bottom: [b.x, b.y + b.h - w / 2, b.x + b.w, b.y + b.h - w / 2], Left: [b.x + w / 2, b.y, b.x + w / 2, b.y + b.h], Right: [b.x + b.w - w / 2, b.y, b.x + b.w - w / 2, b.y + b.h] }[sd];
        shape += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${st} stroke-width="${w}"/>`;
      }
      let kids = '';
      for (const n of el.childNodes) {
        if (n.nodeType === 3) kids += textSVG(n, cs, o);
        else if (n.nodeType === 1) kids += node(n, o);
      }
      if (kids && cs.overflow === 'hidden') {
        const id = 'c' + uid++;
        defs.push(`<clipPath id="${id}"><path d="${rrPath(b.x, b.y, b.w, b.h, rad)}"/></clipPath>`);
        kids = `<g clip-path="url(#${id})">${kids}</g>`;
      }
      const name = el.dataset.name;
      return name ? `<g id="${xmlEsc(name)}">${shape}${kids}</g>` : shape + kids;
    }

    const body = [...host.children].map(el => node(el, 1)).join('');
    return { body, defs: defs.join('') };
  }

  /** The current selection as Figma-ready SVG, with this canvas's own objects embedded. */
  async function selectionSVG() {
    const roots = exportRoots();
    const sel = strokes.filter(s => selS.has(s.id));
    if (!roots.length && !sel.length) return null;
    const kids = roots.flatMap(o => descendantsOf(o.id));
    const box = bbox([...roots, ...kids, ...sel.map(info)].map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h })));
    const pad = sel.length ? 4 : 0;
    box.x -= pad; box.y -= pad; box.w += 2 * pad; box.h += 2 * pad;
    const W = Math.ceil(box.w), H = Math.ceil(box.h);

    const host = document.createElement('div');
    host.style.cssText = `position:fixed;left:-30000px;top:0;width:${W}px;height:${H}px;pointer-events:none;`;
    host.innerHTML = roots.map(o => nodeHTML(o, box.x, box.y, true)).join('');
    // Layer names, as a designer would name them in Figma
    const nameComp = (el, o) => { el.dataset.name = o.kind === 'asset' ? (o.name || 'Image') : `${kitById(o.kit).name} / ${kitById(o.kit).names[o.type]}`; };
    const nameTree = (el, o) => {
      if (!el || !o) return;
      if (o.kind !== 'frame') return nameComp(el, o);
      el.dataset.name = frameName(o);
      const kids = childrenOf(o.id);
      [...el.children].filter(c => c.matches('.el, .dev')).forEach((c, j) => nameTree(c, kids[j]));
      el.querySelector(':scope > .dsb')?.setAttribute('data-name', 'Status bar');
      el.querySelector(':scope > .d-island, :scope > .d-notch, :scope > .d-punch')?.setAttribute('data-name', 'Camera');
      el.querySelector(':scope > .d-hi, :scope > .d-gesture')?.setAttribute('data-name', 'Home indicator');
    };
    [...host.children].forEach((el, i) => nameTree(el, roots[i]));
    document.body.appendChild(host);
    try { await document.fonts.ready; } catch {}
    const { body, defs } = domToSVG(host);
    host.remove();

    const ink = sel.map(s => `<path d="${pathD(s.pts.map(([x, y]) => [x - box.x, y - box.y]))}" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join('');
    const payload = b64e(JSON.stringify({ app: META_ID, v: 1, objects: [...roots, ...kids], strokes: sel }));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none"><metadata id="${META_ID}">${payload}</metadata>${defs ? `<defs>${defs}</defs>` : ''}${body}${ink ? `<g id="Sketch">${ink}</g>` : ''}</svg>`;
    return { svg, count: roots.length + (sel.length ? 1 : 0), names: describe(roots) };
  }

  async function copyForFigma() {
    const b = selbar.querySelector('[data-act="figma"]');
    b.setAttribute('aria-busy', 'true'); b.textContent = 'Copying…';
    const out = await selectionSVG().finally(() => { b.removeAttribute('aria-busy'); b.textContent = 'Copy for Figma'; });
    if (!out) { toast('Select something to copy'); return false; }
    const ok = await copyText(out.svg);
    toast(ok ? `Copied ${out.names || 'sketch'}. Paste into Figma (Ctrl+V) or back here.` : 'Couldn’t reach the clipboard. Allow clipboard access and try again.', ok ? 2400 : 5000);
    return ok;
  }

  // ---- Paste ----------------------------------------------------------------
  function sanitizeSVG(text) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return null;
    svg.querySelectorAll('script, foreignObject, iframe, object, embed, metadata').forEach(n => n.remove());
    for (const n of [svg, ...svg.querySelectorAll('*')]) {
      for (const a of [...n.attributes]) {
        const nm = a.name.toLowerCase(), v = a.value.trim().toLowerCase();
        if (nm.startsWith('on')) n.removeAttribute(a.name);
        else if ((nm === 'href' || nm === 'xlink:href') && !(v.startsWith('#') || v.startsWith('data:image/'))) n.removeAttribute(a.name);
      }
    }
    if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return svg;
  }
  /** Where pasted things land: under the pointer if it is on screen, otherwise the centre of the view. */
  function pastePoint() {
    if (lastPointer) {
      const s = toScreen({ x: lastPointer[0], y: lastPointer[1], w: 0, h: 0 });
      if (s.x > 0 && s.y > 0 && s.x < innerWidth && s.y < innerHeight) return lastPointer;
    }
    return toWorld(innerWidth / 2, innerHeight / 2);
  }
  function place(newObjs, newStrokes, at, msg, rootsOnly = null) {
    const prev = snapshot();
    const box = bbox([...newObjs, ...newStrokes.map(info)]);
    if (box) {
      const dx = at[0] - (box.x + box.w / 2), dy = at[1] - (box.y + box.h / 2);
      newObjs.forEach(o => { o.x += dx; o.y += dy; });
      newStrokes.forEach(s => { s.pts = s.pts.map(([x, y]) => [x + dx, y + dy]); });
    }
    // Like Figma: a pasted top-level frame never lands on top of another frame; it moves to the right.
    if (newObjs.some(o => o.kind === 'frame' && o.parent == null)) {
      const others = () => topFrames();
      for (let guard = 0, nb = bbox(newObjs); guard < 50 && others().some(f => intersects(f, nb)); guard++, nb = bbox(newObjs)) {
        const sx = Math.max(...others().filter(f => intersects(f, nb)).map(f => f.x + f.w)) + 80 - nb.x;
        newObjs.forEach(o => { o.x += sx; });
        newStrokes.forEach(s => { s.pts = s.pts.map(([x, y]) => [x + sx, y]); });
      }
    }
    objects.push(...newObjs);
    for (const o of newObjs) if (!('parent' in o)) { const h = frameAt(o.x + o.w / 2, o.y + o.h / 2); o.parent = h && h.id !== o.id ? h.id : null; }
    strokes.push(...newStrokes);
    commit(prev);
    clearSel();
    (rootsOnly || newObjs).forEach(o => selO.add(o.id)); newStrokes.forEach(s => selS.add(s.id));
    setTool('select');
    update();
    if (box) ensureVisible(bbox([...newObjs, ...newStrokes.map(info)]));
    toast(msg);
  }
  function pasteOwn(payload) {
    let d; try { d = JSON.parse(b64d(payload)); } catch { return false; }
    if (!d || d.app !== META_ID) return false;
    const src = (d.objects || []).filter(o => o && ['frame', 'comp', 'asset'].includes(o.kind) && isFinite(o.x))
      .filter(o => o.kind !== 'comp' || (TYPES[o.type] && kitById(o.kit)))
      .filter(o => o.kind !== 'asset' || /^data:image\//.test(o.src || ''));
    migrateParents(src); // copies from before frames had parents
    const map = new Map(src.map(o => [o.id, nextId++]));
    // Like Figma: with one frame selected, paste goes inside it.
    const target = selO.size === 1 ? objById([...selO][0]) : null;
    const into = target && target.kind === 'frame' ? target : null;
    const objs = src.map(o => ({ ...o, id: map.get(o.id), parent: map.has(o.parent) ? map.get(o.parent) : (into ? into.id : null) }));
    const sks = (d.strokes || []).filter(s => Array.isArray(s.pts)).map(s => ({ ...s, id: nextId++, kept: false }));
    if (!objs.length && !sks.length) return false;
    const pasteRoots = objs.filter(o => !map.has(src.find(x => map.get(x.id) === o.id).parent));
    place(objs, sks, into ? [into.x + into.w / 2, into.y + into.h / 2] : pastePoint(), `Pasted ${describe(pasteRoots) || 'sketch'}${into ? ` into ${frameName(into)}` : ''}`, pasteRoots);
    return true;
  }
  function pasteSVG(text, name) {
    const svg = sanitizeSVG(text); if (!svg) return false;
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    let w = parseFloat(svg.getAttribute('width')) || vb[2] || 200, h = parseFloat(svg.getAttribute('height')) || vb[3] || 200;
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    const fit = Math.min(1, 900 / Math.max(w, h)); w *= fit; h *= fit;
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const layer = name || svg.querySelector('g[id]')?.getAttribute('id') || svg.getAttribute('id') || 'Vector';
    place([{ id: nextId++, kind: 'asset', x: 0, y: 0, w, h, src, svg: true, name: layer.slice(0, 60) }], [], pastePoint(), `Pasted vector “${layer.slice(0, 40)}” · ${Math.round(w)} × ${Math.round(h)}`);
    return true;
  }
  function pasteImage(file) {
    const r = new FileReader();
    r.onload = () => {
      const src = r.result;
      if (file.type === 'image/svg+xml') { pasteSVG(decodeURIComponent(escape(atob(src.split(',')[1]))), file.name?.replace(/\.svg$/i, '')); return; }
      const img = new Image();
      img.onload = () => {
        // Figma's "Copy as PNG" is 2× by default; show it at its design size when it looks like a 2× export.
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > 1200 || h > 1200) { const f = 1200 / Math.max(w, h); w *= f; h *= f; }
        place([{ id: nextId++, kind: 'asset', x: 0, y: 0, w, h, src, svg: false, name: (file.name || 'Image').replace(/\.\w+$/, '') }], [], pastePoint(), `Pasted image · ${Math.round(w)} × ${Math.round(h)}`);
      };
      img.src = src;
    };
    r.readAsDataURL(file);
  }
  const FIGMA_HELP = 'Figma’s normal copy uses a private format websites can’t read. In Figma, right-click → Copy/Paste as → Copy as SVG (or Copy as PNG), then paste here.';

  document.addEventListener('paste', e => {
    if (typing() || !modal.hidden) return;
    const dt = e.clipboardData; if (!dt) return;
    const text = dt.getData('text/plain') || '';
    const html = dt.getData('text/html') || '';
    const own = (text + html).match(new RegExp(`<metadata id="${META_ID}">([A-Za-z0-9+/=]+)</metadata>`));
    if (own && pasteOwn(own[1])) return e.preventDefault();
    const files = [...dt.files].filter(f => /^image\//.test(f.type));
    if (files.length) { e.preventDefault(); files.forEach(pasteImage); return; }
    const svgText = /^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text) ? text : (html.match(/<svg[\s\S]*<\/svg>/i) || [])[0];
    if (svgText && pasteSVG(svgText)) return e.preventDefault();
    if (/\(figma\)|figmeta|data-metadata/.test(html)) { e.preventDefault(); toast(FIGMA_HELP, 7000); return; }
    if (text.trim()) { // plain text → a text component in the first enabled library
      e.preventDefault();
      const kit = enabledKits()[0] || KITS[0];
      const lines = text.trim().split(/\n+/).slice(0, 12);
      const objs = lines.map((t, i) => ({ id: nextId++, kind: 'comp', type: i === 0 && t.length < 40 ? 'title' : 'body', kit: kit.id, label: t.slice(0, 300), x: 0, y: i * 52, w: 320, h: i === 0 && t.length < 40 ? kit.h.title : kit.h.body }));
      place(objs, [], pastePoint(), `Pasted text as ${objs.length} text layer${objs.length > 1 ? 's' : ''} (${kit.name})`);
    }
  });
  // Drop SVG / PNG / JPG files onto the canvas
  stage.addEventListener('dragover', e => { if ([...e.dataTransfer.items].some(i => i.kind === 'file')) { e.preventDefault(); stage.classList.add('dropping'); } });
  stage.addEventListener('dragleave', () => stage.classList.remove('dropping'));
  stage.addEventListener('drop', e => {
    stage.classList.remove('dropping');
    const files = [...e.dataTransfer.files].filter(f => /^image\//.test(f.type) || /\.svg$/i.test(f.name));
    if (!files.length) return;
    e.preventDefault();
    lastPointer = toWorld(e.clientX, e.clientY);
    files.forEach(f => pasteImage(f.type ? f : new File([f], f.name, { type: 'image/svg+xml' })));
  });

  const typing = () => /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  window.addEventListener('keydown', e => {
    if (!presentEl.hidden) {
      if (e.key === 'Escape') closePresent();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { presentIdx = (presentIdx + (e.key === 'ArrowRight' ? 1 : -1) + presentList.length) % presentList.length; renderPresent(); }
      e.preventDefault(); return;
    }
    if (!modal.hidden) { if (e.key === 'Escape') closeModal(); return; }
    if (typing()) { if (e.key === 'Escape') document.activeElement.blur(); return; }
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (pop && !mod) {
      const n = popEl.querySelectorAll('.tile').length;
      if (k.startsWith('arrow')) { e.preventDefault(); const cols = getComputedStyle(popEl.querySelector('.tiles')).gridTemplateColumns.split(' ').length; pop.idx = clamp(pop.idx + ({ arrowright: 1, arrowleft: -1, arrowdown: cols, arrowup: -cols }[k] || 0), 0, n - 1); popEl.querySelectorAll('.tile').forEach((t, j) => t.classList.toggle('on', j === pop.idx)); popEl.querySelector('.tile.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); renderGhost(); return; }
      if (k === 'enter') { e.preventDefault(); return placeCurrent(); }
      if (k === 'escape') { e.preventDefault(); return closePop(); }
      if (k === 'tab') { e.preventDefault(); return nextSketch(); }
      if (/^[1-9]$/.test(k) && Number(k) <= n) { pop.idx = Number(k) - 1; return placeCurrent(); }
    }
    if (e.code === 'Space' && !spaceDown) { spaceDown = true; stage.classList.add('space'); e.preventDefault(); return; }
    if (mod && e.key === '\\') { e.preventDefault(); setSidebar(sidebar.hidden); return; }
    if (!mod && !e.altKey && e.shiftKey && k === 'd') { e.preventDefault(); toggleTheme(); return; }
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && k === 'y') { e.preventDefault(); redo(); return; }
    if (mod && k === 'a') { e.preventDefault(); selS = new Set(strokes.map(s => s.id)); selO = new Set(objects.map(o => o.id)); setTool('select'); refreshSelection(); return; }
    if (mod && k === 'c' && e.shiftKey) { const r = exportRoots(); if (r.length) { e.preventDefault(); copyCode(r, 'react'); } return; }
    if (mod && k === 'c') { if (selO.size || selS.size) { e.preventDefault(); copyForFigma(); } return; }
    if (mod && k === 'x') { if (selO.size || selS.size) { e.preventDefault(); copyForFigma().then(ok => { if (ok) deleteSelection(); }); } return; }
    if (mod && k === 'd') { e.preventDefault(); duplicate(); return; }
    if (mod && e.altKey && k === 'g') { e.preventDefault(); wrapInFrame(); return; }       // Figma: Frame selection
    if (mod && e.shiftKey && k === 'g') { e.preventDefault(); unwrapFrame(); return; }     // remove frame, keep contents
    if (mod && e.altKey && k === 'enter') { e.preventDefault(); present([...selO].map(objById).find(o => o && o.kind === 'frame') || null); return; }
    if (mod && (e.code === 'BracketRight' || e.code === 'BracketLeft')) { e.preventDefault(); reorder(e.code === 'BracketRight' ? 1 : -1); return; }
    if (e.altKey && !mod && selO.size) {
      const al = { KeyA: 'left', KeyH: 'hcenter', KeyD: 'right', KeyW: 'top', KeyV: 'vcenter', KeyS: 'bottom' }[e.code];
      if (al) { e.preventDefault(); align(al); return; }
    }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomAt(1.2, innerWidth / 2, innerHeight / 2); return; }
    if (mod && k === '-') { e.preventDefault(); zoomAt(1 / 1.2, innerWidth / 2, innerHeight / 2); return; }
    if (mod && k === '0') { e.preventDefault(); zoomAt(1 / view.z, innerWidth / 2, innerHeight / 2); return; }
    if (mod) return;
    if (e.shiftKey && e.code === 'Digit1') { zoomToFit(); return; }
    if (k === 'v') setTool('select');
    else if (k === 'h') setTool('hand');
    else if (k === 'p' || k === 'b') setTool('pen');
    else if (k === 'f' || k === 'a') setTool('frame');
    else if (k === 'c') openVirtual('comp');
    else if (k === 'tab' && groups.length) { e.preventDefault(); startThinking(groups[0].key); }
    else if (k === 'escape') { clearSel(); closePalette(); refreshSelection(); }
    else if (k === 'delete' || k === 'backspace') { if (!(tool === 'proto' && protoSel && protoSel.iid && removeSelectedInteraction())) deleteSelection(); }
    else if (k.startsWith('arrow') && (selO.size || selS.size)) {
      e.preventDefault();
      const d = e.shiftKey ? 10 : 1, dx = k === 'arrowleft' ? -d : k === 'arrowright' ? d : 0, dy = k === 'arrowup' ? -d : k === 'arrowdown' ? d : 0;
      commit(snapshot());
      for (const o of selRoots()) moveBy(o, dx, dy); // frames carry their contents
      for (const s of strokes) if (selS.has(s.id)) for (const p of s.pts) { p[0] += dx; p[1] += dy; }
      update();
    }
  });
  window.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; stage.classList.remove('space'); } });

  // =========================================================================
  // Update cycle
  // =========================================================================
  // Read-only hook for checking recognition from the console.
  window.__sketchToUI = { layers: () => JSON.parse(JSON.stringify(objects)), tool: () => tool, groups: () => groups.map(g => ({ kind: g.kind, guess: g.options[0], options: g.options, desc: shapeDesc(g), strokes: g.strokeIds.length, rect: [Math.round(g.rect.x), Math.round(g.rect.y), Math.round(g.rect.w), Math.round(g.rect.h)] })) };

  function update() {
    normalizeTree();
    groups = computeGroups();
    const liveS = new Set(strokes.map(s => s.id)), liveO = new Set(objects.map(o => o.id));
    selS = new Set([...selS].filter(id => liveS.has(id)));
    selO = new Set([...selO].filter(id => liveO.has(id)));
    if (pop && !pop.virtual && !groupByKey(pop.key)) closePop();
    if (thinking && !groupByKey(thinking.key)) cancelThinking();
    renderInk(); renderObjects(); renderOverlay(); renderBadges(); renderInspector(); renderSidebar(); positionSelbar();
    if (pop) renderPop();
    $('#empty').classList.toggle('hidden', strokes.length + objects.length > 0);
    if (typeof updateGuide === 'function') updateGuide();
    $('#undo').disabled = !history.length; $('#redo').disabled = !future.length;
    save();
  }

  // =========================================================================
  // Example: the sketch from the Figma file (phone outline, rectangle, pill labelled "Button")
  // =========================================================================
  const wobble = (pts, a) => pts.map(([x, y], i) => [x + Math.sin(i * 0.7) * a + (Math.random() - 0.5) * a, y + Math.cos(i * 0.5) * a + (Math.random() - 0.5) * a]);
  function roundRect(x, y, w, h, r, n = 120) {
    const pts = [], per = 2 * (w + h - 4 * r) + 2 * Math.PI * r;
    const segs = [w - 2 * r, Math.PI * r / 2, h - 2 * r, Math.PI * r / 2, w - 2 * r, Math.PI * r / 2, h - 2 * r, Math.PI * r / 2];
    for (let i = 0; i <= n; i++) {
      let d = (i / n) * per, k = 0;
      while (k < 7 && d > segs[k]) { d -= segs[k]; k++; }
      const a = d / r;
      switch (k) {
        case 0: pts.push([x + r + d, y]); break;
        case 1: pts.push([x + w - r + Math.sin(a) * r, y + r - Math.cos(a) * r]); break;
        case 2: pts.push([x + w, y + r + d]); break;
        case 3: pts.push([x + w - r + Math.cos(a) * r, y + h - r + Math.sin(a) * r]); break;
        case 4: pts.push([x + w - r - d, y + h]); break;
        case 5: pts.push([x + r - Math.sin(a) * r, y + h - r + Math.cos(a) * r]); break;
        case 6: pts.push([x, y + h - r - d]); break;
        default: pts.push([x + r - Math.cos(a) * r, y + r - Math.sin(a) * r]);
      }
    }
    return pts;
  }
  const scribble = (x, y, w, h) => Array.from({ length: 27 }, (_, i) => [x + (i / 26) * w, y + h / 2 + Math.sin(i * 1.9) * h / 2]);
  function loadExample() {
    const prev = snapshot();
    const box = contentBox();
    const ph = 560, pw = ph * 0.72;
    let px, py;
    if (box) { px = box.x + box.w + 200; py = box.y; }
    else { const [cx, cy] = toWorld(innerWidth / 2, innerHeight / 2); px = cx - pw - 140; py = cy - ph / 2 - 20; }
    const add = (pts, w = 2.6) => { const s = { id: nextId++, pts, color: penColor, width: w }; strokes.push(s); return s.id; };
    const frameId = add(wobble(roundRect(px, py, pw, ph, 40, 220), 1.2));
    add(wobble(roundRect(px + pw * 0.1, py + ph * 0.12, pw * 0.78, ph * 0.3, 8), 1.5));
    add(wobble(roundRect(px + pw * 0.05, py + ph * 0.66, pw * 0.9, ph * 0.11, ph * 0.05), 1.2));
    const bx = px + pw * 0.36, by = py + ph * 0.695, bh = ph * 0.04;
    add(scribble(bx, by, pw * 0.09, bh), 2); add(scribble(bx + pw * 0.11, by, pw * 0.1, bh), 2); add(scribble(bx + pw * 0.23, by, pw * 0.08, bh), 2);
    commit(prev);
    update();
    // Make sure the example is on screen, even on a phone.
    if (box) zoomToFit(); else ensureVisible(bbox(strokes.slice(-6).map(info)));
    void frameId; // tags appear on each shape; click one when ready
    badgesReady = true; renderBadges();
  }

  // =========================================================================
  // Live mode: up to 10 people in one room see each other's cursors and ink
  // as it is drawn, and every edit syncs. Transport is the bundled Node relay
  // (Server-Sent Events) or, on a static host, Supabase Realtime (live-config.js).
  // Each change is sent as a per-layer diff, so people editing different layers
  // never overwrite each other; undo only reverts your own changes.
  // =========================================================================
  const LIVE_MAX = 10;
  const LIVE_COLORS = ['#d1242f', '#2c63e8', '#15803d', '#c2410c', '#7c3aed', '#be185d', '#0e7490', '#a16207', '#0f766e', '#475569']; // all ≥ 4.5:1 with white text
  const NAMES_A = ['Swift', 'Quiet', 'Bright', 'Bold', 'Calm', 'Clever', 'Lucky', 'Sunny', 'Brave', 'Gentle', 'Rapid', 'Witty'];
  const NAMES_B = ['Otter', 'Falcon', 'Panda', 'Fox', 'Heron', 'Lynx', 'Koala', 'Robin', 'Tiger', 'Whale', 'Owl', 'Gecko'];
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const randId = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
  const roundNum = (k, v) => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v);
  const J = x => JSON.stringify(x, roundNum);
  const CHUNK = 48000; // bytes per message; realtime services cap payload size

  const live = {
    on: false, host: false, room: null, tr: null, kind: null, status: 'off', synced: false, joinedAt: 0,
    me: { id: randId(12), name: (lsGet('scrib:name') || `${pickOne(NAMES_A)} ${pickOne(NAMES_B)}`).slice(0, 24), since: Date.now() + Math.random() },
    peers: [], cursors: new Map(), drawing: new Map(), // peer id -> stroke ids they're still drawing
    sentS: new Map(), sentLen: new Map(), sentLast: new Map(), sentO: new Map(), sentOrder: '',
    dirty: false, cur: null, curSent: null, timer: null,
    seq: 0, log: [], snap: null, helloTimer: null, helloTries: 0, myStart: 0, avail: undefined, pendingRoom: null,
  };
  const cursorsEl = $('#cursors'), liveBtn = $('#liveBtn'), livePanel = $('#livePanel'), liveFaces = $('#liveFaces');
  const liveTick = () => (live.kind === 'supabase' ? 40 + 30 * live.peers.length : 40);
  const isMine = id => id >= live.myStart && id < live.myStart + 1e6;

  liveHooks.seq = () => live.seq;
  liveHooks.touch = () => { if (live.on) { live.dirty = true; liveSchedule(); } };
  // Cursor = [x, y, tool]; the tool letter lets others see a pencil while you draw, a hand while you pan.
  const TOOL_CODE = { pen: 'p', hand: 'h', frame: 'f', select: 's' };
  liveHooks.cursor = p => { if (!live.on) return; live.cur = p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10, (drag && drag.mode === 'pan') || spaceDown ? 'h' : TOOL_CODE[tool] || 's'] : null; liveSchedule(); };
  liveHooks.view = () => { if (live.cursors.size) positionCursors(); };
  liveHooks.strokeDone = id => { live.sentS.delete(id); }; // finished strokes are always resent whole
  liveHooks.busy = () => { const b = new Set(); if (live.on) for (const ids of live.drawing.values()) ids.forEach(id => b.add(id)); return b; };
  liveHooks.restored = d => { // undo / redo: keep everyone else's changes made since that snapshot
    if (!live.on) return;
    const hasS = new Set(strokes.map(s => s.id)), hasO = new Set(objects.map(o => o.id));
    for (const { seq, m } of live.log) if (seq > (d.lseq || 0)) applyOps(m, { replay: true, hasS, hasO });
  };

  // ---------- transports ----------
  function relayTransport(h) {
    let es = null, closed = false, opened = 0, queue = Promise.resolve(), ready, setReady;
    const resetReady = () => { ready = new Promise(r => { setReady = r; }); };
    resetReady();
    const qs = () => `room=${encodeURIComponent(live.room)}&id=${live.me.id}`;
    const post = body => fetch(`/live/send?${qs()}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      .then(r => { if (!r.ok && r.status !== 409) throw new Error(r.status); })
      .catch(() => { if (!closed) h.status('reconnecting'); });
    return {
      connect() {
        es = new EventSource(`/live/events?${qs()}&name=${encodeURIComponent(live.me.name)}&since=${live.me.since}`);
        es.onopen = () => { h.status('live'); setReady(); if (opened++) h.reopened(); };
        es.onerror = () => { if (closed) return; h.status('reconnecting'); resetReady(); };
        es.addEventListener('full', () => { closed = true; es.close(); h.full(); });
        es.onmessage = e => {
          let d; try { d = JSON.parse(e.data); } catch { return; }
          if (d.t === 'peers') h.peers(d.peers);
          else if (d.t === 'msg') h.message(d.from, d.msg);
        };
      },
      send(msg) { const body = J(msg); queue = queue.then(() => ready).then(() => (closed ? null : post(body))); },
      rename(name) { this.send({ t: 'name', name }); },
      close() { closed = true; if (es) es.close(); },
    };
  }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); });
  }
  let sbClient = null; // one Supabase client (one socket) for the room and the directory
  async function supa(cfg) {
    if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.80.0/dist/umd/supabase.js');
    if (!sbClient) sbClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 40 } } });
    return sbClient;
  }
  function supabaseTransport(h, cfg) {
    let client = null, ch = null, closed = false, subscribed = 0;
    return {
      async connect() {
        client = await supa(cfg);
        if (closed) return;
        ch = client.channel('scrib-' + live.room, { config: { broadcast: { self: false }, presence: { key: live.me.id } } });
        ch.on('broadcast', { event: 'm' }, ({ payload }) => { if (payload) h.message(payload.from, payload.msg); });
        ch.on('presence', { event: 'sync' }, () => {
          const st = ch.presenceState();
          h.peers(Object.entries(st).map(([id, metas]) => ({ id, name: (metas[0] && metas[0].name) || 'Guest', since: (metas[0] && metas[0].since) || 0 })));
        });
        ch.subscribe(async status => {
          if (closed) return;
          if (status === 'SUBSCRIBED') { await ch.track({ name: live.me.name, since: live.me.since }); h.status('live'); if (subscribed++) h.reopened(); }
          else h.status('reconnecting');
        });
      },
      send(msg) { if (ch && !closed) ch.send({ type: 'broadcast', event: 'm', payload: { from: live.me.id, msg: JSON.parse(J(msg)) } }); },
      rename(name) { if (ch) ch.track({ name, since: live.me.since }); },
      close() { closed = true; if (client && ch) client.removeChannel(ch); },
    };
  }
  async function liveAvailable() {
    if (live.avail !== undefined) return live.avail;
    const cfg = window.SCRIB_LIVE || {};
    if (cfg.supabaseUrl && cfg.supabaseKey) return (live.avail = { kind: 'supabase', cfg });
    try {
      const r = await fetch('/live/ping', { cache: 'no-store' });
      if (r.ok && (await r.json()).ok) return (live.avail = { kind: 'relay' });
    } catch { /* no relay on this host */ }
    return (live.avail = null);
  }

  // ---------- incoming ----------
  const handlers = {
    status(s) { live.status = s; renderLive(); },
    full() { liveStop(); toast('That live room is full (10 people). Try again in a moment.', 4200); },
    peers(list) {
      const all = list.some(p => p.id === live.me.id) ? [...list] : [...list, { id: live.me.id, name: live.me.name, since: live.me.since }];
      all.sort((a, b) => a.since - b.since || (a.id < b.id ? -1 : 1));
      if (all.findIndex(p => p.id === live.me.id) >= LIVE_MAX) return handlers.full();
      live.peers = all.slice(0, LIVE_MAX).map((p, i) => ({ id: p.id, name: p.id === live.me.id ? live.me.name : p.name, since: p.since, color: LIVE_COLORS[i] }));
      for (const [id, c] of live.cursors) if (!live.peers.some(p => p.id === id)) { c.el.remove(); live.cursors.delete(id); }
      for (const id of live.drawing.keys()) if (!live.peers.some(p => p.id === id)) live.drawing.delete(id);
      if (!live.synced) requestState();
      renderLive(); positionCursors();
      cursorsEl.style.setProperty('--live-tick', liveTick() + 'ms');
    },
    message(from, m) {
      if (!live.on || !m || from === live.me.id || (m.to && m.to !== live.me.id)) return;
      if ('c' in m) moveCursor(from, m.c);
      if (m.t === 'ops' && (m.us || m.ap)) { if (m.dr) live.drawing.set(from, m.dr); else live.drawing.delete(from); }
      if (m.t === 'hello') { if (live.synced && isResponder(from)) sendSnap(from); }
      else if (m.t === 'ops') {
        if (m.us || m.ap || m.rs || m.uo || m.ro || m.oo) {
          applyOps(m); live.log.push({ seq: ++live.seq, m }); if (live.log.length > 3000) live.log.splice(0, 1000);
          liveRefresh();
        }
      }
      else if (m.t === 'snap') takeSnap(m);
      else if (m.t === 'bye') removeCursor(from);
    },
    reopened() { live.synced = false; live.helloTries = 0; requestState(); }, // missed messages while offline: fetch the room again
  };

  function requestState() {
    clearTimeout(live.helloTimer);
    const others = live.peers.filter(p => p.id !== live.me.id);
    if (!others.length) {
      // Alone in the room. A joiner waits a moment in case the others haven't shown up yet.
      if (!live.host && Date.now() - live.joinedAt < 1600) { live.helloTimer = setTimeout(requestState, 1700 - (Date.now() - live.joinedAt)); return; }
      return markSynced();
    }
    if (live.helloTries >= 4) return markSynced();
    live.helloTries++;
    live.tr.send({ t: 'hello' });
    live.helloTimer = setTimeout(() => { if (!live.synced) requestState(); }, 2500);
  }
  function markSynced() {
    clearTimeout(live.helloTimer);
    live.synced = true; live.dirty = true; renderLive(); liveSchedule();
  }
  function isResponder(asker) {
    const first = live.peers.find(p => p.id !== asker);
    return first && first.id === live.me.id;
  }
  function sendSnap(to) {
    const sid = randId(6), parts = [];
    let cur = { s: [], o: [] }, size = 0;
    const add = (k, item) => {
      const j = J(item);
      if (size + j.length > CHUNK && (cur.s.length || cur.o.length)) { parts.push(cur); cur = { s: [], o: [] }; size = 0; }
      cur[k].push(JSON.parse(j)); size += j.length;
    };
    strokes.forEach(s => add('s', s)); objects.forEach(o => add('o', o));
    parts.push(cur);
    parts.forEach((p, i) => live.tr.send({ t: 'snap', to, sid, part: i, of: parts.length, s: p.s, o: p.o }));
  }
  function takeSnap(m) {
    if (live.synced) return;
    if (!live.snap || live.snap.sid !== m.sid) live.snap = { sid: m.sid, parts: [] };
    live.snap.parts[m.part] = m;
    if (live.snap.parts.filter(Boolean).length < m.of) return;
    const parts = live.snap.parts; live.snap = null;
    strokes = parts.flatMap(p => p.s || []); objects = parts.flatMap(p => p.o || []);
    live.sentS.clear(); live.sentLen.clear(); live.sentLast.clear(); live.sentO.clear();
    for (const s of strokes) { live.sentS.set(s.id, J(s)); live.sentLen.set(s.id, s.pts.length); live.sentLast.set(s.id, J(s.pts[s.pts.length - 1])); }
    for (const o of objects) live.sentO.set(o.id, J(o));
    live.sentOrder = objects.map(o => o.id).join(',');
    history.length = 0; future.length = 0; live.log = []; // the room's history isn't yours to undo
    clearSel(); closePop();
    live.synced = true; clearTimeout(live.helloTimer);
    liveRefresh(); renderLive();
    if (strokes.length + objects.length) zoomToFit();
  }

  function upsert(list, item) {
    const cur = list.find(x => x.id === item.id);
    if (!cur) { list.push(item); return; }
    for (const k of Object.keys(cur)) if (!(k in item)) delete cur[k];
    Object.assign(cur, item); // keep identity: an in-progress drag may hold this object
  }
  function applyOps(m, opt = {}) {
    const { replay, hasS, hasO } = opt;
    const track = !replay;
    for (const s of m.us || []) {
      if (replay && !hasS.has(s.id) && isMine(s.id)) continue;
      const item = { ...s, pts: s.pts.map(p => [...p]) };
      upsert(strokes, item);
      if (track) { live.sentS.set(s.id, J(item)); live.sentLen.set(s.id, item.pts.length); live.sentLast.set(s.id, J(item.pts[item.pts.length - 1])); }
    }
    for (const [id, n, add] of m.ap || []) {
      const s = strokes.find(x => x.id === id);
      if (!s || s.pts.length < n) continue;
      s.pts.length = n; s.pts.push(...add.map(p => [...p]));
      if (track) { live.sentS.set(id, J(s)); live.sentLen.set(id, s.pts.length); live.sentLast.set(id, J(s.pts[s.pts.length - 1])); }
    }
    if (m.rs && m.rs.length) {
      const r = new Set(m.rs); strokes = strokes.filter(s => !r.has(s.id));
      if (track) m.rs.forEach(id => { live.sentS.delete(id); live.sentLen.delete(id); live.sentLast.delete(id); });
    }
    for (const o of m.uo || []) {
      if (replay && !hasO.has(o.id) && isMine(o.id)) continue;
      upsert(objects, { ...o });
      if (track) live.sentO.set(o.id, J(o));
    }
    if (m.ro && m.ro.length) {
      const r = new Set(m.ro); objects = objects.filter(o => !r.has(o.id));
      if (track) m.ro.forEach(id => live.sentO.delete(id));
    }
    if (m.oo) {
      const pos = new Map(m.oo.map((id, i) => [id, i]));
      objects = [...objects.filter(o => pos.has(o.id)).sort((a, b) => pos.get(a.id) - pos.get(b.id)), ...objects.filter(o => !pos.has(o.id))];
      if (track) live.sentOrder = objects.map(o => o.id).join(',');
    }
  }
  /** Repaint after someone else's change without disturbing what you're doing. */
  function liveRefresh() {
    normalizeTree();
    groups = computeGroups();
    const hasS = new Set(strokes.map(s => s.id)), hasO = new Set(objects.map(o => o.id));
    selS = new Set([...selS].filter(id => hasS.has(id)));
    selO = new Set([...selO].filter(id => hasO.has(id)));
    if (pop && !pop.virtual && !groupByKey(pop.key)) closePop();
    if (thinking && !groupByKey(thinking.key)) cancelThinking();
    renderInk();
    if (drag && drag.mode === 'pen') drag.el = ink.children[strokes.indexOf(drag.s)] || drag.el;
    renderObjects(); renderOverlay(); renderBadges(); renderSidebar(); positionSelbar();
    if (!inspector.contains(document.activeElement)) renderInspector();
    $('#empty').classList.toggle('hidden', strokes.length + objects.length > 0);
    save();
  }

  // ---------- outgoing ----------
  function liveSchedule() {
    if (!live.on || live.timer) return;
    live.timer = setTimeout(liveFlush, liveTick());
  }
  function liveFlush() {
    live.timer = null;
    if (!live.on || !live.tr) return;
    const head = { t: 'ops' }, items = [];
    let changed = false;
    if (live.cur !== live.curSent) { head.c = live.cur; live.curSent = live.cur; changed = true; }
    if (live.dirty && live.synced) {
      live.dirty = false;
      const pen = drag && drag.mode === 'pen' ? drag.s : null;
      const ap = [], rs = [], ro = [];
      const seenS = new Set(), seenO = new Set();
      for (const s of strokes) {
        seenS.add(s.id);
        const j = J(s);
        if (live.sentS.get(s.id) === j) continue;
        const n = live.sentLen.get(s.id);
        if (s === pen && n && s.pts.length > n && J(s.pts[n - 1]) === live.sentLast.get(s.id)) ap.push([s.id, n, JSON.parse(J(s.pts.slice(n)))]);
        else items.push(['us', JSON.parse(j), j.length]);
        live.sentS.set(s.id, j); live.sentLen.set(s.id, s.pts.length); live.sentLast.set(s.id, J(s.pts[s.pts.length - 1]));
      }
      for (const id of [...live.sentS.keys()]) if (!seenS.has(id)) { live.sentS.delete(id); live.sentLen.delete(id); live.sentLast.delete(id); rs.push(id); }
      for (const o of objects) {
        seenO.add(o.id);
        const j = J(o);
        if (live.sentO.get(o.id) === j) continue;
        items.push(['uo', JSON.parse(j), j.length]); live.sentO.set(o.id, j);
      }
      for (const id of [...live.sentO.keys()]) if (!seenO.has(id)) { live.sentO.delete(id); ro.push(id); }
      const order = objects.map(o => o.id).join(',');
      if (order !== live.sentOrder) { head.oo = objects.map(o => o.id); live.sentOrder = order; }
      if (ap.length) head.ap = ap;
      if (pen) head.dr = [pen.id];
      if (rs.length) head.rs = rs;
      if (ro.length) head.ro = ro;
      if (ap.length || rs.length || ro.length || head.oo || items.length) changed = true;
    }
    if (!changed) return;
    // Pack layer updates into messages under the size cap.
    let msg = head, size = J(head).length;
    for (const [k, item, len] of items) {
      if (size + len > CHUNK && (msg.us || msg.uo)) { live.tr.send(msg); msg = { t: 'ops' }; size = 20; }
      (msg[k] || (msg[k] = [])).push(item); size += len;
    }
    live.tr.send(msg);
  }

  // ---------- cursors ----------
  function moveCursor(id, c) {
    const p = live.peers.find(x => x.id === id);
    if (!p) return;
    let cur = live.cursors.get(id);
    if (!c) { if (cur) cur.el.classList.add('away'); return; }
    if (!cur) {
      const el = document.createElement('div');
      el.className = 'rc';
      el.innerHTML = `<span class="rc-icon"></span><span class="rc-name"></span>`;
      cursorsEl.appendChild(el);
      cur = { el, x: 0, y: 0, tool: null };
      live.cursors.set(id, cur);
      requestAnimationFrame(() => el.classList.add('in'));
    }
    cur.el.classList.remove('away');
    cur.x = c[0]; cur.y = c[1];
    const t = CURSOR_ICONS[c[2]] ? c[2] : 's';
    if (cur.tool !== t) { cur.tool = t; cur.el.dataset.tool = t; cur.el.querySelector('.rc-icon').innerHTML = CURSOR_ICONS[t]; }
    positionCursor(id, cur);
  }
  // Each icon is drawn so its hotspot sits at the element's origin (see .rc[data-tool] in app.css).
  const CURSOR_ICONS = {
    s: '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M4 3l13.5 6.9-5.9 1.7-2.8 5.8z" fill="var(--c)" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    p: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-5L15.6 4.7a2 2 0 0 1 2.8 0l.9.9a2 2 0 0 1 0 2.8L9 18.7z" fill="var(--c)" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 20l1.3-5 3.7 3.7z" fill="#fff"/></svg>',
    h: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12.5" r="11" fill="#fff"/><path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v6M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L3.6 15a1.6 1.6 0 0 1 2.4-2.1L8 15" fill="none" stroke="var(--c)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    f: '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M11 3v16M3 11h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M11 3v16M3 11h16" stroke="var(--c)" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  function positionCursor(id, cur) {
    const p = live.peers.find(x => x.id === id);
    if (!p) return;
    cur.el.style.setProperty('--c', p.color);
    const n = cur.el.querySelector('.rc-name'); if (n.textContent !== p.name) n.textContent = p.name;
    cur.el.style.transform = `translate(${cur.x * view.z + view.x}px, ${cur.y * view.z + view.y}px)`;
  }
  function positionCursors() { for (const [id, c] of live.cursors) positionCursor(id, c); }
  function removeCursor(id) { const c = live.cursors.get(id); if (c) { c.el.remove(); live.cursors.delete(id); } }

  // ---------- session ----------
  const roomUrl = () => `${location.origin}${location.pathname}?room=${live.room}`;
  async function liveStart(room, host) {
    if (live.on) return;
    const avail = await liveAvailable();
    if (!avail) { renderLive(); toast('Live mode isn’t set up on this host yet.', 3600); return false; }
    live.on = true; live.host = host; live.room = room; live.kind = avail.kind;
    live.synced = false; live.helloTries = 0; live.joinedAt = Date.now(); live.status = 'connecting';
    live.sentS.clear(); live.sentLen.clear(); live.sentLast.clear(); live.sentO.clear(); live.sentOrder = '';
    live.log = []; live.seq = 0; live.cur = live.curSent = null;
    // Each person creates ids in their own range so two people never mint the same id.
    nextId = Math.max(nextId, (1 + Math.floor(Math.random() * 8e6)) * 1e6);
    live.myStart = nextId;
    window.history.replaceState(null, '', `?room=${room}`);
    SAVE_KEY = 'scrib:room:' + room;
    if (!host) { // joining: show the room's last known copy (if any) until the live state arrives
      strokes = []; objects = []; history.length = 0; future.length = 0;
      load(); clearSel(); closePop(); update();
    }
    live.peers = [{ id: live.me.id, name: live.me.name, since: live.me.since, color: LIVE_COLORS[0] }];
    live.tr = avail.kind === 'supabase' ? supabaseTransport(handlers, avail.cfg) : relayTransport(handlers);
    renderLive();
    try { await live.tr.connect(); }
    catch { liveStop(); toast('Couldn’t reach the live server. Check your connection and try again.', 4200); return false; }
    save();
    dirEnsure().then(dirTrack);
    return true;
  }
  function liveStop() {
    if (!live.on) return;
    try { live.tr.send({ t: 'bye' }); } catch { /* already closed */ }
    try { live.tr.close(); } catch { /* already closed */ }
    clearTimeout(live.timer); clearTimeout(live.helloTimer);
    if (dir.tr) dir.tr.untrack();
    live.on = false; live.tr = null; live.timer = null; live.status = 'off'; live.synced = false; live.peers = [];
    for (const c of live.cursors.values()) c.el.remove();
    live.cursors.clear(); live.drawing.clear();
    window.history.replaceState(null, '', location.pathname);
    // Back to your own canvas.
    SAVE_KEY = SOLO_KEY;
    strokes = []; objects = []; history.length = 0; future.length = 0;
    load(); clearSel(); closePop(); update(); applyView();
    renderLive(); renderDir(); dirMaybeClose();
  }
  addEventListener('pagehide', () => { if (live.on && live.tr) { try { live.tr.send({ t: 'bye' }); live.tr.close(); } catch { /* closing */ } } });

  // ---------- directory: everyone live on Scrib right now ----------
  // Relay: the server streams who's in which room. Supabase: a site-wide presence
  // channel. It's open while you're live, or while the Live panel is open.
  const dir = { users: [], tr: null, ready: false };
  const ROOM_RE = /^[a-z0-9-]{4,40}$/i;
  const cleanName = n => String(n || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  const asUser = (id, m) => (m && ROOM_RE.test(m.room || '') ? { id, name: cleanName(m.name) || 'Guest', room: m.room, since: Number(m.since) || 0 } : null);
  function dirRelay(onList) {
    const es = new EventSource('/live/lobby');
    es.onmessage = e => { let d; try { d = JSON.parse(e.data); } catch { return; } if (d.t === 'lobby' && Array.isArray(d.users)) onList(d.users.map(u => asUser(u.id, u)).filter(Boolean)); };
    return { track() {}, untrack() {}, close() { es.close(); } }; // the relay knows who's live from the rooms
  }
  function dirSupabase(onList, cfg) {
    let ch = null, closed = false, subscribed = false, meta = null;
    (async () => {
      const client = await supa(cfg);
      if (closed) return;
      ch = client.channel('scrib-lobby', { config: { presence: { key: live.me.id } } });
      ch.on('presence', { event: 'sync' }, () => onList(Object.entries(ch.presenceState()).map(([id, metas]) => asUser(id, metas[0])).filter(Boolean)));
      ch.subscribe(async status => {
        if (closed) return;
        subscribed = status === 'SUBSCRIBED';
        if (subscribed && meta) await ch.track(meta);
      });
    })().catch(() => { /* offline: the list just stays empty */ });
    return {
      track(m) { meta = m; if (ch && subscribed) ch.track(m); },
      untrack() { meta = null; if (ch && subscribed) ch.untrack(); },
      close() { closed = true; if (ch && sbClient) sbClient.removeChannel(ch); },
    };
  }
  async function dirEnsure() {
    if (dir.tr) return;
    const avail = await liveAvailable();
    if (!avail || dir.tr) return;
    dir.tr = avail.kind === 'supabase' ? dirSupabase(onDir, avail.cfg) : dirRelay(onDir);
    renderDir();
  }
  function dirTrack() { if (dir.tr && live.on) dir.tr.track({ name: live.me.name, room: live.room, since: live.me.since }); }
  function dirMaybeClose() {
    if (live.on || !livePanel.hidden || !dir.tr) return;
    dir.tr.close(); dir.tr = null; dir.ready = false; dir.users = [];
  }
  function onDir(users) { dir.users = users; dir.ready = true; renderDir(); renderLive(); }
  const byJoin = (a, b) => a.since - b.since || (a.id < b.id ? -1 : 1);
  function roomsNow() {
    const users = [...dir.users];
    if (live.on && !users.some(u => u.id === live.me.id)) users.push({ id: live.me.id, name: live.me.name, room: live.room, since: live.me.since });
    const map = new Map();
    for (const u of users) { if (!map.has(u.room)) map.set(u.room, []); map.get(u.room).push(u); }
    return { users, rooms: [...map].map(([room, us]) => ({ room, us: us.sort(byJoin) })) };
  }
  const canvasOf = us => (us[0].id === live.me.id ? 'Your canvas' : `${us[0].name}’s canvas`);
  function renderDir() {
    const list = $('#liveRooms'), count = $('#liveDirCount');
    if (live.avail === null) { list.innerHTML = ''; count.textContent = ''; $('.lp-dir').hidden = true; return; }
    $('.lp-dir').hidden = false;
    const { users, rooms } = roomsNow();
    if (!dir.ready && !users.length) { list.innerHTML = '<li class="lp-empty">Looking for people…</li>'; count.textContent = ''; return; }
    count.textContent = users.length ? `${users.length} ${users.length === 1 ? 'person' : 'people'}` : '';
    if (!rooms.length) { list.innerHTML = '<li class="lp-empty">No one’s live right now. Go live and be the first.</li>'; return; }
    rooms.sort((a, b) => (b.room === live.room) - (a.room === live.room) || b.us.length - a.us.length || a.us[0].since - b.us[0].since);
    list.innerHTML = rooms.map(({ room, us }) => {
      const here = live.on && room === live.room, full = us.length >= LIVE_MAX;
      const names = us.slice(0, 3).map(u => (u.id === live.me.id ? 'You' : u.name)).join(', ') + (us.length > 3 ? ` +${us.length - 3}` : '');
      const faces = us.slice(0, 3).map((u, i) => `<span class="face" style="--c:${LIVE_COLORS[i]}" aria-hidden="true">${esc(initials(u.name))}</span>`).join('');
      const action = here ? '<span class="lp-tag">You’re here</span>'
        : full ? '<span class="lp-tag">Full</span>'
        : `<button type="button" class="btn btn-secondary lp-join" data-join="${room}" aria-label="Join ${esc(canvasOf(us))}">Join</button>`;
      return `<li class="lp-room${here ? ' here' : ''}"><span class="lp-faces">${faces}</span><span class="lp-room-txt"><span class="lp-room-name"><b>${esc(canvasOf(us))}</b><span class="lp-n" title="${us.length} of ${LIVE_MAX} people">${us.length}/${LIVE_MAX}</span></span><span>${esc(names)}</span></span>${action}</li>`;
    }).join('');
  }

  // ---------- usernames ----------
  function nameError(name) {
    if (name.length < 2) return 'Use at least 2 characters.';
    if (!/^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u.test(name)) return 'Use letters, numbers, spaces, dots, dashes or underscores.';
    const lower = name.toLocaleLowerCase();
    if (dir.users.some(u => u.id !== live.me.id && u.name.toLocaleLowerCase() === lower)) return `“${name}” is already live. Pick another username.`;
    return null;
  }
  function showNameErr(which, msg) {
    const el = $(which === 'on' ? '#liveNameErrOn' : '#liveNameErrOff'), inp = $(which === 'on' ? '#liveNameOn' : '#liveNameOff');
    el.textContent = msg || ''; el.hidden = !msg; inp.setAttribute('aria-invalid', String(!!msg));
  }
  function setMyName(name) {
    live.me.name = name; lsSet('scrib:name', name);
    $('#liveNameOff').value = name; $('#liveNameOn').value = name;
    const me = live.peers.find(p => p.id === live.me.id); if (me) me.name = name;
  }

  // ---------- UI ----------
  const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  function renderLive() {
    const on = live.on;
    liveBtn.dataset.state = on ? live.status : 'off';
    liveBtn.querySelector('.lbl').textContent = on ? (live.status === 'live' ? 'Live' : live.status === 'reconnecting' ? 'Reconnecting' : 'Connecting') : live.pendingRoom ? 'Join' : 'Live';
    liveBtn.setAttribute('aria-label', on ? `Live session, ${live.peers.length} of ${LIVE_MAX} people` : live.pendingRoom ? 'Join this live canvas' : 'Go live');
    const maxFaces = innerWidth < 760 ? 2 : 4;
    const shown = on ? live.peers.slice(0, maxFaces) : [];
    liveFaces.innerHTML = shown.map(p => `<span class="face" style="--c:${p.color}" title="${esc(p.name)}${p.id === live.me.id ? ' (you)' : ''}">${esc(initials(p.name))}</span>`).join('')
      + (on && live.peers.length > maxFaces ? `<span class="face more">+${live.peers.length - maxFaces}</span>` : '');
    liveFaces.hidden = !on;
    livePanel.querySelector('.lp-off').hidden = on;
    livePanel.querySelector('.lp-on').hidden = !on;
    $('#liveLeave').hidden = !on;
    $('#liveStart').disabled = live.avail === null;
    $('#liveUnavailable').hidden = live.avail !== null;
    if (!on) {
      const pr = live.pendingRoom;
      const us = pr ? roomsNow().rooms.find(r => r.room === pr) : null;
      $('#liveTitle').textContent = pr ? (us ? `Join ${canvasOf(us.us)}` : 'Join this canvas') : 'Go live';
      $('#liveIntro').textContent = pr ? 'Pick a username to join. You’ll see each other’s cursors and drawing as it happens.' : 'Pick a username. Everyone live on Scrib sees you, and anyone can join your canvas to draw with you.';
      $('#liveStart').textContent = pr ? 'Join live session' : 'Go live';
      $('#liveOwn').hidden = !pr;
    } else {
      const st = $('#liveStatus');
      st.dataset.state = live.status;
      st.textContent = live.status === 'live' ? (live.synced ? `Connected · ${live.peers.length} of ${LIVE_MAX}` : 'Loading the canvas…') : live.status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…';
      const link = $('#liveLink'); if (link.value !== roomUrl()) link.value = roomUrl();
      $('#livePeople').innerHTML = live.peers.map(p => `<li><span class="face" style="--c:${p.color}" aria-hidden="true">${esc(initials(p.name))}</span><span class="nm">${esc(p.name)}</span>${p.id === live.me.id ? '<span class="you">You</span>' : ''}</li>`).join('');
    }
    renderDir();
  }
  function setLivePanel(open) {
    livePanel.hidden = !open;
    liveBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      liveAvailable().then(() => { renderLive(); dirEnsure(); });
      renderLive();
      if (!live.on) { const i = $('#liveNameOff'); i.focus({ preventScroll: true }); i.select(); }
    } else dirMaybeClose();
  }
  liveBtn.addEventListener('click', () => setLivePanel(livePanel.hidden));
  livePanel.addEventListener('pointerdown', e => e.stopPropagation());
  document.addEventListener('pointerdown', e => { if (!livePanel.hidden && !e.target.closest('#livePanel, #liveBtn, #liveFaces')) setLivePanel(false); });
  livePanel.addEventListener('keydown', e => { if (e.key === 'Escape') { setLivePanel(false); liveBtn.focus(); } });
  liveFaces.addEventListener('click', () => setLivePanel(true));
  $('#liveNameOff').value = live.me.name; $('#liveNameOn').value = live.me.name;
  $('#liveNameOff').addEventListener('input', () => showNameErr('off', null));
  $('#liveNameOn').addEventListener('change', () => { // rename while live
    const inp = $('#liveNameOn'), name = cleanName(inp.value);
    if (name === live.me.name) { inp.value = name; showNameErr('on', null); return; }
    const err = nameError(name);
    showNameErr('on', err);
    if (err) return;
    setMyName(name);
    if (live.tr) live.tr.rename(name);
    dirTrack(); renderLive();
  });
  async function copyLink() {
    try { await navigator.clipboard.writeText(roomUrl()); toast('Link copied. Anyone with it can draw with you.'); }
    catch { const l = $('#liveLink'); l.focus(); l.select(); toast('Press Ctrl C to copy the link.'); }
  }
  /** Go live in a room (yours or someone else's) under the username in the form. */
  let joining = false;
  async function goLive(room, host) {
    if (joining) return false;
    const inp = live.on ? $('#liveNameOn') : $('#liveNameOff');
    const name = cleanName(inp.value);
    const err = nameError(name);
    showNameErr(live.on ? 'on' : 'off', err);
    if (err) { inp.focus(); return false; }
    if (live.on && room === live.room) return true;
    joining = true;
    const b = $('#liveStart'); b.setAttribute('aria-busy', 'true');
    try {
      setMyName(name);
      if (live.on) liveStop(); // hop from one canvas to another
      const ok = await liveStart(room, host);
      if (ok) { live.pendingRoom = null; renderLive(); }
      return ok;
    } finally { b.removeAttribute('aria-busy'); joining = false; }
  }
  $('#liveForm').addEventListener('submit', async e => {
    e.preventDefault();
    const host = !live.pendingRoom;
    const ok = await goLive(live.pendingRoom || randId(8), host);
    if (ok && host) copyLink();
    else if (ok) toast('You’re live. Say hi with your cursor.');
  });
  $('#liveOwn').addEventListener('click', () => { // came from a link but want your own canvas
    live.pendingRoom = null;
    window.history.replaceState(null, '', location.pathname);
    SAVE_KEY = SOLO_KEY; strokes = []; objects = []; history.length = 0; future.length = 0;
    load(); clearSel(); closePop(); update(); applyView(); renderLive();
  });
  $('#liveRooms').addEventListener('click', async e => {
    const b = e.target.closest('[data-join]'); if (!b) return;
    const room = b.dataset.join; if (!ROOM_RE.test(room)) return;
    const ok = await goLive(room, false);
    if (ok) toast('You joined. Say hi with your cursor.');
  });
  $('#liveCopy').addEventListener('click', copyLink);
  $('#liveLeave').addEventListener('click', () => { liveStop(); setLivePanel(false); toast('You left live mode.'); });
  stage.addEventListener('pointerleave', () => liveHooks.cursor(null));
  window.__scribLive = { dir: () => roomsNow().rooms.map(r => ({ room: r.room, people: r.us.map(u => u.name) })), state: () => ({ on: live.on, status: live.status, synced: live.synced, room: live.room, peers: live.peers.map(p => p.name), cursors: live.cursors.size }), doc: () => ({ s: strokes.map(x => [x.id, x.pts.length]), o: objects.map(o => [o.id, o.kind, Math.round(o.x), Math.round(o.y)]) }) };


  // =========================================================================
  // Theme: light, dark, or follow the system. The choice is applied before
  // first paint by an inline script in index.html; this keeps it in sync.
  // =========================================================================
  const THEME_KEY = 'scrib:theme';
  const darkMQ = matchMedia('(prefers-color-scheme: dark)');
  const themePref = () => { try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; } };
  const resolveTheme = pref => (pref === 'system' ? (darkMQ.matches ? 'dark' : 'light') : pref);
  const savePref = pref => { try { if (pref === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, pref); } catch { /* storage blocked */ } };
  function paintTheme(pref) {
    const t = resolveTheme(pref);
    document.documentElement.setAttribute('data-theme', t);
    stage.setAttribute('data-theme', t); // the rain's scene: the engine reads and flips this one
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', t === 'dark' ? '#171511' : '#fbf3d8'));
    document.querySelectorAll('[data-theme-opt]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.themeOpt === pref)));
    const btn = $('#themeBtn'), next = t === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', `Switch to ${next} theme`); btn.title = `Switch to ${next} theme (Shift D)`;
  }
  /* Rain (PinUI's Theme Switch engine, theme-rain.js): the next theme falls as rain,
     puddles spread and merge under the drawings, every panel flips the moment the
     rain reaches it, and the page commits once the canvas is covered. The engine
     owns the button's click; reduced motion switches at once. */
  let pendingPref = null;
  const rain = window.ScribThemeSwitch ? window.ScribThemeSwitch.createThemeSwitch({
    root: stage, button: $('#themeBtn'), fx: $('#themeFx'),
    effect: () => 'rain', sound: () => false,
    onCommit: next => { const pref = pendingPref || next; pendingPref = null; savePref(pref); paintTheme(pref); },
  }) : null;
  function setTheme(pref) {
    if (resolveTheme(pref) === document.documentElement.getAttribute('data-theme') || !rain) { savePref(pref); paintTheme(pref); return; }
    if (rain.busy()) return;
    pendingPref = pref;
    rain.toggle();
  }
  const toggleTheme = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  if (!rain) $('#themeBtn').addEventListener('click', toggleTheme);
  document.querySelectorAll('[data-theme-opt]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeOpt)));
  document.querySelector('.seg').addEventListener('keydown', e => { // radio group: arrows move the choice
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const opts = [...document.querySelectorAll('[data-theme-opt]')];
    const i = opts.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const n = opts[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + opts.length) % opts.length];
    setTheme(n.dataset.themeOpt); n.focus();
  });
  darkMQ.addEventListener('change', () => { if (themePref() === 'system' && !(rain && rain.busy())) paintTheme('system'); });
  paintTheme(themePref());

  // =========================================================================
  // GitHub: live star count (cached for an hour) and the "give it a star" doodle
  // =========================================================================
  const REPO = 'Rachit315/Scrib';
  const fmtStars = n => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n));
  function showStars(n) { // n: a number, or shields.io's ready-made label like "1.2k"
    const label = typeof n === 'number' ? fmtStars(n) : n;
    $('#ghCount').textContent = label;
    $('#ghStars').hidden = false;
    $('#githubLink').setAttribute('aria-label', `Star Scrib on GitHub, ${label} star${label === '1' ? '' : 's'} (opens in a new tab)`);
  }
  // shields.io first: it caches GitHub's count and isn't rate limited per visitor (GitHub's API allows 60 calls an hour per IP).
  async function fetchStars() {
    try {
      const r = await fetch(`https://img.shields.io/github/stars/${REPO}.json`);
      if (r.ok) { const j = await r.json(); if (/^\d+(\.\d+)?k?$/i.test(j.message || '')) return j.message; }
    } catch { /* try GitHub */ }
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) { const n = (await r.json()).stargazers_count; if (typeof n === 'number') return n; }
    } catch { /* offline */ }
    return null;
  }
  (async () => {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem('scrib:gh') || 'null'); } catch { /* ignore */ }
    if (cached && cached.n != null) showStars(cached.n);
    if (cached && Date.now() - cached.t < 36e5) return;
    const n = await fetchStars();
    if (n == null) return; // keep the plain GitHub button
    showStars(n);
    try { localStorage.setItem('scrib:gh', JSON.stringify({ n, t: Date.now() })); } catch { /* ignore */ }
  })();
  // =========================================================================
  // Visitors: unique visitors to the site, kept in Scrib's Supabase project.
  // Each browser gets a random id once (no personal data); the database counts
  // each id a single time. Local development only reads the count, so testing
  // doesn't inflate it.
  // =========================================================================
  (async () => {
    const cfg = window.SCRIB_LIVE || {};
    if (!cfg.supabaseUrl || !cfg.supabaseKey) return; // no backend on this host: no pill
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    let id = null;
    try {
      id = localStorage.getItem('scrib:vid');
      if (!id) {
        // randomUUID is HTTPS-only; build a v4 UUID by hand anywhere else
        id = crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
        localStorage.setItem('scrib:vid', id);
      }
    } catch { id = null; } // storage blocked: read the count, don't add to it
    const register = !isLocal && id;
    let total = null;
    try {
      const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${register ? 'register_visit' : 'visitor_count'}`, {
        method: 'POST',
        headers: { apikey: cfg.supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(register ? { visitor: id } : {}),
      });
      if (r.ok) total = Number(await r.json());
    } catch { /* offline */ }
    if (!Number.isFinite(total) || total < 0) return;
    const el = $('#visitors'), num = $('#visitorCount');
    const fmt = n => n.toLocaleString('en-US');
    el.setAttribute('aria-label', `${fmt(total)} visitors`);
    el.hidden = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || total < 2) { num.textContent = fmt(total); return; }
    // Count up once, quickly, from a little below the total
    const from = Math.max(0, Math.floor(total * 0.82)), t0 = performance.now(), ms = 900;
    const step = now => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 4);
      num.textContent = fmt(Math.round(from + (total - from) * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })();


  // =========================================================================
  // Shape guide: every shape the recogniser understands (see suggest()), drawn
  // as a little sketch. One list feeds the empty-state legend and the guide that
  // sits on the right while you draw.
  // =========================================================================
  const ACC = 'currentColor';
  const sq = 'M7 9.2c1-1.6 1.9 1.6 2.9 0s1.9 1.6 2.9 0 1.9 1.6 2.9 0'; // a scribble of "writing"
  const SHAPES = [
    { name: 'Tall outline', to: 'Device frame', svg: `<rect x="7.5" y="1.5" width="9" height="15" rx="2.4"/>` },
    { name: 'Box with writing', to: 'Button', svg: `<rect x="1.5" y="5" width="21" height="8" rx="4"/><path d="${sq}"/>` },
    { name: 'Thin empty box', to: 'Text field', svg: `<rect x="1.5" y="6" width="21" height="6" rx="1.4"/>` },
    { name: 'Short box, writing', to: 'Chip', svg: `<rect x="5.5" y="5" width="13" height="8" rx="4"/><path d="M8.5 9.2c.8-1.4 1.6 1.4 2.4 0s1.6 1.4 2.4 0 1.6 1.4 2.4 0"/>` },
    { name: 'Pill with a dot', to: 'Switch', svg: `<rect x="4" y="5" width="16" height="8" rx="4"/><circle cx="15.8" cy="9" r="2.2" fill="${ACC}"/>` },
    { name: 'Small square', to: 'Checkbox', svg: `<rect x="8" y="5" width="8" height="8" rx="1.6"/>` },
    { name: 'Circle', to: 'Avatar', svg: `<circle cx="12" cy="9" r="6.2"/>` },
    { name: 'Box with an X', to: 'Image', svg: `<rect x="3" y="2" width="18" height="14" rx="1.6"/><path d="M3.8 2.8l16.4 12.4M20.2 2.8L3.8 15.2"/>` },
    { name: 'Big empty box', to: 'Media', svg: `<rect x="1.5" y="2" width="21" height="14" rx="2"/>` },
    { name: 'Box with lines', to: 'List', svg: `<rect x="2.5" y="1.5" width="19" height="15" rx="2"/><path d="M5.5 6h13M5.5 9.5h13M5.5 13h9"/>` },
    { name: 'Dot, then a line', to: 'List row', svg: `<rect x="1.5" y="5" width="21" height="8" rx="2"/><circle cx="5.5" cy="9" r="1.7" fill="${ACC}"/><path d="M9 9h10"/>` },
    { name: 'Box with shapes in it', to: 'Card', svg: `<rect x="2.5" y="1.5" width="19" height="15" rx="2"/><rect x="5" y="4" width="14" height="6" rx="1"/><path d="M5 13h8"/>` },
    { name: 'Bar at a device’s top', to: 'Nav bar', svg: `<rect x="7.5" y="1.5" width="9" height="15" rx="2.4"/><path d="M8.4 4.6h7.2" stroke-width="2.4"/>` },
    { name: 'Bar at a device’s bottom', to: 'Tab bar', svg: `<rect x="7.5" y="1.5" width="9" height="15" rx="2.4"/><path d="M8.4 13.4h7.2" stroke-width="2.4"/>` },
    { name: 'Big scribble', to: 'Title', svg: `<path d="M2.5 9.5c1.6-3.4 3.1 3.4 4.7 0s3.1 3.4 4.7 0 3.1 3.4 4.7 0 2.4 2.6 4.2 0" stroke-width="2.1"/>` },
    { name: 'Small scribble', to: 'Body text', svg: `<path d="M3 6.5c1.1-1.8 2.2 1.8 3.3 0s2.2 1.8 3.3 0 2.2 1.8 3.3 0 2.2 1.8 3.3 0M3 12c1.1-1.8 2.2 1.8 3.3 0s2.2 1.8 3.3 0 2.2 1.8 3.3 0"/>` },
  ];
  const shapeIcon = s => `<svg class="sg-ic" width="26" height="20" viewBox="0 0 24 18" fill="none" stroke="${ACC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.svg}</svg>`;
  $('#legend').innerHTML = SHAPES.map(s => `<li>${shapeIcon(s)}<span class="nm">${s.name}</span><span class="to">${s.to}</span></li>`).join('');
  // ---- Reviews: replies to the launch post on X, drifting left under the legend.
  // Hovering (or focusing a card) eases the row to a stop so you can read and click;
  // each card opens that person's profile.
  (() => {
    const REVIEWS = [
      { n: 'Hardik', h: 'coleHardik', v: 1, t: 'This is hugeeee 🥳' },
      { n: 'Terry Carson', h: 'mrterrycarson', v: 1, t: 'Wow, this looks really useful! I love the idea of just drawing a box and getting a real component. Very neat.' },
      { n: 'aadi', h: 'AadiChowdhury7', v: 1, t: 'This is sooo cool!' },
      { n: 'Aniket Pawar', h: 'alaymanguy', v: 1, t: 'super cool, everyone at @shadcnlabs is cracked af 🔥' },
      { n: 'Ved Savla', h: 'veddsavla8', v: 0, t: 'crazy stuff' },
      { n: 'Karan', h: 'itsmeekaran', v: 1, t: 'bro is cooking HARD. this is actually insane 🔥' },
      { n: 'Vivaan', h: 'Its_Vivaann', v: 0, t: 'Pretty Cool' },
      { n: 'Jay', h: 'radiumcoders', v: 1, t: 'whoaa it is cooooooooool' },
      { n: 'Aditya', h: 'AdiKodez', v: 1, t: 'cool stuff alert' },
      { n: 'AETHER', h: 'aether_uiux', v: 1, t: "that's amazing" },
      { n: 'Swami', h: 'SwamiMalode', v: 1, t: 'Oh niceee' },
    ];
    const box = $('#reviews'), track = $('#rvTrack');
    if (!box || !track) return;
    const BADGE = '<svg width="14" height="14" viewBox="0 0 24 24" aria-label="Verified" role="img"><path fill="#1d9bf0" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"/><path fill="#fff" d="m10.54 16.2-3.6-3.6 1.42-1.42 2.18 2.19 4.83-4.83 1.42 1.41z"/></svg>';
    const XLOGO = '<svg class="rv-x" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>';
    const body = t => esc(t).replace(/@(\w+)/g, '<span class="at">@$1</span>');
    const card = (r, copy) => `<li><a class="rv" href="https://x.com/${r.h}" target="_blank" rel="noopener noreferrer"${copy ? ' tabindex="-1"' : ''}>
      <span class="rv-av" aria-hidden="true">${esc([...r.n][0])}<img src="https://unavatar.io/x/${r.h}?fallback=false" alt="" width="32" height="32" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>
      <span class="rv-who"><span class="rv-name"><span>${esc(r.n)}</span>${r.v ? BADGE : ''}</span><span class="rv-handle">@${r.h}</span></span>
      ${XLOGO}<span class="rv-text">${body(r.t)}</span></a></li>`;
    const group = copy => `<ul class="rv-group"${copy ? ' aria-hidden="true"' : ' aria-label="Replies on X"'}>${REVIEWS.map(r => card(r, copy)).join('')}</ul>`;
    // Two copies of the row: when the first has fully passed, the second sits exactly where it began.
    track.innerHTML = group(false) + group(true);
    // No avatar (blocked, renamed, rate-limited)? The initial underneath shows instead.
    track.querySelectorAll('.rv-av img').forEach(img => {
      const drop = () => img.remove();
      img.addEventListener('error', drop);
      if (img.complete && !img.naturalWidth) drop();
    });

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { box.classList.add('rv-static'); return; }

    const SPEED = 30; // px per second: slow enough to read while it moves
    const first = track.firstElementChild;
    let period = first.offsetWidth, x = 0, v = SPEED, target = SPEED, last = 0, raf = 0, seen = true, hovered = false, focused = false;
    new ResizeObserver(() => { period = first.offsetWidth; }).observe(first);
    const aim = () => { target = hovered || focused ? 0 : SPEED; };
    const tick = t => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      v += (target - v) * (1 - Math.exp(-dt * 7)); // eases to a stop on hover, back up on leave
      if (period) x = (x + v * dt) % period;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      const go = seen && !document.hidden;
      if (go && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    // Only move while it's on screen: not behind a sketch, not in a background tab.
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); }).observe(box);
    document.addEventListener('visibilitychange', run);
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; aim(); } });
    box.addEventListener('pointerleave', () => { hovered = false; aim(); });
    box.addEventListener('focusin', () => { focused = true; aim(); });
    box.addEventListener('focusout', e => { if (!box.contains(e.relatedTarget)) { focused = false; aim(); } });
    // Keep a focused card in view: tabbing ahead shouldn't land on one that's off screen.
    // Only the first copy is focusable, so centre that card: its left edge in the track, minus half the view.
    const show = a => {
      box.scrollLeft = 0; // the browser may have scrolled the clipped row itself; the transform does the moving
      const fade = box.clientWidth * 0.14, l = a.offsetLeft - x;
      if (l >= fade && l + a.offsetWidth <= box.clientWidth - fade) return;
      x = Math.min(period - 1, Math.max(0, a.offsetLeft + a.offsetWidth / 2 - box.clientWidth / 2));
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    box.addEventListener('focusin', e => {
      const a = e.target.closest('.rv'); if (!a) return;
      show(a); requestAnimationFrame(() => show(a));
    });
    run();
  })();

  $('#sgList').innerHTML = SHAPES.map(s => `<li>${shapeIcon(s)}<span class="sg-txt"><span class="nm">${s.name}</span><span class="to">${s.to}</span></span></li>`).join('');

  const guide = $('#shapeGuide'), guideTab = $('#sgTab');
  // Closed by default: while you draw it's a small "Shape guide" tab; open it when you need it.
  let guideOpen = false;
  try { guideOpen = localStorage.getItem('scrib:guide-open') === '1'; } catch { /* ignore */ }
  const drawingNow = () => tool === 'pen' && strokes.length + objects.length > 0 && presentEl.hidden;
  function updateGuide() {
    if (morphing.has(guide)) return; // the morph decides what shows until it lands
    const d = drawingNow();
    guide.hidden = !d || !guideOpen;
    guideTab.hidden = !d || guideOpen;
    guideTab.setAttribute('aria-expanded', String(d && guideOpen));
  }
  async function setGuide(open) {
    if (open === guideOpen || morphing.has(guide)) return;
    guideOpen = open;
    try { localStorage.setItem('scrib:guide-open', open ? '1' : '0'); } catch { /* ignore */ }
    guideTab.setAttribute('aria-expanded', String(open));
    if (open) await morphOpen(guide, guideTab);
    else await morphClose(guide, guideTab);
    updateGuide();
    (open ? $('#sgHide') : guideTab).focus({ preventScroll: true });
  }
  $('#sgHide').addEventListener('click', () => setGuide(false));
  guideTab.addEventListener('click', () => setGuide(true));
  guide.addEventListener('pointerdown', e => e.stopPropagation());
  guideTab.addEventListener('pointerdown', e => e.stopPropagation());

  const doodle = $('#ghDoodle');
  try { if (localStorage.getItem('scrib:doodle') === 'done') doodle.remove(); } catch { /* ignore */ }
  $('#githubLink').addEventListener('click', () => {
    if (doodle.isConnected) doodle.classList.add('gone');
    try { localStorage.setItem('scrib:doodle', 'done'); } catch { /* ignore */ }
    try { localStorage.removeItem('scrib:gh'); } catch { /* ignore */ } // refresh the count next time
  });

  window.addEventListener('resize', () => { applyView(); renderLive(); if (!presentEl.hidden) renderPresent(); });
  const restored = load();
  setTool('pen');
  renderPalette();
  applyView();
  update();
  renderLive();
  if (ROOM_PARAM) { live.pendingRoom = ROOM_PARAM; setLivePanel(true); } // pick a username, then join
  else {
    liveAvailable().then(renderLive);
    if (restored) toast('Restored your last canvas. Clear it from the sidebar to start fresh.');
  }
})();

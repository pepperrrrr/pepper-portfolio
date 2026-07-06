// All site copy for the three languages. Project entries are keyed by slug and
// carry the full case-study content: title, subtitle, overview, role, highlights.
// NOTE: vue-i18n treats @ { } | as special characters — avoid them in strings.

export const messages = {
  en: {
    nav: { home: 'Home', ideas: 'Ideas', about: 'About' },
    common: { back: 'Back', notFound: 'Project not found.', next: 'Next case' },
    ideas: {
      title: 'Ideas',
      sub: 'Every idea becomes a star. Give it time, and it turns into a constellation.',
      placeholder: 'Write down an idea…',
      add: 'Light a star',
      empty: 'An empty sky. Write down the first idea below.',
      count: '{n} stars in this sky',
      remove: 'Remove',
    },
    hero: {
      greeting: 'Front-end engineering, done properly',
      name: 'Pepper',
      role: 'Senior Front-end Engineer — e-commerce, real-time systems, Arabic RTL',
      tagline:
        'Seven years building production e-commerce and real-time interfaces — at Deloitte, Lenovo, and a UAE cross-border platform. Specialized in Arabic RTL experiences that read native, not translated.',
      scroll: 'Scroll',
    },
    stats: {
      years: { v: '7+', l: 'years in front-end' },
      langs: { v: '3', l: 'working languages' },
      dirs: { v: 'LTR + RTL', l: 'layout directions shipped' },
      teams: { v: 'Deloitte · Lenovo', l: 'enterprise background' },
    },
    caps: {
      label: 'What I do',
      commerce: {
        t: 'E-commerce Engineering',
        d: 'Storefronts, checkout flows, multi-currency pricing, SEO and operations consoles — shipped for Lenovo’s international store and a UAE luxury e-commerce platform covering web and mobile.',
      },
      rtl: {
        t: 'Arabic and RTL Localization',
        d: 'True bidirectional interfaces: logical-property layouts, i18n architecture, Arabic typography and locale-aware formatting. I speak Arabic fluently, so the result reads native — not machine-mirrored.',
      },
      realtime: {
        t: 'Real-time and Interactive',
        d: 'WebSocket bidding systems with heartbeat detection and automatic reconnection, WebGL and Three.js scenes, scroll-driven storytelling. Interfaces that move — and recover on their own.',
      },
    },
    projects: {
      title: 'Selected work',
      open: 'View case study',
      viewCode: 'View source',
      liveDemo: 'Live demo',
      labels: { year: 'Year', role: 'Role', stack: 'Stack', highlights: 'Highlights', overview: 'Overview' },
      items: {
        'vue-rtl-store': {
          title: 'RTL Commerce',
          subtitle: 'A bilingual storefront engineered for true right-to-left commerce.',
          overview:
            'An English and Arabic storefront built on Vue 3. Rather than translating a left-to-right layout, the interface is architected on CSS logical properties, so navigation, product grids, cart and checkout mirror natively when the locale changes. Prices, numerals and currency render through locale-aware Intl formatting.',
          role: 'Design and development',
          highlights: [
            'Full RTL mirroring through CSS logical properties — no duplicated stylesheets',
            'i18n architecture with per-locale typography, including the Tajawal Arabic typeface',
            'Locale-aware pricing with Intl.NumberFormat: Arabic numerals and currency',
            'Direction-aware interactive components: drawers, carousels, breadcrumbs',
            'Instant language switch with zero layout breakage',
          ],
        },
        'vue-live-auction': {
          title: 'Live Auction',
          subtitle: 'Real-time bidding engineered to survive unreliable networks.',
          overview:
            'A live auction platform on Vue 3 with a Node.js WebSocket backend. Bids propagate to every connected client in milliseconds. The connection layer is production-grade: ping-pong heartbeats detect silent drops, and exponential-backoff reconnection restores session state without user action — the same patterns I shipped for a UAE luxury-goods platform running online and on-site auctions.',
          role: 'Design and development',
          highlights: [
            'Millisecond bid broadcast to all connected clients over WebSocket',
            'Heartbeat ping-pong that detects silently dropped connections',
            'Exponential-backoff auto-reconnect with full state resynchronization',
            'Server-authoritative bid ordering that prevents race conditions',
            'Clear connection-status feedback in the interface',
          ],
        },
        'pet-health-keeper': {
          title: 'Pet Health Keeper',
          subtitle: 'An offline-first PWA that keeps vaccination schedules on time.',
          overview:
            'A local-first health companion for pet owners: vaccine, deworming and medication schedules with automatic reminders — entirely on-device, no account required. Built with Vue 3 and TypeScript, with Pinia state written through to IndexedDB, installable as a PWA and fully functional offline. The interface is a scroll-driven narrative: GSAP ScrollTrigger scenes, Lenis inertial scrolling, and a WebGL centerpiece that reacts to cursor and scroll.',
          role: 'Product, design and development',
          highlights: [
            'TypeScript end to end, with typed stores and database schema',
            'Offline-first persistence: Pinia written through to IndexedDB via Dexie',
            'Installable PWA with a complete offline experience',
            'Scroll-driven storytelling with GSAP ScrollTrigger and Lenis',
            'WebGL physical-material centerpiece with graceful degradation for reduced-motion and low-memory devices',
          ],
        },
        'souq-rtl-theme': {
          title: 'Souq',
          subtitle: 'A production Arabic theme for Shopify, built on Dawn.',
          overview:
            'A commercial-grade Arabic RTL theme for Shopify. Beyond full translation, it corrects the right-to-left details stock themes miss — cart table alignment, notification placement, filter drawers — and bundles the Tajawal typeface with letter-spacing resets that protect Arabic’s connected script. RTL activates per locale, leaving other languages untouched.',
          role: 'Theme development',
          highlights: [
            'Built on Shopify Dawn with maintainable Liquid architecture',
            'Complete Arabic storefront translation',
            'Bundled Arabic typography with connected-script protections',
            'Locale-scoped RTL activation — other languages remain standard',
            'Merchant-ready: installable without code changes',
          ],
        },
        'cosmic-explorer': {
          title: 'Cosmic Explorer',
          subtitle: 'A WebGL journey through real nebulae, built in React.',
          overview:
            'An interactive 3D astronomy experience in React and react-three-fiber. Nebulae render as GPU particle systems with live controls for density, rotation and particle count, paired with a curated catalog of real deep-sky objects. It is my cross-framework proof: the same engineering standards I apply in Vue, delivered in React and WebGL.',
          role: 'Design and development',
          highlights: [
            'React with react-three-fiber scene architecture',
            'GPU particle nebulae rendered in real time',
            'Live parameter controls with instant scene response',
            'Curated deep-sky catalog paired with each scene',
            'Responsive across devices',
          ],
        },
      },
    },
    about: {
      title: 'About',
      p1: 'I am a senior front-end engineer with seven years of production experience, focused on e-commerce platforms and real-time interfaces. My career spans consulting at Deloitte, Lenovo’s international e-commerce, and most recently a UAE cross-border platform for luxury goods, streetwear and sports cards.',
      p2: 'My differentiator is language. I work fluently in Chinese, English and Arabic, and I build interfaces that are genuinely bidirectional — engineered right-to-left, not mirrored as an afterthought. For teams entering Arabic-speaking markets, that removes an entire class of risk.',
      p3: 'On the engineering side: WebSocket auction systems with heartbeat detection and automatic recovery, first-paint performance work, full-site SEO, multi-currency storefronts, and component libraries documented in two languages. Strongest in Vue 3 and TypeScript, productive in React, comfortable in WebGL.',
      p4: 'This site is its own evidence. Switch it to العربية and watch the entire layout flip.',
      expTitle: 'Experience',
      exp: [
        {
          period: '2024 — 2026',
          org: 'UAE cross-border e-commerce (Turing Chengke Software)',
          role: 'Senior Front-end Engineer',
          desc: 'Led front-end delivery for a luxury, streetwear and sports-card commerce platform plus three operations consoles: English-Arabic bilingual, multi-currency, web and mobile. Shipped online and on-site live auctions over WebSocket, first-screen performance optimization, and full-site SEO.',
        },
        {
          period: '2022 — 2024',
          org: 'Lenovo',
          role: 'Front-end Engineer',
          desc: 'Built Lenovo’s international e-commerce storefront. Designed shared component systems for filtering, customer service and product display, reused across pages and devices; drove the Vue 3 migration and authored bilingual component documentation.',
        },
        {
          period: '2019 — 2022',
          org: 'Deloitte',
          role: 'Front-end Engineer',
          desc: 'Delivered the REA services platform and an anti-money-laundering risk assessment platform: interface development, interaction design and API integration, plus a shared component layer on ElementUI.',
        },
      ],
    },
    skills: { title: 'Capabilities', frontend: 'Core', specialties: 'Specialties', tools: 'Tooling' },
    contact: {
      title: 'Contact',
      text: 'Entering an Arabic-speaking market, or need an interface that feels instant? I am available for remote roles and selected freelance engagements.',
      emailMe: 'Email me',
      cta: 'Let’s talk',
    },
    footer: { built: 'Designed and built with Vue 3, Three.js and vue-i18n.' },
  },

  zh: {
    nav: { home: '首页', ideas: '想法', about: '关于' },
    common: { back: '返回', notFound: '找不到这个项目。', next: '下一个案例' },
    ideas: {
      title: '想法',
      sub: '每个想法都会变成一颗星。日子久了,就连成星座。',
      placeholder: '写下一个想法…',
      add: '点亮一颗星',
      empty: '天空还是空的。在下面写下第一个想法吧。',
      count: '这片天空里有 {n} 颗星',
      remove: '删除',
    },
    hero: {
      greeting: '把前端工程做到位',
      name: 'Pepper',
      role: '高级前端工程师 — 电商 · 实时系统 · 阿拉伯语 RTL',
      tagline:
        '七年生产级前端经验,历经德勤、联想与阿联酋跨境电商平台。专注电商与实时交互界面,以及真正地道——而非机器翻译感——的阿拉伯语 RTL 体验。',
      scroll: '滚动',
    },
    stats: {
      years: { v: '7+', l: '年前端经验' },
      langs: { v: '3', l: '门工作语言' },
      dirs: { v: 'LTR + RTL', l: '双向布局交付经验' },
      teams: { v: '德勤 · 联想', l: '企业级背景' },
    },
    caps: {
      label: '我能做什么',
      commerce: {
        t: '电商前端工程',
        d: '商城前台、下单流程、多币种定价、SEO 与运营后台——交付经验来自联想国际电商与阿联酋奢侈品电商平台,覆盖 PC 与移动全端。',
      },
      rtl: {
        t: '阿拉伯语与 RTL 本地化',
        d: '真正的双向界面:CSS 逻辑属性布局、i18n 架构、阿拉伯语排印与本地化格式。我阿拉伯语流利,做出来的界面是地道的阿语产品,而不是镜像翻转的英文站。',
      },
      realtime: {
        t: '实时与交互体验',
        d: 'WebSocket 竞价系统(心跳检测 + 断线自动恢复)、WebGL 与 Three.js 场景、滚动叙事页面。让界面动起来,也能自己恢复过来。',
      },
    },
    projects: {
      title: '精选作品',
      open: '查看案例',
      viewCode: '查看源码',
      liveDemo: '在线体验',
      labels: { year: '年份', role: '角色', stack: '技术栈', highlights: '技术亮点', overview: '概述' },
      items: {
        'vue-rtl-store': {
          title: 'RTL Commerce',
          subtitle: '为真正的从右到左购物体验而设计的双语商城前端。',
          overview:
            '一个英语/阿拉伯语双语商城前端,基于 Vue 3。它不是把 LTR 布局翻译一遍,而是从架构层面建立在 CSS 逻辑属性之上——切换语言时,导航、商品栅格、购物车、下单流程整体原生镜像。价格、数字与货币通过 Intl 本地化格式渲染。',
          role: '设计与开发',
          highlights: [
            '通过 CSS 逻辑属性实现完整 RTL 镜像,无需维护两套样式',
            'i18n 架构支持按语言切换排印,内置 Tajawal 阿拉伯字体',
            'Intl.NumberFormat 本地化定价:阿拉伯数字与货币格式',
            '方向感知的交互组件:抽屉、轮播、面包屑',
            '语言即时切换,布局零错乱',
          ],
        },
        'vue-live-auction': {
          title: 'Live Auction',
          subtitle: '为不可靠网络而设计的实时竞价系统。',
          overview:
            '基于 Vue 3 与 Node.js WebSocket 服务端的实时拍卖平台,出价毫秒级同步到所有在线客户端。连接层按生产标准构建:ping-pong 心跳检测静默断连,指数退避自动重连并恢复会话状态,全程无需用户操作——这套模式我曾在阿联酋奢侈品平台的线上+线下拍卖中实际交付。',
          role: '设计与开发',
          highlights: [
            'WebSocket 毫秒级出价广播,全客户端同步',
            'ping-pong 心跳,精准识别静默断连',
            '指数退避自动重连,并完整重新同步状态',
            '服务端权威的出价排序,杜绝竞态条件',
            '界面清晰呈现连接状态',
          ],
        },
        'pet-health-keeper': {
          title: 'Pet Health Keeper',
          subtitle: '离线优先的 PWA,让疫苗与用药永不过期。',
          overview:
            '面向宠物主人的本地优先健康管家:疫苗、驱虫、用药的自动排期与提醒,数据完全存储在本机,无需账号。技术上采用 Vue 3 + TypeScript,Pinia 状态写穿透至 IndexedDB,可安装为 PWA 并完整离线使用。界面是一场滚动叙事:GSAP ScrollTrigger 分幕、Lenis 惯性滚动,以及随光标与滚动实时反应的 WebGL 主视觉。',
          role: '产品、设计与开发',
          highlights: [
            'TypeScript 全链路:类型化的 store 与数据库 schema',
            '离线优先持久化:Pinia 经 Dexie 写穿透至 IndexedDB',
            '可安装 PWA,离线体验完整',
            'GSAP ScrollTrigger + Lenis 的滚动叙事',
            'WebGL 物理材质主视觉,针对减弱动效与低内存设备优雅降级',
          ],
        },
        'souq-rtl-theme': {
          title: 'Souq',
          subtitle: '基于 Dawn 的生产级阿拉伯语 Shopify 主题。',
          overview:
            '一套商用级阿拉伯语 RTL Shopify 主题。在完整翻译之外,修正了官方主题在 RTL 下的种种疏漏——购物车表格对齐、通知弹窗位置、筛选抽屉方向——并内置 Tajawal 字体与字间距重置,保护阿拉伯语连写不被破坏。RTL 按语言激活,其他语言不受影响。',
          role: '主题开发',
          highlights: [
            '基于 Shopify Dawn,Liquid 架构清晰可维护',
            '店铺界面完整阿拉伯语翻译',
            '内置阿拉伯语排印,连写保护到位',
            'RTL 按语言作用域激活,其他语言保持标准',
            '商家开箱即用,无需改代码',
          ],
        },
        'cosmic-explorer': {
          title: 'Cosmic Explorer',
          subtitle: '用 React 构建的 WebGL 真实星云之旅。',
          overview:
            '基于 React 与 react-three-fiber 的交互式 3D 天文体验。星云以 GPU 粒子系统实时渲染,密度、转速、粒子数量均可实时调节,并配有真实深空天体的精选图鉴。这是我的跨框架证明:在 Vue 里坚持的工程标准,在 React 与 WebGL 里同样交付。',
          role: '设计与开发',
          highlights: [
            'React + react-three-fiber 场景架构',
            'GPU 粒子星云实时渲染',
            '参数实时可调,场景即时响应',
            '真实深空天体精选图鉴',
            '全设备响应式适配',
          ],
        },
      },
    },
    about: {
      title: '关于',
      p1: '我是一名高级前端工程师,七年生产级项目经验,专注电商平台与实时交互界面。职业路径覆盖德勤咨询、联想国际电商,以及近期的阿联酋跨境电商平台——奢侈品、潮牌与球星卡业务。',
      p2: '语言是我的差异化优势。我以中文、英语、阿拉伯语三语工作,构建真正双向的界面——从工程层面为 RTL 设计,而不是事后镜像。对进入阿语市场的团队而言,这直接消除了一整类风险。',
      p3: '工程能力上:带心跳检测与自动恢复的 WebSocket 拍卖系统、首屏性能优化、全站 SEO、多币种商城,以及双语文档的组件库。最强栈是 Vue 3 与 TypeScript,React 可高效产出,WebGL 亦有实践。',
      p4: '这个网站本身就是证明:切换到 العربية,看整个布局翻转。',
      expTitle: '履历',
      exp: [
        {
          period: '2024 — 2026',
          org: '阿联酋跨境电商平台(四川图灵成科)',
          role: '高级前端工程师',
          desc: '主导奢侈品/潮牌/球星卡电商平台与三套运营后台的前端交付:英阿双语、多币种、PC 与移动全适配。上线基于 WebSocket 的线上+线下实时拍卖、首屏性能优化与全站 SEO。',
        },
        {
          period: '2022 — 2024',
          org: '联想',
          role: '前端开发工程师',
          desc: '建设联想国际电商平台前端。设计筛选、客服、商品展示等公共组件体系,多页面多端复用;推动 Vue 3 升级,产出中英双语组件文档。',
        },
        {
          period: '2019 — 2022',
          org: '德勤',
          role: '前端开发工程师',
          desc: '交付 REA 服务平台与反洗钱(AML)风险评估平台:页面开发、交互实现与接口联调,并基于 ElementUI 沉淀公共组件层。',
        },
      ],
    },
    skills: { title: '能力', frontend: '核心', specialties: '专长', tools: '工具链' },
    contact: {
      title: '联系',
      text: '正在进入阿语市场,或者需要一个"快得像原生"的界面?我接受远程职位与经过筛选的自由职业合作。',
      emailMe: '给我发邮件',
      cta: '聊聊吧',
    },
    footer: { built: '由 Vue 3、Three.js 与 vue-i18n 设计并构建。' },
  },

  ar: {
    nav: { home: 'الرئيسية', ideas: 'أفكار', about: 'نبذة' },
    common: { back: 'رجوع', notFound: 'المشروع غير موجود.', next: 'الدراسة التالية' },
    ideas: {
      title: 'أفكار',
      sub: 'كل فكرة تصير نجمة. ومع الوقت، تكتمل الكوكبة.',
      placeholder: 'فكرة جديدة…',
      add: 'إضاءة نجمة',
      empty: 'السماء ما تزال فارغة — أول فكرة تُكتب في الأسفل.',
      count: 'في هذه السماء {n} نجمة',
      remove: 'حذف',
    },
    hero: {
      greeting: 'هندسة واجهات أمامية بإتقان',
      name: 'Pepper',
      role: 'مهندسة واجهات أمامية أولى — تجارة إلكترونية · أنظمة لحظية · عربي RTL',
      tagline:
        'سبع سنوات في بناء واجهات إنتاجية للتجارة الإلكترونية والأنظمة اللحظية — في Deloitte وLenovo ومنصة إماراتية للتجارة العابرة للحدود. متخصصة في تجارب عربية أصيلة من اليمين إلى اليسار، تُقرأ كأنها وُلدت بالعربية لا مُترجمة إليها.',
      scroll: 'مرّر',
    },
    stats: {
      years: { v: '+7', l: 'سنوات في الواجهات الأمامية' },
      langs: { v: '3', l: 'لغات عمل' },
      dirs: { v: 'LTR + RTL', l: 'اتجاها تخطيط مُسلّمان' },
      teams: { v: 'Deloitte · Lenovo', l: 'خلفية مؤسسية' },
    },
    caps: {
      label: 'ماذا أقدّم',
      commerce: {
        t: 'هندسة التجارة الإلكترونية',
        d: 'واجهات المتاجر، مسارات الشراء، تسعير متعدد العملات، تحسين محركات البحث ولوحات التشغيل — خبرة مُسلّمة في متجر Lenovo الدولي ومنصة إماراتية للسلع الفاخرة، على الويب والجوال.',
      },
      rtl: {
        t: 'التعريب وواجهات RTL',
        d: 'واجهات ثنائية الاتجاه حقيقية: تخطيطات بالخصائص المنطقية، بنية i18n، تايبوغرافيا عربية وتنسيقات محلية. أتحدث العربية بطلاقة، فتأتي النتيجة أصيلة — لا انعكاسًا آليًا لموقع إنجليزي.',
      },
      realtime: {
        t: 'الأنظمة اللحظية والتفاعلية',
        d: 'أنظمة مزايدة عبر WebSocket بنبضات كشف وإعادة اتصال تلقائية، مشاهد WebGL وThree.js، وصفحات سرد بالتمرير. واجهات تتحرك — وتتعافى من تلقاء نفسها.',
      },
    },
    projects: {
      title: 'أعمال مختارة',
      open: 'عرض دراسة الحالة',
      viewCode: 'الشيفرة المصدرية',
      liveDemo: 'تجربة مباشرة',
      labels: { year: 'السنة', role: 'الدور', stack: 'التقنيات', highlights: 'أبرز النقاط', overview: 'نظرة عامة' },
      items: {
        'vue-rtl-store': {
          title: 'RTL Commerce',
          subtitle: 'واجهة متجر ثنائية اللغة مهندَسة لتجارة حقيقية من اليمين إلى اليسار.',
          overview:
            'واجهة متجر بالإنجليزية والعربية مبنية على Vue 3. لا تُترجم تخطيطًا يساريًا، بل بُنيت من الأساس على الخصائص المنطقية في CSS، فتنعكس الملاحة وشبكات المنتجات والسلة ومسار الشراء انعكاسًا أصيلًا عند تبديل اللغة. وتُعرض الأسعار والأرقام والعملات عبر تنسيقات Intl المحلية.',
          role: 'تصميم وتطوير',
          highlights: [
            'انعكاس RTL كامل عبر الخصائص المنطقية في CSS دون تكرار الأنماط',
            'بنية i18n مع تايبوغرافيا لكل لغة، وخط Tajawal العربي مدمج',
            'تسعير محلي عبر Intl.NumberFormat: أرقام وعملة عربية',
            'مكوّنات تفاعلية مدركة للاتجاه: الأدراج، شرائح العرض، مسارات التنقل',
            'تبديل لغة فوري دون أي خلل في التخطيط',
          ],
        },
        'vue-live-auction': {
          title: 'Live Auction',
          subtitle: 'مزايدة لحظية مهندَسة لتصمد أمام الشبكات غير الموثوقة.',
          overview:
            'منصة مزادات لحظية بـ Vue 3 وخادم WebSocket على Node.js، تصل المزايدات إلى كل العملاء في أجزاء من الثانية. طبقة الاتصال بمعايير الإنتاج: نبضات ping-pong تكشف الانقطاعات الصامتة، وإعادة اتصال بتراجع أسّي تستعيد حالة الجلسة دون تدخل المستخدم — وهي الأنماط ذاتها التي سلّمتها في منصة إماراتية للسلع الفاخرة بمزادات حضورية وعبر الإنترنت.',
          role: 'تصميم وتطوير',
          highlights: [
            'بث المزايدات لكل العملاء عبر WebSocket في أجزاء من الثانية',
            'نبضات ping-pong تكشف الاتصالات المنقطعة بصمت',
            'إعادة اتصال تلقائية بتراجع أسّي مع مزامنة كاملة للحالة',
            'ترتيب مزايدات مرجعه الخادم يمنع حالات التسابق',
            'عرض واضح لحالة الاتصال في الواجهة',
          ],
        },
        'pet-health-keeper': {
          title: 'Pet Health Keeper',
          subtitle: 'تطبيق PWA يعمل دون اتصال ويُبقي جداول التطعيم في موعدها.',
          overview:
            'رفيق صحي محلي أولًا لمربّي الحيوانات: جداول التطعيم ومكافحة الطفيليات والأدوية بتذكيرات تلقائية — كل البيانات على الجهاز، دون حساب. مبني بـ Vue 3 وTypeScript، بحالة Pinia تُكتب مباشرة إلى IndexedDB، ويُثبَّت كتطبيق PWA يعمل كاملًا دون اتصال. أما الواجهة فسردٌ يقوده التمرير: مشاهد GSAP ScrollTrigger، تمرير Lenis الانسيابي، وقطعة WebGL مركزية تتفاعل مع المؤشر والتمرير.',
          role: 'منتج وتصميم وتطوير',
          highlights: [
            'TypeScript من الطرف إلى الطرف: مخازن ومخطط بيانات منمّطة',
            'تخزين محلي أولًا: Pinia تُكتب إلى IndexedDB عبر Dexie',
            'تطبيق PWA قابل للتثبيت بتجربة كاملة دون اتصال',
            'سرد بالتمرير عبر GSAP ScrollTrigger وLenis',
            'قطعة WebGL بخامات فيزيائية مع تدرّج رشيق لأجهزة الحركة المخفّضة والذاكرة المحدودة',
          ],
        },
        'souq-rtl-theme': {
          title: 'Souq',
          subtitle: 'قالب عربي إنتاجي لشوبيفاي مبني على Dawn.',
          overview:
            'قالب شوبيفاي عربي RTL بمستوى تجاري. يتجاوز الترجمة الكاملة ليُصلح تفاصيل اليمين-إلى-اليسار التي تغفلها القوالب الجاهزة — محاذاة جدول السلة، موضع الإشعارات، أدراج التصفية — ويدمج خط Tajawal مع تصفير تباعد الأحرف حمايةً للحرف العربي المتصل. يُفعَّل RTL حسب اللغة، فتبقى اللغات الأخرى كما هي.',
          role: 'تطوير قالب',
          highlights: [
            'مبني على Shopify Dawn ببنية Liquid قابلة للصيانة',
            'ترجمة عربية كاملة لواجهة المتجر',
            'تايبوغرافيا عربية مدمجة تحمي الحرف المتصل',
            'تفعيل RTL بنطاق اللغة — اللغات الأخرى قياسية',
            'جاهز للتاجر: يُثبَّت دون تعديل شيفرة',
          ],
        },
        'cosmic-explorer': {
          title: 'Cosmic Explorer',
          subtitle: 'رحلة WebGL بين سُدُم حقيقية، مبنية بـ React.',
          overview:
            'تجربة فلكية ثلاثية الأبعاد تفاعلية بـ React وreact-three-fiber. تُرسم السُدُم كأنظمة جسيمات على معالج الرسوميات بتحكم لحظي في الكثافة والدوران وعدد الجسيمات، مع فهرس منسّق لأجرام سماوية حقيقية. وهي برهاني عبر الأُطر: المعايير الهندسية نفسها التي ألتزمها في Vue، مُسلَّمة في React وWebGL.',
          role: 'تصميم وتطوير',
          highlights: [
            'بنية مشاهد بـ React وreact-three-fiber',
            'سُدُم جسيمات تُرسم لحظيًا على معالج الرسوميات',
            'تحكم لحظي في المعاملات باستجابة فورية للمشهد',
            'فهرس منسّق لأجرام الفضاء العميق',
            'استجابة كاملة عبر الأجهزة',
          ],
        },
      },
    },
    about: {
      title: 'نبذة',
      p1: 'أنا مهندسة واجهات أمامية أولى بسبع سنوات من الخبرة الإنتاجية، أركّز على منصات التجارة الإلكترونية والواجهات اللحظية. يمتد مساري المهني من الاستشارات في Deloitte، إلى التجارة الإلكترونية الدولية في Lenovo، وأخيرًا منصة إماراتية عابرة للحدود للسلع الفاخرة وأزياء الشارع وبطاقات النجوم.',
      p2: 'اللغة هي ما يميّزني. أعمل بطلاقة بالصينية والإنجليزية والعربية، وأبني واجهات ثنائية الاتجاه فعلًا — مهندَسة من اليمين إلى اليسار، لا معكوسة لاحقًا. وللفرق الداخلة إلى الأسواق العربية، هذا يُزيل فئة كاملة من المخاطر.',
      p3: 'على الجانب الهندسي: أنظمة مزادات WebSocket بكشف النبض والتعافي التلقائي، تحسين أداء الشاشة الأولى، SEO لكامل الموقع، متاجر متعددة العملات، ومكتبات مكوّنات موثّقة بلغتين. الأقوى لديّ Vue 3 وTypeScript، ومنتِجة في React، ومرتاحة في WebGL.',
      p4: 'وهذا الموقع نفسه دليل: بدّله إلى العربية وشاهد التخطيط ينقلب بالكامل.',
      expTitle: 'الخبرة',
      exp: [
        {
          period: '2024 — 2026',
          org: 'منصة تجارة إلكترونية إماراتية (Turing Chengke Software)',
          role: 'مهندسة واجهات أمامية أولى',
          desc: 'قدتُ تسليم الواجهات لمنصة تجارة للسلع الفاخرة وأزياء الشارع وبطاقات النجوم مع ثلاث لوحات تشغيل: ثنائية اللغة إنجليزي-عربي، متعددة العملات، للويب والجوال. أطلقتُ مزادات لحظية حضورية وعبر الإنترنت على WebSocket، مع تحسين أداء الشاشة الأولى وSEO شامل.',
        },
        {
          period: '2022 — 2024',
          org: 'Lenovo',
          role: 'مهندسة واجهات أمامية',
          desc: 'بنيتُ واجهة متجر Lenovo الدولي. صممتُ منظومات مكوّنات مشتركة للتصفية وخدمة العملاء وعرض المنتجات تُعاد استخدامها عبر الصفحات والأجهزة؛ وقدتُ الترقية إلى Vue 3 ووثّقت المكوّنات بلغتين.',
        },
        {
          period: '2019 — 2022',
          org: 'Deloitte',
          role: 'مهندسة واجهات أمامية',
          desc: 'سلّمتُ منصة خدمات REA ومنصة تقييم مخاطر مكافحة غسل الأموال: تطوير واجهات وتفاعلات وربط واجهات برمجية، مع طبقة مكوّنات مشتركة على ElementUI.',
        },
      ],
    },
    skills: { title: 'القدرات', frontend: 'الأساس', specialties: 'التخصصات', tools: 'الأدوات' },
    contact: {
      title: 'تواصل',
      text: 'داخلون إلى سوق عربية، أو تحتاجون واجهة تُحسّ فورية؟ متاحة لأدوار عن بُعد ولتعاونات حرة منتقاة.',
      emailMe: 'راسلوني',
      cta: 'لنتحدث',
    },
    footer: { built: 'صُمم وبُني بـ Vue 3 وThree.js وvue-i18n.' },
  },
}

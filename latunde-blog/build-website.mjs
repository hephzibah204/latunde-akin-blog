import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const read = p => fs.readFile(path.join(root, p), 'utf8');
const posts = JSON.parse(await read('dist/posts.json'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const direct = 'https://wa.me/2348123428989';
const whatsapp = 'https://chat.whatsapp.com/F4q1FiipYcBLehgBybfbpV?s=cl&p=a&mlu=4&ilr=4';
const telegram = 'https://t.me/+cIApZQv8UH43OGJk';

const ext = (url, label, cls = 'button') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> (opens in a new tab)</span></a>`;
const button = (url, label, secondary = false) => `<a class="button${secondary ? ' secondary' : ''}" href="${url}">${label}</a>`;

const nav = [
  ['/', 'Home'],
  ['/about/', 'About'],
  ['/missions/', 'Missions'],
  ['/salvation/', 'Receive Jesus'],
  ['/blog/', 'Blog'],
  ['/scriptures/', 'Scriptures'],
  ['/gallery/', 'Gallery'],
  ['/prayer/', 'Prayer'],
  ['/training/', 'Training'],
  ['/support/', 'Support'],
  ['/contact/', 'Contact']
];

const scriptureBanner = `<div class="scripture-banner"><div class="wrap"><span class="scripture-verse">“And of some have compassion, making a difference: and others save with fear, pulling them out of the fire.”</span><span class="scripture-ref">JUDE 1:22–23</span><a href="/salvation/" style="color:var(--gold);font-weight:700;margin-left:10px;text-decoration:underline">Receive Jesus Today →</a></div></div>`;

const header = route => `${scriptureBanner}<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="HCTM home"><span class="brand-mark"><img src="/assets/hctm-mark.svg" alt="" width="44" height="44"></span><span>Have Compassion<small>on Them Missions</small></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button><nav id="site-nav" aria-label="Main navigation">${nav.map(([url, label]) => `<a href="${url}" ${route === url ? 'aria-current="page"' : ''}>${label}</a>`).join('')}<a class="nav-cta" href="/prayer-request/">Submit Prayer</a></nav></div></header>`;

const footer = `<footer class="site-footer"><div class="wrap footer-grid"><div><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><img src="/assets/hctm-mark.svg" alt="" width="42" height="42" style="border-radius:10px"><h2 style="font-size:1.7rem;margin:0">Have Compassion<br>on Them Missions</h2></div><p>Winning souls for Christ. Restoring grassroots discipleship. Providing faithful prayer and practical succour for missionaries.</p></div><div><h3>Explore &amp; Grow</h3><a href="/about/">About HCTM</a><a href="/missions/">Missions &amp; Work</a><a href="/salvation/">Receive Jesus (Salvation Guide)</a><a href="/scriptures/">Topical Scripture Bank</a><a href="/blog/">Blog &amp; Writings Archive</a><a href="/gallery/">Mission Field Gallery</a><a href="/training/">Training &amp; Discipleship</a><a href="/support/">Support Missionaries</a></div><div><h3>Connect &amp; Pray</h3><a href="/prayer-request/">Submit a prayer request</a>${ext(whatsapp, 'WhatsApp prayer group', '')}${ext(telegram, 'Telegram prayer channel', '')}${ext(direct, 'Contact HCTM directly', '')}<a href="/privacy/">Privacy notice</a></div></div><div class="wrap footer-end"><div>© ${new Date().getFullYear()} Have Compassion on Them Missions. All rights reserved.</div><span>“And of some have compassion, making a difference.” — Jude 1:22</span></div></footer>`;

const page = (route, title, description, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | HCTM</title><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)} | HCTM"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><link rel="icon" href="/assets/hctm-mark.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/ministry.css"><script src="/assets/ministry.js" defer></script></head><body>${header(route)}<main id="main">${body}</main>${footer}</body></html>`;

const intro = (title, text) => `<section class="page-intro"><div class="wrap"><p class="section-label">Have Compassion on Them Missions</p><h1>${title}</h1><p class="lead">${text}</p></div></section>`;
const section = (title, text, action = '') => `<section class="wrap section"><div><h2>${title}</h2></div><div class="section-content">${text}${action}</div></section>`;

const mandate = `<div class="mandate"><article><div class="mandate-icon" aria-hidden="true">🌱</div><h3>Restore discipleship</h3><p>Encourage believers to make disciples in their everyday communities and help others grow in their walk with Christ.</p><div style="margin-top:14px"><a href="#" class="verse-trigger" data-verse="Matthew 28:19">Matt 28:19</a></div></article><article><div class="mandate-icon" aria-hidden="true">🔥</div><h3>Revive the missionary spirit</h3><p>Awaken a renewed burden for souls through going, praying, and supporting those on the mission field.</p><div style="margin-top:14px"><a href="#" class="verse-trigger" data-verse="Acts 1:8">Acts 1:8</a></div></article><article><div class="mandate-icon" aria-hidden="true">🧭</div><h3>Reach the unreached</h3><p>Bring the gospel to unreached people and places, with practical care for missionaries and suffering saints.</p><div style="margin-top:14px"><a href="#" class="verse-trigger" data-verse="Luke 19:10">Luke 19:10</a></div></article></div>`;

const community = `<div class="community-grid"><article><h3>WhatsApp prayer group</h3><p>Stand with the Have Compassion intercessory prayer community in prayer for souls and missionaries.</p>${ext(whatsapp, 'Join on WhatsApp')}</article><article><h3>Telegram prayer channel</h3><p>Connect with the ministry’s prayer channel and take part in our shared commitment to intercession.</p>${ext(telegram, 'Join on Telegram')}</article></div>`;

const captions = [
  'People gathered outdoors in a street setting.',
  'A man speaking into a microphone beside a woman outdoors.',
  'An outdoor gathering with a woman speaking into a microphone.'
];
const photo = n => `<img src="/assets/field-${n}.jpeg" alt="${captions[n - 1]}" ${n !== 2 ? 'loading="lazy"' : ''} width="1280" height="960">`;

const recent = posts.slice(0, 3).map(p => `<article class="writing"><a class="writing-thumbnail" href="/p/${p.id}.html" aria-label="Read ${esc(p.title)}"><img src="/${esc(p.images?.[0]?.src || 'assets/hero-enhanced.png')}" alt="${esc(p.images?.[0]?.alt || p.title)}" loading="lazy" decoding="async" width="640" height="400"></a><p class="byline">Latunde Akin · ${esc(p.date)}</p><h3><a href="/p/${p.id}.html">${esc(p.title)}</a></h3><p>${esc(p.text.replace(/\s+/g, ' ').slice(0, 150))}…</p><a class="text-link" href="/p/${p.id}.html">Read this writing</a></article>`).join('');

const heroCarousel = `<section class="hero">
  <div class="hero-carousel">
    <!-- Slide 1: Mission & Outreach -->
    <div class="hero-slide is-active" aria-hidden="false">
      <div class="hero-copy">
        <p class="section-label">A heart for souls · A commitment to serve</p>
        <h1>Have compassion.<br>Reach the lost.<br>Stand with those<br>who go.</h1>
        <p>Restoring grassroots discipleship, sharing the gospel of Jesus Christ, and supporting faithful missionaries on the field.</p>
        <div class="actions">
          ${button('/missions/', 'Discover our mission')}
          ${button('/salvation/', 'Receive Jesus Today', true)}
        </div>
      </div>
      <div class="hero-image">
        <img src="/assets/hero-enhanced.png" alt="A man speaking into a microphone beside a woman outdoors." width="1161" height="1355" fetchpriority="high" decoding="async">
        <p>Faith in action, in everyday places.</p>
      </div>
    </div>

    <!-- Slide 2: Grassroots Discipleship -->
    <div class="hero-slide" aria-hidden="true">
      <div class="hero-copy">
        <p class="section-label">Grassroots Discipleship · Kingdom Labor</p>
        <h1>Equipping believers<br>to bear fruit<br>and make disciples.</h1>
        <p>Encouraging ordinary Christians to shine the light of Christ in their communities and raising dedicated workers for the harvest field.</p>
        <div class="actions">
          ${button('/training/', 'Acts of Missions Training')}
          ${button('/gallery/', 'Explore field gallery', true)}
        </div>
      </div>
      <div class="hero-image">
        <img src="/assets/field-1.jpeg" alt="People gathered outdoors in a street setting." width="1280" height="960" decoding="async">
        <p>Reaching communities where they live and work.</p>
      </div>
    </div>

    <!-- Slide 3: Intercession & Support -->
    <div class="hero-slide" aria-hidden="true">
      <div class="hero-copy">
        <p class="section-label">Prayer &amp; Intercession · Standing in the Gap</p>
        <h1>Standing with<br>missionaries in<br>prayer &amp; care.</h1>
        <p>Missionaries need intercessors and practical succour—food, shelter, and financial backing—as they carry the gospel to unreached places.</p>
        <div class="actions">
          ${button('/support/', 'Support missionaries')}
          ${button('/prayer/', 'Join prayer network', true)}
        </div>
      </div>
      <div class="hero-image">
        <img src="/assets/field-3.jpeg" alt="An outdoor gathering with a woman speaking into a microphone." width="1280" height="960" decoding="async">
        <p>United intercession for the advancement of the gospel.</p>
      </div>
    </div>

    <!-- Carousel Controls -->
    <div class="carousel-nav" aria-label="Hero carousel navigation">
      <div class="carousel-indicators" role="tablist">
        <button class="carousel-dot is-active" aria-label="Slide 1" aria-selected="true" role="tab"></button>
        <button class="carousel-dot" aria-label="Slide 2" aria-selected="false" role="tab"></button>
        <button class="carousel-dot" aria-label="Slide 3" aria-selected="false" role="tab"></button>
      </div>
      <div class="carousel-arrows">
        <button class="carousel-arrow carousel-prev" aria-label="Previous slide">‹</button>
        <button class="carousel-arrow carousel-next" aria-label="Next slide">›</button>
      </div>
    </div>
  </div>
</section>`;

const dailyMannaWidget = `<div class="daily-manna-card">
  <div class="manna-badge">📖 Daily Manna for the Harvest</div>
  <p id="manna-verse-text" class="manna-verse">“The harvest truly is plenteous, but the labourers are few; Pray ye therefore the Lord of the harvest, that he will send forth labourers into his harvest.”</p>
  <p id="manna-verse-ref" class="manna-ref">MATTHEW 9:37–38 (KJV)</p>
  <div class="actions" style="margin-top:0">
    <button id="daily-manna-share" class="button btn-sm">📲 Share to WhatsApp Status</button>
    <a href="/scriptures/" class="button secondary btn-sm" style="color:white;border-color:rgba(255,255,255,0.4)">Explore Scripture Bank →</a>
  </div>
</div>`;

const pages = new Map();

pages.set('/', page(
  '/',
  'Have compassion. Reach the lost.',
  'HCTM restores grassroots discipleship, reaches souls for Christ, and supports missionaries.',
  `${heroCarousel}
  <section class="wrap calling">
    <div>
      <p class="section-label">The Great Commission</p>
      <h2>The gospel calls us<br>to care and to go.</h2>
    </div>
    <div>
      <p>Have Compassion on Them Missions brings together believers with a shared burden to reach others for Christ. Some go into unreached fields. Some intercede in marathon prayer. Some provide food, shelter, and financial care. Together, we serve our Lord Jesus Christ.</p>
      <p style="margin-top:14px;font-weight:600"><a href="/salvation/" style="color:var(--navy);text-decoration:underline">Do you know Jesus Christ as your Savior? Learn how to receive Him today →</a></p>
    </div>
  </section>
  <section class="wrap section-block">
    ${dailyMannaWidget}
    <div style="text-align:center;max-width:680px;margin:0 auto 40px">
      <p class="section-label" style="justify-content:center">Our Calling</p>
      <h2 style="margin-bottom:12px">Our Mandate</h2>
      <p style="margin:auto">Dedicated to the glory of God and the salvation of men through biblical ministry principles.</p>
    </div>
    ${mandate}
  </section>
  <section class="prayer-band">
    <div class="wrap">
      <div>
        <p class="section-label" style="color:var(--gold)">Prayer &amp; Succour</p>
        <h2>How can we stand<br>in prayer with you?</h2>
      </div>
      <div>
        <p>Share a personal prayer request with the ministry, or stand with our intercessory prayer network lifting up souls, communities, and missionaries on the frontlines.</p>
        <div class="actions">
          ${button('/prayer-request/', 'Submit a prayer request')}
          ${button('/prayer/', 'Join our prayer community', true)}
        </div>
      </div>
    </div>
  </section>
  <section class="wrap section-block">
    <div class="row-heading">
      <div>
        <p class="section-label">From the field</p>
        <h2>Compassion meets people<br>where they are.</h2>
      </div>
      <a class="text-link" href="/gallery/">Explore the gallery</a>
    </div>
    <div class="photo-pair">
      ${photo(1)}
      ${photo(3)}
    </div>
  </section>
  <section class="wrap section-block">
    <div class="row-heading">
      <div>
        <p class="section-label">Biblical Exhortation</p>
        <h2>Writings for a fruitful walk</h2>
      </div>
      <a class="text-link" href="/blog/">All ${posts.length} writings</a>
    </div>
    <div class="writing-grid">
      ${recent}
    </div>
  </section>`
));

pages.set('/about/', page(
  '/about/',
  'About HCTM',
  'Learn about the heart and mandate of Have Compassion on Them Missions.',
  intro('A heart for souls.<br>A life of service.', 'Have Compassion on Them Missions is a Christian ministry dedicated to winning souls for Christ, restoring biblical discipleship, and providing practical care for missionaries.') +
  section('Why we serve', '<p>Our burden is to reach unreached people and places with the gospel of Jesus Christ, strengthen discipleship among believers, and stand alongside suffering saints and missionaries in need.</p><p>We value faithful service, including work carried out quietly and away from public attention. Our focus is on the people being reached and supported, rather than recognition for ourselves.</p>') +
  `<section class="wrap section-block"><h2>Our mandate</h2>${mandate}</section>` +
  section('Let your faith bear fruit', '<p>Share the light of Christ in your community, take personal evangelism seriously, and help others grow as disciples. Whether through going, intercession, or support, respond with a willing heart.</p>', button('/missions/', 'Explore our work'))
));

pages.set('/missions/', page(
  '/missions/',
  'Our mission and work',
  'Gospel outreach, grassroots discipleship, missionary training, and practical care.',
  intro('Reach. Disciple.<br>Stand alongside.', 'Our mission brings together gospel outreach, grassroots discipleship, the training of workers, and practical support for missionaries.') +
  `<section class="wrap section-block">${mandate}</section>` +
  section('The work of discipleship', '<p>HCTM has a network of missionaries across the states engaged in discipleship, alongside student missionaries undergoing training. We seek more believers willing to go, serve, and help others come to know Christ.</p><p>We encourage believers to become fruitful in their own communities and stand alongside those carrying the gospel to unreached people and places.</p>') +
  section('Care for those who go', '<p>Missionaries need faithful prayer, food, shelter, and financial support as they serve. We invite believers who share this burden to discuss current needs with the ministry.</p>', `<div class="actions">${button('/support/', 'Support missionaries')}${button('/prayer/', 'Pray for the work', true)}</div>`)
));

// SALVATION & GOSPEL GUIDE PAGE
pages.set('/salvation/', page(
  '/salvation/',
  'Receive Jesus | Gospel Salvation Guide',
  'How to be saved, receive forgiveness through Jesus Christ, and begin your discipleship walk.',
  intro('Receive Jesus Christ.<br>A New Beginning.', 'Salvation is the free gift of God through Jesus Christ. Learn the message of the cross, repent, and start your discipleship journey today.') +
  `<section class="wrap section-block">
    <div class="salvation-step">
      <div class="step-num">1</div>
      <h3>God Loves You and Has a Divine Purpose</h3>
      <p>God did not create you for defeat, sin, or eternal condemnation. He created you to know Him and enjoy holy fellowship with Him. His love is eternal, pure, and demonstrated through Jesus.</p>
      <p><a href="#" class="verse-trigger" data-verse="John 3:16">John 3:16</a> — <em>“For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.”</em></p>
    </div>

    <div class="salvation-step">
      <div class="step-num">2</div>
      <h3>The Reality of Sin &amp; Separation from God</h3>
      <p>Every person has sinned and fallen short of God’s glory. Sin breaks our relationship with a holy God and produces spiritual death. No amount of good deeds can wash away our sins.</p>
      <p><a href="#" class="verse-trigger" data-verse="Romans 3:23">Romans 3:23</a> — <em>“For all have sinned, and come short of the glory of God;”</em> and <a href="#" class="verse-trigger" data-verse="Romans 6:23">Romans 6:23</a> — <em>“For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.”</em></p>
    </div>

    <div class="salvation-step">
      <div class="step-num">3</div>
      <h3>Jesus Christ Died for You and Rose Again</h3>
      <p>Because God loved us, He sent His Son Jesus Christ to take our punishment upon Himself on the cross of Calvary. On the third day, He rose again from the dead, conquering sin and death!</p>
      <p><a href="#" class="verse-trigger" data-verse="Romans 5:8">Romans 5:8</a> — <em>“But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.”</em></p>
    </div>

    <div class="salvation-step">
      <div class="step-num">4</div>
      <h3>Repentance, Faith, and Confession</h3>
      <p>To receive this salvation, you must turn from sin in genuine repentance and surrender your life to Jesus Christ as your personal Lord and Savior.</p>
      <p><a href="#" class="verse-trigger" data-verse="Romans 10:9-10">Romans 10:9–10</a> — <em>“That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.”</em></p>
    </div>

    <div class="sinner-prayer-box">
      <span class="bible-tag" style="background:rgba(212,175,55,0.25);color:var(--gold)">THE PRAYER OF SURRENDER</span>
      <h2>Pray This Prayer Sincerely</h2>
      <p>If you desire to surrender your life to Jesus Christ today, pray this prayer out loud from the depth of your heart:</p>
      <p class="lead-prayer">“Lord Jesus Christ, I come to You today recognizing that I am a sinner. I cannot save myself. I believe that You died on the cross for my sins and rose again from the dead. Today, I turn away from all sin and surrender my life to You. Wash me clean with Your precious blood. Come into my heart, be my Savior, and be the Lord of my life. Fill me with Your Holy Spirit and grant me the grace to follow You all the days of my life. Thank You Lord for saving me. In Jesus’ name, Amen!”</p>
      <div class="salvation-decision-actions">
        <a class="button" href="https://wa.me/2348123428989?text=${encodeURIComponent('Praise God! I surrendered my life to Jesus Christ today through the HCTM website! I need prayers and discipleship guidance.')}" target="_blank" rel="noopener noreferrer">🎉 I Gave My Life to Jesus Today!</a>
        <a class="button secondary" style="color:white;border-color:rgba(255,255,255,0.4)" href="https://wa.me/2348123428989?text=${encodeURIComponent('Hello HCTM, I prayed to rededicate my life to Jesus Christ today. Please stand with me in prayer.')}" target="_blank" rel="noopener noreferrer">I Rededicated My Life</a>
      </div>
    </div>

    <div class="salvation-step" style="border-top:3px solid var(--navy)">
      <h3>Next Steps for Your New Life in Christ</h3>
      <p>When you give your life to Jesus, you become a brand-new creation (<a href="#" class="verse-trigger" data-verse="2 Corinthians 5:17">2 Cor 5:17</a>). Here are vital steps to grow:</p>
      <ul style="padding-left:20px;color:var(--ink-light);line-height:1.8">
        <li><strong>Pray Daily:</strong> Speak with God every day in prayer as your heavenly Father (<a href="#" class="verse-trigger" data-verse="1 Thessalonians 5:17">1 Thess 5:17</a>).</li>
        <li><strong>Read God’s Word:</strong> Start reading the New Testament (begin with the Gospel of John).</li>
        <li><strong>Christian Fellowship:</strong> Find a true Bible-believing, Christ-centered church fellowship.</li>
        <li><strong>Get Discipled:</strong> Contact HCTM on WhatsApp so we can pray with you and send discipleship materials.</li>
      </ul>
      <div class="actions" style="margin-top:20px">
        ${button('/training/', 'Discipleship & Training')}
        ${button('/contact/', 'Message HCTM Discipleship', true)}
      </div>
    </div>
  </section>`
));

// TOPICAL SCRIPTURE BANK PAGE
pages.set('/scriptures/', page(
  '/scriptures/',
  'Scriptures for Soul Winning, Prayer & Warfare',
  'A biblical treasury of scriptures for soul winning, midnight intercession, spiritual warfare, and missionary care.',
  intro('Scriptures for the Harvest.<br>Sword of the Spirit.', 'A topical treasury of foundational scriptures for evangelism, marathon intercession, spiritual warfare, and missionary succour. Click any verse to preview, copy, or share.') +
  `<section class="wrap section-block">
    <div class="scripture-card-grid">
      <!-- Harvest & Soul Winning -->
      <article class="scripture-card">
        <span class="scripture-card-category">🌾 Soul Winning &amp; The Harvest</span>
        <p class="verse-text">“The fruit of the righteous is a tree of life; and he that winneth souls is wise.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="Proverbs 11:30">Proverbs 11:30 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="Proverbs 11:30">Preview &amp; Share</a>
        </div>
      </article>

      <article class="scripture-card">
        <span class="scripture-card-category">🌾 Soul Winning &amp; The Harvest</span>
        <p class="verse-text">“Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="Matthew 28:19">Matthew 28:19 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="Matthew 28:19">Preview &amp; Share</a>
        </div>
      </article>

      <article class="scripture-card">
        <span class="scripture-card-category">🌾 Soul Winning &amp; The Harvest</span>
        <p class="verse-text">“For the Son of man is come to seek and to save that which was lost.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="Luke 19:10">Luke 19:10 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="Luke 19:10">Preview &amp; Share</a>
        </div>
      </article>

      <!-- Prayer & Intercession -->
      <article class="scripture-card">
        <span class="scripture-card-category">⚔️ Intercession &amp; Marathon Prayer</span>
        <p class="verse-text">“Pray without ceasing.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="1 Thessalonians 5:17">1 Thessalonians 5:17 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="1 Thessalonians 5:17">Preview &amp; Share</a>
        </div>
      </article>

      <article class="scripture-card">
        <span class="scripture-card-category">⚔️ Intercession &amp; Marathon Prayer</span>
        <p class="verse-text">“The effectual fervent prayer of a righteous man availeth much.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="James 5:16">James 5:16 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="James 5:16">Preview &amp; Share</a>
        </div>
      </article>

      <!-- Spiritual Warfare -->
      <article class="scripture-card">
        <span class="scripture-card-category">🛡️ Spiritual Warfare &amp; Victory</span>
        <p class="verse-text">“Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood...”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="Ephesians 6:10-12">Ephesians 6:10–12 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="Ephesians 6:10-12">Preview &amp; Share</a>
        </div>
      </article>

      <!-- Brokenness & Surrender -->
      <article class="scripture-card">
        <span class="scripture-card-category">🤍 Brokenness &amp; Discipleship</span>
        <p class="verse-text">“I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="Galatians 2:20">Galatians 2:20 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="Galatians 2:20">Preview &amp; Share</a>
        </div>
      </article>

      <!-- Missionary Care -->
      <article class="scripture-card">
        <span class="scripture-card-category">🤝 Caring for Missionaries &amp; Saints</span>
        <p class="verse-text">“We therefore ought to receive such, that we might be fellowhelpers to the truth.”</p>
        <div class="verse-ref"><a href="#" class="verse-trigger" data-verse="3 John 1:8">3 John 1:8 (KJV)</a></div>
        <div class="card-actions">
          <a href="#" class="button secondary btn-sm verse-trigger" data-verse="3 John 1:8">Preview &amp; Share</a>
        </div>
      </article>
    </div>
  </section>`
));

pages.set('/prayer/', page(
  '/prayer/',
  'Prayer and intercession',
  'Join the HCTM prayer community on WhatsApp and Telegram.',
  intro('Stand with us<br>in prayer.', 'We intercede for souls, missionaries, suffering saints, and communities waiting to hear the gospel. Join us in faithful, committed prayer.') +
  `<section class="wrap section-block">
    <div style="text-align:center;max-width:680px;margin:0 auto 35px">
      <p class="section-label" style="justify-content:center">Intercession Watch</p>
      <h2>Community Prayer Wall</h2>
      <p>Stand in agreement with our global intercessors. Tap below to register your prayer commitment for each field burden.</p>
    </div>
    <div class="prayer-wall-grid">
      <div class="prayer-item-card">
        <span class="prayer-item-tag">Frontline Missions</span>
        <h3>Unreached Tribes &amp; Hostile Territories</h3>
        <p>Praying for divine protection, open doors, and receptive hearts in regions where the gospel has never been preached or faces severe persecution.</p>
        <button class="prayer-stand-btn" data-prayer-id="unreached">
          <span class="prayer-btn-label">🙏 I Stood in Prayer</span>
          <span class="prayer-count-badge"><span class="prayer-count">48</span> intercessors</span>
        </button>
      </div>

      <div class="prayer-item-card">
        <span class="prayer-item-tag">Missionary Succour</span>
        <h3>Sustenance &amp; Health for Laborers</h3>
        <p>Interceding for field missionaries and their families facing hunger, sickness, and financial distress. That God supplies every need.</p>
        <button class="prayer-stand-btn" data-prayer-id="sustenance">
          <span class="prayer-btn-label">🙏 I Stood in Prayer</span>
          <span class="prayer-count-badge"><span class="prayer-count">36</span> intercessors</span>
        </button>
      </div>

      <div class="prayer-item-card">
        <span class="prayer-item-tag">Revival &amp; Discipleship</span>
        <h3>Awakening the Burden for Souls</h3>
        <p>Breaking lukewarmness and religious complacency. Praying for young believers to catch the fire of evangelism and personal discipleship.</p>
        <button class="prayer-stand-btn" data-prayer-id="revival">
          <span class="prayer-btn-label">🙏 I Stood in Prayer</span>
          <span class="prayer-count-badge"><span class="prayer-count">52</span> intercessors</span>
        </button>
      </div>

      <div class="prayer-item-card">
        <span class="prayer-item-tag">Souls &amp; Deliverance</span>
        <h3>Backsliders &amp; Bound Souls to be Rescued</h3>
        <p>Fervent prayer pulling souls out of demonic bondage, moral collapse, and spiritual blindness into the marvelous light of Christ.</p>
        <button class="prayer-stand-btn" data-prayer-id="deliverance">
          <span class="prayer-btn-label">🙏 I Stood in Prayer</span>
          <span class="prayer-count-badge"><span class="prayer-count">61</span> intercessors</span>
        </button>
      </div>
    </div>
  </section>
  <section class="wrap section-block"><h2>Join our prayer community</h2>${community}</section>` +
  section('Prayer for your own needs', '<p>If you would like the ministry to pray with you, share your request directly. Joining a community group is optional.</p>', button('/prayer-request/', 'Submit a prayer request'))
));

pages.set('/prayer-request/', page(
  '/prayer/',
  'Submit a prayer request',
  'Share a prayer request with HCTM directly on WhatsApp.',
  intro('How can we<br>pray with you?', 'You are welcome to share a prayer request with HCTM. Tell us what you would like prayer for, sharing only the details you are comfortable providing.') +
  `<section class="wrap request-layout">
    <div>
      <h2>A simple way to reach us</h2>
      <p>Write your request below, then continue to WhatsApp. You will review it there and choose whether to send it.</p>
      <p>Or ${ext(direct, 'open a direct WhatsApp conversation', 'inline-link')} without writing here.</p>
      <p class="muted">Please avoid passwords, bank details, medical records, and private information about other people.</p>
      <a href="/privacy/" style="font-weight:600;font-size:0.95rem">Read our privacy notice</a>
    </div>
    <form id="prayer-form" class="prayer-form">
      <label for="prayer-name">Your name <span>(optional)</span></label>
      <input id="prayer-name" name="name" maxlength="100" autocomplete="given-name" placeholder="First name, or leave blank">
      <label for="prayer-message">Your prayer request</label>
      <textarea id="prayer-message" name="request" required maxlength="3000" rows="7" placeholder="What would you like us to pray about?"></textarea>
      <label class="check-label"><input type="checkbox" name="reply" id="prayer-reply"> I would like a reply on WhatsApp</label>
      <p class="form-note">This page does not send or store your request. Continuing puts your text into a WhatsApp link so you can review it before sending. WhatsApp handles the next step.</p>
      <button type="submit" class="button">Review request in WhatsApp</button>
      <noscript><p>Use the direct WhatsApp link above to share your request.</p></noscript>
    </form>
  </section>`
));

pages.set('/gallery/', page(
  '/gallery/',
  'Mission field gallery',
  'Photographs shared with HCTM from street gatherings and outreach.',
  intro('From the<br>mission field.', 'A glimpse of the people, gatherings, and everyday moments connected with sharing Christ and serving others.') +
  `<section class="wrap section-block">
    <p class="gallery-note">Photographs shared with the ministry. We share with gratitude, keeping service and compassion at the heart of the story.</p>
    <div class="gallery-grid">
      ${[1, 2, 3].map(n => `<figure><a class="gallery-open" href="/assets/field-${n}.jpeg" data-caption="${captions[n - 1]}" aria-label="View photograph ${n} in full">${photo(n)}</a><figcaption>${captions[n - 1]}</figcaption></figure>`).join('')}
    </div>
  </section>
  <dialog id="photo-dialog">
    <button id="photo-close" class="dialog-close" aria-label="Close full-size photograph">Close</button>
    <img id="dialog-image" alt="">
    <p id="dialog-caption"></p>
  </dialog>`
));

pages.set('/training/', page(
  '/training/',
  'Training and discipleship',
  'Learn about HCTM’s planned online revival training on missions and soul winning.',
  intro('Grow in faith.<br>Go with purpose.', 'Be encouraged in missions, soul winning, and the responsibility of making disciples.') +
  section('Acts of Missions and Soul Winning', '<p class="feature-subtitle">Responsibility of Every Believer</p><p>HCTM plans to organize online revival training to encourage believers to put their faith into practice and share Christ with others.</p><p><strong>Dates to be announced.</strong> Contact the ministry to express interest and ask about future training announcements.</p>', ext(direct, 'Ask about upcoming training')) +
  section('Learning through discipleship', '<p>Explore the writings archive for reflections on prayer, missions, Christian living, and growing as a disciple of Christ.</p>', button('/blog/', 'Explore the writings'))
));

pages.set('/support/', page(
  '/support/',
  'Support missionaries',
  'Stand with missionaries through prayer, finances, food, and shelter.',
  intro('Stand with<br>those who go.', 'Missionaries need people who will pray faithfully and help meet practical needs. Your willing service can make a difference.') +
  section('Pray faithfully', '<p>Join committed intercession for souls, missionaries, and the advancement of the gospel.</p>', button('/prayer/', 'Join in prayer')) +
  section('Provide practical support', '<p>HCTM invites believers in Christ with a burden for missionaries to help with finances, food, and shelter. In keeping with the ministry’s conviction, this appeal is addressed to believers in Christ.</p><p>Contact the ministry to discuss current needs and how you can help. Sincere commitment and sacrificial service are at the heart of this invitation.</p>', ext(direct, 'Discuss missionary support'))
));

pages.set('/contact/', page(
  '/contact/',
  'Contact HCTM',
  'Contact Have Compassion on Them Missions through WhatsApp.',
  intro('Let’s talk<br>about the work.', 'Get in touch about prayer, discipleship, training, or support for missionaries.') +
  section('Message the ministry', '<p>WhatsApp: <strong>08123428989</strong><br>Outside Nigeria: <strong>+234 812 342 8989</strong></p>', ext(direct, 'Message HCTM on WhatsApp')) +
  `<section class="wrap section-block"><h2>Connect with the prayer community</h2>${community}</section>`
));

pages.set('/privacy/', page(
  '/privacy/',
  'Privacy notice',
  'How this website handles prayer drafts and external contact links.',
  intro('Your information.<br>Your choice.', 'Share only the information you are comfortable providing when you contact the ministry.') +
  section('Prayer request drafts', '<p>The prayer request page lets you draft a message in your browser. The site does not submit the draft to a ministry database or save it in browser storage. When you continue, your draft is included in a WhatsApp link. Review the message and choose whether to send it in WhatsApp.</p><p>Sending a message shares it, and the information associated with your WhatsApp account, through WhatsApp to the ministry. Avoid including private information about other people. Once sent, a message may remain in the recipient’s conversation.</p>') +
  section('External services', '<p>WhatsApp and Telegram links open those services. Their own terms and privacy practices apply, and joining a group may make account information visible to its administrators or members. You do not have to join a group to contact the ministry directly.</p><p>The hosting provider processes requests needed to deliver pages and may retain operational logs. We have not added a site analytics tracker. The blog uses external font and icon providers, which receive requests when their resources load.</p>') +
  section('Blog preferences', '<p>The writings archive uses your browser’s local storage for reading preferences and saved article bookmarks. These choices stay in that browser. You can remove them by clearing this site’s browser data.</p>') +
  section('Questions about information', '<p>Contact the ministry on WhatsApp with questions about a message you have sent or to request removal of information from ministry-held conversations. Handling and any retention obligations depend on the message and services involved.</p>', ext(direct, 'Contact HCTM'))
));

const pagePhotos = new Map([
  ['/about/', 1],
  ['/missions/', 3],
  ['/salvation/', 2],
  ['/scriptures/', 1],
  ['/prayer/', 1],
  ['/prayer-request/', 2],
  ['/training/', 3],
  ['/support/', 1],
  ['/contact/', 2],
  ['/privacy/', 3]
]);

for (const [route, n] of pagePhotos) {
  let html = pages.get(route);
  if (!html) continue;
  html = html.replace('<section class="page-intro"><div class="wrap">', '<section class="page-intro has-photo"><div class="wrap"><div class="intro-copy">');
  const src = n === 2 ? '/assets/hero-enhanced.png' : `/assets/field-${n}.jpeg`;
  html = html.replace('</p></div></section>', `</p></div><figure class="intro-photo"><img src="${src}" alt="${captions[n - 1]}" width="1280" height="960" decoding="async"><figcaption>Shared from the field</figcaption></figure></div></section>`);
  pages.set(route, html);
}

for (const [route, html] of pages) {
  pages.set(route, html.replace('</head>', '<link rel="stylesheet" href="/assets/page-imagery.css"></head>'));
}

pages.set('/prayer-request/', pages.get('/prayer-request/').replace('<button type="submit"', '<button id="prayer-submit" disabled type="submit"'));

await fs.mkdir(path.join(dist, 'assets'), { recursive: true });
for (let n = 1; n <= 3; n++) {
  await fs.copyFile(path.join(root, 'assets', `field-${n}.jpeg`), path.join(dist, 'assets', `field-${n}.jpeg`));
}
for (const name of ['ministry.css', 'ministry.js', 'hctm-mark.svg', 'hero-enhanced.png', 'page-imagery.css']) {
  await fs.copyFile(path.join(root, 'assets', name), path.join(dist, 'assets', name));
}

for (const [route, html] of pages) {
  const directory = path.join(dist, route.slice(1));
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html);
}

let blog = await read('templates/blog.html');
blog = blog.replaceAll('src="assets/', 'src="/assets/').replaceAll('href="assets/', 'href="/assets/').replace('src="posts.js"', 'src="/posts.js"').replace("fetch('posts.json')", "fetch('/posts.json')");
blog = blog.replace('<script src="/posts.js"></script>', '<script src="/posts.js"></script><script>window.POSTS_DATA=(window.POSTS_DATA||[]).map(p=>({...p,images:(p.images||[]).map(i=>({...i,src:"/"+i.src.replace(/^\\//,"")}))}));</script>');
blog = blog.replace("else if (selectedCategory === 'saved')", "else if (selectedCategory === 'facebook') matchesCategory = /(?:^|\\.)facebook\\.com$|(?:^|\\.)fb\\.com$/.test(new URL(p.url).hostname);\n        else if (selectedCategory === 'saved')");
blog = blog.replace('<button class="tag-chip" data-category="saved">', '<button class="tag-chip" data-category="facebook">Facebook Posts</button><button class="tag-chip" data-category="saved">');

const blogReturnBar = `<div class="ministry-return" style="padding:10px 5%;background:#081a2b;color:#d1dde6;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:0.9rem;border-bottom:1px solid rgba(212,175,55,0.3)">
  <div style="display:flex;align-items:center;gap:10px">
    <img src="/assets/hctm-mark.svg" alt="" width="26" height="26" style="vertical-align:middle">
    <span style="font-weight:700;color:white">HCTM Ministry Archive</span>
    <span style="color:#8da4b7">·</span>
    <span style="color:#d4af37;font-style:italic">“And of some have compassion, making a difference.”</span>
  </div>
  <div style="display:flex;align-items:center;gap:18px">
    <a href="/" style="color:#ffffff;text-decoration:none;font-weight:600">← Back to HCTM Home</a>
    <a href="/salvation/" style="color:#eec765;text-decoration:none;font-weight:700">Receive Jesus</a>
    <a href="/scriptures/" style="color:#d1dde6;text-decoration:none">Scripture Bank</a>
    <a href="/prayer-request/" style="color:#d4af37;text-decoration:none;font-weight:600">Submit Prayer Request</a>
    <a href="/gallery/" style="color:#d1dde6;text-decoration:none">Field Gallery</a>
  </div>
</div>`;

blog = blog.replace('<body>', `<body>${blogReturnBar}`);
blog = blog.replace('Latunde Akin | Writings, Missions & Discipleship Archive', 'Blog and Writings | Latunde Akin | HCTM');
blog = blog.replace(/<a\b[^>]*href="sitemap\.xml"[^>]*>[\s\S]*?<\/a>/g, '');

await fs.mkdir(path.join(dist, 'blog'), { recursive: true });
await fs.writeFile(path.join(dist, 'blog/index.html'), blog);

// Preserve every established article URL/body and repair relative images and archive navigation.
for (const p of posts) {
  const file = path.join(dist, 'p', `${p.id}.html`);
  const original = await fs.readFile(file, 'utf8');
  let html = original.replaceAll('src="assets/', 'src="../assets/').replace(/href="\.\.\/index\.html#\/post\/[^\"]+"/g, 'href="../blog/"');
  if (!html.includes('btn-print-tract')) {
    html = html.replace('class="btn-share" style="color:#1877F2;">', 'class="btn-share" style="color:#1877F2;">\n            <i class="fa-brands fa-facebook"></i> Facebook\n          </a>\n          <button type="button" class="btn-share btn-print-tract" style="cursor:pointer;border:none">\n            <i class="fa-solid fa-print"></i> Print Tract\n          </button>\n          <a href="/salvation/" class="btn-share" style="color:#d4af37">\n            <i class="fa-solid fa-cross"></i> Receive Jesus\n          ');
  }
  if (!html.includes('/assets/ministry.js')) {
    html = html.replace('</body>', '<script src="../assets/ministry.js" defer></script></body>');
  }
  if (html !== original) await fs.writeFile(file, html);
}

const manifest = { pages: [...pages.keys(), '/blog/'], postIds: posts.map(p => p.id) };
await fs.writeFile(path.join(dist, 'site-manifest.json'), JSON.stringify(manifest, null, 2));

const origin = process.env.SITE_ORIGIN;
if (origin) {
  const urls = [...manifest.pages, ...posts.map(p => `/p/${p.id}.html`)];
  await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${esc(new URL(url, origin).href)}</loc></url>`).join('')}</urlset>`);
  await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`);
} else {
  await fs.writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  await fs.rm(path.join(dist, 'sitemap.xml'), { force: true });
}

console.log(`Built ${manifest.pages.length} ministry/blog pages; preserved ${posts.length} article URLs.`);

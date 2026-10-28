/* Princess Food Products — shared frontend logic
 * 1. Business settings and URLs
 * 2. Cart and wishlist storage
 * 3. Product information and nutrition notes
 * 4. Shared header/footer and rendering
 * 5. Search, filters, checkout and WhatsApp order flow
 * Edit product data in products.js; keep business details verified.
 */
const WA_NUMBER='9994437394';
// BUSINESS CONFIG: replace the social URLs with the official Princess Food Products profiles.
const SOCIAL_LINKS={
  instagram:'https://www.instagram.com/princess_food_products?utm_source=ig_web_button_share_sheet&dlrf=ZDNlZDc0MzIxNw==https://www.instagram.com/',
  facebook:'https://www.facebook.com/',
  youtube:'https://www.youtube.com/'
};
// Set this to the real delivery fee (INR) after confirming it with the business.
// Keep null until confirmed; checkout will clearly show 'To confirm' instead of inventing a charge.
const DELIVERY_CHARGE_INR=null;
const FREE_DELIVERY_MINIMUM_INR=null;
const IN_PAGES=location.pathname.includes('/pages/');
const BASE=IN_PAGES?'../':'';
function assetUrl(path){
  return path&&path.startsWith('assets/')?BASE+path:path
}
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function money(n){
  return '₹'+Number(n||0).toLocaleString('en-IN')
}
function getCart(){
  try{
    return JSON.parse(localStorage.getItem('princessCart')||'[]')
  }

  catch{
    return []
  }

}
function saveCart(cart){
  localStorage.setItem('princessCart',JSON.stringify(cart));
  updateCartCount()
}
function updateCartCount(){
  const count=getCart().reduce((s,x)=>s+x.qty,0);
  $$('[data-cart-count]').forEach(el=>el.textContent=count);
  updateWishlistCount()
}
function getWishlist(){
  try{
    return JSON.parse(localStorage.getItem('princessWishlist')||'[]')
  }

  catch{
    return []
  }

}
function updateWishlistCount(){
  $$('[data-wishlist-count]').forEach(el=>el.textContent=getWishlist().length)
}
function toggleWishlist(id){
  let items=getWishlist();
  items=items.includes(id)?items.filter(x=>x!==id):[...items,id];
  localStorage.setItem('princessWishlist',JSON.stringify(items));
  updateWishlistCount();
  $$(`[data-wishlist="${CSS.escape(id)}"]`).forEach(btn=>{
    const active=items.includes(id);btn.classList.toggle('is-saved',active);btn.setAttribute('aria-pressed',String(active));btn.setAttribute('aria-label',active?'Remove from wishlist':'Add to wishlist')
  }

  );
  if(new URLSearchParams(location.search).get('view')==='wishlist'&&!items.includes(id)){
    const card=$(`[data-product-card="${CSS.escape(id)}"]`);
    card?.remove();
    if($('#shopGrid')&&!$('#shopGrid .product-card'))$('#shopGrid').innerHTML='<div class="empty-state">Your wishlist is empty. Save a few pantry favourites to find them here.</div>'
  }

  toast(items.includes(id)?'Added to your wishlist':'Removed from your wishlist')
}
// PRODUCT LOOKUPS AND SAFE DEFAULT PRODUCT INFORMATION
function productById(id){
  return (window.PRODUCTS||[]).find(p=>p.id===id)
}
function displayIngredients(p){
  const value=String(p.ingredients||'').trim();
  if(!value||value==='Business to confirm'||value.startsWith('Suggested draft:'))return 'Please contact us to confirm the exact ingredient list for this product.';
  return value
}
function displayAllergens(p){
  const value=String(p.allergens||'').trim();
  return !value||value==='Business to confirm'?'Please contact us to confirm allergen details before ordering.':value
}
function displayStorage(p){
  const value=String(p.storage||'').trim();
  return !value||value==='Business to confirm'?'Keep sealed in a cool, dry place. Follow any storage instructions printed on the pack.':value
}
function displayShelfLife(p){
  const value=String(p.shelfLife||'').trim();
  return !value||value==='Business to confirm'?'Check the product pack for the best-before date.':value
}
// TAMIL NUTRITION / FOOD INFORMATION BY PRODUCT CATEGORY
function productNutritionInfo(p){
  const id=String(p.id||'').toLowerCase(), cat=String(p.category||'').toLowerCase();
  if(id.includes('siruthaniya-laddu')||id.includes('ragi-laddu')||id.includes('sathumavu')||id.includes('karuppu-kavuni')||id.includes('varagu-pongal')||cat.includes('millet')||cat.includes('health')) return {
    title:'சத்துகள் மற்றும் உணவுப் பயன்கள்',items:[['சிறுதானியங்களின் சத்துகள்','சிறுதானியங்கள் மற்றும் பருப்புகளில் இருந்து நார்ச்சத்து, கார்போஹைட்ரேட் மற்றும் சில தாதுச்சத்துகள் கிடைக்கலாம்.'],['ஆற்றலுக்கு உதவும்','தானியங்கள், பருப்புகள் மற்றும் சேர்க்கப்பட்ட இனிப்புப் பொருட்கள் உடலுக்குத் தேவையான ஆற்றலை வழங்கலாம்.']]
  };
  if(id.includes('ulundhu-kali')) return {
    title:'சத்துகள் மற்றும் உணவுப் பயன்கள்',items:[['ஆற்றல் வழங்கும் உணவு','அரிசி மற்றும் உளுந்து போன்ற பொருட்களில் இருந்து கார்போஹைட்ரேட் மற்றும் தாவரப் புரதம் கிடைக்கலாம்.'],['உணவின் ஒரு பகுதியாக','சமச்சீரான உணவுடன் அளவோடு சேர்த்துச் சாப்பிடலாம்; உண்மையான சத்துகள் தயாரிப்பு முறையைப் பொறுத்தது.']]
  };
  if(cat.includes('pickle')||cat.includes('thokku')||id.includes('thokku')||id.includes('pirandai')) return {
    title:'உணவுப் பயன்கள் மற்றும் குறிப்புகள்',items:[['சுவை சேர்க்கும் துணை உணவு','தொக்கு மற்றும் ஊறுகாயை உணவுடன் சிறிய அளவில் சேர்த்துச் சாப்பிடலாம்.'],['உப்பும் எண்ணெயும் கவனிக்கவும்','உப்பு மற்றும் எண்ணெய் அளவு தயாரிப்பு முறையைப் பொறுத்தது; பொருத்தமான அளவில் உட்கொள்ளவும்.']]
  };
  if(id.includes('podi')||cat.includes('powder')) return {
    title:'சத்துகள் மற்றும் உணவுப் பயன்கள்',items:[['உணவில் சுவை சேர்க்க','இலைகள், பருப்புகள் மற்றும் மசாலாப் பொருட்கள் கலந்த பொடியை உணவுடன் பயன்படுத்தலாம்.'],['சத்துகள் தயாரிப்பைப் பொறுத்தது','பயன்படுத்திய பொருட்கள் மற்றும் தயாரிப்பு முறையைப் பொறுத்து சத்துகள் மாறுபடும்.']]
  };
  if(id.includes('soup')||cat.includes('soup')) return {
    title:'சத்துகள் மற்றும் உணவுப் பயன்கள்',items:[['உணவில் சேர்த்துக்கொள்ளலாம்','சூப் மிக்ஸை வழிமுறைக்கு ஏற்ப தயாரித்து சமச்சீரான உணவின் ஒரு பகுதியாக எடுத்துக்கொள்ளலாம்.'],['தயாரிப்பு விவரங்களைப் பார்க்கவும்','சேர்க்கப்பட்ட பொருட்கள் மற்றும் உப்பு அளவைப் பொதி விவரங்களுடன் சரிபார்க்கவும்.']]
  };
  return {
    title:'சத்துகள் மற்றும் உணவுப் பயன்கள்',items:[['உணவின் ஒரு பகுதியாக','இந்தப் பொருளை மாறுபட்ட, சமச்சீரான உணவின் ஒரு பகுதியாக அளவோடு சேர்த்துக்கொள்ளலாம்.'],['சத்துகள் பொருட்களைப் பொறுத்தது','சரியான ஊட்டச்சத்து விவரங்களுக்கு உறுதிப்படுத்தப்பட்ட பொருள் பட்டியல் மற்றும் பொதி விவரங்களைப் பார்க்கவும்.']]
  };
}
function renderProductBenefits(p){
  const info=productNutritionInfo(p);
  return `<section class="product-benefits" aria-label="உணவுப் பயன்கள்">
<h2 class="benefits-title">${info.title}</h2>${info.items.map(([title,body])=>`<div class="product-benefit"><span class="benefit-icon" aria-hidden="true">♡</span><div><strong>${
    title
  }

  </strong><p>${
    body
  }

  </p></div></div>`).join('')}</section>`
}
// CART ACTIONS AND USER FEEDBACK
function addToCart(id,variantIndex=0,qty=1){
  const p=productById(id);
  if(!p)return;
  if(p.stockStatus==='out-of-stock'){
    toast(`${p.en} is currently out of stock`);
    return;
  }

  const v=p.variants[variantIndex]||p.variants[0];
  let c=getCart();
  const key=id+'|'+v.label;
  const existing=c.find(x=>x.key===key);
  if(existing)existing.qty+=qty;
  else c.push({
    key,id,variant:v.label,grams:v.grams,price:v.price,qty
  }

  );
  saveCart(c);
  toast(`${p.en} added to your basket`)
}
function removeFromCart(key){
  saveCart(getCart().filter(x=>x.key!==key));
  renderOrderSummary()
}
function toast(msg){
  let el=$('#toast');
  if(!el){
    el=document.createElement('div');
    el.id='toast';
    el.className='toast';
    document.body.append(el)
  }

  el.textContent=msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2200)
}
// SHARED HEADER, SEARCH BAR AND NAVIGATION
function header(){
  return `<div class="announcement">
<div class="announcement-track">
<span>♡ TRADITIONAL TAMIL FLAVOURS</span>
<span>• PANTRY FAVOURITES FOR EVERYDAY</span>
<span>• ASK US ABOUT PRODUCT DETAILS</span>
<span>♡ TRADITIONAL TAMIL FLAVOURS</span>
<span>• PANTRY FAVOURITES FOR EVERYDAY</span>
<span>• ASK US ABOUT PRODUCT DETAILS</span>
</div>
</div>
<header class="header">
<div class="market-head-row">
<a class="brand" href="${BASE}index.html" aria-label="Princess Food Products home">
<img class="brand-logo" src="${BASE}assets/images/princess-food-products-logo.png" alt="Princess Food Products logo">
</a>
<form class="market-search" action="${BASE}pages/shop.html" role="search" aria-label="Search the Princess product catalogue">
<label class="sr-only" for="headerSearchInput">Search products</label>
<input id="headerSearchInput" name="q" type="search" placeholder="Search pickles, snacks, spice powders…" autocomplete="off">
<button type="submit" aria-label="Search products">
<svg viewBox="0 0 24 24" aria-hidden="true">
<circle cx="10.8" cy="10.8" r="6.7">
</circle>
<path d="m16 16 4.3 4.3">
</path>
</svg>
</button>
</form>
<div class="market-actions">
<a class="market-icon" href="${BASE}pages/contact.html" aria-label="Contact Princess Food Products" title="Contact">
<svg viewBox="0 0 24 24" aria-hidden="true">
<circle cx="12" cy="8" r="3.5">
</circle>
<path d="M5 20c.7-3.3 3.2-5 7-5s6.3 1.7 7 5">
</path>
</svg>
</a>
<a class="market-icon wishlist-link" href="${BASE}pages/shop.html?view=wishlist" aria-label="Wishlist" title="Wishlist">
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M20.5 8.7c0 4.3-8.5 10-8.5 10s-8.5-5.7-8.5-10a4.6 4.6 0 0 1 8.5-2.2 4.6 4.6 0 0 1 8.5 2.2Z">
</path>
</svg>
<span class="wishlist-count" data-wishlist-count>0</span>
</a>
<a class="market-icon cart-link" href="${BASE}pages/order.html" aria-label="Shopping basket">
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.5L21 8H6">
</path>
<circle cx="10" cy="20" r="1.2">
</circle>
<circle cx="18" cy="20" r="1.2">
</circle>
</svg>
<span class="cart-count" data-cart-count>0</span>
</a>
<a class="btn btn-shop-now" href="${BASE}pages/shop.html">Shop Now <span aria-hidden="true">→</span>
</a>
<a class="btn btn-order-now" href="${BASE}pages/shop.html">Order Now <span aria-hidden="true">→</span>
</a>
<a class="btn btn-whatsapp market-whatsapp" href="https://wa.me/${WA_NUMBER}?text=Vanakkam%20Princess%20Food%20Products%21%20I%20would%20like%20to%20know%20more%20about%20your%20products." target="_blank" rel="noopener">WhatsApp</a>
<button class="market-icon mobile-menu" id="mobileMenu" aria-label="Open navigation menu" aria-controls="navlinks" aria-expanded="false">☰</button>
</div>
</div>
<nav class="market-subnav" aria-label="Main navigation">
<div class="navlinks" id="navlinks">
<a href="${BASE}index.html">Home</a>
<a href="${BASE}pages/shop.html">Shop All</a>
<a href="${BASE}index.html#categories">Categories</a>
<a href="${BASE}index.html#combo-packs">Combo Packs</a>
<a href="${BASE}pages/about.html">Our Story</a>
<a href="${BASE}pages/contact.html">Contact</a>
<a class="mobile-nav-cta" href="${BASE}pages/shop.html">Explore products →</a>
<a class="mobile-nav-cta mobile-nav-whatsapp" href="https://wa.me/${WA_NUMBER}?text=Vanakkam%20Princess%20Food%20Products%21" target="_blank" rel="noopener">WhatsApp order ↗</a>
</div>
</nav>
<div class="mobile-search-wrap">
<form class="market-search mobile-search" action="${BASE}pages/shop.html" role="search" aria-label="Search products on mobile">
<label class="sr-only" for="mobileSearchInput">Search products</label>
<input id="mobileSearchInput" name="q" type="search" placeholder="Search your pantry favourites…">
<button type="submit" aria-label="Search products">
<svg viewBox="0 0 24 24" aria-hidden="true">
<circle cx="10.8" cy="10.8" r="6.7">
</circle>
<path d="m16 16 4.3 4.3">
</path>
</svg>
</button>
</form>
</div>
</header>`
}
// SHARED FOOTER AND SOCIAL MEDIA LINKS
function footer(){
  return `<footer class="footer">
<div class="container">
<div class="footer-grid">
<div>
<a class="brand" href="${BASE}index.html" aria-label="Princess Food Products home">
<img class="brand-logo" src="${BASE}assets/images/princess-food-products-logo.png" alt="Princess Food Products logo">
</a>
<p>Traditional flavours and everyday food inspiration from Namakkal, Tamil Nadu.</p>
<a class="btn btn-whatsapp" href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">Chat on WhatsApp ↗</a>
<div class="social-follow-block">
<div class="social-heading-wrap">
<span class="social-eyebrow">STAY CONNECTED</span>
<h3 class="social-heading">Follow Princess</h3>
<p class="social-subtitle">Fresh flavours, pantry favourites and updates.</p>
</div>
<div class="social-links" aria-label="Princess Food Products social media links">
<a class="social-link social-instagram" href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Follow Princess on Instagram" title="Instagram">
<span class="social-icon" aria-hidden="true">
<svg viewBox="0 0 24 24">
<rect x="3.5" y="3.5" width="17" height="17" rx="5">
</rect>
<circle cx="12" cy="12" r="4">
</circle>
<circle class="social-icon-dot" cx="17.5" cy="6.8" r="1">
</circle>
</svg>
</span>
<span class="social-label">
<strong>Instagram</strong>
<small>See our latest</small>
</span>
<span class="social-arrow" aria-hidden="true">↗</span>
</a>
<a class="social-link social-facebook" href="${SOCIAL_LINKS.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Follow Princess on Facebook" title="Facebook">
<span class="social-icon" aria-hidden="true">
<svg viewBox="0 0 24 24">
<path d="M14.2 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8v3.1h2.8v8z">
</path>
</svg>
</span>
<span class="social-label">
<strong>Facebook</strong>
<small>Join our community</small>
</span>
<span class="social-arrow" aria-hidden="true">↗</span>
</a>
<a class="social-link social-youtube" href="${SOCIAL_LINKS.youtube}" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to Princess on YouTube" title="YouTube">
<span class="social-icon" aria-hidden="true">
<svg viewBox="0 0 24 24">
<path d="M21.2 7.1a2.8 2.8 0 0 0-2-2C17.5 4.6 12 4.6 12 4.6s-5.5 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.2.5 7.2.5s5.5 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9Z">
</path>
<path class="youtube-play" d="m10 8.8 5.2 3.2-5.2 3.2z">
</path>
</svg>
</span>
<span class="social-label">
<strong>YouTube</strong>
<small>Watch and discover</small>
</span>
<span class="social-arrow" aria-hidden="true">↗</span>
</a>
</div>
</div>
</div>
<div>
<h3>Explore</h3>
<div class="footer-links">
<a href="${BASE}pages/shop.html">Shop all products</a>
<a href="${BASE}pages/about.html">Our story</a>
<a href="${BASE}pages/faq.html">FAQs</a>
<a href="${BASE}pages/contact.html">Contact us</a>
</div>
</div>
<div>
<h3>Get in touch</h3>
<p>Namakkal, Tamil Nadu, India<br>+91 95664 17764</p>
<p class="fssai-number">
<span class="fssai-mark" aria-hidden="true">FSSAI</span>
<span>
<strong>FSSAI Licence No.</strong>
<br>
<b>224264410000665</b>
</span>
</p>
<p>Delivery charges are shown at checkout when configured; otherwise the business confirms the fee before finalising the order.</p>
</div>
</div>
<div class="footer-bottom">
<span>© <span id="year">
</span> Princess Food Products</span>
<span>Traditional goodness, thoughtfully presented.</span>
</div>
</div>
</footer>`
}
function mountShell(){
  const h=$('#site-header'),f=$('#site-footer');
  if(h)h.innerHTML=header();
  if(f)f.innerHTML=footer();
  if(!$('#mobileStickyShopNow'))document.body.insertAdjacentHTML('beforeend',`<a id="mobileStickyShopNow" class="mobile-sticky-shop-now" href="${BASE}pages/shop.html" aria-label="Shop all Princess Food Products">Shop Now <span aria-hidden="true">→</span>
</a>`);
  updateCartCount();
  $('#year')&&($('#year').textContent=new Date().getFullYear());
  const nav=$('#navlinks'),menu=$('#mobileMenu');
  const current=location.pathname;
  $$('.navlinks a').forEach(link=>{
    const url=new URL(link.href,location.href);const currentUrl=new URL(location.href);const isHome=!url.hash&&(url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'))&&(current.endsWith('/index.html')||current.endsWith('/'));const isAnchor=Boolean(url.hash)&&url.pathname===currentUrl.pathname&&url.hash===currentUrl.hash;const isPage=url.pathname===currentUrl.pathname&&!url.hash;if(isHome||isPage||isAnchor)link.setAttribute('aria-current','page')
  }

  );
  menu?.addEventListener('click',()=>{
    const open=nav?.classList.toggle('open')||false;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')
  }

  );
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation menu')
  }

  ));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&nav?.classList.contains('open')){
      nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.focus()
    }

  }

  )
}
function productCard(p){
  const defaultIndex=Math.max(0,(p.variants||[]).findIndex(v=>Number(v.grams)===250));
  const selected=p.variants?.[defaultIndex]||{
    label:'Pack size to confirm',grams:0,price:p.price
  };
  const saved=getWishlist().includes(p.id);
  return `<article class="product-card" data-product-card="${p.id}">
  <div class="product-image-wrap">
<a href="${BASE}pages/product.html?id=${encodeURIComponent(p.id)}" class="product-image" aria-label="View ${p.en} details">
<img src="${assetUrl(p.image)}" alt="${p.en} product image" loading="lazy" onerror="this.onerror=null;this.src='${BASE}assets/images/hero-products.webp';">
<span class="sample-label">PRINCESS PANTRY</span>
<span class="stock-badge ${p.stockStatus==='out-of-stock'?'stock-out':'stock-in'}">${p.stockStatus==='out-of-stock'?'Out of stock':'In stock'}</span>
</a>
<button type="button" class="wishlist-card-btn ${saved?'is-saved':''}" data-wishlist="${p.id}" aria-label="${saved?'Remove from wishlist':'Add to wishlist'}" aria-pressed="${saved}">
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M20.5 8.7c0 4.3-8.5 10-8.5 10s-8.5-5.7-8.5-10a4.6 4.6 0 0 1 8.5-2.2 4.6 4.6 0 0 1 8.5 2.2Z">
</path>
</svg>
</button>
</div>
  <div class="product-info">
<span class="product-category">${p.category}</span>
<h3>
<a href="${BASE}pages/product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
</h3>
<p class="product-description">${p.desc}</p>
   <div class="card-variant-row">
<label for="variant-${p.id}">Pack size</label>
<select id="variant-${p.id}" class="card-variant-select" data-card-variant="${p.id}" aria-label="Choose pack size for ${p.en}">${(p.variants||[]).map((v,i)=>`<option value="${i}" ${
    i===defaultIndex?'selected':''
  }

  >${
    v.label
  }

  </option>`).join('')}</select>
</div>
   <div class="price-row">
<span class="price" data-card-price="${p.id}">${money(selected.price)} <span class="price-note">/ ${selected.label}</span>
</span>
<a class="text-link" href="${BASE}pages/product.html?id=${encodeURIComponent(p.id)}">View details <span aria-hidden="true">↗</span>
</a>
</div>
<p class="delivery-fee-note">Delivery charges extra · confirmed at checkout</p>
   <div class="product-actions" aria-label="Shopping actions for ${p.en}">
<button type="button" class="btn btn-primary card-add-button" data-card-add="${p.id}" ${p.stockStatus==='out-of-stock'?'disabled':''}>
<svg class="basket-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
<path d="M3.5 9h17l-1.4 10.2a1.5 1.5 0 0 1-1.5 1.3H6.4a1.5 1.5 0 0 1-1.5-1.3L3.5 9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
<path d="m8 9 4-5 4 5M8.5 12.5v4M12 12.5v4M15.5 12.5v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>
<span class="add-button-label">Add to Basket</span>
<span class="added-check" aria-hidden="true">✓</span>
</button>
<button type="button" class="btn card-whatsapp-button" data-card-whatsapp="${p.id}" ${p.stockStatus==='out-of-stock'?'disabled':''} aria-label="Order ${p.en} now via WhatsApp">
<span>Order Now</span>
<span aria-hidden="true">→</span>
</button>
</div>
  </div>
</article>`
}
function renderProducts(target,products){
  const el=$(target);
  if(el)el.innerHTML=products.map(productCard).join('')||'<div class="empty-state">No products match this filter. Try another category.</div>'
}
function openWhatsApp(message){
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`,'_blank','noopener')
}
function orderNow(id,variantIndex=0){
  const p=productById(id);
  if(!p)return;
  addToCart(p.id,variantIndex,1);
  location.href=BASE+'pages/order.html'
}
function orderProduct(id,variantIndex=0,qty=1){
  const p=productById(id);
  if(!p)return;
  const v=p.variants[variantIndex]||p.variants[0];
  openWhatsApp(`Vanakkam Princess Food Products!\nI would like to enquire/order this product:\nProduct: ${p.en} (${p.name})\nPack size: ${v.label}\nQuantity: ${qty}\nUnit price: ${money(v.price)}\nSubtotal: ${money(v.price*qty)}\nDelivery charges: Extra; final fee to be confirmed.
Please confirm availability and final order total. Thank you!`)
}
function cardVariant(id){
  const p=productById(id);
  const select=$(`[data-card-variant="${CSS.escape(id)}"]`);
  if(!p||!select)return {
    p,variantIndex:0,variant:p?.variants?.[0]
  };

  const variantIndex=Math.max(0,Math.min(p.variants.length-1,Number(select.value)||0));
  return {
    p,variantIndex,variant:p.variants[variantIndex]||p.variants[0]
  }

}
function setupProductCards(){
  document.addEventListener('change',e=>{
    const select=e.target.closest('[data-card-variant]');if(!select)return;
    const id=select.dataset.cardVariant;const {
      variant
    }

    =cardVariant(id);
    const price=$(`[data-card-price="${CSS.escape(id)}"]`);
    if(price&&variant)price.innerHTML=`${money(variant.price)} <span class="price-note">/ ${variant.label}</span>`;
  }

  );
  document.addEventListener('click',e=>{
    const wishlist=e.target.closest('[data-wishlist]');if(wishlist){
      toggleWishlist(wishlist.dataset.wishlist);return
    }
    const orderButton=e.target.closest('[data-card-whatsapp]');
    if(orderButton){
      const {
        p,variantIndex
      }

      =cardVariant(orderButton.dataset.cardWhatsapp);if(!p||p.stockStatus==='out-of-stock')return;orderNow(p.id,variantIndex);return
    }
    const add=e.target.closest('[data-card-add]');
    if(add){
      const {
        p,variantIndex
      }

      =cardVariant(add.dataset.cardAdd);if(!p)return;
      addToCart(p.id,variantIndex,1);add.classList.add('is-added');add.setAttribute('aria-live','polite');
      const label=add.querySelector('.add-button-label');if(label)label.textContent='Added to Basket';
      add.setAttribute('aria-label',`${p.en} added to basket`);
      window.setTimeout(()=>{
        add.classList.remove('is-added');if(label)label.textContent='Add to Basket';add.removeAttribute('aria-label')
      },

      1500);
    }
  }

  );
}
function cartTotals(){
  const c=getCart();
  return {
    cart:c,subtotal:c.reduce((s,x)=>s+x.price*x.qty,0),count:c.reduce((s,x)=>s+x.qty,0)
  }

}
function deliveryChargeFor(subtotal){
  if(FREE_DELIVERY_MINIMUM_INR!==null&&subtotal>=FREE_DELIVERY_MINIMUM_INR)return 0;
  return typeof DELIVERY_CHARGE_INR==='number'&&Number.isFinite(DELIVERY_CHARGE_INR)&&DELIVERY_CHARGE_INR>=0?DELIVERY_CHARGE_INR:null
}
function changeCartQty(key,delta){
  const cart=getCart();
  const item=cart.find(x=>x.key===key);
  if(!item)return;
  item.qty=Math.max(1,Math.min(99,Number(item.qty||1)+delta));
  saveCart(cart);
  renderOrderSummary()
}
function renderOrderSummary(){
  const box=$('#orderItems');
  if(!box)return;
  const {
    cart,subtotal
  }

  =cartTotals();
  const delivery=deliveryChargeFor(subtotal);
  if(!cart.length){
    box.innerHTML=`<div class="empty-state">
<p>Your basket is waiting for something delicious.</p>
<a class="btn btn-primary" href="${BASE}pages/shop.html">Explore products</a>
</div>`;
    $('#subtotal')&&($('#subtotal').textContent=money(0));
    $('#deliveryCharge')&&($('#deliveryCharge').textContent='To confirm');
    $('#grandTotal')&&($('#grandTotal').textContent='To confirm');
    return
  }

  box.innerHTML=cart.map(item=>{
    const p=productById(item.id);if(!p)return '';const safeKey=String(item.key).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');return `<div class="summary-product"><img src="${assetUrl(p.image)}" alt=""><div class="summary-product-info"><b>${p.name}</b><small>${item.variant}</small><div class="cart-line-controls"><button class="qty-step" type="button" data-cart-qty="${safeKey}" data-delta="-1" aria-label="Decrease ${p.en} quantity">−</button><span>Qty ${item.qty}</span><button class="qty-step" type="button" data-cart-qty="${safeKey}" data-delta="1" aria-label="Increase ${p.en} quantity">+</button><button class="text-link" type="button" data-cart-remove="${safeKey}">Remove</button></div></div><strong>${money(item.price*item.qty)}</strong></div>`}).join('');$('#subtotal')&&($('#subtotal').textContent=money(subtotal));$('#deliveryCharge')&&($('#deliveryCharge').textContent=delivery===null?'Extra · To confirm':delivery===0?'Free':money(delivery));$('#grandTotal')&&($('#grandTotal').textContent=delivery===null?`${money(subtotal)} + delivery charges`:money(subtotal+delivery));}
function setupCartSummaryControls(){document.addEventListener('click',e=>{const qty=e.target.closest('[data-cart-qty]');if(qty){changeCartQty(qty.dataset.cartQty,Number(qty.dataset.delta));return}const remove=e.target.closest('[data-cart-remove]');if(remove){removeFromCart(remove.dataset.cartRemove)}})}
function buildOrderMessage(form){const {cart,subtotal}=cartTotals();const fd=new FormData(form);const labels={fullName:'Name',phone:'Mobile',address:'House / Street',area:'Area / Village',district:'District',pincode:'PIN code',state:'State',notes:'Notes'};let lines=['PRINCESS FOOD PRODUCTS — ORDER ENQUIRY','', 'Customer details:'];for(const [key,label] of Object.entries(labels)){const value=(fd.get(key)||'').toString().trim();if(value)lines.push(`${label}: ${value}`)}lines.push('','Requested products:');cart.forEach(x=>{const p=productById(x.id);lines.push(`• ${p?.en||x.id} — ${x.variant} × ${x.qty} = ${money(x.price*x.qty)}`)});const delivery=deliveryChargeFor(subtotal);lines.push('',`Product subtotal: ${money(subtotal)}`,`Delivery charges (extra): ${delivery===null?'To be confirmed by the business':delivery===0?'Free':money(delivery)}`,`Estimated total: ${delivery===null?'To be confirmed after delivery is verified':money(subtotal+delivery)}`,'Customer will confirm this order by pressing Send in WhatsApp.');return lines.join('\n')}
function setupOrderForm(){const form=$('#deliveryForm');if(!form)return;renderOrderSummary();form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;if(!getCart().length){toast('Please add a product to your basket first.');return}const phone=form.elements.phone.value.replace(/\D/g,'');if(!/^[6-9]\d{9}$/.test(phone)){form.elements.phone.setCustomValidity('Enter a valid 10-digit Indian mobile number.');form.elements.phone.reportValidity();form.elements.phone.setCustomValidity('');return}const msg=buildOrderMessage(form);$('#orderPreview').textContent=msg;$('#previewPanel')?.classList.remove('hidden');$('#sendWhatsApp')?.setAttribute('href',`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`);$('#previewPanel')?.scrollIntoView({behavior:'smooth',block:'start'})})}
function normalizeSearch(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim()}
function setupHeaderSearchSuggestions(){
 const forms=$$('.market-search');
 forms.forEach(form=>{
  const input=form.querySelector('input[type="search"]'); if(!input)return;
  let panel=form.querySelector('.search-suggestions');
  if(!panel){panel=document.createElement('div');panel.className='search-suggestions';panel.id=`suggestions-${input.id||Math.random().toString(36).slice(2)}`;panel.setAttribute('role','listbox');panel.hidden=true;form.append(panel);input.setAttribute('aria-controls',panel.id);input.setAttribute('aria-expanded','false');}
  const close=()=>{panel.hidden=true;input.setAttribute('aria-expanded','false')};
  const render=()=>{
   const q=normalizeSearch(input.value);
   if(!q){close();return}
   const matches=(window.PRODUCTS||[]).filter(p=>normalizeSearch([p.en,p.name,p.category,...(p.searchTerms||[]),p.ingredients||''].join(' ')).includes(q)).slice(0,6);
   panel.innerHTML=(matches.map(p=>`<a class="search-suggestion" role="option" href="${BASE}pages/product.html?id=${encodeURIComponent(p.id)}"><img src="${assetUrl(p.image)}" alt="" loading="lazy"><span class="search-suggestion-copy"><strong>${p.name}</strong><small>${p.en} · ${p.category}</small></span><span class="search-suggestion-price">${money(Math.min(...p.variants.map(v=>v.price)))}</span></a>`).join('')||`<div class="search-suggestion-empty">No products found for “${input.value.replace(/[<>]/g,'')}”</div>`)+`<a class="search-suggestion-all" href="${BASE}pages/shop.html?q=${encodeURIComponent(input.value)}">View all search results <span aria-hidden="true">→</span></a>`;
   panel.hidden=false;input.setAttribute('aria-expanded','true');
  };
  input.addEventListener('input',render);input.addEventListener('focus',()=>{if(input.value.trim())render()});
  input.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowDown'&&!panel.hidden){e.preventDefault();panel.querySelector('a')?.focus()}});
  document.addEventListener('click',e=>{if(!form.contains(e.target))close()});
  form.addEventListener('submit',e=>{if(input.value.trim()){e.preventDefault();location.href=`${BASE}pages/shop.html?q=${encodeURIComponent(input.value.trim())}`}});
 });
}
const COMBO_PACKS=[
 {id:'pickle-trio',name:'Pickle & Thokku Trio',desc:'Three tangy favourites for everyday meals.',items:[['thakkali-thokku',250],['poondu-milagu-thokku',250],['pirandai-thokku',250]],tone:'combo-peach'},
 {id:'podi-pair',name:'Traditional Podi Pair',desc:'Curry leaf podi and drumstick leaf podi.',items:[['karuvepilai-podi',250],['murungai-podi',250]],tone:'combo-mint'},
 {id:'soup-taster',name:'Soup Mix Sampler',desc:'Three soup mixes in handy 100 g packs.',items:[['mudavattukal-soup',100],['nelikai-soup',100],['murungai-soup',100]],tone:'combo-yellow'},
 {id:'millet-treats',name:'Millet Treats Pair',desc:'Siruthaniya laddu and ragi laddu.',items:[['siruthaniya-laddu',300],['ragi-laddu',1000]],tone:'combo-blue'}
];
function renderComboPacks(){const el=$('#comboProducts');if(!el)return;el.innerHTML=COMBO_PACKS.map(combo=>{const lines=combo.items.map(([id,grams])=>{const p=productById(id);const v=p?.variants.find(x=>Number(x.grams)===grams);return {p,v}}).filter(x=>x.p&&x.v);const total=lines.reduce((sum,x)=>sum+x.v.price,0);const unavailable=lines.some(x=>x.p.stockStatus==='out-of-stock');return `<article class="combo-card ${combo.tone}"><div class="combo-card-top"><span class="combo-mark" aria-hidden="true">♡</span><span class="combo-tag">PANTRY PAIRING</span></div><h3>${combo.name}</h3><p>${combo.desc}</p><ul class="combo-items">${lines.map(x=>`<li><span>${x.p.name} · ${x.v.label}</span><strong>${money(x.v.price)}</strong></li>`).join('')}</ul><div class="combo-total"><span>Individual-price total</span><strong>${money(total)}</strong></div><button type="button" class="btn btn-primary combo-add" data-add-combo="${combo.id}" ${unavailable?'disabled':''}>${unavailable?'Currently unavailable':'Add combo to basket'} <span aria-hidden="true">→</span></button></article>`}).join('');el.querySelectorAll('[data-add-combo]').forEach(btn=>btn.addEventListener('click',()=>{const combo=COMBO_PACKS.find(x=>x.id===btn.dataset.addCombo);if(!combo)return;for(const [id,grams] of combo.items){const product=productById(id);if(!product||product.stockStatus==='out-of-stock'){toast('One or more combo products are unavailable');return}}combo.items.forEach(([id,grams])=>{const product=productById(id);const idx=product.variants.findIndex(v=>Number(v.grams)===grams);addToCart(id,Math.max(0,idx),1)});toast(`${combo.name} added to your basket`)}));}
function setupShop(){if(!$('#shopGrid'))return;const params=new URLSearchParams(location.search);let cat=params.get('category')||'All';const search=$('#productSearch'),sort=$('#sortProducts'),minPrice=$('#minPrice'),maxPrice=$('#maxPrice'),stockOnly=$('#stockOnly'),packFilter=$('#packFilter');if(search&&params.get('q'))search.value=params.get('q');const wishlistMode=params.get('view')==='wishlist';if(wishlistMode){const title=$('.page-title');if(title)title.textContent='Your wishlist';const para=$('.page-banner p');if(para)para.textContent='Your saved pantry favourites, all in one place.'}if(cat!=='All'){const initial=$(`[data-category="${CSS.escape(cat)}"]`);if(initial){$$('[data-category]').forEach(x=>x.classList.remove('active'));initial.classList.add('active')}}function update(){let list=[...window.PRODUCTS];if(wishlistMode){const saved=getWishlist();list=list.filter(p=>saved.includes(p.id))}if(cat!=='All')list=list.filter(p=>p.category===cat);const q=normalizeSearch(search?.value||'');if(q)list=list.filter(p=>normalizeSearch([p.en,p.name,p.category,...(p.searchTerms||[]),...(p.ingredients&&p.ingredients!=='Business to confirm'?[p.ingredients]:[])].join(' ')).includes(q));const min=minPrice&&minPrice.value!==''?Number(minPrice.value):null;const max=maxPrice&&maxPrice.value!==''?Number(maxPrice.value):null;if(min!==null)list=list.filter(p=>p.variants.some(v=>Number(v.price)>=min));if(max!==null)list=list.filter(p=>p.variants.some(v=>Number(v.price)<=max));if(stockOnly?.checked)list=list.filter(p=>p.stockStatus!=='out-of-stock');if(packFilter?.value)list=list.filter(p=>p.variants.some(v=>String(v.grams)===packFilter.value));if(sort?.value==='name')list.sort((a,b)=>a.en.localeCompare(b.en));if(sort?.value==='price-low')list.sort((a,b)=>Math.min(...a.variants.map(v=>v.price))-Math.min(...b.variants.map(v=>v.price)));if(sort?.value==='price-high')list.sort((a,b)=>Math.max(...b.variants.map(v=>v.price))-Math.max(...a.variants.map(v=>v.price)));renderProducts('#shopGrid',list);if(wishlistMode&&!list.length)$('#shopGrid').innerHTML='<div class="empty-state">Your wishlist is empty. Save a few pantry favourites to find them here.</div>';const count=$('#resultCount');if(count)count.textContent=`${list.length} product${list.length===1?'':'s'} found`};$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{$$('[data-category]').forEach(x=>x.classList.remove('active'));b.classList.add('active');cat=b.dataset.category;update()}));[search,minPrice,maxPrice,stockOnly,packFilter].forEach(el=>el?.addEventListener(el===stockOnly||el===packFilter?'change':'input',update));sort?.addEventListener('change',update);$('#clearFilters')?.addEventListener('click',()=>{if(search)search.value='';if(minPrice)minPrice.value='';if(maxPrice)maxPrice.value='';if(stockOnly)stockOnly.checked=false;if(packFilter)packFilter.value='';if(sort)sort.value='featured';cat='All';$$('[data-category]').forEach(x=>x.classList.toggle('active',x.dataset.category==='All'));update()});update()}
function setupProduct(){const el=$('#productDetail');if(!el)return;const id=new URLSearchParams(location.search).get('id');const p=productById(id)||window.PRODUCTS[0];document.title=`${p.en} | Princess Food Products`;const gallery=p.images&&p.images.length?p.images.slice(0,5):[p.image,p.image,p.image,p.image,p.image]; while(gallery.length<5)gallery.push(p.image);const defaultDetailIndex=Math.max(0,p.variants.findIndex(v=>Number(v.grams)===(p.id==='siruthaniya-laddu'?300:250)));const initialVariant=p.variants[defaultDetailIndex]||p.variants[0];el.innerHTML=`<div class="detail-layout container"><div><img id="detailMainImage" class="detail-main-image" src="${assetUrl(gallery[0])}" alt="${p.en}" onerror="this.onerror=null;this.src='${BASE}assets/images/hero-products.webp';"><div class="thumb-grid">${gallery.map((im,i)=>`<img src="${assetUrl(im)}" alt="${p.en} view ${i+1}" data-thumb="${assetUrl(im)}" loading="lazy" onerror="this.onerror=null;this.src='${BASE}assets/images/hero-products.webp';">`).join('')}</div>${renderProductBenefits(p)}</div><div class="detail-copy"><span class="eyebrow">${p.category}</span><h1>${p.name}</h1><p>${p.desc}</p><div class="detail-price" id="detailPrice">${money(initialVariant.price)}</div><span class="stock-badge detail-stock ${p.stockStatus==='out-of-stock'?'stock-out':'stock-in'}">${p.stockStatus==='out-of-stock'?'Out of stock':'In stock'}</span><label class="detail-label" for="detailVariant">Choose pack size</label><select class="select" id="detailVariant">${p.variants.map((v,i)=>`<option value="${i}" ${i===defaultDetailIndex?'selected':''}>${v.label} — ${money(v.price)}</option>`).join('')}</select><label class="detail-label">Quantity</label><div class="qty-control"><button id="qtyMinus" type="button">−</button><input id="detailQty" type="number" value="1" min="1" max="99"><button id="qtyPlus" type="button">+</button></div><div class="product-actions detail-actions"><button class="btn btn-primary" id="detailAdd" ${p.stockStatus==='out-of-stock'?'disabled':''}>Add to basket +</button><button class="btn btn-whatsapp" id="detailWhatsApp" ${p.stockStatus==='out-of-stock'?'disabled':''}>Order Now ↗</button></div><div class="facts-grid"><div class="fact"><b>Ingredients</b><span>${displayIngredients(p)}</span></div><div class="fact"><b>Allergens</b><span>${displayAllergens(p)}</span></div><div class="fact"><b>Storage</b><span>${displayStorage(p)}</span></div><div class="fact"><b>Shelf life</b><span>${displayShelfLife(p)}</span></div></div><div class="notice">Product price shown excludes delivery charges. Delivery charges are extra and will be confirmed by the business at checkout. Please confirm availability, ingredients, allergens and shelf life before ordering.</div></div></div>`;const variant=$('#detailVariant'),qty=$('#detailQty');function selected(){return p.variants[Number(variant.value)]||p.variants[0]}variant.addEventListener('change',()=>$('#detailPrice').textContent=money(selected().price));$('#qtyMinus').onclick=()=>qty.value=Math.max(1,Number(qty.value)-1);$('#qtyPlus').onclick=()=>qty.value=Math.min(99,Number(qty.value)+1);$('#detailAdd').onclick=()=>addToCart(p.id,Number(variant.value),Math.max(1,Number(qty.value)));$('#detailWhatsApp').onclick=()=>{if(p.stockStatus==='out-of-stock'){toast(`${p.en} is currently out of stock`);return;}addToCart(p.id,Number(variant.value),Math.max(1,Math.min(99,Number(qty.value)||1)));location.href=BASE+'pages/order.html'};$$('[data-thumb]').forEach(im=>im.onclick=()=>{const main=$('#detailMainImage');main.src=im.dataset.thumb;main.alt=`${p.en} — ${im.alt}`;$$('[data-thumb]').forEach(t=>t.classList.toggle('thumb-active',t===im));});const related=window.PRODUCTS.filter(x=>x.id!==p.id&&x.category===p.category).slice(0,4);renderProducts('#relatedProducts',related)}
document.addEventListener('DOMContentLoaded',()=>{mountShell();setupHeaderSearchSuggestions();renderComboPacks();setupProductCards();setupShop();setupProduct();setupOrderForm();setupCartSummaryControls();if($('#featuredProducts'))renderProducts('#featuredProducts',window.PRODUCTS.filter(p=>p.featured).slice(0,4));if($('#allHomeProducts'))renderProducts('#allHomeProducts',window.PRODUCTS.slice(0,8));if($('#relatedProducts')&&!$('#productDetail'))renderProducts('#relatedProducts',window.PRODUCTS.slice(0,4))});

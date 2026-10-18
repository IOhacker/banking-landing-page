import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Landmark,
  LockKeyhole,
  Menu,
  MoveUpRight,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import './index.css';
import { normalizeLanguage, type SupportedLanguage } from './i18n';

type ProductKey = 'credit' | 'savings' | 'investment';

interface ProductCopy {
  label: string;
  title: string;
  description: string;
  detail: string;
}

interface BenefitCopy {
  title: string;
  description: string;
}

interface TestimonialCopy {
  quote: string;
  context: string;
}

interface FaqCopy {
  question: string;
  answer: string;
}

const productKeys: ProductKey[] = ['credit', 'savings', 'investment'];
const productIcons: Record<ProductKey, typeof Landmark> = {
  credit: Landmark,
  savings: PiggyBank,
  investment: TrendingUp,
};
const benefitIcons = [CircleHelp, ShieldCheck, Clock3];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -35px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  const { t } = useTranslation();

  return (
    <a className={`brand ${light ? 'brand-light' : ''}`} href="#home" aria-label={t('a11y.brandHome')}>
      <span className="brand-mark" aria-hidden="true">
        <span />
      </span>
      <span>FLEXCORE</span>
    </a>
  );
}

function LanguageSwitcher({ variant = 'header' }: { variant?: 'header' | 'menu' }) {
  const { i18n, t } = useTranslation();
  const activeLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const languages: Array<{
    code: SupportedLanguage;
    shortLabel: string;
    fullLabel: string;
    ariaLabel: string;
  }> = [
    {
      code: 'es-MX',
      shortLabel: t('language.spanishShort'),
      fullLabel: t('language.spanish'),
      ariaLabel: t('language.changeToSpanish'),
    },
    {
      code: 'en',
      shortLabel: t('language.englishShort'),
      fullLabel: t('language.english'),
      ariaLabel: t('language.changeToEnglish'),
    },
  ];

  return (
    <div className={`language-switcher language-switcher-${variant}`} role="group" aria-label={t('language.label')}>
      {languages.map((language) => (
        <button
          key={language.code}
          type="button"
          className={activeLanguage === language.code ? 'active' : ''}
          aria-label={language.ariaLabel}
          aria-pressed={activeLanguage === language.code}
          onClick={() => void i18n.changeLanguage(language.code)}
        >
          {variant === 'menu' ? language.fullLabel : language.shortLabel}
        </button>
      ))}
    </div>
  );
}

function EnrollmentModal({ onClose, initialProduct }: { onClose: () => void; initialProduct: ProductKey }) {
  const { i18n, t } = useTranslation();
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<ProductKey>(initialProduct);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const products = t('products', { returnObjects: true }) as unknown as Record<ProductKey, ProductCopy>;
  const activeLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const firstName = name.trim().split(' ')[0];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button, input, a[href]'),
      ).filter((element) => !element.hasAttribute('disabled'));
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (accepted) setStep(3);
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="enrollment-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}>
        <div className="modal-topline">
          <Brand />
          <button className="icon-button modal-close" aria-label={t('a11y.closeEnrollment')} onClick={onClose}>
            <X size={21} />
          </button>
        </div>

        <div className="modal-content">
          {step < 3 && (
            <div className="step-label">
              {t('enrollment.testRegistration')}{' '}
              <span>
                {t('enrollment.step', {
                  current: String(step).padStart(2, '0'),
                  total: '02',
                })}
              </span>
            </div>
          )}

          {step === 1 && (
            <>
              <h2 id="modal-title">{t('enrollment.chooseTitle')}</h2>
              <p className="modal-intro">{t('enrollment.chooseIntro')}</p>
              <div className="choice-list" role="radiogroup" aria-label={t('a11y.productOfInterest')}>
                {productKeys.map((key) => {
                  const Icon = productIcons[key];

                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={product === key}
                      className={`choice ${product === key ? 'selected' : ''}`}
                      onClick={() => setProduct(key)}
                    >
                      <span className="choice-icon">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <span>
                        <strong>{products[key].label}</strong>
                        <small>{products[key].detail}</small>
                      </span>
                      <span className="choice-radio">{product === key && <Check size={13} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>
              <button className="button button-dark modal-action" onClick={() => setStep(2)}>
                {t('enrollment.continue')} <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className="back-link" type="button" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> {t('enrollment.back')}
              </button>
              <h2 id="modal-title">{t('enrollment.detailsTitle')}</h2>
              <p className="modal-intro">{t('enrollment.detailsIntro')}</p>
              <form onSubmit={submit} className="enrollment-form">
                <label>
                  {t('enrollment.nameLabel')}
                  <input
                    required
                    autoComplete="name"
                    placeholder={t('enrollment.namePlaceholder')}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label>
                  {t('enrollment.emailLabel')}
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder={t('enrollment.emailPlaceholder')}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label>
                  {t('enrollment.phoneLabel')}
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    minLength={10}
                    placeholder={t('enrollment.phonePlaceholder')}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                <label className="consent">
                  <input required type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                  <span>{t('enrollment.consent')}</span>
                </label>
                <button className="button button-dark modal-action" type="submit">
                  {t('enrollment.finish')} <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="success-state">
              <div className="success-icon">
                <Check size={32} strokeWidth={2} />
              </div>
              <div className="step-label">{t('enrollment.completed')}</div>
              <h2 id="modal-title">{t('enrollment.successTitle')}</h2>
              <p>
                {t('enrollment.successMessage', {
                  name: firstName ? `, ${firstName}` : '',
                  product: products[product].label.toLocaleLowerCase(activeLanguage),
                })}
              </p>
              <div className="success-note">
                <LockKeyhole size={18} />
                <span>{t('enrollment.successNote')}</span>
              </div>
              <button className="button button-dark modal-action" onClick={onClose}>
                {t('enrollment.backToSite')} <ArrowRight size={18} />
              </button>
            </div>
          )}

          <p className="modal-disclaimer">{t('enrollment.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { i18n, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('credit');
  const [enrollmentProduct, setEnrollmentProduct] = useState<ProductKey>('credit');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const products = t('products', { returnObjects: true }) as unknown as Record<ProductKey, ProductCopy>;
  const benefits = t('benefits.items', { returnObjects: true }) as unknown as BenefitCopy[];
  const testimonials = t('testimonials.items', { returnObjects: true }) as unknown as TestimonialCopy[];
  const faqs = t('faq.items', { returnObjects: true }) as unknown as FaqCopy[];
  const activeProduct = products[selectedProduct];
  const ActiveIcon = productIcons[selectedProduct];

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    document.title = t('meta.title');

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = t('meta.description');
  }, [activeLanguage, t]);

  const openEnrollment = (product: ProductKey = selectedProduct) => {
    setEnrollmentProduct(product);
    setMenuOpen(false);
    setModalOpen(true);
  };

  return (
    <div className="site-shell" id="home">
      <div className="testing-bar">
        <span className="testing-dot" /> {t('testingBar.primary')}{' '}
        <span className="testing-extra">{t('testingBar.secondary')}</span>
      </div>

      <header className="site-header">
        <div className="header-inner page-container">
          <Brand />
          <nav className={`desktop-nav ${menuOpen ? 'nav-open' : ''}`} aria-label={t('a11y.primaryNavigation')}>
            <a href="#solutions" onClick={() => setMenuOpen(false)}>
              {t('nav.solutions')}
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              {t('nav.whyFlexcore')}
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              {t('nav.faq')}
            </a>
            <div className="mobile-language-row">
              <span>{t('language.label')}</span>
              <LanguageSwitcher variant="menu" />
            </div>
            <button className="mobile-nav-cta" onClick={() => openEnrollment()}>
              {t('nav.startNow')} <ArrowUpRight size={17} />
            </button>
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <button className="button button-dark header-cta" onClick={() => openEnrollment()}>
              {t('nav.startNow')} <ArrowUpRight size={16} />
            </button>
            <button
              className="icon-button menu-toggle"
              aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="page-container hero-content">
            <div className="hero-copy">
              <p className="hero-eyebrow hero-enter">{t('hero.eyebrow')}</p>
              <h1 id="hero-heading" className="hero-enter hero-title">
                <span>FLEXCORE</span>
                <br />
                {t('hero.titleLineOne')}
                <br />
                {t('hero.titleLineTwo')}
              </h1>
              <p className="hero-subtitle hero-enter">{t('hero.subtitle')}</p>
              <div className="hero-actions hero-enter">
                <button className="button button-white" onClick={() => openEnrollment()}>
                  {t('hero.primaryCta')} <ArrowUpRight size={18} />
                </button>
                <a href="#solutions" className="hero-text-link">
                  {t('hero.secondaryCta')} <ArrowDown size={17} />
                </a>
              </div>
            </div>
          </div>
          <div className="hero-bottom-line" aria-hidden="true" />
        </section>

        <section className="trust-section" id="about" aria-label={t('a11y.aboutFlexcore')}>
          <div className="page-container trust-inner">
            <Reveal>
              <p className="section-kicker">{t('trust.kicker')}</p>
            </Reveal>
            <Reveal delay={100}>
              <p className="trust-statement">
                {t('trust.statementLead')} <span>{t('trust.statementRest')}</span>
              </p>
            </Reveal>
            <Reveal delay={180}>
              <ShieldCheck className="trust-icon" size={33} strokeWidth={1.4} aria-hidden="true" />
            </Reveal>
          </div>
        </section>

        <section className="solutions-section section-space" id="solutions" aria-labelledby="solutions-title">
          <div className="page-container">
            <Reveal>
              <div className="section-heading-row">
                <div>
                  <p className="section-kicker">{t('solutions.kicker')}</p>
                  <h2 id="solutions-title">
                    {t('solutions.title')}
                    <br />
                    <em>{t('solutions.titleAccent')}</em>
                  </h2>
                </div>
                <p className="section-sidecopy">{t('solutions.sideCopy')}</p>
              </div>
            </Reveal>

            <div className="solution-grid">
              {productKeys.map((key, index) => {
                const Icon = productIcons[key];

                return (
                  <Reveal key={key} delay={index * 110} className="solution-reveal">
                    <button
                      className="solution-item"
                      onClick={() => {
                        setSelectedProduct(key);
                        document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      aria-label={t('a11y.discoverProduct', { product: products[key].label })}
                    >
                      <div className="solution-top">
                        <span className="solution-number">0{index + 1} /</span>
                        <ArrowUpRight size={25} strokeWidth={1.5} />
                      </div>
                      <div className="solution-icon">
                        <Icon size={34} strokeWidth={1.35} />
                      </div>
                      <h3>{products[key].label}</h3>
                      <p>{products[key].description}</p>
                      <span className="solution-link">
                        {t('solutions.discoverMore')} <ArrowRight size={16} />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="showcase-section" id="showcase" aria-labelledby="showcase-title">
          <div className="showcase-glow" aria-hidden="true" />
          <div className="page-container showcase-inner">
            <div className="showcase-copy">
              <Reveal>
                <p className="section-kicker kicker-light">{t('showcase.kicker')}</p>
                <h2 id="showcase-title">
                  {t('showcase.title')}
                  <br />
                  <em>{t('showcase.titleAccent')}</em>
                </h2>
                <p className="showcase-intro">{t('showcase.intro')}</p>
              </Reveal>

              <div className="product-tabs" role="tablist" aria-label={t('a11y.exploreSolutions')}>
                {productKeys.map((key) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={selectedProduct === key}
                    className={selectedProduct === key ? 'active' : ''}
                    onClick={() => setSelectedProduct(key)}
                  >
                    {products[key].label}
                  </button>
                ))}
              </div>

              <button className="showcase-link" onClick={() => openEnrollment(selectedProduct)}>
                {t('showcase.exploreProduct', {
                  product: activeProduct.label.toLocaleLowerCase(activeLanguage),
                })}{' '}
                <ArrowUpRight size={19} />
              </button>
            </div>

            <Reveal delay={120} className="showcase-visual-wrap">
              <div className="showcase-visual" role="tabpanel" aria-label={t('a11y.productPreview', { product: activeProduct.label })}>
                <div className="visual-header">
                  <span className="visual-logo">
                    <span className="brand-mark" aria-hidden="true">
                      <span />
                    </span>
                    FLEXCORE
                  </span>
                  <span>{t('showcase.preview')}</span>
                </div>
                <div className="visual-main" key={selectedProduct}>
                  <div className="visual-icon">
                    <ActiveIcon size={31} strokeWidth={1.6} />
                  </div>
                  <p className="visual-overline">{t('showcase.nextStep')}</p>
                  <h3>{activeProduct.title}</h3>
                  <p>{activeProduct.description}</p>
                  <div className="visual-line" />
                  <div className="visual-footer">
                    <span>
                      <span className="tiny-sparkle">
                        <Sparkles size={16} />
                      </span>{' '}
                      {t('showcase.cardFooter')}
                    </span>
                    <span className="visual-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </div>
              </div>
              <p className="visual-caption">{t('showcase.caption')}</p>
            </Reveal>
          </div>
        </section>

        <section className="benefits-section section-space" aria-labelledby="benefits-title">
          <div className="page-container benefits-grid">
            <Reveal>
              <p className="section-kicker">{t('benefits.kicker')}</p>
              <h2 id="benefits-title">
                {t('benefits.titleLineOne')}
                <br />
                {t('benefits.titleLineTwo')}
                <br />
                <em>{t('benefits.titleAccent')}</em>
              </h2>
              <p className="benefits-lead">{t('benefits.lead')}</p>
            </Reveal>

            <div className="benefits-list">
              {benefits.map((benefit, index) => {
                const Icon = benefitIcons[index];

                return (
                  <Reveal key={benefit.title} delay={80 + index * 80}>
                    <div className="benefit-row">
                      <span className="benefit-icon">
                        <Icon size={25} strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.description}</p>
                      </div>
                      <span className="benefit-index">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="testimonial-section" aria-labelledby="testimonial-title">
          <div className="page-container testimonial-inner">
            <Reveal>
              <p className="section-kicker">{t('testimonials.kicker')}</p>
              <h2 id="testimonial-title" className="sr-only">
                {t('testimonials.heading')}
              </h2>
            </Reveal>
            <div className="testimonial-body">
              <span className="quote-glyph" aria-hidden="true">
                “
              </span>
              <div className="quote-content" key={quoteIndex}>
                <blockquote>{testimonials[quoteIndex].quote}</blockquote>
                <p>{testimonials[quoteIndex].context}</p>
              </div>
            </div>
            <div className="testimonial-bottom">
              <p>{t('testimonials.disclaimer')}</p>
              <div className="quote-controls">
                <button
                  aria-label={t('a11y.previousMessage')}
                  onClick={() => setQuoteIndex((quoteIndex + testimonials.length - 1) % testimonials.length)}
                >
                  <ChevronLeft size={21} />
                </button>
                <span>
                  0{quoteIndex + 1} / 0{testimonials.length}
                </span>
                <button aria-label={t('a11y.nextMessage')} onClick={() => setQuoteIndex((quoteIndex + 1) % testimonials.length)}>
                  <ChevronRight size={21} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section section-space" id="conditions" aria-labelledby="pricing-title">
          <div className="page-container pricing-grid">
            <Reveal>
              <p className="section-kicker">{t('conditions.kicker')}</p>
              <h2 id="pricing-title">
                {t('conditions.titleLineOne')}
                <br />
                {t('conditions.titleLineTwo')}
              </h2>
              <p className="pricing-lead">{t('conditions.lead')}</p>
              <a className="text-link" href="https://www.fintecheando.com.mx/" target="_blank" rel="noopener noreferrer">
                {t('conditions.officialSite')} <ArrowUpRight size={18} />
              </a>
            </Reveal>

            <Reveal delay={100}>
              <div className="pricing-list">
                <div className="pricing-list-head">
                  <span>{t('conditions.productHeader')}</span>
                  <span>{t('conditions.informationHeader')}</span>
                </div>
                {productKeys.map((key) => (
                  <div className="pricing-row" key={key}>
                    <strong>{products[key].label}</strong>
                    <span>
                      {t('conditions.terms')} <MoveUpRight size={17} />
                    </span>
                  </div>
                ))}
                <p className="pricing-note">{t('conditions.note')}</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="faq-section section-space" id="faq" aria-labelledby="faq-title">
          <div className="page-container faq-grid">
            <Reveal>
              <p className="section-kicker">{t('faq.kicker')}</p>
              <h2 id="faq-title">
                {t('faq.title')}
                <br />
                <em>{t('faq.titleAccent')}</em>
              </h2>
              <p className="faq-sidecopy">{t('faq.sideCopy')}</p>
            </Reveal>

            <div className="faq-list">
              {faqs.map((item, index) => (
                <Reveal key={`faq-${index}`} delay={index * 65}>
                  <div className={`faq-item ${openFaq === index ? 'faq-open' : ''}`}>
                    <h3>
                      <button
                        aria-expanded={openFaq === index}
                        aria-controls={`faq-answer-${index}`}
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      >
                        {item.question}
                        <ChevronDown size={22} />
                      </button>
                    </h3>
                    <div id={`faq-answer-${index}`} className="faq-answer" hidden={openFaq !== index}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <div className="cta-orb" aria-hidden="true" />
          <div className="page-container final-cta-inner">
            <Reveal>
              <p className="section-kicker kicker-light">{t('cta.kicker')}</p>
              <h2 id="cta-title">
                {t('cta.title')}
                <br />
                <em>{t('cta.titleAccent')}</em>
              </h2>
              <p>{t('cta.copy')}</p>
              <button className="button button-white" onClick={() => openEnrollment()}>
                {t('cta.button')} <ArrowUpRight size={18} />
              </button>
              <span className="cta-footnote">{t('cta.footnote')}</span>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-top">
            <div>
              <Brand light />
              <p>{t('footer.tagline')}</p>
            </div>
            <div className="footer-links">
              <div>
                <span>{t('footer.exploreHeading')}</span>
                <a href="#solutions">{t('footer.solutions')}</a>
                <a href="#about">{t('footer.about')}</a>
                <a href="#faq">{t('footer.faq')}</a>
              </div>
              <div>
                <span>{t('footer.linksHeading')}</span>
                <a href="https://www.fintecheando.com.mx/" target="_blank" rel="noopener noreferrer">
                  {t('footer.officialSite')} <ArrowUpRight size={14} />
                </a>
                <a href="https://www.fintecheando.com.mx/" target="_blank" rel="noopener noreferrer">
                  {t('footer.legalInformation')} <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.demoConcept', { year: new Date().getFullYear() })}</p>
            <p>{t('footer.testingNotice')}</p>
          </div>
        </div>
      </footer>

      {modalOpen && <EnrollmentModal initialProduct={enrollmentProduct} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

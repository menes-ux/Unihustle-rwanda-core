'use client';
 
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
 
// ─── Static data ─────────────────────────────────────────────────────────────
 
const marqueeItems = [
  'Web Development', 'Graphic Design', 'Translation', 'Data Entry',
  'Tutoring', 'Video Editing', 'Social Media', 'Photography',
  'Copywriting', 'App Development',
];
 
const hustleFilters = ['All', 'Design', 'Development', 'Writing', 'Education', 'Marketing', 'Data'];
 
const mockCats = ['All', 'Design', 'Dev', 'Writing', 'Tutoring'];
 
const trustItems = [
  {
    title: 'University Verified',
    desc: 'Only real ALU students with @alustudent.com emails can register. Zero fake profiles, zero guessing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Merit Over Networks',
    desc: '5-star ratings replace nepotism. Your work speaks louder than your connections ever could.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Local First',
    desc: 'Rates calibrated for Rwanda. No competing against global freelancers on your first hustle.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
  },
  {
    title: 'Safe by Design',
    desc: 'Contact info shared only after booking is confirmed. No payment data stored on the platform.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];
 
const howSteps = [
  { num: '1', title: 'Create Your Account', desc: 'Sign up with your @alustudent.com email or as a registered business. Your identity is verified immediately.' },
  { num: '2', title: 'Choose Your Role', desc: 'Select Student or Business. Each gets a dedicated dashboard with the right tools for their side of the marketplace.' },
  { num: '3', title: 'Hustle', desc: 'Complete work, collect ratings, and build a real portfolio — all tracked in one clean dashboard.' },
];
 
const studentSteps = [
  { num: 'A', label: 'Post a Gig', desc: 'List a service you offer — design, coding, tutoring, writing. Set your own price. Businesses and peers browse and book you directly.' },
  { num: 'B', label: 'Buy a Gig', desc: 'Need something from a fellow student? Browse peer-listed services, filter by category, and purchase at listed rates.' },
  { num: 'C', label: 'Apply to Business Jobs', desc: 'Businesses post short-term needs on the job board. Browse, apply, and track your application status from your dashboard.' },
  { num: 'D', label: 'Dashboard', desc: 'Track all active gigs, orders, application statuses, earnings, and ratings in one place.' },
];
 
const bizSteps = [
  { num: 'A', label: 'Post a Job', desc: 'Describe what you need, set a budget, and publish it to the student job board. Applications arrive directly to your dashboard.' },
  { num: 'B', label: 'Browse Student Gigs', desc: 'Filter by skill category — Design, Dev, Writing, Marketing, and more. View portfolios, ratings, and completed hustle counts before you book.' },
  { num: 'C', label: 'Review Applications', desc: 'For posted jobs, review incoming student applications side by side. Accept or decline with one click. Contact details are shared after acceptance.' },
  { num: 'D', label: 'Dashboard', desc: 'Manage all active jobs, applications, bookings, and reviews from a single business dashboard.' },
];
 
const jobs = [
  {
    cat: 'Design', title: 'Logo Design', rating: '4.9 (24)', price: 'From 20k RWF',
    desc: 'Professional brand identity and logo creation for local Rwandan businesses and entrepreneurs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    cat: 'Development', title: 'Website Development', rating: '5.0 (18)', price: 'From 60k RWF',
    desc: 'Custom responsive websites built with modern tools — tailored for local startups and SMEs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    cat: 'Writing', title: 'Translation Services', rating: '4.8 (32)', price: 'From 8k RWF',
    desc: 'Kinyarwanda, French, English — accurate document translation by bilingual students.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    cat: 'Education', title: 'Tutoring', rating: '4.9 (41)', price: 'From 10k RWF',
    desc: 'One-on-one and group tutoring in STEM, languages, and business subjects at your schedule.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    cat: 'Marketing', title: 'Social Media Management', rating: '4.7 (15)', price: 'From 30k RWF',
    desc: 'Content creation, scheduling, and community management for growing Rwandan brands.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    cat: 'Data', title: 'Data Entry & Analysis', rating: '4.8 (28)', price: 'From 12k RWF',
    desc: 'Accurate data entry, spreadsheet management, and basic analytics reports for businesses.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
];
 
const communityProfiles = [
  { initials: 'DA', name: 'David Achibiri', role: 'Full-Stack Developer · Year 2', skills: ['React', 'Node.js', 'PostgreSQL'], rating: '4.9', completed: '15', gradient: 'linear-gradient(135deg,#F97316,#EA580C)' },
  { initials: 'MA', name: 'Manuelle Ackun', role: 'UI/UX Designer · Year 2', skills: ['Figma', 'Branding', 'Illustration'], rating: '5.0', completed: '22', gradient: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' },
  { initials: 'JN', name: 'Jean Nepo Munezero', role: 'Backend Engineer · Year 2', skills: ['Python', 'APIs', 'Supabase'], rating: '4.8', completed: '11', gradient: 'linear-gradient(135deg,#10B981,#059669)' },
];
 
const stats = [
  { target: '200', label: 'Active Students',   decimal: false },
  { target: '85',  label: 'Local Businesses',  decimal: false },
  { target: '450', label: 'Hustles Completed', decimal: false },
  { target: '4.9', label: 'Average Rating',    decimal: true  },
];
 
const teamMembers = [
  { initials: 'MN', name: 'Menes Nagnon Adisso', role: 'Project Manager',     gradient: 'linear-gradient(135deg,#F97316,#EA580C)', desc: 'Oversaw project direction, background research, project scope definition, and team coordination via the Gantt chart.' },
  { initials: 'JN', name: 'Jean Nepo Munezero',  role: 'Backend Lead',         gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', desc: 'Responsible for system architecture, class diagrams, and the research design and development model in Chapter 3.' },
  { initials: 'MA', name: 'Manuelle Ackun',       role: 'Database Architect',   gradient: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', desc: 'Designed the database model, conducted risk assessment, and produced the UML diagram for the system.' },
  { initials: 'DA', name: 'David Achibiri',       role: 'Full-Stack Developer', gradient: 'linear-gradient(135deg,#10B981,#059669)', desc: 'Led the project objectives, research questions, development tools selection, and team roles documentation.' },
  { initials: 'BM', name: 'Bonheur Munezero',     role: 'UI/UX Designer',       gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', desc: 'Worked on significance and justification, ethical considerations, and designed the core UML diagrams.' },
  { initials: 'GN', name: 'Gilbert Ntivunwa',     role: 'Research Lead',        gradient: 'linear-gradient(135deg,#EF4444,#B91C1C)', desc: 'Conducted the literature review, analysed existing platforms, and documented their strengths, weaknesses, and gaps.' },
];
 
// ─── Animated counter ────────────────────────────────────────────────────────
 
function AnimatedCounter({ target, decimal }: { target: string; decimal: boolean }) {
  const [display, setDisplay] = useState('0');
  const spanRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
 
  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
 
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const numTarget = parseFloat(target);
          const duration = 1600;
          const start = performance.now();
 
          const update = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = numTarget * ease;
            setDisplay(decimal ? val.toFixed(1) : Math.floor(val) + (p >= 1 ? '+' : ''));
            if (p < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, decimal]);
 
  return <span ref={spanRef}>{display}</span>;
}
 
// ─── Page ────────────────────────────────────────────────────────────────────
 
export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeMockCat, setActiveMockCat] = useState('All');
 
  // Sticky nav
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
 
  // Scroll reveal
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
 
  return (
    <>
      {/* PILOT BANNER */}
      <div className="pilot-banner">
        Current pilot is <span>exclusively for ALU Rwanda students</span> — using your @alustudent.com email to join.
      </div>
 
      {/* NAV */}
      <nav ref={navRef} id="nav">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          UniHustle
        </Link>
        <ul className="nav-links">
          <li><a href="#how">How it Works</a></li>
          <li><a href="#hustles">Find Hustles</a></li>
          <li><a href="#hustles">Post a Job</a></li>
          <li><a href="#community">Community</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#" className="btn-login">Log In</a>
          <a href="#" className="btn-signup">Sign Up</a>
        </div>
      </nav>
 
      {/* HERO */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span> Rwanda · ALU Pilot
          </div>
          <h1 className="hero-h1">
            Turn Your Skills Into<br /><em>Real Opportunities</em>
          </h1>
          <p className="hero-sub">
            UniHustle connects verified university students with local businesses and peers for short-term freelance work — right here in Rwanda.
          </p>
          <p className="hero-support">
            Build experience. Earn income. Grow your portfolio before graduation.
          </p>
          <div className="hero-btns">
            <a href="#" className="btn-primary">Get Started as a Student</a>
            <a href="#" className="btn-secondary">Hire a Student</a>
          </div>
          <div className="trust-badges">
            {[
              'Verified ALU student accounts only',
              'Real local opportunities in Rwanda',
              'Merit-based hiring — no connections needed',
            ].map((text) => (
              <div className="trust-badge" key={text}>
                <span className="trust-badge-check">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
 
        <div className="hero-visual">
          {/* Floating badge 1 */}
          <div className="float-badge fb-1">
            <div className="fb-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div>ALU Email Verified</div>
              <div className="fb-sub">Instant trust</div>
            </div>
          </div>
 
          {/* Mock screen */}
          <div className="mock-screen">
            <div className="mock-topbar">
              <div className="mock-dot r"></div>
              <div className="mock-dot y"></div>
              <div className="mock-dot g"></div>
              <div className="mock-search-bar">
                <div className="mock-search-icon"></div>
                Search hustles...
              </div>
            </div>
            <div className="mock-label">Categories</div>
            <div className="mock-cats">
              {mockCats.map((cat) => (
                <span
                  key={cat}
                  className={`mock-cat${activeMockCat === cat ? ' active' : ''}`}
                  onClick={() => setActiveMockCat(cat)}
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="mock-label">Open Hustles</div>
            <div className="mock-jobs">
              <div className="mock-job">
                <div className="mock-job-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                </div>
                <div className="mock-job-info">
                  <div className="mock-job-title">Logo Design</div>
                  <div className="mock-job-meta">4.9 · Kigali Creative</div>
                </div>
                <div className="mock-job-price">25k RWF</div>
              </div>
              <div className="mock-job">
                <div className="mock-job-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <div className="mock-job-info">
                  <div className="mock-job-title">Website Development</div>
                  <div className="mock-job-meta">5.0 · StartupHub RW</div>
                </div>
                <div className="mock-job-price">80k RWF</div>
              </div>
              <div className="mock-job">
                <div className="mock-job-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                </div>
                <div className="mock-job-info">
                  <div className="mock-job-title">Tutoring — Math</div>
                  <div className="mock-job-meta">4.8 · Private Client</div>
                </div>
                <div className="mock-job-price">15k RWF</div>
              </div>
            </div>
          </div>
 
          {/* Floating badge 2 */}
          <div className="float-badge fb-2">
            <div className="fb-icon-wrap">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <div>
              <div>12 new hustles today</div>
              <div className="fb-sub">Posted this morning</div>
            </div>
          </div>
        </div>
      </section>
 
      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {/* Doubled for seamless loop — matches the original HTML */}
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span className="marquee-item" key={i}>
              <span className="marquee-dot"></span>{item}
            </span>
          ))}
        </div>
      </div>
 
      {/* TRUST */}
      <section className="trust-section section">
        <div className="section-inner">
          <p className="section-tag reveal">Why UniHustle</p>
          <h2 className="section-h2 reveal">Built for Rwanda. Built on trust.</h2>
          <p className="section-sub reveal">
            Verified using university emails to build immediate, structured trust between students and employers.
          </p>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <div className="trust-item reveal" key={item.title}>
                <div className="trust-item-icon">{item.icon}</div>
                <div className="trust-title">{item.title}</div>
                <p className="trust-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* HOW IT WORKS */}
      <section className="how-section section" id="how">
        <div className="section-inner">
          <div className="how-intro">
            <div>
              <p className="section-tag reveal">Simple by design</p>
              <h2 className="section-h2 reveal">How UniHustle Works</h2>
              <p className="section-sub reveal">
                Sign up, choose your role, and start in minutes. Whether you are a student looking for income or a business looking for talent — the flow is built for you.
              </p>
            </div>
            <div className="how-flow reveal">
              {howSteps.map((step) => (
                <div className="how-step" key={step.num}>
                  <div className="how-step-num">{step.num}</div>
                  <div className="how-step-title">{step.title}</div>
                  <p className="how-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
 
          <div className="role-flows">
            {/* Student flow */}
            <div className="role-flow-card student-flow reveal">
              <div className="rfc-header">
                <div className="rfc-badge">Student</div>
              </div>
              <div className="rfc-title">Two ways to hustle</div>
              <div style={{ height: 20 }}></div>
              <div className="rfc-steps">
                {studentSteps.map((s) => (
                  <div className="rfc-step" key={s.num}>
                    <div className="rfc-step-num">{s.num}</div>
                    <div className="rfc-step-body">
                      <div className="rfc-step-label">{s.label}</div>
                      <div className="rfc-step-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Business flow */}
            <div className="role-flow-card biz-flow reveal">
              <div className="rfc-header">
                <div className="rfc-badge">Business</div>
              </div>
              <div className="rfc-title">Hire smart, hire local</div>
              <div style={{ height: 20 }}></div>
              <div className="rfc-steps">
                {bizSteps.map((s) => (
                  <div className="rfc-step" key={s.num}>
                    <div className="rfc-step-num">{s.num}</div>
                    <div className="rfc-step-body">
                      <div className="rfc-step-label">{s.label}</div>
                      <div className="rfc-step-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* HUSTLES */}
      <section className="hustles-section section" id="hustles">
        <div className="section-inner">
          <p className="section-tag reveal">Explore</p>
          <h2 className="section-h2 reveal">Popular Hustles on UniHustle</h2>
          <div className="hustle-search reveal">
            <span className="hustle-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input type="text" placeholder="Search hustles, skills, or categories..." />
          </div>
          <div className="hustles-filters reveal">
            {hustleFilters.map((f) => (
              <button
                key={f}
                className={`filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div className="job-card reveal" key={job.title}>
                <div className="job-card-top">
                  <div className="job-icon-wrap">{job.icon}</div>
                  <div>
                    <div className="job-cat">{job.cat}</div>
                    <div className="job-title">{job.title}</div>
                  </div>
                </div>
                <p className="job-desc">{job.desc}</p>
                <div className="job-footer">
                  <div className="job-stars">
                    <span className="job-stars-filled">&#9733;</span> {job.rating}
                  </div>
                  <div className="job-price">{job.price}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="jobs-cta reveal">
            <a href="#" className="btn-primary">Explore All Hustles</a>
          </div>
        </div>
      </section>
 
      {/* COMMUNITY */}
      <section className="community-section section" id="community">
        <div className="section-inner">
          <p className="section-tag reveal">Community</p>
          <h2 className="section-h2 reveal">A Merit-Based Community</h2>
          <p className="section-sub reveal">
            Real students. Real ratings. Your work builds your reputation — not your network.
          </p>
          <div className="profiles-grid">
            {communityProfiles.map((p) => (
              <div className="profile-card reveal" key={p.name}>
                <div className="profile-avatar-ring" style={{ background: p.gradient }}>
                  <div className="profile-avatar" style={{ background: p.gradient }}>
                    {p.initials}
                  </div>
                </div>
                <div className="profile-name">{p.name}</div>
                <div className="profile-role">{p.role}</div>
                <div className="profile-skills">
                  {p.skills.map((s) => (
                    <span className="profile-skill" key={s}>{s}</span>
                  ))}
                </div>
                <div className="profile-stats">
                  <div>
                    <div className="profile-stat-val">{p.rating}</div>
                    <div className="profile-stat-label">Rating</div>
                  </div>
                  <div>
                    <div className="profile-stat-val">{p.completed}</div>
                    <div className="profile-stat-label">Completed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* STATS */}
      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num">
                  <AnimatedCounter target={s.target} decimal={s.decimal} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ABOUT / TEAM */}
      <section className="about-section section" id="about">
        <div className="section-inner">
          <div className="about-intro">
            <div className="about-text">
              <p className="section-tag reveal">About the Project</p>
              <h2 className="section-h2 reveal">
                A Student Project.<br />A Real Solution.
              </h2>
              <div className="reveal">
                <p>
                  UniHustle Rwanda is a <strong>Foundations Project</strong> built by six BSc. Software Engineering
                  students at the African Leadership University (ALU), Kigali.
                </p>
                <p>
                  Inspired by platforms like Fiverr and Upwork, we built a version centralised around Rwanda — with
                  local rates, local trust, and a direct focus on the barriers Rwandan students face: the experience
                  paradox and nepotism in hiring.
                </p>
                <p>
                  The current pilot is <strong>exclusively for ALU students</strong>. By verifying users through their
                  @alustudent.com email, we create a trusted, merit-based marketplace where your work speaks for itself.
                </p>
                <div style={{ marginTop: 20 }}>
                  <span className="alu-badge">ALU Rwanda · January 2026 · Team Riptide</span>
                </div>
              </div>
            </div>
 
            <div className="reveal">
              <p className="section-tag">The Mission</p>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontFamily: "'Instrument Serif', serif",
                  lineHeight: 1.45,
                  letterSpacing: '-0.02em',
                  color: 'var(--black)',
                  marginTop: 12,
                }}
              >
                &ldquo;Break the experience paradox. Give every ALU student a fair chance to earn, build, and grow — before
                graduation.&rdquo;
              </p>
              <div
                style={{ width: 48, height: 3, background: 'var(--orange)', borderRadius: 2, marginTop: 28 }}
              ></div>
            </div>
          </div>
 
          <p className="section-tag reveal">Meet the Team</p>
          <h3
            className="section-h2 reveal"
            style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', marginBottom: 40 }}
          >
            The 6 people behind UniHustle
          </h3>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="team-card reveal" key={member.name}>
                <div className="team-initials" style={{ background: member.gradient }}>
                  {member.initials}
                </div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <p className="team-desc">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* CTA */}
      <section className="cta-section">
        <p
          className="section-tag"
          style={{ color: 'rgba(249,115,22,0.8)', display: 'block', marginBottom: 14, textAlign: 'center' }}
        >
          Ready to start?
        </p>
        <h2 className="cta-h2">
          Start Building Experience<br /><em>Today</em>
        </h2>
        <p className="cta-sub">
          Join the growing community of ALU students and Rwandan businesses creating real opportunities together.
        </p>
        <div className="cta-btns">
          <a href="#" className="btn-cta-primary">Create Your Account</a>
          <a href="#" className="btn-cta-ghost">Explore Hustles</a>
        </div>
      </section>
 
      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-name">
              <div className="nav-logo-mark">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              UniHustle Rwanda
            </div>
            <p className="footer-brand-desc">
              A Fiverr-inspired freelance marketplace centralised around Rwanda — currently piloting exclusively for ALU students.
            </p>
          </div>
          <ul className="footer-nav">
            <li><a href="#how">How it Works</a></li>
            <li><a href="#hustles">Find Hustles</a></li>
            <li><a href="#hustles">Post a Job</a></li>
            <li><a href="#community">Community</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 UniHustle Rwanda · Team Riptide · ALU Rwanda</span>
          <div className="social-icons">
            <a href="#" className="social-icon" title="LinkedIn">
              <svg viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className="social-icon" title="Twitter / X">
              <svg viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" className="social-icon" title="Instagram">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="rgba(12,10,9,0.9)" strokeWidth={2} />
              </svg>
            </a>
          </div>
        </div>
      </footer>
 
      {/* Chatbot FAB */}
      <button className="chatbot-fab" title="Chat with us">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>
    </>
  );
}
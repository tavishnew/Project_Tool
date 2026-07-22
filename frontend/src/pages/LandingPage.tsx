import React from "react";
import { Link } from "react-router-dom";
import { Aurora } from "../components/animations/Aurora";
import { MagneticButton } from "../components/animations/MagneticButton";
import { SpotlightCard } from "../components/animations/SpotlightCard";

const features = [
  {
    title: "Visual Project Boards",
    description: "Kanban, list, and timeline views. Drag-and-drop tasks, custom columns, and real-time updates.",
  },
  {
    title: "Team Collaboration",
    description: "Comments, mentions, attachments, and activity feeds. Keep everyone aligned without meetings.",
  },
  {
    title: "Smart Automation",
    description: "Rules, templates, and recurring tasks. Automate repetitive work and focus on what matters.",
  },
  {
    title: "Insights & Reports",
    description: "Burndown charts, velocity tracking, and custom dashboards. Data-driven decisions made simple.",
  },
  {
    title: "Integrations",
    description: "GitHub, GitLab, Slack, Figma, and 50+ tools. Connect your workflow seamlessly.",
  },
  {
    title: "Enterprise Security",
    description: "SSO, audit logs, granular permissions, and SOC 2 compliance. Your data stays protected.",
  },
];

const stats = [
  { value: 10000, suffix: "+", label: "Teams Active" },
  { value: 50000000, suffix: "+", label: "Tasks Completed" },
  { value: 99.9, suffix: "%", label: "Uptime SLA" },
  { value: 50, suffix: "+", label: "Integrations" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-emerald-500">
              <defs>
                <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A5F"></stop>
                  <stop offset="50%" stopColor="#3DDC97"></stop>
                  <stop offset="100%" stopColor="#1E3A5F"></stop>
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="13" stroke="url(#navGradient)" strokeWidth="2.5" strokeDasharray="3 6"></circle>
              <circle cx="16" cy="16" r="9" stroke="#3DDC97" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6"></circle>
              <circle cx="16" cy="16" r="4.5" fill="url(#navGradient)"></circle>
              <circle cx="14.5" cy="14.5" r="1.5" fill="#ffffff" opacity="0.3"></circle>
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Orbit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium">Features</Link>
            <Link to="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium">Pricing</Link>
            <Link to="#about" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium">Sign in</Link>
            <MagneticButton
              strength={0.3}
              className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)] transition-shadow"
            >
              <Link to="/register" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                Get Started
              </Link>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        <Aurora colorStops={["#1E3A5F", "#3DDC97", "#2E86AB"]} speed={20} className="opacity-15 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now with AI-powered project insights
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05] animate-fade-in-up delay-200">
            Project management that{" "}
            <span className="text-emerald-500">actually works for your team</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-300">
            Stop fighting your tools. Orbit combines boards, docs, automation, and analytics in one beautiful workspace your team will actually enjoy using.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
            <MagneticButton
              strength={0.4}
              className="px-10 py-5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-lg hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-shadow"
            >
              <Link to="/register" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                Start Free - No Credit Card
              </Link>
            </MagneticButton>
            <Link 
              to="/login" 
              className="px-10 py-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-lg hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up delay-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Free for up to 5 members
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              14-day Pro trial
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Cancel anytime
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-16 px-6 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-10 font-medium tracking-wider uppercase">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 opacity-60">
            {["Acme Corp", "Globex", "Wayne Enterprises", "Stark Industries", "Umbrella Corp", "Initech"].map((name, i) => (
              <span
                key={name}
                style={{ animationDelay: `${100 * i}ms` }}
                className="text-gray-400 dark:text-gray-500 font-semibold text-lg animate-fade-in-up"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{ animationDelay: `${100 * i}ms` }}
                className="text-center animate-fade-in-up"
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}<span className="text-emerald-500">{stat.suffix}</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              Everything you need
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Features that <span className="text-emerald-500">power your workflow</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From solo builders to enterprise teams. Orbit scales with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={feature.title} style={{ animationDelay: `${100 * i}ms` }} className="animate-fade-in-up">
                <SpotlightCard
                  className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                  spotlightColor="rgba(61, 220, 151, 0.08)"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </SpotlightCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <Aurora colorStops={["#1E3A5F", "#2E86AB", "#3DDC97"]} speed={25} className="opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Ready to transform how your team works?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using Orbit. Free for up to 5 members, no credit card required.
          </p>
          <MagneticButton
            strength={0.4}
            className="px-10 py-5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-lg hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-shadow"
          >
            <Link to="/register" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              Get Started Free
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-emerald-500">
              <defs>
                <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A5F"></stop>
                  <stop offset="50%" stopColor="#3DDC97"></stop>
                  <stop offset="100%" stopColor="#1E3A5F"></stop>
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="13" stroke="url(#footerGradient)" strokeWidth="2.5" strokeDasharray="3 6"></circle>
              <circle cx="16" cy="16" r="9" stroke="#3DDC97" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6"></circle>
              <circle cx="16" cy="16" r="4.5" fill="url(#footerGradient)"></circle>
              <circle cx="14.5" cy="14.5" r="1.5" fill="#ffffff" opacity="0.3"></circle>
            </svg>
            <span className="text-xl font-bold">Orbit</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            \u00A9 {new Date().getFullYear()} Orbit. Built for teams that ship.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

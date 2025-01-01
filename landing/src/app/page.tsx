'use client'

import Image from 'next/image'
import { Outfit } from 'next/font/google'
import { Download, MonitorPlay, Library, Clock, Star, Sparkles, ChevronRight, Coffee, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'

// Create a static array of particles outside of React
const STATIC_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  style: {
    width: `${5 + (i * 7) % 10}px`,
    height: `${5 + (i * 7) % 10}px`,
    left: `${(i * 17) % 100}vw`,
    top: `${(i * 13) % 100}vh`,
    animationDelay: `${(i * 1.5) % 5}s`,
    animationDuration: `${20 + (i * 3) % 10}s`
  }
}));

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Watch for scroll
  useEffect(() => {
    const scrollContainer = document.querySelector('body > div');
    if (!scrollContainer) return;

    const handleScroll = () => {
      setScrolled(scrollContainer.scrollTop > 50);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#16161e] text-[#c0caf5] antialiased relative pt-14">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none animate-spin-slow overflow-hidden">
        {STATIC_PARTICLES.map(({ key, style }) => (
          <div
            key={key}
            className="absolute rounded-full bg-[#bb9af7] opacity-20 animate-float"
            style={style}
          />
        ))}
      </div>

      {/* Header with transparent to solid transition */}
      <header className={`fixed top-0 w-full transition-colors duration-300 border-b z-50 ${scrolled
        ? 'bg-[#16161e] border-[#24283b]'
        : 'bg-transparent border-transparent'
        }`}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="bg-[#bb9af7] rounded-lg p-1.5 px-2.5 transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-[#1a1b26] font-bold text-lg">星</span>
            </div>
            <span className="text-lg font-semibold group-hover:text-[#bb9af7] transition-colors">Hoshizora</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost"
              onClick={() => scrollToSection('features')}
              className="text-[#9aa5ce] hover:text-[#c0caf5] hover:bg-[#bb9af7]/10 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Features
            </Button>
            <Button
              onClick={() => scrollToSection('download')}
              className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] transform hover:scale-105 transition-all duration-300"
            >
              <Star className="w-4 h-4" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-[#bb9af7] via-[#1a1b26] to-[#16161e] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="relative z-10">
              <span className="block text-2xl font-bold mb-2 text-[#575d9e93] tracking-wide">
                Desktop Anime App
              </span>
              <span className="relative inline-block">
                <span className="block text-7xl font-extrabold bg-gradient-to-r from-white via-[#bb9af7] to-[#7dcfff] text-transparent bg-clip-text pb-2">
                  Made for You
                </span>
              </span>
            </h1>
            <p className="text-xl text-[#9aa5ce] my-8 animate-fade-in">
              Welcome to a new way of watching anime on your desktop.<br /> Clean, organized, and personalized just for you.
            </p>
            <Button
              onClick={() => scrollToSection('download')}
              className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-lg px-8 py-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <Download className="w-6 h-6 mr-2 transition-transform duration-300" />
              Download Now
            </Button>
          </div>

          {/* App Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#bb9af7] via-[#7dcfff] to-[#bb9af7] opacity-30 blur-3xl -z-10"></div>
            <div className="rounded-lg overflow-hidden shadow-2xl border border-[#24283b] transition-all duration-300 ease-in-out transform hover:scale-105">
              <Image
                src="/0_1.png"
                alt="Hoshizora app interface"
                width={1920}
                height={1080}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#1f2335] relative overflow-hidden" id="features">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#7aa2f7]">
            What's Inside
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  icon: MonitorPlay,
                  title: "Clean Interface",
                  description: "Watch your shows with a simple, clutter-free player."
                },
                {
                  icon: Library,
                  title: "Library",
                  description: "Keep track of what you're watching and what's up next."
                },
                {
                  icon: Clock,
                  title: "Quick Access",
                  description: "Jump between episodes, manage downloads, and browse while watching."
                }
              ].map((feature, index) => (
                <div key={index} className="group flex items-start space-x-4 transform hover:translate-x-2 transition-all duration-300">
                  <div className="bg-[#bb9af7] p-3 rounded-full group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-[#1a1b26]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2 text-[#7aa2f7] group-hover:text-[#bb9af7] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#9aa5ce] text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-conic from-[#bb9af7] via-[#7dcfff] to-[#bb9af7] opacity-30 blur-3xl"></div>
              <div className="relative h-full w-full overflow-hidden rounded-lg">
                <Image
                  src="/0_2.png"
                  alt="Feature showcase"
                  fill
                  className="rounded-lg shadow-xl object-cover object-[71.3%_center] transition-transform duration-700 hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 bg-gradient-to-b from-[#1a1b26] to-[#16161e] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-[#7aa2f7] text-center">Ready to Try It?</h2>
          <p className="text-xl text-[#9aa5ce] mb-16 max-w-2xl mx-auto text-center">
            A better way to watch anime on your desktop.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Free Download Card */}
            <div className={`
    bg-[#16161e] rounded-2xl p-10
    border border-[#24283b] hover:border-[#bb9af7] transition-all duration-300
    shadow-lg hover:shadow-[#bb9af7]/10 hover:shadow-2xl
    flex flex-col justify-between h-full
  `}>
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-[#bb9af7] p-3 rounded-xl">
                    <Download className="w-8 h-8 text-[#1a1b26]" />
                  </div>
                  <h3 className="text-3xl font-bold text-white ml-4">Free Download</h3>
                </div>
                <p className="text-lg text-[#9aa5ce] mb-8">
                  Get the full Hoshizora experience, completely free.
                </p>
              </div>

              <div>
                <Button className={`
        bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff]
        text-lg w-full py-7 rounded-xl transition-all duration-300
        group font-semibold mb-4
        hover:scale-[1.02] transform
      `}>
                  <Download className="w-6 h-6 mr-3" />
                  Download for Windows
                </Button>
                <div className="flex justify-center space-x-8 text-base">
                  <a href="#" className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors flex items-center group">
                    <span className="group-hover:underline">macOS</span>
                    <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                  <a href="#" className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors flex items-center group">
                    <span className="group-hover:underline">Linux</span>
                    <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className={`
    bg-[#16161e] rounded-2xl p-10
    border border-[#24283b] hover:border-[#7dcfff] transition-all duration-300
    shadow-lg hover:shadow-[#7dcfff]/10 hover:shadow-2xl
    flex flex-col justify-between h-full
  `}>
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-[#7dcfff] p-3 rounded-xl">
                    <Heart className="w-8 h-8 text-[#1a1b26]" />
                  </div>
                  <h3 className="text-3xl font-bold text-white ml-4">Support Us</h3>
                </div>
                <p className="text-lg text-[#9aa5ce] mb-8">
                  Help us keep Hoshizora free and make it even better.
                </p>
              </div>

              <Button
                className={`
        bg-[#7dcfff] text-[#1a1b26] hover:bg-[#bb9af7]
        text-lg w-full py-7 rounded-xl transition-all duration-300
        group font-semibold mb-4
        hover:scale-[1.02] transform
      `}
                onClick={() => window.open('https://ko-fi.com', '_blank')}
              >
                <Coffee className="w-6 h-6 mr-3" />
                Buy us a coffee
              </Button>
              <div className="flex justify-center space-x-8 text-base">
                <a href="#" className="text-[#9aa5ce] flex items-center group">
                  <span>Thank you! 💗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1b26] py-12 border-t border-[#24283b]">
        <div className="container mx-auto px-4 text-center text-[#9aa5ce]">
          <p className="mb-4">&copy; 2024 Hoshizora. All rights reserved.</p>
          <p className="mb-4">Made with Love only.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-200px) rotate(180deg); }
        }

        .animate-float {
          animation: float ease infinite;
        }

        @keyframes spin {
          0%, 100% { transform: rotate(-5deg) }
          50% { transform: rotate(5deg) }
        }

        .animate-spin-slow {
          animation: spin 30s ease infinite;
        }
      `}</style>
    </div>
  )
}
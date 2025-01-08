'use client'

import Image from 'next/image'
import { Menu, X, Download, MonitorPlay, Library, Clock, Star, Sparkles, ChevronRight, ChevronDown, Coffee, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'

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

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface Release {
  assets: ReleaseAsset[];
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloads, setDownloads] = useState({
    windows: '',
    mac: '',
    linux: { appImage: '', deb: '' }
  });

  useEffect(() => {
    fetch('https://api.github.com/repos/avelinia/hoshizora/releases')
      .then(res => res.json())
      .then((releases: Release[]) => {
        const latest = releases[0];
        setDownloads({
          windows: latest.assets.find((a: ReleaseAsset) => a.name.endsWith('.msi'))?.browser_download_url ?? '',
          mac: latest.assets.find((a: ReleaseAsset) => a.name.endsWith('.dmg'))?.browser_download_url ?? '',
          linux: {
            appImage: latest.assets.find((a: ReleaseAsset) => a.name.endsWith('.AppImage'))?.browser_download_url ?? '',
            deb: latest.assets.find((a: ReleaseAsset) => a.name.endsWith('.deb'))?.browser_download_url ?? ''
          }
        });
      });
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
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

  const featuresData = [
    {
      icon: MonitorPlay,
      title: "Elegant Player",
      description: "Immerse yourself in a distraction-free viewing experience with our sleek, minimalist player design."
    },
    {
      icon: Library,
      title: "Smart Library",
      description: "Effortlessly organize and track your anime collection with intelligent sorting and tracking features."
    },
    {
      icon: Clock,
      title: "Seamless Navigation",
      description: "Quickly switch between episodes, manage downloads, and explore new content without interrupting your watching flow."
    }
  ];

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Header - No Navigation */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-[#bb9af7] via-[#1a1b26] to-[#16161e] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="relative z-10">
              <span className="block text-2xl font-bold mb-2 text-[#575d9e93] tracking-wide">
                the Desktop Anime App
              </span>
              <span className="relative inline-block">
                <span className="block text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-white via-[#bb9af7] to-[#7dcfff] text-transparent bg-clip-text pb-2">
                  Made for You
                </span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#9aa5ce] my-8 animate-fade-in">
              Welcome to a new way of watching anime on your desktop.<br /> Clean, organized, and personalized just for you.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => scrollToSection('download')}
                className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hidden md:flex"
              >
                <Download className="w-5 h-5 md:w-6 md:h-6 mr-2 transition-transform duration-300" />
                Download Now
              </Button>
            </div>
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
            What&apos;s Inside
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-12">
              {featuresData.map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-start space-x-4 transform hover:translate-x-2 transition-all duration-300 p-4 hover:bg-[#24283b]/50 rounded-lg"
                >
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
            <div className="relative h-full hidden md:block">
              <div
                className="relative h-full w-full"
                style={{
                  maskImage: 'linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))',
                  WebkitMaskImage: 'linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))'
                }}
              >
                <Image
                  src="/0_2.png"
                  alt="Feature showcase"
                  fill
                  className="rounded-lg object-cover object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 bg-gradient-to-b from-[#1a1b26] to-[#16161e] relative overflow-hidden hidden md:block">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-[#7aa2f7] text-center">Ready to Try It?</h2>
          <p className="text-xl text-[#9aa5ce] mb-16 max-w-2xl mx-auto text-center">
            Enjoy an Ad-free, Hassle-free Anime Streaming Experience.
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
                  <h3 className="text-3xl font-bold text-white ml-4">Downloads</h3>
                </div>
                <p className="text-lg text-[#9aa5ce] mb-8">
                  Get the full Hoshizora experience, straight from the source.
                </p>
              </div>

              <div>
                <Button
                  onClick={() => window.open(downloads.windows)}
                  className={`
                    bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff]
                    text-lg w-full py-7 rounded-xl transition-all duration-300
                    group font-semibold mb-4
                    hover:scale-[1.02] transform
                  `}>
                  <Download className="w-6 h-6 mr-3" />
                  Download for Windows
                </Button>
                <div className="flex justify-center space-x-8 text-base">
                  <div className="relative group">
                    <a href="#" className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors flex items-center group">
                      <span className="group-hover:underline">Linux</span>
                      <ChevronDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                    </a>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                      <div className="bg-[#1f2335] rounded-lg border border-[#24283b] p-2 whitespace-nowrap">
                        <a href={downloads.linux.appImage} className="block px-4 py-2 hover:bg-[#bb9af7]/10 rounded-lg transition-colors">
                          AppImage
                        </a>
                        <a href={downloads.linux.deb} className="block px-4 py-2 hover:bg-[#bb9af7]/10 rounded-lg transition-colors">
                          .deb Package
                        </a>
                      </div>
                    </div>
                  </div>
                  <a href={downloads.mac} className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors flex items-center group">
                    <span className="group-hover:underline">macOS</span>
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
                  <h3 className="text-3xl font-bold text-white ml-4">Support Me</h3>
                </div>
                <p className="text-lg text-[#9aa5ce] mb-8">
                  Help me keep Hoshizora free and make it even better.
                </p>
              </div>

              <Button
                className={`
                  bg-[#7dcfff] text-[#1a1b26] hover:bg-[#bb9af7]
                  text-lg w-full py-7 rounded-xl transition-all duration-300
                  group font-semibold mb-4
                  hover:scale-[1.02] transform
                `}
                onClick={() => window.open('https://ko-fi.com/aveliners', '_blank')}
              >
                <Coffee className="w-6 h-6 mr-3" />
                Buy me a coffee
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

      {/* Mobile Download/Support Section */}
      <section className="py-24 bg-gradient-to-b from-[#1a1b26] to-[#16161e] relative overflow-hidden md:hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-8">
            {/* Mobile Download Card */}
            <div className={`
                bg-[#16161e] rounded-2xl p-6
                border border-[#24283b] hover:border-[#bb9af7] transition-all duration-300
                shadow-lg hover:shadow-[#bb9af7]/10 hover:shadow-2xl
              `}>
              <div className="flex items-center mb-4">
                <div className="bg-[#bb9af7] p-3 rounded-xl">
                  <Download className="w-6 h-6 text-[#1a1b26]" />
                </div>
                <h3 className="text-2xl font-bold text-white ml-4">Downloads</h3>
              </div>
              <Button
                onClick={() => window.open(downloads.windows)}
                className={`
                  bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff]
                  text-base w-full py-5 rounded-xl transition-all duration-300
                  group font-semibold mb-4
                  hover:scale-[1.02] transform
                `}>
                <Download className="w-5 h-5 mr-2" />
                Download for Windows
              </Button>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="relative group">
                  <a href="#" className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors flex items-center">
                    <span className="group-hover:underline">Linux</span>
                  </a>
                </div>
                <a href={downloads.mac} className="text-[#9aa5ce] hover:text-[#7aa2f7] transition-colors">
                  macOS
                </a>
              </div>
            </div>

            {/* Mobile Support Card */}
            <div className={`
                bg-[#16161e] rounded-2xl p-6
                border border-[#24283b] hover:border-[#7dcfff] transition-all duration-300
                shadow-lg hover:shadow-[#7dcfff]/10 hover:shadow-2xl
              `}>
              <div className="flex items-center mb-4">
                <div className="bg-[#7dcfff] p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-[#1a1b26]" />
                </div>
                <h3 className="text-2xl font-bold text-white ml-4">Support Me</h3>
              </div>
              <Button
                className={`
                  bg-[#7dcfff] text-[#1a1b26] hover:bg-[#bb9af7]
                  text-base w-full py-5 rounded-xl transition-all duration-300
                  group font-semibold
                  hover:scale-[1.02] transform
                `}
                onClick={() => window.open('https://ko-fi.com/aveliners', '_blank')}
              >
                <Coffee className="w-5 h-5 mr-2" />
                Buy me a coffee
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1b26] py-12 border-t border-[#24283b]">
        <div className="container mx-auto px-4 text-center text-[#9aa5ce]">
          <p className="mb-4">&copy; 2024 Hoshizora. Under MIT License.</p>
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
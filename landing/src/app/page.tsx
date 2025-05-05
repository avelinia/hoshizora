"use client";

import Image from "next/image";
import {
  Download,
  MonitorPlay,
  Library,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  Coffee,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const STATIC_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  style: {
    width: `${5 + ((i * 7) % 10)}px`,
    height: `${5 + ((i * 7) % 10)}px`,
    left: `${(i * 17) % 100}vw`,
    top: `${(i * 13) % 100}vh`,
    animationDelay: `${(i * 1.5) % 5}s`,
    animationDuration: `${20 + ((i * 3) % 10)}s`,
  },
}));

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface Release {
  assets: ReleaseAsset[];
  tag_name: string;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [downloads, setDownloads] = useState({
    windows: "",
    mac: "",
    linux: { appImage: "", deb: "" },
  });
  const [latestVersion, setLatestVersion] = useState("loading...");

  useEffect(() => {
    fetch("https://api.github.com/repos/hireri/hoshizora/releases")
      .then((res) => res.json())
      .then((releases: Release[]) => {
        if (releases && releases.length > 0) {
          const latest = releases[0];

          // Set the latest version from the tag_name
          setLatestVersion(latest.tag_name);

          // Set download links if this repository has assets
          if (latest.assets && latest.assets.length > 0) {
            setDownloads({
              windows:
                latest.assets.find((a: ReleaseAsset) => a.name.endsWith(".msi"))
                  ?.browser_download_url ?? "",
              mac:
                latest.assets.find((a: ReleaseAsset) => a.name.endsWith(".dmg"))
                  ?.browser_download_url ?? "",
              linux: {
                appImage:
                  latest.assets.find((a: ReleaseAsset) =>
                    a.name.endsWith(".AppImage")
                  )?.browser_download_url ?? "",
                deb:
                  latest.assets.find((a: ReleaseAsset) =>
                    a.name.endsWith(".deb")
                  )?.browser_download_url ?? "",
              },
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching releases:", error);
        setLatestVersion("unknown");
      });
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Watch for scroll
  useEffect(() => {
    const scrollContainer = document.querySelector("body > div");
    if (!scrollContainer) return;

    const handleScroll = () => {
      setScrolled(scrollContainer.scrollTop > 50);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const featuresData = [
    {
      icon: MonitorPlay,
      title: "Elegant Player",
      description:
        "Immerse yourself in a distraction-free viewing experience with our sleek, minimalist player design.",
      highlight: "Distraction-free viewing",
    },
    {
      icon: Library,
      title: "Smart Library",
      description:
        "Effortlessly organize and track your anime collection with intelligent sorting and tracking features.",
      highlight: "Intelligent organization",
    },
    {
      icon: Clock,
      title: "Seamless Navigation",
      description:
        "Quickly switch between episodes, manage downloads, and explore new content without interrupting your watching flow.",
      highlight: "Uninterrupted experience",
    },
    {
      icon: Star,
      title: "Personalized Recommendations",
      description:
        "Discover new anime tailored to your taste with our smart recommendation engine that learns from your watching habits.",
      highlight: "Tailored to your taste",
    },
    {
      icon: Sparkles,
      title: "Beautiful UI",
      description:
        "Enjoy a visually stunning interface designed with attention to detail and optimized for both functionality and aesthetics.",
      highlight: "Visually stunning",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Experience an app created by anime fans for anime fans, with regular updates and community-driven improvements.",
      highlight: "Community-driven",
    },
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
      <header
        className={`fixed top-0 w-full transition-colors duration-300 border-b z-50 ${
          scrolled
            ? "bg-[#16161e] border-[#24283b]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="bg-[#bb9af7] rounded-lg p-1.5 px-2.5 transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-[#1a1b26] font-bold text-lg">星</span>
            </div>
            <span className="text-lg font-semibold group-hover:text-[#bb9af7] transition-colors">
              Hoshizora
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => scrollToSection("features")}
              className="text-[#9aa5ce] hover:text-[#c0caf5] hover:bg-[#bb9af7]/10 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Features
            </Button>
            <Button
              onClick={() => scrollToSection("download")}
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
      <section className="pt-32 pb-16 relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-radial from-[#bb9af7] via-[#1a1b26] to-[#16161e] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Side - Text Content */}
            <div className="w-full md:w-5/12">
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
                Welcome to a new way of watching anime on your desktop.
                <br /> Clean, organized, and personalized just for you.
              </p>
              <div className="flex">
                <Button
                  onClick={() => scrollToSection("download")}
                  className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hidden md:flex"
                >
                  <Download className="w-5 h-5 md:w-6 md:h-6 mr-2 transition-transform duration-300" />
                  Download Now
                </Button>
              </div>
            </div>

            {/* Right Side - App Preview */}
            <div className="w-full md:w-7/12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#bb9af7] via-[#7dcfff] to-[#bb9af7] opacity-30 blur-3xl -z-10"></div>
              <div className="rounded-md overflow-hidden shadow-xl border border-[#24283b] transition-all duration-300 ease-in-out">
                <div className="overflow-hidden">
                  <Image
                    src="/0_1.png"
                    alt="Hoshizora app interface"
                    width={1920}
                    height={1080}
                    className="w-full h-auto object-cover object-left"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#1f2335] relative" id="features">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#16161e] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#1a1b26] to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-[#bb9af7]/10 text-[#bb9af7] font-medium text-sm mb-4">
              POWERFUL FEATURES
            </span>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] text-transparent bg-clip-text">
              Everything You Need
            </h2>
            <p className="text-xl text-[#9aa5ce] max-w-2xl mx-auto">
              Hoshizora combines powerful features with elegant design to create
              the ultimate anime watching experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="group bg-[#1a1b26]/80 backdrop-blur-sm border border-[#24283b] hover:border-[#bb9af7] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#bb9af7]/10 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-[#bb9af7] p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-[#1a1b26]" />
                  </div>
                  <div className="ml-4">
                    <span className="text-xs font-semibold text-[#7dcfff] uppercase tracking-wider">
                      {feature.highlight}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#bb9af7] transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[#9aa5ce] pl-14">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 relative group">
            {/* Enhanced background glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#bb9af7]/30 via-[#7aa2f7]/30 to-[#7dcfff]/30 rounded-2xl blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Main card container with improved border */}
            <div className="relative bg-[#1a1b26] border border-[#24283b] group-hover:border-[#bb9af7]/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-500">
              <div className="grid md:grid-cols-2 items-center">
                {/* Left content section with improved spacing and animations */}
                <div className="p-8 md:p-12 relative z-10">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#bb9af7]/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#7aa2f7]/5 rounded-full blur-2xl translate-x-1/4 translate-y-1/4"></div>

                  {/* Badge */}
                  <div className="inline-block px-3 py-1 rounded-full bg-[#bb9af7]/10 text-[#bb9af7] font-medium text-sm mb-4 transform transition-transform">
                    <span className="flex items-center">
                      <Library className="w-3.5 h-3.5 mr-1.5" />
                      LIBRARY VIEW
                    </span>
                  </div>

                  {/* Heading with gradient effect */}
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-[#bb9af7] bg-clip-text text-transparent">
                    Beautiful Library View
                  </h3>

                  {/* Enhanced description with bullet points */}
                  <p className="text-[#9aa5ce] text-lg mb-4">
                    Browse your collection with Hoshizora&apos;s stunning
                    library interface, designed for both aesthetics and
                    functionality.
                  </p>

                  <ul className="space-y-2 mb-6 text-[#9aa5ce]">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#bb9af7] mr-2"></div>
                      <span>Smart organization by genres and seasons</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7aa2f7] mr-2"></div>
                      <span>Track your watching progress effortlessly</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7dcfff] mr-2"></div>
                      <span>Beautiful thumbnails and detailed information</span>
                    </li>
                  </ul>

                  {/* Enhanced button with icon and animation */}
                  <Button
                    onClick={() => scrollToSection("download")}
                    className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-lg px-8 py-4 rounded-lg transition-all duration-300 font-medium group-hover:shadow-lg group-hover:shadow-[#bb9af7]/20 transform group-hover:translate-y-[-2px]"
                  >
                    <Download className="w-5 h-5 mr-2 inline-block" />
                    Get Hoshizora
                  </Button>
                </div>

                {/* Right image section with improved presentation */}
                <div className="relative h-80 md:h-[450px] overflow-hidden">
                  {/* Image container with hover effects and frame */}
                  <div className="absolute inset-0 transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out p-3 md:p-5">
                    <div className="relative w-full h-full rounded-md overflow-hidden border-2 border-[#24283b] group-hover:border-[#bb9af7]/30 transition-colors shadow-lg">
                      {/* Decorative corner accents */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#bb9af7] rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#7aa2f7] rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#7dcfff] rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#bb9af7] rounded-br"></div>

                      <Image
                        src="/0_2.png"
                        alt="Hoshizora library showcase"
                        fill
                        className="object-cover object-left-top"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />

                      {/* Floating UI elements to highlight features - improved design */}
                      <div className="absolute top-[15%] right-[20%] bg-[#1a1b26]/90 backdrop-blur-md border-l-4 border-[#bb9af7] rounded-lg p-3 shadow-xl transform rotate-2 animate-float hidden md:block">
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-[#bb9af7]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Favorites
                            </span>
                            <span className="text-[10px] text-[#9aa5ce] block">
                              Quick access to your top picks
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-[25%] right-[15%] bg-[#1a1b26]/90 backdrop-blur-md border-l-4 border-[#7aa2f7] rounded-lg p-3 shadow-xl transform -rotate-1 animate-float animation-delay-2 hidden md:block">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-[#7aa2f7]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Continue Watching
                            </span>
                            <span className="text-[10px] text-[#9aa5ce] block">
                              Resume from where you left off
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-[40%] left-[15%] bg-[#1a1b26]/90 backdrop-blur-md border-l-4 border-[#7dcfff] rounded-lg p-3 shadow-xl transform rotate-1 animate-float animation-delay-4 hidden md:block">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-[#7dcfff]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              New Releases
                            </span>
                            <span className="text-[10px] text-[#9aa5ce] block">
                              Latest additions to your library
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section
        id="download"
        className="py-24 bg-gradient-to-b from-[#1a1b26] to-[#16161e] relative overflow-hidden"
      >
        {/* Animated download particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={`download-particle-${i}`}
              className="absolute rounded-full bg-[#bb9af7] opacity-10"
              style={{
                width: `${4 + ((i * 6) % 10)}px`,
                height: `${4 + ((i * 6) % 10)}px`,
                left: `${(i * 23) % 100}%`,
                top: `${(i * 19) % 100}%`,
                animation: `float ${12 + ((i * 4) % 18)}s ease infinite`,
                animationDelay: `${(i * 1.3) % 6}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-[#7aa2f7]/10 text-[#7aa2f7] font-medium text-sm mb-4">
              GET STARTED NOW
            </span>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#bb9af7] to-[#7dcfff] text-transparent bg-clip-text">
              Download Hoshizora
            </h2>
            <p className="text-xl text-[#9aa5ce] max-w-2xl mx-auto">
              Join thousands of anime fans enjoying a better way to watch. Free,
              open-source, and constantly improving.
            </p>
          </div>

          {/* Main Download Card - Desktop */}
          <div className="max-w-4xl mx-auto hidden md:block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#bb9af7] via-[#7aa2f7] to-[#7dcfff] rounded-2xl blur-3xl opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#16161e] rounded-2xl p-8 md:p-12 md:pb-6 border border-[#24283b] shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-[#bb9af7] p-4 rounded-xl">
                        <Download className="w-8 h-8 text-[#1a1b26]" />
                      </div>
                      <h3 className="text-3xl font-bold text-white ml-4">
                        Download Now
                      </h3>
                    </div>
                    <p className="text-lg text-[#9aa5ce]">
                      Get the full Hoshizora experience in just a few seconds.
                      No ads, no tracking, just anime.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#1a1b26] px-4 py-2 rounded-lg border border-[#24283b]">
                    <div className="text-[#9aa5ce]">Version:</div>
                    <div className="bg-[#bb9af7]/10 text-[#bb9af7] px-3 py-1 rounded-md font-mono">
                      {latestVersion}
                    </div>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Button
                    onClick={() => window.open(downloads.windows)}
                    className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-lg py-6 rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] transform flex flex-col items-center justify-center h-24"
                  >
                    <span>Windows</span>
                    <span className="text-xs opacity-80 mt-1">
                      (.msi installer)
                    </span>
                  </Button>

                  <Button
                    onClick={() => window.open(downloads.mac)}
                    className="bg-[#1a1b26] text-white border border-[#24283b] hover:border-[#7aa2f7] hover:bg-[#7aa2f7]/10 text-lg py-6 rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] transform flex flex-col items-center justify-center h-24"
                  >
                    <span>macOS</span>
                    <span className="text-xs opacity-80 mt-1">
                      (.dmg installer)
                    </span>
                  </Button>

                  <div className="relative group">
                    <Button className="bg-[#1a1b26] text-white border border-[#24283b] hover:border-[#7aa2f7] hover:bg-[#7aa2f7]/10 text-lg py-6 rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] transform flex flex-col items-center justify-center w-full h-24">
                      <span>Linux</span>
                      <span className="text-xs opacity-80 mt-1">
                        (.AppImage or .deb)
                      </span>
                    </Button>

                    <div className="absolute top-full left-0 right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10">
                      <div className="bg-[#1f2335] rounded-lg border border-[#24283b] p-2 shadow-xl">
                        <a
                          href={downloads.linux.appImage}
                          className="block px-4 py-3 hover:bg-[#bb9af7]/10 rounded-lg transition-colors text-center"
                        >
                          AppImage
                        </a>
                        <a
                          href={downloads.linux.deb}
                          className="block px-4 py-3 hover:bg-[#bb9af7]/10 rounded-lg transition-colors text-center"
                        >
                          .deb Package
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Testimonial */}
                <div className="bg-[#1a1b26] rounded-xl p-6 border border-[#24283b]">
                  <div className="flex items-start">
                    <div className="text-[#bb9af7] text-4xl font-serif">
                      &ldquo
                    </div>
                    <div className="ml-2">
                      <p className="text-[#9aa5ce] italic">
                        Hoshizora completely changed how I watch anime. The
                        interface is beautiful and it&apos;s so easy to keep
                        track of what I&apos;m watching.
                      </p>
                      <div className="mt-2 text-[#7aa2f7]">— Happy User</div>
                    </div>
                  </div>
                </div>

                {/* View Older Releases Link */}
                <div className="mt-4 text-center">
                  <a
                    href="https://github.com/hireri/hoshizora/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-[#7aa2f7] hover:text-[#bb9af7] transition-colors"
                  >
                    <span>View older releases</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Support Card - Desktop */}
            <div className="mt-8 bg-[#16161e] rounded-xl p-6 border border-[#24283b] flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-[#7dcfff] p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-[#1a1b26]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">
                    Support the Project
                  </h3>
                  <p className="text-[#9aa5ce]">
                    Help keep Hoshizora free and make it even better.
                  </p>
                </div>
              </div>
              <Button
                className="bg-[#7dcfff] text-[#1a1b26] hover:bg-[#bb9af7] px-6 py-3 rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] transform"
                onClick={() =>
                  window.open("https://ko-fi.com/aveliners", "_blank")
                }
              >
                <Coffee className="w-5 h-5 mr-2" />
                Buy me a coffee
              </Button>
            </div>
          </div>

          {/* Mobile Download Section */}
          <div className="md:hidden space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#bb9af7] to-[#7dcfff] rounded-xl blur-xl opacity-10"></div>
              <div className="relative bg-[#16161e] rounded-xl p-6 border border-[#24283b]">
                <div className="flex items-center mb-4">
                  <div className="bg-[#bb9af7] p-3 rounded-lg">
                    <Download className="w-6 h-6 text-[#1a1b26]" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xl font-bold text-white">
                      Download Now
                    </h3>
                    <div className="text-xs text-[#7aa2f7]">
                      Latest: {latestVersion}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => window.open(downloads.windows)}
                  className="bg-[#bb9af7] text-[#1a1b26] hover:bg-[#7dcfff] text-base w-full py-4 rounded-lg transition-all duration-300 font-semibold mb-3 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for Windows
                </Button>

                {/* View Older Releases Link - Mobile */}
                <div className="text-center mb-3">
                  <a
                    href="https://github.com/hireri/hoshizora/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#7aa2f7] hover:text-[#bb9af7] transition-colors"
                  >
                    <span>View older releases</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => window.open(downloads.mac)}
                    className="bg-[#1a1b26] text-white border border-[#24283b] hover:border-[#7aa2f7] text-sm py-2 px-4 rounded-lg transition-all duration-300 flex-1 mr-2"
                  >
                    macOS
                  </Button>

                  <div className="relative group flex-1">
                    <Button className="bg-[#1a1b26] text-white border border-[#24283b] hover:border-[#7aa2f7] text-sm py-2 w-full rounded-lg transition-all duration-300">
                      Linux Options
                    </Button>

                    <div className="absolute top-full left-0 right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10">
                      <div className="bg-[#1f2335] rounded-lg border border-[#24283b] p-1 shadow-xl">
                        <a
                          href={downloads.linux.appImage}
                          className="block px-3 py-2 hover:bg-[#bb9af7]/10 rounded-lg transition-colors text-center text-sm"
                        >
                          AppImage
                        </a>
                        <a
                          href={downloads.linux.deb}
                          className="block px-3 py-2 hover:bg-[#bb9af7]/10 rounded-lg transition-colors text-center text-sm"
                        >
                          .deb Package
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Support Card */}
            <div className="bg-[#16161e] rounded-xl p-6 border border-[#24283b]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-[#7dcfff] p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-[#1a1b26]" />
                  </div>
                  <h3 className="text-lg font-bold text-white ml-3">
                    Support Me
                  </h3>
                </div>
                <Button
                  className="bg-[#7dcfff] text-[#1a1b26] hover:bg-[#bb9af7] px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                  onClick={() =>
                    window.open("https://ko-fi.com/aveliners", "_blank")
                  }
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Buy Coffee
                </Button>
              </div>
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
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-200px) rotate(180deg);
          }
        }

        .animate-float {
          animation: float ease infinite;
        }

        @keyframes spin {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        .animate-spin-slow {
          animation: spin 30s ease infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useScroll } from "framer-motion";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { PointerHighlight } from "@/components/ui/PointerHighlight";
import { WorldMap } from "@/components/ui/WorldMap";
import { TestimonialsMarquee } from "@/components/ui/TestimonialsMarquee";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import { Truck, MapPin, Wrench, Receipt, BarChart3, ChevronRight, Home, Info, HelpCircle, LogIn, Map, BarChart2, MessageSquare } from "lucide-react";

const AnimatedNumber = ({ value, duration = 3 }: { value: number, duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      onViewportEnter={() => {
        animate(count, value, { duration });
      }}
    >
      {rounded}
    </motion.span>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  
  const dockItems = [
    { title: "Home", icon: <Home className="w-5 h-5" />, href: "#" },
    { title: "Features", icon: <Truck className="w-5 h-5" />, href: "#features" },
    { title: "How it Works", icon: <Info className="w-5 h-5" />, href: "#how-it-works" },
    { title: "Global Reach", icon: <Map className="w-5 h-5" />, href: "#map" },
    { title: "Live Impact", icon: <BarChart2 className="w-5 h-5" />, href: "#stats" },
    { title: "Testimonials", icon: <MessageSquare className="w-5 h-5" />, href: "#testimonials" },
    { title: "Console Login", icon: <LogIn className="w-5 h-5 text-[var(--accent)]" />, href: "/login" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-white relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
        <div className="text-xl font-black tracking-widest flex items-center gap-2 drop-shadow-md">
          <Truck className="w-6 h-6 text-[#00f2fe]" />
          TRANSITOPS
        </div>
        <Link href="/login">
          <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md rounded-full px-6 transition-all">
            Login
          </Button>
        </Link>
      </div>

      <FloatingDock items={dockItems} />
      
      {/* 1. Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Minimal Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Cinematic Radial Glow */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#00f2fe] rounded-full blur-[150px] opacity-10" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00f2fe] mb-6 block drop-shadow-md">
              SMART TRANSPORT OPERATIONS
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight drop-shadow-2xl text-white"
          >
            Digitize <PointerHighlight containerClassName="inline-flex"><span className="px-2">Every</span></PointerHighlight><br/>
            Fleet <PointerHighlight containerClassName="inline-flex"><span className="px-2">Operation</span></PointerHighlight>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl drop-shadow-md"
          >
            Replace spreadsheets with a unified platform for vehicles, drivers, trips, maintenance, and real-time operational visibility.
          </motion.p>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-[var(--text-muted)]">
          <ChevronRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      {/* 2. Feature Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Everything your fleet needs, in one place.</h2>
          <p className="text-[var(--text-secondary)] text-lg">A connected ecosystem for modern transport operators.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.08 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 h-full hover:border-[var(--accent)]/50 transition-colors md:col-span-2"
          >
            <Truck className="w-10 h-10 text-[var(--accent)] mb-6" />
            <h3 className="text-2xl font-semibold mb-3">Vehicle Registry</h3>
            <p className="text-[var(--text-secondary)]">Maintain a complete system of record for your fleet. Track capacity, odometer readings, regional assignments, and live availability status.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.16 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 h-full hover:border-[var(--info)]/50 transition-colors"
          >
            <MapPin className="w-10 h-10 text-[var(--info)] mb-6" />
            <h3 className="text-xl font-semibold mb-3">Trip Dispatch</h3>
            <p className="text-[var(--text-secondary)]">Automated validations ensure cargo weight never exceeds capacity and drivers are compliant before dispatch.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.24 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 h-full hover:border-[var(--warning)]/50 transition-colors"
          >
            <Wrench className="w-10 h-10 text-[var(--warning)] mb-6" />
            <h3 className="text-xl font-semibold mb-3">Maintenance</h3>
            <p className="text-[var(--text-secondary)]">Log service records and automatically take vehicles offline until work is completed.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.32 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 h-full hover:border-[var(--success)]/50 transition-colors"
          >
            <Receipt className="w-10 h-10 text-[var(--success)] mb-6" />
            <h3 className="text-xl font-semibold mb-3">Fuel & Expenses</h3>
            <p className="text-[var(--text-secondary)]">Track every liter of fuel and every toll receipt against specific vehicles.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.40 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 h-full hover:border-[var(--accent)]/50 transition-colors"
          >
            <BarChart3 className="w-10 h-10 text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-semibold mb-3">Live Analytics</h3>
            <p className="text-[var(--text-secondary)]">Instantly calculate fleet utilization, fuel efficiency, and exact ROI per asset.</p>
          </motion.div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-16 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            How it works
          </motion.h2>
          
          <div className="flex flex-col md:flex-row gap-8 relative">
            <motion.div 
              className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-[var(--accent)] origin-left -translate-y-1/2 z-0" 
              initial={{ scaleX: 0, opacity: 0.5 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            {[
              { num: "01", title: "Register Fleet", desc: "Add your vehicles and compliant drivers." },
              { num: "02", title: "Dispatch", desc: "Create trips with automatic capacity validation." },
              { num: "03", title: "Track", desc: "Log fuel, expenses, and maintenance workflow." },
              { num: "04", title: "Optimize", desc: "See real-time ROI and operational metrics." },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                className="flex-1 relative z-10 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] text-center shadow-xl hover:border-[var(--accent)]/50 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-12 h-12 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--accent)] font-bold">
                  {step.num}
                </div>
                <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                <p className="text-[var(--text-secondary)] text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Global Impact (World Map) */}
      <section id="map" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            Used By Customers Worldwide.
          </motion.h2>
          <p className="text-[var(--text-secondary)] text-lg">Connecting operations across borders and timezones.</p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <WorldMap
            lineColor="#00f2fe"
            dots={[
              {
                start: { lat: 64.2008, lng: -149.4937 }, // Alaska
                end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
              },
              {
                start: { lat: 64.2008, lng: -149.4937 }, // Alaska
                end: { lat: -15.7975, lng: -47.8919 }, // Brazil
              },
              {
                start: { lat: -15.7975, lng: -47.8919 }, // Brazil
                end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
              },
              {
                start: { lat: 51.5074, lng: -0.1278 }, // London
                end: { lat: 28.6139, lng: 77.209 }, // New Delhi
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
              },
              { start: { lat: 34.0522, lng: -118.2437 }, end: { lat: 40.7128, lng: -74.0060 } },
              { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 51.5074, lng: -0.1278 } },
              { start: { lat: -33.8688, lng: 151.2093 }, end: { lat: 35.6895, lng: 139.6917 } },
              { start: { lat: 35.6895, lng: 139.6917 }, end: { lat: 1.3521, lng: 103.8198 } },
              { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: -1.2921, lng: 36.8219 } },
              { start: { lat: 38.7223, lng: -9.1393 }, end: { lat: 48.8566, lng: 2.3522 } },
              { start: { lat: 48.8566, lng: 2.3522 }, end: { lat: 55.7558, lng: 37.6173 } },
              { start: { lat: -34.6037, lng: -58.3816 }, end: { lat: -15.7975, lng: -47.8919 } },
            ]}
          />
        </div>
      </section>

      {/* 5. Live Impact (Stats Strip) */}
      <section id="stats" className="py-24 px-6 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-muted)] to-transparent opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--accent)] mb-2">
                <AnimatedNumber value={81} />%
              </div>
              <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Fleet Utilization</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">
                <AnimatedNumber value={1240} />+
              </div>
              <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Trips Dispatched</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">
                <AnimatedNumber value={18500} /> L
              </div>
              <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Fuel Tracked</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 flex items-center">
                &lt;<AnimatedNumber value={2} />m
              </div>
              <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Avg. Dispatch Time</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section id="testimonials" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            className="text-[var(--text-secondary)] text-lg"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 }}
          >
            Discover how teams are using our platform to save time, streamline workflows, and achieve better results.
          </motion.p>
        </div>
        
        <TestimonialsMarquee direction="right" speed="normal">
          {[
            { quote: "TransitOps replaced 4 different spreadsheet trackers for us. Unbelievable visibility into our daily operations. We can now see exactly where every vehicle is at any given moment, completely transforming our dispatch efficiency.", name: "Sarah J.", role: "Fleet Director" },
            { quote: "The automated maintenance workflows alone saved us $40k in preventing critical breakdowns this year. Mechanics are automatically notified, and vehicles are instantly pulled from the active roster until repairs are fully signed off.", name: "Mark T.", role: "Operations Lead" },
            { quote: "Our dispatchers absolutely love it. No more compliance headaches or second-guessing driver hours. The system automatically cross-references weight capacities and driver logs before allowing any trip to be officially dispatched.", name: "David L.", role: "Safety Officer" },
            { quote: "Incredible UI and user experience. Usually enterprise logistics software looks terrible and is hard to navigate, but this platform is an absolute joy to use every single day for our entire financial team.", name: "Elena R.", role: "Financial Analyst" },
            { quote: "I can see the exact location, fuel consumption, and operational status of all 140 trucks in just 3 clicks. It gives our executive team unparalleled confidence in our daily logistical execution and strategy.", name: "James C.", role: "CEO" },
          ].map((t, idx) => (
            <div key={idx} className="w-[500px] p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col gap-6">
              <p className="text-gray-300 flex-1 text-lg italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center font-bold text-black text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-base">{t.name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </TestimonialsMarquee>
        
        <div className="mt-8">
          <TestimonialsMarquee direction="left" speed="normal">
            {[
              { quote: "Fuel analytics completely changed how we bid on new routes. We now have exact data on per-mile costs across our entire fleet, allowing us to outbid competitors while maintaining our profit margins.", name: "Michael H.", role: "Logistics Manager" },
              { quote: "Driver compliance is now 100% automated. I sleep much better at night knowing that the system absolutely prevents any non-compliant driver from being assigned to a long-haul route.", name: "Lisa W.", role: "Safety Director" },
              { quote: "The real-time dashboard is up on the big screen in our dispatch center 24/7. It has completely eliminated the need for constant radio chatter and status update calls between dispatch and drivers.", name: "Kevin P.", role: "Lead Dispatcher" },
              { quote: "Onboarding was incredibly seamless. The drivers actually like using the mobile interface, which is a first for our company. Logging expenses and fuel receipts takes them literally seconds instead of hours.", name: "Tom B.", role: "Fleet Coordinator" },
              { quote: "We've increased our total fleet utilization by 18% in the first quarter alone. By identifying idle vehicles and optimizing our routing based on live data, our ROI has skyrocketed beyond our expectations.", name: "Anita S.", role: "VP Operations" },
            ].map((t, idx) => (
              <div key={idx} className="w-[500px] p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col gap-6">
                <p className="text-gray-300 flex-1 text-lg italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#FDBA74] flex items-center justify-center font-bold text-black text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{t.name}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </TestimonialsMarquee>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto border-t border-[var(--border-subtle)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00f2fe22_0%,transparent_50%)] pointer-events-none" />
        <motion.h2 
          className="text-4xl md:text-6xl font-bold tracking-tight mb-8 relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          Ready to modernize your operations?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <Link href="/login">
            <Button size="lg" className="h-14 px-10 text-base shadow-[0_0_24px_var(--accent-glow)] hover:shadow-[0_0_40px_var(--accent-glow)] transition-shadow">
              Sign in to Console
            </Button>
          </Link>
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
}

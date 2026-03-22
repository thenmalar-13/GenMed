import { useState, useRef, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import ComparisonCard from "@/components/ComparisonCard";
import AlternativesList from "@/components/AlternativesList";
import SavingsMeter from "@/components/SavingsMeter";
import SearchHistory from "@/components/SearchHistory";
import PrescriptionUpload from "@/components/PrescriptionUpload";
import DidYouKnow from "@/components/DidYouKnow";
import { searchMedicine, addToHistory, getSavings, type SearchResult } from "@/data/medicines";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Shield, Heart } from "lucide-react";

export default function Index() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((name: string) => {
    const res = searchMedicine(name);
    setResult(res);

    if (res) {
      const saved = getSavings(res.matched, res.cheapest);
      addToHistory({
        medicineName: res.matched.name,
        composition: res.group.composition,
        savedAmount: saved,
      });
      setHistoryKey((k) => k + 1);
    }
  }, []);

  function scrollToSearch() {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handlePrescriptionResults(names: string[]) {
    if (names.length > 0) {
      handleSearch(names[0]);
      names.slice(1).forEach((n) => {
        const r = searchMedicine(n);
        if (r) {
          addToHistory({
            medicineName: r.matched.name,
            composition: r.group.composition,
            savedAmount: getSavings(r.matched, r.cheapest),
          });
        }
      });
      setHistoryKey((k) => k + 1);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(34,120,74,0.25)]">
              <Pill className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              MediSave AI
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Verified Data
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Made for India
            </span>
          </div>
        </div>
      </nav>

      <HeroSection onStartSearch={scrollToSearch} />

      <section className="container py-12" ref={searchRef}>
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <SearchBar onSelect={handleSearch} />
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {result && (
          <motion.section
            key={result.matched.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="container pb-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ComparisonCard result={result} />
                <AlternativesList result={result} onSelect={handleSearch} />
              </div>
              <div className="space-y-6">
                <SavingsMeter key={historyKey} />
                <DidYouKnow />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <PrescriptionUpload onMedicinesFound={handlePrescriptionResults} />
          <SearchHistory refreshKey={historyKey} />
        </motion.div>
      </section>

      <footer className="border-t border-border bg-secondary/20">
        <div className="container py-10 text-center">
          <p className="text-sm text-muted-foreground">
            MediSave AI — Helping Indians find affordable medicine alternatives.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            Disclaimer: This tool is for informational purposes only. Always consult your doctor before switching medicines.
          </p>
        </div>
      </footer>
    </div>
  );
}

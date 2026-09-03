"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function PreIntro() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);
  const [doorsOpened, setDoorsOpened] = useState(false);

  useEffect(() => {
    // Check if user already saw the intro this session
    try {
      if (sessionStorage.getItem("site_intro_played") === "true") {
        setShow(false);
        return;
      }
    } catch {
      setShow(false);
      return;
    }

    // Step-by-step luxury timeline
    const t1 = setTimeout(() => setPhase(1), 250); // Logo & Glow fade in
    const t2 = setTimeout(() => setPhase(2), 650); // Gold bar expands
    const t3 = setTimeout(() => setDoorsOpened(true), 1450); // Split doors glide open
    const t4 = setTimeout(() => {
      try {
        sessionStorage.setItem("site_intro_played", "true");
      } catch {}
      setShow(false);
    }, 2150); // Finish completely

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const closeIntro = useCallback(() => {
    try {
      sessionStorage.setItem("site_intro_played", "true");
    } catch {}
    setDoorsOpened(true);
    setTimeout(() => {
      setShow(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleSkip = () => closeIntro();
    window.addEventListener("click", handleSkip);
    window.addEventListener("keydown", handleSkip);
    return () => {
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("keydown", handleSkip);
    };
  }, [show, closeIntro]);

  if (!show) return null;

  return (
    <div
      id="pre-intro-overlay"
      className={doorsOpened ? "doors-opened" : ""}
      aria-label="Introduction"
    >
      {/* Left & Right Split-Curtain Door Panels */}
      <div className="intro-door intro-door-left" />
      <div className="intro-door intro-door-right" />

      {/* Center Brand Elements */}
      <div
        className={`intro-content ${phase >= 1 ? "intro-phase-1" : ""} ${
          phase >= 2 ? "intro-phase-2" : ""
        }`}
      >
        {/* Pure SPECTRA Logo */}
        <div className="intro-logo-box">
          <Image
            src="/logo/logo.png"
            alt="SPECTRA"
            width={280}
            height={70}
            priority
            className="intro-logo-img"
          />
        </div>

        {/* Center Gold Divider Bar */}
        <div className="intro-gold-bar" />
      </div>

      {/* Skip Hint */}
      <div className="intro-skip-hint">Click to skip</div>
    </div>
  );
}

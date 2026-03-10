"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function SceneFrame() {
  return (
    <div className="scene-frame">
      <HeroScene />
      <div className="scene-overlay" />
    </div>
  );
}

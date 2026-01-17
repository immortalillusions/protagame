"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { format } from "date-fns";
import GenerateStory from "./generateStory/generateStory"; // Correct Import

// --- Mock Hook ---
function useJournal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<Record<string, string>>({});

  const dateStr = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    setContent(entries[dateStr] || "");
  }, [dateStr, entries]);

  return {
    currentDate,
    displayDate: format(currentDate, "MMMM d, yyyy"),
    content,
    setContent: (newContent: string) => {
      setContent(newContent);
      setEntries((prev) => ({ ...prev, [dateStr]: newContent }));
    },
    navigateDate: (dir: "prev" | "next") => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + (dir === "next" ? 1 : -1));
      setCurrentDate(newDate);
    },
    isGeneratingMedia: false,
    isSaving: false,
    lastSaved: new Date(),
    entry: null,
    generateMedia: () => {},
  };
}

const BOOK_COLOR = "#e8d5b7";
const PAGE_COLOR = "#faf6f0";
const SPINE_COLOR = "#d4c4a8";

// --- Helper Functions ---
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthName(month: number) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month];
}

function getDayOfWeek(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// --- Components ---

// Camera Animation
function CameraController({ isOpen, bookIsOpen }: { isOpen: boolean; bookIsOpen: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.5, 6));

  useFrame((_, delta) => {
    if (!isOpen) {
      targetPos.current.set(0, 0.5, 6);
    } else if (!bookIsOpen) {
      targetPos.current.lerp(new THREE.Vector3(0, 3, 4), delta * 2);
    } else {
      targetPos.current.lerp(new THREE.Vector3(0, 5, 2), delta * 1.5);
    }
    camera.position.lerp(targetPos.current, delta * 3);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// Page Component
function Page({
  content,
  date,
  dayOfWeek,
  isLeft,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  isEmpty = false,
}: {
  content: string;
  date: string;
  dayOfWeek: string;
  isLeft: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (text: string) => void;
  onCancel: () => void;
  isEmpty?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(content);

  useEffect(() => {
    setEditText(content);
  }, [content]);

  const xPos = isLeft ? -0.75 : 0.75;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editText);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <group
      position={[xPos, 0, 0.03]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing && !isEmpty) onStartEdit();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <boxGeometry args={[1.45, 1.95, 0.01]} />
        <meshStandardMaterial color={hovered && !isEditing && !isEmpty ? "#fffdf8" : PAGE_COLOR} roughness={0.8} />
      </mesh>

      <Text position={[0, 0.82, 0.01]} fontSize={0.1} color="#7a6548" anchorX="center">{date}</Text>
      <Text position={[0, 0.68, 0.01]} fontSize={0.05} color="#a89070" anchorX="center">{dayOfWeek}</Text>

      {!isEmpty && (
        <mesh position={[0, 0.58, 0.01]}>
          <planeGeometry args={[1.2, 0.003]} />
          <meshBasicMaterial color="#d4c4a8" />
        </mesh>
      )}

      {[...Array(9)].map((_, i) => (
        <mesh key={i} position={[0, 0.45 - i * 0.12, 0.01]}>
          <planeGeometry args={[1.3, 0.002]} />
          <meshBasicMaterial color="#e5ddd0" transparent opacity={0.4} />
        </mesh>
      ))}

      {isEditing && (
        <Html position={[0, -0.05, 0.02]} transform distanceFactor={1.5} center style={{ width: "290px", height: "390px" }}>
          <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write about your day..."
              autoFocus
              style={{
                width: "100%", height: "100%", padding: "20px",
                backgroundColor: "rgba(254, 252, 247, 0.98)",
                border: "1px solid #d4c4a8", borderRadius: "2px",
                color: "#444", fontSize: "14px", fontFamily: "Georgia, serif", lineHeight: "1.6", resize: "none", outline: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}
            />
            <p style={{ position: "absolute", bottom: "5px", width: "100%", textAlign: "center", fontSize: "10px", color: "#b8a88a" }}>
              Enter ↵ save • Esc cancel
            </p>
          </div>
        </Html>
      )}

      {!isEditing && !isEmpty && (
        <>
          <Text position={[-0.6, 0.5, 0.01]} fontSize={0.055} maxWidth={1.2} lineHeight={1.75} color="#444" anchorX="left" anchorY="top">
            {content}
          </Text>
          {hovered && !content && (
            <Text position={[0, 0, 0.02]} fontSize={0.06} color="#ccc" anchorX="center">Click to write</Text>
          )}
        </>
      )}
    </group>
  );
}

// Book Component
function Book({
  entries,
  setEntries,
  currentDay,
  daysInMonth,
  month,
  year,
  isOpen,
  onBookOpened,
  bookIsOpen,
}: any) {
  const coverRef = useRef<THREE.Group>(null);
  const [coverAngle, setCoverAngle] = useState(0);
  const [editingPage, setEditingPage] = useState<"left" | "right" | null>(null);
  const [bookTilt, setBookTilt] = useState(-0.1);

  useFrame((_, delta) => {
    if (isOpen && coverAngle < Math.PI) {
      const newAngle = Math.min(coverAngle + delta * 2, Math.PI);
      setCoverAngle(newAngle);
      if (newAngle >= Math.PI - 0.1 && coverAngle < Math.PI - 0.1) onBookOpened();
    }
    if (coverRef.current) coverRef.current.rotation.y = -coverAngle;
    const targetTilt = bookIsOpen ? -Math.PI / 2.5 : -0.1;
    setBookTilt((prev) => THREE.MathUtils.lerp(prev, targetTilt, delta * 2));
  });

  const leftDay = currentDay;
  const rightDay = currentDay + 1;
  const pagesVisible = coverAngle > 2.5;

  return (
    <group rotation={[bookTilt, 0, 0]}>
      <mesh position={[0, 0, -0.08]}><boxGeometry args={[3.1, 2.05, 0.05]} /><meshStandardMaterial color={BOOK_COLOR} /></mesh>
      <mesh position={[0, 0, -0.05]}><boxGeometry args={[0.12, 2.05, 0.08]} /><meshStandardMaterial color={SPINE_COLOR} /></mesh>
      <group ref={coverRef} position={[0.05, 0, -0.02]}>
        <mesh position={[0.75, 0, 0]}><boxGeometry args={[1.5, 2.05, 0.05]} /><meshStandardMaterial color={BOOK_COLOR} /></mesh>
        {coverAngle < 2 && (
          <>
            <Text position={[0.75, 0.2, 0.03]} fontSize={0.12} color="#7a6548" anchorX="center">{getMonthName(month)}</Text>
            <Text position={[0.75, 0, 0.03]} fontSize={0.18} color="#7a6548" anchorX="center">{year}</Text>
            <Text position={[0.75, -0.25, 0.03]} fontSize={0.05} color="#9a8568" anchorX="center">✦ Journal ✦</Text>
          </>
        )}
      </group>

      {pagesVisible && (
        <>
          {leftDay <= daysInMonth && (
            <Page
              content={entries[leftDay] || ""}
              date={`${getMonthName(month)} ${leftDay}`}
              dayOfWeek={getDayOfWeek(year, month, leftDay)}
              isLeft={true}
              isEditing={editingPage === "left"}
              onStartEdit={() => setEditingPage("left")}
              onSave={(text) => { setEntries((prev: any) => ({ ...prev, [leftDay]: text })); setEditingPage(null); }}
              onCancel={() => setEditingPage(null)}
              isEmpty={false}
            />
          )}
          {rightDay <= daysInMonth ? (
            <Page
              content={entries[rightDay] || ""}
              date={`${getMonthName(month)} ${rightDay}`}
              dayOfWeek={getDayOfWeek(year, month, rightDay)}
              isLeft={false}
              isEditing={editingPage === "right"}
              onStartEdit={() => setEditingPage("right")}
              onSave={(text) => { setEntries((prev: any) => ({ ...prev, [rightDay]: text })); setEditingPage(null); }}
              onCancel={() => setEditingPage(null)}
              isEmpty={false}
            />
          ) : (
            <Page content="" date="" dayOfWeek="" isLeft={false} isEditing={false} onStartEdit={() => {}} onSave={() => {}} onCancel={() => {}} isEmpty={true} />
          )}
          
          {/* Page Stacks */}
          {currentDay > 1 && <mesh position={[-0.75, 0, -0.01]}><boxGeometry args={[1.4, 1.9, 0.01 + 0.002 * currentDay]} /><meshStandardMaterial color="#f5f0e8" /></mesh>}
          {currentDay < daysInMonth && <mesh position={[0.75, 0, -0.01]}><boxGeometry args={[1.4, 1.9, 0.01 + 0.002 * (daysInMonth - currentDay)]} /><meshStandardMaterial color="#f5f0e8" /></mesh>}
        </>
      )}
    </group>
  );
}

// --- Main Export ---
export default function JournalBook() {
  const [isOpen, setIsOpen] = useState(false);
  const [bookIsOpen, setBookIsOpen] = useState(false);
  const { currentDate, content, setContent, navigateDate } = useJournal(); 

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const [currentDay, setCurrentDay] = useState(1);
  const [entries, setEntries] = useState<Record<number, string>>({ 1: "Start of a new month!\n\nWrite your thoughts here." });

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const canGoBack = currentDay > 1;
  const canGoForward = currentDay + 1 < daysInMonth;

  const handlePrev = () => setCurrentDay((d) => Math.max(1, d - 2));
  const handleNext = () => setCurrentDay((d) => Math.min(daysInMonth, d + 2));

  // Handler for Story Generation
  const handleStoryGenerated = (story: string) => {
    setEntries(prev => ({
      ...prev,
      [currentDay]: prev[currentDay] ? `${prev[currentDay]}\n\n${story}` : story
    }));
  };

  // Get content for the currently active/left page to pass to the generator
  const currentJournalContent = entries[currentDay] || "";

  return (
    <div className="w-full h-screen bg-gradient-to-b from-orange-50 to-amber-100 overflow-hidden select-none">
      
      {/* 1. UI Overlay (Generate Story & Nav) */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {/* Top Left: Generate Story Button */}
        <div className="pointer-events-auto">
          <GenerateStory 
            currentDate={new Date(year, month, currentDay)} 
            onStoryGenerated={handleStoryGenerated} 
            currentJournalContent={currentJournalContent} // Pass the content here
          />
        </div>

        {/* Top Center: Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
          <h1 className="text-2xl md:text-3xl font-serif text-amber-800">{getMonthName(month)} {year}</h1>
          <p className="text-sm text-amber-600 mt-1">{currentDay} — {Math.min(currentDay + 1, daysInMonth)}</p>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 pointer-events-auto">
          <button onClick={handlePrev} disabled={!canGoBack} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${canGoBack ? "bg-white hover:bg-amber-50 text-amber-600 hover:scale-110" : "bg-gray-200 text-gray-400"}`}>←</button>
          <button onClick={handleNext} disabled={!canGoForward} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${canGoForward ? "bg-white hover:bg-amber-50 text-amber-600 hover:scale-110" : "bg-gray-200 text-gray-400"}`}>→</button>
        </div>

        {/* Page Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 flex-wrap justify-center max-w-xs pointer-events-auto">
          {Array.from({ length: Math.ceil(daysInMonth / 2) }).map((_, i) => {
            const spreadStartDay = i * 2 + 1;
            const isActive = currentDay === spreadStartDay || currentDay === spreadStartDay + 1;
            return <button key={i} onClick={() => setCurrentDay(spreadStartDay)} className={`h-2 rounded-full transition-all ${isActive ? "bg-amber-500 w-4" : "bg-amber-300 hover:bg-amber-400 w-2"}`} />;
          })}
        </div>
      </div>

      {/* 2. 3D Scene */}
      <Canvas camera={{ position: [0, 0.5, 6], fov: 35 }} shadows>
        <color attach="background" args={["#fdf6e9"]} />
        <CameraController isOpen={isOpen} bookIsOpen={bookIsOpen} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 8, 5]} intensity={0.9} castShadow />
        <pointLight position={[-4, 4, 4]} intensity={0.3} color="#ffe4c4" />

        <Book
          entries={entries}
          setEntries={setEntries}
          currentDay={currentDay}
          daysInMonth={daysInMonth}
          month={month}
          year={year}
          isOpen={isOpen}
          onBookOpened={() => setBookIsOpen(true)}
          bookIsOpen={bookIsOpen}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.08} />
        </mesh>
      </Canvas>
    </div>
  );
}
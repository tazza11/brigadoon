import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Music,
  Tv,
  Sparkles,
  Info,
  Upload,
  Sliders,
  RefreshCw,
  Camera,
  Layers,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Scene } from "../types";

// Import our beautiful high-quality assets
import baekduCheonji from "../assets/images/baekdu_cheonji_1783842378918.jpg";
import defaultFerry from "../assets/images/default_ferry_1783842393264.jpg";

interface ShortsPlayerProps {
  scenes: Scene[];
  activeSceneId: number;
  onActiveSceneChange: (id: number) => void;
}

export default function ShortsPlayer({ 
  scenes, 
  activeSceneId, 
  onActiveSceneChange 
}: ShortsPlayerProps) {
  // Navigation & playback states
  const [playerMode, setPlayerMode] = useState<"sailing" | "storyboard">("sailing");
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing for an active alive feel!
  const [currentTime, setCurrentTime] = useState(0);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  
  // Custom sailing customization states
  const [userFerryImage, setUserFerryImage] = useState<string | null>(null);
  const [sailingSpeed, setSailingSpeed] = useState(5);
  const [rockingIntensity, setRockingIntensity] = useState(5);
  const [blendMode, setBlendMode] = useState<"none" | "multiply" | "darken" | "frame">("multiply");
  const [weatherFilter, setWeatherFilter] = useState<"sunny" | "misty" | "sunset" | "vintage">("sunny");
  const [selectedPresetFerry, setSelectedPresetFerry] = useState<"default" | "yacht" | "wooden" | "custom">("default");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Total duration calculation
  const totalDuration = scenes.length > 0 ? scenes[scenes.length - 1].endSecond : 60;
  
  // Determine current scene based on currentTime
  const currentScene = scenes.find(
    s => currentTime >= s.startSecond && currentTime < s.endSecond
  ) || scenes[scenes.length - 1] || null;

  // Sync activeSceneId in parent when currentTime moves (only in storyboard mode)
  useEffect(() => {
    if (playerMode === "storyboard" && currentScene && currentScene.id !== activeSceneId) {
      onActiveSceneChange(currentScene.id);
    }
  }, [currentScene, activeSceneId, onActiveSceneChange, playerMode]);

  // Sync currentTime when activeSceneId changes from outside (e.g. user selects a scene in list)
  useEffect(() => {
    if (scenes.length > 0) {
      const activeScene = scenes.find((s) => s.id === activeSceneId);
      if (activeScene) {
        if (currentTime < activeScene.startSecond || currentTime >= activeScene.endSecond) {
          setCurrentTime(activeScene.startSecond);
        }
      }
    }
  }, [activeSceneId, scenes]);

  // Handle TTS speech when scene changes
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    if (playerMode === "storyboard" && isPlaying && isTtsEnabled && currentScene) {
      const utterance = new SpeechSynthesisUtterance(currentScene.voiceoverText);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScene?.id, isPlaying, isTtsEnabled, playerMode]);

  // Handle Playback Interval for Storyboard Mode
  useEffect(() => {
    if (isPlaying && playerMode === "storyboard") {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalDuration, playerMode]);

  // Toggle Play State
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset Playback
  const resetPlayback = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Manually jump to a specific scene
  const handleSceneJump = (scene: Scene) => {
    setCurrentTime(scene.startSecond);
    onActiveSceneChange(scene.id);
    setPlayerMode("storyboard");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCurrentTime(val);
    setPlayerMode("storyboard");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Single scene manual TTS trigger
  const triggerSingleSceneTts = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.");
      return;
    }
    window.speechSynthesis.cancel();
    if (currentScene) {
      const utterance = new SpeechSynthesisUtterance(currentScene.voiceoverText);
      utterance.lang = "ko-KR";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Custom Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserFerryImage(url);
      setSelectedPresetFerry("custom");
    }
  };

  const handlePresetChange = (preset: "default" | "yacht" | "wooden" | "custom") => {
    setSelectedPresetFerry(preset);
    if (preset === "custom" && !userFerryImage) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-xl border-2 border-orange-200 w-full" id="shorts-player-container">
      
      {/* Container Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-500 animate-pulse" />
          <h3 className="font-black text-blue-900 text-sm">백두산 항해 쇼츠 스튜디오</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>실시간 렌더러</span>
        </div>
      </div>

      {/* Interactive Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 w-full mb-5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setPlayerMode("sailing")}
          className={`py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            playerMode === "sailing"
              ? "bg-white text-blue-900 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          🚢 백두산 항해 시뮬레이션
        </button>
        <button
          onClick={() => setPlayerMode("storyboard")}
          className={`py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
            playerMode === "storyboard"
              ? "bg-white text-blue-900 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          📱 대본 장면 프리뷰
        </button>
      </div>

      {/* Smartphone Outer Container */}
      <div className="relative bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800 w-[280px] sm:w-[320px] aspect-[9/16] overflow-hidden flex flex-col justify-between">
        
        {/* Smartphone Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-950 rounded-full border border-slate-900 mr-2"></div>
          <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Dynamic Video Scene Content Area */}
        <div className="absolute inset-0 z-10 w-full h-full bg-slate-900 overflow-hidden">
          {playerMode === "sailing" ? (
            /* ========================================================= */
            /* SAILING MODE: Majestic Mt. Baekdu Sailing Simulation     */
            /* ========================================================= */
            <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-4 overflow-hidden">
              
              {/* Baekdu Cheonji Background Image */}
              <div className="absolute inset-0 w-full h-full z-0">
                <img 
                  src={baekduCheonji} 
                  alt="백두산 천지" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Atmospheric Weather Overlay */}
                {weatherFilter === "misty" && (
                  <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-[0.5px] pointer-events-none" />
                )}
                {weatherFilter === "sunset" && (
                  <div className="absolute inset-0 bg-amber-500/25 mix-blend-color-burn pointer-events-none" />
                )}
                {weatherFilter === "vintage" && (
                  <div className="absolute inset-0 bg-orange-950/20 sepia-[0.35] pointer-events-none" />
                )}
              </div>

              {/* Bouncing/Drifting Clouds */}
              <motion.div 
                animate={isPlaying ? { x: [-120, 320] } : { x: 40 }}
                transition={{ repeat: Infinity, duration: 40 / (sailingSpeed * 0.5 || 1), ease: "linear" }}
                className="absolute top-16 left-0 w-24 h-8 bg-white/25 blur-[2px] rounded-full z-10"
              />
              <motion.div 
                animate={isPlaying ? { x: [320, -120] } : { x: 180 }}
                transition={{ repeat: Infinity, duration: 50 / (sailingSpeed * 0.5 || 1), ease: "linear" }}
                className="absolute top-28 left-0 w-32 h-10 bg-white/15 blur-[3px] rounded-full z-10"
              />

              {/* Flying Seagulls */}
              <div className="absolute top-24 left-1/4 z-10">
                <motion.span 
                  animate={{ y: [-4, 4, -4], x: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="text-xs inline-block text-white/80"
                >
                  🕊️
                </motion.span>
              </div>

              {/* Bouncing & Sailing Ferry */}
              <motion.div 
                animate={{ 
                  x: isPlaying ? ["-50%", "110%"] : "30%",
                  y: [
                    `${180 + (rockingIntensity * 1.5)}px`,
                    `${180 - (rockingIntensity * 1.5)}px`,
                    `${180 + (rockingIntensity * 1.5)}px`
                  ],
                  rotate: isPlaying ? [-rockingIntensity * 0.4, rockingIntensity * 0.4, -rockingIntensity * 0.4] : 0
                }}
                transition={{ 
                  x: {
                    repeat: Infinity,
                    duration: 35 - (sailingSpeed * 2.5),
                    ease: "linear"
                  },
                  y: {
                    repeat: Infinity,
                    duration: 3.5 - (rockingIntensity * 0.1),
                    ease: "easeInOut"
                  },
                  rotate: {
                    repeat: Infinity,
                    duration: 3.5 - (rockingIntensity * 0.1),
                    ease: "easeInOut"
                  }
                }}
                className="absolute left-0 z-20 w-32 h-24 flex items-center justify-center pointer-events-none"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Handle ship selection */}
                  {selectedPresetFerry === "wooden" ? (
                    <span className="text-6xl drop-shadow-lg select-none transform scale-x-[1] animate-pulse">🛶</span>
                  ) : selectedPresetFerry === "yacht" ? (
                    <span className="text-6xl drop-shadow-lg select-none transform scale-x-[1]">🛳️</span>
                  ) : (
                    <img 
                      src={selectedPresetFerry === "custom" && userFerryImage ? userFerryImage : defaultFerry} 
                      alt="Sailing Ferry"
                      className={`w-28 h-auto max-h-full object-contain transition-all duration-300 transform scale-x-[1] ${
                        blendMode === "multiply" ? "mix-blend-multiply" : 
                        blendMode === "darken" ? "mix-blend-darken" : 
                        blendMode === "frame" ? "rounded-full aspect-square border-4 border-white shadow-xl overflow-hidden bg-white/90 p-1 object-cover" : "drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Foaming Water Trail */}
                  {isPlaying && (
                    <div className="absolute -bottom-1 -left-6 right-0 h-2 flex justify-start gap-1 opacity-80">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse delay-75"></span>
                      <span className="w-2 h-1.5 rounded-full bg-white/60 animate-ping delay-150"></span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Water Ripples layer in front of ship */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-blue-900/40 to-transparent z-15 pointer-events-none">
                <motion.div 
                  animate={{ opacity: [0.3, 0.7, 0.3], y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-full h-1 bg-sky-100/40 absolute bottom-12 rounded-full"
                />
                <motion.div 
                  animate={{ opacity: [0.5, 0.2, 0.5], y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-full h-1.5 bg-sky-200/30 absolute bottom-6 rounded-full"
                />
              </div>

              {/* Dynamic Text Banner Overlay */}
              <div className="w-full text-center z-25 mt-16 px-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
                <span className="bg-slate-950/85 backdrop-blur-xs text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-black leading-relaxed inline-block">
                  🌋 2026 백두산 천지 대제전<br />
                  <span className="text-amber-400">단둥훼리 크루즈 타고 출발!</span>
                </span>
              </div>

              {/* Simulation HUD Label */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1.5 rounded-md z-25 mt-auto border border-white/5">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE SIMULATION
                </span>
                <span className="font-mono text-amber-400">속도: {sailingSpeed}x</span>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* STORYBOARD PREVIEW MODE: Scene Slider previewing content  */
            /* ========================================================= */
            <AnimatePresence mode="wait">
              {currentScene && (
                <motion.div 
                  key={currentScene.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full flex flex-col justify-between p-4"
                >
                  {/* Scene Background Artwork & Animations */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                    
                    {/* SCENE 1: Mt. Baekdu Cheonji (백두산 천지 오프닝) */}
                    {currentScene.id === 1 && (
                      <div className="w-full h-full bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 relative flex items-center justify-center">
                        <motion.div 
                          animate={{ x: [0, 20, 0] }} 
                          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                          className="absolute top-12 left-4 w-20 h-8 bg-white/30 blur-[2px] rounded-full"
                        />
                        <motion.div 
                          animate={{ x: [0, -30, 0] }} 
                          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                          className="absolute top-20 right-6 w-28 h-10 bg-white/20 blur-[1px] rounded-full"
                        />
                        <svg className="absolute bottom-16 w-full h-32 text-indigo-900/60" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <polygon points="0,100 30,20 60,70 80,40 100,100" fill="currentColor" />
                        </svg>
                        <div className="absolute bottom-0 w-full h-12 bg-blue-900/90">
                          <div className="w-full h-2 bg-sky-300/30 animate-pulse"></div>
                        </div>
                        <div className="absolute bottom-10 left-0 right-0 h-8 flex justify-around px-4 z-10">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ rotate: [-5, 5, -5] }}
                              transition={{ repeat: Infinity, duration: 2 + i * 0.5, ease: "easeInOut" }}
                              className="origin-bottom"
                            >
                              🌸
                            </motion.div>
                          ))}
                        </div>
                        <motion.div 
                          animate={{ y: [-5, 5, -5] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="text-center text-white px-2 z-10 drop-shadow-lg"
                        >
                          <div className="inline-block bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full mb-1">
                            2026 SEASON OPEN
                          </div>
                          <h4 className="font-extrabold text-2xl tracking-tight leading-tight">백두산 천지</h4>
                          <p className="text-[10px] text-sky-100 font-medium">서울 국제연합 여행사 51주년</p>
                        </motion.div>
                      </div>
                    )}

                    {/* SCENE 2: Dandong Ferry (단둥훼리 크루즈) */}
                    {currentScene.id === 2 && (
                      <div className="w-full h-full bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 relative flex flex-col justify-between">
                        <div className="absolute top-12 left-6 w-8 h-8 rounded-full bg-amber-400 blur-[4px]"></div>
                        <motion.div 
                          animate={{ x: [-10, 10, -10] }} 
                          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                          className="absolute top-16 right-10 w-16 h-6 bg-white/40 blur-[1px] rounded-full"
                        />
                        <div className="absolute top-24 left-1/4">
                          <motion.span 
                            animate={{ y: [-4, 4, -4], x: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="text-xs inline-block text-white"
                          >
                            🕊️
                          </motion.span>
                        </div>
                        <div className="absolute bottom-0 w-full h-36 bg-blue-600/60 overflow-hidden">
                          <div className="absolute bottom-0 w-full h-24 bg-blue-700/80"></div>
                          <motion.div 
                            animate={{ x: [-100, 0, -100] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute bottom-16 left-0 w-[200%] h-8 bg-blue-500/40 rounded-full"
                          />
                          <motion.div 
                            animate={{ x: [0, -120, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                            className="absolute bottom-8 left-0 w-[200%] h-10 bg-sky-400/20 rounded-full"
                          />
                          <motion.div 
                            animate={{ 
                              x: [-40, 40, -40], 
                              y: [-2, 2, -2],
                              rotate: [-1, 1, -1] 
                            }}
                            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
                          >
                            <div className="relative text-5xl">🚢</div>
                          </motion.div>
                        </div>
                        <div className="mt-16 text-center z-10">
                          <span className="bg-blue-900/80 text-sky-200 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-sky-500/20">
                            단둥훼리 DELUXE 선실 탑승
                          </span>
                        </div>
                      </div>
                    )}

                    {/* SCENE 3: Professor lecture (정규훈 교수 인문학 동행) */}
                    {currentScene.id === 3 && (
                      <div className="w-full h-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 relative flex flex-col justify-center items-center p-4">
                        <div className="w-28 h-28 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center relative mb-4">
                          <motion.div 
                            animate={{ scale: [0.95, 1.05, 0.95] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-5xl text-amber-400"
                          >
                            🎓
                          </motion.div>
                          <div className="absolute -bottom-1 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow">
                            정규훈 교수 동행
                          </div>
                        </div>
                        <div className="text-center z-10 px-4">
                          <h4 className="text-amber-300 font-extrabold text-sm tracking-wide">역사 인문학 동행 탐방</h4>
                          <p className="text-slate-300 text-[10px] mt-1.5 leading-relaxed">
                            전문 박사님의 깊이 있는 해설과<br/>
                            특별한 가슴 속 역사 지식 특강
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SCENE 4: Itinerary (장백폭포 / 신의주) */}
                    {currentScene.id === 4 && (
                      <div className="w-full h-full bg-gradient-to-b from-teal-800 via-teal-900 to-slate-900 relative flex flex-col justify-between">
                        <div className="absolute inset-0 w-full h-full z-0 opacity-40 flex flex-col justify-between">
                          <div className="h-1/2 w-full bg-slate-800 relative overflow-hidden border-b border-white/10">
                            {[1, 2, 3].map((i) => (
                              <motion.div 
                                key={i}
                                animate={{ y: [-100, 100] }}
                                transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, ease: "linear" }}
                                className="absolute top-0 w-1 bg-gradient-to-b from-transparent via-white to-sky-200 h-24"
                                style={{ left: `${30 + i * 15}%` }}
                              />
                            ))}
                            <div className="absolute bottom-2 left-4 text-[10px] text-white bg-slate-900/60 px-1.5 py-0.5 rounded">장백폭포</div>
                          </div>
                          <div className="h-1/2 w-full bg-teal-950 relative overflow-hidden">
                            <motion.div 
                              animate={{ x: [-20, 20, -20] }}
                              transition={{ repeat: Infinity, duration: 12 }}
                              className="absolute bottom-6 left-1/4 text-2xl"
                            >
                              🛶
                            </motion.div>
                            <div className="absolute top-2 right-4 text-[10px] text-white bg-slate-900/60 px-1.5 py-0.5 rounded">압록강 유람선</div>
                          </div>
                        </div>
                        <div className="my-auto text-center px-4 z-10 flex flex-col items-center">
                          <div className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-3 py-1 rounded-full mb-2 font-bold">
                            북코스 + 남코스 올인원
                          </div>
                          <h4 className="text-white font-extrabold text-base leading-tight">천지 완벽 정복 코스</h4>
                          <p className="text-teal-200 text-[9px] mt-1">신의주/위화도 조망 & 장백폭포 & 압록강 발원지</p>
                        </div>
                      </div>
                    )}

                    {/* SCENE 5: Gold Anniversary Promo (서울 국제연합 여행사 51주년) */}
                    {currentScene.id === 5 && (
                      <div className="w-full h-full bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 relative flex flex-col justify-center items-center p-4">
                        <motion.div 
                          animate={{ rotateY: [0, 360] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white/30 mb-3"
                        >
                          <span className="text-white font-black text-[9px]">SEOUL INT.</span>
                          <span className="text-slate-950 font-black text-xl tracking-tighter">51주년</span>
                        </motion.div>
                        <div className="text-center z-10 px-2">
                          <div className="inline-block bg-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded mb-1 animate-bounce">
                            마감 임박 초특가
                          </div>
                          <h4 className="text-white font-black text-lg tracking-tight">6일간 89만원!</h4>
                          <p className="text-amber-400 font-bold text-xs mt-1">8월 12일 특별 출발</p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Subtitle / Overlay Text layer */}
                  <div className="w-full text-center z-10 mt-12 px-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]">
                    <span className="bg-slate-950/80 backdrop-blur-xs text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold leading-relaxed inline-block">
                      {currentScene.overlayText.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <br />}
                          {line}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>

                  {/* Duration marker bottom label */}
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 rounded-md z-15 mt-auto">
                    <span className="font-mono">장면 {currentScene.id} / {scenes.length}</span>
                    <span className="font-mono text-amber-400">{currentScene.startSecond}초 ~ {currentScene.endSecond}초</span>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Status bar (Top clock overlay) */}
        <div className="absolute top-5 left-0 right-0 px-6 flex justify-between items-center text-[10px] text-white font-medium z-20">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-white rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* YouTube Shorts Bottom Floating Bar (Title / Booking Prompt) */}
        <div className="absolute bottom-12 left-0 right-0 px-4 pb-2 z-20 pointer-events-none">
          <div className="bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 pt-6 rounded-b-xl flex flex-col gap-1.5">
            
            <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed">
              {playerMode === "sailing" 
                ? "🚢 내가 업로드한 페리가 웅장한 백두산 천지를 항해 중! #백두산여행 #크루즈여행 #서울국제연합여행사 #단둥훼리"
                : "🌋 51주년 특별 백두산 대제전 6일간 89만원! #백두산여행 #특가여행 #서울국제연합여행사"
              }
            </p>

            <div className="flex items-center gap-1.5 text-[9px] text-slate-300">
              <Music className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="truncate">
                {playerMode === "sailing" ? "추천 BGM: 백두산 천지 대제전 오케스트라" : `추천 BGM: ${currentScene?.bgmRecommendation || "cinematic_epic"}`}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Floating Sidebar (Shorts-like feedback) */}
        <div className="absolute right-2 top-1/3 flex flex-col items-center gap-3.5 z-25">
          <div className="flex flex-col items-center">
            <button className="w-8 h-8 rounded-full bg-slate-950/60 border border-white/10 flex items-center justify-center text-white text-xs hover:bg-slate-900 transition">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </button>
            <span className="text-[9px] text-white font-semibold mt-0.5">5.1K</span>
          </div>
          <div className="flex flex-col items-center">
            <button className="w-8 h-8 rounded-full bg-slate-950/60 border border-white/10 flex items-center justify-center text-white text-xs hover:bg-slate-900 transition">
              <MessageCircle className="w-4 h-4 text-white" />
            </button>
            <span className="text-[9px] text-white font-semibold mt-0.5">89</span>
          </div>
          <div className="flex flex-col items-center">
            <button className="w-8 h-8 rounded-full bg-slate-950/60 border border-white/10 flex items-center justify-center text-white text-xs hover:bg-slate-900 transition">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <span className="text-[9px] text-white font-semibold mt-0.5">공유</span>
          </div>
        </div>

      </div>

      {/* Playback Controls Panel */}
      <div className="w-full mt-6 space-y-4">
        
        {/* Timeline Slider (Only shown/enabled in Storyboard Mode) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span className="font-extrabold text-blue-900">
              {playerMode === "sailing" ? "항해 애니메이션 상태" : "현재 대본 재생 지점"}
            </span>
            <span className="font-mono text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full font-bold border border-orange-200/50">
              {playerMode === "sailing" ? "실시간 반복 루프" : `${currentTime}초 / ${totalDuration}초`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max={totalDuration} 
              value={playerMode === "sailing" ? totalDuration / 2 : currentTime}
              onChange={handleTimelineChange}
              disabled={playerMode === "sailing"}
              className={`w-full h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                playerMode === "sailing" ? "opacity-40 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button 
            onClick={togglePlay}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full font-bold text-xs transition shadow-sm cursor-pointer ${
              isPlaying 
                ? "bg-orange-500 hover:bg-orange-600 text-white" 
                : "bg-blue-900 hover:bg-blue-950 text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                일시정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                자동 재생
              </>
            )}
          </button>

          <button 
            onClick={resetPlayback}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs transition cursor-pointer border border-orange-200"
          >
            <RotateCcw className="w-4 h-4" />
            처음부터
          </button>

          {/* TTS Toggle Button */}
          <button 
            onClick={() => {
              if (playerMode === "sailing") {
                setPlayerMode("storyboard");
              }
              setIsTtsEnabled(!isTtsEnabled);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full font-bold text-xs transition shadow-sm cursor-pointer ${
              isTtsEnabled 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-orange-50/50 hover:bg-orange-100/50 text-orange-800 border border-orange-200/60"
            }`}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            TTS 나레이션: {isTtsEnabled ? "ON" : "OFF"}
          </button>

          <button 
            onClick={() => {
              if (playerMode === "sailing") {
                setPlayerMode("storyboard");
              }
              triggerSingleSceneTts();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs transition cursor-pointer border border-blue-200"
            title="현재 활성화된 대본 장면의 나레이션 음성을 수동으로 한 번 읽습니다."
          >
            <Volume2 className="w-4 h-4" />
            대본 한줄 읽기
          </button>

        </div>

        {/* Custom Sailing Dashboard (Shown only in Sailing Mode) */}
        {playerMode === "sailing" && (
          <div className="pt-4 border-t border-orange-100 space-y-4 animate-fadeIn" id="sailing-customizer">
            <div className="flex items-center gap-1.5 text-xs text-orange-800 font-extrabold bg-orange-50 py-1.5 px-3 rounded-xl border border-orange-200/40">
              <Sliders className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>백두산 천지 항해 커스터마이저</span>
            </div>

            {/* Step 1: Ship Selection Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                1단계: 화면에 띄울 페리/선박 이미지 종류 선택
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handlePresetChange("default")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedPresetFerry === "default"
                      ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="text-xl">🚢</span>
                  <span className="text-[9px]">기본 단둥훼리</span>
                </button>
                <button
                  onClick={() => handlePresetChange("yacht")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedPresetFerry === "yacht"
                      ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="text-xl">🛳️</span>
                  <span className="text-[9px]">화이트요트</span>
                </button>
                <button
                  onClick={() => handlePresetChange("wooden")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedPresetFerry === "wooden"
                      ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="text-xl">🛶</span>
                  <span className="text-[9px]">압록강 목선</span>
                </button>
                
                {/* Custom Image Upload Block */}
                <button
                  onClick={() => handlePresetChange("custom")}
                  className={`p-2 rounded-xl text-xs font-bold border-2 transition text-center flex flex-col items-center justify-center gap-1 relative overflow-hidden cursor-pointer ${
                    selectedPresetFerry === "custom"
                      ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs"
                      : "border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-500"
                  }`}
                >
                  {userFerryImage ? (
                    <img 
                      src={userFerryImage} 
                      alt="Uploaded" 
                      className="w-7 h-7 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-[9px] font-black">
                    {userFerryImage ? "내가올린 페리" : "직접 업로드"}
                  </span>
                </button>
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
                  <span>항해 주행 속도</span>
                  <span className="text-orange-600 font-extrabold">{sailingSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={sailingSpeed}
                  onChange={(e) => setSailingSpeed(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
                  <span>물결 요동 흔들림</span>
                  <span className="text-orange-600 font-extrabold">{rockingIntensity}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={rockingIntensity}
                  onChange={(e) => setRockingIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  이미지 배경 투명화 (FX)
                </span>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700 font-bold"
                >
                  <option value="multiply">🪄 Multiply (흰색 배경 자동투명화)</option>
                  <option value="darken">🌓 Darken (어두운 영역 합성)</option>
                  <option value="frame">🖼️ Circle Frame (동그란 액자 프레임)</option>
                  <option value="none">👤 Original (이미지 원본 그대로)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  백두산 날씨 무드 필터
                </span>
                <select
                  value={weatherFilter}
                  onChange={(e) => setWeatherFilter(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700 font-bold"
                >
                  <option value="sunny">☀️ 맑고 화창한 봄여름 천지</option>
                  <option value="misty">🌫️ 아련하고 신비로운 안개 필터</option>
                  <option value="sunset">🌇 골든 선셋 (황금빛 저녁 노을)</option>
                  <option value="vintage">📺 레트로 빈티지 클래식 무드</option>
                </select>
              </div>
            </div>

            {/* Smart info & Action triggers */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
              <p className="text-[10px] text-slate-500 leading-normal">
                💡 <strong className="text-orange-700">합성 꿀팁:</strong> 직접 찍은 선박이나 크루즈 사진을 업로드하신 경우, 흰색 배경이라면 <strong>'Multiply'</strong> 합성법을 통해 배경을 감쪽같이 투명하게 제거할 수 있습니다!
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert("🎬 백두산 천지 항해 쇼츠 비디오 렌더링을 가상 시작합니다!\n\n- 영상 비율: 9:16 Shorts 전용\n- 적용된 배경: 백두산 천지 수채화 일러스트\n- 적용된 선박: " + (selectedPresetFerry === "custom" ? "내가 직접 올린 이미지 페리" : "고품격 단둥훼리 기본 템플릿") + "\n- 음향 효과: 천지 호수 물결음 & 백두산 성가 오케스트라\n\n완성 시 실시간으로 비디오 파일 저장이 진행됩니다!");
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 animate-pulse" />
                  Full HD 동영상 비디오 추출하기
                </button>
                <button
                  onClick={() => {
                    setUserFerryImage(null);
                    setSelectedPresetFerry("default");
                    setSailingSpeed(5);
                    setRockingIntensity(5);
                    setBlendMode("multiply");
                    setWeatherFilter("sunny");
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  title="옵션 초기화"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Storyboard Navigation list (Shown only in Storyboard Mode) */}
        {playerMode === "storyboard" && (
          <div className="pt-2 border-t border-orange-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-blue-950">클릭하여 해당 시나리오 장면으로 즉시 이동:</span>
              <span className="font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-[11px] font-extrabold">총 {scenes.length}개 장면</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneJump(scene)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                    activeSceneId === scene.id
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-white hover:bg-orange-50 text-slate-700 border border-orange-200"
                  }`}
                >
                  장면 {scene.id} ({scene.startSecond}초)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TTS Info Disclaimer */}
        <div className="bg-orange-50/40 border-2 border-orange-200/60 p-3 rounded-2xl flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p>
            <span className="font-black text-orange-700">나레이션 안내 (TTS):</span> 'TTS 나레이션'을 켜시면 동영상 재생 흐름에 맞춰 실제 유튜브 쇼츠 전문 음성처럼 한글 나레이션을 컴퓨터가 실시간으로 소리 내어 읽어 줍니다.
          </p>
        </div>

      </div>

    </div>
  );
}

import React from "react";
import { Scene } from "../types";
import { 
  FileText, 
  Sparkles, 
  Music, 
  Video, 
  Volume2, 
  Copy, 
  Check, 
  Edit3 
} from "lucide-react";

interface StoryboardListProps {
  scenes: Scene[];
  activeSceneId: number;
  onActiveSceneChange: (id: number) => void;
  onSceneUpdate: (updatedScene: Scene) => void;
}

export default function StoryboardList({
  scenes,
  activeSceneId,
  onActiveSceneChange,
  onSceneUpdate,
}: StoryboardListProps) {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const handleCopyText = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedText = `[장면 ${scene.id} - ${scene.startSecond}초~${scene.endSecond}초]\n■ 오버레이 자막:\n${scene.overlayText}\n\n■ 나레이션 대본:\n${scene.voiceoverText}\n\n■ 추천 BGM: ${scene.bgmRecommendation}`;
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopiedId(scene.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const speakVoiceover = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.");
    }
  };

  const handleTextChange = (id: number, field: keyof Scene, value: string) => {
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      onSceneUpdate({
        ...scene,
        [field]: value
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-orange-200 space-y-4" id="storyboard-list-container">
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-orange-100 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <h3 className="font-black text-blue-900 text-sm">유튜브 쇼츠 타임라인별 대본 시트</h3>
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full border border-orange-200">
          총 {scenes.length}개 씬 편집기
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        각 장면의 대본과 자막을 직접 수정할 수 있으며, 수정된 텍스트는 즉시 가상 스마트폰 화면 및 나레이션 음성(TTS)에 실시간으로 반영됩니다.
      </p>

      {/* Vertical Scenes List */}
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <div
              key={scene.id}
              onClick={() => onActiveSceneChange(scene.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative ${
                isActive
                  ? "border-orange-500 bg-orange-50/30 shadow-sm ring-1 ring-orange-400/20"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
              }`}
            >
              {/* Badge & Timing info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive 
                      ? "bg-orange-500 text-white" 
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {scene.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {scene.startSecond}초 ~ {scene.endSecond}초 ({scene.endSecond - scene.startSecond}초간)
                  </span>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => speakVoiceover(scene.voiceoverText, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition"
                    title="이 장면 나레이션 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleCopyText(scene, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition"
                    title="대본 복사"
                  >
                    {copiedId === scene.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Visual directions (Read-only reference) */}
              <div className="mb-3 bg-orange-50/20 p-2.5 rounded-xl border border-orange-100/60 text-[11px] text-slate-600 flex gap-1.5 leading-relaxed">
                <Video className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700">화면 연출 지시: </span>
                  {scene.visualDescription}
                </div>
              </div>

              {/* Editable Overlay subtitle */}
              <div className="space-y-1.5 mb-3">
                <label className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Edit3 className="w-3 h-3 text-orange-500" />
                  화면 자막 문구 (줄바꿈 가능)
                </label>
                <textarea
                  value={scene.overlayText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleTextChange(scene.id, "overlayText", e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-orange-200/60 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden font-medium text-slate-800 resize-none h-14 leading-normal"
                  placeholder="화면에 띄울 자막 문구를 입력하세요."
                />
              </div>

              {/* Editable Voiceover script */}
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Volume2 className="w-3 h-3 text-orange-500" />
                  나레이션 대본 (TTS 낭독용)
                </label>
                <textarea
                  value={scene.voiceoverText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleTextChange(scene.id, "voiceoverText", e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-orange-200/60 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden text-slate-700 leading-normal"
                  placeholder="성우 또는 TTS가 낭독할 나레이션을 입력하세요."
                  rows={2}
                />
              </div>

              {/* BGM Info (Read-only badge) */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Music className="w-3 h-3 text-amber-500" />
                <span>추천 음원: {scene.bgmRecommendation}</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

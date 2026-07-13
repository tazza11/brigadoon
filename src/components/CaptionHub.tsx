import React, { useState } from "react";
import { 
  Instagram, 
  Copy, 
  Check, 
  Bookmark, 
  Smartphone, 
  Hash, 
  MapPin, 
  Calendar, 
  Plus, 
  Edit3 
} from "lucide-react";

interface CaptionHubProps {
  caption: string;
  onCaptionUpdate: (caption: string) => void;
}

export default function CaptionHub({ caption, onCaptionUpdate }: CaptionHubProps) {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("02-1234-5678");
  const [kakaoId, setKakaoId] = useState("seoul_travel");

  const handleCopy = () => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInsertContact = () => {
    // Check if placeholder like "📞 [예약 및 문의]" or similar is inside the text, or append it
    const contactInfo = `\n━━━━━━━━━━━━━━━━━━━━━\n📞 [서울국제연합여행사 실시간 빠른 예약 문의]\n☎ 대표전화: ${phoneNumber}\n💬 카카오톡 ID: ${kakaoId}\n※ 51주년 한정 선착순 마감되므로 조기 종료될 수 있습니다.`;
    onCaptionUpdate(caption + contactInfo);
  };

  const handleInsertCustomHashtags = () => {
    const customTags = ` #서울국제연합여행사_51주년 #정규훈교수_백두산특강 #크루즈백두산여행 #백두산완벽투어`;
    onCaptionUpdate(caption + customTags);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-orange-200 space-y-4" id="caption-hub-container">
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-orange-100 pb-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-orange-500" />
          <h3 className="font-black text-blue-900 text-sm">쇼츠 업로드용 본문/안내 카피</h3>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
            copied 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "복사 완료!" : "본문 복사하기"}
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        유튜브 동영상을 업로드할 때 설명(Description) 란이나 첫 번째 고정 댓글에 등록하기 최적화된 화려하고 정돈된 홍보글입니다. 복사 전, 연락처 등의 세부 사항을 편집하거나 빠른 템플릿 주입기로 정보를 추가해 보세요!
      </p>

      {/* Caption Text Area Editor */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-orange-500" />
            안내 텍스트 에디터
          </label>
          <span className="text-[10px] font-mono text-slate-400 bg-orange-50/50 px-1.5 py-0.5 rounded">
            글자 수: {caption.length.toLocaleString()}자
          </span>
        </div>
        <textarea
          value={caption}
          onChange={(e) => onCaptionUpdate(e.target.value)}
          className="w-full text-xs p-4 bg-orange-50/10 border border-orange-200/60 rounded-2xl text-slate-700 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-hidden font-sans leading-relaxed h-[380px]"
          placeholder="여기에 업로드 포스트 설명 본문이 나타납니다."
        />
      </div>

      {/* Quick Insert Actions */}
      <div className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100 space-y-3.5">
        <span className="text-[11px] font-black text-blue-900 block">⚡ 초간편 본문 내용 삽입 도구</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">예약 대표 번호</label>
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-orange-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-orange-400"
              placeholder="전화번호 입력"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">예약 상담 카카오ID</label>
            <input 
              type="text" 
              value={kakaoId}
              onChange={(e) => setKakaoId(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-orange-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-orange-400"
              placeholder="카카오 ID 입력"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleInsertContact}
            className="flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            예약 번호 및 연락처 주입하기
          </button>
          
          <button
            onClick={handleInsertCustomHashtags}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            <Hash className="w-3.5 h-3.5 text-blue-500" />
            51주년 맞춤 해시태그 주입
          </button>
        </div>
      </div>

    </div>
  );
}

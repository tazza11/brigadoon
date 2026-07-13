import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Award, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowRight, 
  AlertCircle,
  TrendingUp,
  Flame,
  CheckCircle2,
  BookOpen,
  Anchor,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShortsCampaign, ThemeType } from "./types";
import ShortsPlayer from "./components/ShortsPlayer";
import StoryboardList from "./components/StoryboardList";
import CaptionHub from "./components/CaptionHub";

// High-fidelity local database representing the defaults for each theme
const LOCAL_DEFAULTS: Record<ThemeType, ShortsCampaign> = {
  standard: {
    title: "백두산 51주년 특별 이벤트 - 한번의 여행이 평생의 추억이 됩니다",
    scenes: [
      {
        id: 1,
        startSecond: 0,
        endSecond: 10,
        visualDescription: "웅장하게 빛나는 푸른 백두산 천지 비경 and 들꽃이 바람에 흩날리는 전경. 화면 중앙에 '2026 백두산 시즌 오픈!' 문구가 부드러운 애니메이션과 함께 등장.",
        overlayText: "2026년 백두산\n시즌 드디어 오픈!",
        voiceoverText: "기다리고 기다리던 백두산의 계절이 돌아왔습니다! 2026년 백두산 시즌 정식 오픈!",
        bgmRecommendation: "웅장하고 가슴이 웅장해지는 오케스트라 사운드"
      },
      {
        id: 2,
        startSecond: 10,
        endSecond: 20,
        visualDescription: "드넓은 푸른 바다를 항해하는 거대한 단둥훼리 크루즈 선박의 드론 샷. 선실 복도 및 안락한 DELUXE 창측 객실 내부 전경이 연이어 노출됨.",
        overlayText: "단둥훼리 크루즈 타고\n더 저렴하고 더 편안하게",
        voiceoverText: "거대한 크루즈, 단둥훼리를 타고 아늑한 DELUXE 창측 객실에서 바다를 품으며 더 편안하게 떠나보세요.",
        bgmRecommendation: "설렘을 유도하는 잔잔한 어쿠스틱 여행 테마곡"
      },
      {
        id: 3,
        startSecond: 20,
        endSecond: 32,
        visualDescription: "정규훈 교수의 세련된 초상 일러스트와 서재 배경이 겹쳐지며, 신뢰감을 주는 서체로 '역사 인문학 동행 탐방' 배너가 스크린 하단에 나타남.",
        overlayText: "정규훈 교수와 함께하는\n깊이 있는 명품 해설",
        voiceoverText: "단순한 관광이 아닙니다! 인문학의 대가 정규훈 교수님이 동행하여 깊이 있는 역사 해설과 특별한 감동을 선물합니다.",
        bgmRecommendation: "차분하면서 지적인 분위기의 피아노 뉴에이지"
      },
      {
        id: 4,
        startSecond: 32,
        endSecond: 45,
        visualDescription: "압록강 유람선에서 북한 신의주와 위화도가 보이는 이색 비경. 이어 백두산 북코스의 천지와 장백폭포, 남코스의 천지와 압록강 발원지가 역동적인 영상미로 전환.",
        overlayText: "압록강 유람선부터\n북코스·남코스 천지 정복!",
        voiceoverText: "압록강 유람선에서 보는 신의주 조망, 그리고 백두산 북쪽 코스의 장백폭포와 남쪽 코스의 압록강 발원지 천지까지 모두 완벽하게 정복합니다!",
        bgmRecommendation: "모험을 떠나는 듯 벅차오르는 하이라이트 사운드"
      },
      {
        id: 5,
        startSecond: 45,
        endSecond: 60,
        visualDescription: "서울 국제연합 여행사 51주년 기념 골드 엠블럼 등장. '출발 8월 12일 / 6일간 89만원'이 선명한 파란색 카드 위에 크게 부각되며 예약 안내 자막 노출.",
        overlayText: "51주년 특별 할인!\n6일간 단 89만 원!",
        voiceoverText: "서울 국제연합 여행사 51주년 기념 파격 특가 89만 원! 8월 12일 출발! 지금 예약하고 평생의 추억을 간직하세요.",
        bgmRecommendation: "신뢰감을 주며 산뜻하게 마무리하는 로고 엔딩곡"
      }
    ],
    caption: `🌋 2026 백두산 시즌 오픈! 서울 국제연합 여행사 51주년 특별 이벤트 🌋\n\n"한 번의 여행이 평생의 추억이 됩니다" ✨\n51년간 신뢰를 지켜온 역사/성지순례 전문 '서울 국제연합 여행사'가 특별한 백두산 탐방을 제안합니다.\n\n인문학의 거장 🎓정규훈 교수🎓의 명품 해설과 함께,\n단둥훼리 크루즈를 타고 백두산 북코스/남코스를 모두 완벽하게 정복하는 고품격 힐링 역사 탐방에 여러분을 초대합니다.\n\n━━━━━━━━━━━━━━━━━━━━━\n\n🔴 [백두산 특별 할인 행사 안내]\n• 기간: 6일간의 알찬 특별 여정\n• 파격 가격: 890,000원 (최저가 실현!)\n• 출발일: 2026년 8월 12일\n\n🏢 [프리미엄 숙식 구성]\n• 선실: DELUXE 창측 (쾌적하고 프라이빗한 4인 1실)\n• 숙박: 준 5성급 최고급 특급 호텔 숙식\n\n🗺️ [감동 가득 핵심 답사 코스]\n1️⃣ 단둥 & 압록강 유람선 (위화도, 신의주 실시간 조망)\n2️⃣ 백두산 북쪽 코스 (민족의 영산 천지, 시원하게 쏟아지는 장백폭포)\n3️⃣ 백두산 남쪽 코스 (압록강 발원지 비경 및 남쪽에서 바라보는 신비로운 천지)\n\n━━━━━━━━━━━━━━━━━━━━━\n\n💡 왜 서울 국제연합 여행사일까요?\n- 51년간 오직 고객과의 약속을 한결같이 지켜온 믿음의 역사!\n- 허위 광고보다 고객들의 진정성 있는 소개와 재방문으로 탄탄히 성장했습니다.\n- 전문 박사님들의 깊이 있는 유적 설명으로 단순한 구경을 넘어 가슴 속 깊은 감동을 선물합니다.\n- 다음 세대까지 신뢰하며 맡길 수 있는 정직한 여행사입니다.\n\n📞 [예약 및 참가 신청]\n• 지금 바로 서울 국제연합 여행사로 연락 주셔서 한정된 기회를 선점하세요!\n• 가장 소중한 가족, 친구, 연인과 함께 평생 잊지 못할 푸른 천지의 대자연을 경험하시기 바랍니다.\n\n#백두산 #백두산여행 #정규훈교수 #단둥훼리 #천지 #장백폭포 #서울 국제연합 여행사 #압록강 #크루즈여행 #유튜브쇼츠 #해외여행추천 #8월여행 #역사탐방`
  },
  historical: {
    title: "정규훈 교수님과 떠나는 백두산 역사 인문학 특강 Shorts",
    scenes: [
      {
        id: 1,
        startSecond: 0,
        endSecond: 12,
        visualDescription: "고대 고구려 유적지와 웅장한 백두산의 기상을 보여주는 먹선 연출 스타일의 영상. 정규훈 교수가 밝은 모습으로 강의하는 사진이 고풍스럽게 흐릿해지며 등장.",
        overlayText: "단순한 여행이 아니다!\n백두산 역사 인문학 탐방",
        voiceoverText: "그냥 눈으로만 보던 백두산은 잊으세요! 역사와 철학이 숨 쉬는 백두산 인문학 대탐험이 열립니다.",
        bgmRecommendation: "엄숙하면서도 가슴 벅찬 역사 다큐멘터리풍 인트로"
      },
      {
        id: 2,
        startSecond: 12,
        endSecond: 25,
        visualDescription: "정규훈 교수의 명칭과 약력이 나오면서 인자한 미소로 설명하는 일러스트. 한손에는 역사책을 든 그래픽 효과.",
        overlayText: "전문 박사님의 해설\n정규훈 교수와 동행!",
        voiceoverText: "철학박사이자 인문학 거장, 정규훈 교수님의 몰입감 넘치는 설명과 깊이 있는 역사 특강이 전 일정 펼쳐집니다.",
        bgmRecommendation: "차분하고 진정성 있는 클래식 뉴에이지 피아노"
      },
      {
        id: 3,
        startSecond: 25,
        endSecond: 38,
        visualDescription: "압록강 배 위에서 바로 눈앞에 보이는 신의주와 위화도의 장막 비경. 백두산 남코스의 신비로운 압록강 발원지가 지도 동선과 함께 비춰짐.",
        overlayText: "압록강 너머 신의주 조망\n그리고 압록강 발원지 천지까지",
        voiceoverText: "압록강 유람선에서 바라보는 생생한 신의주와 위화도, 그리고 남코스 천지에서 이어지는 압록강의 진짜 시원을 직접 눈으로 감상하세요.",
        bgmRecommendation: "민족의 기상을 닮은 한국 전통 퓨전 악기 사운드"
      },
      {
        id: 4,
        startSecond: 38,
        endSecond: 48,
        visualDescription: "백두산 북코스 천지와 장백폭포가 시원하고 정밀하게 흘러넘치는 초고화질 전경.",
        overlayText: "백두산 북코스와 장백폭포\n한반도의 웅장함을 마주하다",
        voiceoverText: "웅장한 백두산 북코스의 장백폭포를 거쳐 푸르고 고결한 천지 비경을 보며 가슴속 깊은 울림을 느껴보세요.",
        bgmRecommendation: "고조되는 관현악 오케스트라 사운드"
      },
      {
        id: 5,
        startSecond: 48,
        endSecond: 60,
        visualDescription: "서울 국제연합 여행사 51주년 로고와 함께 '8월 12일 출발 / 6일간 89만원'이 강조되고 하단에 가족 및 중장년층이 행복하게 가방을 매고 걷는 실루엣.",
        overlayText: "51주년 역사 전문 여행사\n89만 원 초특가 한정 예약!",
        voiceoverText: "역사 탐방과 성지 순례 전문 51주년의 신뢰, 서울 국제연합 여행사에서 준비한 특별 89만 원 행사! 8월 12일 출발, 평생의 추억을 선물합니다.",
        bgmRecommendation: "밝고 희망에 찬 오케스트라 피날레"
      }
    ],
    caption: `🎓 역사와 인문학으로 마주하는 감동의 백두산 대탐방 🎓\n\n"배움이 있는 여행은 평생의 나침반이 됩니다." ✨\n51년 동안 역사 탐방과 성지 순례를 전문으로 하여 특별한 감동을 전해 온 '서울 국제연합 여행사'의 고품격 한정 특별 이벤트!\n\n학계의 대가이신 철학박사 🎓정규훈 교수님🎓이 전 일정 동행하여 역사 속 숨겨진 이야기와 가슴을 울리는 교양 강의를 들려드립니다.\n\n━━━━━━━━━━━━━━━━━━━━━\n\n🔴 [정규훈 교수 동행 백두산 인문학 탐방]\n• 기간: 6일간의 깊이 있는 지적 여정\n• 파격 특가: 890,000원\n• 출발일: 2026년 8월 12일\n\n🏢 [안락한 최고급 서비스 제공]\n• 선상 선실: DELUXE 창측 (4인 1실로 바다 풍경을 감상하며 낭만 충전)\n• 현지 숙소: 준 5성급 최고의 시설을 자랑하는 준특급 호텔\n\n🗺️ [명품 인문학 답사 여정]\n1️⃣ 압록강 유람선 답사: 위화도 회군과 신의주를 조망하며 걷는 역사 이야기\n2️⃣ 백두산 북쪽 여정: 민족의 영산 천지와 힘차게 낙하하는 장백폭포 관람\n3️⃣ 백두산 남쪽 여정: 압록강 발원지 확인 및 또 다른 매력의 남쪽 천지 조망\n\n━━━━━━━━━━━━━━━━━━━━━\n\n💡 왜 많은 분들이 서울 국제연합 여행사의 역사 기행을 극찬할까요?\n- 단순한 '눈도장 찍기식' 관광에서 벗어나 전문적이고 해박한 박사님들의 깊이 있는 현장 해설 제공!\n- 51년간 광고 비용 대신 신뢰와 만족을 바탕으로 한 입소문과 높은 재방문율로 성장한 명문 여행사.\n- 소중한 자녀에게는 훌륭한 역사 교육을, 부모님께는 일생 최고의 감동을 선사합니다.\n\n📞 [참가 신청 및 상담 예약]\n• 지금 바로 신뢰의 서울 국제연합 여행사에 노크해 보세요. 소중한 가족, 뜻깊은 친구 모임에 가장 완벽한 선물이 될 것입니다.\n\n#백두산역사여행 #백두산여행 #정규훈교수 #인문학여행 #서울 국제연합 여행사 #압록강유람선 #장백폭포 #위화도 #역사탐방 #성지순례전문 #여름휴가추천 #백두산천지`
  },
  benefit: {
    title: "단 89만원에 떠나는 백두산 완벽 정복 초특가 Shorts",
    scenes: [
      {
        id: 1,
        startSecond: 0,
        endSecond: 10,
        visualDescription: "금액 '89만 원' 텍스트가 화면을 가득 채우며 불꽃이나 반짝이는 이펙트로 강하게 시선 집중. 백두산 천지의 황홀한 뷰가 오버랩.",
        overlayText: "백두산 6일간의 기적!\n단 89만 원 미친 가성비!",
        voiceoverText: "믿기 힘든 초특가! 백두산 6일간의 완벽 여정이 단 89만 원에 나왔습니다!",
        bgmRecommendation: "경쾌하고 아주 빠른 템포의 일렉트로 하이파이"
      },
      {
        id: 2,
        startSecond: 10,
        endSecond: 22,
        visualDescription: "럭셔리하고 넓은 단둥훼리 크루즈 창문 밖으로 끝없는 수평선과 일몰이 펼쳐지는 풍경. 5성급 호텔 로비와 안락한 스위트룸 실내 전환.",
        overlayText: "고급 단둥훼리 DELUXE 창측!\n그리고 준 5성급 특급 호텔 숙박!",
        voiceoverText: "싸구려 패키지가 아닙니다! 바다가 보이는 럭셔리 단둥훼리 DELUXE 창측 선실과 최고급 준 5성급 호텔 숙박까지 전부 포함!",
        bgmRecommendation: "세련되고 트렌디한 라운지 하우스 음악"
      },
      {
        id: 3,
        startSecond: 22,
        endSecond: 35,
        visualDescription: "장백폭포가 시원하고 파워풀하게 아래로 내리꽂히는 모습. 북코스 천지 전경과 압록강 발원지의 파란 물줄기가 시원하게 대비됨.",
        overlayText: "북코스 천지 + 남코스 천지\n백두산 양대 코스 완벽 포함!",
        voiceoverText: "북코스의 압도적인 장백폭포와 천지! 남코스의 신비로운 압록강 발원지와 천지까지! 백두산을 두 배로 즐기는 더블 찬스!",
        bgmRecommendation: "자신감과 에너지가 넘치는 업비트 드럼 앤 베이스"
      },
      {
        id: 4,
        startSecond: 35,
        endSecond: 48,
        visualDescription: "압록강 유람선에서 북녘 땅 위화도와 신의주가 손에 잡힐 듯 가깝게 보여 지도를 보며 감탄하는 관광객들의 미소 띤 현장.",
        overlayText: "압록강 유람선 무료 탑승!\n신의주와 위화도 실물 조망!",
        voiceoverText: "게다가 압록강 유람선도 기본 포함! 눈앞에 생생히 펼쳐지는 신의주와 위화도 조망까지 이 모든 것이 89만 원에!",
        bgmRecommendation: "신나면서도 경쾌한 어쿠스틱 팝"
      },
      {
        id: 5,
        startSecond: 48,
        endSecond: 60,
        visualDescription: "8월 12일 달력 표시와 함께 마감 임박 스탬프가 찍힘. 서울 국제연합 여행사 51주년 마크와 예약 링크 주소가 강조됨.",
        overlayText: "8월 12일 출발!\n지금 바로 예약 (잔여 좌석 소량)",
        voiceoverText: "출발일은 8월 12일! 서울 국제연합 여행사 51주년 한정 찬스입니다. 매진되기 전에 지금 바로 예약하세요!",
        bgmRecommendation: "강렬하고 경쾌한 엔딩 팡파르"
      }
    ],
    caption: `🔥 [마감임박] 단 89만 원! 백두산 크루즈+특급호텔 6일 정복 특가 🔥\n\n이 가격에 이 퀄리티가 정말 가능합니다! 😱\n51년의 전통과 신뢰를 자랑하는 '서울 국제연합 여행사'가 51주년을 기념하여 마진을 완전히 비워낸 파격 혜택!\n\n바다 위 움직이는 호텔 🚢단둥훼리 크루즈🚢의 품격 있는 DELUXE 창측 4인실을 타고, 준 5성급 현지 특급 호텔에서 편안히 머무르는 프리미엄 백두산 여행을 만나보세요.\n\n━━━━━━━━━━━━━━━━━━━━━\n\n🔴 [백두산 51주년 파격 감사 대잔치]\n• 여행 기간: 가성비 극대화 6일간의 알찬 투어\n• 특별 특가: 890,000원 (추가 비용 최소화!)\n• 출발일: 2026년 8월 12일\n\n🏢 [이 가격에 이런 고품격 포함 사항?!]\n• 선실 등급: 선상 낭만을 가득 담은 DELUXE 창측 객실 (4인 1실)\n• 특급 숙소: 피로를 완벽하게 날릴 준 5성급 정식 특급 호텔 숙박\n\n🗺️ [백두산 북코스 & 남코스 쌍방향 올인원 코스]\n- 백두산 북코스 : 민족의 영험한 기운이 맴도는 천지 + 엄청난 유량의 장백폭포\n- 백두산 남코스 : 푸르른 압록강의 시작인 압록강 발원지 + 색다른 구도의 남쪽 천지 비경\n- 압록강 유람선 탑승 : 바로 코앞에 손 닿을 듯 펼쳐지는 북한 신의주 및 위화도 역사적 조망\n\n━━━━━━━━━━━━━━━━━━━━━\n\n💡 서울 국제연합 여행사의 자부심!\n- 51년 동안 오로지 양심적이고 정직한 스케줄로 신뢰를 얻어 왔습니다.\n- 과장된 광고보다 실제 다녀오신 소중한 분들의 추천과 입소문으로 커온 진짜 전문 여행사!\n- 역사 탐방 전문 박사님의 심도 있고 알기 쉬운 가이드 동행으로 가치를 극대화합니다.\n\n📞 [예약 신청 및 잔여 석 확인]\n• 8월 12일 성수기 출발이므로 좌석 예약이 실시간으로 소진되고 있습니다. 서둘러 전화 주시기 바랍니다!\n\n#백두산특가 #백두산여행 #가성비여행 #단둥훼리 #크루즈여행 #서울 국제연합 여행사 #정규훈교수 #백두산천지 #장백폭포 #압록강유람선 #신의주조망 #8월해외여행 #초특가여행 #효도여행추천`
  }
};
export default function App() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("standard");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [campaign, setCampaign] = useState<ShortsCampaign>(LOCAL_DEFAULTS.standard);
  const [activeSceneId, setActiveSceneId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state when local theme changes (initial state setup)
  useEffect(() => {
    // If not generated yet or switching, load the appropriate pre-crafted theme
    if (!isAiGenerated) {
      setCampaign(LOCAL_DEFAULTS[selectedTheme]);
      setActiveSceneId(1);
    }
  }, [selectedTheme, isAiGenerated]);

  // Handle Live AI Script Regeneration using Gemini on Server
  const handleRegenerate = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: selectedTheme,
          extraPrompt: extraPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신에 실패했습니다.");
      }

      const resData = await response.json();
      if (resData.success) {
        setCampaign(resData.data);
        setIsAiGenerated(true);
        setActiveSceneId(1);
        
        if (resData.isAiGenerated) {
          setStatusMessage("✨ Gemini AI가 맞춤형 대본 및 업로드 안내글을 실시간으로 성공적으로 정교하게 제작했습니다!");
        } else {
          setStatusMessage("🔒 " + (resData.message || "사전 기획된 고품격 맞춤형 템플릿을 신속히 반영했습니다."));
        }
      } else {
        throw new Error(resData.message || "생성 도중 예상치 못한 서버 에러 발생.");
      }
    } catch (error: any) {
      console.error(error);
      // Fail gracefully: load fallback from local defaults
      setCampaign(LOCAL_DEFAULTS[selectedTheme]);
      setIsAiGenerated(false);
      setStatusMessage(`⚠️ 생성에 장애가 있어 역사적인 명품 템플릿으로 안심 전향했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSceneUpdateInApp = (updatedScene: any) => {
    setCampaign(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === updatedScene.id ? updatedScene : s)
    }));
  };

  const handleCaptionUpdateInApp = (newCaption: string) => {
    setCampaign(prev => ({
      ...prev,
      caption: newCaption
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" id="app-root">
      
      {/* 51st Anniversary Top Brand Indicator Strip */}
      <div className="bg-slate-900 text-slate-100 text-[11px] py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 flex-wrap border-b border-slate-800">
        <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-sm text-[10px]">Since 1975</span>
        <span className="text-amber-400">서울 국제연합 여행사 51주년 기념</span>
        <span className="opacity-40">|</span>
        <span>"한 번의 여행이 평생의 추억이 됩니다"</span>
        <span className="opacity-40">|</span>
        <span className="flex items-center gap-1 text-sky-400">
          <Anchor className="w-3 h-3" />
          단둥훼리 크루즈 & 정규훈 교수 동행 백두산 특별 투어
        </span>
      </div>

      {/* Main Luxury Header Panel */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-5 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm shadow-blue-500/20">
              서
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">서울 국제연합 여행사 하절기 특별행사 안내</h1>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                  백두산 천지 대제전
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                51년 전통의 신뢰를 바탕으로 유튜브 Shorts 홍보 동영상과 본문 텍스트를 최적화하여 융합 생성하는 도구입니다.
              </p>
            </div>
          </div>

          {/* Quick info badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 border border-slate-200/50">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>출발일: <strong className="text-slate-950 font-bold">8월 12일(수)</strong></span>
            </div>
            <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 border border-rose-100">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>특별가: <strong className="text-rose-950 font-bold">6일간 89만 원</strong></span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: AI Campaign Studio and Event flyers (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Campaign Studio Control Card */}
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-100 space-y-5" id="campaign-studio-card">
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-800 text-sm">특별 이벤트 테마 스튜디오</h3>
            </div>

            {/* Theme Selector list */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                1단계: 비디오 연출 타겟 테마 선택
              </label>
              
              {/* Theme 1: Standard */}
              <button
                onClick={() => {
                  setSelectedTheme("standard");
                  setIsAiGenerated(false);
                  setStatusMessage(null);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  selectedTheme === "standard"
                    ? "border-blue-600 bg-blue-50/30 text-slate-900 shadow-xs"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-600"
                }`}
              >
                <Award className={`w-5 h-5 mt-0.5 shrink-0 ${selectedTheme === "standard" ? "text-blue-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-extrabold text-xs block text-slate-900">조화로운 명품 투어 (기본형)</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    51년 여행사 신뢰, 선상 디럭스룸, 천지 기행의 가치를 조화롭고 신뢰성 넘치게 복합 홍보합니다.
                  </p>
                </div>
              </button>

              {/* Theme 2: Historical */}
              <button
                onClick={() => {
                  setSelectedTheme("historical");
                  setIsAiGenerated(false);
                  setStatusMessage(null);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  selectedTheme === "historical"
                    ? "border-blue-600 bg-blue-50/30 text-slate-900 shadow-xs"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-600"
                }`}
              >
                <BookOpen className={`w-5 h-5 mt-0.5 shrink-0 ${selectedTheme === "historical" ? "text-blue-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-extrabold text-xs block text-slate-900">정규훈 교수 인문학 기행</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    철학박사 정규훈 교수의 몰입감 깊은 역사 설명, 지적인 역사 탐방 배움의 가치를 부각합니다.
                  </p>
                </div>
              </button>

              {/* Theme 3: Benefit */}
              <button
                onClick={() => {
                  setSelectedTheme("benefit");
                  setIsAiGenerated(false);
                  setStatusMessage(null);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  selectedTheme === "benefit"
                    ? "border-blue-600 bg-blue-50/30 text-slate-900 shadow-xs"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-600"
                }`}
              >
                <TrendingUp className={`w-5 h-5 mt-0.5 shrink-0 ${selectedTheme === "benefit" ? "text-blue-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-extrabold text-xs block text-slate-900">미친 가성비 & 특별 혜택</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    6일간 89만원이라는 파격적인 최저가 혜택, 크루즈 창측, 5성 호텔의 초특가 장점을 강조합니다.
                  </p>
                </div>
              </button>
            </div>

            {/* Custom instruction prompt */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                2단계: AI 맞춤 스타일 커스텀 지시 (선택)
              </label>
              <textarea
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="예: '부모님 효도 관광 선물용으로 다정하게 어조를 작성해줘', '2030 청년들의 호기심을 유도할 힙하고 경쾌한 구어체로 대본을 수정해줘'"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-hidden leading-relaxed h-20"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs text-white transition flex items-center justify-center gap-2 shadow-md ${
                isLoading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  인공지능 대본 정밀 분석 기획 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                  특별 이벤트 안내문 재생성
                </>
              )}
            </button>

            {/* AI Generator Disclaimer message */}
            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 ${
                  statusMessage.includes("⚠️") 
                    ? "bg-amber-50 text-amber-800 border border-amber-100" 
                    : "bg-blue-50 text-blue-800 border border-blue-100"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>{statusMessage}</p>
              </motion.div>
            )}

          </div>

          {/* Core Event Reference Guidelines Card */}
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-100 space-y-4" id="flyer-reference-card">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-600" />
              <h4 className="font-extrabold text-slate-800 text-xs">이벤트 전단 핵심 참고 자료</h4>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-blue-50/40 rounded-xl space-y-1 border border-blue-100/30">
                <span className="font-extrabold text-blue-800 block">🌋 51주년 특별 백두산 투어</span>
                <p>• 정규훈 교수와 함께하는 특별 할인 행사: <strong>6일간 89만원</strong></p>
                <p>• 출발 예정일: <strong>8월 12일(수)</strong></p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">🏢 프리미엄 숙박 가이드</span>
                <p>• 선실: <strong>DELUXE 창측 (4인 1실)</strong> - 넓은 뷰포트 확보</p>
                <p>• 숙소: <strong>특급호텔(준5성급)</strong> 완비로 안락한 피로 해소</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">🗺️ 핵심 답사 스코프</span>
                <p>• <strong>단둥</strong>: 압록강 유람선 탐승 (위화도, 신의주 조망)</p>
                <p>• <strong>북쪽 코스</strong>: 신비로운 천지 & 기개 넘치는 장백폭포</p>
                <p>• <strong>남쪽 코스</strong>: 천지 & 압록강의 발원지 탐방</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">✍️ 서울 국제연합 여행사 크레도 (신조)</span>
                <p className="text-slate-500 italic mt-1">
                  "51년간 과장 광고 대신 고객의 다정한 추천과 높은 재방문으로 든든히 성장했습니다. 인문학 전문 교수들의 살아있는 명품 해설과 평생 잊지 못할 추억을 안겨드립니다."
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column: Interactive Smartphone Player (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <ShortsPlayer 
            scenes={campaign.scenes}
            activeSceneId={activeSceneId}
            onActiveSceneChange={setActiveSceneId}
          />
        </div>

        {/* Right Column: Storyboard List and Description Captions (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Storyboard Script Timelines */}
          <StoryboardList 
            scenes={campaign.scenes}
            activeSceneId={activeSceneId}
            onActiveSceneChange={setActiveSceneId}
            onSceneUpdate={handleSceneUpdateInApp}
          />

          {/* Copyable caption post */}
          <CaptionHub 
            caption={campaign.caption}
            onCaptionUpdate={handleCaptionUpdateInApp}
          />

        </div>

      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-6 mt-12 text-center text-xs space-y-2 shrink-0">
        <p className="font-semibold text-slate-200">서울 국제연합 여행사 (SEOUL INTERNATIONAL UNITED TRAVEL CO., LTD.)</p>
        <p>© 2026 서울 국제연합 여행사 백두산 특별 기획팀. All Rights Reserved. "한 번의 여행이 평생의 추억이 됩니다."</p>
        <div className="flex justify-center items-center gap-3 text-slate-500 text-[11px] pt-1.5">
          <span>설립 51주년 특별 이벤트</span>
          <span>•</span>
          <span>역사 인문학 성지 순례 전문</span>
          <span>•</span>
          <span>단둥훼리 공식 제휴 대리점</span>
        </div>
      </footer>

    </div>
  );
}

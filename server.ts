import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK lazily to avoid crashes if API key is missing
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// 1. Default fallback templates to ensure 100% reliability
const DEFAULT_DATA: Record<string, { title: string; scenes: any[]; caption: string }> = {
  standard: {
    title: "백두산 51주년 특별 이벤트 - 한번의 여행이 평생의 추억이 됩니다",
    scenes: [
      {
        id: 1,
        startSecond: 0,
        endSecond: 10,
        visualDescription: "웅장하게 빛나는 푸른 백두산 천지 비경과 들꽃이 바람에 흩날리는 전경. 화면 중앙에 '2026 백두산 시즌 오픈!' 문구가 부드러운 애니메이션과 함께 등장.",
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
    caption: `🌋 2026 백두산 시즌 오픈! 서울 국제연합 여행사 51주년 특별 이벤트 🌋

"한 번의 여행이 평생의 추억이 됩니다" ✨
51년간 신뢰를 지켜온 역사/성지순례 전문 '서울 국제연합 여행사'가 특별한 백두산 탐방을 제안합니다.

인문학의 거장 🎓정규훈 교수🎓의 명품 해설과 함께,
단둥훼리 크루즈를 타고 백두산 북코스/남코스를 모두 완벽하게 정복하는 고품격 힐링 역사 탐방에 여러분을 초대합니다.

━━━━━━━━━━━━━━━━━━━━━

🔴 [백두산 특별 할인 행사 안내]
• 기간: 6일간의 알찬 특별 여정
• 파격 가격: 890,000원 (최저가 실현!)
• 출발일: 2026년 8월 12일

🏢 [프리미엄 숙식 구성]
• 선실: DELUXE 창측 (쾌적하고 프라이빗한 4인 1실)
• 숙박: 준 5성급 최고급 특급 호텔 숙식

🗺️ [감동 가득 핵심 답사 코스]
1️⃣ 단둥 & 압록강 유람선 (위화도, 신의주 실시간 조망)
2️⃣ 백두산 북쪽 코스 (민족의 영산 천지, 시원하게 쏟아지는 장백폭포)
3️⃣ 백두산 남쪽 코스 (압록강 발원지 비경 및 남쪽에서 바라보는 신비로운 천지)

━━━━━━━━━━━━━━━━━━━━━

💡 왜 서울 국제연합 여행사일까요?
- 51년간 오직 고객과의 약속을 한결같이 지켜온 믿음의 역사!
- 허위 광고보다 고객들의 진정성 있는 소개와 재방문으로 탄탄히 성장했습니다.
- 전문 박사님들의 깊이 있는 유적 설명으로 단순한 구경을 넘어 가슴 속 깊은 감동을 선물합니다.
- 다음 세대까지 신뢰하며 맡길 수 있는 정직한 여행사입니다.

📞 [예약 및 참가 신청]
• 지금 바로 서울 국제연합 여행사로 연락 주셔서 한정된 기회를 선점하세요!
• 가장 소중한 가족, 친구, 연인과 함께 평생 잊지 못할 푸른 천지의 대자연을 경험하시기 바랍니다.

#백두산 #백두산여행 #정규훈교수 #단둥훼리 #천지 #장백폭포 #서울 국제연합 여행사 #압록강 #크루즈여행 #유튜브쇼츠 #해외여행추천 #8월여행 #역사탐방`
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
    caption: `🎓 역사와 인문학으로 마주하는 감동의 백두산 대탐방 🎓

"배움이 있는 여행은 평생의 나침반이 됩니다." ✨
51년 동안 역사 탐방과 성지 순례를 전문으로 하여 특별한 감동을 전해 온 '서울 국제연합 여행사'의 고품격 한정 특별 이벤트!

학계의 대가이신 철학박사 🎓정규훈 교수님🎓이 전 일정 동행하여 역사 속 숨겨진 이야기와 가슴을 울리는 교양 강의를 들려드립니다.

━━━━━━━━━━━━━━━━━━━━━

🔴 [정규훈 교수 동행 백두산 인문학 탐방]
• 기간: 6일간의 깊이 있는 지적 여정
• 파격 특가: 890,000원
• 출발일: 2026년 8월 12일

🏢 [안락한 최고급 서비스 제공]
• 선상 선실: DELUXE 창측 (4인 1실로 바다 풍경을 감상하며 낭만 충전)
• 현지 숙소: 준 5성급 최고의 시설을 자랑하는 준특급 호텔

🗺️ [명품 인문학 답사 여정]
1️⃣ 압록강 유람선 답사: 위화도 회군과 신의주를 조망하며 걷는 역사 이야기
2️⃣ 백두산 북쪽 여정: 민족의 영산 천지와 힘차게 낙하하는 장백폭포 관람
3️⃣ 백두산 남쪽 여정: 압록강 발원지 확인 및 또 다른 매력의 남쪽 천지 조망

━━━━━━━━━━━━━━━━━━━━━

💡 왜 많은 분들이 서울 국제연합 여행사의 역사 기행을 극찬할까요?
- 단순한 '눈도장 찍기식' 관광에서 벗어나 전문적이고 해박한 박사님들의 깊이 있는 현장 해설 제공!
- 51년간 광고 비용 대신 신뢰와 만족을 바탕으로 한 입소문과 높은 재방문율로 성장한 명문 여행사.
- 소중한 자녀에게는 훌륭한 역사 교육을, 부모님께는 일생 최고의 감동을 선사합니다.

📞 [참가 신청 및 상담 예약]
• 지금 바로 신뢰의 서울 국제연합 여행사에 노크해 보세요. 소중한 가족, 뜻깊은 친구 모임에 가장 완벽한 선물이 될 것입니다.

#백두산역사여행 #백두산여행 #정규훈교수 #인문학여행 #서울 국제연합 여행사 #압록강유람선 #장백폭포 #위화도 #역사탐방 #성지순례전문 #여름휴가추천 #백두산천지`
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
    caption: `🔥 [마감임박] 단 89만 원! 백두산 크루즈+특급호텔 6일 정복 특가 🔥

이 가격에 이 퀄리티가 정말 가능합니다! 😱
51년의 전통과 신뢰를 자랑하는 '서울 국제연합 여행사'가 51주년을 기념하여 마진을 완전히 비워낸 파격 혜택!

바다 위 움직이는 호텔 🚢단둥훼리 크루즈🚢의 품격 있는 DELUXE 창측 4인실을 타고, 준 5성급 현지 특급 호텔에서 편안히 머무르는 프리미엄 백두산 여행을 만나보세요.

━━━━━━━━━━━━━━━━━━━━━

🔴 [백두산 51주년 파격 감사 대잔치]
• 여행 기간: 가성비 극대화 6일간의 알찬 투어
• 특별 특가: 890,000원 (추가 비용 최소화!)
• 출발일: 2026년 8월 12일

🏢 [이 가격에 이런 고품격 포함 사항?!]
• 선실 등급: 선상 낭만을 가득 담은 DELUXE 창측 객실 (4인 1실)
• 특급 숙소: 피로를 완벽하게 날릴 준 5성급 정식 특급 호텔 숙박

🗺️ [백두산 북코스 & 남코스 쌍방향 올인원 코스]
- 백두산 북코스 : 민족의 영험한 기운이 맴도는 천지 + 엄청난 유량의 장백폭포
- 백두산 남코스 : 푸르른 압록강의 시작인 압록강 발원지 + 색다른 구도의 남쪽 천지 비경
- 압록강 유람선 탑승 : 바로 코앞에 손 닿을 듯 펼쳐지는 북한 신의주 및 위화도 역사적 조망

━━━━━━━━━━━━━━━━━━━━━

💡 서울 국제연합 여행사의 자부심!
- 51년 동안 오로지 양심적이고 정직한 스케줄로 신뢰를 얻어 왔습니다.
- 과장된 광고보다 실제 다녀오신 소중한 분들의 추천과 입소문으로 커온 진짜 전문 여행사!
- 역사 탐방 전문 박사님의 심도 있고 알기 쉬운 가이드 동행으로 가치를 극대화합니다.

📞 [예약 신청 및 잔여 석 확인]
• 8월 12일 성수기 출발이므로 좌석 예약이 실시간으로 소진되고 있습니다. 서둘러 전화 주시기 바랍니다!

#백두산특가 #백두산여행 #가성비여행 #단둥훼리 #크루즈여행 #서울 국제연합 여행사 #정규훈교수 #백두산천지 #장백폭포 #압록강유람선 #신의주조망 #8월해외여행 #초특가여행 #효도여행추천`
  }
};

// 2. Main Generation Endpoint utilizing Gemini-3.5-flash
app.post("/api/generate", async (req, res) => {
  const { theme, extraPrompt } = req.body;
  const activeTheme = theme || "standard";

  const aiClient = getGeminiClient();

  if (!aiClient) {
    console.log(`[API_KEY_MISSING] GEMINI_API_KEY is not defined. Serving default template for theme: ${activeTheme}`);
    // If no API Key is found, seamlessly return pre-crafted template for perfect reliability
    const fallback = DEFAULT_DATA[activeTheme] || DEFAULT_DATA.standard;
    return res.json({
      success: true,
      data: fallback,
      isAiGenerated: false,
      message: "API Key가 설정되지 않아 사전 제작된 고품격 템플릿을 반환했습니다. 실시간 인공지능 생성을 원하시면 Secrets 메뉴에 GEMINI_API_KEY를 등록해 주세요."
    });
  }

  try {
    const themeInstructionMap: Record<string, string> = {
      standard: "서울 국제연합 여행사의 51주년 역사와 백두산 정식 오픈의 희소성을 고루 강조하며 한 번의 여행이 평생의 추억이 된다는 감성을 신뢰감 있고 조화롭게 서술해 주세요.",
      historical: "정규훈 교수의 풍부한 인문학적 식견, 깊이 있는 역사 설명, 고구려와 압록강의 역사성, 배움이 깊은 여행이라는 가치를 집중적으로 강조하여 중장년 및 역사 매니아층의 지적 호기심을 유도해 주세요.",
      benefit: "6일간 단 89만 원이라는 미친 가성비, DELUXE 창측 선실 및 준 5성 특급 호텔 제공의 고급스러움, 북코스와 남코스 천지를 동시에 즐긴다는 사상 초유의 파격 구성을 강렬하고 흥미진진하게 부각해 주세요."
    };

    const targetThemeInstruction = themeInstructionMap[activeTheme] || themeInstructionMap.standard;

    const systemInstruction = `
너는 51년 전통의 신뢰받는 '서울 국제연합 여행사'의 전문 마케팅 기획자이자 유명 여행 전문 유튜버이다.
제공된 '2026 백두산 시즌 오픈 특별 이벤트'의 구체적 정보를 기반으로, 유튜브 쇼츠(Shorts)에 최적화된 동영상 대본(타임라인별 장면 구성)과 업로드용 안내 포스트 텍스트를 창의적으로 다듬어 완성도 높게 만들어야 한다.

[행사 핵심 정보 데이터]
- 행사명: 51주년 백두산 특별 관광 이벤트 (정규훈 교수 동행 특별 할인 행사)
- 가격 및 기간: 6일간 89만원 (매우 놀라운 파격 혜택가!)
- 출발일: 8월 12일 (성수기 특별 출발)
- 선실 등급: DELUXE 창측 (4인 1실, 넓은 창문으로 바다 조망 가능)
- 숙박 등급: 준 5성급 최고의 특급호텔 숙박
- 핵심 답사 코스:
  1) 단둥 & 압록강 유람선 탑승 (위화도, 신의주 손에 잡힐 듯 가깝게 실물 조망)
  2) 백두산 북쪽 코스 : 푸른 천지 비경, 장엄하게 낙하하는 장백폭포
  3) 백두산 남쪽 코스 : 천지와 한민족의 숨결 압록강 발원지
- 슬로건이자 고정 멘트: "한 번의 여행이 평생의 추억이 됩니다." (마무리 부분이나 임팩트 있는 부분에 필수 삽입)
- 서울 국제연합 여행사 소개: 51년간 신뢰를 지켜왔고, 대대적인 광고 비용을 쓰는 대신 오로지 실제 다녀온 사람들의 열정적인 소개와 끊임없는 재방문으로 묵묵히 성장한 정직한 곳. 역사 탐방과 성지 순례 전문 박사님들의 깊이 있는 유적 설명이 돋보이는 믿음의 여행사.

[특별 요구사항 - 테마 지침]
이번 생성의 메인 테마: [${activeTheme.toUpperCase()}]
메인 테마 세부 지침: ${targetThemeInstruction}
추가 요청사항(사용자 정의): ${extraPrompt || "없음"}

[출력 JSON 포맷 약속]
반드시 아래의 타입정의를 엄격히 따르는 하나의 JSON 오브젝트만 반환해야 한다. 마크다운 기호(\`\`\`json 등)나 전후 설명 문구를 제외하고 오직 완벽한 JSON 형식 문자열만 출력하라.

interface ResponseFormat {
  title: string; // 쇼츠의 제목 또는 대표 후킹 멘트 (50자 이내)
  scenes: {
    id: number; // 1부터 시작하는 순차적인 번호 (전체 4~6개 장면으로 구성할 것)
    startSecond: number; // 해당 장면의 시작 초 (전체 합산 50~60초가 되도록 배치)
    endSecond: number; // 해당 장면의 끝 초
    visualDescription: string; // 유튜버 쇼츠 편집자가 어떤 영상을 배치해야 하는지 한글로 상세한 연출 지시
    overlayText: string; // 스마트폰 화면 상에 큰 글씨로 오버레이되는 자막 가독성 좋은 텍스트 (줄바꿈 \\n 사용 가능, 간결하게)
    voiceoverText: string; // 쇼츠 TTS나 나레이터가 실제 낭독할 자연스럽고 귀에 꽂히는 한글 나레이션 대본
    bgmRecommendation: string; // 해당 장면에 완벽히 어울리는 음악 스타일 추천 (예: '가슴 벅차오르는 클래식 사운드', '경쾌하고 리드미컬한 일렉트릭비트')
  }[];
  caption: string; // 유튜브 업로드 시 함께 작성할 고품격 소개 텍스트. 화려한 이모지와 구체적인 패키지 가격, 선실, 숙박, 혜택, 여행사 아이덴티티, 예약 권유 및 풍성한 추천 해시태그(#백두산 #서울 국제연합 여행사 #정규훈교수 등)가 모두 조화롭게 포맷팅된 한국어 장문 텍스트.
}
`;

    const contents = `2026 백두산 시즌 오픈에 맞춰 51주년 특별 할인 행사를 알리는 대박 쇼츠 비디오 및 디테일한 홍보용 캡션을 기획해 줘.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "scenes", "caption"],
          properties: {
            title: { type: Type.STRING },
            caption: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: [
                  "id",
                  "startSecond",
                  "endSecond",
                  "visualDescription",
                  "overlayText",
                  "voiceoverText",
                  "bgmRecommendation",
                ],
                properties: {
                  id: { type: Type.INTEGER },
                  startSecond: { type: Type.INTEGER },
                  endSecond: { type: Type.INTEGER },
                  visualDescription: { type: Type.STRING },
                  overlayText: { type: Type.STRING },
                  voiceoverText: { type: Type.STRING },
                  bgmRecommendation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedData = JSON.parse(text.trim());
    return res.json({
      success: true,
      data: parsedData,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // On error, revert to appropriate fallback safely
    const fallback = DEFAULT_DATA[activeTheme] || DEFAULT_DATA.standard;
    return res.json({
      success: true,
      data: fallback,
      isAiGenerated: false,
      message: `인공지능 생성 중 오류가 발생하여 사전 제작된 템플릿을 반환했습니다: ${error.message}`
    });
  }
});

// Serve static assets in production, handle Vite in dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

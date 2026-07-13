export interface Scene {
  id: number;
  startSecond: number;
  endSecond: number;
  visualDescription: string;
  overlayText: string;
  voiceoverText: string;
  bgmRecommendation: string;
}

export interface ShortsCampaign {
  title: string;
  scenes: Scene[];
  caption: string;
}

export type ThemeType = "standard" | "historical" | "benefit";

export interface GenerateResponse {
  success: boolean;
  data: ShortsCampaign;
  isAiGenerated: boolean;
  message?: string;
}

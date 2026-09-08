import type {
  ActiveDecision,
  AttentionItem,
  FarmerProfile,
  HamparanSummary,
  RecentDecision,
} from "../types/farmer";

export const farmerProfile: FarmerProfile = {
  displayName: "Pak Arif",
  roleLabel: "Petani",
  groupLabel: "Demo Farmer Group · Kepanjen",
};

export const hamparans: HamparanSummary[] = [
  {
    id: "land-044",
    name: "Blok Tirto A3",
    location: "Mangunrejo, Kepanjen, Malang",
    crop: "Padi",
    variety: "Inpari 32",
    stage: "Berbunga · HST 68",
    areaHa: 0.45,
  },
  {
    id: "land-051",
    name: "Blok Tirto B1",
    location: "Mangunrejo, Kepanjen, Malang",
    crop: "Padi",
    variety: "Ciherang",
    stage: "Vegetatif · HST 32",
    areaHa: 0.32,
  },
];

export const activeDecision: ActiveDecision = {
  id: "case-08492",
  hamparanName: "Blok Tirto A3",
  summary: "Kondisi air perlu ditinjau",
  statusLabel: "Assessment tersedia",
  lastOpened: "Hari ini, 14:30",
};

export const attentionItems: AttentionItem[] = [
  {
    id: "att-1",
    kind: "stale_evidence",
    title: "Kondisi air perlu diperbarui",
    description:
      "Field Pulse Blok Tirto A3 terakhir diperbarui kemarin. Konfirmasi ulang sebelum memutuskan.",
  },
  {
    id: "att-2",
    kind: "review_ready",
    title: "Pertimbangan reviewer tersedia",
    description:
      "Catatan reviewer untuk keputusan Blok Tirto A3 siap Anda tinjau.",
  },
];

export const recentDecisions: RecentDecision[] = [
  {
    id: "rec-1",
    hamparanName: "Blok Tirto A3",
    decisionText: "Tunda pemupukan 24 jam hingga jadwal air masuk desa.",
    timestamp: "31 Agu 2026 · 14:10",
    status: "recorded",
    isDemo: true,
  },
  {
    id: "rec-2",
    hamparanName: "Blok Tirto B1",
    decisionText: "Verifikasi kondisi/alokasi air terbaru sebelum semprot.",
    timestamp: "28 Agu 2026 · 09:40",
    status: "recorded",
    isDemo: true,
  },
  {
    id: "rec-3",
    hamparanName: "Blok Tirto A3",
    decisionText: "Rembuk lapangan dengan mandor terkait pintu air sekunder.",
    timestamp: "22 Agu 2026 · 16:05",
    status: "recorded",
    isDemo: true,
  },
];

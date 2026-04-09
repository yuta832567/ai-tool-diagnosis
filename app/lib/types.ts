export interface FormData {
  // Step 1: 会社のこと
  companyName: string
  websiteUrl: string
  industry: string
  industryOther: string
  businessDescription: string
  companySize: string
  initialUsers: string
  businessTypes: string[]
  businessTypesOther: string
  targetDepartments: string[]
  targetDepartmentsOther: string
  otherNotes: string

  // Step 2: 仕事環境と困りごと
  workEnvironment: string
  workEnvironmentOther: string
  usedApps: string[]
  usedAppsOther: string
  fileStorage: string
  fileStorageOther: string
  usecases: string[]
  usecasesOther: string
  expectedEffects: string[]
  expectedEffectsOther: string
  biggestPain: string

  // Step 3: 情報の扱い方と導入の進め方
  dataSensitivity: string
  personalInfo: string
  confidentialDocs: string
  ruleStrictness: string
  aiUsageStatus: string
  aiOwner: string
  rolloutScope: string
  budgetPerUser: string
  priorities: string[]
  prioritiesOther: string
}

export const initialFormData: FormData = {
  companyName: '',
  websiteUrl: '',
  industry: '',
  industryOther: '',
  businessDescription: '',
  companySize: '',
  initialUsers: '',
  businessTypes: [],
  businessTypesOther: '',
  targetDepartments: [],
  targetDepartmentsOther: '',
  otherNotes: '',
  workEnvironment: '',
  workEnvironmentOther: '',
  usedApps: [],
  usedAppsOther: '',
  fileStorage: '',
  fileStorageOther: '',
  usecases: [],
  usecasesOther: '',
  expectedEffects: [],
  expectedEffectsOther: '',
  biggestPain: '',
  dataSensitivity: '',
  personalInfo: '',
  confidentialDocs: '',
  ruleStrictness: '',
  aiUsageStatus: '',
  aiOwner: '',
  rolloutScope: '',
  budgetPerUser: '',
  priorities: [],
  prioritiesOther: '',
}

// 5軸スコア（各 0-100 に正規化済み）
export interface ToolAxisScores {
  environment: number   // 既存ツールとの相性
  usecase: number       // 業務との相性
  rollout: number       // 始めやすさ
  infoHandling: number  // 情報の扱いやすさ
  budget: number        // 費用感との相性
}

export interface ToolComparison {
  toolId: string
  name: string
  score: number
  reason: string
  caution: string
  axisScores: ToolAxisScores
}

// まず効きやすい業務カード
export interface UsecaseCard {
  title: string
  expectedEffect: string
  whyItFits: string
  howToStart: string
}

// 導入準備度の詳細
export interface ReadinessDetail {
  score: number
  label: string
  definition: string
  summary: string
  nextActions: string[]
}

// 総合所見
export interface OverallAssessment {
  whyThisTool: string
  howToStart: string
  cautionPoints: string[]
}

export interface DiagnosisResult {
  // 基本情報
  recommendedTool: string
  toolScores: { chatgpt: number; copilot: number; gemini: number }
  confidence: 'high' | 'medium' | 'low'

  // エグゼクティブサマリー用
  deploymentStance: string   // 導入スタンス（例: 段階的導入が現実的）
  topReasons: string[]       // 推薦理由 3つ
  summary: string

  // ツール比較
  toolComparisons: ToolComparison[]

  // 活用業務カード
  usecaseCards: UsecaseCard[]

  // 導入準備度（詳細版）
  readinessDetail: ReadinessDetail

  // 総合所見
  overallAssessment: OverallAssessment

  // 後方互換（フォームコントローラーで参照）
  readinessScore: number
  readinessLabel: string
  recommendedUsecases: string[]
  nextSteps: string[]
  cautionMessage?: string
}

import { Badge } from "./badge";

export type IntelligenceClassification = "FACT" | "ANALYTICAL FINDING" | "MODEL INFERENCE" | "INVESTIGATIVE LEAD" | "UNKNOWN";

const tones: Record<IntelligenceClassification, "blue" | "green" | "amber" | "red" | "gray"> = {
  FACT: "green",
  "ANALYTICAL FINDING": "blue",
  "MODEL INFERENCE": "amber",
  "INVESTIGATIVE LEAD": "amber",
  UNKNOWN: "gray"
};

export function ClassificationBadge({ value }: { value: IntelligenceClassification }) {
  return <Badge tone={tones[value]}>{value}</Badge>;
}

export function unavailable(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Not available" : String(value);
}

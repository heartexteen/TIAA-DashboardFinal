import type { MockClientKey } from "@/lib/non-pdf-client-data/types"
import type { ClientReferenceData } from "./types"
import { carinaReferenceData } from "./carina"
import { johnReferenceData } from "./john"
import { mariaReferenceData } from "./maria"

export const referenceData: Partial<Record<MockClientKey, ClientReferenceData>> = {
  carina: carinaReferenceData,
  john: johnReferenceData,
  maria: mariaReferenceData,
}

export type { ClientReferenceData }

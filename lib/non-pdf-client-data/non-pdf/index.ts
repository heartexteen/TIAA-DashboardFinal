import { carinaNonPdfData } from "./carina"
import { johnNonPdfData } from "./john"
import { mariaNonPdfData } from "./maria"
import type { MockClientKey, MockClientNonPdfData } from "../types"

export const nonPdfClientData: Record<MockClientKey, MockClientNonPdfData> = {
  carina: carinaNonPdfData,
  john: johnNonPdfData,
  maria: mariaNonPdfData,
}

export type { MockClientKey, MockClientNonPdfData } from "../types"

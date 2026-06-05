import { keccak256, toHex, type Hex } from "viem";

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function hashCanonicalJson(value: unknown): Hex {
  return keccak256(toHex(canonicalJson(value)));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }

  return value;
}

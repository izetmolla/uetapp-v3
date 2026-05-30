const EMPTY_OPTION_PREFIX = "__empty_";

/** Radix Select rejects empty string values — map them to stable sentinels. */
export function safeSelectValue(value: string, index: number): string {
    return value === "" ? `${EMPTY_OPTION_PREFIX}${index}` : value;
}

export function fromSafeSelectValue(safe: string): string {
    return safe.startsWith(EMPTY_OPTION_PREFIX) ? "" : safe;
}

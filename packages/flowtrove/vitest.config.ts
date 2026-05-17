import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "happy-dom",
        globals: false,
        // The interceptor mutates module-level state (the in-flight
        // refresh promise), so each test file must run in its own
        // process to keep that state isolated.
        isolate: true,
    },
})

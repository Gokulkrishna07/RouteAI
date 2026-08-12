"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreComplexity = scoreComplexity;
const COMPLEXITY_KEYWORDS = [
    "explain in detail",
    "step by step",
    "compare",
    "analyze",
    "design",
    "architecture",
    "prove",
    "derive",
    "optimize",
    "debug",
    "refactor",
    "write a program",
    "algorithm",
];
function scoreComplexity(prompt) {
    let score = 0;
    const wordCount = prompt.trim().split(/\s+/).length;
    score += Math.min(wordCount / 2, 40);
    const lower = prompt.toLowerCase();
    for (const keyword of COMPLEXITY_KEYWORDS) {
        if (lower.includes(keyword)) {
            score += 15;
        }
    }
    if (prompt.includes("```") || /\bfunction\b|\bclass\b/.test(prompt)) {
        score += 20;
    }
    const questionMarks = (prompt.match(/\?/g) || []).length;
    if (questionMarks > 1) {
        score += 10 * (questionMarks - 1);
    }
    return Math.min(score, 100);
}

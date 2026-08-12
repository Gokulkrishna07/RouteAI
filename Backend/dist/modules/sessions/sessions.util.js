"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveSessionTitle = deriveSessionTitle;
function deriveSessionTitle(prompt) {
    const trimmed = prompt.trim().replace(/\s+/g, " ");
    if (trimmed.length <= 60)
        return trimmed;
    return `${trimmed.slice(0, 57)}...`;
}

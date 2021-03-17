
export function escapeMarkDown(v: string) {
    return v.replace(/([{}[\]._*])/gm, '\\\\$1');
}
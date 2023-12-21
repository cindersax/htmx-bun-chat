export function generateUsername() {
  return "user_" + Math.random().toString(16).slice(12);
}

export function sanitizeInput(input: string) {
  return input.replace(/<[^>]*>?/gm, "");
}
export function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

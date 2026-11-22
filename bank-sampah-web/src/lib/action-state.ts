export type ActionState = {
  status: "error" | "success";
  message: string;
} | null;

export function fail(message: string): ActionState {
  return { status: "error", message };
}

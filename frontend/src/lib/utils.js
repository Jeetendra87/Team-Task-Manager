import clsx from "clsx";
import { format, formatDistanceToNowStrict, isPast } from "date-fns";

export const cn = (...args) => clsx(...args);

export function formatDate(d, fmt = "MMM d, yyyy") {
  if (!d) return "—";
  return format(new Date(d), fmt);
}

export function formatRelative(d) {
  if (!d) return "—";
  return formatDistanceToNowStrict(new Date(d), { addSuffix: true });
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === "completed") return false;
  return isPast(new Date(dueDate));
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const STATUS_LABEL = {
  todo: "Todo",
  in_progress: "In Progress",
  completed: "Completed",
};

export const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

// Simple localStorage-based progress tracking for the hardcoded course
import { HARDCODED_COURSE } from './hardcoded-course.js';

const STORAGE_KEY = `progress:${HARDCODED_COURSE.id}`;

// Data shape: { completed: { [moduleId]: true }, updatedAt: timestamp }
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, updatedAt: null };
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse progress storage', e);
    return { completed: {}, updatedAt: null };
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, updatedAt: Date.now() }));
}

export function markModuleComplete(moduleId) {
  const progress = loadProgress();
  progress.completed[moduleId] = true;
  saveProgress(progress);
}

export function getProgressSummary() {
  const progress = loadProgress();
  const total = HARDCODED_COURSE.modules.length;
  const done = Object.keys(progress.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent, updatedAt: progress.updatedAt };
}

export function isModuleCompleted(moduleId) {
  const progress = loadProgress();
  return !!progress.completed[moduleId];
}

export function resetProgress() {
  saveProgress({ completed: {} });
}

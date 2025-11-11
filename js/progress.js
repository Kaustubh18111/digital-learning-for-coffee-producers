// js/progress.js
import { auth, db, doc, getDoc, setDoc } from './firebase-init.js';

// A local cache for progress to avoid constant Firestore reads
let progressCache = {};

// Load progress for a specific user
export async function loadUserProgress(userId) {
  if (!userId) {
    // Guest user: load from localStorage guest cache
    try {
      progressCache = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    } catch {
      progressCache = {};
    }
    return;
  }
  const progressRef = doc(db, 'users', userId, 'progress', 'all-courses');
  const progressSnap = await getDoc(progressRef);
  if (progressSnap.exists()) {
    progressCache = progressSnap.data();
  } else {
    progressCache = {};
  }
}

// Mark a module complete
export async function markModuleComplete(courseId, moduleId) {
  const { uid } = auth.currentUser || {};
  if (!uid) {
    // Handle guest progress (still uses localstorage)
    const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    if (!guestProgress[courseId]) guestProgress[courseId] = {};
    guestProgress[courseId][moduleId] = true;
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
    progressCache = guestProgress; // Update cache
    return;
  }

  // Logged-in user: save to Firestore
  const fieldPath = `${courseId}.${moduleId}`; // e.g., "low-intervention-farming.module_1"
  const progressRef = doc(db, 'users', uid, 'progress', 'all-courses');
  try {
    await setDoc(progressRef, { [fieldPath]: true }, { merge: true });
    // Update local cache
    if (!progressCache[courseId]) progressCache[courseId] = {};
    progressCache[courseId][moduleId] = true;
  } catch (e) {
    console.error('Error saving progress: ', e);
  }
}

// Get progress for a course
export function getCourseProgress(courseId, totalModules) {
  const courseData = progressCache[courseId] || {};
  const done = Object.keys(courseData).length;
  const total = totalModules;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

// Check if a single module is done
export function isModuleCompleted(courseId, moduleId) {
  return !!(progressCache[courseId] && progressCache[courseId][moduleId]);
}
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

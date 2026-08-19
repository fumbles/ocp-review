import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ocp-study-progress-v1'

const EMPTY_PROGRESS = {
  selectedPath: 'do180',
  topics: [],
  walkthroughs: [],
  practiceTasks: {},
  flashcards: {
    bookmarks: [],
    records: {},
  },
  examAttempts: [],
}

function uniqueStrings(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string'))]
    : []
}

function normalizeProgress(value) {
  const practiceTasks = {}
  const flashcardRecords = {}

  if (value?.practiceTasks && typeof value.practiceTasks === 'object') {
    for (const [examId, taskIds] of Object.entries(value.practiceTasks)) {
      if (typeof examId === 'string') practiceTasks[examId] = uniqueStrings(taskIds)
    }
  }

  if (value?.flashcards?.records && typeof value.flashcards.records === 'object') {
    for (const [cardId, record] of Object.entries(value.flashcards.records)) {
      if (typeof cardId !== 'string' || !record || typeof record !== 'object') continue
      flashcardRecords[cardId] = {
        attempts: Math.max(0, Number(record.attempts) || 0),
        correct: Math.max(0, Number(record.correct) || 0),
        repetitions: Math.max(0, Number(record.repetitions) || 0),
        intervalDays: Math.max(0, Number(record.intervalDays) || 0),
        ease: Math.max(1.3, Number(record.ease) || 2.5),
        dueAt: Math.max(0, Number(record.dueAt) || 0),
        lastReviewedAt: Math.max(0, Number(record.lastReviewedAt) || 0),
        lastRating: ['again', 'hard', 'good', 'easy'].includes(record.lastRating)
          ? record.lastRating
          : null,
      }
    }
  }

  return {
    selectedPath: typeof value?.selectedPath === 'string' ? value.selectedPath : 'do180',
    topics: uniqueStrings(value?.topics),
    walkthroughs: uniqueStrings(value?.walkthroughs),
    practiceTasks,
    flashcards: {
      bookmarks: uniqueStrings(value?.flashcards?.bookmarks),
      records: flashcardRecords,
    },
    examAttempts: Array.isArray(value?.examAttempts)
      ? value.examAttempts.filter(attempt => attempt && typeof attempt === 'object').slice(0, 20)
      : [],
  }
}

function readProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? normalizeProgress(JSON.parse(saved)) : EMPTY_PROGRESS
  } catch {
    return EMPTY_PROGRESS
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Progress remains usable for this session if storage is unavailable.
  }
}

function toggleItem(items, id) {
  return items.includes(id)
    ? items.filter(item => item !== id)
    : [...items, id]
}

function calculateSchedule(record = {}, rating) {
  const repetitions = Number(record.repetitions) || 0
  const currentInterval = Number(record.intervalDays) || 0
  const currentEase = Math.max(1.3, Number(record.ease) || 2.5)

  if (rating === 'again') {
    return { repetitions: 0, intervalDays: 10 / 1440, ease: Math.max(1.3, currentEase - 0.2) }
  }
  if (rating === 'hard') {
    return {
      repetitions: Math.max(1, repetitions),
      intervalDays: repetitions === 0 ? 1 : Math.max(1, currentInterval * 1.2),
      ease: Math.max(1.3, currentEase - 0.15),
    }
  }
  if (rating === 'easy') {
    return {
      repetitions: repetitions + 1,
      intervalDays: repetitions === 0 ? 4 : Math.max(4, currentInterval * currentEase * 1.3),
      ease: Math.min(3.2, currentEase + 0.15),
    }
  }
  return {
    repetitions: repetitions + 1,
    intervalDays: repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.max(1, currentInterval * currentEase),
    ease: currentEase,
  }
}

export function getNextReviewInterval(record, rating) {
  return calculateSchedule(record, rating).intervalDays
}

export function useStudyProgress() {
  const [progress, setProgress] = useState(readProgress)

  const update = useCallback(updater => {
    setProgress(current => {
      const next = normalizeProgress(updater(current))
      saveProgress(next)
      return next
    })
  }, [])

  const toggleTopic = useCallback(id => {
    update(current => ({
      ...current,
      topics: toggleItem(current.topics, id),
    }))
  }, [update])

  const toggleWalkthrough = useCallback(id => {
    update(current => ({
      ...current,
      walkthroughs: toggleItem(current.walkthroughs, id),
    }))
  }, [update])

  const togglePracticeTask = useCallback((examId, taskId) => {
    update(current => ({
      ...current,
      practiceTasks: {
        ...current.practiceTasks,
        [examId]: toggleItem(current.practiceTasks[examId] || [], taskId),
      },
    }))
  }, [update])

  const setSelectedPath = useCallback(id => {
    update(current => ({ ...current, selectedPath: id }))
  }, [update])

  const toggleFlashcardBookmark = useCallback(id => {
    update(current => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        bookmarks: toggleItem(current.flashcards.bookmarks, id),
      },
    }))
  }, [update])

  const recordFlashcardAnswer = useCallback((id, wasCorrect) => {
    update(current => {
      const record = current.flashcards.records[id] || {}
      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          records: {
            ...current.flashcards.records,
            [id]: {
              ...record,
              attempts: (record.attempts || 0) + 1,
              correct: (record.correct || 0) + (wasCorrect ? 1 : 0),
            },
          },
        },
      }
    })
  }, [update])

  const rateFlashcard = useCallback((id, rating) => {
    if (!['again', 'hard', 'good', 'easy'].includes(rating)) return
    update(current => {
      const record = current.flashcards.records[id] || {}
      const schedule = calculateSchedule(record, rating)
      const reviewedAt = Date.now()
      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          records: {
            ...current.flashcards.records,
            [id]: {
              ...record,
              ...schedule,
              lastRating: rating,
              lastReviewedAt: reviewedAt,
              dueAt: reviewedAt + schedule.intervalDays * 24 * 60 * 60 * 1000,
            },
          },
        },
      }
    })
  }, [update])

  const saveExamAttempt = useCallback(attempt => {
    update(current => ({
      ...current,
      examAttempts: [attempt, ...current.examAttempts].slice(0, 20),
    }))
  }, [update])

  return {
    progress,
    toggleTopic,
    toggleWalkthrough,
    togglePracticeTask,
    setSelectedPath,
    toggleFlashcardBookmark,
    recordFlashcardAnswer,
    rateFlashcard,
    saveExamAttempt,
  }
}

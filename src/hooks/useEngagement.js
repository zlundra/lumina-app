import { useState, useCallback } from 'react'
import {
  loadEngagements, saveEngagement, deleteEngagement,
  getEngagement, generateId, createEngagement
} from '../utils/storage.js'

export const useEngagements = () => {
  const [engagements, setEngagements] = useState(() => loadEngagements())

  const refresh = useCallback(() => setEngagements(loadEngagements()), [])

  const create = useCallback((data) => {
    const e = createEngagement(data)
    saveEngagement(e)
    setEngagements(loadEngagements())
    return e
  }, [])

  const update = useCallback((engagement) => {
    const saved = saveEngagement(engagement)
    setEngagements(loadEngagements())
    return saved
  }, [])

  const remove = useCallback((id) => {
    deleteEngagement(id)
    setEngagements(loadEngagements())
  }, [])

  return { engagements, create, update, remove, refresh }
}

export const useEngagement = (id) => {
  const [engagement, setEngagement] = useState(() => getEngagement(id))

  const update = useCallback((patch) => {
    setEngagement(prev => {
      if (!prev) return prev
      const updated = saveEngagement(typeof patch === 'function' ? patch(prev) : { ...prev, ...patch })
      return updated
    })
  }, [])

  // Stage operations
  const updateStage = useCallback((stageId, patch) => {
    update(prev => ({
      ...prev,
      stages: prev.stages.map(s => s.id === stageId
        ? { ...s, ...(typeof patch === 'function' ? patch(s) : patch) }
        : s
      )
    }))
  }, [update])

  const addNote = useCallback((stageId, note) => {
    updateStage(stageId, s => ({
      ...s,
      notes: [...(s.notes||[]), { id: generateId(), timestamp: new Date().toISOString(), author: 'Valentina', ...note }]
    }))
  }, [updateStage])

  const addDeliverable = useCallback((stageId, deliverable) => {
    updateStage(stageId, s => ({
      ...s,
      deliverables: [...(s.deliverables||[]), { id: generateId(), status: 'pending', ...deliverable }]
    }))
  }, [updateStage])

  const updateDeliverable = useCallback((stageId, delivId, patch) => {
    updateStage(stageId, s => ({
      ...s,
      deliverables: s.deliverables.map(d => d.id === delivId ? { ...d, ...patch } : d)
    }))
  }, [updateStage])

  const addSubStage = useCallback((stageId, subStage) => {
    updateStage(stageId, s => ({
      ...s,
      subStages: [...(s.subStages||[]), { id: generateId(), status: 'not-started', completionPct: 0, notes: [], ...subStage }]
    }))
  }, [updateStage])

  const addQuestion = useCallback((stageId, question) => {
    updateStage(stageId, s => ({
      ...s,
      openQuestions: [...(s.openQuestions||[]), { id: generateId(), status: 'open', date: new Date().toISOString().slice(0,10), ...question }]
    }))
  }, [updateStage])

  const addBlocker = useCallback((stageId, blocker) => {
    updateStage(stageId, s => ({
      ...s,
      blockers: [...(s.blockers||[]), { id: generateId(), status: 'active', raisedDate: new Date().toISOString().slice(0,10), ...blocker }]
    }))
  }, [updateStage])

  const addComment = useCallback((stageId, comment) => {
    updateStage(stageId, s => ({
      ...s,
      comments: [...(s.comments||[]), { id: generateId(), timestamp: new Date().toISOString(), resolved: false, ...comment }]
    }))
  }, [updateStage])

  const addDecision = useCallback((decision) => {
    update(prev => ({
      ...prev,
      decisions: [...(prev.decisions||[]), { id: generateId(), date: new Date().toISOString().slice(0,10), ...decision }]
    }))
  }, [update])

  const addPulse = useCallback((pulse) => {
    update(prev => ({
      ...prev,
      weeklyPulse: [...(prev.weeklyPulse||[]), { id: generateId(), weekOf: new Date().toISOString().slice(0,10), ...pulse }]
    }))
  }, [update])

  const addSystem = useCallback((system) => {
    update(prev => ({
      ...prev,
      systemsMap: [...(prev.systemsMap||[]), { id: generateId(), ...system }]
    }))
  }, [update])

  return {
    engagement, update, updateStage,
    addNote, addDeliverable, updateDeliverable,
    addSubStage, addQuestion, addBlocker,
    addComment, addDecision, addPulse, addSystem,
  }
}

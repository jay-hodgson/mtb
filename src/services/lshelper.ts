import Schedule from '../data/schedule.json'
import Sessions from '../data/sessions.json'
import Studies from '../data/studies.json'
import * as Assessments from '../__test_utils/mocks/assessments'

export const KEYS = {
  STUDIES: 'STUDIES',
  ASSESSMENTS: 'ASSESSMENTS',
  STUDY_SESSIONS: 'STUDY_SESSIONS',
  STUDY_ARMS: 'STUDY_ARMS',
  SCHEDULES: 'SCHEDULES',
}

export const MOCKS = {
  SESSIONS: Sessions.data,
  STUDIES: Studies.data,
  ASSESSMENTS: Assessments.LocalAssessmentsMTB,
  SCHEDULE: Schedule.data,
}

export const setItem = async <T>(
  key: string,
  item: T,
  timeout = 100
): Promise<T> => {
  localStorage.setItem(key, JSON.stringify(item))
  return new Promise(resolve => setTimeout(resolve.bind(null, item), timeout))
}

export const getItem = async <T>(
  key: string,
  timeout = 100
): Promise<T | null> => {
  const item = localStorage.getItem(key)

  return new Promise(resolve =>
    setTimeout(resolve.bind(null, item ? JSON.parse(item) : null), timeout)
  )
}

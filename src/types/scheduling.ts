import {Assessment, StringDictionary} from './types'

export enum DWsEnum {
  D = 'days',
  W = 'weeks',
}

export enum MHDsEnum {
  M = 'minutes',
  H = 'hours',
  D = 'days',
}

export enum HDsEnum {
  H = 'hours',
  D = 'days',
}

export enum HDWMEnum {
  M = 'minutes',
  H = 'hours',
  D = 'days',
  W = 'weeks',
}

export type TimePeriod = {
  value: number
  unit: keyof typeof HDWMEnum
}

export enum NotificationTimeAtEnum {
  'after_window_start' = 'after start of window',
  'before_window_end' = 'before window expires',
}

export type PerformanceOrder =
  | 'sequential'
  | 'randomized'
  | 'participant_choice' //done

//export type StartEventId = 'timeline_retrieved' | 'study_start_date'\

export type EventUpdateType = 'mutable' | 'immutable' | 'future_only'

export type SchedulingEvent = {
  eventId: string
  updateType?: EventUpdateType
}

export type NotificationMessage = {
  lang: string
  subject: string
  message: string
}

export type AssessmentWindow = {
  guid?: string
  startTime: string //(HH:MM)
  expiration?: string //"P7D"
  persistent?: boolean
}

export type ScheduleNotification = {
  notifyAt: keyof typeof NotificationTimeAtEnum //notifyAt
  offset?: string //ReminderIntervalType //remindAt
  interval?: string //reminderPeriod?
  messages: NotificationMessage[] //messages
}

export type SessionSchedule = {
  delay?: string //PD
  interval?: string //PD
  occurrences?: number
  performanceOrder: PerformanceOrder
  timeWindows: AssessmentWindow[]
  assessments?: Assessment[]
  notifyAt?: keyof typeof NotificationTimeAtEnum //move to notification
  //remindAt?: ReminderIntervalType //move to notification
  reminderPeriod?: string //PT10M //move to notification
  messages?: NotificationMessage[] //move to notification
  notifications?: ScheduleNotification[]
  studyBurstIds?: string[]
}

export type StudySessionGeneral = {
  name: string
  labels?: StringDictionary<string>[]
  guid?: string
  startEventIds: string[]
  symbol?: string
  minutesToComplete?: number
}

export interface StudySessionTimeline extends StudySessionGeneral {
  timeWindowGuids: string[]
  label: string
  startEventId: string
}

export type StudySession = StudySessionGeneral & SessionSchedule

export type StudyBurst = {
  identifier: string
  originEventId: string
  interval: string //($ISO 8601 Duration) e.g. P1W
  occurrences: number
  updateType: EventUpdateType
}

//"identifier": "custom_CE2_burst",//
//"interval": "P4W",
//"occurrences": 10,

export type Schedule = {
  name: string
  ownerId?: string //todo
  guid: string
  studyBursts?: StudyBurst[]
  sessions: StudySession[]
  duration?: string //iso
  version?: number
  clientData?: any
}

export type ScheduleTimeline = {
  duration: string //iso
  schedule: TimelineScheduleItem[]
  assessments: Assessment[]
  studyBursts: StudyBurst[]
  sessions: StudySessionTimeline[]
  totalMinutes: number
  totalNotifications: number
}

export type TimelineScheduleItem = {
  instanceGuid: string
  startDay: number
  endDay: number
  startTime: string
  delayTime: string
  expiration: string
  refGuid: string
  startEventId: string
  assessments?: any[]
  timeWindowGuid: string
  studyBurstId?: string
  studyBurstNum?: number
}

import {ReactComponent as EditIcon} from '@assets/edit_pencil_red.svg'
import {ReactComponent as BurstIcon} from '@assets/scheduler/burst_icon.svg'
import ConfirmationDialog from '@components/widgets/ConfirmationDialog'
import ErrorDisplay from '@components/widgets/ErrorDisplay'
import LoadingComponent from '@components/widgets/Loader'
import {
  DialogButtonPrimary,
  DialogButtonSecondary,
} from '@components/widgets/StyledComponents'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Theme,
} from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import EventService, {JOINED_EVENT_ID} from '@services/event.service'
import ScheduleService from '@services/schedule.service'
import {latoFont, poppinsFont, theme} from '@style/theme'
import {
  DWsEnum,
  PerformanceOrder,
  Schedule,
  StudySession,
} from '@typedefs/scheduling'
import {ExtendedError, Study} from '@typedefs/types'
import clsx from 'clsx'
import _ from 'lodash'
import React from 'react'
import {useErrorHandler} from 'react-error-boundary'
import NavigationPrompt from 'react-router-navigation-prompt'
import {
  useSchedule,
  useTimeline,
  useUpdateSchedule,
} from '../../../services/scheduleHooks'
import {useStudy, useUpdateStudyDetail} from '../../../services/studyHooks'
import AssessmentList from './AssessmentList'
import ConfigureBurstTab from './ConfigureBurstTab'
import Duration from './Duration'
import ReadOnlyScheduler from './read-only-pages/ReadOnlyScheduler'
import SchedulableSingleSessionContainer from './SchedulableSingleSessionContainer'
import actionsReducer, {
  ActionTypes,
  SessionScheduleAction,
} from './scheduleActions'
import ScheduleTimelineDisplay from './ScheduleTimelineDisplay'
import SessionStartTab from './SessionStartTab'
import StudyStartEvent from './StudyStartEvent'
import {getFormattedTimeDateFromPeriodString} from './utility'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sessionContainer: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      '&:last-child': {
        marginBottom: 0,
      },
    },
    labelDuration: {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      fontFamily: poppinsFont,
      fontSize: '18px',
      fontStyle: 'normal',
      fontWeight: 700,
      '&$readOnly': {
        '& > span ': {
          paddingRight: '8px',
        },
        '& > strong': {
          fontSize: '14px',
          paddingTop: '8px',
        },
      },
    },
    burstButton: {
      fontFamily: poppinsFont,
      display: 'flex',
      float: 'right',

      fontSize: '14px',
      '& svg': {marginRight: theme.spacing(1)},
    },
    closeModalButton: {
      position: 'absolute',
      right: theme.spacing(2),
      top: theme.spacing(2),
      padding: 0,
      color: theme.palette.common.black,
    },
    scheduleHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: theme.spacing(2),
      '&.readOnly': {
        justifyContent: 'flex-start',
        '& label:not(:first-child)': {
          marginLeft: theme.spacing(3),
        },
      },
    },
    inactiveBurstSaveButton: {
      border: 0,
      opacity: 0.7,
    },
    assessments: {
      width: '286px',
      flexGrow: 0,
      flexShrink: 0,
      padding: theme.spacing(1),
      backgroundColor: '#BCD5E4',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dialogTitle: {
      '& h2': {
        display: 'flex',
        alignItems: 'center',
      },
    },
    dialogAction: {
      paddingBottom: theme.spacing(8),
    },
    readOnly: {},
  })
)

export type SchedulerErrorType = {
  errors: any
  entity: any
}
type SchedulerProps = {
  id: string
  isReadOnly: boolean
  onShowFeedback: Function
}

/* default schedule is each session only has:
  -  one window without expiration that starts at 8am
  - "startEventIds": ["timeline_retrieved"],
  -  interval:  undefined
  - occurences: undefined
 */

function isScheduleDefault(schedule: Schedule) {
  for (var session of schedule.sessions) {
    const onlyTimelineRetrieved =
      session.startEventIds.length === 1 &&
      session.startEventIds[0] === JOINED_EVENT_ID

    const isSingleDefaultWindow =
      session.timeWindows.length === 1 &&
      session.timeWindows[0].startTime === '08:00' &&
      !session.timeWindows[0].expiration

    const isDefaultWindow =
      onlyTimelineRetrieved &&
      !session.interval &&
      !session.occurrences &&
      isSingleDefaultWindow

    if (!isDefaultWindow) {
      return false
    }
  }
  return true
}

const Scheduler: React.FunctionComponent<SchedulerProps> = ({
  id,
  children,
  isReadOnly,
  onShowFeedback,
}) => {
  const classes = useStyles()

  const {data: _study} = useStudy(id)
  const {data: _schedule, refetch} = useSchedule(id)
  const {data: timeline, isLoading: isTimelineLoading} = useTimeline(id)

  const {mutateAsync: mutateSchedule} = useUpdateSchedule()

  const {mutateAsync: mutateStudy} = useUpdateStudyDetail()

  const [hasBursts, setHasBursts] = React.useState(false)
  const [hasObjectChanged, setHasObjectChanged] = React.useState(false)
  const [schedulerErrors, setScheduleErrors] = React.useState<
    SchedulerErrorType[]
  >([])

  const handleError = useErrorHandler()
  const [saveLoader, setSaveLoader] = React.useState(false)

  const [schedule, setSchedule] = React.useState<Schedule | undefined>()
  const [study, setStudy] = React.useState<Study | undefined>()
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false)

  const [schedulerErrorState, setSchedulerErrorState] = React.useState(
    new Map<
      string,
      {
        generalErrorMessage: string[]
        sessionWindowErrors: Map<number, string>
        notificationErrors: Map<number, string>
      }
    >()
  )

  const [openModal, setOpenModal] = React.useState<
    'EVENTS' | 'BURSTS' | undefined
  >(undefined)
  const [openStudySession, setOpenStudySession] = React.useState<
    StudySession | undefined
  >()

  type SessionStartHandle = React.ElementRef<typeof SessionStartTab>
  const ref1 = React.useRef<SessionStartHandle>(null) // assign null makes it compatible with elements.

  type ConfigureBurstHandle = React.ElementRef<typeof ConfigureBurstTab>
  const ref2 = React.useRef<ConfigureBurstHandle>(null)

  React.useEffect(() => {
    const newErrorState = parseErrors(schedulerErrors)
    setSchedulerErrorState(newErrorState)
  }, [schedulerErrors])

  React.useEffect(() => {
    if (_schedule) {
      console.log('----setting schedule----')
      setSchedule({..._schedule})
    }
  }, [_schedule])

  React.useEffect(() => {
    if (_study) {
      setStudy({..._study})
    }
  }, [_study])

  if (!study || isTimelineLoading || !timeline || !schedule?.sessions) {
    return <LoadingComponent reqStatusLoading={true} />
  }

  const getOpenStudySession = () => {
    return schedule.sessions.find(s => s.guid === openStudySession!.guid)!
  }

  const onCancelSessionUpdate = () => {
    if (hasObjectChanged) {
      refetch()
      setSchedule(_schedule)
      setHasObjectChanged(false)
    }
    setScheduleErrors([])
    setOpenStudySession(undefined)
  }

  const onSave = async (isButtonPressed?: boolean) => {
    setScheduleErrors([])
    setSaveLoader(true)
    setHasBeenSaved(true)
    let error: Error | undefined = undefined
    try {
      await mutateSchedule({
        studyId: id,
        schedule,
        action: 'UPDATE',
      })
      if (_study && study.studyStartEventId !== _study.studyStartEventId) {
        console.log('updating study start event')
        const updatedStudy: Study = {
          ..._study,
          studyStartEventId: study.studyStartEventId,
        }
        await mutateStudy({study: updatedStudy})
      }
      setHasObjectChanged(false)
    } catch (e) {
      console.log('ERROR IN SCHEDULER', e)

      if ((e as ExtendedError).statusCode === 401) {
        handleError(e)
      }

      const entity = (e as SchedulerErrorType).entity
      const errors = (e as SchedulerErrorType).errors
      // This can occur when a request fails due to reasons besides bad user input.
      if (!errors || !entity) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        error = e as ExtendedError
      } else {
        const errorObject = {
          entity: entity,
          errors: errors,
        }
        error = new Error('!')
        setScheduleErrors(prev => [...prev, errorObject])
      }
      setSaveLoader(false)
      throw e
    } finally {
      if (isButtonPressed) {
        onShowFeedback(error)
      }
      setSaveLoader(false)
    }
  }

  function parseErrors(_schedulerErrors: SchedulerErrorType[]) {
    const newErrorState = new Map()
    for (const error of _schedulerErrors) {
      const {entity, errors} = error
      const ks = Object.keys(errors)
      ks.forEach((key, index) => {
        const keyArr = key.split('.')
        //first session, timewindow, message
        var numberPattern = /\d+/g
        let windowIndex
        let notificationIndex
        const sessionIndex = _.first(keyArr[0]?.match(numberPattern))
        // This should not happen
        if (!sessionIndex) return
        // if 3 levels - assume window
        if (keyArr.length > 2) {
          if (keyArr[1].startsWith('notifications')) {
            // notfication error
            notificationIndex = _.first(keyArr[1]?.match(numberPattern))
          } else {
            // assume window error
            windowIndex = _.first(keyArr[1]?.match(numberPattern))
          }
        }
        const errorType = keyArr[keyArr.length - 1]
        const currentError = errors[key]
        const errorMessage = currentError
          .map((error: string) => error.replace(key, ''))
          .join(',')

        const sessionName = entity.sessions[sessionIndex[0]].name
        const wholeErrorMessage = errorType + errorMessage

        const windowNumber = windowIndex ? parseInt(windowIndex) + 1 : undefined
        const notificationNumber = notificationIndex
          ? parseInt(notificationIndex) + 1
          : undefined
        const sessionKey = `${sessionName}-${parseInt(sessionIndex) + 1}`

        let currentErrorState: any
        if (newErrorState.has(sessionKey)) {
          currentErrorState = newErrorState.get(sessionKey)
        } else {
          currentErrorState = {
            generalErrorMessage: [],
            sessionWindowErrors: new Map<number, string>(),
            notificationErrors: new Map<number, string>(),
          }
        }

        if (windowNumber) {
          currentErrorState?.sessionWindowErrors.set(
            windowNumber,
            wholeErrorMessage
          )
        } else if (notificationNumber) {
          currentErrorState?.notificationErrors.set(
            notificationNumber,
            wholeErrorMessage
          )
        } else {
          currentErrorState!.generalErrorMessage.push(wholeErrorMessage)
        }
        newErrorState.set(sessionKey, currentErrorState)
      })
    }
    return newErrorState
  }

  //setting new state
  const updateScheduleData = (schedule: Schedule) => {
    setSchedule(schedule)
    console.log('updated')
    setHasObjectChanged(true)
  }

  function getSessionCustomStartEvent(session: StudySession | undefined) {
    if (!session) {
      return undefined
    }
    const startEventId =
      session.startEventIds?.length > 0 ? session.startEventIds[0] : undefined
    if (startEventId === JOINED_EVENT_ID) {
      return undefined
    }
    return startEventId
  }

  const sessionHasCriticalStudyStartEvent = (session: StudySession) => {
    if (study.studyStartEventId === JOINED_EVENT_ID) {
      return false
    }

    const otherSessionCanStartStudy = schedule.sessions.find(
      s =>
        s.guid !== session.guid &&
        getSessionCustomStartEvent(s) === study.studyStartEventId
    )
    return otherSessionCanStartStudy === undefined
  }

  const scheduleUpdateFn = (action: SessionScheduleAction) => {
    if (action.payload.shouldInvalidateBurst) {
      const studyStartedFromEventId =
        study.studyStartEventId ===
        getSessionCustomStartEvent(
          schedule.sessions.find(s => s.guid === action.payload.sessionId)
        )
      //start event id has changed
      //see if the old session startEventId is study start event Id, and if no other session Has It
      //it is it -- update the study to start with the new starteventId
    }
    const sessions = actionsReducer(schedule.sessions!, action)
    const newSchedule = {...schedule, sessions}

    updateScheduleData(newSchedule)
  }

  const getEventsInSchedule = (): string[] => {
    const startEventIds = schedule.sessions.reduce((prev, curr) => {
      const sessonCustomEvent = getSessionCustomStartEvent(curr)
      if (sessonCustomEvent && !prev.includes(sessonCustomEvent)) {
        return [...prev, sessonCustomEvent]
      } else {
        return prev
      }
    }, [] as string[])

    const studyBurstId =
      schedule.studyBursts && schedule.studyBursts.length > 0
        ? schedule.studyBursts[0].originEventId
        : undefined
    if (studyBurstId !== undefined) {
      startEventIds.push(studyBurstId)
    }
    return startEventIds
  }

  const updateStudyStartEventId = (eventId: string) => {
    setStudy({
      ...study,
      studyStartEventId: eventId,
    })
  }

  if (_.isEmpty(schedule.sessions)) {
    return (
      <Box textAlign="center" mx="auto">
        <ErrorDisplay>
          You need to create sessions before creating the schedule
        </ErrorDisplay>
      </Box>
    )
  }

  return (
    <>
      <Box>
        <NavigationPrompt when={hasObjectChanged} key="prompt">
          {({onConfirm, onCancel}) => (
            <ConfirmationDialog
              isOpen={hasObjectChanged}
              type={'NAVIGATE'}
              onCancel={onCancel}
              onConfirm={onConfirm}
            />
          )}
        </NavigationPrompt>
        <div>{saveLoader && <CircularProgress />}</div>
        <Box textAlign="left" key="content">
          <div
            className={clsx(classes.scheduleHeader, isReadOnly && 'readOnly')}
            key="intro">
            {!isReadOnly ? (
              <Box>
                <FormControlLabel
                  classes={{label: classes.labelDuration}}
                  label="Study duration:"
                  labelPlacement="start"
                  control={
                    <Duration
                      maxDurationDays={1825}
                      isShowClear={false}
                      onChange={e => {
                        updateScheduleData({
                          ...schedule,
                          duration: e.target.value,
                        })
                      }}
                      durationString={schedule.duration || ''}
                      unitLabel="study duration unit"
                      numberLabel="study duration number"
                      unitData={DWsEnum}></Duration>
                  }
                />{' '}
                {getEventsInSchedule().length > 0 && (
                  <FormControlLabel
                    classes={{label: classes.labelDuration}}
                    label="Start Study on:"
                    style={{marginRight: '8px'}}
                    labelPlacement="start"
                    control={
                      <StudyStartEvent
                        value={study.studyStartEventId || ''}
                        eventIdsInSchedule={getEventsInSchedule()}
                        eventsInStudy={study.customEvents?.map(e => e.eventId)}
                        onChangeFn={(startEventId: string) =>
                          updateStudyStartEventId(startEventId)
                        }
                      />
                    }
                  />
                )}
                <DialogButtonPrimary
                  onClick={() => onSave(true)}
                  style={{
                    padding: '4px 8px',
                    marginTop: '-1px',
                    borderColor: 'transparent',
                  }}>
                  {' '}
                  Save Changes
                </DialogButtonPrimary>
                <Box
                  fontSize="12px"
                  ml={2}
                  fontFamily={latoFont}
                  fontWeight="bold">
                  The study duration must be shorter than 5 years.
                </Box>
              </Box>
            ) : (
              <>
                <div className={clsx(classes.labelDuration, classes.readOnly)}>
                  <span>Study duration:</span>
                  <strong>
                    {schedule.duration
                      ? getFormattedTimeDateFromPeriodString(schedule.duration)
                      : 'No duration set'}
                  </strong>
                </div>

                <div className={clsx(classes.labelDuration, classes.readOnly)}>
                  <span>Study starts on:</span>
                  <strong>
                    {study.studyStartEventId
                      ? EventService.formatEventIdForDisplay(
                          study.studyStartEventId
                        )
                      : 'unkonwn'}
                  </strong>
                </div>
              </>
            )}

            {hasObjectChanged && (
              <div
                style={{
                  position: 'fixed',
                  zIndex: 2000,
                  right: '10px',
                  top: '5px',
                  fontSize: '12px',
                }}>
                schedule changed ...
              </div>
            )}
          </div>
          <Box bgcolor="#fff" p={2} pb={0} mt={3} key="scheduler">
            {!isReadOnly && (
              <Button
                disabled={isScheduleDefault(schedule) && !hasBeenSaved}
                className={classes.burstButton}
                onClick={() => setOpenModal('BURSTS')}>
                <BurstIcon
                  style={
                    isScheduleDefault(schedule) && !hasBeenSaved
                      ? {opacity: '0.3'}
                      : {}
                  }
                />{' '}
                Configure Study Bursts
              </Button>
            )}
            {!timeline ? (
              <LoadingComponent reqStatusLoading={true} variant="small" />
            ) : (
              <ScheduleTimelineDisplay
                isDefault={isScheduleDefault(schedule) && !hasBeenSaved}
                studyId={id}
                timeline={timeline}
                onSelectSession={(session: StudySession) => {
                  setOpenStudySession(session)
                }}
                schedule={schedule}></ScheduleTimelineDisplay>
            )}
          </Box>
        </Box>
        {children}
      </Box>
      <Dialog open={openModal === 'EVENTS'} maxWidth="md" scroll="body">
        <DialogTitle
          className={classes.dialogTitle}
          style={{
            backgroundColor: '#f8f8f8',
          }}>
          <EditIcon />
          &nbsp;&nbsp; Edit Event Drop Down
          <IconButton
            aria-label="close"
            className={classes.closeModalButton}
            onClick={() => setOpenModal(undefined)}
            size="large">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{padding: 0, overflowY: 'visible'}}>
          <SessionStartTab
            ref={ref1}
            study={study!}
            eventIdsInSchedule={_.uniq(
              ScheduleService.getEventsForTimeline(timeline!).map(
                e => e.eventId
              )
            )}
            onNavigate={() => setOpenModal(undefined)}
          />
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <DialogButtonSecondary onClick={() => setOpenModal(undefined)}>
            Cancel
          </DialogButtonSecondary>

          <DialogButtonPrimary
            onClick={() => {
              ref1.current?.save()
            }}>
            Save Changes
          </DialogButtonPrimary>
        </DialogActions>
      </Dialog>
      <Dialog open={openStudySession !== undefined} maxWidth="lg" scroll="body">
        <DialogContent style={{padding: 0}}>
          {openStudySession && !isReadOnly && (
            <Box
              className={classes.sessionContainer}
              key={getOpenStudySession().guid}
              border={
                schedulerErrorState.get(
                  `${openStudySession.name}-${
                    schedule.sessions.findIndex(
                      s => s.guid === openStudySession.guid
                    ) + 1
                  }`
                )
                  ? `1px solid ${theme.palette.error.main}`
                  : ''
              }>
              <IconButton
                aria-label="close"
                className={classes.closeModalButton}
                onClick={() => onCancelSessionUpdate()}
                size="large">
                <CloseIcon />
              </IconButton>
              <Box className={classes.assessments}>
                <AssessmentList
                  studySessionIndex={schedule.sessions.findIndex(
                    s => s.guid === openStudySession.guid
                  )}
                  studySession={getOpenStudySession()}
                  onChangePerformanceOrder={(
                    performanceOrder: PerformanceOrder
                  ) => {
                    const schedule = {
                      ...getOpenStudySession(),
                      performanceOrder,
                    }

                    scheduleUpdateFn({
                      type: ActionTypes.UpdateSessionSchedule,
                      payload: {
                        sessionId: getOpenStudySession().guid!,
                        schedule,
                      },
                    })
                  }}
                  performanceOrder={
                    getOpenStudySession().performanceOrder || 'sequential'
                  }
                />
              </Box>
              {/* This is what is being displayed as the card */}
              <SchedulableSingleSessionContainer
                onOpenEventsEditor={() => setOpenModal('EVENTS')}
                key={getOpenStudySession().guid}
                customEvents={study?.customEvents}
                studySession={getOpenStudySession()}
                hasCriticalStartEvent={sessionHasCriticalStudyStartEvent(
                  getOpenStudySession()
                )}
                burstOriginEventId={
                  _.first(schedule.studyBursts)?.originEventId
                }
                onUpdateSessionSchedule={(
                  session: StudySession,
                  shouldInvalidateBurst: boolean,
                  shouldUpdaeStudyStartEvent: boolean
                ) => {
                  if (
                    shouldUpdaeStudyStartEvent &&
                    session.startEventIds.length > 0 &&
                    session.startEventIds[0]
                  ) {
                    console.log('UPDAING')
                    updateStudyStartEventId(session.startEventIds[0])
                  }
                  scheduleUpdateFn({
                    type: ActionTypes.UpdateSessionSchedule,
                    payload: {
                      sessionId: getOpenStudySession().guid!,
                      schedule: session,
                      shouldInvalidateBurst,
                    },
                  })
                }}
                sessionErrorState={schedulerErrorState.get(
                  `${getOpenStudySession().name}-${
                    schedule.sessions.findIndex(
                      s => s.guid === openStudySession.guid
                    ) + 1
                  }`
                )}></SchedulableSingleSessionContainer>
            </Box>
          )}
          {openStudySession && isReadOnly && (
            <>
              <IconButton
                aria-label="close"
                className={classes.closeModalButton}
                onClick={() => onCancelSessionUpdate()}
                size="large">
                <CloseIcon />
              </IconButton>
              <ReadOnlyScheduler
                originEventId={_.first(schedule.studyBursts)?.originEventId}
                session={openStudySession}
                studySessionIndex={schedule.sessions.findIndex(
                  s => s.guid === openStudySession.guid
                )}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!isReadOnly ? (
            <DialogButtonSecondary onClick={() => onCancelSessionUpdate()}>
              Cancel
            </DialogButtonSecondary>
          ) : (
            <DialogButtonPrimary onClick={() => onCancelSessionUpdate()}>
              Close
            </DialogButtonPrimary>
          )}

          {!isReadOnly && (
            <DialogButtonPrimary
              onClick={() => {
                onSave(true).then(() => setOpenStudySession(undefined))
              }}>
              {saveLoader ? <CircularProgress /> : <span>Save Changes</span>}
            </DialogButtonPrimary>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openModal === 'BURSTS'} maxWidth="md" scroll="body">
        <DialogTitle className={classes.dialogTitle}>
          <BurstIcon />
          &nbsp;&nbsp; Configure Study bursts
          <IconButton
            aria-label="close"
            className={classes.closeModalButton}
            onClick={() => setOpenModal(undefined)}
            size="large">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{padding: 0}}>
          <ConfigureBurstTab
            hasBursts={hasBursts}
            onSetHasBursts={setHasBursts}
            schedule={schedule}
            ref={ref2}
            id={study!.identifier}
            onNavigate={() => setOpenModal(undefined)}
          />
        </DialogContent>
        <DialogActions>
          <DialogButtonSecondary onClick={() => setOpenModal(undefined)}>
            Cancel
          </DialogButtonSecondary>

          <DialogButtonPrimary
            disabled={!!!hasBursts && schedule.studyBursts?.length === 0}
            className={
              !!!hasBursts && schedule.studyBursts?.length === 0
                ? classes.inactiveBurstSaveButton
                : ''
            }
            onClick={() => {
              ref2.current?.save()
            }}>
            Update burst to Schedule
          </DialogButtonPrimary>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Scheduler

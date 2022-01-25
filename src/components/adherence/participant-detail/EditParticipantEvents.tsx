import {
  useEvents,
  useEventsForUser,
  useUpdateEventsForUser,
} from '@components/studies/eventHooks'
import EditParticipantEventsForm from '@components/studies/participants/modify/EditParticipantEventsForm'
import DialogTitleWithClose from '@components/widgets/DialogTitleWithClose'
import ErrorDisplay from '@components/widgets/ErrorDisplay'
import {
  DialogButtonPrimary,
  DialogButtonSecondary,
} from '@components/widgets/StyledComponents'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
} from '@material-ui/core'
import {ParticipantEvent} from '@typedefs/types'
import React, {FunctionComponent} from 'react'

type EditParticipantEventsProps = {
  studyId: string
  participantId: string
  onCloseDialog: () => void
}

const EditParticipantEvents: FunctionComponent<EditParticipantEventsProps> = ({
  studyId,
  participantId,
  onCloseDialog,
}) => {
  const [participantEvents, setParticipantEvents] = React.useState<
    ParticipantEvent[]
  >([])

  const {data: scheduleEvents = [], error: eventError} = useEvents(studyId)
  const {data: events} = useEventsForUser(studyId, participantId)

  React.useEffect(() => {
    if (events) {
      setParticipantEvents(events.customEvents)
    }
  }, [events])

  const r = useUpdateEventsForUser()

  const {isSuccess, isError, isIdle, error, mutate: updateEvents} = r
  console.log('r', r)
  return (
    <Dialog open={true} scroll="body">
      <DialogTitleWithClose
        onCancel={onCloseDialog}
        title="Edit Participant Event Date"
        isSmallTitle={true}
      />
      <DialogContent>
        <EditParticipantEventsForm
          hideLoginEvent={true}
          scheduleEvents={scheduleEvents}
          onChange={customEvents => {
            setParticipantEvents(customEvents)
          }}
          customParticipantEvents={
            participantEvents || ([] as ParticipantEvent[])
          }
        />
      </DialogContent>
      {isError && (
        <ErrorDisplay style={{padding: '0 24px'}}>
          {(error as Error).message}
        </ErrorDisplay>
      )}
      <DialogActions>
        <DialogButtonSecondary onClick={onCloseDialog}>
          Cancel
        </DialogButtonSecondary>
        <DialogButtonPrimary
          onClick={() => {
            const previousEvents = events?.customEvents
            const updatedEvents = participantEvents
            //only update changes events
            const eventsToUpdate = updatedEvents.filter(ue => {
              const matchedEvent = events?.customEvents.find(
                e => e.eventId === ue.eventId
              )
              return !matchedEvent || matchedEvent.timestamp !== ue.timestamp
            })
            console.log(eventsToUpdate.map(e => e.eventId).join(','), 'update')
            updateEvents(
              {
                studyId,
                participantId,
                customEvents: eventsToUpdate,
              },
              {
                onSuccess: () => {
                  onCloseDialog()
                },
              }
            )
          }}
          color="primary">
          {isIdle || isError ? <> Save Changes</> : <CircularProgress />}
        </DialogButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}

export default EditParticipantEvents

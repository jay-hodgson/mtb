import {Box, MenuItem} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import React, {FunctionComponent, useEffect} from 'react'
import {StudySession} from '../../../types/scheduling'
import {
  BlueButton,
  ButtonWithSelectButton,
  ButtonWithSelectSelect,
} from '../../widgets/StyledComponents'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    flexShrink: 0,
    paddingTop: theme.spacing(2),
  },
  label: {
    fontSize: 18,
    textTransform: 'uppercase',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    whiteSpace: 'nowrap',
  },
}))

type SessionActionButtonsProps = {
  onAddSession: Function
  sessions: StudySession[]
  disabled?: boolean
}

const SessionActionButtons: FunctionComponent<SessionActionButtonsProps> = ({
  onAddSession,
  sessions,
  disabled,
}: SessionActionButtonsProps) => {
  const classes = useStyles()
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | undefined
  >(sessions.length > 0 ? sessions[0].guid : undefined)

  useEffect(() => {
    setSelectedSessionId(sessions.length > 0 ? sessions[0].guid : undefined)
  }, [sessions.length, sessions])

  const duplicateSession = (selectedId?: string) => {
    const session = sessions.find(s => s.guid === selectedId)
    const name = session?.name ? session.name + ' (copy)' : undefined

    if (
      !selectedId ||
      !session?.assessments ||
      session.assessments.length === 0
    ) {
      onAddSession(sessions, [], name)
    } else {
      onAddSession(sessions, [...session.assessments], name)
    }
  }

  return (
    <Box className={classes.root}>
      <BlueButton
        disabled={disabled}
        key="add_session"
        variant="contained"
        color="secondary"
        onClick={() => onAddSession(sessions, [])}>
        + Create new session
      </BlueButton>

      {selectedSessionId && (
        <>
          <ButtonWithSelectSelect
            key="session_select"
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value as string)}
            displayEmpty
            color="secondary"
            variant="filled"
            inputProps={{'aria-label': 'Select Sessions'}}
            disableUnderline={true}>
            {sessions.map((session, index) => (
              <MenuItem
                value={session.guid}
                key={`${session.guid}menu${index}`}>
                {session.name}
              </MenuItem>
            ))}
          </ButtonWithSelectSelect>

          <ButtonWithSelectButton
            disabled={disabled}
            key="duplicate_session"
            variant="contained"
            color="secondary"
            onClick={() => duplicateSession(selectedSessionId)}>
            Duplicate
          </ButtonWithSelectButton>
        </>
      )}
    </Box>
  )
}

export default SessionActionButtons

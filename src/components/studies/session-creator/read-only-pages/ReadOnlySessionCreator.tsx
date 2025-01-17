import AssessmentSmall from '@components/assessments/AssessmentSmall'
import SessionIcon from '@components/widgets/SessionIcon'
import {Box, Paper} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import ClockIcon from '@mui/icons-material/AccessTime'
import {StudySession} from '@typedefs/scheduling'
import clsx from 'clsx'
import React, {FunctionComponent} from 'react'
import {useStyles as SharedSessionCreatorStyles} from '../SessionCreator'
import {
  getTotalSessionTime,
  useStyles as SessionContainerStyles,
} from '../SingleSessionContainer'

type ReadOnlySessionCreatorProps = {
  sessions: StudySession[]
  children: React.ReactNode
  isReadOnly?: boolean
}

const useStyles = makeStyles(theme => ({
  assessmentContainer: {
    marginRight: theme.spacing(2),
    backgroundColor: '#f2f2f2',
    paddingBottom: theme.spacing(5),
  },
}))

const ReadOnlySessionCreator: FunctionComponent<ReadOnlySessionCreatorProps> =
  ({sessions, children}) => {
    const classes = useStyles()
    const sessionCreatorClasses = SharedSessionCreatorStyles()
    const sessionContainerClasses = SessionContainerStyles()
    if (sessions) {
      return (
        <>
          <Box className={sessionCreatorClasses.root} key="sessions">
            {sessions.map((session, index) => (
              <Paper
                className={clsx(
                  sessionCreatorClasses.sessionContainer,
                  classes.assessmentContainer
                )}
                key={session.guid! + index}>
                {/* session header */}
                <Box className={sessionContainerClasses.inner}>
                  <Box marginRight={2}>
                    <SessionIcon index={index} symbolKey={session.symbol}>
                      <Box>{session.name}</Box>
                    </SessionIcon>
                  </Box>
                  <Box fontSize="12px" textAlign="right">
                    {getTotalSessionTime(session.assessments) || 0} min &nbsp;
                    <ClockIcon
                      style={{
                        fontSize: '12px',
                        verticalAlign: 'middle',
                      }}></ClockIcon>
                  </Box>
                </Box>
                {/* assessments inside each session */}
                <div className={sessionContainerClasses.droppable}>
                  {session.assessments?.map((assessment, index) => (
                    <AssessmentSmall
                      hasHover={false}
                      key={index}
                      assessment={assessment}
                      isDragging={false}></AssessmentSmall>
                  ))}
                </div>
                <Box borderTop="1px solid black" width="100%"></Box>
              </Paper>
            ))}
          </Box>
          {children}
        </>
      )
    } else return <>should not happen</>
  }

export default ReadOnlySessionCreator

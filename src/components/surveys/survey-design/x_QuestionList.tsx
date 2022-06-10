import {Box, Button} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import {Step} from '@typedefs/surveys'
import clsx from 'clsx'
import React, {FunctionComponent} from 'react'
import {QuestionTypeKey} from './left-panel/QuestionConfigs'

const useStyles = makeStyles(theme => ({
  root: {},
  active: {
    border: '1px solid blue',
  },
}))

type QuestionListOwnProps = {
  steps: Step[]
  currentStepIndex?: number
  onAdd: (a: QuestionTypeKey) => void
  onNavigate: (id: string) => void
}

type QuestionListProps = QuestionListOwnProps

const QuestionList: FunctionComponent<QuestionListProps> = ({
  steps,
  onAdd,
  currentStepIndex,
  onNavigate,
}) => {
  const classes = useStyles()
  console.log(currentStepIndex)
  const getNonEmptySteps = () => steps.filter(s => s.title)
  return (
    <Box bgcolor="#F8F8F8" px={5} border="1px solid black">
      Question here QuestionList
      <ul>
        {getNonEmptySteps().map((step, index) => (
          <li key={step.identifier}>
            <Button
              className={clsx(index === currentStepIndex && classes.active)}
              variant="text"
              onClick={() => {
                onNavigate(step.identifier)
              }}>
              {step.title}
            </Button>
          </li>
        ))}
      </ul>
    </Box>
  )
}
export default QuestionList
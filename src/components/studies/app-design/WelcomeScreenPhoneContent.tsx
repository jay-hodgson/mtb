import {Box} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import {latoFont, playfairDisplayFont} from '@style/theme'
import {WelcomeScreenData} from '@typedefs/types'
import clsx from 'clsx'
import React from 'react'
import SectionIndicator from './widgets/SectionIndicator'

const useStyles = makeStyles(theme => ({
  phoneInner: {
    marginLeft: theme.spacing(0.75),
    marginRight: theme.spacing(0.5),
    padding: theme.spacing(4),
    textAlign: 'left',
    minHeight: `475px`,
    paddingTop: theme.spacing(5.5),
  },
  sectionThreeIndicatorPosition: {
    position: 'absolute',
    marginLeft: theme.spacing(-6),
    marginTop: theme.spacing(-0.25),
  },
  headlineStyle: {
    fontFamily: playfairDisplayFont,
    fontStyle: 'italic',
    fontWeight: 'normal',
    fontSize: '21px',
    lineHeight: '28px',
    whiteSpace: 'pre-line',
  },
  fromText: {
    marginTop: theme.spacing(1),
  },
  bodyText: {
    fontFamily: latoFont,
    fontWeight: 'normal',
    fontSize: '15px',
    lineHeight: '18px',
    marginTop: theme.spacing(3),
    whiteSpace: 'pre-line',
  },
  salutationText: {
    marginTop: theme.spacing(5),
  },
  disclaimerText: {
    marginTop: theme.spacing(10),
    fontStyle: 'italic',
  },
}))

type WelcomeScreenPhoneContentProps = {
  welcomeScreenContent: WelcomeScreenData
  studyTitle: string
  isReadOnly?: boolean
}

const WelcomeScreenPhoneContent: React.FunctionComponent<WelcomeScreenPhoneContentProps> =
  ({welcomeScreenContent, studyTitle, isReadOnly}) => {
    const classes = useStyles()
    const defaultStudyBody =
      'We are excited that you will be participating. We hope that you find this study helpful.'
    const defaultSalutations = 'Sincerely,'
    const defaultFrom = `The ${studyTitle} team`

    return (
      <Box className={classes.phoneInner}>
        {!welcomeScreenContent.isUsingDefaultMessage && !isReadOnly && (
          <SectionIndicator
            index={3}
            className={classes.sectionThreeIndicatorPosition}
          />
        )}
        <Box className={classes.headlineStyle}>
          {welcomeScreenContent.isUsingDefaultMessage
            ? 'Welcome to \n' + studyTitle + '!'
            : welcomeScreenContent.welcomeScreenHeader || 'Main Header'}
        </Box>
        <p className={clsx(classes.bodyText)}>
          {welcomeScreenContent.isUsingDefaultMessage
            ? defaultStudyBody
            : welcomeScreenContent.welcomeScreenBody || 'Body Copy'}
        </p>
        <Box className={clsx(classes.bodyText, classes.salutationText)}>
          {welcomeScreenContent.isUsingDefaultMessage
            ? defaultSalutations
            : welcomeScreenContent.welcomeScreenSalutation || 'Salutation,'}
        </Box>
        <Box className={clsx(classes.bodyText, classes.fromText)}>
          {welcomeScreenContent.isUsingDefaultMessage
            ? defaultFrom
            : welcomeScreenContent.welcomeScreenFromText || 'Study Team Name'}
        </Box>
        {welcomeScreenContent.isUsingDefaultMessage && (
          <Box className={clsx(classes.bodyText, classes.disclaimerText)}>
            This is a research Study. It does not provide medical advice,
            diagnosis, or treatment.
          </Box>
        )}
      </Box>
    )
  }

export default WelcomeScreenPhoneContent

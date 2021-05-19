import React from 'react'
import { makeStyles } from '@material-ui/core'
import Subsection from './Subsection'
import {
  Box,
  CircularProgress,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
} from '@material-ui/core'
import { StudyAppDesign, Contact } from '../../../types/types'
import { AppDesignUpdateTypes } from './AppDesign'
import { isInvalidPhone, isValidEmail } from '../../../helpers/utility'
import clsx from 'clsx'
import SaveButton from '../../widgets/SaveButton'
import { makePhone } from '../../../helpers/utility'
import FormGroupWrapper from './FormGroupWrapper'
import TextInputWrapper from './TextInputWrapper'
import { ContactType } from './AppDesign'

const useStyles = makeStyles(theme => ({
  irbInputFormControl: {
    width: '100%',
    marginBottom: theme.spacing(1.5),
  },
  irbInput: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  errorText: {
    marginTop: theme.spacing(-0.5),
  },
}))

type IrbBoardContactSectionProps = {
  appDesignProperties: StudyAppDesign
  setAppDesignProperties: Function
  updateAppDesignInfo: Function
  SimpleTextInputStyles: React.CSSProperties
  irbNameSameAsInstitution: boolean
  getContactPersonObject: (type: ContactType) => Contact
  setIrbNameSameAsInstitution: Function
  phoneNumberErrorState: {
    isGeneralContactPhoneNumberValid: boolean
    isIrbPhoneNumberValid: boolean
  }
  setPhoneNumberErrorState: Function
  irbPhoneNumber: string
  setIrbPhoneNumber: Function
  emailErrorState: {
    isGeneralContactEmailValid: boolean
    isIrbEmailValid: boolean
  }
  setEmailErrorState: Function
  saveLoader: boolean
  saveInfo: Function
}

const IrbBoardContactSection: React.FunctionComponent<IrbBoardContactSectionProps> = ({
  appDesignProperties,
  setAppDesignProperties,
  updateAppDesignInfo,
  SimpleTextInputStyles,
  irbNameSameAsInstitution,
  getContactPersonObject,
  setIrbNameSameAsInstitution,
  phoneNumberErrorState,
  setPhoneNumberErrorState,
  irbPhoneNumber,
  setIrbPhoneNumber,
  emailErrorState,
  setEmailErrorState,
  saveLoader,
  saveInfo,
}) => {
  const classes = useStyles()
  return (
    <Subsection heading="IRB or Ethics Board Contact">
      <Box
        width="80%"
        mt={1.5}
        fontSize="15px"
        lineHeight="18px"
        fontFamily="Lato"
        mb={2}
      >
        For questions about your rights as a research participant in this study,
        please contact :
      </Box>
      <FormGroupWrapper>
        <Box pl={0.25} mt={1}>
          What is your IRB of record?*
        </Box>
        <Box width="100%" boxSizing="border-box" mt={1} pl={6} pr={1}>
          <RadioGroup
            aria-label="gender"
            value={
              irbNameSameAsInstitution
                ? 'affiliation_same'
                : 'affiliation_other'
            }
            onChange={e => {
              if (e.target.value === 'affiliation_same') {
                const studyLeadObject = getContactPersonObject(
                  'LEAD_INVESTIGATOR',
                )
                const newEthicsBoardObject = getContactPersonObject(
                  'ETHICS_BOARD',
                )
                newEthicsBoardObject.name = studyLeadObject.affiliation || ''
                setAppDesignProperties({
                  ...appDesignProperties,
                  ethicsBoardInfo: newEthicsBoardObject,
                })
              }
              setIrbNameSameAsInstitution(e.target.value === 'affiliation_same')
            }}
            style={{ marginBottom: '8px' }}
          >
            <FormControlLabel
              value="affiliation_same"
              control={<Radio />}
              label="Same Institutional Affiliation"
            />
            <FormControlLabel
              value="affiliation_other"
              control={<Radio />}
              label="Other"
            />
          </RadioGroup>
          <FormControl className={classes.irbInputFormControl}>
            <TextInputWrapper
              SimpleTextInputStyles={
                {
                  fontSize: '15px',
                  width: '100%',
                  height: '44px',
                  boxSizing: 'border-box',
                } as React.CSSProperties
              }
              id="ethics-board-input"
              placeholder="Name IRB of record"
              value={appDesignProperties.ethicsBoardInfo?.name || ''}
              onChange={(
                e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
              ) => {
                const newEthicsBoardBoard = getContactPersonObject(
                  'ETHICS_BOARD',
                )
                newEthicsBoardBoard.name = e.target.value
                setAppDesignProperties({
                  ...appDesignProperties,
                  ethicsBoardInfo: newEthicsBoardBoard,
                })
              }}
              onBlur={() =>
                updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_STUDY_CONTACTS)
              }
              rows={1}
              rowsMax={1}
              multiline={false}
              titleText=""
              readOnly={irbNameSameAsInstitution}
            />
          </FormControl>
        </Box>
        <FormControl
          className={clsx(
            !phoneNumberErrorState.isIrbPhoneNumberValid && 'error',
          )}
        >
          <TextInputWrapper
            SimpleTextInputStyles={SimpleTextInputStyles}
            id="ethics-phone-number-input"
            placeholder="xxx-xxx-xxxx"
            value={irbPhoneNumber}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
            ) => {
              setIrbPhoneNumber(e.target.value)
            }}
            onBlur={() => {
              const isInvalidPhoneNumber =
                isInvalidPhone(irbPhoneNumber) && irbPhoneNumber !== ''
              setPhoneNumberErrorState(
                (prevState: typeof phoneNumberErrorState) => {
                  return {
                    ...prevState,
                    isIrbPhoneNumberValid: !isInvalidPhoneNumber,
                  }
                },
              )
              const newEthicsBoardObject = getContactPersonObject(
                'ETHICS_BOARD',
              )
              newEthicsBoardObject.phone = makePhone(irbPhoneNumber)
              setAppDesignProperties({
                ...appDesignProperties,
                ethicsBoardInfo: newEthicsBoardObject,
              })
            }}
            multiline
            rows={1}
            rowsMax={1}
            titleText="Phone Number*"
          />
          {!phoneNumberErrorState.isIrbPhoneNumberValid && (
            <FormHelperText
              id="ethics-phone-text"
              className={classes.errorText}
            >
              phone should be in the format: xxx-xxx-xxxx
            </FormHelperText>
          )}
        </FormControl>
        <FormControl
          className={clsx(!emailErrorState.isIrbEmailValid && 'error')}
        >
          <TextInputWrapper
            SimpleTextInputStyles={SimpleTextInputStyles}
            id="ethics-email-input"
            placeholder="Institutional Email"
            value={appDesignProperties.ethicsBoardInfo?.email || ''}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
            ) => {
              const newEthicsBoardObject = getContactPersonObject(
                'ETHICS_BOARD',
              )
              newEthicsBoardObject.email = e.target.value
              setAppDesignProperties({
                ...appDesignProperties,
                ethicsBoardInfo: newEthicsBoardObject,
              })
            }}
            onBlur={() => {
              const validEmail =
                isValidEmail(
                  appDesignProperties.ethicsBoardInfo?.email || '',
                ) || !appDesignProperties.ethicsBoardInfo?.email
              setEmailErrorState((prevState: typeof emailErrorState) => {
                return {
                  ...prevState,
                  isIrbEmailValid: validEmail,
                }
              })
              updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_STUDY_CONTACTS)
            }}
            multiline
            rows={1}
            rowsMax={1}
            titleText="Email*"
          />
          {!emailErrorState.isIrbEmailValid && (
            <FormHelperText
              id="ethics-email-text"
              className={classes.errorText}
            >
              email should be in a valid format such as: example@placeholder.com
            </FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <TextInputWrapper
            SimpleTextInputStyles={SimpleTextInputStyles}
            id="IRB-approval-input"
            placeholder="XXXXXXXXXX"
            value={appDesignProperties.irbProtocolId}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
            ) => {
              setAppDesignProperties({
                ...appDesignProperties,
                irbProtocolId: e.target.value,
              })
            }}
            onBlur={() =>
              updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_STUDY_IRB_NUMBER)
            }
            multiline
            rows={1}
            rowsMax={1}
            titleText="IRB Protocol ID*"
          />
        </FormControl>
      </FormGroupWrapper>
      <Box textAlign="left">
        {saveLoader ? (
          <div className="text-center">
            <CircularProgress color="primary" size={25} />
          </div>
        ) : (
          <SaveButton
            onClick={() => saveInfo()}
            id="save-button-study-builder-2"
          />
        )}
      </Box>
    </Subsection>
  )
}

export default IrbBoardContactSection

import {getDropdownTimeItems} from '@components/studies/scheduler/utility'
import {
  StyledCheckbox,
  StyledFormControl,
  StyledLabel14,
} from '@components/surveys/widgets/SharedStyled'
import {
  StyledDropDown,
  StyledDropDownItem,
} from '@components/surveys/widgets/StyledDropDown'
import AlertWithTextWrapper from '@components/widgets/AlertWithTextWrapper'
import {
  Box,
  FormControlLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  styled,
  Typography,
} from '@mui/material'
import {poppinsFont, theme} from '@style/theme'
import {FormatOptionsTime, Step, TimeQuestion} from '@typedefs/surveys'
import React, {ChangeEvent} from 'react'

const Labels = styled('div', {label: 'labels'})(({theme}) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(2, 1.5),
  marginTop: theme.spacing(2),

  '& > label': {
    marginBottom: theme.spacing(0.5),
    '& span': {
      width: '130px',
      display: 'inline-block',
    },
  },
}))

const ValueSelector: React.FunctionComponent<{
  value: string | undefined
  isDisabled: boolean
  type: 'MIN' | 'MAX'

  onChange: (value: string) => void
}> = ({value, type, isDisabled, onChange}) => {
  const CONFIG = {
    MIN: {
      label: 'Min Value',
      labelId: 'minValueLbl',
    },
    MAX: {
      label: 'Max Value',
      labelId: 'maxValueLbl',
    },
  }

  return (
    <StyledFormControl
      sx={{marginRight: theme.spacing(2), marginBottom: theme.spacing(2)}}>
      <StyledLabel14 mb={0.5} id={CONFIG[type].labelId}>
        {CONFIG[type].label}
      </StyledLabel14>

      <StyledDropDown
        labelId={CONFIG[type].labelId}
        value={value}
        height="42px"
        width="92px"
        disabled={isDisabled}
        //@ts-ignore
        onChange={(e: ChangeEvent<any>) => onChange(e.target.value)}
        input={<OutlinedInput />}>
        {Object.keys(getDropdownTimeItems()).map(opt => (
          <MenuItem value={opt} key={opt}>
            <StyledDropDownItem>
              <Box paddingLeft="13px">{opt}</Box>{' '}
            </StyledDropDownItem>
          </MenuItem>
        ))}
      </StyledDropDown>
    </StyledFormControl>
  )
}

type LimitType = 'PAST' | 'FUTURE' | 'NONE'

function getLimit(fo: FormatOptionsTime): LimitType {
  if (!fo.allowPast) {
    return 'PAST'
  }
  if (!fo.allowFuture) {
    return 'FUTURE'
  }
  return 'NONE'
}

const Time: React.FunctionComponent<{
  step: TimeQuestion
  onChange: (step: Step) => void
}> = ({step, onChange}) => {
  const [rangeDisabled, setRangeDisabled] = React.useState(
    step.inputItem.formatOptions?.minimumValue === undefined &&
      step.inputItem.formatOptions?.maximumValue === undefined
  )
  const [range, setRange] = React.useState<
    {min?: string; max?: string} | undefined
  >({
    min: step.inputItem.formatOptions?.minimumValue,
    max: step.inputItem.formatOptions?.maximumValue,
  })

  const [exclude, setExclude] = React.useState<LimitType>(
    getLimit(step.inputItem.formatOptions)
  )
  const onUpdateFormat = (fm: FormatOptionsTime) => {
    const inputItem = {...step.inputItem, formatOptions: fm}
    onChange({...step, inputItem})
  }
  const [error, setError] = React.useState('')

  const validate = (range: {min?: string; max?: string}) => {
    if (range.min === undefined || range.max === undefined) {
      return true
    }
    return range.max > range.min
  }

  React.useEffect(() => {
    setError(
      !range || validate(range) ? '' : 'Max value should be less than min value'
    )
  }, [range])

  const changeRangeDisabled = (val: boolean) => {
    setRangeDisabled(val)
    if (val) {
      setRange(undefined)
      setError('')
      //onUpdateFormat(undefined)
    }
  }
  return (
    <>
      <FormControlLabel
        sx={{mt: theme.spacing(1.5)}}
        control={
          <StyledCheckbox
            checked={rangeDisabled}
            onChange={e => changeRangeDisabled(e.target.checked)}
          />
        }
        label={
          <Typography sx={{fontFamily: poppinsFont, fontWeight: '14px'}}>
            No min and max validation!
          </Typography>
        }
      />
      <Box
        sx={{
          display: 'flex',
        }}>
        <ValueSelector
          type="MIN"
          isDisabled={rangeDisabled}
          value={range?.min}
          onChange={num => {
            const isValid = validate({min: num, max: range?.min})
            if (isValid) {
              onUpdateFormat({
                ...step.inputItem.formatOptions,
                minimumValue: num,
              })
            }
            setRange(prev => ({...(prev || {}), min: num}))
          }}
        />
        <ValueSelector
          type="MAX"
          isDisabled={rangeDisabled}
          value={range?.max}
          onChange={num => {
            const isValid = validate({min: range?.min, max: num})
            if (isValid) {
              onUpdateFormat({
                ...step.inputItem.formatOptions,
                maximumValue: num,
              })
            }
            setRange(prev => ({...(prev || {}), max: num}))
          }}
        />
      </Box>
      {error && <AlertWithTextWrapper text={error}></AlertWithTextWrapper>}
      <Labels>
        <RadioGroup
          id="exclude"
          value={exclude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setExclude(e.target.value as LimitType)
            const fo = {...step.inputItem.formatOptions}
            fo.allowFuture = e.target.value !== 'FUTURE'
            fo.allowPast = e.target.value !== 'PAST'
            onUpdateFormat(fo)
          }}>
          <FormControlLabel
            value="ALL"
            sx={{mt: theme.spacing(1.5), alignItems: 'center'}}
            control={<Radio />}
            label={'Allow any time value'}
          />
          <FormControlLabel
            value="FUTURE"
            sx={{alignItems: 'center'}}
            control={<Radio />}
            label={'Allow only time in the future'}
          />

          <FormControlLabel
            sx={{alignItems: 'center'}}
            value="NONE"
            control={<Radio />}
            label={'Allow only time in the past'}
          />
        </RadioGroup>
      </Labels>
      <Typography
        variant="body1"
        margin={(theme.spacing(3), 'auto', 'auto', theme.spacing(3))}>
        *The actual UI for this question will default to the system's OS
        interface.{' '}
      </Typography>
    </>
  )
}

export default Time

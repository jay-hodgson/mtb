import makeStyles from '@mui/styles/makeStyles'

export const useCommonStyles = makeStyles(theme => ({
  adherenceGrid: {
    padding: theme.spacing(2, 0),
  },
  sessionLegendIcon: {
    display: 'flex',

    '& svg': {
      width: '6px',
    },
  },
  adherenceLabel: {
    position: 'absolute',
    top: '-16px',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sessionRow: {
    margin: '4px 0',
    display: 'flex',
    alignItems: 'center',
    //  height: '16px',
  },
  eventRowForWeekSessions: {
    //  width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowForWeekSingleSession: {
    display: 'flex',
    // position: 'relative',
    // left: '-15px',
  },
  sessionWindows: {
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
    display: 'flex',
    minHeight: '20px',
  },
  dayCell: {
    padding: '0',
    borderRight: '1px solid black',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-start',
    '&.today': {
      backgroundColor: '#FFFF54',
    },
    '&:first-child': {
      borderLeft: '1px solid black',
    },
  },
  red: {
    color: '#E53828',
  },
}))

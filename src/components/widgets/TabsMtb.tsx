import DeleteIcon from '@mui/icons-material/Delete'
import {Menu, MenuItem, PopoverOrigin, Tab, Tabs} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import React, {FunctionComponent, SyntheticEvent} from 'react'
import EditableTextbox from './EditableTextbox'

const useStyles = makeStyles({
  tabRoot: {
    background: '#EfEfEf',
    marginRight: '20px',
  },
  tabSelected: {
    background: '#FFF',
    position: 'relative',
  },
  menuRoot: {
    padding: '10px 10px',
    fontSize: '14px',
  },

  deleteIcon: {
    position: 'absolute',
    zIndex: 10,

    right: 5,
    width: '.8em',
  },
  TabTitle: {
    position: 'absolute',
    background: '#FFF',
    width: '100%',

    padding: '0 20px',
  },
})

type TabProps = {
  handleChange: Function
  value: number
  tabDataObjects: {label: string; id?: string}[]
  addNewLabel?: string
  onDelete?: Function
  onRenameTab?: Function
  menuItems?: {
    label: string
    fn: Function
  }[]
}

const TabsMtb: FunctionComponent<TabProps> = ({
  handleChange,
  value,
  tabDataObjects,
  addNewLabel,
  menuItems,
  onDelete,

  onRenameTab = () => null,
  ...rest
}: TabProps) => {
  const classes = useStyles()

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  )

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    if (newValue !== -10) {
      console.log('Tab change newValue Tabs', newValue)
      handleChange(newValue)
    } else {
      //@ts-ignore
      setMenuAnchorEl(event.currentTarget)
    }
  }

  const menuOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'center',
  }
  const TabMenu = (): JSX.Element => {
    return (
      <Menu
        id="simple-menu"
        anchorEl={menuAnchorEl}
        anchorOrigin={menuOrigin}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}>
        {menuItems!.map((item, index) => (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null)
              item.fn()
            }}
            key={item.label}
            className={classes.menuRoot}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    )
  }

  return (
    <>
      <Tabs
        {...rest}
        value={value}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="disabled tabs example">
        {tabDataObjects.map((tab, index) => (
          <Tab
            key={tab.id}
            label={tab.label}
            icon={
              index === value ? (
                <>
                  {onDelete && (
                    <DeleteIcon
                      className={classes.deleteIcon}
                      onClick={(e: SyntheticEvent) => {
                        e.stopPropagation()
                        onDelete(tab.id)
                      }}></DeleteIcon>
                  )}
                  <div className={classes.TabTitle}>
                    <EditableTextbox
                      initValue={tab.label}
                      onTriggerUpdate={(newText: string) =>
                        onRenameTab(tab.id, newText)
                      }></EditableTextbox>
                  </div>
                </>
              ) : (
                <></>
              )
            }
            classes={{
              root: classes.tabRoot, // class name, e.g. `classes-nesting-root-x`
              selected: classes.tabSelected, // class name, e.g. `classes-nesting-label-x`
            }}
          />
        ))}
        {addNewLabel && (
          <Tab
            value={-10}
            label={addNewLabel}
            classes={{
              root: classes.tabRoot, // class name, e.g. `classes-nesting-root-x`
              selected: classes.tabSelected, // class name, e.g. `classes-nesting-label-x`
            }}
          />
        )}
      </Tabs>

      {menuItems && <TabMenu></TabMenu>}
    </>
  )
}

export default TabsMtb

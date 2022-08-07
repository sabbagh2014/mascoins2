import {
  AppBar,
  Toolbar,
  makeStyles,
  Button,
  IconButton,
  InputBase,
  Drawer,
  Grid,
  Avatar,
  MenuItem,
  Box,
  Container,
  List,
  Typography,
  fade,
  Menu,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import MenuIcon from '@material-ui/icons/Menu'
import React, { useState, useEffect, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Logo from './../../component/Logo'
import Dialog from '@material-ui/core/Dialog'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { ListItem } from '@material-ui/core'
import { AuthContext } from 'src/context/Auth'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    fontSize: '14px',
    lineHeight: '24px',
    fontWeight: '600',
    borderRadius: 0,
    minWidth: 'auto',
    color: '#080707',
    height: '31px',
    padding: '0px 7px',
    letterSpacing: '1px',
    '@media (max-width: 900px)': {
      fontStyle: 'normal',
      letterSpacing: '-0.6px',
      lineHeight: '24px',
      color: '#FFF',
      padding: '15px !important',
      height: '51px',
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    '&:active': {
      color: '#1ed760',
    },
  },
  menuButton1: {
    width: '100%',
  },
  login: {
    backgroundColor: '#0D8CCD',
    marginLeft: '10px',
  },
  loginButton: {
    height: '28px',

    width: '28px',
  },
  toolbar: {
    display: 'block',
    padding: '10px 0',
    justifyContent: 'space-between',
    height: '100%',
    '@media (max-width: 900px)': {
      paddingLeft: '75px',
      paddingRight: '20px',
      height: '100%',
    },
  },
  maindrawer: {
    height: '100%',
    background: '#0c0731',
    width: '260px',
  },
  logoDrawer: {
    paddingLeft: '10px',
    width: '140px',
    marginBottom: '30px',
  },
  drawerContainer: {
    padding: '20px 0px ',
    height: '100%',
    background: '#fff',
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  drawericon: {
    color: '#000',
    position: 'absolute',
    top: '0px',
    right: '-10px',
    fontSize: '25px',
  },
  logoImg: {
    width: '75px',
    // height: '44.5px',
    margin: ' 14px 15px 11px 0px',
    objectFit: 'contain',
    '@media (max-width: 500px)': {
      margin: ' 11px 1px 3px 0px',
      width: '52px',
    },
  },
  menuMobile: {
    fontSize: '16px',
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: '-0.6px',
    lineHeight: '1.75',
    borderBottom: '1px solid #3e3e3e',
    padding: '16px',
    color: '#252323',
    '@media (max-width: 500px)': {
      padding: '7px 0',
      width: '100%',
    },
  },
  paper1: {
    background: 'black',
    color: 'white',
  },
  containerHeight: {
    height: '100%',
  },
  mainHeader: {
    justifyContent: 'space-between',
    padding: '0px',
  },
  search: {
    height: '31px',
    position: 'relative',
    color: '#ABABAB',
    borderRadius: '100px',
    backgroundColor: '#E6E6E6',
    border: '1px solid #fff',
    '&:hover': {
      backgroundColor: '#ececec',
      border: '1px solid #0D8CCD',
    },
    marginLeft: 20,
    width: '140px',
    maxWidth: '257px',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: '180px',
    },
  },
  searchIcon: {
    fontSize: '16px',
    padding: theme.spacing(0, 2),
    color: '#000000',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    fontSize: '16px',
  },
  wallet: {
    fontSize: '14px',
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: '21px',
    color: '#0D8CCD',
    border: '1px solid #0D8CCD',
    padding: '0 15px',
    borderRadius: '50px',
    height: '31px',
    '@media (max-width: 900px)': {
      marginLeft: '12px',
      marginTop: '12px',
    },
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    fontSize: '13px',
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100px',
    [theme.breakpoints.up('sm')]: {
      width: '100%',
      '&:focus': {
        width: '100%',
      },
    },
  },
  active: {
    // borderBottom: "2px solid #792034",
  },
}))

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const auth = useContext(AuthContext)
  const classes = useStyles()
  const [tabview, setTabView] = useState('bundles')

  const {
    loginButton,
    menuMobile,
    menuButton,
    menuButton1,
    toolbar,
    drawerContainer,
    drawericon,
    login,
    logoDrawer,
    community,
    containerHeight,
    search,
    searchIcon,
    mainHeader,
    inputInput,
    inputRoot,
    wallet,
  } = useStyles()
  const history = useHistory()

  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  })

  const { mobileView, drawerOpen } = state

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 1220
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }))
    }

    setResponsiveness()

    window.addEventListener('resize', () => setResponsiveness())
  }, [])

  const displayDesktop = () => {
    return (
      <Container maxWidth="xl" className="p-0">
        <Toolbar className={toolbar}>
          {femmecubatorLogo}
          <Grid
            container
            item
            className="topmenu"
            direction="row"
            style={{ paddingLeft: '0px' }}
          >
            {getMenuButtons()}
          </Grid>
        </Toolbar>
      </Container>
    )
  }

  const displayMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: true }))
    const handleDrawerClose = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: false }))

    return (
      <Toolbar className={mainHeader}>
        <Drawer
          {...{
            anchor: 'right',
            open: drawerOpen,
            onClose: handleDrawerClose,
          }}
        >
          <div className={drawerContainer}>
            <img src="images/logo.png" alt="" />

            {getDrawerChoices()}
            <Button
              style={{ color: '#757575' }}
              className="menuButton1"
              onClick={() => auth.logout()}
            ></Button>
          </div>
        </Drawer>

        <div className="">{femmecubatorLogo}</div>
        <Grid container>
          <Grid item xs={2}>
            <IconButton
              className={drawericon}
              {...{
                edge: 'start',
                color: 'inherit',
                'aria-label': 'menu',
                'aria-haspopup': 'true',
                onClick: handleDrawerOpen,
              }}
            >
              <MenuIcon
                width="60px"
                height="60px"
                style={{ color: '#197ab3', fontSize: '30px' }}
              />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    )
  }

  const getDrawerChoices = () => {
    return (
      <>
        {auth?.permissions && auth?.permissions?.dashboard && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>Dashboard</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.userManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/user')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>Users</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.subAdminManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/sub-admin')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}> Sub-admin Managment</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.settingsManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/setting')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>Settings</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.bannerManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/banner-managment')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>AD. Management</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.referralManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/referral-managment')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>Referral</MenuItem>
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.staticManagement && (
          <Button
            className={tabview === 'bundles' ? classes.active : ' '}
            onClick={() => {
              setTabView('bundles')
              history.push('/static-content-management')
            }}
            color="inherit"
          >
            <MenuItem className={menuMobile}>Static Management</MenuItem>
          </Button>
        )}
        <Button
          className={tabview === 'bundles' ? classes.active : ' '}
          onClick={() => {
            setTabView('bundles')
            history.push('/static-content-management')
          }}
          color="inherit"
        >
          <MenuItem className={menuMobile}>Landing-page</MenuItem>
        </Button>
        <Button
          className={tabview === 'bundles' ? classes.active : ' '}
          onClick={() => {
            setTabView('bundles')
            history.push('/landing')
          }}
          color="inherit"
        >
          <MenuItem className={menuMobile}>Banner Management</MenuItem>
        </Button>
        <Button
          className={tabview === 'bundles' ? classes.active : ' '}
          onClick={() => {
            setTabView('bundles')
            history.push('/landingpage-management')
          }}
          color="inherit"
        >
          <MenuItem className={menuMobile}>Logout</MenuItem>
        </Button>
      </>
    )
  }

  const femmecubatorLogo = (
    <Box className="">
      <Link to="/">
        <Logo className="logoImg" />
      </Link>
    </Box>
  )

  const getMenuButtons = () => {
    return (
      <>
        {auth?.permissions && auth?.permissions?.dashboard && (
          <Button
            className={menuButton}
            onClick={() => history.push('/')}
            color="inherit"
          >
            Dashboard
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.userManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/user')}
            color="inherit"
          >
            Users
          </Button>
        )}

        {auth?.permissions && auth?.permissions?.subAdminManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/sub-admin')}
            color="inherit"
          >
            Sub-admin Managment
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.settingsManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/setting')}
            color="inherit"
          >
            Settings
          </Button>
        )}

        {auth?.permissions && auth?.permissions?.bannerManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/banner-managment')}
            color="inherit"
          >
            AD. Management
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.referralManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/referral-managment')}
            color="inherit"
          >
            Referral
          </Button>
        )}
        {auth?.permissions && auth?.permissions?.staticManagement && (
          <Button
            className={menuButton}
            onClick={() => history.push('/static-content-management')}
            color="inherit"
          >
            Static Management
          </Button>
        )}

        <Button
          className={menuButton}
          onClick={() => history.push('/landingpage-management')}
          color="inherit"
        >
          Landing-page
        </Button>
        <Button
          className={menuButton}
          onClick={() => history.push('/landing')}
          color="inherit"
        >
          Banner Management
        </Button>
        <Button
          className={menuButton}
          onClick={() => history.push('/login')}
          color="inherit"
        >
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <AppBar
        position="absolute"
        // className={history.location.pathname !== "/" ? "InnerHeader" : "Header"}
        elevation={0}
        style={{ backgroundColor: '#fff' }}
      >
        <Container
          maxWidth={history.location.pathname !== '/' ? 'xl' : 'fixed'}
          className={containerHeight}
        >
          {mobileView ? displayMobile() : displayDesktop()}
        </Container>
      </AppBar>
    </>
  )
}

import React, { useContext, useState, useEffect } from 'react'
import {
  Typography,
  Box,
  makeStyles,

} from '@material-ui/core'

import { UserContext } from 'src/context/User'

const useStyles = makeStyles((theme) => ({
  token: {
    textAlign: 'center',
    padding: '20px 0',
    '& p': {
      fontSize: '14px',
      fontWeight: '500',
      lineHight: '20px',
      color: '#000',
    },
    '& img': {
      marginTop: '5px',
    },
  },
}))

export default function UsersCard(props) {
  const classes = useStyles()
  const { type, data, balance } = props
  const user = useContext(UserContext)
  const [price, setPrice] = useState()
  useEffect(() => {
    let price = 0
    if (user?.userData || user?.userEarnings) {
      if (balance) {
        if (data.tokenname === 'MAS') {
          price = parseFloat(user?.userData?.masBalance).toFixed(2)
        } else if (data.tokenname === 'USDT') {
          price = parseFloat(user?.userData?.usdtBalance).toFixed(2)
        } else if (data.tokenname === 'BUSD') {
          price = parseFloat(user?.userData?.busdBalance).toFixed(2)
        }
      } else {
        if (data.tokenname === 'MAS') {
          price = parseFloat(user?.userEarnings?.masBalance).toFixed(2)
        } else if (data.tokenname === 'USDT') {
          price = parseFloat(user?.userEarnings?.usdtBalance).toFixed(2)
        } else if (data.tokenname === 'BUSD') {
          price = parseFloat(user?.userEarnings?.busdBalance).toFixed(2)
        }
      }
    }

    setPrice(price)
  }, [user?.userData, user?.userEarnings])

  return (
    <Box className="CardBox">
      <Box className={`${classes.token} lesspadd`}>
        <Box>
          <Typography variant="body2" component="p">
            {isNaN(price) ? 0 : price}
          </Typography>
          <Typography variant="body2" component="p">
            {data.tokenname}
          </Typography>
          <img height="20" width="20" src={data.tokenimg} />
        </Box>
      </Box>
    </Box>
  )
}

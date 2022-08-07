import React from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
Container,
    Paper,
} from "@material-ui/core";
import {Link} from 'react-router-dom'
import { withStyles, makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles({
    btn:{
        backgroundColor:"#1273eb",
        color:"white",
        borderRadius:"40px",
        width:"130px",
        height:"6vh"
    },
    btn2:{
      // backgroundColor:"#686869",
      // color:"white",
      borderRadius:"40px",
      width:"130px",
      height:"6vh"
  },
      
    });

const Row = ({ field, value }) => (
  <Grid item container spacing={3}>
    <Grid item sm={6} xs={12}>
      <Box display="flex">
        <Typography variant="h5">{field}</Typography>
      </Box>
    </Grid>
    <Grid item sm={6} xs={12} >
      <Typography variant="body1">{value}</Typography>
    </Grid>
  </Grid>
);


const Viewlinks = () => {
  const classes =useStyles();
  return (
    <Container maxWidth="md"> 
    <Paper style={{margin:'25px',padding:'10px',paddingBottom:'20px' }} elevation={2} >
  <Box >
        <Typography variant='h3' style={{marginTop:'20px', marginLeft:'15px'}} >View Social Links</Typography>
<Box style={{marginTop:'40px', marginLeft:'15px'}}>
<Grid container direction="column" spacing={5}>
  <Row field="Title" value="Social Link" />
  <Row field="Url Link" value="https://sociallinks/username" />
  
  </Grid>
  <Box mt={2}>        <Grid container  justify="center" spacing={2}> 
       <Grid item > <Link to="/Edit-Link" style={{textDecoration:"none"}}><Button type="submit" className={classes.btn} variant="contained" > Edit</Button> </Link>  </Grid>

     <Grid item>   <Link to="/Social-Links" style={{textDecoration:"none"}}><Button type="submit" className={classes.btn2} variant="outlined" > Back</Button> </Link> </Grid>
     

        </Grid>
        </Box>


</Box>
</Box>
    </Paper>
    </Container>
 
  );
  
};

export default Viewlinks;
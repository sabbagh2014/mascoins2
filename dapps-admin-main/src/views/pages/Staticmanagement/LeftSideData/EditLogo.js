import React from 'react'
import { Typography,Box,Container,Grid, TextField,Button,Paper, FilledInput,Radio,RadioGroup,FormControlLabel } from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import {Link} from 'react-router-dom';
import Logo from 'src/component/Logo';


const useStyles = makeStyles({
    btn:{
        backgroundColor:"#1273eb",
        color:"white",
        borderRadius:"40px",
        width:"130px",
        height:"6vh"
    },
    btn2:{

        backgroundColor:"#686869",
        color:"white",
        borderRadius:"40px",
        width:"130px",
        height:"6vh"
    }
    
  
      
    });
    
    


const Edit = () => {
    const classes=useStyles();
    return (
        <Container maxWidth="md"> 
        <Box>
       <Paper elevation={2} style={{margin:"40px ",padding:"30px 10px",paddingBottom:'50px'}}  >
           <Box pl={5} mt={4} px={2}> <Typography variant="h3" style={{fontWeight:"1000"}}>  Edit Logo</Typography>  </Box>
        <Box  mt={4} px={2}>
            <Grid container spacing={4}>
               <Grid item xs={12}> 
                    <Grid  container spacing={1}  alignItems="center">

                       <Grid item md={4} xs={12}>  <Typography style={{fontWeight:"500"}}> Current Logo  </Typography>   </Grid> 
                       <Grid item md={8} xs={12}>  <Logo width="300"/>  </Grid>
                    </Grid>
               
               
               
               </Grid>
               <Grid item xs={12}> 
                    <Grid  container spacing={1} >

                       <Grid item md={5} xs={12} >  <Typography style={{fontWeight:"500"}}>Add New Logo</Typography>   </Grid> 
                       
                       <Grid item md={7} xs={12}> <input type='file' ></input>   </Grid>
                      
                    </Grid>
               
               
               
               </Grid>
          <Grid item xs={12}> 
                    <Grid  container spacing={1} alignItems="center" justify="center">

                       <Grid item >  <Button type="submit" className={classes.btn} variant="contained" > Update</Button>   </Grid> 
                       <Grid item > <Link to="/left-side-data" style={{textDecoration:'none'}}><Button type="submit" className={classes.btn2} variant="contained" > Cancel</Button></Link> </Grid>
                    </Grid>
          </Grid>
            </Grid>
            </Box>
       </Paper>
</Box>
</Container>
    )
}

export default Edit;
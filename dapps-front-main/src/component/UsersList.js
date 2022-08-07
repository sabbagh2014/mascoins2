import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  makeStyles,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Table,
  Typography,
  Paper,
  Container,
  Button,
  Grid,
  InputAdornment,
  Input,
  MenuItem,
  IconButton,
  Select,
} from "@material-ui/core";
import NoDataFound from "src/component/NoDataFound";
import SearchIcon from "@material-ui/icons/Search";
import Apiconfigs from "src/Apiconfig/Apiconfigs";
import axios from "axios";
import Loader from "src/component/Loader";
import { Pagination } from "@material-ui/lab";
import ChildTableUser from "./Table/ChildTableUser";
import { UserContext } from "src/context/User";
const useStyles = makeStyles((theme) => ({
  LoginBox: {
    paddingBottom: "50px",
  },
  websiteButton: {
    border: "solid 0.5px #707070",
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: "17.5px",
    color: "#141518",
    width: "100%",
    borderRadius: "0",
  },
  masBoxFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    marginTop: "30px",
    "& h6": {
      fontSize: "28px",
      color: "#000",
    },
  },
  paddingContainer: {
    padding: "10px 30px",
  },
  table: {
    minWidth: 320,
  },
  table: {
    border: "1px solid #e5e3dd",
    "& th": {
      border: "1px solid #e5e3dd",
    },
    "& td": {
      border: "1px solid #e5e3dd",
    },
  },
  createButton: {
    color: "#fff",
    backgroundImage: "linear-gradient(45deg, #240b36 30%, #c31432 90%)",
    margin: "0px 10px",
    // "@media(max-width:768px)": {
    //   display: "none",
    // },
  },
  whitebox: {
    background: "#FFFFFF",
    filter: "drop-shadow(0px 0px 40px rgba(0, 0, 0, 0.25))",
    boxShadow: "rgb(99 99 99 / 20%) 0px 2px 8px 0px",
    borderRadius: "10px",
    paddingTop: "10px",
    paddingBottom: "10px",
    marginBottom: "15px",
  },

  idtxt: {
    display: "flex",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "18px",
    alignItems: "center",
    "@media(max-width:818px)": {
      display: "block",
    },
  },
}));

export default function UsersList() {
  const classes = useStyles();
  const auth = useContext(UserContext);
  const [allUserList, setAllUserList] = useState([]);
  const [fireSearch, setFireSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [noOfPages, setnoOfPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [filterData, setFilterData] = useState({
    userType: "",
    searchKey: "",
  });
  const _onInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const temp = { ...filterData, [name]: value };

    setFilterData(temp);
  };
  const getAllUserListHandler = async (filter) => {
    setIsLoadingData(true);
    try {
      const res = await axios({
        method: "GET",
        url: Apiconfigs.allUserList,
        headers: {
          token: sessionStorage.getItem("token"),
        },
        params: {
          search: filter?.searchKey ? filter?.searchKey : null,
          type: filter?.userType ? filter?.userType : null,
          limit: 10,
          page: page,
        },
      });
      if (res.data.statusCode === 200) {
     
        setAllUserList(res.data.result.docs);
        setIsLoadingData(false);
        setFireSearch(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoadingData(false);
    }
  };
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      getAllUserListHandler();
    }
  }, [sessionStorage.getItem("token")]);

  useEffect(() => {
    if (filterData.userType !== "" || filterData.searchKey !== "") {
      if (fireSearch) {
        getAllUserListHandler(filterData);
      }
    }
  }, [filterData, fireSearch]);

  const clearSearchFilter = () => {
    setFilterData({
      userType: "",
      searchKey: "",
    });
    setFireSearch(false);
    getAllUserListHandler();
  };
  return (
    <Box className={classes.paddingContainer}>
      <Box className={classes.LoginBox} mb={5}>
        <Box className={classes.masBoxFlex}>
          <Typography variant="h6">Users List</Typography>
        </Box>
       
        <Box className={classes.whitebox}>
          <Container>
            <Box className={classes.idtxt}>
              <Grid container spacing={0}>
                <Grid item xs={12} md={8} className={classes.dlflex}>
                  <label style={{ padding: "0px" }}>Search</label>
                  <Input
                    placeholder="Search by wallet Address or name"
                    className={classes.input_fild2}
                    value={filterData.searchKey}
                    fullWidth
                    type="text"
                    name="searchKey"
                    onChange={_onInputChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={() => setFireSearch(true)}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={0}>
                <Grid item xs={12} md={8} className={classes.dlflex}>
                  <label style={{ padding: "0px" }}> Select user type </label>
                  <Box>
                    <Select
                      fullWidth
                      value={filterData.userType}
                      name="userType"
                      onChange={_onInputChange}
                    >
                      <MenuItem value="Creator">Creator</MenuItem>
                      <MenuItem value="User">Subscriber</MenuItem>
                    </Select>
                  </Box>
                </Grid>
              </Grid>
              
            </Box>
          </Container>
        </Box>
        <TableContainer className={classes.Paper} component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableBody>
              {allUserList &&
                allUserList?.map((row, index) => (
                    (row._id != auth.userData._id) && 
                    <ChildTableUser row={row} index={index} key={index} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={3}>{isLoadingData && <Loader />}</Box>
        <Box mt={3}>
          {!isLoadingData && allUserList && allUserList.length === 0 && (
            <NoDataFound />
          )}
        </Box>
        {allUserList && allUserList.length >= 10 && (
          <Box mb={2} mt={2} display="flex" justifyContent="flex-start">
            <Pagination
              count={noOfPages}
              page={page}
              onChange={(e, v) => setPage(v)}
            />
          </Box>
        )}
        {/* )} */}
      </Box>
    </Box>
  );
}

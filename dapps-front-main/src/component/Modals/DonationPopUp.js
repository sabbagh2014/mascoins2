import React, { useState, useContext, useEffect } from "react";
import {
  Typography,
  Box,
  makeStyles,
  Grid,
  Button,
  TextField,

  Select,
} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import Apiconfigs from "src/Apiconfig/Apiconfigs";
import { UserContext } from "src/context/User";
import { sortAddress } from "src/utils";
import {
  CEO_NAME,
  networkList,
} from "src/constants";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
const useStyles = makeStyles((theme) => ({
  cards: {
    border: "solid 0.5px #c9c7c3",
    padding: "10px",
    borderRadius: "10px",
    position: "relative",
    backgroundImage:
      "linear-gradient(45deg, #eef2f3 90%,#8e9eab 30%, #eef2f3 90%)",
    margin: "8px",
    width: "90%",
    "&:hover": {
      transform: "scale(1.03)",
      transition: "all 0.4s ease-in-out 0s",
    },
  },
  NFTbg: {
    width: "100%",
    height: "100px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "500",
    color: "#fff",
    marginBottom: "20px",
    backgroundImage: "linear-gradient(to bottom, #c04848, #480048)",
  },
  contantCard: {
    textAlign: "left",
    position: "relative",
    "& h6": {
      marginBottom: "2px !important",
      fontSize: "16px !important",
      [theme.breakpoints.down("md")]: {
        fontSize: "10px !important",
      },

      "& span": {
        color: "#000",
        paddingLeft: "5px",
      },
      "@media(max-width:821px)": {
        fontSize: "11px !important",
      },
    },
    "& p": {
      fontSize: "12px",
    },
  },

  contantCard2: {
    textAlign: "left",
    position: "relative",
    paddingTop: "10px",
    borderTop: "solid 0.5px #707070",
    "&::after": {
      position: "absolute",
      border: " solid 0.5px #707070",
      content: "''",
      left: "50%",
      top: "0",
      transform: "translatex(-50%)",
    },
  },
  btnBox: {
    display: "flex",
    alignItems: "center",
    "& button": {
      fontSize: "8px !important",
    },
  },
  sublink: {
    display: "flex",
    justifyContent: "space-between",
    color: "#000",
    alignItems: "center",
    paddingBottom: "10px",
    position: "relative",
    "&::after": {
      content: "''",
      height: " 1px",
      width: "70%",
      position: "absolute",
      backgroundColor: "#f2f1ee",
      bottom: "6px",
      maxWidth: "100%",
      left: "50%",
      transform: " translateX(-50%)",
    },
  },

  feedmenu: {
    fontSize: "20px",
    color: "#707070",
    position: "absolute",
    right: "0px",
    top: "0px",
    zIndex: "9",
  },
  donation: {
    "& span": {
      fontSize: "12px",
      padding: "2px 5px",
      border: "1px solid #ccc",
    },
  },
  input_fild2: {
    width: "100%",
    "& input": {
      height: "45px",
    },
  },
  changepic: {
    textAlign: "center",
    "& img": {
      width: "80%",
    },
    "& small": {
      position: "relative",
      fontSize: "12px !important",
      "& input": {
        position: "absolute",
        width: "300px",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: "0",
      },
    },
  },

  // cs
  PhotoBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& img": {
      width: "100%",
      // maxWidth: "280px",
      height: "368px",
      // marginLeft: "122px",
      paddingLeft: "149",
      display: "flex",
      alignItems: "center",
      borderRadius: "15px",
    },
    "@media(max-width:768px)": {
      "& img": {
        height: "auto",
      },
    },
  },
  bundleText: {
    "& .red": {
      color: "#792034",
    },
    "& h4": {
      color: "#141518",
      fontSize: "20px",
    },
  },
  deskiText: {
    "& h4": {
      marginBottom: "10px",
      color: "#707070",
      fontSize: "20px",
      "& span": {
        color: "#141518",
      },
    },
  },
  input_fild: {
    backgroundColor: "#ffffff6e",
    borderRadius: "5.5px",
    border: " solid 0.5px #e5e3dd",
    color: "#141518",
    width: "100%",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent",
      },
    },
    "& .MuiInputBase-input": {
      color: "#141518",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      borderWidth: 0,
    },
  },
  dilogBody: {
    paddingBottom: "30px",
    position: "relative",
    "& small": {
      position: "absolute",
      bottom: " 3px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "13px",
      width: "100%",
      textAlign: "center",
    },
  },
  certificateimg: {
    margiBottom: "30px",
    width: "100%",
    height: "auto",
  },

  heding: {
    backgroundImage: "linear-gradient(to bottom, #792034, #3d101a)",
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    alignItems: "center",
    color: "#fff",
    [theme.breakpoints.down("xs")]: {
      padding: "10px",
    },
    "& img": {
      width: "60px",
      [theme.breakpoints.down("xs")]: {
        width: "20px",
      },
    },
    "& h6": {
      fontSize: "15px",
      fontWeight: "400",
      padding: "0 20px",
      [theme.breakpoints.down("xs")]: {
        padding: "0 5px",
        fontSize: "10px",
      },
    },
  },
  body: {
    position: "relative",
    zIndex: 2,
    padding: "50px 20px 150px 20px",
    [theme.breakpoints.down("xs")]: {
      padding: "50px 20px 60px 20px",
    },
    "& h5": {
      fontSize: "15px",
      fontWeight: "400",
      lineHeight: "1.53",
      color: "#141518",
    },
    "& h2": {
      fontSize: "23px",
      fontWeight: "600",
      lineHeight: "1.51",
      paddingLeft: "5px",
      color: "#141518",
      [theme.breakpoints.down("xs")]: {
        fontSize: "18px",
      },
    },
    "& img": {
      width: "30px",
      margin: "0 5px",
    },
  },
  footer: {
    "& h5": {
      fontSize: "15px",
      fontWeight: "500",
      lineHeight: "1.53",
      color: "#141518",
    },
    "& p": {
      fontSize: "10px",
      fontWeight: "500",
      lineHeight: "1.5",
      color: "#141518",
    },
    "& span": {
      fontSize: "9px",
      fontWeight: "500",
      lineHeight: "1.5",
      color: "rgba(112, 112, 112, 0.64)",
    },
    "& label": {
      fontSize: "10px",
      fontWeight: "400",
      lineHeight: "1.35",
      margin: "0",
      padding: "0",
      color: "#707070",
      whiteSpace: "initial !important",
      wordBreak: "break-all",
    },
  },
  certificateBox: {
    position: "relative",
  },
  centerImg: {
    position: "absolute",
    left: "50%",
    bottom: "30px",
    width: "45%",
    transform: "translateX(-50%)",
    zIndex: 1,
  },
  certificate: {
    [theme.breakpoints.down("xs")]: {
      padding: "10px",
    },
  },
  buttonGroup: {
    display: "flex",

    justifyContent: "center",
    width: "100%",
    marginTop: "14px",
    "& button": {
      border: "0.5px solid #ccc",
      marginRight: "10px",
      backgroundImage: "linear-gradient(45deg, #240b36 30%, #c31432 90%)",
      color: "#fff",
      width: "127px",
      fontSize: "12px",
    },
  },
  LoginButton: {
    marginTop: "10px",
    backgroundImage: "linear-gradient(45deg, #240b36 30%, #c31432 90%)",
    color: "#fff",
  },
  downloadButton: {
    maxWidth: "100px",
    backgroundColor: "#a33748",
    borderRadius: "33px",
    color: "white",
    "&:hover": {
      backgroundColor: "red",
    },
  },
  // nftimg: {
  //   // border: " solid 0.5px #e5e3dd",
  //   // height: "152px",
  //   width: "100%",
  //   margin: "10px 0",
  //   textAlign: "center",
  //   overflow: "hidden",
  //   "& img": {
  //     maxWidth: "100%",
  //     maxHeight: "100%",
  //     borderRadius: "18px",

  //     minWidth: "150px",
  //   },
  // },
  nftImg: {
    width: "100%",
    // height: "165px",
    overflow: "hidden",
    backgroundPosition: "center !important",
    backgroundSize: "cover !important",
    backgroundRepeat: " no-repeat !important",
    // borderRadius: "40px 40px 10px 10px",
    // borderRadius: "18px",
    backgroundColor: "#ccc !important",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: " solid 0.5px #e5e3dd",
  },
}));


export const DonationPopUp = ({ open, handleClose, userData }) => {
  const classes = useStyles();
  const auth = useContext(UserContext);
  const [isLoading, setIsloading] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("select");
  const [donationMessage, setDonationMessage] = useState("");
  const [serialNumber, setSerialNumber] = useState("f");
  const [download, setDownload] = useState(false);
  const [openCertificate, setOpenCertificate] = useState(false);

  const [isopenDonate, setIsopenDonate] = useState(false);

  useEffect(() => {
    setIsopenDonate(open);
  }, [open]);


  const donloadBadge = () => {
    setDownload(true);
    const certificate = document.getElementById(`certificate_UI`);

    html2canvas(certificate, { useCORS: true, allowTaint: true }).then(
      (canvas) => {
        canvas.toBlob(
          function (blob) {
            const imgData = URL.createObjectURL(blob);

            var pdf = new jsPDF({
              orientation: "landscape",
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(
              imgData,
              "JPEG",
              0,
              0,
              pdfWidth,
              pdfHeight,
              "",
              "FAST"
            );
            pdf.save(`${serialNumber}.pdf`);
            setDownload(false);
          },
          "image/jpeg",
          1.0
        );
      }
    );
  };

  const donationWithoutBlockchainHandler = async () => {
    if(selectedToken === "select"){
      toast.error(`Please Select Cryptocurrency.`);
      return;
    }
    if (
      parseFloat(donationAmount) >
      parseFloat(auth?.userData[selectedToken.databaseKey])
    ) {
      toast.error(`Your ${selectedToken.name} balance is insufficient.`);
      return;
    } 
    setIsloading(true);
    try {
      const res = await axios.post(
        Apiconfigs.donation,
        {
          amount: donationAmount,
          userId: userData._id,
          coinName: selectedToken.name,
          message: donationMessage,
        },
        {
          headers: {
            token: sessionStorage.getItem("token"),
          },
        }
      );

      toast.success(res.data.responseMessage);
      setIsloading(false);
      if (res.data.statusCode === 200) {
        setSerialNumber(res.data.result);
        setOpenCertificate(true);
      }
      setTimeout(() => {}, 100);
      auth.updateUserData();
    } catch (error) {
      setIsloading(false);
      if (error.response) {
        toast.error(error.response.data.responseMessage);
      } else {
        toast.error(error.message);
      }
      console.log("Error", error);
    }
  };
  return (
    <Box>
      <Dialog
        open={isopenDonate}
        fullWidth="sm"
        maxWidth="sm"
        onClose={() => handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        disableBackdropClick={isLoading}
        disableEscapeKeyDown={isLoading}
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography
              variant="h4"
              align="center"
              style={{ color: "#792034", margiBottom: "10px" }}
            >
             Send donation to {userData.userName}
            </Typography>

            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <label> Donation Amount</label>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    id="standard-basic"
                    placeholder="30"
                    className={classes.input_fild2}
                    type="number"
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <label>Select Cryptocurrency</label>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Select
                    fullWidth
                    defaultValue="select"
                    onChange={(e) => {
                      
                      setSelectedToken(e.target.value);
                    }}
                  >
                    <MenuItem value={"select"}>Select</MenuItem>
                    {networkList.map((data, i) => {
                      return <MenuItem value={data}>{data.name}</MenuItem>;
                    })}
                  </Select>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <label> Donation Message</label>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    multiline
                    maxRows={3}
                    className={classes.input_fild2}
                    type="text"
                    onChange={(e) => setDonationMessage(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            
            <Box mt={4}>
              <Grid container alignItems="center" spacing={2}>
              <Grid item md={12}>
              <Typography
              variant="body2"
              align="left"
              style={{ color: "#000" }}
            > 

              <span>Transaction fees: {donationAmount ? (parseFloat(donationAmount)*parseFloat(auth.userData.withdrawFees)/100) : auth.userData.withdrawFees+"%"} {selectedToken.name}</span>
              <br/>
              { 
                  donationAmount ? <strong>{userData.name} Will receive: {parseFloat(donationAmount) - (parseFloat(auth.userData.withdrawFees)*parseFloat(donationAmount)/100)} {selectedToken.name}</strong> : ""

              }
            </Typography>
            </Grid>
                <Grid item md={6}>
                  <Button
                    variant="contained"
                    size="large"
                    color="primery"
                    className="btn-block removeredius"
                    onClick={() => handleClose()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item md={6}>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    className="btn-block removeredius ml-10"
                    disabled={ isLoading  || donationAmount < 1 || selectedToken == "select"}
                    onClick={donationWithoutBlockchainHandler}
                  >
                    Transfer Funds {isLoading && <ButtonCircularProgress />}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      {openCertificate && serialNumber && (
        <Dialog
          open={openCertificate}
          fullWidth="md"
          maxWidth="md"
          onClose={() => {
            setOpenCertificate(false);
            handleClose();
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box id="certificate_UI">
            <DialogContent className={classes.certificate}>
              <Box className={classes.certificateBox}>
                <img src="images/Component.png" className={classes.centerImg}  alt="" />
                <Box className={classes.heding}>
                  <img src="images/icon.png" />
                  <Typography variant="h6">
                    {" "}
                    C E R T I F I C A T E O F D O N A T I O N
                  </Typography>
                  <img src="images/icon.png"  alt=""/>
                </Box>
                <Box className={classes.body} align="center" mt={3}>
                  <Typography variant="h5">This is to certify that</Typography>
                  <Typography variant="h2">
                    {auth?.userData?.name
                      ? auth?.userData?.name
                      : sortAddress(
                          auth?.userData?.walletAddress
                            ? auth?.userData?.walletAddress
                            : auth?.userData?.ethAccount?.address
                        )}
                  </Typography>
                  <Typography variant="h5">
                    {` (${
                      auth?.userData?.walletAddress
                        ? auth?.userData?.walletAddress
                        : auth?.userData?.ethAccount?.address
                    })`}
                  </Typography>
                  <Typography
                    variant="h5"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Has donated{" "}
                    <Typography variant="h2">
                      {donationAmount + ` `}&nbsp;
                    </Typography>{" "}
                    {" " + selectedToken.name}{" "} to{" "}
                  </Typography>
                  <Typography variant="h2">
                    {userData?.name
                      ? userData.name
                      : userData?.ethAccount?.address
                      ? sortAddress(userData?.ethAccount.address)
                      : sortAddress(userData?.walletAddress)}
                  </Typography>
                  <Typography variant="h5">
                    {`(${
                      userData?.ethAccount?.address
                        ? userData?.ethAccount?.address
                        : userData?.walletAddress
                    })`}
                  </Typography>
                  <Typography variant="h5">
                    {donationMessage ? donationMessage : ""}
                  </Typography>
                </Box>
                <Box className={classes.footer}>
                  <Grid
                    container
                    spacing={2}
                    style={{ alignItems: "flex-end" }}
                  >
                    <Grid item xs={3} align="left">
                      <Typography variant="h5" style={{ color: "#d15b5b" }}>
                        {CEO_NAME}
                      </Typography>
                      <Typography variant="body2">MAS founder & CEO</Typography>
                    </Grid>
                    <Grid item xs={6} align="center">
                      {" "}
                      <span>
                        {" "}
                        This certificate is published one time and can't be
                        accessed again
                      </span>
                    </Grid>
                    <Grid item xs={3} align="right">
                      <Typography variant="h5">Donation Id:</Typography>
                      <Typography variant="body2" component="label">
                        {serialNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </DialogContent>
          </Box>
          <Box
            mt={2}
            pb={4}
            style={{ width: "100%", maxWidth: "200px", margin: "0 auto" }}
          >
            <Button
              variant="contained"
              size="large"
              color="secondary"
              className="btnWidth btn-block btnHight"
              onClick={donloadBadge}
              disabled={download}
            >
              download <FiDownload /> {download && <ButtonCircularProgress />}
            </Button>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

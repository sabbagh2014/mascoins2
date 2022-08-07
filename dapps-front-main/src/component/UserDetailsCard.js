import React, { useContext, useEffect } from "react";
import { Typography, Box,   Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { BsChat } from "react-icons/bs";
import axios from "axios";
import Apiconfigs from "src/Apiconfig/Apiconfigs";
import { UserContext } from "src/context/User";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  cards: {
    border: "solid 0.5px #e5e3dd",
    backgroundImage:
      "linear-gradient(45deg, #eef2f3 90%,#8e9eab 30%, #eef2f3 90%)",
    padding: "10px",
    borderRadius: "50%",
    width: "200px",
    height: "200px",
    margin: "0 10px",
    position: "relative",
    backdropFilter: "blur(50px)",
  },
  cardContent: {
    textAlign: "center",
    position: "relative",
    "& h6": {
      marginBottom: "2px !important",
      fontSize: "15px !important",
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
  avatar: {
    width: "130px !important",
    height: "130px  !important",
    marginLeft: "14px",
    cursor: "pointer",
    "@media(max-width:1025px)": {
      width: " 100% !important",
      height: " 100%  !important",
    },
  },
  nftimg: {
    width: "100%",
    margin: "10px 0",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",

    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
      width: "-webkit-fill-available",
      borderRadius: "20px",
    },
  },
  nftImg: {
    width: "100%",
    overflow: "hidden",
    backgroundPosition: "center !important",
    backgroundSize: "cover !important",
    backgroundRepeat: " no-repeat !important",
    backgroundColor: "#ccc !important",
  },
  socialbox: {
    "@media(max-width:821px)": {
      height: "12px",
      marginBottom: "3px",
    },
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    "& button": {
      border: "0.5px solid #ccc",
      backgroundImage: "linear-gradient(45deg, #240b36 30%, #c31432 90%)",
      color: "#fff",
      width: "100px",
      fontSize: "12px",
    },
  },
}));

export default function UserDetailsCard( data ) {
  const userCardData = data.data;
  const history = useHistory();
  const classes = useStyles();
  const [isLike, setisLike] = React.useState(false);
  const [nbLike, setnbLike] = React.useState(0);
  const [isSubscribed, setisSubscribed] = React.useState(false);
  const [nbSubscribed, setinbSubscribed] = React.useState(0);
  const auth = useContext(UserContext);

  const subscribeToUserHandler = async () => {
    await axios({
      method: "GET",
      url: Apiconfigs.subscribeProfile + userCardData._id,
      headers: {
        token: sessionStorage.getItem("token"),
      },
    })
      .then(async (res) => {
        if (res.data.statusCode === 200) {
          console.log(res)
          auth.updateUserData();
          setisSubscribed((subed) => !subed);
          setinbSubscribed((nb) => isSubscribed ? nb-1 : nb+1)
        } else {
          toast.error(res.data.result);
          setisSubscribed(false)
        }
      })
      .catch((err) => {
        console.log(err.message);
        toast.error(err?.response?.data?.responseMessage);
      });
  }

  const likeDislikeUserHandler = async (id) => {
    if (auth.userData?._id) {
        try {
          const res = await axios.get(Apiconfigs.likeDislikeUser + id, {
            headers: {
              token: sessionStorage.getItem("token"),
            },
          });
          if (res.data.statusCode === 200) {
            setisLike((liked)=>!liked);
            setnbLike((nb)=> isLike ? nb-1 : nb+1)
          } else {
            setisLike(false);
            toast.error(res.data.responseMessage);
          }
        } catch (error) {}
      
    } else {
      toast.error("Please Login");
    }
  };

  useEffect(()=>{
    setnbLike(userCardData.likesCount);
    setinbSubscribed(userCardData.profileSubscriberCount);
    if (auth.userData?._id && userCardData) {
      let likeUser = userCardData.likesUsers?.includes(auth.userData._id);
      let subed = userCardData.subscriberList?.includes(auth.userData._id);
      setisLike(likeUser);
      setisSubscribed(subed);
    }
  },[])

  return (
    <Box mb={5} >
    <Box className={classes.cards}>
        <Box className={classes.cardContent}>
          <Box style={{
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}>
            {userCardData.profilePic ? (
              <figure
              style={{
                width: " 130px",
                height: " 130px",
                borderRadius: "130px",
                overflow: 'hidden',
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={userCardData.profilePic}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "100%"
                }}
              />
            </figure>
            ) : (
              <Box>
                <img
                  onClick={() =>
                    history.push({
                      pathname: "/user-profile",
                      search: userCardData?.userName,
                    })
                  }
                  src={`https://avatars.dicebear.com/api/miniavs/${userCardData?._id}.svg`}
                  className={classes.avatar}
                />
              </Box>
            )}
           
          </Box>
          <Box
              onClick={() => {
                history.push({
                  pathname: "/user-profile",
                  search: userCardData.userName,
                });
              }}
            >
            <Typography
                variant="h4"
                component="h4"
                style={{
                  color: "#792034",
                  cursor: "pointer",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "auto",
                  textAlign: "center"
                }}
              >
                {userCardData && userCardData.name
                  ? userCardData.name
                  : userCardData.userName}
              </Typography>
          </Box>
          {
            userCardData.speciality &&
            <Typography
            style={{ 
              color: "#000", 
              fontWeight: "700", 
              textAlign: "center",
              fontSize: "10px" 
            }}
          >
            {userCardData.speciality}
          </Typography>
          }
          <Typography
            variant="h6"
            component="h6"
            style={{ color: "#000", fontWeight: "600", fontSize: "12px" }}
          >
            { 
              nbSubscribed ?
              nbSubscribed > 1 ?
              nbSubscribed + " subs" :
              '1 subscriber' : ""
            }
          </Typography>

          
           <Box style={{
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}>
              <span style={{fontSize:'12px',padding:'2px'}}>
                {nbLike && nbLike}
              </span>
              <FaHeart
                style={isLike ? { color: "red" } : {}}
                onClick={() => likeDislikeUserHandler(userCardData._id)}
                className={classes.socialbox}
              />
              <span>&nbsp;&nbsp;</span>
              <BsChat
                onClick={() => {
                  if (auth.userData?._id) {
                      history.push({
                        pathname: "/chat",
                        search: userCardData.ethAccount
                          ? userCardData.ethAccount.address
                          : userCardData.walletAddress,
                      });
                    
                  } else {
                    toast.error("Please login");
                  }
                }}
                className={classes.socialbox}
              />
          </Box>
        </Box>
    </Box>
    <Box mt={2} className={classes.buttonGroup}>
    {
      auth.userData &&
      auth.userLoggedIn &&
       (
        <Button onClick={subscribeToUserHandler}>
          {isSubscribed ? 'Unsubscribe' : 'Subscribe' } 
        </Button>
      )
    }
    </Box>
</Box>

  );
}

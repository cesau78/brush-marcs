import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressOverlay from "../components/progress-overlay";
import {
  Card,
  Breadcrumbs,
  Typography,
  CardActions,
  Button,
} from "@material-ui/core";
import ErrorOverlay from "../components/error-overlay";
import { AnonymousAppBar } from "../components/appbar";
import { useLocation } from "react-router-dom";
import qs from "qs";
import { setAccessToken, signInToAuth0 } from "../api-clients/auth0";
import { makeStyles } from "@material-ui/core/styles";
import { useApi } from "../api-clients/title-optionality/use-api";
import {
  // hasOrgPermission,
  // getAllPermissionsValue,
  // orgPermissions,
  syncOrgContext,
} from "../common/organizations";
import { resources, getApiClient } from "../api-clients/title-optionality";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      margin: 30,
      paddingBottom: 30,
    },
    header: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      padding: 16,
    },
    headerLink: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      "&:hover": {
        color: theme.palette.getContrastText(theme.palette.primary.main),
      },
    },
    headerText: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      marginBottom: 3,
    },
    content: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(4),
    },
    buttonContainer: {
      marginTop: 30,
    },
    buttonGroup: {
      marginRight: 30,
      marginBottom: 10,
      display: "inline-block",
    },

    link: {
      "&:hover": {
        color: theme.palette.primary.main,
      },
    },
  };
});
const VERIFY_EMAIL = "Please verify your email before logging in: ";
const Auth0Callback = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState("");
  const [callbackError, setCallbackError] = useState("");
  //const [intendedRedirect, setIntendedRedirect] = useState("");
  const { get: getUserProfile } = useApi(resources.userDetailsOwnUser);
  const [calledApiServer, setCalledApiServer] = useState(false);
  const anonClient = getApiClient({ accessToken: null });
  const { get: getOrganizationList } = useApi(resources.organizationList);
  const userId =
    callbackError.startsWith(VERIFY_EMAIL) &&
    callbackError.split(VERIFY_EMAIL).filter((part) => part)[0];
  useEffect(() => {
    if (!callbackError || !userId || !anonClient) {
      return;
    }
    callbackError.startsWith(VERIFY_EMAIL) &&
      anonClient.post(resources.verificationEmail, { userId }).catch((err) => {
        console.error(err);
      });
  }, [callbackError, anonClient, userId]);

  useEffect(() => {
    let isSubscribed = true;
    const fifteenMinutesAgo = new Date(new Date().getTime() - 15 * 60000);

    const parsed = qs.parse(location.hash.replace("#", "?"), {
      ignoreQueryPrefix: true,
    });
    const { access_token, state, error_description } = parsed; //untrusted access token
    isSubscribed && setCallbackError(error_description || "");
    isSubscribed && error_description && setLoginError("");
    // isSubscribed &&
    //   setIntendedRedirect(state && state.startsWith("/") && state);
    access_token &&
      setAccessToken(access_token).then(() => {
        if (calledApiServer === true) {
          return Promise.resolve();
        }
        isSubscribed && setCalledApiServer(true);

        //query self to update user profile from auth0
        const setProfilePlan = getUserProfile()
          .then((profile) => {
            if (!profile) {
              return null;
            }
            localStorage.setItem("nickname", profile.nickname || "");
            localStorage.setItem(
              "track_analytics",
              profile.track_analytics ? profile.user_id : false.toString()
            );

            return profile;
          })
          .then((profile) => {
            if (!profile) {
              return null;
            }
            isSubscribed && setLoginError("");
            return profile;
          });

        const establishOrgContext = syncOrgContext({
          accessToken: access_token,
        });
        return Promise.all([setProfilePlan, establishOrgContext])
          .then((results) => {
            const profile = results[0];
            const redirectToProfilePage =
              fifteenMinutesAgo.toISOString() < profile?.created_at;
            //relay
            if (state && state.startsWith("/")) {
              navigate(state);
            }

            //direct first-time logins to profile page to set display name and accept an org invite
            if (redirectToProfilePage) {
              navigate("/profile");
            }
          })
          .catch((err) => {
            isSubscribed && setLoginError(err?.message);
          });
      });

    return () => (isSubscribed = false);
  }, [
    location,
    navigate,
    getUserProfile,
    calledApiServer,
    getOrganizationList,
  ]);

  return (
    <div>
      <AnonymousAppBar />
      {!loginError && !callbackError && <ProgressOverlay text="Signing In" />}
      {/**
       * A custom rule in Auth0 sends the error_description in with the user_id
       *   Auth0 Console -> Auth Pipeline -> Rules -> Force email validation
       *   The user_id is needed for the 'Send new verification email' functionality
       *  **/}
      {callbackError.startsWith(VERIFY_EMAIL) && (
        <Card className={classes.root} elevation={3} raised={true}>
          <Breadcrumbs aria-label="breadcrumb" className={classes.header}>
            <Typography
              sx={{ display: "flex", alignItems: "center" }}
              className={classes.headerText}
              variant="h5"
            >
              Almost there...
            </Typography>
          </Breadcrumbs>
          <div style={{ margin: 20 }}>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              Verify your email address to sign in. Check your inbox for a
              verification email from{" "}
              <span style={{ fontWeight: 700 }}>
                "Transitnet Notifications" &lt;notifications@transitnet.io&gt;
              </span>{" "}
              and follow the instructions. Once your email is verified, click
              the Retry button below if your browser isn't automatically
              redirected.
            </Typography>
          </div>
          <CardActions>
            <Button
              size="small"
              color="primary"
              className={classes.actionButton}
              onClick={() => signInToAuth0("/dashboard")}
            >
              Retry
            </Button>
            <Button
              size="small"
              color="primary"
              className={classes.actionButton}
              onClick={() => {
                return anonClient
                  .post(resources.verificationEmail, { userId })
                  .catch((err) => {
                    console.error(err);
                  });
              }}
            >
              Send new verification email
            </Button>
          </CardActions>
        </Card>
      )}
      {loginError && !callbackError.startsWith(VERIFY_EMAIL) && (
        <ErrorOverlay
          title="Error Signing In"
          message={loginError}
          actions={[
            {
              text: "retry",
              onClick: () => signInToAuth0("/dashboard"),
            },
          ]}
        />
      )}
    </div>
  );
};
export default Auth0Callback;

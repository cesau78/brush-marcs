/**
 * Note: This API Client expects an access token to be available from the auth0 library, the management of which
 *       should be readily available from the auth0 implementation.
 *
 **/
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE;
const timeout = 10000;

export const getApiClient = ({ accessToken }) => {
  const axiosParams = {
    baseURL,
    timeout,
  };
  accessToken &&
    (axiosParams.headers = { Authorization: `Bearer ${accessToken}` });
  const client = axios.create(axiosParams);
  return client;
};

export const resources = {
  userDetailsOwnUser: "/users/self",
  initiativeList: "/initiatives",
  initiativeDetails: "/initiatives/:initiativeId",
  initiativeRequestList: "/initiatives/requests",
  initiativeRequestDetails: "/initiatives/requests/:initiativeRequestId",
  initiativeViews: "/initiative-views",
  view: "/view/:initiativeId",
  identityVerifications: "/identity-verifications",
  identityVerificationDetails:
    "/identity-verifications/:identityVerificationId",
  jumioCallback: "/anonymous/jumio-callback/:transactionReference",
  verificationEmail: "/anonymous/verification-email",
  notificationList: "/notifications",
  notificationDetails: "/notifications/:notificationId",
  config: "/config",
  configNotifyFooter: "/config/notifications/footer",
  configReferralSettings: "/config/referral-settings",
  configReengagementSettings: "/config/reengagement-settings",
  systemMetrics: {
    all: "/system-metrics",
    identities: "/system-metrics/identities",
    referrals: "/system-metrics/referrals",
    users: "/system-metrics/users",
  },
  organizationList: "/organizations",
  organizationDetails: "/organizations/:organizationId",
  organizationMembers: "/organizations/members",
  organizationInvites: "/organizations/invites",
  organizationMemberDetails: "/organizations/members/:organizationMemberId",
  organizationInviteDetails: "/organizations/invites/:organizationInviteId",
  organizationProfile: "/anonymous/organizations/:organizationId",
  userInvites: "/users/self/invites",
  userInviteDetails: "/users/self/invites/:organization",
  userMembershipDetails: "/users/self/memberships/:organizationMemberId",
  userSummaryData: "/users/self/summary-data",
  referrals: "/referrals",
  referralDetails: "/referrals/:referralId",
};

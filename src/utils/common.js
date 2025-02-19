import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Cookies from 'universal-cookie';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const isCourseEnded = endDate => dayjs(endDate) < dayjs();

export const createArrayFromValue = (value) => {
  const values = [];

  if (Array.isArray(value)) {
    return value;
  }

  values.push(value);
  return values;
};

export const isDefined = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item !== undefined);
};

export const isNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item === null);
};

export const isDefinedAndNotNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && !isNull(item));
};

export const isDefinedAndNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && isNull(item));
};

export const hasTruthyValue = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => !!item);
};

export const hasValidStartExpirationDates = ({ startDate, expirationDate, endDate }) => {
  dayjs.extend(isBetween);
  const now = dayjs();
  // Subscriptions use "expirationDate" while Codes use "endDate"
  const realEndDate = expirationDate || endDate;
  return now.isBetween(startDate, realEndDate);
};

export const loginRefresh = async () => {
  const config = getConfig();
  const loginRefreshUrl = `${config.LMS_BASE_URL}/login_refresh`;

  try {
    return await getAuthenticatedHttpClient().post(loginRefreshUrl);
  } catch (error) {
    const isUserUnauthenticated = error.response?.status === 401;
    if (isUserUnauthenticated) {
      // Clean up the cookie if it exists to eliminate any situation
      // where the cookie is not expired but the jwt is expired.
      const cookies = new Cookies();
      cookies.remove(config.ACCESS_TOKEN_COOKIE_NAME);
    }
    return Promise.resolve();
  }
};

export const fixedEncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!()*]/g, (c) => `%${ c.charCodeAt(0).toString(16)}`);

export const formatStringAsNumber = (str, radix = 10) => {
  // converts a string into a number and format it with separated commas
  const num = parseInt(str, radix);
  return num.toLocaleString();
};

export const getPrimaryPartnerLogo = (partnerDetails) => {
  if (!partnerDetails.primaryPartner || !partnerDetails.showPartnerLogo) {
    return undefined;
  }
  return {
    src: partnerDetails.primaryPartner.logoImageUrl,
    alt: partnerDetails.primaryPartner.name,
  };
};

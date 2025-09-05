export const BASE_URL = '/api';

export const URL_RESET_PASSWORD_REQUEST = BASE_URL + '/password-reset/request';
export const URL_RESET_PASSWORD_CONFIRM = BASE_URL + '/password-reset/confirm';
export const URL_RESET_PASSWORD_RESEND = BASE_URL + '/password-reset/resend';

export const URL_AUTH_VERIFY_PASSWORD = BASE_URL + '/user-verification/verify-password';

export const URL_AUTH_VERIFY_EMAIL = BASE_URL + '/user-verification/verify-email';

export const URL_AUTH_LOGIN = BASE_URL + '/authenticate';

export const URL_API_USER_ACCOUNT = BASE_URL + '/account';

export const URL_API_USER_ACCOUNT_PUBLIC = BASE_URL + '/account/public';

export const URL_API_APPLICATIONS = BASE_URL + '/config/client/application';

export const URL_API_TERRITORIES = BASE_URL + '/config/client/territory';

export const URL_API_TERRITORIES_POSITIONS = BASE_URL + '/config/client/territory/position';

export const URL_API_MAP_CONFIG = (appId: number, territoryId: number) =>
  BASE_URL + `/config/client/profile/${appId}/${territoryId}`;

// TODO Ver si son necesarios
export const URL_API_I18N_MESSAGES_PREFIX = '';

export const URL_API_I18N_LANGUAGE = '';

export const URL_API_I18N_MESSAGES_LIST = '';

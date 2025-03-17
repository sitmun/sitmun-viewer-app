export const URL_AUTH_VERIFY_PASSWORD = '/api/user-verification/verify-password'

export const URL_AUTH_VERIFY_EMAIL = '/api/user-verification/verify-email'

export const URL_AUTH_LOGIN = '/api/authenticate';

export const URL_RECOVER_PASSWORD = '/api/recover-password'

export const URL_API_USER_DETAILS = '/api/account';

export const URL_API_APPLICATIONS = '/api/config/client/application';

export const URL_API_TERRITORIES = '/api/config/client/territory';

export const URL_API_TERRITORIES_POSITIONS = '/api/config/client/territory/position'

export const URL_API_MAP_CONFIG = (appId: number, territoryId: number) =>
  `/api/config/client/profile/${appId}/${territoryId}`;

// TODO Ver si son necesarios
export const URL_API_I18N_MESSAGES_PREFIX = '';

export const URL_API_I18N_LANGUAGE = '';

export const URL_API_I18N_MESSAGES_LIST = '';

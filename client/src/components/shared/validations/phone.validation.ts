export const normalizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '');

export const ISRAELI_MOBILE_PHONE_ERROR_MESSAGE = 'הזינו מספר נייד תקין';

export const isValidIsraeliMobilePhone = (phone: string): boolean => /^05\d{8}$/.test(normalizePhoneNumber(phone));

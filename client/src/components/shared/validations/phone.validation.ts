export const normalizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '');

export const isValidIsraeliMobilePhone = (phone: string): boolean => /^05\d{8}$/.test(normalizePhoneNumber(phone));

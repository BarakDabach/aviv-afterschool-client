export abstract class DataService {
  abstract getAuthOtpResendTimeoutSeconds(): Promise<number>;
}

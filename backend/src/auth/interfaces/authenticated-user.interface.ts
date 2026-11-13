/** Isi (payload) JWT yang diterbitkan saat register/login. */
export interface JwtPayload {
  /** ID user (subject), standar klaim JWT. */
  sub: string;
  email: string;
}

/** Identitas user yang ditempelkan JwtStrategy ke `request.user`. */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

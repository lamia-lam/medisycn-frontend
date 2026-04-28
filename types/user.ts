export enum Role {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  PHARMACY = "PHARMACY",
  DIAGNOSTIC = "DIAGNOSTIC",
}

export interface User {
  email: string;
  password: string;
  role: Role;
}

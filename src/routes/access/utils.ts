import _ from "lodash";

export const enum AccessMode {
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
}

export async function getUserData(user: any) {
  const data = _.pick(user, ["_id", "name", "roles", "profilePicUrl"]);
  return data;
}

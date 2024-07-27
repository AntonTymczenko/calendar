import { IRegisteredUser, IUser } from "../../services/user-service";

export const baseUrl = "http://localhost:8080";

async function req(url: string, payload: any, options?: any) {
  const response = await fetch(url, {
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    ...(options || {}),
  });
  const data = await response?.json();

  return data;
}

export async function registerUser(
  payload: Pick<IUser, "fullName" | "email">
): Promise<IRegisteredUser> {
  return req(`${baseUrl}/user/register`, payload, {
    method: "POST",
  });
}

export function getRequestFn(owner: IRegisteredUser) {
  return async function request(
    method: "POST" | "GET",
    url: string,
    payload?: any
  ) {
    return req(url, payload, {
      method,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
      },
    });
  };
}

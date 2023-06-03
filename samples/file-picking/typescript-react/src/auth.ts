import {
  PublicClientApplication,
  Configuration,
  SilentRequest,
} from '@azure/msal-browser';
import { combine } from '@pnp/core';
import { IAuthenticateCommand } from '@pnp/picker-api/dist';

const msalParams: Configuration = {
  auth: {
    authority:
      'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a',
    clientId: '86fe9fe1-b505-43b4-af3f-d4a4f11404f4',
    redirectUri: 'http://localhost:3000',
  },
};

const app = new PublicClientApplication(msalParams);

export async function getToken(command: IAuthenticateCommand): Promise<string> {
  return getTokenWithScopes([`${combine(command.resource, '.default')}`]);
}

export async function getTokenWithScopes(
  scopes: string[],
  additionalAuthParams?: Omit<SilentRequest, 'scopes'>
): Promise<string> {
  let accessToken = '';
  const authParams = { scopes, ...additionalAuthParams };

  try {
    // see if we have already the idtoken saved
    const resp = await app.acquireTokenSilent(authParams!);
    accessToken = resp.accessToken;
  } catch (e) {
    // per examples we fall back to popup
    const resp = await app.loginPopup(authParams!);
    app.setActiveAccount(resp.account);

    if (resp.idToken) {
      const resp2 = await app.acquireTokenSilent(authParams!);
      accessToken = resp2.accessToken;
    } else {
      // throw the error that brought us here
      throw e;
    }
  }

  return accessToken;
}

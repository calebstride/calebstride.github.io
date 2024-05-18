---
title: React Router OpenID
header: Connecting via OpenID from React Router
description: An investigation on how to connect via OpenId to an authorisation
    server within React Router
type: blog
creationDate: 2023-10-22
---

## Problem
This blog is about the issues I encountered when trying to use an OpenID flow 
from my React application. 

## Current Issues
Currently, I am using [this React project](https://github.com/react-keycloak/react-keycloak#readme) 
to handle logging in to my application in the ui.

There are a few issues with this project. The main one being that this project 
is no longer maintained.

The other main issue is that it has a few problems with 
[React Router v6](https://reactrouter.com/en/main), which I'm using in my project. 
One of which being that the new React router loaders run during the rendering 
of the page. This means that the app will try to call the resource servers before 
the keycloak authorisation flow has finished. This results in a http 401 and the
first time the ui is loaded it will say that the resources couldn't be retrieved.
Despite the fact that the authorisation flow would have finished successfully by that
point.

So to fix these issues I needed to focus on two things, upgrading or replacing the 
old library to something new that will handle the authorisation flow. But at the 
same time I need a solution that will work with loaders, so it can't all be done
in the rendering of the page. Or I switch from using loaders to using fetchers
so the retrieval of the data is done in the main rendering stage.

## Solution
I found the [react-oidc-context](https://github.com/authts/react-oidc-context) 
library that I could use to handle logging-in, but this would still have the 
issue with loaders fetching data before the user is logged-in.

I also found [this guide](https://github.com/remix-run/react-router/tree/main/examples/auth-router-provider)
for an example of using logging-in with loaders and actions.
The potential issue with this is that I'd need to add lots of logic
to work with the authorisation flow.

I decided to go with a simpler option that would avoid a lot of the headache around
moving the authentication logic into the loaders. My solution is to implement a
callback page in my frontend. This would receive the user after they log in, and 
then redirect them to a suitable location. This route won't be associated with
a loader, so no failed attempts would be made to backend apis. It also means that
we can wait for the user to finish authenticating before moving the user to the 
private ui pages.

I used the react-oidc-context library for my app to handle the calls
to the authorisation server. The only issue with this is that the auth object is
returned via hooks, which you can't use in loaders as they are run separately. I
got around this by using the token that's stored in the sessionStorage (which
react-oidc-context does by default) for the loaders.

```typescript jsx
function createBearerToken(): string {
    return 'Bearer ' + (getUser()?.access_token);
}

function getUser() {
    const storageString = `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;
    const oidcStorage = sessionStorage.getItem(storageString);
    if (!oidcStorage) {
        return null;
    }
    return User.fromStorageString(oidcStorage);
}
```
The above functions are an example of how you can retrieve the access token from the
session storage. These are called within the loaders and can assume the user is 
logged in.

```typescript jsx
import React from 'react';
import {useAuth} from 'react-oidc-context';
import {Link, Navigate} from 'react-router-dom';

export function CallbackLanding() {
    const auth = useAuth();
    const state = typeof auth.user?.state === 'string' ? auth.user?.state : '/home';

    return (
        <>
            {auth.isLoading ?
                <div>You are being redirected to the desired page. If you are not redirected, click
                    <Link to={'/home'}> here</Link>
                </div>
                :
                <Navigate to={state}/>
            }
        </>
    );
}
```
This is an example of the callback page where the user is redirected after logging-in via the
authentication provider. It uses the react-oidc-context provider to retrieve the authentication
information to see if the user is logged in. This page also stores a state so the 
user can be redirected to a specific page if necessary.

## Potential Issues With Solution
One thing I don't really like about the solution is the fact that it requires
the use of the sessionStorage for storing tokens. This is potentially not safe against
XSS attacks. Although due to the fact that you can't see other people's data in
the ui, and the backend is strict on what data it will save, I think this can be
ignored for the time being.

It would be better to have some in memory storage for this token. Or perhaps to 
move the token retrieval to a backend application. This backend application could then 
be called from the frontend and do the token retrieval on behalf of the user. 
This would stop the tokens from being accessible via man-in-the-middle attacks 
or similar. Although it would have similar issues with storing session information
in the browser.
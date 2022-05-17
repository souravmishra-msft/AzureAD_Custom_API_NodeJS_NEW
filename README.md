---
services: azure-active-directory
platforms: nodejs
author: soumi
level: 200
client: Watchlist API (using Express and Passport.js)
endpoint: Microsoft Identity Platform
---
# A NodeJS-Express REST API that performs simple CRUD operations. 

## Scenario

This sample shows us how to protect our custom APIs using Azure AD. The sample API is calle the Watchlist API, where you can use this to create a personal watchlist for the movies or tv-series and store them in a database. The sample API performs functions like add, list, update and delete the watchlist items. The API uses MongoDB Atlas to store the watchlist items.  

### Step 1: Clone or download the repository
From your shell or command line:

```powershell
git clone https://github.com/souravmishra-msft/AzureAD_Custom_API_NodeJS_NEW.git
```

### Step 2: Setup MongoDB Atlas 
To setup MongoDB Atlas, refer to the following [documentation](https://www.mongodb.com/docs/atlas/getting-started/) for more details. Once MongoDB Atlas setup is done, lets go ahead and take a look at the Watchlist API project.

### Step 3: Download node.js for your platform.
To successfully use this sample, you need a working installation of [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). 

### Step 4: Install NPM modules
From your shell or command line:
* `$ npm install`

### Step 4: Register your API in Azure AD.
Once the NPM modules are installed for the project, next we need to register our API in Azure AD. To register the custom API in Azure AD, you can refer to the following documentation.

Your API registration in Azure AD, should include the following details:
	
- Under Authentication blade:
    - Supported account types : Accounts in this organizational directory only (single tenant)
- 	Under Expose an API blade:
	- Set the Application ID URI.
        - By default it assigns a value similar to "api://<client-id-of-the-api-registration>"
        - You can customize this value with your domain name that would act as your API's namespace. e.g "api://your-domain.com".
    - Add a scope: In this section we will add three scopes following the least privieldge model.
    
        | Scope Name      | Display Name         | Description                             | Who can consent? |
        |-----------------|----------------------|-----------------------------------------|------------------|
        | items.read      | Read Items           | Allows reading items the user created   | Admins and Users |
        | items.readwrite | Read and Write Items | Allows the user to read and write items | Admins and Users |
        | items.read.all  | Read All Items       | Allows a user to read all items         | Admins Only      |

- Under App Roles blade:

    - Here we need to add the roles that would be used by any application, service or a daemon app to call this protected API, when fetching the token on its behalf. 

        | Display Name  | Value               | Description                                 | Allowed Member Types |
        |---------------|---------------------|---------------------------------------------|----------------------|
        | ReadWrite.All | items.readwrite.all | Allows the ap to modify and read all items. | Applications         |
        | Read.All      | items.readAll       | Allows the app to read items                | Applications         |

### Step 6: Register another application in Azure AD to test this API.
After registering our API in Azure AD, we need to make another app registration to test this API. This app registration will be for the front-end application that would be used to call our protected API. Here, we will use Postman as the frontend app to call our protected API.

1. Select New Registration under App Registrations blade.
1. Provide a suitable name for this frontend app's app registration. For e.g: Frontend_App.
1. Select the platform as "Web" and enter valid redirect URI. For e.g: http://localhost:1234
1. Under supported account types, select "Accounts in any organizational directory (Any Azure AD Directory - Multitenant)".
1. Then click on Register.
1. Post creating of the App Registration, select "Certificates and secrets" blade and create a new Client Secret. Make sure you copy and store the secret somewhere safe, post creating it, as we will need this secret when trying to fetch token using Postman.
1. Next, under the API permissions blade, lets add the scopes for our custom API. Select "Add a permission" and then select My APIs or  APIs my organization uses. Search the name for our API (the name with which  our API was App's registration was done in Azure AD) and add the respective scopes (Delegated Permission) and roles (Application Permission).

### Step 7: Create a main.env file under the config folder. Add the following details to the main.env file.
* `PORT = 3000`
* `DB_CONNECT = <MongoDB Connection String>`

### Step 8: To locally run the sample, you can use npm run start or in dev environment you can use npm run start-dev.
* `npm run start-dev`

### Step 9: To test the APIs, you can use the postman collection. After installing the Postman, you can import the json file available under the Postman_Collection directory and test the APIs.
**Note:** Some of the APIs require an access-token fetched by the frontend app on behalf of the user (using Auth-Code Grant Flow) and others require an access-token fetched by the frontend as on behalf of itself (using Client-Credentials Flow).

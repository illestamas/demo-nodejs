# OVERVIEW
The application strictly follows the requirements outlined in `task.md`. Please make sure to read that first to understand the requirements for this project.
Further down the readme file there's a section called `recommendations` dedicated to discuss imrpovement ideas both from development and business side, based on which the application could be turned into a real production API which could yield money for the business hosting it.

# SETUP
In order to run the application first you need to install dependencies by running `npm install`.
Make sure enviornment variables are properly configured in `.env`.

NOTE: environment variables should **NEVER** be stored in github. The reason you can find it included in this project is because the application is solely built for demonstration purposes.

The application is written in typescript. To run the application in dev environment (using typescript) run `npm run start`. To launch the application with nodemon, run `npm run dev`.
The application is compiled to javascript using the `npm run build` command, that outputs the compiled javascript code to `./build`. If you want to run the application from there, navigate to the folder, then run `node index`.
The application is configured to work with Docker. Please find more information on how to run it as a Docker image in the `CONTAINER` section of the readme.

# DATABASE
The application stores uses `mySql` server.
The connection is handled via an ORM called `sequelize`, the database logic can be found in `./src/db`.
Sequelize connects to the SQL server based on the environment variables defined in the .env file: `APPSETTING_DB_*`. The default values are configured to work with a local mysql instance.

# DATABASE MIGRATIONS
To automatically handle database migrations, `umzug` is used, that's configured to work with sequelize.
Umzug creates a `sequelize_meta` table on the SQL server that's sole purpose is to store migrations that have already been applied to the database.
Migration logic is handled in the `./src/db/migrations` folder.

# DATABASE LOGIC
Models are defined in the `./src/db/models` folder.
Each model is translated into one table, so currently there are two tables that are created based on the models: `artwork`, `user`, and one table created by sequelize to store the migrations logic called `sequelize_meta`.
User table stores user information, while artwork tables stores purchase information. As this structure is quite limiting should the application be extended, another schema recommendation can be found in the recommendations section.

# LOGGING
The application uses `winston` to handle logging mechanism.
By default winston is using the console for logging, however it can also be configured to output logs to a 3rd party log management system called `logtail` from Betterstack.
To connect to Logtail, you need to create a profile on logtail first, then populate the `APPSETTING_LOGTAIL_API_KEY` environmental variable.
If this environment variable is populated, the application automatically connects winston to logtail.

# SYSTEM HEALTH
There is a `system` endpoint that is protected by the `APPSETTING_ADMIN_SECRET` environment variable, that gives information on system health.
The reason it's not gated via jwt (as the rest of the application) but by a single secret is because it's easier to integrate with 3rd party monitoring tools (e.g. Betterstack).
Currently it's capabilities are quite limited, but ce be further expanded should be needed. Alternatively a more secure authentication method can be configured for this endpoint as well.

# AUTHENTICATION
All of the application's endpoints are gated, and most of them require users to login first, asking their emails and passwords.
As `password` should NEVER be stored as plain text in a database, it's value is hashed, the logic for that can be found in `./src/db/models/user.ts`.
The hashing algorithm uses an environmental variable called `APPSETTING_SALT_ROUNDS` to generate the output. The higher it's value, the more secure the hashing algorithm gets, but the more demanding it will be on CPU resources to run.

# SESSION MANAGEMENT
After successful login, the user receives a `jwt` token (JSON Web Token) that needs to be provided for all further requests, except for the `/system` endpoint.
The expiration of the token is set in the `APPSETTING_JWT_EXPIRATION` environment variable.

NOTE: as jwt is public and can be easily decoded, a user's `reference` field is stored in the token's payload instead of the user's `id`. The reason for that is that the id field tells information about the number of users we have in the database, which is a sensitive information we do not want to disclose to our users.
Once the token has expired, users have to login again. Alternatively, the token can also be extended using the `/auth/refresh` endpoint.

# TESTING
Jest is used for unit testing, which you can run by executing the command `npm run test`.
Before running the tests, make sure that the application is running by executing `npm run dev` first!

# CONTAINER
The application is containerized using Docker Compose.
The container includes an instance of a mysql server, and the nodejs application that connects to the server (please see docker-compose.yml for more information).

Once you have installed Docker, in order to run the application execute the following command: `docker-compose up -d`
This command will build and run the application as a background service in Docker, without further dependencies required on your machine.
To check the API, use localhost and the port defined in the `APPSETTING_DOCKER_PORT` environment variable (e.g.: http://localhost:8080/auth).

# KNOWN ISSUES
- When you run `docker-compose up`, the node js application tries to connect to mysql immediately, but fails, as the mysql server is not yet initialized.
  It will try to reconnect in a couple of seconds by which time the mysql server has already been successfully initialized, so the connection will be established, but only after a failed attempt.
  It's not too elegant, and in production environment (if a 3rd party logging application is connected) a connection failed message would be sent to our logging service, possibly triggering a workflow that is not intended.
  To solve this, a wait command could be implemented during Dockerization forcing the node js app to only start once the mysql server has been properly initialized.
- JWT recommends that you have the `Bearer ` keyword when sending the token to the server, however for this application it's not sent.
  The reason for that is to make your life easier should you want to decode the jwt token.

# RECOMMENDATIONS (ARCHITECTURAL)
The application's functionality can be further expanded.
Please find below a couple of recommendations worth considering for future improvements:

- Currently one artwork can belong to one user only. In reality artworks may change ownerships due time.
  For that logic several modifications may be required in the `artwork` table, including adding `ownership_start` and `ownership_end` dates respectively, and removing a unique constraint on the id.
  Removing the id constraint (meaning each artwork may appear twich in the table, as opposed to the current structure that only allows them to appear once) requires a locking mechanism to be put in place (in sequelize you can do that via a transaction) to avoid racing conidtion.

- Response rates for the artwork endpoints are a bit slow as we need to reach out to a 3rd party ARTIC API to get the data.
  Caching the data locally would greatly enhance performance, thus it's worth considering doing a sync via a CRON job with the ARTIC API and storing the data locally in our SQL server.
  In addition to this, frequently requested artworks may be cached using an in-memory database (e.g. Redis).

- Considering the two points above, a more optimal database structure would look like:
    * users
    * artworks
    * purchases
  where artworks have a temporality (which would be stored in `purchases` table), while `artworks` table solely functions to store artworks data retrieved from the ARTIC API.
  A CRON job should be configured to keep our database in sync with of ARTIC API's, or setup an endpoint for that purpose and let ARTIC API push changes to our database (if it's a possibly on their side).
  This structure would allow the API to be further developed to allow buying and selling artworks easily.
  
- In order to help users finding the artworks they may be interested in, the following is recommended:
  * Implement a machine learning algorithm that classifies images by telling what's on the image either in human-like language, or in keywords.
  * Track which artworks users have viewed, and with the help of the classification algorithm create a recommendation engine that can be used to show relevant artworks for the users (for instance in the endpoint where artworks are retrieved, instead of not using any sort at all, sorting by relevance can be configured).

- Connect the application with chatGPT, and allow users to tell in natural language what kind of artworks they would like, and retrun them back the results.

# RECOMMENDATIONS (BUSINESS)
  - Add buying/selling methods, implement a payment method (e.g. STRIPE) and charge a brokerage fee as the API is basically connecting users with artworks.
  - If you do not want turn app into a marketplace, but still want to make money, a premium subscription can be also added, where the advanced features (e.g.: chatGPT search) can be only be used by premium users.
  - Allow artworks to be promoted. When users want to view artworks, promoted artworks could appear first, then those sorted by relevance based on the recommendations engine, and then the rest.
  - As we already have our users' email addresses, connect an SMTP server to the API to send emails to users about artworks they might be interested in.
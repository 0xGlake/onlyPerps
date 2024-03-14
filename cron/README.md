cron job that runs every 15mins to store our aggregated exchange data into our postgresSQL server

uses AWS lambda and EventBridge

## Getting Started

```bash
npx ts-node main.ts
```

## Prep Lambda

```bash
npm run build
npm run zip
```


Run npm install to install the dependencies.
Run npm run build to compile the TypeScript code into JavaScript.
Run npm run zip to create a ZIP file named function.zip containing the compiled JavaScript files and dependencies.


Upload the function.zip file to your AWS Lambda function as described in the previous steps.

Set the environment variables in your Lambda function, including the CONNECTION_STRING for your Neon PostgreSQL database.

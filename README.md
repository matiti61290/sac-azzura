# Sac'Azura

## Getting Started

This project uses a backend made with NestJs and a frontend made with NextJs and Tailwind. The database works in SQL. 

### Backend

You will need first to install the backend with these two commands: 

```bash
cd backend
npm install
```

The backend needs a env file with several variables listed here :

```env
PORT = backend port
DB_HOST = database host
DB_PORT = database port
DB_USER = database user
DB_DATABASE = database name
USER_MAIL = mail used by the admin for nodemailer
PASSWORD_MAIL = password of the mail used by the admin for nodemailer
JWT_SECRET = Secret key generated for the JWT token creation
Node_ENV = use dev
AWS_S3_BUCKET_NAME = name of the S3 bucket
AWS_ACCESS_KEY = Key given by AWS to access your account
AWS_SECRET_KEY = key given by AWS to access your account
PUBLIC_KEY_STRIPE = key given by Stripe to access your account
SECRET_KEY_STRIPE = key given by Stripe to access your account
SECRET_WEBHOOK_KEY = key given by Stripe CLI to use the webhook
MONDIAL_RELAY_API_V1_BRAND = name given to access Mondial Relay SOAP API test environment
MONDIAL_RELAY_API_V2_BRAND = name given to access Mondial Relay REST API test environment
MONDIAL_RELAY_API_V1_PRIVATE_KEY = private key given by Mondial Relay to access SOAP API test environment
MONDIAL_RELAY_API_V1_URL = url given to access Mondial Relay SOAP API test environment
MONDIAL_RELAY_API_V2_MAIL = mail given to access Mondial Relay REST API test environment
MONDIAL_RELAY_API_V2_PASSWORD = password given to access Mondial Relay REST API test environment
MONDIAL_RELAY_API_V2_URL = url given to access Mondial Relay REST API test environment
MONDIAL_RELAY_WEBHOOK_SECRET = Code given by mondial relay to use a webhook. You will need an account on their website connect.mondialrelay.com
COLISSIMO_API_KEY = API key to use Colissimo service. You can use whatever you want here in test environment
COLISSIMO_API_URL = Colissimo API URL for test
COLISSIMO_WEBHOOK_SECRET = Webhook secret key for Colissimo
```

**Warning**: Some variables may not be available like for Mondial Relay or Colissimo and i can't give these variable because they are linked with the company Sac'Azura. If needed, i will show a demonstration during the presentation.


>**Important Warning** 
Some variables may not be available (like Mondial Relay or Colissimo tokens) because they are strictly linked to the official *Sac'Azura* corporate account. I cannot share these credentials publicly. If needed, a live demonstration will be provided during the presentation.


To start the project, use the following command:

```bash
npm run start:dev
```

To learn more about NestJs: https://docs.nestjs.com

### Frontend

After you installed the backend, you will need to install the frontend following these commands:

```bash
cd frontend
npm install
```
The frontend needs a env file with one variable :

```env
NEXT_PUBLIC_API = BASE URL of the Nest API
```

To start the project, use the following command:

```bash
npm run dev
```

## Payment

To use the payment webhook, you will need to use Stripe CLI. You can install it with the following command:

```bash
npm install -g @stripe/cli
```

Then, you can start the CLI with this following command:

```bash
stripe login
```

This command will redirect you to Stripe on your browser. You will need to log in your stripe account.

Then, you can use this command to use the webhook if you try the payment:

```bash
stripe listen --forward-to localhost:3001/payment/webhook
```

You can find the Stripe CLI documentation here: https://docs.stripe.com/stripe-cli


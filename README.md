# Technology Stack
1. ReactJs - Frontend
2. NodeJs with ExpressJs - Backend
3. MSSQL - Database
   
# Work done till now

## Security Implementations

1. Rate Limiting: Rate LImiting has been implemented to prevent API abuse.
2. Bruteforce Prevention : Bruteforce prevention mechanism implemented for login route. User's ip address, user agent and login email will be combined to create a unique key. After 10 attempts the access would be locked for 15minutes for the corresponding IP ensuring the real user is not affected
3. XSS Sanitization: Prevents Malicilious attacker's code from executing in the web application
4. SQL Injection Blocking: SQL Injection would be detected and blocked. Attacker's IP Address would be logged
5. NOSQL Injection Blocking: It would be an SQL Database. NoSQL Injection prevention just to confuse the attacker
6. IP Blocking Mechanism : Partially Implemented., Used to block IP Addresses from visiting the web app temporarily or permenantly based on conditions yet to implement
7. HTTPS Enforcement : Enforced https redirection in production mode
8. Prevention against common attacks: Added protection against common web vulnerbilities such as clickjacking, MIME Sniffing,XSS, CSRF attacks etc.
9. Service Information Spoofing : Details about the server and technology is hidden and spoofed as PHP/Wordpress for honeypot baiting. Some decoy wordpress pages have been created for the same
10. CORS Implementation : CORS have been implemented for authorized API usage and to prevent abuse.
11. Soft Slow Down Implemented. Hard Rate Limit Implemented for JWT Login
12. Created 2 bruteforce middlewares, General Bruteforce Rate LImiter and Targeted Bruteforce Rate Limiter to counter Spray Bruteforce attacks and attacks targeted on a specific user 

## Emails

1. Basic Email configuration has been set to send emails from the web application.
2. Email Templates for account creation, Password reset link, Order created has been done. Backend logic to send email based on 'type' for the same has been configured

## Backend

### Basic server configuration
1. Basic routing, middlewares configurations , db configurations, dotenv and rest of the groundwork for a basic server has been completed.
2. Error handing middleware created for http error redirects (i.e 500 - Internal Server Error, 400 - Invalid Request, 404 - Not Found etc)

### Authentication
1. Features RBAC based User authentication
2. Frontend and Backend Validation logic added for JWT Login system
3. Password Hashing implemented with 12 rounds of encryption using Bycrypt
4. Stored JWT Token in cookies as http only and other security measures
5. JWT Payload itself contains JTI as it invalidate a particular token by storing its jti in a blacklist

## Database

1. MSSQL Database has been connected and configured for the Nodejs server
2. Users Table based on Data dictionary has been created
3. Separate Table has been created to store user sessions including device fingerprints

## Frontend

1. Basic React Project set, Routes added
2. Registration Page created. Frontend validations for Name, Email, Password added

   
   

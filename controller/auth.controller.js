const { poolPromise, sql } = require('../db/sql/dbConfig.js');  // MSSQL Db Pool
const jwt = require('jsonwebtoken'); // JWT Token 
const bcrypt = require('bcryptjs'); // Password Encryption Library
const { randomUUID } = require('crypto'); // Unique Identifier generator for JWT Token
const { pool } = require('mssql');

const checkEmailExists = async (email) => {
  try {
    // Creating db connection pool
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', email)
      .query('SELECT 1 FROM Users WHERE email = @email');

    console.log("[*] Recordset Response -  ", result)
    console.log("[*] Recordset Response - Email Validation ", result.recordset.length)
    return result.recordset.length > 0;
  }
  catch (error) {
    console.log(`[*] Error in Validating Email Address in database ${error}`)
    return false;

  }
}

const sanitizeInput = (inputValue, type = 'string') => {
  if (!inputValue || typeof inputValue !== 'string') return null;

  switch (type) {
    case 'string':
      return inputValue.trim().toLowerCase(); // for names, emails, etc.

    case 'password':
      return inputValue.trim(); // preserve case

    default:
      return null; // unsupported types can be handled here
  }
};

const getRegisterPage = (req, res) => {
  return res.send("Register Page")
}

const postRegisterPage = async (req, res) => {

  try {

    const allowedGenders = ['male', 'female', 'other'];
    let hashedPassword;
    let recordsetUid; // Unique Database Id for each registered user

    // Fetching form data from Registration page
    let { firstName, lastName, email, phone, password, confirmPassword, dateOfBirth, gender } = req.body;

    console.log("FIRST NAME, LNAME, EMAIL.PASSWORD,PHONE, confirmpassword,DateOfBirth,gender", firstName, lastName, email, password, phone, confirmPassword, dateOfBirth, gender)

    // Sanitizing Inputs for security and consistency

    firstName = sanitizeInput(firstName)
    lastName = sanitizeInput(lastName);
    email = sanitizeInput(email);
    phone = sanitizeInput(phone);
    password = sanitizeInput(password,"password");
    confirmPassword = sanitizeInput(confirmPassword,"password");
    dateOfBirth = sanitizeInput(dateOfBirth);
    gender = sanitizeInput(gender);

    if (!firstName) return res.status(400).json({ success: false, error: "First name is required" });
    if (!lastName) return res.status(400).json({ success: false, error: "Last name is required" });
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    // Validate Password locally

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password is required"
      })
    }
    if (password !== confirmPassword) {

      return res.status(400).json({
        success: false,
        error: "Passwords do not match"
      }
      )
    }

    //  Validate Gender

    if (!gender) {
      return res.status(400).json({ success: false, error: 'Gender is required' });
    }

    if (!allowedGenders.includes(gender?.trim().toLowerCase())) {
      console.log("[*] Invalid Gender Added. Gender should be Male, Female or Other ")
      return res.status(400).json({ success: false, error: "Gender must be Male, Female or Other" })
    }

    // Validating email in database 
    const emailExistsInDatabase = await checkEmailExists(email)

    if (emailExistsInDatabase) {
      console.log("emailExistsInDatabase", emailExistsInDatabase)
      return res.status(409).json({ success: false, error: "User with that Email Address already exists" });
    }


    // Need to keep it outside function to prevent unnecessary re-rendering
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);  // India-style phone number validation
    const isValidDate = (date) => !isNaN(Date.parse(date));

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, error: "Valid 10-digit phone number is required" });
    }

    if (!dateOfBirth || !isValidDate(dateOfBirth)) {
      return res.status(400).json({ success: false, error: "Valid Date of Birth is required" });
    }

    if(password.length <8){
      return res.status(400).json({success:false, error:"Password must atleast be 8 characters long"})
    };

    try{

      hashedPassword = await bcrypt.hash(password, 12) // 12 Rounds Salt Encryption
      console.log("[*] Hashed Password ", hashedPassword);
    }
    catch(error){
      console.log("[*] Error in Hashing Password ",error);
      return res.status(500).json({ success: false, error: "Internal Server Error. Please Try Again Later" });
    }

    try{
      const pool = await poolPromise;

      // Begin SQL Transaction

      const transaction = new sql.Transaction(pool)

      await transaction.begin()

      const request = new sql.Request(transaction)

      const registrationResult = await request
        .input('FirstName', firstName)
        .input('LastName', lastName)
        .input('Email', email)
        .input('Gender', gender)
        .input('DateOfBirth', dateOfBirth)
        .input('PhoneNumber', phone)
        .input('PasswordHash', hashedPassword)
        .query(`INSERT INTO Users (FirstName, LastName, Email, Gender, DateOfBirth, PhoneNumber, PasswordHash)
        OUTPUT INSERTED.ID
   VALUES (@FirstName, @LastName, @Email, @Gender, @DateOfBirth, @PhoneNumber, @PasswordHash) `);
  
  
      if (registrationResult.rowsAffected[0] === 1) {
        recordsetUid = registrationResult?.recordset[0].ID

        if(!recordsetUid){
          console.log("[*] Error Fetching Recordset UID from database")
        }
        console.log("[*] Recordset ID Generated for the registered user")

        const jti = randomUUID() // Unique Token Id for non identical payload
        console.log("[*] User Registered Successfully to SecureEcomm")

        const tokenPayload = {
          id: recordsetUid,
          email,
          phone,
          name: `${firstName} ${lastName}`,
          role: "customer",
          jti:jti
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY,{expiresIn: "1h"});

        

        const userAgent = req.headers['user-agent'] || 'unknown';
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // JWT Token Expiry (1 hour)

        const userTokenStorageResult = await request
        .input('UserID',recordsetUid)
        .input('Token', token)
        .input('Jti', jti)
        .input('IsRevoked',0)
        .input('UserAgent',userAgent)
        .input('ExpiresAt', expiresAt)
        .query(`
        INSERT INTO UserTokens (UserID, Token, Jti, IsRevoked, UserAgent, ExpiresAt)
        VALUES (@UserID, @Token, @Jti, @IsRevoked, @UserAgent, @ExpiresAt)
      `);
      await transaction.commit();

      console.log("[*] Transcation Commited.")
      if(userTokenStorageResult.rowsAffected[0] === 1){
        console.log("[*] JWT Token stored in UserTokens table successfully");

        // res.cookie('auth_token', token,{
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === 'production',
        //   sameSite: 'Strict',
        //   maxAge: 2 * 60 * 60 * 1000

        // })

        // Development Mode Cookie Storage Mechanism

        res.cookie('auth_token', token,{
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 2 * 60 * 60 * 1000

        })

        console.log("[*] Sample Token Payload", tokenPayload)
        return res.status(201).json({ success: true, message:"User Registration Successful",token:token})


      }
      else{
        console.log("[*] Token Insertion Failed. Failed to store JWT Token")
      }
      }
      else {
        console.log("[*] User Registration Failed. Full Log ", registrationResult)
        return res.status(500).json({ success: false, error: "User Registration Failed" })
      }
    }
    catch(error){
      console.log("[*] Error In Creating New User. Transaction Failed. Rolling back ",error)
      await transaction.rollback()

      return res.status(500).json({ success: false, error: "User Registration Failed" })
    }

 
  }
  catch (error) {
    console.log("[*] Error In User Registration ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error. Please try again later" })
  }
}

const getLoginPage = (req, res) => {

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login Form</title>
</head>
<body>
    <h2>Login</h2>
    <form action="/login" method="POST">
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required><br><br>
        <button type="submit">Login</button>
    </form>
</body>
</html>`);

}



const postLoginPage = async (req, res) => {

  try {
    let { email, password } = req.body;

    // Sanitization of email and password 
    email = sanitizeInput(email);
    password = sanitizeInput(password);

    const userAgent = req.headers['user-agent'] || 'unknown';

    // Fetching User Details
    const emailResult = await pool.request()
      .input('Email', email)
      .query(`SELECT Id, PasswordHash, FirstName, LastName, PhoneNumber FROM Users WHERE Email = @Email`);

    const user = emailResult.recordset[0];

    const realPassword = "12345678";

    const emailExists = await checkEmailExists(email);

    if(!emailExists){

      // Need to create a fake bcrypt hash for dummy password hashing to avoid Email Enumeration via timing attack
      // Reason : If email doesnt exist => Fast Return. If email exists => bcrypt compare adds delay

      // Email Enumeration is when an attacker tries to figure out whether a specific email exists in your system
      // without having access to the database. They do this by sending login or signup requests and looking for
      //  differences in responses (timing, messages, status codes, etc.).

      // If email does not exist, A fake bcrypt hash is used to simulate password checking:
      // Reason : Attacker sends 1000 login requests with random emails.
      // If the response is instant, email does not exist. If the response is slightly delayed, email exists.

      const dummyHash = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8HZkgBG/MNoBzph/1pGl.YMdrWcGWy"; // hash for 'fakepassword'
      // The response time is always the same regardless of whether the email exists or not.
     await bcrypt.compare(password, dummyHash);
     await req.genbruteforce.fail();
     return res.status(401).json({success: false,error:"Invalid Credentials Email"})
    }
    else{
      console.log("[*] Email Exists. Proceeding Further")
    }

    // Fetching password from database

    const hashedPasswordFromDb = await pool.request()
    .input('Email', email)
    .query('SELECT PasswordHash FROM Users WHERE Email = @email');

    
  
    // Comparing password hash
    if(hashedPasswordFromDb){

      const isPasswordMatch = await bcrypt.compare(password,hashedPasswordFromDb);

      if(!isPasswordMatch){
        res.status(401).json({success: false, message:"Invalid Credentials"})
      }
      else{

        console.log("[*] Password Match Found ")
        const jti = randomUUID();
        const tokenPayload = {
          id: user.Id,
          email,
          phone: user.PhoneNumber,
          name: `${user.FirstName} ${user.LastName}`,
          role: "customer",
          jti
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        const expiresAt = new Date(Date.now() + 60 * 60 * 2000);

        // SQL Transcation Started

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const trxRequest = new sql.Request(transaction);

        const existingToken = await trxRequest
      .input('UserID', user.ID)
      .input('UserAgent', userAgent)
      .query(`SELECT ID FROM UserTokens WHERE UserID = @UserID AND UserAgent = @UserAgent AND IsRevoked = 0`);
      }
    }
    else{
      console.log("[*] Error in fetching hashed password from database")
    }

    if (password !== realPassword) {

      try{

        await req.genbruteforce.fail();
        await req.tarbruteforce.fail();
      }
      catch(error){
        console.error("[*] General Bruteforce Rate Limiter/Targeted Bruteforce Middleware failed ",error)
      }
      console.log(`[*] Login Failed`);
      return res.status(401).json({ message: "Invalid credentials" });
    } else {

      // Reset Targeted and General Bruteforce counter
      await req.genbruteforce.success();
      await req.tarbruteforce.success();
      res.status(200).json({ message: "Logged in successfully" });
    }
  } catch (error) {
    console.log("[*] Error in Login POST Route ", error);
    res.status(500).json({ message: "Server Error" });
  }

}


module.exports = {
  getRegisterPage,
  getLoginPage,
  postLoginPage,
  postRegisterPage
};
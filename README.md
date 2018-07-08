# AWS Lambda Pre-signed up Trigger for AWS Cognito - (Custom Validation)

##### This AWS Lambda Pre-signed up trigger for AWS Cognito check specific User infomation in the Database (MySQL)

- Check there's an user associated with the provided `Username, Email or Phone-Number`
 - If there's an account associated with any of the provided attributes, sends an Error to the client
  - Otherwise save the New User information in the database.
 


  
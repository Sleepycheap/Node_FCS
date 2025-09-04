This Email ReDirect app is used to truly redirect (not forward) an email. The original purpose of this app was to take emails sent directly to a person, and ReDirect that email to another email address as if the email came from the original sender to the redirect email address. This app utilizes Microsoft's Graph API Change Notifications feature, an SMTP email sending service, and MongoDB  Currently, the app is written to use STMP2GO, but any SMTP service should work. 

Graph API's "Get Attachment" endpoint used to extract information from the original email. 

Change Notifications listen any email sent to a specific email address (redirect@domain in my case). Graph API's Get Attachment endpoint is then called, and then an email is created using the sender email address and body data from the original email and sent using SMTP to the new email address determined in .env file. This final email address could be dynamic if you choose

This app was oringally used for tracking client emails in a CRM, so an important function is to track if an email has already been forwarded. Once an email has been forwarded, the data is written to the MongoDB database. If the same email is forwarded again, Mongo will give a duplicate entry error and the email will not be forwarded. Additionally, after the email has been forwarded, the person redirecting the email will receive a confirmation email that the forward was successful. A failure email will be sent in the case of a failure. 

**NOTES
The automation of this app is reliant on Graph API change notifications, and you will need to create a subscription to the mailbox to monitor the emails coming in. https://github.com/microsoftgraph/microsoft-graph-docs-contrib/blob/main/concepts/change-notifications-delivery-webhooks.md
Additionally, you will also need to create a lifecycle notification endpoint so that your subscription doesn't expire. https://github.com/microsoftgraph/microsoft-graph-docs-contrib/blob/main/concepts/change-notifications-lifecycle-events.md

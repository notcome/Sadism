#Sadism RESTful API

I think it necessary to have API first.

The working model is pretty simple: users create their own flashcards, providing definitions and notes. And my system will periodically present those cards to users, who could choose 'Remeber it' or 'Forgot it'. After several times of repetition, the contents on flashcards should be memorized.

Anyone could host the Sadism server if he or she wants. And because of its public RESTful API, anyone could have their own versions of Sadism clients running on different platforms.

Sadism is designed to provide service for multiple users, so an additional authentication system will be included. 

---

##Authetication System

Each user has his or her own password. Clients could sign their queries with the password. I am not sure whether this method is safe or not, but we still have HTTPS.

I will provide an API without any side effects to help the client authenticate users.

How to generate the signature?

//Incomplete

The *empty* API:

/login?username=Sadism&signature=xxxxxxxx

---

//Incomplete
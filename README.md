# DEVCITO - ESHOP API
Hi! This is my first **Backend** project. Here I set up the routes for the application.
## Routes
>The main API_URL is **/api/v1**

There are public and private routes, the user must register & login to create post request to orders. Also there's a property called isAdmin to identify 
## /categories
**public for GET Method**
/:id
## /orders
**private**
/:id
/get/userorders/:userid
/get/count
/get/totalsales
## /products
**public for GET Method**
/:id
/get/count
/get/featured/:count
```mermaid
put -> /product-gallery/:id for image gallery only
```
## /users
/users/login
/users/register
/get/count
# Stock System
## Prerequisites
Before running the application, make sure you have the following installed:
- Docker (for setting up the database)
- Yarn (for package management)

## Setup
Run Docker:
Open a terminal and run the following to load the database:
* docker-compose up

### Create Database Tables:
Inside the SQL folder, run the stock.sql file to create the necessary tables.

### Install Dependencies:
Open another terminal, navigate to the project directory, and run:
* yarn install

### Run the Application:
After installing dependencies, run:
* yarn restart

### API Documentation:
The file Insomnia.json contains all the API routes for testing the application.

## Usage
Start the application by running the appropriate build command as shown above.

Test endpoints using the Insomnia.json file or any API client of your choice.
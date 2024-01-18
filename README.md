# Overview
Example project structure for testing a dynamics model driven application

# environment-config.ts
The environment-config.ts file in the project root needs to be populated with the followinf details for the example test to run:
    webApiUrl: The base url fror making requests to dataverse
    appUrl: The url for accessing the application directly i.e. include appid and relevant guid
    email: The username for accessing the aplication
    password: The coresponding password for the above username
    secret: The client secret from the above user's MFA device. Can be obtained during setup of the MFA device. See https://github.com/microsoft/EasyRepro?tab=readme-ov-file#mfa-support


# Running the tests
1) npm install playwright (as admin)  - install playwright if required
2) npm init playwright [projectName]  - initiate project
3) npx playwright test --debug      - run all tests in debug
4) npx playwright show-report  - show the test report

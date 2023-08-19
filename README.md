# REST server created without using any external packages
## Note: twilio is the only external dependancy since server invloves in SMS sending.

### About the application
    - An uptime monitoring application that monitors your site and sends SMS when the site is down or up
    - NOT production ready
    - Created for learning node js basics

### Running the application
    - create the .data folder at ROOT with following flat subdirectories
            |-root
                |--.data
                    |--checks
                    |--users
                    |--tokens
    - create config.js file following the sample file config.sample.js
    - replace twilio account variables
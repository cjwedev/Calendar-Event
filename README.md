The app is based on Angular, the project utilizes grunt for build orchestration and bower for dependency management.
Also this project uses Cordova for wrapping the app into native containers.

For Development, you will want to run

    grunt dev
    
That will start a server for you running at <http://127.0.0.1:9001/>

Once you are happy with progress in the browser, you can publish your angular app into the cordova project, use grunt to build the distributable package

    grunt build

Then, to emulate the app:
Open another console and change directory in the /app folder then run the following (for iOS)

    cordova emulate ios
    


    
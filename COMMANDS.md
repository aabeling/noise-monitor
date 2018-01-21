
     $ cordova run browser


     $ cordova run android --list
     $ cordova run android --device --target 05ea8a60


# Development-Cycle

Für Platform 'browser' neu bauen, wenn sich Dateien geändert haben.
Dadurch ist kein neuen `cordova run browser` notwendig.
Stattdessen kann die Seite im Browser einfach neu geladen werden.

https://www.raymondcamden.com/2016/03/22/the-cordova-browser-platform/

     $ sudo gem install filewatcher
     $ filewatcher "www/**/*.*" 'echo $FILENAME;cordova prepare browser'


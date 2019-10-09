/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var dbMeterProxy = {

    methodStart: null,

    initialize: function() {

        /* set the functions depending on the platform */
        if (cordova.platformId == "browser") {
            this.methodStart = this.proxyStart;
        } else {
            this.methodStart = this.nativeStart;
        }
    },

    start: function(callback) {

        this.methodStart(callback);
    },

    proxyStart: function(callback) {

        /* just return a random value every 100ms */
        setInterval(function() {
            var decibelValue = Math.floor((Math.random() * 20) + 40);
            callback(decibelValue);
        }, 100);
    },

    nativeStart: function(callback) {

        /* start the plugin dbmeter */
        DBMeter.start(callback);
    }
};
dbMeterProxy.initialize();

var dbMeterCollector = {

    count: 0,
    sum: 0.0,

    /**
     * Receives a new value which will be added to the overall sum
     */
    receive: function(db) {

        this.sum += db;
        this.count++;
    },

    start: function() {

        /* see https://stackoverflow.com/questions/2749244/javascript-setinterval-and-this-solution */
        setInterval((function(self) {
            return function() {
                self.sendValue();
            }
        })(this), 30000);

    },

    sendValue: function() {

        var average = 0.0;
        if (this.count > 0) {
            average = this.sum / this.count;
        }

        document.getElementById("lastAverage").innerHTML = average;
        this.sum = 0;
        this.count = 0;

        var id = document.getElementById("id").value;
        var url = document.getElementById("url").value;
        this.sendValueToUrl(average, id, url);
    },

    sendValueToUrl: function(decibelValue, id, url) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                document.getElementById("lastSuccessfulTransmit").innerHTML =
                    new Date().toISOString();
            }
        };
        xhr.send(JSON.stringify({ id: id, decibelValue: decibelValue }));
    }

};
dbMeterCollector.start();

var app = {

    // Application Constructor
    initialize: function() {

        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        document.getElementById("platformId").innerHTML =
            "platform: " + cordova.platformId;

        document.getElementById("id").value = device.uuid;

        dbMeterProxy.start(function(dB) {

            var decibelValueElement = document.getElementById("decibelvalue");
            decibelValueElement.innerHTML = "decibelValue: " + dB;

            dbMeterCollector.receive(dB);
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
};

app.initialize();
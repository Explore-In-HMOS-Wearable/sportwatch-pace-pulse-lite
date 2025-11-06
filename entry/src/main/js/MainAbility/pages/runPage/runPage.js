import sensor from '@system.sensor';
import vibrator from '@system.vibrator';
import router from '@ohos.router';


export default {

    data: {
        stepcount : '--',
        heartbeatcount:'--',
        distance: '--',
        hrThreshold: 170,
        stepSensorSubscribed: false,
        heartRateSensorSubscribed: false,
        isOnBodyState: false
    },

    onInit() {
        // call step count API
        this.getStepCount();
        let _this = this;
        // to listen the sensor wearing state, returns true if wear is in wrist
        sensor.subscribeOnBodyState({
            success: function(response) {
                console.info('get on-body state value:' + response.value);
                if(response.value === true) {
                    _this.startHeartRateMonitoring();
                }
                this.isOnBodyState=true
            },
            fail: function(data, code) {
                console.info('fail to get on body state, code:' + code + ', data: ' + data);
            },
        });
        if (_this.heartbeatcount > _this.hrThreshold) {
            _this.navigateToHeartAlert();
        }
    },

    getStepCount() {
        let _this = this;
        sensor.subscribeStepCounter({
            success: function (response) {
                console.info('get step value:' + response.steps);
                _this.stepcount = response.steps + ' STEPS';
                _this.calculateDistance(response.steps);
                if(response.steps % 1000 === 0) {
                    _this.vibrate();
                }
                this.stepSensorSubscribed=true
            },
            fail: function (data, code) {
                console.info('subscribe step count fail, code:' + code + ', data:' + data);
            },
        });

    },

    startHeartRateMonitoring() {
        let _this = this;
        sensor.subscribeHeartRate({
            success: function(response) {
                _this.heartbeatcount = response.heartRate + ' BPM';
                if (_this.heartbeatcount > _this.hrThreshold) {
                    _this.navigateToHeartAlert();
                }
            },
            fail: function(data, code) {
                console.info('subscribe heart rate fail, code: ' + code + ', data: ' + data);
            },
        });
        this.heartRateSensorSubscribed = true;
    },

    calculateDistance(steps) {
        // Average step length: 0.75 meters
        let stepToMeter = parseInt(steps * 0.75);
        if(stepToMeter < 1000) {
            this.distance =  stepToMeter + ' METER'
        } else {
            this.distance =  stepToMeter/1000 + ' KM'
        }

    },

    vibrate() {
        vibrator.vibrate({
            mode: 'short',
            success() {
                console.info('success to vibrate the device every 1000 steps completed');
            },
            fail(data, code) {
                console.info('handle fail, data = ${data}, code = ${code}');
            },
        });
    },

    touchMove(e) {

        if(e.direction == "right")
        {
            this.appExit();
        }
    },

    navigateToHeartAlert() {
        router.replace({
            uri: 'pages/heartAlertPage/heartAlertPage',
            params: {
                currentHeartRate: this.heartbeatcount,
            }
        });
    },

    stopRunning() {
        this.unsubscribeSensors();
        router.replace({
            uri: 'pages/startPage/startPage'
        });
    },

    unsubscribeSensors() {
        if (this.stepSensorSubscribed) {
            sensor.unsubscribeStepCounter();
        }
        if (this.heartRateSensorSubscribed) {
            sensor.unsubscribeHeartRate();
        }
        if (this.isOnBodyState) {
            sensor.unsubscribeOnBodyState();
        }
    },

    onDestroy() {
        this.unsubscribeSensors();
    }

}
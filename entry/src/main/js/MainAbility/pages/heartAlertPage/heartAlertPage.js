import router from '@system.router';
import Sensor from '@system.sensor';
import Vibrator from '@system.vibrator';

export default {
    data: {
        currentHeartRate: 180,
        hrThreshold: 170,
        heartRateExceeded: true,
        heartRateSensorSubscribed: false
    },

    onInit() {
        console.info('HeartAlertPage onInit called');

        const params = router.getParams();

        if (params) {
            this.currentHeartRate = params.currentHeartRate || 180;
        }

        console.info('Starting heart rate monitoring...');
        this.startHeartRateMonitoring();
        this.vibrateAlert();
    },

    onReady() {
        console.info('HeartAlertPage onReady - UI should be visible now');
    },

    onShow() {
        console.info('HeartAlertPage onShow - Page is visible');
    },

    startHeartRateMonitoring() {
        const self = this;

        console.info('Subscribing to heart rate sensor...');

        Sensor.subscribeHeartRate({
            success: function(ret) {
                self.currentHeartRate = ret.heartRate;

                if (ret.heartRate <= self.hrThreshold) {
                    console.info('Heart rate back to normal, returning to run page');
                    self.heartRateExceeded = false;
                    self.stopVibration();
                    setTimeout(() => {
                        self.returnToRunning();
                    }, 2000);
                } else {
                    self.heartRateExceeded = true;
                }
            },
            fail: function(data, code) {
                console.error(`Heart rate monitoring failed: Code ${code}, Data: ${data}`);
            }
        });
        this.heartRateSensorSubscribed = true;
    },

    vibrateAlert() {
        console.info('Starting alert vibration...');

        Vibrator.vibrate({
            mode: 'long',
            success: function() {
                console.info('Alert vibration started successfully');
            },
            fail: function(data, code) {
                console.error(`Vibration failed: Code ${code}, Data: ${data}`);
            }
        });

        setTimeout(() => {
            if (this.heartRateExceeded) {
                this.vibrateAlert();
            }
        }, 3000);
    },

    stopVibration() {
        console.info('Stopping vibration...');

        Vibrator.stopVibration({
            success: function() {
                console.info('Vibration stopped successfully');
            },
            fail: function(data, code) {
                console.error(`Stop vibration failed: Code ${code}, Data: ${data}`);
            }
        });
    },

    returnToRunning() {

        this.unsubscribeSensors();
        this.stopVibration();

        router.replace({
            uri: 'pages/runPage/runPage'
        });
    },

    unsubscribeSensors() {
        if (this.heartRateSensorSubscribed) {
            Sensor.unsubscribeHeartRate();
            this.heartRateSensorSubscribed = false;
        }
    },

    onDestroy() {
        this.unsubscribeSensors();
        this.stopVibration();
    }
}
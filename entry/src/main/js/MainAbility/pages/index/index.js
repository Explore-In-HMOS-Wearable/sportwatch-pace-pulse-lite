import router from '@system.router';

export default {
    navigateToRunningPage() {
        router.replace({
            uri: 'pages/runPage/runPage'
        });
    }
}
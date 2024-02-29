const app = Vue.createApp({
    data() {
        return {
            backendIp: '127.0.0.1',
            serverOnline: true,
            errorMessage: '',
            successMessage: '',
            selectedFileName: '',
            car: {
                licensePlate: '',
                color: '',
                photo: null,
                entryTime: ''
            },
            showRegistrationForm: false,
            alertMessage: '',
            success: true,
            cars: [],
            showCarsList: false,
            noCarsRegistered: false,
            withdrawLicensePlate: '',
            showWithdrawForm: false,
            withdrawAlertMessageA: '',
            withdrawAlertMessageB: '',
            serverStatusMessage: '',
        };
    },

    methods: {
        updateServerStatus(online, message) {
            this.serverOnline = online;
            this.serverStatusMessage = message;
        },

        checkServerStatus() {
            fetch(`http://${this.backendIp}:2527/cars/test-connection`)
                .then(response => {
                    if (!response.ok) throw new Error('Server is not responding');
                    this.updateServerStatus(true, '');
                })
                .catch(error => {
                    console.error(error);
                    this.updateServerStatus(false, 'Cannot connect to the server. Please try again later.');
                });
        },

        registerCar() {
            this.alertMessage = '';
            this.selectedFileName = '';

            const formData = new FormData();
            formData.append('license_plate', this.car.licensePlate);
            formData.append('color', this.car.color);
            formData.append('photo', this.car.photo);
            formData.append('entryTime', new Date().toISOString());

            fetch(`http://${this.backendIp}:2527/cars/register`, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to register the car, verify the data entered.');
                    return response.json();
                })
                .then(data => {
                    this.alertMessage = 'Car registered successfully!';
                    this.success = true;
                    this.car.licensePlate = '';
                    this.car.color = '';
                    this.car.photo = null;

                    setTimeout(() => {
                        this.alertMessage = '';
                        this.showRegistrationForm = false;
                    }, 2000);
                })
                .catch(error => {
                    this.alertMessage = error.message;
                    this.success = false;
                });
        },

        showMenu() {
            this.car.licensePlate = '';
            this.car.color = '';
            this.car.photo = null;
            this.showRegistrationForm = false;
        },

        handleFileUpload(event) {
            const files = event.target.files;

            if (files.length > 0) {
                const file = files[0];
                this.car.photo = file;
                this.selectedFileName = file.name;
            } else {
                this.car.photo = null;
                this.selectedFileName = '';
            }
        },

        showRegisterForm() {
            this.showRegistrationForm = true;
        },

        listCars() {
            this.showCarsList = true;
            this.noCarsRegistered = false;
            this.checkServerStatus();

            if (!this.serverOnline) {
                return; 
            }

            fetch(`http://${this.backendIp}:2527/cars/list`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load cars.');
                    }
                    return response.json();
                })
                .then(carsFromServer => {
                    this.cars = carsFromServer;
                    this.serverOnline = true;
                    if (this.cars.length === 0) {
                        this.noCarsRegistered = true;
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.serverOnline = false;
                    this.cars = [];
                    this.noCarsRegistered = true;
                });
        },

        showMenuB() {
            this.showCarsList = false;
            this.noCarsRegistered = false;
        },

        withdrawCar() {
            fetch(`http://${this.backendIp}:2527/cars/withdraw`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ license_plate: this.withdrawLicensePlate })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Error withdrawing car.');
                    return response.json();
                })
                .then(data => {
                    this.withdrawAlertMessageB = data.message;
                    this.success = true;
                    setTimeout(() => {
                        this.showWithdrawForm = false;
                        this.withdrawLicensePlate = '';
                        this.withdrawAlertMessageB = '';
                    }, 3000);
                })
                .catch(error => {
                    this.withdrawAlertMessageB = error.message;
                    this.success = false;
                });
        },

        showWithdrawCarForm() {
            if (this.cars.length === 0) {
                this.withdrawAlertMessageA = 'No cars to withdraw.';

                setTimeout(() => {
                    this.withdrawAlertMessageA = '';
                }, 5000);

                this.success = false;
                this.showWithdrawForm = false;
                this.showRegistrationForm = false;
                this.showCarsList = false;
            } else {
                this.withdrawAlertMessageA = '';
                this.showWithdrawForm = true;
                this.showRegistrationForm = false;
                this.showCarsList = false;
                this.noCarsRegistered = false;
            }
        },

        showMenuC() {
            this.showWithdrawForm = false;
        },
    },

    mounted() {
        this.checkServerStatus();
    }
});

app.mount('#app');

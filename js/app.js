const app = Vue.createApp({
    data() {
        return {
            backendIp: '',
            errorMessage: '',
            successMessage: '',
            selectedFileName: '',
            isConnected: false,
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
        };
    },
    methods: {
        connectToBackend() {
            this.errorMessage = '';
            this.successMessage = '';

            const backendUrl = `http://${this.backendIp}:2527/cars/test-connection`;

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
                reject(new Error('The connection has timed out. Please try again.'));
            }, 2000));

            Promise.race([
                fetch(backendUrl, { method: 'GET' }),
                timeoutPromise
            ])
                .then(response => {
                    if (!response.ok) throw new Error('Connection failed. Please try again.');
                    localStorage.setItem('backendIp', this.backendIp);
                    this.successMessage = 'Connection successful!';

                    setTimeout(() => {
                        this.successMessage = '';
                        this.isConnected = true;
                        $('#connectionModal').modal('hide');
                    }, 2000);
                })
                .catch(error => {
                    this.errorMessage = error.message;
                    this.successMessage = '';
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
                        this.isConnected = true; 
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
            this.isConnected = true;
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
            this.isConnected = false;
        },

        listCars() {
            this.showCarsList = true;
            this.noCarsRegistered = false; 

            fetch(`http://${this.backendIp}:2527/cars/list`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load cars.');
                    }
                    return response.json();
                })
                .then(carsFromServer => {
                    this.cars = carsFromServer;
                    if (this.cars.length === 0) {
                        this.noCarsRegistered = true;
                    }
                })
                .catch(error => {
                    this.errorMessage = error.message;
                    this.showCarsList = false;
                });
        },

        showMenuB() {
            this.showCarsList = false;
            this.noCarsRegistered = false;
            this.isConnected = true; 
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
                        this.isConnected = true;
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
            this.isConnected = true;
        },

    },
    mounted() {
        $('#connectionModal').modal('show');
    }
});

app.mount('#app');


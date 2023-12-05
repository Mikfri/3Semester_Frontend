const baseUrl = "https://zealandconnect.azurewebsites.net/api/activitydata";

Vue.createApp({
    data() {
        return {
            studentList: [],
            singleStudent: null,
        };
    },

    async created() {
        this.getActivityDataAsync();
    },

    methods: {
        async getActivityDataAsync() {
            this.helperGetAndShow(baseUrl);
        },

        async helperGetAndShow(url) {
            try {
                const response = await axios.get(url);
                this.studentList = response.data;

                // Convert Unix timestamps to human-readable date and time in 24hr format
                this.studentList = this.studentList.map(student => {
                    return {
                        ...student,
                        timeArrived: new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
                        timeLeft: new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
                    };
                });

            } catch (error) {
                console.error('Error fetching students:', error);
            }
        },
    },

    mounted() {
        this.getActivityDataAsync();
    }
}).mount("#app");

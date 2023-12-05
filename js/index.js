const baseUrl = "https://zealandconnect.azurewebsites.net/api/activitydata";

Vue.createApp({
    data() {
        return {
            studentList: [],
            singleStudent: null,
        };
    },

    async created() {
        getActivityDataAsync();
    },

    methods: {
        getActivityDataAsync() {
            this.helperGetAndShow(baseUrl);
        },
        async helperGetAndShow(url){
            try {
                const response = await axios.get(url)
                this.studentList = response.data;

                

                // Convert Unix timestamps to human-readable date and time in 24hr format
                this.students = data.map(student => {
                    return {
                        ...student,
                        timeArrived: new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
                        timeLeft: new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
                    };
                });

            } catch (error) {
                console.error('Error fetching students:', error);
    }

        // async getActivityDataAsync() {
        //     try {
        //         // Make the API request
        //         const response = await fetch(baseUrl);

        //         // Check if the request was successful (status code 2xx)
        //         if (!response.ok) {
        //             throw new Error(`Error: ${response.status} - ${response.statusText}`);
        //         }

        //         // Parse the JSON response
        //         const data = await response.json();

        //         // Convert Unix timestamps to human-readable date and time in 24hr format
        //         this.students = data.map(student => {
        //             return {
        //                 ...student,
        //                 timeArrived: new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
        //                 timeLeft: new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false}),
        //             };
        //         });

        //     } catch (error) {
        //         console.error('Error fetching students:', error);
        //     }
        // },
        // viewData(student) {
        //     // Implement logic to view data for the selected student
        //     console.log('View data for student:', student);
        // },
    },
    mounted() {
        getActivityDataAsync();
    }
}}).mount("#app");
const apiUrl = 'https://zealandconnect.azurewebsites.net/api/Activitydata';

const app = Vue.createApp({
    data() {
        return {
            studentData: {}, // Gemmer de hentede data
            selectedWeekNo: '',
            selectedWeekday: '' // Standard valgt arbejdsdag
        };
    },
    methods: {
        async fetchData(weekNo) {
            try {
                const response = await axios.get(apiUrl);
                const studentData = response.data;

                const formattedData = this.convertUnixTimeToDates(studentData);

                // Grupper data efter hver arbejdsdag (mandag til fredag)
                const groupedData = {
                    Monday: [],
                    Tuesday: [],
                    Wednesday: [],
                    Thursday: [],
                    Friday: [],
                };

                formattedData.forEach(student => {
                    const dayOfWeek = student.timeCreated.getDay();
                    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

                    // Tildel hver student til deres respektive arbejdsdag
                    if (dayName in groupedData) {
                        groupedData[dayName].push(student);
                    }
                });

                this.studentData = groupedData; // Opdater Vue data med grupperet data efter arbejdsdag
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        // Denne funktion sørger for brugeren får vist ´Invalid Date´ hvis Time Unix værdien er 0, for timeArrived og timeLeft
        convertUnixTimeToDates(studentData) {   
            return studentData.map(student => {
                return {
                    ...student,
                    timeArrived: student.timeArrived === 0 ? 'Student has not arrived' : new Date(student.timeArrived * 1000),
                    timeLeft: student.timeLeft === 0 ? 'Student has not checked out' : new Date(student.timeLeft * 1000),
                    timeCreated: new Date(student.timeCreated * 1000)
                };
            });
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        },       
        // filterByWeekNo(weekNo) {
        //     const selectedDate = new Date(weekNo + '-1'); // Get date for the selected week's Monday
        //     const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        //     const filteredData = {};
        //     for (const day of days) {
        //         filteredData[day] = this.studentData[day].filter(student => {
        //             const studentDate = new Date(student.timeArrived);
        //             const startOfWeek = new Date(selectedDate);
        //             const endOfWeek = new Date(selectedDate);
        //             endOfWeek.setDate(selectedDate.getDate() + 6);

        //             return studentDate >= startOfWeek && studentDate <= endOfWeek;
        //         });
        //     }

        //     return filteredData;
        // }
    },
    // watch: {
    //     selectedWeekNo(newValue) {
    //         this.fetchData(newValue); // Kalder fetchData med det nye ugenummer
    //     }
    // },
    mounted() {
        this.fetchData();
    }
});

app.mount('#app');
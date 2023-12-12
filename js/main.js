const apiUrl = 'https://zealandconnect.azurewebsites.net/api/Activitydata';

const app = Vue.createApp({
    data() {
        return {
            studentData: {},
            selectedWeekNo: '',
            selectedWeekday: '',
            weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        };
    },
    methods: {
        async fetchData() {
            try {
                const response = await axios.get(apiUrl);
                const studentData = response.data;

                const formattedData = this.convertUnixTimeToDates(studentData);

                this.groupDataByWeekdays(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
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
        groupDataByWeekdays(formattedData) {
            const groupedData = {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
            };

            formattedData.forEach(student => {
                const dayOfWeek = student.timeCreated.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][dayOfWeek - 1];
                    groupedData[dayName].push(student);
                }
            });

            this.studentData = groupedData;
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
    },
    mounted() {
        this.fetchData();
    }
});

app.mount('#app');
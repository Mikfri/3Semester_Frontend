const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
    data() {
        return {
            studentList: [],
            singleStudent: null,
            totalStudents: 0,
            hereTodayCounter: 0,
            notHereTodayCounter: 0,
        };
    },

    async created() {
        try {
            const response = await axios.get(apiUrl);
            this.studentList = response.data;
            this.countStudents(),
            this.updateCounters(),
            this.dailyChart(),
            this.weeklyChart(),

            // Convert Unix timestamps to human-readable date and time in 24hr format
            this.studentList = this.studentList.map(student => {
                return {
                    ...student,
                    timeArrived: new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }),
                    timeLeft: new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }),
                };
            });

        } catch (error) {
            console.error('Error fetching students:', error);
        }
    },

    methods: {
        countStudents(counterType) {
            let count = 0;

            this.studentList.forEach(student => {
                const checkInTime = student.timeArrived;

                if (!counterType || (counterType === 'hereToday' && checkInTime) || (counterType === 'notHereToday' && !checkInTime)) {
                    count++;
                }
            });

            return count;
        },

        updateCounters() {
            this.totalStudents = this.countStudents(); // Remove 'totalStudents' argument
            this.hereTodayCounter = this.countStudents('hereToday');
            this.notHereTodayCounter = this.countStudents('notHereToday');
        },

        updateHTML() {
            document.getElementById('todaysDate').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            document.getElementById('hereTodayCounter').textContent = this.hereTodayCounter.toString();
            document.getElementById('notHereTodayCounter').textContent = this.notHereTodayCounter.toString();
            document.getElementById('totalStudents').textContent = this.totalStudents.toString();
        },

        dailyChart() {
            const chartOptions = {
                // Tilpas dine ønskede chart options her
            };

            // Group students by their arrival time and count the number of students at each time
            const studentsByTime = {};
            const notMetStudentsByTime = {}; // For not met students
            this.studentList.forEach(student => {
                const time = new Date(student.timeArrived * 1000).getHours(); // Get the hour of arrival
                if (!studentsByTime[time]) {
                    studentsByTime[time] = 0;
                }
                if (!notMetStudentsByTime[time]) {
                    notMetStudentsByTime[time] = 0;
                }

                if (student.metCondition) {
                    studentsByTime[time]++;
                } else {
                    notMetStudentsByTime[time]++;
                }
            });

            // Define x-axis labels as the time interval from 8 to 16
            const xValues = Array.from({ length: 9 }, (_, i) => i + 8); // Generates [8, 9, 10, 11, 12, 13, 14, 15, 16]
            const dataValues = xValues.map(hour => studentsByTime[hour] || 0); // Get student count for each hour
            const notMetDataValues = xValues.map(hour => notMetStudentsByTime[hour] || 0); // Get not met student count for each hour

            // Render the chart using Chart.js
            new Chart("dailyChart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [
                        {
                            data: dataValues,
                            backgroundColor: 'rgb(50, 150, 150)',
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 3,
                            label: "Met Students",
                            fill: false
                        },
                        {
                            data: notMetDataValues,
                            backgroundColor: 'rgb(255, 0, 0)',
                            borderColor: 'rgb(255, 100, 100)',
                            borderWidth: 3,
                            label: "Not Met Students",
                            fill: false
                        }
                    ],
                },
                options: chartOptions,
            });
        },

        weeklyChart() {
            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            const chartOptions = {
                // Tilpas dine ønskede chart options her
            };

            const studentsByDay = {
                Monday: { met: 0, notMet: 0 },
                Tuesday: { met: 0, notMet: 0 },
                Wednesday: { met: 0, notMet: 0 },
                Thursday: { met: 0, notMet: 0 },
                Friday: { met: 0, notMet: 0 }
            };

            this.studentList.forEach(student => {
                const dayIndex = new Date(student.timeArrived * 1000).getDay();
                const day = daysOfWeek[dayIndex - 1];

                if (day in studentsByDay) {
                    if (student.metCondition) {
                        studentsByDay[day].met++;
                    } else {
                        studentsByDay[day].notMet++;
                    }
                }
            });

            const metData = daysOfWeek.map(day => studentsByDay[day].met);
            const notMetData = daysOfWeek.map(day => studentsByDay[day].notMet);

            new Chart("weeklyChart", {
                type: "bar",
                data: {
                    labels: daysOfWeek,
                    datasets: [
                        {
                            data: metData,
                            backgroundColor: 'rgb(50, 150, 150)',
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 3,
                            label: "Met Students",
                            fill: false
                        },
                        {
                            data: notMetData,
                            backgroundColor: 'rgb(255, 0, 0)',
                            borderColor: 'rgb(255, 100, 100)',
                            borderWidth: 3,
                            label: "Not Met Students",
                            fill: false
                        }
                    ],
                },
                options: chartOptions,
            });
        },
    }
}).mount("#app");

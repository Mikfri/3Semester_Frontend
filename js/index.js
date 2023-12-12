const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      studentList: [],
      filterList: [],
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
        this.filterList = this.studentList = this.studentList.map(student => {
          const timeArrived = student.timeArrived !== 0 ? new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }) : "0";
          const timeLeft = student.timeLeft !== 0 ? new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }) : "0";

          return {
            ...student,
            timeArrived,
            timeLeft,
          };
        }
        );

    }
    catch (error) {
      console.error('Error fetching students:', error);
    }
  },

  methods: {
    countStudents(counterType) {
      let count = 0;

      this.studentList.forEach(student => {
        const checkInTime = student.timeArrived;

        if (!counterType || (counterType === 'presentStudents' && checkInTime) || (counterType === 'absentStudents' && !checkInTime)) {
          count++;
        }
      });

      return count;
    },

    updateCounters() {
      this.totalStudents = this.countStudents(); // Remove 'totalStudents' argument
      this.hereTodayCounter = this.countStudents('presentStudents');
      this.notHereTodayCounter = this.countStudents('absentStudents');
    },

    updateHTML() {
      document.getElementById('todaysDate').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
      document.getElementById('hereTodayCounter').textContent = this.hereTodayCounter.toString();
      document.getElementById('notHereTodayCounter').textContent = this.notHereTodayCounter.toString();
      document.getElementById('totalStudents').textContent = this.totalStudents.toString();
    },

    filterTable(filterType) {

      switch (filterType) {
        case 'all':
          this.filterList = this.studentList; // sets the filterList to the original studentList
          break;
        case 'presentStudents':
          this.filterList = this.studentList.filter(student => student.timeArrived != 0); // filters the present student from the timeArrived property being anything other than 0.
          break;
        case 'absentStudents':
          this.filterList = this.studentList.filter(student => student.timeArrived == 0); // filters the absent student from the timeArrived property being 0
          break;
        default:
          this.studentList; // defaults to the original studentList
          break;
      }
      console.log(this.filterList._raw);
    },

    dailyChart() {
      const chartOptions = {
        // Tilpas dine ønskede chart options her
        scales: {
          y: {
            ticks: {
              color: 'white',
            },
            max: this.totalStudents,
          },
          x: {
            ticks: {
              color: 'white',
            },
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'white',
            }
          }
        }
      };

      // Group students by their arrival time and count the number of students at each time
      const presentStudentsByTime = {}; // present students
      const absentStudentsByTime = {}; // For absent students
      this.studentList.forEach(student => {
        const time = new Date(student.timeArrived * 1000).getHours(); // Get the hour of arrival
        if (!presentStudentsByTime[time]) {
          presentStudentsByTime[time] = 0;
        }
        if (!absentStudentsByTime[time]) {
          absentStudentsByTime[time] = this.totalStudents;
        }

        if (student.timeArrived > presentStudentsByTime[time]) {
          presentStudentsByTime[time]++;
          absentStudentsByTime[time]--;
        }

      });

      // Define x-axis labels as the time interval from 8 to 16
      const xValues = Array.from({ length: 9 }, (_, i) => i + 8); // Generates [8, 9, 10, 11, 12, 13, 14, 15, 16]
      const dataValues = xValues.map(hour => presentStudentsByTime[hour] || 0); // Get student count for each hour
      const notMetDataValues = xValues.map(hour => absentStudentsByTime[hour] || 0); // Get not present student count for each hour

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
              label: "Fremmødt",
              fill: false
            },
            {
              data: notMetDataValues,
              backgroundColor: 'rgb(255, 0, 0)',
              borderColor: 'rgb(255, 100, 100)',
              borderWidth: 3,
              label: "Fraværende",
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
        scales: {
          y: {
            ticks: {
              color: 'white',
            },
            max: this.totalStudents,
          },
          x: {
            ticks: {
              color: 'white',
            },
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'white',
            }
          }
        }
      };


      const studentsByDay = {
        Monday: { present: 0, absent: this.totalStudents },
        Tuesday: { present: 0, absent: this.totalStudents },
        Wednesday: { present: 0, absent: this.totalStudents },
        Thursday: { present: 0, absent: this.totalStudents },
        Friday: { present: 0, absent: this.totalStudents },
      };

      this.studentList.forEach(student => {
        const dayIndex = new Date(student.timeArrived * 1000).getDay();
        const day = daysOfWeek[dayIndex - 1];

        if (day in studentsByDay) {
          if (student.metCondition) {
            studentsByDay[day].present++;
            studentsByDay[day].absent--;
          }
        }
      });

      const metData = daysOfWeek.map(day => studentsByDay[day].present);
      const notMetData = daysOfWeek.map(day => studentsByDay[day].absent);

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
              label: "Fremmødt",
              fill: false
            },
            {
              data: notMetData,
              backgroundColor: 'rgb(255, 0, 0)',
              borderColor: 'rgb(255, 100, 100)',
              borderWidth: 3,
              label: "Fraværende",
              fill: false
            }
          ],
        },
        options: chartOptions,
      });
    },
  }
}).mount("#app");

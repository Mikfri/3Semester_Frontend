const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      selectedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      activityList: [],
      filterList: [],
      singleStudent: null,
      totalStudents: 0,
      hereTodayCounter: 0,
      notHereTodayCounter: 0,
      sortColumn: null,
      sortOrder: 1, // 1 for stigende, -1 for faldende
    };
  },

  //Methods run on initialization of page.
  async created() {
    try {
      await this.getData(); //waits on the method to be completed to have the necessary data loaded
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  },

  methods: {
    //method to fetch students activity data from the api service.
    async getData() {
      const response = await axios.get(apiUrl);
      this.activityList = response.data;
      this.updateCounters(), //updates the count of students who is currently pressent or absent and total
        this.dailyChart(), //loads the daily chart
        this.weeklyChart(); //loads the weekly chart

      // Convert Unix timestamps to human-readable date and time in 24hr format
      this.filterList = this.activityList = this.activityList.map((student) => {
        const timeArrived =
          student.timeArrived !== 0
            ? new Date(student.timeArrived * 1000).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "0";
        const timeLeft =
          student.timeLeft !== 0
            ? new Date(student.timeLeft * 1000).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "0";

        return {
          ...student,
          timeArrived,
          timeLeft,
        };
      });
    },

    //counting students by different criteria
    countStudents(counterType) {
      let count = 0; //number of students counted

      this.activityList.forEach((student) => {
        const checkInTime = student.timeArrived;

        if (
          !counterType || //counts all students
          (counterType === "presentStudents" && checkInTime) || //counts present students
          (counterType === "absentStudents" && !checkInTime) //counts absent students
        ) {
          count++; //add 1 student to the count
        }
      });

      return count;
    },

    //updates the count of students (ex usecase: change to the data(someone is scanned in))
    updateCounters() {
      this.totalStudents = this.countStudents(); //counts all students
      this.hereTodayCounter = this.countStudents("presentStudents"); //counts all students present
      this.notHereTodayCounter = this.countStudents("absentStudents"); //counts absent students
    },

    //update html display
    updateHTML() {
      //date display
      document.getElementById("todaysDate").textContent =
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
      //present students amount display
      document.getElementById("hereTodayCounter").textContent =
        this.hereTodayCounter.toString();
      //absent students amount display
      document.getElementById("notHereTodayCounter").textContent =
        this.notHereTodayCounter.toString();
      //total students amount display
      document.getElementById("totalStudents").textContent =
        this.totalStudents.toString();
    },

    //filter method for filtering the studentsactivity table
    filterTable(filterType) {
      switch (filterType) {
        case "all": // sets the filterList to the original activityList to display all students
          this.filterList = this.activityList;
          break;
        case "presentStudents": // filters the present student from the timeArrived property being anything other than 0.
          this.filterList = this.activityList.filter(
            (student) => student.timeArrived != 0
          );
          break;
        case "absentStudents": // filters the absent student from the timeArrived property being 0
          this.filterList = this.activityList.filter(
            (student) => student.timeArrived == 0
          );
          break;
        default: // defaults to the original activityList
          this.activityList;
          break;
      }
      console.log(this.filterList._raw);
    },

    sortTable(column) {
      if (column === this.sortColumn) {
        this.sortOrder *= -1;
      } else {
        this.sortOrder = 1;
        this.sortColumn = column;
      }

      this.filterList = this.filterList.sort((a, b) => {
        const valueA = column === 'studentNumber' ? a[column] : a[column];
        const valueB = column === 'studentNumber' ? b[column] : b[column];

        return valueA.localeCompare(valueB) * this.sortOrder;
      });
    },
    searchByName() {
      const searchInput = document.getElementById("searchInput").value.toLowerCase();
      this.filterList = this.activityList.filter((student) => {
        return student.studentName.toLowerCase().includes(searchInput);
      });
    },

    //genereates the daily chart
    dailyChart() {
      //personal chart options
      //customize your prefered chart options
      const chartOptions = {
        scales: {
          y: {
            ticks: {
              color: "white", //text color on the y axis
            },
            max: this.totalStudents,
          },
          x: {
            ticks: {
              color: "white", //text color on the x axis
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "white", //text color on the labels
            },
          },
        },
      };

      // Group students by their arrival time and count the number of students at each time
      const presentStudentsByTime = {}; // present students
      const absentStudentsByTime = {}; // For absent students
      this.activityList.forEach((student) => {
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
      const dataValues = xValues.map(
        (hour) => presentStudentsByTime[hour] || 0
      ); // Get student count for each hour
      const notMetDataValues = xValues.map(
        (hour) => absentStudentsByTime[hour] || 0
      ); // Get not present student count for each hour

      // Render the chart using Chart.js
      new Chart("dailyChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              data: dataValues,
              backgroundColor: "rgb(50, 150, 150)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 3,
              label: "Fremmødt",
              fill: false,
            },
            {
              data: notMetDataValues,
              backgroundColor: "rgb(255, 0, 0)",
              borderColor: "rgb(255, 100, 100)",
              borderWidth: 3,
              label: "Fraværende",
              fill: false,
            },
          ],
        },
        options: chartOptions, //loads personalized options
      });
    },

    weeklyChart() {
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];
      const chartOptions = {
        // Tilpas dine ønskede chart options her
        scales: {
          y: {
            ticks: {
              color: "white", //text color for y axis
            },
            max: this.totalStudents,
          },
          x: {
            ticks: {
              color: "white", //text color for x axis
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "white", //text color for the labels
            },
          },
        },
      };

      const studentsByDay = {
        Monday: { present: 0, absent: this.totalStudents },
        Tuesday: { present: 0, absent: this.totalStudents },
        Wednesday: { present: 0, absent: this.totalStudents },
        Thursday: { present: 0, absent: this.totalStudents },
        Friday: { present: 0, absent: this.totalStudents },
      };

      this.activityList.forEach((student) => {
        const dayIndex = new Date(student.timeArrived * 1000).getDay();
        const day = daysOfWeek[dayIndex - 1];

        if (day in studentsByDay) {
          if (student.metCondition) {
            studentsByDay[day].present++;
            studentsByDay[day].absent--;
          }
        }
      });

      const metData = daysOfWeek.map((day) => studentsByDay[day].present);
      const notMetData = daysOfWeek.map((day) => studentsByDay[day].absent);

      new Chart("weeklyChart", {
        type: "bar",
        data: {
          labels: daysOfWeek,
          datasets: [
            {
              data: metData,
              backgroundColor: "rgb(50, 150, 150)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 3,
              label: "Fremmødt",
              fill: false,
            },
            {
              data: notMetData,
              backgroundColor: "rgb(255, 0, 0)",
              borderColor: "rgb(255, 100, 100)",
              borderWidth: 3,
              label: "Fraværende",
              fill: false,
            },
          ],
        },
        options: chartOptions, //loads chart options
      });
    },
  },
}).mount("#app");

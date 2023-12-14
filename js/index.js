const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      selectedDate: new Date().toISOString().slice(0, 10),
      submitDateForm: "dd-MM-yyyy",
      responseActivityLog: [],
      dateActivityLog: [],
      filterList: [],
      presentStudentsByDate: [], // present students
      absentStudentsByDate: [],
      singleStudent: null,
      totalStudents: 0,
      hereTodayCounter: 0,
      notHereTodayCounter: 0,
      sortColumn: null,
      sortOrder: 1, // 1 for stigende, -1 for faldende
    };
  },

  async created() {
    try {
      await this.getData(); //waits on the method to be completed to have the necessary data loaded
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  },

  methods: {
    async getData() {
      try {
        const response = await axios.get(apiUrl);
        this.responseActivityLog = response.data; // Assuming your data is in response.data
        this.convertUnixTimestampsOnLogs(); // Call the conversion function
        console.log(this.responseActivityLog)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    convertUnixTimestampsOnLogs() {
      this.responseActivityLog.forEach(log => {
        log.timeCreated = this.formatUnixTimestamp(log.timeCreated);
        log.timeArrived = this.formatTime(log.timeArrived);
        log.timeLeft = this.formatTime(log.timeLeft);
        log.totalTime = this.formatTime(log.totalTime)
      });
    },

    formatUnixTimestamp(timestamp) {
      if(timestamp == 0){
        return 0;
      }
      const date = new Date(timestamp * 1000); // Convert to milliseconds
      return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'numeric', year: 'numeric' });
    },

    formatTime(timestamp) {
      if(timestamp == 0){
        return 0;
      }
      const date = new Date(timestamp * 1000); // Convert to milliseconds
      return date.toLocaleTimeString('da-DK', { hour: 'numeric', minute: 'numeric'});
    },

    datePickedFilter() {
      console.log("before edit: ", this.selectedDate);
      const dateObjectDate = new Date(this.selectedDate);
      const danishDate = dateObjectDate.toLocaleDateString('da-DK');
      this.dateActivityLog = this.responseActivityLog.filter(log => {
        if(log.timeCreated == danishDate){
          return log;
        }
      });
      this.filterList = this.dateActivityLog;
      console.log(this.selectedDate);
      console.log(this.dateActivityLog);
      this.updateCounters();
      this.dailyChart();
    },

    updateCounters() {
      this.totalStudents = this.dateActivityLog.length;
      this.presentStudentsByDate = this.dateActivityLog.filter(log => {
        if (log.timeArrived > 0) {
          return log;
        }
      });
      this.hereTodayCounter = this.presentStudentsByDate.length;
      // if student is not presset in hereTodayCounter but is in dataAtctivitylog add them to absentStudentsByDate array
      this.absentStudentsByDate = this.dateActivityLog.filter(log => {
        if (log.timeArrived === 0) {
          return log;
        }
      });
      this.notHereTodayCounter = this.absentStudentsByDate.length;
      console.log("total sudents: ", this.totalStudents, "not here: ", this.notHereTodayCounter, "here: ", this.hereTodayCounter);
    },

    filterTable(filterType) {
      // Implement table filtering based on the filter type
      console.log("filter type: ", filterType)
      if (filterType === "all") {
        this.filterList = this.dateActivityLog;
      } else if (filterType === "presentStudents") {
        this.filterList = this.dateActivityLog.filter((log) => {
        if(log.timeArrived > 0){
          return log;
        }});
      } else if (filterType === "absentStudents") {
        this.filterList = this.dateActivityLog.filter((log) => {
          if(log.timeArrived === 0){
            return log;
        }});
      }
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
      // Implement searching by name
      const searchInput = document.getElementById("searchInput").value.toLowerCase();
      this.filterList = this.dateActivityLog.filter((student) =>
        student.studentName.toLowerCase().includes(searchInput)
      );
    },

    viewData(student) {
      // Implement viewing data for a specific student
      this.singleStudent = student;
      // You can add logic to display a modal or another component to show detailed data
    },

    dailyChart() {
      //customize your prefered chart options
      const xlabes = Array.from({ length: 10}, (_, i) => i + 9);
      console.log("fremmødt", this.presentStudentsByDate);
      console.log("ikke mødt", this.absentStudentsByDate);
 
      // Count hourly data for both present and absent students
      const hourlyCountsMet = this.countHourlyData(this.presentStudentsByDate, 'timeArrived');
      const hourlyCountsNotMet = this.countHourlyData(this.absentStudentsByDate, 'totalTime');

      console.log(hourlyCountsMet);
      console.log(hourlyCountsNotMet);
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
  
      // Render the chart using Chart.js
      new Chart("dailyChart", {
        type: "line",
        data: {
          labels: xlabes,
          datasets: [
            {
              data: hourlyCountsMet,
              backgroundColor: "rgb(50, 150, 150)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 3,
              label: "Fremmødt",
              fill: false,
            },
            {
              data: hourlyCountsNotMet,
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
    countHourlyData(logs, property) {
      const hourlyCounts = Array.from({ length: 24 }, () => 0);
    
      logs.forEach(log => {
        const logTime = new Date(log[property]);
        const hour = logTime.getHours();
        hourlyCounts[hour]++;
      });
    
      return hourlyCounts;
    },
  },

  mounted(){
    //this.dailyChart();
  }

}).mount("#app");


const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      selectedDate: null,
      submitDateForm: "dd-MM-yyyy",
      responseActivityLog: [],
      dateActivityLog: [],
      filterList: [],
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
      const dateObjectDate = new Date(this.selectedDate);
      const danishDate = dateObjectDate.toLocaleDateString('da-DK');
      this.dateActivityLog = this.responseActivityLog.filter(log => {
        if(log.timeCreated == danishDate){
          return log;
        }
      });
      this.filterList = this.dateActivityLog;
      console.log(this.dateActivityLog);
      this.updateCounters();
    },

    updateCounters() {
      this.totalStudents = this.dateActivityLog.length;
      this.hereTodayCounter = this.dateActivityLog.reduce((count, log) => {
        if (log.timeArrived > 0) {
          return count + 1;
        }
        return count;
      }, 0);
      this.notHereTodayCounter = this.totalStudents - this.hereTodayCounter;
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
  },
}).mount("#app");


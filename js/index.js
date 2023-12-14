const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      selectedDate: new Date().toISOString().slice(0, 10),
      responseActivityLog: [],
      dateActivityLog: [],
      filterList: [],
      presentStudentsByDate: [],
      absentStudentsByDate: [],
      singleStudent: null,
      totalStudents: 0,
      hereTodayCounter: 0,
      notHereTodayCounter: 0,
      sortColumn: null,
      sortOrder: 1,
    };
  },

  async created() {
    try {
      await this.getData();
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  },

  methods: {
    async getData() {
      try {
        const response = await axios.get(apiUrl);
        this.responseActivityLog = response.data;
        this.convertUnixTimestampsOnLogs();
        console.log(this.responseActivityLog);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    convertUnixTimestampsOnLogs() {
      this.responseActivityLog.forEach((log) => {
        log.timeCreated = this.formatUnixTimestamp(log.timeCreated);
        log.timeArrived = this.formatTime(log.timeArrived);
        log.timeLeft = this.formatTime(log.timeLeft);
        log.totalTime = this.formatTime(log.totalTime);
      });
    },

    formatUnixTimestamp(timestamp) {
      return timestamp === 0
        ? "00:00"
        : new Date(timestamp * 1000).toLocaleDateString("da-DK", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          });
    },

    formatTime(timestamp) {
      return timestamp === 0
        ? 0
        : new Date(timestamp * 1000).toLocaleTimeString("da-DK", {
            hour: "numeric",
            minute: "numeric",
          });
    },

    datePickedFilter() {
      const danishDate = new Date(this.selectedDate).toLocaleDateString(
        "da-DK"
      );
      this.dateActivityLog = this.responseActivityLog.filter(
        (log) => log.timeCreated === danishDate
      );
      this.filterList = this.dateActivityLog;
      console.log(this.selectedDate);
      console.log(this.dateActivityLog);
      this.updateCounters();
    },

    updateCounters() {
      this.totalStudents = this.dateActivityLog.length;
      this.presentStudentsByDate = this.dateActivityLog.filter(
        (log) => log.timeArrived > 0
      );
      this.hereTodayCounter = this.presentStudentsByDate.length;
      this.absentStudentsByDate = this.dateActivityLog.filter(
        (log) => log.timeArrived === 0
      );
      this.notHereTodayCounter = this.absentStudentsByDate.length;
      console.log(
        "total students: ",
        this.totalStudents,
        "not here: ",
        this.notHereTodayCounter,
        "here: ",
        this.hereTodayCounter
      );
    },

    filterTable(filterType) {
      if (filterType === "all") {
        this.filterList = this.dateActivityLog;
      } else if (filterType === "presentStudents") {
        this.filterList = this.dateActivityLog.filter(
          (log) => log.timeArrived > 0
        );
      } else if (filterType === "absentStudents") {
        this.filterList = this.dateActivityLog.filter(
          (log) => log.timeArrived === 0
        );
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
        const valueA = column === "studentNumber" ? a[column] : a[column];
        const valueB = column === "studentNumber" ? b[column] : b[column];

        return valueA.localeCompare(valueB) * this.sortOrder;
      });
    },

    searchByName() {
      const searchInput = document.getElementById("searchInput").value.toLowerCase();
      this.filterList = this.dateActivityLog.filter((student) =>
        student.studentName.toLowerCase().includes(searchInput)
      );
    },

    viewData(student) {
      this.singleStudent = student;
    },

  }

}).mount("#app");
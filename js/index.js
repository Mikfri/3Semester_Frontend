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

  async created() {
    try {
      await this.getData(); //waits on the method to be completed to have the necessary data loaded
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  },

  methods: {
    async getData() {
      // Use Axios to fetch data from the API
      try {
        const response = await axios.get(apiUrl);
        this.activityList = response.data;
        this.filterList = this.activityList; // Assuming you want to show all students initially
        this.updateCounters();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    updateCounters() {
      // Update counters based on the fetched data
      this.totalStudents = this.activityList.length;
      this.hereTodayCounter = this.activityList.filter(
        (student) => student.isPresent === true
      ).length;
      this.notHereTodayCounter = this.activityList.filter(
        (student) => student.isPresent === false
      ).length;
    },

    filterTable(filterType) {
      // Implement table filtering based on the filter type
      if (filterType === "all") {
        this.filterList = this.activityList;
      } else if (filterType === "presentStudents") {
        this.filterList = this.activityList.filter(
          (student) => student.isPresent === true
        );
      } else if (filterType === "absentStudents") {
        this.filterList = this.activityList.filter(
          (student) => student.isPresent === false
        );
      }
    },

    sortTable(column) {
      // Implement table sorting based on the selected column
      if (this.sortColumn === column) {
        this.sortOrder *= -1; // Toggle between ascending and descending order
      } else {
        this.sortColumn = column;
        this.sortOrder = 1; // Set default order to ascending
      }

      this.filterList.sort((a, b) => {
        const aValue = a[column];
        const bValue = b[column];

        if (aValue < bValue) {
          return -1 * this.sortOrder;
        } else if (aValue > bValue) {
          return 1 * this.sortOrder;
        } else {
          return 0;
        }
      });
    },

    searchByName() {
      // Implement searching by name
      const searchInput = document.getElementById("searchInput").value.toLowerCase();
      this.filterList = this.activityList.filter((student) =>
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


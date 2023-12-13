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

  },
}).mount("#app");

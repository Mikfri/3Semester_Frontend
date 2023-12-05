const apiUrl = "https://zealandconnect.azurewebsites.net/api/Activitydata";

Vue.createApp({
  data() {
    return {
      studentList: [],
      singleStudent: null,
    };
  },

  async created() {
    try {
      const response = await axios.get(apiUrl);
      this.studentList = response.data;
      this.renderChart();

      // Convert Unix timestamps to human-readable date and time in 24hr format
      this.studentList = this.studentList.map(student => {
        return {
          ...student,
          timeArrived: new Date(student.timeArrived * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }),
          timeLeft: new Date(student.timeLeft * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, minute12: false }),
        };
      });

      this.renderChart(); // Render the chart after fetching data
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  },

  methods: {
    renderChart() {
      const chartOptions = {
        scales: {
          y: {
            ticks: {
              color: 'white',
            },
            // You might want to adjust the y-axis based on your data
            // max: 25,
          },
          x: {
            ticks: {
              color: 'white',
            },
            // Define x-axis ticks from 8 to 16 (representing the time interval)
            min: 8,
            max: 16,
            stepSize: 1, // Step size for each hour
            callback: function (value, index, values) {
              return value + ":00"; // Display as HH:00 format
            }
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
      const studentsByTime = {};
      this.studentList.forEach(student => {
        const time = new Date(student.timeArrived * 1000).getHours(); // Get the hour of arrival
        if (!studentsByTime[time]) {
          studentsByTime[time] = 1;
        } else {
          studentsByTime[time]++;
        }
      });

      // Define x-axis labels as the time interval from 8 to 16
      const xValues = Array.from({ length: 9 }, (_, i) => i + 8); // Generates [8, 9, 10, 11, 12, 13, 14, 15, 16]
      const dataValues = xValues.map(hour => studentsByTime[hour] || 0); // Get student count for each hour

      // Render the chart using Chart.js
      new Chart("myChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              data: dataValues,
              backgroundColor: 'rgb(50, 150, 150)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 3,
              label: "Number of Students",
              fill: false
            }
          ],
        },
        options: chartOptions,
      });
    },
  },
}).mount("#app");

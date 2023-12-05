const xValues = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const xValues1 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const chartOptions = {
  scales: {
    y: {
      ticks: {
        color: 'white',
      },
      max: 25,
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

new Chart("myChart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [
      {
        data: [0, 15, 17, 17, 17, 17, 14, 3, 0],
        backgroundColor: 'rgb(50, 150, 150)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 3,
        label: "Showed up",
        fill: false
      },
      {
        data: [20, 5, 3, 3, 3, 3, 6, 17, 20],
        backgroundColor: 'rgb(255, 0, 0)',
        borderColor: 'rgb(255, 100, 100)',
        borderWidth: 3,
        label: "Lazy",
        fill: false
      }
    ],
  },
  options: chartOptions,
});


        new Chart("myChart1", {
          type: "bar",
          data: {
            labels: xValues1,
            datasets: [{
              data: [0, 15, 17, 17, 17, 17, 14, 3, 0],
              backgroundColor: 'rgb(50, 150, 150)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 3,
              label: "Showed up",
              fill: false
            }, {
              data: [20, 5, 3, 3, 3, 3, 6, 17, 20],
              backgroundColor: 'rgb(255, 0, 0)',
              borderColor: 'rgb(255, 100, 100)',
              borderWidth: 3,
              label: "No Show",
              fill: false
            }]
          },
          options: chartOptions,
        });

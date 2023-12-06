const apiUrl = 'https://zealandconnect.azurewebsites.net/api/Activitydata';

const app = Vue.createApp({
    data() {
        return {
            studentData: {}, // Gemmer de hentede data
            selectedWeekNo: '2023-W49',
            selectedWeekday: 'Monday' // Standard valgt arbejdsdag
        };
    },
    methods: {
        fetchData() {
            fetchData().then(data => {
                if (data) {
                    this.studentData = data;
                }
            });
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(',', ', ');
        },
        filterByWeekNo(weekNo) {
            const selectedDate = new Date(weekNo + '-1'); // Get date for the selected week's Monday
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
            const filteredData = {};
            for (const day of days) {
                filteredData[day] = this.studentData[day].filter(student => {
                    const studentDate = new Date(student.timeArrived);
                    const startOfWeek = new Date(selectedDate);
                    const endOfWeek = new Date(selectedDate);
                    endOfWeek.setDate(selectedDate.getDate() + 6);
        
                    return studentDate >= startOfWeek && studentDate <= endOfWeek;
                });
            }
        
            return filteredData;
        }       
    },
    watch: {
        selectedWeekNo(newValue) {
            fetchData(newValue).then(data => {
                if (data) {
                    this.studentData = data;
                    //this.selectedWeekday = 'Monday'; // Sæt standard valgt dag til mandag
                }
            });
        }
    },
    mounted() {
        this.fetchData();
    }
});


app.mount('#app');

// Hent data fra API'en
async function fetchData(weekNo) {
    try {
        const response = await axios.get(apiUrl);
        const studentData = response.data;

        // Mappe Unix Time-stempler til datoer
        const formattedData = studentData.map(student => {
            return {
                ...student,
                timeArrived: new Date(student.timeArrived * 1000),
                timeLeft: new Date(student.timeLeft * 1000),
            };
        });

        // Grupper data efter hver arbejdsdag (mandag til fredag)
        const groupedData = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
          };

        formattedData.forEach(student => {
            const dayOfWeek = student.timeArrived.getDay();
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

            // Tildel hver student til deres respektive arbejdsdag
            if (dayName in groupedData) {
                groupedData[dayName].push(student);
            }
        });

        return groupedData; // Returner grupperet data efter arbejdsdag
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


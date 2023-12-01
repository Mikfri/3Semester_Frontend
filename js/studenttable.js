// js/table.js
var totalStudents = 0;
var hereTodayCounter = 0; // Counter for "Here Today"
var notHereTodayCounter = 0; // Counter for "Not Here Today"

// Get the current date and format it as "dd-mm-yy"
const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

// Display the formatted date in the HTML element with the id "todaysDate"
document.getElementById('todaysDate').textContent = formattedDate;

// Initialize counters on page load
updateCounters();

function filterTable(filterType) {
  var tableRows = document.querySelectorAll('.table tbody tr');

  tableRows.forEach(function (row) {
    var checkInTime = row.children[2].textContent;

    switch (filterType) {
      case 'all':
        row.style.display = ''; // Show all rows
        break;
      case 'hereToday':
        row.style.display = checkInTime ? '' : 'none'; // Show rows with check-in time
        break;
      case 'notHereToday':
        row.style.display = checkInTime ? 'none' : ''; // Show rows without check-in time
        break;
      default:
        break;
    }
  });

  updateCounters(); // Move the updateCounters call outside the forEach loop
}

function updateCounters() {
  totalStudents = countStudents(); // Remove 'totalStudents' argument
  hereTodayCounter = countStudents('hereToday');
  notHereTodayCounter = countStudents('notHereToday');

  updateCounter('totalStudents', totalStudents);
  updateCounter('hereToday', hereTodayCounter);
  updateCounter('notHereToday', notHereTodayCounter);
}

function countStudents(counterType) {
  var tableRows = document.querySelectorAll('.table tbody tr');
  var count = 0;

  tableRows.forEach(function (row) {
    var checkInTime = row.children[2].textContent;

    if (!counterType || (counterType === 'hereToday' && checkInTime) || (counterType === 'notHereToday' && !checkInTime)) {
      count++;
    }
  });

  // Update the totalStudents variable
  totalStudents = count;

  return count;
}

function updateCounter(counterType, count) {
  var counterElement = document.getElementById(`${counterType}Counter`);
  if (counterElement) {
    counterElement.textContent = count.toString(); // Convert count to string and update the text content
  }
}

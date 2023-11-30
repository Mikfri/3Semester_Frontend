// js/table.js

var hereTodayCounter = 0; // Counter for "Here Today"
var notHereTodayCounter = 0; // Counter for "Not Here Today"

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
  hereTodayCounter = countStudents('hereToday');
  notHereTodayCounter = countStudents('notHereToday');

  updateCounter('hereToday', hereTodayCounter);
  updateCounter('notHereToday', notHereTodayCounter);
}

function countStudents(counterType) {
  var tableRows = document.querySelectorAll('.table tbody tr');
  var count = 0;

  tableRows.forEach(function (row) {
    var checkInTime = row.children[2].textContent;

    if (counterType === 'hereToday' && checkInTime) {
      count++;
    } else if (counterType === 'notHereToday' && !checkInTime) {
      count++;
    }
  });

  return count;
}

function updateCounter(counterType, count) {
  var counterElement = document.getElementById(`${counterType}Counter`);
  if (counterElement) {
    counterElement.textContent = count.toString(); // Convert count to string and update the text content
  }
}

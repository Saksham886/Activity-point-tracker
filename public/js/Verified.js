// Array of verified data with student's name, activity, and points
const verifiedData = [
    { name: "Saksham Pandey", activity: ["Quiz", "Presentation"], pointsVerified: 10 },
    { name: "Rachit Chandra", activity: ["Presentation"], pointsVerified: 5 },
    { name: "Rudraksh Singh", activity: [], pointsVerified: 5 },  // No activities
    { name: "Saksham Raj", activity: ["Workshop"], pointsVerified: 5 },
    { name: "Aviral Singh", activity: ["Project", "Lab Activity"], pointsVerified: 5 },
    { name: "Harshit Khushwaha", activity: ["Lab Activity"], pointsVerified: 5 },
    { name: "Shikhar Srivastava", activity: ["Research Paper"], pointsVerified: 5 },
    { name: "Kumar Saurav", activity: [], pointsVerified: 5 },  // No activities
    { name: "Nischay Kumar", activity: [], pointsVerified: 5 },  // No activities
    { name: "Parth B Patil", activity: ["Group Discussion"], pointsVerified: 5 },
    { name: "Anshuman Gupta", activity: ["Quiz"], pointsVerified: 5 },
    { name: "R Bhuvan Aditya", activity: ["Seminar"], pointsVerified: 5 }
  ];
  
  // Populate table dynamically
  const tableBody = document.getElementById("verified-table-body");
  
  verifiedData.forEach(verified => {
    const row = document.createElement("tr");
  
    const nameCell = document.createElement("td");
    nameCell.textContent = verified.name;
  
    // Activity cell with "View Activities" button
    const activityCell = document.createElement("td");
  
    const viewButton = document.createElement("button");
    viewButton.textContent = "View Activities";
    viewButton.classList.add("view-activities-btn");
  
    // Create a div to hold the activity list
    const activityListDiv = document.createElement("div");
    activityListDiv.classList.add("activity-list");
  
    if (verified.activity.length === 0) {
      activityListDiv.innerHTML = "<p>No Activity Performed</p>"; // If no activity, show this
    } else {
      const activityList = document.createElement("ul");
      verified.activity.forEach(activity => {
        const listItem = document.createElement("li");
        listItem.textContent = activity;
        activityList.appendChild(listItem);
      });
      activityListDiv.appendChild(activityList);
    }
  
    // Toggle activity list display when clicking the "View Activities" button
    viewButton.addEventListener("click", () => {
      if (activityListDiv.style.display === "block") {
        activityListDiv.style.display = "none";  // Hide if already visible
      } else {
        activityListDiv.style.display = "block";  // Show the activities
      }
    });
  
    activityCell.appendChild(viewButton);
    activityCell.appendChild(activityListDiv);
  
    const pointsCell = document.createElement("td");
    pointsCell.textContent = verified.pointsVerified;
  
    row.appendChild(nameCell);
    row.appendChild(activityCell);
    row.appendChild(pointsCell);
  
    tableBody.appendChild(row);
  });
  
"use strict";
console.log("app.js loaded");
document.addEventListener("deviceready", onDeviceReady, false);
// For Live Server
if (!window.cordova) {
    onDeviceReady();
}
function onDeviceReady() {
    console.log("Device is ready!");
    let totalReportsCount = 0;
    const totalReports = document.getElementById("totalReports");
    const form = document.getElementById("reportForm");
    const successMessage = document.getElementById("successMessage");
    const reportsList = document.getElementById("reportsList");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const category = document.getElementById("category");
        const descriptionInput = document.getElementById("description");
        const geoLocationInput = document.getElementById("location");
        const categoryValue = category.value;
        const description = descriptionInput.value;
        const location = geoLocationInput.value;
        totalReportsCount++;
        if (totalReports) {
            totalReports.textContent = totalReportsCount.toString();
        }
        if (successMessage) {
            successMessage.style.display = "flex";
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);
        }
        const report = {
            category: categoryValue,
            description: description,
            location: location
        };
        if (reportsList) {
            reportsList.innerHTML +=
                `<article>
            <h2>${report.category}</h2>
            <p>${report.description}</p>
            <p><strong>Location: </strong>${report.location}</p>
        </article>   
        `;
        }
        form.reset();
    });
}

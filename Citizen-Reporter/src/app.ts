console.log("app.js loaded");

document.addEventListener("deviceready", onDeviceReady, false);

// For Live Server
if (!(window as any).cordova) {
    onDeviceReady();
}

function onDeviceReady(): void {
    console.log("Device is ready!");


let totalReportsCount = 0;

const totalReports = document.getElementById("totalReports");
const form = document.getElementById("reportForm") as HTMLFormElement;
const successMessage = document.getElementById("successMessage");
const reportsList = document.getElementById("reportsList");




form?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const category = document.getElementById("category") as HTMLSelectElement;
    const descriptionInput = document.getElementById("description")as HTMLTextAreaElement;
    const geoLocationInput = document.getElementById("location")as HTMLInputElement;

    const categoryValue = category.value;
    const description = descriptionInput.value;
    const location = geoLocationInput.value;

    totalReportsCount++;

    if(totalReports){
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
    }

   
    if(reportsList){
        reportsList.innerHTML += 
        `<article>
            <h2>${report.category}</h2>
            <p>${report.description}</p>
            <p><strong>Location: </strong>${report.location}</p>
        </article>   
        `
    }


    form.reset();
});

}
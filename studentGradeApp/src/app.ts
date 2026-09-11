const form = document.getElementById("studentForm");

function getAverageScore(
mathScore: number,
englishScore: number,
scienceScore: number
): number {
return (mathScore + englishScore + scienceScore) / 3;
}

form?.addEventListener("submit", (e) => {
e.preventDefault();

const mathInput = document.getElementById("mathScore") as HTMLInputElement;
const englishInput = document.getElementById("englishScore") as HTMLInputElement;
const scienceInput = document.getElementById("scienceScore") as HTMLInputElement;
const averageEl = document.getElementById("averageScore");

if (
    mathInput.value === "" ||
    englishInput.value === "" ||
    scienceInput.value === ""
) {
    if (averageEl) {
        averageEl.textContent = "Please enter all scores.";
    }
    return;
}

const mathScore = Number(mathInput.value);
const englishScore = Number(englishInput.value);
const scienceScore = Number(scienceInput.value);

if (
    mathScore < 0 || mathScore > 100 ||
    englishScore < 0 || englishScore > 100 ||
    scienceScore < 0 || scienceScore > 100
) {
    if (averageEl) {
        averageEl.textContent = "Scores must be between 0 and 100.";
    }
    return;
}

const average = getAverageScore(
    mathScore,
    englishScore,
    scienceScore
);

if (averageEl) {
    averageEl.textContent = `Average Score: ${average.toFixed(2)}`;
}

});

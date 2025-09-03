// src/utils/kundliCalculator.js

// Example function: calculate basic Kundli info
export function calculateKundli({ dob, time, city, state, country }) {
    // Placeholder calculation logic
    // Convert DOB and time into JS Date object
    const birthDateTime = new Date(`${dob}T${time}`);

    // Extract date/time details (can be extended)
    const day = birthDateTime.getDate();
    const month = birthDateTime.getMonth() + 1; // Months 0-11
    const year = birthDateTime.getFullYear();
    const hours = birthDateTime.getHours();
    const minutes = birthDateTime.getMinutes();

    // Dummy astrology output
    const kundliData = {
        sunSign: getSunSign(day, month),
        moonSign: "Cancer", // Placeholder, needs real calculation
        ascendant: "Leo", // Placeholder, needs real calculation
        yogas: ["Yogkarak: Jupiter", "Marak: Saturn", "Baadhak: Mars"],
    };

    return kundliData;
}

// Helper function to calculate Sun Sign based on DOB
function getSunSign(day, month) {
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
    return "Unknown";
}

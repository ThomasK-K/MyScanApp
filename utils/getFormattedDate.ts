export default function getFormattedDate(): string {

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // e.g., "10/5/2023"
    const timeString = currentDate.toLocaleTimeString('de-de'); // US English
    return(`${formattedDate}_${timeString}`); // e.g., "10:30:00 AM"
    
  }
  
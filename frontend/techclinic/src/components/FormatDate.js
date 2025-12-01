export default function formatDate(date, options = {}) {
  if (!date) return "";

  const d = new Date(date); 
  const { format = "YYYY-MM-DD", monthFormat = "short" } = options; 
 

  const year = d.getFullYear();
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");


  const month = d.toLocaleString("en-US", { month: monthFormat });

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${day}`; 
    case "YYYY-MM-DD HH:mm:ss":
      return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${day} ${hours}:${minutes}:${seconds}`;
    case "DD/MM/YYYY":
      return `${day}/${String(d.getMonth() + 1).padStart(2, "0")}/${year}`;
    case "MMM DD, YYYY":
      return `${month} ${day}, ${year}`;
    case "MMMM DD, YYYY":
      return `${month} ${day}, ${year}`;
    default:
      return d.toISOString(); 
  }
}

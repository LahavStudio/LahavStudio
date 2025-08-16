document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const eventType = document.getElementById("eventType").value;
  const eventDate = document.getElementById("eventDate").value;
  const packageName = document.getElementById("package").value;
  const message = document.getElementById("message").value;

  // ניסוח ההודעה כולל "חבילת ה"
  const text = `היי, זה ${name} מהאתר להב סטודיו 📸
יש לי ${eventType} בתאריך ${eventDate} ואני מעוניין לשמוע עוד פרטים על חבילת ה-${packageName} 🎉
זה מספר הפלאפון שלי: ${phone} 📱
וחשוב לי שתדע על האירוע ש${message}`;

  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=972532799664&text=${encodedText}`;

  window.location.href = url;
});

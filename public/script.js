/**
 * Frontend Logic Script
 *
 * Purpose: Handles user interactions (button clicks), form validation, and makes asynchronous
 * API calls to the backend to shorten URLs. Updates the DOM with results or errors.
 *
 * Why: Decouples the presentation logic (HTML) from the behavior (JS), enabling a dynamic
 * single-page experience without page reloads.
 */
// Handle "Shorten" button click
document.getElementById("shortenBtn").addEventListener("click", async () => {
  const longUrl = document.getElementById("longUrl").value;
  const customCode = document.getElementById("customCode").value;
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const shortLink = document.getElementById("shortLink");

  // Reset UI
  resultDiv.classList.add("hidden");
  errorDiv.classList.add("hidden");

  if (!longUrl) {
    errorDiv.textContent = "Please enter a URL";
    errorDiv.classList.remove("hidden");
    return;
  }

  try {
    // Send request to API
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        long_url: longUrl,
        custom_code: customCode || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    // Display result
    shortLink.href = data.short_url;
    shortLink.textContent = data.short_url;
    resultDiv.classList.remove("hidden");
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove("hidden");
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const shortLink = document.getElementById("shortLink").href;
  navigator.clipboard.writeText(shortLink);
  alert("Copied to clipboard!");
});

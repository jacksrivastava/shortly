document.getElementById('shortenBtn').addEventListener('click', async () => {
    const longUrl = document.getElementById('longUrl').value;
    const customCode = document.getElementById('customCode').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const shortLink = document.getElementById('shortLink');

    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (!longUrl) {
        errorDiv.textContent = 'Please enter a URL';
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                long_url: longUrl,
                custom_code: customCode || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        shortLink.href = data.short_url;
        shortLink.textContent = data.short_url;
        resultDiv.classList.remove('hidden');
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
    }
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const shortLink = document.getElementById('shortLink').href;
    navigator.clipboard.writeText(shortLink);
    alert('Copied to clipboard!');
});

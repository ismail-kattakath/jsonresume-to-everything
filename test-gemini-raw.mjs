const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: 'Say hello in exactly 2 words' }]
    }],
    generationConfig: {
      maxOutputTokens: 1000
    }
  })
})

const data = await response.json()
console.log(JSON.stringify(data, null, 2))

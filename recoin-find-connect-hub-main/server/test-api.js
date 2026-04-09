/**
 * Test script for Google Gemini API
 * Run: node test-api.js
 */

const GOOGLE_API_KEY = 'AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI';

async function testGeminiFlash() {
  console.log('🧪 Testing Gemini Flash API...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Explain how AI works in a few words'
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('✅ Gemini Flash API: SUCCESS');
    console.log('Response:', text);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Gemini Flash API: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testImageAnalysis() {
  console.log('🧪 Testing Image Analysis API...\n');
  
  // Create a simple test image (1x1 red pixel)
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'What color is this image?'
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: testImage.split(',')[1]
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('✅ Image Analysis API: SUCCESS');
    console.log('Response:', text);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Image Analysis API: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testImagen() {
  console.log('🧪 Testing Imagen 4.0 API...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GOOGLE_API_KEY
        },
        body: JSON.stringify({
          prompt: 'A simple red apple on white background',
          config: {
            numberOfImages: 1,
            aspectRatio: '1:1'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.generatedImages && data.generatedImages.length > 0) {
      console.log('✅ Imagen 4.0 API: SUCCESS');
      console.log('Generated image size:', data.generatedImages[0].image.imageBytes.length, 'bytes');
      console.log('');
      return true;
    } else {
      throw new Error('No images generated');
    }
  } catch (error) {
    console.error('❌ Imagen 4.0 API: FAILED');
    console.error('Error:', error.message);
    console.log('Note: Imagen may not be available in all regions or API tiers');
    console.log('');
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Google Generative AI API Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    geminiFlash: await testGeminiFlash(),
    imageAnalysis: await testImageAnalysis(),
    imagen: await testImagen()
  };
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Results Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Gemini Flash (Text):    ', results.geminiFlash ? '✅ PASS' : '❌ FAIL');
  console.log('Image Analysis:         ', results.imageAnalysis ? '✅ PASS' : '❌ FAIL');
  console.log('Imagen 4.0 (Generation):', results.imagen ? '✅ PASS' : '⚠️  NOT AVAILABLE');
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  const passCount = Object.values(results).filter(r => r).length;
  console.log(`Overall: ${passCount}/3 tests passed\n`);
  
  if (results.geminiFlash && results.imageAnalysis) {
    console.log('✅ Core functionality is working!');
    console.log('   - Text generation: Ready');
    console.log('   - Image analysis: Ready');
    if (!results.imagen) {
      console.log('   - Image generation: Using SVG fallback');
    } else {
      console.log('   - Image generation: Imagen 4.0 available');
    }
  } else {
    console.log('❌ Some core features are not working');
    console.log('   Please check your API key and network connection');
  }
  
  console.log('\nAPI Key:', GOOGLE_API_KEY);
  console.log('');
}

// Run tests
runAllTests().catch(console.error);

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'registration');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'SectionWrapper.tsx' && f !== 'ProgressHeader.tsx' && f !== 'ResumeUploader.tsx');

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Skip if already has mode
  if (!content.includes('mode:')) {
    // Inject mode extraction from hook
    content = content.replace(/(const\s+\{[\s\S]*?)(\}\s*=\s*useRegistration\(\);)/, '$1, mode $2');
    
    // Replace the button text
    content = content.replace(/'Save & Continue'/g, "{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}");
    content = content.replace(/>Save & Continue</g, ">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}<");

    // Replace the toast message to sound less finalizing in profile mode
    // (Optional, maybe leave as is for now)

    // For Submit Registration in Certifications
    content = content.replace(/Submit Registration/g, "{mode === 'profile' ? 'Save Changes' : 'Submit Registration'}");

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated ' + file);
  }
}

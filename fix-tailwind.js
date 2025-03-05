const fs = require('node:fs');
const path = require('node:path');

// Function to find all .tsx files in the directory
function findTsxFiles(dir) {
  const results = [];
  
  function traverseDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
        traverseDir(filePath);
      } else if (filePath.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  }
  
  traverseDir(dir);
  return results;
}

// Function to process and fix a file
function fixTailwindInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Find className attributes in JSX
    const classNameRegex = /className="([^"]*)"/g;
    let match;
    const replacements = [];
    
    // Use a different approach to avoid assignment in expression
    match = classNameRegex.exec(content);
    while (match !== null) {
      const fullMatch = match[0];
      const classesStr = match[1];
      
      // Process each className attribute
      let newClassesStr = classesStr;
      
      // Fix h-X w-X to size-X (without commas)
      newClassesStr = newClassesStr.replace(/\bh-(\d+|\w+)\b\s+\bw-\1\b/g, 'size-$1');
      newClassesStr = newClassesStr.replace(/\bw-(\d+|\w+)\b\s+\bh-\1\b/g, 'size-$1');
      
      // Fix w-full h-full to size-full (without commas)
      newClassesStr = newClassesStr.replace(/\bw-full\b\s+\bh-full\b/g, 'size-full');
      newClassesStr = newClassesStr.replace(/\bh-full\b\s+\bw-full\b/g, 'size-full');
      
      // Fix pl-X pr-X to px-X (without commas)
      newClassesStr = newClassesStr.replace(/\bpl-(\d+|\w+)\b\s+\bpr-\1\b/g, 'px-$1');
      newClassesStr = newClassesStr.replace(/\bpr-(\d+|\w+)\b\s+\bpl-\1\b/g, 'px-$1');
      
      if (newClassesStr !== classesStr) {
        replacements.push({
          original: fullMatch,
          replacement: `className="${newClassesStr}"`
        });
      }
      
      // Get the next match
      match = classNameRegex.exec(content);
    }
    
    // Apply all replacements
    for (const rep of replacements) {
      content = content.replace(rep.original, rep.replacement);
    }
    
    // Write changes if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed Tailwind classes in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('Finding .tsx files...');
    const tsxFiles = findTsxFiles('.');
    console.log(`Found ${tsxFiles.length} .tsx files`);
    
    let fixedCount = 0;
    
    for (const filePath of tsxFiles) {
      const fixed = fixTailwindInFile(filePath);
      if (fixed) fixedCount++;
    }
    
    console.log(`Finished. Fixed Tailwind shorthand classes in ${fixedCount} files.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 
const fs = require('fs');
const path = require('path');

// Các thư mục cần bỏ qua
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.vscode', 'images', 'assets'];
// Các đuôi file cần lấy
const INCLUDE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json'];

const outputFile = 'codebase.txt';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (INCLUDE_EXTS.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const projectPath = __dirname;
const allFiles = getAllFiles(projectPath);

let content = '';

allFiles.forEach((file) => {
  // Bỏ qua chính file output và file script
  if (
    file.includes(outputFile) ||
    file.includes('scan_project.js') ||
    file.includes('package-lock.json')
  )
    return;

  const relativePath = path.relative(projectPath, file);
  content += `\n\n================================================\n`;
  content += `FILE PATH: ${relativePath}\n`;
  content += `================================================\n`;

  try {
    const fileContent = fs.readFileSync(file, 'utf8');
    content += fileContent;
  } catch (e) {
    content += `[Error reading file]\n`;
  }
});

fs.writeFileSync(outputFile, content);
console.log(`Đã gom toàn bộ code vào file: ${outputFile}`);

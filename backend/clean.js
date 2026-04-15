const fs = require("fs");
const path = require("path");

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== "node_modules") processDir(fullPath);
        } else if (file.endsWith("-new.js")) {
            const oldFile = fullPath.replace("-new.js", ".js");
            if (fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile);
            }
            fs.renameSync(fullPath, oldFile);
        }
    }
}

function updateImports(dir) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== "node_modules") updateImports(fullPath);
        } else if (fullPath.endsWith(".js") || fullPath.endsWith(".ts")) {
            let content = fs.readFileSync(fullPath, "utf8");
            let original = content;
            // No tricky backreferences inside bash
            content = content.replace(/-new(['"`]\))/g, "$1");
            content = content.replace(/-new(['"`])/g, "$1");
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, "utf8");
            }
        }
    }
}

processDir(__dirname);
updateImports(__dirname);

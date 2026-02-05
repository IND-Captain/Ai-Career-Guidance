let editor;
let pyodide = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // init CodeMirror
    editor = CodeMirror(document.getElementById('editor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        tabSize: 4,
        indentUnit: 4
    });
    editor.setSize('100%', '100%');

    // Set default value
    editor.setValue('// Write your JavaScript code here\nconsole.log("Hello World!");');

    // Init Pyodide in background
    initPyodide();

    // CDNs for other modes (if needed) loaded or mode assumed text/plain if missing
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        const lang = e.target.value;
        let mode = 'javascript';
        let defaultCode = '';

        if (lang === 'python') {
            mode = 'python';
            defaultCode = '# Write your Python code here\nprint("Hello World!")';
        } else if (lang === 'html') {
            mode = 'htmlmixed'; // Requires htmlmixed mode
            defaultCode = '<!-- Write your HTML here -->\n<h1>Hello World</h1>\n<p>This is a live preview.</p>';
        } else if (lang === 'css') {
            mode = 'css';
            defaultCode = '/* Write your CSS here */\nbody { color: blue; }';
        } else if (lang === 'cpp' || lang === 'c') {
            mode = 'text/x-c++src'; // Requires clike mode
            defaultCode = '// Write your C/C++ code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}';
        } else {
            defaultCode = '// Write your JavaScript code here\nconsole.log("Hello World!");';
        }

        // Safety check for mode availability (CodeMirror defaults to plain text if missing)
        editor.setOption('mode', mode);
        editor.setValue(defaultCode);
    });
});

async function initPyodide() {
    try {
        pyodide = await loadPyodide();
        console.log("Pyodide loaded");
    } catch (err) {
        console.error("Failed to load Pyodide:", err);
    }
}

async function runCode() {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = 'Running...'; // Use innerHTML to allow HTML preview

    const lang = document.getElementById('languageSelector').value;
    const code = editor.getValue();

    // Clear output
    outputDiv.innerHTML = '';

    // Capture log function
    const logs = [];
    const log = (...args) => {
        logs.push(args.join(' '));
        outputDiv.textContent = logs.join('\n'); // Text content for logs
    };

    if (lang === 'javascript') {
        try {
            const originalLog = console.log;
            console.log = log;
            await (async () => {
                try {
                    const func = new Function(code);
                    func();
                } catch (e) {
                    log('Error: ' + e.message);
                }
            })();
            console.log = originalLog;
        } catch (err) {
            log('Error: ' + err.message);
        }
    }
    else if (lang === 'python') {
        if (!pyodide) {
            outputDiv.textContent = "Python engine is still loading... please wait.";
            return;
        }
        try {
            pyodide.setStdout({ batched: (msg) => log(msg) });
            pyodide.setStderr({ batched: (msg) => log(msg) });
            await pyodide.runPythonAsync(code);
        } catch (err) {
            log('Error: ' + err.message);
        }
    }
    else if (lang === 'html') {
        // Safe Iframe Preview
        outputDiv.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:none; background:white;"></iframe>`;
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
    }
    else if (lang === 'css') {
        outputDiv.textContent = "CSS is usually applied to HTML. Switch to HTML execution to see styles in action, or include <style> blocks there.";
    }
    else if (lang === 'cpp' || lang === 'c') {
        outputDiv.innerHTML = `<div style="color: #fca5a5;">
            <strong>Compilation Required</strong><br>
            C/C++ requires a backend compiler server (like GCC/Clang).<br>
            Since this is a client-side offline demo, we cannot execute native binary code here.<br><br>
            <em>Simulated Output:</em><br>
            <span style="font-family: monospace; color: #4ade80;">Hello World!</span>
        </div>`;
    }
}

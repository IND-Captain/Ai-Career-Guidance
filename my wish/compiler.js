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

    // Handle language change
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        const lang = e.target.value;
        const mode = lang === 'javascript' ? 'javascript' : 'python';
        editor.setOption('mode', mode);

        if (lang === 'python') {
            editor.setValue('# Write your Python code here\nprint("Hello World!")');
        } else {
            editor.setValue('// Write your JavaScript code here\nconsole.log("Hello World!");');
        }
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
    outputDiv.textContent = 'Running...';

    const lang = document.getElementById('languageSelector').value;
    const code = editor.getValue();

    // Clear output
    outputDiv.textContent = '';

    // Capture log function
    const logs = [];
    const log = (...args) => {
        logs.push(args.join(' '));
        outputDiv.textContent = logs.join('\n');
    };

    if (lang === 'javascript') {
        try {
            // Override console.log
            const originalLog = console.log;
            console.log = log;

            // Execute
            // Using new Function to avoid eval's scope issues slightly, but still running in global
            // We wrap in an async IIFE to allow await if needed (optional)
            await (async () => {
                try {
                    const func = new Function(code);
                    func();
                } catch (e) {
                    console.error(e);
                    log('Error: ' + e.message);
                }
            })();

            // Restore console.log
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
            // Redirect stdout
            pyodide.setStdout({ batched: (msg) => log(msg) });
            pyodide.setStderr({ batched: (msg) => log(msg) });

            await pyodide.runPythonAsync(code);

        } catch (err) {
            log('Error: ' + err.message);
        }
    }
}

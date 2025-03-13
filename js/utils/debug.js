
    (function() {
// Create a debug logging container
    const DEBUG = {
    logs: [],
    originalConsoleLog: console.log,
    originalConsoleError: console.error,
    originalConsoleWarn: console.warn
};

// Override console methods to capture logs
    console.log = function(...args) {
    DEBUG.logs.push({type: 'log', args: args, time: new Date()});
    DEBUG.originalConsoleLog.apply(console, args);
};

    console.error = function(...args) {
    DEBUG.logs.push({type: 'error', args: args, time: new Date()});
    DEBUG.originalConsoleError.apply(console, args);
};

    console.warn = function(...args) {
    DEBUG.logs.push({type: 'warn', args: args, time: new Date()});
    DEBUG.originalConsoleWarn.apply(console, args);
};

// Expose debug utility to window
    window.DEBUG = DEBUG;

// Add method to print debug info to output
    window.showDebugInfo = function() {
    const outputBox = document.getElementById('output-box');
    if (outputBox) {
    let debugText = "# Debug Information\n\n";
    debugText += "## Console Logs\n\n";

    DEBUG.logs.forEach((log, index) => {
    const time = log.time.toISOString().split('T')[1].split('.')[0];
    const type = log.type.toUpperCase();
    const message = log.args.map(arg => {
    if (typeof arg === 'object') {
    try {
    return JSON.stringify(arg);
} catch(e) {
    return String(arg);
}
}
    return String(arg);
}).join(' ');

    debugText += `${time} [${type}] ${message}\n`;
});

    outputBox.value = debugText;
}
};

// Check DOM elements after load
    document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
    const outputBox = document.getElementById('output-box');
    console.log(`Output box found: ${!!outputBox}`);

    if (outputBox) {
    console.log(`Output box width: ${outputBox.offsetWidth}, height: ${outputBox.offsetHeight}`);
    console.log(`Output box is visible: ${window.getComputedStyle(outputBox).display !== 'none'}`);
}
}, 1000);
});
})();
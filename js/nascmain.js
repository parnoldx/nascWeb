var statusElement = document.getElementById('status');
const resultEl = document.getElementById('result');
const inputEl = document.getElementById('input');



inputEl.oninput = (ev) => {
    const text = ev.target.value;
    const resultPtr = calculate(calc, text, 1000);
    const result = UTF8ToString(resultPtr);
    free(resultPtr);
    resultEl.textContent = result
}

var Module = {
    preRun: [() => {
        require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' }});
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));

require(["vs/editor/editor.main"], function () {
	let editor = monaco.editor.create(document.getElementById('editor'), {
        value: ['2+2'].join('\n'),
        minimap: {
		    enabled: false
        },
	    scrollBeyondLastLine: false,
        folding: false,
        glyphMargin: false,
        fontSize: 20,
        automaticLayout: true
	});
});
    Split(['#editor', '#result'], {
            sizes: [75, 25],
            gutterSize: 4,
            minSize: 200,
        });
    }],
    postRun: [() => {
        window.calculate = Module.cwrap('calculate', 'number', ['number', 'string', 'number'])
        window.newCalculator = Module.cwrap('newCalculator', 'number', [])
        window.free = Module.cwrap('free', 'void', ['number'])

        console.time('new')
        window.calc = newCalculator()
        console.timeEnd('new')
       
        inputEl.style.display = "inline-block";
    }],
    print: function (text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            console.log(text);
    },
    printErr: function (text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            console.error(text);
    },
    setStatus: function (text) {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;
        if (m) {
            text = m[1];
        }
        statusElement.innerHTML = text;
    }
};
Module.setStatus('Downloading...');
window.onerror = function (event) {
    // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
    Module.setStatus('Exception thrown, see JavaScript console');
    Module.setStatus = function (text) {
        if (text) Module.printErr('[post-exception status] ' + text);
    };  
};
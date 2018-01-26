

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode){
    process.stdin.setRawMode(true)
}

process.stdin.on('keypress', (str, key) => {
  
  if (key.name === 'q' || ( key.ctrl && key.name == 'c')) {
    UI.readline.cursorTo(process.stdout, 0, 0);
    UI.readline.clearScreenDown(process.stdout);

    process.exit();
  } else {
    if (key.name === 'p') {
        UI.showPrompt();
        return;
    }
    const cb = UI.bindings[key.name];   
    if (typeof cb === 'function') {
        if (UI.paused) console.log('>>', key.name);
        cb();
    }
    else {
        if (UI.paused) {
            console.log('Invalid command ! '+UI.promptMessage);
            
        }
    }
  }
});



const UI = {
    paused:true,
    bindings:{},
    readline:readline,
    promptMessage:'[P] Pause mining | [B] Show the blockchain | [R] Resume mining | [Q] Quit',
    bind:function(key, cb) {
        UI.bindings[key] = cb;
        
    },
    showPrompt : function() {
        UI.pause();
        console.log(UI.promptMessage);
    },
    pause : function() {
        UI.paused = true;
    },
    resume : function() {
        UI.clear();
        UI.paused=false;
    },
    clear : function() {
        UI.readline.cursorTo(process.stdout, 0, 0);
        UI.readline.clearScreenDown(process.stdout);        
        UI.readline.cursorTo(process.stdout, 0, 0);
        UI.readline.clearLine(process.stdout, 0); 
        process.stdout.write('┌──────────────────────────────────────────────────────────────────────────────────┐\n');
        process.stdout.write('│   ' + UI.promptMessage+'      │\n');
        process.stdout.write('└──────────────────────────────────────────────────────────────────────────────────┘\n');

        process.stdout.write('┌──────────────────────────────────────────────────────────────────────────────────┐\n');
        process.stdout.write('│                                                                                  │\n');
        process.stdout.write('└──────────────────────────────────────────────────────────────────────────────────┘\n');
                    
    }
        
}

UI.bind('r', UI.resume);

module.exports = UI;
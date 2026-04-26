// A simple test to see if command clicks work
const a = document.createElement('a');
a.href = "command:workbench.action.showCommands";
document.body.appendChild(a);
a.click();

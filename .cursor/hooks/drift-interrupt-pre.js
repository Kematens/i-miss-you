const fs=require("fs"),path=require("path");
const cwd=process.cwd();
const sig=path.join(cwd,".cursor","drift-interrupt.flag");
const act=path.join(cwd,".cursor","drift-interrupt-active.flag");
try{if(fs.existsSync(sig)){let ts="";try{ts=JSON.parse(fs.readFileSync(sig,"utf-8")).timestamp||""}catch{}fs.writeFileSync(act,JSON.stringify({timestamp:ts}),"utf-8");try{fs.unlinkSync(sig)}catch{}process.exitCode=2;}}catch{}

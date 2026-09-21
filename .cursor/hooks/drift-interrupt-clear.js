const fs=require("fs"),path=require("path");
const act=path.join(process.cwd(),".cursor","drift-interrupt-active.flag");
try{if(fs.existsSync(act))fs.unlinkSync(act)}catch{}

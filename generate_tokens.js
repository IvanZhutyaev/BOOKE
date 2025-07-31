const fs=require('fs');
const path=require('path');

// путь к json-файлу токенов (обновите при необходимости)
const TOKENS_JSON=path.join(__dirname,'styles','design-tokens.json');
const CSS_OUT=path.join(__dirname,'styles','tokens.css');

if(!fs.existsSync(TOKENS_JSON)){
  console.error('JSON file not found:',TOKENS_JSON);
  process.exit(1);
}

const data=JSON.parse(fs.readFileSync(TOKENS_JSON,'utf8'));
let css=':root{\n';

// helper to make css var name
const makeName=(arr)=>'--'+arr.join('-').replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-_]/g,'').toLowerCase();

// colors
if(data.color){
  const walk=(obj,stack=[])=>{
    Object.entries(obj).forEach(([k,v])=>{
      if(v.type==='color'){
        let val=v.value;
        if(/^#[0-9a-f]{8}$/i.test(val)) val = '#'+val.slice(1,7); // обрезаем alpha ff
        css+=`  ${makeName(['color',...stack,k])}:${val};\n`;
      }else if(typeof v==='object'){
        walk(v,[...stack,k]);
      }
    });
  };
  walk(data.color,[]);
}

// gradients (linear) -> custom-gradient
if(data.gradient){
  const walkG=(obj,stack=[])=>{
    Object.entries(obj).forEach(([k,v])=>{
      if(v.type==='custom-gradient'){
        const stops=v.value.stops.map(s=>`${s.color.slice(0,7)} ${(s.position*100)}%`).join(',');
        const gradient=`linear-gradient(${v.value.rotation}deg,${stops})`;
        css+=`  ${makeName(['gradient',...stack,k])}:${gradient};\n`;
      }else if(typeof v==='object'){
        walkG(v,[...stack,k]);
      }
    });
  };
  walkG(data.gradient,[]);
}

css+='}\n';

fs.writeFileSync(CSS_OUT,css);
console.log('tokens.css generated ->',CSS_OUT); 
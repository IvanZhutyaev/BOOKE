document.addEventListener('DOMContentLoaded',()=>{
  const icons=document.querySelectorAll('i[class*="fa-"]');
  icons.forEach(el=>{
    const cls=Array.from(el.classList).find(c=>c.startsWith('fa-')&&!c.startsWith('fa-solid'))||Array.from(el.classList).find(c=>c.startsWith('fa-')&&c!=='fa-solid');
    if(!cls) return;
    const name=cls.replace('fa-','');
    const img=document.createElement('img');
    img.src=`assets/icons/${name}.svg`;
    img.alt=name;
    img.className='icon';
    el.replaceWith(img);
  });
}); 
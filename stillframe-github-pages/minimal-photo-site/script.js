// Replace these sample entries with photographs you own or have permission to publish.
// For local images use src: 'images/my-photo.jpg'.
const photos = [
  {title:'Quiet Afternoon',category:'Portraits',src:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=85'},
  {title:'Morning Light',category:'Nature',src:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&q=85'},
  {title:'Form & Space',category:'Architecture',src:'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=85'},
  {title:'The Open Road',category:'Travel',src:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85'},
  {title:'Soft Focus',category:'Portraits',src:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=85'},
  {title:'Green Silence',category:'Nature',src:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=85'},
  {title:'City Geometry',category:'Architecture',src:'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900&q=85'},
  {title:'Somewhere Else',category:'Travel',src:'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85'},
  {title:'In Between',category:'Portraits',src:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=85'}
];
const grid=document.querySelector('#photo-grid');const dialog=document.querySelector('#lightbox');const viewerImage=document.querySelector('#viewer-image');let visible=[...photos],current=0;
document.querySelector('#year').textContent=new Date().getFullYear();document.querySelector('#all-count').textContent=photos.length;
function render(filter='All'){visible=photos.filter(p=>filter==='All'||p.category===filter);grid.replaceChildren();visible.forEach((p,i)=>{const card=document.createElement('figure');card.className='photo-card';const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`View ${p.title}`);const wrap=document.createElement('span');wrap.className='photo-wrap';const img=document.createElement('img');img.src=p.src;img.alt=p.title;img.loading='lazy';img.decoding='async';wrap.append(img);const info=document.createElement('figcaption');info.className='photo-info';const title=document.createElement('strong');title.textContent=p.title;const cat=document.createElement('small');cat.textContent=p.category;info.append(title,cat);button.append(wrap,info);button.addEventListener('click',()=>openPhoto(i));card.append(button);grid.append(card)})}
function showPhoto(){const p=visible[current];viewerImage.src=p.src;viewerImage.alt=p.title;document.querySelector('#viewer-title').textContent=p.title;document.querySelector('#viewer-index').textContent=`${current+1} / ${visible.length}`}
function openPhoto(i){current=i;showPhoto();dialog.showModal()}function move(step){current=(current+step+visible.length)%visible.length;showPhoto()}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');render(btn.dataset.filter)}));document.querySelector('#close-viewer').addEventListener('click',()=>dialog.close());document.querySelector('#prev-photo').addEventListener('click',()=>move(-1));document.querySelector('#next-photo').addEventListener('click',()=>move(1));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});render();

import Stall3D from '/src/Stall3D.js';

// mount point
const container = document.getElementById('stall-root') || document.body;

const popup = document.getElementById('cow-popup');
const popupImg = document.getElementById('popup-img');
const popupName = document.getElementById('popup-name');
const popupPlace = document.getElementById('popup-place');
const popupEar = document.getElementById('popup-ear');
const popupBreed = document.getElementById('popup-breed');
const closeBtn = document.getElementById('close-popup');
closeBtn.addEventListener('click', ()=>{ popup.classList.remove('open'); });

const stall = new Stall3D(container, {
  cowCount: 30,
  spacing: 3.0,
  planeSize: 1.4,
  planeY: 1.1,
  assetBase: '/assets/kuh_bilder/',
  startOffset: -6,
  onSlotClick: openPopup
});

// test data JSON binding
const testData = Array.from({length:30}, (_,i)=>({
  id: i+1,
  place: i+1,
  name: `Kuh ${i+1}`,
  earTag: `OH-${String(i+1).padStart(3,'0')}`,
  breed: i%2===0? 'Holstein' : 'Jersey',
  imgPath: `/assets/kuh_bilder/${i+1}.png`
}));

stall.updateData(testData);

function openPopup(data){
  popupName.textContent = data.name || '—';
  popupPlace.textContent = `Platz ${data.place}`;
  popupEar.textContent = data.earTag || '—';
  popupBreed.textContent = data.breed || '—';
  if(data.imageURL) popupImg.src = data.imageURL; else if(data.imgPath) popupImg.src = data.imgPath; else popupImg.src = '';
  popup.classList.add('open');
}

// expose for debugging
window._stall = stall;
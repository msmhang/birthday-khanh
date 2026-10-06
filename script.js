const pages=[...document.querySelectorAll('.page')];
const pageOrder=[1,2,3,5,6,7,8,9];
const bar=document.getElementById('bar');
let current=1;

window.addEventListener('load',()=>{
  setTimeout(()=>{const l=document.getElementById('loading'); if(l) l.style.opacity='0'},450);
  setTimeout(()=>document.getElementById('loading')?.remove(),1100);
});

function go(x){
  pages.forEach(p=>p.classList.remove('active'));
  const target=document.getElementById(`p${x}`);
  if(!target)return;
  target.classList.add('active');
  current=x;
  const step=pageOrder.indexOf(x)+1;
  bar.style.width=`${step/pageOrder.length*100}%`;
  window.scrollTo({top:0,behavior:'instant'});
  if(x===9){confetti(110);burstHearts(18);launchFinalFireworks();}
}

document.getElementById('open').onclick=()=>{
  confetti(25);
  go(2);
  burstHearts(8);
  initPuzzle();
};
document.getElementById('present').onclick=()=>document.getElementById('open').click();
document.getElementById('present').onkeydown=e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById('open').click()}
};
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.go)));
document.getElementById('again').onclick=()=>{go(1);resetPuzzleLock()};

// ---------- Puzzle: 6 easy pieces, MUST solve to continue ----------
const solved=[0,1,2,3,4,5];
let puzzle=[2,0,4,1,5,3];
let selected=null;
let puzzleStarted=false;
const board=document.getElementById('puzzleBoard');
const success=document.getElementById('success');
const toAlbum=document.getElementById('toAlbum');

function shuffle(items){
  const a=[...items];
  do{
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
  }while(a.every((v,i)=>v===i));
  return a;
}
function initPuzzle(){
  puzzleStarted=true;
  puzzle=shuffle(solved);
  selected=null;
  toAlbum.classList.add('hidden');
  success.classList.remove('show');
  renderPuzzle();
}
function resetPuzzleLock(){
  puzzleStarted=false;
  selected=null;
  toAlbum.classList.add('hidden');
}
function makePiece(pos){
  const b=document.createElement('button');
  b.className='piece';
  b.type='button';
  b.dataset.pos=pos;
  b.setAttribute('aria-label',`Mảnh ${pos+1}`);
  b.addEventListener('click',()=>pickPiece(b));
  return b;
}
function renderPuzzle(){
  board.innerHTML='';
  puzzle.forEach((pos,i)=>{
    const slot=document.createElement('div');
    slot.className='puzzle-slot';
    slot.dataset.index=i;
    const wrap=document.createElement('div');
    wrap.className='piece-slot';
    const piece=makePiece(pos);
    wrap.appendChild(piece);
    slot.appendChild(wrap);
    board.appendChild(slot);
  });
}
function pickPiece(piece){
  const index=Number(piece.closest('.puzzle-slot').dataset.index);
  pickBoard(index,piece);
}
function pickBoard(index,p){
  if(!puzzleStarted)return;
  if(selected===null){
    selected={index,pos:puzzle[index],el:p};
    p.classList.add('selected');
    return;
  }
  const a=selected.index,b=index;
  if(a===b){
    selected=null;
    renderPuzzle();
    return;
  }
  [puzzle[a],puzzle[b]]=[puzzle[b],puzzle[a]];
  selected=null;
  renderPuzzle();
  checkPuzzle();
}
function checkPuzzle(){
  const ok=puzzle.every((v,i)=>v===i);
  if(ok){
    [...board.children].forEach(s=>s.classList.add('correct'));
    gameWin();
  }
}
function gameWin(){
  // Khóa puzzle sau khi đã ghép đúng
  puzzleStarted = false;
  selected = null;

  // Hiệu ứng chúc mừng
  confetti(35);
  burstHearts(10);

  // Cho các mảnh có thời gian hiện trạng thái đúng
  [...board.children].forEach((slot, i)=>{
    setTimeout(()=>{
      slot.classList.add('correct');
    }, i * 70);
  });

  // Sau một chút, thay 6 mảnh bằng ảnh nguyên
  setTimeout(()=>{
    board.classList.add('puzzle-completed');

    board.innerHTML = `
      <div class="completed-photo">
        <img
          src="images/couple.jpg"
          alt="Ảnh của Misa và Bờm"
        >
      </div>
    `;

    // Hiện thông báo hoàn thành
    success.classList.add('show');

    // Sau khi ảnh nguyên xuất hiện mới cho Next
    setTimeout(()=>{
      toAlbum.classList.remove('hidden');
      toAlbum.classList.add('ready');
    },700);

  },650);
}

toAlbum.addEventListener('click',()=>go(3));

// ---------- Filmstrip album: one birthday photo per year ----------
const filmTrack=document.getElementById('filmTrack');
const filmFrames=[...document.querySelectorAll('.film-frame')];
const dots=document.getElementById('albumDots');
let yearIndex=0;
function buildFilmDots(){
  dots.innerHTML='';
  filmFrames.forEach((frame,i)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.className='film-dot'+(i===yearIndex?' active':'');
    dot.textContent=frame.dataset.year;
    dot.addEventListener('click',()=>scrollToYear(i));
    dots.appendChild(dot);
  });
}
function scrollToYear(index){
  yearIndex=Math.max(0,Math.min(index,filmFrames.length-1));
  const frame=filmFrames[yearIndex];
  frame.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  dots.querySelectorAll('.film-dot').forEach((d,i)=>d.classList.toggle('active',i===yearIndex));
}
buildFilmDots();
document.getElementById('prevYear').onclick=()=>scrollToYear(yearIndex-1);
document.getElementById('nextYear').onclick=()=>scrollToYear(yearIndex+1);
filmTrack?.addEventListener('scroll',()=>{
  const center=filmTrack.scrollLeft+filmTrack.clientWidth/2;
  let best=0,dist=Infinity;
  filmFrames.forEach((frame,i)=>{
    const frameCenter=frame.offsetLeft+frame.offsetWidth/2;
    const d=Math.abs(frameCenter-center);
    if(d<dist){dist=d;best=i}
  });
  if(best!==yearIndex){yearIndex=best;dots.querySelectorAll('.film-dot').forEach((d,i)=>d.classList.toggle('active',i===yearIndex))}
});

// ---------- Traits ----------
const traitText={
 warm:'Ấm áp kiểu người khiến những ngày bình thường cũng dịu lại một chút.',
 handsome:'Đẹp trai — đã được Misa kiểm duyệt. Không nhận khiếu nại =))',
 thoughtful:'Siêu tinh tế: nhớ những chuyện nhỏ nhỏ mà người khác dễ quên.',
 kind:'Tốt bụng, tử tế, green flag được đóng dấu ✓',
 money:'ĐẶC BIỆT LÀ KINH TẾ 💸 — một phẩm chất nổi bật, rất đáng ghi nhận và hoàn toàn khách quan.'
};
const traitResult=document.getElementById('traitResult');
document.querySelectorAll('.trait-card').forEach(card=>card.addEventListener('click',()=>{
  traitResult.textContent=traitText[card.dataset.trait];
  card.animate([{transform:'scale(.98)'},{transform:'scale(1)'}],{duration:220});
}));

// ---------- Gift choice -> dedicated cake page ----------
const blowGift=document.getElementById('blowGift');
blowGift?.addEventListener('click',()=>go(7));

// ---------- Dedicated birthday cake + candle blowing ----------
const cakeStage=document.getElementById('cakeStage');
const blowStatus=document.getElementById('blowStatus');
const startBlow=document.getElementById('startBlow');
const tapBlow=document.getElementById('tapBlow');
const wishReveal=document.getElementById('wishReveal');
const toLetter=document.getElementById('toLetter');
const balloonField=document.getElementById('balloonField');
let micStream=null;
let micContext=null;
let micSource=null;
let analyser=null;
let micRAF=null;
let candlesBlown=false;
let blowFrames=0;

function prepareCake(){
  candlesBlown=false;
  blowFrames=0;
  document.querySelectorAll('.real-flame,.photo-flame').forEach(f=>f.classList.remove('out'));
  cakeStage?.classList.remove('celebrate');
  wishReveal?.classList.add('hidden');
  toLetter?.classList.add('hidden');
  if(blowStatus) blowStatus.textContent='Bấm “Bật mic” rồi thổi nhẹ vào microphone 💨';
  if(startBlow) startBlow.disabled=false;
  if(tapBlow) tapBlow.disabled=false;
  buildBalloons(false);
}

function blowOutCandles(source='mic'){
  if(candlesBlown)return;
  candlesBlown=true;
  stopMic();
  document.querySelectorAll('.real-flame,.photo-flame').forEach((f,i)=>setTimeout(()=>f.classList.add('out'),i*130));
  cakeStage?.classList.add('celebrate');
  if(blowStatus) blowStatus.textContent=source==='mic'?'PHÙUUUU! 🎉 Tắt hết rồi!':'TẮT NẾN THÀNH CÔNG! 🎉 Giờ ước một điều đi Bờm ❤️';
  wishReveal?.classList.remove('hidden');
  toLetter?.classList.remove('hidden');
  if(startBlow) startBlow.disabled=true;
  if(tapBlow) tapBlow.disabled=true;
  fireworkShow();
  buildBalloons(true);
}

tapBlow?.addEventListener('click',()=>blowOutCandles('button'));
startBlow?.addEventListener('click',async()=>{
  if(!navigator.mediaDevices?.getUserMedia){
    if(blowStatus) blowStatus.textContent='Trình duyệt không hỗ trợ mic. Bấm “Thổi bằng nút này” nhé 💨';
    return;
  }
  try{
    if(blowStatus) blowStatus.textContent='Đang nghe... thổi vào mic nào 💨';
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    micContext=new (window.AudioContext||window.webkitAudioContext)();
    micSource=micContext.createMediaStreamSource(micStream);
    analyser=micContext.createAnalyser();
    analyser.fftSize=1024;
    micSource.connect(analyser);
    detectBlow();
  }catch(err){
    if(blowStatus) blowStatus.textContent='Không bật được mic. Bấm “Thổi bằng nút này” nhé 💨';
  }
});
function detectBlow(){
  if(!analyser||candlesBlown)return;
  const data=new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  let sum=0;
  for(let i=0;i<data.length;i++){
    const n=(data[i]-128)/128;
    sum+=n*n;
  }
  const rms=Math.sqrt(sum/data.length);
  if(rms>0.085) blowFrames++; else blowFrames=Math.max(0,blowFrames-1);
  if(blowFrames>=3){ blowOutCandles('mic'); return; }
  micRAF=requestAnimationFrame(detectBlow);
}
function stopMic(){
  if(micRAF){cancelAnimationFrame(micRAF);micRAF=null}
  if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
  if(micSource){try{micSource.disconnect()}catch(e){};micSource=null}
  if(analyser){try{analyser.disconnect()}catch(e){};analyser=null}
  if(micContext){micContext.close().catch(()=>{});micContext=null}
}

function buildBalloons(celebrate){
  if(!balloonField)return;
  balloonField.innerHTML='';
  if(!celebrate)return;
  const balloons=[
    ['pink','8%','72px','10s'],['cream','18%','38px','11s'],['rose','28%','66px','12s'],
    ['pink','72%','52px','10.8s'],['cream','82%','88px','12s'],['rose','91%','34px','9.6s']
  ];
  balloons.forEach(([tone,left,delay,dur],i)=>{
    const wrap=document.createElement('div');
    wrap.className='balloon-wrap';
    wrap.style.left=left; wrap.style.animationDelay=`${i*.14}s`; wrap.style.setProperty('--rise',dur);
    wrap.innerHTML=`<span class="balloon ${tone}"></span><i class="balloon-string"></i>`;
    balloonField.append(wrap);
  });
}
function fireworkShow(){
  for(let i=0;i<4;i++) setTimeout(()=>launchFirework(18+Math.random()*64,16+Math.random()*33),i*260);
  confetti(70);
  burstHearts(18);
}
function launchFirework(x,y){
  const boom=document.createElement('div');
  boom.className='firework';
  boom.style.left=x+'%'; boom.style.top=y+'%';
  for(let i=0;i<18;i++){
    const spark=document.createElement('i');
    const angle=(i/18)*Math.PI*2;
    spark.style.setProperty('--dx',`${Math.cos(angle)*70}px`);
    spark.style.setProperty('--dy',`${Math.sin(angle)*70}px`);
    spark.style.setProperty('--delay',`${Math.random()*.16}s`);
    boom.append(spark);
  }
  document.body.append(boom);
  setTimeout(()=>boom.remove(),1300);
}
function launchFinalFireworks(){
  for(let i=0;i<7;i++) setTimeout(()=>launchFirework(8+Math.random()*84,12+Math.random()*35),i*180);
}

document.getElementById('p7')?.addEventListener('animationstart',prepareCake,{once:true});
const originalGo=go;
go=function(x){
  originalGo(x);
  if(x===7) setTimeout(prepareCake,80);
};

// ---------- Letter ----------
const letter=document.getElementById('letter');
const letterNext=document.getElementById('letterNext');
function openLetter(){letter.classList.add('open');letterNext.classList.add('ready')}
letter.addEventListener('click',openLetter);
letter.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLetter()}});

// ---------- Music ----------
const music=document.getElementById('music');
const musicBtn=document.getElementById('musicBtn');
musicBtn.onclick=async()=>{
  if(music.paused){
    try{await music.play();musicBtn.textContent='♫'}
    catch(e){alert('Hãy thêm file music/birthday.mp3 trước nhé!')}
  }else{music.pause();musicBtn.textContent='♪'}
};

// ---------- Effects ----------
function confetti(k){
  for(let i=0;i<k;i++){
    const e=document.createElement('i');
    e.style.cssText=`position:fixed;z-index:70;width:7px;height:12px;background:${['#e38ba2','#e9b86f','#c77791','#f4cbd4'][i%4]};left:50%;top:43%;border-radius:2px;pointer-events:none;`;
    e.animate([
      {transform:'translate(0,0) rotate(0)',opacity:1},
      {transform:`translate(${Math.random()*900-450}px,${Math.random()*650-300}px) rotate(${Math.random()*900}deg)`,opacity:0}
    ],{duration:1600+Math.random()*700,easing:'cubic-bezier(.1,.8,.2,1)'});
    document.body.append(e);
    setTimeout(()=>e.remove(),2500);
  }
}
function burstHearts(count){
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const h=document.createElement('span');
      h.className='heart';
      h.textContent=Math.random()>.5?'♡':'♥';
      h.style.left=(38+Math.random()*24)+'%';
      h.style.fontSize=(13+Math.random()*18)+'px';
      h.style.animationDuration=(4+Math.random()*3)+'s';
      document.getElementById('floaters').append(h);
      setTimeout(()=>h.remove(),8000);
    },i*80);
  }
}
setInterval(()=>{
  const h=document.createElement('span');
  h.className='heart';
  h.textContent=Math.random()>.5?'♡':'♥';
  h.style.left=Math.random()*100+'%';
  h.style.fontSize=12+Math.random()*18+'px';
  h.style.animationDuration=5+Math.random()*5+'s';
  document.getElementById('floaters').append(h);
  setTimeout(()=>h.remove(),10000);
},1100);

"use strict";
/* ============================================================
   五十音マインスイーパー 画面描画（gojuon_ui.js）
   ソロ版（index.html）とオンライン版（online.html）で共有。
   「view」（gojuon_core.js の viewFor が返す形）を受け取って
   #ledLeft #ledRight #face #pl0 #pl1 #hint #board #log #btnDeclare を描く。
   ============================================================ */
window.GojuonUI=(function(){
  const C=window.GojuonCore;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- 7セグ表示 ---------- */
  const SEG={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg','-':'g',' ':''};
  const SEGP={a:'2,1 4,0 18,0 20,1 18,3 4,3',b:'21,2 22,4 22,17 21,19 19,17 19,4',c:'21,20 22,22 22,35 21,37 19,35 19,22',
    d:'2,38 4,36 18,36 20,38 18,39 4,39',e:'1,20 3,22 3,35 1,37 0,35 0,22',f:'1,2 3,4 3,17 1,19 0,17 0,4',g:'2,19.5 4,18 18,18 20,19.5 18,21 4,21'};
  function led(el,text,digits){
    const s=String(text).padStart(digits,' ').slice(-digits);
    el.innerHTML=[...s].map(ch=>{const on=SEG[ch]||'';return '<svg width="24" height="40" viewBox="-1 -1 24 41">'+Object.keys(SEGP).map(k=>'<polygon points="'+SEGP[k]+'" fill="'+(on.includes(k)?'#ff2020':'#3a0000')+'"/>').join('')+'</svg>';}).join('');
  }

  /* ---------- 対戦画面の描画 ----------
     V: view / o: {onPick(k), canAct:boolean（自分が操作できる番か）, you:seat（-1なら「あなた」表示なし）, role} */
  function render(V,o){
    o=o||{};
    led($('ledLeft'),V.remain!==null&&V.remain!==undefined?V.remain:'---',3);
    led($('ledRight'),Math.min(V.turn,999),3);
    $('face').textContent=V.face||'🙂';
    $('pl1').classList.toggle('hidden',!!V.solo);
    [0,1].forEach(i=>{const el=$('pl'+i);if(V.solo&&i===1)return;el.classList.toggle('cur',!V.over&&V.cur===i);
      el.querySelector('.nm').textContent=V.solo?('ひとりで挑戦：'+V.names[0]):((i===0?'先攻 ':'後攻 ')+V.names[i]+(o.you===i?'（あなた）':''));
      let st=V.solo?('いまの手数：'+V.moves+'手'+(V.best?'　ベスト：'+V.best+'手':'')):(V.skip[i]?'<span class="skip">次の番はお休み</span>':(!V.over&&V.cur===i?'いまの番':'&nbsp;'));
      el.querySelector('.st').innerHTML=st;});
    let h='<span>難易度：<b>'+esc(V.level)+'</b></span>';
    if(V.genre)h+='<span>ジャンル：<b>'+esc(V.genre)+'</b></span>';
    if(V.len!==null&&V.len!==undefined)h+='<span>文字数：<b>'+V.len+'</b></span>';
    h+='<span>見つかった文字：<span class="found">'+(V.found.length?V.found.map(f=>'<span>'+f.k+(f.count>1?'×'+f.count:'')+'</span>').join(''):'<span style="background:#ddd;color:#555;border-color:#999">なし</span>')+'</span></span>';
    if(V.word&&!V.over)h+='<span style="color:#800">お題：<b>'+esc(V.word)+'</b>（あなたは出題者）</span>';
    $('hint').innerHTML=h;

    const narrow=window.innerWidth<620;
    const b=$('board');b.innerHTML='';
    b.style.gridTemplateColumns=narrow?'repeat(5,1fr)':'repeat(10,1fr)';
    b.style.maxWidth=narrow?'400px':'';
    for(const c of C.CELLS){
      const d=document.createElement('div');d.className='cell';d.setAttribute('role','button');d.setAttribute('aria-label','マス '+c.k);
      d.style.gridColumn=narrow?(c.r+1):(c.c+1);d.style.gridRow=narrow?(c.c+1):(c.r+1);
      const info=V.opened[c.k];
      if(info){
        if(info.bomb){d.classList.add('open','bomb');d.innerHTML='<span class="k">'+c.k+'</span><span class="n">💣</span>'+(info.count>1?'<span class="x">×'+info.count+'</span>':'');}
        else{d.classList.add('open','n'+info.n);d.innerHTML='<span class="k">'+c.k+'</span><span class="n">'+info.n+'</span>';}
        if(c.k===V.lastPick&&!V.over)d.classList.add('flash');
      }else{
        d.textContent=c.k;
        if(V.over||!o.canAct)d.classList.add('disabled');else d.onclick=()=>o.onPick&&o.onPick(c.k);
      }
      b.appendChild(d);
    }
    $('btnDeclare').disabled=!!V.over||!o.canAct;
    $('log').innerHTML=V.log.slice(-40).reverse().map(l=>'<div class="'+(l.p===undefined||l.p===null?'':'p'+l.p)+'">'+esc(l.text)+'</div>').join('');
  }

  return {led,render,esc};
})();

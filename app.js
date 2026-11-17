(function(){
"use strict";
var J=window.JW,L=J.LEAGUES,TR=J.TOUR;
var DIVN={D:'D-1Gの部',S:'S-1Gの部'},DIVNOTE={D:'小学3〜6年生女子・36チーム',S:'シニア女子・20チーム'};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var tab=ss('jw-tab')||'top',ldiv=ls('jw-ldiv')||'D',tdiv=ls('jw-tdiv')||'D',pick=ls('jw-team')||'';

/* ---------- 予選の計算（勝点 → 自内野合計 → 直接対決 → 相手内野合計） ---------- */
var LG={},TEAM={};
Object.keys(L).forEach(function(k){
  var g=L[k],st=g.t.map(function(n,i){return {n:n,i:i+1,no:g.no+i,lg:k,div:g.div,w:0,d:0,l:0,pts:0,inn:0,opp:0}}),h={};
  g.r.forEach(function(r){var a=st[r[0]-1],b=st[r[1]-1],x=r[2],y=r[3];a.inn+=x;a.opp+=y;b.inn+=y;b.opp+=x;
    if(x>y){a.w++;b.l++}else if(y>x){b.w++;a.l++}else{a.d++;b.d++}h[r[0]+'|'+r[1]]=[x,y];h[r[1]+'|'+r[0]]=[y,x]});
  st.forEach(function(r){r.pts=r.w*2+r.d});
  var arr=st.slice().sort(function(p,q){var hh=h[p.i+'|'+q.i];return (q.pts-p.pts)||(q.inn-p.inn)||(hh&&hh[0]!==hh[1]?(hh[0]>hh[1]?-1:1):0)||(p.opp-q.opp)});
  arr.forEach(function(r,j){r.rank=j+1;TEAM[r.n]=r});
  LG[k]={g:g,st:st,arr:arr,h:h};
});
// ワイルドカード（S-1G：各リーグ3位の上位2チーム）
var WC=['J','K','L','M','N'].map(function(k){return LG[k].arr[2]}).sort(function(p,q){return (q.pts-p.pts)||(q.inn-p.inn)||(p.opp-q.opp)});
WC.slice(0,2).forEach(function(r){r.wc=true});

/* ---------- 決勝トーナメントの計算 ---------- */
var RES={};
function team(div,code){var m=/^W:(\w+)$/.exec(code);return m?res(div,m[1]).win:code}
function res(div,id){var key=div+id;if(RES[key])return RES[key];var m=TR[div].m[id],a=team(div,m.a),b=team(div,m.b),o={id:id,div:div,m:m,a:a,b:b};
  if(m.sets){var x=0,y=0;m.sets.forEach(function(s){if(s[0]>s[1])x++;else y++});o.sa=x;o.sb=y}else{o.sa=m.sa;o.sb=m.sb}
  o.aw=o.sa>o.sb;o.win=o.aw?a:b;o.lose=o.aw?b:a;RES[key]=o;return o}
var FINAL={};
['D','S'].forEach(function(d){var T=TR[d],rt=res(d,T.root),sf=[TR[d].m[T.root].a,TR[d].m[T.root].b].map(function(c){return res(d,c.slice(2))});
  var qf=[];sf.forEach(function(s){[s.m.a,s.m.b].forEach(function(c){if(/^W:/.test(c))qf.push(res(d,c.slice(2)).lose)})});
  FINAL[d]={win:rt.win,run:rt.lose,third:sf.map(function(s){return s.lose}),best8:qf};
  Object.keys(T.m).forEach(function(id){res(d,id)});
});
function teamTour(n){var out=[];Object.keys(RES).forEach(function(k){var o=RES[k];if(o.a===n||o.b===n)out.push(o)});return out.sort(function(p,q){return p.id.slice(1)-q.id.slice(1)||(p.id<q.id?-1:1)})}
function finish(n){var t=TEAM[n],d=t.div,F=FINAL[d];if(F.win===n)return '優勝';if(F.run===n)return '準優勝';if(F.third.indexOf(n)>=0)return '第3位';if(F.best8.indexOf(n)>=0)return 'ベスト8';
  if(TR[d].seeds[n])return '決勝トーナメント進出';return '予選リーグ '+t.lg+'リーグ'+t.rank+'位'}

/* ---------- 部品 ---------- */
var ICON={
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>',
  top:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8 20h8M9 17h6"/></svg>',
  league:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M3 14.5h18M9 4v16"/></svg>',
  tour:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h5v5H3M3 14h5v5H3M8 7.5h3v9H8M11 12h4"/><path d="M15 9h6v6h-6z"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>'
};
function seg(id,cur){return '<div class="seg" role="group">'+[['D','D-1Gの部'],['S','S-1Gの部']].map(function(x){return '<button type="button" data-seg="'+id+'" data-v="'+x[0]+'" class="'+x[0].toLowerCase()+'" aria-pressed="'+(cur===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'}
function sparks(){var h='';for(var i=0;i<16;i++)h+='<i class="spark" style="left:'+(4+i*6)+'%;bottom:0;--t:'+(2.6+(i%5)*.5)+'s;--dl:-'+(i*.37).toFixed(2)+'s;--dx:'+((i%3-1)*20)+'px"></i>';return h}
function teamOpts(){return '<option value="">チームを選ぶ</option>'+['D','S'].map(function(d){return '<optgroup label="'+DIVN[d]+'">'+Object.keys(L).filter(function(k){return L[k].div===d}).map(function(k){return L[k].t.map(function(n){return '<option'+(pick===n?' selected':'')+'>'+esc(n)+'</option>'}).join('')}).join('')+'</optgroup>'}).join('')}

/* ---------- 試合カード ---------- */
function matchHTML(o){
  var m=o.m,hl=pick&&(o.a===pick||o.b===pick);
  function row(n,s,w,side){var seed=TR[o.div].seeds[n];return '<div class="row'+(w?' w':'')+'"><span class="tn">'+(seed?'<small>'+esc(seed)+'</small>':'')+esc(n)+(m.v&&w?'<span class="vp">V</span>':'')+'</span><span class="sc">'+s+'</span></div>'}
  return '<div class="match '+o.div+(hl?' hl':'')+'"><div class="hd"><span class="dv '+o.div+'">'+o.div+'-1G</span>'+o.id[0]+'コート 第'+o.id.slice(1)+'試合・'+esc(m.r)+(m.sets?'（3セットマッチ）':'')+'</div>'+
   row(o.a,o.sa,o.aw,'a')+row(o.b,o.sb,!o.aw,'b')+
   (m.sets?'<div class="sets">'+m.sets.map(function(s,i){return '<span>第'+(i+1)+'セット '+s[0]+'-'+s[1]+(s[2]?' V':'')+'</span>'}).join('')+'</div>':'')+
   (m.v?'<div class="sets"><span>Vポイントで決着</span></div>':'')+'</div>';
}

/* ---------- 結果（トップ） ---------- */
function viewTop(){
  var h='<section class="hero">'+sparks()+'<img class="lg" src="img/logo.webp" alt="DODGEBALL CHAMPIONSHIP J.D.B.A. ALL-JAPAN GIRLS 2025" width="864" height="713"><p class="t1">第12回 全日本女子総合ドッジボール選手権</p><p class="t2">2025年12月7日（日）｜滋賀ダイハツアリーナ</p><span class="done">大会結果</span></section>';
  h+='<div class="champs">'+['D','S'].map(function(d){var F=FINAL[d];return '<div class="champ '+d+'"><h3><span class="dv '+d+'">'+DIVN[d]+'</span></h3><div class="win"><small>🏆 優勝</small><b>'+esc(F.win)+'</b></div><ol class="places"><li class="p2"><span class="pl">準優勝</span><span>'+esc(F.run)+'</span></li>'+F.third.map(function(n){return '<li class="p3"><span class="pl">第3位</span><span>'+esc(n)+'</span></li>'}).join('')+'</ol><p class="best8">ベスト8：<b>'+F.best8.map(esc).join('</b>・<b>')+'</b></p></div>'}).join('')+'</div>';
  h+='<div class="card"><h2>チームで探す</h2><select id="pick" class="sel" aria-label="チームを選ぶ">'+teamOpts()+'</select>'+(pick&&TEAM[pick]?teamCard(pick):'<p class="note">チームを選ぶと、予選リーグの成績と決勝トーナメントの試合をまとめて表示します。</p>')+'</div>';
  return h;
}
function teamCard(n){
  var t=TEAM[n],G=LG[t.lg],h='<div class="teamcard"><div class="rec"><span>最終成績<b>'+finish(n)+'</b></span><span>'+t.lg+'リーグ<b>'+t.rank+'位</b></span><span>勝点<b>'+t.pts+'</b></span><span>'+t.w+'勝'+t.d+'分'+t.l+'敗</span></div>';
  h+='<div class="mlist">'+G.g.t.map(function(o,j){if(j+1===t.i)return '';var r=G.h[t.i+'|'+(j+1)],w=r[0]>r[1],d=r[0]===r[1];
    return '<div class="match '+t.div+'"><div class="hd"><span class="dv '+t.div+'">'+t.div+'-1G</span>予選 '+t.lg+'リーグ</div><div class="row'+(w?' w':'')+'"><span class="tn">'+esc(n)+'</span><span class="sc">'+r[0]+'</span></div><div class="row'+(!w&&!d?' w':'')+'"><span class="tn">'+esc(o)+'</span><span class="sc">'+r[1]+'</span></div>'+(d?'<div class="sets"><span>引き分け</span></div>':'')+'</div>'}).join('')+
   teamTour(n).map(matchHTML).join('')+'</div></div>';
  return h;
}

/* ---------- 予選リーグ ---------- */
function viewLeague(){
  var d=ldiv,h='<div style="display:grid;gap:8px"><h2>予選リーグ</h2>'+seg('ldiv',d)+'<p class="note">'+DIVN[d]+'（'+DIVNOTE[d]+'）。勝ち2点・引き分け1点・負け0点。勝点が同じときは ①味方内野人数の合計が多い ②直接対決の勝者 ③相手内野人数の合計が少ない の順で決定。各リーグ上位2チームが決勝トーナメントへ進出'+(d==='S'?'。S-1Gは各リーグ3位のうち上位2チームがワイルドカードで進出':'')+'。</p></div><div class="grid2">';
  Object.keys(L).filter(function(k){return L[k].div===d}).forEach(function(k){
    var G=LG[k],n=G.g.t.length,nums='①②③④';
    h+='<div class="card '+d+'"><h3>'+k+'リーグ</h3><div class="tbl-wrap"><table><colgroup><col style="width:11%"><col style="width:39%"><col><col><col><col style="width:11%"><col style="width:11%"><col style="width:11%"></colgroup><thead><tr><th>順位</th><th class="name">チーム</th><th>勝</th><th>分</th><th>負</th><th>勝点</th><th>自内野</th><th>相手<br>内野</th></tr></thead><tbody>'+
     G.arr.map(function(r){return '<tr class="'+(r.rank<=2?'adv':r.wc?'wc':'')+(pick===r.n?' hl':'')+'"><td class="rk">'+r.rank+'</td><td class="name"><span class="no">'+r.no+'</span>'+esc(r.n)+(r.wc?'<span class="tag">WC</span>':'')+'</td><td>'+r.w+'</td><td>'+r.d+'</td><td>'+r.l+'</td><td><b>'+r.pts+'</b></td><td>'+r.inn+'</td><td>'+r.opp+'</td></tr>'}).join('')+'</tbody></table></div>';
    h+='<div class="tbl-wrap"><table class="mx"><colgroup><col style="width:36%"><col><col><col><col></colgroup><thead><tr><th class="name">対戦</th>'+G.g.t.map(function(_,i){return '<th>'+nums[i]+'</th>'}).join('')+'</tr></thead><tbody>'+
     G.g.t.map(function(a,i){return '<tr><td class="name"><span class="no">'+nums[i]+'</span>'+esc(a)+'</td>'+G.g.t.map(function(_,j){if(i===j)return '<td class="diag"></td>';var v=G.h[(i+1)+'|'+(j+1)];return '<td><span class="'+(v[0]>v[1]?'o':v[0]<v[1]?'x':'d')+'">'+(v[0]>v[1]?'〇':v[0]<v[1]?'×':'△')+'</span><small>'+v[0]+'-'+v[1]+'</small></td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></div>';
  });
  h+='</div>';
  if(d==='S')h+='<div class="card S"><h3>ワイルドカード（各リーグ3位の比較）</h3><div class="tbl-wrap"><table><colgroup><col style="width:12%"><col style="width:44%"><col><col><col></colgroup><thead><tr><th>順</th><th class="name">チーム</th><th>勝点</th><th>自内野</th><th>相手内野</th></tr></thead><tbody>'+WC.map(function(r,i){return '<tr class="'+(r.wc?'wc':'')+'"><td class="rk">'+(i+1)+'</td><td class="name">'+esc(r.n)+'<span class="no">（'+r.lg+'リーグ3位）</span>'+(r.wc?'<span class="tag">WC</span>':'')+'</td><td>'+r.pts+'</td><td>'+r.inn+'</td><td>'+r.opp+'</td></tr>'}).join('')+'</tbody></table></div></div>';
  return h;
}

/* ---------- トーナメント表 ---------- */
function est(s,z){var l=0;String(s).split('').forEach(function(c){l+=c.charCodeAt(0)>255?z*1.02:(/[A-Z0-9]/.test(c)?z*0.66:z*0.56)});return l}
function fitText(x,y,t,z,maxw,cls,anchor){var s=z;while(s>5.5&&est(t,s)>maxw)s-=0.25;return '<text x="'+x+'" y="'+y+'" font-size="'+s+'"'+(anchor?' text-anchor="'+anchor+'"':'')+(cls?' class="'+cls+'"':'')+'>'+esc(t)+'</text>'}
function line(p,k){var col=k==='win'?'var(--path-win)':k==='lose'?'var(--path-lose)':'var(--path-none)';return '<polyline'+(k==='win'?' class="glow" style="color:'+col+'"':'')+' points="'+p+'" fill="none" stroke="'+col+'" stroke-width="'+(k==='win'?4.5:1.8)+'" stroke-linejoin="round" stroke-linecap="round"/>'}
function stag(x,y,v){return '<rect class="scbg" x="'+(x-10)+'" y="'+(y-11)+'" width="20" height="14" rx="3"/><text x="'+x+'" y="'+y+'" font-size="10" text-anchor="middle" class="sct">'+v+'</text>'}
function bracket(d){
  var T=TR[d],root=T.root;
  function build(code){var m=/^W:(\w+)$/.exec(code);if(m){var x=T.m[m[1]];return {id:m[1],k:[build(x.a),build(x.b)]}}return {team:code}}
  var tree={id:root,k:[build(T.m[root].a),build(T.m[root].b)]},leaves=[];
  (function walk(n){if(n.team)leaves.push(n);else n.k.forEach(walk)})(tree);
  function ht(n){return n.team?0:1+Math.max(ht(n.k[0]),ht(n.k[1]))}
  var H=ht(tree),W=440,boxW=132,champW=82,colW=(W-boxW-champW-28)/H,gap=36,top=10;
  leaves.forEach(function(l,i){l.y=top+18+i*gap});
  (function pos(n){if(n.team){n.x=boxW;return}n.k.forEach(pos);n.y=(n.k[0].y+n.k[1].y)/2;n.x=boxW+ht(n)*colW})(tree);
  var h='';
  (function draw(n){if(n.team)return;var o=RES[d+n.id];
    n.k.forEach(function(kid,i){var isA=i===0,k=(isA===o.aw)?'win':'lose';h+=line(kid.x+','+kid.y+' '+n.x+','+kid.y+' '+n.x+','+n.y,k);h+=stag(n.x-13,kid.y-3,isA?o.sa:o.sb)+(o.m.v&&(isA===o.aw)?'<text x="'+(n.x-26)+'" y="'+(kid.y-4)+'" font-size="9" text-anchor="end" class="sub">V</text>':'');draw(kid)});
    h+='<text x="'+(n.x+4)+'" y="'+(n.y+12)+'" font-size="8.5" class="sub">'+n.id+'</text>';
    if(o.m.sets&&n!==tree)o.m.sets.forEach(function(st,i){h+='<text x="'+(n.x+4)+'" y="'+(n.y+23+i*10)+'" font-size="8" class="setx">'+(i+1)+') '+st[0]+'-'+st[1]+(st[2]?' V':'')+'</text>'})})(tree);
  var rt=RES[d+root];
  h+=line(tree.x+','+tree.y+' '+(W-champW-2)+','+tree.y,'win');
  leaves.forEach(function(l){var won=rt.win===l.team;h+='<rect class="box'+(won?' won':'')+'" x="2" y="'+(l.y-15)+'" width="'+(boxW-4)+'" height="30" rx="7"/><text x="9" y="'+(l.y-4)+'" font-size="8" class="sub">'+esc(T.seeds[l.team]||'')+'</text>'+fitText(9,l.y+10,l.team,11,boxW-16)});
  var cy=tree.y;
  h+='<rect class="champ" x="'+(W-champW)+'" y="'+(cy-22)+'" width="'+champW+'" height="44" rx="9"/><text x="'+(W-champW/2)+'" y="'+(cy-7)+'" font-size="9.5" text-anchor="middle" class="champtx">🏆 優勝</text>'+fitText(W-champW/2,cy+11,rt.win,11.5,champW-8,'champtx','middle');
  h+='<rect class="runner" x="'+(W-champW)+'" y="'+(cy+28)+'" width="'+champW+'" height="40" rx="9"/><text x="'+(W-champW/2)+'" y="'+(cy+42)+'" font-size="9" text-anchor="middle" class="runtx">🥈 準優勝</text>'+fitText(W-champW/2,cy+59,rt.lose,11,champW-8,'runtx','middle');
  var fs=T.m[root].sets;if(fs){h+='<text x="'+(W-champW/2)+'" y="'+(cy+82)+'" font-size="8.5" text-anchor="middle" class="sub">決勝のセット</text>';fs.forEach(function(st,i){h+='<text x="'+(W-champW/2)+'" y="'+(cy+95+i*11)+'" font-size="9.5" text-anchor="middle" class="setx">'+(i+1)+') '+st[0]+'-'+st[1]+(st[2]?' V':'')+'</text>'})}
  var hgt=Math.max(top+18+(leaves.length-1)*gap+26,cy+95+(fs?fs.length*11:0));
  var defs='<defs><linearGradient id="gbox'+d+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="gb1"/><stop offset=".55" class="gb2"/><stop offset="1" class="gb3"/></linearGradient><linearGradient id="gch'+d+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9CC2"/><stop offset=".55" stop-color="#E8578F"/><stop offset="1" stop-color="#B8337A"/></linearGradient><linearGradient id="gsc'+d+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F27AAB"/><stop offset="1" stop-color="#C2306E"/></linearGradient></defs>';h=h.replace(/class="box/g,'fill="url(#gbox'+d+')" class="box').replace(/class="champ"/g,'fill="url(#gch'+d+')" class="champ"').replace(/class="scbg"/g,'fill="url(#gsc'+d+')" class="scbg"');
  return '<div class="bk-wrap"><svg class="bk" viewBox="0 0 '+W+' '+hgt+'" role="img" aria-label="'+DIVN[d]+'の決勝トーナメント表">'+defs+h+'</svg></div>';
}
function viewTour(){
  var d=tdiv,F=FINAL[d],T=TR[d];
  var h='<div style="display:grid;gap:8px"><h2>決勝トーナメント</h2>'+seg('tdiv',d)+'<p class="note">準々決勝までは5分1セットマッチ、準決勝・決勝は5分3セットマッチ（2セット先取）。3位決定戦はなく、準決勝で負けた2チームが第3位です。表の数字は内野人数（3セットマッチは取ったセット数）。</p><div class="legend"><span><i style="background:var(--path-win)"></i>勝ち上がり</span><span><span class="vp" style="margin:0">V</span> Vポイントで決着</span></div></div>';
  h+='<div class="card"><h3><span class="dv '+d+'">'+DIVN[d]+'</span> トーナメント表</h3>'+bracket(d)+'</div>';
  var ids=Object.keys(T.m),order=['1回戦','2回戦','準々決勝','準決勝','決勝'];
  order.forEach(function(r){var list=ids.filter(function(id){return T.m[id].r===r});if(!list.length)return;
    list.sort(function(a,b){return (a.slice(1)-b.slice(1))||(a<b?-1:1)});
    h+='<p class="round">'+r+'</p><div class="mlist">'+list.map(function(id){return matchHTML(RES[d+id])}).join('')+'</div>'});
  return h;
}

/* ---------- 要項 ---------- */
function viewInfo(){
  return '<div class="card"><h2>大会概要</h2><dl class="info"><dt>大会名</dt><dd>第12回全日本女子総合ドッジボール選手権</dd><dt>期日</dt><dd>2025年12月7日（日）9:00〜17:15<br><span class="note">チーム受付 8:20〜8:35</span></dd><dt>会場</dt><dd>滋賀ダイハツアリーナ<br><span class="note">滋賀県大津市上田上中野町779番地</span></dd><dt>主催</dt><dd>一般財団法人日本ドッジボール協会</dd><dt>後援</dt><dd>スポーツ庁、公益財団法人日本スポーツ協会、公益財団法人日本レクリエーション協会、滋賀県、大津市</dd><dt>協力</dt><dd>ミズノ株式会社、株式会社ミカサ、株式会社モルテン、株式会社共同写真企画、株式会社プロフォートサニー、株式会社フィス、株式会社ヨコブリシ、株式会社アンフィニプロジェクト、ヤマダイ株式会社、株式会社東横イン、滋賀ダイハツ販売株式会社、株式会社南洋軒、株式会社Re･Shine、近畿日本ツーリスト株式会社、公益財団法人ＳＧＨ文化スポーツ振興財団</dd><dt>助成</dt><dd>公益財団法人スポーツ安全協会 スポーツ普及奨励助成事業／公益財団法人ミズノスポーツ振興財団 助成事業</dd><dt>出場</dt><dd>D-1Gの部 36チーム／S-1Gの部 20チーム</dd></dl></div>'+
  '<div class="card"><h2>競技方法</h2><ul class="rules">'+
   ['試合は予選リーグを経て、決勝トーナメント方式で行う。','予選は勝ち点制（勝ち2点・引き分け1点・負け0点）。各リーグ上位2チームが決勝トーナメントへ進出。','勝ち点が同じ場合は ①各試合終了時の味方内野人数合計が多いチーム ②直接対決の勝者 ③各試合終了時の相手内野人数合計が少ないチーム の順で決定し、それでも決まらない場合は決定戦を行う。','出場チーム数に応じてワイルドカード制を適用（勝ち点 → 味方内野人数合計 → 相手内野人数合計 → 決定戦）。','試合はすべてランニングタイム制。予選リーグと決勝トーナメント準々決勝までは5分間1セットマッチ、準決勝・決勝戦は5分間3セットマッチ。','3位決定戦は実施しない。','D-1Gの部は日本ドッジボール協会公式ルール、S-1Gの部は公式ルールと「2025年度版シニアカテゴリーレギュレーション」に則って運営。','コートはD-1G・S-1Gともに内野10m・外野3mの小学生オフィシャルサイズ。','使用球：S-1G ミカサ DB-350B-YLB／モルテン D3C5000-YC、D-1G ミカサ MGJDB-L／モルテン D3C5000-L'].map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul></div>'+
  '<div class="card"><h2>出場資格</h2><dl class="info"><dt>D-1Gの部</dt><dd>小学3〜6年生女子で構成され、所属都道府県協会の推薦を受けたチーム（3年生単独チームは不可）。</dd><dt>S-1Gの部</dt><dd>各シニアチャンピオンシップ女子の部から推薦される2チーム（基本枠）と追加枠。</dd></dl></div>';
}

/* ---------- 画面 ---------- */
function render(){
  var th=document.documentElement.getAttribute('data-theme');
  var body=tab==='league'?viewLeague():tab==='tour'?viewTour():tab==='info'?viewInfo():viewTop();
  var tabs=[['top','結果',ICON.top],['league','予選',ICON.league],['tour','トーナメント',ICON.tour],['info','要項',ICON.info]];
  var y=window.scrollY;
  document.getElementById('app').innerHTML=
   '<header class="top"><div class="wrap"><img class="lg" src="img/logo.webp" alt="" width="864" height="713"><div class="tt"><b>第12回 全日本女子総合ドッジボール選手権</b><span>2025.12.7 滋賀ダイハツアリーナ</span></div>'+
   '<div class="themesw" role="group" aria-label="表示モード"><button type="button" data-th="light" aria-label="ライトモード" aria-pressed="'+(th!=='dark')+'">'+ICON.sun+'</button><button type="button" data-th="dark" aria-label="ダークモード" aria-pressed="'+(th==='dark')+'">'+ICON.moon+'</button></div></div></header>'+
   '<main><div class="wrap">'+body+'</div></main><footer><div class="wrap"><span class="credit">主催：一般財団法人日本ドッジボール協会　／　結果は大会公式の試合結果表をもとに掲載しています</span></div></footer>'+
   '<nav class="bottomnav" aria-label="メニュー"><div class="in">'+tabs.map(function(t){return '<button type="button" data-tab="'+t[0]+'"'+(tab===t[0]?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></button>'}).join('')+'</div></nav>';
  window.scrollTo(0,y);
}
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-th]');if(t){var v=t.getAttribute('data-th');document.documentElement.setAttribute('data-theme',v);ls('jw-theme',v);render();return}
  t=e.target.closest('[data-tab]');if(t){tab=t.getAttribute('data-tab');ss('jw-tab',tab);render();window.scrollTo(0,0);return}
  t=e.target.closest('[data-seg]');if(t){var k=t.getAttribute('data-seg'),v2=t.getAttribute('data-v');if(k==='ldiv'){ldiv=v2;ls('jw-ldiv',v2)}else{tdiv=v2;ls('jw-tdiv',v2)}render()}
});
document.addEventListener('change',function(e){if(e.target.id==='pick'){pick=e.target.value;ls('jw-team',pick);if(pick&&TEAM[pick]){ldiv=tdiv=TEAM[pick].div}render()}});
render();
})();

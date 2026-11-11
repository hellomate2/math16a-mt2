// Progress checkboxes (saved in this browser), reveal-all toggle, and to-scale function plots.
(function(){
  var KEY='m16a-mt2-done', done={};
  try{done=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}}
  function bar(el,n,t){if(el)el.style.width=(t?Math.round(100*n/t):0)+'%'}
  document.querySelectorAll('.q[id]').forEach(function(q){
    var cb=q.querySelector('input[type=checkbox]'); if(!cb)return;
    if(done[q.id]){cb.checked=true;q.classList.add('done')}
    cb.addEventListener('change',function(){if(cb.checked)done[q.id]=1;else delete done[q.id];q.classList.toggle('done',cb.checked);save();upd()});
  });
  function upd(){
    var qs=document.querySelectorAll('.q[id]'),n=0;qs.forEach(function(q){if(done[q.id])n++});
    bar(document.querySelector('#pagebar i'),n,qs.length);
    var c=document.getElementById('pagecount'); if(c&&qs.length)c.textContent=n+' of '+qs.length+' done';
    document.querySelectorAll('[data-unit]').forEach(function(card){
      var u=card.getAttribute('data-unit'),t=+card.getAttribute('data-total'),k=0;
      for(var id in done)if(id.indexOf(u+'-')===0)k++;
      bar(card.querySelector('.bar i'),k,t);var s=card.querySelector('.cnt');if(s)s.textContent=k+' of '+t+' problems done';
    });
  }
  upd();
  var tg=document.getElementById('toggleAll');
  if(tg)tg.addEventListener('click',function(){var open=tg.getAttribute('data-open')!=='1';
    document.querySelectorAll('details.sol').forEach(function(d){d.open=open});tg.setAttribute('data-open',open?'1':'0');
    tg.textContent=open?'Hide all solutions':'Show all solutions'});
  // plots
  function plot(el){
    var W=440,H=320,m=28,xr=(el.dataset.x||'-5,5').split(',').map(Number),yr=(el.dataset.y||'-5,5').split(',').map(Number);
    var sx=function(x){return m+(x-xr[0])/(xr[1]-xr[0])*(W-2*m)},sy=function(y){return H-m-(y-yr[0])/(yr[1]-yr[0])*(H-2*m)};
    var s='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" font-size="11">';
    function step(r){var raw=(r[1]-r[0])/8,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return (f<1.5?1:f<3.5?2:f<7.5?5:10)*p}
    var tx=step(xr),ty=step(yr),x,y;
    for(x=Math.ceil(xr[0]/tx)*tx;x<=xr[1]+1e-9;x+=tx){s+='<line x1="'+sx(x)+'" y1="'+m+'" x2="'+sx(x)+'" y2="'+(H-m)+'" stroke="currentColor" opacity=".1"/>';
      if(Math.abs(x)>1e-9)s+='<text x="'+sx(x)+'" y="'+Math.min(H-m+13,Math.max(m+12,sy(0)+13))+'" text-anchor="middle" fill="currentColor" opacity=".7">'+(+x.toFixed(6))+'</text>'}
    for(y=Math.ceil(yr[0]/ty)*ty;y<=yr[1]+1e-9;y+=ty){s+='<line x1="'+m+'" y1="'+sy(y)+'" x2="'+(W-m)+'" y2="'+sy(y)+'" stroke="currentColor" opacity=".1"/>';
      if(Math.abs(y)>1e-9)s+='<text x="'+Math.max(m-4,Math.min(W-m,sx(0)-5))+'" y="'+(sy(y)+4)+'" text-anchor="end" fill="currentColor" opacity=".7">'+(+y.toFixed(6))+'</text>'}
    if(yr[0]<=0&&yr[1]>=0)s+='<line x1="'+m+'" y1="'+sy(0)+'" x2="'+(W-m)+'" y2="'+sy(0)+'" stroke="currentColor" stroke-width="1.3"/>';
    if(xr[0]<=0&&xr[1]>=0)s+='<line x1="'+sx(0)+'" y1="'+m+'" x2="'+sx(0)+'" y2="'+(H-m)+'" stroke="currentColor" stroke-width="1.3"/>';
    (el.dataset.v||'').split(',').filter(String).forEach(function(v){s+='<line x1="'+sx(+v)+'" y1="'+m+'" x2="'+sx(+v)+'" y2="'+(H-m)+'" stroke="#c8372d" stroke-dasharray="5 4"/>'});
    (el.dataset.h||'').split(',').filter(String).forEach(function(v){s+='<line x1="'+m+'" y1="'+sy(+v)+'" x2="'+(W-m)+'" y2="'+sy(+v)+'" stroke="#c8372d" stroke-dasharray="5 4"/>'});
    var cols=['#1f5ad1','#2c7d3a','#6f3bb0'];
    (el.dataset.f||'').split(';;').filter(String).forEach(function(expr,i){
      // JavaScript rejects a unary minus right before ** (as in -x**3), so rewrite unary minus as -1*
      expr=expr.replace(/(^|[(,+\-*\/?:])\s*-/g,'$1-1*');
      var f;try{f=new Function('x','return ('+expr+')')}catch(e){return}
      var d='',pen=false,N=600,py=null;
      for(var k=0;k<=N;k++){var xx=xr[0]+(xr[1]-xr[0])*k/N,yy;try{yy=f(xx)}catch(e){yy=NaN}
        var ok=isFinite(yy)&&yy>=yr[0]-(yr[1]-yr[0])&&yy<=yr[1]+(yr[1]-yr[0]);
        if(ok&&py!==null&&Math.abs(yy-py)>(yr[1]-yr[0])*0.9)pen=false;
        if(ok){d+=(pen?'L':'M')+sx(xx).toFixed(1)+' '+sy(yy).toFixed(1);pen=true;py=yy}else{pen=false;py=null}}
      s+='<clipPath id="c'+(++plot.n)+'"><rect x="'+m+'" y="'+m+'" width="'+(W-2*m)+'" height="'+(H-2*m)+'"/></clipPath><path d="'+d+'" fill="none" stroke="'+cols[i%3]+'" stroke-width="2.2" clip-path="url(#c'+plot.n+')"/>'});
    (el.dataset.pts||'').split('|').filter(String).forEach(function(p){var a=p.split(','),px=+a[0],py=+a[1],lab=a.slice(2).join(',');
      var right=sx(px)<W*0.62;
      s+='<circle cx="'+sx(px)+'" cy="'+sy(py)+'" r="4" fill="#c8372d"/><text x="'+(sx(px)+(right?7:-7))+'" y="'+(sy(py)-7)+'" text-anchor="'+(right?'start':'end')+'" fill="currentColor" font-weight="600">'+lab.replace(/</g,'&lt;')+'</text>'});
    s+='</svg>'; if(el.dataset.cap)s+='<div class="cap">'+el.dataset.cap.replace(/</g,'&lt;')+'</div>';
    el.innerHTML=s;
  }
  plot.n=0; document.querySelectorAll('.plot').forEach(plot);
  if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false});
})();

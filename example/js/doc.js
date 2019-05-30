var all = document.querySelectorAll('.sl .lj-slider');
function showVal(vals){
    console.log('Values are: ',vals)
}
for (let i = 0; i < all.length; i++) {
    var par = all[i].parentNode.parentNode.parentNode;
    var pre = par.querySelector('pre');
    var params = '{'+pre.innerHTML.split('.myclass\'),')[1].replace('});','')+'}';

    params = JSON.parse(params,false);
    var p = {
        elt: all[i],
        handler: function(c){
            all[i].parentNode.parentNode.querySelector('.return').innerHTML = "values: " + c.join(', ');
        },
    };
    if(params.handler=='showVal') p.handler = showVal;
    for(key in p){
        params[key] = p[key];
    }
    var n = 0;while(pre.innerHTML[n]==' ') n++;
    new LjSlider(params);
    var rx = new RegExp("(^|\n) {"+n+"}","g");
    pre.innerHTML = pre.innerHTML.replace(/\"/g,'').replace(rx,'$1').replace(/\n *$/g,'');
    par.querySelector('.return').innerHTML = "Values: ";
}
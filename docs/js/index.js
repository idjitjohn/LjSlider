function ch(vals){
    var ppr = document.querySelectorAll(".inputs input");
    function s(elt,val){
        elt.value =  val.toLocaleString();
    }
    s(ppr[0],'min: '+ vals[0] +' EUR');
    s(ppr[1],'max: '+ vals[1] +' EUR');
}
ljSlider({
    elt: document.querySelector('.lj-slider'),
    handler: ch,
    sameStep: true,
    pins: 2,
    start: -500000,
    steps:[
        {step: 50000, number: 20},
        {step: 500000, number: 8},
    ]
})
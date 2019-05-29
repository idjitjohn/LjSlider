/**
 * LjSlider v1.1
 * Licensed under the terms of the MIT license.
 * 
 * By Marson Lj @idjitjohn
 * https://idjitjohn.github.io/portfolio
 */


function LjSlider(data) {
    //Parameters
    this.getValues = function(){
        return this.values;
    }
    this.setValues = function(values){
        if(!Array.isArray(values)) return this.setValues([values]);
        var a_all = Array.from(this.params.elt.querySelectorAll(".pin"));
        for (let i = 0; i < values.length && a_all[i]; i++) {
            var l = this.steps.values.indexOf(values[i]);
            if(l>=0){
                a_all[i].style.left = this.steps.steps[l]+'%';
                a_all[i].dataset.val = values[i];
                this.change();
            }
        }
    }
    this.getParams = function(data){
        var params = {
            elt: null,
            sameStep: true,
            start: 0,
            pins: 1,
            handler: console.log,
            link: true,
            steps: [{ step: 1, number: 10 }],
            values: []
        };
        for (key in data) params[key] = data[key];
        return params;
    }

    this.init = function(data){
        var params = this.getParams(data);
        if(!this.checkErrors(params)) return;
        this.createPins(params);
        this.createLinks(params);
        this.params = this.addEvents(params);
        this.values = [];
        for (let i = 0; i < params.pins; i++) this.values.push(this.params.start);

        //read initial values
        var vals = this.params.values;
        if(!Array.isArray(vals) || vals.length>0)this.setValues(vals);
        else{
            vals = this.params.elt.dataset.val;
            if(vals){
                this.setValues(JSON.parse('['+this.params.elt.dataset.val+']'));
                this.params.elt.removeAttribute('data-val');
            }
        }
        
    }

    this.change = function() {
        var params = this.params;
        var a_all = Array.from(params.elt.querySelectorAll(".pin"))
        .map(function(pin) {
            return {
                pin: pin,
                val: pin.dataset.val
                    ? parseFloat(pin.dataset.val)
                    : params.start,
                x: pin.style.left ? parseFloat(pin.style.left) : 0
            };
            
        })
        .sort(function(a, b) {
            return a.val < b.val ? -1 : 1;
        });
        this.values = a_all.map(function(v) {
            return v.val;
        });

        if (params.link){
            var rest = params.pins % 2;
            if(rest){
                var link = params.elt.querySelector(".diff");
                link.style.left ="0";
                link.style.width = a_all[0].x + "%";
            }
            for (let i = rest; i < Math.ceil(params.pins / 2); i++) {
                var link = params.elt.querySelectorAll(".diff")[i + rest];
                link.style.left = a_all[i * 2 + rest].x + "%";
                link.style.width = a_all[i * 2 + 1 + rest].x - a_all[i * 2 + rest].x + "%";
            }
        }

        params.handler(
            a_all.map(function(v) {
                return v.val;
            })
        );
    }

    this.checkErrors = function(params){
        if (!params.elt.classList) {
            return console.error(
                "The passed elt parameter must be a DOMElemnt"
            );
        }
        else params.elt.classList.add('lj-slider')
        if (params.pins <= 0) {
            return console.error("The passed `pins` value is not valid ");
        }
        return true;
    }

    this.createPins = function(params){
        for (let i = 0; i < params.pins; i++) {
            var d = document.createElement("div");
            d.classList.add("pin");
            d.setAttribute("draggable", "true");
            params.elt.appendChild(d);
        }
    }

    this.createLinks = function(params){
        if (params.link)
        for (let i = 0; i < Math.ceil(params.pins / 2); i++) {
            var d = document.createElement("div");
            d.classList.add("diff");
            params.elt.appendChild(d);
        }
    }

    this.getMinStep = function(params){
        return params.steps.reduce(function(prev, step) {
            return step.step < prev ? step.step : prev;
        }, params.steps[0].step);
    }

    /** 
     * Computing all possible steps
     * return all steps in percentage in an array
    */
    this.getSteps = function(params){
        var minstep = this.getMinStep(params);

        params.steps = params.steps.map(function(step) {
            step["multiply"] = params.sameStep ? 1 : step.step / minstep;
            return step;
        });

        //Taking all steps in percentage
        var onestep =
            100 /
            params.steps.reduce(function(prev, step) {
                return prev + step.number * step.multiply;
            }, 0);
        var steps = [0];
        var values = [params.start];
        params.steps.reduce(
            function(prev, step) {
                var v = prev[1];
                prev = prev[0];
                for (let i = 1; i <= step.number; i++) {
                    steps.push(prev + onestep * step.multiply * i);
                    values.push(v + step.step * i);
                }
                prev = prev + onestep * step.multiply * step.number;
                v = v + step.step * step.number;
                return [prev, v];
            },
            [0, params.start]
        );
        return {steps:steps,values:values};
    }

    //Adding enents to pins
    this.addEvents = function(params){
        var steps = this.steps = this.getSteps(params), that = this;
        var values = steps.values;
        steps = steps.steps;
            
        params.elt.querySelectorAll(".pin").forEach(function(pin) {
            pin.addEventListener(
                "dragstart",
                function(e) {
                    //No ghost dragging
                    e.dataTransfer.setDragImage(document.createElement("div"),0,0);
                },
                false
            );
            pin.addEventListener("drag", function(e) {
                if (e.y === 0) return;
                //Variables - getting and Computing
                var val = params.start,
                    par = parseInt(getComputedStyle(e.target.parentNode).width);
                var left = 0;
                var pprr = e.target.parentNode;
                while(pprr){
                    left += pprr.offsetLeft;
                    pprr = pprr.offsetParent;
                }
                var x = e.clientX - left ;
    
                //if x is out of bounds
                if (x > par) x = par;
                else if (x < 0) x = 0;
    
                //Respect steps - simulate jumping
                x = (x * 100) / par;
                for (var i = 0; i < steps.length; i++) {
                    if (steps[i + 1] >= x) {
                        if (steps[i] < x) {
                            if (
                                Math.abs(x - steps[i]) < Math.abs(x - steps[i + 1])
                            ) {
                                x = steps[i];
                                val = values[i];
                            } else {
                                x = steps[i + 1];
                                val = values[i + 1];
                            }
                        }
                        break;
                    }
                }
                //moving!
                if (parseFloat(e.target.dataset.val) != val) {
                    e.target.style.left = x + "%";
                    e.target.dataset.val = val;
                    that.change();
                }
            }, false);
        });
        return params;
    }
    this.init(data);
}

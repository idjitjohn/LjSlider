/**
 * LjSlider v1.0
 * Licensed under the terms of the MIT license.
 * 
 * By Marson Lj @idjitjohn
 * https://idjitjohn.github.io/portfolio
 */


function ljSlider(data) {
    //Parameters
    var params = {
        elt: null,
        sameStep: true,
        start: 0,
        pins: 1,
        handler: console.log,
        diff: true,
        steps: [{ step: 1, number: 10 }]
    };
    for (key in data) params[key] = data[key];

    function change() {
        var a_all = Array.from(params.elt.querySelectorAll(".pin"))
            .map(function(pin) {
                return {
                    pin: pin,
                    val: pin.getAttribute("data-val")
                        ? parseFloat(pin.getAttribute("data-val"))
                        : params.start,
                    x: pin.style.left ? parseFloat(pin.style.left) : 0
                };
            })
            .sort(function(a, b) {
                return a.val < b.val ? -1 : 1;
            });

        if (params.diff)
            for (let i = 0; i < Math.floor(params.pins / 2); i++) {
                var d = params.elt.querySelectorAll(".diff")[i];
                d.style.left = a_all[i * 2].x + "%";
                d.style.width = a_all[i * 2 + 1].x - a_all[i * 2].x + "%";
            }
        params.handler(
            a_all.map(function(v) {
                return v.val;
            })
        );
    }

    if (!params.elt.classList) {
        return console.error(
            "The passed element must be a DOMElemnt"
        );
    }
    else params.elt.classList.add('lj-slider')
    if (params.pins <= 0) {
        return console.error("The passed `pins` value is not valid ");
    }
    for (let i = 0; i < params.pins; i++) {
        var d = document.createElement("div");
        d.classList.add("pin");
        d.setAttribute("draggable", "true");
        params.elt.appendChild(d);
    }
    if (params.diff)
        for (let i = 0; i < Math.floor(params.pins / 2); i++) {
            var d = document.createElement("div");
            d.classList.add("diff");
            params.elt.appendChild(d);
        }

    var minstep = params.steps.reduce(function(prev, step) {
        return step.step < prev ? step.step : prev;
    }, params.steps[0].step);
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
    params.elt.querySelectorAll(".pin").forEach(function(pin) {
        pin.addEventListener(
            "dragstart",
            function(e) {
                //No ghost dragging
                e.dataTransfer.setDragImage(
                    document.createElement("div"),
                    0,
                    0
                );
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
            if (parseFloat(e.target.getAttribute("data-val")) != val) {
                e.target.style.left = x + "%";
                e.target.setAttribute("data-val", val);
                change();
            }
        });
    });
}

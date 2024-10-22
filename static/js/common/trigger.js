var trigger = {};

function addTrigger(d){
    if(valEmpty(d.id)){ return }
    if(typeof d.trigger !== "function") { return }
    if(!Array.isArray(trigger[d.id])){ trigger[d.id] = [] }
    if(testTriggerDuplicate(d)){ return }
    trigger[d.id].push(d);
}

function testTriggerDuplicate(d, test = false){
    trigger[d.id].forEach(thisTrigger => {
        if(thisTrigger.trigger.toString() === d.trigger.toString()){ return test = true }
    });
    return test;
}

function runTrigger(d){
    if(!Array.isArray(trigger[d.id])){ return }
    trigger[d.id].forEach(thisTrigger => { thisTrigger.trigger(thisTrigger, d) });
}
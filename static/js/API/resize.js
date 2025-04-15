let resizeTimeout;
let resizeInitialized = false;
const resizeObserver = new ResizeObserver(entries => {
	if (!resizeInitialized) {
		resizeInitialized = true;
		return;
	}
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		for (let entry of entries) {
			const { width, height } = entry.contentRect;
			const callback = entry.target.__resizeCallback;
			const percentage = entry.target.__resizePercentage;
			if(typeof callback === 'function'){
				let $el = $(entry.target);
				let w = width;
				let h = height;

				if (percentage) {
					const parent = $(entry.target.parentElement);
					if (parent) {
						w = resizeToPercent(parent.width(), width);
						h = resizeToPercent(parent.height(), height);
					}
				} else {
					w = width.toFixed(2);
					h = height.toFixed(2);
				}

				if(w == 0 || isNaN(w)){ continue }
					
				callback($el, w, h);
			}
		}
	}, 500);
});

function resizeBox(d = {}) {
	if (!d.box || d.box.length === 0) return console.log('No resize element');
	d.box.each(function(){
		this.__resizeCallback = d.callback;
		this.__resizePercentage = d.percentage === true;
		resizeObserver.observe(this);
	});
}

function resizeToPercent(parentSize, childSize){ return ((childSize / parentSize) * 100).toFixed(2) }


jselda = {};

jselda.main = function(canvas) {

	var mainCanvas = canvas;
	var context = mainCanvas.getContext('2d');

	function main () {
	  var now = Date.now();
	  var delta = now - then;

	  handleInput();
	  update(delta / 1000);
	  render();

	  then = now;
	};

	function handleInput() {

	}

	function update() {

	}

	function render() {

	}

	var then = Date.now();
	setInterval(main, 1);

};

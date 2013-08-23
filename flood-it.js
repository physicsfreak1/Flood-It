var colorPickers;
var colorList = ['#ff0000', '#00ff00', '#0000ff', '#fff800', '#880099', '#ffaa00', '#f800ff', '#00fff8'];
var numColors;
var size;

AUI().use(
	'aui-form-validator',
	function(A) {
		new A.FormValidator(
			{
				boundingBox: '#myForm',
				rules: {
					size: {
						range: [6, 26],
						required: true
					},
					colors: {
						range: [3, 8],
						required: true
					}
				}
			}
		);
	}
);

AUI().ready(
	'aui-color-picker',
	'aui-overlay-mask',
	function(A) {
		var overlayMask = new A.OverlayMask().render();

		var container = A.Node.create('<div id="container"><div>');

		var colorPickerDiv = A.Node.create('<div id="colorPickers"></div>').appendTo(container);
		var save = A.Node.create('<button>Save</button>').appendTo(container);
		var cancel = A.Node.create('<button>Cancel</button>').appendTo(container);

		cancel.on(
			'click',
			function(event) {
				if (similarColors('buttons')) {
					alert('Please select colors that are less similar.');
				}
				else {
					overlayMask.hide();
					container.remove();
				}
			}
		);

		save.on(
			'click', 
			function(event) {
				if (similarColors('pickers')) {
					alert('Please select colors that are less similar.');
				}
				else {
					overlayMask.hide();
					container.remove();

					A.all('#main td').each(
						function() {
							for (var i = 0; i < numColors; i++) {
								if (colorToHex(this.getStyle('background-color')) === colorList[i]) {
									this.setStyle('background-color', colorPickers[i].get('rgb').hex);
								}
							}
						}
					);

					for (var i = 0; i < numColors; i++) {
						var color = colorPickers[i].get('rgb').hex;

						A.one('#input td:nth-child(' + (i+1).toString() + ')').setStyle('background-color', color);

						colorList[i] = color;
					}
				}
			}
		);

		createMask = function(elem) {
			overlayMask.set('target', elem).show();

			container.appendTo(A.one('#game'));

			var position = (16*(size+3)).toString();
			container.setStyle('top', '-' + position + 'px');

			colorPickers = new Array(numColors);
			colorPickerDiv.empty();

			for (i = 0; i < numColors; i++) {
				var colorPickerNode = A.Node.create('<div class="colorPicker" id="colorPicker' + i.toString() + '"></div>');
				colorPickerNode.setStyle('background-color', colorList[i]);
				colorPickerNode.appendTo(colorPickerDiv);

				colorPickers[i] = new A.ColorPicker().render(colorPickerNode);
				colorPickers[i].set('hex', colorList[i].slice(1));
				colorPickers[i].set('index', i);

				colorPickers[i].after(
					'colorChange',
					function(event) {
						var j = this.get('index');
						A.one('#colorPicker' + j.toString()).setStyle('background-color', colorPickers[j].get('rgb').hex);
					}
				);
			}
		};
	}
);

function similarColors(type) {
	var similar = false;

	var chosenColors = new Array(numColors);

	for (var i = 0; i < numColors; i++) {
		if (type === 'pickers') {
			chosenColors[i] = colorPickers[i].get('rgb');
		}
	}

	for (var i = 0; i < numColors; i++) {
		for (var j = 0; j < i; j++) {
			if (type === 'pickers') {
				var diffR = Math.abs(chosenColors[i].r - chosenColors[j].r);
				var diffG = Math.abs(chosenColors[i].g - chosenColors[j].g);
				var diffB = Math.abs(chosenColors[i].b - chosenColors[j].b);
			}
			else if (type === 'buttons') {
				var diffR = Math.abs(parseInt(colorList[i].substring(1, 3), 16) - parseInt(colorList[j].substring(1, 3), 16));
				var diffG = Math.abs(parseInt(colorList[i].substring(3, 5), 16) - parseInt(colorList[j].substring(3, 5), 16));
				var diffB = Math.abs(parseInt(colorList[i].substring(5, 7), 16) - parseInt(colorList[j].substring(5, 7), 16));
			}

			if (diffR + diffG + diffB < 50) {
				similar = true;
			}
		}
	}

	return similar;
}

function newGame() {
	AUI().use(
		'aui-base',
		function(A) {
			numColors = parseInt(A.one('#colors').get('value'));
			size = parseInt(A.one('#size').get('value'));

			createBoard(numColors, size);

			for (i = 1; i <= size; i++) {
				for (j = 1; j <= size; j++) {
					num = Math.floor(Math.random()*numColors);

					getTableCell(i, j).setStyle('background-color', colorList[num]);
				}
			}

			moves = Math.floor(0.3*size*numColors);
			A.one('#moves').html(moves.toString());

			if (similarColors('buttons')) {
				createMask('#game');
			}
		}
	);
}

function createBoard(numColors, size) {
	AUI().use(
		'aui-node',
		function(A) {
			var holder = A.one('#game');
			holder.empty();
			A.Node.create('<div id="gameInfo"><p id="movesCount">moves remaining: <span id="moves"><span></p><button id="rules" type="button" onclick="rules()">Rules</button><button id="colorChange" onclick="createMask(\'#game\')" type="button">Change Colors</button><table id="input"><tr id="table-row"></tr></table></div>').appendTo(holder);

			var colorButton = new Array(numColors);
			var subHolder = A.one('#table-row');

			for (var i = 0; i < numColors; i++) {
				colorButton[i] = A.Node.create('<td id="colorButton' + i.toString() + '" onclick="flood(' + i.toString() + ')"></td>');
				colorButton[i].setStyle('background-color', colorList[i]);
				colorButton[i].appendTo(subHolder);
			}

			A.Node.create('<div id="main"><table><tbody></tbody></table></div>').appendTo(holder);
			var table = A.one('#main tbody');

			for (var i = 0; i < size; i++) {
				tdString = '';
				for (var j = 0; j < size; j++) {
					tdString += '<td></td>';
				}
				A.Node.create('<tr>'+tdString+'</tr>').appendTo(table);
			}
		}
	);
}

function rules() {
	alert('Click a colored circle to change the color of the upper-left square and all connected squares of the same color. The object of the game is to fill the entire board with a single color.');
}

function flood(i) {
	var firstColor = colorToHex(getTableCell(1, 1).getStyle('background-color'));

	if (moves > 0 && !win() && colorList[i] !== firstColor) {
		expand(colorList[i], firstColor, 1, 1);

		moves--;
		AUI().one('#moves').html(moves.toString());

		if (win())
			alert('You win!');
		else if (moves === 0)
			alert('You lose!');
	}
}

function expand(newColor, oldColor, row, col) {
	if (row >= 1 && col >= 1 && row <= size && col <= size && colorToHex(getTableCell(row, col).getStyle('background-color')) === oldColor) {
		getTableCell(row, col).setStyle('background-color', newColor);

		expand(newColor, oldColor, row+1, col);
		expand(newColor, oldColor, row-1, col);
		expand(newColor, oldColor, row, col+1);
		expand(newColor, oldColor, row, col-1);
	}
}

function win() {
	var firstColor = getTableCell(1, 1).getStyle('background-color');
	var win = true;

	AUI().all('#main td').each(
		function () {
			if (this.getStyle('background-color') !== firstColor) {
				win = false;
			}
		}
	);

	return win;
}

function getTableCell(i, j) {
	return AUI().one('#main tr:nth-child(' + i.toString() + ') td:nth-child(' + j.toString() + ')');
}

function colorToHex(color) {
	if (color.substring(0, 1) === '#') {
		return color;
	}
	var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
	var red = parseInt(digits[2]);
	var green = parseInt(digits[3]);
	var blue = parseInt(digits[4]);
	return '#' + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
}
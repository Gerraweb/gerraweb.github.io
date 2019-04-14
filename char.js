function TelegramGerraCharts(initialData, type){

	var stacked = false
	var percentage = false
	var y_scaled = false

	var wrapper = document.createElement('div'); 

	wrapper.classList.add('wrapper')

	document.body.appendChild(wrapper)

	var canvas = document.createElement('canvas');

	wrapper.appendChild(canvas)

	var ctx = canvas.getContext('2d');

	var dpx = window.devicePixelRatio;

	var HEIGHT = 0 
	var WIDTH = 0
	var PREVIEW_PT = 30 * dpx
	var PREVIEW_BW = 1 * dpx
	var PREVIEW_CW = 12 * dpx
	var X_TEXT_PT = 15 * dpx
	var Y_LABELS_OFFSET = 80 * dpx
	var Y_LABELS_BP = 6 * dpx
	var Y_LABELS_RP = 30 * dpx

	var canvasBounds = {}

	var xAxis = null
	var yAxis = null

	var appTime = 0

	var chartHeight = 1 * dpx
	var previewHeight = 40 * dpx
	var yLablesOffset = 1 * dpx

	var pointer = 30 * dpx

	var didUpdate = true

	var mouseY = 0
	var mouseX = 0
	var mouseEvent = 'NONE'

	setInitialData()

	function onMouseMove(e){

		var newMouseX = (e.clientX - canvasBounds.left) * dpx

		// if(mouseX > 0 && mouseX < canvasBounds.width && mouseY > 0 && mouseY < canvasBounds.height - previewHeight){
		// 	xAxis.setHovered(mouseX)
		// 	didUpdate = true
		// }
		// else{
		// 	xAxis.setHovered(null)
		// 	didUpdate = true
		// }

		if(mouseEvent === 'DRAG'){
			xAxis.onDrag(xAxis.currentLeftPositionPx - mouseX + newMouseX)
		}

		if(mouseEvent === 'ZOOM_LEFT'){
			xAxis.zoomLeft(newMouseX)
		}

		if(mouseEvent === 'ZOOM_RIGHT'){
			xAxis.zoomRight(newMouseX)
		}

		if(mouseEvent !== 'NONE'){
			yAxis.updateLimits(xAxis)
			didUpdate = true
		}

		mouseX = (e.clientX - canvasBounds.left) * dpx
		mouseY = (e.clientY - canvasBounds.top) * dpx
	}

	function onMouseDown(e){

        newMouseX = mouseX = (e.clientX - canvasBounds.left) * dpx;
        newMouseY = mouseY = (e.clientY - canvasBounds.top) * dpx;

		if(mouseY > HEIGHT - previewHeight && mouseY < HEIGHT){
			if(mouseX > xAxis.currentLeftPositionPx + pointer / 2 && mouseX < xAxis.currentRightPositionPx - pointer / 2) {
				mouseEvent = 'DRAG';
			}
			if(mouseX > xAxis.currentLeftPositionPx - pointer  && mouseX < xAxis.currentLeftPositionPx + pointer / 2) {
				mouseEvent = 'ZOOM_LEFT';
			}
			if(mouseX > xAxis.currentRightPositionPx - pointer / 2  && mouseX < xAxis.currentRightPositionPx + pointer) {
				mouseEvent = 'ZOOM_RIGHT';
			}
		}
	}

	function onMouseUp(){
		mouseEvent = 'NONE'
	}

	document.addEventListener('mousemove', onMouseMove)

	document.addEventListener('mousedown', onMouseDown)


	document.addEventListener('touchstart', function(e){
		onMouseDown(e.touches[0])
	})
    
    document.addEventListener('touchmove', function(e){ 
    	return onMouseMove(e.touches[0]) 
    })

    document.addEventListener('mouseup', onMouseUp)

    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('touchcancel', onMouseUp)

	function setInitialData(){

		var c = canvas.getBoundingClientRect()

		WIDTH = c.width * dpx
		HEIGHT = c.height * dpx

		canvasBounds = c

		canvas.setAttribute('width', WIDTH);
		canvas.setAttribute('height', HEIGHT);

		chartHeight = HEIGHT - previewHeight - PREVIEW_PT
		yLablesOffset = chartHeight / Y_LABELS_OFFSET

		if(yLablesOffset < 1){
			yLablesOffset = 1
		}

		var names = initialData.names
		var types = initialData.types
		var colors = initialData.colors
		
		stacked = initialData.stacked
		percentage = initialData.percentage
		y_scaled = initialData.y_scaled

		var allItems = []

		var data = {
			yColumns: [],
			axisX: []
		}

		for(var i = 0; i < initialData.columns.length; i++){

			var columns = initialData.columns[i]

			var name = names[columns[0]]
			var type = types[columns[0]]
			var color = colors[columns[0]]

			var colls = []

			for(var q = 0; q < columns.length; q++){
				if(q !== 0){
					colls.push(columns[q])
				}
			}

			if(type === 'x'){
				data.axisX = colls
			}
			else{
				allItems = allItems.concat(colls)
				data.yColumns.push({ name: name, type: type, columns: colls, color: color, stacked: stacked })
			}
		}

		xAxis = new AxisX()

		xAxis.setDifference(data.axisX)

		yAxis = new AxisY()

		yAxis.setInitialData(data.yColumns, xAxis, allItems)
	}

	function renderPrewie(){

		ctx.globalAlpha = 0.6

		ctx.fillStyle = '#E2EEF9'

		ctx.fillRect(0, HEIGHT - previewHeight, xAxis.currentLeftPositionPx + PREVIEW_CW, previewHeight);
		ctx.fillRect(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight, WIDTH - xAxis.currentRightPositionPx + PREVIEW_CW, previewHeight);

		ctx.fillStyle = '#C0D1E1'

		ctx.globalAlpha = 1

		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW - 4 * dpx, HEIGHT - previewHeight, xAxis.currentRightPositionPx - xAxis.currentLeftPositionPx - PREVIEW_CW * 1.5, PREVIEW_BW);
		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW - 4 * dpx, HEIGHT - PREVIEW_BW, xAxis.currentRightPositionPx - xAxis.currentLeftPositionPx - PREVIEW_CW * 1.5, PREVIEW_BW);


		ctx.beginPath();

		ctx.moveTo(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight)
		ctx.lineTo(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT)


		ctx.arcTo(xAxis.currentRightPositionPx, HEIGHT, xAxis.currentRightPositionPx, HEIGHT - previewHeight, 10 * dpx)
		ctx.arcTo(xAxis.currentRightPositionPx, HEIGHT - previewHeight, xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight, 10 * dpx)

		ctx.closePath()
		ctx.fill()



		ctx.beginPath();


		ctx.moveTo(xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT - previewHeight)
		ctx.lineTo(xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT)

		ctx.arcTo(xAxis.currentLeftPositionPx, HEIGHT, xAxis.currentLeftPositionPx, HEIGHT - previewHeight, 10 * dpx)

		ctx.arcTo(xAxis.currentLeftPositionPx, HEIGHT - previewHeight, xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT - previewHeight, 10 * dpx)

		ctx.closePath()

		ctx.fill()

		ctx.fillStyle = '#fff'

		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW / 2.2, HEIGHT - previewHeight + previewHeight / 4, 2, previewHeight / 2)

		ctx.fillRect(xAxis.currentRightPositionPx - PREVIEW_CW / 1.8, HEIGHT - previewHeight + previewHeight / 4, 2, previewHeight / 2)

		ctx.beginPath();

		ctx.globalAlpha = 1
		ctx.strokeStyle = '#fff'

		ctx.lineWidth = 4 * dpx

		var BD_FIX = 2 * dpx
		var BD_FIX_R = 12 * dpx

		ctx.moveTo(20 * dpx, HEIGHT - previewHeight - BD_FIX)

		ctx.arcTo(WIDTH + BD_FIX, HEIGHT - previewHeight - BD_FIX, WIDTH + BD_FIX, HEIGHT + BD_FIX, BD_FIX_R);

		ctx.arcTo(WIDTH + BD_FIX, HEIGHT + BD_FIX, -BD_FIX, HEIGHT + BD_FIX, BD_FIX_R);

		ctx.arcTo(-BD_FIX, HEIGHT + BD_FIX, -BD_FIX, HEIGHT - previewHeight - BD_FIX, BD_FIX_R);

		ctx.arcTo(-BD_FIX, HEIGHT - previewHeight - BD_FIX, WIDTH, HEIGHT - previewHeight - BD_FIX, BD_FIX_R);
		ctx.closePath()

		ctx.stroke()

	}

	function renderMapPathes(){
		if(type === 'area'){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawAreaChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
			}
		}
		else if(type === 'bar' && stacked === true){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarStackedChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
			}
		}
		else if(type === 'bar'){
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){
				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarChart(labels, color, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
		    }
		}
		else{

			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){
				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawLineChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, yAxis.mapScale, yAxis.mapOffset, 1, true)
			}
		}
	}

	function renderMain() {

		if(type === 'area'){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawAreaChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset)
			}
		}
		else if(type === 'bar' && stacked === true){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarStackedChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset)
			}
		}
		else if(type === 'bar'){
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){
				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarChart(labels, color, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset)
		    }
		}
		else{
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){
				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawLineChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, yAxis.scale, yAxis.offset, 2, false)
			}
		}
	}

	function render(time){

		var c = canvas.getBoundingClientRect();

		canvasBounds = c

		if(WIDTH !== c.width * dpx || HEIGHT !== c.height * dpx){

			WIDTH = c.width * dpx
			HEIGHT = c.height * dpx

			chartHeight = HEIGHT - previewHeight - PREVIEW_PT

			canvas.setAttribute('width', WIDTH)
			canvas.setAttribute('height', HEIGHT)
			
			xAxis.resize()

			didUpdate = true
		}

		appTime = time

		if(didUpdate){	
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			didUpdate = false

			xAxis.render(ctx)
			renderMapPathes()
			renderPrewie()
			renderMain()

			yAxis.render(time)
			

			
		}

		requestAnimationFrame(render)
	}

	render()


	function drawLineChart(labels, color, index, start, end, xScaleRatio, xOffset, yScaleRatio, yOffset, lineWidth, isMap){

		ctx.beginPath()
		ctx.lineJoin = 'bevel';
		ctx.lineCap = 'butt';
		ctx.lineWidth = lineWidth
		ctx.globalAlpha = 1

		var yScale = yScaleRatio
		var yOffset = yOffset

		if(y_scaled){
			var ownScale = yAxis.ownScales[index]
			if(isMap){
				yScale = ownScale.previewScale
				yOffset = ownScale.previewOffset
			}
			else{
				yScale = ownScale.scale
				yOffset = ownScale.offset
			}

		}

		for(var i = start; i < end; i++){
			var x = xAxis.labels[i];
			var y = labels[i];

			ctx.lineTo(timeStampToPX(x, xScaleRatio, xOffset), timeStampToPX(y, yScale, yOffset))
		}

		ctx.strokeStyle = color

		ctx.stroke()
	}

	function drawBarChart(labels, color, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset){

		ctx.globalAlpha = 1
		ctx.beginPath()

		for(var i = start; i < end; i++){

			var x = xAxis.labels[i];
			var y = labels[i];

			var _x = timeStampToPX(x, xScaleRatio, xOffset)
			var _v = timeStampToPX(y, yScaleRatio, yOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fillStyle = color
		ctx.fill()
	}


	function drawBarStackedChart(labels, color, index, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset){
		ctx.globalAlpha = 1
		ctx.fillStyle = color

		ctx.beginPath()

		for(var i = start; i < end; i++){

			var x = xAxis.labels[i]
			var y = 0;

			for(var z = index; 0 <= z; z--){
				y += yAxis._stacked[i][z]
			}

			var _v = timeStampToPX(y, yScaleRatio, yOffset)
			var _x = timeStampToPX(x, xScaleRatio, xOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fill()
	}

	function drawAreaChart(labels, color, index, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset){

		ctx.globalAlpha = 1
		ctx.fillStyle = color

		ctx.beginPath()

		for(var i = start; i < end; i++){

			var x = xAxis.labels[i]
			var y = 0;

			for(var z = index; 0 <= z; z--){
				y += yAxis._stacked[i][z]
			}

			var _v = timeStampToPX(y, yScaleRatio, yOffset)
			var _x = timeStampToPX(x, xScaleRatio, xOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fill()
	}

	function AxisY(){

		this.columns = []
		this._stacked = []
		this.ownScales = []

		this.low = 0
		this.top = 1
		this.itemsDiff = 1

		this.yTextDelta = 1
		this.scale = 1
		this.offset = 1
		this.totalMaxLimit = 0
		this.totalMinLimit = 0

		this.mapScale = 1
		this.mapOffset = 1

		this.prevS = 0

		this.setInitialData = function(columns, xAxis, allItems){

			this.columns = columns

			this.totalMaxLimit = Math.max.apply(null, allItems)
			this.totalMinLimit = Math.min.apply(null, allItems)

			if(stacked){
				if(percentage){
					this.createLabelsWithPercentage()
				}
				else{
					this.createStackedLabels()
				}
			}

			this.updateLimits(xAxis)
		}


		this.createLabelsWithPercentage = function(){

			var columns = this.columns

			this.totalMaxLimit = 100
			this.totalMinLimit = 0

			for(var i = 0; i < 365; i++){

				var qr = 0

				var temp = []
				var _temp = []

				for(var c = 0; c < columns.length; c++){
					temp.push(columns[c].columns[i])
					qr += columns[c].columns[i]
				}

				for(var v = 0; v < temp.length; v ++){
					var t = temp[v] / qr * 100

					_temp.push(t) 
				}

				this._stacked.push(_temp)
			}
		}


		this.createStackedLabels = function(){

			var columns = this.columns

			this.totalMaxLimit = 0

			for(var i = 0; i < 365; i++){

				var temp = []

				var top = 0 
				for(var c = 0; c < columns.length; c++){
					top += columns[c].columns[i]
					temp.push(columns[c].columns[i])
				}

				if(top > this.totalMaxLimit){
					this.totalMaxLimit = top
				}

				this._stacked.push(temp)
			}
		}

		this.updateLimits = function(xAxis){

			this.columns = this.columns || []

			this.low = 0
			this.top = -Infinity

			if(type === 'line'){
				this.low = Infinity
			}

			if(stacked){
				for (var c = xAxis.currentDiffLeftPositionIndex; c < xAxis.currentDiffRightPositionIndex; c++) {

					var currentMax = 0
				
					for(var z = 0; z < this._stacked[c].length; z++){
						currentMax += this._stacked[c][z]
					}

					if (currentMax > this.top){
						this.top = currentMax
					}

					if(percentage){
						if(this.top > 100){
							this.top = 100
						}
					}
				}
			}
			else{
				if(y_scaled){

					for(var c = 0; c < this.columns.length; c++){
						var column = this.columns[c].columns;

						var ownOffset = {
							low: Infinity,
							top: -Infinity,
							scale: 0,
							offset: 0,
							previewScale: Infinity,
							previewOffset: -Infinity
						}

						for (var i = xAxis.currentDiffLeftPositionIndex; i < xAxis.currentDiffRightPositionIndex; i++) {

							var y = column[i];

							if (y < ownOffset.low) ownOffset.low = y
							if (y > ownOffset.top) ownOffset.top = y
						}

						var itemsDiff = ownOffset.top - ownOffset.low
						var previewDiff = Math.max.apply(null, column) - Math.min.apply(null, column)

						ownOffset.fontColor = this.columns[c].color

						ownOffset.previewScale = -previewHeight / previewDiff
						ownOffset.previewOffset = HEIGHT - Math.min.apply(null, column) * ownOffset.previewScale

						ownOffset.scale = -(chartHeight - PREVIEW_PT) / itemsDiff
						ownOffset.offset = chartHeight - ownOffset.low * ownOffset.scale

						ownOffset.labelsDelta = Math.floor(itemsDiff / Math.ceil(yLablesOffset))

						this.ownScales[c] = ownOffset
					}
				}

				for (var c = 0; c < this.columns.length; c++) {

					var column = this.columns[c].columns;

					for (var i = xAxis.currentDiffLeftPositionIndex; i < xAxis.currentDiffRightPositionIndex; i++) {
						var y = column[i];

						if (y < this.low) this.low = y;
						if (y > this.top) this.top = y;
					}
				}
			}

			var itemsDiff = this.top - this.low

			if(itemsDiff !== this.itemsDiff){
				var animation = new Animation(this.itemsDiff, itemsDiff, 300, performance.now())

				if(this.textAnimation){
					// this.textAnimation.update(itemsDiff)
				}
				else{

					this.prevS = this.itemsDiff
					if(itemsDiff > this.itemsDiff){
						this.textAnimation = new Animation(0, -60, 400, performance.now())
					}else{
						this.textAnimation = new Animation(0, 60, 400, performance.now())
					}
				}


				this.animation = animation
			}

			var previewDiff = this.totalMaxLimit - this.totalMinLimit

			this.mapScale = -previewHeight / previewDiff
			this.mapOffset = HEIGHT - this.totalMinLimit * this.mapScale


		}


		this.render = function(){
			ctx.fillStyle = "#8E8E93"



			if(this.animation){

				var d = this.animation.animate(appTime || 0)

				if(d === false){
					this.animation = null
				}else
				{
					this.itemsDiff = d
				}
				
				didUpdate = true
			}

			if(this.textAnimation){
				if(this.textAnimation){
					var d = this.textAnimation.animate(appTime || 0)
				}

				if(d === false){
					this.textAnimation = null
				}
				
				didUpdate = true
			}

			if(this.textAnimation){
				this.yTextDelta =  Math.floor(this.prevS / Math.ceil(yLablesOffset));
			}
			else{
				this.yTextDelta =  Math.floor(this.itemsDiff / Math.ceil(yLablesOffset));
			}

			this.scale = -(chartHeight - PREVIEW_PT) / this.itemsDiff;
			this.offset = chartHeight - this.low * this.scale;

			for (var i = 0; i < yLablesOffset + 2; i++) {

				if(y_scaled){

					var left = this.ownScales[0]
					var right = this.ownScales[1]

					if(left){
						var value = left.low + left.labelsDelta * i
						var y = timeStampToPX(value, left.scale, left.offset)
						ctx.fillStyle = left.fontColor

						ctx.fillText(formatNumber(value, true), 0, y - Y_LABELS_BP);
					}
					if(right){
						var value = right.low + right.labelsDelta * i
						var y = timeStampToPX(value, right.scale, right.offset)

						ctx.fillStyle = right.fontColor

						ctx.fillText(formatNumber(value, true), WIDTH - Y_LABELS_RP, y - Y_LABELS_BP);
					}
				}
				else{
					var value = this.low + this.yTextDelta * i;
					var y = timeStampToPX(value, this.scale, this.offset);

					if(this.textAnimation && value !== 0){
						y += this.textAnimation.value

						if(y > chartHeight){
							continue
						}
					}

					ctx.fillText(formatNumber(value, true), 0, y - Y_LABELS_BP);

				}
			}

			ctx.lineWidth = 1
			ctx.strokeStyle = '#182D3B'
			ctx.globalAlpha = 0.1

			for (var i = 0; i < yLablesOffset + 2; i++) {
				var value = this.low + this.yTextDelta * i;

				var y = timeStampToPX(value, this.scale, this.offset);

				if(this.textAnimation && y !== 0){
					y += this.textAnimation.value

					if(y > chartHeight){
						continue
					}
				}

				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(WIDTH, y);
				ctx.stroke();
			}
		}

		function formatNumber(n, short) {
			var abs = Math.abs(n);
			if (abs > 1000000000 && short) return (n / 1000000000).toFixed(2) + 'B';
			if (abs > 1000000 && short) return (n / 1000000).toFixed(2) + 'M';
			if (abs > 1000 && short) return (n / 1000).toFixed(1) + 'K';

			if (abs > 1) {
				var s = abs.toFixed(0);
				var formatted = n < 0 ? '-' : '';
				for (var i = 0; i < s.length; i++) {
					formatted += s.charAt(i);
					if ((s.length - 1 - i) % 3 === 0) formatted += ' ';
				}
				return formatted;
			}

			return n.toString()
		}
	}

	function AxisX(){

		this.labels = []
		this.fontColor = "#8E8E93"
		this.opacity = 0

		this.textWidth = 30 * dpx

		this.leftAbsoluteTsLimit = 1
		this.rightAbsoluteTsLimit = Infinity
		this.tsAbsoluteDifference = Infinity
		this.stepTsDiff = 1
		this.scaleRatio = 1
		this.offset = 1

		this.currentLeftPositionPx = 1
		this.currentRightPositionPx = Infinity

		this.currentDiff = 1
		this.currentDiffScale = 1
		this.currentDiffOffset = 1
		this.currentDiffLeftPositionIndex = 1
		this.currentDiffRightPositionIndex = Infinity

		this.hovered = null
		this.hoveredInPX = null

		this.setCurrentDiff = function(left, right){

			left = pxToTs(left, this.scaleRatio, this.offset)
			right = pxToTs(right, this.scaleRatio, this.offset)

			this.currentDiff = right - left

			if(type === 'line'){
				this.currentDiffScale = WIDTH / this.currentDiff
			}
			else{
				this.currentDiffScale = WIDTH / (this.currentDiff + this.stepTsDiff)
			}
			
			this.currentDiffOffset = -left * this.currentDiffScale
			this.currentDiffLeftPositionIndex = Math.floor((left - this.leftAbsoluteTsLimit) / this.stepTsDiff)

			this.currentDiffRightPositionIndex = Math.ceil((right - this.leftAbsoluteTsLimit) / this.stepTsDiff) + 1

		}

		this.setScaleRatio = function(){

			this.scaleRatio = WIDTH / this.tsAbsoluteDifference

			this.setOffset()
		}

		this.onDrag = function(newLeftPositionInPx){

			var currentRange = this.currentRightPositionPx - this.currentLeftPositionPx

			if(newLeftPositionInPx <= 0){
				this.currentLeftPositionPx = 0
				this.currentRightPositionPx = currentRange
			}
			else if(newLeftPositionInPx + currentRange >= WIDTH){
				this.currentLeftPositionPx = WIDTH - currentRange
				this.currentRightPositionPx = WIDTH
			}
			else{
				this.currentLeftPositionPx = newLeftPositionInPx
				this.currentRightPositionPx = newLeftPositionInPx + currentRange
			}


			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.zoomLeft = function(newLeftPositionInPx){
			if(newLeftPositionInPx <= 0){
				this.currentLeftPositionPx = 0	
			}
			else if(newLeftPositionInPx > this.currentRightPositionPx - 40){
				this.currentLeftPositionPx = this.currentRightPositionPx - 40
			}
			else{
				this.currentLeftPositionPx = newLeftPositionInPx
			}

			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.zoomRight = function(newLeftPositionInPx){
			if(newLeftPositionInPx >= WIDTH){
				this.currentRightPositionPx = WIDTH
			}
			else if(newLeftPositionInPx < this.currentLeftPositionPx + 40){
				this.currentRightPositionPx = this.currentLeftPositionPx + 40
			}
			else{
				this.currentRightPositionPx = newLeftPositionInPx
			}

			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.setCurrentPositionsWithTs = function(left, right){

			var __left = timeStampToPX(left, this.scaleRatio, this.offset)
			var __right = timeStampToPX(right, this.scaleRatio, this.offset)

			this.currentLeftPositionPx = __left

			this.currentRightPositionPx = __right

			return { left: __left, right: __right }
		}

		this.setOffset = function(scale){
			this.offset = -this.leftAbsoluteTsLimit * this.scaleRatio
		}

		this.resize = function(){
			this.setDifference()
		}

		this.setDifference = function(labels){

			labels = labels || this.labels

			this.labels = labels
			
			this.leftAbsoluteTsLimit = labels[0]
			this.rightAbsoluteTsLimit = labels[labels.length - 1]
			this.tsAbsoluteDifference = labels[labels.length - 1] - labels[0]
			this.stepTsDiff = labels[1] - labels[0]

			this.setScaleRatio()

			var currentPosition = this.setCurrentPositionsWithTs(this.rightAbsoluteTsLimit - this.tsAbsoluteDifference / 3, this.rightAbsoluteTsLimit)

			this.setCurrentDiff(currentPosition.left, currentPosition.right)
		}

		this.setHovered = function(currentInPx){
			if(!currentInPx){
				this.hovered = null
				this.hoveredInPX = null
			}

			this.hoveredInPX = currentInPx
			this.hovered = Math.floor(pxToTs(currentInPx, this.scaleRatio, this.offset))
		}

		this.render = function(ctx){

			ctx.fillStyle = "#8E8E93"
			ctx.globalAlpha = 1

			var count = Math.max(1, Math.floor(WIDTH / (this.textWidth * 2)));
			var delta = this.currentDiff / this.stepTsDiff / count;

			var step = 1;

			while (step <= delta){
				step *= 2
			}

			for (var i = this.labels.length - 1; i >= 0; i -= step) {

				var item = this.labels[i]

				var leftOffset = timeStampToPX(item, this.currentDiffScale, this.currentDiffOffset)

				if(i === this.labels.length - 1){
					ctx.fillText(formatDate(this.labels[i], true), leftOffset - 32, chartHeight + X_TEXT_PT);
				}
				else{
					ctx.fillText(formatDate(this.labels[i], true), leftOffset, chartHeight + X_TEXT_PT);
				}

			}

			if(this.hovered){
				// ctx.lineWidth = 1
				// ctx.strokeStyle = '#182D3B'
				// ctx.globalAlpha = 0.2
				// ctx.beginPath();
				// ctx.moveTo(this.hoveredInPX, 0);
				// ctx.lineTo(this.hoveredInPX, this.height);
				// ctx.stroke();
			}
		}

		var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		function formatDate(time, short) {
			var date = new Date(time);
			var s = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();
			if (short) return s;
			return DAY_NAMES[date.getDay()] + ', ' + s;
		}

	}

	function Animation(value, toValue, duration, startTime){

		this.value = value
		this.duration = duration
		this.start = startTime
		this.fromValue = value
		this.toValue = toValue

		this.animate = function(appTime){

			if(this.toValue === this.value){
				return false
			}

	        var progress = (appTime - this.start) / this.duration;
	        if (progress < 0) progress = 0;
	        if (progress > 1) progress = 1;

	        var ease = -progress * (progress - 2);

	        this.value = this.fromValue + (this.toValue - this.fromValue) * ease;

	        return this.value
		}

		this.update = function(toValue){
			this.toValue = toValue
		}
	}

	function timeStampToPX(ts, scale, offset) {
		return ts * scale + offset
	}

	function pxToTs(px, scale, offset) {
		return (px - offset) / scale
	}
}

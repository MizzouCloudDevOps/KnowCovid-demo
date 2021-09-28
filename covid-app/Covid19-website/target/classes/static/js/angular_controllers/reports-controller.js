app.controller('reports-controller',function($scope,$location, mainService, $routeParams,recSystemService){

	$scope.getGeneDict = function(){
	
		mainService.callPostRestAPI("reports/doAnalysisGenes/").then(function (data) {
			console.log(data);
			$scope.geneDict = data;
			
			var geneNumMap = {};
			
			for(key in data){
				var len = data[key].length;
				if(geneNumMap.has(len)){
					geneNumMap[len].push(key);
				}else{
					geneNumMap[len] = [key];
				}
			}
			
			var keys_genes = Object.keys(geneNumMap).sort();
		});
		
	}
	
	$scope.getDrugDict = function(){
	
		mainService.callPostRestAPI("reports/doAnalysisDrugs/").then(function (data) {
			console.log(data);
			$scope.geneDict = data;
			
			var drugNumMap = {};
			
			for(key in data){
				var len = data[key].length;
				if(drugNumMap.has(len)){
					drugNumMap[len].push(key);
				}else{
					drugNumMap[len] = [key];
				}
			}
			
			var keys_drugs = Object.keys(drugNumMap).sort();
		});
		
	}
	
	$scope.getGeneDict();
	$scope.getDrugDict();
	$scope.orderNum = [1,2,3,4,5,6,7,8,9,10];
});
app.controller('reports-charts-controller',function($scope,$location, mainService, $routeParams,recSystemService){

	$scope.goBarChart = function(dataArr){
            // 声明所需变量
            var canvas,ctx;
            // 图表属性
            var cWidth, cHeight, cMargin, cSpace;
            var originX, originY;
            // 柱状图属性
            var bMargin, tobalBars, bWidth, maxValue;
            var totalYNomber;
            var gradient;

            // 运动相关变量
            var ctr, numctr, speed;
            //鼠标移动
            var mousePosition = {};

            // 获得canvas上下文
            canvas = document.getElementById("barChart");
            if(canvas && canvas.getContext){
                ctx = canvas.getContext("2d");
            }
            
            initChart(); // 图表初始化
            drawLineLabelMarkers(); // 绘制图表轴、标签和标记
            drawBarAnimate(); // 绘制柱状图的动画
            //检测鼠标移动
            var mouseTimer = null;
            canvas.addEventListener("mousemove",function(e){
                e = e || window.event;
                if( e.layerX || e.layerX==0 ){
                    mousePosition.x = e.layerX;
                    mousePosition.y = e.layerY;
                }else if( e.offsetX || e.offsetX==0 ){
                    mousePosition.x = e.offsetX;
                    mousePosition.y = e.offsetY;
                }
                
                clearTimeout(mouseTimer);
                mouseTimer = setTimeout(function(){
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    drawLineLabelMarkers();
                    drawBarAnimate(true);
                },10);
            });

            //点击刷新图表
            canvas.onclick = function(){
                initChart(); // 图表初始化
                drawLineLabelMarkers(); // 绘制图表轴、标签和标记
                drawBarAnimate(); // 绘制折线图的动画
            };


            // 图表初始化
            function initChart(){
                // 图表信息
                cMargin = 30;
                cSpace = 60;
                cHeight = canvas.height - cMargin*2 - cSpace;
                cWidth = canvas.width - cMargin*2 - cSpace;
                originX = cMargin + cSpace;
                originY = cMargin + cHeight;

                // 柱状图信息
                bMargin = 15;
                tobalBars = dataArr.length;
                bWidth = parseInt( cWidth/tobalBars - bMargin );
                maxValue = 0;
                for(var i=0; i<dataArr.length; i++){
                    var barVal = parseInt( dataArr[i][1] );
                    if( barVal > maxValue ){
                        maxValue = barVal;
                    }
                }
                maxValue += 50;
                totalYNomber = 10;
                // 运动相关
                ctr = 1;
                numctr = 100;
                speed = 10;

                //柱状图渐变色
                gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'green');
                gradient.addColorStop(1, 'rgba(67,203,36,1)');

            }

            // 绘制图表轴、标签和标记
            function drawLineLabelMarkers(){
                ctx.translate(0.5,0.5);  // 当只绘制1像素的线的时候，坐标点需要偏移，这样才能画出1像素实线
                ctx.font = "12px Arial";
                ctx.lineWidth = 1;
                ctx.fillStyle = "#000";
                ctx.strokeStyle = "#000";
                // y轴
                drawLine(originX, originY, originX, cMargin);
                // x轴
                drawLine(originX, originY, originX+cWidth, originY);

                // 绘制标记
                drawMarkers();
                ctx.translate(-0.5,-0.5);  // 还原位置
            }

            // 画线的方法
            function drawLine(x, y, X, Y){
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(X, Y);
                ctx.stroke();
                ctx.closePath();
            }

            // 绘制标记
            function drawMarkers(){
                ctx.strokeStyle = "#E0E0E0";
                // 绘制 y
                var oneVal = parseInt(maxValue/totalYNomber);
                ctx.textAlign = "right";
                for(var i=0; i<=totalYNomber; i++){
                    var markerVal =  i*oneVal;
                    var xMarker = originX-5;
                    var yMarker = parseInt( cHeight*(1-markerVal/maxValue) ) + cMargin;
                    //console.log(xMarker, yMarker+3,markerVal/maxValue,originY);
                    ctx.fillText(markerVal, xMarker, yMarker+3, cSpace); // 文字
                    if(i>0){
                        drawLine(originX, yMarker, originX+cWidth, yMarker);
                    }
                }
                // 绘制 x
                ctx.textAlign = "center";
                for(var i=0; i<tobalBars; i++){
                    var markerVal = dataArr[i][0];
                    var xMarker = parseInt( originX+cWidth*(i/tobalBars)+bMargin+bWidth/2 );
                    var yMarker = originY+15;
                    ctx.fillText(markerVal, xMarker, yMarker, cSpace); // 文字
                }
                // 绘制标题 y
                ctx.save();
                ctx.rotate(-Math.PI/2);
                ctx.fillText("Numbers", -canvas.height/2, cSpace-10);
                ctx.restore();
                // 绘制标题 x
                ctx.fillText("Topics", originX+cWidth/2, originY+cSpace/2+10);
            };

            //绘制柱形图
            function drawBarAnimate(mouseMove){
                for(var i=0; i<tobalBars; i++){
                    var oneVal = parseInt(maxValue/totalYNomber);
                    var barVal = dataArr[i][1];
                    var barH = parseInt( cHeight*barVal/maxValue * ctr/numctr );
                    var y = originY - barH;
                    var x = originX + (bWidth+bMargin)*i + bMargin;
                    drawRect( x, y, bWidth, barH, mouseMove );  //高度减一避免盖住x轴
                    ctx.fillText(parseInt(barVal*ctr/numctr), x+15, y-8); // 文字
                }
                if(ctr<numctr){
                    ctr++;
                    setTimeout(function(){
                        ctx.clearRect(0,0,canvas.width, canvas.height);
                        drawLineLabelMarkers();
                        drawBarAnimate();
                    }, speed);
                }
            }

            //绘制方块
            function drawRect( x, y, X, Y, mouseMove ){

                ctx.beginPath();
                ctx.rect( x, y, X, Y );
                if(mouseMove && ctx.isPointInPath(mousePosition.x, mousePosition.y)){ //如果是鼠标移动的到柱状图上，重新绘制图表
                    ctx.fillStyle = "green";
                }else{
                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = gradient;
                }
                ctx.fill();
                ctx.closePath();

            }


        }
   $scope.goBarChart(
                [["Covid", 750], ["Patients", 725], ["Sars", 701], ["Coronavirus", 689], ["Infection", 678], ["Health", 660], ["Virus", 650], ["Clinical", 645], ["World", 500], ["Disease",489]]
        )
});
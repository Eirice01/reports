var mapDrawFunctionInit = function () {
	var newMap;
	var deletecallback;
	var numberCalculate=1;
	var drawMapname ="区域";
	var geoJson='{"type":"Feature","properties":{"layerId":"89ffb234-853b-a973-a6e6-eba748ad","id":"50111","x":106.50673,"y":29.59145,"address":"重庆市江北区龙溪镇松石路建峰化工厂","coorsys":"wgs84","desc":"","type":"cgi","name":"两江新区建峰化工厂EG1-1"},"geometry":{"type":"Point","coordinates":[106.50673,29.59145]}}';
	var callback;
	var callbackForForm;
	var tRouteObject;
	var funForCollide;
	var callbackForEsData;
	var jsonobj ="";
	var drawFeatures =[];
	var drawFeaturesWithId ={};
	var drawFeaturesWithoutLine=[];
	var leftNvgDiv = null;//工具栏
	var featureJsonsWithId={}; //保存地图画区域的json数据
	var extendWithOther = null;
	var areaIntersection=null;//区域碰撞回调方法
	var spaceTimeSearch =null;//时空搜索回调方法
	var featuresForCtrlSelects = [];
	 var esQureyObject= null //es 查询对象
	var callBackForFun =null;//右键菜单的回调函数
	var callbackForEsDataDetail =null;//获取ES详细数据
	var callbackForEsDataSumarize =null;
	var clearFeatureWithId = function(){
		drawFeaturesWithId ={};

	};
	var featureHtmlObject={};
	var htmlForFeatureInfo = {};
	var featureStyle={}//用来存储画区域时的styele值
	var mapDivId ="";
	var tempZoom=0;
//	var singleClick = null;


	//聚类与撒点切换start
	var callbackForCluster = function(option){

		var styleFunction = function (feature) {
		    return new com.jiusuo.map.style.TStyle({
		        image: new com.jiusuo.map.style.TIcon({
		            anchor: [0.5, 1],
		            src: feature.get('icon') || com.jiusuo.map.webUrl+'/data/icon.png'
		        })
		    });
		};

		var clusterLayerList=com.jiusuo.map.tMap.getClusterLayers();
		var map=com.jiusuo.map.tMap.getOMap();
		var zoom=map.getView().getZoom();

		if(clusterLayerList.getLength()>0){
		    if(zoom>17&&tempZoom<18){
		        clusterLayerList.forEach(function (item) {
		            item.getVectorLayer().setSource(item.getVectorLayer().getSource().getSource());
		            item.getVectorLayer().setStyle(styleFunction);
		        })
		        tempZoom=zoom;
		    }else if(zoom<18&&tempZoom>17){
		        clusterLayerList.forEach(function (item) {
		            var source=item.getVectorLayer().getSource();
		            var distance=item.distance;
		            var clusterStyle=item.styleFunction;
		            var clusterSource=new ol.source.Cluster({
		                source:source,
		                distance:distance
		            })
		            item.getVectorLayer().setSource(clusterSource);
		            item.getVectorLayer().setStyle(clusterStyle);
		        })
		        tempZoom=zoom;
		    }
		}




	};
	//end

	//featuresForCtrlSelects数组去重算法start
	var uniqueArrays = function(datas){
		var res =[];
		var json = {};
		for(var i=0;i<datas.length;i++){
			if(!json[datas[i].properties.id]){
				res.push(datas[i]);
				json[datas[i].properties.id]=1;
			}
		}

		return res;
	};

	//end

	//判断featuresForCtrlSelects是否存在相应feature start
	var checkFeaturesForCtrlSelects = function(id){
		var flag =false;
		featuresForCtrlSelects.forEach(function(featuresForCtrlSelect){
			if(featuresForCtrlSelect.properties.id==id){
				flag =true;
			}
		});
		return flag;
	};
	//end

       //删除features数组对应的值
       var removeFeatureDatas = function(datas,id){
       	datas.forEach(function(data,i){
       		if(!data){return;}
       		if(data.properties.id==id){
       			datas.splice(i,1);
       			}
       		});

       	}

       //根据id获取feature start
       var getFeatureById=function(id){
    	   var tempFeature = null;
    	   drawFeatures.forEach(function(feature){
    		   if(id==feature.getId()){
    			   tempFeature = feature;
    		   }
    	   });

    	   return tempFeature;
       };
       //end

       	 var removeFeatureObjectDatas = function(datas,id){
       	datas.forEach(function(data,i){
       		if(data.getId()==id){
       			datas.splice(i,1);
       			}
       		});

       	}

	var projectionCode="";

	var recoverSelectPoly =function(featuresForCtrlSelects){
		var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();

		featuresForCtrlSelects.forEach(function(featureJson){
			var id =featureJson.properties.id;
			if (id) {
				var feature = source.getFeatureById(id);
				if(feature){
					feature.setStyle(featureStyle[id]);
					}

			}

			});
		};
	//end

	// 删除ctrl键选择的区域，并恢复区域状态  当点击地图空白区域时，会触发改事件start
	var removeCtrlSelects = function(){
		var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();

		var selectSingleClick = com.jiusuo.map.tMap.currentInteraction.get("addFeaturesWithCtrlKey");
 	        selectSingleClick.getFeatures().clear();

			featuresForCtrlSelects.forEach(function(featuresForCtrlSelect){
				var id = featuresForCtrlSelect.properties.id;
				if (id) {
				var feature = source.getFeatureById(id);
				if(feature){
					feature.setStyle(featureStyle[id]);
					}

			  }

				});

				featuresForCtrlSelects= [];
				featureStyle={};
		};
	//end



	//ctrl键返选时，删除相关数组，并恢复区域状态
	var callbackForDeSelectFeatures = function(feature,style){
		    feature.setStyle(featureStyle[feature.getId()]);

		    removeFeatureDatas(featuresForCtrlSelects,feature.getId())

	};


	//按alt键选择区域时的回调函数start
	var callbackForSelectFeatures = function(feature,style){

		var id=feature.getId();
		featureStyle[id]= style;
		var featureJson = featureJsonsWithId[id];
		if(featureJson){
			featuresForCtrlSelects.push(featureJson);
		}
	};
	//end

	//面初始化样式
	var initDrawPolyStye = function(){
		var style = new com.jiusuo.map.style.TStyle({
	        fill: new com.jiusuo.map.style.TFill({
	        	  color:  'rgba(53, 196, 75,0.6)',
	        }),
	        stroke: new com.jiusuo.map.style.TStroke({
	            color: 'rgba(255, 255, 255,1.5)',
	            lineDash: [10, 10],
	            width: 1
	        }),
		  image: new com.jiusuo.map.style.TCircle({
	            radius: 5,
	            stroke: new com.jiusuo.map.style.TStroke({
	                color: 'rgba(0, 0, 0, 0.7)'
	            }),
	            fill: new com.jiusuo.map.style.TFill({
	                color: 'rgba(255, 0, 0, 0.2)'
	            })
	        })
	    });

		return style;
	};

	var initDrawLineStye = function(){
		var style = new com.jiusuo.map.style.TStyle({
	        fill: new com.jiusuo.map.style.TFill({
	            color: 'rgba(53, 196, 75,0.6)',
	        }),
	        stroke: new com.jiusuo.map.style.TStroke({
	            color: 'rgba(255, 255, 255,1)',
	            width: 1
	        }),
	        image: new com.jiusuo.map.style.TCircle({
	            radius: 5,
	            stroke: new com.jiusuo.map.style.TStroke({
	                color: 'rgba(0, 0, 0, 0.7)'
	            }),
	            fill: new com.jiusuo.map.style.TFill({
	                color: 'rgba(255, 0, 0, 0.2)'
	            })
	        })
	    });

		return style;
	};

	var initDrawStyle = function(text){
		var defaultname = drawMapname+numberCalculate;
		var name="";
		if(text==""||text==null){
			name = defaultname;
		}else{
			name = text;
		}
		var style = new com.jiusuo.map.style.TStyle({
	        fill: new com.jiusuo.map.style.TFill({
	        	  color: 'rgba(53, 196, 75,0.6)',
	        }),
	        stroke: new com.jiusuo.map.style.TStroke({
	            color: 'rgba(255, 255, 255,1)',
	            width:2
	        }),
	        image: new com.jiusuo.map.style.TCircle({
	            radius: 5,
	            stroke: new com.jiusuo.map.style.TStroke({
	                color: 'rgba(255, 0, 0, 0.7)'
	            }),
	            fill: new com.jiusuo.map.style.TFill({
	                color: 'rgba(255, 255, 0, 0.8)'
	            })
	        }),
	        text:new com.jiusuo.map.style.TText({
	            text:name,
	            font:'20px sans-serif',
	            fill: new com.jiusuo.map.style.TFill({
		        	  color: 'rgba(255, 0, 0, 0.6)',
		        }),
		        stroke: new com.jiusuo.map.style.TStroke({color: 'red', width: 1})

	        }),

	    });

		return style;
	};

	var assembleFeatureJson = function(feature,area,id){
		var featureJson = {};
		var properties = {};
		var projectionCode=com.jiusuo.map.tMap.getProjection().getCode();
		//var coordinates =feature.getGeometry().getCoordinates();
	/*	if (tMap.getProjection().getCode() == 'EPSG:3857') {
	         coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
	         coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
	    }

		*/

	    featureJson = com.jiusuo.map.TGeometryUtils.toFeatureJsonString(feature.getGeometry());


	    properties.id=id;
	    properties.layerId = "";
	    properties.area = area;
	    properties.name =drawMapname+numberCalculate;
	    var style =feature.getStyle();
	    if(style){
	    	properties.color=style.getFill().getColor();
	    	}

	    featureJson.properties = properties;
		return featureJson;
	}

	//监听地图图层变化的回调函数start
	var getMapZoomChange = function(option){
		if(option){
			var zoom = option.map.getView().getZoom();
			var baseValue =16;
			var value =Math.pow(2,zoom-14);
			if(zoom>13){
				value =1;
			}else{
				value =Math.pow(2,zoom-14);
			}

			if(value<=0.5){
				value =0.5;
			}
			drawFeatures.forEach(function(feature){
				var style = feature.getStyle();
				if(style){
					var text = style.getText();
					text.setScale(value);
					style["j"]=text;
				}
				feature.setStyle(style);
			});
		}

	};
	//end


	//画区域时的回调函数 start
	var drawEndFunction = function(evt){
	    com.jiusuo.map.tMap.removeCurrentInteraction('draw');
	    var style = initDrawStyle();
	    var textName =style.getText().getText();
	    evt.feature.setStyle(style);
	    var feature =evt.feature;
	    feature.set("name",textName);
	    var id =com.jiusuo.map.TUtils.createGUID();
	    feature.setId(id);
	   var drawFeaturesWitId = [];
	    drawFeatures.push(feature);
	    drawFeaturesWithoutLine.push(feature);
	    var geom = evt.feature.getGeometry();
	    projectionCode = com.jiusuo.map.tMap.getProjection().getCode();
	    if(projectionCode!="EPSG:3857"){
	    	 geom=com.jiusuo.map.TGeometryUtils.geomtransform(geom,"EPSG:4326","EPSG:3857");
	    }

	    var area = getMapArea(geom,feature);
	    //=begin= 处理面积超过限制则返回空串供业务判断使用。modified by lanp 2016-12-7 11:12:13
		if(!area) {
			callback("");
		} else {
			var featureJson = assembleFeatureJson(feature,area,id);
		    drawFeaturesWitId.push(featureJson);
		    callback(JSON.stringify(drawFeaturesWitId));
		    featureJsonsWithId[id]=featureJson;
		    numberCalculate++;
		    //fitTheMap(feature);
		    disableDoubleClick();
		}
		//=end=
	};
    //画区域时的回调函数 start
    var drawEndFunctionForForm = function(evt){
        newMap.removeCurrentInteraction('draw');
        var style = initDrawStyle();
        var textName =style.getText().getText();
        evt.feature.setStyle(style);
        var feature =evt.feature;
        feature.set("name",textName);
        var id =com.jiusuo.map.TUtils.createGUID();
        feature.setId(id);
        var drawFeaturesWitId = [];
        drawFeatures.push(feature);
        drawFeaturesWithoutLine.push(feature);
        var geom = evt.feature.getGeometry();
        projectionCode = newMap.getProjection().getCode();
        if(projectionCode!="EPSG:3857"){
            geom=com.jiusuo.map.TGeometryUtils.geomtransform(geom,"EPSG:4326","EPSG:3857");
        }

        var area = getMapArea(geom,feature);
        //=begin= 处理面积超过限制则返回空串供业务判断使用。modified by lanp 2016-12-7 11:12:13
        if(!area) {
            callbackForForm("");
        } else {
            var featureJson = assembleFeatureJson(feature,area,id);
            drawFeaturesWitId.push(featureJson);
            callbackForForm(JSON.stringify(drawFeaturesWitId));
            featureJsonsWithId[id]=featureJson;
            numberCalculate++;
            //fitTheMap(feature);
            disableDoubleClick();
        }
        //=end=
    };

	//基站分析画区域时的回调函数 start
	var drawEndFunction4bs = function(evt){
	    com.jiusuo.map.tMap.removeCurrentInteraction('draw');
	    var style = initDrawStyle();
	    var textName =style.getText().getText();
	    evt.feature.setStyle(style);
	    var feature =evt.feature;
	    feature.set("name",textName);
	    var id =com.jiusuo.map.TUtils.createGUID();
	    feature.setId(id);
	   var drawFeaturesWitId = [];
	    drawFeatures.push(feature);
	    drawFeaturesWithoutLine.push(feature);
	    var geom = evt.feature.getGeometry();
	    projectionCode = com.jiusuo.map.tMap.getProjection().getCode();
	    if(projectionCode!="EPSG:3857"){
	    	 geom=com.jiusuo.map.TGeometryUtils.geomtransform(geom,"EPSG:4326","EPSG:3857");
	    }

	    var area = getMapArea(geom,feature);
	    //=begin= 处理面积超过限制则返回空串供业务判断使用。modified by lanp 2016-12-7 11:12:13
		if(!area) {
			callback("");
		} else {
			var featureJson = assembleFeatureJson(feature,area,id);
		    drawFeaturesWitId.push(featureJson);
		    callback(JSON.stringify(drawFeaturesWitId));
		    featureJsonsWithId[id]=featureJson;
		    numberCalculate++;
		    //fitTheMap(feature);
		    disableDoubleClick();
		}
		//=end=
	};

	var disableDoubleClick = function(){
		 com.jiusuo.map.tMap.disableDoubleClickZoom();
		  setTimeout(function () {
		      com.jiusuo.map.tMap.enableDoubleClickZoom();
		  },1000);
	};


	//根据提供的featureJsons,对地图进行自适应
	var featureJsonsToFitTheMap =function(featureJsons){
		extendWithOther =null;
		 var featureObjects = JSON.parse(featureJsons);
		 featureObjects.forEach(function(featureObject){
			 fitTheMap(featureObject);
		 });
	};

	var fitTheMap = function(feature){
		    var extent =feature.getGeometry().getExtent();
		    if(extendWithOther==null){
		    	extendWithOther = ol.extent.extend(extent, extent);
		    }else{
		    	extendWithOther = ol.extent.extend(extendWithOther, extent);
		    }
		    var map;
		    if(newMap){
		    	map=newMap.getOMap();
		    }else{
		    	map=com.jiusuo.map.tMap.getOMap();
		    }

		     var view=map.getView();
		     var size=map.getSize();
		     size[0]=size[0]*0.9;
		     size[1]=size[1]*0.9;
		     map.updateSize(size);
		     view.fit(extendWithOther,size);
	};

	var drawStartFunction = function(evt){

	};

	//获取图形面积
	var getMapArea = function(geom,feature){
		var area = "";
		switch(geom.getType()){
 	    case"Circle":
 	    	area = geom.getRadius()*geom.getRadius()*Math.PI;
 	    	area = area/1000000
 	    	if(area>50000){
 	    		alert("面积不能大于50KM²，请重新操作！");
 	    		removeFeatureFromMap(feature);
 	    		return false;
 	    	}
 	    	break;
 	    case"Polygon":
 	    	area = geom.getArea()/1000000;
 	    	if(area>50000){
 	    		alert("面积不能大于50KM²，请重新操作！");
 	    		removeFeatureFromMap(feature);
 	    		return false;
 	    	}
 	    	break;
 	    case"LineString":
 	    	area = geom.getLength()/1000;
 	    	if(area>50000){
 	    		alert("长度不能大于50KM²，请重新操作！");
 	    		removeFeatureFromMap(feature);
 	    		return false;
 	    	}
 	    	break;
 	    }

		return area+" KM²";
	};

	//
	var removeFeatureFromMap = function(feature){
 		var features =[];
 		features.push(feature);
 		setTimeout(function(){
 			if(newMap){
 				newMap.removeFeatures(null,features);
 			}else{
 				com.jiusuo.map.tMap.removeFeatures(null,features);
 			}
 			},0.1);
 		return;
	};


	var drawEndFunctionForLine = function(evt){
		var featuresWithStyle= []; //存储被线选择的区域数组
		var featureWithStyle = {}; //存储被选择区域与对应的样式，方便回滚样式
	com.jiusuo.map.tMap.removeCurrentInteraction('draw');

    var style = initDrawStyle();
    evt.feature.setStyle(style);
    var feature =evt.feature;
    var id =com.jiusuo.map.TUtils.createGUID();
    feature.setId(id);
    drawFeatures.push(feature);
    var geom = evt.feature.getGeometry();
    var pts = geom.getCoordinates();
    var featureSelectedFlag = false;
    var isConnectFlag = false;//表示线段是否用来连接区域，如果是连接区域的，则不返回线段的坐标，如果不是则返回线段的坐标。
   //判断线段是否经过区域集合drawFeatureWithUUIDs所在的范围  start
    setTimeout(function(){
    	 if(drawFeaturesWithoutLine.length >1){
    	    	//画线的时候，把已选区域清空start
    	    	recoverSelectPoly(featuresForCtrlSelects);
    	    	featuresForCtrlSelects =[];
    	    	removeCtrlSelects();
    	    	//end
    	    	var selectSingleClick = com.jiusuo.map.tMap.currentInteraction.get("addFeaturesWithCtrlKey");
    	    	//getJsonDataForCompare= [];
    	    	drawFeaturesWithoutLine.forEach(function(drawFeature){
    	   		pts.forEach(function(pt){
    	   			var type = drawFeature.getGeometry().getType();
    	   			var isInFlag = false;
    	   			if(type =="Circle"){
    	   				isInFlag = com.jiusuo.map.TGeometryUtils.isPointInCircle(pt, drawFeature.getGeometry());
    	   			}else{
    	   				isInFlag = com.jiusuo.map.TGeometryUtils.isPointInPolygon(pt,drawFeature.getGeometry());
    	   			}
    	   			if(isInFlag){
    	   				featureSelectedFlag = true;
    	   				isConnectFlag = true;
    	   			}else{
    	   				featureSelectedFlag = false;
    	   			}
    	   			if(featureSelectedFlag){


    	   			if(!checkFeaturesForCtrlSelects(drawFeature.getId())){
    	   			//线经过该区域，则保存该选中面，并使该区域处于选中状态
        	   			//改变被选中面的style
        	   			 var fill = new com.jiusuo.map.style.TFill({
        	   	            color: ' rgba(11, 55, 230,0.6)'
        	   	         });
        	   	         var stroke = new com.jiusuo.map.style.TStroke({
        	   	            color: 'rgba(255, 255, 255,1)',
        	   	            width: 1
        	   	         });
        	   	        var oldStyle = drawFeature.getStyle();
        	   	        featureStyle[drawFeature.getId()]= oldStyle;
        	   	        var oldText =oldStyle.getText();
        	   	        var styleselect = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke, text: oldText});

        	            featureWithStyle.style =oldStyle;
        	   			featureWithStyle.feature =drawFeature;
        	   			featuresWithStyle.push(featureWithStyle);
        	   			drawFeature.setStyle(styleselect);
        	   		    selectSingleClick.getFeatures().push(drawFeature);

        	   			var geom = evt.feature.getGeometry();
        	   			if(projectionCode!="EPSG:3857"){
        	   	    	 geom=com.jiusuo.map.TGeometryUtils.geomtransform(geom,"EPSG:4326","EPSG:3857");
        	   	        }

        	   		    var area = getMapArea(geom,feature);
        	   			jsonobj =  assembleFeatureJson(drawFeature,area,drawFeature.getId());
        	   			featuresForCtrlSelects.push(jsonobj);
    	   			}



    	   		}
    	   	});

    	   	    });
    	    	//如果被选择的区域小于2 ，则不进行碰撞，也不向调用方发送数据
    	    	if(featuresForCtrlSelects.length>1){
    	    		featuresForCtrlSelects = uniqueArrays(featuresForCtrlSelects);
    	    		funForCollide(JSON.stringify(featuresForCtrlSelects));
    	    	}else{
    	    		featuresWithStyle.forEach(function(featureWithStyle){
    	    			featureWithStyle.feature.setStyle(featureWithStyle.style);
    	    		});

    	    	}

    	    }

    	 //把线段的坐标返回给调用者
    	    if(!isConnectFlag){
    	    	var jsonobjs = [];
    	    	var geom = feature.getGeometry();
    	    	if(projectionCode!="EPSG:3857"){
    		    	 geom=com.jiusuo.map.TGeometryUtils.geomtransform(geom,"EPSG:4326","EPSG:3857");
    		    }
    	    	var area = getMapArea(geom,feature);
    	    	jsonobj = assembleFeatureJson(feature,area,feature.getId());
    	    	featureJsonsWithId[feature.getId()]=jsonobj;
    	    	jsonobjs.push(jsonobj)

    	    	callback(JSON.stringify(jsonobjs));
    	    }

    	    disableDoubleClick();


    	    numberCalculate++;
    },200);



    };

    //画矩形 start
    var addRect =  function(evt){
    	 var style = initDrawPolyStye();
        var tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunction});
        tDraw.DrawHandle("Rectangle");
    };
    //end

    /**
     * 清除地图上自定义的图层
     * @author lanp
     * @since 2016-11-30 09:44:12
     */
    var clearGeoOverlay = function() {
    	var map=com.jiusuo.map.tMap.getOMap();
    	var overlays=map.getOverlays();
    	while(overlays.getLength()>0){
    		map.removeOverlay(overlays.item(0));
    	}
    }

   //清除多边形 start
    var removeFeatures  = function(evt){
    	clearGeoOverlay();
    	if(newMap){
    		newMap.removeFeatures(null,drawFeatures);
    	}else{
    		com.jiusuo.map.tMap.removeFeatures(null,drawFeatures);
    	}

        drawFeatures = [];
        drawFeaturesWithoutLine = [];
        drawFeaturesWithId ={};
        featuresForCtrlSelects =[];
    };
  //end


    //获取随机颜色start
    var getRandomColor = function(){
    	var color = "";
    	var r = Math.round(Math.random()*255);
		var g = Math.round(Math.random()*255);
		var b = Math.round(Math.random()*255);
		color='rgba('+r+', '+g+','+b+',' +'0.6)';
    	return color;
    };
    //end

    var addSprinkleWithoutImag = function(points){
    	var colorMap={};
    	var getRandomColorMap = function(name){
    		if(colorMap[name]!=null&&colorMap[name]!=""){
    			return colorMap[name];
    		}else{
    			var color=getRandomColor;
        		colorMap[name]= color;
        		return color;
    		}
    	};


    	var styleFunction = function (feature) {
    		var color=feature.get('color');
    		 return new com.jiusuo.map.style.TStyle({
    	            image: new com.jiusuo.map.style.TCircle({
    	                radius: 10,
    	                stroke: new com.jiusuo.map.style.TStroke({
    	                    color: 'rgba(255, 0, 0, 0.7)'
    	                }),
    	                fill: new com.jiusuo.map.style.TFill({
    	                    color: color
    	                })
    	            })
    		 });

    	};

         var sprinkle_features = [];
         var callback =null;
         points.forEach(function(feature){
        	 var geometryObject =feature.geometry;
        	 var coordinates = geometryObject.coordinates;
        	 if (tMap.getProjection().getCode() == 'EPSG:3857'){
        		 coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
                 coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
        	 }

         	  var properties = feature.properties;
            	if(drawFeaturesWithId[properties.id]){
                	sprinkle_features.push({
                		'type':'Feature',
                		'geometry':{'type':'Point','coordinates':geometryObject.coordinates},
                		'properties':{
                			color:getRandomColorMap(properties.name),
                			address:properties.address,
                			name:properties.name,


                            icon: iconPhoto,
                            entityObject: dataObject,
                            type: codeData[dataObject.type],
                            address: dataObject.address,
                            name: dataObject.name,
                            coordinate: coordinatesJson,

                		    innerHTML:'<div style="margin-top: 6%;"><p><span>地址：</span><span>{address}</span></p><p><span>名称：</span><span>{name}</span></p></div>',
                		    showFields:[{field:'address',alias:'地址'},{field:'name',alias:'名称'}],
                		callback:callback}});
                	drawFeaturesWithId[properties.id]=feature;
            	}


         });

         var geoJson_sprinkle={
                    'type':'FeatureCollection',
                    'crs':{'type':'name','properties':{'name':'EPSG:4326'}},
                    'features':sprinkle_features};

                sprinkleLayer=new com.jiusuo.map.TSprinkleLayer({geoJson:geoJson_sprinkle});
                sprinkleLayer.setStyle(styleFunction);

            com.jiusuo.map.tMap.addSprinkleLayer(sprinkleLayer);


};

    //添加撒点 start,
  var addSprinkle = function(poins){
            //撒点例示
            var sprinkle_features = [];
            var id ="";
            poins.forEach(function(feature){
            	var geometryObject =feature.geometry;
            	var properties = feature.properties;
            	   id= properties.layerId;

            	// var iconPhoto =  com.jiusuo.map.webUrl+ com.jiusuo.map.tMap.tMapServiceConfig.esService.defaultIcon; //默认图标

                var iconPhoto =com.jiusuo.map.webUrl+ '/static/mark/'+com.jiusuo.map.iconStyle+com.jiusuo.map.tMap.tMapServiceConfig.esService.defaultIcon; //默认图标
            	 var commonSources = com.jiusuo.map.tMap.tMapServiceConfig.esService.commonSources
                 commonSources.forEach(function (querySource) {

                     if(properties.type == querySource.type&&querySource.icon!=null&&querySource.icon!=""){

                         iconPhoto = com.jiusuo.map.webUrl+'/static/mark/'+com.jiusuo.map.iconStyle+querySource.icon;
                     }
                 });


            	sprinkle_features.push({'type':'Feature','geometry':{'type':'Point','coordinates':geometryObject.coordinates},'properties':{icon:iconPhoto,address:properties.address,name:properties.name,innerHTML:'<div style="margin-top: 6%;"><p><span>地址：</span><span>{address}</span></p><p><span>名称：</span><span>{name}</span></p></div>',showFields:[{field:'address',alias:'地址'},{field:'name',alias:'名称'}],callback:null}});
            });


            var geoJson_sprinkle={
                'type':'FeatureCollection',
                'crs':{'type':'name','properties':{'name':'EPSG:4326'}},
                'features':sprinkle_features};
            sprinkleLayer=new com.jiusuo.map.TSprinkleLayer({geoJson:geoJson_sprinkle,id:id});
            com.jiusuo.map.tMap.addSprinkleLayer(sprinkleLayer);
    }
    //end


    //初始化地图工具栏 start
    var initMapTool = function(mapId){
    	//var _points = [[106.48344039916994,29.599571228027344],[106.53905868530275,29.59768295288086],[106.54918670654297,29.57897186279297]];
    	//var _points2 = [[106.53202056884766,29.628753662109375],[106.5725326538086,29.617080688476562],[106.56429290771484,29.594078063964844]];
    	var mapl=new com.jiusuo.map.JiusuoMap(baseMapPath+"/config/MapServiceConfig.xml",mapId);
    	//添加工具栏
    	com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TBaseControl({}));//添加地图工具首先要执行此语句


    	  var style = new com.jiusuo.map.style.TStyle({
              fill: new com.jiusuo.map.style.TFill({
                  color: 'rgba(255, 255, 255, 0.6)'
              }),
              stroke: new com.jiusuo.map.style.TStroke({
                  color: 'rgba(255, 0, 255, 0.2)',
                  lineDash: [10, 10],
                  width: 2
              }),
              image: new com.jiusuo.map.style.TCircle({
                  radius: 5,
                  stroke: new com.jiusuo.map.style.TStroke({
                      color: 'rgba(255, 0, 0, 0.7)'
                  }),
                  fill: new com.jiusuo.map.style.TFill({
                      color: 'rgba(255, 255, 0, 0.8)'
                  })
              })
          });


    	com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoomToExtentControl({tipLabel: '全图',extent:com.jiusuo.map.tMap.getOMap().getView().calculateExtent(com.jiusuo.map.tMap.getOMap().getSize())}));//

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoominControl({zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoomoutControl({zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件


        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMousePosition({projection: 'EPSG:4326',coordinateFormat:ol.coordinate.createStringXY(6)}));//添加显示鼠标坐标控件
        com.jiusuo.map.tMap.addControl(new ol.control.ScaleLine());//添加比例尺控件

        com.jiusuo.map.tMap.addControl(new ol.control.Rotate({tipLabel: '取消旋转'}));//添加属性控件
        com.jiusuo.map.JiusuoMap.setOverViewMap({collapsed:true});//添加鹰眼地图控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureLengthControl({tipLabel: '测量距离',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:null}));//添加测量距离控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureAreaControl({tipLabel: '测量面积',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:null}));//添加测量面积控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TLayerSwapeControl({tipLabel: '图层切换'}));//添加图层切换控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TRemarkControl({tipLabel: '书签'}));//添加书签控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TCenterAtControl({tipLabel: '快速定位'}));//添加书签控件
       var option={}
       option.callback = removeFeatures;
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TClearControl(option));//添加属性控件

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawPointControl({tipLabel:'绘制点',innerHTML:'点',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawLineControl({tipLabel:'绘制线',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForLine}));

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawPolygonControl({tipLabel:'绘制多边形',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawRectControl({tipLabel:'绘制矩形',innerHTML:'矩形',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawCircleControl({tipLabel:'绘制圆',innerHTML:'圆',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
      //添加时空查询菜单
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TSearchControl({tipLabel: '时空查询'}));
        com.jiusuo.map.tMap.addFeaturesWithCtrlKey(callbackForSelectFeatures,callbackForDeSelectFeatures);
      //添加数据图层菜单
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TEsBaseLayerControl({tipLabel: '数据图层'}));
        //添加军标绘制菜单
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TArmyDrawControl({tipLabel:'军标标绘'}));
       projectionCode=com.jiusuo.map.tMap.getProjection().getCode();

       esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(baseMapPath+"/config/"+com.jiusuo.map.tMap.tMapServiceConfig.esService.esDataCode);

       var tGeoGridOCControl = new com.jiusuo.map.TGeoGridOCControl({tipLabel: '网格控制',colorIndex:2,colorAlpha:0.4,isShowNum:false,isRightMenu:false,rightMenuItems:[{name:'网格查询','action':com.jiusuo.map.TGeoGridOCControl.gridQuery},{name:'周边查询','action':com.jiusuo.map.TEpMenu.rightMenuForNearby},{name:'显示邻近基站','action':com.jiusuo.map.TEpMenu.showNearCgis},{name:'显示覆盖范围','action':com.jiusuo.map.TEpMenu.showCgiCoverage},{name:'取消基站操作','action':com.jiusuo.map.TEpMenu.removeCgiCoverage}]});

       com.jiusuo.map.tMap.addControl(tGeoGridOCControl);

       //添加网格调整菜单
       com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TGeoGridADControl({tipLabel: '网格调整'}));
     //添加历史网格菜单
       com.jiusuo.map.tMap.addControl(new com.jiusuo.map.THistoryGeoGridOCControl({tipLabel: '历史网格'}));
       var option={};
       option.callback=getMapZoomChange;
       option.callbackForCluster =callbackForCluster;
       MonitorMapZoom(option);
       initRightMenu();
	   initTimeLineCtr();

	   $('.ditu_index_right .list_first .list_first_img').parents().find('.pop').finish().toggle();
    };


    //初始化地图工具栏 start
    var initDependMapTool = function(mapId){
        var tMapServiceConfig = new com.jiusuo.map.TMapServiceConfig(baseMapPath+"/config/MapServiceConfig.xml");
        //定义唯一的全局变量com.jiusuo.map.tMap
        newMap = new com.jiusuo.map.TMap(mapId,tMapServiceConfig);
        // var mapInit =new com.jiusuo.map.JiusuoMap(baseMapPath+"/config/MapServiceConfig.xml",mapId);

        //添加工具栏
        // com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TBaseControl({}));//添加地图工具首先要执行此语句
        newMap.addControl(new com.jiusuo.map.TBaseControl({tMap:newMap}));//添加地图工具首先要执行此语句

        var style = new com.jiusuo.map.style.TStyle({
            fill: new com.jiusuo.map.style.TFill({
                color: 'rgba(255, 255, 255, 0.6)'
            }),
            stroke: new com.jiusuo.map.style.TStroke({
                color: 'rgba(255, 0, 255, 0.2)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new com.jiusuo.map.style.TCircle({
                radius: 5,
                stroke: new com.jiusuo.map.style.TStroke({
                    color: 'rgba(255, 0, 0, 0.7)'
                }),
                fill: new com.jiusuo.map.style.TFill({
                    color: 'rgba(255, 255, 0, 0.8)'
                })
            })
        });


        // newMap.addControl(new com.jiusuo.map.TZoomToExtentControl({tMap:newMap,tipLabel: '全图',extent:newMap.getOMap().getView().calculateExtent(newMap.getOMap().getSize())}));//
        newMap.addControl(new com.jiusuo.map.TZoominControl({tMap:newMap,zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件
        newMap.addControl(new com.jiusuo.map.TZoomoutControl({tMap:newMap,zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件

        // newMap.addControl(new com.jiusuo.map.TMousePosition({tMap:newMap,projection: 'EPSG:4326',coordinateFormat:ol.coordinate.createStringXY(6)}));//添加显示鼠标坐标控件
        // newMap.addControl(new ol.control.ScaleLine());//添加比例尺控件

//        var option={
//        		tMap:newMap
//        }
//        option.callback = removeFeatures;
//        newMap.addControl(new com.jiusuo.map.TClearControl(option));//添加属性控件
        newMap.addControl(new ol.control.ScaleLine());//添加比例尺控件
        // newMap.addControl(new ol.control.Rotate({tMap:newMap,tipLabel: '取消旋转'}));//添加属性控件
        //com.jiusuo.map.JiusuoMap.setOverViewMap({tMap:newMap,collapsed:true});//添加鹰眼地图控件
        // newMap.addControl(new com.jiusuo.map.TMeasureLengthControl({tMap:newMap,tipLabel: '测量距离',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));//添加测量距离控件
        // newMap.addControl(new com.jiusuo.map.TMeasureAreaControl({tMap:newMap,tipLabel: '测量面积',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));//添加测量面积控件
        // newMap.addControl(new com.jiusuo.map.TLayerSwapeControl({tMap:newMap,tipLabel: '图层切换'}));//添加图层切换控件
        //newMap.addControl(new com.jiusuo.map.TRemarkControl({tMap:newMap,tipLabel: '书签'}));//添加书签控件
        newMap.addControl(new com.jiusuo.map.TCenterAtControl({tMap:newMap,tipLabel: '快速定位'}));//添加书签控件
        // var option={}
        // option.callback = removeFeatures;
        // newMap.addControl(new com.jiusuo.map.TClearControl(option));//添加属性控件
        //newMap.addControl(new com.jiusuo.map.TDrawPointControl({tMap:newMap,tipLabel:'绘制点',innerHTML:'点',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));
        //newMap.addControl(new com.jiusuo.map.TDrawLineControl({tMap:newMap,tipLabel:'绘制线',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForLine}));
        newMap.addControl(new com.jiusuo.map.TDrawPolygonControl({tMap:newMap,tipLabel:'绘制多边形',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));
        newMap.addControl(new com.jiusuo.map.TDrawRectControl({tMap:newMap,tipLabel:'绘制矩形',innerHTML:'矩形',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));
        newMap.addControl(new com.jiusuo.map.TDrawCircleControl({tMap:newMap,tipLabel:'绘制圆',innerHTML:'圆',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForForm}));
        //添加时空查询菜单
        // newMap.addControl(new com.jiusuo.map.TSearchControl({tMap:newMap,tipLabel: '时空查询'}));
        newMap.addFeaturesWithCtrlKey(callbackForSelectFeatures,callbackForDeSelectFeatures);
        //添加数据图层菜单
        // newMap.addControl(new com.jiusuo.map.TEsBaseLayerControl({tMap:newMap,tipLabel: '数据图层'}));
        //添加军标绘制菜单
        // newMap.addControl(new com.jiusuo.map.TArmyDrawControl({tMap:newMap,tipLabel:'军标标绘'}));
        projectionCode=newMap.getProjection().getCode();

        // esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(baseMapPath+"/config/"+newMap.tMapServiceConfig.esService.esDataCode);

        // var tGeoGridOCControl = new com.jiusuo.map.TGeoGridOCControl({tMap:newMap,tipLabel: '网格控制',colorIndex:2,colorAlpha:0.4,isShowNum:false,isRightMenu:false,rightMenuItems:[{name:'网格查询','action':com.jiusuo.map.TGeoGridOCControl.gridQuery},{name:'周边查询','action':com.jiusuo.map.TEpMenu.rightMenuForNearby},{name:'显示邻近基站','action':com.jiusuo.map.TEpMenu.showNearCgis},{name:'显示覆盖范围','action':com.jiusuo.map.TEpMenu.showCgiCoverage},{name:'取消基站操作','action':com.jiusuo.map.TEpMenu.removeCgiCoverage}]});

        // newMap.addControl(tGeoGridOCControl);

        //添加网格调整菜单
        // newMap.addControl(new com.jiusuo.map.TGeoGridADControl({tMap:newMap,tipLabel: '网格调整'}));
        //添加历史网格菜单
        // newMap.addControl(new com.jiusuo.map.THistoryGeoGridOCControl({tMap:newMap,tipLabel: '历史网格'}));
        var option={};
        option.callback=getMapZoomChange;
        option.callbackForCluster =callbackForCluster;
        MonitorMapZoom(option);
//        initRightMenu();
        initRightMenuSimple();
        initTimeLineCtr();
        numberCalculate=1;

        var controlContainer=newMap.getOMap().getTargetElement().id;
        $('#' + controlContainer + '_ctm_tool_list_f .list_first_img').click();

//         $('.ditu_index_right .list_first .list_first_img').parents().find('.pop').click();
    };

    var initMapTool4CrimeScene = function(mapId){
    	var mapl=new com.jiusuo.map.JiusuoMap(baseMapPath+"/config/MapServiceConfig.xml",mapId);
    	//添加工具栏
    	com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TBaseControl({}));//添加地图工具首先要执行此语句

    	  var style = new com.jiusuo.map.style.TStyle({
              fill: new com.jiusuo.map.style.TFill({
                  color: 'rgba(255, 255, 255, 0.6)'
              }),
              stroke: new com.jiusuo.map.style.TStroke({
                  color: 'rgba(255, 0, 255, 0.2)',
                  lineDash: [10, 10],
                  width: 2
              }),
              image: new com.jiusuo.map.style.TCircle({
                  radius: 5,
                  stroke: new com.jiusuo.map.style.TStroke({
                      color: 'rgba(255, 0, 0, 0.7)'
                  }),
                  fill: new com.jiusuo.map.style.TFill({
                      color: 'rgba(255, 255, 0, 0.8)'
                  })
              })
          });


        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoominControl({zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoomoutControl({zoomInTipLabel: '放大', zoomOutTipLabel: '缩小'}));//添加放大缩小控件


        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMousePosition({projection: 'EPSG:4326',coordinateFormat:ol.coordinate.createStringXY(6)}));//添加显示鼠标坐标控件
        com.jiusuo.map.tMap.addControl(new ol.control.ScaleLine());//添加比例尺控件

        com.jiusuo.map.tMap.addControl(new ol.control.Rotate({tipLabel: '取消旋转'}));//添加属性控件
        com.jiusuo.map.JiusuoMap.setOverViewMap({collapsed:true});//添加鹰眼地图控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureLengthControl({tipLabel: '测量距离',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:null}));//添加测量距离控件
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureAreaControl({tipLabel: '测量面积',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:null}));//添加测量面积控件
        var option={}
        option.callback = removeFeatures;
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TClearControl(option));//添加属性控件

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawPointControl({tipLabel:'绘制点',innerHTML:'点',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawLineControl({tipLabel:'绘制线',innerHTML:'线',style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForLine}));

        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawPolygonControl({tipLabel:'绘制多边形',innerHTML:'面',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawRectControl({tipLabel:'绘制矩形',innerHTML:'矩形',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TDrawCircleControl({tipLabel:'绘制圆',innerHTML:'圆',style:style,startFunction:drawStartFunction,endFunction:drawEndFunction}));
        com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TSearchControl({tipLabel: '时空查询',cgiCorverFlag:true}));

        projectionCode=com.jiusuo.map.tMap.getProjection().getCode();

        esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(baseMapPath+"/config/"+com.jiusuo.map.tMap.tMapServiceConfig.esService.esDataCode);

        var option={};
        option.callback=getMapZoomChange;
        option.callbackForCluster =callbackForCluster;
        MonitorMapZoom(option);
        //initRightMenu();
        initTimeLineCtr();

	   $('.ditu_index_right .list_first .list_first_img').parents().find('.pop').finish().toggle();
    };

    var drawPoint = function(evt){
    	 var style =initDrawPolyStye();
    	 var tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunction});
        tDraw.DrawHandle("Point");
    };



    //封装property start
    var setPropertyForesJsonObject =function(esJsonObject){
    	var JsonObject ={};
    	JsonObject.id=esJsonObject.id==null?com.jiusuo.map.TUtils.createGUID():esJsonObject.id;
    	JsonObject.x=esJsonObject.longitude;
    	JsonObject.y=esJsonObject.latitude;
    	JsonObject.address=esJsonObject.address||"无";
    	JsonObject.coorsys=esJsonObject.coorsys;
    	JsonObject.desc=esJsonObject.desc;
    	JsonObject.type=esJsonObject.type;
    	JsonObject.name = esJsonObject.name||"无";
    	return JsonObject;

    };
//end

  //将esJsonObjects数据转化成featureJson start
    var changeESJsonsToFeature = function(esJsonObjects,esCodeData){
    	var featureJsonsWithTypes =[];
    	esJsonObjects.forEach(function(esJsonObjectWithTypes){
    		var featureWithType ={};
    		var featureJsons =[];
    		featureWithType.type=esJsonObjectWithTypes.type
    		featureWithType.name = esCodeData[esJsonObjectWithTypes.type];

    		esJsonObjectWithTypes.rec.forEach(function(data){
        	     var esJsonObject=  JSON.parse(data);
                var coordinates=  esJsonObject.location.coordinates

                var featureJson = {};
        		var geometry ={};
        		var coordinates=[]
        		var esJson={};
        		featureJson.type = "Feature";
        		esJson = setPropertyForesJsonObject(esJsonObject);
        		featureJson.properties = esJson;
        		geometry.type=esJsonObject.location.point;
        		geometry.coordinates=esJsonObject.location.coordinates;
        		featureJson.geometry=geometry;
        		featureJsons.push(featureJson);
        	 });
    		featureWithType.fetures=featureJsons;
    		featureJsonsWithTypes.push(featureWithType);

    	});
    	return featureJsonsWithTypes;
    };
    //end
    var getJsonFile = function(){
    	var data = com.jiusuo.map.TUtils.loadJsonDoc($contextPath +"/mine/business/plugins/JiusuoMap/config/esDataCode.json");
    	return data;
    };


    //获取es数据，并撒点
    var returnEsDataForMine = function(esJsonObjects,showFlag){
    	//在地图上撒点
		 var returnEsDatas = esQureyObject.show2(esJsonObjects,esCodeData,showFlag);
		 //如果没有获得es返回数据，则不进行图层的自适应
		 if(returnEsDatas.length<=0){

		 }else{
			 //如果不撒点，则不进行图层自适应
			 if(showFlag){
				 var id = returnEsDatas[0].features[0].properties.layerId
				 var layerForSprinkle =null;
				  com.jiusuo.map.tMap.sprinkleLayers.forEach(function(layer){
					 if(layer.getId()==id){
						 layerForSprinkle =layer ;
					 }
				 });
				  var extent = layerForSprinkle.getVectorLayer().getSource().getExtent();
				  if(extendWithOther==null){
				    	extendWithOther = ol.extent.extend(extent, extent);
				  }else{
				    	extendWithOther = ol.extent.extend(extendWithOther, extent);
				  }
				     var map=com.jiusuo.map.tMap.getOMap();
				     var view=map.getView();
				     var size=map.getSize();
				     size[0]=size[0]*0.6;
				     size[1]=size[1]*0.6;
				     map.updateSize(size);
				     view.fit(extendWithOther,size);
			 }
			 //根据图层id ,获取图层，
			 }

		 if(callbackForEsData!=null){
       	  callbackForEsData(JSON.stringify(returnEsDatas));
         }

    };
    //获取es数据，并撒点
    var returnEsDataForMine2 = function(esJsonObjects,showFlag){

    	//在地图上撒点
		 var returnEsDatas = esQureyObject.show2(esJsonObjects,esCodeData,showFlag);

		 //如果没有获得es返回数据，则不进行图层的自适应
		 if(returnEsDatas.length<=0){

		 }else{
			 //如果不撒点，则不进行图层自适应
			 if(showFlag){
				 var id = returnEsDatas[0].features[0].properties.layerId
				 var layerForSprinkle =null;
				  com.jiusuo.map.tMap.sprinkleLayers.forEach(function(layer){
					 if(layer.getId()==id){
						 layerForSprinkle =layer ;
					 }
				 });
				  var extent = layerForSprinkle.getVectorLayer().getSource().getExtent();
				  if(extendWithOther==null){
				    	extendWithOther = ol.extent.extend(extent, extent);
				  }else{
				    	extendWithOther = ol.extent.extend(extendWithOther, extent);
				  }
				     var map=com.jiusuo.map.tMap.getOMap();
				     var view=map.getView();
				     var size=map.getSize();
				     size[0]=size[0]*0.6;
				     size[1]=size[1]*0.6;
				     map.updateSize(size);
				     view.fit(extendWithOther,size);
			 }
			 //根据图层id ,获取图层，
			 }

		 if(callbackForEsDataDetail!=null){
       	  callbackForEsDataDetail(JSON.stringify(returnEsDatas));
         }

    };

    //只返回地理化信息的大概信息start
    var returnEsSummarizeData = function(esJsonObjects){
    	var esDatas =[];
    	var dataEsJson = getJsonFile();
    	esJsonObjects.forEach(function(data){
    		esDatas.push({code:data.type,num:data.rec.length,name:dataEsJson[data.type]});
    		});

    	callbackForEsDataSumarize(JSON.stringify(esDatas));
    	};

    //end


    //获取Es大概数据 start
    var getEsSumarizeData = function(featureJsons){
    	 esQureyObject = new com.jiusuo.map.TEsQuery();
    	 var featureObjects = JSON.parse(featureJsons);
		 featureObjects.forEach(function(featureObject){
			 var geometry = null;
			 var geometryObject = featureObject.geometry;
			//如果是线段的，则对geometry进行参数修改start
			 if(geometryObject.type=="LineString"){
				  var lineRadius = "100"; //默认搜索直线周边100米范围
                  geometryObject = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(geometryObject),com.jiusuo.map.tMap);
                geometryObject = com.jiusuo.map.TGeometryUtils.createBuffer(geometryObject,lineRadius,true,null);

			 }
			 //end

			 esQureyObject.queryForAsyn(JSON.stringify(geometryObject),"","",returnEsSummarizeData);
	    });

    };
    //end


    //获取Es详细数据 start
    var getEsDataDetail = function(featureJsons,sourceType,keyWords,isShowPoint){
    	 esQureyObject = new com.jiusuo.map.TEsQuery();
    	 var featureObjects = JSON.parse(featureJsons);
		 featureObjects.forEach(function(featureObject){
			 var geometry = null;
			 var geometryObject = featureObject.geometry;
			//如果是线段的，则对geometry进行参数修改start
			 if(geometryObject.type=="LineString"){
				  var lineRadius = "100"; //默认搜索直线周边100米范围
                  geometryObject = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(geometryObject),com.jiusuo.map.tMap);
                geometryObject = com.jiusuo.map.TGeometryUtils.createBuffer(geometryObject,lineRadius,true,null);

			 }
			 //end

			 esQureyObject.queryForAsyn(JSON.stringify(geometryObject),sourceType,keyWords,returnEsDataForMine2,isShowPoint);
	    });

    };
    //end

    //获取ES数据，包括详细数据
    var getEsData = function(featureJsons,showFlag){
   	   esQureyObject = new com.jiusuo.map.TEsQuery();


   	   var featureObjects = JSON.parse(featureJsons);
		 featureObjects.forEach(function(featureObject){
			 var geometry = null;
			 var geometryObject = featureObject.geometry;
			 //如果是线段的，则对geometry进行参数修改start
			 if(geometryObject.type=="LineString"){
				  var lineRadius = "100"; //默认搜索直线周边100米范围
                  geometryObject = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(geometryObject),com.jiusuo.map.tMap);
                geometryObject = com.jiusuo.map.TGeometryUtils.createBuffer(geometryObject,lineRadius,true,null);

			 }
			 //end

			 esQureyObject.queryForAsyn(JSON.stringify(geometryObject),"","",returnEsDataForMine,showFlag);
	   });
    }

    var addTCircle= function(evt){
    	 var style =initDrawLineStye();
        var tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunction});
        tDraw.DrawHandle("Circle");

}


    //清除画面 start
    var cleartFeature = function(){
    	$('#tmapContainer_ctm_tool_pop_clear').trigger("click");
    	extendWithOther = null;//置空
    };
    //end

    var drawPoly = function(evt){
    	//initRightMenu();
    	var style =initDrawPolyStye();
    	//add by chengc 20170313 在evt参数中加入purpose参数，如果是“basestation”,则表示画完区域后返回基站信息
    	var tDraw;
    	if (evt && evt.purpose=="basestation"){
    		tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunction4bs});
    	}else{
    		tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunction});
    	}
	    tDraw.DrawHandle("Polygon");
	};

	var initRightMenu = function(evt){
		var rightCallbackForId = function(evt){
			var name = evt.get('featureType');
			if(typeof name==='undefined' || null==name)	name="other";
			returnFeatureNameForMine(name);//返回-碰撞:interaction，其他：other
			if(evt!=null&&evt!=undefined){
				var featureJson = featureJsonsWithId[evt.getId()];
				var array= [];
				array.push(featureJson);
				$('#rightMenu').attr("featureJson",JSON.stringify(array));
			}
		};
		//#rightMenu 是调用者自己定义的div的id ;
	    var rm = new com.jiusuo.map.TRightMenu({style:null,div:$('#rightMenu')[0],withoutFeatureTrigger:false,callback:rightCallbackForId});

	    rm.Init();
	};



  var drawLine=function(evt){
    	  var style =initDrawLineStye();

	    var tDraw = new com.jiusuo.map.TDraw({style:style,startFunction:drawStartFunction,endFunction:drawEndFunctionForLine});
	    tDraw.DrawHandle("LineString");
	};


	var drawMapWithChoice = function(choicename){
		switch(choicename){
		case"circle":
			addTCircle();
		break;
		case"line":
			drawLine();
			break;
		case"rect":
			addRect();
			break;
        case"poly":
        	drawPoly();
			break;
        case"poly4basestation":
        	drawPoly({purpose:"basestation"});
			break;
		}
	};

	//在地图上画面和圆
	var drawInMap = function(geometry,properties){
		var projectionCode = com.jiusuo.map.tMap.getProjection().getCode();
		if(newMap){
            projectionCode = newMap.getProjection().getCode();
        }
		 if(projectionCode=="EPSG:3857"&&geometry.getType()=="Circle"){
			 geometry=com.jiusuo.map.TGeometryUtils.geomtransform(geometry,"EPSG:4326",projectionCode);
	    }
		var feature = new ol.Feature(geometry);
		var style = initDrawStyle(properties.name);
		var tempColor = getRandomColor();
		var color = properties.color||tempColor;


		var fill = new com.jiusuo.map.style.TFill({color: color});
		style['c'] =fill;

		feature.setStyle(style);
		feature.setId(properties.id);
		feature.set("name",properties.name);

        if(newMap){
            newMap.getVectorLayer('baseVector').getSource().addFeature(feature);
        }else {
            com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource().addFeature(feature);
		}

		//
		drawFeatures.push(feature);
		fitTheMap(feature);
		drawFeaturesWithoutLine.push(feature);

		var area = getMapArea(geometry,feature);
	    var featureJson = assembleFeatureJson(feature,area,properties.id);
	    featureJsonsWithId[properties.id]=featureJson;

	};

	//根据穿过来的geoJson,在地图上显示相应的区域 start
	var showSelectArea = function(featureJson){
		 var featureObjects = JSON.parse(featureJson);
		 var pointsWithoutImg=[];
		 var points = [];
		 var geometry=null;
		 featureObjects.forEach(function(featureObject){
			 var geometryObject = featureObject.geometry;
			 var properties =  featureObject.properties;
			 var id = properties.id;
			 var id= properties.id;
			 var name = properties.name

			 switch(geometryObject.type){
			 case"Point":
				 if(properties.type=='i_yd_pt'){
					 pointsWithoutImg.push(featureObject);
				 }else{
					 points.push(featureObject);
				 }
				 break;
			 case"Circle":

				 var coordinates = geometryObject.center;

				   if (com.jiusuo.map.tMap.getProjection().getCode() == 'EPSG:3857' ) {
			            coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geometryObject.center])[0];
			        }
				 geometry = new ol.geom.Circle(coordinates, geometryObject._radius);
				 drawInMap(geometry,properties);
				 break;
			 default:
			    geometry = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(geometryObject),com.jiusuo.map.tMap);

			 drawInMap(geometry,properties);
			    break;
			 }

		 });

		 if(points.length>0){
			 addSprinkle(points);
		 }
		 if(pointsWithoutImg.length>0){
			 addSprinkleWithoutImag(pointsWithoutImg);
		 }


	}
	//end


	//添加 轨迹start

	var returnclusterLayerHtml = function(feature){
	    if(feature){
	        var popupElement = document.createElement('div');
	        popupElement.innerHTML = feature.getProperties().name;
	        return popupElement;
	    }
	}

	//初始化时间控件 start
	var initTimeLineCtrFlag = 0;
	var initTimeLineCtr = function(){
		if(initTimeLineCtrFlag == 0){
			com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TTimeRouteAnimationControl({tipLabel:'轨迹播放'}));//添加控制轨迹播放控件
			initTimeLineCtrFlag = 1;
		}
		try{
			com.jiusuo.map.tMap.routeControl.routeControl.setVisible(false);
		}catch(e){

		}
	};
	//end


   /**
    *简单版人车轨迹播放控件
    *
   */
	  var sympleControlRouteList =function(trackNodes,lineWidth){




		trackNodes.forEach(function(trackNode,indexValue){



			var red=Math.floor(255*Math.random());
            var green=Math.floor(255*Math.random());
            var blue=Math.floor(255*Math.random());
            var color='rgba('+red+','+green+','+blue+','+0.8+')';
            var colorForRoute='rgba('+red+','+green+','+blue+','+1+')';


            var tempStyle = new com.jiusuo.map.style.TStyle({
		        stroke: new com.jiusuo.map.style.TStroke({
		            color: colorForRoute,
		            width: lineWidth
		        })
		    });
            var tempStyle2 = new com.jiusuo.map.style.TStyle({

		    });
            var routeFeaturesStyle =  new com.jiusuo.map.style.TStyle({
                stroke: new com.jiusuo.map.style.TStroke({
                    color: color,
                    width: lineWidth
                })
            });


			var photoData = trackNode.photoData;
			var sign  = trackNode.sign;
			var elementPoupup = $("<div style='position:absolute;top:-50px;left:-25px;text-align:center;'>"+trackNode.name+"<img src='"+photoData+"' style='width:50px;height:50px;border-radius:25px;border:1px solid #00ffd5;'/></div>")[0];
			if(sign == "dataresult"){
				elementPoupup = $("<div style='position:absolute;top:-50px;left:-25px;text-align:center;'>"+trackNode.name+"<img src='"+photoData+"' style='width:30px;height:30px;'/></div>")[0];
			}
			var selTrack = new com.jiusuo.map.TTimeTrack({
			        trackname: trackNode.name+'的轨迹',
			        points: trackNode.nodes,
				   	tempRouteFeatureStyle:tempStyle,
				   	overlayElement:elementPoupup,
				   	routeFeatureColor :color,
				   	routeFeaturesStyle:routeFeaturesStyle,
				   	tempRoutePointStyle:tempStyle2

			});
		    com.jiusuo.map.tMap.addTrack(selTrack);
		    fitTheTrackInMap(selTrack.pointsFeatures);
			selTrack.setRouteVisible(true);
		});


	  };




		var controlRouteList = function(controlType,trackNodes,lineWidth,flag){
		switch(controlType){
		case"start":

			if(flag){
				addRouteList(trackNodes,lineWidth,true);
			}else{
				addRouteList(trackNodes,lineWidth,false);
			}

			break;
		case"pause":
			$('#mapRoutePauseId').trigger('click');
			break;
		case"stop":
			if(flag){
				addRouteList(trackNodes,lineWidth,true);
			}else{
				addRouteList(trackNodes,lineWidth,false);
			}
			$('#mapRouteStopId').trigger('click');
			break;

		}
		$('.tmap-timeroute-animation－listbox').hide();


	};
	/*颜色列表*/
    var colorsList = ['#3A3AD4', '#808000', '#FF4500', '#7b68ee', '#4169E1', '#2F4F4F', '#1E90FF', '#2E8B57',
        '#32CD32', '#2BAE18', '#8F502C', '#006400', '#6B8E23', '#8B4513', '#B22222',
        '#48525A', '#65723F', '#4F8848', '#965A25', '#264095', '#E8EDF2'
    ]


	//添加轨迹start
	var addRouteList = function(trackNodesWithname,lineWidth,flag){
		$('#mapRouteStopId').trigger('click');
		//向播放控件添加轨迹时，先把原来的轨迹移除start
		var routeList = com.jiusuo.map.tMap.getTrackList();
		routeList.forEach(function(route){
			com.jiusuo.map.tMap.getOMap().removeLayer(route.getVectorLayer());
		});
		com.jiusuo.map.tMap.getTrackList().clear();
		$("div[name='divs']").each(function () {
	                    $(this).remove();
	            });
		//end


		trackNodesWithname.forEach(function(trackNode,indexValue){

			var tempStyle = new com.jiusuo.map.style.TStyle({
		        stroke: new com.jiusuo.map.style.TStroke({
		            color: colorsList[indexValue],
		            width: lineWidth
		        })
		    });

			var photoData = trackNode.photoData;
			var sign  = trackNode.sign;
			var elementPoupup = $("<div style='position:absolute;top:-50px;left:-25px;'>"+trackNode.name+"<img src='"+photoData+"' style='width:50px;height:50px;border-radius:25px;border:1px solid #00ffd5;'/></div>")[0];
			if(sign == "dataresult"){
				elementPoupup = $("<div style='position:absolute;top:-50px;left:-25px;'>"+trackNode.name+"<img src='"+photoData+"' style='width:30px;height:30px;'/></div>")[0];
			}
			var selTrack = new com.jiusuo.map.TTimeTrack({
			        trackname: trackNode.name+'的轨迹',
			        points: trackNode.nodes,
				   	tempRouteFeatureStyle:tempStyle,
				   	overlayElement:elementPoupup,
				   	routeFeatureColor :colorsList[indexValue],
			});
		    com.jiusuo.map.tMap.addTrack(selTrack);
		    fitTheTrackInMap(selTrack.pointsFeatures);
			selTrack.setRouteVisible(flag);
		});
		//触发播放控件
		$('#startimg').trigger('click');
	}
	//end

    var fitTheTrackInMap = function(featuresForTracks){
    	featuresForTracks.forEach(function(featureObject){
			 fitTheMap(featureObject);
		 });

    };

	//删除地图上的图层 start
	var removerFeaturesWithId = function(featuresJson){
		var sprinkleLayers = com.jiusuo.map.tMap.sprinkleLayers.getArray();
		var featuresObject = JSON.parse(featuresJson);
		featuresObject.forEach(function(feature){
			if(feature.properties.layerId!=""){
				sprinkleLayers.forEach(function(sprinkleLayer){
					if(sprinkleLayer.id == feature.properties.layerId ){
						com.jiusuo.map.tMap.removeSprinkleLayer(sprinkleLayer);
					}
				});
			}else{
				var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();
				var tempFeature = source.getFeatureById(feature.properties.id);
				if(tempFeature){
					source.removeFeature(tempFeature);
				}

			}

		});
		extendWithOther =null;
	};
	//end

	var changeDrawMapname = function(name,featureId){
		 var style = initDrawStyle(name);
		 var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();
		 var tfeature = source.getFeatureById(featureId);
		 tfeature.set("name",name);

		tfeature.setStyle(style);

		var featureJson = featureJsonsWithId[tfeature.getId()];
		var properties = featureJson.properties;
		properties.name =name;
	    featureJsonsWithId[properties.id]=featureJson;


	};

	var myOverlay = new ol.Overlay({
	    autoPan: true,
	    autoPanAnimation: {
	        duration: 250
	    },
	    offset:[0,5]
	});

	var locateInTheMap  = function(x,y){
		var coordinates = [x*1,y*1];
		var tMap =com.jiusuo.map.tMap;
		  var tFlashCenter = new com.jiusuo.map.TFlashCenter(com.jiusuo.map.tMap);
		   tFlashCenter.centerAt(coordinates);
	};

	//获取区域碰撞所需的区域数据集合start
	var getFeatureJsonsForIntersection =function(){
		var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();
		var featursJsons = JSON.stringify(featuresForCtrlSelects);
		//把所有alt键已选的feature清掉已选状态start
		featuresForCtrlSelects.forEach(function(feature){
			var featureId = feature.properties.id;

				var tfeature = source.getFeatureById(featureId);
				tfeature.setStyle(featureStyle[featureId]);
		});
		//end
		featuresForCtrlSelects=[];
		featureStyle={};

		return featursJsons
	};
	//end

	var getEsDataByKeywords = function(keyWord,source){
		var tSpaceSearch = new com.jiusuo.map.TSpaceSearch(null);
		tSpaceSearch.getEsDataByKeywords(keyWord,source);
	}


    //右键修改区域名字start
	   var modifySelectName = function(featureEvt,featrue2,e){
	   	   $('#epMenu').hide();
	   	   var div=null
	   	   if(!div){
	   	   	 var html = "<div>"
	        +"          <div class='set_pop set_pop7_nearby set_pop_right8' id='idForModifyName'>"
	        +"            <div class='margin'>"
	        +"              <div class='title'>修改区域名字</div>"
	        +"              <div class='net'></div>"
	        +"              <div class='wrap'>"
	        +"                <div class='left4'>区域名字：</div>"
	        +"                <div class='right'>"
	        +"                  <input type='text' class='input' id='idForSelectName'>"
	        +"                </div>"
	        +"              </div>"
	        +"              <div class='wrap'>"
	        +"                <div class='center'>"
	        +"                  <input id='idForModifyNameCheck' type='button' value='确定' class='blue submit' style='cursor: pointer;'>"
	        +"                  <input type='button' value='取消' class='gray reset' style='cursor: pointer;' id='cancelForModifyName'>"
	        +"                </div>"
	        +"              </div>"
	        +"            </div>"
	        +"          </div>"
	        +"        </div>"
	        +"      </div>";
	    var div = $(html);


	    $('body').append(div);
	   	   	}

	   $('#idForModifyName').first().show();

	   //监听确定按钮 start
	   $('#idForModifyNameCheck').on('click',function(){

	   	var name = $('#idForSelectName').val();
	   	var style =featureEvt.getStyle();

	      var newText = new com.jiusuo.map.style.TText({
		            text:name
		        });
	      style['j'] =newText;
	      featureEvt.setStyle(style);


	      var featureJson = featureJsonsWithId[featureEvt.getId()];
		    featureJson.properties.name=name;
		    featureJsonsWithId[featureEvt.getId()] =featureJson;

		    $('#idForModifyName').remove();
		    callBackForFun("changeName", JSON.stringify(featureJson));

	   	});
	   	//end

	   	 //监听取消按钮 start
	   $('#cancelForModifyName').on('click',function(){
			$('#idForModifyName').remove();
	   	});
	   	//end

	    var divHeight = $('#idForModifyName').height();
	    var divWidth = $('#idForModifyName').width();

	    var canVastop =$('#'+mapDivId).height();
	    var canVasLeft =$('#'+mapDivId).width();

	    var left=e.left;
	    var top=e.top;

	    if(left>=canVasLeft){
	        left=left-divWidth;
	    }else if(left+divWidth>canVasLeft){
	        left=left-divWidth;
	    }


	    if(top<=10){
	        top = top+divWidth;
	    }else if(top+divHeight>canVastop){
	        top = top-divWidth;
	    }else{
	    	top =top-100;
	    	}

	    div.find('#idForModifyName').css({'left':left ,"top":top });

	    $('#epMenu').hide();
	};
	//end


	//修改区域颜色start
    var changeColor = function(featureEvt,featrue2,e){

    	 if(null==leftNvgDiv) {
	    	   leftNvgDiv=$('<div class="picker"></div>');
	    	   com.jiusuo.map.tMap.getOMap().getTargetElement().appendChild(leftNvgDiv[0]);
	    	   $('.picker').colpick({
	    	        flat:false,
	    	        layout:'hex',
	    	        submit:0,
	    	        onChange:function(hsb,hex,rgb,el,bySetColor) {
	    	            $(el).closest('.title2').css('color','#'+hex);
	    	            setFeatureColor(hex);
	    	        }
	    	    });
	       }

	       //设置选中区域原色start
	       var setFeatureColor = function(hex){
	    	   var colorValue ="";
	    	   var id =  $('.picker').attr('featureId');
	    	   if(id){
	    		   var color =$('.colpick_new_color').css("background-color");
	            	var left =color.indexOf('(');
	    		  	var right =color.indexOf(')');
	                color =color.substr(left+1,right-left-1);
	    			var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();
					var tempFeature = source.getFeatureById(id);
					var style = tempFeature.getStyle();
					 colorValue = 'rgba('+color+',0.6)';
					var fill = new com.jiusuo.map.style.TFill({color: colorValue});
					style['c'] =fill;
					tempFeature.setStyle(style);
					var featureJson =  featureJsonsWithId[id];
					featureJson.properties.color=colorValue;
				    featureJsonsWithId[featureJson.properties.id]=featureJson;
					callBackForFun("changeColor", JSON.stringify(featureJson));
	    	   }
	       };
	       //end

 	   var id = featureEvt.getId();
 	   if(id){
 		   $('#epMenu').hide();
     	   $('.picker').trigger('click');
     	   $('.picker').attr('featureId',id);
     	   $('.colpick').css({'left':e.left ,"top":e.top });
 	   }

    }
	//end


    //右键菜单删除区域
    var deleteSelect = function(featureEvt,point,e){
 	   var id = featureEvt.getId();
 	   if(id){
 		   var source = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource();
			var tempFeature = source.getFeatureById(id);
			source.removeFeature(tempFeature);

			var selectSingleClick = com.jiusuo.map.tMap.currentInteraction.get("addFeaturesWithCtrlKey");
 	         selectSingleClick.getFeatures().clear();
			removeFeatureObjectDatas(drawFeaturesWithoutLine,id);
			removeFeatureDatas(featuresForCtrlSelects,id);//删除对应数组，区域碰撞需要
			 featureJsonsWithId[id]=null;

       callBackForFun("delete", JSON.stringify(featureEvt.getId()));


 	   }

 	   $('#epMenu').hide();

    };
    //end

    var deleteSelectNewMap = function(featureEvt,point,e){
  	   var id = featureEvt.getId();
  	   if(id){
  		   var source = newMap.getVectorLayer('baseVector').getSource();
 			var tempFeature = source.getFeatureById(id);
 			source.removeFeature(tempFeature);

 			var selectSingleClick = newMap.currentInteraction.get("addFeaturesWithCtrlKey");
  	         selectSingleClick.getFeatures().clear();
 			removeFeatureObjectDatas(drawFeaturesWithoutLine,id);
 			removeFeatureDatas(featuresForCtrlSelects,id);//删除对应数组，区域碰撞需要
 			 featureJsonsWithId[id]=null;

        callBackForFun("delete", JSON.stringify(featureEvt.getId()));
        deletecallback(id);
  	   }

  	   $('#epMenu').hide();

     };

    //区域碰撞start
    var areaIntersection = function(featureEvt,point,e){
    	callBackForFun("intersection", JSON.stringify(featuresForCtrlSelects));
    	removeCtrlSelects();
    	 $('#epMenu').hide();
    };
    //end

    //时空搜索start
    var timeSpaceSearch = function(featureEvt,point,e){
    	callBackForFun("timeSpaceSearch", JSON.stringify(featureJsonsWithId[featureEvt.getId()]));
    	 $('#epMenu').hide();
    };
    //end


	//移除右键菜单start
	var destroyRightMenu = function(){
		   com.jiusuo.map.TEpMenu.destroy();
		   $('#idForModifyName').remove();
	};
	//end

	var callbackForNearby = function(geometry){
		if(geometry){
			  var  area = parseFloat(geometry.radius)*parseFloat(geometry.radius)*Math.PI;
		 	    area = area/1000000+ "km²";
				  var geometry = new ol.geom.Circle(geometry.center, geometry._radius);

			    var feature = new ol.Feature(geometry);


			    var id =com.jiusuo.map.TUtils.createGUID();;
			    var featureJson = assembleFeatureJson(feature,area,id);
			    callBackForFun("nearBySearch", JSON.stringify(featureJson));
		}else{

			    callBackForFun("nearBySearch", "");
		}


		};


	//周边查回调函数start
	var rightMenuForNearbyForMine = function(featureEvt,point,e,tMap){
		if(tMap==null){
	        tMap = com.jiusuo.map.tMap;
	    }
	    var option={};
	    option.tMap = tMap;
	    option.event=e;
	    com.jiusuo.map.TSearchControlForRadius(option);
	    var tSpaceSearch = new com.jiusuo.map.TSpaceSearch(tMap);
	    tSpaceSearch.setFeatureForNearBy(point);
	    tSpaceSearch.setCallbackfun(callbackForNearby);

	};
	//end

	//显示区域信息 start
	var showAreaInfo = function(featureEvt,point,e,tMap){
		var tMap = tMap
		if(!tMap){
			tMap =com.jiusuo.map.tMap;
		}
		 //var map=com.jiusuo.map.tMap.getOMap();
       if(featureEvt.get("html")||featureHtmlObject[featureEvt.getId()]){
       	var innerHTML = featureEvt.get("html")||featureHtmlObject[featureEvt.getId()];
        featureHtmlObject[featureEvt.getId()] = innerHTML;
     	var center = tMap.getOMap().getCoordinateFromPixel([e.left*1,e.top*1]);
       	//var center = map.getCoordinateFromPixel(evt.pixel);
       	var tOverlay = new com.jiusuo.map.TOverlay({
               innerHTML: innerHTML,
               position: center,
               callback: null
           });
           com.jiusuo.map.tMap.addTOverlay(tOverlay, "");
           com.jiusuo.map.tMap.getOMap().getView().setCenter(center);
           $(".ol-popup-info").text(featureEvt.get("name"));
           $(".ol-popup-info").css("font-weight","bold");
           $(".ol-popup").css("min-width","210px");
           $(".ol-popup-info").append("<style>.ol-popup-info::after{content: ''}</style>");
       }

	};
	//end

	//右键菜单初始化start
	var initRightMenu = function(){
	       var rightMenuItemsF = function(feature){
	       	var type =feature.getGeometry().getType();
	       	var rightMenuItems=[];
	       	if(type!="Point"){
	       		if(featuresForCtrlSelects.length>1){   //判断是否有多选区域
	       				 rightMenuItems = [{name:'周边查询','action':rightMenuForNearbyForMine},
	    	                          {name:'改变区域颜色','action':changeColor},
	    	                          {name:'删除区域','action':deleteSelect},
	    	                          {name:'修改标题','action':modifySelectName},
	    	                           {name:'区域碰撞','action':areaIntersection},
	    	                           {name:'显示区域信息','action':showAreaInfo}
	    	                         ];
	       			}else{

	       				 rightMenuItems = [{name:'周边查询','action':rightMenuForNearbyForMine},
	    	                          {name:'改变区域颜色','action':changeColor},
	    	                          {name:'删除区域','action':deleteSelect},
	    	                          {name:'修改标题','action':modifySelectName},
	    	                           {name:'时空搜索','action':timeSpaceSearch},
	    	                          {name:'显示区域信息','action':showAreaInfo}
	    	                          ];

	       			}

	       		}else{
	       			 rightMenuItems = [{name:'周边查询','action':rightMenuForNearbyForMine}];
	       		}


	    	    return rightMenuItems;
	    	};
			if(newMap){
                com.jiusuo.map.TEpMenu.init(rightMenuItemsF,newMap);
			}else {
                com.jiusuo.map.TEpMenu.init(rightMenuItemsF);
            }
	};
	//end

	//右键菜单初始化（时空碰撞、搜索简化版）
	var initRightMenuSimple = function(){
	       var rightMenuItemsF = function(feature){
	       	var type =feature.getGeometry().getType();
	       	var rightMenuItems=[];
	       	if(type!="Point"){
	       		if(featuresForCtrlSelects.length>1){   //判断是否有多选区域
	       				rightMenuItems = [{name:'删除区域','action':deleteSelectNewMap},
//	    	                          {name:'修改标题','action':modifySelectName},
	    	                         ];
	       			}
	       		else{
	       				rightMenuItems = [{name:'删除区域','action':deleteSelectNewMap},
//				                        {name:'修改标题','action':modifySelectName},
				                       ];
	       			}

	       		}
       	    else{
       	    	rightMenuItems = [{name:'删除区域','action':deleteSelectNewMap},
//			                        {name:'修改标题','action':modifySelectName},
			                       ];
	       		}
	    	    return rightMenuItems;
	    	};
			if(newMap){
				com.jiusuo.map.TEpMenu.init(rightMenuItemsF,newMap);
			}else {
                com.jiusuo.map.TEpMenu.init(rightMenuItemsF);
            }
	};
	//end


	var testInit = function(){

		var rightMenuItemsF = function(feature){
		    var rightMenuItems = [{name:'网格查询','action':com.jiusuo.map.TGeoGridOCControl.gridQuery},{name:'周边查询','action':com.jiusuo.map.TEpMenu.rightMenuForNearby},{name:'显示邻近基站','action':com.jiusuo.map.TEpMenu.showNearCgis},{name:'显示覆盖范围','action':com.jiusuo.map.TEpMenu.showCgiCoverage},{name:'取消基站操作','action':com.jiusuo.map.TEpMenu.removeCgiCoverage}];
		    return rightMenuItems;
		};
		com.jiusuo.map.TEpMenu.init(rightMenuItemsF);
	};



	//保存地图区域弹出框的信息start
	var saveFeatureInfo = function(id,html,name){
		var feature = getFeatureById(id);
		if(null==feature) return;
		feature.set("html",html);
		feature.set("name",name);
	}
	//end



	/*//监听地图单击事件
	var singleClick=function () {
	    var map=com.jiusuo.map.tMap.getOMap();
	    map.on("singleclick",function (evt) {

	        var featureEvt = map.forEachFeatureAtPixel(evt.pixel,
	            function (featureEvt) {
	                return featureEvt;
	            });

	        var feature;
	        if (featureEvt == null) {
	            return;
	        }
	        if (featureEvt.get('features') == undefined) {
	            feature = featureEvt;
	        } else {
	            var features = featureEvt.get('features');
	            if (features.length == undefined) {
	                return;
	            }
	            if (features.length > 1) {
	                return;
	            }
	            feature = features[0];
	        }
	        if (feature.getGeometry().getType() != 'Polygon'&&feature.getGeometry().getType() != 'LineString'&&feature.getGeometry().getType() != 'Circle') {
	            return;
	        }
	        if(feature.get("html")){
	        	var innerHTML = feature.get("html");
	        	var center = map.getCoordinateFromPixel(evt.pixel);
	        	var tOverlay = new com.jiusuo.map.TOverlay({
                    innerHTML: innerHTML,
                    position: center,
                    callback: null
                });
                com.jiusuo.map.tMap.addTOverlay(tOverlay, "");
                com.jiusuo.map.tMap.getOMap().getView().setCenter(center);
	        }


	    })
	};
	*/



	var MonitorMapZoom = function(opt_options){
		var _this = this;
		var callbackFun =opt_options.callback;
		var callbackForCluster = opt_options.callbackForCluster;
		if(!callbackFun){
			 var d = dialog({
	             title: '提示',
	             content: '查询es出现异常：' + eSServerProxy
	         });
	         d.showModal();
		}
		var options = opt_options ? opt_options : {};
		if(!options.tmap){
		  this._tMap = com.jiusuo.map.tMap;
		}else{
			this._tMap = options.tmap;
		}

		 this._tMap.getOMap().on('moveend', function(option){
			if(callbackFun!=null){
				callbackFun(option);
			}
         if(callbackForCluster!=null){
        	 callbackForCluster(option);
			}
		 });
	};

	//改变区域颜色 start
	var changeFeatureColor =function(id,color){
		//根据featrueId 在地图上获取相应的feature
		var feature = getFeatureById(id);
		var style = feature.getStyle();
		//把color设置到feature上

		var fill = new com.jiusuo.map.style.TFill({color: color});
		style['c'] =fill;
		feature.setStyle(style);
		var featureJson =  featureJsonsWithId[id];
		featureJson.properties.color=color;

	    featureJsonsWithId[featureJson.properties.id]=featureJson;
		callBackForFun("changeColor", JSON.stringify(featureJson));

	}
	//end

	//改变区域颜色(不做回调) start
	var changeAreaColor =function(id,color){
//		console.log(id);
		//根据featrueId 在地图上获取相应的feature
		var feature = getFeatureById(id);
		var style = feature.getStyle();
		//把color设置到feature上

		var fill = new com.jiusuo.map.style.TFill({color: color});
		style['c'] =fill;
		feature.setStyle(style);
		var featureJson =  featureJsonsWithId[id];
		featureJson.properties.color=color;

	    featureJsonsWithId[featureJson.properties.id]=featureJson;
	}
	//end

	var initGeohash =function(){
		var geohash = new com.jiusuo.map.TGeoHash(false, 2, 0.4);
		geohash.openAutoGridByMap(true, true);
		return geohash;
	}

	var removeGeohash =function(geohash){
		if(geohash && geohash.closeAutoGridByMap){
			geohash.closeAutoGridByMap();
		}
	}

	var addGeoHashGrid = function(geohashids){
		var geohash = new com.jiusuo.map.TGeoHash(false, 2, 0.4);

		var resutl = geohash.getExtentByGeohashs(geohashids);
		var option = {};
		option.extents = resutl.geoExtents;
		com.jiusuo.map.drawPolygonByExtent(option);

	}

	var showCgiCoverage = function(cgis){
		com.jiusuo.map.TEpMenu.showCgiCoverage(null, null, null, cgis);
	}
	var getHashJsonFromMapJson = function(mapJson,mapKey){
		var geohash = new com.jiusuo.map.TGeoHash(false,0,0.6);
		return geohash.getGeohashGrids(mapJson,mapKey,false);
	}
	  return {

		  /**
		   * 功能：保存区域颜色
		   * id为feature的唯一id，color:颜色字符串，如"rgba(136, 170, 194,0.6)"
		   * */
		  changeFeatureColor:function(id,color){
			  changeFeatureColor(id,color);
		  },

		  /**
		   * 功能：修改区域颜色
		   * id为feature的唯一id，color:颜色字符串，如"rgba(136, 170, 194,0.6)"
		   * */
		  changeAreaColor:function(id,color){
			  changeAreaColor(id,color);
		  },

		  /**
		   * 功能：保存区域弹框所需的地理统计信息
		   * id为feature的唯一id，html：弹框html字符串，name:区域标题
		   * */
		  saveFeatureInfo:function(id,html,name){
			  saveFeatureInfo(id,html,name);
		  },
		  getFeatureJsonsForIntersection:getFeatureJsonsForIntersection,//右键菜单，对alt键选择的区域进行碰撞

		  /**
		   * 功能：根据传入相应的featureJsons，在地图上画图，并且根据地图视窗进行自适应大小
		   * */
		  featureJsonsToFitTheMap:function(featuresJsons){  //根据提供的featureJsons,对地图进行自适应
			  featureJsonsToFitTheMap(featuresJsons);
		  },

		  /**
		   * 功能：根据传入相应的坐标值，在地图上定位
		   *
		   * */
		  locateInTheMap:function(x,y){
			  locateInTheMap(x,y);
		  },


		  /**
		   * 功能：多轨迹播放
		   * 参数1：controlType，轨迹的播放类型，start 开始播放过,pause 暂停播放，stop 停止播放
		   * 参数2：routeList 轨迹数组,数组大小表示轨迹条数，
		   * 参数3:lineWidth 轨迹宽度
		   * 参数4：是否显示轨迹
		   * */

		  controlRouteList:function(controlType,routeList,lineWidth,flag){  //多轨迹播放
			  controlRouteList(controlType,routeList,lineWidth,flag);
		  },


			    /**
		   * 功能：多轨迹播放
		   * 参数1：routeList 轨迹数组,数组大小表示轨迹条数，
		   * 参数2:lineWidth 轨迹宽度
		   * */

		  sympleControlRouteList:function(routeList,lineWidth){  //多轨迹播放
			  sympleControlRouteList(routeList,lineWidth);
		  },

		  changeDrawMapname:function(name,featureId){  //改变区域名称
			  changeDrawMapname(name,featureId);
		  },
		  /**
			 * 获得hashJson通过mapJson
			 * @param  {[type]} mapJson [description]
			 * @param  {[type]} mapJey  [6||7   级网格]
			 * @return {[type]}         [数组]
			 */
			getHashJsonFromMapJson:function(mapJson,mapJey){
				return getHashJsonFromMapJson();

			},
		  /**
		   * 功能：根据传入的featureJson，在地图上删除相应的图形,删除点时，只要传入相应点的featureJson（featureJson必须含有layerId），如果删除区域，传入的featureJson必须含有id
		   *
		   * */
		  removerFeaturesWithId:function(featuresJson){  //
			  removerFeaturesWithId(featuresJson);
		  },

		  	//清楚地图上的点与区域
	  	      cleartFeature:cleartFeature,

	  	      /**
	  	       * 功能：调用地图的画图工具
	  	       * 参数：choicename表示画图类型：“circle”表示画圆，"line"表示画线，"rect"表示画四方形，"poly"表示画面
	  	       *
	  	       * */
		  	   drawMapWithChoice:function(choicename){
		  		 drawMapWithChoice(choicename);
		  	   },

		  	   /**
		  	    * 功能：查询Es数据，只返回es的大概数据
		  	    * 参数1：featureJsons 类似于'[{"geometry":{"type":"Polygon","coordinates":[[[106.49803161621095,29.605751037597656],[106.49803161621095,29.581031799316406],[106.5612030029297,29.581031799316406],[106.5612030029297,29.605751037597656],[106.49803161621095,29.605751037597656]]]},"type":"Feature","properties":{"id":"fd0de9de-5e5a-a026-9db4-1bc792bf"}}]'
		  	    * 参数2：fun 地图这边调用的回调函数，当查询完Es数据时，地图通过调用fun函数，把相应数据传输给用户。
		  	    *
		  	    * */
		       getEsSumarizeData:function (featureJsons,fun){
		    	   callbackForEsDataSumarize=fun;
		    	   getEsSumarizeData(featureJsons)
		       },


		         /**
		  	    * 功能：查询Es数据，只返回es的大概数据
		  	    * 参数1：featureJsons 类似于'[{"geometry":{"type":"Polygon","coordinates":[[[106.49803161621095,29.605751037597656],[106.49803161621095,29.581031799316406],[106.5612030029297,29.581031799316406],[106.5612030029297,29.605751037597656],[106.49803161621095,29.605751037597656]]]},"type":"Feature","properties":{"id":"fd0de9de-5e5a-a026-9db4-1bc792bf"}}]'
		  	    * 参数2：fun 地图这边调用的回调函数，当查询完Es数据时，地图通过调用fun函数，把相应数据传输给用户。
		  	    * 参数3：sourceType,表示是搜查资源类型。
		  	    * 参数4：keyWords,表示关键字过滤。
		  	    * 参数5：是否撒点
		  	    * */
		       getEsDataDetail:function (featureJsons,fun,sourceType,keyWords,isShowPoint){
		    	   callbackForEsDataDetail=fun;
		    	   getEsDataDetail(featureJsons,sourceType,keyWords,isShowPoint)
		       },

		       /**
		  	    * 功能：查询Es数据，并在地图上撒点
		  	    * 参数1：featureJsons 类似于'[{"geometry":{"type":"Polygon","coordinates":[[[106.49803161621095,29.605751037597656],[106.49803161621095,29.581031799316406],[106.5612030029297,29.581031799316406],[106.5612030029297,29.605751037597656],[106.49803161621095,29.605751037597656]]]},"type":"Feature","properties":{"id":"fd0de9de-5e5a-a026-9db4-1bc792bf"}}]'
		  	    * 参数2：fun 地图这边调用的回调函数，当查询完Es数据时，地图通过调用fun函数，把相应数据传输给用户。
		  	    * 参数3：showFlag,表示是否在地图上撒点，true表示撒点。
		  	    * */
		       getEsData:function (featureJsons,fun,showFlag){
		    	   callbackForEsData=fun;
		    	   getEsData(featureJsons,showFlag)
		       },


		       /**
		        * 功能：地图上撒点、绘图功能
		        * geoJson 的值类似 '[{"geometry":{"type":"Polygon","coordinates":[[[106.49803161621095,29.605751037597656],[106.49803161621095,29.581031799316406],[106.5612030029297,29.581031799316406],[106.5612030029297,29.605751037597656],[106.49803161621095,29.605751037597656]]]},"type":"Feature","properties":{"id":"fd0de9de-5e5a-a026-9db4-1bc792bf"}}]'
		        * */
		       showSelectArea:function (geoJson){
		    	   showSelectArea(geoJson);
		       },

		  		//画区域函数
		       drawPoly:drawPoly,

		       //画线函数
		       drawLine:drawLine,

		       /**
		        * 功能：地图初始化函数,新建互不影响的n个地图窗口
		       *参数：mapId,放置地图的id,fun1:画图时的回调函数，fun2：时空碰撞的回调函数，mutiFlag:true/flase新建互不影响的n个地图窗口的表示
		       *
		       */
		       initMapTool:function(fun1,fun2,mapId,mutiFlag,fun3){    //地图初始化函数
		    	   funForCollide= fun2;

				   if(mutiFlag){
                       //drawEndFunctionForForm=
                       callbackForForm=fun1;
                       deletecallback = fun3;
                       initDependMapTool(mapId);
				   }else{
                       callback=fun1;
                       initMapTool(mapId);
                   }
		    	   mapDivId =mapId;
		       },

		       /**
		        * 单一基站分析的初始化地图工具函数
		        * 因为地图所需要的工具和其他功能不一样，所以单独写一个初始化工具函数
		        */
		       initMapTool4CrimeScene:function(fun1,mapId){
		    	   callback=fun1;
		    	   initMapTool4CrimeScene(mapId);
		       },


		       /**
		        * 功能：初始化右键菜单
		       *参数：fun 地图这边调用的回调函数
		       *callBackForFun("delete", JSON.stringify(featureJsonsWithId[featureEvt.getId()]));;右键删除回调函数
		       *callBackForFun("timeSpaceSearch", JSON.stringify(featureJsonsWithId[featureEvt.getId()]));//右键时空搜索回调函数
		       *callBackForFun("intersection", JSON.stringify(featuresForCtrlSelects));//右键时空碰撞回调函数
		       *callBackForFun("changeColor", JSON.stringify(featureJson));//改变颜色
		       *callBackForFun("changeName", JSON.stringify(featureJson); //改变名字
		       *callBackForFun("nearBySearch", JSON.stringify(featureJson));//周边查的回调函数，返回周边信息
		       **/
		       addRightMenu:function(fun){         //右键菜单初始化
		    	   callBackForFun = fun;
		       },

		       destroyRightMenu:destroyRightMenu,    //删除右键菜单
		       /*
		       *通过关键字搜索数据列表
		       *keyWords : 关键词类容
		       *source : 搜索资源分类["cgi"]
		       *
		        */
		       getEsDataByKeywords:getEsDataByKeywords,

		       /**
		        * 初始化网格，显示网格
		        */
		       initGeohash:initGeohash,

		       /**
		        * 关闭网格
		        */
		       removeGeohash:removeGeohash,

		       /**
		        * 画已选网格
		        *
		        */
		       addGeoHashGrid:addGeoHashGrid,
		       /**
				 * 获得hashJson通过mapJson
				 * @param  {[type]} mapJson [description]
				 * @param  {[type]} mapJey  [6||7   级网格]
				 * @return {[type]}         [数组]
				 */
		       getHashJsonFromMapJson:getHashJsonFromMapJson,

		       fitTheMap:function(feature){
		    	   fitTheMap(feature);
		       }
	    };

}();













/**
 * 全局变量，设置网格颜色
 */
var gridColor;
var colorArray = ["#ACACAC","#ACACAC"];
var dwRoute=null;
var sprinkleLayer = null;
var centerLocation =[108.94689,34.25944];
var radar = null;
var styleCount = 0;
/**
 * 初始化地图
 * @param target
 * @param mouse
 * @param zoom
 * @param double
 */
function initMap(target,mouse,zoom,double,tools,flag){
  var webUrl = "";
  if(flag){
    webUrl =  "/static/js/jiusuomap"
    com.jiusuo.map.JiusuoMap(webUrl+"/config/MapServiceConfig.xml",target, webUrl);
  }else{
    webUrl =  "static/js/jiusuomap"
    com.jiusuo.map.JiusuoMap(webUrl+"/config/MapServiceConfig.xml",target, webUrl);
  }
  showMouse(mouse);
  showZoomSlider(zoom);
  if(double)
    com.jiusuo.map.tMap.disableDoubleClickZoom();
  //添加工具栏
  com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TBaseControl({}));//添加地图工具首先要执行此语句
  if(tools){
    //添加测量工具类
    com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureAreaControl({tipLabel: '测量面积'}));
    com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TMeasureLengthControl({tipLabel: '测量距离'}));
    //添加缩小工具
    com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoomoutControl({tipLabel: '缩小'}));
    //添加放大工具
    com.jiusuo.map.tMap.addControl(new com.jiusuo.map.TZoominControl({tipLabel: '放大'}));
  }
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  // console.log(vectorLayer)
  vectorLayer.setZIndex(1);
 /* var value=localStorage.getItem("layer")=='0'?0:1;
  this.changeLayer(value,com.jiusuo.map.tMap);*/
}

function initOtherMap(target, mouse, zoom, double, tools,flag) {
  var webUrl ="";
  var tMapServiceConfig;
  if(flag){
    webUrl =    "static/js/jiusuomap";
    tMapServiceConfig = new com.jiusuo.map.TMapServiceConfig(webUrl+"/config/MapServiceConfig.xml");
  }else{
    webUrl =   "static/js/jiusuomap";
    tMapServiceConfig = new com.jiusuo.map.TMapServiceConfig(webUrl+"/config/MapServiceConfig.xml");
  }
  //定义唯一的全局变量com.jiusuo.map.tMap
  var otherTMap = new com.jiusuo.map.TMap(target, tMapServiceConfig);
  if(mouse){
    otherTMap.addControl(new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat:ol.coordinate.createStringXY(5)}));//添加显示鼠标坐标控件
  }
  if(zoom) {
    otherTMap.addControl(new ol.control.ZoomSlider());//添加级别滑块控件
  }
  if(double)
    otherTMap.disableDoubleClickZoom();
  //添加工具栏
  otherTMap.addControl(new com.jiusuo.map.TBaseControl({}));//添加地图工具首先要执行此语句
  if(tools){
    //添加测量工具类
    otherTMap.addControl(new com.jiusuo.map.TMeasureAreaControl({tipLabel: '测量面积'}));
    otherTMap.addControl(new com.jiusuo.map.TMeasureLengthControl({tipLabel: '测量距离'}));
    //添加缩小工具
    otherTMap.addControl(new com.jiusuo.map.TZoomoutControl({tipLabel: '缩小'}));
    //添加放大工具
    otherTMap.addControl(new com.jiusuo.map.TZoominControl({tipLabel: '放大'}));
  }
  var vectorLayer = otherTMap.getVectorLayer('baseVector');
  vectorLayer.setZIndex(99999);
  return otherTMap;
}

/**
 * 绘制多边形样式
 * @returns {TStyle}
 */
function getStyle(){
  var style = new com.jiusuo.map.style.TStyle({
    fill: new com.jiusuo.map.style.TFill({
      color: 'rgba(255, 0, 0, 0.2)'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'rgba(255, 0, 0, 0.4)',
      lineDash: [10, 10],
      width: 2
    }),
    image: new com.jiusuo.map.style.TCircle({
      radius: 1,
      stroke: new com.jiusuo.map.style.TStroke({
        color: 'rgba(0, 0, 0, 0.5)'
      }),
      fill: new com.jiusuo.map.style.TFill({
        color: 'rgba(0, 0, 0, 0.5)'
      })
    })
  });
  return style;
}


/**
 * 定位中心点
 * @param coord
 */
function showCenterByCoord(coord){
  if(coord.length>2){
    var item = coord.split(",");
    coord = [];
    coord.push(parseFloat(item[0]));
    coord.push(parseFloat(item[1]));
    com.jiusuo.map.tMap .setFlashCenter(coord);
  }else if(coord.length==2){
    com.jiusuo.map.tMap .setFlashCenter(coord);
  }

}
/**
 * 清空地图覆盖物
 */
function clearMap(){
  com.jiusuo.map.tMap.mapClear();
}

/**
 * 是否显示鼠标所在经纬度
 * @param flag
 */
function showMouse(flag){
  if(flag)
    com.jiusuo.map.tMap.addControl(new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat:ol.coordinate.createStringXY(6)}));//添加显示鼠标坐标控件
}

/**
 * 是否显示级别滑块
 * @param flag
 */
function showZoomSlider(flag){
  if(flag)
    com.jiusuo.map.tMap.addControl(new ol.control.ZoomSlider());//添加级别滑块控件
}
/**
 * 根据Id移除覆盖物
 */
function removeFeatureById(id){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  for(var i=0;i<features.length;i++){
    if(features[i].getId()==id){
      var feature =  features[i];
      vectorLayer.getSource().removeFeature(feature);
    }
  }
}
/**
 * 移除指定图层
 * @param feature
 */
function removeFeatures(features,type){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  if(type){
    for(var i=0;i<features.length;i++){
      if(features[i].getGeometry().getType()==type){
        vectorLayer.getSource().removeFeature(features[i]);
      }

    }
  }else{
    for(var i=0;i<features.length;i++){
      vectorLayer.getSource().removeFeature(features[i]);
    }
  }

}

/**
 * 移除所有图层
 */
function removeAllFeatures(){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  features.forEach(function (feature) {
    vectorLayer.getSource().removeFeature(feature);
  });
}
/**
 * 按类型移除图层
 */
function removeFeaturesByType(type){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  for(var i=0;i<features.length;i++){
    if(features[i].getGeometry().getType()==type) {
      vectorLayer.getSource().removeFeature(features[i]);
    }
  }
}


/**
 * 根据Id显示弹框
 */
function popupById(id){
  if(id!=undefined){
    var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
    var features =  vectorLayer.getSource().getFeatures();
    for(var i=0;i<features.length;i++){
      if(features[i].getId()==id){
        var feature =  features[i];
        var overlay = new ol.Overlay({
          autoPan: true,
          autoPanAnimation: {
            duration: 250
          }
        });
        var _position = feature.getGeometry().getCoordinates();
        var tOverlay = new com.jiusuo.map.TOverlay({
          innerHTML: feature.getProperties().innerHTML,
          position: _position
        });
        com.jiusuo.map.tMap.addTOverlay(tOverlay,feature);
      }
    }
  }
}/**
 * 根据Id获取对象
 */
function getFeatureById(id){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  for(var i=0;i<features.length;i++){
    if(features[i].getId()==id){
      var feature =  features[i];
      return feature;
    }
  }
  return null;
}

/**
 * 设置层级
 * @param zoom
 */
function setZoomLevel(zoom){
  com.jiusuo.map.tMap.getOMap().getView().setZoom(zoom);
}

//切换图层
function changeLayer(value, map){
  var tMap = map || com.jiusuo.map.tMap;
  gridColor = colorArray[value];
  com.jiusuo.map.TLayerSwapeControl.handleSwape(value, tMap);
}

/**
 * 设置动画定位放大
 * @param lonlat
 */
function setOverlayOutCenter(lonlat){
  $(".wave").remove();
  $(".ol-popup").remove();
  var w1 = document.createElement("div");
  w1.className = "w1";
  var w2 = document.createElement("div");
  w2.className = "w2";
  var w3 = document.createElement("div");
  w3.className = "w3";
  var w4 = document.createElement("div");
  w4.className = "w4";
  var element = document.createElement("div");
  element.className="animate wave";
  element.appendChild(w1);
  element.appendChild(w2);
  element.appendChild(w3);
  element.appendChild(w4);
  var point_overlay = new ol.Overlay({
    element:element,
    positioning:'bottom-center'
  });
  com.jiusuo.map.tMap.getOMap().addOverlay(point_overlay);
  var coord = lonlat;
  com.jiusuo.map.tMap.setCenter(coord);
  coord = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coord])[0];
  coord = ol.proj.transform(coord,'EPSG:4326', com.jiusuo.map.tMap.getProjection().getCode());
  point_overlay.setPosition(coord);
  setTimeout(function(){com.jiusuo.map.tMap.getOMap().removeOverlay(point_overlay)},5000);
}
/**
 * 设置动画定位缩小
 * @param lonlat
 * @param otherTMap
 */
function setOverlayInCenter(lonlat, otherTMap){
  if(lonlat!=[]){
  var tmap = otherTMap || com.jiusuo.map.tMap;
  $(".wave1").remove();
  $(".ol-popup").remove();
  var t1 = document.createElement("div");
  t1.className = "t1";
  var t2 = document.createElement("div");
  t2.className = "t2";
  var t3 = document.createElement("div");
  t3.className = "t3";
  var t4 = document.createElement("div");
  t4.className = "t4";
  var element = document.createElement("div");
  element.className="animate wave1";
  element.appendChild(t1);
  element.appendChild(t2);
  element.appendChild(t3);
  element.appendChild(t4);
  var point_overlay = new ol.Overlay({
    element:element,
    positioning:'bottom-center'
  });
  tmap.getOMap().addOverlay(point_overlay);
  var coord = lonlat;
  tmap.setCenter(coord);
  coord = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coord])[0];
  coord = ol.proj.transform(coord,'EPSG:4326', tmap.getProjection().getCode());
  point_overlay.setPosition(coord);
  setTimeout(function(){tmap.getOMap().removeOverlay(point_overlay)},1000);
  }
}
/**
 * 绘制多边形
 * @param data
 */
function showPolygon(nodes){
  if(nodes){
    var coords = nodes.split(";");
    var cc=[];
    var ccc=[];
    for(var j=0;j<coords.length;j++){
      var c=[];
      c.push(parseFloat(coords[j].split(",")[0]));
      c.push(parseFloat(coords[j].split(",")[1]));
      cc.push(c);
    }
    ccc.push(cc);
    var geojson = {"type":"Polygon","coordinates":ccc};
    var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(6,92,191,0.8)',width:1});
    var fill = new com.jiusuo.map.style.TFill({color: 'rgba(6,92,191,0.3)'});
    var style = new com.jiusuo.map.style.TStyle({fill:fill, stroke:stroke});
    var feature =   com.jiusuo.map.tMap.addTGeometry(geojson,style);
    com.jiusuo.map.tMap.setCenter(cc[0]);
  }
}
function createCircleArea(data){
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  removeFeatures(features,"Circle");
    if(data.nodes ==null||(data.areaType!='2' && data.areaType!='5')){
      return;
    }
    var coords = data.nodes.split(",");
    var geojson = {"type":"Circle","center":[parseFloat(coords[0]),parseFloat(coords[1])],"radius":parseFloat(coords[2])};
    var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(6,92,191,0.8)',width:1});
    var fill = new com.jiusuo.map.style.TFill({color: 'rgba(6,92,191,0.3)'});
    var style = new com.jiusuo.map.style.TStyle({fill:fill, stroke:stroke});
    var feature =   com.jiusuo.map.tMap.addTGeometry(geojson,style);
    com.jiusuo.map.tMap.setCenter([parseFloat(coords[0]),parseFloat(coords[1])]);
}
/**
 * 人流分析
 * @param data
 */
function showFlowAnaly(data){
  if(data){
    if(radar)
      radar.remove();
    radar =  new com.jiusuo.map.TRadarElement(data);
    radar.init();
  }
}
/**
 * 绘制边界
 */
function addAreaBorder(data,flag){
  removeAllFeatures();
  var rgbas=['rgba(255,0,0,0.8)','rgba(255,255,0,0.8)','rgba(0,128,64,0.8)'];
  var rgbas1=['rgba(255,0,0,0.3)','rgba(255,255,0,0.3)','rgba(0,128,64,0.3)'];
  var features=[];
  for(var i=0;i<data.length;i++){
    if(data[i].points){
      var item = data[i].points.split("_");
      for(var x = 0;x<item.length;x++) {
          var coords = item[x].split(";");
          var cc = [];
          var ccc = [];
          for (var j = 0; j < coords.length; j++) {
            var c = [];
            c.push(parseFloat(coords[j].split(",")[0]));
            c.push(parseFloat(coords[j].split(",")[1]));
            cc.push(c);
          }
          ccc.push(cc);
          var id = data[i].cityCode;
          if(item.length>1){
            id = data[i].cityCode+"_"+x;
          }
          var geojson = {"type": "Polygon", "coordinates": ccc, "id": id};
          var rgba = rgbas[0];
          var rgba1 = rgbas1[0];
          var peopleNums= parseFloat(data[i].peopleNums.split("万")[0])
          if (peopleNums> 100 && peopleNums < 200) {
            var rgba = rgbas[1];
            var rgba1 = rgbas1[1];
          } else if (peopleNums< 100) {
            var rgba = rgbas[2];
            var rgba1 = rgbas1[2];
          }
          var stroke = new com.jiusuo.map.style.TStroke({color: rgba, width: 2});
          var fill = new com.jiusuo.map.style.TFill({color: rgba1});
          var text = new com.jiusuo.map.style.TText({
            text: data[i].cityName + "\n" + data[i].peopleNums,
            font: '18px sans-serif',
            textBaseline: 'middle',
            stroke: new com.jiusuo.map.style.TStroke({
              color: 'white',
              width: 3
            }),
            fill: new com.jiusuo.map.style.TFill({color: 'black'})
          });
          var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke, text: text});
          var feature = com.jiusuo.map.tMap.addTGeometry(geojson, style);
          features.push(feature);
      }
    }
  };
  return features;
}
/**
 * remove the undefined features
 */
function removeUndefinedFeatures() {
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features =  vectorLayer.getSource().getFeatures();
  features.forEach(function (f) {
    if(!f.getId()){
      vectorLayer.getSource().removeFeature(f);
    }
  });
}

/**
 * 热力图渲染
 * @param result
 */
var heatmapLayer;
var otherLayer;
function showHeatMap(result,map){
  var _features = result;
  var geoJson_heatmap = {
    'type': 'FeatureCollection',
    'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
    'features': _features
  };
    var layer = new com.jiusuo.map.HeatMapLayer({
    geoJson: geoJson_heatmap
  });
  if(map){
    otherLayer = layer;
    map.addHeatmapLayer(layer);
  }else {
    heatmapLayer = layer;
  com.jiusuo.map.tMap.addHeatmapLayer(layer);
  }
}
/**
 * select area by feature
 */
var lastFeatures = [];
var lastStyles = [];

function selectAreaByFeature(feature) {
  var vectorLayer = com.jiusuo.map.tMap.getVectorLayer('baseVector');
  var features = vectorLayer.getSource().getFeatures();
  var fs = [];
  var styles = [];
  features.forEach(function (f) {
    if (feature && f.getId().indexOf(feature.getId().split("_")[0]) != -1) {
      fs.push(f);
      styles.push(f.getStyle());
    }
  });
  if (lastFeatures[0] != fs[0]) {
    if (lastFeatures.length != 0 && lastStyles.length != 0) {
      for (var i = 0; i < lastFeatures.length; i++) {
        lastFeatures[i].setStyle(lastStyles[i]);
      }
    }
    for (var j = 0; j < fs.length; j++) {
      var fill = new com.jiusuo.map.style.TFill({color: [30,144,255,0.8]});
      var style = new com.jiusuo.map.style.TStyle({fill:fill, stroke:styles[j].getStroke(), text:styles[j].getText()});
      fs[j].setStyle(style);
    }
    lastFeatures = fs;
    lastStyles = styles;
  }
}

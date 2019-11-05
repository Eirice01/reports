/**
 *定义命名空间：com.jiusuo.map
 */
var com;
if (!com) com = {};
com.jiusuo = {};
com.jiusuo.map = {};
com.jiusuo.map.webUrl = "/static/js/jiusuomap"; //baseMapPath;//JiusuoMap地图框架的系统相对路径，部署时要修改
com.jiusuo.map.iconStyle = 'b_';//图标样式：'b_'蓝色，'r_'红色
com.jiusuo.map.dataCoorsys = 'wgs84';//支持两种坐标系：wgs84与gcj02
//com.jiusuo.map.dataCoorsys = 'gcj02';
/**
 *@类名：com.jiusuo.map.JiusuoMap
 *@用途：用于初始化地图对象（com.jiusuo.map.tMap）
 */
com.jiusuo.map.JiusuoMap = function (configUrl, target, webUrl, dataCoorsys) {
  if (webUrl) {
    com.jiusuo.map.webUrl = webUrl;
  }
  if (dataCoorsys) {
    com.jiusuo.map.dataCoorsys = dataCoorsys;
  }
  var tMapServiceConfig = new com.jiusuo.map.TMapServiceConfig(configUrl);
  //定义唯一的全局变量com.jiusuo.map.tMap
  com.jiusuo.map.tMap = new com.jiusuo.map.TMap(target, tMapServiceConfig);
};
com.jiusuo.map.JiusuoMap.setOverViewMap = function (options, tMap) {
  var collapsed = options.collapsed;
  if (collapsed == null) {
    collapsed = true;
  }
  var map = tMap != null ? tMap : com.jiusuo.map.tMap;
  var _view = map.getOMap().getView();
  if (map.currentOverViewMap != null) {
    map.removeControl(map.currentOverViewMap);
  }
  var overviewmap = new ol.control.OverviewMap({
    collapsed: collapsed,
    tipLabel: '鹰眼',
    view: new ol.View({
      center: _view.getCenter(),
      projection: _view.getProjection(),

    })
  });
  if (map.currentZoomToExtent != null) {
    map.removeControl(map.currentZoomToExtent);
  }
  map.currentOverViewMap = overviewmap;
  map.addControl(overviewmap);//添加鹰眼控件
};
/**
 *@类名：com.jiusuo.map.TMap
 *@参数：target为div的id，用于绑定map；tMapServiceConfig为TMapServiceConfig对象；webUrl为JiusuoMap地图包路径；dataCoorsys为业务数据统一坐标系。
 *@用途：最重要的地图类，负责创建地图、操作地图等工作
 */
com.jiusuo.map.TMap = function (target, tMapServiceConfig, webUrl, dataCoorsys) {
  var _this = this;
  if (webUrl) {
    com.jiusuo.map.webUrl = webUrl;
  }
  if (dataCoorsys) {
    com.jiusuo.map.dataCoorsys = dataCoorsys;
  }
  this.tMapServiceConfig = tMapServiceConfig;
  //加载并解析图层的配置文件
  var _mapServices = tMapServiceConfig.getMapServices();
  var _tLayerConfigs = [];
  _mapServices.forEach(function (mapService) {
    var xmlDoc = com.jiusuo.map.TUtils.loadXmlDoc(mapService.getInfoFile());
    if (xmlDoc == null) {
      return;
    }
    var tLayerConfig = new com.jiusuo.map.TLayerConfig(mapService, xmlDoc);
    _tLayerConfigs.push(tLayerConfig);
  });
  //创建图层并放入数组
  var _layers = [];
  var _tLayerFactory = new com.jiusuo.map.TLayerFactory();
  _tLayerConfigs.forEach(function (tLayerConfig) {
    _layers.push(_tLayerFactory.createTLayer(tLayerConfig));
  });
  this.returnEsDatasArray = [];
  this.featureJsonsForES = [];
  this.layers = _layers;
  this.vectorLayers = new ol.Collection();
  this.clusterLayers = new ol.Collection();
  this.heatmapLayers = new ol.Collection();
  this.sprinkleLayers = new ol.Collection();
  this.currentInteraction = new ol.Collection();
  this.currentOverViewMap = null;
  this.currentZoomToExtent = null;
  this.esBaseLayerControl = null;
  this.routeControl = null;
  this.pathControl = null;
  this.routeList = new ol.Collection();
  this.trackList = new ol.Collection();
  this.allTrackPointsList = new ol.Collection();  //存放所有轨迹中的点的集合
  this.pathList = new ol.Collection();
  this.measureOverlays = [];
  this.currentGeohash = null;
  this.currentGeohashInitProperties = {};
  this.overlayList = {};
  this.overlay = new ol.Overlay({
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  //创建地图对象，并设置默认图层与视图
  this.oMap = new ol.Map({target: target});
  this.cgiDragBoxFeatures = [];
  this.cgiCoverageFeatures = [];
  this.cgiOldStyle = null;
  this.cgiDragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly
  });
  this.oMap.addInteraction(this.cgiDragBox);
  this.setDefaultLayer();
  this.setDefaultView();
  this.setDefaultControl();
  this.setDefaultInteraction();
  var source = new ol.source.Vector();
  var coveragelayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: []
    })
  });
  var selectcgilayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: []
    })
  });
  this.oMap.addLayer(coveragelayer);
  this.oMap.addLayer(selectcgilayer);
  var cgi_SelectedStyleFunction = function (feature) {
    var iconType = feature.get('iconType');
    if (iconType) {
      //var desc=
      var style = new com.jiusuo.map.style.TStyle({
        image: new com.jiusuo.map.style.TIcon({
          anchor: [0.5, 1],
          src: com.jiusuo.map.webUrl + '/static/mark/' + iconType + '_selected.png'
        })
      });
      return style;
    }
  }
  selectcgilayer.setStyle(cgi_SelectedStyleFunction);
  this.vectorLayers.set('coverageVector', coveragelayer);
  this.vectorLayers.set('selectcgiVector', selectcgilayer);
  selectcgilayer.setZIndex(1000);
  var vector = new ol.layer.Vector({
    source: source,
    style: new com.jiusuo.map.style.TStyle({
      fill: new com.jiusuo.map.style.TFill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new com.jiusuo.map.style.TStroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new com.jiusuo.map.style.TCircle({
        radius: 7,
        fill: new com.jiusuo.map.style.TFill({
          color: '#ffcc33'
        })
      })
    })
  });
  this.vectorLayers.set('baseVector', vector);//将适量图层加入tMap的vectorLayer数组
  this.oMap.addLayer(vector);//将vector图层加入地图
  this.tFlashCenterAt = null;
  //动态聚类鼠标移动事件
  this.pointerHandle = function (evt) {
    _this.oMap.getTargetElement().style.cursor = _this.oMap.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
  };
  this.openMapPointer();
  this.addTOverlay = function (tOverlay, feature) {
    //生产DIV容器
    var popupElement = document.createElement('div');
    var olpopup = "";
    var olpopupnet = "";
    if (feature.constructor == ol.Feature || feature.constructor == com.jiusuo.map.TFeature) {
      olpopup = (feature.get('olpopup') != null ? feature.get('olpopup') : '') + ' ol-popup'; //yk修改
      olpopupnet = feature.get('olpopupnet') || 'ol-popup-net'; //yk修改
    } else {
      olpopup = 'ol-popup'; //yk修改
      olpopupnet = 'ol-popup-net'; //yk修改
    }
    popupElement.className = olpopup; //yk修改
    // popupElement.className = 'ol-popup';
    //生成右上关闭按钮
    var popup_closerElement = document.createElement('img');
    popup_closerElement.className = 'ol-popup-closer';
    popup_closerElement.src = com.jiusuo.map.webUrl + '/static/imgditu/ditu_close.png';
    popup_closerElement.onclick = function () {
      if (typeof(video_handler) != "undefined") {
        if (video_handler.isPlaying) {
          video_handler.stop();
        }
        ;
      }
      $('.video_box').width('1px');
      $('.video_box').height('1px');
      $('.video_control').hide();
      _this.overlay.setPosition(undefined);
      popup_closerElement.blur();
      return false;
    };
    //生成左上标题信息
    var popup_closerInfoElement = document.createElement('div');
    popup_closerInfoElement.className = 'ol-popup-info';
    //生成横线
    var popup_net = document.createElement('div');
    popup_net.className = olpopupnet; //yk修改
    // popup_net.className = 'ol-popup-net';
    popupElement.appendChild(popup_closerInfoElement);
    popupElement.appendChild(popup_closerElement);
    popupElement.appendChild(popup_net);
    //生成信息展示DIV
    var popup_contentElement = document.createElement('div');
    popup_contentElement.className = 'ol-popup-content';
    popupElement.appendChild(popup_contentElement);
    _this.oMap.getTargetElement().appendChild(popupElement);
    //回调函数，参数为feature的ID和位置（经纬度），返回值为显示窗口（DIV）
    if (tOverlay.getCallback() != null && tOverlay.getCallback() != '') {
      var to = tOverlay.getCallback()(feature);
      if (to == null) {
        return;
      }
      popup_contentElement.appendChild(to);
    } else {
      popup_contentElement.innerHTML = tOverlay.getInnerHTML();
    }
    this.getOverLay().setElement(popupElement);
    _this.oMap.addOverlay(_this.overlay);
    _this.overlay.setPosition(tOverlay.getPosition());
  };
  this.oMap.on('singleclick', function (evt) {
    clearTimeout(window.filtDblClickMap);//快速多次点击,只触发一次
    window.filtDblClickMap = setTimeout(function () {
      var featureEvt = _this.oMap.forEachFeatureAtPixel(evt.pixel,
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
      // if (feature.getGeometry().getType() != 'Point') {
      //     return;
      // }
      var innerHTML = "";
      var position = [];
      var callback = null;
      if (feature) {
        if (feature.get('innerHTML') == undefined && feature.get('showFields') == undefined && feature.get('callback') == undefined) {
          if (feature.get('fcallback') != undefined && feature.get('fcallback') != null) {
            var fcallback = feature.get('fcallback');
            fcallback(feature);
          }
          return;
        }
        innerHTML = function () {
          if (feature.get('innerHTML') != null && feature.get('innerHTML') != '') {
            var htmlStr = feature.get('innerHTML');
            for (var i = 1; i < feature.getKeys().length; i++) {
              var key = feature.getKeys()[i];
              var value1 = feature.get(key);
              var reg = new RegExp("{" + key + "}", "gi");
              htmlStr = htmlStr.replace(reg, value1);
            }
            return htmlStr;
          } else if (feature.get('showFields') != null && feature.get('showFields') != '') {
            var htmlString = "";
            for (var k = 0; k < feature.get('showFields').length; k++) {
              var fieldObj = feature.get('showFields')[k];
              var field = fieldObj.field;
              var alias = fieldObj.alias;
              var value2 = feature.get(field);
              htmlString += "<p><strong>" + alias + "：</strong>" + value2 + "</p>";
            }
            return htmlString;
          } else {
            return '';
          }
        }();
        if (feature.getGeometry().getType() == 'Point') {
          position = feature.getGeometry().getCoordinates();
        } else {
          position = _this.getOMap().getCoordinateFromPixel(evt.pixel);
        }

        callback = feature.get('callback');
        var tOverlay = new com.jiusuo.map.TOverlay({
          innerHTML: innerHTML,
          position: position,
          callback: callback
        });
        _this.addTOverlay(tOverlay, feature);
      }
    }, 10)
  });

};
//com.jiusuo.map.TMap类原型声明，包含各类成员方法
com.jiusuo.map.TMap.prototype = {
  //设置默认图层
  setDefaultLayer: function () {
    for (var i = 0; i < this.layers.length; i++) {
      if (i == 0) {
        this.layers[i].setLayerVisible(true);
        this.oMap.addLayer(this.layers[i].getLayer());
        this.baseLayer = this.layers[i];
        if (this.layers[i].getSubLayer() != null) {
          this.oMap.addLayer(this.layers[i].getSubLayer());
        }
      } else {
        this.layers[i].setLayerVisible(false);
        this.oMap.addLayer(this.layers[i].getLayer());
        if (this.layers[i].getSubLayer() != null) {
          this.oMap.addLayer(this.layers[i].getSubLayer());
        }
      }
    }
  },
  //设置默认视图
  setDefaultView: function () {
    this.oMap.setView(this.layers[0].getView());
  },
  //设置视图
  setView: function (view) {
    this.oMap.setView(view);
  },
  //设置默认控件
  setDefaultControl: function () {
    this.oMap.removeControl(this.oMap.getControls().item(0));//删除默认的放大缩小控件
    this.oMap.removeControl(this.oMap.getControls().item(1));//删除默认的属性控件
  },
  //添加动态聚类图层
  addClusterLayer: function (cluster) {
    this.oMap.addLayer(cluster.getVectorLayer());
    //this.oMap.on('pointermove', this.pointerHandle);
    this.clusterLayers.push(cluster);
  },
  //移除聚类图层
  removeClusterLayer: function (cluster) {
    this.removeCurrentInteraction('cluster_select');
    this.oMap.removeLayer(cluster.getVectorLayer());
    //this.oMap.un('pointermove', this.pointerHandle);
    this.clusterLayers.remove(cluster);
  },
  //获取聚类图层集合
  getClusterLayers: function () {
    return this.clusterLayers;
  },
  //添加动态热图图层
  addHeatmapLayer: function (heatmap) {
    this.oMap.addLayer(heatmap.getVectorLayer());
    this.heatmapLayers.push(heatmap);
  },
  //移除动态热图图层
  removeHeatmapLayer: function (heatmap) {
    this.oMap.removeLayer(heatmap.getVectorLayer());
    this.heatmapLayers.remove(heatmap);
  },
  //获取动态热图图层集合
  getHeatmapLayers: function () {
    return this.heatmapLayers;
  },
  //添加撒点图层
  addSprinkleLayer: function (sprinkle) {
    this.oMap.addLayer(sprinkle.getVectorLayer());
    //this.oMap.on('pointermove', this.pointerHandle);
    this.sprinkleLayers.push(sprinkle);
  },
  //移除撒点图层
  removeSprinkleLayer: function (sprinkle) {
    this.removeCurrentInteraction('sprinkle_select');
    this.oMap.removeLayer(sprinkle.getVectorLayer());
//        this.oMap.un('pointermove', this.pointerHandle);
    this.sprinkleLayers.remove(sprinkle);
  },
  //获取撒点图层集合
  getSprinkleLayers: function () {
    return this.sprinkleLayers;
  },
  getSprinkleLayerById: function (layerId) {
    var layers = this.sprinkleLayers.getArray()
    for (var i = 0; i < layers.length; i++) {
      var item = layers[i];
      if (item.id == layerId) {
        return item;
      }
    }
    return null;

  },
  //地图上添加控件
  addControl: function (control) {
    if (control instanceof com.jiusuo.map.TRouteAnimationControl) {
      this.routeControl = control;
      this.oMap.addControl(control);
    }
    if (control instanceof com.jiusuo.map.TPathAnimationControl) {
      this.pathControl = control;
    }
    if (control instanceof com.jiusuo.map.TTimeRouteAnimationControl) {
      this.routeControl = control;
    }
    if (control instanceof com.jiusuo.map.TEsBaseLayerControl) {
      this.esBaseLayerControl = control;
    }
    if (control instanceof com.jiusuo.map.TBaseControl) {
      this.oMap.addControl(control);
    }
    if (control instanceof ol.control.MousePosition) {
      this.oMap.addControl(control);
    }
    if (control instanceof com.jiusuo.map.TMousePosition) {
      this.oMap.addControl(control);
    }
    if (control instanceof ol.control.ScaleLine) {
      this.oMap.addControl(control);
    }
    if (control instanceof ol.control.OverviewMap) {
      this.oMap.addControl(control);
    }
    if (control instanceof ol.control.ZoomSlider) {
      this.oMap.addControl(control);
    }
  },
  removeControl: function (control) {
    if (control instanceof com.jiusuo.map.TRouteAnimationControl) {
      this.routeControl = null;
      this.routeControl.routeControl.setVisible(false);
    }
    // if (control instanceof com.jiusuo.map.TPathAnimationControl) {
    //     this.pathControl = null;
    //     this.pathControl.routeControl.setVisible(false);
    // }
    // this.oMap.addControl(control);
    if (control instanceof ol.control.MousePosition) {
      this.oMap.removeControl(control);
    }

    if (control instanceof com.jiusuo.map.TMousePosition) {
      this.oMap.removeControl(control);
    }
    if (control instanceof ol.control.OverviewMap) {
      this.oMap.removeControl(control);
    }
    if (control instanceof ol.control.ScaleLine) {
      this.oMap.removeControl(control);
    }
    if (control instanceof ol.control.ZoomSlider) {
      this.oMap.removeControl(control);
    }
  },
  //地图上添加自定义DIV
  addCostomDIV: function (customdiv) {
    if (customdiv instanceof com.jiusuo.map.TRouteAnimationControl) {
      this.routeControl = customdiv;
    }
    this.oMap.addControl(customdiv);
  },
  removeCostomDIV: function (customdiv) {
    if (customdiv instanceof com.jiusuo.map.TRouteAnimationControl) {
      this.routeControl = null;
      this.routeControl.routeControl.setVisible(false);
    }
    this.oMap.removeControl(customdiv);
  },
  setDefaultInteraction: function () {
    this.oMap.addInteraction(new ol.interaction.DragRotateAndZoom());
  },
  //获取Openlayers3的map对象
  getOMap: function () {
    return this.oMap;
  },
  //获取地图中的基础图层
  getLayers: function () {
    return this.layers;
  },
  //获取地图中
  getVectorLayers: function () {
    return this.vectorLayers;
  },
  //根据key获取对应的矢量图层
  getVectorLayer: function (key) {
    return this.vectorLayers.get(key);
  },
  //获取当前屏幕中心点
  getCenter: function () {
    var p = this.oMap.getView().getCenter();
    p = com.jiusuo.map.TGeometryUtils.coortransform(p, this.getProjection().getCode(), 'EPSG:4326');
    if (com.jiusuo.map.dataCoorsys == 'wgs84') {
      if (this.getProjection().getCode() == 'EPSG:3857') {
        p = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([p])[0];
      }
    }
    return p;
  },
  setCenter: function (center) {
    // var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([center]);
    // var coordinate = com.jiusuo.map.TGeometryUtils.coortransform(coordinates[0],'EPSG:4326',this.getProjection());
    if (this.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
      center = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([center])[0];
      center = com.jiusuo.map.TGeometryUtils.coortransform(center, 'EPSG:4326', this.getProjection());
    }
    if (this.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
      center = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center])[0];
    }
    this.oMap.getView().setCenter(center);
  },
  setFlashCenter: function (point) {
    if (this.tFlashCenterAt == null) {
      this.tFlashCenterAt = new com.jiusuo.map.TFlashCenter();
    }
    this.tFlashCenterAt.centerAt(point);
  },
  removeFlashCenter: function () {
    if (this.tFlashCenterAt != null) {
      this.tFlashCenterAt.removeCenter();
    }
  },
  //获取当前地图缩放级别
  getZoom: function () {
    return this.oMap.getView().getZoom();
  },
  //设置当前的交互对象
  addCurrentInteraction: function (key, interaction) {
    this.currentInteraction.set(key, interaction);
    this.oMap.addInteraction(interaction);
    this.oMap.on('pointermove', this.pointerHandle);
  },
  //获取当前的交互对象
  getCurrentInteraction: function (key) {
    return this.currentInteraction.get(key);
  },
  //移除地图的交互对象
  removeCurrentInteraction: function (key) {
    if (this.currentInteraction != null) {
      this.oMap.removeInteraction(this.currentInteraction.get(key));
      this.currentInteraction.unset(key, true);
    }
  },
  //获取地图的投影坐标系
  getProjection: function () {
    return this.oMap.getView().getProjection();
  },
  //添加overlay元素
  addOverlay: function (overlay) {
    this.oMap.addOverlay(overlay);
  },
  //获取地图上的轨迹列表
  getRouteList: function () {
    return this.routeList;
  },
  getTrackList: function () {
    return this.trackList;
  },


  //获取所有轨迹点的集合  solon add start
  getAllTrackPointsList: function () {
    return this.allTrackPointsList;
  },
  //solon add end

  //获取地图上的轨迹列表
  getPathList: function () {
    return this.pathList;
  },
  //设置轨迹控件是否可见
  setRouteControlVisible: function (value) {
    if (this.routeControl) {
      this.routeControl.routeControl.setVisible(value);
    }
  },
  //添加轨迹元素
  addRoute: function (route) {
    this.routeControl.routeControl.addRoute(route);
  },
  addTrack: function (track) {
    var timeControl = this.routeControl.routeControl.addTrack(track);
    return timeControl;
  },
  //添加原始伴随轨迹
  addFollowRouteLayer: function (route) {
    var index = this.getRouteList().getLength();
    this.getRouteList().push(route);
    this.getOMap().addLayer(route.getVectorLayer());
  },
  //移除轨迹，需修改，getRouteList需也修去掉该条轨迹
  removeRouteLayer: function (route) {
    this.getOMap().removeLayer(route.getVectorLayer());
  },
  //添加轨迹元素
  addPath: function (route) {
    this.pathControl.routeControl.addPath(route);
  },
  //
  addRouteLayer: function (route) {
    this.getOMap().addLayer(route.getVectorLayer());
  },
  //
  addPathLayer: function (route) {
    this.getOMap().addLayer(route.getVectorLayer());
  },
  getOverLay: function () {
    return this.overlay;
  },
  addFeatureOverlay: function (featureOverlay) {
    var vectorLayer = this.getVectorLayer('baseVector');
    vectorLayer.getSource().addFeature(featureOverlay.getFeature());
    this.addTOverlay(featureOverlay.getTOverLay());
    this.setCenter(featureOverlay.getFeature().getGeometry().getCoordinates());
  },
  //向地图上添加伴随轨迹（分析）图
  addTrajectory: function (trajectory) {
    var map = trajectory.getMap();
    map.renderSync();
    var container = trajectory.getEchartsContainer();
    var myChart = trajectory.initECharts(container);
    window.onresize = myChart.onresize;
    trajectory.setOption(trajectory.getOption());
  },
  //移除地图上的伴随轨迹（分析）图
  removeTrajectory: function (trajectory) {
    if (trajectory) {
      trajectory.clear();
    }
  },
  //向地图上添加流量统计雷达图
  addFlowStatisticsRadar: function (flowStatisticsRadar) {
    this.getOMap().addOverlay(flowStatisticsRadar.getOverlay());
    flowStatisticsRadar.getOverlay().setPosition(ol.proj.transform(flowStatisticsRadar.getPosition(), 'EPSG:4326', this.getProjection().getCode()));
    this.getOMap().renderSync();
    var myChart = flowStatisticsRadar.initECharts(flowStatisticsRadar.getOverlay().getElement());
    window.onresize = myChart.onresize;
    flowStatisticsRadar.setOption(flowStatisticsRadar.getOption());
    this.tFlashCenterAt = new com.jiusuo.map.TFlashCenter(this);
    this.setFlashCenter(flowStatisticsRadar.getPosition());
    // this.getOMap().getView().setZoom(flowStatisticsRadar.getZoom());
  },
  //移除地图上的伴随轨迹（分析）图
  removeFlowStatisticsRadar: function (flowStatisticsRadar) {
    flowStatisticsRadar.getOverlay().setElement(null);
    flowStatisticsRadar.getOverlay().setPosition(undefined);
    this.tFlashCenterAt.removeCenter();
  },
  //鼠标单击获取坐标
  getMouseCoordinate: function (callback) {
    var getP = this.getProjection();
    var _om = this.getOMap();
    var dataCoorsys = 'wgs84';
    var projectionCode = _om.getView().getProjection().getCode();
    if (projectionCode == 'EPSG:4326') {
      dataCoorsys = 'wgs84';
    } else {
      dataCoorsys = 'gcj02';
    }
    var clickFunction = function (evt) {
      var coor = com.jiusuo.map.TGeometryUtils.coortransform(evt.coordinate, getP.getCode(), 'EPSG:4326');
      /*  if (dataCoorsys == 'wgs84' && _om.getView().getProjection().getCode() == 'EPSG:3857') {
               coor = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coor])[0];
               }
               if (dataCoorsys == 'gcj02' && _om.getView().getProjection().getCode() == 'EPSG:4326') {
               coor = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coor])[0];
               }*/
      if (dataCoorsys == 'gcj02') {
        coor = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coor])[0];
      }
      // coor = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coor])[0];

      callback(coor);
      _om.un('click', clickFunction);
    };
    this.getOMap().on('click', clickFunction);
  },
  addTGeometry: function (geojson, style, properties, isLocating) {
    var type = geojson.type;
    var _isLocating = isLocating || false;
    //数据投影坐标系统设定为4326坐标系。
    var dataProjection = 'EPSG:4326';
    //当前地图投影坐标系统
    var featureProjection = this.getProjection().getCode();
    var geom;
    if (type == 'Circle') {
      var _geom = new com.jiusuo.map.geom.TCircle([0, 0], parseFloat(geojson.radius));
      _geom = com.jiusuo.map.TGeometryUtils.geomtransform(_geom, 'EPSG:3857', featureProjection);
      // var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geojson.center]);
      var coor;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && this.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coor = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geojson.center])[0];
      } else if (com.jiusuo.map.dataCoorsys == 'gcj02' && this.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coor = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([geojson.center])[0];
      } else {
        coor = geojson.center;
      }
      var centerm = com.jiusuo.map.TGeometryUtils.coortransform(coor, dataProjection, featureProjection);
      geom = new com.jiusuo.map.geom.TCircle(centerm, _geom.getRadius());
      // geom = ol.geom.Polygon.fromCircle(new com.jiusuo.map.geom.TCircle(centerm, parseFloat(geojson.radius)));
      if (_isLocating) {
        this.getOMap().getView().setCenter(centerm);
      }

    } else {
      if (type == 'LineString') {
        var coordinates;
        if (com.jiusuo.map.dataCoorsys == 'wgs84' && this.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geojson.coordinates);
          geojson.coordinates = coordinates;
        }
        if (com.jiusuo.map.dataCoorsys == 'gcj02' && this.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geojson.coordinates);
          geojson.coordinates = coordinates;
        }
      } else if (type == 'Polygon') {
        var coordinates;
        if (com.jiusuo.map.dataCoorsys == 'wgs84' && this.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
          var cc = geojson.coordinates;
          for(var i=0;i<cc.length;i++){
            coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(cc[i]);
            geojson.coordinates[i] = coordinates;
          }
        }
        if (com.jiusuo.map.dataCoorsys == 'gcj02' && this.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
          var cc = geojson.coordinates;
          for(var i=0;i<cc.length;i++){
            coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(cc[i]);
            geojson.coordinates[i] = coordinates;
          }
        }
      } else if (type == 'Point') {
        var coordinates;
        if (com.jiusuo.map.dataCoorsys == 'wgs84' && this.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geojson.coordinates]);
          geojson.coordinates = coordinates[0];
        }
        if (com.jiusuo.map.dataCoorsys == 'gcj02' && this.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([geojson.coordinates]);
          geojson.coordinates = coordinates[0];
        }
      } else {

      }
      geom = (new ol.format.GeoJSON()).readGeometry(geojson, {
        dataProjection: dataProjection,
        featureProjection: featureProjection
      });
      if (type == 'Point') {
        if (_isLocating) {
          this.getOMap().getView().setCenter(geom.getFirstCoordinate());
        }
      } else {
        if (_isLocating) {
          var extent = geom.getExtent();
          this.getOMap().getView().setCenter([(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]);
        }
      }
    }
    var feature = new com.jiusuo.map.TFeature(geom);
    feature.setStyle(style);
    feature.setId(geojson.id);
    if (properties && properties.length > 0) {
      properties.forEach(function (item) {
        feature.set(item[0], item[1]);
      });
    }
    var vectorLayer = this.getVectorLayer('baseVector');
    vectorLayer.getSource().addFeature(feature);
    if (properties && properties.length > 0) {
      var _callback = null;
      var _isShowInfoWindow = false;
      properties.forEach(function (item) {
        if (type == 'Point' && item[0] == 'isShowInfoWindow') {
          _isShowInfoWindow = item[1];
        }
      });
      if (_isShowInfoWindow) {
        properties.forEach(function (item) {
          if (type == 'Point' && item[0] == 'callback') {
            _callback = item[1];
          }
        });
        if (_callback != null) {
          var _position = feature.getGeometry().getCoordinates();
          var tOverlay = new com.jiusuo.map.TOverlay({
            innerHTML: null,
            position: _position,
            callback: _callback
          });
          this.addTOverlay(tOverlay, feature);
        }
      }
    }
    return feature;
  },
  addGraticule: function (color, width, cellSize) {
    // Create the graticule component
    var graticule = new ol.Graticule({
      // the style to use for the lines, optional.
      strokeStyle: new com.jiusuo.map.style.TStroke({
        color: color,
        width: width
      }),
      targetSize: cellSize
    });
    graticule.setMap(this.oMap);
    return graticule;
  },


  //按ctrl键，选择多区域
  addFeaturesWithCtrlKey: function (callbackForSelect, callbackForDeSelect) {

    var fill = new com.jiusuo.map.style.TFill({
      color: ' rgba(11, 55, 230,0.6)'
    });
    var stroke = new com.jiusuo.map.style.TStroke({
      color: 'rgba(255, 255, 255,1)',
      width: 1
    });


    var Defill = new com.jiusuo.map.style.TFill({
      color: 'rgba(255, 255, 255, 0.2)'
    });
    var Destroke = new com.jiusuo.map.style.TStroke({
      color: 'rgba(11, 41, 191,1)',
      lineDash: [10, 10],
      width: 1
    });


    var selectSingleClick = new ol.interaction.Select({
      condition: ol.events.condition.click,
      toggleCondition: ol.events.condition.platformModifierKeyOnly
    });

    this.addCurrentInteraction("addFeaturesWithCtrlKey", selectSingleClick);

    selectSingleClick.on('select', function (evt) {
      // var returnFeatures=null
      var featureSelected = evt.selected;
      var featureDeSelected = evt.deselected;
      featureSelected.forEach(function (item) {
        var type = item.getGeometry().getType();
        if (type == "Point" || type == "LineString") {
          return;
        } else {
          var name = item.get("name");

          var text = new com.jiusuo.map.style.TText({
            text: name
          })

          var oldText = null;
          var oldStyle = item.getStyle();
          if (oldStyle) {
            oldText = oldStyle.getText();
          }

          var styleselect = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke, text: oldText});
          item.setStyle(styleselect);
          callbackForSelect(item, oldStyle);
        }

      });
      featureDeSelected.forEach(function (item) {
        var type = item.getGeometry().getType();
        if (type == "Point" || type == "LineString") {
          return;
        } else {

          var name = item.get("name");
          var text = new com.jiusuo.map.style.TText({
            text: name
          })
          var styledeselect = new com.jiusuo.map.style.TStyle({fill: Defill, stroke: Destroke, text: text});


          item.setStyle(styledeselect);
          callbackForDeSelect(item)
        }


      });


    });
  },


  addTGraticule: function (lineColor, lineWidth, cellSize, cellColor, selectedColor, callback) {
    var tGraticule = new com.jiusuo.map.TGraticule();
    tGraticule.createTGraticule(lineColor, lineWidth, cellSize, cellColor);
    var features = tGraticule.getFeatures();
    var vectorLayer = this.getVectorLayer('baseVector');
    if (features && features.length > 0) {
      vectorLayer.getSource().addFeatures(features);
    }
    var repeatCreateTGraticule = function (evt) {
      if (features && features.length > 0) {
        features.forEach(function (feature) {
          vectorLayer.getSource().removeFeature(feature);
        });
      }
      tGraticule.createTGraticule(lineColor, lineWidth, cellSize, cellColor);
      features = tGraticule.getFeatures();
      if (features && features.length > 0) {
        vectorLayer.getSource().addFeatures(features);
      }
    }
    this.oMap.on('change:size', repeatCreateTGraticule);
    this.oMap.on('moveend', repeatCreateTGraticule);
    this.oMap.getView().on('change:resolution', repeatCreateTGraticule);
    var selectedFeatures = [];
    var select = new ol.interaction.Select();
    this.oMap.addInteraction(select);
    var stroke = new com.jiusuo.map.style.TStroke({color: [255, 255, 255, 1], width: 2});
    var fill = new com.jiusuo.map.style.TFill({color: selectedColor});
    var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
    select.on('select', function (evt) {
      var _selectedFeatures = evt.selected;
      selectedFeatures = [];
      if (_selectedFeatures && _selectedFeatures.length > 0) {
        _selectedFeatures.forEach(function (feature) {
          if (feature.getGeometry().getType() == 'Polygon') {
            var f = new com.jiusuo.map.TFeature(feature.getGeometry());
            f.setStyle(style);
            selectedFeatures.push(f);
            feature.setStyle(style);
          }
        });
      }
      callback(selectedFeatures);
    });

    var dragBox = new ol.interaction.DragBox({
      condition: ol.events.condition.platformModifierKeyOnly
    });
    this.oMap.addInteraction(dragBox);
    dragBox.on('boxend', function () {
      var extent = dragBox.getGeometry().getExtent();
      selectedFeatures = [];
      vectorLayer.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
        if (feature.getGeometry().getType() == 'Polygon') {
          var f = new com.jiusuo.map.TFeature(feature.getGeometry());
          f.setStyle(style);
          selectedFeatures.push(f);
          feature.setStyle(style);
        }
      });
      callback(selectedFeatures);
    });
    var tGraticuleResult = [tGraticule, vectorLayer, repeatCreateTGraticule, select, dragBox];
    return tGraticuleResult;
  },
  removeTGraticule: function (tGraticuleResult) {
    var tGraticule = tGraticuleResult[0];
    var vectorLayer = tGraticuleResult[1];
    var repeatCreateTGraticule = tGraticuleResult[2];
    var features = tGraticule.getFeatures();
    if (features && features.length > 0) {
      for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        vectorLayer.getSource().removeFeature(feature);
      }
    }
    this.oMap.un('change:size', repeatCreateTGraticule);
    this.oMap.un('moveend', repeatCreateTGraticule);
    this.oMap.removeInteraction(tGraticuleResult[3]);
    this.oMap.removeInteraction(tGraticuleResult[4]);
  },
  removeFeatures: function (vectorLayer, features, tMap) {
    var source = null;
    if (vectorLayer) {
      source = vectorLayer.getSource();
    } else {
      source = this.getVectorLayer('baseVector').getSource();
    }
    if (features == null) {
      return;
    }
    try {
      features.forEach(function (feature) {
        source.removeFeature(feature);
      });
    } catch (e) {

    }
  },
  addFeatures: function (vectorLayer, features) {
    var source = null;
    if (vectorLayer) {
      source = vectorLayer.getSource();
    } else {
      source = this.getVectorLayer('baseVector').getSource();
    }
    source.addFeatures(features);
  },
  enableDoubleClickZoom: function () {
    var interactions = this.getOMap().getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DoubleClickZoom) {
        item.setActive(true);
      }
    })
  },
  disableDoubleClickZoom: function () {
    var interactions = this.getOMap().getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DoubleClickZoom) {
        item.setActive(false);
      }
    })
  },
  doubleClickZoomEnabled: function () {
    var value = true;
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DoubleClickZoom) {
        value = item.getActive();
      }
    })
    return value;
  },
  enableDragging: function () {
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DragPan) {
        item.setActive(true);
      }
    })
  },
  disableDragging: function () {
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DragPan) {
        item.setActive(false);
      }
    })
  },
  draggingEnabled: function () {
    var value = true;
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.DragPan) {
        value = item.getActive();
      }
    })
    return value;
  },
  enableScrollWheelZoom: function () {
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.MouseWheelZoom) {
        item.setActive(true);
      }
    })
  },
  disableScrollWheelZoom: function () {
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.MouseWheelZoom) {
        item.setActive(false);
      }
    })
  },
  scrollWheelZoomEnabled: function () {
    var value = true;
    var interactions = this.oMap.getInteractions();
    interactions.forEach(function (item) {
      if (item.constructor == ol.interaction.MouseWheelZoom) {
        value = item.getActive();
      }
    })
    return value;
  },
  setOverViewMap: function (options) {
    var collapsed = options.collapsed || true;
    var _view = this.oMap.getView();
    if (this.currentOverViewMap != null) {
      this.removeControl(this.currentOverViewMap);
    }
    var overviewmap = new ol.control.OverviewMap({
      className: 'ol-overviewmap ol-custom-overviewmap',
      tipLabel: '鹰眼',
      collapsed: collapsed,
      view: new ol.View({
        center: _view.getCenter(),
        projection: _view.getProjection(),
        zoom: (_view.getZoom() - 2 > 0 ? _view.getZoom() - 2 : _view.getZoom())
      })
    });
    if (this.currentZoomToExtent != null) {
      this.removeControl(this.currentZoomToExtent);
    }
    var zoomToExtent = new com.jiusuo.map.TZoomToExtentControl({
      tipLabel: '全图',
      extent: _view.calculateExtent(this.oMap.getSize())
    });//
    this.currentZoomToExtent = zoomToExtent;
    this.currentOverViewMap = overviewmap;
    this.addControl(overviewmap);//添加鹰眼控件
    this.addControl(zoomToExtent);//添加鹰眼控件
  },
  mapClear: function () {

    //清除常规轨迹，移除轨迹控件
    // if (this.routeControl != null) {
    //     this.routeControl.routeControl.setVisible(false);
    // }
    //获得常规轨迹列表
    var routeList = this.getRouteList();
    while (routeList.getLength() > 0) {
      //确定其轨迹停止播放
      routeList.item(routeList.getLength() - 1).stopAnimation();
      routeList.removeAt(routeList.getLength() - 1);
    }
    var trackList = this.getTrackList();
    while (trackList.getLength() > 0) {
      //确定其轨迹停止播放
      trackList.item(trackList.getLength() - 1).stopAnimation();
      trackList.removeAt(trackList.getLength() - 1);
    }
    //去除轨迹控件中的轨迹列表，与实时轨迹重叠
    $("div[name='divs']").each(function () {
      $(this).remove();
    });
    //去除实时轨迹，移除轨迹控件
    if (this.pathControl != null) {
      this.pathControl.routeControl.setVisible(false);
    }
    //获得实时轨迹列表
    var pathList = this.getPathList();
    while (pathList.getLength() > 0) {
      //停止增加实时轨迹点
      pathList.item(pathList.getLength() - 1).setEnableAdd(false);
      pathList.item(pathList.getLength() - 1).setVisible(false);
      pathList.removeAt(pathList.getLength() - 1);
    }
    //清空矢量图层内容，包括图形绘制、热力图、撒点、聚类
    var map = this.getOMap();
    var layers = map.getLayers();
    var length = layers.getLength();

    for (var i = 0; i < length; i++) {
      var layer = layers.item(i);
      //判断是否为矢量图层
      if (layer.constructor == ol.layer.Vector) {
        //清空聚类图层
        if (layer.getSource().constructor == ol.source.Cluster) {
          layer.getSource().getSource().clear();
        } else {
          //清空矢量图层
          try {
            layer.getSource().clear();
          } catch (ex) {
            layer.getSource().once('change', function (evt) {
              if (layer.getSource().getState() == 'ready') {
                layer.getSource().clear();
              }
            })
          }
        }
        //清空热力图层
      } else if (layer.constructor == ol.layer.Heatmap) {
        layer.getSource().clear();
      }
      // map.removeControl(layers.item(layers.getLength() - 1));
    }
    //清空绘制的overlay对象
    this.measureOverlays.forEach(function (overlay) {
      this.getOMap().removeOverlay(overlay);
    });
  },
  getMapWindowExtent: function (proj) {
    if (proj == null) {
      proj = 'EPSG:4326';
    }
    var size = this.getOMap().getSize();
    var extent = this.getOMap().getView().calculateExtent(size);

    var minxy = com.jiusuo.map.TGeometryUtils.coortransform([extent[0], extent[1]], this.getProjection().getCode(), proj);
    var maxxy = com.jiusuo.map.TGeometryUtils.coortransform([extent[2], extent[3]], this.getProjection().getCode(), proj);
    if (this.getProjection().getCode() == 'EPSG:3857') {
      minxy = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([minxy])[0];
      maxxy = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([maxxy])[0];
    }
    var extentGeojson = "{'type':'Extent','minx':" + minxy[0] + ",'miny':" + minxy[1] + ",'maxx':" + maxxy[0] + ",'maxy':" + maxxy[1] + "}";
    return extentGeojson;
  },
  openMapPointer: function () {
    this.oMap.on('pointermove', this.pointerHandle);
  },
  closeMapPointer: function () {
    this.oMap.un('pointermove', this.pointerHandle);
  },
  addWaitingModel: function () {
    var div = $('<div id="_mapMainLoading" style="display:none;position: absolute;z-index:100;left: 0; top: 0;width:100%;height:100%;"> ' +
      '<div class="tmap_circleContainer" id="loadingDiv" > ' +
      '<div class="tmap_circle1"> ' +
      '</div> ' +
      '<div class="tmap_circle2"> ' +
      '</div> ' +
      '<p class="tmap_circleFont">加载中...</p> ' +
      '</div> ' +
      '</div>');
    this.oMap.getTargetElement().appendChild(div[0]);
    div.show();
  },
  removeWaitingModel: function () {
    var node = $('#_mapMainLoading')[0];
    if (node) {
      this.oMap.getTargetElement().removeChild(node);
    }
  },
  changeHeadImagePosition: function (usernum, position) {
    try {
      for (var key in com.jiusuo.map.tMap.overlayList) {
        if (com.jiusuo.map.tMap.overlayList[key][usernum]) {
          com.jiusuo.map.tMap.overlayList[key][usernum].setPosition(position);
        } else {
          continue;
        }
      }
    } catch (e) {
    }
  }

};
/**
 *@类名：com.jiusuo.map.TLayerFactory
 *@用途：图层工厂类，负责生成各类图层
 */
//构造函数，创建图层工厂对象
com.jiusuo.map.TLayerFactory = function () {

};
//TLayerFactory类原型声明，包含各类成员方法
com.jiusuo.map.TLayerFactory.prototype = {
  //创建图层方法，接收一个TLayerConfig对象，返回一个layer（TLayer）对象
  createTLayer: function (tLayerConfig) {
    var layer;
    if (tLayerConfig.getTileType() == 'Google') {//生成谷歌地图图层
      layer = new com.jiusuo.map.GoogleLayer(tLayerConfig);
    } else if (tLayerConfig.getTileType() == 'PGIS_TDT') {//生成PGIS地图图层
      layer = new com.jiusuo.map.PGISLayer_TDT(tLayerConfig);
    } else if (tLayerConfig.getTileType() == 'BMAP') {//生成百度地图图层
      layer = new com.jiusuo.map.BaiduLayer(tLayerConfig);
    } else if (tLayerConfig.getTileType() == 'ArcGIS') {//生成百度地图图层
      layer = new com.jiusuo.map.ArcGISLayer(tLayerConfig);
    } else {
      var d = dialog({
        title: '提示',
        content: '平台尚不支持此种地图格式！'
      });
      d.showModal();
    }
    return layer;
  }
};
/**
 *@类名：com.jiusuo.map.GoogleLayer
 *@用途：谷歌图层类，负责生成谷歌地图图层
 */
//构造函数，创建谷歌地图图层对象，接收一个TLayerConfig类型参数
com.jiusuo.map.GoogleLayer = function (tLayerConfig) {
  var options = {
    url: tLayerConfig.getMapURL() + '/MapImageServer?Z={z}&C={x}&R={y}&Layer=' + tLayerConfig.getLayerName() + '&type=' + tLayerConfig.getType(),
    mapExtent: tLayerConfig.getExtent().getExtent(),
    mapMinZoom: tLayerConfig.getStartLevel(),
    mapMaxZoom: tLayerConfig.getEndLevel(),
    attribution: new ol.Attribution({
      html: '谷歌地图@九索数据'
    }),
    tilePixelRatio: 1,
    fromproject: "EPSG:4326",
    toProject: "EPSG:3857"
  };
  //瓦片图层生成方法
  this.layer = new ol.layer.Tile({
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject),
    source: new ol.source.XYZ({
      //解决跨域问题
      crossOrigin: 'anonymous',
      attributions: [options.attribution],
      projection: options.toProject,
      url: options.url,
      tilePixelRatio: options.tilePixelRatio, // THIS IS IMPORTANT
      minZoom: options.mapMinZoom,
      maxZoom: options.mapMaxZoom,
      wrapX: false
    })
  });
  //地图视图生成方法
  this.view = new ol.View({
    projection: "EPSG:3857",
    center: ol.proj.fromLonLat(tLayerConfig.getDefaultCenter(), "EPSG:3857"),
    zoom: tLayerConfig.getDefaultZoom(),
    maxZoom: options.mapMaxZoom,
    minZoom: options.mapMinZoom,
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject)
  });
  //图层的显示名称（中文别名）
  this.layerName = tLayerConfig.getLayerNameAlias();
  this.subLayer = null;
  if (tLayerConfig.getSubMapURL() && tLayerConfig.getSubInfoFile()) {
    var _infoFile = tLayerConfig.getSubInfoFile();
    var _lindex = _infoFile.lastIndexOf('/');
    var layerName = _infoFile.substring(_lindex + 1, _infoFile.length - 4);
    var _options = {
      url: tLayerConfig.getSubMapURL() + '/MapImageServer?Z={z}&C={x}&R={y}&Layer=' + layerName + '&type=' + tLayerConfig.getType(),
      mapExtent: tLayerConfig.getExtent().getExtent(),
      mapMinZoom: tLayerConfig.getStartLevel(),
      mapMaxZoom: tLayerConfig.getEndLevel(),
      attribution: new ol.Attribution({
        html: '谷歌地图@九索数据'
      }),
      tilePixelRatio: 1,
      fromproject: "EPSG:4326",
      toProject: "EPSG:3857"
    };
    //瓦片图层生成方法
    this.subLayer = new ol.layer.Tile({
      extent: ol.proj.transformExtent(_options.mapExtent, _options.fromproject, _options.toProject),
      source: new ol.source.XYZ({
        // crossOrigin: 'anonymous',
        attributions: [_options.attribution],
        projection: _options.toProject,
        url: _options.url,
        tilePixelRatio: _options.tilePixelRatio, // THIS IS IMPORTANT
        minZoom: _options.mapMinZoom,
        maxZoom: _options.mapMaxZoom,
        wrapX: true
      })
    });
  }
};
//com.jiusuo.map.GoogleLayer类原型声明，包含各类成员方法
com.jiusuo.map.GoogleLayer.prototype = {
  //设置图层是否可见
  setLayerVisible: function (isVisible) {
    this.layer.setVisible(isVisible);
    if (this.subLayer != null) {
      this.subLayer.setVisible(isVisible);
    }
  },
  getLayer: function () {
    return this.layer;
  },//获取Openlayers3的图层对象
  getSubLayer: function () {
    return this.subLayer;
  },//获取Openlayers3的图层对象
  getView: function () {
    return this.view;
  },//获取Openlayers3的视图对象
  getLayerName: function () {
    return this.layerName;
  }//获取自定义图层的名称
};
/**
 *@类名：com.jiusuo.map.PGISLayer
 *@用途：PGIS图层类，负责生成PGIS地图图层
 */
//构造函数，创建谷歌地图图层对象，接收一个TLayerConfig类型参数
com.jiusuo.map.PGISLayer_TDT = function (tLayerConfig) {
  var options = {
    url: tLayerConfig.getMapURL() + '/MapImageServer?Z={z}&C={x}&R={y}&Layer=' + tLayerConfig.getLayerName() + '&type=' + tLayerConfig.getType(),//'http://10.32.18.40:8811/PGIS_S_TileMapServer/Maps/SLTDT/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col={x}&Row={y}&Zoom={z}&V=1.0.0',
    mapExtent: tLayerConfig.getExtent().getExtent(),
    mapMinZoom: tLayerConfig.getStartLevel(),
    mapMaxZoom: tLayerConfig.getEndLevel(),
    attribution: new ol.Attribution({
      html: 'PGIS地图@九索数据'
    }),
    tilePixelRatio: 1,
    fromproject: "EPSG:4326",
    toProject: "EPSG:4326"
  };
  //瓦片图层生成方法
  this.layer = new ol.layer.Tile({
    //extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject),
    source: new ol.source.XYZ({
      // crossOrigin: 'anonymous',
      attributions: [options.attribution],
      projection: options.toProject,
      url: options.url,
      tilePixelRatio: options.tilePixelRatio, // THIS IS IMPORTANT
      minZoom: options.mapMinZoom,
      maxZoom: options.mapMaxZoom,
      wrapX: true
    })
  });
  //地图视图生成方法
  this.view = new ol.View({
    projection: "EPSG:4326",
    center: ol.proj.fromLonLat(tLayerConfig.getDefaultCenter(), "EPSG:4326"),
    zoom: tLayerConfig.getDefaultZoom(),
    maxZoom: options.mapMaxZoom,
    minZoom: options.mapMinZoom,
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject)
  });
  //图层的显示名称（中文别名）
  this.layerName = tLayerConfig.getLayerNameAlias();
};
//com.jiusuo.map.PGISLayer类原型声明，包含各类成员方法
com.jiusuo.map.PGISLayer_TDT.prototype = {
  //设置图层是否可见
  setLayerVisible: function (isVisible) {
    this.layer.setVisible(isVisible);
  },
  getLayer: function () {
    return this.layer;
  },//获取Openlayers3的图层对象
  getSubLayer: function () {
    return null;
  },//获取Openlayers3的图层对象
  getView: function () {
    return this.view;
  },//获取Openlayers3的视图对象
  getLayerName: function () {
    return this.layerName;
  }//获取自定义图层的名称
};
//构造函数，创建ArcServer地图图层对象，接收一个TLayerConfig类型参数
com.jiusuo.map.ArcGISLayer = function (tLayerConfig) {
  var options = {
    url: tLayerConfig.getMapURL() + '/MapImageServer?Z={z}&C={y}&R={x}&Layer=' + tLayerConfig.getLayerName() + '&type=' + tLayerConfig.getType(),//'http://10.32.18.40:8811/PGIS_S_TileMapServer/Maps/SLTDT/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col={x}&Row={y}&Zoom={z}&V=1.0.0',
    mapExtent: tLayerConfig.getExtent().getExtent(),
    mapMinZoom: tLayerConfig.getStartLevel(),
    mapMaxZoom: tLayerConfig.getEndLevel(),
    attribution: new ol.Attribution({
      html: 'PGIS地图@九索数据'
    }),
    tilePixelRatio: 1,
    fromproject: "EPSG:4326",
    toProject: "EPSG:4326"
  };
  var resolutions = tLayerConfig.getResolutions();
  var tileOrigin = tLayerConfig.getTileOrigin();
  var tilegrid = new ol.tilegrid.TileGrid({
    origin: tileOrigin,
    resolutions: resolutions,
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject),
    tileSize: tLayerConfig.getTileSize()
  });
  //瓦片图层生成方法
  this.layer = new ol.layer.Tile({
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject),
    source: new ol.source.XYZ({
      // crossOrigin: 'anonymous',
      attributions: [options.attribution],
      projection: options.toProject,
      url: options.url,
      tileGrid: tilegrid,
      tileSize: tLayerConfig.getTileSize(),
      tilePixelRatio: options.tilePixelRatio, // THIS IS IMPORTANT
      minZoom: options.mapMinZoom,
      maxZoom: options.mapMaxZoom,
      wrapX: true
    })
  });
  //地图视图生成方法
  this.view = new ol.View({
    projection: "EPSG:4326",
    center: ol.proj.fromLonLat(tLayerConfig.getDefaultCenter(), "EPSG:4326"),
    zoom: tLayerConfig.getDefaultZoom(),
    maxZoom: options.mapMaxZoom,
    minZoom: options.mapMinZoom,
    extent: ol.proj.transformExtent(options.mapExtent, options.fromproject, options.toProject)
  });
  //图层的显示名称（中文别名）
  this.layerName = tLayerConfig.getLayerNameAlias();
};
//com.jiusuo.map.ArcGISLayer类原型声明，包含各类成员方法
com.jiusuo.map.ArcGISLayer.prototype = {
  //设置图层是否可见
  setLayerVisible: function (isVisible) {
    this.layer.setVisible(isVisible);
  },
  getLayer: function () {
    return this.layer;
  },//获取Openlayers3的图层对象
  getSubLayer: function () {
    return null;
  },//获取Openlayers3的图层对象
  getView: function () {
    return this.view;
  },//获取Openlayers3的视图对象
  getLayerName: function () {
    return this.layerName;
  }//获取自定义图层的名称
};
/**
 *@类名：com.jiusuo.map.PGISLayer
 *@用途：PGIS图层类，负责生成PGIS地图图层
 */
//构造函数，创建百度地图图层对象，接收一个TLayerConfig类型参数
com.jiusuo.map.BaiduLayer = function (tLayerConfig) {
  var projection = ol.proj.get("EPSG:3857");
  var resolutions = [];
  for (var i = 0; i < 19; i++) {
    resolutions[i] = Math.pow(2, 18 - i);
  }
  var tilegrid = new ol.tilegrid.TileGrid({
    origin: [0, 0],
    resolutions: resolutions
  });

  var baidu_source = new ol.source.TileImage({
    projection: projection,
    tileGrid: tilegrid,
    tileUrlFunction: function (tileCoord, pixelRatio, proj) {
      if (!tileCoord) {
        return "";
      }
      var z = tileCoord[0];
      var x = tileCoord[1];
      var y = tileCoord[2];

      if (x < 0) {
        x = "M" + (-x);
        return;
      }
      if (y < 0) {
        y = "M" + (-y);
        return;
      }
      return tLayerConfig.getMapURL() + '/imageServer/getImageTile.do?Z=' + z + '&C=' + x + '&R=' + y + '&Layer=' + tLayerConfig.getLayerName() + '&type=' + tLayerConfig.getType();
    },
    wrapX: false
  });

  this.layer = new ol.layer.Tile({
    extent: ol.proj.transformExtent(tLayerConfig.getExtent().getExtent(), 'EPSG:4326', projection),
    source: baidu_source
  });
  this.view = new ol.View({
    projection: projection,
    center: ol.proj.fromLonLat(tLayerConfig.getDefaultCenter(), "EPSG:3857"),
    zoom: tLayerConfig.getDefaultZoom(),
    maxZoom: tLayerConfig.getEndLevel(),
    minZoom: tLayerConfig.getStartLevel(),
    extent: ol.proj.transformExtent(tLayerConfig.getExtent().getExtent(), 'EPSG:4326', projection)
  });
  //图层的显示名称（中文别名）
  this.layerName = tLayerConfig.getLayerNameAlias();
};
//com.jiusuo.map.BaiduLayer类原型声明，包含各类成员方法
com.jiusuo.map.BaiduLayer.prototype = {
  //设置图层是否可见
  setLayerVisible: function (isVisible) {
    this.layer.setVisible(isVisible);
  },
  getLayer: function () {
    return this.layer;
  },//获取Openlayers3的图层对象
  getSubLayer: function () {
    return null;
  },//获取Openlayers3的图层对象
  getView: function () {
    return this.view;
  },//获取Openlayers3的视图对象
  getLayerName: function () {
    return this.layerName;
  }//获取自定义图层的名称
};
/**
 *@类名：com.jiusuo.map.ClusterLayer
 *@用途：动态聚类图层类，负责生成动态聚类图层
 */
//接收一个opt_options参数，opt_options.geoJson为动态聚类数据
com.jiusuo.map.ClusterLayer = function (opt_options) {
  var options = opt_options || {};
  var _this = this;
  this.id = options.id;
  this._tMap = options.tMap;
  this.distance = options.distance || 40;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.geoJson = $.extend(true, {}, options.geoJson);//必须的，聚类数据geojson格式
  this.textStyle = options.textStyle || new com.jiusuo.map.style.TText({
    offsetX: 0,
    offsetY: 0,
    fill: new com.jiusuo.map.style.TFill({
      color: '#fff'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'rgba(0, 0, 0, 0.6)',
      width: 3
    })
  });
  this.circleTextStyle = options.circleTextStyle || new com.jiusuo.map.style.TText({
    offsetX: 0,
    offsetY: 0,
    fill: new com.jiusuo.map.style.TFill({
      color: '#fff'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'rgba(0, 0, 0, 0.6)',
      width: 3
    })
  });
  this.clusterColor = options.clusterColor || [255, 153, 0, 1];//必须的，聚类数据geojson格式
  this.enablecnum = parseInt(options.enableCNum) || 15;
  this.maxFeatureCount = 0;//最大feature数量
  this.vector = null;//矢量图层
  this.currentResolution = 0;//当前的缩放级别
  this.invisibleFill = new com.jiusuo.map.style.TFill({
    color: 'rgba(255, 255, 255, 0.01)'
  });
  //生成参与聚类的各对象的样式
  this.createClusterStyle = function (feature) {
    var iconUrl = feature.get('icon') || com.jiusuo.map.webUrl + '/data/icon/icon.png';
    var attrSize = feature.get('number') != null ? feature.get('number') : "";
    var newTextStyle = null;
    if (attrSize > 1) {
      newTextStyle = _this.textStyle;
    } else {
      newTextStyle = _this.circleTextStyle;
    }
    newTextStyle.setText(attrSize.toString());
    var style = new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 5,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'rgba(0,236,0,1)'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'black', width: 1
        })
      }),
      text: newTextStyle
    });
    return style;
  };
  //计算聚类信息
  this.calculateClusterInfo = function (resolution) {
    _this.maxFeatureCount = 0;
    var features = _this.vector.getSource().getFeatures();
    var feature, radius;
    for (var i = features.length - 1; i >= 0; --i) {
      feature = features[i];
      var originalFeatures = feature.get('features');
      var extent = ol.extent.createEmpty();
      var j, jj;
      for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
        ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
      }
      _this.maxFeatureCount = Math.max(_this.maxFeatureCount, jj);
      radius = 0.25 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
        resolution;
      if (radius <= 8) {
        radius = 8;
      }
      feature.set('radius', radius);
    }
  };
  this.getFeatureSize = function (feature) {
    var originalFeatures = feature.get('features');
    var size = originalFeatures.length;
    var number = 0;
    for (var i = 0; i < size; i++) {
      var OFeatures = originalFeatures[i];
      if (OFeatures.get('number') && OFeatures.get('number') * 1 > 1) {
        number += OFeatures.get('number') * 1;
      } else {
        number += 1;
      }
    }
    return number;
  }
  //聚类样式
  this.styleFunction = function (feature, resolution) {
    if (resolution != _this.currentResolution) {
      _this.calculateClusterInfo(resolution);
      _this.currentResolution = resolution;
    }
    var style;
    var pointSize = feature.get('features').length;
    var attrSize = _this.getFeatureSize(feature);
    if (attrSize > 1) {
      if (pointSize == 1) {
        _this.textStyle.setText(attrSize.toString());
        var iconUrl = feature.get('features')[0].get('icon') || com.jiusuo.map.webUrl + '/data/icon/icon.png';
        style = new com.jiusuo.map.style.TStyle({
          image: new com.jiusuo.map.style.TIcon({
            src: iconUrl
          }),
          text: _this.textStyle
        });
      } else {
        _this.circleTextStyle.setText(attrSize.toString());
        style = new com.jiusuo.map.style.TStyle({
          image: new com.jiusuo.map.style.TCircle({
            radius: feature.get('radius'),
            fill: new com.jiusuo.map.style.TFill({
              color: [_this.clusterColor[0], _this.clusterColor[1], _this.clusterColor[2], Math.min(0.8, 0.2 + (attrSize / _this.maxFeatureCount))]
            })
          }),
          text: _this.circleTextStyle
        });
      }
    } else {
      var originalFeature = feature.get('features')[0];
      style = _this.createClusterStyle(originalFeature);
    }
    return style;
  };
  //聚类对象选中样式
  this.selectStyleFunction = function (feature) {
    var attrSize = _this.getFeatureSize(feature);
    var styles = [new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: feature.get('radius'),
        fill: new com.jiusuo.map.style.TFill({
          color: 'rgba(30,144,255,0.8)'
        }),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(255, 255, 255, 1)'
        }),
      }),
      text:new com.jiusuo.map.style.TText({
        text: attrSize.toString(),
        font: '20px sans-serif',
        fill: new com.jiusuo.map.style.TFill({
          color: 'rgba(255, 255, 255, 1)'
        }),
        stroke: new com.jiusuo.map.style.TStroke({color: 'black', width: 1})

      })
    })];
    var originalFeatures = feature.get('features');
    if(typeof originalFeatures == 'undefined'){
      return ;
    }
    if (originalFeatures.length > _this.enablecnum) {
      // return feature.getStyle();
    }
    var originalFeature;
    if (originalFeatures.length == 1) {
      originalFeature = originalFeatures[0];
      styles.push(_this.createClusterStyle(originalFeature));
    }
    return styles;
  };
  var dataProjection = 'EPSG:4326';
  var featureProjection = this._tMap.getProjection().getCode();
  var _nFeatures = [];
  var _rFeatures = this.geoJson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  var features = (new ol.format.GeoJSON()).readFeatures(_this.geoJson, {
    dataProjection: dataProjection,
    featureProjection: featureProjection
  });
  this.source = new ol.source.Vector({
    features: features
  });
  this.vector = new ol.layer.Vector({
    source: new ol.source.Cluster({
      distance: _this.distance,
      source: _this.source
    }),
    style: _this.styleFunction
  });
  var select = new ol.interaction.Select({
    condition: function (evt) {
      return evt.type == 'singleclick';//evt.originalEvent.type == 'mousemove' ||
    },
    layers: [this.vector],
    style: _this.selectStyleFunction
  });
  select.on('select', function (evt) {
    var _selectedFeatures = evt.selected;
    if (_selectedFeatures && _selectedFeatures.length > 0) {
      var originalFeatures = _selectedFeatures[0].get('features');
      if (typeof originalFeatures == 'undefined') {
        return;
      }
      options.featureCallBack(originalFeatures);
      // if (originalFeatures.length > 1) {
      //   _this._tMap.getOMap().getView().setCenter(_selectedFeatures[0].getGeometry().getCoordinates());
      //   _this._tMap.getOMap().getView().setZoom(_this._tMap.getOMap().getView().getZoom() + 1);
      // }
    }
  });
  this._tMap.addCurrentInteraction('cluster_select', select);
  //获取聚类图层
  this.getVectorLayer = function () {
    return _this.vector;
  };
  this.setTextStyle = function (offsetX, offsetY, fill, stroke) {
    _this.textStyle.setOffsetX(offsetX);
    _this.textStyle.setOffsetX(offsetY);
    _this.textStyle.setFill(fill);
    _this.textStyle.setStroke(stroke);
  };
  this.setCircleTextStyle = function (offsetX, offsetY, fill, stroke) {
    _this.circleTextStyle.setOffsetX(offsetX);
    _this.circleTextStyle.setOffsetX(offsetY);
    _this.circleTextStyle.setFill(fill);
    _this.circleTextStyle.setStroke(stroke);
  };
  this.setEnablecnum = function (_enablecnum) {
    _this.enablecnum = _enablecnum;
  };
  this.setClusterColor = function (_clusterColor) {
    _this.clusterColor = _clusterColor;
  };
  this.getId = function () {
    return _this.id;
  };
  this.setId = function (value) {
    _this.id = value;
  }

};
/**
 *@类名：com.jiusuo.map.HeatMapLayer
 *@用途：动态热图图层类，负责生成动态热图图层
 */
//接收一个opt_options参数，opt_options.geoJson为动态聚类数据
com.jiusuo.map.HeatMapLayer = function (opt_options) {
  var _this = this;
  var option = opt_options;
  this._tMap = option.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var geoJson = $.extend(true, {}, option.geoJson);//必需的
  var gradient = option.gradient || ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];//数组类型，提供热力图渲染颜色。默认为['#00f','#0ff','#0f0','#ff0','#f00']。
  var blur = option.blur;//可设置，默认为15
  var radius = option.radius;//可设置，默认为8
  var shadow = option.shadow;//可设置，默认为250
  //var weight=option.weight;//必需的，字符串或者返回字符串的函数类型，权重字段，权重值范围必须为【0-1】。
  var opacity = option.opacity;//可设置，默认为1（完全不透明）
  var visible = option.visible;//默认为true
  var dataProjection = 'EPSG:4326';
  var featureProjection = this._tMap.getProjection().getCode();


  var formateGeojson = function (geoJson) {
    var _nFeatures = [];
    var _rFeatures = geoJson.features;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      _rFeatures.forEach(function (rFeature) {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
        rFeature.geometry.coordinates = coordinates[0];
        _nFeatures.push(rFeature);
      });
      geoJson.features = _nFeatures;
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      _rFeatures.forEach(function (rFeature) {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
        rFeature.geometry.coordinates = coordinates[0];
        _nFeatures.push(rFeature);
      });
      geoJson.features = _nFeatures;
    }
    return geoJson;
  };
  geoJson = formateGeojson(geoJson);
  var features = (new ol.format.GeoJSON()).readFeatures(geoJson, {
    dataProjection: dataProjection,
    featureProjection: featureProjection
  });
  var source = new ol.source.Vector({
    features: features
  });
  _this.source = source;
  this.heatMapLayer = new ol.layer.Heatmap({
    source: source,
    gradient: gradient,
    blur: blur,
    radius: radius,
    shadow: shadow,
    opacity: opacity,
    visible: visible
  });
  //获取热图图层
  this.getVectorLayer = function () {
    return _this.heatMapLayer;
  };
  //获取Gradient
  this.getGradient = function () {
    return _this.heatMapLayer.getGradient();
  };
  //设置梯度
  this.setGradient = function (value) {
    _this.heatMapLayer.setGradient(value);
  };
  //获取梯度
  this.getRadius = function () {
    return _this.heatMapLayer.getRadius();
  };
  //设置半径
  this.setRadius = function (value) {
    _this.heatMapLayer.setRadius(value);
  };
  //获取鼠标点击的blur效果
  this.getBlur = function () {
    return _this.heatMapLayer.getBlur();
  };
  //设置半径鼠标点击的blur效果
  this.setBlur = function (value) {
    _this.heatMapLayer.setBlur(value);
  };
  //设置透明度
  this.getOpacity = function () {
    return _this.heatMapLayer.getOpacity();
  };
  //获取透明度
  this.setOpacity = function (value) {
    _this.heatMapLayer.setOpacity(value);
  };
  //获取是否可见
  this.getVisible = function () {
    return _this.heatMapLayer.getVisible();
  };
  //设置是否可见
  this.setVisible = function (value) {
    _this.heatMapLayer.setVisible(value);
  };

  //添加热点图资源feature
  this.addGeoJson = function (nGeoJson) {

    nGeoJson = formateGeojson(nGeoJson);

    var features = (new ol.format.GeoJSON()).readFeatures(nGeoJson, {
      dataProjection: dataProjection,
      featureProjection: featureProjection
    });


    this.heatMapLayer.getSource().addFeatures(features);
  };
};
com.jiusuo.map.TSprinkleLayer = function (option_opts) {
  var option = option_opts;
  //参数【GeoJson,需要显示字段的属性】
  var _this = this;
  this.id = option.id;
  this._tMap = option.tMap;
  this.offsetX = option.offsetX || 0.5;
  this.offsetY = option.offsetY || 0.5;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.geoJson = $.extend(true, {}, option.geoJson);//必需值,为一系列点坐标。
  this.textStyle = option.textStyle || new com.jiusuo.map.style.TText({
    offsetX: _this.offsetX,
    offsetY: _this.offsetY,
    fill: new com.jiusuo.map.style.TFill({
      color: 'red'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'red'
    })
  });
  //数据投影坐标系统设定为4326坐标系。
  var dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  var featureProjection = this._tMap.getProjection().getCode();
  //var featureProjection='EPSG:3857';
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _nFeatures = [];
  var _rFeatures = this.geoJson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var _geoType = rFeature.geometry.type;
      if (_geoType == "Point") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
        rFeature.geometry.coordinates = coordinates[0];
      } else if (_geoType == "LineString") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(rFeature.geometry.coordinates);
        rFeature.geometry.coordinates = coordinates;
      } else if (_geoType == "Polygon") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(rFeature.geometry.coordinates[0]);
        rFeature.geometry.coordinates = [coordinates];
      }
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var _geoType = rFeature.geometry.type;
      if (_geoType == "Point") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
        rFeature.geometry.coordinates = coordinates[0];
      } else if (_geoType == "LineString") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(rFeature.geometry.coordinates);
        rFeature.geometry.coordinates = coordinates;
      } else if (_geoType == "Polygon") {
        var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(rFeature.geometry.coordinates[0]);
        rFeature.geometry.coordinates = [coordinates];
      }
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  var features = function () {
    try {
      return (new ol.format.GeoJSON()).readFeatures(_this.geoJson, {
        dataProjection: dataProjection,
        featureProjection: featureProjection
      });
    } catch (ex) {
      return null;
    }
  };
  this.styleFunction = function (feature) {
    var number = feature.get('number');
    if (number <= 1 || typeof(number) == 'undefined')
      number = '';
    _this.textStyle.setText(number.toString());
    return new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 5,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'rgba(0,236,0,1)'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'black', width: 1
        })
      }),
      text: _this.textStyle
    });
  };
  //新建撒点矢量图层，设置点的显示样式，设定为图片
  this.pointLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: features()
    }),
    style: _this.styleFunction
  });
  this.getVisible = function () {
    return _this.pointLayer.getVisible();
  };
  this.setVisible = function (value) {
    _this.pointLayer.setVisible(value);
  };
  this.setIcon = function (value) {
    _this.iconUrl = value;
  };
  this.getVectorLayer = function () {
    return _this.pointLayer;
  };
  this.setStyle = function (value) {
    _this.pointLayer.setStyle(value);
  };
  this.getId = function () {
    return _this.id;
  };
  this.setId = function (value) {
    _this.id = value;
  }
};
/**
 *类名：com.jiusuo.map.TExtent
 *用途：范围类（矩形），负责创建extent对象
 */
//构造函数，创建extent对象，接收四个float类型参数，第一个为最小x坐标值，第二位最小y坐标值，第三个为最大x坐标值，第四个为最大y坐标值
com.jiusuo.map.TExtent = function (left, bottom, right, top) {
  this.left = left;
  this.bottom = bottom;
  this.right = right;
  this.top = top;
};
//com.jiusuo.map.TExtent类原型声明，包含各类成员方法
com.jiusuo.map.TExtent.prototype = {
  getLeft: function () {
    return this.left
  },//获取extent对象的最小x坐标值
  getBottom: function () {
    return this.bottom
  },//获取extent对象的最小y坐标值
  getRight: function () {
    return this.right
  },//获取extent对象的最大x坐标值
  getTop: function () {
    return this.top
  },//获取extent对象的最大x坐标值
  getExtent: function () {
    return [this.left, this.bottom, this.right, this.top];
  }//获取Openlayers3的extent对象
};
/**
 *@类名：com.jiusuo.map.TLayerConfig
 *@用途：图层配置信息，负责创建一个图层配置对象
 */
//构造函数，创建配置对象，接收两个参数，第一个为TMapService类型对象，第二位图层配置文件的xmlDoc对象
com.jiusuo.map.TLayerConfig = function (mapService, xmlDoc) {
  //获取地图图层名称（服务器端）
  var _infoFile = mapService.getInfoFile();
  var _lindex = _infoFile.lastIndexOf('/');
  this.layerName = _infoFile.substring(_lindex + 1, _infoFile.length - 4);
  //获取地图图层服务类型
  this.type = mapService.getType();
  //获取地图图层服务地址
  this.mapURL = mapService.getMapURL();
  //获取地图图层名称（显示端）
  this.layerNameAlias = mapService.getName();
  //获取图层范围对象
  var $MapBounds = $(xmlDoc).find('MapBounds');
  this.tExtent = new com.jiusuo.map.TExtent(parseFloat($MapBounds.find('Left').text()), parseFloat($MapBounds.find('Bottom').text()), parseFloat($MapBounds.find('Right').text()), parseFloat($MapBounds.find('Top').text()));
  //获取图层瓦片大小
  this.tileSize = [];
  var $TileSize = $(xmlDoc).find('TileSize');
  this.tileSize[0] = parseInt($TileSize.find('Width').text());
  this.tileSize[1] = parseInt($TileSize.find('Height').text());
  //获取图层坐标系统
  this.coordSys = $(xmlDoc).find('CoordSys').text();
  //获取图层解析级别
  var _resolutions = [];
  var $Resolutions = $(xmlDoc).find('Resolutions');
  $Resolutions.find('double').each(function () {
    var $double = $(this);
    _resolutions.push(parseFloat($double.text()));
  });
  this.resolutions = _resolutions;
  //获取图层瓦片格式
  this.imageFormat = $(xmlDoc).find('ImageFormat').text();
  //获取图层默认中心点
  this.defaultCenter = [];
  var $TDefaultCenter = $(xmlDoc).find('DefaultCenter');
  this.defaultCenter[0] = parseFloat($TDefaultCenter.find('X').text());
  this.defaultCenter[1] = parseFloat($TDefaultCenter.find('Y').text());
  //获取图层的切图原点
  this.tileOrigin = [];
  var $TileOrigin = $(xmlDoc).find('TileOrigin');
  this.tileOrigin[0] = parseFloat($TileOrigin.find('X').text());
  this.tileOrigin[1] = parseFloat($TileOrigin.find('Y').text());
  //获取图层的默认缩放级别
  this.defaultZoom = parseInt($(xmlDoc).find('DefaultZoom').text());
  this.tileType = $(xmlDoc).find('TileType').text();//获取图层的类型
  this.singleFile = $(xmlDoc).find('SingleFile').text();//获取是否为单文件
  this.unit = $(xmlDoc).find('Unit').text();//获取图层的空间单位
  this.startLevel = parseInt($(xmlDoc).find('StartLevel').text());//获取图层的起始级别
  this.endLevel = parseInt($(xmlDoc).find('EndLevel').text());//获取图层的结束级别
  this.offseted = $(xmlDoc).find('Offseted').text();//获取图层是否发生偏移
  this.subMapURL = mapService.getSubMapURL();
  this.subInfoFile = mapService.getSubInfoFile();
};
com.jiusuo.map.TLayerConfig.prototype = {
  getExtent: function () {
    return this.tExtent;
  },//获取图层范围对象
  getTileSize: function () {
    return this.tileSize;
  },//获取图层瓦片大小
  getCoordSys: function () {
    return this.coordSys;
  },//获取图层坐标系统
  getResolutions: function () {
    return this.resolutions;
  },//获取图层解析级别
  getImageFormat: function () {
    return this.imageFormat;
  },//获取图层瓦片格式
  getDefaultCenter: function () {
    return this.defaultCenter;
  },//获取图层默认中心点
  getTileOrigin: function () {
    return this.tileOrigin;
  },//获取图层的切图原点
  getDefaultZoom: function () {
    return this.defaultZoom;
  },//获取图层的默认缩放级别
  getTileType: function () {
    return this.tileType;
  },//获取图层的类型
  getSingleFile: function () {
    return this.singleFile;
  },//获取是否为单文件
  getUnit: function () {
    return this.unit;
  },//获取图层的空间单位
  getStartLevel: function () {
    return this.startLevel;
  },//获取图层的起始级别
  getEndLevel: function () {
    return this.endLevel;
  },//获取图层的结束级别
  getOffseted: function () {
    return this.offseted;
  },//获取图层是否发生偏移
  getLayerName: function () {
    return this.layerName;
  },//获取地图图层名称（服务器端）
  getLayerNameAlias: function () {
    return this.layerNameAlias;
  },//获取地图图层名称（显示端）
  getType: function () {
    return this.type;
  },//获取地图图层服务类型
  getMapURL: function () {
    return this.mapURL;
  },//获取地图图层服务地址
  getSubMapURL: function () {
    return this.subMapURL;
  },//
  getSubInfoFile: function () {
    return this.subInfoFile;
  }//
};
/**
 *@类名：com.jiusuo.map.TMapServiceConfig
 *@用途：构建TMapServiceConfig对象，作为TMap对象的输入参数
 */
//构造函数，负责初始化TMapServiceConfig对象，接收一个MapServiceConfig配置文件路径参数
com.jiusuo.map.TMapServiceConfig = function (url, webUrl) {
  if (webUrl) {
    com.jiusuo.map.webUrl = webUrl;
  }
  this.xmlDoc = com.jiusuo.map.TUtils.loadXmlDoc(url);
  this.mapServices = [];
  if (this.xmlDoc != null) {
    var _mapServices = [];
    var _proxyServer = $(this.xmlDoc).find('proxyServer').text();
    var _esService = {};
    _esService.esDataCode = $(this.xmlDoc).find('esService').find('commonSources').find('esDataCode').text();
    _esService.defaultIcon = $(this.xmlDoc).find('esService').find('commonSources').find('defaultIcon').text();
    var _baseDataLayerSources = [];
    $(this.xmlDoc).find('esService').find('baseDataLayer').find('querySource').each(function () {
      var $querySource = $(this);
      var _querySource = {};
      _querySource.type = $querySource.find('type').text();
      _querySource.name = $querySource.find('name').text();
      _querySource.icon = $querySource.find('icon').text();
      _baseDataLayerSources.push(_querySource);
    });
    _esService.baseDataLayerSources = _baseDataLayerSources;
    var _commonSources = [];
    $(this.xmlDoc).find('esService').find('commonSources').find('querySource').each(function () {
      var $querySource = $(this);
      var _querySource = {};
      _querySource.type = $querySource.find('type').text();
      _querySource.icon = $querySource.find('icon').text();
      _querySource.name = $querySource.find('name').text();
      _commonSources.push(_querySource);
    });
    _esService.commonSources = _commonSources;
    var _vedioServer = {};
    _vedioServer.server = $(this.xmlDoc).find('vedioService').find('server').text();
    _vedioServer.username = $(this.xmlDoc).find('vedioService').find('username').text();
    _vedioServer.password = $(this.xmlDoc).find('vedioService').find('password').text();
    _vedioServer.player = $(this.xmlDoc).find('vedioService').find('player').text();
    _vedioServer.manu = $(this.xmlDoc).find('vedioService').find('manu').text();
    _vedioServer.snatshotpath = $(this.xmlDoc).find('vedioService').find('snatshotpath').text();
    $(this.xmlDoc).find('mapServeice').each(function () {
      var $mapServeice = $(this);
      var $subLayer = $mapServeice.find('subLayer');
      var subMapURL = $subLayer.find('subMapURL').text();
      var subInfoFile = $subLayer.find('subInfoFile').text();
      var obj = {
        name: $mapServeice.find('name').text(),
        id: $mapServeice.find('id').text(),
        type: $mapServeice.find('type').text(),
        mapURL: $mapServeice.find('mapURL').text(),
        infoFile: com.jiusuo.map.webUrl + '/' + $mapServeice.find('infoFile').text(),
        subMapURL: subMapURL,
        subInfoFile: subInfoFile
      };
      _mapServices.push(new com.jiusuo.map.TMapService(obj));
    });
    this.mapServices = _mapServices;
    this.esService = _esService;
    this.vedioServer = _vedioServer;
    this.proxyServer = _proxyServer
  }
};
//获取com.jiusuo.map.TMapServiceConfig对象中的TMapService对象数组
com.jiusuo.map.TMapServiceConfig.prototype.getMapServices = function () {
  return this.mapServices;
};
/**
 *@类名：TMapService
 *@用途：构建TMapService对象，表示一个配置对象
 */
//构造函数，初始化com.jiusuo.map.TMapService对象
com.jiusuo.map.TMapService = function (obj) {
  this.name = obj.name;
  this.id = obj.id;
  this.type = obj.type;
  this.mapURL = obj.mapURL;
  this.infoFile = obj.infoFile;
  this.subMapURL = obj.subMapURL;
  this.subInfoFile = obj.subInfoFile;
};
com.jiusuo.map.TMapService.prototype = {
  getName: function () {
    return this.name;
  },//地图服务名称
  getId: function () {
    return this.id;
  },//地图服务id
  getType: function () {
    return this.type;
  },//地图服务type
  getMapURL: function () {
    return this.mapURL;
  },//地图服务请求地址
  getInfoFile: function () {
    return this.infoFile;
  },//地图服务的图层配置文件地址
  getSubMapURL: function () {
    return this.subMapURL;
  },//
  getSubInfoFile: function () {
    return this.subInfoFile;
  }//
};
/**
 *@类名：com.jiusuo.map.TUtils
 *@用途：工具类，构建TUtils对象
 */
//构造函数，创建TUtils对象
com.jiusuo.map.TUtils = function () {
};
//加载MapServiceConfig配置文件，并返回一个xmlDoc对象
com.jiusuo.map.TUtils.loadXmlDoc = function (filePath) {
  var xmlDoc = null;
  jQuery.ajax({
    async: false,
    cache: true,
    type: "GET",
    dataType: "xml",
    url: filePath,
    crossDomain: true,
    error: function (xml) {
      var d = dialog({
        title: '提示',
        content: '加载xmlDoc失败：' + xml
      });
      d.showModal();
    },
    timeout: 1000,
    success: function (xml) {
      xmlDoc = xml;
    }
  });
  return xmlDoc;
};
//加载jsg配置文件，并返回一个json对象
com.jiusuo.map.TUtils.loadJsonDoc = function (filePath) {
  var jsonDoc = null;
  jQuery.ajax({
    async: false,
    cache: true,
    type: "GET",
    dataType: "json",
    url: filePath,
    crossDomain: true,
    error: function (json) {
      var d = dialog({
        title: '提示',
        content: '加载jsonDoc失败：' + json
      });
      d.showModal();
    },
    timeout: 1000,
    success: function (json) {
      jsonDoc = json;
    }
  });
  return jsonDoc;
};
com.jiusuo.map.TUtils.createGUID = function () {
  return 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
/**
 * @类名：图层切换
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：构建图层切换工具
 */
com.jiusuo.map.TLayerSwapeControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '主题切换';
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
   // + "<div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_55.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_55.png' width='36px' height='36px' class='img2'></div>"
    + "</div>"
    + "<div class='triangle'></div>"
    + "<div id='switch_layer' class='set_pop set_pop2 set_pop_right8'>"
    + "<div class='margin'>"
    + "<div class='title'>地图主题</div>"
    + "<div class='net'></div>"
    + "<div class='wrap wrap2' id='baselayers'>"
    + "</div>"
    + "</div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  // div.prependTo($('#ctm_tool_list'));
  var layers = _this._tMap.getLayers();
  var layer=localStorage.getItem("layer")=='0'?1:0;
  for (var i = layers.length - 1; i >= 0; i--) {
    var layerName = layers[i].getLayerName();
    if (i == layer) {
      $('#baselayers').prepend($("<label class='label2 label'><input type='radio' name='layer' checked='checked' value='" + i + "'>" + layerName + "</label><br>"));
    } else {
      $('#baselayers').prepend($("<label class='label2 label'><input type='radio' name='layer'  value='" + i + "'>" + layerName + "</label><br>"));
    }
  }
  $("input[name='layer']").change(function (value) {
    var value = $("input[name='layer']:checked").val();
    com.jiusuo.map.TLayerSwapeControl.handleSwape(value, _this._tMap);
    $("#switch_layer").css("display","none");
  });
};
com.jiusuo.map.TLayerSwapeControl.handleSwape = function (value, tMap) {//切换点击事件
  var layerIndex = parseInt(value);
  var layers = tMap.getLayers();
  var myMap = tMap;
  layers.forEach(function (layer, i) {
    if (i < (layers.length)) {
      if (layerIndex == i) {
        tMap.baseLayer = layer;
        layer.setLayerVisible(true);
        var old_pro = myMap.getProjection().getCode();
        var old_zoom = myMap.getOMap().getView().getZoom();
        var old_center = myMap.getOMap().getView().getCenter();
        myMap.getOMap().setView(layer.getView());//控制是否切换view，一旦开启，不同坐标系的地图数据将不能融合
        var new_center = com.jiusuo.map.TGeometryUtils.coortransform(old_center, old_pro, myMap.getProjection().getCode());
        if (old_pro != myMap.getProjection().getCode()) {
          if (old_pro == "EPSG:3857") {
            new_center = com.jiusuo.map.TGeometryUtils.coortransform(old_center, old_pro, myMap.getProjection().getCode());
            new_center = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([new_center])[0];
          } else {
            new_center = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([old_center])[0];
            new_center = com.jiusuo.map.TGeometryUtils.coortransform(new_center, old_pro, myMap.getProjection().getCode());
          }
        }
        myMap.getOMap().getView().setCenter(new_center);
        myMap.getOMap().getView().setZoom(old_zoom);
        if (myMap.currentOverViewMap) {
          com.jiusuo.map.JiusuoMap.setOverViewMap({collapsed: myMap.currentOverViewMap.getCollapsed()}, myMap);
        }
        localStorage.setItem("layer",value);
      } else {
        layer.setLayerVisible(false);
      }
    }
  });
};

/**
 * @类名：测量距离
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：构建测量工具
 */
com.jiusuo.map.TMeasureLengthControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '测量距离';
  var optionDraw = {
    tMap: _this._tMap,
    style: options.style,
    startFunction: options.startFunction || function (f) {
    },
    endFunction: options.endFunction || function (f) {
    }
  };
  var handleMeasure = function () {
    var tMeasure = new com.jiusuo.map.TMeasure(_this._tMap);
    tMeasure.measure('length', false, optionDraw);
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + " <div class='img' id='" + controlContainer + "_ctm_tool_pop_measurel'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_06.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_06.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_measurel').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：测量面积
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：构建测量工具
 */
com.jiusuo.map.TMeasureAreaControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '测量面积';
  var optionDraw = {
    tMap: _this._tMap,
    style: options.style,
    startFunction: options.startFunction || function (f) {
    },
    endFunction: options.endFunction || function (f) {
    }
  };
  var handleMeasure = function () {
    var tMeasure = new com.jiusuo.map.TMeasure(_this._tMap);
    tMeasure.measure('area', false, optionDraw);
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + " <div class='img' id='" + controlContainer + "_ctm_tool_pop_measurea'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_14.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_14.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_measurea').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：测量类
 * @父类：
 * @参数：无.
 * @用途：构建测量方法
 */
com.jiusuo.map.TMeasure = function (tMap) {
  this._tMap = tMap;
};
com.jiusuo.map.TMeasure.prototype.measure = function (type, isGeodesic, optionDraw) {
  var myTMap = this._tMap;
  var wgs84Sphere = new ol.Sphere(6378137);
  var sketch;
  var measureTooltipElement;
  var measureTooltip;

  //创建测量结果显示标注
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 't-tooltip t-tooltip-measure';
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    myTMap.measureOverlays.push(measureTooltip);
    myTMap.getOMap().addOverlay(measureTooltip);
  }

  //计算长度
  var formatLength = function (line) {
    if (myTMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      line = com.jiusuo.map.TGeometryUtils.geomtransform(line, myTMap.getOMap().getView().getProjection().getCode(), 'EPSG:3857');
    }
    var length;
    if (isGeodesic) {
      var coordinates = line.getCoordinates();
      length = 0;
      var sourceProj = null;
      sourceProj = myTMap.getOMap().getView().getProjection();
      for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        length += wgs84Sphere.haversineDistance(c1, c2);
      }
    } else {
      length = Math.round(line.getLength() * 100) / 100;
    }
    var output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
  };
  //计算面积
  var formatArea = function (polygon) {
    if (myTMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      polygon = com.jiusuo.map.TGeometryUtils.geomtransform(polygon, myTMap.getOMap().getView().getProjection().getCode(), 'EPSG:3857');
    }
    var area;
    if (isGeodesic) {
      var sourceProj = null;
      sourceProj = myTMap.getOMap().getView().getProjection();
      var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(sourceProj, 'EPSG:4326'));
      var coordinates = geom.getLinearRing(0).getCoordinates();
      area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    } else {
      area = polygon.getArea();
    }
    var output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
  };

  //绘制交互操作
  function addInteraction() {
    createMeasureTooltip(myTMap.getOMap());
    var listener;
    myTMap.getCurrentInteraction('measure').on('drawstart',
      function (evt) {
        //如果有传入optionDraw，则调用 start
        if (optionDraw.startFunction != null && optionDraw.startFunction != "") {
          optionDraw.startFunction(evt);
        }
        // set sketch
        sketch = evt.feature;
        /** @type {ol.Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;
        listener = sketch.getGeometry().on('change', function (evt) {
          var geom = evt.target;
          var output;
          if (geom instanceof ol.geom.Polygon) {
            output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(/** @type {ol.geom.LineString} */ (geom));
            tooltipCoord = geom.getLastCoordinate();
          }
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });
      }, this);
    myTMap.getCurrentInteraction('measure').on('drawend',
      function (evt) {
        //如果有传入optionDraw，则调用 start
        if (optionDraw.endFunction != null && optionDraw.endFunction != "") {
          optionDraw.endFunction(evt);
        }
        //end
        measureTooltipElement.className = 't-tooltip t-tooltip-static';
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        ol.Observable.unByKey(listener);
        myTMap.removeCurrentInteraction('measure');
      }, this);
  }

  var _type = (type == 'area' ? 'Polygon' : 'LineString');
  var draw = new ol.interaction.Draw({
    source: myTMap.getVectorLayer('baseVector').getSource(),
    type: /** @type {ol.geom.GeometryType} */ (_type),
    style: new com.jiusuo.map.style.TStyle({
      fill: new com.jiusuo.map.style.TFill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new com.jiusuo.map.style.TStroke({
        color: 'rgba(255, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new com.jiusuo.map.style.TCircle({
        radius: 5,
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(255, 0, 0, 0.7)'
        }),
        fill: new com.jiusuo.map.style.TFill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  });
  myTMap.removeCurrentInteraction('measure');
  myTMap.addCurrentInteraction('measure', draw);
  addInteraction();
};
/**
 * @类名：画点控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：绘制点元素控件
 */
com.jiusuo.map.TDrawPointControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制点';
  var optionDraw = {
    tMap: _tMap,
    style: options.style,
    startFunction: options.startFunction,
    endFunction: options.endFunction
  };
  var handleMeasure = function () {
    //this_.getMap().getView().setRotation(0);
    var draw = new com.jiusuo.map.TDraw(optionDraw);
    draw.DrawHandle("Point");
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_drawpoint'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_09.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_09.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_drawpoint').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：画线控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：绘制线元素控件
 */
com.jiusuo.map.TDrawLineControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制线';
  var optionDraw = {
    tMap: _tMap,
    style: options.style,
    startFunction: options.startFunction,
    endFunction: options.endFunction
  };
  var handleMeasure = function () {
    //this_.getMap().getView().setRotation(0);
    var draw = new com.jiusuo.map.TDraw(optionDraw);
    draw.DrawHandle("LineString");
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_drawpolyline'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_091.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_091.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_drawpolyline').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：画多边形控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：绘制多边形元素控件
 */
com.jiusuo.map.TDrawPolygonControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制多边形';
  var optionDraw = {
    tMap: _tMap,
    style: options.style,
    startFunction: options.startFunction,
    endFunction: options.endFunction
  };
  var handleMeasure = function () {
    var draw = new com.jiusuo.map.TDraw(optionDraw);
    draw.DrawHandle("Polygon");
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_drawpolygon'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_29.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_29.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_drawpolygon').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：画圆控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：绘制圆元素控件
 */
com.jiusuo.map.TDrawCircleControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制圆';
  var optionDraw = {
    tMap: _tMap,
    style: options.style,
    startFunction: options.startFunction,
    endFunction: options.endFunction
  };
  var handleMeasure = function () {
    var draw = new com.jiusuo.map.TDraw(optionDraw);
    draw.DrawHandle("Circle");
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_drawcircle'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_25.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_25.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_drawcircle').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：画矩形控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：绘制圆元素控件
 */
com.jiusuo.map.TDrawRectControl = function (opt_options) {
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制矩形';
  var optionDraw = {
    tMap: this._tMap,
    style: options.style,
    startFunction: options.startFunction,
    endFunction: options.endFunction
  };
  var handleMeasure = function () {
    //this_.getMap().getView().setRotation(0);
    var draw = new com.jiusuo.map.TDraw(optionDraw);
    draw.DrawHandle("Rectangle");
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img'id='" + controlContainer + "_ctm_tool_pop_drawrect'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_27.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_27.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_drawrect').on('click', function (evt) {
    handleMeasure();
  });
};
/**
 * @类名：绘制工具
 * @父类：
 * @参数：
 * @用途：绘制点元素
 */
com.jiusuo.map.TDraw = function (option_ops) {
  this.option = option_ops != null ? option_ops : {};
  this._tMap = this.option.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.draw = null;
  this.style = this.option.style || new com.jiusuo.map.style.TStyle({
    fill: new com.jiusuo.map.style.TFill({
      color: 'rgba(255, 0, 0, 0.2)'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2
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
  this.startFunction = this.option.startFunction || function () {
  };
  this.endFunction = this.option.endFunction || function () {
  };
  this.source = this._tMap.getVectorLayer('baseVector').getSource();

};
com.jiusuo.map.TDraw.prototype.DrawHandle = function (type) {

  this._tMap.removeCurrentInteraction('draw');
  if (type == 'Rectangle') {
    this.draw = new ol.interaction.Draw({
      source: this.source,
      type: "LineString",
      style: this.style,
      maxPoints: 2,
      geometryFunction: function (coordinates, geometry) {
        if (!geometry) {
          geometry = new com.jiusuo.map.geom.TPolygon(null);
        }
        var start = coordinates[0];
        var end = coordinates[1];
        geometry.setCoordinates([
          [start, [start[0], end[1]], end, [end[0], start[1]], start]
        ]);
        return geometry;
      },
    });
  } else {
    this.draw = new ol.interaction.Draw({
      source: this.source,
      type: type,
      style: this.style
    });
  }
  this._tMap.addCurrentInteraction('draw', this.draw);
  this.draw.on('drawstart', this.startFunction);
  this.draw.on('drawend', this.endFunction);
};
/**
 * @类名：控制实时轨迹播放控件的控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：控制实时轨迹播放控件的显示
 */
com.jiusuo.map.TPathAnimationControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  //var iconStyle = options.iconStyle||'midnight';
  this.routeControl = new com.jiusuo.map.TPathAnimation(this._tMap);
  var image = document.createElement('img');
  image.src = com.jiusuo.map.webUrl + '/data/icon/i_play_startctrl_' + com.jiusuo.map.iconStyle + '.png';
  image.title = options.tipLabel != null ? options.tipLabel : '实时轨迹播放器';
  image.className = 'ol-control-img';
  var handleMeasure = function () {
    if (_this._tMap.pathControl != null) {
      if (!_this._tMap.pathControl.routeControl.getVisible()) {
        _this._tMap.pathControl.routeControl.setVisible(true);
      } else {
        _this._tMap.pathControl.routeControl.setVisible(false);
      }
    }
  };
  image.addEventListener('click', handleMeasure, false);
  image.addEventListener('touchstart', handleMeasure, false);
  var element = document.createElement('div');
  element.className = 'tmap-path-animationcontrol ol-unselectable ol-control';
  element.appendChild(image);
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(com.jiusuo.map.TPathAnimationControl, ol.control.Control);
/**
 * @类名：实时轨迹播放控件
 * @父类：
 * @参数：
 * @用途：用于创建轨迹、播放、暂停、停止、展示轨迹列表
 */
com.jiusuo.map.TPathAnimation = function (_tMap) {
  var _this = this;
  this._tMap = _tMap;
  this.listBox = document.createElement('div');
  this.listBox.className = 'tmap-path-animation－listbox';
  this._tMap.getOMap().getTargetElement().appendChild(this.listBox);
};
com.jiusuo.map.TPathAnimation.prototype.setVisible = function (value) {
  if (value) {
    this.listBox.className = 'tmap-path-animation－listbox';
  } else {
    this.listBox.className = 'tmap-path-animation－listbox-hidden';
  }
};
com.jiusuo.map.TPathAnimation.prototype.getVisible = function () {
  return this.listBox.className == 'tmap-path-animation－listbox' ? true : false;
};
com.jiusuo.map.TPathAnimation.prototype.addPath = function (route) {
  var index = this._tMap.getPathList().getLength();
  this._tMap.getPathList().push(route);
  this.listBox.innerHTML += "<div id='" + index + "' name='divs' style='float: left;margin-top: 5px'><div class='checkboxFour'><input id='" + "checkboxFourInput_" + index + "' type='checkbox' name='troutes' checked='checked' value='" + index + "'><label for='" + "checkboxFourInput_" + index + "'></label></div><span style='display:inline-block;width: 150px'><strong>" + route.getRouteName() + "</strong></span><img name='sees' id='" + "sees_" + index + "' style='height: 15px;' src='" + com.jiusuo.map.webUrl + "/data/icon/i_eye_opened_" + com.jiusuo.map.iconStyle + ".png'><img name='removes' id='" + "removes_" + index + "' style='height: 15px;' src='" + com.jiusuo.map.webUrl + "/data/icon/i_play_remove_" + com.jiusuo.map.iconStyle + ".png'></div>";
  this.listBox.className = 'tmap-path-animation－listbox';
  this._tMap.addPathLayer(route);
  var _tMap = this._tMap;
  $("input[name='troutes']").click(function () {
    var _index = parseInt($(this).attr('value'));
    var _route = _tMap.getPathList().item(_index);
    if ($(this).attr('checked')) {
      $(this).attr('checked', false);
      _route.setVisible(false);
      _route.setEnableAdd(false);
    } else {
      $(this).attr('checked', 'checked');
      _route.setVisible(true);
      _route.setEnableAdd(true);
    }
  });
  $("img[name='sees']").click(function () {
    var src = $(this).attr('src');
    var id = $(this).attr('id');
    var _route = _tMap.getPathList().item(id.substring(5));
    if (src == com.jiusuo.map.webUrl + '/data/icon/i_eye_closed_' + com.jiusuo.map.iconStyle + '.png') {
      $(this).attr('src', com.jiusuo.map.webUrl + '/data/icon/i_eye_opened_' + com.jiusuo.map.iconStyle + '.png');
      _route.setRouteVisible(true);
    } else {
      $(this).attr('src', com.jiusuo.map.webUrl + '/data/icon/i_eye_closed_' + com.jiusuo.map.iconStyle + '.png');
      _route.setRouteVisible(false);
    }
  });
  $("img[name='removes']").click(function () {
    var removeRoute = confirm("是否删除该轨迹?");
    if (removeRoute) {
      var id = $(this).attr('id');
      var _route = _tMap.getPathList().item(id.substring(8));
      _route.setVisible(false);
      _route.setEnableAdd(false);
      $("div[name='divs']").each(function () {
        if ($(this).attr('id') == id.substring(8)) {
          $(this).hide();
        }
      });
    }
  });
};
/**
 * @类名：实时轨迹对象
 * @父类：
 * @参数：
 * @用途：通过geojson创建实时轨迹对象，并定义轨迹的事件
 */
com.jiusuo.map.TPath = function (opt_options) {
  this.options = opt_options || {};
  var _this = this;
  this._tMap = this.options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.routeName = this.options.routeName;
  this.movingMarker = this.options.movingMarker || com.jiusuo.map.webUrl + '/data/icon/i_gps_open.png';
  this.playedMarker = this.options.playedMarker;
  this.routeId = this.options.routeId || com.jiusuo.map.TUtils.createGUID();
  this.routeColor = this.options.routeColor || [255, 0, 0];
  this.isLocating = this.options.isLocating || false;
  //数据投影坐标系统设定为4326坐标系。
  this.dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  this.featureProjection = this._tMap.getProjection().getCode();
  this.styles = {
    'route': new com.jiusuo.map.style.TStyle({
      stroke: new com.jiusuo.map.style.TStroke({
        width: 3, color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1]
      })
    }),
    'Point1': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        rotation: 0,
        src: _this.movingMarker
      })
    }),
    'Point': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 4,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: [255, 255, 255, 1.0]}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1], width: 3
        })
      })
    }),
    'Point2': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 4,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: [255, 255, 255, 1.0]}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1], width: 3
        })
      })
    }),
    'played': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        rotation: 0,
        src: _this.playedMarker
      })
    })
  };
  this.tyleFunction = function (feature) {
    return _this.styles[feature.get('type')];
  };
  this.hidePathTyleFunction1 = function (feature) {
    if (feature.get('type') == 'route' || feature.get('type') == 'played' || feature.get('type') == 'Point2') {
      return null;
    }
    return _this.styles[feature.get('type')];
  };
  this.pointsLayer = new ol.layer.Vector({
    source: new ol.source.Vector({}),
    style: _this.tyleFunction
  });
  var tFlashCenter = new com.jiusuo.map.TFlashCenter(this._tMap);
  this.points = [];
  this.features = [];
  this.route = null;
  this.routeFeature = null;
  this.feature = null;
  this.enableAdd = true;
  this.addPosition = function (geojson, properties) {
    var coordinates;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geojson.coordinates]);
      geojson.coordinates = coordinates[0];
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([geojson.coordinates]);
      geojson.coordinates = coordinates[0];
    }
    if (_this.enableAdd) {
      var geom = (new ol.format.GeoJSON()).readGeometry(geojson, {
        dataProjection: _this.dataProjection,
        featureProjection: _this.featureProjection
      });
      _this.points.push(geom.getCoordinates());
      if (_this.routeFeature) {
        _this.pointsLayer.getSource().removeFeature(_this.routeFeature);
      }
      _this.route = new com.jiusuo.map.geom.TPolyline(_this.points, 'XY');
      _this.routeFeature = new com.jiusuo.map.TFeature({
        type: 'route',
        geometry: _this.route
      });
      _this.pointsLayer.getSource().addFeature(_this.routeFeature);
      if (_this.feature) {
        _this.pointsLayer.getSource().removeFeature(_this.feature);
      }
      _this.feature = new com.jiusuo.map.TFeature(geom);
      if (_this.movingMarker) {
        _this.feature.set('type', 'Point1');
      } else {
        _this.feature.set('type', 'Point');
      }
      _this.nfeature = new com.jiusuo.map.TFeature(geom);
      if (_this.playedMarker) {
        _this.nfeature.set('type', 'played');
      } else {
        _this.nfeature.set('type', 'Point2');
      }
      if (properties) {
        properties.forEach(function (property) {
          _this.nfeature.set(property[0], property[1]);
        });
      }
      _this.features.push(_this.nfeature);
      _this.pointsLayer.getSource().addFeatures(_this.features);
      tFlashCenter.flash(_this.feature);
      _this.pointsLayer.getSource().addFeature(_this.feature);

      if (this.isLocating) {
        _this._tMap.getOMap().getView().setCenter(geom.getCoordinates());
      }
    }
  };
  this.getRouteName = function () {
    return _this.routeName;
  };
  this.getRouteId = function () {
    return _this.routeId;
  };
  this.getVectorLayer = function () {
    return _this.pointsLayer;
  };
  this.setEnableAdd = function (value) {
    _this.enableAdd = value;
  };
  this.setVisible = function (value) {
    _this.pointsLayer.setVisible(value);
  };
  this.setRouteVisible = function (value) {
    if (!value) {
      _this.pointsLayer.setStyle(_this.hidePathTyleFunction1);
    } else {
      _this.pointsLayer.setStyle(_this.tyleFunction);
    }
  };
};
/**
 * @类名：控制轨迹播放控件的控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：控制轨迹播放控件的显示
 */
com.jiusuo.map.TRouteAnimationControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var isHideAnimation = options.hideAnimation;//add by smh
  //var iconStyle = options.iconStyle||'midnight';
  this.routeControl = new com.jiusuo.map.TRouteAnimation(_tMap, isHideAnimation);
  var div = document.createElement('div');
  div.className = 'routeanimate_ctrl';

  var image = document.createElement('img');
  image.width = 52;
  image.height = 52;
  image.src = com.jiusuo.map.webUrl + '/data/icon/i_play_startctrl_' + com.jiusuo.map.iconStyle + '.png';
  image.title = "轨迹播放";
  var span = document.createElement('span');
  span.className = 'title';
  span.innerText = '轨迹播放';
  div.appendChild(image);
  div.appendChild(span);
  var handleMeasure = function () {
    if (_tMap.routeControl != null) {
      if (!_tMap.routeControl.routeControl.getVisible()) {
        _tMap.routeControl.routeControl.setVisible(true);
      } else {
        _tMap.routeControl.routeControl.setVisible(false);
      }
    }
  };
  image.addEventListener('click', handleMeasure, false);
  image.addEventListener('touchstart', handleMeasure, false);
  ol.control.Control.call(this, {
    element: div,
    target: options.target
  });
};
ol.inherits(com.jiusuo.map.TRouteAnimationControl, ol.control.Control);
/**
 * @类名：轨迹播放控件
 * @父类：
 * @参数：
 * @用途：用于创建轨迹、播放、暂停、停止、展示轨迹列表
 */
com.jiusuo.map.TRouteAnimation = function (_tMap, isHideAnimation) {
  var _this = this;
  this._tMap = _tMap;
  var myTMap = _tMap;
  this.listBox = document.createElement('div');
  this.listBox.className = 'tmap-route-animation－listbox-hidden';
  this.colorPicker = document.createElement('div');
  this.colorPicker.className = 'tmap-route-animation－colorpicker-hidden';
  //控件内部边框
  this.outerBox = document.createElement('div');
  this.outerBox.className = 'tmap-route-animation－outerBox';
  var slider = document.createElement('input');
  slider.id = 'progress_slider';
  slider.type = 'range';
  slider.min = 0;
  slider.max = 100;
  slider.step = 1;
  slider.value = 0;
  slider.className = 'tmap-route-animation－slider';
  slider.onclick = function () {
    var slider_index = Math.round($('#progress_slider').val() / 100 * maxLength);
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        var temp_route_coors = _route.getTemp_route_coors();
        var allcoors = _route.getAllCoors();
        if (temp_route_coors.length == allcoors.length) {

        } else {
          var new_temp_route_coors = [];
          for (var i = 0; i < slider_index; i++) {
            if (slider_index <= allcoors.length) {
              new_temp_route_coors.push(allcoors[i][0]);
            }
          }
          // _route.setTemp_route_coors(new_temp_route_coors);
          _route.setIndex(slider_index);
          // _route.startAnimation();
          pauseImg.click();
        }
      }
    });
  };
  this.outerBox.appendChild(slider);
  var buttons = document.createElement('div');
  buttons.className = 'tmap-route-animation－buttons';

  buttons.appendChild(slider);
  this.outerBox.appendChild(buttons);
  var times = document.createElement('div');
  times.className ="tmap-route-animation－buttons";
 /* var routeListImg = document.createElement('img');
  routeListImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_list_' + com.jiusuo.map.iconStyle + '.png';
  routeListImg.title = '列表';
  routeListImg.className = 'tmap-route-animation－button';
  routeListImg.onclick = function () {
    if (_this.listBox.className == 'tmap-route-animation－listbox-hidden') {
      _this.listBox.className = 'tmap-route-animation－listbox';
    } else {
      _this.listBox.className = 'tmap-route-animation－listbox-hidden';
    }
  };
  times.appendChild(routeListImg);*/
  var startImg = document.createElement('img');
  startImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_start_' + com.jiusuo.map.iconStyle + '.png';
  startImg.title = '开始';
  startImg.id = 'startImgId';
  startImg.className = 'tmap-route-animation－button';
  var t;
  var startEnabled = true;
  var pauseEnabled = false;
  var stopEnabled = false;
  var maxLength = 0;
  var max_route;
  startImg.onclick = function () {
    if (!startEnabled) {
      return;
    }
    startImg.className = 'tmap-route-animation－button-nactive';
    stopImg.className = 'tmap-route-animation－button';
    pauseImg.className = 'tmap-route-animation－button';
    slowImg.className = 'tmap-route-animation－button';
    fastImg.className = 'tmap-route-animation－button';
    startEnabled = false;
    pauseEnabled = true;
    stopEnabled = true;
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        _route.startAnimation();
        if (_route.getRouteLength() > maxLength) {
          max_route = _route;
        }
        maxLength = _route.getRouteLength() > maxLength ? _route.getRouteLength() : maxLength;
      }
    });
    var hasVisible = false;
    t = setInterval(function () {
      hasVisible = false;
      $("input[name='troutes'][checked]").each(function () {
        if ($(this).attr('checked')) {
          var _index = parseInt($(this).attr('value'));
          var _route = myTMap.getRouteList().item(_index);
          var visible = _route.getVisible();
          if (visible) {
            hasVisible = true;
          }
          if (!visible) {
            _route.stopAnimation();
          }
        }
      });
      if (!hasVisible) {
        $('#progress_slider').val(0);
        $('#nowTimeText').text('');
        clearInterval(t);
        startImg.className = 'tmap-route-animation－button';
        stopImg.className = 'tmap-route-animation－button-nactive';
        pauseImg.className = 'tmap-route-animation－button-nactive';
        slowImg.className = 'tmap-route-animation－button-nactive';
        fastImg.className = 'tmap-route-animation－button-nactive';
        startEnabled = true;
        pauseEnabled = false;
        stopEnabled = false;
      }
      if (max_route) {
        $('#progress_slider').val((max_route.getOverlength() + 1) / max_route.getRouteLength() * 100);
        if (max_route.getPlayFinished()) {
          clearInterval(t);
          startImg.className = 'tmap-route-animation－button';
          stopImg.className = 'tmap-route-animation－button-nactive';
          pauseImg.className = 'tmap-route-animation－button-nactive';
          slowImg.className = 'tmap-route-animation－button-nactive';
          fastImg.className = 'tmap-route-animation－button-nactive';
          startEnabled = true;
          pauseEnabled = false;
          stopEnabled = false;
          $('#progress_slider').val(0);
          $('#nowTimeText').text('');
        }
      }
    }, 500);
  };
  times.appendChild(startImg);
  var pauseImg = document.createElement('img');
  pauseImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_pause_' + com.jiusuo.map.iconStyle + '.png';
  pauseImg.title = '暂停';
  pauseImg.className = 'tmap-route-animation－button-nactive';
  pauseImg.onclick = function () {
    if ($('#progress_slider').val() == '0') {
      return;
    }
    startImg.className = 'tmap-route-animation－button';
    stopImg.className = 'tmap-route-animation－button';
    pauseImg.className = 'tmap-route-animation－button-nactive';
    slowImg.className = 'tmap-route-animation－button-nactive';
    fastImg.className = 'tmap-route-animation－button-nactive';
    startEnabled = true;
    pauseEnabled = false;
    stopEnabled = true;
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        _route.pauseAnimation();
      }
    });
    clearInterval(t);
  };
  times.appendChild(pauseImg);
  var stopImg = document.createElement('img');
  stopImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_stop_' + com.jiusuo.map.iconStyle + '.png';
  stopImg.title = '停止';
  stopImg.disabled = 1;
  stopImg.id = 'stopImgId';
  stopImg.className = 'tmap-route-animation－button-nactive';
  stopImg.onclick = function () {
    if ($('#progress_slider').val() == '0') {
      return;
    }
    startImg.className = 'tmap-route-animation－button';
    stopImg.className = 'tmap-route-animation－button-nactive';
    pauseImg.className = 'tmap-route-animation－button-nactive';
    slowImg.className = 'tmap-route-animation－button-nactive';
    fastImg.className = 'tmap-route-animation－button-nactive';
    startEnabled = true;
    pauseEnabled = true;
    stopEnabled = false;
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        _route.stopAnimation();
      }
    });
    clearInterval(t);
    $('#progress_slider').val(0);
    $('#nowTimeText').text('');
  };
  times.appendChild(stopImg);
  var slowImg = document.createElement('img');
  slowImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_slower_' + com.jiusuo.map.iconStyle + '.png';
  slowImg.title = '减速';
  slowImg.disabled = 1;
  slowImg.className = 'tmap-route-animation－button-nactive';
  slowImg.onclick = function () {
    if ($('#progress_slider').val() == '0') {
      return;
    }
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        _route.pauseAnimation();
        var oldSpeed = parseFloat(_route.getSpeed());
        var newSpeed = oldSpeed * 2;
        _route.setSpeed(newSpeed);
        _route.startAnimation();
      }
    });
  };
  times.appendChild(slowImg);
  var fastImg = document.createElement('img');
  fastImg.src = com.jiusuo.map.webUrl + '/data/icon/i_play_faster_' + com.jiusuo.map.iconStyle + '.png';
  fastImg.title = '加速';
  fastImg.disabled = 1;
  fastImg.className = 'tmap-route-animation－button-nactive';
  fastImg.onclick = function () {
    if ($('#progress_slider').val() == '0') {
      return;
    }
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = parseInt($(this).attr('value'));
        var _route = myTMap.getRouteList().item(_index);
        _route.pauseAnimation();
        var oldSpeed = parseFloat(_route.getSpeed());
        var newSpeed = oldSpeed / 2;
        _route.setSpeed(newSpeed);
        _route.startAnimation();
      }
    });
  };
  times.appendChild(fastImg);
  var nowNameText = document.createElement('span');
  nowNameText.id ='nowNameText';
  nowNameText.className = 'tmap-route-animation－times';
  times.appendChild(nowNameText);
  var nowTimeText = document.createElement('span');
  nowTimeText.id ='nowTimeText';
  nowTimeText.className = 'tmap-route-animation－times';
  times.appendChild(nowTimeText);
  this.element = document.createElement('div');
  if (isHideAnimation) {
    this.element.className = 'tmap-route-animation-hidden';
  } else {
    this.element.className = 'tmap-route-animation';
  }
  // this.element.className = 'tmap-route-animation';
  this.element.appendChild(buttons);
  this.element.appendChild(times);
  this.element.appendChild(this.listBox);
  this.element.appendChild(this.colorPicker);
  myTMap.getOMap().getTargetElement().appendChild(this.element);
};
com.jiusuo.map.TRouteAnimation.prototype.setVisible = function (value) {
  if (value) {
    this.element.className = 'tmap-route-animation';
    // this.listBox.className = 'tmap-route-animation－listbox';
  } else {
    this.element.className = 'tmap-route-animation-hidden';
    this.listBox.className = 'tmap-route-animation－listbox-hidden';
  }
};
com.jiusuo.map.TRouteAnimation.prototype.getVisible = function () {
  return this.element.className == 'tmap-route-animation' ? true : false;
};
com.jiusuo.map.TRouteAnimation.prototype.addRoute = function (route) {
  var colorDiv = this.colorPicker;
  var index = this._tMap.getRouteList().getLength();
  this._tMap.getRouteList().push(route);
  this.listBox.innerHTML += "<div id='" + index + "' name='divs' style='float: left;margin-top: 5px'><div class='checkboxFour'><input id='" + "checkboxFourInput_" + index + "' type='checkbox' name='troutes' checked='checked' value='" + index + "'><label for='" + "checkboxFourInput_" + index + "'></label></div><span style='display:inline-block;width: 150px;color:#ffffff'><strong>" + route.getRouteName() + "</strong></span>&nbsp;<img name='colors' id='" + "colors_" + index + "' style='height: 13px;width:13px;background-color: red;cursor: pointer;' src='" + com.jiusuo.map.webUrl + "/data/icon/i_play_color_" + com.jiusuo.map.iconStyle + ".png'><img name='sees' id='" + "sees_" + index + "' style='height: 13px;width:13px;cursor: pointer;' src='" + com.jiusuo.map.webUrl + "/data/icon/i_eye_closed_" + com.jiusuo.map.iconStyle + ".png'><img name='removes' id='" + "removes_" + index + "' style='height: 13px; width: 13px;cursor: pointer;' src='" + com.jiusuo.map.webUrl + "/data/icon/i_play_remove_" + com.jiusuo.map.iconStyle + ".png'></div>";
  this.listBox.className = 'tmap-route-animation－listbox';
  this._tMap.addRouteLayer(route);
  var myTMap = this._tMap;
  $("input[name='troutes']").click(function () {
    var _index = parseInt($(this).attr('value'));
    var _route = myTMap.getRouteList().item(_index);
    if ($(this).attr('checked')) {
      $(this).attr('checked', false);
      _route.setVisible(false);
      _route.stopAnimation(true);
    } else {
      $(this).attr('checked', 'checked');
      _route.setVisible(true);
    }
  });
  $("img[name='sees']").click(function () {
    var src = $(this).attr('src');
    var id = $(this).attr('id');
    var _route = myTMap.getRouteList().item(id.substring(5));
    if (src == com.jiusuo.map.webUrl + '/data/icon/i_eye_opened_' + com.jiusuo.map.iconStyle + '.png') {
      $(this).attr('src', com.jiusuo.map.webUrl + '/data/icon/i_eye_closed_' + com.jiusuo.map.iconStyle + '.png');
      _route.setRouteVisible(false);
    } else {
      $(this).attr('src', com.jiusuo.map.webUrl + '/data/icon/i_eye_opened_' + com.jiusuo.map.iconStyle + '.png');
      _route.setRouteVisible(true);
    }
  });
  $("img[name='removes']").click(function () {
    var removeRoute = confirm("是否删除该轨迹?");
    if (removeRoute) {
      var id = $(this).attr('id');
      var _route = myTMap.getRouteList().item(id.substring(8));
      _route.setVisible(false);
      $("div[name='divs']").each(function () {
        if ($(this).attr('id') == id.substring(8)) {
          $(this).hide();
        }
      });
    }
  });
  $("img[name='colors']").click(function () {
    var id = $(this).attr('id');
    ColorPicker(
      colorDiv,
      function (hex, hsv, rgb) {
        //document.body.style.backgroundColor = hex;        // #HEX
        var _route = myTMap.getRouteList().item(id.substring(7));
        _route.setPlayColor(hex);
        $("img[name='colors']").each(function () {
          if ($(this).attr('id') == id) {
            $(this).attr('style', 'height: 15px;background-color: ' + hex);
            colorDiv.className = 'tmap-route-animation－colorpicker-hidden';
          }
        });
      });
    if (colorDiv.className == 'tmap-route-animation－colorpicker-hidden') {
      colorDiv.className = 'tmap-route-animation－colorpicker';
    } else {
      colorDiv.className = 'tmap-route-animation－colorpicker-hidden';
    }
  });
};
com.jiusuo.map.TRouteAnimation.prototype.removeControl = function () {
};
/**
 * @类名：轨迹对象
 * @父类：
 * @参数：
 * @用途：通过geojson创建轨迹轨迹对象，并定义轨迹的事件
 */
com.jiusuo.map.TRoute = function (opt_options) {
  this.options = opt_options || {};
  var _this = this;
  this._tMap = this.options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.routeName = this.options.routeName;
  this.movingMarker = this.options.movingMarker || com.jiusuo.map.webUrl + '/data/icon/i_gps_open.png';
  this.routeId = com.jiusuo.map.TUtils.createGUID();
  this.routeGeoJson = this.options.routeGeoJson;
  this.innerHTML = this.options.innerHTML;
  this.showFields = this.options.showFields;
  this.routeIcon = this.options.routeIcon;
  this.routeStartIcon = /*this.options.routeStartIcon ||*/ com.jiusuo.map.webUrl + '/data/icon/resStart_b57f6c3.png';
  this.routeEndIcon = /*this.options.routeEndIcon ||*/ com.jiusuo.map.webUrl + '/data/icon/resEnd_f2c5bd8.png';
  this.routeColor = this.options.routeColor || [255 * Math.random(), 255 * Math.random(), 255 * Math.random()];
  // this.arrowIcon = this.options.arrowIcon || com.jiusuo.map.webUrl +'/static/imgditu/button_stop_a.png';resStart_b57f6c3.png
  this.shouldPosition = this.options.shouldPosition || true;//add by smh 添加参数，画轨迹是否要自动定位resEnd_f2c5bd8.png
  //数据投影坐标系统设定为4326坐标系。
  this.dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  this.featureProjection = this._tMap.getProjection().getCode();
  //var featureProjection='EPSG:3857';
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _nFeatures = [];
  var _rFeatures = this.routeGeoJson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.routeGeoJson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.routeGeoJson.features = _nFeatures;
  }
  this.pointsFeatures = (new ol.format.GeoJSON()).readFeatures(_this.routeGeoJson, {
    dataProjection: _this.dataProjection,
    featureProjection: _this.featureProjection
  });
  var getPoints = function () {
    var _points = [];
    _this.pointsFeatures.forEach(function (feature) {
      _points.push(feature.getGeometry().getCoordinates());
    });
    return _points;
  };
  this.points = getPoints();
  //将轨迹第一个点设置为中心点
  if(this.points.length>0)
    com.jiusuo.map.tMap.oMap.getView().setCenter(this.points[0]);
  this.route = new com.jiusuo.map.geom.TPolyline(this.points, 'XY');
  this.wgs84Route = com.jiusuo.map.TGeometryUtils.geomtransform(_this.route, _this.featureProjection, _this.dataProjection);
  this.routeCoords = this.route.getCoordinates();
  this.wgs84Coords = this.wgs84Route.getCoordinates();
  this.routeLength = this.routeCoords.length;
  this.playColor = this.options.playColor || '#ff0000';
  this.routep = new com.jiusuo.map.style.TStyle({
    stroke: new com.jiusuo.map.style.TStroke({
      width: 3, color: _this.playColor
    })
  });
  this.styles = {
    'route': new com.jiusuo.map.style.TStyle({
      stroke: new com.jiusuo.map.style.TStroke({
        width: 3, color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1]
      })
    }),
     'icon_start': new com.jiusuo.map.style.TStyle({
             image: new com.jiusuo.map.style.TIcon({
                 anchor: [0.5, 0.3],
                 src: _this.routeStartIcon
             })
         }),
         'icon_stop': new com.jiusuo.map.style.TStyle({
             image: new com.jiusuo.map.style.TIcon({
                 anchor: [0.5, 0.3],
                 src: _this.routeEndIcon
             })
         }),
    'drive': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        rotation: 0,
        src: _this.movingMarker
      })
    }),
    'geoMarker': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 3,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'black'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'white', width: 2
        })
      })
    }),
    'imagePoint1': new com.jiusuo.map.style.TIcon({
      anchor: [0.5, 1],
      rotation: 0,
      src: _this.routeIcon
    }),
    'imagePoint': new com.jiusuo.map.style.TCircle({
      radius: 4,
      snapToPixel: false,
      fill: new com.jiusuo.map.style.TFill({color: [255, 255, 255, 1.0]}),
      stroke: new com.jiusuo.map.style.TStroke({
        color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1], width: 3
      })
    }),
    'Point1': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        rotation: 0,
        src: _this.routeIcon
      })
    }),
    'Point': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 4,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: [255, 255, 255, 1.0]}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: [_this.routeColor[0], _this.routeColor[1], _this.routeColor[2], 1], width: 3
        })
      })
    }),
    'played': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 4,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'red'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'white', width: 2
        })
      })
    })
  };
  this.routeFeature = new com.jiusuo.map.TFeature({
    type: 'route',
    geometry: _this.route
  });
  this.geoMarker = new com.jiusuo.map.TFeature({
    type: 'geoMarker',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[0])
  });
  this.startMarker = new com.jiusuo.map.TFeature({
    type: 'icon_start',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[0])
  });
  this.startMarker.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  this.startMarker.setProperties(_this.pointsFeatures[0].getProperties());
  this.endMarker = new com.jiusuo.map.TFeature({
    type: 'icon_stop',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[_this.routeLength - 1])
  });
  this.endMarker.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  this.endMarker.setProperties(_this.pointsFeatures[_this.routeLength - 1].getProperties());
  var allfeatures = [];
  allfeatures.push(_this.routeFeature);
  _this.pointsFeatures.forEach(function (feature) {
    feature.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  });
  allfeatures = allfeatures.concat(_this.pointsFeatures);
  allfeatures.push(_this.geoMarker);
  allfeatures.push(_this.startMarker);
  allfeatures.push(_this.endMarker);
  this.tyleFunction = function (feature) {
    // hide geoMarker if animation is active
    if (_this.animating && feature.get('type') === 'geoMarker') {
      return null;
    }
    if (feature.get('type') == null || feature.get('type') == undefined || feature.get('type') == 'undefined') {
      if (_this.icon != null && _this.icon != '') {
        return _this.styles['Point1'];
      } else {
        return _this.styles['Point'];
      }
    }
    return _this.styles[feature.get('type')];
  };
  this.tyleFunction1 = function (feature) {
    // hide geoMarker if animation is active
    if (_this.animating && feature.get('type') === 'geoMarker') {
      return null;
    }
    if (feature.get('type') == null || feature.get('type') == undefined || feature.get('type') == 'undefined') {
      if (_this.icon != null && _this.icon != '') {
        var imagePoint = _this.styles['imagePoint1'];
        if (feature.get('text') != null && typeof(feature.get('text')) != 'undefined') {
          var textstyle = new com.jiusuo.map.style.TText({
            text: feature.get('text').toString(),
            font: '10px sans-serif',
            offsetY: -10
          })
          var style = new com.jiusuo.map.style.TStyle({
            image: imagePoint,
            text: textstyle
          });
          return style;
        } else {
          return _this.styles['Point1'];
        }
      } else {
        var imagePoint = _this.styles['imagePoint'];
        if (feature.get('text') != null && typeof(feature.get('text')) != 'undefined') {
          var textstyle = new com.jiusuo.map.style.TText({
            text: feature.get('text').toString(),
            font: '10px sans-serif',
            offsetY: -12,
          })
          var style = new com.jiusuo.map.style.TStyle({
            image: imagePoint,
            text: textstyle
          });
          return style;
        } else {
          return _this.styles['Point'];
        }
      }
    }
    if (feature.get('icon') != null || feature.get('type') == 'icon_start' || feature.get('type') == 'icon_stop') {
      return _this.styles[feature.get('type')];
    }
    return null;
  };
  this.pointsLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: allfeatures
    }),
    style: _this.tyleFunction1
  });
  this.all_coors = [];
  this.temp_route_coors = [];
  this.t = null;
  this.index = 0;
  this.p_id = this.routeId + 'route_play_temp_p';
  this.r_id = this.routeId + 'route_play_temp_r';
  this.speed = 0;
  this.speedStep = 0.3;
  this.playFinished = false;
  var oldIndex = 0;
  this.startAnimation = function () {
    _this.setRouteVisible(false);//清空轨迹预备播放
    _this.speed = 500;
    var coors = calculateRouteCoors(_this.speed);
    _this.all_coors = coors;
    if (_this.t) {
      clearInterval(_this.t);
    }
    _this.playFinished = false;
    _this.t = setInterval(function () {
      if (_this.index == coors.length) {
        clearInterval(_this.t);
        _this.index = 0;
        _this.temp_route_coors = [];
        _this.speedStep = 0.3;
        _this.playFinished = true;
        return;
      }
      var pointCoor = coors[_this.index][0];
      var pointIndex = coors[_this.index][1];

      var size = _this._tMap.getOMap().getSize();
      var extent = _this._tMap.getOMap().getView().calculateExtent(size);
      // var viewState = _this._tMap.getOMap().getView().getState();
      // var extent = ol.extent.getForViewAndSize(viewState.center, viewState.resolution, viewState.rotation, size);
      if (pointCoor && extent && extent.length > 3 && _this.shouldPosition) {
        if (pointCoor[0] <= extent[0] || pointCoor[1] <= extent[1]) {
          _this._tMap.getOMap().getView().setCenter(pointCoor);
        }
        if (pointCoor[0] >= extent[2] || pointCoor[1] >= extent[3]) {
          _this._tMap.getOMap().getView().setCenter(pointCoor);
        }
      }
      /*
      var left = _this._tMap.getOMap().getTargetElement().getBoundingClientRect().left;
      var top = _this._tMap.getOMap().getTargetElement().getBoundingClientRect().top;
      var right = _this._tMap.getOMap().getTargetElement().getBoundingClientRect().right;
      var bottom = _this._tMap.getOMap().getTargetElement().getBoundingClientRect().bottom;
      _this._tMap.getOMap().renderSync();
      var leftbottom = _this._tMap.getOMap().getCoordinateFromPixel([left, bottom]);
      var righttop = _this._tMap.getOMap().getCoordinateFromPixel([right, top]);
      if (pointCoor && leftbottom && righttop && _this.shouldPosition) {
        if (pointCoor[0] <= leftbottom[0] || pointCoor[1] <= leftbottom[1]) {
          _this._tMap.getOMap().getView().setCenter(pointCoor);
        }
        if (pointCoor[0] >= righttop[0] || pointCoor[1] >= righttop[1]) {
          _this._tMap.getOMap().getView().setCenter(pointCoor);
        }
      }
      */

      _this.temp_route_coors.push(pointCoor);
      if (_this.temp_route_coors.length > 0) {
        if (_this.index < coors.length) {
          var temp_feature_r = _this.pointsLayer.getSource().getFeatureById(_this.r_id);
          if (temp_feature_r) {
            _this.pointsLayer.getSource().removeFeature(temp_feature_r);
          }
        }
        var temp_route = new com.jiusuo.map.geom.TPolyline(_this.temp_route_coors, 'XY');
        var temp_routeFeature = new com.jiusuo.map.TFeature({
          type: 'routep',
          geometry: temp_route
        });
        temp_routeFeature.setId(_this.r_id);
        temp_routeFeature.setStyle(_this.routep);
        _this.pointsLayer.getSource().addFeature(temp_routeFeature);
      }
      var currentPoint = new com.jiusuo.map.geom.TPoint(pointCoor);
      if (_this.index < coors.length) {
        var temp_feature_p = _this.pointsLayer.getSource().getFeatureById(_this.p_id);
        if (temp_feature_p) {
          _this.pointsLayer.getSource().removeFeature(temp_feature_p);
        }
      } else {
        _this.speedStep = 0.3;
        _this.playFinished = true;
      }
      var _feature = new com.jiusuo.map.TFeature(currentPoint);
      _feature.setId(_this.p_id);
      _feature.setStyle(_this.styles.drive);
      _this.pointsLayer.getSource().addFeature(_feature);
      if (pointIndex != -1) {
        var ft = _this.pointsFeatures[pointIndex];
        if (ft.get('autoCallback') != undefined && ft.get('autoCallback') != null) {
          ft.get('autoCallback')(ft);
        }
        if (pointIndex > 0) {
          var start = _this.pointsFeatures[pointIndex - 1].getGeometry().getCoordinates();
          var end = _this.pointsFeatures[pointIndex].getGeometry().getCoordinates();
          var rotation = Math.atan2(end[1] - start[1], end[0] - start[0]);
          // arrows
          var arrowStyle = new ol.style.Style({
            // geometry: new ol.geom.Point(end),
            /*image: new ol.style.Icon({
                            src: _this.arrowIcon,
                            anchor: [0.75, 0.5],
                            rotateWithView: false,
                            rotation: -rotation
                        })*/
          });
          var feat = new ol.Feature(new ol.geom.Point([(end[0] + start[0]) / 2, (end[1] + start[1]) / 2]));
          feat.setStyle(arrowStyle);
          feat.setId("arrow_" + pointIndex);
          _this.pointsLayer.getSource().addFeature(feat);
        }
        //TODO:播放器上显示时间
        $("#nowTimeText").text(_this.pointsFeatures[pointIndex].getProperties().currentTime);
      }
      _this.index = _this.index + 1;
    }, _this.speedStep * 1000);
  };
  var calculateRouteCoors = function (speed) {
    var n_Coords = [];
    var speedpersecond = (speed * 1000) / (60 * 60) / 22;
    for (var i = 0; i < _this.routeLength; i++) {
      if (i == 0) {
        n_Coords.push([com.jiusuo.map.TGeometryUtils.coortransform(_this.wgs84Coords[i], 'EPSG:4326', _this._tMap.getProjection().getCode()), i]);
      }
      if (i == _this.routeLength - 1) {
        break;
      }
      var f_coor = _this.wgs84Coords[i];
      var a_coor = _this.wgs84Coords[i + 1];
      var f_a_x_len = (a_coor[0] - f_coor[0]) * 3600;
      var f_a_y_len = (a_coor[1] - f_coor[1]) * 3600;
      var f_a_xy_len = Math.sqrt(f_a_x_len * f_a_x_len + f_a_y_len * f_a_y_len);
      var p_num = Math.round(f_a_xy_len / speedpersecond);
      var sin_a = 0;
      if (f_a_y_len > 0) {
        sin_a = Math.abs(f_a_y_len) / f_a_xy_len;
      } else {
        sin_a = -Math.abs(f_a_y_len) / f_a_xy_len;
      }
      var cos_a = 0;
      if (f_a_x_len > 0) {
        cos_a = Math.abs(f_a_x_len) / f_a_xy_len;
      } else {
        cos_a = -Math.abs(f_a_x_len) / f_a_xy_len;
      }
      for (var j = 1; j < p_num + 1; j++) {
        var t_a_x_len = (f_coor[0] + (speedpersecond * cos_a) * j / 3600 - f_coor[0]) * 3600;
        var t_a_y_len = (f_coor[1] + (speedpersecond * sin_a) * j / 3600 - f_coor[1]) * 3600;
        var t_a_xy_len = Math.sqrt(t_a_x_len * t_a_x_len + t_a_y_len * t_a_y_len);
        if (f_a_xy_len >= t_a_xy_len) {
          var plus_p = [f_coor[0] + (speedpersecond * cos_a) * j / 3600, f_coor[1] + (speedpersecond * sin_a) * j / 3600];
          n_Coords.push([com.jiusuo.map.TGeometryUtils.coortransform(plus_p, 'EPSG:4326', _this._tMap.getProjection().getCode()), -1]);
        }
      }
      n_Coords.push([com.jiusuo.map.TGeometryUtils.coortransform(_this.wgs84Coords[i + 1], 'EPSG:4326', _this._tMap.getProjection().getCode()), i + 1]);
    }
    return n_Coords;
  };
  this.pauseAnimation = function () {
    clearInterval(_this.t);
  };
  this.stopAnimation = function () {
    clearInterval(_this.t);
    _this.temp_route_coors = [];
    _this.index = 0;
    _this.speedStep = 0.3;
    var temp_feature_p = _this.pointsLayer.getSource().getFeatureById(_this.p_id);
    if (temp_feature_p) {
      _this.pointsLayer.getSource().removeFeature(temp_feature_p);
    }
    var temp_feature_r = _this.pointsLayer.getSource().getFeatureById(_this.r_id);
    if (temp_feature_r) {
      _this.pointsLayer.getSource().removeFeature(temp_feature_r);
    }
    _this.pointsLayer.getSource().getFeatures().forEach(function (f) {
      if (f.getId() != undefined && f.getId() != null) {
        if (f.getId().toString().indexOf('arrow_') == 0) {
          _this.pointsLayer.getSource().removeFeature(f);
        }
      }
    });
    _this.setRouteVisible(true); //停止后让轨迹显示
  };
  this.getRouteName = function () {
    return _this.routeName;
  };
  this.getRouteId = function () {
    return _this.routeId;
  };
  this.getVectorLayer = function () {
    _this.pointsLayer.setZIndex(9);
    return _this.pointsLayer;
  };
  this.setVisible = function (value) {
    _this.pointsLayer.setVisible(value);
    _this.pointsLayer.getSource().getFeatures().forEach(function (f) {
      if (f.getId() != undefined && f.getId() != null) {
        if (f.getId().toString().indexOf('arrow_') == 0) {
          _this.pointsLayer.getSource().removeFeature(f);
        }
      }
    });
  };
  this.getVisible = function () {
    return _this.pointsLayer.getVisible();
  };
  this.setRouteVisible = function (value) {
    if (!value) {
      _this.pointsLayer.setStyle(_this.tyleFunction1);
      _this.pointsLayer.getSource().getFeatures().forEach(function (f) {
        if (f.getId() != undefined && f.getId() != null) {
          if (f.getId().toString().indexOf('arrow_') == 0) {
            _this.pointsLayer.getSource().removeFeature(f);
          }
        }
      });
    } else {
      _this.pointsLayer.setStyle(_this.tyleFunction);
    }
  };
  this.getRouteLength = function () {
    return _this.all_coors.length;
  };
  this.getOverlength = function () {
    return _this.index;
  };
  this.setIndex = function (index) {
    _this.index = index;
  };
  this.getTemp_route_coors = function () {
    return _this.temp_route_coors;
  };
  this.setTemp_route_coors = function (temp_route_coors) {
    _this.temp_route_coors = temp_route_coors;
  };
  this.getSpeed = function () {
    return _this.speedStep;
  };
  this.setSpeed = function (speed) {
    _this.speedStep = speed;
  };
  this.getAllCoors = function () {
    return _this.all_coors;
  };
  this.setPlayColor = function (colorhex) {
    _this.playColor = colorhex;
    _this.routep = new com.jiusuo.map.style.TStyle({
      stroke: new com.jiusuo.map.style.TStroke({
        width: 3, color: _this.playColor
      })
    });
  };
  this.getPlayFinished = function () {
    return _this.playFinished;
  };
  this.setPlayFinished = function (value) {
    _this.playFinished = value;
  };
  if(this.routeName.length<32){
    $("#nowNameText").text(this.routeName);
  }
};
/**
 * 修改版轨迹播放，应用于伴随轨迹播放
 */
com.jiusuo.map.TFollowRoute = function (opt_options) {
  this.options = opt_options || {};
  var _this = this;
  this._tMap = this.options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.routeName = this.options.routeName;
  this.movingMarker = this.options.movingMarker || com.jiusuo.map.webUrl + '/data/icon/i_gps_open.png';
  this.routeId = com.jiusuo.map.TUtils.createGUID();

  this.routeGeoJson = $.extend(true, {}, this.options.routeGeoJson);
  this.innerHTML = this.options.innerHTML;
  this.showFields = this.options.showFields;
  this.playColor = this.options.playColor ? this.options.playColor : [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 1];
  //数据投影坐标系统设定为4326坐标系。
  this.dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  this.featureProjection = this._tMap.getProjection().getCode();
  //var featureProjection='EPSG:3857';
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _nFeatures = [];
  var _rFeatures = this.routeGeoJson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.routeGeoJson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.routeGeoJson.features = _nFeatures;
  }
  this.pointsFeatures = (new ol.format.GeoJSON()).readFeatures(_this.routeGeoJson, {
    dataProjection: _this.dataProjection,
    featureProjection: _this.featureProjection
  });
  var getPoints = function () {
    var _points = [];
    _this.pointsFeatures.forEach(function (feature) {
      _points.push(feature.getGeometry().getCoordinates());
    });
    return _points;
  };
  this.points = getPoints();
  this.route = new com.jiusuo.map.geom.TPolyline(this.points, 'XY');
  this.wgs84Route = com.jiusuo.map.TGeometryUtils.geomtransform(_this.route, _this.featureProjection, _this.dataProjection);
  this.routeCoords = this.route.getCoordinates();
  this.wgs84Coords = this.wgs84Route.getCoordinates();
  this.routeLength = this.routeCoords.length;

  this.routep = new com.jiusuo.map.style.TStyle({
    stroke: new com.jiusuo.map.style.TStroke({
      //width: 1, color:
      width: 2, color: _this.playColor
    })
  });
  this.styles = {
    'route': new com.jiusuo.map.style.TStyle({
      stroke: new com.jiusuo.map.style.TStroke({
        //width: 1, color: [255*Math.random(), 255*Math.random(),255*Math.random(), 1]
        width: 1, color: _this.playColor
      })
    }),
    'drive': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        rotation: 0,
        src: _this.movingMarker
      })
    }),
    'icon_start': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        src: com.jiusuo.map.webUrl + '/data/icon/i_pop_start.png'
      })
    }),
    'icon_stop': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [0.5, 1],
        src: com.jiusuo.map.webUrl + '/data/icon/i_pop_stop.png'
      })
    }),
    'geoMarker': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 5,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'black'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'white', width: 2
        })
      })
    }),
    'Point': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 1,
        snapToPixel: false
      })
    }),
    'played': new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 5,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'red'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'white', width: 2
        })
      })
    })
  };
  this.pointsedStyle = new com.jiusuo.map.style.TStyle({
    image: new com.jiusuo.map.style.TCircle({
      radius: 3,
      snapToPixel: false,
      fill: new com.jiusuo.map.style.TFill({color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8]}),
      stroke: new com.jiusuo.map.style.TStroke({
        color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8], width: 2
      })
    })
  })
  this.routeFeature = new com.jiusuo.map.TFeature({
    type: 'route',
    geometry: _this.route
  });
  this.geoMarker = new com.jiusuo.map.TFeature({
    type: 'geoMarker',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[0])
  });
  this.startMarker = new com.jiusuo.map.TFeature({
    type: 'icon_start',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[0])
  });
  this.startMarker.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  this.startMarker.setProperties(_this.pointsFeatures[0].getProperties());
  this.endMarker = new com.jiusuo.map.TFeature({
    type: 'icon_stop',
    geometry: new com.jiusuo.map.geom.TPoint(_this.routeCoords[_this.routeLength - 1])
  });
  this.endMarker.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  this.endMarker.setProperties(_this.pointsFeatures[_this.routeLength - 1].getProperties());
  var allfeatures = [];
  allfeatures.push(_this.routeFeature);
  _this.pointsFeatures.forEach(function (feature) {
    feature.setId(_this.routeId + com.jiusuo.map.TUtils.createGUID());
  });
  allfeatures = allfeatures.concat(_this.pointsFeatures);
  allfeatures.push(_this.geoMarker);
  allfeatures.push(_this.startMarker);
  allfeatures.push(_this.endMarker);
  this.tyleFunction = function (feature) {
    // hide geoMarker if animation is active
    if (_this.animating && feature.get('type') === 'geoMarker') {
      return null;
    }
    if (feature.get('type') == null || feature.get('type') == undefined || feature.get('type') == 'undefined') {
      return _this.styles['Point'];
    }
    return _this.styles[feature.get('type')];
  };
  this.tyleFunction1 = function (feature) {
    // hide geoMarker if animation is active
    if (_this.animating && feature.get('type') === 'geoMarker') {
      return null;
    }
    if (feature.get('type') == null || feature.get('type') == undefined || feature.get('type') == 'undefined') {
      return _this.styles['Point'];
    }
    if (feature.get('icon') != null || feature.get('type') == 'icon_start' || feature.get('type') == 'icon_stop') {
      return _this.styles[feature.get('type')];
    }
    return null;
  };
  this.pointsLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: allfeatures
    }),
    style: _this.tyleFunction1
  });
  this.all_coors = [];
  this.temp_route_coors = [];
  this.t = null;
  this.index = 0;
  this.p_id = this.routeId + 'route_play_temp_p';
  this.r_id = this.routeId + 'route_play_temp_r';
  this.speed = 0;
  this.speedStep = 0.3;
  this.playFinished = false;
  this.startAnimation = function () {
    _this.speed = 50000;
    var coors = calculateRouteCoors(_this.speed);
    _this.all_coors = coors;
    if (_this.t) {
      clearInterval(_this.t);
    }
    _this.t = setInterval(function () {
      if (_this.index == coors.length) {
        clearInterval(_this.t);
        _this.index = 0;
        _this.temp_route_coors = [];
        _this.speedStep = 0.3;
        _this.playFinished = true;
        return;
      }
      var pointCoor = coors[_this.index];
      _this.temp_route_coors.push(pointCoor);
      if (_this.temp_route_coors.length > 0) {
        if (_this.index < coors.length) {
          var temp_feature_r = _this.pointsLayer.getSource().getFeatureById(_this.r_id);
          if (temp_feature_r) {
            _this.pointsLayer.getSource().removeFeature(temp_feature_r);
          }
        }
        var temp_route = new com.jiusuo.map.geom.TPolyline(_this.temp_route_coors, 'XY');
        var temp_routeFeature = new com.jiusuo.map.TFeature({
          type: 'routep',
          geometry: temp_route
        });
        temp_routeFeature.setId(_this.r_id);
        temp_routeFeature.setStyle(_this.routep);
        _this.pointsLayer.getSource().addFeature(temp_routeFeature);
      }
      var currentPoint = new com.jiusuo.map.geom.TPoint(pointCoor);
      var currentfeatures = _this.pointsLayer.getSource().getFeaturesAtCoordinate(pointCoor);
      if (currentfeatures.length > 0) {
        for (var j = 0; j < currentfeatures.length; j++) {
          if (currentfeatures[j].getGeometry().getType() == 'Point') {
            currentfeatures[j].setStyle(_this.pointsedStyle);
          }
        }
      }
      if (_this.index < coors.length) {
        var temp_feature_p = _this.pointsLayer.getSource().getFeatureById(_this.p_id);
        if (temp_feature_p) {
          _this.pointsLayer.getSource().removeFeature(temp_feature_p);
        }
      } else {
        _this.speedStep = 0.3;
        _this.playFinished = true;
      }
      var _feature = new com.jiusuo.map.TFeature(currentPoint);
      _feature.setId(_this.p_id);
      _feature.setStyle(_this.styles.drive);
      _this.pointsLayer.getSource().addFeature(_feature);
      _this.index = _this.index + 1;
    }, _this.speedStep * 1000);
  };
  var calculateRouteCoors = function (speed) {
    var n_Coords = [];
    var speedpersecond = (speed * 1000) / (60 * 60) / 22;
    for (var i = 0; i < _this.routeLength; i++) {
      if (i == 0) {
        n_Coords.push(com.jiusuo.map.TGeometryUtils.coortransform(_this.wgs84Coords[i], 'EPSG:4326', _this._tMap.getProjection().getCode()));
      }
      if (i == _this.routeLength - 1) {
        break;
      }

      var f_coor = _this.wgs84Coords[i];
      var a_coor = _this.wgs84Coords[i + 1];
      var f_a_x_len = (a_coor[0] - f_coor[0]) * 3600;
      var f_a_y_len = (a_coor[1] - f_coor[1]) * 3600;
      var f_a_xy_len = Math.sqrt(f_a_x_len * f_a_x_len + f_a_y_len * f_a_y_len);
      var p_num = Math.round(f_a_xy_len / speedpersecond);
      var sin_a = 0;
      if (f_a_y_len > 0) {
        sin_a = Math.abs(f_a_y_len) / f_a_xy_len;
      } else {
        sin_a = -Math.abs(f_a_y_len) / f_a_xy_len;
      }
      var cos_a = 0;
      if (f_a_x_len > 0) {
        cos_a = Math.abs(f_a_x_len) / f_a_xy_len;
      } else {
        cos_a = -Math.abs(f_a_x_len) / f_a_xy_len;
      }

      for (var j = 1; j < p_num + 1; j++) {
        var t_a_x_len = (f_coor[0] + (speedpersecond * cos_a) * j / 3600 - f_coor[0]) * 3600;
        var t_a_y_len = (f_coor[1] + (speedpersecond * sin_a) * j / 3600 - f_coor[1]) * 3600;
        var t_a_xy_len = Math.sqrt(t_a_x_len * t_a_x_len + t_a_y_len * t_a_y_len);
        if (f_a_xy_len >= t_a_xy_len) {
          var plus_p = [f_coor[0] + (speedpersecond * cos_a) * j / 3600, f_coor[1] + (speedpersecond * sin_a) * j / 3600];
          n_Coords.push(com.jiusuo.map.TGeometryUtils.coortransform(plus_p, 'EPSG:4326', _this._tMap.getProjection().getCode()));
        }
      }
      n_Coords.push(com.jiusuo.map.TGeometryUtils.coortransform(_this.wgs84Coords[i + 1], 'EPSG:4326', _this._tMap.getProjection().getCode()));
    }
    return n_Coords;
  };
  this.getRouteName = function () {
    return _this.routeName;
  };
  this.getRouteId = function () {
    return _this.routeId;
  };
  this.getVectorLayer = function () {
    return _this.pointsLayer;
  };
  this.setVisible = function (value) {
    _this.pointsLayer.setVisible(value);
  };
  this.getVisible = function () {
    return _this.pointsLayer.getVisible();
  };
  this.setRouteVisible = function (value) {
    if (!value) {
      _this.pointsLayer.setStyle(_this.tyleFunction1);
    } else {
      _this.pointsLayer.setStyle(_this.tyleFunction);
    }

  };
  this.getRouteLength = function () {
    return _this.all_coors.length;
  };
  this.getOverlength = function () {
    return _this.index;
  };
  this.setIndex = function (index) {
    _this.index = index;
  };
  this.getTemp_route_coors = function () {
    return _this.temp_route_coors;
  };
  this.setTemp_route_coors = function (temp_route_coors) {
    _this.temp_route_coors = temp_route_coors;
  };
  this.getSpeed = function () {
    return _this.speedStep;
  };
  this.setSpeed = function (speed) {
    _this.speedStep = speed;
  };
  this.getAllCoors = function () {
    return _this.all_coors;
  };
  this.setPlayColor = function (colorhex) {
    _this.playColor = colorhex;
    _this.routep = new com.jiusuo.map.style.TStyle({
      stroke: new com.jiusuo.map.style.TStroke({
        width: 3, color: _this.playColor
      })
    });
  };
  this.getPlayFinished = function () {
    return _this.playFinished;
  };
};
/**
 * @类名：几何对象工具类
 * @用途：各类几何对象操作方法
 */
com.jiusuo.map.TGeometryUtils = function () {
};
com.jiusuo.map.TGeometryUtils.setPointsCenter = function (points, tMap) {
  var map = null;
  if (tMap) {
    map = tMap;
  } else {
    map = com.jiusuo.map.tMap;
  }
  var maxX = maxY = 0;
  var minX = minY = 180;
  points.forEach(function (item) {
    if (typeof(item) != "undefined") {
      if (maxX < item[0]) {
        maxX = item[0];
      }
      if (minX > item[0]) {
        minX = item[0];
      }
      if (maxY < item[1]) {
        maxY = item[1];
      }
      if (minY > item[1]) {
        minY = item[1];
      }
    }
  });

  if (maxX != 0 && minX != 0 && maxY != 0 && minY != 0) {
    var gcjmin = [[minX, minY]];
    var gcjmax = [[maxX, maxY]];
    var minPoint;
    var maxPoint;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && map.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      minPoint = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(gcjmin)[0];
      maxPoint = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(gcjmax)[0];
      minPoint = com.jiusuo.map.TGeometryUtils.coortransform(minPoint, 'EPSG:4326', map.getProjection().getCode());
      maxPoint = com.jiusuo.map.TGeometryUtils.coortransform(maxPoint, 'EPSG:4326', map.getProjection().getCode());
    } else if (com.jiusuo.map.dataCoorsys == 'gcj02' && map.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      minPoint = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(gcjmin)[0];
      maxPoint = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(gcjmax)[0];
      minPoint = com.jiusuo.map.TGeometryUtils.coortransform(minPoint, 'EPSG:4326', map.getProjection().getCode());
      maxPoint = com.jiusuo.map.TGeometryUtils.coortransform(maxPoint, 'EPSG:4326', map.getProjection().getCode());
    } else {
      minPoint = com.jiusuo.map.TGeometryUtils.coortransform(minPoint, 'EPSG:4326', map.getProjection().getCode());
      maxPoint = com.jiusuo.map.TGeometryUtils.coortransform(maxPoint, 'EPSG:4326', map.getProjection().getCode());
    }
    var X = (maxPoint[0] - minPoint[0]) / map.getOMap().getSize()[0];
    var Y = (maxPoint[1] - minPoint[1]) / map.getOMap().getSize()[1];
    var Resolution = X > Y ? X : Y;
    if (Resolution && Resolution != 0) {
      map.getOMap().getView().setResolution(Resolution * 1.5);
    }
    map.getOMap().getView().setCenter([(maxPoint[0] + minPoint[0]) / 2, (maxPoint[1] + minPoint[1]) / 2]);
  }
}
//geometry及其子类对象的坐标系转换
com.jiusuo.map.TGeometryUtils.geomtransform = function (geom, source, destination) {
  return geom.clone().transform(source, destination);
};
//坐标对象的坐标系转换
com.jiusuo.map.TGeometryUtils.coortransform = function (coor, source, destination) {
  return ol.proj.transform(coor, source, destination);
};
//世界WGS84转CJ02（国内wgs84）
com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints = function (points) {
  var d_points = [];
  var _points = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(points);
  for (var i = 0; i < _points.length; i++) {
    var _p = _points[i];
    var p = points[i];
    var _p_p_lon = _p[0] - p[0];
    var _p_p_lat = _p[1] - p[1];
    var point = [parseFloat((p[0] - _p_p_lon).toFixed(6)), parseFloat((p[1] - _p_p_lat).toFixed(6))];
    d_points.push(point);
  }
  return d_points;
}
com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints = function (points) {
  var pi = 3.14159265358979324;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;

  function outOfChina(lat, lon) {
    if (lon < 72.004 || lon > 137.8347) {
      return true;
    }
    if (lat < 0.8293 || lat > 55.8271) {
      return true;
    }
    return false;
  };

  function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
  };

  function tranformLon(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
  };

  function transform(wgLat, wgLon) {
    var latLng = [];
    if (outOfChina(wgLat, wgLon)) {
      latLng[0] = wgLat;
      latLng[1] = wgLon;
      return latLng;
    }
    var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
    var dLon = tranformLon(wgLon - 105.0, wgLat - 35.0);
    var radLat = wgLat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    latLng[1] = wgLat + dLat;
    latLng[0] = wgLon + dLon;
    return latLng;
  };
  var newPoints = [];
  points.forEach(function (point) {
    var nPoint = transform(point[1], point[0]);
    newPoints.push(nPoint);
  });
  return newPoints;
};
com.jiusuo.map.TGeometryUtils.worldGcj02ToBd09ofPoints = function (points) {
  var pi = 3.14159265358979324;
  var d_points = [];
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var z = Math.sqrt(p[0] * p[0] + p[1] * p[1]) + 0.00002 * Math.sin(p[1] * pi);
    var theta = Math.atan2(p[1], p[0]) + 0.000003 * Math.cos(p[0] * pi);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    var point = [bd_lon, bd_lat];
    d_points.push(point);
  }
  return d_points;
}
//百度BD09转CJ02（国内wgs84）
com.jiusuo.map.TGeometryUtils.worldBd09ToGcj02 = function (points) {
  var pi = 3.14159265358979324;
  var d_points = [];
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var x = p[0] - 0.0065, y = p[1] - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
    var bd_lon = z * Math.cos(theta);
    var bd_lat = z * Math.sin(theta);
    var point = [bd_lon, bd_lat];
    d_points.push(point);
  }
  return d_points;
}
com.jiusuo.map.TGeometryUtils.isPointInPolygon = function (point, polygon) {

  var points = polygon.getCoordinates()[0];
  var count = points.length;
  if (count < 3) {
    return false;
  }
  var result = false;
  for (var i = 0, j = count - 1; i < count; i++) {
    var p1 = points[i];
    var p2 = points[j];
    if ((p1[1] < point[1] && p2[1] >= point[1]) || (p2[1] < point[1] && p1[1] >= point[1])) {
      if (p1[0] + (point[1] - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0]) < point[0]) {
        result = !result;
      }
    }
    j = i;
  }
  return result;
};
//百度BD09转国际WGS84
com.jiusuo.map.TGeometryUtils.worldBd09ToWorldWgs84 = function (points) {
  points = com.jiusuo.map.TGeometryUtils.worldBd09ToGcj02(points);
  return com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(points);
}
com.jiusuo.map.TGeometryUtils.toFeatureJsonString = function (geom, tMap) {
  var featureJson = {};
  var geoJsonString = com.jiusuo.map.TGeometryUtils._toGeoJsonString(geom, tMap);
  featureJson.geometry = geoJsonString;
  featureJson.type = "Feature";
  return featureJson;


};
//geometry及其子类对象转geojson
com.jiusuo.map.TGeometryUtils.toGeoJsonString = function (geom, tMap) {
  var geoJsonString = "";
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, tMap.getProjection().getCode(), 'EPSG:4326');
  if (geom.getType() == "Circle") {
    var radius = geom.getRadius();
    var _radius = radius;
    var center = geom.getCenter();
    // center = com.jiusuo.map.TGeometryUtils.coortransform(center, tMap.getProjection().getCode(), 'EPSG:4326');
    geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, tMap.getProjection().getCode(), 'EPSG:3857');
    // radius = geom.getRadius();
    // var centers = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center]);
    if (true) {
      var wgs84Sphere = new ol.Sphere(6378137);
      radius = wgs84Sphere.haversineDistance(center, [center[0] + _radius, center[1]]);
    }
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      center = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([center])[0];
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      center = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center])[0];
    }
    geoJsonString = '{\"type\":\"Circle\",\"center\":[' + center + '],\"radius\":' + radius + ',\"_radius\":' + _radius + '}';
    geoJsonString = $.parseJSON(geoJsonString);
  } else {
    var format = new ol.format.GeoJSON();
    geoJsonString = format.writeGeometry(geom);
    geoJsonString = $.parseJSON(geoJsonString);
    if (geom.getType() == "Polygon") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        //coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geoJsonString.coordinates[0]);
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geoJsonString.coordinates[0]);
        geoJsonString.coordinates = [coordinates];
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        // coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geoJsonString.coordinates[0]);
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geoJsonString.coordinates[0]);
        geoJsonString.coordinates = [coordinates];
      }
    } else if (geom.getType() == "LineString") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geoJsonString.coordinates);
        geoJsonString.coordinates = coordinates;
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geoJsonString.coordinates);
        geoJsonString.coordinates = coordinates;
      }
    } else if (geom.getType() == "Point") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geoJsonString.coordinates]);
        geoJsonString.coordinates = coordinates[0];
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([geoJsonString.coordinates]);
        geoJsonString.coordinates = coordinates[0];
      }
    } else {

    }
  }
  return geoJsonString;
};
//geometry及其子类对象转geojson
com.jiusuo.map.TGeometryUtils._toGeoJsonString = function (geom, tMap, pro) {
  var geoJsonString = "";
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  if (pro == null) {
    pro = tMap.getProjection().getCode();
  }
  geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, pro, 'EPSG:4326');
  if (geom.getType() == "Circle") {
    var radius = geom.getRadius();
    var _radius = radius;
    var center = geom.getCenter();
    // center = com.jiusuo.map.TGeometryUtils.coortransform(center, tMap.getProjection().getCode(), 'EPSG:4326');
    geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, tMap.getProjection().getCode(), 'EPSG:3857');
    // radius = geom.getRadius();
    // var centers = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center]);
    if (true) {
      var wgs84Sphere = new ol.Sphere(6378137);
      radius = wgs84Sphere.haversineDistance(center, [center[0] + _radius, center[1]]);
    }
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      center = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center])[0];
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      center = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([center])[0];
    }
    geoJsonString = '{\"type\":\"Circle\",\"center\":[' + center + '],\"radius\":' + radius + ',\"_radius\":' + _radius + '}';
    geoJsonString = $.parseJSON(geoJsonString);
  } else {
    var format = new ol.format.GeoJSON();
    geoJsonString = format.writeGeometry(geom);
    geoJsonString = $.parseJSON(geoJsonString);
    if (geom.getType() == "Polygon") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geoJsonString.coordinates[0]);
        geoJsonString.coordinates = [coordinates];
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geoJsonString.coordinates[0]);
        geoJsonString.coordinates = [coordinates];
      }
    } else if (geom.getType() == "LineString") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geoJsonString.coordinates);
        geoJsonString.coordinates = coordinates;
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geoJsonString.coordinates);
        geoJsonString.coordinates = coordinates;
      }
    } else if (geom.getType() == "Point") {
      var coordinates;
      if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([geoJsonString.coordinates]);
        geoJsonString.coordinates = coordinates[0];
      }
      if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
        coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([geoJsonString.coordinates]);
        geoJsonString.coordinates = coordinates[0];
      }
    } else {

    }
  }
  return geoJsonString;
};
//geometry及其子类对象转geojson
com.jiusuo.map.TGeometryUtils._toGeoJsonString2 = function (geom, tMap) {
  var geoJsonString = "";
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, tMap.getProjection().getCode(), 'EPSG:4326');
  if (geom.getType() == "Circle") {
    var radius = geom.getRadius();
    var _radius = radius;
    var center = geom.getCenter();
    // center = com.jiusuo.map.TGeometryUtils.coortransform(center, tMap.getProjection().getCode(), 'EPSG:4326');
    geom = com.jiusuo.map.TGeometryUtils.geomtransform(geom, tMap.getProjection().getCode(), 'EPSG:3857');
    // radius = geom.getRadius();
    // var centers = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([center]);
    if (true) {
      var wgs84Sphere = new ol.Sphere(6378137);
      radius = wgs84Sphere.haversineDistance(center, [center[0] + _radius, center[1]]);
    }
    geoJsonString = '{\"type\":\"Circle\",\"center\":[' + center + '],\"radius\":' + radius + ',\"_radius\":' + _radius + '}';
    geoJsonString = $.parseJSON(geoJsonString);
  } else {

    var format = new ol.format.GeoJSON();
    geoJsonString = format.writeGeometry(geom);
    geoJsonString = $.parseJSON(geoJsonString);
  }
  return geoJsonString;
};
com.jiusuo.map.TGeometryUtils.geojsonToFeatures = function (geojson, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  //数据投影坐标系统设定为4326坐标系。
  var dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  var featureProjection = tMap.getProjection().getCode();
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _geojson = $.extend(true, {}, geojson);
  var _nFeatures = [];
  var _rFeatures = _geojson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    _geojson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    _geojson.features = _nFeatures;
  }
  var features = function () {
    try {
      return (new ol.format.GeoJSON()).readFeatures(_geojson, {
        dataProjection: dataProjection,
        featureProjection: featureProjection
      });
    } catch (ex) {
      return null;
    }
  };
  return features();
};
com.jiusuo.map.TGeometryUtils.geojsonToGeometry = function (geojson, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  //数据投影坐标系统设定为4326坐标系。
  var dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  var featureProjection = tMap.getProjection().getCode();
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _geojson = $.extend(true, {}, JSON.parse(geojson));
  if (_geojson.type == "Polygon") {
    var coordinates;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(_geojson.coordinates[0]);
      _geojson.coordinates = [coordinates];
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(_geojson.coordinates[0]);
      _geojson.coordinates = [coordinates];
    }
  } else if (_geojson.type == "LineString") {
    var coordinates;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(_geojson.coordinates);
      _geojson.coordinates = coordinates;
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(_geojson.coordinates);
      _geojson.coordinates = coordinates;
    }
  } else if (_geojson.type == "Point") {
    var coordinates;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([_geojson.coordinates]);
      _geojson.coordinates = coordinates[0];
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([_geojson.coordinates]);
      _geojson.coordinates = coordinates[0];
    }
  } else {

  }
  var geometry = function () {
    try {
      return (new ol.format.GeoJSON()).readGeometry(JSON.stringify(_geojson), {
        dataProjection: dataProjection,
        featureProjection: featureProjection
      });
    } catch (ex) {
      return null;
    }
  };
  return geometry();
};
com.jiusuo.map.TGeometryUtils.isPointInMapWindow = function (point, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  //数据投影坐标系统设定为4326坐标系。
  var dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  var featureProjection = tMap.getProjection().getCode();
  //计算当前屏幕地图范围
  var map = tMap.getOMap();
  var left = map.getTargetElement().getBoundingClientRect().left;
  var top = map.getTargetElement().getBoundingClientRect().top;
  var right = map.getTargetElement().getBoundingClientRect().right;
  var bottom = map.getTargetElement().getBoundingClientRect().bottom;
  map.renderSync();
  var leftbottom = map.getCoordinateFromPixel([left, bottom]);
  var righttop = map.getCoordinateFromPixel([right, top]);
  leftbottom = com.jiusuo.map.TGeometryUtils.coortransform(leftbottom, featureProjection, dataProjection);
  righttop = com.jiusuo.map.TGeometryUtils.coortransform(righttop, featureProjection, dataProjection);
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    leftbottom = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([leftbottom])[0];
    righttop = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([righttop])[0];
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    leftbottom = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([leftbottom])[0];
    righttop = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([righttop])[0];
  }
  var leftbottom_righttop = [leftbottom, righttop];//com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([leftbottom,righttop]);
  leftbottom = leftbottom_righttop[0];
  righttop = leftbottom_righttop[1];
  if (point[0] > righttop[0] || point[0] < leftbottom[0]) {
    return false;
  }
  if (point[1] > righttop[1] || point[1] < leftbottom[1]) {
    return false;
  }
  return true;
};
com.jiusuo.map.TGeometryUtils.createBuffer = function (geometry, radius, returnJson, tMap) {
  if (radius == null) {
    radius = 0;
  }
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var geometry1 = $.extend(true, {}, geometry);
  geometry1 = com.jiusuo.map.TGeometryUtils.geomtransform(geometry1, tMap.getProjection().getCode(), 'EPSG:3857');
  var parser = new jsts.io.olParser();
  var jstsGeom = parser.read(geometry1);
  var buffered = jstsGeom.buffer(parseFloat(radius));
  var _geometry = parser.write(buffered);
  if (!returnJson) {
    _geometry = com.jiusuo.map.TGeometryUtils.geomtransform(_geometry, 'EPSG:3857', tMap.getProjection().getCode());
    return _geometry;
  } else {
    _geometry = com.jiusuo.map.TGeometryUtils.geomtransform(_geometry, 'EPSG:3857', 'EPSG:4326');
    var geoJson = com.jiusuo.map.TGeometryUtils._toGeoJsonString(_geometry, tMap, 'EPSG:4326');
    return geoJson;
  }
};
//判断点是否在圆内
com.jiusuo.map.TGeometryUtils.isPointInCircle = function (point, circle, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var wgs84Sphere = new ol.Sphere(6378137);
  var sourceProj = tMap.getOMap().getView().getProjection();
  var cirJson = com.jiusuo.map.TGeometryUtils.toGeoJsonString(circle);
  var r = cirJson.radius;
  var c = circle.getCenter();
  var c1 = ol.proj.transform(point, sourceProj, 'EPSG:4326');
  var c2 = ol.proj.transform(c, sourceProj, 'EPSG:4326');
  var dis = wgs84Sphere.haversineDistance(c1, c2);
  if (dis <= r) {
    return true;
  } else {
    return false;
  }
};
com.jiusuo.map.TGeometryUtils.distaceTranform = function (position, distance, projection) {
  if (projection == "EPSG:4326") {
    var mktPosition = com.jiusuo.map.TGeometryUtils.coortransform(position, "EPSG:4326", "EPSG:3857");
    var mktPositionPlusDistance = [mktPosition[0] + distance, mktPosition[1]];
    var wgsPositionPlusDistance = com.jiusuo.map.TGeometryUtils.coortransform(mktPositionPlusDistance, "EPSG:3857", "EPSG:4326");
    return Math.sqrt(Math.pow(wgsPositionPlusDistance[0] - position[0], 2) + Math.pow(wgsPositionPlusDistance[1] - position[1], 2));
  }
  return distance;
}
// 获取es数据start
com.jiusuo.map.TEsQuery = function (tMap) {
  var _this = this;
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var eSServerProxy = tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/ESProxyService';
  this.commonSources = tMap.tMapServiceConfig.esService.commonSources;
  this.baseDataLayerSources = tMap.tMapServiceConfig.esService.baseDataLayerSources;
  var querySourceType = [];
  this.commonSources.forEach(function (querySource) {
    querySourceType.push(querySource.type);
  });
  querySourceType = querySourceType.join(",");

  //异步查询ES
  this.queryForAsyn = function (geoJson, source, keyWords, callbackFun, showFlag) {
    com.jiusuo.map.tMap.addWaitingModel();
    var selectSource = "";
    if (source != undefined) {
      if (source.length > 0) {
        selectSource = source.join(",");
      }
    }
    var id = "";
    var keywords = "";

    if (keyWords != undefined) {
      var c = "-";
      var regex = new RegExp(c, 'g');
      keywords = keyWords;

      var keywordArray = keyWords.split(",");
      var result = keywordArray[0].match(regex);
      var count = !result ? 0 : result.length;

      console.log(count);
      if (count >= 2) {
        keywords = "";
        id = keyWords;
      } else {
        keywords = keyWords;

      }
      //}

    }

    var result = null;
    $.ajax({
      async: true,
      cache: false,
      type: 'POST',
      url: eSServerProxy,
      crossDomain: true,
      data: {
        "id": id,
        "keyWords": keywords,
        "geoJson": geoJson,
        "querySourceTypes": selectSource == "" ? querySourceType : selectSource
      },
      timeout: 10000,
      error: function (data) {
        com.jiusuo.map.tMap.removeWaitingModel();
        var d = dialog({
          title: '提示',
          content: '查询es出现异常：' + eSServerProxy
        });
        d.showModal();
        setTimeout(function () {
          d.remove();
        }, 1000);
        callbackFun([], showFlag);
      },
      success: function (data) {
        com.jiusuo.map.tMap.removeWaitingModel();
        result = JSON.parse(data);
        callbackFun(result, showFlag);
      }
    });

  };
  this.query = function (geoJson, source, keyWords, callbackFun, showFlag, inLayerId) {
    var selectSource = "";
    if (source != undefined) {
      if (source.length > 0) {
        selectSource = source.join(",");
      }
    }
    var id = "";
    var keywords = "";

    if (keyWords != undefined) {
      var c = "-";
      var regex = new RegExp(c, 'g');
      keywords = keyWords;

      var keywordArray = keyWords.split(",");
      var result = keywordArray[0].match(regex);
      var count = !result ? 0 : result.length;

      console.log(count);
      if (count == 3) {
        keywords = "";
        id = keyWords;
      } else {
        keywords = keyWords;

      }
      //}

    }
    var result = null;
    $.ajax({
      async: false,
      cache: false,
      type: 'POST',
      url: eSServerProxy,
      crossDomain: true,
      data: {
        "keyWords": keywords,
        "geoJson": geoJson,
        "querySourceTypes": selectSource == "" ? querySourceType : selectSource
      },
      timeout: 10000,
      error: function (data) {
        com.jiusuo.map.tMap.removeWaitingModel();
        var d = dialog({
          title: '提示',
          content: '查询es出现异常：' + eSServerProxy
        });
        d.showModal();
      },
      success: function (data) {
        result = JSON.parse(data);

        callbackFun(result, showFlag, inLayerId);
        // com.jiusuo.map.tMap.removeWaitingModel();
      }
    });
    return result;
  };
  this.queryBaseSources = function (geoJson, queryType, id, callback) {
    var result = [];
    $.ajax({
      async: true,
      cache: false,
      type: 'POST',
      url: eSServerProxy,
      crossDomain: true,
      data: {"geoJson": geoJson, "id": id, "querySourceTypes": queryType},
      timeout: 10000,
      error: function (data) {
        com.jiusuo.map.tMap.removeWaitingModel();
        var d = dialog({
          title: '提示',
          content: '查询es出现异常：' + eSServerProxy
        });
        d.showModal();
        setTimeout(function () {
          d.remove();
        }, 1000);
        callback([], tMap);
      },
      success: function (data) {
        if (data == "") {
          data = [];
        }
        var result = JSON.parse(data);
        callback(result, tMap);
      }
    });
  };

  /**
   * 功能：根据相关点，查询路网凝合点集合
   * 参数1：geoJson：输入的相关点 例如var gpsJson ='{"gps":[{"hphm":"粤AQ871U","imsi":"460002406931357","userNum":"13711575666","lon":"113.4161052857506","lat":"23.11818189141948","timeStamp":"1484439787","projection":"wgs84"},{"hphm":"粤AQ871U","imsi":"460002406931357","userNum":"13711575666","lon":"113.416964775127","lat":"23.11473041228802","timeStamp":"1484439787","projection":"wgs84"}]}';
   * 参数2：callback 回调函数
   * */
  this.roadFit = function (geoJson, callback) {

    var conUrl = tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/RoadFitProxyService';

    $.ajax({
      async: true,
      cache: false,
      type: 'POST',
      url: conUrl,
      crossDomain: true,
      data: {
        "geoJson": geoJson,
      },
      timeout: 10000,

      error: function (data) {

      },
      success: function (data) {
        if (data != "") {
          callback(data);
        } else {
          console.log("道路凝合出错");
        }

      }
    });
  };

  //封装property start
  var setPropertyForesJsonObject = function (esJsonObject, layerId) {
    var JsonObject = {};
    JsonObject.layerId = layerId; //代表所在图层id ;
    JsonObject.id = esJsonObject.id == null ? com.jiusuo.map.TUtils.createGUID() : esJsonObject.id;
    JsonObject.x = esJsonObject.longitude;
    JsonObject.y = esJsonObject.latitude;
    JsonObject.address = esJsonObject.address || "无";
    JsonObject.coorsys = esJsonObject.coorsys;
    JsonObject.desc = esJsonObject.desc;
    JsonObject.type = esJsonObject.type;
    JsonObject.iconType = esJsonObject.iconType;
    JsonObject.name = esJsonObject.name || "无";
    JsonObject.entityObject = esJsonObject;
    return JsonObject;
  };
//end
  this.show = function (result, codeData) {
    var sprinkle_features = [];
    var featureJsonsWithTypes = [];//返回重新封装的数据数组
    var layerId = com.jiusuo.map.TUtils.createGUID();
    result.forEach(function (esJsonObjectWithTypes) {
      var featureWithType = {};
      var featureJsons = [];
      featureWithType.type = esJsonObjectWithTypes.type
      featureWithType.name = codeData[esJsonObjectWithTypes.type];
      var iconPhoto = com.jiusuo.map.webUrl + tMap.tMapServiceConfig.esService.defaultIcon; //默认图标
      var commonSources = tMap.tMapServiceConfig.esService.commonSources
      commonSources.forEach(function (querySource) {
        if (featureWithType.type == querySource.type && querySource.icon != null && querySource.icon != "") {

          iconPhoto = com.jiusuo.map.webUrl + '/static/mark/' + com.jiusuo.map.iconStyle + querySource.icon;
        }
      });
      esJsonObjectWithTypes.rec.forEach(function (data) {
        var dataObject = JSON.parse(data);
        var coordinates = dataObject.location.coordinates
        var featureJson = {};
        var geometry = {};

        var esJson = {};
        featureJson.type = "Feature";
        esJson = setPropertyForesJsonObject(dataObject, layerId);
        featureJson.properties = esJson;
        geometry.type = "Point";
        geometry.coordinates = dataObject.location.coordinates;
        featureJson.geometry = geometry;
        featureJsons.push(featureJson);

        var coordinatesJson = coordinates.join(",");
        if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
        } else if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
          coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([[coordinates]])[0];
        } else {
          coordinates = coordinates;
        }
        sprinkle_features.push({
          'type': 'Feature',
          'geometry': {'type': 'Point', 'coordinates': coordinates},
          'properties': {
            icon: iconPhoto,
            type: codeData[dataObject.type],
            address: dataObject.address || '',
            name: dataObject.name,
            coordinate: coordinatesJson,
            innerHTML: '<div style="margin-top: 6%;"><p><span>类型：</span><span>{type}</span></p><p><span>名称：</span><span>{name}</span></p><p><span>地址：</span><span>{address}</span></p><p><span>经纬度：</span><span>{coordinate}</span></p></div>',
            showFields: [{field: 'type', alias: '类型 '}, {field: 'address', alias: '地址'}, {
              field: 'name',
              alias: '名称'
            }, {field: 'coordinate', alias: '经纬度'}],
            callback: null
          }
        });

      });

      featureWithType.features = featureJsons;
      featureJsonsWithTypes.push(featureWithType);

    });
    var geoJson_sprinkle = {
      'type': 'FeatureCollection',
      'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
      'features': sprinkle_features
    };
    var sprinkleLayer = new com.jiusuo.map.TSprinkleLayer({geoJson: geoJson_sprinkle, id: layerId});
    tMap.addSprinkleLayer(sprinkleLayer);

    return featureJsonsWithTypes;

  }

  this.show2 = function (result, codeData, showFlag, inLayId) {
    var sprinkle_features = [];
    var featureJsonsWithTypes = [];//返回重新封装的数据数组
    var layerId = inLayId || com.jiusuo.map.TUtils.createGUID();
    var callback = null;
    result.forEach(function (esJsonObjectWithTypes) {
      var featureWithType = {};
      var featureJsons = [];
      featureWithType.type = esJsonObjectWithTypes.type
      featureWithType.name = codeData[esJsonObjectWithTypes.type];
      featureWithType.layerId = layerId;
      var iconPhoto = com.jiusuo.map.webUrl + '/static/mark/' + tMap.tMapServiceConfig.esService.defaultIcon; //默认图标
      var commonSources = tMap.tMapServiceConfig.esService.commonSources;
      //判断type 类型start
      if (esJsonObjectWithTypes.type == 'camera') {
        callback = function (feature) {
          if (feature) {
            var entityObject = feature.get('entityObject');
            var desc = JSON.parse(entityObject.desc);
            var snatshotpath = tMap.tMapServiceConfig.vedioServer.snatshotpath;
            var manu = tMap.tMapServiceConfig.vedioServer.manu;
            var domainid = desc.videoserverid;
            var puid = desc.deviceno + '@' + manu;
            var channelid = desc.channelid;
            var x = entityObject.location.coordinates[0].toFixed(6);
            var y = entityObject.location.coordinates[1].toFixed(6);

            var popupElement = $('<div id="videoContain"></div>');
            var pContent = $('<p>类型：摄像头</p>' +
              '<p>名称：' + (feature.get('name') || "无") + '</p>' +
              '<p>地址：' + (feature.get('address') || "无") + '</p>' +
              '<p style="white-space: nowrap;">经纬度：' + x + ',' + y + '</p>');
            var playBtn = $('<button class="vedio_button">播放</button>');
            if (typeof(videoPluginObject) == 'undefined') {
              playBtn.hide();
            }
            playBtn.on('click', function () {
              $('.video_box').width("600px");
              $('.video_box').height("400px");
              $('#videotitle').text((feature.get('name') || "无"));
              $('.set_pop_video .video_center').height("310px");
              $('.video_control').show();
              if ($('#videocacaca').html() == "") {
                $('#videocacaca').html($('.video_box'));
              }
              if (typeof(videoPluginObject) != 'undefined') {
                video_handler = new com.jiusuo.map.TVideo.videoPlayHandle(videoPluginObject, domainid, puid, channelid, manu, snatshotpath);
                video_handler.mystart();
              }
            })
            popupElement.append(pContent);
            popupElement.append(playBtn);
            return popupElement[0];
          }

        }
      } else if (esJsonObjectWithTypes.type == 'cgi') {
        callback = function (feature) {
          if (feature) {
            var projection = tMap.getProjection().getCode();
            var entityObject = feature.get('entityObject');
            var coorsys = entityObject.coorsys;
            var desc = JSON.parse(entityObject.desc);
            var mobile_carrier = entityObject.mobile_carrier;
            var baseVectorLayer = tMap.getVectorLayer('baseVector');
            var selectcgilayer = tMap.getVectorLayer('selectcgiVector');
            var coverageVectorLayer = tMap.getVectorLayer('coverageVector');
            var featureclone = feature.clone();
            tMap.cgiCoverageFeatures.push(featureclone);
            selectcgilayer.getSource().addFeature(featureclone);
            switch (mobile_carrier) {
              case 1:
                mobile_carrier = "中国移动";
                break;
              case 2:
                mobile_carrier = "中国联通";
                break;
              case 3:
                mobile_carrier = "中国电信";
                break;
              default:
                mobile_carrier = "";
            }
            var coorsys = entityObject.coorsys;
            var pContent = $('<div class="cgi_content"><p>类型：基站 ' + mobile_carrier + ' ' + desc.network + 'G</p>' +
              '<p>标识：' + entityObject.id + '</p>' +
              '<p>名称：' + (entityObject.name || "无") + '</p>' +
              '<p>地址：' + (entityObject.address || "无") + '</p>' +
              // '<p>运营商：' + mobile_carrier + '</p>' +
              // '<p>网络制式：  ' + desc.network + 'G   </p>' +
              '<p>首次统计时间：' + (desc.first_date || '无') + '</p>' +
              '<p>最新统计时间：' + (desc.last_date || '无') + '</p>' +
              '<div id="CGI_SP" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.sp_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>运营商坐标：' + (desc.sp_longitude || "无") + ',' + (desc.sp_latitude || "无") + '</label></div>' +
              '<div id="CGI_LBS" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.lbs_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>LBS预测坐标：' + (desc.lbs_longitude || "无") + ',' + (desc.lbs_latitude || "无") + '</label></div>' +
              '<div id="CGI_NEAR" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.near_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>邻基站预测坐标：' + (desc.near_longitude || "无") + ',' + (desc.near_latitude || "无") + '</label></div>' +
              '<input type="button" class="buttonstyle" id="getCGICoverage" value="显示基站范围">' +
              '<input type="button" class="buttonstyle" id="getNearByCGI" value="获取邻近基站">' +
              '</div>');
            var repairType = desc.repair_type;
            switch (repairType) {
              case "0":
                pContent.find('#CGI_SP').children().first().attr('disabled', true);
                pContent.find('#CGI_SP').children().last().addClass('underline');
                break;
              case "1":
                pContent.find('#CGI_SP').children().first().attr('disabled', true);
                pContent.find('#CGI_SP').children().last().addClass('underline');
                break;
              case "2":
                pContent.find('#CGI_LBS').children().first().attr('disabled', true);
                pContent.find('#CGI_LBS').children().last().addClass('underline');
                break;
              case "3":
                pContent.find('#CGI_NEAR').children().first().attr('disabled', true);
                pContent.find('#CGI_NEAR').children().last().addClass('underline');
                break;
            }
            pContent.find('div[name=CGI_Type]').each(function (item) {
              var id = $(this).attr('id') + entityObject.id;
              var feature = selectcgilayer.getSource().getFeatureById(id);
              if (feature) {
                $(this).children().first().attr('checked', 'checked');
              }
            });
            if (coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id)) {
              pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
            } else {
              pContent.find('#getCGICoverage').attr("value", "显示基站范围");
            }
            pContent.find('input:checkbox').on('change', function (evt) {
              var id = $(evt.target).parent().attr('id') + entityObject.id;
              var type = "";
              switch (id.substring(0, 5)) {
                case "CGI_S":
                  type = "sp_";
                  break;
                case "CGI_L":
                  type = "lbs_";
                  break;
                case "CGI_N":
                  type = "near_";
                  break;
                default:
                  type = "";
              }
              var lon = desc[type + "longitude"];
              var lat = desc[type + "latitude"];
              var feature = selectcgilayer.getSource().getFeatureById(id);
              if (feature) {
                selectcgilayer.getSource().removeFeature(feature)
              } else {

                var coordinates = [lon, lat];
                if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                  coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
                }
                if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                  coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
                }
                coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, "EPSG:4326", projection);
                var feature = new ol.Feature(new ol.geom.Point(coordinates));
                tMap.cgiCoverageFeatures.push(feature);
                feature.setId(id);
                feature.setStyle(style);
                selectcgilayer.getSource().addFeature(feature);
              }
            })
            pContent.find('#getCGICoverage').on('click', function () {
              try {
                var feature = coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id);
                if (feature) {
                  coverageVectorLayer.getSource().removeFeature(feature);
                  pContent.find('#getCGICoverage').attr("value", "显示基站范围");
                } else {
                  tMap.addWaitingModel();
                  _this.queryBaseSources("", "cgi_coverage", entityObject.id, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
                  pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
                }
              } catch (ex) {
              }
            });
            pContent.find('#getNearByCGI').on('click', function () {

              var nearCgis = JSON.parse(entityObject.desc).near_cgis;
              var idArr = [];
              if (nearCgis) {
                nearCgis = nearCgis.split(',');
                nearCgis.forEach(function (item) {
                  var id = "460-0" + item;
                  if (item.substring(0, 1) == "1") {
                    id = "460-00" + item.substring(1, item.length);
                  } else if (item.substring(0, 1) == "2") {
                    id = "460-01" + item.substring(1, item.length);
                  } else {

                  }
                  var has = false;
                  idArr.forEach(function (_id) {
                    if (_id == id) {
                      has = true;
                    }
                  });
                  if (!has) {
                    idArr.push(id);
                  }
                })
              }
              var ids = "";
              idArr.forEach(function (id) {
                ids += "," + id;
              });
              ids = ids.substring(1, ids.length);
              if (ids != "") {
                tMap.addWaitingModel();
                _this.queryBaseSources("", "cgi", ids, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
              }
            });
            return pContent[0];
          }
        }
      } else if (esJsonObjectWithTypes.type == 'case') {
        callback = function (feature) {
          if (feature) {
            var entityObject = feature.get('entityObject');
            var desc = JSON.parse(entityObject.desc);
            var time1 = desc.fasj1 || null;
            var time2 = desc.fasj2 || null;
            if (time1) {
              time1 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time1) / 1000);
            }
            if (time2) {
              time2 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time2) / 1000);
            }
            var pContent = $('<div class="cgi_content"><p>类型：案件</p>' +
              '<p>名称：' + (feature.get('name') || "无") + '</p>' +
              '<p>地址：' + (feature.get('address') || "无") + '</p>' +
              '<p>案件类型：' + (desc.ajlxch || "无") + '</p>' +
              '<p>案件类别：' + (desc.ajlbch || "无") + '</p>' +
              '<p>案发时间：' + time1 + '</p>' +
              '<p>结束时间：  ' + time2 + '</p>' +
              '<p>经纬度坐标：' + entityObject.longitude + ',' + entityObject.latitude + '</p>' +
              '<p>案情描述： </p>' +
              '<div style="height: 150px;width:100%;overflow-y: auto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + (desc.jyaq || "无") + '</div>' +
              '</div>');
            return pContent[0];
          }
        }
      } else {
      }
      //end
      commonSources.forEach(function (querySource) {
        if (featureWithType.type == querySource.type && querySource.icon != null && querySource.icon != "") {

          iconPhoto = com.jiusuo.map.webUrl + '/static/mark/' + com.jiusuo.map.iconStyle + querySource.icon;
        }
      });
      var featureType = "point";//默认为点
      esJsonObjectWithTypes.rec.forEach(function (data) {
        var dataObject = JSON.parse(data);
        var coordinates = null;
        //var coordinates = dataObject.location.coordinates;
        if (dataObject.location) {
          coordinates = dataObject.location.coordinates;
        }
        else {
          return;
        }
        var featureJson = {};
        var geometry = {};
        var iconType = "";
        if (featureWithType.type == "cgi") {
          var mobile_carrier = dataObject.mobile_carrier;
          var desc = JSON.parse(dataObject.desc);
          var network = desc.network;
          var iconType = mobile_carrier + '_' + network;
          iconPhoto = com.jiusuo.map.webUrl + '/static/mark/' + iconType + '.png';
        }
        var esJson = {};
        featureJson.type = "Feature";
        dataObject.iconType = iconType;
        esJson = setPropertyForesJsonObject(dataObject, layerId);
        featureJson.properties = esJson;


        var type = dataObject.location.type;
        if (type) {
          type = type.substring(0, 1).toUpperCase() + type.substring(1);
        } else {
          type = "Point"
        }

        geometry.type = type;
        // geometry.type = dataObject.location.type||"Point";
        geometry.coordinates = dataObject.location.coordinates;
        featureJson.geometry = geometry;
        featureJsons.push(featureJson);

        var coordinatesJson = coordinates.join(",");

        if (dataObject.location.type == "point") {
          sprinkle_features.push({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': coordinates},
            'properties': {
              icon: iconPhoto,
              iconType: iconType,
              entityObject: dataObject,
              type: codeData[dataObject.type],
              address: dataObject.address || '无',
              name: dataObject.name || '无',
              coordinate: coordinatesJson,
              innerHTML: '<div style="margin-top: 6%;"><p><span>类型：</span><span>{type}</span></p><p><span>地址：</span><span>{address}</span></p><p><span>名称：</span><span>{name}</span></p><p><span>经纬度：</span><span>{coordinate}</span></p></div>',
              showFields: [{field: 'type', alias: '类型 '}, {field: 'address', alias: '地址'}, {
                field: 'name',
                alias: '名称'
              }, {field: 'coordinate', alias: '经纬度'}],
              callback: callback
            }
          });
          //liuxl 2017-3-30 add start
        } else if (dataObject.location.type == "linestring") {
          sprinkle_features.push({
            'type': 'Feature',
            'geometry': {'type': 'LineString', 'coordinates': coordinates},
            'properties': {
              entityObject: dataObject,
              address: dataObject.address || '无',
              name: dataObject.name || '无',
              innerHTML: '<div style="margin-top: 6%;"><p><span>名称：</span><span>{name}</span></p><p><span>地址：</span><span>{address}</span></p></div>',
              showFields: [{field: 'address', alias: '地址'}, {field: 'name', alias: '名称'}],
              callback: null
            }
          });
        } else if (dataObject.location.type == "polygon") {
          var red = Math.floor(255 * Math.random());
          var green = Math.floor(255 * Math.random());
          var blue = Math.floor(255 * Math.random());
          var color = 'rgba(' + red + ',' + green + ',' + blue + ',' + 0.1 + ')';
          sprinkle_features.push({
            'type': 'Feature',
            'geometry': {'type': 'Polygon', 'coordinates': coordinates},
            'properties': {
              entityObject: dataObject,
              color: color,
              callback: null
            }
          });
        }


        //liuxl 2017-3-30 add end


        featureType = dataObject.location.type;

      });


      if (showFlag || showFlag == undefined) {
        var geoJson_sprinkle = {
          'type': 'FeatureCollection',
          'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
          'features': sprinkle_features
        };

        var sprinkleLayer = new com.jiusuo.map.TSprinkleLayer({geoJson: geoJson_sprinkle, id: layerId});
        //liuxl 2017-3-30 add start
        if (sprinkleLayer) {


          if (featureType == 'linestring') {

            var style = new com.jiusuo.map.style.TStyle({
              stroke: new com.jiusuo.map.style.TStroke({
                color: 'rgba(255,0,0,1)',
                width: 2
              })
            });
            sprinkleLayer.setStyle(style);
          } else if (featureType == 'polygon') {
            var style = function (feature) {

              var color = feature.get('color');
              var queryResultStyle = new com.jiusuo.map.style.TStyle({
                fill: new ol.style.Fill({
                  color: color
                }),
                stroke: new ol.style.Stroke({
                  color: '#3399CC',
                  width: 1.25
                })
              });
              return queryResultStyle;
            }
            sprinkleLayer.setStyle(style);
          }
          sprinkleLayer.setVisible(true);
        }
        //end

        tMap.addSprinkleLayer(sprinkleLayer);
        com.jiusuo.map.TEsBaseLayerControl.cgiDragBoxHandler(sprinkleLayer.getVectorLayer().getSource(), tMap);
      }

      featureWithType.features = featureJsons;
      featureWithType.sprinkleLayer = sprinkleLayer;
      featureJsonsWithTypes.push(featureWithType);


    });
    /* if (showFlag || showFlag == undefined) {
             var geoJson_sprinkle = {
                 'type': 'FeatureCollection',
                 'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
                 'features': sprinkle_features
             };
             var sprinkleLayer = new com.jiusuo.map.TSprinkleLayer({geoJson: geoJson_sprinkle, id: layerId});
             //liuxl 2017-3-30 add start
             if (sprinkleLayer) {


                 if (geoType == 'polyline') {

                     var style = new com.jiusuo.map.style.TStyle({
                         stroke: new com.jiusuo.map.style.TStroke({
                             color: 'rgba(0,0,0,1)',
                             width: 2
                         })
                     });
                     sprinkleLayer.setStyle(style);
                 }
                 sprinkleLayer.setVisible(true);
             }
             //end

             tMap.addSprinkleLayer(sprinkleLayer);
             com.jiusuo.map.TEsBaseLayerControl.cgiDragBoxHandler(sprinkleLayer.getVectorLayer().getSource(), tMap);
         }*/
    return featureJsonsWithTypes;
  }
}
/**
 * @类名：书签控件类
 * @用途：用于管理地图书签
 */
com.jiusuo.map.TRemarkControl = function (option_opts) {
  var options = option_opts ? option_opts : [];
  var this_ = this;
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '书签';
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_47.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_47.png' width='36px' height='36px' class='img2'></div>"
    + "</div>"
    + "<div class='triangle'></div>"
    + "<div class='set_pop set_pop3 set_pop_right8'>"
    + "<div class='margin'>"
    + "<div class='title'>地图书签</div>"
    + "<div class='net'></div>"
    + "<div class='subtitle'><a href='javascript:void(0)' id='book_all' class='sub sub1'>全选</a><a href='javascript:void(0)' class='sub sub2' id='book_create'>新建</a><a href='javascript:void(0)' id='book_goto' class='sub sub3'>跳转</a><a href='javascript:void(0)' id='delete_books' class='sub sub4'>删除</a></div>"
    + "<div class='checkbox_area'>"
    + "<ul id='bookmarks'>"
    + "</ul>"
    + "</div>"
    + "</div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  var optionItems = this_.getBookMarkList();
  if (optionItems) {
    optionItems.forEach(function (item) {
      var bookmarkhtml = "<li id=li_'" + item[0] + "'>"
        + "<label>"
        + "<input id='rb_" + item[0] + "' type='checkbox' name='book' value='" + item[0] + "'>" + item[1]
        + "</label><img id='" + item[0] + "' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_close.png'>"
        + "</li>";
      var bookmarkdiv = $(bookmarkhtml);
      $('#bookmarks').prepend(bookmarkdiv);
      bookmarkdiv.find('#' + item[0]).on('click', function (evt) {
        var d = dialog({
          title: '提示',
          content: '是否删除该书签?',
          okValue: '确 定',
          ok: function () {
            this_.deleteRemark(evt.target.id);
            $(evt.target).parent().remove();
            return true;
          },
          cancelValue: '取 消',
          cancel: function () {

          }
        });
        d.showModal();
      });
    });
  }
  $('#book_create').on('click', function (evt) {
    var d = dialog({
      title: '新建书签',
      content: '请输入书签名称：<input id="markName" type="text" value="">',
      okValue: '确 定',
      ok: function () {
        var name = $('#markName').val();
        var length = $('input:checkbox[name=book]').length;
        var flag = false;
        while (length--) {
          if ($($('input:checkbox[name=book]')[length]).parent().text() == name) {
            flag = true;
            break;
          }
        }
        if (flag) {
          var d = dialog({
            title: '提示',
            content: '书签名称已存在，请重新命名!'
          });
          d.showModal();
          return;
        }
        $($('input:checkbox[name=book]')[0]).parent().text()
        if (name != null) {
          var id = com.jiusuo.map.TUtils.createGUID();
          this_.createRemark(id, name);
          var bookmarkhtml = "<li><label>"
            + "<input type='checkbox' name='book' value='" + id + "'>" + name
            + "</label><img id='" + id + "' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_close.png'></li>";
          var bookmarkdiv = $(bookmarkhtml);
          $('#bookmarks').prepend(bookmarkdiv);
          bookmarkdiv.find('#' + id).on('click', function (evt) {
            var d = dialog({
              title: '提示',
              content: '是否删除该书签?',
              okValue: '确 定',
              ok: function () {
                this_.deleteRemark(evt.target.id);
                $(evt.target).parent().remove();
                return true;
              },
              cancelValue: '取 消',
              cancel: function () {

              }
            });
            d.showModal();
          });
        }
        return true;
      },
      cancelValue: '取 消',
      cancel: function () {

      }
    });
    d.showModal();
  });
  var isChecked = false;
  $('#book_all').on('click', function (evt) {
    if (!isChecked) {
      $('input:checkbox[name=book]').prop('checked', true);
      isChecked = true;
    } else {
      $('input:checkbox[name=book]').prop('checked', false);
      isChecked = false;
    }

  });
  $('#delete_books').on('click', function (evt) {
    var length = $('input:checkbox[name=book]:checked').length;
    if (length < 1) {
      var d = dialog({
        title: '提示',
        content: '您尚未选中书签，请选中书签后再点击删除',
      });
      d.showModal();
    } else {
      var d = dialog({
        title: '提示',
        content: '是否删除选中书签?',
        okValue: '确 定',
        ok: function () {
          $('input:checkbox[name=book]:checked').each(function (i) {
            this_.deleteRemark($(this).val());
            $(this).parent().parent().remove();
          });
          return true;
        },
        cancelValue: '取 消',
        cancel: function () {

        }
      });
      d.showModal();
    }

  });
  $('#book_goto').on('click', function (evt) {
    if ($('input:checkbox[name=book]:checked').length > 1) {
      var d = dialog({
        title: '提示',
        content: '请选中单个书签进行跳转'
      });
      d.showModal();
      return;
    }
    $('input:checkbox[name=book]:checked').each(function (i) {
      this_.gotoRemark($(this).val());
      return;
    });
  });
};
//初始化时，读取本地Cookie中的书签信息，Cookie名称为“TMAP”
com.jiusuo.map.TRemarkControl.prototype.getBookMarkList = function () {
  var options = [];
  var jsonArray = this.getCookie("TMAP");
  if (!jsonArray || jsonArray == "") {
    return options;
  } else {
    jsonArray = JSON.parse(jsonArray);
  }

  for (var i = 0; i < jsonArray.length && jsonArray.length > 0; i++) {
    var info = jsonArray[i];
    var id = info.Id;
    var name = info.Name;
    options.push([id, name]);
  }
  return options;
};
//创建书签，Cookie命名为TMAP，值为数组，数组对象为Json，表示当前书签所代表的视图状态。
// 值数据结构为[{"name":"XXX","zoom":"YYY"...}，{}，{},....]
com.jiusuo.map.TRemarkControl.prototype.createRemark = function (id, name, fatherElement) {
  var jsonArray = this.getCookie("TMAP");
  if (!jsonArray || jsonArray == "") {
    jsonArray = [];
  } else {
    jsonArray = JSON.parse(jsonArray);
  }
  var currentView = this._tMap.getOMap().getView();
  var remark_center = currentView.getCenter();
  var remark_projection = currentView.getProjection().getCode();
  var remark_zoom = currentView.getZoom();
  var remark_rotation = currentView.getRotation();
  var remark_resolution = currentView.getResolution();
  var remarkValue = {
    "Id": id, "Name": name, "Center": remark_center, "Projection": remark_projection,
    "Zoom": remark_zoom, "Rotation": remark_rotation, "Resolution": remark_resolution
  };
  jsonArray.push(remarkValue);
  var jsonStr = JSON.stringify(jsonArray);
  this.setCookie("TMAP", jsonStr, 10);
};
//跳转至当前书签
com.jiusuo.map.TRemarkControl.prototype.gotoRemark = function (id) {
  var jsonArray = this.getCookie("TMAP");
  var flag = 0;
  if (!jsonArray || jsonArray == "") {
    var d = dialog({
      title: '提示',
      content: '书签不存在或者已经过期!'
    });
    d.showModal();
    return;
  } else {
    jsonArray = JSON.parse(jsonArray);
  }
  for (var i = 0; i < jsonArray.length && jsonArray.length > 0; i++) {
    var info = jsonArray[i];
    if (info.Id == id) {
      var jsonValue = info;
      if (jsonValue) {
        var _center = com.jiusuo.map.TGeometryUtils.coortransform(jsonValue.Center, jsonValue.Projection, this._tMap.getProjection().getCode());
        this._tMap.getOMap().getView().setCenter(_center);
        this._tMap.getOMap().getView().setZoom(parseInt(jsonValue.Zoom));
      }
      flag = 1;
      return;
    }
  }
  if (flag == 0) {
    var d = dialog({
      title: '提示',
      content: '书签不存在或者已经过期!'
    });
    d.showModal();
  }
};
com.jiusuo.map.TRemarkControl.prototype.deleteRemark = function (id) {
  var jsonArray = this.getCookie("TMAP");
  var flag = 0;
  if (!jsonArray || jsonArray == "") {
    var d = dialog({
      title: '提示',
      content: '书签不存在或者已经过期!'
    });
    d.showModal();
    return;
  } else {
    jsonArray = JSON.parse(jsonArray);
  }
  for (var i = 0; i < jsonArray.length && jsonArray.length > 0; i++) {
    var info = jsonArray[i];
    if (info.Id == id) {
      jsonArray.splice(i, 1);
      var jsonStr = JSON.stringify(jsonArray);
      this.setCookie("TMAP", jsonStr, 30);
      flag = 1;
      return;
    }
  }
  if (flag == 0) {
    var d = dialog({
      title: '提示',
      content: '书签删除失败!'
    });
    d.showModal();
  }
};
//JS获取Cookie（教科书代码）
com.jiusuo.map.TRemarkControl.prototype.getCookie = function (key) {
  if (document.cookie.length > 0) {
    var cstart = document.cookie.indexOf(key + "=");
    if (cstart != -1) {
      cstart = cstart + key.length + 1;
      var cend = document.cookie.indexOf(";", cstart);
      if (cend == -1) cend = document.cookie.length;
      return document.cookie.substring(cstart, cend);
    }
  }
  return "";
};
//JS设置Cookie（教科书代码）
// 默认Cookie过期时间为10天
com.jiusuo.map.TRemarkControl.prototype.setCookie = function (key, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = key + "=" + value + ((expiredays == null) ? "" : ";expires=" + exdate.toUTCString());
};
/**
 * @类名：快速定位控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：构建快速定位控件，请输入wgs84坐标
 */
com.jiusuo.map.TCenterAtControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '快速定位';
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_49.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_49.png' width='36px' height='36px' class='img2'></div>"
    + "</div>"
    + "<div class='triangle'></div>"
    + "<div class='set_pop set_pop5 set_pop_right8'>"
    + "<div class='margin'>"
    + "<div class='title'>快速定位</div>"
    + "<div class='net'></div>"
    + "<div class='wrap'>"
    + "<label>经度：</label>"
    + "<input type='text' class='input' id='" + controlContainer + "xInput'>"
    + "</div>"
    + "<div class='wrap'>"
    + "<label>纬度：</label>"
    + "<input type='text' class='input' id='" + controlContainer + "yInput'>"
    + "</div>"
    + "<div class='wrap'>"
    + "<div class='center'>"
    + "<input type='button' value='定位' class='blue submit' id='" + controlContainer + "center_at'>"
    + "<input type='button' value='清除' class='gray reset' id='" + controlContainer + "center_remove'>"
    + "</div>"
    + "</div>"
    + "</div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  var tFlashCenter = new com.jiusuo.map.TFlashCenter(_tMap);
  $('#' + controlContainer + 'center_at').on('click', function (evt) {
    var xStr = $('#' + controlContainer + 'xInput').val();
    var yStr = $('#' + controlContainer + 'yInput').val();
    tFlashCenter.centerAt([xStr, yStr]);
  });
  $('#' + controlContainer + 'center_remove').on('click', function (evt) {
    $('#' + controlContainer + 'xInput').val("");
    $('#' + controlContainer + 'yInput').val("");
    tFlashCenter.removeCenter();
  });

};
/**
 * @类名：动画定位工具类
 * @父类：
 * @参数：构造函数无参数，但是centerAt方法接受一个[x,y]参数，xy为wgs84坐标
 * @用途：用于地图定位带有动画效果
 */
com.jiusuo.map.TFlashCenter = function (_tMap) {
  var _this = this;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  this.vector = _tMap.getVectorLayers().get('baseVector');
  this.addfeatureFlash = function (e) {
    _this.flash(e.feature);
  };
  var listenerKeyAdd = null;
  this.addFeature = function (x, y) {
    listenerKeyAdd = this.vector.getSource().on('addfeature', _this.addfeatureFlash);
    var coordinate;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && _tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      coordinate = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([[x, y]])[0];
    } else if (com.jiusuo.map.dataCoorsys == 'gcj02' && _tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      coordinate = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([[x, y]])[0];
    } else {
      coordinate = [x, y];
    }
    var geom = new com.jiusuo.map.geom.TPoint(ol.proj.transform(coordinate,
      'EPSG:4326', _tMap.getOMap().getView().getProjection().getCode()));
    var feature = new com.jiusuo.map.TFeature(geom);
    feature.set('id', 'tflashcenter_feature_' + com.jiusuo.map.TUtils.createGUID());
    feature.setStyle(new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TCircle({
        radius: 0,
        snapToPixel: false,
        fill: new com.jiusuo.map.style.TFill({color: 'blue'}),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'red', width: 3
        })
      })
    }));
    _this.vector.getSource().addFeature(feature);
    _tMap.getOMap().getView().setCenter(geom.getCoordinates());
    return feature;
  };
  var duration = 500;
  this.flash = function (feature, radiusScale, width) {
    var _width = width || 2;
    var _radiusScale = radiusScale || null;
    var start = new Date().getTime();
    var listenerKey;

    function animate(event) {
      var vectorContext = event.vectorContext;
      var frameState = event.frameState;
      if (feature.getGeometry().getType() != 'Point') {
        return;
      }
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      var radius = 2;
      if (_radiusScale != null) {
        radius = _radiusScale;
      } else {
        radius = ol.easing.easeOut(elapsedRatio) * 30 + 5;
      }
      var opacity = ol.easing.easeOut(1 - elapsedRatio);
      var flashStyle = new com.jiusuo.map.style.TCircle({
        radius: radius,
        snapToPixel: false,
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(59, 77, 85, ' + opacity + ')',
          width: _width
        })
      });
      vectorContext.setImageStyle(flashStyle);
      vectorContext.drawPointGeometry(flashGeom, null);
      if (elapsed > duration) {
        ol.Observable.unByKey(listenerKey);
        ol.Observable.unByKey(listenerKeyAdd);
        _tMap.getOMap().un('postcompose', animate);
        _this.vector.getSource().un('addfeature', _this.addfeatureFlash);
        return;
      }
      // tell OL3 to continue postcompose animation
      _tMap.getOMap().render();
    }

    listenerKey = _tMap.getOMap().on('postcompose', animate);
  }
  this.pointFlyFlash = function (feature, radiusScale, width, _duration) {
    var _width = width || 2;
    var _radiusScale = radiusScale || null;
    var start = new Date().getTime();
    var listenerKey;

    function animate(event) {
      var vectorContext = event.vectorContext;
      var frameState = event.frameState;
      if (feature.getGeometry().getType() != 'Point') {
        return;
      }
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / _duration;
      // radius will be 5 at start and 30 at end.
      var radius = 2;
      if (_radiusScale != null) {
        radius = _radiusScale;
      } else {
        radius = ol.easing.easeOut(elapsedRatio) * 30 + 5;
      }
      var opacity = ol.easing.easeOut(1 - elapsedRatio);
      var flashStyle = new com.jiusuo.map.style.TCircle({
        radius: radius,
        snapToPixel: false,
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: _width
        })
      });
      vectorContext.setImageStyle(flashStyle);
      vectorContext.drawPointGeometry(flashGeom, null);
      if (elapsed > duration) {
        ol.Observable.unByKey(listenerKey);
        ol.Observable.unByKey(listenerKeyAdd);
        _tMap.getOMap().un('postcompose', animate);
        _this.vector.getSource().un('addfeature', _this.addfeatureFlash);
        return;
      }
      // tell OL3 to continue postcompose animation
      _tMap.getOMap().render();
    }

    listenerKey = _tMap.getOMap().on('postcompose', animate);
  };
  this.geogridFlash = function (feature, radiusScale, width, _duration, color) {
    var _width = width || 2;
    var _radiusScale = radiusScale || null;
    var start = new Date().getTime();
    var listenerKey;

    function animate(event) {
      var vectorContext = event.vectorContext;
      var frameState = event.frameState;
      if (feature.getGeometry().getType() != 'Point') {
        return;
      }
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / _duration;
      // radius will be 5 at start and 30 at end.
      var radius = 2;
      if (_radiusScale != null) {
        radius = _radiusScale;
      } else {
        radius = ol.easing.easeOut(elapsedRatio) * 30 + 5;
      }
      var opacity = ol.easing.easeOut(1 - elapsedRatio);
      var flashStyle = new com.jiusuo.map.style.TCircle({
        radius: radius,
        snapToPixel: false,
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: _width
        })
      });
      var flashStyle = new com.jiusuo.map.style.TStyle({
        fill: new com.jiusuo.map.style.TFill({
          color: 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + opacity + ')'
        }),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + opacity + ')',
          // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
          width: _width
        })
      });
      vectorContext.setFillStrokeStyle(flashStyle);
      vectorContext.drawPolygonGeometry(flashGeom, null);
      if (elapsed > duration) {
        ol.Observable.unByKey(listenerKey);
        ol.Observable.unByKey(listenerKeyAdd);
        _tMap.getOMap().un('postcompose', animate);
        _this.vector.getSource().un('addfeature', _this.addfeatureFlash);
        return;
      }
      // tell OL3 to continue postcompose animation
      _tMap.getOMap().render();
    }

    listenerKey = _tMap.getOMap().on('postcompose', animate);
  };
  this.centerAt = function (point) {
    var xStr = point[0];
    var yStr = point[1];
    if (xStr && yStr && xStr != '' && yStr != '') {
      if (!isNaN(xStr) && !isNaN(yStr)) {
        var x = parseFloat(xStr);
        var y = parseFloat(yStr);
        if ((x >= -180 && x <= 180) && (y >= -90 && y <= 90)) {
          _this.addFeature(x, y);
        } else {
          var d = dialog({
            title: '提示',
            content: '经度必须在区间[-180,180],纬度必须在区间[-90,90]，您输入的值超出了区间范围！'
          });
          d.showModal();
        }
      } else {
        var d = dialog({
          title: '提示',
          content: '经度、纬度必须是数值类型！'
        });
        d.showModal();
      }
    } else {
      var d = dialog({
        title: '提示',
        content: '经度、纬度不能为空，请输入数值类型的坐标值！'
      });
      d.showModal();
    }
  };
  this.removeCenter = function () {
    var features = _this.vector.getSource().getFeatures();
    features.forEach(function (feature) {
      if (feature.get('id')) {
        if (feature.get('id').indexOf('tflashcenter_feature_') == 0) {
          _this.vector.getSource().removeFeature(feature);
        }
      }
    });
  }
};
/**
 * @类名：TOverlayUtils
 * @父类：
 * @参数：
 * @用途：构建在地图上显示的气泡的工具类，主要用于点击生成标注
 */
com.jiusuo.map.TOverlayUtils = function (_tMap) {
  var tmap = null;
  if (_tMap == null) {
    tmap = com.jiusuo.map.tMap;
  }
  this.createTOverlay = function (option_opts) {
    var option = option_opts;
    var callback = option.callback;
    var xOffSet = option.xOffSet || 0.5;
    var yOffSet = option.yOffSet || 1;
    var icon = option.icon;
    var style = new com.jiusuo.map.style.TStyle({
      image: new com.jiusuo.map.style.TIcon({
        anchor: [xOffSet, yOffSet],
        rotation: 0,
        src: icon
      })
    });
    var drawStartFunction = null;
    var drawEndFunction = function (evt) {
      tmap.removeCurrentInteraction('draw');
      var feature = evt.feature;
      feature.setStyle(style);
      feature.set('innerHTML', '111111111111111111111111');
      feature.set('showFields', null);
      feature.set('callback', callback);
    };
    var tDraw = new com.jiusuo.map.TDraw({
      style: style,
      startFunction: drawStartFunction,
      endFunction: drawEndFunction
    });
    tDraw.DrawHandle("Point");
  };
};
/**
 * @类名：TOverlay
 * @父类：
 * @参数：
 * @用途：构建在地图上显示的气泡对象
 */
com.jiusuo.map.TOverlay = function (opt_options, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  this.options = opt_options || {};
  var _this = this;
  this.innerHTML = this.options.innerHTML;
  this.callback = this.options.callback || null;
  this.getInnerHTML = function () {
    return _this.innerHTML;
  };
  this.getPosition = function () {
    return _this.options.position;
  };
  this.getCallback = function () {
    return _this.callback;
  };
};
/**
 * @类名：TArmyDrawControl 军标绘制控件
 * @父类：
 * @参数：opt_options.innerHTML控件显示名称,opt_options.tipLabel控件鼠标提示
 * @用途：用于控制军用绘制
 */
com.jiusuo.map.TArmyDrawControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '绘制工具';
  var tArmyDraw = new com.jiusuo.map.TArmyDraw(_tMap);
  var html = "<div class='list'>"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "            <div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_51.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_51.png' width='36px' height='36px' class='img2'></div>"
    + "          </div>"
    + "          <div class='triangle'></div>"
    + "          <div class='set_pop set_pop4 set_pop_right8'>"
    + "            <div class='margin'>"
    + "              <div class='title'>绘制工具</div>"
    + "              <div class='net'></div>"
    + "              <div class='wrap_line'>"
    + "                <div class='left3 left3_img1'>操作：</div>"
    + "                <div class='right'>"
    + "                  <div class='two blue' id='armydraw_clear' style='cursor: pointer;'>清空</div>"
    + "                  <div class='two gray' id='armydraw_free' style='cursor: pointer;'>释放</div>"
    + "                </div>"
    + "              </div>"
    + "              <div class='white_line'></div>"
    + "              <div class='wrap_line'>"
    + "                <div class='left3 left3_img2'>线标：</div>"
    + "                <div class='right'>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.ARC + "' style='cursor: pointer;'>弧线"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.CURVE + "' style='cursor: pointer;'>曲线"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.POLYLINE + "' style='cursor: pointer;'>折线"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.FREEHAND_LINE + "' style='cursor: pointer;'>自由线"
    + "                  </label>"
    + "                </div>"
    + "              </div>"
    + "              <div class='white_line'></div>"
    + "              <div class='wrap_line'>"
    + "                <div class='left3 left3_img3'>面标：</div>"
    + "                <div class='right'>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.CIRCLE + "' style='cursor: pointer;'>圆形"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.ELLIPSE + "' style='cursor: pointer;'>椭圆"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.LUNE + "' style='cursor: pointer;'>弓形"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.SECTOR + "' style='cursor: pointer;'>扇形"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.CLOSED_CURVE + "' style='cursor: pointer;'>曲面"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.POLYGON + "' style='cursor: pointer;'>多边形"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.FREEHAND_POLYGON + "' style='cursor: pointer;'>自由面"
    + "                  </label>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap_line'>"
    + "                <div class='left3 left3_img4'>箭头：</div>"
    + "                <div class='right'>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.DOUBLE_ARROW + "' style='cursor: pointer;'>钳击"
    + "                 </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.ATTACK_ARROW + "' style='cursor: pointer;'>进攻"
    + "                 </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.TAILED_ATTACK_ARROW + "' style='cursor: pointer;'>进攻尾"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.ASSAULT_DIRECTION + "' style='cursor: pointer;'>突击"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.SQUAD_COMBAT + "' style='cursor: pointer;'>分队"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.TAILED_SQUAD_COMBAT + "' style='cursor: pointer;'>分队尾"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.FINE_ARROW + "' style='cursor: pointer;'>细箭头"
    + "                  </label>"
    + "                  <label>"
    + "                    <input type='radio' name='junbiao' value='" + P.PlotTypes.STRAIGHT_ARROW + "' style='cursor: pointer;'>直箭头"
    + "                  </label>"
    + "                </div>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  $('input[name=junbiao]').change(function (evt) {
    var value = $('input[name=junbiao]:checked').val();
    tArmyDraw.beginDraw(value);
  });
  $('#armydraw_clear').on('click', function (evt) {
    tArmyDraw.clear()
  });
  $('#armydraw_free').on('click', function (evt) {
    tArmyDraw.plotDraw.deactivate();
    tArmyDraw.plotEdit.deactivate();
  });
};
/**
 * @类名：TArmyDraw 军标绘制类
 * @父类：
 * @参数：
 * @用途：用于绘制军用图标
 */
com.jiusuo.map.TArmyDraw = function (_tMap) {
  var this_ = this;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var map = _tMap.getOMap();
  // 初始化标绘绘制工具，添加绘制结束事件响应
  this.plotDraw = new P.PlotDraw(map);
  this.plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, onDrawEnd, false, this);
  // 初始化标绘编辑工具
  this.plotEdit = new P.PlotEdit(map);
  map.on('click', function (e) {
    if (this_.plotDraw.isDrawing()) {
      return;
    }
    var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
      return feature;
    });
    if (feature) {
      // 开始编辑
      this_.plotEdit.activate(feature);
    } else {
      // 结束编辑
      this_.plotEdit.deactivate();
    }
  });
  // 设置标绘符号显示的默认样式
  var stroke = new com.jiusuo.map.style.TStroke({color: 'red', width: 2});
  var fill = new com.jiusuo.map.style.TFill({color: 'rgba(255, 0, 0, 0.2)'});
  var drawStyle = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
  // 绘制好的标绘符号，添加到FeatureOverlay显示。
  this.drawOverlay = new ol.layer.Vector({
    source: new ol.source.Vector()
  });
  this.drawOverlay.setStyle(drawStyle);
  this.drawOverlay.setMap(map);

  function onDrawEnd(event) {
    $('input[name=junbiao]:checked').each(function () {
      $(this).prop('checked', false);
    });
    this_.plotDraw.deactivate();
    var feature = event.feature;
    this_.drawOverlay.getSource().addFeature(feature);
    // 开始编辑
    this_.plotEdit.activate(feature);
  }

  this.beginDraw = function (command) {
    this_.activate(command);
  };
// 指定标绘类型，开始绘制。
  this.activate = function (type) {
    this_.plotEdit.deactivate();
    this_.plotDraw.deactivate();
    this_.plotDraw.activate(type);
  };
  this.clear = function () {
    this_.drawOverlay.getSource().clear();
  };
};
/**
 * @类名：TEditFeature 元素编辑类
 * @父类：
 * @参数：
 * @用途：用于编辑已有地图元素
 */
com.jiusuo.map.TEditFeature = function (opt_options) {
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.optionModify = {startFunction: options.startFunction, endFunction: options.endFunction};

  /**
   * @return {boolean}
   */
  function SelectFilterFunction(feature) {
    if (feature.get('isEditable') == true) {
      return true;
    }
  }

  this.selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.doubleClick,
    filter: SelectFilterFunction
  });
  var selectFeatures = this.selectInteraction.getFeatures();
  this.translate = new ol.interaction.Translate({
    features: selectFeatures
  });
  this.modifyInteraction = new ol.interaction.Modify({
    features: selectFeatures
  });
};
//开始编辑，实则加入三个Interaction，回调函数为节点修改即调用且无加入translate的回调函数，并不合理，需要修改
com.jiusuo.map.TEditFeature.prototype.startEdit = function () {
  var option = this.optionModify || {};
  var startFunction = option.startFunction || function () {
  };
  var endFunction = option.endFunction || function () {
  };
  this.modifyInteraction.on('modifystart', startFunction);
  this.modifyInteraction.on('modifyend', endFunction);
  this._tMap.addCurrentInteraction('editSelect', this.selectInteraction);
  this._tMap.addCurrentInteraction('editTranslate', this.translate);
  this._tMap.addCurrentInteraction('editModify', this.modifyInteraction);
};
//去除三个Interaction
com.jiusuo.map.TEditFeature.prototype.endEdit = function () {
  this._tMap.removeCurrentInteraction('editSelect');
  this._tMap.removeCurrentInteraction('editTranslate');
  this._tMap.removeCurrentInteraction('editModify');
};
com.jiusuo.map.TFeatureOverLay = function (opt_options) {
  var options = opt_options || {};
  var _this = this;
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  this.geoJson = options.geoJson;
  //数据投影坐标系统设定为4326坐标系。
  var dataProjection = 'EPSG:4326';
  //当前地图投影坐标系统
  var featureProjection = this._tMap.getProjection().getCode();
  //从JSON文件中读取Point信息，包含位置与需要显示的属性信息。
  var _nFeatures = [];
  var _rFeatures = this.geoJson.features;
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  if (com.jiusuo.map.dataCoorsys == 'gcj02' && this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    _rFeatures.forEach(function (rFeature) {
      var coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([rFeature.geometry.coordinates]);
      rFeature.geometry.coordinates = coordinates[0];
      _nFeatures.push(rFeature);
    });
    this.geoJson.features = _nFeatures;
  }
  var features = function () {
    try {
      return (new ol.format.GeoJSON()).readFeatures(_this.geoJson, {
        dataProjection: dataProjection,
        featureProjection: featureProjection
      });
    } catch (ex) {
      return null;
    }
  };
  features();
  var feature = features()[0];
  feature.setStyle(new com.jiusuo.map.style.TStyle({
    image: new com.jiusuo.map.style.TIcon({
      anchor: [0.5, 0.5],
      src: feature.get('icon') || 'data/icon.png'
    })
  }));
  var tOverlay = new com.jiusuo.map.TOverlay({
    innerHTML: feature.get('innerHTML'),
    position: feature.getGeometry().getCoordinates(),
    callback: feature.get('callback')
  });
  this.getTOverLay = function () {
    return tOverlay;
  };
  this.getFeature = function () {
    return feature;
  };
};
/**
 * @类名：全图控件
 * @父类：
 * @参数：
 * @用途：将地图恢复至初始范围
 */
com.jiusuo.map.TZoomToExtentControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this.extent_ = options.extent ? options.extent : null;
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '全图';
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_zoomtoextent'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_23.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_23.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_zoomtoextent').on('click', function (evt) {
    handleZoomToExtent();
  });
  var handleZoomToExtent = function () {
    var map = _this._tMap.getOMap();
    var view = map.getView();
    var extent = !_this.extent_ ? view.getProjection().getExtent() : _this.extent_;
    var size = map.getSize();
    view.fit(extent, size);
  };
};
/**
 * @类名：全屏控件
 * @父类：
 * @参数：
 * @用途：将地图恢复至初始范围
 */
com.jiusuo.map.TMapFullScreenControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this.extent_ = options.extent ? options.extent : null;
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '全屏';
  var elem = this._tMap.getOMap().getTargetElement();
  var fullscreen = function () {
    if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.requestFullScreen) {
      elem.requestFullscreen();
    } else {
      var d = dialog({
        title: '提示',
        content: '浏览器不支持全屏API或已被禁用！'
      });
      d.showModal();
    }
  }
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_fullscreen'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_full.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_full1.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_fullscreen').on('click', function (evt) {
    fullscreen();
  });
};
com.jiusuo.map.TZoominControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var delta = options.delta !== undefined ? options.delta : 1;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '放大';
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_zoomin'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_19.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_192.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_zoomin').on('click', function (evt) {
    zoomByDelta(delta);
  });
  var zoomByDelta = function (delta) {
    var map = _this._tMap.getOMap();
    var view = map.getView();
    if (!view) {
      return;
    }
    var currentResolution = view.getResolution();
    if (currentResolution) {
      if (_this.duration_ > 0) {
        map.beforeRender(ol.animation.zoom({
          resolution: currentResolution,
          duration: _this.duration_,
          easing: ol.easing.easeOut
        }));
      }
      var newResolution = view.constrainResolution(currentResolution, delta);
      view.setResolution(newResolution);
    }
  };
  this.duration_ = options.duration !== undefined ? options.duration : 250;

};
com.jiusuo.map.TZoomoutControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var delta = options.delta !== undefined ? options.delta : 1;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '缩小';
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_zoomout'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_21.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_21.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_zoomout').on('click', function (evt) {
    zoomByDelta(-delta);
  });
  var zoomByDelta = function (delta) {
    var map = _this._tMap.getOMap();
    var view = map.getView();
    if (!view) {
      return;
    }
    var currentResolution = view.getResolution();
    if (currentResolution) {
      if (_this.duration_ > 0) {
        map.beforeRender(ol.animation.zoom({
          resolution: currentResolution,
          duration: _this.duration_,
          easing: ol.easing.easeOut
        }));
      }
      var newResolution = view.constrainResolution(currentResolution, delta);
      view.setResolution(newResolution);
    }
  };
  this.duration_ = options.duration !== undefined ? options.duration : 250;

};
/**
 * @类名：清空临时图层控件
 * @父类：
 * @参数：
 * @用途：清除地图上绘制的临时元素
 */
com.jiusuo.map.TClearControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  var tipLabel = options.tipLabel || '清除';
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var handle = function () {
    _tMap.featureJsonsForES = [];
    //获得常规轨迹列表
    var routeList = _tMap.getRouteList();
    while (routeList.getLength() > 0) {
      //确定其轨迹停止播放
      routeList.item(routeList.getLength() - 1).stopAnimation();
      routeList.removeAt(routeList.getLength() - 1);
    }
    var trackList = _tMap.getTrackList();
    while (trackList.getLength() > 0) {
      //确定其轨迹停止播放
      trackList.item(trackList.getLength() - 1).stopAnimation();
      trackList.removeAt(trackList.getLength() - 1);
    }
    //去除轨迹控件中的轨迹列表，与实时轨迹重叠
    $("div[name='divs']").each(function () {
      $(this).remove();
    });
    //去除实时轨迹，移除轨迹控件
    if (_tMap.pathControl != null) {
      _tMap.pathControl.routeControl.setVisible(false);
    }
    //获得实时轨迹列表
    var pathList = _tMap.getPathList();
    while (pathList.getLength() > 0) {
      //停止增加实时轨迹点
      pathList.item(pathList.getLength() - 1).setEnableAdd(false);
      pathList.item(pathList.getLength() - 1).setVisible(false);
      pathList.removeAt(pathList.getLength() - 1);
    }
    //清空矢量图层内容，包括图形绘制、热力图、撒点、聚类
    var map = _tMap.getOMap();
    var layers = map.getLayers();
    _tMap.sprinkleLayers.clear();
    var length = layers.getLength();

    for (var i = 0; i < length; i++) {
      var layer = layers.item(i);
      //判断是否为矢量图层
      if (layer.constructor == ol.layer.Vector) {
        //清空聚类图层
        if (layer.getSource().constructor == ol.source.Cluster) {
          layer.getSource().getSource().clear();
        } else {
          //清空矢量图层
          try {
            layer.getSource().clear();
          } catch (ex) {
          }
        }
        //清空热力图层
      } else if (layer.constructor == ol.layer.Heatmap) {
        layer.getSource().clear();
      }
    }
    //清空绘制的overlay对象
    _tMap.measureOverlays.forEach(function (overlay) {
      _tMap.getOMap().removeOverlay(overlay);
    });
    if (options.callback != null) {
      options.callback();
    }
    if ($('#esDataList') != null) {   //删除ES左边框
      $('#esDataList').remove();
      $('#esDataListForLeft').remove();
      _tMap.returnEsDatasArray = [];
    }
    //删除指定交互层start
    var selectSingleClick = com.jiusuo.map.tMap.currentInteraction.get("addFeaturesWithCtrlKey");
    if (selectSingleClick) {
      selectSingleClick.getFeatures().clear();
    }
    _tMap.removeCurrentInteraction("measure");
    _tMap.removeCurrentInteraction("draw");

    //end
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + controlContainer + "_ctm_tool_pop_clear'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_11.png' width='26px' height='26px' class='img_right1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_11.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
 // $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_clear').on('click', function (evt) {
    handle();
  });
};
ol.inherits(com.jiusuo.map.TClearControl, ol.control.Control);
com.jiusuo.map.style = {};
com.jiusuo.map.style.TStyle = function (opt_options) {
  ol.style.Style.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TStyle, ol.style.Style);
com.jiusuo.map.style.TCircle = function (opt_options) {
  ol.style.Circle.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TCircle, ol.style.Circle);
com.jiusuo.map.style.TFill = function (opt_options) {
  ol.style.Fill.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TFill, ol.style.Fill);
com.jiusuo.map.style.TIcon = function (opt_options) {
  ol.style.Icon.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TIcon, ol.style.Icon);
com.jiusuo.map.style.TStroke = function (opt_options) {
  ol.style.Stroke.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TStroke, ol.style.Stroke);
com.jiusuo.map.style.TText = function (opt_options) {
  ol.style.Text.call(this, opt_options);
};
ol.inherits(com.jiusuo.map.style.TText, ol.style.Text);
com.jiusuo.map.geom = {};
com.jiusuo.map.geom.TCircle = function (center, opt_radius, opt_layout) {
  ol.geom.Circle.call(this, center, opt_radius, opt_layout);
};
ol.inherits(com.jiusuo.map.geom.TCircle, ol.geom.Circle);
com.jiusuo.map.geom.TPolyline = function (coordinates, opt_layout) {
  ol.geom.LineString.call(this, coordinates, opt_layout);
};
ol.inherits(com.jiusuo.map.geom.TPolyline, ol.geom.LineString);
com.jiusuo.map.geom.TPolygon = function (coordinates, opt_layout) {
  ol.geom.Polygon.call(this, coordinates, opt_layout);
};
ol.inherits(com.jiusuo.map.geom.TPolygon, ol.geom.Polygon);
com.jiusuo.map.geom.TPoint = function (coordinates, opt_layout) {
  ol.geom.Point.call(this, coordinates, opt_layout);
};
ol.inherits(com.jiusuo.map.geom.TPoint, ol.geom.Point);
com.jiusuo.map.TFeature = function (opt_geometryOrProperties) {
  ol.Feature.call(this, opt_geometryOrProperties);
};
ol.inherits(com.jiusuo.map.TFeature, ol.Feature);
com.jiusuo.map.TFeature.prototype.setProp = function (properties) {
  var _this = this;
  if (properties && properties.length > 0) {
    properties.forEach(function (item) {
      _this.set(item[0], item[1]);
    });
  }
}
com.jiusuo.map.TCustomDIV = function (element) {
  var options = {};
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(com.jiusuo.map.TCustomDIV, ol.control.Control);
com.jiusuo.map.TSolr = function (configPath) {
  var tSolrConfig = new com.jiusuo.map.TSolrConfig(configPath);
  var tSolrNodes = tSolrConfig.getSolrNodes();
  this.query = function (nodeName, coreName, tSolrQuery) {
    var tSolrNode = null;
    tSolrNodes.forEach(function (node) {
      if (node.getName() == nodeName) {
        tSolrNode = node;
      }
    });
    if (tSolrNode == null) {
      return null;
    }
    var cores = tSolrNode.getCores();
    var tSolrCore = null;
    cores.forEach(function (core) {
      if (core.getName() == coreName) {
        tSolrCore = core;
      }
    });
    if (tSolrCore == null) {
      return null;
    }
    return tSolrCore.query(tSolrNode, tSolrQuery);
  };
};
com.jiusuo.map.TSolrQuery = function () {
  var _this = this;
  this._q = null;
  this._fq = null;
  this._sort = null;
  this._start = 0;
  this._rows = 10;
  this._fl = null;
  this._df = null;
  this._RawQueryParameters = null;
  this._wt = 'json';
  this.getParams = function () {
    var params = '';
    if (_this._q != null) {
      params += 'q=' + _this._q + '&';
    }
    if (_this._fq != null) {
      params += 'fq=' + _this._fq + '&';
    }
    if (_this._sort != null) {
      params += 'sort=' + _this._sort + '&';
    }
    if (_this._start != null) {
      params += 'start=' + _this._start + '&';
    }
    if (_this._rows != null) {
      params += 'rows=' + _this._rows + '&';
    }
    if (_this._fl != null) {
      params += 'fl=' + _this._fl + '&';
    }
    if (_this._df != null) {
      params += 'df=' + _this._df + '&';
    }
    if (_this._RawQueryParameters != null) {
      params += _this._RawQueryParameters + '&';
    }
    if (_this._wt != null) {
      params += 'wt=' + _this._wt + '&';
    }
    params += 'indent=true';
    return params;
  };
  this.setQ = function (q) {
    _this._q = q;
  };
  this.getQ = function () {
    return _this._q;
  };
  this.setFq = function (fq) {
    _this._fq = fq;
  };
  this.getFq = function () {
    return _this._fq;
  };
  this.setSort = function (sort) {
    _this._sort = sort;
  };
  this.getSort = function () {
    return _this._sort;
  };
  this.setStart = function (start) {
    _this._start = start;
  };
  this.getStart = function () {
    return _this._start;
  };
  this.setRows = function (rows) {
    _this._rows = rows;
  };
  this.getRows = function () {
    return _this._rows;
  };
  this.setFl = function (fl) {
    _this._fl = fl;
  };
  this.getFl = function () {
    return _this._fl;
  };
  this.setDf = function (df) {
    _this._df = df;
  };
  this.getDf = function () {
    return _this._df;
  };
  this.setRawQueryParameters = function (RawQueryParameters) {
    _this._RawQueryParameters = RawQueryParameters;
  };
  this.getRawQueryParameters = function () {
    return _this._RawQueryParameters;
  };
  this.setWt = function (wt) {
    _this._wt = wt;
  };
  this.getWt = function () {
    return _this._wt;
  };
};
com.jiusuo.map.TSolrConfig = function (configPath) {
  var _this = this;
  var xmlDoc = com.jiusuo.map.TUtils.loadXmlDoc(configPath);
  if (xmlDoc == null) {
    return null;
  }
  this.proxyUrl = $(xmlDoc).find('SolrProxy').find('Url').text();
  var tSolrNodes = [];
  var $SolrNodes = $(xmlDoc).find('SolrNodes');
  $SolrNodes.find('Node').each(function () {
    var $Node = $(this);
    var tSolrNode = new com.jiusuo.map.TSolrNode();
    tSolrNode.setName($Node.find('NodeName').text());
    tSolrNode.setIp($Node.find('Ip').text());
    tSolrNode.setPort($Node.find('Port').text());
    tSolrNode.setProxyUrl(_this.proxyUrl);
    var tCores = [];
    var $Cores = $Node.find('Cores');
    $Cores.find('Core').each(function () {
      var $Core = $(this);
      var tSolrCore = new com.jiusuo.map.TSolrCore();
      tSolrCore.setName($Core.find('CoreName').text());
      tSolrCore.setNodeName(tSolrNode.getName());
      tCores.push(tSolrCore);
    });
    tSolrNode.setCores(tCores);
    tSolrNodes.push(tSolrNode);
  });
  this.nodes = tSolrNodes;
  this.getSolrNodes = function () {
    return _this.nodes;
  };
  this.getProxyUrl = function () {
    return _this.proxyUrl;
  };
};
com.jiusuo.map.TSolrNode = function () {
  var _this = this;
  this._proxyUrl = '';
  this._name = '';
  this._ip = '';
  this._port = '';
  this._cores = [];
  this.setProxyUrl = function (proxyUrl) {
    _this._proxyUrl = proxyUrl;
  };
  this.getProxyUrl = function () {
    return _this._proxyUrl;
  };
  this.setName = function (name) {
    _this._name = name;
  };
  this.getName = function () {
    return _this._name;
  };
  this.setIp = function (ip) {
    _this._ip = ip;
  };
  this.getIp = function () {
    return _this._ip;
  };
  this.setPort = function (port) {
    _this._port = port;
  };
  this.getPort = function () {
    return _this._port;
  };
  this.setCores = function (cores) {
    _this._cores = cores;
  };
  this.getCores = function () {
    return _this._cores;
  };
};
com.jiusuo.map.TSolrCore = function () {
  var _this = this;
  this._name = '';
  this._nodeName = '';
  this.setName = function (name) {
    _this._name = name;
  };
  this.getName = function () {
    return _this._name;
  };
  this.setNodeName = function (nodeName) {
    _this._nodeName = nodeName;
  };
  this.getNodeName = function () {
    return _this._nodeName;
  };
  this.query = function (tSolrNode, tSolrQuery) {
    var url = tSolrNode.getProxyUrl() + "?ip=" + tSolrNode.getIp() + "&" + "port=" + tSolrNode.getPort() + "&" + "coreName=" + _this._name + "&" + tSolrQuery.getParams();
    url = encodeURI(encodeURI(url));
    var result = null;
    $.ajax({
      async: false,
      cache: false,
      type: "GET",
      url: url,
      crossDomain: true,
      timeout: 10000,
      error: function (json) {
        var d = dialog({
          title: '提示',
          content: '查询solr出现异常：' + json
        });
        d.showModal();
      },
      success: function (json) {
        result = json;
      }
    });
    return result;
  };
};
com.jiusuo.map.TGraticule = function (_tMap) {
  var _this = this;
  this.features = [];
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  this.createTGraticule = function (lineColor, lineWidth, cellSize, cellColor) {
    _this.features = [];
    var pixX = _tMap.getOMap().getSize()[0] / 2;
    var pixY = _tMap.getOMap().getSize()[1] / 2;
    var resolution = _tMap.getOMap().getView().getResolution();
    var center = _tMap.getOMap().getView().getCenter();
    var cellPixR = cellSize * resolution;
    var minx = (Math.round((center[0] - pixX * resolution) / cellSize / resolution) - 1) * cellPixR;
    var miny = (Math.round((center[1] - pixY * resolution) / cellSize / resolution) - 1) * cellPixR;
    var maxx = (Math.round((center[0] + pixX * resolution) / cellSize / resolution) + 1) * cellPixR;
    var maxy = (Math.round((center[1] + pixY * resolution) / cellSize / resolution) + 1) * cellPixR;

    var xNum = (maxx - minx) / cellPixR;
    var yNum = (maxy - miny) / cellPixR;
    var extents = [];
    for (var x = 0; x < xNum; x++) {
      for (var y = 0; y < yNum; y++) {
        var originXY = [minx + x * cellPixR, miny + y * cellPixR];
        var extent = [originXY[0], originXY[1] - cellPixR, originXY[0] + cellPixR, originXY[1]];
        extents.push(extent);
      }
    }

    extents.forEach(function (extent) {
      var geom = ol.geom.Polygon.fromExtent(extent);
      var extentFeature = new com.jiusuo.map.TFeature(geom);
      var stroke = new com.jiusuo.map.style.TStroke({color: lineColor, width: lineWidth});
      var fill = new com.jiusuo.map.style.TFill({color: cellColor});
      var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
      extentFeature.setStyle(style);
      _this.features.push(extentFeature);
    });
  }
  this.getFeatures = function () {
    return _this.features;
  }
}
com.jiusuo.map.TMousePosition = function (options) {
  var _this = this;
  this._tMap = options.Map != undefined ? options.Map : com.jiusuo.map.tMap;
  this._tProjection = options.projection != undefined ? options.projection : 'EPSG:4326';
  this._tCoordinateFormat = options.coordinateFormat;
  var element = document.createElement('DIV');
  element.className = options.className != undefined ? options.className : 'ol-mouse-position'
  this.mapProjection_ = null;
  this.lastMouseMovePixel_ = null;
  var viewport = _this._tMap.getOMap().getViewport();
  viewport.addEventListener('mousemove', function (evt) {
    var map = _this._tMap.getOMap();
    _this.lastMouseMovePixel_ = map.getEventPixel(evt);
    _this.updateHTML_(_this.lastMouseMovePixel_);
  });

  viewport.addEventListener('mouseout', function (evt) {
    _this.updateHTML_(null);
    _this.lastMouseMovePixel_ = null;
  });

  this.renderedHTML_ = element.innerHTML;

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(com.jiusuo.map.TMousePosition, ol.control.Control);
com.jiusuo.map.TMousePosition.prototype.updateHTML_ = function (pixel) {
  var html = '';
  if (pixel) {
    var map = this._tMap.getOMap();
    var coordinate = map.getCoordinateFromPixel(pixel);
    if (coordinate) {
      var point = ol.proj.transform(coordinate, this._tMap.getProjection().getCode(), this._tProjection);
      var coordinateFormat = this._tCoordinateFormat;
      if (coordinateFormat) {
        html = coordinateFormat(point);
      } else {
        html = point.toString();
      }
    }
  }
  if (!this.renderedHTML_ || html != this.renderedHTML_) {
    this.element.innerHTML = html;
    this.renderedHTML_ = html;
  }
};
com.jiusuo.map.TRightMenu = function (options) {
  var _this = this;
  this._tMap = options.Map != undefined ? options.Map : com.jiusuo.map.tMap;
  this.callback = options.callback != undefined ? options.callback : null;
  this.style = options.style != undefined ? options.style : null;
  this.withoutFeatureTrigger = options.withoutFeatureTrigger != undefined ? options.withoutFeatureTrigger : true;
  this.div = options.div != undefined ? options.div : null;
  window.rightMenuStatus = true;
  this.MenuContent = [];
  this.AddItem = function (name, fn, img) {
    this.MenuContent[this.MenuContent.length] = [name, fn, img];
  }
  this.AddLine = function () {
    this.MenuContent[this.MenuContent.length] = "line";
  }
  this.Init = function () {
    var _map = _this._tMap;
    var _callback = _this.callback;
    var _div = _this.div;
    var _style = _this.style;
    var _withoutFeatureTrigger = _this.withoutFeatureTrigger;
    if (_div == undefined || _div == null) {
      _div = document.createElement("div");
      with (_div.style) {
        position = _style.position;
        left = _style.left;
        top = _style.top;
        width = _style.width;
        lineHeight = _style.lineHeight;
        backgroundColor = _style.backgroundColor;
        borderTop = _style.borderTop;
        borderLeft = _style.borderLeft;
        borderBottom = _style.borderBottom;
        borderRight = _style.borderRight;
        cursor = _style.cursor;
        zIndex = _style.zIndex;
      }
      document.body.appendChild(_div);
      var mouseOverStyle = _style.mouseOverStyle != undefined ? _style.mouseOverStyle : {
        backgroundColor: "#0a246a",
        color: "#fff"
      };
      var lineStyle = _style.lineStyle != undefined ? _style.lineStyle : {
        height: "0px",
        lineHeight: "0px",
        overflow: "hidden",
        borderTop: "1px solid #888",
        borderBottom: "1px solid #fff"
      };
      var s = "";
      for (var i = 0; i < this.MenuContent.length; i++) {
        if (this.MenuContent[i] == "line") {
          s += "<div style=\"height:" + lineStyle.height + ";line-height:" + lineStyle.lineHeight + ";overflow:" + lineStyle.overflow + ";border-top:" + lineStyle.borderTop + ";border-bottom:" + lineStyle.borderBottom + ";\"></div>";
        }
        else {
          if (this.MenuContent[i][2]) {
            s += "<div style=\"width:100%;\" onclick=\"" + this.MenuContent[i][1] + "\" onmouseover=\"style.background=\'" + mouseOverStyle.backgroundColor + "\';style.color=\'" + mouseOverStyle.color + "\';\" onmouseout=\"style.background=\'\';style.color=\'\';\">&nbsp;<img alt=\"\" src=\"" + this.MenuContent[i][2] + "\" />" + this.MenuContent[i][0] + "</div>";
          }
          s += "<div style=\"width:100%;\" onclick=\"" + this.MenuContent[i][1] + "\" onmouseover=\"style.background=\'" + mouseOverStyle.backgroundColor + "\';style.color='" + mouseOverStyle.color + "\';\" onmouseout=\"style.background=\'\';style.color=\'\';\">&nbsp;" + this.MenuContent[i][0] + "</div>";
        }
        _div.innerHTML = s;
        _div.oW = _div.offsetWidth;
        _div.oH = _div.offsetHeight;
        _div.style.display = "none";
      }
    }
    var viewport = _map.getOMap().getTargetElement();
    viewport.oncontextmenu = function (event) {
      event = event || window.event;
      var featureEvt = null;
      featureEvt = _map.getOMap().forEachFeatureAtPixel(_map.getOMap().getEventPixel(event),
        function (featureEvt) {
          return featureEvt;
        });

      var coor = _map.getOMap().getEventCoordinate(event);

      if (featureEvt == null) {
        featureEvt = new ol.Feature();
        featureEvt.setGeometry(new ol.geom.Point(coor));
      }

      console.log(featureEvt.getGeometry().getCoordinates());
      _callback(featureEvt);
      if (featureEvt == null && _withoutFeatureTrigger == false) {
        _div.style.display = "none";
        return true;
      } else {
        var nx = document.body.scrollLeft + event.clientX;
        var ny = document.body.scrollTop + event.clientY;
        if (event.clientX + _div.oW + 20 > document.body.offsetWidth) {
          nx = nx - _div.oW;
        }
        if (event.clientY + _div.oH + 20 > document.body.offsetHeight) {
          ny = ny - _div.oH;
        }
        _div.style.left = nx + 'px';
        _div.style.top = ny + 'px';
        _div.style.display = "block";
      }
      this.onclick = function () {
        setTimeout(function () {
          _div.style.display = "none";
        }, 100);
        this.onclick = null;
      }


      return false;
    }
  }
};
com.jiusuo.map.geom.TArc = function (options) {
  var _this = this;
  var option = options || {};
  var tMap = option.tMap;
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var projection = tMap.getProjection().getCode();
  var opt_layout = option.opt_layout;
  var points = option.points;
  var angle = option.angle || 120;
  var gcjPoints;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(points);
  if (com.jiusuo.map.dataCoorsys == 'wgs84' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
    gcjPoints = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(points);
  } else if (com.jiusuo.map.dataCoorsys == 'gcj02' && tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
    gcjPoints = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(points);
  } else {
    gcjPoints = points;
  }
  var mktPoint = [];
  gcjPoints.forEach(function (item) {
    mktPoint.push(com.jiusuo.map.TGeometryUtils.coortransform(item, 'EPSG:4326', projection));
  });
  var pnt1 = mktPoint[0];
  var pnt2 = mktPoint[1];
  var distance = P.PlotUtils.distance(pnt1, pnt2);
  var radius = (distance / 2) / Math.sin((angle / 2) / 180 * Math.PI);
  var arc = angle / 180 * Math.PI;
  var center = P.PlotUtils.getThirdPoint(pnt1, pnt2, (Math.PI - arc) / 2, radius, false);
  var angle1 = P.PlotUtils.getAzimuth(pnt1, center);
  var angle2 = P.PlotUtils.getAzimuth(pnt2, center);
  var startAngle = angle1;
  var endAngle = angle2;
  var layer = tMap.getVectorLayer('baseVector');
  var coordinates = P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
  ol.geom.LineString.call(this, coordinates, opt_layout);
};
ol.inherits(com.jiusuo.map.geom.TArc, ol.geom.LineString);
//绘制扇形
com.jiusuo.map.drawSector = function (point, radius, startAngle, endAngle, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  //中心点转换
  var gcj02Point = point;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([point])[0];
  var projection = tMap.getProjection().getCode();
  var center = com.jiusuo.map.TGeometryUtils.coortransform(gcj02Point, 'EPSG:4326', projection);
  var polygon = new com.jiusuo.map.geom.TPolygon();
  //提供中心点，半径，起始角度，终止角度，逆时针方向
  var pList = P.PlotUtils.getArcPoints(center, radius, endAngle, startAngle);
  //当角度差大于360°的时候按照圆形来画
  if (Math.abs(endAngle - startAngle) < (Math.PI * 2)) {
    pList.push(center, pList[0]);
  }
  polygon.setCoordinates([pList]);
  return polygon;
}
//绘制圆环
com.jiusuo.map.drawRingSector = function (point, minRadius, maxRadius, startAngle, endAngle, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  //中心点转换
  var gcj02Point = point;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([point])[0];
  var projection = tMap.getProjection().getCode();
  var center = com.jiusuo.map.TGeometryUtils.coortransform(gcj02Point, 'EPSG:4326', projection);
  var polygon = new com.jiusuo.map.geom.TPolygon();
  ////提供中心点，半径，起始角度，终止角度，逆时针方向
  var pMinList = P.PlotUtils.getArcPoints(center, minRadius, endAngle, startAngle);
  var pMaxList = P.PlotUtils.getArcPoints(center, maxRadius, endAngle, startAngle);
  //当角度差大于360°的时候按照圆形来画
  if (Math.abs(endAngle - startAngle) >= (Math.PI * 2)) {
    var ringMin = new ol.geom.LinearRing(pMinList);
    var ringMax = new ol.geom.LinearRing(pMaxList);
    polygon.appendLinearRing(ringMin);
    polygon.appendLinearRing(ringMax);
    return polygon;
  } else {
    pMaxList.reverse();
    var pList = pMinList.concat(pMaxList);
    pList.push(pMinList[0]);
    polygon.setCoordinates([pList]);
    return polygon;
  }
};
com.jiusuo.map.TParticle = function (_id, _obj, _start, _end, _speed, _radius, _callback, _tMap) {
  var _this = this;
  this.tMap = _tMap;
  if (_tMap == null || _tMap == undefined) {
    this.tMap = com.jiusuo.map.tMap;
  }
  this.id = _id;
  this.obj = _obj;
  this.start = _start;
  this.end = _end;
  this.speed = _speed || 3;
  this.radius = _radius || 15;
  this.callback = _callback || function (_obj) {
  };
  var startend = [_this.start, _this.end];//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([_this.start,_this.end]);
  var start1 = com.jiusuo.map.TGeometryUtils.coortransform(startend[0], 'EPSG:4326', _this.tMap.getProjection().getCode());
  var end1 = com.jiusuo.map.TGeometryUtils.coortransform(startend[1], 'EPSG:4326', _this.tMap.getProjection().getCode());
  _this.tMap.getOMap().renderSync();
  var startPixel = _this.tMap.getOMap().getPixelFromCoordinate(start1);
  var endPixel = _this.tMap.getOMap().getPixelFromCoordinate(end1);

  this.startX = startPixel[0];
  this.startY = startPixel[1];
  this.endX = endPixel[0];
  this.endY = endPixel[1];
  this.vx = (_this.endX - _this.startX) / Math.sqrt(Math.pow(_this.endX - _this.startX, 2) + Math.pow(_this.endY - _this.startY, 2)) * _this.speed;
  this.vy = (_this.endY - _this.startY) / Math.sqrt(Math.pow(_this.endX - _this.startX, 2) + Math.pow(_this.endY - _this.startY, 2)) * _this.speed;

  //Random colors
  var r = Math.random() * 255 >> 0;
  var g = Math.random() * 255 >> 0;
  var b = Math.random() * 255 >> 0;
  this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";

}
com.jiusuo.map.TPointFly = function (timeStep, tMap) {
  var _this = this;
  if (tMap == null || tMap == undefined) {
    tMap = com.jiusuo.map.tMap;
  }
  var timeStep = timeStep || 33;
  var W = $("#" + tMap.getOMap().getTarget()).width();
  var H = $("#" + tMap.getOMap().getTarget()).height();

  var canvas = document.createElement("canvas");
  // var canvas = document.getElementById("canvas");
  canvas.className = 'tmap_canvas_pointfly';
  canvas.width = W;
  canvas.height = H;
  tMap.getOMap().getTargetElement().parentNode.insertBefore(canvas, tMap.getOMap().getTargetElement());
  var ctx = canvas.getContext("2d");
  var particles = new ol.Collection();
  this.addParticle = function (particle) {
    particles.forEach(function (p) {
      if (p.id == particle.id) {
        particles.remove(p);
      }
    });
    particles.push(particle);
  }
  var changeHandler = function (evt) {
    _this.stopFly1();
    var _particles = new ol.Collection();
    particles.forEach(function (p) {
      var _particle = new com.jiusuo.map.TParticle(p.id, p.obj, p.start, p.end, p.speed, p.radius, p.callback, p.tMap);
      _particles.push(_particle);
    });
    particles = _particles;
    _this.startFly();
  }
  var t = null;
  var isStarted = false;
  this.stopFly = function () {
    if (t) {
      particles = new ol.Collection();
      clearInterval(t);
      isStarted = false;
      tMap.getOMap().getView().un('change:center', changeHandler);
      tMap.getOMap().getView().un('change:resolution', changeHandler);
    }
  };
  this.stopFly1 = function () {
    if (t) {
      clearInterval(t);
      isStarted = false;
      tMap.getOMap().getView().un('change:center', changeHandler);
      tMap.getOMap().getView().un('change:resolution', changeHandler);
    }
  };
  this.startFly = function () {
    if (!isStarted) {
      t = setInterval(draw, timeStep);
      isStarted = true;
      tMap.getOMap().getView().on('change:center', changeHandler);
      tMap.getOMap().getView().on('change:resolution', changeHandler);
    }
  }
  this.clean = function () {
    ctx.closePath();
    tMap.getOMap().getTargetElement().parentNode.removeChild(canvas);
  };
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";

  function draw() {
    ctx.clearRect(0, 0, W, H);
    //Moving this BG paint code insde draw() will help remove the trail
    //of the particle
    //Lets paint the canvas black
    //But the BG paint shouldn't blend with the previous frame

    //Lets reduce the opacity of the BG paint to give the final touch

    //Lets blend the particle with the BG


    //Lets draw particles from the array now
    particles.forEach(function (p) {
      ctx.beginPath();
      //Time for some colors
      var gradient = ctx.createRadialGradient(p.startX, p.startY, 0, p.startX, p.startY, p.radius);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.4, p.color);
      gradient.addColorStop(0.4, p.color);
      gradient.addColorStop(1, "black");

      ctx.fillStyle = gradient;
      ctx.arc(p.startX, p.startY, p.radius, Math.PI * 2, false);
      ctx.fill();
      //Lets use the velocity now
      p.startX += p.vx;
      p.startY += p.vy;
      //To prevent the balls from moving out of the canvas
      if (p.vx >= 0) {
        if (p.startX >= p.endX) {
          particles.remove(p);
          p.callback(p.obj);
        }
      } else {
        if (p.startX <= p.endX) {
          particles.remove(p);
          p.callback(p.obj);
        }
      }
    });
  }
}
com.jiusuo.map.TParticle2 = function (_id, _obj, _start, _end, _speed, _radius, _color, _callback, _tMap) {
  var _this = this;
  this.tMap = _tMap;
  if (_tMap == null || _tMap == undefined) {
    this.tMap = com.jiusuo.map.tMap;
  }
  this.id = _id;
  this.obj = _obj;
  this.start = _start;
  this.end = _end;
  this.speed = _speed || 30;
  this.radius = _radius || 15;
  this.color = _color || 'red';
  this.callback = _callback || function (_obj) {
  };
  var startend = [_this.start, _this.end];//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([_this.start,_this.end]);
  var start = com.jiusuo.map.TGeometryUtils.coortransform(startend[0], 'EPSG:4326', _this.tMap.getProjection().getCode());
  var end = com.jiusuo.map.TGeometryUtils.coortransform(startend[1], 'EPSG:4326', _this.tMap.getProjection().getCode());
  this.startX = start[0];
  this.startY = start[1];
  this.endX = end[0];
  this.endY = end[1];
  this.vx = (_this.endX - _this.startX) / Math.sqrt(Math.pow(_this.endX - _this.startX, 2) + Math.pow(_this.endY - _this.startY, 2)) * _this.speed;
  this.vy = (_this.endY - _this.startY) / Math.sqrt(Math.pow(_this.endX - _this.startX, 2) + Math.pow(_this.endY - _this.startY, 2)) * _this.speed;
  this.feature = new ol.Feature();
  this.feature.setGeometry(new ol.geom.Point(start));
  var style = new com.jiusuo.map.style.TStyle({
    image: new com.jiusuo.map.style.TCircle({
      radius: _this.radius,
      stroke: new com.jiusuo.map.style.TStroke({
        color: _this.color
      }),
      fill: new com.jiusuo.map.style.TFill({
        color: _this.color
      })
    })
  });
  this.feature.setStyle(style);
  //Random colors
  var r = Math.random() * 255 >> 0;
  var g = Math.random() * 255 >> 0;
  var b = Math.random() * 255 >> 0;
  this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";

}
com.jiusuo.map.TPointFly2 = function (timeStep, tMap) {
  var _this = this;
  if (tMap == null || tMap == undefined) {
    tMap = com.jiusuo.map.tMap;
  }
  var timeStep = timeStep || 33;
  var particles = new ol.Collection();
  var source = tMap.getVectorLayer('baseVector').getSource();
  var flash = new com.jiusuo.map.TFlashCenter();
  this.addParticle = function (particle) {
    particles.forEach(function (p) {
      if (p.id == particle.id) {
        particles.remove(p);
      }
    });
    source.addFeature(particle.feature);
    flash.pointFlyFlash(particle.feature, particle.radius, 3, 1000);
    particles.push(particle);
  }
  var t = null;
  var isStarted = false;
  this.stopFly = function () {
    if (t) {
      particles = new ol.Collection();
      clearInterval(t);
      isStarted = false;
    }
  }
  this.startFly = function () {
    if (!isStarted) {
      t = setInterval(draw, timeStep);
    }
  }

  function draw() {
    particles.forEach(function (p) {
      //Lets use the velocity now
      p.startX += p.vx;
      p.startY += p.vy;

      //To prevent the balls from moving out of the canvas
      if (p.vx >= 0) {
        if (p.startX >= p.endX) {
          particles.remove(p);
          flash.pointFlyFlash(p.feature, p.radius, 3, 500);
          source.removeFeature(p.feature);
          p.callback(p.obj);
        }
      } else {
        if (p.startX <= p.endX) {
          particles.remove(p);
          flash.pointFlyFlash(p.feature, p.radius, 3, 500);
          source.removeFeature(p.feature);
          p.callback(p.obj);
        }
      }
      p.feature.setGeometry(new ol.geom.Point([p.startX, p.startY]));
    });
  }
}
com.jiusuo.map.TLinkArrow = function (options) {
  var _this = this;
  var option = options;
  var tMap = option.tMap;
  if (tMap) {
    tMap = com.jiusuo.map.tMap;
  }
  var stroke = new com.jiusuo.map.style.TStroke({color: 'red', width: 2});
  var style = option.style || new com.jiusuo.map.style.TStyle({stroke: stroke});
  var project = tMap.getProjection().getCode();
  var gcjPoints = option.points;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(option.points);
  var points = [];
  gcjPoints.forEach(function (item) {
    points.push(com.jiusuo.map.TGeometryUtils.coortransform(item, 'EPSG:4326', project));
  });
  var pnt1 = points[0];
  var pnt2 = points[1];
  var polyline = new com.jiusuo.map.geom.TPolyline(pnt1);
  var layer = tMap.getVectorLayer('baseVector');
  var pointFeature = new ol.Feature(polyline);
  pointFeature.setStyle(style);
  layer.getSource().addFeature(pointFeature);
  var i = 0;
  var timeFunction = window.setInterval(function () {
    i += 0.02
    if (i < 1) {
      //根据比例获取估计上的点
      var coord = [pnt1[0] * (1 - i) + pnt2[0] * i, pnt1[1] * (1 - i) + pnt2[1] * i];
      polyline = new P.Plot.StraightArrow([pnt1, coord]);
      pointFeature.setGeometry(polyline);
    } else {
      i = 1;
      //移动结束后，将原始要素位置设置为目标位置，样式设置为原始样式
      clearInterval(timeFunction);
      polyline = new P.Plot.StraightArrow(points);
      pointFeature.setGeometry(polyline);
    }
  }, 50);
  this.remove = function () {
    layer.getSource().removeFeature(pointFeature);
    clearInterval(timeFunction);
  }
}
com.jiusuo.map.TFlowStatisticsRadar = function (tMap, style) {
  var _this = this;
  //提供Map对象
  this._tMap = tMap || com.jiusuo.map.tMap;
  //单击时记录临时要素
  this.tempFeature = null;
  //单击时临时要素的样式
  this.tempStyle = null;
  var stroke2 = new com.jiusuo.map.style.TStroke({color: 'blue', width: 2});
  var fill2 = new com.jiusuo.map.style.TFill({color: 'rgba(255, 0, 0, 1)'});
  var style2 = new com.jiusuo.map.style.TStyle({fill: fill2, stroke: stroke2});
  //单击选中时的样式
  var style = style || style2;
  var map = this._tMap.getOMap();
  this.Radar = [];

  var overlay = null;
  //注册地图的移动监听事件
  var pointermoveHandler = function (evt) {
    var Polygonfeature;
    //判断鼠标悬浮位置是否有元素
    var index = 0;
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      index++;
      if (feature.getGeometry().getType() == 'Polygon' && index == 1) {
        Polygonfeature = feature;
      }
    });
    //如果有元素显示弹出框
    if (Polygonfeature) {
      //建立悬浮框，可以根据元素属性，赋值
      var element = document.createElement('div');
      var str = Polygonfeature.get('value');
      if (str) {
        element.innerHTML = "<p><font color='blue' size='6'>" + str + "</font></p>";
        element.className = 'redar-overLay-tips';
        map.getTargetElement().appendChild(element);
      }
      //鼠标变为小手
      $('body').css('cursor', 'Pointer');
      //设置提示信息
      if (overlay) {
        overlay.setElement(element);
        overlay.setPosition(evt.coordinate);
      } else {
        //新建Overlay
        overlay = new ol.Overlay({
          id: com.jiusuo.map.TUtils.createGUID(),
          positioning: 'center-right',
          offset: [30, 0]
        });
        map.addOverlay(overlay);
        overlay.setElement(element);
        overlay.setPosition(evt.coordinate);
      }
    } else {
      //鼠标移出，小手变为默认
      $('body').css('cursor', 'default');
      //鼠标移出，移出overlay
      if (overlay) {
        map.removeOverlay(overlay);
        overlay = null;
      }
    }
  }
  map.on('pointermove', pointermoveHandler);

  var pointclickHandler = function (evt) {
    var Polygonfeature;

    //判断鼠标单击位置是否有元素
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      if (feature.getGeometry().getType() == 'Polygon') {
        Polygonfeature = feature;
      }
    })
    //如果有元素显示弹出框
    if (Polygonfeature) {
      if (_this.tempFeature) {
        _this.tempFeature.setStyle(_this.tempStyle);
      }
      _this.tempStyle = Polygonfeature.getStyle();
      _this.tempFeature = Polygonfeature;
      //设置选中样式
      Polygonfeature.setStyle(style);
    } else {
      if (_this.tempFeature) {
        //恢复原有样式
        _this.tempFeature.setStyle(_this.tempStyle);
      }
    }
  }
  map.on('click', pointclickHandler);
  this.remove = function (item) {
    item.remove();
  }
  this.destroy = function () {
    //鼠标移出，小手变为默认
    $('body').css('cursor', 'default');
    //鼠标移出，移出overlay
    if (overlay) {
      map.removeOverlay(overlay);
      overlay = null;
    }
    map.un('pointermove', pointermoveHandler);
    map.un('click', pointclickHandler);
    this.Radar.forEach(function (item) {
      item.remove();
    });
    this.Radar = [];
  }
  this.addRadar = function (item) {
    this.Radar.push(item);
    item.init();
  }
}

//处理雷达图初始化类型
//类型代码：
//BothCenter（核心区叠加）
//InCenter（核心区流入）
//OutCenter（核心区流出）
//SubtraCenter（核心区净值）
//BothBuffer（缓冲区叠加）
//InBuffer（缓冲区流入）
//OutBuffer（缓冲区流出）
//SubtraBuffer（缓冲区净值）
com.jiusuo.map.TRadarElement = function (options) {
  //inStyle
  var stroke = new com.jiusuo.map.style.TStroke({color: 'blue', width: 0.3});
  var fill = new com.jiusuo.map.style.TFill({color: 'rgba(0, 0, 255, 0.5)'});
  var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
  //outStyle
  var stroke1 = new com.jiusuo.map.style.TStroke({color: 'blue', width: 0.3});
  var fill1 = new com.jiusuo.map.style.TFill({color: 'rgba(0, 255, 0,0.5)'});
  var style1 = new com.jiusuo.map.style.TStyle({fill: fill1, stroke: stroke1});
  //设置外围样式
  var stroke3 = new com.jiusuo.map.style.TStroke({color: 'blue', width: 0.3});
  var fill3 = new com.jiusuo.map.style.TFill({color: 'rgba(0, 0, 0, 0.01)'});

  var style3 = new com.jiusuo.map.style.TStyle({fill: fill3, stroke: stroke3});


  var option = options || {};
  //选择初始化雷达图的类型，默认为核心区叠加显示
  //BothCenter（核心区叠加）
  //InCenter（核心区流入）
  //OutCenter（核心区流出）
  //SubtraCenter（核心区净值）
  //BothBuffer（缓冲区叠加）
  //InBuffer（缓冲区流入）
  //OutBuffer（缓冲区流出）
  //SubtraBuffer（缓冲区净值）
  this.Type = ((option == {}) || (option.Type == undefined)) ? "BothCenter" : option.Type;
  this._tMap = option.tMap || com.jiusuo.map.tMap;
  var layer = this._tMap.getVectorLayer('baseVector');
  var projection = this._tMap.getProjection().getCode();
  //流入样式
  var inStyle = option.inStyle || style;
  //流出样式
  var outStyle = option.outStyle || style1;
  var directionInNames = ['正北方向流入:', '东北方向流入:', '正东方向流入:', '东南方向流入:', '正南方向流入:', '西南方向流入:', '正西方向流入:', '西北方向流入:'];
  var directionOutNames = ['正东方向流出:', '东北方向流出:', '正东方向流出:', '东南方向流出:', '正南方向流出:', '西南方向流出:', '正西方向流出:', '西北方向流出:'];
  //核心区数据
  //流入
  var centerstreaminData = option.centerstreaminData || [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 75.6, 80.2];
  //流出
  var centerstreamoutData = option.centerstreamoutData || [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 67.6, 68.2];
  //缓冲区数据
  //流入
  var rimstreaminData = option.rimstreaminData || [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 75.6, 80.2];
  //流出
  var rimstreamoutData = option.rimstreamoutData || [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 67.6, 68.2];
  //雷达图位置
  var position = option.position || [106, 29];
  //核心区半径，同时也是缓冲区的内径
  var radius = option.radius || 20000;
  radius = com.jiusuo.map.TGeometryUtils.distaceTranform(position, radius, projection);
  var inRadius = radius;
  //缓冲区外径
  var outRadius = option.outRadius || 50000;
  outRadius = com.jiusuo.map.TGeometryUtils.distaceTranform(position, outRadius, projection);
  //自定义的回调函数
  var callback = option.callback;
  var _this = this;
  this.controlOverlayID = com.jiusuo.map.TUtils.createGUID();
  this.redarFeatures = [];
  this.radarIn = true;
  //初始化函数，默认建立叠加显示，并弹出控制的Overlay
  this.init = function () {
    _this.clear();
    switch (_this.Type) {
      case "BothCenter":
        _this.createInBothRedar();
        break;
      case "InCenter":
        _this.createInSingleRedar(true);
        break;
      case "OutCenter":
        _this.createInSingleRedar(false);
        break;
      case "SubtraCenter":
        _this.createInSubtraRedar();
        break;
      case "BothBuffer":
        _this.createOutBothRedar();
        _this.radarIn = false;
        break;
      case "InBuffer":
        _this.createOutSingleRedar(true);
        _this.radarIn = false;
        break;
      case "OutBuffer":
        _this.createOutSingleRedar(false);
        _this.radarIn = false;
        break;
      case "SubtraBuffer":
        _this.createOutSubtraRedar();
        _this.radarIn = false;
        break;
      default:
        _this.createInBothRedar();
        break;
    }
    _this.addCircleOverlay();
    // _this.addControlOverlay();
  };
  this.addCircleOverlay = function () {
    var textC = "";
    var count = 0;
    for(var i = 0;i<option.centerstreaminData.length;i++){
      count+=option.centerstreaminData[i];
      count+=option.centerstreamoutData[i];
    }
   /* textC = count==0?"暂无数据":"蓝色：流入\n绿色：流出";
    var geojsonc = {"type":"Circle","center":[option.position[0],option.position[1]],"radius":option.radius};
    var strokec = new com.jiusuo.map.style.TStroke({color: 'blue',width:0.3});
    var textF = new com.jiusuo.map.style.TText({text: textC,
      font:'12px sans-serif',
      textBaseline:'middle',
      stroke:new com.jiusuo.map.style.TStroke({
        color: 'black',
        width: 5
      }),
      fill:new com.jiusuo.map.style.TFill({color: 'white'})
    });
    var stylec = new com.jiusuo.map.style.TStyle({stroke:strokec,text:textF});
    com.jiusuo.map.tMap.addTGeometry(geojsonc,stylec);*/
  }
  //新建控制Overlay
  this.addControlOverlay = function () {
    var map = _this._tMap.getOMap();
    var element = $("<div></div>");
    element.addClass("redar-overLay-control");
    var Bothbtn = $('<button></button>')
    Bothbtn.addClass('redar-overLay-control-btn');
    Bothbtn.text('叠加显示');
    Bothbtn.on('click', function () {
      if (_this.radarIn) {
        _this.clear();
        _this.createInBothRedar();
      } else {
        _this.clear();
        _this.createOutBothRedar();
      }
    });
    element.append(Bothbtn);

    var InSinglebtn = $('<button></button>');
    InSinglebtn.addClass('redar-overLay-control-btn');
    InSinglebtn.text('只显示流入');
    InSinglebtn.on('click', function () {
      if (_this.radarIn) {
        _this.clear();
        _this.createInSingleRedar(true);
      } else {
        _this.clear();
        _this.createOutSingleRedar(true);
      }
    });
    element.append(InSinglebtn);

    var OutSinglebtn = $('<button></button>');
    OutSinglebtn.addClass('redar-overLay-control-btn');
    OutSinglebtn.text('只显示流出');
    OutSinglebtn.on('click', function () {
      if (_this.radarIn) {
        _this.clear();
        _this.createInSingleRedar(false);
      } else {
        _this.clear();
        _this.createOutSingleRedar(false);
      }
    });
    element.append(OutSinglebtn);

    /*var Subbtn = $('<button></button>');
        Subbtn.addClass('redar-overLay-control-btn');
        Subbtn.text('显示净值');
        Subbtn.on('click', function () {
            if (_this.radarIn) {
                _this.clear();
                _this.createInSubtraRedar();
            } else {
                _this.clear();
                _this.createOutSubtraRedar();
            }
        });
        element.append(Subbtn);

        var Custombtn = $('<button></button>');
        Custombtn.addClass('redar-overLay-control-btn');
        Custombtn.text('自定义函数');
        Custombtn.on('click', function () {
            if (!callback) {
                return;
            }
            if (_this.radarIn) {
                //根据传入的核心区数据，调用回调函数
                callback(centerstreaminData, centerstreamoutData);
            } else {
                //根据传入的缓冲区数据，调用回调函数
                callback(rimstreaminData, rimstreamoutData);
            }
        });
        element.append(Custombtn);*/

    var ChangeBuffer = $('<button></button>');
    ChangeBuffer.addClass('redar-overLay-control-btn');
    var ChangeBudderText = _this.radarIn == true ? "缓冲区流动分布" : "核心区流动分布";
    ChangeBuffer.text(ChangeBudderText);
    ChangeBuffer.on('click', function () {
      var overlay = map.getOverlayById(_this.controlOverlayID);
      if (_this.radarIn) {
        ChangeBuffer.text('核心区流动分布');
        _this.clear();
        //_this.createOutBothRedar();
        switch (_this.Type) {
          case "BothCenter":
            _this.createOutBothRedar();
            break;
          case "InCenter":
            _this.createOutSingleRedar(true);
            break;
          case "OutCenter":
            _this.createOutSingleRedar(false);
            break;
          case "SubtraCenter":
            _this.createOutSubtraRedar();
            break;
          default:
            _this.createOutBothRedar();
            break;
        }
        if (overlay) {
          var gcj02Point = position;
          if (projection == "EPSG:3857") {
            gcj02Point = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([position])[0];
          }
          var mokatopos = com.jiusuo.map.TGeometryUtils.coortransform(gcj02Point, 'EPSG:4326', projection);
          var mokatoposPosition = [mokatopos[0] + outRadius, mokatopos[1]];
          overlay.setPosition(mokatoposPosition);
        }
        _this.radarIn = false;
      } else {
        ChangeBuffer.text('缓冲区流动分布');
        _this.clear();
        //_this.createInBothRedar();
        switch (_this.Type) {
          case "BothBuffer":
            _this.createInBothRedar();
            break;
          case "InBuffer":
            _this.createInSingleRedar(true);
            break;
          case "OutBuffer":
            _this.createInSingleRedar(false);
            break;
          case "SubtraBuffer":
            _this.createInSubtraRedar();
            break;
          default:
            _this.createInBothRedar();
            break;
        }
        if (overlay) {
          var gcj02Point = position;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([position])[0];
          if (projection == "EPSG:3857") {
            gcj02Point = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([position])[0];
          }
          var mokatopos = com.jiusuo.map.TGeometryUtils.coortransform(gcj02Point, 'EPSG:4326', projection);
          var mokatoposPosition = [mokatopos[0] + radius, mokatopos[1]];
          overlay.setPosition(mokatoposPosition);
        }
        _this.radarIn = true;
      }
    });
    element.append(ChangeBuffer);
    map.getTargetElement().appendChild(element[0]);
    var gcj02Point = position;//com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([position])[0];
    if (projection == "EPSG:3857") {
      gcj02Point = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([position])[0];
    }
    var mokatopos = com.jiusuo.map.TGeometryUtils.coortransform(gcj02Point, 'EPSG:4326', projection);
    if (_this.radarIn == true) {
      mokatopos = [mokatopos[0] + radius, mokatopos[1]];
    }
    else {
      mokatopos = [mokatopos[0] + outRadius, mokatopos[1]];
    }
    var overlay = new ol.Overlay({
      id: _this.controlOverlayID,
      element: element[0],
      position: mokatopos
    });
    map.addOverlay(overlay);
  };

  //核心区叠加显示
  this.createInBothRedar = function () {
    this.Type = "BothCenter";
    //streaminData与streamoutData的数据顺序为：正东,东北,正北,西北,正西,西南,正南,东南,；position为wgs84坐标
    var maxValue = Math.max(Math.max.apply(null, centerstreaminData), Math.max.apply(null, centerstreamoutData));
    //绘制扇形，只需提供，中心点坐标，扇形半径，起始与终止角度
    for (var i = 0; i < 8; i++) {
      if(maxValue==0){
        continue
      }
      var initemRadius = (centerstreaminData[i] / maxValue) * radius;
      var outitemRadius = (centerstreamoutData[i] / maxValue) * radius;

      var circlepolygon = com.jiusuo.map.drawSector(position, radius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      if (initemRadius > outitemRadius) {
        var inpolygon = com.jiusuo.map.drawRingSector(position, initemRadius, outitemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionInNames[i] + centerstreaminData[i], inStyle));
        var outpolygon = com.jiusuo.map.drawSector(position, outitemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionOutNames[i] + centerstreamoutData[i], outStyle));
      } else {
        var outpolygon = com.jiusuo.map.drawRingSector(position, initemRadius, outitemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionOutNames[i] + centerstreamoutData[i], outStyle));
        var inpolygon = com.jiusuo.map.drawSector(position, initemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionInNames[i] + centerstreaminData[i], inStyle));
      }
    }
  }
  //核心区单项显示，根据isIn参数判断流入还是流出
  this.createInSingleRedar = function (isIn) {
    var streamData = isIn ? centerstreaminData : centerstreamoutData;
    this.Type = isIn ? "InCenter" : "OutCenter";
    var directionName = isIn ? directionInNames : directionOutNames;
    var style = isIn ? inStyle : outStyle;
    //var maxValue = Math.max.apply(null, streamData);
    //此处修改为取流入流出所有数据中的最大值
    var maxValue = Math.max.apply(null, centerstreaminData.concat(centerstreamoutData));
    for (var i = 0; i < 8; i++) {
      var initemRadius = (streamData[i] / maxValue) * radius;
      var circlepolygon = com.jiusuo.map.drawSector(position, radius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      var outpolygon = com.jiusuo.map.drawSector(position, initemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(outpolygon, directionName[i] + streamData[i], style));
    }
  }
  //核心区净值
  this.createInSubtraRedar = function () {
    //streaminData与streamoutData的数据顺序为：正东,东北,正北,西北,正西,西南,正南,东南,；position为wgs84坐标
    this.Type = "SubtraCenter";
    var subValue = [];
    var maxValue = 0;
    for (var i = 0; i < 8; i++) {
      var delx = centerstreaminData[i] - centerstreamoutData[i];
      subValue.push(delx);
      if (maxValue < Math.abs(delx)) {
        maxValue = Math.abs(delx);
      }
    }
    //绘制扇形，只需提供，中心点坐标，扇形半径，起始与终止角度
    for (var i = 0; i < 8; i++) {
      var itemRadius = (Math.abs(subValue[i] / maxValue)) * radius;

      var circlepolygon = com.jiusuo.map.drawSector(position, radius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      if (subValue[i] > 0) {
        var inpolygon = com.jiusuo.map.drawSector(position, itemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionOutNames[i] + centerstreamoutData[i] + '  ' + directionInNames[i] + centerstreaminData[i], inStyle));
      } else {
        var outpolygon = com.jiusuo.map.drawSector(position, itemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionOutNames[i] + centerstreamoutData[i] + '  ' + directionInNames[i] + centerstreaminData[i], outStyle));
      }
    }
  };
  //缓冲区叠加显示
  this.createOutBothRedar = function () {
    removeFeaturesByType("Polygon");
    var coords = options.bufferNodes.split(";");
    var cc = [];
    var ccc = [];
    for (var j = 0; j < coords.length; j++) {
      var c = [];
      c.push(parseFloat(coords[j].split(",")[0]));
      c.push(parseFloat(coords[j].split(",")[1]));
      cc.push(c);
    }
    ccc.push(cc);
    var geojson = {"type": "Polygon", "coordinates": ccc};
    var stroke = new com.jiusuo.map.style.TStroke({color: 'rgba(6,92,191,0.8)', width: 0.1});
    var fill = new com.jiusuo.map.style.TFill({color: 'rgba(6,92,191,0.3)'});
    var style = new com.jiusuo.map.style.TStyle({fill: fill, stroke: stroke});
    var feature = com.jiusuo.map.tMap.addTGeometry(geojson, style);
    this.Type = "BothBuffer";
    //streaminData与streamoutData的数据顺序为：正东,东北,正北,西北,正西,西南,正南,东南,；position为wgs84坐标
    var maxValue = Math.max(Math.max.apply(null, rimstreaminData), Math.max.apply(null, rimstreamoutData));
    //绘制扇形，只需提供，中心点坐标，扇形半径，起始与终止角度
    for (var i = 0; i < 8; i++) {
      var initemRadius = (rimstreaminData[i] / maxValue) * (outRadius - inRadius) + inRadius;
      var outitemRadius = (rimstreamoutData[i] / maxValue) * (outRadius - inRadius) + inRadius;

      var circlepolygon = com.jiusuo.map.drawRingSector(position, inRadius, outRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      if (initemRadius > outitemRadius) {
        var inpolygon = com.jiusuo.map.drawRingSector(position, inRadius, outitemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionOutNames[i] + rimstreamoutData[i], outStyle));
        var outpolygon = com.jiusuo.map.drawRingSector(position, outitemRadius, initemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionInNames[i] + rimstreaminData[i], inStyle));
      } else {
        var outpolygon = com.jiusuo.map.drawRingSector(position, initemRadius, outitemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionOutNames[i] + rimstreamoutData[i], outStyle));
        var inpolygon = com.jiusuo.map.drawRingSector(position, inRadius, initemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionInNames[i] + rimstreaminData[i], inStyle));

      }
    }
  }
  //缓冲区单项显示，根据isIn参数判断流入还是流出
  this.createOutSingleRedar = function (isIn) {
    var streamData = isIn ? rimstreaminData : rimstreamoutData;
    this.Type = isIn ? "InBuffer" : "OutBuffer";
    var directionName = isIn ? directionInNames : directionOutNames;
    var style = isIn ? inStyle : outStyle;
    var maxValue = Math.max.apply(null, streamData);
    for (var i = 0; i < 8; i++) {
      var initemRadius = (streamData[i] / maxValue) * (outRadius - inRadius) + inRadius;
      var circlepolygon = com.jiusuo.map.drawRingSector(position, inRadius, outRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      var outpolygon = com.jiusuo.map.drawRingSector(position, inRadius, initemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(outpolygon, directionName[i] + streamData[i], style));
    }
  }
  //缓冲区净值
  this.createOutSubtraRedar = function () {
    //streaminData与streamoutData的数据顺序为：正东,东北,正北,西北,正西,西南,正南,东南,；position为wgs84坐标
    this.Type = "SubtraBuffer";
    var subValue = [];
    var maxValue = 0;
    for (var i = 0; i < 8; i++) {
      var delx = rimstreaminData[i] - rimstreamoutData[i];
      subValue.push(delx);
      if (maxValue < Math.abs(delx)) {
        maxValue = Math.abs(delx);
      }
    }
    //绘制扇形，只需提供，中心点坐标，扇形半径，起始与终止角度
    for (var i = 0; i < 8; i++) {
      var itemRadius = (Math.abs(subValue[i] / maxValue)) * (outRadius - inRadius) + inRadius;
      var circlepolygon = com.jiusuo.map.drawRingSector(position, inRadius, outRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
      _this.redarFeatures.push(addFeature(circlepolygon, '', style3));
      if (subValue[i] > 0) {
        var inpolygon = com.jiusuo.map.drawRingSector(position, inRadius, itemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(inpolygon, directionOutNames[i] + rimstreamoutData[i] + '  ' + directionInNames[i] + rimstreaminData[i], inStyle));
      } else {
        var outpolygon = com.jiusuo.map.drawRingSector(position, inRadius, itemRadius, -i * Math.PI / 4 + 5 * Math.PI / 8, -(i + 1) * Math.PI / 4 + 5 * Math.PI / 8, _this._tMap);
        _this.redarFeatures.push(addFeature(outpolygon, directionOutNames[i] + rimstreamoutData[i] + '  ' + directionInNames[i] + rimstreaminData[i], outStyle));
      }
    }
  }
  var addFeature = function (geometry, properties, style) {
    var coordinates;
    if (com.jiusuo.map.dataCoorsys == 'wgs84' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:3857') {
      geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, _this._tMap.getOMap().getView().getProjection().getCode(), 'EPSG:4326');
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(geometry.getCoordinates()[0]);
      geometry.setCoordinates([coordinates]);
      geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, 'EPSG:4326', _this._tMap.getOMap().getView().getProjection().getCode());
    }
    if (com.jiusuo.map.dataCoorsys == 'gcj02' && _this._tMap.getOMap().getView().getProjection().getCode() == 'EPSG:4326') {
      geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, _this._tMap.getOMap().getView().getProjection().getCode(), 'EPSG:4326');
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(geometry.getCoordinates()[0]);
      geometry.setCoordinates([coordinates]);
      geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, 'EPSG:4326', _this._tMap.getOMap().getView().getProjection().getCode());
    }
    var inpointFeature = new com.jiusuo.map.TFeature(geometry);
    inpointFeature.set('value', properties);
    inpointFeature.setId(com.jiusuo.map.TUtils.createGUID());
    inpointFeature.setStyle(style);
    layer.getSource().addFeature(inpointFeature);
    return inpointFeature;
  }
  //移除雷达图，去除要素，控制项overlay
  this.remove = function () {
    _this.redarFeatures.forEach(function (feature) {
      layer.getSource().removeFeature(feature);
    });
    _this.redarFeatures = [];
    var map = _this._tMap.getOMap();
    var controlOverlay = map.getOverlayById(_this.controlOverlayID);
    if (controlOverlay) {
      map.removeOverlay(controlOverlay);
    }
  }
  //清理绘制的要素
  this.clear = function () {
    _this.redarFeatures.forEach(function (feature) {
      layer.getSource().removeFeature(feature);
    });
    _this.redarFeatures = [];
  }
};


com.jiusuo.map.TimeLine = function (targetid) {
  var dM = 9,
    dN = 7,
    pL = 7,
    pR = 7,
    di = 4;
  var timelineCanvas = document.getElementById(targetid);
  var ctx = timelineCanvas.getContext('2d');

  this.drawTimeCoord = function (data) {
    var h = ctx.canvas.height;
    var w = ctx.canvas.width;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(37, 132, 228, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255,1)';
    ctx.font = " 15px arial";
    ctx.textAlign = 'left';
    var l = data.length;
    var stepA = (w - pR - pL) / (l - 1);
    var stepB = (w - pR - pL) / (l * 5);
    for (var i = 0; i < l; i++) {
      var x = i * stepA + pL,
        y = h / 2 + 2;
      var s = data[i] + '';
      if (i < l - 1) {
        if (s.length == 1) {
          ctx.fillText(s, x - 3, y + 20);
        } else if (s.length === 5) {
          ctx.fillText(s, x - 15, y + 20);
        } else {
          ctx.fillText(s, x - 9, y + 20);
        }
      }
      if (i == l - 1) {
        if (s.length === 5) {
          ctx.fillText(s, x - 30, y + 20);
        } else if (s.length === 4) {
          ctx.fillText(s, x - 24, y + 20);
        } else {
          ctx.fillText(s, x - 13, y + 20);
        }
        return;
      }
    }
  }
}
com.jiusuo.map.TimeLineUtils = function () {
};
com.jiusuo.map.TimeLineUtils.js_strto_time = function (str_time) {
  var new_str = str_time.replace(/:/g, '-');
  new_str = new_str.replace(/ /g, '-');
  var arr = new_str.split("-");
  var strtotime = 0;
  var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
  if (datum != null && typeof datum != 'undefined') {
    strtotime = datum.getTime() / 1000;
  }
  return strtotime;
};
com.jiusuo.map.TimeLineUtils.js_date_time = function (unixtime) {
  var timestr = new Date(parseInt(unixtime) * 1000);
  var datetime = this.date_format(timestr, 'yyyy-MM-dd hh:mm:ss');
  return datetime;
}
com.jiusuo.map.TimeLineUtils.date_format = function (date, format) {
  var o = {
    "M+": date.getMonth() + 1, //month
    "d+": date.getDate(), //day
    "h+": date.getHours(), //hour
    "m+": date.getMinutes(), //minute
    "s+": date.getSeconds(), //second
    "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
    "S": date.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}
com.jiusuo.map.TimeLineUtils.linear = function (initPos, targetPos, currentCount, count) {
  var x = (targetPos[0] - initPos[0]) * currentCount / count + initPos[0];
  var y = (targetPos[1] - initPos[1]) * currentCount / count + initPos[1];
  return [x, y];
}

//对单个一维数组点进行坐标系转换 solon add start
com.jiusuo.map.transCoordinates = function (coords) {
  this._tMap = com.jiusuo.map.tMap
  if (this._tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
    coords = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coords])[0];
  }
  if (this._tMap.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
    coords = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coords])[0];
  }

  return coords;
}
//end


com.jiusuo.map.TTimeTrack = function (options) {
  var option = options || {};
  var _this = this;
  this._tMap = option.tMap || com.jiusuo.map.tMap;
  var projection = _this._tMap.getProjection().getCode();
  //轨迹ID，取唯一值
  this.trackId = com.jiusuo.map.TUtils.createGUID();
  //轨迹当前点ID，取唯一值
  this.trackPointId = com.jiusuo.map.TUtils.createGUID();
  //轨迹数据，形如[{id,coord,time,prop},{}],为二维混合数组。PS:必须为排序后数据，按照时间顺序进行排序。
  this.pois = option.points;
  // var iconUrl = option.iconUrl ? option.iconUrl : 'data/icon/icon.png';
  var iconUrl = option.iconUrl ? option.iconUrl : 'data/icon/icon.png';
  //轨迹名称
  this.trackname = option.trackname;
  this.overlayElement = option.overlayElement;
  //轨迹点按照时间顺序进行排序，通过时间找到从开始到当前时间对应点的所有轨迹点，形成轨迹
  this.pointToline = [];
  //记录当前轨迹播放经过的节点
  this.playedNode = this.pois[0];
  //记录当前轨迹播放的当前点。
  this.currentPoint = this.pois[0];
  //轨迹播放中的轨迹要素
  this.tempRouteFeature = null;
  this.playRouteCallBack = option.playRouteCallBack;

  //轨迹播放中的轨迹颜色
  this.playColor = option.playColor || 'green';
  //背景轨迹的颜色
  this.routeFeatureColor = option.routeFeatureColor || 'red';
  //轨迹播放中的轨迹样式
  var styleLineFunction = function (resolution) {
    var geometry = this.getGeometry();
    var length = geometry.getLength();
    var radio = (50 * resolution) / length;
    var dradio = 1;
    if (projection == 'EPSG:4326') {
      dradio = 10000;
    } else {
      dradio = 1;
    }
    var styles = [
      // linestring
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: _this.playColor,
          width: 10,
        })
      })
    ];
    for (var i = 0; i <= 1; i += radio) {
      //var ratio = i;
      var arrowLocation = geometry.getCoordinateAt(i);
      geometry.forEachSegment(function (start, end) {
        if (start[0] == end[0] || start[1] == end[1]) return;
        var dx1 = end[0] - arrowLocation[0];
        var dy1 = end[1] - arrowLocation[1];
        var dx2 = arrowLocation[0] - start[0];
        var dy2 = arrowLocation[1] - start[1];

        if (dx1 != dx2 && dy1 != dy2) {
          if (Math.abs(dradio * dx1 * dy2 - dradio * dx2 * dy1) < 0.001) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            //  if(rotation ==0)return;
            // arrows
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(arrowLocation),
              image: new ol.style.Icon({
                src: com.jiusuo.map.webUrl + '/data/icon/routearrow.png',
                anchor: [0.75, 0.5],
                rotateWithView: false,
                rotation: -rotation + Math.PI
              })
            }));
          }
        }

      });
    }

    return styles;
  };
  this.tempRouteFeatureStyle = option.tempRouteFeatureStyle || styleLineFunction;
  //this.tempRouteFeatureStyle =  styleLineFunction;
  //轨迹播放当前点的要素
  this.tempRoutePoint = null;
  //轨迹播放当前点的样式
  this.tempRoutePointStyle = option.tempRoutePointStyle || new com.jiusuo.map.style.TStyle({
    image: new com.jiusuo.map.style.TIcon({
      anchor: [0.5, 1],
      rotation: 0,
      src: iconUrl
    })
  })
  //记录轨迹图层要素
  var allfeatures = [];
  //背景轨迹的样式
  this.routeFeatureStyle = option.routeFeaturesStyle || new com.jiusuo.map.style.TStyle({
    stroke: new com.jiusuo.map.style.TStroke({
      color: _this.routeFeatureColor,
      width: 2
    })
  });
  //轨迹节点要素样式
  this.pointsFeaturesStyle = option.pointsFeaturesStyle || new com.jiusuo.map.style.TStyle({
    image: new com.jiusuo.map.style.TCircle({
      radius: 3,
      snapToPixel: false,
      fill: new com.jiusuo.map.style.TFill({color: 'white'}),
      stroke: new com.jiusuo.map.style.TStroke({
        color: 'black', width: 1
      })
    })
  });


  var n_points = [];
  if (this._tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
    _this.pois.forEach(function (trackNode) {
      var n_trackNode = trackNode;
      n_trackNode.coord = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([trackNode.coord])[0];
      n_points.push(n_trackNode);
    });
    _this.pois = n_points;
  }
  if (this._tMap.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
    _this.pois.forEach(function (trackNode) {
      var n_trackNode = trackNode;
      n_trackNode.coord = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([trackNode.coord])[0];
      n_points.push(n_trackNode);
    });
    _this.pois = n_points;
  }
  //记录轨迹节点数组
  var pointsJson = [];
  //通过pois组合geoJson数据，利用坐标信息与属性信息组合。
  for (var i = 0; i < _this.pois.length; i++) {
    pointsJson.push({
      'type': 'Feature',
      'geometry': {'type': 'Point', 'coordinates': _this.pois[i].coord},
      'properties': _this.pois[i].prop
    })
  }

  var geoJson = {
    'type': 'FeatureCollection',
    'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
    'features': pointsJson
  };
  var featureProjection = this._tMap.getProjection().getCode();
  this.pointsFeatures = (new ol.format.GeoJSON()).readFeatures(geoJson, {
    dataProjection: 'EPSG:4326',
    featureProjection: featureProjection
  });
  //设置节点样式
  _this.pointsFeatures.forEach(function (item) {
    item.setStyle(_this.pointsFeaturesStyle);
  })
  //节点数据加入allfeatures
  allfeatures = allfeatures.concat(_this.pointsFeatures);
  this.getPoints = function () {
    var _points = [];
    _this.pointsFeatures.forEach(function (feature) {
      _points.push(feature.getGeometry().getCoordinates());
    });
    return _points;
  };
  this.points = this.getPoints();
  for (var i = 0; i < _this.pois.length; i++) {
    _this.pois[i].coord = _this.points[i];
  }
  var route = new com.jiusuo.map.geom.TPolyline(_this.points);
  //轨迹数据
  this.routeFeature = new com.jiusuo.map.TFeature(route);
  //轨迹设置样式
  _this.routeFeature.setStyle(_this.routeFeatureStyle);
  allfeatures.push(_this.routeFeature);
  //轨迹图层，一条轨迹对应一个图层，便于管理
  this.pointsLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: allfeatures
    })
  });


};
com.jiusuo.map.TTimeTrack.prototype = {
  binarySearch: function (array, value) {
    // console.log("数组长度  "+array.length);
    var startIndex = 0,
      stopIndex = array.length - 1,
      middle = (stopIndex + startIndex) >>> 1;
    while (array[middle].time != value && startIndex < stopIndex) {
      if (value > array[middle].time) {
        startIndex = middle + 1;
      } else if (value < array[middle].time) {
        stopIndex = middle - 1;
      }
      middle = (stopIndex + startIndex) >>> 1;
    }
    return (array[middle].time != value) ? middle : middle;
  },
  findPosition: function (curTime) {

    if (this.pois && this.pois.length > 0) {
      if (curTime < this.pois[0].time) {
        this.currentPoint = this.pois[0].coord;
        this.playedNode = this.pois[0];
        return [];
      }
      if (curTime > this.pois[this.pois.length - 1].time) {
        curTime = this.pois[this.pois.length - 1].time;
      }
      var index = this.binarySearch(this.pois, curTime);
      if (index >= 0 && index < this.pois.length) {

        this.pointToline = [];
        if (curTime === this.pois[index].time) {
          this.playedNode = this.pois[index];
          this.currentPoint = this.pois[index].coord;
          for (var i = 0; i <= index; i++) {
            this.pointToline.push(this.pois[i].coord);
          }
        } else {
          if (curTime > this.pois[index].time && this.pois[index].time > this.playedNode.time) {
            this.playedNode = this.pois[index];
          } else if (curTime < this.pois[index].time && this.pois[index - 1].time > this.playedNode.time) {
            this.playedNode = this.pois[index - 1];
          }
          this.pointToline = this.createEncytPoi(index, curTime);
          var length = this.pointToline.length;
          this.currentPoint = this.pointToline[length - 1];
        }
      }
      //console.log("坐标集合 "+this.pointToline);
      return this.pointToline;
    }
  },

  createEncytPoi: function (index, time) {
    var pointLine = [];
    var pre = index;
    if (time > this.pois[index].time) {
      index = index + 1;
    }
    if (time < this.pois[index].time) {
      pre = index - 1;
    }
    for (var i = 0; i < index; i++) {
      pointLine.push(this.pois[i].coord);
    }
    if (this.pois[index].time - this.pois[pre].time > 60) {
      var d = this.pois[index].time - this.pois[pre].time;
      var c = time - this.pois[pre].time;
      var coord = com.jiusuo.map.TimeLineUtils.linear(this.pois[pre].coord, this.pois[index].coord, c, d);
      pointLine.push(coord);
    }
    return pointLine;
  },

  startAnimation: function (move_time) {
    var _this = this;
    var callfun = _this.playRouteCallBack;
    var pos = _this.findPosition(move_time);
    // console.log("移动点坐标 "+pos);
    if (!pos) {
      return;
    }
    var route = new com.jiusuo.map.geom.TPolyline(pos);
    _this.tempRouteFeature = _this.pointsLayer.getSource().getFeatureById(_this.trackId);
    if (_this.tempRouteFeature) {
      _this.tempRouteFeature.setGeometry(route);
      _this.tempRouteFeature.setStyle(_this.tempRouteFeatureStyle);
    } else {
      _this.tempRouteFeature = new com.jiusuo.map.TFeature(route);
      _this.tempRouteFeature.setStyle(_this.tempRouteFeatureStyle);
      _this.tempRouteFeature.setId(_this.trackId);
      _this.pointsLayer.getSource().addFeature(_this.tempRouteFeature);
    }

    var currentPoint = new com.jiusuo.map.geom.TPoint(_this.currentPoint);
    this.tempRoutePoint = _this.pointsLayer.getSource().getFeatureById(_this.trackPointId);
    if (_this.tempRoutePoint) {
      _this.tempRoutePoint.setGeometry(currentPoint);
    } else {
      _this.tempRoutePoint = new com.jiusuo.map.TFeature(currentPoint);
      _this.tempRoutePoint.setStyle(_this.tempRoutePointStyle);
      _this.tempRoutePoint.setId(_this.trackPointId);
      _this.pointsLayer.getSource().addFeature(_this.tempRoutePoint);
    }
    if (_this.overlayElement) {
      var newOverlay = this._tMap.getOMap().getOverlayById(this.trackId);
      if (newOverlay) {
        newOverlay.setPosition(_this.currentPoint);
      } else {
        this._tMap.getOMap().getTargetElement().appendChild(_this.overlayElement);
        newOverlay = new ol.Overlay({
          id: this.trackId,
          autoPan: false,
          positioning: 'center-center',
          autoPanAnimation: {
            duration: 250
          }
        });
        newOverlay.setElement(_this.overlayElement);
        newOverlay.setPosition(_this.currentPoint);
        this._tMap.getOMap().addOverlay(newOverlay);
      }
    }


    if (callfun) {
      callfun(_this.tempRoutePoint, _this.tempRouteFeature);//播放开始的回调函数()
    }
  },

  stopAnimation: function () {
    var source = this.pointsLayer.getSource();
    var traceFeature = source.getFeatureById(this.trackId);
    var pointFeature = source.getFeatureById(this.trackPointId);
    var overlay = this._tMap.getOMap().getOverlayById(this.trackId);
    try {
      if (traceFeature) {
        source.removeFeature(traceFeature);
      }
      if (pointFeature) {
        source.removeFeature(pointFeature);
      }
      if (overlay) {
        this._tMap.getOMap().removeOverlay(overlay);
      }
    } catch (ex) {
    }
  },

  setVisible: function (value) {
    this.pointsLayer.setVisible(value);
  },
  setRouteVisible: function (value) {
    if (value) {
      this.routeFeature.setStyle(this.routeFeatureStyle);
    } else {
      var routestyle = new com.jiusuo.map.style.TStyle({
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(255,255,255,0.1)',
          width: 0.1
        })
      })
      this.routeFeature.setStyle(routestyle);
    }
  },
  getVectorLayer: function () {
    return this.pointsLayer;
  },
  setPlayColor: function (colorhex) {
    this.playColor = colorhex;
    if (this.tempRouteFeatureStyle.constructor == com.jiusuo.map.style.TStyle) {
      var strokeStyle = this.tempRouteFeatureStyle.getStroke();
      strokeStyle.setColor(this.playColor)
      this.tempRouteFeatureStyle.stroke = strokeStyle;
    }
  },
  getTrackID: function () {
    return this.trackId;
  },
  setPlayOverlay: function (value) {
    var element = value;
    this.tempRoutePointStyle = null;
    var newOverlay = this._tMap.getOMap().getOverlayById(this.trackId);
    if (newOverlay) {
      newOverlay.setPosition(this.tempRoutePoint.getGeometry().getCoordinates());
    } else {
      this._tMap.getOMap().getTargetElement().appendChild(element);
      newOverlay = new ol.Overlay({
        id: this.trackId,
        autoPan: false,
        positioning: 'center-center',
        autoPanAnimation: {
          duration: 250
        }
      });
      newOverlay.setElement(element);
      newOverlay.setPosition(this.tempRoutePoint.getGeometry().getCoordinates())
      this._tMap.getOMap().addOverlay(newOverlay);
    }
  },

  //根据为track增加trackNode  solon add start 2017-4-20
  /**
   * 参数 trackNodes:需要被加入轨迹的节点集合；timeRouteControl：轨迹对象
   *
   * */
  addTrackNode: function (trackNodes, timeRouteControl) {

    if (trackNodes.length == 1) {  //只有一个点的情况
      trackNode = trackNodes[0];
      var coord = com.jiusuo.map.transCoordinates(trackNode.coord);
      var geojson = {"type": "Point", "coordinates": coord};
      geom = (new ol.format.GeoJSON()).readGeometry(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: this._tMap.getProjection().getCode()
      });

      var coords = geom.getCoordinates();
      trackNode.coord = coords;

      var feature = new com.jiusuo.map.TFeature(geom);
      feature.set('properties', trackNode.prop);
      feature.setStyle(this.pointsFeaturesStyle);
      this.pointsFeatures.push(feature);
      this.pointsLayer.getSource().addFeature(feature);

      this.pois.push(trackNode);

      this._tMap.getAllTrackPointsList().push(trackNode);
    } else {  //多个点
      var n_points = [];
      if (this._tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
        trackNodes.forEach(function (trackNode) {
          var n_trackNode = trackNode;
          n_trackNode.coord = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([trackNode.coord])[0];
          n_points.push(n_trackNode);
        });
      }
      if (this._tMap.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
        trackNodes.forEach(function (trackNode) {
          var n_trackNode = trackNode;
          n_trackNode.coord = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([trackNode.coord])[0];
          n_points.push(n_trackNode);
        });
      }
      //记录轨迹节点数组
      var pointsJson = [];
      //通过pois组合geoJson数据，利用坐标信息与属性信息组合。
      for (var i = 0; i < n_points.length; i++) {
        pointsJson.push({
          'type': 'Feature',
          'geometry': {'type': 'Point', 'coordinates': n_points[i].coord},
          'properties': n_points[i].prop
        })
      }

      var geoJson = {
        'type': 'FeatureCollection',
        'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
        'features': pointsJson
      };
      var featureProjection = this._tMap.getProjection().getCode();
      var _pointsFeatures = (new ol.format.GeoJSON()).readFeatures(geoJson, {
        dataProjection: 'EPSG:4326',
        featureProjection: featureProjection
      });

      //设置节点样式
      for (var i = 0; i < _pointsFeatures.length; i++) {
        _pointsFeatures[i].setStyle(this.pointsFeaturesStyle);
        var coord = _pointsFeatures[i].getGeometry().getCoordinates();
        trackNodes[i].coord = coord;
      }


      this.pointsFeatures.concat(_pointsFeatures);

      this.pointsLayer.getSource().addFeatures(_pointsFeatures);

      var points = this.pois;
      // var TrackPointsList = this._tMap.getAllTrackPointsList();
      trackNodes.forEach(function (item) {
        points.push(item);
        //TrackPointsList.push(item)
      });

      //增加点的时候，同时生成相应的featrue

    }
    timeRouteControl.resetControlTime();

  }
  //solon add end 2017-4-20
}
com.jiusuo.map.TTimeRouteAnimation = function (options) {
  var option = options || {};
  var _this = this;
  this._tMap = option.tMap;
  var myTMap = option.tMap;
  this.timePlayerLength = 563;
  this.timePlayerLeft = 0;
  // this.playSpeed = 1000;
  this.playSpeed = option.playSpeed || 1000;
  this.playStep = option.playStep || 60;
  this.playerFunction = null;
  this.trackList = myTMap.getTrackList();
  this.allTrackPointsList = myTMap.getAllTrackPointsList();
  this.minStartTime = 10000000000;
  //this.maxEndTime = 0;1494957615
  this.maxEndTime = 1494957619;
  this.templateStartTime = 0;
  this.moveTime = 0;//当前运行时间
  this.range = 24;
  this.timeCurrentRange = 24;
  this.leftCurrentTime = 0;
  var startEnabled = true;
  var pauseEnabled = false;
  var stopEnabled = false;
  var stopForTimeEnd = false; //计时器是否停止，默认是停止的

  _this.trackList.on('change:length', function (e) {
    var list = e.target;
    var elapseTime = 24 * 60 * 60;  //初始化间隔时间为一天
    _this.maxEndTime = 0;
    _this.minStartTime = 100000000000;
    list.forEach(function (track) {
      if (_this.maxEndTime < track.pois[track.pois.length - 1].time) {
        _this.maxEndTime = track.pois[track.pois.length - 1].time
      }
      if (_this.minStartTime > track.pois[0].time) {
        _this.minStartTime = track.pois[0].time
      }
    })
    _this.initTimeLine();
  })


  //当轨迹有新点时，重新设置 _this.minStartTime 和  _this.maxEndTime      solon add start
  this.resetControlTime = function () {

    var elapseTime = 24 * 60 * 60;  //初始化间隔时间为一天

    _this.trackList.forEach(function (track) {
      if (_this.maxEndTime < track.pois[track.pois.length - 1].time) {
        _this.maxEndTime = track.pois[track.pois.length - 1].time;
        //console.log(_this.maxEndTime);
        //  console.log("最大时间 "+com.jiusuo.map.TimeLineUtils.js_date_time( _this.maxEndTime));
      }
      if (_this.minStartTime > track.pois[0].time) {
        _this.minStartTime = track.pois[0].time
        //  console.log("最小时间 "+com.jiusuo.map.TimeLineUtils.js_date_time(_this.minStartTime));
      }
    });
    if (stopForTimeEnd && _this.moveTime < _this.maxEndTime && pauseEnabled && stopEnabled) {    //如果已经停止，则重新出发
      console.log("重新触发轨迹运行");
      if (_this.playerFunction) {
        clearInterval(_this.playerFunction);
      }
      ;   //在重置时间间隔时，确保之前的间隔器已经删除
      _this.playerFunction = setInterval(routeHandle, _this.playSpeed);

      startEnabled = false;
      pauseEnabled = true;
      stopEnabled = true;
      stopForTimeEnd = false;
    }
    /*else if(pauseEnabled&&stopEnabled&&stopForTimeEnd){
            $("input[name='troutes'][checked]").each(function () {
                if ($(this).attr('checked')) {
                    var _index = $(this).attr('id');
                    var _route = _this.findTrack(_index);
                    _route.startAnimation(_this.moveTime);
                }
            });
        }*/
  };
  //solon add

  var routeHandle = function () {
    console.log("轨迹运行");
    if (_this.playerFunction) {
      if (_this.range != 0) {
        var step = _this.timePlayerLength / (_this.playStep * _this.range);
        _this.timePlayerLeft += step;
      }
      else {
        _this.timePlayerLeft = _this.timePlayerLength;
      }

      var percent = _this.timePlayerLeft / _this.timePlayerLength;

      //  var ellapse = Math.floor((_this.range * 60 * 60 * percent));
      var ellapse = (_this.range * 60 * 60 * percent);

      var move_time = _this.templateStartTime + ellapse; //_this.templateStartTime
      console.log("move_time  " + move_time + " maxEndTime  " + _this.maxEndTime);
      if (move_time > _this.maxEndTime && _this.playerFunction) {
        _this.timePlayerLeft = _this.timePlayerLeft - step;
        clearInterval(_this.playerFunction);
        stopForTimeEnd = true;
        console.log("轨迹停止");
        return;
      }
      _this.moveTime = move_time;
      //console.log("_this.moveTime "+_this.moveTime);
      // console.log(move_time);
      if (percent >= 1) {
        //如果移动的当前时间小于最终结束时间
        if (move_time < _this.maxEndTime) {
          _this.templateStartTime = _this.templateStartTime + 24 * 60 * 60;
          _this.timePlayerLeft = _this.timePlayerLeft - _this.timePlayerLength;

          percent = _this.timePlayerLeft / _this.timePlayerLength;

          ellapse = Math.floor((_this.range * 60 * 60 * percent));

          move_time = _this.templateStartTime + ellapse;
          $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');

          _this.initTimeLine_s();
        } else {

          $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLength + 'px');

        }


      } else {

        $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');
      }

      console.log("运行时间赋值");

      var showTime = com.jiusuo.map.TimeLineUtils.js_date_time(move_time);

      $('#routedate').html(showTime.substring(0, 10));
      $('#routetime').html(showTime.substring(11, 19));
      $("input[name='troutes'][checked]").each(function () {
        if ($(this).attr('checked')) {
          var _index = $(this).attr('id');
          var _route = _this.findTrack(_index);
          _route.startAnimation(move_time);
        }
      });
    }


  };

  this.listBox = $('<div class="set_pop set_pop_scale set_pop_right">' +
    '<div class="triangle"><img src=' + com.jiusuo.map.webUrl + '/static/imgditu/ditu_down_sanjiao_110.png></div><div class="margin">' +
    '<div class="scroll"></div></div></div>');
  this.colorPicker = $('<div class="tmap-timeroute-animation－colorpicker-hidden"></div>');
  //控件内部边框
  var outerBox = $('<div class="control"></div>');
  var scaleline = $('<div class="scale set_pop"></div>');
  var sliderOut = $('<div class="lefts"><canvas id="tmap-timeroute-animation-timeline" width="574px" height="55px"></canvas>' +
    '<div id="tmap-timeroute-animation-timeline-long" class="long"></div>' +
    '<img src=' + com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale2_11.png id="tmap-timeroute-animation-timeCtr"/>' +
    '</div>' +
    '');

  var controlBtn = $('<div class="box"></div>');
  var routeListImg = $('<div class="list"><div class="back back1" title="列表"></div></div>');
  routeListImg.on('click', function () {
    $(this).parents('.list').toggleClass('list_hover');
    $('.set_pop_scale').toggle();
  })
  controlBtn.append(routeListImg);
  var startImg = $('<div class="list"><div id="startimg" class="back back3" title="开始"></div></div>');
  var t;

  var maxLength = 0;
  var max_route;
  startImg.on('click', function () {
    if (!startEnabled || _this._tMap.getTrackList().getLength() == 0) {
      return;
    }
    startEnabled = false;
    pauseEnabled = true;
    stopEnabled = true;
    _this.playerFunction = setInterval(routeHandle, _this.playSpeed);
    console.log("开始间隔 " + _this.playerFunction);
  })
  controlBtn.append(startImg);
  var pauseImg = $('<div class="list"><div id="mapRoutePauseId" class="back back2" title="暂停"></div></div>');
  pauseImg.on('click', function () {
    if (!pauseEnabled) {
      return;
    }
    startEnabled = true;
    pauseEnabled = false;
    stopEnabled = true;
    clearInterval(_this.playerFunction);
  })
  controlBtn.append(pauseImg);
  var stopImg = $('<div class="list"><div id="mapRouteStopId" class="back back4" title="停止"></div></div>');
  stopImg.on('click', function () {
    if (!stopEnabled) {
      return;
    }
    startEnabled = true;
    pauseEnabled = true;
    stopEnabled = false;
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = $(this).attr('id');
        var _route = _this.findTrack(_index);
        _route.stopAnimation();
      }
    });
    clearInterval(_this.playerFunction);
    _this.timePlayerLeft = 0;
    $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');
    _this.templateStartTime = _this.minStartTime;

    var showTime = com.jiusuo.map.TimeLineUtils.js_date_time(_this.templateStartTime);
    $('#routedate').html(showTime.substring(0, 10));
    $('#routetime').html(showTime.substring(11, 19));

    _this.initTimeLine_s();
  })

  controlBtn.append(stopImg);
  var speedNum = 1;
  var fastImg = $('<div class="list"><div  disabled=1 class="back back5" title="加速"><div class="double" id="route_speedNum"></div></div></div>');
  fastImg.on('click', function () {
    console.log("加速清除间隔 " + _this.playerFunction);
    clearInterval(_this.playerFunction);
    _this.playSpeed = _this.playSpeed / 2;
    if (_this.playSpeed <= 1) {
      _this.playSpeed = 1;
    }
    speedNum = speedNum * 2;
    if (speedNum == 1) {
      $('#route_speedNum')[0].innerHTML = '';
    } else {
      $('#route_speedNum')[0].innerHTML = 'x' + speedNum;
    }
    _this.playerFunction = setInterval(routeHandle, _this.playSpeed);
    console.log("加速设置间隔 " + _this.playerFunction);
  });
  controlBtn.append(fastImg);
  var slowImg = $('<div class="list"><div disabled=1 class="back back6" title="减速"></div></div>');
  slowImg.on('click', function () {
    console.log("减速清除间隔 " + _this.playerFunction);
    clearInterval(_this.playerFunction);
    _this.playSpeed = _this.playSpeed * 2;
    _this.playerFunction = setInterval(routeHandle, _this.playSpeed);
    console.log("减速设置间隔 " + _this.playerFunction);
    speedNum = speedNum / 2;
    if (speedNum == 1) {
      $('#route_speedNum')[0].innerHTML = '';
    } else {
      $('#route_speedNum')[0].innerHTML = 'x' + speedNum;
    }
  });
  controlBtn.append(slowImg);
  scaleline.append(sliderOut);
  var timespan = $('<span  id="routedate" class="date"></span><span id="routetime" class="time"></span>');
  controlBtn.append(timespan);
  this.element = $('<div class="scale_control"></div>');
  outerBox.append(this.listBox);
  outerBox.append(controlBtn);
  this.element.append(outerBox);
  this.element.append(scaleline);
  myTMap.getOMap().getTargetElement().appendChild(this.element[0]);

  $('#tmap-timeroute-animation-timeline-long').mousedown(function (e) {
    var w = $(this).width();
    var x = e.pageX - $(this).offset().left;
    var ellapse = 24 * 60 * 60;
    var move_time = 0;
    if (x >= _this.timePlayerLength) {
      ellapse = 24 * 60 * 60;
      var tempEndTime = _this.templateStartTime + ellapse;
      if (tempEndTime < _this.maxEndTime) {
        x = $(this).offset();
        _this.templateStartTime = tempEndTime;
        move_time = _this.templateStartTime;
        _this.move_time = move_time;
        _this.initTimeLine_s();
      } else {
        x = _this.timePlayerLength;
        move_time = _this.templateStartTime;
        _this.move_time = move_time;
      }
      _this.timePlayerLeft = x;

    } else {
      console.log(x);
      if (x <= 1) {
        if (_this.templateStartTime > _this.minStartTime) {

          _this.templateStartTime = _this.templateStartTime - ellapse;
          _this.timePlayerLeft = _this.timePlayerLength - 30;//使游标重置的时候不在最右端，这样可以看出游标重置的效果。
          var percent = _this.timePlayerLeft / _this.timePlayerLength;
          ellapse = Math.floor((_this.range * 60 * 60 * percent));
          move_time = _this.templateStartTime + ellapse;
          _this.move_time = move_time;
          _this.initTimeLine_s();
        }


      } else {
        _this.timePlayerLeft = x;
        var percent = _this.timePlayerLeft / _this.timePlayerLength;
        if (percent >= 1) {
          percent = 1;
          _this.timePlayerLeft = _this.timePlayerLength;
        }


        ellapse = Math.floor((_this.range * 60 * 60 * percent));
        move_time = _this.templateStartTime + ellapse;
        _this.move_time = move_time;
      }

    }


    $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');
    //var ellapse = Math.floor((_this.range * 60 * 60 * percent));
    // move_time = _this.minStartTime + ellapse;
    showTime = com.jiusuo.map.TimeLineUtils.js_date_time(move_time);
    $('#routedate').html(showTime.substring(0, 10));
    $('#routetime').html(showTime.substring(11, 19));
    $("input[name='troutes'][checked]").each(function () {
      if ($(this).attr('checked')) {
        var _index = $(this).attr('id');
        var _route = _this.findTrack(_index);
        _route.startAnimation(move_time);
      }
    });
  });


  $('#tmap-timeroute-animation-timeCtr').mousedown(function (e) {
    $(document).mousemove(function (e) {
      if (!!this.move) {
        var callback = document.call_down || function () {
        };
        callback.call(this, e);
      }
    }).mouseup(function (e) {
      if (!!this.move) {
        var callback = document.call_up || function () {
        };
        callback.call(this, e);
        $.extend(this, {
          'move': false,
          'move_target': null,
          'call_down': false,
          'call_up': false
        });
      }
    });

    var curleft = $(this).position().left;
    var me = $(this);
    var newLeft = 0;
    var startX = e.pageX;
    var percent = 0;
    $.extend(document, {
      'move': true,
      'call_down': function (e) {
        var diffX = e.pageX - startX;
        /*console.log(e.pageX);
                console.log(startX);
                console.log(diffX);
                console.log(curleft);*/
        newLeft = curleft + diffX;
        newLeft = newLeft < 0 ? 0 : newLeft;


        var ellapse = 24 * 60 * 60;
        var move_time = 0;

        //如果游标移动到右侧尽头，则判断对应的时间是否为this.maxEndTime,如果是则把游标置于左边开始处，并重新计算开始时间
        if (newLeft >= _this.timePlayerLength) {
          //计算对应的时间
          ellapse = 24 * 60 * 60;
          move_time = _this.templateStartTime + ellapse;
          _this.templateStartTime = move_time; //重新计算开始时间；
          _this.timePlayerLeft = 0;
          if (_this.templateStartTime < _this.maxEndTime) {
            _this.initTimeLine_s();
          } else {
            _this.timePlayerLeft = _this.timePlayerLength;
            _this.templateStartTime = _this.templateStartTime - ellapse;

            return;
          }


        } else {

          if (newLeft <= 0 && _this.templateStartTime > _this.minStartTime) {  //当拖动游标到最左端的时，如果templateStartTime大于初始时间，则重新初始化

            _this.timePlayerLeft = _this.timePlayerLength - 30;  //使游标的变化比较明显
            _this.templateStartTime = _this.templateStartTime - ellapse;

            var percent = _this.timePlayerLeft / _this.timePlayerLength;
            ellapse = Math.floor((_this.range * 60 * 60 * percent));
            move_time = _this.templateStartTime + ellapse;
            //console.log(com.jiusuo.map.TimeLineUtils.js_date_time(move_time));
            $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');
            _this.initTimeLine_s();
            $(document).unbind('mousemove');

          } else {

            _this.timePlayerLeft = newLeft;
            var percent = _this.timePlayerLeft / _this.timePlayerLength;
            ellapse = Math.floor((_this.range * 60 * 60 * percent));
            move_time = _this.templateStartTime + ellapse;
            // console.log(com.jiusuo.map.TimeLineUtils.js_date_time(move_time));
          }


        }


        // newLeft = newLeft > _this.timePlayerLength ? _this.timePlayerLength : newLeft;


        //

        //  console.log('aaaaaaaa  '+_this.timePlayerLeft);

        $('#tmap-timeroute-animation-timeCtr').css('left', _this.timePlayerLeft + 'px');
        if (_this.trackList.getLength() != 0) {
          // var ellapse = Math.floor((_this.range * 60 * 60 * percent));
          //var move_time = _this.minStartTime + ellapse;
          // if (move_time >= _this.maxEndTime) {
          //  move_time = _this.maxEndTime;
          //}
          _this.move_time = move_time;
          var showTime = com.jiusuo.map.TimeLineUtils.js_date_time(move_time);
          //console.log(showTime);
          $('#routedate').html(showTime.substring(0, 10));
          $('#routetime').html(showTime.substring(11, 19));
          $("input[name='troutes'][checked]").each(function () {
            if ($(this).attr('checked')) {
              var _index = $(this).attr('id');
              var _route = _this.findTrack(_index);
              _route.startAnimation(move_time);
            }
          });
        } else {
          $('#routedate').html('');
          $('#routetime').html('');
        }

      },
      'call_up': function (e) {
        $(document).unbind('mousemove');
      }
    });
    return false;
  });
};
com.jiusuo.map.TTimeRouteAnimation.prototype.initTimeLine = function () {
  var _this = this;
  var startTime = this.minStartTime;
  _this.templateStartTime = this.minStartTime;

  var endTime = this.maxEndTime;
  // var timeLineControl = new com.jiusuo.map.TimeLine('tmap-timeroute-animation-timeline');
  this.timeLineControl = new com.jiusuo.map.TimeLine('tmap-timeroute-animation-timeline');
  var data = [];
  //solon add for test  start
  if (true) {
    data = this.genData2(_this.templateStartTime);
  } else {
    data = this.genData();
  }
  //solon add for end
  this.timeLineControl.drawTimeCoord(data);
  $('#tmap-timeroute-animation-timeCtr').css('left', '0px')
};

//solon add start 当游标移动到最右端或最左端时， 重新计算时间轴
com.jiusuo.map.TTimeRouteAnimation.prototype.initTimeLine_s = function () {
  var _this = this;

  if (_this.templateStartTime == 0) {
    _this.templateStartTime = _this.minStartTime;

  }
  var data = [];
  //solon add for test  start
  if (true) {
    data = this.genData2(_this.templateStartTime);
  } else {
    data = this.genData();
  }
  //solon add for end
  this.timeLineControl.drawTimeCoord(data);
  $('#tmap-timeroute-animation-timeCtr').css('left', '0px');
};
//solon add end


//solon add 产生一天的时间start 2017-4-17
com.jiusuo.map.TTimeRouteAnimation.prototype.genData2 = function (startTime) {
  var _this = this;
  var endTime = startTime + (24 * 60 * 60);

  var startTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(startTime));
  var endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(endTime));

  var start = startTimeDate.getHours();
  var end = endTimeDate.getHours();
  var d = 24;
  var data = [];

  if (d % 2 != 0) {
    d = Math.ceil(d / 2) * 2;
  }
  for (var i = 0; i <= d; i += 2) {
    var hour = i + start;
    var num = 0;
    while (!(hour - 24 * num >= 0 && hour - 24 * num < 24)) {
      num++;
    }
    hour = hour - 24 * num;
    if (hour == 0 && i != 0) {
      var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
      data.push((date.getMonth() + 1) + '-' + date.getDate());
    } else {
      data.push(hour);
    }
  }

  _this.range = d;
  return data;
}

//solon end

com.jiusuo.map.TTimeRouteAnimation.prototype.genData = function () {
  var _this = this;

  var startTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.minStartTime));
  var endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.maxEndTime));
  if (endTimeDate.getMinutes() != 0) {
    end = endTimeDate.getHours() + 1;
    var endTime = _this.maxEndTime + 3600;
    endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(endTime));
  }
  var start = startTimeDate.getHours();
  var end = endTimeDate.getHours();
  _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + start + ":00:00");
  var startTime = _this.minStartTime;
  var endTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(endTimeDate, 'yyyy-MM-dd') + ' ' + end + ":00:00");
  var d = Math.ceil((endTime - startTime) / 3600);
  var data = [];
  if (d <= 10 && d > 5) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      data.push(hour + ':30');
    }
    data.push(end);
  } else if (d <= 5 && d > 3) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      //data.push(hour + ':15');
      data.push(hour + ':30');
      //data.push(hour + ':45');
    }
    data.push(end);
  } else if (d <= 3 && d > 0) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      data.push(hour + ':30');
    }
    data.push(end);
  } else if (d <= 20 && d > 10) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
    }
    data.push(end);
  }
  else {
    if (d <= 40 && d > 20) {
      if (d % 2 != 0) {
        d = Math.ceil(d / 2) * 2;
      }
      for (var i = 0; i <= d; i += 2) {
        var hour = i + start;
        var num = 0;
        while (!(hour - 24 * num >= 0 && hour - 24 * num < 24)) {
          num++;
        }
        hour = hour - 24 * num;
        if (hour == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(hour);
        }
      }
    } else if (d <= 60 && d > 40) {
      if (d % 4 != 0) {
        d = Math.ceil(d / 4) * 4;
      }
      for (var i = 0; i <= d; i += 4) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;
        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 120 && d > 60) {
      if (d % 6 != 0) {
        d = Math.ceil(d / 6) * 6;
      }
      for (var i = 0; i <= d; i += 6) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;

        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 240 && d > 120) {
      if (d % 12 != 0) {
        d = Math.ceil(d / 12) * 12;
      }
      for (var i = 0; i <= d; i += 12) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;
        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 360 && d > 180) {
      var dayCount = Math.ceil((endTime - startTime) / (60 * 60 * 24));
      startTimeDate.setHours(0);
      startTimeDate.setMinutes(0);
      startTimeDate.setSeconds(0);
      startTimeDate.setMilliseconds(0);
      _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + "00:00:00");
      _this.maxEndTime = _this.minStartTime + dayCount * 24 * 3600;
      d = 24 * dayCount;
      for (var i = 0; i < dayCount; i++) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + i));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      }
      var endDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.maxEndTime));
      data.push((endDate.getMonth() + 1) + '-' + endDate.getDate());
    } else if (d <= 720 && d > 360) {
      var dayCount = Math.ceil((endTime - startTime) / (60 * 60 * 24));
      if (dayCount % 2 != 0) {
        dayCount = Math.ceil(dayCount / 2) * 2;
      }
      startTimeDate.setHours(0);
      startTimeDate.setMinutes(0);
      startTimeDate.setSeconds(0);
      startTimeDate.setMilliseconds(0);
      _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + "00:00:00");
      _this.maxEndTime = _this.minStartTime + dayCount * 24 * 3600;
      d = 24 * dayCount;
      for (var i = 0; i <= dayCount; i += 2) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + i));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      }
    } else {
      if (d > 0) {
        var d = dialog({
          title: '提示',
          content: '播放时间范围超过30天！'
        });
        d.showModal();
      }
    }
  }
  _this.range = d;
  return data;
}
com.jiusuo.map.TTimeRouteAnimation.prototype.getScale = function () {
  var _this = this;
  var startTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.minStartTime));
  var endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.maxEndTime));
  if (endTimeDate.getMinutes() != 0) {
    end = endTimeDate.getHours() + 1;
    var endTime = _this.maxEndTime + 3600;
    endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(endTime));
  }
  var start = startTimeDate.getHours();
  var end = endTimeDate.getHours();
  _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + start + ":00:00");
  var startTime = _this.minStartTime;
  var endTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(endTimeDate, 'yyyy-MM-dd') + ' ' + end + ":00:00");
  var d = Math.ceil((endTime - startTime) / 3600);
  var data = [];

}
com.jiusuo.map.TTimeRouteAnimation.prototype.findTrack = function (trackId) {
  var myTMap = this._tMap;
  var routelist = myTMap.getTrackList();
  var track = null;
  routelist.forEach(function (item) {
    if (item.getTrackID() == trackId) {
      track = item;
    }
  })
  return track;
}
com.jiusuo.map.TTimeRouteAnimation.prototype.addTrack = function (track) {

  var colorDiv = this.colorPicker;
  var _this = this;
  var timeRouteControl = this;
  var trackId = track.getTrackID();
  this._tMap.getTrackList().push(track);
  this._tMap.getAllTrackPointsList().extend(track.points);
  this._tMap.addRouteLayer(track);
  track.setRouteVisible(false);
  var item = $('<div class="title title2" name="divs" value="' + trackId + '"><label class="labelname" title="' + track.trackname + '"> <input type="checkbox" name="troutes" checked="checked" id="' + trackId + '">' + track.trackname + '</label>' +
    '<div class="close"> ' +
    '<label for="color"> ' +
    '<input type="color" id="color" class="color">' +
    '<a href="javascript:void(0)"><img src=' + com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale_06.png name="colors" class="picker" id="colors_' + trackId + '"></a> </label>' +
    '<a href="javascript:void(0)" ><img src=' + com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale_08.png name="sees" id="sees_' + trackId + '"></a>' +
    '<a href="javascript:void(0)" ><img src=' + com.jiusuo.map.webUrl + '/static/imgditu/ditu_video_close.png name="removes" class="closem" id="removes_' + trackId + '"></a> ' +
    '</div> </div>');
  $('.control .margin .scroll').append(item);

  $("#" + trackId).click(function () {
    var _index = $(this).attr('id');
    var _route = _this.findTrack(_index);
    if ($(this).attr('checked')) {
      $(this).attr('checked', false);
      _route.setVisible(false);
      _route.stopAnimation(true);
    } else {
      $(this).attr('checked', 'checked');
      _route.setVisible(true);
    }
  });
  $("#sees_" + trackId).click(function () {
    var src = $(this).attr('src');
    var id = $(this).attr('id');
    var _route = _this.findTrack(id.substring(5));
    if (src == com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale_08.png') {
      $(this).attr('src', com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale_081.png');
      _route.setRouteVisible(true);
    } else {
      $(this).attr('src', com.jiusuo.map.webUrl + '/static/imgditu/ditu_scale_08.png');
      _route.setRouteVisible(false);
    }
  });
  $("#removes_" + trackId).click(function (evt) {
    var d = dialog({
      title: '提示',
      content: '是否删除该轨迹?',
      okValue: '确 定',
      ok: function () {
        try {
          var id = $(evt.target).attr('id');
          var _route = _this.findTrack(id.substring(8));
          if (_route) {
            _this._tMap.getOMap().removeLayer(_route.getVectorLayer());
            _this._tMap.getTrackList().remove(_route);
          }
          var overlay = _this._tMap.getOMap().getOverlayById(id.substring(8));
          if (overlay) {
            _this._tMap.getOMap().removeOverlay(overlay);
          }
        } catch (ex) {
        }
        $("div[name='divs']").each(function () {
          if ($(this).attr('value') == id.substring(8)) {
            $(this).remove();
          }
        });
      },
      cancelValue: '取 消',
      cancel: function () {

      }
    });
    d.showModal();
  });
  $('.picker').colpick({
    flat: false,
    layout: 'hex',
    submit: 0,
    onChange: function (hsb, hex, rgb, el, bySetColor) {
      $(el).closest('.title2').css('color', '#' + hex);
      var id = $(el).attr('id');
      var _route = _this.findTrack(id.substring(7));
      _route.setPlayColor('#' + hex);
    }
  });
  return timeRouteControl;
};
com.jiusuo.map.TTimeRouteAnimation.prototype.setPlaySpeed = function (value) {
  this.playSpeed = value;
}
com.jiusuo.map.TTimeRouteAnimation.prototype.setPlayStep = function (value) {
  this.playStep = value;
}
com.jiusuo.map.TTimeRouteAnimationControl = function (opt_options) {
  var options = opt_options || {};
  var _tMap = options.tMap;
  if (_tMap == null) {
    _tMap = com.jiusuo.map.tMap;
  }
  var _playSpeed = opt_options.playSpeed;
  var _playStep = opt_options.playStep;
  var controlContainer = _tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel || '轨迹播放';
  this.routeControl = new com.jiusuo.map.TTimeRouteAnimation({
    tMap: _tMap,
    playSpeed: _playSpeed,
    playStep: _playStep
  });
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word' id='" + controlContainer + "_ctm_tool_route'>"
    + "<img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_53.png' width='36px' height='36px' class='img1'>"
    + "<img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_53.png' width='36px' height='36px' class='img2'>"
    + "</div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);

  $('#' + controlContainer + '_ctm_tool_route').on('click', function () {
    if (_tMap.routeControl != null) {
      $('.scale_control').toggle();
    }
  })
};
/**
 * @类名：网格（实时）控制控件
 * @参数：{Object=} opt_options Control options.
 * @用途：控制网格的显示，通过不同的地图层级实时加载网格
 */
com.jiusuo.map.TGeoGridOCControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this.colorIndex = options.colorIndex || 0;
  this.colorAlpha = options.colorAlpha || 0.8;
  this.isShowNum = options.isShowNum || false;
  this.isRightMenu = options.isRightMenu || false;
  this.rightMenuItems = options.rightMenuItems || [];
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '网格控制';
  var tag = 0;
  var geohash = new com.jiusuo.map.TGeoHash(this.isShowNum, this.colorIndex, this.colorAlpha);
  this._tMap.currentGeohash = geohash;
  this._tMap.currentGeohashInitProperties.colorIndex = this.colorIndex;
  this._tMap.currentGeohashInitProperties.colorAlpha = this.colorAlpha;
  this._tMap.currentGeohashInitProperties.isShowNum = this.isShowNum;
  this._tMap.currentGeohashInitProperties.isRightMenu = this.isRightMenu;
  this._tMap.currentGeohashInitProperties.rightMenuItems = this.rightMenuItems;
  this.openAutoGridByMap = function () {
    $('#' + controlContainer + '_ctm_tool_pop_geogridoccontrol_i')[0].src = com.jiusuo.map.webUrl + '/static/imgditu/font_icon2_161.png';
    $('#' + controlContainer + '_ctm_tool_pop_geogridoccontrol_j')[0].src = com.jiusuo.map.webUrl + '/static/imgditu/font_icon2_160.png';
    tag = 1;
    geohash.openAutoGridByMap();
    var bFunction = function (feature) {
      return _this.rightMenuItems;
    };
    com.jiusuo.map.TEpMenu.init(bFunction);
  };
  this.closeAutoGridByMap = function () {
    $('#' + controlContainer + '_ctm_tool_pop_geogridoccontrol_i')[0].src = com.jiusuo.map.webUrl + '/static/imgditu/font_icon2_160.png';
    $('#' + controlContainer + '_ctm_tool_pop_geogridoccontrol_j')[0].src = com.jiusuo.map.webUrl + '/static/imgditu/font_icon2_161.png';
    tag = 0;
    geohash.closeAutoGridByMap();
  }
  var handle = function () {
    var map = _this._tMap.getOMap();
    if (tag == 0) {
      _this.openAutoGridByMap();
    } else {
      _this.closeAutoGridByMap();
    }
  };
  var handleClick = function () {
    handle();
  };
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + " <div class='img' id='" + controlContainer + "_ctm_tool_pop_geogridoccontrol'>" +
    "<img id='" + controlContainer + "_ctm_tool_pop_geogridoccontrol_i' src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_160.png' width='26px' height='26px' class='img_right1'>" +
    "<img id='" + controlContainer + "_ctm_tool_pop_geogridoccontrol_j' src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_161.png' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_pop').prepend(div);
  $('#' + controlContainer + '_ctm_tool_pop_geogridoccontrol').on('click', function (evt) {
    handleClick();
  });
};
com.jiusuo.map.TGeoGridOCControl.gridQuery = function (feature, MousePointF, e, tMap) {
  if (tMap == undefined || tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var geohash = new com.jiusuo.map.TGeoHash();
  var callback = function (jsonObj) {
    tMap.removeWaitingModel();
    if (jsonObj == null) {
      return;
    }
    var tels = jsonObj.results;
    var sprinkle_features = [];
    var icon = com.jiusuo.map.webUrl + '/static/mark/' + com.jiusuo.map.iconStyle + 'i_bsljd_pt.png';
    var center = null;
    tels.forEach(function (tel) {
      if (tel.lon && tel.lat) {
        var coordinates = [parseFloat(tel.lon), parseFloat(tel.lat)];
        center = coordinates;
        var mergeTelItems = tel.mergeTelItems;
        var innerHtml = "<div style='margin-top: 6%;'>";
        innerHtml += "手机列表<br>";
        innerHtml += "<div style='height: 300px;width: 100%;overflow-y:auto'>";
        mergeTelItems.forEach(function (mergeTelItem) {
          innerHtml += "&nbsp;&nbsp;&nbsp;&nbsp;手机：" + mergeTelItem.msisdn + "<br>";
          innerHtml += "&nbsp;&nbsp;&nbsp;&nbsp;时间：" + mergeTelItem.capturetime + "<br>";
          innerHtml += "<hr align='center' width='100%' color='blue' size='1'>";
        });
        innerHtml += "</div><br>";
        innerHtml += "位置信息<br>";
        innerHtml += "&nbsp;&nbsp;&nbsp;&nbsp;经度：" + tel.lon + "<br>";
        innerHtml += "&nbsp;&nbsp;&nbsp;&nbsp;纬度：" + tel.lat + "<br>";
        innerHtml += "</div>";
        sprinkle_features.push({
          'type': 'Feature',
          'geometry': {'type': 'Point', 'coordinates': coordinates},
          'properties': {
            icon: icon,
            number: mergeTelItems.length,
            msisdn: tel.msisdn,
            time: tel.capturetime,
            lon: tel.lon,
            lat: tel.lat,
            innerHTML: innerHtml,
            showFields: [{field: 'msisdn', alias: '手机 '}, {field: 'time', alias: '时间'}, {
              field: 'lon',
              alias: '经度'
            }, {field: 'lat', alias: '纬度'}],
            callback: null
          }
        });
      }
    });
    var layerId = com.jiusuo.map.TUtils.createGUID();
    var geoJson_sprinkle = {
      'type': 'FeatureCollection',
      'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
      'features': sprinkle_features
    };
    var sprinkleLayer = new com.jiusuo.map.TSprinkleLayer({
      geoJson: geoJson_sprinkle,
      id: layerId,
      offsetX: 20,
      offsetY: -10
    });
    tMap.addSprinkleLayer(sprinkleLayer);
    if (center) {
      tMap.setCenter(center);
    }
    tMap.getOMap().getView().setZoom(18);
  }
  if (feature) {
    var geohashid = feature.get('geohashid');
    if (geohashid && geohashid.length == 7) {
      tMap.addWaitingModel();
      geohash.getTelByGeohash(geohashid, callback);
    } else {
      var d = dialog({
        title: '提示',
        content: '请选择7级网格！'
      });
      d.showModal();
    }
  }
};
/**
 * @类名：geohash工具类
 * @参数：_isShowNum是否显示数字、_colorIndex色带索引（0红黄绿，1红黄，2蓝）、_colorAlpha透明度（[0,1]区间、tMap可为空）.
 * @用途：用于初始化右边菜单、顶部工具的锚点
 */
com.jiusuo.map.TGeoHash = function (_isShowNum, _colorIndex, _colorAlpha, tMap) {
  var _this = this;
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  this.linkedIceFlag = true;
  this.isShowNum = _isShowNum || false;
  this.colorAlpha = _colorAlpha || 0.8;
  var _colorIndex = _colorIndex || 0;
  this.rgbaColors = [[[35, 175, 55], [55, 200, 25], [135, 215, 15], [185, 230, 0], [255, 240, 0], [255, 210, 0], [255, 180, 0], [255, 150, 0], [255, 100, 0], [255, 0, 0]], [[255, 245, 120], [255, 230, 50], [255, 210, 0], [255, 180, 0], [255, 150, 0], [255, 120, 0], [255, 90, 0], [255, 60, 0], [255, 20, 0], [255, 0, 0]], [[200, 250, 255], [170, 245, 255], [120, 240, 255], [75, 235, 255], [25, 220, 245], [0, 200, 235], [0, 180, 235], [0, 160, 235], [0, 140, 235], [0, 120, 235]]];
  this.rgbaColor = this.rgbaColors[_colorIndex];
  this.isFixHashLen = false;
  this.getGeohashs = function (geojson, hashLen, isMerge, percent, stopHashLen) {
    var geohashs = {};
    $.ajax({
      async: false,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getGeohashids.do',
      data: {geojson: geojson, hashLen: hashLen, isMerge: isMerge, percent: percent, stopHashLen: stopHashLen},
      error: function (json) {
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        geohashs = geohashStr;
      }
    });
    return geohashs;
  };
  this.getGeohashGrids = function (geojson, hashLen, isShow, isMerge, percent, stopHashLen, isLinkIce, ip, port) {
    var geohashGrids = {};
    $.ajax({
      async: false,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getGeoGrids.do',
      data: {geojson: geojson, hashLen: hashLen, isMerge: isMerge, percent: percent, stopHashLen: stopHashLen},
      error: function (json) {
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        geohashGrids = geohashStr;
      }
    });
    if (isShow) {
      geohashGrids = _this.showGeohashGrids(geohashGrids);
    }
    return geohashGrids;
  };
  this.getGeoGridsByGeohashAndNum = function (json, isShow) {
    var geohashGrids = {};
    $.ajax({
      async: false,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getGeoGridsByGeohashAndNum.do',
      data: {hashAndNums: json},
      error: function (json) {
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        geohashGrids = geohashStr;
      }
    });
    if (isShow) {
      geohashGrids = _this.showGeohashGrids(geohashGrids);
    }
    return geohashGrids;
  }
  this.getGeohashGridsLinkedIce = function (geojson, hashLen, callback) {
    var geohashGrids = {};
    $.ajax({
      async: false,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getGeoGrids.do',
      data: {
        geojson: geojson,
        hashLen: hashLen,
        linkice: '1'
      },
      error: function (json) {
//                var d = dialog({
//                    title: '提示',
//                    content: '加载json失败：' + json
//                });
//                d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        geohashGrids = geohashStr;
      }
    });
    geohashGrids = _this.showGeohashGrids(geohashGrids);
    return geohashGrids;
  };
  this.getHistoryGeohashGrids = function (geojson, hashLen, starttime, endtime, callback) {
    $.ajax({
      async: true,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getHistoryGeoGrids.do',
      data: {
        geojson: geojson,
        hashLen: hashLen,
        start: starttime,
        end: endtime
      },
      error: function (json) {
        callback(null);
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 30000,
      success: function (geohashStr) {
        callback(geohashStr);
      }
    });
  };
  this.getTelByGeohash = function (geohash, callback) {
    $.ajax({
      async: true,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getTelByGeohash.do',
      data: {
        geohash: geohash
      },
      error: function (json) {
        callback(null);
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        callback(geohashStr);
      }
    });
  }
  this.geohashGridsToFeatures = function (geohashGrids) {
    var features = [];
    if (geohashGrids == null || geohashGrids.grids == null) {
      return null;
    }
    var grids = geohashGrids.grids;
    grids.forEach(function (grid) {
      var geohashid = grid.geohashid;
      var geoExtent = grid.geoExtent;
      var standardizaitonValue = parseInt(grid.level);
      var minx = geoExtent.minx;
      var miny = geoExtent.miny;
      var maxx = geoExtent.maxx;
      var maxy = geoExtent.maxy;
      var p1 = [minx, maxy];
      var p2 = [minx, miny];
      var p3 = [maxx, miny];
      var p4 = [maxx, maxy];
      if (tMap.getProjection().getCode() == 'EPSG:3857') {
        p1 = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([p1])[0];
        p2 = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([p2])[0];
        p3 = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([p3])[0];
        p4 = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([p4])[0];
      }
      var polygon = new ol.geom.Polygon([[p1, p2, p3, p4, p1]]);
      polygon = com.jiusuo.map.TGeometryUtils.geomtransform(polygon, 'EPSG:4326', tMap.getProjection().getCode());
      var color = _this.rgbaColor[parseInt(standardizaitonValue)];

      var mapLevel = tMap.getOMap().getView().getZoom();
      var style;
      if (_this.isShowNum && mapLevel != 9 && mapLevel != 10 && mapLevel != 12 && mapLevel != 14) {
        var textFill = new com.jiusuo.map.style.TFill({
          color: 'white'
        });
        var textStroke = new com.jiusuo.map.style.TStroke({
          color: 'black',
          width: 3
        });
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          }),
          text: new com.jiusuo.map.style.TText({
            text: grid.num + '',
            font: '16px sans-serif',
            fill: textFill,
            stroke: textStroke
          })
        });
      } else {
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          })
        });
      }
      var feature = new ol.Feature();
      feature.set('geohashid', geohashid);
      feature.set('num', grid.num);
      feature.set('level', grid.level);
      feature.setStyle(style);
      feature.setGeometry(polygon);
      features.push(feature);
    });
    return features;
  };
  this.removeGeohashGrids = function (features) {
    tMap.removeFeatures(null, features);
  };

  this.getExtentByGeohashs = function (geoHashIds) {
    var geohashs = {};
    geohashids = "";
    if (geoHashIds.length > 0) {
      geohashids = geoHashIds.join(",");
    } else {
      return;
    }
    $.ajax({
      async: false,
      cache: false,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      url: tMap.tMapServiceConfig.proxyServer + '/TeligenMapProxyServer/getExtentByGeohashs.do',
      data: {geohashs: geohashids},
      error: function (json) {
        var d = dialog({
          title: '提示',
          content: '加载json失败：' + json
        });
        d.showModal();
      },
      timeout: 10000,
      success: function (geohashStr) {
        geohashs = geohashStr;
        console.log(geohashs);
      }
    });
    return geohashs;
  };
  this.showGeohashGrids = function (geohashGrids) {
    var features = _this.geohashGridsToFeatures(geohashGrids);
    if (features != null) {
      var source = tMap.getVectorLayer('baseVector').getSource();
      source.addFeatures(features);
    }
    return features;
  };
  this.currentGrids = null;
  this.addGridByLevel = function () {
    var hashLen = 0;
    if (_this.currentGrids) {
      _this.removeGeohashGrids(_this.currentGrids);
    }
    if (tMap.getOMap().getView().getZoom() < 9 || tMap.getOMap().getView().getZoom() > 17) {
      return;
    }
    if (tMap.getOMap().getView().getZoom() >= 9 && tMap.getOMap().getView().getZoom() <= 11) {
      hashLen = 5;
    }
    if (tMap.getOMap().getView().getZoom() >= 12 && tMap.getOMap().getView().getZoom() <= 13) {
      hashLen = 6;
    }
    if (tMap.getOMap().getView().getZoom() >= 14 && tMap.getOMap().getView().getZoom() <= 17) {
      hashLen = 7;
    }
    var extentGeojson = tMap.getMapWindowExtent('EPSG:4326');
    if (this.linkedIceFlag) {
      //  if(false){
      _this.currentGrids = _this.getGeohashGridsLinkedIce(extentGeojson, hashLen);
    } else {
      if (this.isFixHashLen) {
        hashLen = 6;
      }
      _this.currentGrids = _this.getGeohashGrids(extentGeojson, hashLen, true);
    }

  };
  this.mapLevelChange = function (evt) {
    _this.addGridByLevel();
  };
  //noLinkedIceFlag :true 表示不连接ice,false 表示连接ice;isFixHashLen true 表示用固定6级网格。
  this.openAutoGridByMap = function (noLinkedIceFlag, isFixHashLen) {
    this.isFixHashLen = isFixHashLen || false;
    if (noLinkedIceFlag) {
      _this.linkedIceFlag = !noLinkedIceFlag;

    }
    tMap.getOMap().on('moveend', _this.mapLevelChange);
    _this.addGridByLevel();
  };
  this.closeAutoGridByMap = function () {
    tMap.getOMap().un('moveend', _this.mapLevelChange);
    if (_this.currentGrids) {
      _this.removeGeohashGrids(_this.currentGrids);
      _this.currentGrids = null;
    }
  };
  this.changeColor = function (index) {
    _this.rgbaColor = _this.rgbaColors[index];
    if (_this.currentGrids == null) {
      return;
    }
    _this.currentGrids.forEach(function (feature) {
      var _color = _this.rgbaColor[parseInt(feature.get('level'))]
      var mapLevel = tMap.getOMap().getView().getZoom();
      if (_this.isShowNum && mapLevel != 9 && mapLevel != 10 && mapLevel != 12 && mapLevel != 14) {
        var textFill = new com.jiusuo.map.style.TFill({
          color: 'white'
        });
        var textStroke = new com.jiusuo.map.style.TStroke({
          color: 'black',
          width: 3
        });
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            width: 0.5
          }),
          text: new com.jiusuo.map.style.TText({
            text: feature.get('num') + '',
            font: '16px sans-serif',
            fill: textFill,
            stroke: textStroke
          })
        });
      } else {
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            width: 0.5
          })
        });
      }
      feature.setStyle(style);
    });
  };
  this.ShowNumSwape = function (value) {
    _this.isShowNum = value;
    if (_this.currentGrids == null) {
      return;
    }
    var mapLevel = tMap.getOMap().getView().getZoom();
    if (value && mapLevel != 9 && mapLevel != 10 && mapLevel != 12 && mapLevel != 14) {
      _this.currentGrids.forEach(function (feature) {
        var _color = _this.rgbaColor[feature.get('level')];
        var num = feature.get('num') + '';
        var textFill = new com.jiusuo.map.style.TFill({
          color: 'white'
        });
        var textStroke = new com.jiusuo.map.style.TStroke({
          color: 'black',
          width: 3
        });
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          }),
          text: new com.jiusuo.map.style.TText({
            text: num,
            font: '16px sans-serif',
            fill: textFill,
            stroke: textStroke
          })
        });
        feature.setStyle(style);
      });
    } else {
      _this.currentGrids.forEach(function (feature) {
        var _color = _this.rgbaColor[feature.get('level')];
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          })
        });
        feature.setStyle(style);
      });
    }
  };
  this.changeAlpha = function (value) {
    _this.colorAlpha = parseFloat(value);
    if (_this.currentGrids == null) {
      return;
    }
    var mapLevel = tMap.getOMap().getView().getZoom();
    if (_this.isShowNum && mapLevel != 9 && mapLevel != 10 && mapLevel != 12 && mapLevel != 14) {
      _this.currentGrids.forEach(function (feature) {
        var _color = _this.rgbaColor[feature.get('level')];
        var num = feature.get('num') + '';
        var textFill = new com.jiusuo.map.style.TFill({
          color: 'white'
        });
        var textStroke = new com.jiusuo.map.style.TStroke({
          color: 'black',
          width: 3
        });
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          }),
          text: new com.jiusuo.map.style.TText({
            text: num,
            font: '16px sans-serif',
            fill: textFill,
            stroke: textStroke
          })
        });
        feature.setStyle(style);
      });
    } else {
      _this.currentGrids.forEach(function (feature) {
        var _color = _this.rgbaColor[feature.get('level')];
        style = new com.jiusuo.map.style.TStyle({
          fill: new com.jiusuo.map.style.TFill({
            color: 'rgba(' + _color[0] + ', ' + _color[1] + ', ' + _color[2] + ', ' + _this.colorAlpha + ')'
          }),
          stroke: new com.jiusuo.map.style.TStroke({
            color: 'rgba(255, 180, 0, ' + _this.colorAlpha + ')',
            // color: 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 1)',
            width: 0.5
          })
        });
        feature.setStyle(style);
      });
    }
  };
}
/**
 * @类名：网格调整控件
 * @参数：{Object=} opt_options Control options.
 * @用途：控制网格的色带、透明度、是否显示数组、是否开启右键
 */
com.jiusuo.map.TGeoGridADControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  this.colorIndex = this._tMap.currentGeohashInitProperties.colorIndex || 0;
  this.colorAlpha = this._tMap.currentGeohashInitProperties.colorAlpha || 0.8;
  this.isShowNum = this._tMap.currentGeohashInitProperties.isShowNum || false;
  this.isRightMenu = this._tMap.currentGeohashInitProperties.isRightMenu || false;
  this.rightMenuItems = this._tMap.currentGeohashInitProperties.rightMenuItems || [];

  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '网格调整';
  var geohash = this._tMap.currentGeohash;
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon11_43.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon22_43.png' width='36px' height='36px' class='img2'></div>"
    + "</div>"
    + "<div class='triangle'></div>"
    + "<div class='set_pop set_pop1 set_pop_right8'>"
    + "<div class='margin'>"
    + "<div class='title'>网格调整</div>"
    + "<div class='net'></div>"
    + "<div class='wrap'>"
    + "<label class='left2'>颜色：</label>"
    + "<label class='label'>"
    + "<input type='radio' name='gridcolor' value='0'>红黄绿"
    + "</label>"
    + "<label class='label'>"
    + "<input type='radio' name='gridcolor' value='1'>红黄"
    + "</label>"
    + "<label class='label'>"
    + "<input type='radio' name='gridcolor' value='2'>蓝"
    + "</label>"
    + "</div>"
    + "<div class='wrap'>"
    + "<label class='left2'>透明：</label>"
    + "<input type='range' name='c' class='range' id='" + controlContainer + "_alphaSilder' min='0' max='1' step='0.1'>"
    + "</div>"
    + "<div class='wrap'>"
    + "<label class='left2'>数字：</label>"
    + "<label id='" + controlContainer + "_gridnum_s' class='open_radio'><span class='on'>ON</span><span class='off'>OFF</span>"
    + "<div class='circle'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_pop_68_28.png' width='24' height='24'></div>"
    + "<input type='radio' name='gridnum'>"
    + "</label>"
    + "</div>"
    + "<div class='wrap'>"
    + "<label class='left2'>右键：</label>"
    + "<label id='" + controlContainer + "_gridright_s' class='open_radio open_radio_close'><span class='on'>ON</span><span class='off'>OFF</span>"
    + "<div class='circle'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_pop_68_28.png' width='24' height='24'></div>"
    + "<input type='radio' name='gridright'>"
    + "</label>"
    + "</div>"
    + "</div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  if (_this.colorIndex == 0) {
    $('input[name=gridcolor]:eq(0)').attr('checked', 'checked');
  } else if (_this.colorIndex == 1) {
    $('input[name=gridcolor]:eq(1)').attr('checked', 'checked');
  } else {
    $('input[name=gridcolor]:eq(2)').attr('checked', 'checked');
  }
  $('#' + controlContainer + '_alphaSilder').val(_this.colorAlpha);

  if (_this.isShowNum) {
    $('#' + controlContainer + '_gridnum_s').addClass('open_radio_close');
  } else {
    $('#' + controlContainer + '_gridnum_s').removeClass('open_radio_close');
  }
  if (_this.isRightMenu) {
    $('#' + controlContainer + '_gridright_s').addClass('open_radio_close');
    var bFunction = function (feature) {
      return _this.rightMenuItems;
    };
    com.jiusuo.map.TEpMenu.init(bFunction);
  } else {
    $('#' + controlContainer + '_gridright_s').removeClass('open_radio_close');
  }
  $("input:radio[name='gridcolor']").change(function () {
    var value = $("input:radio[name='gridcolor']:checked").val();
    geohash.changeColor(parseInt(value));
  });
  $('#' + controlContainer + '_gridnum_s').on('click', function (evt) {
    if ($('#' + controlContainer + '_gridnum_s').hasClass('open_radio_close')) {
      geohash.ShowNumSwape(false);
      $('#' + controlContainer + '_gridnum_s').removeClass('open_radio_close');
    } else {
      geohash.ShowNumSwape(true);
      $('#' + controlContainer + '_gridnum_s').addClass('open_radio_close');
    }
  });
  $('#' + controlContainer + '_alphaSilder').change(function () {
    geohash.changeAlpha($('#' + controlContainer + '_alphaSilder').val());
  });
  $('#' + controlContainer + '_gridright_s').on('click', function (evt) {
    if ($('#' + controlContainer + '_gridright_s').hasClass('open_radio_close')) {
      com.jiusuo.map.TEpMenu.destroy();
      $('#' + controlContainer + '_gridright_s').removeClass('open_radio_close');
    } else {
      var bFunction = function (feature) {
        return _this.rightMenuItems;
      };
      com.jiusuo.map.TEpMenu.init(bFunction);
      $('#' + controlContainer + '_gridright_s').addClass('open_radio_close');
    }
  });
};
/**
 * @类名：右键菜单
 * @用途：地图右键菜单
 */
com.jiusuo.map.TEpMenu = {
  init: function (buttonsFunction, tMap) {
    if (tMap == null) {
      tMap = com.jiusuo.map.tMap;
    }
    window.rightMenuStatus = true;
    var viewport = tMap.getOMap().getTargetElement();
    viewport.oncontextmenu = function (event) {
      // document.oncontextmenu = function (event) {
      event = event || window.event;
      var featureEvt = tMap.getOMap().forEachFeatureAtPixel(tMap.getOMap().getEventPixel(event),
        function (featureEvt) {
          return featureEvt;
        });
      var point = {left: event.clientX, top: event.clientY};
      tMap.getOMap().renderSync();
      // var coor = tMap.getOMap().getCoordinateFromPixel([point.left,point.top]);
      var coor = tMap.getOMap().getEventCoordinate(event);
      var MousePointF = new ol.Feature();
      MousePointF.setGeometry(new ol.geom.Point(coor));
      if (featureEvt == null) {
        featureEvt = new ol.Feature();
        featureEvt.setGeometry(new ol.geom.Point(coor));
      }
      com.jiusuo.map.TEpMenu.create(point, buttonsFunction, featureEvt, MousePointF, tMap);
      this.onclick = function () {
        setTimeout(function () {
          $("#epMenu").remove();
        }, 100);
        this.onclick = null;
      }
      return false;
    }
  },
  create: function (point, buttonsFunction, featureEvt, MousePointF, tMap) {

    var controlContainer = tMap.getOMap().getTargetElement().id;

    var option = buttonsFunction(featureEvt);
    //如果周边搜索框还存在，则不弹出右键菜单
    if ($('#idForNearBySearch')[0]) {
      return;
    }
    var menuNode = $('#epMenu')[0];
    if (!menuNode) {

      var html = '<div class="set_pop set_pop_right_click" id="epMenu">'
        + '<div class="margin" id="idForEpmenuNode">'
        + '</div>'
        + '</div>';
      menuNode = $(html);
    } else {
      menuNode.remove();//清空里面的内容
      return;
    }
    menuNode.css({left: point.left + 'px', top: point.top + 'px'});
    //$(menuNode).css({left:point.left+'px',top:point.top+'px'});
    option.forEach(function (x, i) {
      var tempNode = $(' <div class="word" style="text-align: left;padding-left: 5px;">' + x.name + '</div>');
      var clickHandler = function (e) {
        if (x.action) {
          com.jiusuo.map.TEpMenu.remove();
          x.action(featureEvt, MousePointF, point, tMap);
        }
      };
      tempNode.text(x['name']).on('click', clickHandler);
      menuNode.find("#idForEpmenuNode").append(tempNode);
      if (i == option.length - 1) {
        var cancelNode = $('<div class="word" style="text-align: left;padding-left: 5px;">取消</div>');
        var _clickHandler = function (e) {
          $('#epMenu').remove();
        };
        cancelNode.on('click', _clickHandler);
        menuNode.find("#idForEpmenuNode").append(cancelNode);
      }
    });
    $("body").append(menuNode);
    menuNode.show();
    //设置右键菜单位置start
    var divHeight = $('#idForEpmenuNode').height();
    var divWidth = $('#idForEpmenuNode').width();
    var canVastop = $('#' + controlContainer).find('canvas').height() + $('#' + controlContainer).find('canvas').offset().top;
    var canVasLeft = $('#' + controlContainer).find('canvas').width() + $('#' + controlContainer).find('canvas').offset().left;


    var left = point.left;
    var top = point.top;
    if (left >= canVasLeft) {
      left = left - divWidth;
    } else if (left + divWidth > canVasLeft) {
      left = canVasLeft - divWidth;
    }
    if (top <= 10) {
      top = top + divWidth;
    } else if (top + divHeight > canVastop) {
      top = canVastop - divWidth;
    }
    menuNode.css({'left': left, "top": top});
    //end
  },
  destroy: function (tMap) {
    if (tMap == null) {
      tMap = com.jiusuo.map.tMap;
    }
    $("#epMenu").remove();
    window.rightMenuStatus = false;
    var viewport = tMap.getOMap().getTargetElement();
    viewport.oncontextmenu = function (event) {
      return true;
    }
  },
  remove: function () {
    $("#epMenu").remove();
  },
  rightMenuForNearby: function (feature, MousePointF, point, tMap) {
    $('#epMenu').hide();
    var option = {};
    option.tMap = tMap;
    option.event = point;
    com.jiusuo.map.TSearchControlForRadius(option);
    var tSpaceSearch = new com.jiusuo.map.TSpaceSearch(tMap);
    tSpaceSearch.setFeatureForNearBy(MousePointF);
  },
  showNearCgis: function (featureEvt, MousePointF, point, tMap) {
    var tEsQuery = new com.jiusuo.map.TEsQuery(tMap);
    var idArr = [];
    if (tMap.cgiDragBoxFeatures && tMap.cgiDragBoxFeatures.length) {
      tMap.cgiDragBoxFeatures.forEach(function (f) {
        var entityObject = f.get('entityObject');
        var nearCgis = JSON.parse(entityObject.desc).near_cgis;
        if (nearCgis) {
          nearCgis = nearCgis.split(',');
          nearCgis.forEach(function (item) {
            var id = "460-0" + item;
            if (item.substring(0, 1) == "1") {
              id = "460-00" + item.substring(1, item.length);
            } else if (item.substring(0, 1) == "2") {
              id = "460-01" + item.substring(1, item.length);
            } else {

            }
            var has = false;
            idArr.forEach(function (_id) {
              if (_id == id) {
                has = true;
              }
            });
            if (!has) {
              idArr.push(id);
            }
          })
        }
      });
    }
    var ids = "";
    idArr.forEach(function (id) {
      ids += "," + id;
    });
    ids = ids.substring(1, ids.length);
    if (ids == "") {
      var d = dialog({
        title: '提示',
        content: '请先选择基站！'
      });
      d.showModal();
      return;
    }

    var callback = function (esJsonObjects, map) {
      map.removeWaitingModel();
      var projection = map.getProjection().getCode();
      if (esJsonObjects.length > 0) {
        esJsonObjects.forEach(function (item) {
          var sprinkle_features = [];
          item.rec.forEach(function (dataObject) {
            dataObject = JSON.parse(dataObject);
            var desc = JSON.parse(dataObject.desc);
            var mobile_carrier = dataObject.mobile_carrier;
            var network = desc.network;
            var iconType = mobile_carrier + "_" + network;
            if (dataObject.location != null && dataObject.location.coordinates != null) {
              var coordinates = dataObject.location.coordinates;
              var coorsys = dataObject.coorsys;
              switch (mobile_carrier) {
                case 1:
                  mobile_carrier = "中国移动";
                  break;
                case 2:
                  mobile_carrier = "中国联通";
                  break;
                case 3:
                  mobile_carrier = "中国电信";
                  break;
                default:
                  mobile_carrier = "";
              }
              var pContent = '<div class="cgi_content"><p>类型：基站</p>' +
                '<p>标识：' + dataObject.id + '</p>' +
                '<p>名称：' + (dataObject.name || "无") + '</p>' +
                '<p>地址：' + (dataObject.address || "无") + '</p>' +
                '<p>运营商：' + mobile_carrier + '</p>' +
                '<p>网络制式：  ' + desc.network + 'G   </p>' +
                '<p>运营商坐标：' + dataObject.longitude + ',' + dataObject.latitude + '</p>' +
                '<p>LBS预测坐标：' + dataObject.longitude + ',' + dataObject.latitude + '</p>' +
                '<p>邻基站预测坐标：' + dataObject.longitude + ',' + dataObject.latitude + '</p>' +
                '</div>';
              if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
              }
              if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
              }
              sprinkle_features.push({
                'type': 'Feature',
                'geometry': {'type': 'Point', 'coordinates': coordinates},
                'properties': {
                  'id': 'cgi' + dataObject.id,
                  iconType: iconType,
                  'showFields': null,
                  'callback': null,
                  'innerHTML': pContent
                }
              });
            }
          });
          var geoJson_sprinkle = {
            'type': 'FeatureCollection',
            'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
            'features': sprinkle_features
          };
          var features = function () {
            try {
              return (new ol.format.GeoJSON()).readFeatures(geoJson_sprinkle, {
                dataProjection: 'EPSG:4326',
                featureProjection: projection
              });
            } catch (ex) {
              return null;
            }
          }();
          tMap.cgiCoverageFeatures = tMap.cgiCoverageFeatures.concat(features);
          var selectcgilayer = map.getVectorLayer('selectcgiVector');
          if (features.length > 0) {
            features.forEach(function (feature) {
              feature.setId(feature.get('id'));
              selectcgilayer.getSource().addFeature(feature);
            });
          }
        });
      }
    }
    tMap.addWaitingModel();
    tEsQuery.queryBaseSources("", "cgi", ids, callback);
  },
  showCgiCoverage: function (featureEvt, MousePointF, point, tMap) {
    var tEsQuery = new com.jiusuo.map.TEsQuery(tMap);
    var idArr = [];
    if (tMap.cgiDragBoxFeatures && tMap.cgiDragBoxFeatures.length) {
      tMap.cgiDragBoxFeatures.forEach(function (f) {
        var entityObject = f.get('entityObject');
        var has = false;
        idArr.forEach(function (id) {
          if (id == entityObject.id) {
            has = true;
          }
        });
        if (!has) {
          idArr.push(entityObject.id);
        }
      });
    }
    var ids = "";
    idArr.forEach(function (id) {
      ids += "," + id;
    });
    ids = ids.substring(1, ids.length);
    if (ids == "") {
      var d = dialog({
        title: '提示',
        content: '请先选择基站！'
      });
      d.showModal();
      return;
    }
    var callback = function (esJsonObjects, map) {
      map.removeWaitingModel();
      var projection = map.getProjection().getCode();
      if (esJsonObjects.length > 0) {
        esJsonObjects.forEach(function (item) {
          var layerType = item.type;
          var geoType = 'point';
          var sprinkle_features = [];
          item.rec.forEach(function (data) {
            var dataObject = JSON.parse(data);
            if (dataObject.location != null && dataObject.location.coordinates != null) {
              var coordinates = dataObject.location.coordinates;
              var coorsys = dataObject.coorsys;
              geoType = dataObject.location.type;
              if (geoType == 'polygon') {
                if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                  coordinates = [com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(coordinates[0])];
                }
                if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                  coordinates = [com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(coordinates[0])];
                }
                sprinkle_features.push({
                  'type': 'Feature',
                  'geometry': {'type': 'Polygon', 'coordinates': coordinates},
                  'properties': {'id': "coverage" + dataObject.id}
                });
              }
              ;
            }
          });
          var geoJson_sprinkle = {
            'type': 'FeatureCollection',
            'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
            'features': sprinkle_features
          };
          var features = function () {
            try {
              return (new ol.format.GeoJSON()).readFeatures(geoJson_sprinkle, {
                dataProjection: 'EPSG:4326',
                featureProjection: projection
              });
            } catch (ex) {
              return null;
            }
          }();
          tMap.cgiCoverageFeatures = tMap.cgiCoverageFeatures.concat(features);
          var baseVectorLayer = map.getVectorLayer('coverageVector');
          if (features.length > 0) {
            features.forEach(function (feature) {
              feature.setId(feature.get('id'));
              baseVectorLayer.getSource().addFeature(feature);
            });
          }
        });
      }
    }
    tMap.addWaitingModel();
    tEsQuery.queryBaseSources("", "cgi_coverage", ids, callback);
  },
  removeCgiCoverage: function (featureEvt, MousePointF, point, tMap) {
    if (tMap.cgiCoverageFeatures && tMap.cgiCoverageFeatures.length) {
      tMap.cgiCoverageFeatures.forEach(function (f) {
        try {
          tMap.getVectorLayer('selectcgiVector').getSource().removeFeature(f);
        } catch (e) {

        }
        try {
          tMap.getVectorLayer('coverageVector').getSource().removeFeature(f);
        } catch (e) {

        }
      });
      tMap.cgiCoverageFeatures = [];
      tMap.cgiDragBoxFeatures = [];
    }
  },
  clearSelected: function (featureEvt, MousePointF, point, tMap) {
    if (tMap.cgiDragBoxFeatures && tMap.cgiDragBoxFeatures.length) {
      tMap.cgiDragBoxFeatures.forEach(function (f) {
        f.setStyle(tMap.cgiOldStyle);
      });
      tMap.cgiDragBoxFeatures = [];
    }
  },
  rightMenuForNearbyChangeColor: function (featureEvt, featrue, e) {
    var leftNvgDiv = $("#idRightMenuForNearbyChangeColor")[0];
    if (!leftNvgDiv) {
      leftNvgDiv = $('<div class="picker" id="idRightMenuForNearbyChangeColor"></div>');
      com.jiusuo.map.tMap.getOMap().getTargetElement().appendChild(leftNvgDiv[0]);
      $('.picker').colpick({
        flat: false,
        layout: 'hex',
        submit: 0,
        onChange: function (hsb, hex, rgb, el, bySetColor) {
          $(el).closest('.title2').css('color', '#' + hex);
          setFeatureColor(hex);
        }
      });
    }
    //设置选中区域原色start
    var setFeatureColor = function (hex) {
      var colorValue = "";
      var id = $('.picker').attr("featureId");
      if (id) {
        var color = $('.colpick_new_color').css("background-color");
        var left = color.indexOf('(');
        var right = color.indexOf(')');
        color = color.substr(left + 1, right - left - 1);
        var tempFeature = com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource().getFeatureById(id);
        var style = tempFeature.getStyle();
        colorValue = 'rgba(' + color + ',0.6)';
        var style = tempFeature.getStyle();
        colorValue = 'rgba(' + color + ',0.6)';
        if (style == null) {
          style = new com.jiusuo.map.style.TStyle();
        }
        var fill = new com.jiusuo.map.style.TFill({color: colorValue});
        style['c'] = fill;
        tempFeature.setStyle(style);
      }
    };
    //end
    if (featureEvt) {
      $('#epMenu').hide();
      var id = featureEvt.getId() || com.jiusuo.map.TUtils.createGUID();
      featureEvt.setId(id);
      $('.picker').trigger('click');
      $('.picker').attr("featureId", featureEvt.getId());
      $('.colpick').css({'left': e.left, "top": e.top});
    }
  }
};
/**
 * @类名：业务数据图层控件
 * @参数：{Object=} opt_options Control options.
 * @用途：用于控制基站、基站覆盖范围、伪基站、lac覆盖范围、摄像头、卡口、案件图层的展示以及个性化功能
 */
com.jiusuo.map.TEsBaseLayerControl = function (opt_options) {
  var _this = this;

  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '数据图层';
  var zoomFlag = options.zoomFlag || false;
  this.queryInfo = [];
  this.querySourceType = [];
  this.queryResult = null;
  var tEsQuery = new com.jiusuo.map.TEsQuery();
  _this.queryInfo = tEsQuery.baseDataLayerSources;
  var html = "<div class='list'>"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_45.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_45.png' width='36px' height='36px' class='img2'></div>"
    + "        </div>"
    + "          <div class='triangle'></div>"
    + "          <div class='set_pop set_pop6 set_pop_right8'>"
    + "            <div class='margin'>"
    + "              <div class='title'>数据图层</div>"
    + "              <div class='net'></div>"
    + "              <div class='wrap wrap2' id='datalayers'  style='height:175px;overflow-y: auto'>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);

  var cgiStyleFunction = function (feature) {
    var iconType = feature.get('iconType');
    var zoom = com.jiusuo.map.tMap.getOMap().getView().getZoom();
    var scale = 1;
    if (zoom <= 16) {
      scale = 0.7;
    } else {
      scale = 1;
    }
    if (iconType) {
      //var desc=
      var style = new com.jiusuo.map.style.TStyle({
        image: new com.jiusuo.map.style.TIcon({
          anchor: [0.5, 1],
          scale: scale,
          src: com.jiusuo.map.webUrl + '/static/mark/' + iconType + '.png'
        })
      });
      return style;
    }
  }
  // var cgi_SelectedStyleFunction=function (feature) {
  //     var iconType=feature.get('iconType');
  //     if(iconType){
  //         //var desc=
  //         var style = new com.jiusuo.map.style.TStyle({
  //             image: new com.jiusuo.map.style.TIcon({
  //                 anchor: [0.5, 1],
  //                 src: com.jiusuo.map.webUrl + '/static/mark/'+iconType+'_selected.png'
  //             })
  //         });
  //         return style;
  //     }
  // }
  // var selectedLayer=_this._tMap.getVectorLayer("selectcgiVector");
  // selectedLayer.setStyle(cgi_SelectedStyleFunction);
  for (var i = _this.queryInfo.length - 1; i >= 0; i--) {
    var item = _this.queryInfo[i];
    var type = item.type;
    var layerName = item.name;
    if (type == 'cgi') {
      var cgilayerDiv = $('<div id="cgiTypediv" style="margin-left: 20px;display: none;">' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="1_2">移动2G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="1_3">移动3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="1_4">移动4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="2_2">联通2G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="2_3">联通3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="2_4">联通4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="3_3">电信3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgibaselayer" value="3_4">电信4G</label><br>' +
        '</div>');
      $('#datalayers').prepend(cgilayerDiv);
    }
    if (type == 'cgi_coverage') {
      var cgi_coveragelayerDiv = $('<div id="cgi_coverageTypediv" style="margin-left: 20px;display: none;">' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="1_2">移动2G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="1_3">移动3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="1_4">移动4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="2_2">联通2G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="2_3">联通3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="2_4">联通4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="3_3">电信3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="cgi_coveragebaselayer" value="3_4">电信4G</label><br>' +
        '</div>');
      $('#datalayers').prepend(cgi_coveragelayerDiv);
    }
    if (type == 'lac') {
      var laclayerDiv = $('<div id="lacTypediv" style="margin-left: 20px;display: none;">' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="1_3">移动3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="1_4">移动4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="2_3">联通3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="2_4">联通4G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="3_3">电信3G</label><br>' +
        '<label class="label2 label""><input type="checkbox"  name="lacbaselayer" value="3_4">电信4G</label><br>' +
        '</div>');
      $('#datalayers').prepend(laclayerDiv);
    }
    var layerID = "es-baselayer-" + type;
    var layerhtml = "                <label class='label2 label'>"
      + "                  <input type='checkbox' name='datalayer' id='" + type + "' value='" + type + "'>" + layerName
      + "                </label><br>";
    var layerdiv = $(layerhtml);
    $('#datalayers').prepend(layerdiv);
    var sprinkleLayer = new com.jiusuo.map.TSprinkleLayer({geoJson: {features: []}, id: layerID});
    if (type == "cgi") {
      sprinkleLayer.setStyle(cgiStyleFunction);
    }
    _this._tMap.addSprinkleLayer(sprinkleLayer);
  }

  _this.queryInfo.forEach(function (item) {
    var type = item.type;
    $("#" + type).change(function (value) {
      if (type == 'cgi') {
        $('#cgiTypediv').toggle();
        $('input:checkbox[name=cgibaselayer]').prop('checked', true);
      }
      if (type == 'cgi_coverage') {
        $('#cgi_coverageTypediv').toggle();
        $('input:checkbox[name=cgi_coveragebaselayer]').prop('checked', true);
      }
      if (type == 'lac') {
        $('#lacTypediv').toggle();
        $('input:checkbox[name=lacbaselayer]').prop('checked', true);
      }
      var value = $("#" + type).val();
      if (zoomFlag) {
        var view = _this._tMap.getOMap().getView();
        view.setZoom(15);
        //view.setCenter(view.getCenter());

      }

      com.jiusuo.map.TEsBaseLayerControl.handleSwape(value, _this._tMap);
    });
  });

  var tempCgiCount = 0;
  var tempCgi_coverageCount = 0;
  var tempLacCount = 0;
  $('input:checkbox[name=cgibaselayer]').change(function () {

    //com.jiusuo.map.TEsBaseLayerControl.handleSwape("cgi", _this._tMap);
    if ($('input:checkbox[name=cgibaselayer]:checked').length == 1 && tempCgiCount == 0) {
      com.jiusuo.map.TEsBaseLayerControl.handleSwape("cgi", _this._tMap);
    } else {
      var map = _this._tMap.getOMap();
      if (_this.queryResult && map.getView().getZoom() > 14) {
        baseLayerCallback(_this.queryResult, _this._tMap);
      }
    }
    tempCgiCount = $('input:checkbox[name=cgibaselayer]:checked').length;
  })
  $('input:checkbox[name=cgi_coveragebaselayer]').change(function () {
    //com.jiusuo.map.TEsBaseLayerControl.handleSwape("cgi_coverage", _this._tMap);
    if ($('input:checkbox[name=cgi_coveragebaselayer]:checked').length == 1 && tempCgi_coverageCount == 0) {
      com.jiusuo.map.TEsBaseLayerControl.handleSwape("cgi_coverage", _this._tMap);
    } else {
      var map = _this._tMap.getOMap();
      if (_this.queryResult && map.getView().getZoom() > 14) {
        baseLayerCallback(_this.queryResult, _this._tMap);
      }
    }
    tempCgi_coverageCount = $('input:checkbox[name=cgi_coveragebaselayer]:checked').length;
  })
  $('input:checkbox[name=lacbaselayer]').change(function () {
    //com.jiusuo.map.TEsBaseLayerControl.handleSwape("lac", _this._tMap);
    if ($('input:checkbox[name=lacbaselayer]:checked').length == 1 && tempLacCount == 0) {
      com.jiusuo.map.TEsBaseLayerControl.handleSwape("lac", _this._tMap);
    } else {
      if (_this.queryResult) {
        baseLayerCallback(_this.queryResult, _this._tMap);
      }
    }
    tempLacCount = $('input:checkbox[name=lacbaselayer]:checked').length;
  })
  this.queryFunction = function () {
    var map = _this._tMap.getOMap();
    var flag = false;
    var length = _this._tMap.esBaseLayerControl.querySourceType.length;
    while (length--) {
      if (_this._tMap.esBaseLayerControl.querySourceType[length] == "lac") {
        flag = true;
        break;
      }
    }
    if (_this.querySourceType.length > 0 && map.getView().getZoom() > 3) {
      var _querySourceType = "";
      if (flag && map.getView().getZoom() < 15 && $('input:checkbox[name=lacbaselayer]:checked').length > 0) {
        _querySourceType = "lac,";
      } else if (map.getView().getZoom() > 14) {
        if ($('input:checkbox[name=cgibaselayer]:checked').length < 1) {
          arrayRemove(_this.querySourceType, 'cgi');
        }
        if ($('input:checkbox[name=cgi_coveragebaselayer]:checked').length < 1) {
          arrayRemove(_this.querySourceType, 'cgi_coverage');
        }
        if ($('input:checkbox[name=lacbaselayer]:checked').length < 1) {
          arrayRemove(_this.querySourceType, 'lac');
        }
        _querySourceType = _this.querySourceType.join(",");
      }
      if (_querySourceType != "") {
        var size = map.getSize();
        var extent = map.getView().calculateExtent(size);
        var polygon = ol.geom.Polygon.fromExtent(extent);
        var otherGeoJson = com.jiusuo.map.TGeometryUtils._toGeoJsonString(polygon);
        otherGeoJson = JSON.stringify(otherGeoJson);
        _this._tMap.addWaitingModel();
        tEsQuery.queryBaseSources(otherGeoJson, _querySourceType, null, baseLayerCallback);
      } else {
        clearBaseSprinkleLayer(_this._tMap);
      }
    } else {
      clearBaseSprinkleLayer(_this._tMap);
    }
  };
  var arrayRemove = function (array, value) {
    var index = -1;
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      array.splice(index, 1);
    }
  }
//异步加载
  var baseLayerCallback = function (esJsonObjects, map) {
    map.removeWaitingModel();
    _this.queryResult = esJsonObjects;
    var projection = map.getProjection().getCode();
    if (esJsonObjects.length > 0) {
      clearBaseSprinkleLayer(map);
      esJsonObjects.forEach(function (item) {
        var layerType = item.type;
        var geoType = 'point';
        var sprinkle_features = [];
        var callback = null;
        if (layerType == 'camera') {
          callback = function (feature) {
            if (feature) {
              var entityObject = feature.get('entityObject');
              var desc = JSON.parse(entityObject.desc);
              var snatshotpath = map.tMapServiceConfig.vedioServer.snatshotpath;
              var manu = map.tMapServiceConfig.vedioServer.manu;
              var domainid = desc.videoserverid;
              var puid = desc.deviceno + '@' + manu;
              var channelid = desc.channelid;
              var x = entityObject.location.coordinates[0].toFixed(6);
              var y = entityObject.location.coordinates[1].toFixed(6);

              var popupElement = $('<div id="videoContain"></div>');
              var pContent = $('<p>类型：摄像头</p>' +
                '<p>名称：' + (entityObject.name || "无") + '</p>' +
                '<p>地址：' + (entityObject.address || "无") + '</p>' +
                '<p style="white-space: nowrap;">经纬度：' + x + ',' + y + '</p>');
              var playBtn = $('<button class="vedio_button">播放</button>');
              if (typeof(videoPluginObject) == 'undefined') {
                playBtn.hide();
              }
              playBtn.on('click', function () {
                $('.video_box').width("600px");
                $('.video_box').height("400px");
                $('#videotitle').text((feature.get('name') || "无"));
                $('.set_pop_video .video_center').height("310px");
                $('.video_control').show();
                if ($('#videocacaca').html() == "") {
                  $('#videocacaca').html($('.video_box'));
                }
                if (typeof(videoPluginObject) != 'undefined') {
                  video_handler = new com.jiusuo.map.TVideo.videoPlayHandle(videoPluginObject, domainid, puid, channelid, manu, snatshotpath);
                  video_handler.mystart();
                }
              })
              popupElement.append(pContent);
              popupElement.append(playBtn);
              return popupElement[0];
            }
          }
        } else if (layerType == 'cgi') {
          callback = function (feature) {
            if (feature) {
              var entityObject = feature.get('entityObject');
              var desc = JSON.parse(entityObject.desc);
              var mobile_carrier = entityObject.mobile_carrier;
              var baseVectorLayer = _this._tMap.getVectorLayer('baseVector');
              var selectcgilayer = _this._tMap.getVectorLayer('selectcgiVector');
              var coverageVectorLayer = _this._tMap.getVectorLayer('coverageVector');
              var style = null;
              if (com.jiusuo.map.iconStyle == 'r_') {
                style = new com.jiusuo.map.style.TStyle({
                  image: new com.jiusuo.map.style.TIcon({
                    anchor: [0.5, 1],
                    src: com.jiusuo.map.webUrl + '/static/mark/b_cgi.png'
                  })
                });
              } else {
                style = new com.jiusuo.map.style.TStyle({
                  image: new com.jiusuo.map.style.TIcon({
                    anchor: [0.5, 1],
                    src: com.jiusuo.map.webUrl + '/static/mark/r_cgi.png'
                  })
                });
              }
              var featureclone = feature.clone();
              map.cgiCoverageFeatures.push(featureclone);
              selectcgilayer.getSource().addFeature(featureclone);
              //featureclone.setStyle(style);
              switch (mobile_carrier) {
                case 1:
                  mobile_carrier = "中国移动";
                  break;
                case 2:
                  mobile_carrier = "中国联通";
                  break;
                case 3:
                  mobile_carrier = "中国电信";
                  break;
                default:
                  mobile_carrier = "";
              }
              var coorsys = entityObject.coorsys;
              var pContent = $('<div class="cgi_content"><p>类型：基站 ' + mobile_carrier + ' ' + desc.network + 'G</p>' +
                '<p>标识：' + entityObject.id + '</p>' +
                '<p>名称：' + (entityObject.name || "无") + '</p>' +
                '<p>地址：' + (entityObject.address || "无") + '</p>' +
                // '<p>运营商：' + mobile_carrier + '</p>' +
                // '<p>网络制式：  ' + desc.network + 'G   </p>' +
                '<p>首次统计时间：' + (desc.first_date || '无') + '</p>' +
                '<p>最新统计时间：' + (desc.last_date || '无') + '</p>' +
                '<div id="CGI_SP" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.sp_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>运营商坐标：' + (desc.sp_longitude || "无") + ',' + (desc.sp_latitude || "无") + '</label></div>' +
                '<div id="CGI_LBS" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.lbs_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>LBS预测坐标：' + (desc.lbs_longitude || "无") + ',' + (desc.lbs_latitude || "无") + '</label></div>' +
                '<div id="CGI_NEAR" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.near_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>邻基站预测坐标：' + (desc.near_longitude || "无") + ',' + (desc.near_latitude || "无") + '</label></div>' +
                '<input type="button" class="buttonstyle" id="getCGICoverage" value="显示基站范围">' +
                '<input type="button" class="buttonstyle" id="getNearByCGI" value="获取邻近基站">' +
                '</div>');
              var repairType = desc.repair_type;
              switch (repairType) {
                case "0":
                  pContent.find('#CGI_SP').children().first().attr('disabled', true);
                  pContent.find('#CGI_SP').children().last().addClass('underline');
                  break;
                case "1":
                  pContent.find('#CGI_SP').children().first().attr('disabled', true);
                  pContent.find('#CGI_SP').children().last().addClass('underline');
                  break;
                case "2":
                  pContent.find('#CGI_LBS').children().first().attr('disabled', true);
                  pContent.find('#CGI_LBS').children().last().addClass('underline');
                  break;
                case "3":
                  pContent.find('#CGI_NEAR').children().first().attr('disabled', true);
                  pContent.find('#CGI_NEAR').children().last().addClass('underline');
                  break;
              }
              pContent.find('div[name=CGI_Type]').each(function (item) {
                var id = $(this).attr('id') + entityObject.id;
                var feature = selectcgilayer.getSource().getFeatureById(id);
                if (feature) {
                  $(this).children().first().attr('checked', 'checked');
                }
              });
              if (coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id)) {
                pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
              } else {
                pContent.find('#getCGICoverage').attr("value", "显示基站范围");
              }
              pContent.find('input:checkbox').on('change', function (evt) {
                var id = $(evt.target).parent().attr('id') + entityObject.id;
                var type = "";
                switch (id.substring(0, 5)) {
                  case "CGI_S":
                    type = "sp_";
                    break;
                  case "CGI_L":
                    type = "lbs_";
                    break;
                  case "CGI_N":
                    type = "near_";
                    break;
                  default:
                    type = "";
                }
                var lon = desc[type + "longitude"];
                var lat = desc[type + "latitude"];
                var feature = selectcgilayer.getSource().getFeatureById(id);
                if (feature) {
                  selectcgilayer.getSource().removeFeature(feature)
                } else {

                  var coordinates = [lon, lat];
                  if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                    coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
                  }
                  if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                    coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
                  }
                  coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, "EPSG:4326", projection);
                  var feature = new ol.Feature(new ol.geom.Point(coordinates));
                  map.cgiCoverageFeatures.push(feature);
                  feature.setId(id);
                  feature.setStyle(style);
                  selectcgilayer.getSource().addFeature(feature);
                }
              })
              pContent.find('#getCGICoverage').on('click', function () {
                try {
                  var feature = coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id);
                  if (feature) {
                    coverageVectorLayer.getSource().removeFeature(feature);
                    pContent.find('#getCGICoverage').attr("value", "显示基站范围");
                  } else {
                    _this._tMap.addWaitingModel();
                    tEsQuery.queryBaseSources("", "cgi_coverage", entityObject.id, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
                    pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
                  }
                } catch (ex) {
                }
              });
              pContent.find('#getNearByCGI').on('click', function () {

                var nearCgis = JSON.parse(entityObject.desc).near_cgis;
                var idArr = [];
                if (nearCgis) {
                  nearCgis = nearCgis.split(',');
                  nearCgis.forEach(function (item) {
                    var id = "460-0" + item;
                    if (item.substring(0, 1) == "1") {
                      id = "460-00" + item.substring(1, item.length);
                    } else if (item.substring(0, 1) == "2") {
                      id = "460-01" + item.substring(1, item.length);
                    } else {

                    }
                    var has = false;
                    idArr.forEach(function (_id) {
                      if (_id == id) {
                        has = true;
                      }
                    });
                    if (!has) {
                      idArr.push(id);
                    }
                  })
                }
                var ids = "";
                idArr.forEach(function (id) {
                  ids += "," + id;
                });
                ids = ids.substring(1, ids.length);
                if (ids != "") {
                  _this._tMap.addWaitingModel();
                  tEsQuery.queryBaseSources("", "cgi", ids, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
                }
              });
              return pContent[0];
            }
          }
        } else if (layerType == 'case') {
          callback = function (feature) {
            if (feature) {
              var entityObject = feature.get('entityObject');
              var desc = JSON.parse(entityObject.desc);
              var time1 = desc.fasj1 || null;
              var time2 = desc.fasj2 || null;
              if (time1) {
                time1 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time1) / 1000);
              }
              if (time2) {
                time2 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time2) / 1000);
              }
              var pContent = $('<div class="cgi_content"><p>类型：案件</p>' +
                '<p>名称：' + (entityObject.name || "无") + '</p>' +
                '<p>地址：' + (entityObject.address || "无") + '</p>' +
                '<p>案件类型：' + (desc.ajlxch || "无") + '</p>' +
                '<p>案件类别：' + (desc.ajlbch || "无") + '</p>' +
                '<p>案发时间：' + time1 + '</p>' +
                '<p>结束时间：  ' + time2 + '</p>' +
                '<p>经纬度坐标：' + entityObject.longitude + ',' + entityObject.latitude + '</p>' +
                '<p>案情描述： </p>' +
                '<div style="height: 150px;width:100%;overflow-y: auto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + (desc.jyaq || "无") + '</div>' +
                '</div>');
              return pContent[0];
            }
          }
        } else {

        }
        var styleStr = getStyle(layerType, _this.queryInfo);
        item.rec.forEach(function (data) {
          var dataObject = JSON.parse(data);
          var coordinates = [];
          var coorsys = "";
          var desc = {};
          if (dataObject.desc) {
            desc = JSON.parse(dataObject.desc);
          }
          if (dataObject.location) {
            coordinates = dataObject.location.coordinates;
            coorsys = dataObject.coorsys;
            geoType = dataObject.location.type;
            if (!(coordinates || coorsys || geoType)) {
              return;
            }
          } else {
            return;
          }

          if (geoType == 'point') {
            if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
              coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
            }
            if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
              coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
            }
            var flag = true;
            var iconType = "";
            if (layerType == "cgi") {
              flag = false;
              $('input:checkbox[name=cgibaselayer]:checked').each(function (i, item) {
                var value = $(this).attr('value');
                var mobileCarrier = value.substr(0, 1);
                var netWork = value.substr(2, 1);
                if (dataObject.mobile_carrier && desc.network) {
                  if (mobileCarrier == dataObject.mobile_carrier && netWork == desc.network) {
                    flag = true;
                    iconType = value;
                  }
                }
              })
            }
            ;
            if (flag) {
              sprinkle_features.push({
                'type': 'Feature',
                'geometry': {'type': 'Point', 'coordinates': coordinates},
                'properties': {
                  iconType: iconType,
                  icon: com.jiusuo.map.webUrl + "/static/mark/" + com.jiusuo.map.iconStyle + styleStr,
                  entityObject: dataObject,
                  address: dataObject.address || '无',
                  name: dataObject.name || '无',
                  innerHTML: '<div style="margin-top: 6%;"><p><span>名称：</span><span>{name}</span></p><p><span>地址：</span><span>{address}</span></p></div>',
                  showFields: [{field: 'address', alias: '地址'}, {field: 'name', alias: '名称'}],
                  callback: callback
                }
              });
            }
          } else if (geoType == 'polygon') {
            if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
              coordinates = [com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(coordinates[0])];
            }
            if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
              coordinates = [com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(coordinates[0])];
            }
            var flag = true;
            if (layerType == "lac") {
              var flag = false;
              $('input:checkbox[name=lacbaselayer]:checked').each(function (i, item) {
                var value = $(this).attr('value');
                var mobileCarrier = value.substr(0, 1);
                var netWork = value.substr(2, 1);
                if (dataObject.mobile_carrier && desc.network) {
                  if (mobileCarrier == dataObject.mobile_carrier && netWork == desc.network) {
                    flag = true;
                  }
                }

              })
            } else if (layerType == "cgi_coverage") {
              flag = false;
              $('input:checkbox[name=cgi_coveragebaselayer]:checked').each(function (i, item) {
                var value = $(this).attr('value');
                var mobileCarrier = value.substr(0, 1);
                var netWork = value.substr(2, 1);
                if (dataObject.mobile_carrier && desc.network) {
                  if (mobileCarrier == dataObject.mobile_carrier && netWork == desc.network) {
                    flag = true;
                  }
                }
              })
            }
            if (flag) {
              var red = Math.floor(255 * Math.random());
              var green = Math.floor(255 * Math.random());
              var blue = Math.floor(255 * Math.random());
              var color = 'rgba(' + red + ',' + green + ',' + blue + ',' + 0.4 + ')'
              sprinkle_features.push({
                'type': 'Feature',
                'geometry': {'type': 'Polygon', 'coordinates': coordinates},
                'properties': {
                  entityObject: dataObject,
                  color: color,
                  callback: null
                }
              });
            }
          } else if (geoType == "linestring") {
            if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
              coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(coordinates);
            }
            if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
              coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(coordinates);
            }
            sprinkle_features.push({
              'type': 'Feature',
              'geometry': {'type': 'LineString', 'coordinates': coordinates},
              'properties': {
                entityObject: dataObject,
                //color:color,
                id: dataObject.id || '无',
                name: dataObject.name || '无',
                innerHTML: '<div style="margin-top: 6%;"><p><span>ID：</span><span>{id}</span></p><p><span>名称：</span><span>{name}</span></p></div>',
                showFields: [{field: 'ID', alias: 'ID'}, {field: 'name', alias: '名称'}],
                callback: null
              }
            });
          }
        });
        var layerID = "es-baselayer-" + layerType;
        var sprinkleLayer = findSprinkleLayer(layerID, map.getSprinkleLayers());
        var geoJson_sprinkle = {
          'type': 'FeatureCollection',
          'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
          'features': sprinkle_features
        };
        var features = function () {
          try {
            return (new ol.format.GeoJSON()).readFeatures(geoJson_sprinkle, {
              dataProjection: 'EPSG:4326',
              featureProjection: projection
            });
          } catch (ex) {
            return null;
          }
        };
        if (sprinkleLayer) {
          var source = new ol.source.Vector({
            features: features()
          });
          sprinkleLayer.getVectorLayer().setSource(source);
          com.jiusuo.map.TEsBaseLayerControl.cgiDragBoxHandler(source, map);
          if (geoType == 'polygon') {
            styleStr = JSON.parse(styleStr);
            var style = function (feature) {

              var color = feature.get('color');
              var queryResultStyle = new com.jiusuo.map.style.TStyle({
                fill: new ol.style.Fill({
                  color: color
                }),
                stroke: new ol.style.Stroke({
                  color: '#3399CC',
                  width: 1.25
                })
              });
              return queryResultStyle;
            }
            sprinkleLayer.setStyle(style);
          } else if (geoType == "linestring") {
            var style = new com.jiusuo.map.style.TStyle({
              stroke: new com.jiusuo.map.style.TStroke({
                color: 'rgba(255,0,0,1)',
                width: 2
              })
            });
            sprinkleLayer.setStyle(style);
          }
          sprinkleLayer.setVisible(true);
        }
      })
    } else {
      clearBaseSprinkleLayer(map);
    }
  };

  //根据图层ID获得撒点图层
  var findSprinkleLayer = function (id, array) {
    for (var i = 0; i < array.getLength(); i++) {
      var item = array.item(i);
      if (item.getId() == id) {
        return item;
      }
    }
    return null;
  };
  //将所有基础图层隐藏
  var clearBaseSprinkleLayer = function (tMap) {
    var collection = tMap.sprinkleLayers;
    collection.forEach(function (item) {
      var id = item.getId();

      if (id && id.substr(0, 13) == "es-baselayer-") {
        // item.setVisible(false);
        item.getVectorLayer().getSource().clear();
      }
    })
  };

  var getStyle = function (type, array) {
    for (var i = 0; i < array.length; i++) {
      var item = array[i];
      if (item.type == type) {
        return item.icon;
      }
    }
    return null;
  };
  //设置地图监听，当地图拖动，缩放时触发
  this._tMap.getOMap().on('moveend', _this.queryFunction);
};
com.jiusuo.map.TEsBaseLayerControl.handleSwape = function (value, tMap) {
  //checkbox勾选，触发查询事件
  var index = -1;
  for (var i = 0; i < tMap.esBaseLayerControl.querySourceType.length; i++) {
    if (tMap.esBaseLayerControl.querySourceType[i] == value) {
      index = i;
      break;
    }
  }
  //判断是否存在，如存在，不加入。
  if ($('#' + value).get(0).checked) {
    if (index < 0) {
      tMap.esBaseLayerControl.querySourceType.push(value);
    }
  } else {
    if (index > -1) {
      tMap.esBaseLayerControl.querySourceType.splice(index, 1);
    }
  }
  tMap.esBaseLayerControl.queryFunction();
};
com.jiusuo.map.TEsBaseLayerControl.cgiDragBoxHandler = function (source, tMap) {
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  tMap.cgiDragBox.on('boxend', function () {
    var extent = tMap.cgiDragBox.getGeometry().getExtent();
    source.forEachFeatureIntersectingExtent(extent, function (feature) {
      if (feature.getGeometry().getType() == 'Point') {
        var entityObject = feature.get('entityObject');
        if (entityObject && entityObject.type == 'cgi') {
          tMap.cgiOldStyle = feature.getStyle();
          tMap.cgiDragBoxFeatures.push(feature);
        }
      }
    });
    var selectcgilayer = tMap.getVectorLayer('selectcgiVector');
    tMap.cgiDragBoxFeatures.forEach(function (f) {
      var _f = f.clone();
      tMap.cgiCoverageFeatures.push(_f);
      selectcgilayer.getSource().addFeature(_f);
    });
  });
}
com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback = function (esJsonObjects, map) {
  map.removeWaitingModel();
  var projection = map.getProjection().getCode();
  var queryResultStyle = new com.jiusuo.map.style.TStyle({
    fill: new ol.style.Fill({
      color: 'rgba(255,255,255,0.4)'
    }),
    stroke: new ol.style.Stroke({
      color: '#3399CC',
      width: 1.25
    })
  });
  if (esJsonObjects.length > 0) {
    esJsonObjects.forEach(function (item) {
      var layerType = item.type;
      var geoType = 'point';
      var callback = null;
      var sprinkle_features = [];
      var id = "defaultid";
      var type = item.type;
      item.rec.forEach(function (data) {
        var dataObject = JSON.parse(data);
        if (!dataObject.location) {
          return;
        } else if (!dataObject.location.coordinates) {
          return;
        }
        var coordinates = dataObject.location.coordinates;
        var coorsys = dataObject.coorsys;
        var desc = JSON.parse(dataObject.desc);
        var mobile_carrier = dataObject.mobile_carrier;
        var iconType = mobile_carrier + '_' + desc.network;
        geoType = dataObject.location.type;
        if (type == "cgi") {
          id = "cgi" + dataObject.id;
          callback = function (feature) {
            if (feature) {
              var entityObject = feature.get('entityObject');
              var desc = JSON.parse(entityObject.desc);
              var mobile_carrier = entityObject.mobile_carrier;
              switch (mobile_carrier) {
                case 1:
                  mobile_carrier = "中国移动";
                  break;
                case 2:
                  mobile_carrier = "中国联通";
                  break;
                case 3:
                  mobile_carrier = "中国电信";
                  break;
                default:
                  mobile_carrier = "";
              }
              var coorsys = entityObject.coorsys;
              var pContent = $('<div class="cgi_content"><p>类型：基站</p>' +
                '<p>标识：' + entityObject.id + '</p>' +
                '<p>名称：' + (entityObject.name || "无") + '</p>' +
                '<p>地址：' + (entityObject.address || "无") + '</p>' +
                '<p>运营商：' + mobile_carrier + '</p>' +
                '<p>网络制式：  ' + desc.network + 'G   </p>' +
                '<p>首次统计时间：' + desc.first_date + '</p>' +
                '<p>最新统计时间：' + desc.last_date + '</p>' +
                '<div id="CGI_SP" name="CGI_Type"><label>运营商坐标：' + (desc.sp_longitude || "无") + ',' + (desc.sp_latitude || "无") + '</label></div>' +
                '<div id="CGI_LBS" name="CGI_Type"><label>LBS预测坐标：' + (desc.lbs_longitude || "无") + ',' + (desc.lbs_latitude || "无") + '</label></div>' +
                '<div id="CGI_NEAR" name="CGI_Type"><label>邻基站预测坐标：' + (desc.near_longitude || "无") + ',' + (desc.near_latitude || "无") + '</label></div>' +
                '</div>');
              var repairType = desc.repair_type;
              switch (repairType) {
                case "0":
                  pContent.find('#CGI_SP').children().last().addClass('underline');
                  break;
                case "1":
                  pContent.find('#CGI_SP').children().last().addClass('underline');
                  break;
                case "2":
                  pContent.find('#CGI_LBS').children().last().addClass('underline');
                  break;
                case "3":
                  pContent.find('#CGI_NEAR').children().last().addClass('underline');
                  break;
              }
              return pContent[0];
            }
          }
        } else if (type = "cgi_coverage") {
          id = "coverage" + dataObject.id;
        }

        if (geoType == 'polygon') {
          if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
            coordinates = [com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints(coordinates[0])];
          }
          if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
            coordinates = [com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints(coordinates[0])];
          }
          sprinkle_features.push({
            'type': 'Feature',
            'geometry': {'type': 'Polygon', 'coordinates': coordinates},
            'properties': {'id': id}
          });
        } else if (geoType == 'point') {
          if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
            coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
          }
          if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
            coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
          }
          sprinkle_features.push({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': coordinates},
            'properties': {id: id, iconType: iconType, entityObject: dataObject, callback: callback}
          });
        }
      });
      var geoJson_sprinkle = {
        'type': 'FeatureCollection',
        'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
        'features': sprinkle_features
      };
      var features = function () {
        try {
          return (new ol.format.GeoJSON()).readFeatures(geoJson_sprinkle, {
            dataProjection: 'EPSG:4326',
            featureProjection: projection
          });
        } catch (ex) {
          return null;
        }
      }();
      var baseVectorLayer = map.getVectorLayer('selectcgiVector');
      if (type == "cgi_coverage") {
        baseVectorLayer = map.getVectorLayer('coverageVector');
        baseVectorLayer.setZIndex(0);
        features.forEach(function (feature) {
          map.cgiCoverageFeatures.push(feature);
          feature.setId(feature.get('id'));
          feature.setStyle(queryResultStyle);
          baseVectorLayer.getSource().addFeature(feature);
        })
      } else {
        features.forEach(function (feature) {
          map.cgiCoverageFeatures.push(feature);
          feature.setId(feature.get('id'));
          baseVectorLayer.getSource().addFeature(feature);
        })
      }
    });
  }
}

/**
 * @类名：历史网格播放控件--播放ui修改版-省厅
 * @参数：{Object=} opt_options Control options.
 * @用途：控制播放器显示、历史网格播放
 */
com.jiusuo.map.THistoryGeoGridOCControl_M = function (opt_options) {

  var _this = this;
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '历史网格';
  var geohash = this._tMap.currentGeohash;
  var t_time;
  var features;
  var playStep = 1000;
  var num = 0;
  var i = 1;
  var dategrids = null;
  var times = null;
  var handle = function () {
    var start = $('#starttime').val();
    var end = $('#endtime').val();
    var hashLen = 6;
    if (_this._tMap.getOMap().getView().getZoom() < 11 || _this._tMap.getOMap().getView().getZoom() > 17) {
      return;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 11 && _this._tMap.getOMap().getView().getZoom() <= 12) {
      hashLen = 5;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 13 && _this._tMap.getOMap().getView().getZoom() <= 14) {
      hashLen = 6;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 15 && _this._tMap.getOMap().getView().getZoom() <= 16) {
      hashLen = 7;
    }
    var extentGeojson = _this._tMap.getMapWindowExtent('EPSG:4326');
    var callback = function (jsonObj) {
      i = 1;
      _this._tMap.removeWaitingModel();
      if (jsonObj == null) {
        return;
      }
      times = jsonObj.times;
      dategrids = jsonObj.historyGeoGridsResults;
      if (times == null || times.length == 0) {
        return;
      }
      if (dategrids == null || dategrids.length == 0) {
        return;
      }
      dategrids.forEach(function (eitem) {
        if (eitem.dateKey == times[0]) {
          var f_nums = 0;
          eitem.grids.forEach(function (grid) {
            f_nums += parseInt(grid.num)
          });
          if (f_nums > 0) {
            features = geohash.showGeohashGrids(eitem);
          }
        }
      });

      num = dategrids.length;
      play(playStep);
    }
    _this._tMap.addWaitingModel();
    geohash.getHistoryGeohashGrids(extentGeojson, hashLen, start, end, callback);
  };
  var play = function (playStep) {
    if (t_time) {
      clearInterval(t_time);
      if (features) {
        geohash.removeGeohashGrids(features);
      }
      features = null;
    }
    t_time = setInterval(function () {
      if (i == num) {
        if (features) {
          geohash.removeGeohashGrids(features);
        }
        features = null;
        dategrids = null;
        clearInterval(t_time);
        return;
      }
      if (dategrids == null) {
        return;
      }
      dategrids.forEach(function (eitem) {
        if (eitem.dateKey == times[i]) {
          var nums = 0;
          eitem.grids.forEach(function (grid) {
            nums += parseInt(grid.num)
          });
          if (nums > 0) {
            if (features) {
              geohash.removeGeohashGrids(features);
            }
            features = null;
            features = geohash.showGeohashGrids(eitem);
          }
        }
      });
      routeHandle(times);
      i++;
    }, playStep);
  }
  var html = "<div class='list'>"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "            <div class='word' ><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_10.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_07.png' width='36px' height='36px' class='img2'></div>"
    + "          </div>"
    + "          <div class='scale_control_short set_pop8' id='showTimeControlFor_M'>"
    + "            <div class='control' style='background: transparent;'>"
    + "              <div class='box'  style='width: 103%;'> <div class='ui_play_date'><div style='width: 0px;border: 10px solid;border-color: rgba(0, 29, 81, 1)  transparent transparent transparent;position: absolute;margin-left: 75px;margin-top: 37px;height: 0px;'></div>"
    + "                <div class='list left'>";

  var htmltime1 = '                  <input  id="starttime" onclick="layui.laydate({elem: this, istime: true, format: \'YYYY-MM-DD hh:mm:ss\'})" placeholder="2016-11-16 10:33:37" class="layui-input">';

  var htmltime2 = "                </div>";
  var htmltime3 = "                <div class='list left'>";

  var htmltime4 = '                  <input  id="endtime" onclick="layui.laydate({elem: this, istime: true, format: \'YYYY-MM-DD hh:mm:ss\'})" placeholder="2016-11-16 10:33:37" class="layui-input">';
  var htmltime5 = "                </div></div>  <div style='margin-left: 38%;margin-top: 8%;'> "
    + "                <div class='list list_first_img list_date' title='日期' style='border-right: 2px groove rgba(73, 80, 87, 1);'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/date.png' id='history_date'></a></div>"
    + "                <div class='list list_first_img list_play' title='开始' style='border-right: 2px groove rgba(73, 80, 87, 1);'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_13.png' id='history_play'></a></div>"
    + "                <div class='list list_play' title='停止' style='border-right: 2px groove rgba(73, 80, 87, 1);'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_16.png' id='history_stop'></a></div>"
    + "                <div class='list list_play jia' title='加速' style='border-right: 2px groove rgba(73, 80, 87, 1);'><div class='double' id='history_speedNum'></div><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_22.png' id='history_add'></a></div>"
    + "                <div class='list list_play jian' title='减速' ><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_31.png' id='history_minus'></a></div>"
    + "              </div>"
    + "            </div></div>"
    + "            <div class='scale' style='width: 82%;height: 47px;border-radius: 12px;'>"
    + "              <div class='lefts'>"
    /*+ "                  <canvas id='tmap-geogrid-animation-timeline' width='284px' height='55px'></canvas>"*/
    + "                  <div class='long' style='width: 42%;margin-top: 2.8%;border-radius: 6px;'></div>"
    + "                  <img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_11.png' id='tmap-geogrid-animation-timeCtr'  style='left: -309px;'/>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  var div = $(html + htmltime1 + htmltime2 + htmltime3 + htmltime4 + htmltime5);

  //格式化日期,
  function formatDate(date, format) {
    var paddNum = function (num) {
      num += "";
      return num.replace(/^(\d)$/, "0$1");
    }
    //指定格式字符
    var cfg = {
      yyyy: date.getFullYear() //年 : 4位
      , yy: date.getFullYear().toString().substring(2)//年 : 2位
      , M: date.getMonth() + 1  //月 : 如果1位的时候不补0
      , MM: paddNum(date.getMonth() + 1) //月 : 如果1位的时候补0
      , d: date.getDate()   //日 : 如果1位的时候不补0
      , dd: paddNum(date.getDate())//日 : 如果1位的时候补0
      , hh: paddNum(date.getHours())  //时
      , mm: date.getMinutes() //分
      , ss: date.getSeconds() //秒
    }
    format || (format = "yyyy-MM-dd hh:mm:ss");
    return format.replace(/([a-z])(\1)*/ig, function (m) {
      return cfg[m];
    });
  }

  $('#' + controlContainer + '_ctm_tool_list_f').after(div);

  $('.scale_control_short .list_date').on('click', function () {

    $('.ui_play_date').toggle();

  });
  var bDateTime = new Date();
  bDateTime.setHours(bDateTime.getHours() - 5);
  $('#starttime').val(formatDate(bDateTime).substring(0, 13) + ":00:00");
  $('#endtime').val(formatDate(new Date()).substring(0, 13) + ":00:00");
  $('#history_play').on('click', function () {
    handle();
  });
  $('#history_stop').on('click', function () {
    if (t_time) {
      clearInterval(t_time);
    }
    timePlayerLeft = 0;
    $('#tmap-geogrid-animation-timeCtr').css('left', (-309) + 'px');
    if (features) {
      geohash.removeGeohashGrids(features);
    }
    dategrids = null;
  });
  var speedNum = 1;
  $('#history_add').on('click', function () {
    playStep = playStep / 2;
    speedNum = speedNum * 2;
    if (speedNum == 1) {
      $('#history_speedNum')[0].innerHTML = '';
    } else {
      $('#history_speedNum')[0].innerHTML = 'x' + (speedNum);
    }
    play(playStep);
  });
  $('#history_minus').on('click', function () {
    playStep = playStep * 2;
    speedNum = speedNum / 2;
    if (speedNum == 1) {
      $('#history_speedNum')[0].innerHTML = '';
    } else {
      $('#history_speedNum')[0].innerHTML = 'x' + (speedNum);
    }
    play(playStep);
  });
  var _start = com.jiusuo.map.TimeLineUtils.js_strto_time($('#starttime').val());
  var _end = com.jiusuo.map.TimeLineUtils.js_strto_time($('#endtime').val());
  //com.jiusuo.map.THistoryGeoGridOCControl.initTimeLine(_start, _end);
  var timePlayerLeft = 0;
  var routeHandle = function (times) {
    var step = 284 / (times.length - 1);//d
    var percent = timePlayerLeft / 284;
    timePlayerLeft += step;
    $('#tmap-geogrid-animation-timeCtr').css('left', (timePlayerLeft - 309) + 'px');
    var ellapse = Math.ceil(((times.length - 1) * 60 * 15 * percent));
    var minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(times[1]);
    var maxEndTime = com.jiusuo.map.TimeLineUtils.js_strto_time(times[times.length - 1]);
    var move_time = minStartTime + ellapse;
    if (move_time >= maxEndTime) {
      move_time = maxEndTime;
      timePlayerLeft = 0;
      $('#tmap-geogrid-animation-timeCtr').css('left', (-309) + 'px');
    }
  };

  this.setTimeForTHistoryGeoGrid = function (startTime, endTime) {  //设置开始和结束时间
    $('#starttime').val(startTime);
    $('#endtime').val(endTime);
  }

}


/**
 * @类名：历史网格播放控件
 * @参数：{Object=} opt_options Control options.
 * @用途：控制播放器显示、历史网格播放
 */
com.jiusuo.map.THistoryGeoGridOCControl = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '历史网格';
  var geohash = this._tMap.currentGeohash;
  var t_time;
  var features;
  var playStep = 1000;
  var num = 0;
  var i = 1;
  var dategrids = null;
  var times = null;
  var handle = function () {
    var start = $('#starttime').val();
    var end = $('#endtime').val();
    var hashLen = 6;
    if (_this._tMap.getOMap().getView().getZoom() < 11 || _this._tMap.getOMap().getView().getZoom() > 17) {
      return;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 11 && _this._tMap.getOMap().getView().getZoom() <= 12) {
      hashLen = 5;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 13 && _this._tMap.getOMap().getView().getZoom() <= 14) {
      hashLen = 6;
    }
    if (_this._tMap.getOMap().getView().getZoom() >= 15 && _this._tMap.getOMap().getView().getZoom() <= 16) {
      hashLen = 7;
    }
    var extentGeojson = _this._tMap.getMapWindowExtent('EPSG:4326');
    var callback = function (jsonObj) {
      i = 1;
      _this._tMap.removeWaitingModel();
      if (jsonObj == null) {
        return;
      }
      times = jsonObj.times;
      dategrids = jsonObj.historyGeoGridsResults;
      if (times == null || times.length == 0) {
        return;
      }
      if (dategrids == null || dategrids.length == 0) {
        return;
      }
      dategrids.forEach(function (eitem) {
        if (eitem.dateKey == times[0]) {
          var f_nums = 0;
          eitem.grids.forEach(function (grid) {
            f_nums += parseInt(grid.num)
          });
          if (f_nums > 0) {
            features = geohash.showGeohashGrids(eitem);
          }
        }
      });

      num = dategrids.length;
      play(playStep);
    }
    _this._tMap.addWaitingModel();
    geohash.getHistoryGeohashGrids(extentGeojson, hashLen, start, end, callback);
  };
  var play = function (playStep) {
    if (t_time) {
      clearInterval(t_time);
      if (features) {
        geohash.removeGeohashGrids(features);
      }
      features = null;
    }
    t_time = setInterval(function () {
      if (i == num) {
        if (features) {
          geohash.removeGeohashGrids(features);
        }
        features = null;
        dategrids = null;
        clearInterval(t_time);
        return;
      }
      if (dategrids == null) {
        return;
      }
      dategrids.forEach(function (eitem) {
        if (eitem.dateKey == times[i]) {
          var nums = 0;
          eitem.grids.forEach(function (grid) {
            nums += parseInt(grid.num)
          });
          if (nums > 0) {
            if (features) {
              geohash.removeGeohashGrids(features);
            }
            features = null;
            features = geohash.showGeohashGrids(eitem);
          }
        }
      });
      routeHandle(times);
      i++;
    }, playStep);
  }
  var html = "<div class='list'>"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "            <div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_10.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_07.png' width='36px' height='36px' class='img2'></div>"
    + "          </div>"
    + "          <div class='scale_control_short set_pop8'>"
    + "            <div class='control'>"
    + "              <div class='box'>"
    + "                <div class='list left'>";

  var htmltime1 = '                  <input  id="starttime" onclick="layui.laydate({elem: this, istime: true, format: \'YYYY-MM-DD hh:mm:ss\',choose:com.jiusuo.map.THistoryGeoGridOCControl.chooseF1})" placeholder="2016-11-16 10:33:37" class="layui-input">';

  var htmltime2 = "                </div>";
  var htmltime3 = "                <div class='list left'>";

  var htmltime4 = '                  <input  id="endtime" onclick="layui.laydate({elem: this, istime: true, format: \'YYYY-MM-DD hh:mm:ss\',choose:com.jiusuo.map.THistoryGeoGridOCControl.chooseF2})" placeholder="2016-11-16 10:33:37" class="layui-input">';
  var htmltime5 = "                </div>"
    + "                <div class='list list_first_img list_play' title='开始'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_13.png' id='history_play'></a></div>"
    + "                <div class='list list_play' title='停止'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu2jia_16.png' id='history_stop'></a></div>"
    + "                <div class='list list_play jia' title='加速'><div class='double' id='history_speedNum'></div><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_22.png' id='history_add'></a></div>"
    + "                <div class='list list_play jian' title='减速'><a href='javascript:void(0)'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_31.png' id='history_minus'></a></div>"
    + "              </div>"
    + "            </div>"
    + "            <div class='scale'>"
    + "              <div class='lefts'>"
    + "                  <canvas id='tmap-geogrid-animation-timeline' width='624px' height='55px'></canvas>"
    + "                  <div class='long'></div>"
    + "                  <img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_scale2_11.png' id='tmap-geogrid-animation-timeCtr'/>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  var div = $(html + htmltime1 + htmltime2 + htmltime3 + htmltime4 + htmltime5);

  //格式化日期,
  function formatDate(date, format) {
    var paddNum = function (num) {
      num += "";
      return num.replace(/^(\d)$/, "0$1");
    }
    //指定格式字符
    var cfg = {
      yyyy: date.getFullYear() //年 : 4位
      , yy: date.getFullYear().toString().substring(2)//年 : 2位
      , M: date.getMonth() + 1  //月 : 如果1位的时候不补0
      , MM: paddNum(date.getMonth() + 1) //月 : 如果1位的时候补0
      , d: date.getDate()   //日 : 如果1位的时候不补0
      , dd: paddNum(date.getDate())//日 : 如果1位的时候补0
      , hh: paddNum(date.getHours())  //时
      , mm: date.getMinutes() //分
      , ss: date.getSeconds() //秒
    }
    format || (format = "yyyy-MM-dd hh:mm:ss");
    return format.replace(/([a-z])(\1)*/ig, function (m) {
      return cfg[m];
    });
  }

  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  var bDateTime = new Date();
  bDateTime.setHours(bDateTime.getHours() - 5);
  $('#starttime').val(formatDate(bDateTime).substring(0, 13) + ":00:00");
  $('#endtime').val(formatDate(new Date()).substring(0, 13) + ":00:00");
  $('#history_play').on('click', function () {
    handle();
  });
  $('#history_stop').on('click', function () {
    if (t_time) {
      clearInterval(t_time);
    }
    timePlayerLeft = 0;
    $('#tmap-geogrid-animation-timeCtr').css('left', (-309) + 'px');
    if (features) {
      geohash.removeGeohashGrids(features);
    }
    dategrids = null;
  });
  var speedNum = 1;
  $('#history_add').on('click', function () {
    playStep = playStep / 2;
    speedNum = speedNum * 2;
    if (speedNum == 1) {
      $('#history_speedNum')[0].innerHTML = '';
    } else {
      $('#history_speedNum')[0].innerHTML = 'x' + (speedNum);
    }
    play(playStep);
  });
  $('#history_minus').on('click', function () {
    playStep = playStep * 2;
    speedNum = speedNum / 2;
    if (speedNum == 1) {
      $('#history_speedNum')[0].innerHTML = '';
    } else {
      $('#history_speedNum')[0].innerHTML = 'x' + (speedNum);
    }
    play(playStep);
  });
  var _start = com.jiusuo.map.TimeLineUtils.js_strto_time($('#starttime').val());
  var _end = com.jiusuo.map.TimeLineUtils.js_strto_time($('#endtime').val());
  com.jiusuo.map.THistoryGeoGridOCControl.initTimeLine(_start, _end);
  var timePlayerLeft = 0;
  var routeHandle = function (times) {
    var step = 622 / (times.length - 1);//d
    var percent = timePlayerLeft / 622;
    timePlayerLeft += step;
    $('#tmap-geogrid-animation-timeCtr').css('left', (timePlayerLeft - 309) + 'px');
    var ellapse = Math.ceil(((times.length - 1) * 60 * 15 * percent));
    var minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(times[1]);
    var maxEndTime = com.jiusuo.map.TimeLineUtils.js_strto_time(times[times.length - 1]);
    var move_time = minStartTime + ellapse;
    if (move_time >= maxEndTime) {
      move_time = maxEndTime;
      timePlayerLeft = 0;
      $('#tmap-geogrid-animation-timeCtr').css('left', (-309) + 'px');
    }
  };
};
com.jiusuo.map.THistoryGeoGridOCControl.chooseF1 = function (dates) {
  var _start = com.jiusuo.map.TimeLineUtils.js_strto_time(dates.substring(0, 13) + ":00:00");
  var _end = com.jiusuo.map.TimeLineUtils.js_strto_time($('#endtime').val());
  com.jiusuo.map.THistoryGeoGridOCControl.initTimeLine(_start, _end);
}
com.jiusuo.map.THistoryGeoGridOCControl.chooseF2 = function (dates) {
  var _start = com.jiusuo.map.TimeLineUtils.js_strto_time($('#starttime').val());
  var _end = com.jiusuo.map.TimeLineUtils.js_strto_time(dates.substring(0, 13) + ":00:00");
  com.jiusuo.map.THistoryGeoGridOCControl.initTimeLine(_start, _end);
}
com.jiusuo.map.THistoryGeoGridOCControl.initTimeLine = function (start, end) {
  var timeLineControl = new com.jiusuo.map.TimeLine('tmap-geogrid-animation-timeline');
  var data = this.genData(start, end);
  timeLineControl.drawTimeCoord(data);
  $('#tmap-geogrid-animation-timeCtr').css('left', '-309px')
}
com.jiusuo.map.THistoryGeoGridOCControl.genData = function (start, end) {
  var _this = this;
  var startTime = start;
  var endTime = end;
  var hour = 60 * 60;
  var d = Math.ceil((endTime - startTime) / hour);
  var startTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(startTime));
  var endTimeDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(endTime));
  var start = startTimeDate.getHours();
  var end = endTimeDate.getHours();
  // if (endTimeDate.getMinutes() != 0) {
  //     end = endTimeDate.getHours() + 1;
  // }
  // d=end-start;
  var data = [];
  if (d <= 10 && d > 5) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      // data.push(hour + ':30');
    }
    data.push(end);
  } else if (d <= 5 && d > 3) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      //data.push(hour + ':15');
      data.push(hour + ':30');
      // data.push(hour + ':45');
    }
    data.push(end);
  } else if (d <= 3 && d > 0) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
      // data.push(hour + ':10');
      // data.push(hour + ':20');
      // data.push(hour + ':30');
      // data.push(hour + ':40');
      // data.push(hour + ':50');
    }
    data.push(end);
  } else if (d <= 20 && d > 10) {
    for (var i = 0; i < d; i++) {
      var hour = i + start;
      if (hour >= 24) {
        hour = hour - 24;
      }
      if (hour == 0 && i != 0) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + 1));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      } else {
        data.push(hour);
      }
    }
    data.push(end);
  }
  else {
    if (d <= 40 && d > 20) {
      if (d % 2 != 0) {
        d = Math.ceil(d / 2) * 2;
      }
      for (var i = 0; i <= d; i += 2) {
        var hour = i + start;
        var num = 0;
        while (!(hour - 24 * num >= 0 && hour - 24 * num < 24)) {
          num++;
        }
        hour = hour - 24 * num;
        if (hour == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(hour);
        }
      }
    } else if (d <= 60 && d > 40) {
      if (d % 4 != 0) {
        d = Math.ceil(d / 4) * 4;
      }
      for (var i = 0; i <= d; i += 4) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;
        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 120 && d > 60) {
      if (d % 6 != 0) {
        d = Math.ceil(d / 6) * 6;
      }
      for (var i = 0; i <= d; i += 6) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;

        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 240 && d > 120) {
      if (d % 12 != 0) {
        d = Math.ceil(d / 12) * 12;
      }
      for (var i = 0; i <= d; i += 12) {
        var time = i + start;
        var num = 0;
        while (!(time - 24 * num >= 0 && time - 24 * num < 24)) {
          num++;
        }
        time = time - 24 * num;
        if (time == 0 && i != 0) {
          var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + num));
          data.push((date.getMonth() + 1) + '-' + date.getDate());
        } else {
          data.push(time);
        }
      }
    } else if (d <= 360 && d > 180) {
      var dayCount = Math.ceil((endTime - startTime) / (60 * 60 * 24));
      startTimeDate.setHours(0);
      startTimeDate.setMinutes(0);
      startTimeDate.setSeconds(0);
      startTimeDate.setMilliseconds(0);
      _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + "00:00:00");
      _this.maxEndTime = _this.minStartTime + dayCount * 24 * 3600;
      d = 24 * dayCount;
      for (var i = 0; i < dayCount; i++) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + i));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      }
      var endDate = new Date(com.jiusuo.map.TimeLineUtils.js_date_time(_this.maxEndTime));
      data.push((endDate.getMonth() + 1) + '-' + endDate.getDate());
    } else if (d <= 720 && d > 360) {
      var dayCount = Math.ceil((endTime - startTime) / (60 * 60 * 24));
      if (dayCount % 2 != 0) {
        dayCount = Math.ceil(dayCount / 2) * 2;
      }
      startTimeDate.setHours(0);
      startTimeDate.setMinutes(0);
      startTimeDate.setSeconds(0);
      startTimeDate.setMilliseconds(0);
      _this.minStartTime = com.jiusuo.map.TimeLineUtils.js_strto_time(com.jiusuo.map.TimeLineUtils.date_format(startTimeDate, 'yyyy-MM-dd') + ' ' + "00:00:00");
      _this.maxEndTime = _this.minStartTime + dayCount * 24 * 3600;
      d = 24 * dayCount;
      for (var i = 0; i <= dayCount; i += 2) {
        var date = new Date(new Date(startTimeDate).setDate(startTimeDate.getDate() + i));
        data.push((date.getMonth() + 1) + '-' + date.getDate());
      }
    } else {
      if (d > 0) {
        var d = dialog({
          title: '提示',
          content: '播放时间范围超过30天！'
        });
        d.showModal();
      }
    }
  }
  _this.range = d;
  return data;
}
/**
 * @类名：基础控件
 * @父类：{ol.control.Control}
 * @参数：{Object=} opt_options Control options.
 * @用途：用于初始化右边菜单、顶部工具的锚点
 */
com.jiusuo.map.TBaseControl = function (opt_options) {
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var html = "<div id='" + controlContainer + "_ctm_tool_list' class='ditu_index_right'>"
    + "<div id='" + controlContainer + "_ctm_tool_list_f' class='list list_first'>"
    + "<div id='" + controlContainer + "_ctm_tool_pop' class='pop'></div>"
    + "</div>"
    + "</div>";
  var div = $(html)[0];
  ol.control.Control.call(this, {
    element: div,
    target: options.target
  });

  $("div").delegate('#' + controlContainer + '_ctm_tool_list_f .list_first_img', 'click', function (e) {
    e.stopPropagation();
    $('#' + controlContainer + '_ctm_tool_pop').finish().toggle();
    var $pop = $('#' + controlContainer + '_ctm_tool_pop .set');
    $pop.parent().width($pop.outerWidth(true) * $pop.size());
  });
/*  $("div").delegate('.ditu_index_right .list:not(".list_first")', 'mouseover', function (e) {
    $(this).find('.pop_title').show();
  });*/
/*  $("div").delegate('.ditu_index_right .list:not(".list_first")', 'mouseout', function (e) {
    $('.pop_title').hide();
  });*/

  $("div").delegate('.ditu_index_right .set', 'mouseover', function (e) {
    $(this).find('.pop_title').show();
  });
  $("div").delegate('.ditu_index_right .set', 'mouseout', function (e) {
    $('.pop_title').hide();
  });

  $("div").delegate('#' + controlContainer + '_ctm_tool_list', 'mouseover', function (e) {
    $("#switch_layer").css("display","block");
  });
  $("div").delegate('#' + controlContainer + '_ctm_tool_list', 'mouseout', function (e) {
    $("#switch_layer").css("display","none");
  });

  // $("div").delegate('#' + controlContainer + '_ctm_tool_list', 'click', function (e) {
  //   e.stopPropagation();
  //   /*$(this).siblings().finish().toggle('slow');
  //   $(this).parent().siblings().find('.triangle,.set_pop').hide();*/
  //   if($("#switch_layer").css("display")=="none"){
  //     $("#switch_layer").css("display","block");
  //   }else{
  //     $("#switch_layer").css("display","none");
  //   }
  // });

};
ol.inherits(com.jiusuo.map.TBaseControl, ol.control.Control);
/**
 * @类名：弹出周边搜索框
 * @参数：{Object=} opt_options Control options.
 * @用途：弹出周边搜索框
 */
com.jiusuo.map.TSearchControlForRadius = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var html = "<div>"
    + "          <div class='set_pop set_pop7_nearby set_pop_right8' id='idForNearBySearch'>"
    + "            <div class='margin'>"
    + "              <div class='title'>周边查询</div>"
    + "              <div class='net'></div>"
    + "              <div class='wrap'>"
    + "                <div class='left4'>关键字：</div>"
    + "                <div class='right'>"
    + "                  <input type='text' class='input' id='keyWordsForNearby'>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap'>"
    + "                <div class='left4'>搜索半径：</div>"
    + "                <div class='right'>"
    + "                  <input type='text' class='input' id='searchRadius'><span>米</span>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap'>"
    + "                <div class='left4'>资源类型：</div>"
    + "                <div class='right' id='_basequerysourcetypeForNearBy'>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap'>"
    + "                <div class='center'>"
    + "                  <input id='idForNearByGetEsDataInMap' type='button' value='确定' class='blue submit' style='cursor: pointer;'>"
    + "                  <input type='button' value='取消' class='gray reset' style='cursor: pointer;' id='cancelForNearby'>"
    + "                </div>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  var div = $(html);

  var commonSources = com.jiusuo.map.tMap.tMapServiceConfig.esService.commonSources;
  var querySourceNames = [];
  commonSources.forEach(function (querySource) {
    var querySourceObject = {};
    querySourceObject.name = querySource.name;
    querySourceObject.type = querySource.type;

    querySourceNames.push(querySourceObject);
  });
  for (var i = 0; i < querySourceNames.length; i++) {
    var querySourceName = querySourceNames[i];
    var value = querySourceName.type;
    var name = querySourceName.name;
    var sourcehtml = "                  <label>"
      + "                    <input type='checkbox' name='basequerysourcetypeForNearBy' value='" + value + "'>" + name
      + "                  </label>";
    div.find('#_basequerysourcetypeForNearBy').append($(sourcehtml));
  }
  $('body').append(div);
  $('#idForNearBySearch').first().show();

  $('#searchRadius').on('keyup', function (e) {
    this.value = this.value.replace(/\D/g, "");
  });
  $('#searchRadius').on('afterpaste', function (e) {
    this.value = this.value.replace(/\D/g, "");
  });

  //$('searchRadius').on("keyup",function(){console.log("dd")});
  var divHeight = $('#idForNearBySearch').height();
  var divWidth = $('#idForNearBySearch').width();
  var canVastop = $('canvas').height();
  var canVasLeft = $('canvas').width();
  var left = opt_options.event.left;
  var top = opt_options.event.top;
  if (left >= canVasLeft) {
    left = left - divWidth;
  } else if (left + divWidth > canVasLeft) {
    left = left - divWidth;
  }
  if (top <= 10) {
    top = top + divWidth;
  } else if (top + divHeight > canVastop) {
    top = top - divWidth;
  }
  div.find('#idForNearBySearch').css({'left': left, "top": top});
};
/**
 * @类名：弹出es搜索框
 * @参数：{Object=} opt_options Control options.
 * @用途：弹出es搜索框
 */
com.jiusuo.map.TSearchControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};

  var cgi_cover_flag = opt_options.cgiCorverFlag || false;
  if (cgi_cover_flag) {
    options.tipLabel = "基站覆盖范围查询";
  }
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '时空查询';
  var html = "<div class='list' >"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "            <div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_57.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_57.png' width='36px' height='36px' class='img2'></div>"
    + "          </div>"
    + "          <div class='triangle'></div>"
    + "          <div class='set_pop set_pop7 set_pop_right8' id='idForEsSearch'>"
    + "            <div class='margin'>"
    + "              <div class='title'>" + options.tipLabel + "</div>"
    + "              <div class='net'></div>"
    + "              <div class='wrap'>";

  if (!cgi_cover_flag) {
    var keyHtml = "                <div class='left4'>关键字：</div>"
      + "                <div class='right'>"
      + "                  <input type='text' class='input' id='keyWords'>"
      + "                </div>"
      + "              </div>";
    html = html + keyHtml;
  }


  var content = "              <div class='wrap'>"
    + "                <div class='left4'>搜索类型：</div>"
    + "                <div class='right'>";

  if (!cgi_cover_flag) {
    var drawType = "<img id='mapdraw_point' src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_09.png' style='cursor: pointer;'>" +
      "<img id='mapdraw_line' src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_091.png' style='cursor: pointer;'>";
    content = content + drawType;
  }

  var drawTypeAndContent = "<img id='mapdraw_rect' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_pop_68_18.png' style='cursor: pointer;'>" +
    "<img id='mapdraw_circle' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_pop_68_20.png' style='cursor: pointer;'>" +
    "<img id='mapdraw_polygon' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_pop_22.png' style='cursor: pointer;'></div>"
    + "              </div>"

    + "              <div class='wrap' id='idForEsSearchlineRadus' style='display:none'>"
    + "                <div class='left4'>缓冲半径：</div>"
    + "                <div class='right'>"
    + "                  <input type='text' class='input' id='idForlineRadus'><span>米<span>"
    + "                </div>"
    + "              </div>"

    + "              <div class='wrap'>"
    + "                <div class='left4'>资源类型：</div>"
    + "                <div class='right' id='_basequerysourcetype'>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap'>"
    + "                <div class='center'>"
    + "                  <input id='idForGetEsDataInMap' type='button' value='确定' class='blue submit' style='cursor: pointer;'>"
    + "                  <input type='button' value='取消' class='gray reset' style='cursor: pointer;' id='cancelForEsSearch'>"
    + "                </div>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  html = html + content + drawTypeAndContent;
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);


  if (!cgi_cover_flag) {
    var commonSources = _this._tMap.tMapServiceConfig.esService.commonSources;
    var querySourceNames = [];
    commonSources.forEach(function (querySource) {
      var querySourceObject = {};
      querySourceObject.name = querySource.name;
      querySourceObject.type = querySource.type;

      querySourceNames.push(querySourceObject);
    });
    for (var i = querySourceNames.length - 1; i >= 0; i--) {
      var querySourceName = querySourceNames[i];
      var value = querySourceName.type;
      var name = querySourceName.name;
      var sourcehtml = "                  <label>"
        + "                    <input type='checkbox' name='basequerysourcetype' value='" + value + "'>" + name
        + "                  </label>";
      $('#_basequerysourcetype').prepend($(sourcehtml));
    }
  } else {
    $('#_basequerysourcetype').parent().remove();
  }

  $('#cancelForEsSearch').on('click', function (evt) {
    $('#idForEsSearch').hide();
  });


  $('#idForlineRadus').on('keyup', function (e) {
    this.value = this.value.replace(/\D/g, "");
  });
  $('#idForlineRadus').on('afterpaste', function (e) {
    this.value = this.value.replace(/\D/g, "");
  });

  var tSpaceSearch = new com.jiusuo.map.TSpaceSearch(_this._tMap, cgi_cover_flag);
  $('#mapdraw_rect').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(1);
    $('#idForEsSearchlineRadus').hide();
  });
  $('#mapdraw_circle').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(0);
    $('#idForEsSearchlineRadus').hide();
  });
  $('#mapdraw_polygon').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(2);
    $('#idForEsSearchlineRadus').hide();
  });
  $('#mapdraw_point').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(4);
    $('#idForEsSearchlineRadus').hide();

  });
  $('#mapdraw_line').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(3);
    $('#idForEsSearchlineRadus').show();

  });
  $('#mapdraw_point').on('click', function (evt) {
    tSpaceSearch.drawMapWithPara(4);
    $('#idForEsSearchlineRadus').hide();

  });
};


com.jiusuo.map.TSearchLACControl = function (opt_options) {
  var _this = this;
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '时空查询';
  var html = "<div class='list' >"
    + "          <div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "            <div class='word'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon_57.png' width='36px' height='36px' class='img1'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/font_icon2_57.png' width='36px' height='36px' class='img2'></div>"
    + "          </div>"
    + "          <div class='triangle'></div>"
    + "          <div class='set_pop set_pop8 set_pop_right8' id='idForLacEsSearch'>"
    + "            <div class='margin'>"
    + "              <div class='title'>基站查询</div>"
    + "              <div class='net'></div>"
    + "              <div class='wrap'>"
    + "                <div class='left8'>CGI：</div>"
    + "                <div class='right'>"
    + "                  <input type='text' class='input' id='lacKeyWords'>"
    + "                </div>"
    + "              </div>"
    + "              <div class='margin'>"
    + "                  <div class='checkbox_area'>"
    + "                     <ul id='lacciList'>"
    + "                     </ul>"
    + "                </div>"
    + "              </div>"
    + "              <div class='wrap'>"
    + "                <div class='center'>"
    + "                  <input id='idForGetEsDataForCGIInMap' type='button' value='确定' class='blue submit' style='cursor: pointer;'>"
    + "                  <input type='button' value='取消' class='gray reset' style='cursor: pointer;' id='cancelForEsSearch'>"
    + "                </div>"
    + "              </div>"
    + "            </div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  var div = $(html);

  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  $('#cancelForEsSearch').on('click', function (evt) {
    $('#idForEsSearch').hide();
  });
  $('#lacKeyWords').keydown(function (e) {
    if (e.keyCode == 13) {
      var id = $("#lacKeyWords").val();
      $("#lacKeyWords").val("");
      var bookmarkhtml = "<li><label name='lacid' value='" + id + "'>" + id
        + "</label><img id='" + id + "' src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_close.png'></li>";
      var bookmarkdiv = $(bookmarkhtml);
      $('#lacciList').prepend(bookmarkdiv);
      bookmarkdiv.find('#' + id).on('click', function (evt) {
        var d = dialog({
          title: '提示',
          content: '是否删除该基站?',
          okValue: '确 定',
          ok: function () {
            //this_.deleteRemark(evt.target.id);
            $(evt.target).parent().remove();
            return true;
          },
          cancelValue: '取 消',
          cancel: function () {

          }
        });
        d.showModal();
      });
    }
  })
  new com.jiusuo.map.TSpaceLACSearch(_this._tMap);
};

/**
 * 时空搜索工具类
 * @param tMap可为null
 * @constructor
 */
com.jiusuo.map.TSpaceLACSearch = function (tMap) {
  var _this = this;
  var callbackIndex = 0;//计算时空搜回调函数的计算标签
  this.callbackfun = null;
  var returnEsDatasArrayForTimeSpaceSearch = [];//存储时空搜的数组；
  this.featureForNearBy = null;
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }
  var esQureyObject = new com.jiusuo.map.TEsQuery();
  var esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(com.jiusuo.map.webUrl + '/config/' + com.jiusuo.map.tMap.tMapServiceConfig.esService.esDataCode);
  this.esQureyObject = esQureyObject;
  this.esCodeData = esCodeData;
  var drawFeatures = [];
  //featuresJson数组去重算法start
  var uniqueArrays = function (datas) {
    var res = [];
    var json = {};
    for (var i = 0; i < datas.length; i++) {
      if (!json[datas[i].properties.id]) {
        res.push(datas[i]);
        json[datas[i].properties.id] = 1;
      }
    }

    return res;
  };

  //end

  //合并es查询返回的数组start
  var mergeEsDatas = function () {
    var returnEsDatasArray = tMap.returnEsDatasArray;
    var length = returnEsDatasArray.length;
    var returnAllEsDatas = returnEsDatasArray[length - 1]; //最终合并出的结果数组
    var typeLength = returnAllEsDatas.length;            //结果数组的初始

    if (returnEsDatasArray.length > 1) {
      for (var i = 0; i < returnEsDatasArray.length - 1; i++) {
        var esData = returnEsDatasArray[i]
        esData.forEach(function (data1) {
          var noEqFlag = 0;
          returnAllEsDatas.forEach(function (data2) {
            if (data2.type == data1.type) {
              data2.features = uniqueArrays(data2.features.concat(data1.features));
            } else {
              noEqFlag++;
            }
          });
          if (noEqFlag == typeLength) {
            returnAllEsDatas.push(data1);
            typeLength = returnAllEsDatas.length;
          }
        });
      }
    } else {
      returnAllEsDatas = returnEsDatasArray[0];
    }
    tMap.returnEsDatasArray = [];//把数据置空
    tMap.returnEsDatasArray.push(returnAllEsDatas);
    return returnAllEsDatas;
  };
  //end
  //周边查的回调函数start
  var callBackForReturnDatas = function (esJsonObjects) {
    var returnEsDatas = esQureyObject.show2(esJsonObjects, esCodeData);
    tMap.returnEsDatasArray.push(returnEsDatas);
    returnEsDatas = mergeEsDatas();
    showEsDataList(returnEsDatas, esCodeData);
  };
  //end
  //时空搜的回调函数start
  var callBackForEsReturnDatas = function (esJsonObjects) {
    callbackIndex = callbackIndex + 1;
    var returnEsDatas = esQureyObject.show2(esJsonObjects, esCodeData);
    returnEsDatasArrayForTimeSpaceSearch.push(returnEsDatas);
    tMap.returnEsDatasArray.push(returnEsDatas);
    if (tMap.featureJsonsForES.length > 0) {
      if (callbackIndex == tMap.featureJsonsForES.length) {
        var returnEsDatas = mergeEsDatas();
        showEsDataList(returnEsDatas, esCodeData);
        tMap.featureJsonsForES = [];
      }
    } else {
      var returnEsDatas = mergeEsDatas();
      showEsDataList(returnEsDatas, esCodeData);
      tMap.featureJsonsForES = [];
    }
  };
  //end
  //对时空搜索确定按钮进行监听
  $('#idForGetEsDataForCGIInMap').off("click");
  $('#idForGetEsDataForCGIInMap').on("click", function (evt) {
    callbackIndex = 0;
    returnEsDatasArrayForTimeSpaceSearch = [];//初始化为0;
    evt.preventDefault();
    var sourceArraysForSelect = [];//存储表单所选取的资源类型；
    var keyWords = [];
    var lacSearchword;
    $("#lacciList label").each(function (i, item) {
      keyWords.push($(item).text());
    });
    var keyword = $("#lacKeyWords").val();
    if (keyWords.length > 0 && keyword == "") {
      lacSearchword = keyWords.join(",");
    } else if (keyWords.length == 0 && keyword != "") {
      lacSearchword = keyword;
    } else if (keyWords.length > 0 && keyword != "") {
      keyWords.push(keyword);
      lacSearchword = keyWords.join(",");
    }
    //判断搜索资源条件是否已经填写完整 start
    if (lacSearchword != "") {
      esQureyObject.queryForAsyn(null, ["cgi"], lacSearchword, callBackForEsReturnDatas, true);
    }
    $('#idForLacEsSearch').hide();
    $('#idForLacEsSearch').prev().hide();
  });
  //定义样式 start
  var initDrawStyle = function (text) {
    var style = new com.jiusuo.map.style.TStyle({
      fill: new com.jiusuo.map.style.TFill({
        color: 'rgba(143, 255, 255, 0)',
      }),
      stroke: new com.jiusuo.map.style.TStroke({
        color: 'rgba(143, 255, 255, 1)',
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
    return style;
  };
  //end
  var position = function (data, type, tMap) {
    var callback = null;
    if (tMap == null) {
      tMap = com.jiusuo.map.tMap;
    }
    if (type == 'camera') {
      callback = function (feature) {
        if (feature) {
          var entityObject = feature.properties;
          var desc = JSON.parse(entityObject.desc);
          var snatshotpath = tMap.tMapServiceConfig.vedioServer.snatshotpath;
          var manu = tMap.tMapServiceConfig.vedioServer.manu;
          var domainid = desc.videoserverid;
          var puid = desc.deviceno + '@' + manu;
          var channelid = desc.channelid;
          var x = entityObject.x.toFixed(6);
          var y = entityObject.y.toFixed(6);
          var popupElement = $('<div id="videoContain"></div>');
          var pContent = $('<p>类型：摄像头</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            '<p style="white-space: nowrap;">经纬度：' + x + ',' + y + '</p>');
          var playBtn = $('<button class="vedio_button">播放</button>');
          if (typeof(videoPluginObject) == 'undefined') {
            playBtn.hide();
          }
          playBtn.on('click', function () {
            $('.video_box').width("600px");
            $('.video_box').height("400px");
            $('#videotitle').text((entityObject.name || "无"));
            $('.set_pop_video .video_center').height("310px");
            $('.video_control').show();
            if ($('#videocacaca').html() == "") {
              $('#videocacaca').html($('.video_box'));
            }
            if (typeof(videoPluginObject) != 'undefined') {
              video_handler = new com.jiusuo.map.TVideo.videoPlayHandle(videoPluginObject, domainid, puid, channelid, manu, snatshotpath);
              video_handler.mystart();
            }
          })
          popupElement.append(pContent);
          popupElement.append(playBtn);
          return popupElement[0];
        }
      }
    } else if (type == 'cgi') {
      callback = function (feature) {
        if (feature) {
          var projection = tMap.getProjection().getCode();
          var entityObject = null;
          var iconType = null;
          var geometry = null;
          if (feature.constructor == com.jiusuo.map.TFeature || feature.constructor == ol.Feature) {
            entityObject = feature.get("entityObject");
            iconType = feature.get("iconType");
            geometry = feature.getGeometry();
          } else {
            entityObject = feature.properties.entityObject;
            iconType = feature.properties.iconType;
            geometry = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(feature.geometry), tMap);
          }
          if (!entityObject) {
            return;
          }
          var desc = JSON.parse(entityObject.desc);
          var coorsys = entityObject.coorsys;
          var mobile_carrier = entityObject.mobile_carrier;
          var selectcgilayer = tMap.getVectorLayer('selectcgiVector');
          var coverageVectorLayer = tMap.getVectorLayer('coverageVector');
          var feature = new ol.Feature(geometry);
          feature.set("entityObject", entityObject);
          feature.set("iconType", iconType);
          feature.set("callback", callback);
          var featureclone = feature.clone();
          tMap.cgiCoverageFeatures.push(featureclone);
          selectcgilayer.getSource().addFeature(featureclone);
          //featureclone.setStyle(style);
          switch (mobile_carrier) {
            case 1:
              mobile_carrier = "中国移动";
              break;
            case 2:
              mobile_carrier = "中国联通";
              break;
            case 3:
              mobile_carrier = "中国电信";
              break;
            default:
              mobile_carrier = "";
          }
          var coorsys = entityObject.coorsys;
          var pContent = $('<div class="cgi_content"><p>类型：基站 ' + mobile_carrier + ' ' + desc.network + 'G</p>' +
            '<p>标识：' + entityObject.id + '</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            // '<p>运营商：' + mobile_carrier + '</p>' +
            // '<p>网络制式：  ' + desc.network + 'G   </p>' +
            '<p>首次统计时间：' + desc.first_date + '</p>' +
            '<p>最新统计时间：' + desc.last_date + '</p>' +
            '<div id="CGI_SP" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.sp_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>运营商坐标：' + (desc.sp_longitude || "无") + ',' + (desc.sp_latitude || "无") + '</label></div>' +
            '<div id="CGI_LBS" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.lbs_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>LBS预测坐标：' + (desc.lbs_longitude || "无") + ',' + (desc.lbs_latitude || "无") + '</label></div>' +
            '<div id="CGI_NEAR" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.near_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>邻基站预测坐标：' + (desc.near_longitude || "无") + ',' + (desc.near_latitude || "无") + '</label></div>' +
            '<input type="button" class="buttonstyle" id="getCGICoverage" value="显示基站范围">' +
            '<input type="button" class="buttonstyle" id="getNearByCGI" value="获取邻近基站">' +
            '</div>');
          var repairType = desc.repair_type;
          switch (repairType) {
            case "0":
              pContent.find('#CGI_SP').children().first().attr('disabled', true);
              pContent.find('#CGI_SP').children().last().addClass('underline');
              break;
            case "1":
              pContent.find('#CGI_SP').children().first().attr('disabled', true);
              pContent.find('#CGI_SP').children().last().addClass('underline');
              break;
            case "2":
              pContent.find('#CGI_LBS').children().first().attr('disabled', true);
              pContent.find('#CGI_LBS').children().last().addClass('underline');
              break;
            case "3":
              pContent.find('#CGI_NEAR').children().first().attr('disabled', true);
              pContent.find('#CGI_NEAR').children().last().addClass('underline');
              break;
          }
          pContent.find('div[name=CGI_Type]').each(function (item) {
            var id = $(this).attr('id') + entityObject.id;
            var feature = selectcgilayer.getSource().getFeatureById(id);
            if (feature) {
              $(this).children().first().attr('checked', 'checked');
            }
          });
          if (coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id)) {
            pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
          } else {
            pContent.find('#getCGICoverage').attr("value", "显示基站范围");
          }
          pContent.find('input:checkbox').on('change', function (evt) {
            var id = $(evt.target).parent().attr('id') + entityObject.id;
            var type = "";
            switch (id.substring(0, 5)) {
              case "CGI_S":
                type = "sp_";
                break;
              case "CGI_L":
                type = "lbs_";
                break;
              case "CGI_N":
                type = "near_";
                break;
              default:
                type = "";
            }
            var lon = desc[type + "longitude"];
            var lat = desc[type + "latitude"];
            var feature = selectcgilayer.getSource().getFeatureById(id);
            if (feature) {
              selectcgilayer.getSource().removeFeature(feature)
            } else {

              var coordinates = [lon, lat];
              if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
              }
              if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
              }
              coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, "EPSG:4326", projection);
              var feature = new ol.Feature(new ol.geom.Point(coordinates));
              // map.cgiCoverageFeatures.push(feature);
              tMap.cgiCoverageFeatures.push(feature);
              feature.setId(id);
              feature.setStyle(style);
              selectcgilayer.getSource().addFeature(feature);
            }
          })
          pContent.find('#getCGICoverage').on('click', function () {
            try {
              var feature = coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id);
              if (feature) {
                coverageVectorLayer.getSource().removeFeature(feature);
                pContent.find('#getCGICoverage').attr("value", "显示基站范围");
              } else {
                tMap.addWaitingModel();
                esQureyObject.queryBaseSources("", "cgi_coverage", entityObject.id, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
                pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
              }
            } catch (ex) {
            }
          });
          pContent.find('#getNearByCGI').on('click', function () {

            var nearCgis = JSON.parse(entityObject.desc).near_cgis;
            var idArr = [];
            if (nearCgis) {
              nearCgis = nearCgis.split(',');
              nearCgis.forEach(function (item) {
                var id = "460-0" + item;
                if (item.substring(0, 1) == "1") {
                  id = "460-00" + item.substring(1, item.length);
                } else if (item.substring(0, 1) == "2") {
                  id = "460-01" + item.substring(1, item.length);
                } else {

                }
                var has = false;
                idArr.forEach(function (_id) {
                  if (_id == id) {
                    has = true;
                  }
                });
                if (!has) {
                  idArr.push(id);
                }
              })
            }
            var ids = "";
            idArr.forEach(function (id) {
              ids += "," + id;
            });
            ids = ids.substring(1, ids.length);
            if (ids != "") {
              tMap.addWaitingModel();
              esQureyObject.queryBaseSources("", "cgi", ids, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
            }

          });
          return pContent[0];
        }
      }
    } else if (type == 'case') {
      callback = function (feature) {
        if (feature) {
          var entityObject = feature.properties.entityObject;
          if (!entityObject) {
            return;
          }
          var desc = JSON.parse(entityObject.desc);
          var time1 = desc.fasj1 || null;
          var time2 = desc.fasj2 || null;
          if (time1) {
            time1 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time1) / 1000);
          }
          if (time2) {
            time2 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time2) / 1000);
          }
          var pContent = $('<div class="cgi_content"><p>类型：案件</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            '<p>案件类型：' + (desc.ajlxch || "无") + '</p>' +
            '<p>案件类别：' + (desc.ajlbch || "无") + '</p>' +
            '<p>案发时间：' + time1 + '</p>' +
            '<p>结束时间：  ' + time2 + '</p>' +
            '<p>经纬度坐标：' + entityObject.longitude + ',' + entityObject.latitude + '</p>' +
            '<p>案情描述： </p>' +
            '<div style="height: 150px;width:100%;overflow-y: auto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + (desc.jyaq || "无") + '</div>' +
            '</div>');
          return pContent[0];
        }
      }
    } else {

    }
    var esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(com.jiusuo.map.webUrl + '/config/' + tMap.tMapServiceConfig.esService.esDataCode);
    var coordinates = data.geometry.coordinates;
    var address = data.properties.address || '';
    var innerHTML = '<div style="margin-top: 6%;"><p><span>类型：</span><span>' + esCodeData[type] + '</span></p><p><span>名称：</span><span>' + data.properties.name + '</span></p><p><span>地址：</span><span>' + address + '</span></p><p><span>经纬度：</span><span>' + data.properties.x + ',' + data.properties.y + '</span></p></div>';
    if (tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
      coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
    } else if (tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'gcj02') {
      coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
    } else if (tMap.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
    } else {

    }
    var tOverlay = new com.jiusuo.map.TOverlay({
      innerHTML: innerHTML,
      position: coordinates,
      callback: callback
    });
    tMap.addTOverlay(tOverlay, data);
    //点击时，就定位
    com.jiusuo.map.tMap.getOMap().getView().setCenter(coordinates);
  }
  //根据es结果，在地图上记性展示 start
  var showEsDataList = function (esJsonObjects, esCodeData) {
    if ($('#esDataList') != null) {
      $('#esDataList').remove();
      $('#esDataListForLeft').remove();
    }
    var esDataListDIV = $('<div class="ditu_index_left" style="display: block;" id="esDataList">'
      + '<div class="top">'
      + '<div class="top_inner">'
      + '<div class="marginleft">'
      + '<div class="left">'
      + '<p>查询列表</p>'
      + '</div>'
      + '<div class="right">'
      + '<a href="javascript:void(0)" class="hiden"></a>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="down" style="height: 580px; position: relative; overflow: hidden;">'
      + '<div class="scroll" style="top: 0px; position: absolute;">'
      + '<div class="box" id="esDataListFouUL"></div>'
      + '</div>'
      + '<div style="position: absolute; display: none; line-height: 0; height: 0px;" class="zUIpanelScrollBox"></div>'
      + '<div style="position: absolute; display: none; line-height: 0; height: 0px;" class="zUIpanelScrollBar"></div>'
      + '</div>'
      + '</div>');

    var esDataList = esDataListDIV.find('#esDataListFouUL')
    var filterDiv = $('<div class="input_search"><label>名称过滤：</label> <input id="searchKey" type="text"></div>');
    esDataList.append(filterDiv);
    var divForESlist = $('<div class="esDataScroll"></div>');
    esJsonObjects.forEach(function (esJsonObject) {
      var length = esJsonObject.features.length;
      var rectDatas = esJsonObject.features;
      var name = esCodeData[esJsonObject.type];
      var type = esJsonObject.type;
      var typeName = name + " (" + length + ")";
      var idForResultLength = type + '_idForResultLength';
      var initLength = 0;
      var listBox = $('<div class="list_box " ><div class="name" >'
        + '<img src="' + com.jiusuo.map.webUrl + '/static/mark/' + com.jiusuo.map.iconStyle + type + '.png" width="22px" height="22px">' + name + '<span resultLength="' + length + '" length="' + initLength + '" id="' + idForResultLength + '">(' + length + ')<span></div>'
        + '<ul class="list itemMembers"></ul></div>');
      rectDatas.forEach(function (data, index) {
        if (0 < data.geometry.coordinates[0] < 180 && 0 < data.geometry.coordinates[1] < 90) {
          var name = data.properties.name;
          var id = type + index;
          var li = $('<li class="item" id="' + type + '" data-name="' + name + '"><span id="' + id + '">' + name + '</span></li>');
          setTimeout(function () {
            $('#' + id).on('click', function (evt) {
              position(data, type);
            });
          }, 600);
          listBox.find('.list').append(li);
        }

      });
      divForESlist.append(listBox);
    });
    esDataList.append(divForESlist);
    //增加搜索框
    var leftDiv = $('<div class="left_hide" id="esDataListForLeft"><a href="javascript:void(0)" class="hiden"></a></div>');
    div = esDataListDIV[0];
    $('body').append(esDataListDIV);
    $('body').append(leftDiv);
    //_this._tMap.getOMap().getTargetElement().appendChild(div);
    $('.ditu_index_left .name').on('click', function (e) {
      $(this).next('ul').toggle();
    });
    $('.ditu_index_left .right').on('click', function () {
      $('.ditu_index_left').toggle();
    });
    $('.left_hide').on('click', function (e) {
      $('.ditu_index_left').toggle();
    });
    $('#esDataList').show();
    $('#searchKey').on('keyup', function (e) {
      var value = $(this).val();
      var $el = $('#esDataListFouUL');
      var spans = $el.find('.list_box > .name').find('span');
      spans.each(function (i, v) {
        $(v).attr("length", 0);
        var text = "(0)";
        $(v).text(text);
      });
      if (value) {
        var regexp = new RegExp(value, 'i');
        $el.find('.item, .itemMembers').hide();
        $el.find('.item').each(function (i, v) {
          var $item = $(v);
          if ($item.data('name') && regexp.test($item.data('name'))) {
            var id = $item.attr("id");
            id = id + '_idForResultLength';
            var length = $('#' + id).attr("length");
            length = parseInt(length) + 1;
            $('#' + id).attr("length", length);
            var lengthStr = '(' + length + ')';
            $('#' + id).text(lengthStr);
            $item.show();
            $item.closest('.itemMembers').show();
            $item.closest('.list_box').show();
          }
        });
      } else {
        $el.find('.item, .itemMembers').show();
        spans.each(function (i, v) {
          $(v).attr("length", 0);
          var resultLength
          var text = $(v).attr("resultLength");
          $(v).text('(' + text + ')');
        });
      }

      $el.find('.list_box').scrollTop(0);
    });
    //实现es列表可拖动的功能 start
    $('#esDataList').mousedown(function (evt) {
      var _this = this;
      $(this).css('cursor', 'move');
      var offset = $(this).offset();
      var x = evt.pageX - offset.left//获得鼠标指针离DIV左边界的距离
      var y = evt.pageY - offset.top;//获得鼠标指针离DIV元素上边界的距离
      $(document).bind("mousemove", function (evt) {
        var _x = evt.pageX - x;//获得X轴方向移动的值
        var _y = evt.pageY - y;//获得Y轴方向移动的值
        $('#esDataList').animate({left: _x + 'px', top: _y + 'px'}, 0);

      });
    });
    $(document).mouseup(function () {
      $('#esDataList').css('cursor', 'default');
      $(this).unbind('mousemove');
    });
    //end
  };
  //end
};


/**
 * 根据当前坐标和给定半径，获取相应的资源数据
 * */
com.jiusuo.map.TSpaceSearchForExit = function (callBack, tMap) {
  var _this = this;
  if (tMap == null) {
    this.tMap = com.jiusuo.map.tMap;
  }


  this.esQureyObject = new com.jiusuo.map.TEsQuery();
  var esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(com.jiusuo.map.webUrl + '/config/' + com.jiusuo.map.tMap.tMapServiceConfig.esService.esDataCode);
  var callBackForReturnDatas = function (esJsonObjects, showFlag, inLayerId) {
    var returnEsDatas = _this.esQureyObject.show2(esJsonObjects, esCodeData, showFlag, inLayerId);
  };

  this.seachSource = function (radius, coordinates, selectSource, layerId) {

    var code = _this.tMap.getProjection().getCode();
    coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
    var geometry = new ol.geom.Circle(coordinates, 0);
    //if (code != "EPSG:3857") {
    geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, 'EPSG:4326', 'EPSG:3857');
    // }
    geometry.setRadius(parseInt(radius));
    geometry = com.jiusuo.map.TGeometryUtils._toGeoJsonString(geometry, _this.tMap, 'EPSG:3857');
    var sourceArr = [];
    sourceArr.push(selectSource);
    var result = this.esQureyObject.query(JSON.stringify(geometry), sourceArr, '', callBackForReturnDatas, true, layerId);
    return result;
  }
};


/**
 * 时空搜索工具类
 * @param tMap可为null
 * @constructor
 */
com.jiusuo.map.TSpaceSearch = function (tMap, searchCGICoverage) {
  var _this = this;
  var callbackIndex = 0;//计算时空搜回调函数的计算标签
  this.callbackfun = null;
  var returnEsDatasArrayForTimeSpaceSearch = [];//存储时空搜的数组；
  this.featureForNearBy = null;
  if (tMap == null) {
    tMap = com.jiusuo.map.tMap;
  }

  var controlContainer = tMap.getOMap().getTargetElement().id;
  var searchCGICoverageFlag = searchCGICoverage || false;
  var esQureyObject = new com.jiusuo.map.TEsQuery();
  var esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(com.jiusuo.map.webUrl + '/config/' + com.jiusuo.map.tMap.tMapServiceConfig.esService.esDataCode);
  this.esQureyObject = esQureyObject;
  this.esCodeData = esCodeData;
  var drawFeatures = [];
  this.setFeatureForNearBy = function (feature) {
    _this.featureForNearBy = feature;
  };
  this.setCallbackfun = function (callback) {
    _this.callbackfun = callback;
  };
  //根据传入的类型，在地图上画区域
  //type 0:circle,1:rect,2:poly
  this.drawMapWithPara = function (drawType) {
    var _this = this;
    //面初始化样式
    var initDrawPolyStye = function () {
      var style = new com.jiusuo.map.style.TStyle({
        fill: new com.jiusuo.map.style.TFill({
          color: 'rgba(143, 255, 255, 0)',
        }),
        stroke: new com.jiusuo.map.style.TStroke({
          color: 'rgba(143, 255, 255, 1)',
          lineDash: [10, 10],
          width: 2
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
    var drawStartFunction = function () {
    };
    var drawEndFunctionForES = function (evt) {
      tMap.removeCurrentInteraction('draw');
      var style = initDrawPolyStye();
      evt.feature.setStyle(style);
      var feature = evt.feature;
      var id = com.jiusuo.map.TUtils.createGUID();
      feature.setId(id);
      drawFeatures.push(feature);
      if (feature.getGeometry().getType() == "LineString") {
        tMap.featureJsonsForES.push(feature);
      } else {
        var featureJson;
        if (feature.getGeometry().getType() == "Point") {
          var center = feature.getGeometry().getCoordinates();
          var geomCircle = new com.jiusuo.map.geom.TCircle(center, 1);
          featureJson = com.jiusuo.map.TGeometryUtils.toFeatureJsonString(geomCircle);
        } else {
          featureJson = com.jiusuo.map.TGeometryUtils.toFeatureJsonString(feature.getGeometry());
        }
        tMap.featureJsonsForES.push(featureJson);
      }
    };
    var addTCircle = function (evt) {
      var style = initDrawPolyStye();
      var tDraw = new com.jiusuo.map.TDraw({
        style: style,
        startFunction: drawStartFunction,
        endFunction: drawEndFunctionForES
      });
      tDraw.DrawHandle("Circle");

    };
    //画矩形 start
    var addRect = function (evt) {
      var style = initDrawPolyStye();
      var tDraw = new com.jiusuo.map.TDraw({
        style: style,
        startFunction: drawStartFunction,
        endFunction: drawEndFunctionForES
      });
      tDraw.DrawHandle("Rectangle");
    };
    //end
    var drawPoly = function (evt) {
      var style = initDrawPolyStye();
      var tDraw = new com.jiusuo.map.TDraw({
        style: style,
        startFunction: drawStartFunction,
        endFunction: drawEndFunctionForES
      });
      tDraw.DrawHandle("Polygon");
    };
    var drawLine = function (evt) {
      var style = initDrawPolyStye();
      var tDraw = new com.jiusuo.map.TDraw({
        style: style,
        startFunction: drawStartFunction,
        endFunction: drawEndFunctionForES
      });
      tDraw.DrawHandle("LineString");
    };
    var drawPoint = function (evt) {
      var style = initDrawPolyStye();
      var tDraw = new com.jiusuo.map.TDraw({
        style: style,
        startFunction: drawStartFunction,
        endFunction: drawEndFunctionForES
      });
      tDraw.DrawHandle("Point");
    };
    switch (drawType) {
      case 0:
        addTCircle();
        break;
      case 1:
        addRect();
        break;
      case 2:
        drawPoly();
        break;
      case 3:
        drawLine();
        break;
      case 4:
        drawPoint();
        break;
    }
  };
  //定义在地图画区域 start
  var drawInMap = function (geometry) {
    var feature = new ol.Feature();
    feature.setGeometry(geometry);
    var style = initDrawStyle();
    feature.setStyle(style);
    com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource().addFeature(feature);
    drawFeatures.push(feature);
  };
  //end
  $('#cancelForNearby').on("click", function (evt) {
    $('#idForNearBySearch').first().remove();
    $('#epMenu').first().remove();
  });

  //featuresJson数组去重算法start
  var uniqueArrays = function (datas) {
    var res = [];
    var json = {};
    for (var i = 0; i < datas.length; i++) {
      if (!json[datas[i].properties.id]) {
        res.push(datas[i]);
        json[datas[i].properties.id] = 1;
      }
    }

    return res;
  };

  //end

  //合并es查询返回的数组start
  var mergeEsDatas = function () {
    var returnEsDatasArray = tMap.returnEsDatasArray;
    var length = returnEsDatasArray.length;
    var returnAllEsDatas = returnEsDatasArray[length - 1]; //最终合并出的结果数组
    var typeLength = returnAllEsDatas.length;            //结果数组的初始

    if (returnEsDatasArray.length > 1) {
      for (var i = 0; i < returnEsDatasArray.length - 1; i++) {
        var esData = returnEsDatasArray[i]
        esData.forEach(function (data1) {
          var noEqFlag = 0;
          returnAllEsDatas.forEach(function (data2) {
            if (data2.type == data1.type) {
              data2.features = uniqueArrays(data2.features.concat(data1.features));
            } else {
              noEqFlag++;
            }
          });
          if (noEqFlag == typeLength) {
            returnAllEsDatas.push(data1);
            typeLength = returnAllEsDatas.length;
          }
        });
      }
    } else {
      returnAllEsDatas = returnEsDatasArray[0];
    }
    tMap.returnEsDatasArray = [];//把数据置空
    tMap.returnEsDatasArray.push(returnAllEsDatas);
    return returnAllEsDatas;
  };
  //end
  //周边查的回调函数start
  var callBackForReturnDatas = function (esJsonObjects) {
    var returnEsDatas = esQureyObject.show2(esJsonObjects, esCodeData);
    tMap.returnEsDatasArray.push(returnEsDatas);
    returnEsDatas = mergeEsDatas();
    showEsDataList(returnEsDatas, esCodeData);
  };
  //end
  //针对周边搜查的es start
  $('#idForNearByGetEsDataInMap').off("click");
  $('#idForNearByGetEsDataInMap').on("click", function (evt) {
    var featureForNearBy = _this.featureForNearBy;
    var sourceArraysForSelect = [];//存储表单所选取的资源类型；
    var keyWords = "";
    keyWords = $("#keyWordsForNearby").val();
    var searchRadius = $("#searchRadius").val();
    //判断搜索资源条件是否已经填写完整 start
    var index = 1;
    var checkbox = 0;
    $('input:checkbox[name=basequerysourcetypeForNearBy]:checked').each(function (i, v) {
      var $checkBox = $(v);
      sourceArraysForSelect.push($checkBox.attr("value"));
      index++;
    });
    if (checkbox == $('input:checkbox[name=basequerysourcetypeForNearBy]:checked').length) {
      var d = dialog({
        title: '提示',
        content: '请选择资源！'
      });
      d.showModal();
      return;
    }
    if (!searchRadius && !keyWords) {
      var d = dialog({
        title: '提示',
        content: '请输入半径或者关键字'
      });
      d.showModal();
      return;
    }
    var code = tMap.getProjection().getCode();
    if (searchRadius) {
      var coordinates = featureForNearBy.getGeometry().getCoordinates();
      var geometry = new ol.geom.Circle(coordinates, 0);
      if (code != "EPSG:3857") {
        geometry = com.jiusuo.map.TGeometryUtils.geomtransform(geometry, code, 'EPSG:3857');
      }
      geometry.setRadius(parseInt(searchRadius));
      geometry = com.jiusuo.map.TGeometryUtils._toGeoJsonString(geometry, tMap, 'EPSG:3857');
      if (_this.callbackfun != null) {
        _this.callbackfun(geometry);
      }
      esQureyObject.queryForAsyn(JSON.stringify(geometry), sourceArraysForSelect, keyWords, callBackForReturnDatas, true);
    } else {
      geometry = "";
      if (_this.callbackfun != null) {
        _this.callbackfun(geometry);
      }
      esQureyObject.queryForAsyn(null, sourceArraysForSelect, keyWords, callBackForReturnDatas, true);
    }

    var returnEsDatasArray = [];

    $('#idForNearBySearch').first().remove();
  });
  //end
  //时空搜的回调函数start
  var callBackForEsReturnDatas = function (esJsonObjects) {
    callbackIndex = callbackIndex + 1;
    var returnEsDatas = esQureyObject.show2(esJsonObjects, esCodeData);
    returnEsDatasArrayForTimeSpaceSearch.push(returnEsDatas);
    tMap.returnEsDatasArray.push(returnEsDatas);
    if (tMap.featureJsonsForES.length > 0) {
      if (callbackIndex == tMap.featureJsonsForES.length) {
        var returnEsDatas = mergeEsDatas();
        showEsDataList(returnEsDatas, esCodeData);
        tMap.featureJsonsForES = [];
      }
    } else {
      var returnEsDatas = mergeEsDatas();
      showEsDataList(returnEsDatas, esCodeData);
      tMap.featureJsonsForES = [];
    }
  };
  //end


  //查询基站覆盖范围的回调函数start
  var callBackForCGICover = function (esJsonObjects) {
    var returnEsDatas = esQureyObject.show2(esJsonObjects, esCodeData);

    console.log(returnEsDatas);
    var ids = [];
    returnEsDatas.forEach(function (esData) {
      var features = esData.features
      features.forEach(function (feature) {
        ids.push(feature.properties.id);
      });
    });

    var selectSource = ["cgi"];
    if (ids.length > 0) {
      esQureyObject.queryForAsyn(null, selectSource, ids.join(","), callBackForEsReturnDatas, true);
    }


  };
  //end

  //对时空搜索确定按钮进行监听
  $('#idForGetEsDataInMap').off("click");
  $('#idForGetEsDataInMap').on("click", function (evt) {
    if (!searchCGICoverageFlag) {
      callbackIndex = 0;
      returnEsDatasArrayForTimeSpaceSearch = [];//初始化为0;
      evt.preventDefault();
      var sourceArraysForSelect = [];//存储表单所选取的资源类型；
      var keyWords = "";
      keyWords = $("#keyWords").val();
      //判断搜索资源条件是否已经填写完整 start
      var index = 1;
      var checkbox = 0;
      $('input:checkbox[name=basequerysourcetype]:checked').each(function (i, v) {
        var $checkBox = $(v);
        sourceArraysForSelect.push($checkBox.attr("value"));
        index++;
      });
      if (checkbox == $('input:checkbox[name=basequerysourcetype]:checked').length) {
        var d = dialog({
          title: '提示',
          content: '请选择资源！'
        });
        d.showModal();
        return;
      }
      if (tMap.featureJsonsForES.length > 0) {
        tMap.featureJsonsForES.forEach(function (featureObject) {
          var geometryObject = featureObject.geometry;
          if (!geometryObject) {
            geometryObject = featureObject.getGeometry();
            var lineRadius = $("#idForlineRadus").val();
            if (!lineRadius && !keyWords) {
              var d = dialog({
                title: '提示',
                content: '请输入缓冲半径或者关键字！'
              });
              d.showModal();
              return;
            }
            lineRadius = lineRadius || "0";
            if (lineRadius == "0") {
              var feature = com.jiusuo.map.TGeometryUtils.toFeatureJsonString(geometryObject)
              esQureyObject.queryForAsyn(JSON.stringify(feature.geometry), sourceArraysForSelect, keyWords, callBackForEsReturnDatas, true);
            } else {
              var geom = com.jiusuo.map.TGeometryUtils.createBuffer(geometryObject, lineRadius, false, null);
              var f = new ol.Feature();
              f.setGeometry(geom);
              com.jiusuo.map.tMap.getVectorLayer('baseVector').getSource().addFeature(f);
              var featureObject = com.jiusuo.map.TGeometryUtils.toFeatureJsonString(geom);
              esQureyObject.queryForAsyn(JSON.stringify(featureObject.geometry), sourceArraysForSelect, keyWords, callBackForEsReturnDatas, true);
            }
          } else {
            esQureyObject.queryForAsyn(JSON.stringify(geometryObject), sourceArraysForSelect, keyWords, callBackForEsReturnDatas, true);
          }
          //end
          $("#" + controlContainer).find('.set_pop.set_pop7.set_pop_right8').hide();
        });
      } else {
        if (!keyWords) {
          var d = dialog({
            title: '提示',
            content: '请输入关键字！'
          });
          d.showModal();
          return;
        }
        esQureyObject.queryForAsyn(null, sourceArraysForSelect, keyWords, callBackForEsReturnDatas, true);
        $("#" + controlContainer).find('.set_pop.set_pop7.set_pop_right8').hide()

      }
    } else {
      callbackIndex = 0;
      var sourceArraysForSelect = ["cgi_coverage"];
      tMap.featureJsonsForES.forEach(function (featureObject) {
        var geometryObject = featureObject.geometry;

        esQureyObject.queryForAsyn(JSON.stringify(geometryObject), sourceArraysForSelect, "", callBackForCGICover, true);

        //end
        $("#" + controlContainer).find('.set_pop.set_pop7.set_pop_right8').hide()
      });
    }

  });
  //定义样式 start
  var initDrawStyle = function (text) {
    var style = new com.jiusuo.map.style.TStyle({
      fill: new com.jiusuo.map.style.TFill({
        color: 'rgba(143, 255, 255, 0)',
      }),
      stroke: new com.jiusuo.map.style.TStroke({
        color: 'rgba(143, 255, 255, 1)',
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
    return style;
  };
  //end
  var position = function (data, type, tMap) {
    var callback = null;
    if (tMap == null) {
      tMap = com.jiusuo.map.tMap;
    }
    if (type == 'camera') {
      callback = function (feature) {
        if (feature) {
          var entityObject = feature.properties;
          var desc = JSON.parse(entityObject.desc);
          var snatshotpath = tMap.tMapServiceConfig.vedioServer.snatshotpath;
          var manu = tMap.tMapServiceConfig.vedioServer.manu;
          var domainid = desc.videoserverid;
          var puid = desc.deviceno + '@' + manu;
          var channelid = desc.channelid;
          var x = entityObject.x.toFixed(6);
          var y = entityObject.y.toFixed(6);
          var popupElement = $('<div id="videoContain"></div>');
          var pContent = $('<p>类型：摄像头</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            '<p style="white-space: nowrap;">经纬度：' + x + ',' + y + '</p>');
          var playBtn = $('<button class="vedio_button">播放</button>');
          if (typeof(videoPluginObject) == 'undefined') {
            playBtn.hide();
          }
          playBtn.on('click', function () {
            $('.video_box').width("600px");
            $('.video_box').height("400px");
            $('#videotitle').text((entityObject.name || "无"));
            $('.set_pop_video .video_center').height("310px");
            $('.video_control').show();
            if ($('#videocacaca').html() == "") {
              $('#videocacaca').html($('.video_box'));
            }
            if (typeof(videoPluginObject) != 'undefined') {
              video_handler = new com.jiusuo.map.TVideo.videoPlayHandle(videoPluginObject, domainid, puid, channelid, manu, snatshotpath);
              video_handler.mystart();
            }
          })
          popupElement.append(pContent);
          popupElement.append(playBtn);
          return popupElement[0];
        }
      }
    } else if (type == 'cgi') {
      callback = function (feature) {
        if (feature) {
          var projection = tMap.getProjection().getCode();
          var entityObject = null;
          var iconType = null;
          var geometry = null;
          if (feature.constructor == com.jiusuo.map.TFeature || feature.constructor == ol.Feature) {
            entityObject = feature.get("entityObject");
            iconType = feature.get("iconType");
            geometry = feature.getGeometry();
          } else {
            entityObject = feature.properties.entityObject;
            iconType = feature.properties.iconType;
            geometry = com.jiusuo.map.TGeometryUtils.geojsonToGeometry(JSON.stringify(feature.geometry), tMap);
          }
          if (!entityObject) {
            return;
          }
          var desc = JSON.parse(entityObject.desc);
          var coorsys = entityObject.coorsys;
          var mobile_carrier = entityObject.mobile_carrier;
          var selectcgilayer = tMap.getVectorLayer('selectcgiVector');
          var coverageVectorLayer = tMap.getVectorLayer('coverageVector');
          var feature = new ol.Feature(geometry);
          feature.set("entityObject", entityObject);
          feature.set("iconType", iconType);
          feature.set("callback", callback);
          var featureclone = feature.clone();
          tMap.cgiCoverageFeatures.push(featureclone);
          selectcgilayer.getSource().addFeature(featureclone);
          //featureclone.setStyle(style);
          switch (mobile_carrier) {
            case 1:
              mobile_carrier = "中国移动";
              break;
            case 2:
              mobile_carrier = "中国联通";
              break;
            case 3:
              mobile_carrier = "中国电信";
              break;
            default:
              mobile_carrier = "";
          }
          var coorsys = entityObject.coorsys;
          var pContent = $('<div class="cgi_content"><p>类型：基站 ' + mobile_carrier + ' ' + desc.network + 'G</p>' +
            '<p>标识：' + entityObject.id + '</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            // '<p>运营商：' + mobile_carrier + '</p>' +
            // '<p>网络制式：  ' + desc.network + 'G   </p>' +
            '<p>首次统计时间：' + desc.first_date + '</p>' +
            '<p>最新统计时间：' + desc.last_date + '</p>' +
            '<div id="CGI_SP" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.sp_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>运营商坐标：' + (desc.sp_longitude || "无") + ',' + (desc.sp_latitude || "无") + '</label></div>' +
            '<div id="CGI_LBS" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.lbs_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>LBS预测坐标：' + (desc.lbs_longitude || "无") + ',' + (desc.lbs_latitude || "无") + '</label></div>' +
            '<div id="CGI_NEAR" name="CGI_Type"><input type="checkbox"  class="checkboxstyle" ' + (desc.near_longitude == 0 ? ("disabled=" + '"disabled"') : "") + '><label>邻基站预测坐标：' + (desc.near_longitude || "无") + ',' + (desc.near_latitude || "无") + '</label></div>' +
            '<input type="button" class="buttonstyle" id="getCGICoverage" value="显示基站范围">' +
            '<input type="button" class="buttonstyle" id="getNearByCGI" value="获取邻近基站">' +
            '</div>');
          var repairType = desc.repair_type;
          switch (repairType) {
            case "0":
              pContent.find('#CGI_SP').children().first().attr('disabled', true);
              pContent.find('#CGI_SP').children().last().addClass('underline');
              break;
            case "1":
              pContent.find('#CGI_SP').children().first().attr('disabled', true);
              pContent.find('#CGI_SP').children().last().addClass('underline');
              break;
            case "2":
              pContent.find('#CGI_LBS').children().first().attr('disabled', true);
              pContent.find('#CGI_LBS').children().last().addClass('underline');
              break;
            case "3":
              pContent.find('#CGI_NEAR').children().first().attr('disabled', true);
              pContent.find('#CGI_NEAR').children().last().addClass('underline');
              break;
          }
          pContent.find('div[name=CGI_Type]').each(function (item) {
            var id = $(this).attr('id') + entityObject.id;
            var feature = selectcgilayer.getSource().getFeatureById(id);
            if (feature) {
              $(this).children().first().attr('checked', 'checked');
            }
          });
          if (coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id)) {
            pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
          } else {
            pContent.find('#getCGICoverage').attr("value", "显示基站范围");
          }
          pContent.find('input:checkbox').on('change', function (evt) {
            var id = $(evt.target).parent().attr('id') + entityObject.id;
            var type = "";
            switch (id.substring(0, 5)) {
              case "CGI_S":
                type = "sp_";
                break;
              case "CGI_L":
                type = "lbs_";
                break;
              case "CGI_N":
                type = "near_";
                break;
              default:
                type = "";
            }
            var lon = desc[type + "longitude"];
            var lat = desc[type + "latitude"];
            var feature = selectcgilayer.getSource().getFeatureById(id);
            if (feature) {
              selectcgilayer.getSource().removeFeature(feature)
            } else {

              var coordinates = [lon, lat];
              if (projection == 'EPSG:4326' && coorsys == 'gcj02') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
              }
              if (projection == 'EPSG:3857' && coorsys == 'wgs84') {
                coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
              }
              coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, "EPSG:4326", projection);
              var feature = new ol.Feature(new ol.geom.Point(coordinates));
              // map.cgiCoverageFeatures.push(feature);
              tMap.cgiCoverageFeatures.push(feature);
              feature.setId(id);
              feature.setStyle(style);
              selectcgilayer.getSource().addFeature(feature);
            }
          })
          pContent.find('#getCGICoverage').on('click', function () {
            try {
              var feature = coverageVectorLayer.getSource().getFeatureById("coverage" + entityObject.id);
              if (feature) {
                coverageVectorLayer.getSource().removeFeature(feature);
                pContent.find('#getCGICoverage').attr("value", "显示基站范围");
              } else {
                tMap.addWaitingModel();
                esQureyObject.queryBaseSources("", "cgi_coverage", entityObject.id, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
                pContent.find('#getCGICoverage').attr("value", "隐藏基站范围");
              }
            } catch (ex) {
            }
          });
          pContent.find('#getNearByCGI').on('click', function () {

            var nearCgis = JSON.parse(entityObject.desc).near_cgis;
            var idArr = [];
            if (nearCgis) {
              nearCgis = nearCgis.split(',');
              nearCgis.forEach(function (item) {
                var id = "460-0" + item;
                if (item.substring(0, 1) == "1") {
                  id = "460-00" + item.substring(1, item.length);
                } else if (item.substring(0, 1) == "2") {
                  id = "460-01" + item.substring(1, item.length);
                } else {

                }
                var has = false;
                idArr.forEach(function (_id) {
                  if (_id == id) {
                    has = true;
                  }
                });
                if (!has) {
                  idArr.push(id);
                }
              })
            }
            var ids = "";
            idArr.forEach(function (id) {
              ids += "," + id;
            });
            ids = ids.substring(1, ids.length);
            if (ids != "") {
              tMap.addWaitingModel();
              esQureyObject.queryBaseSources("", "cgi", ids, com.jiusuo.map.TEsBaseLayerControl.cgicoveragecallback);
            }

          });
          return pContent[0];
        }
      }
    } else if (type == 'case') {
      callback = function (feature) {
        if (feature) {
          var entityObject = feature.properties.entityObject;
          if (!entityObject) {
            return;
          }
          var desc = JSON.parse(entityObject.desc);
          var time1 = desc.fasj1 || null;
          var time2 = desc.fasj2 || null;
          if (time1) {
            time1 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time1) / 1000);
          }
          if (time2) {
            time2 = com.jiusuo.map.TimeLineUtils.js_date_time(parseInt(time2) / 1000);
          }
          var pContent = $('<div class="cgi_content"><p>类型：案件</p>' +
            '<p>名称：' + (entityObject.name || "无") + '</p>' +
            '<p>地址：' + (entityObject.address || "无") + '</p>' +
            '<p>案件类型：' + (desc.ajlxch || "无") + '</p>' +
            '<p>案件类别：' + (desc.ajlbch || "无") + '</p>' +
            '<p>案发时间：' + time1 + '</p>' +
            '<p>结束时间：  ' + time2 + '</p>' +
            '<p>经纬度坐标：' + entityObject.longitude + ',' + entityObject.latitude + '</p>' +
            '<p>案情描述： </p>' +
            '<div style="height: 150px;width:100%;overflow-y: auto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + (desc.jyaq || "无") + '</div>' +
            '</div>');
          return pContent[0];
        }
      }
    } else {

    }
    var esCodeData = com.jiusuo.map.TUtils.loadJsonDoc(com.jiusuo.map.webUrl + '/config/' + tMap.tMapServiceConfig.esService.esDataCode);
    var coordinates = data.geometry.coordinates;
    var address = data.properties.address || '';
    var innerHTML = '<div style="margin-top: 6%;"><p><span>类型：</span><span>' + esCodeData[type] + '</span></p><p><span>名称：</span><span>' + data.properties.name + '</span></p><p><span>地址：</span><span>' + address + '</span></p><p><span>经纬度：</span><span>' + data.properties.x + ',' + data.properties.y + '</span></p></div>';
    if (tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'wgs84') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([coordinates])[0];
      coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
    } else if (tMap.getProjection().getCode() == 'EPSG:3857' && com.jiusuo.map.dataCoorsys == 'gcj02') {
      coordinates = com.jiusuo.map.TGeometryUtils.coortransform(coordinates, 'EPSG:4326', tMap.getProjection().getCode());
    } else if (tMap.getProjection().getCode() == 'EPSG:4326' && com.jiusuo.map.dataCoorsys == 'gcj02') {
      coordinates = com.jiusuo.map.TGeometryUtils.worldGcj02ToWgs84ofPoints([coordinates])[0];
    } else {

    }
    var tOverlay = new com.jiusuo.map.TOverlay({
      innerHTML: innerHTML,
      position: coordinates,
      callback: callback
    });
    tMap.addTOverlay(tOverlay, data);
    //点击时，就定位
    com.jiusuo.map.tMap.getOMap().getView().setCenter(coordinates);
  }
  //根据es结果，在地图上记性展示 start
  var showEsDataList = function (esJsonObjects, esCodeData) {
    if ($('#esDataList') != null) {
      $('#esDataList').remove();
      $('#esDataListForLeft').remove();
    }
    var esDataListDIV = $('<div class="ditu_index_left" style="display: block;" id="esDataList">'
      + '<div class="top">'
      + '<div class="top_inner">'
      + '<div class="marginleft">'
      + '<div class="left">'
      + '<p>查询列表</p>'
      + '</div>'
      + '<div class="right">'
      + '<a href="javascript:void(0)" class="hiden"></a>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="down" style="height: 580px; position: relative; overflow: hidden;">'
      + '<div class="scroll" style="top: 0px; position: absolute;">'
      + '<div class="box" id="esDataListFouUL"></div>'
      + '</div>'
      + '<div style="position: absolute; display: none; line-height: 0; height: 0px;" class="zUIpanelScrollBox"></div>'
      + '<div style="position: absolute; display: none; line-height: 0; height: 0px;" class="zUIpanelScrollBar"></div>'
      + '</div>'
      + '</div>');

    var esDataList = esDataListDIV.find('#esDataListFouUL')
    var filterDiv = $('<div class="input_search"><label>名称过滤：</label> <input id="searchKey" type="text"></div>');
    esDataList.append(filterDiv);
    var divForESlist = $('<div class="esDataScroll"></div>');
    esJsonObjects.forEach(function (esJsonObject) {
      var length = esJsonObject.features.length;
      var rectDatas = esJsonObject.features;
      var name = esCodeData[esJsonObject.type];
      var type = esJsonObject.type;
      var typeName = name + " (" + length + ")";
      var idForResultLength = type + '_idForResultLength';
      var initLength = 0;
      var listBox = $('<div class="list_box " ><div class="name" >'
        + '<img src="' + com.jiusuo.map.webUrl + '/static/mark/' + com.jiusuo.map.iconStyle + type + '.png" width="22px" height="22px">' + name + '<span resultLength="' + length + '" length="' + initLength + '" id="' + idForResultLength + '">(' + length + ')<span></div>'
        + '<ul class="list itemMembers"></ul></div>');
      rectDatas.forEach(function (data, index) {
        var name = data.properties.name;
        var id = type + index;
        var li = $('<li class="item" id="' + type + '" data-name="' + name + '"><span id="' + id + '">' + name + '</span></li>');
        setTimeout(function () {
          $('#' + id).on('click', function (evt) {
            position(data, type);
          });
        }, 600);
        listBox.find('.list').append(li);
      });
      divForESlist.append(listBox);
    });
    esDataList.append(divForESlist);
    //增加搜索框
    var leftDiv = $('<div class="left_hide" id="esDataListForLeft"><a href="javascript:void(0)" class="hiden"></a></div>');
    div = esDataListDIV[0];
    $('body').append(esDataListDIV);
    $('body').append(leftDiv);
    //_this._tMap.getOMap().getTargetElement().appendChild(div);
    $('.ditu_index_left .name').on('click', function (e) {
      $(this).next('ul').toggle();
    });
    $('.ditu_index_left .right').on('click', function () {
      $('.ditu_index_left').toggle();
    });
    $('.left_hide').on('click', function (e) {
      $('.ditu_index_left').toggle();
    });
    $('#esDataList').show();
    $('#searchKey').on('keyup', function (e) {
      var value = $(this).val();
      var $el = $('#esDataListFouUL');
      var spans = $el.find('.list_box > .name').find('span');
      spans.each(function (i, v) {
        $(v).attr("length", 0);
        var text = "(0)";
        $(v).text(text);
      });
      if (value) {
        var regexp = new RegExp(value, 'i');
        $el.find('.item, .itemMembers').hide();
        $el.find('.item').each(function (i, v) {
          var $item = $(v);
          if ($item.data('name') && regexp.test($item.data('name'))) {
            var id = $item.attr("id");
            id = id + '_idForResultLength';
            var length = $('#' + id).attr("length");
            length = parseInt(length) + 1;
            $('#' + id).attr("length", length);
            var lengthStr = '(' + length + ')';
            $('#' + id).text(lengthStr);
            $item.show();
            $item.closest('.itemMembers').show();
            $item.closest('.list_box').show();
          }
        });
      } else {
        $el.find('.item, .itemMembers').show();
        spans.each(function (i, v) {
          $(v).attr("length", 0);
          var resultLength
          var text = $(v).attr("resultLength");
          $(v).text('(' + text + ')');
        });
      }

      $el.find('.list_box').scrollTop(0);
    });
    //实现es列表可拖动的功能 start
    $('#esDataList').mousedown(function (evt) {
      var _this = this;
      $(this).css('cursor', 'move');
      var offset = $(this).offset();
      var x = evt.pageX - offset.left//获得鼠标指针离DIV左边界的距离
      var y = evt.pageY - offset.top;//获得鼠标指针离DIV元素上边界的距离
      $(document).bind("mousemove", function (evt) {
        var _x = evt.pageX - x;//获得X轴方向移动的值
        var _y = evt.pageY - y;//获得Y轴方向移动的值
        $('#esDataList').animate({left: _x + 'px', top: _y + 'px'}, 0);

      });
    });
    $(document).mouseup(function () {
      $('#esDataList').css('cursor', 'default');
      $(this).unbind('mousemove');
    });
    //end
  };
  this.showEsDataList = showEsDataList;
  //end
};
/**
 * 点飞行工具类
 * @param
 * @constructor
 */
com.jiusuo.map.TPointFlyBak = function () {
  /*plist是对象数组，其对象内容包括：{ sourceFeature：需被移动的点要素
     sourceStyle：原要素的样式 *.getStyle()
     sourceCoord：原要素的坐标  *.getGeometry().getCoordinates()
     targetCoord：目标坐标：
     index：0，必须为0；
     */
  this.playFunction = null;
  this.pointList = [];
  var _this = this;
  var map = com.jiusuo.map.tMap.getOMap();
  this.startPlay = function () {
    _this.playFunction = setInterval(function () {

      if (_this.pointList.length > 0) {
        _this.TPointFlyFunction();
      }
    }, 50)
  };
  this.stopPlay = function () {
    if (this.playFunction) {
      clearInterval(_this.playFunction);
      _this.pointList.forEach(function (item) {
        var id = item.id;
        var overlay = map.getOverlayById(id);
        map.removeOverlay(overlay);
      })
      _this.pointList = [];
      _this.playFunction = null;
    }
  }
  this.addPoint = function (obj) {
    this.pointList.push(obj);
  };
  this.TPointFlyFunction = function () {
    _this.pointList.forEach(function (item) {
      //item.getProperties().data.usernum;
      var i = item.index;
      var sourceFeature = item.sourceFeature;
      var id = item.id;
      var correctCoord = item.targetCoord;
      var phone_num = item.phone_num;
      //获取原有要素的位置信息
      var sourceCoord = item.sourceCoord;
      var tempstyle = sourceFeature.getStyle();
      var callback = item.callback || function () {
      };
      var overlay = map.getOverlayById(id);
      if (!overlay) {
        var element = document.createElement('div');
        element.className = 'css_animation';
        map.getTargetElement().appendChild(element);
        overlay = new ol.Overlay({
          id: id,
          element: element,
          position: sourceCoord,
          positioning: 'center-center'
        })
        map.addOverlay(overlay);
      }
      if (i >= 1.02) {
        sourceFeature.setGeometry(new ol.geom.Point(correctCoord));
        com.jiusuo.map.tMap.changeHeadImagePosition(phone_num, correctCoord);
        item.index = 1;
        _this.pointList.splice($.inArray(item, _this.pointList), 1);
        map.removeOverlay(overlay);
        callback(sourceFeature);
      } else {
        var coord = [sourceCoord[0] * (1 - i) + correctCoord[0] * i, sourceCoord[1] * (1 - i) + correctCoord[1] * i];
        overlay.setPosition(coord);
        sourceFeature.setGeometry(null);
        com.jiusuo.map.tMap.changeHeadImagePosition(phone_num, coord);
        var tempGeo = new ol.geom.Point(coord);
        //设置点移动时的样式，可以选择与原有样式相同

        if (tempstyle) {
          item.sourceFeature.setStyle(tempstyle);
        }
        item.sourceFeature.setGeometry(tempGeo);
        item.index += 0.02;
      }
    })
  }
};
/**
 * 地图级别控制工具控件
 * @param option_opts对象{'tMap':com.jiusuo.map.TMap对象}
 * @constructor tMap可为null
 */
com.jiusuo.map.TZoomSlider = function (opt_options) {
  var _this = this;
  var options = opt_options ? opt_options : {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var html = "<div class='small_scale set_pop' style='display: block;'>"
    + "        <div class='small_scale_box'>"
    + "          <div class='minus'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/scale_14_plus_09.png'></div>"
    + "          <div class='degree'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/scale_14_plus_11.png'>"
    + "            <div class='marks'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/ditu_small_scale_03.png'></div>"
    + "          </div>"
    + "          <div class='plus'><img src='" + com.jiusuo.map.webUrl + "/static/imgditu/scale_14_plus_06.png'></div>"
    + "          <div class='num_list'>"
    + "            <div class='bit num'>0</div>"
    + "            <div class='bit num'>2</div>"
    + "            <div class='bit num'>4</div>"
    + "            <div class='bit num'>6</div>"
    + "            <div class='bit num'>8</div>"
    + "            <div class='num'>10</div>"
    + "            <div class='num'>12</div>"
    + "            <div class='num'>14</div>"
    + "            <div class='num'>16</div>"
    + "            <div class='num'>18</div>"
    + "            <div class='num'>20</div>"
    + "          </div>"
    + "        </div>"
    + "      </div>";
  var div = $(html);
  this._tMap.getOMap().getTargetElement().appendChild(div[0]);
  var map = _this._tMap.getOMap();
  map.on('moveend', function () {
    var zoom = map.getView().getZoom();
    $('.small_scale .marks').css("left", (zoom * 18.153 + 4.24) + 'px');
  })
  $('.small_scale .minus').click(function () {
    var currentResolution = map.getView().getResolution();
    var zoom = map.getView().getZoom();
    if (currentResolution) {
      map.beforeRender(ol.animation.zoom({
        resolution: currentResolution,
        duration: 500,
        easing: ol.easing.inAndOut
      }));
      map.getView().setZoom(zoom - 1);
    }
  })
  $('.small_scale .plus').click(function () {
    var currentResolution = map.getView().getResolution();
    var zoom = map.getView().getZoom();
    if (currentResolution) {
      map.beforeRender(ol.animation.zoom({
        resolution: currentResolution,
        duration: 500,
        easing: ol.easing.inAndOut
      }));
      map.getView().setZoom(zoom + 1);
    }
  })
  $('.small_scale .degree').click(function (evt) {
    var x = evt.clientX;
    var offsetX = getLeft($('.small_scale .degree')[0]);
    var length = x - offsetX;
    var zoom = Math.round((length - 18.153) / 18.153);
    var currentResolution = map.getView().getResolution();
    if (currentResolution) {
      map.beforeRender(ol.animation.zoom({
        resolution: currentResolution,
        duration: 500,
        easing: ol.easing.inAndOut
      }));
      map.getView().setZoom(zoom);
    }
  })
  var getLeft = function (dom) {
    var offset = dom.offsetLeft;
    if (dom.offsetParent != null) {
      offset += getLeft(dom.offsetParent);
    }
    return offset;
  }
};
/**
 * 自定义右边菜单按钮
 * @param option_opts对象{'icon1':'图标路径','icon2':'图标路径','callback':点击触发的回调函数,'tipLabel':'按钮提示'}
 * @constructor
 */
com.jiusuo.map.TMenuControl = function (option_opts) {
  var options = option_opts ? option_opts : [];
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '提示';
  var callback = options.callback || function (e) {
  };
  var icon1 = options.icon1 || '';
  var icon2 = options.icon2 || '';
  var id = options.id || com.jiusuo.map.TUtils.createGUID();
  var html = "<div class='list'>"
    + "<div class='list_inner'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='word' id='" + id + "'><img src='" + icon1 + "' width='36px' height='36px' class='img1'><img src='" + icon2 + "' width='36px' height='36px' class='img2'></div>"
    + "</div>"
    + "</div>";
  var div = $(html);
  $('#' + controlContainer + '_ctm_tool_list_f').after(div);
  $('#' + id).on('click', function (e) {
    callback();
  });
};
/**
 * 自定义顶部工具按钮
 * @param option_opts对象{'icon1':'图标路径','icon2':'图标路径','callback':点击触发的回调函数,'tipLabel':'按钮提示'}
 * @constructor
 */
com.jiusuo.map.TToolControl = function (opt_options) {
  var options = opt_options || {};
  this._tMap = options.tMap;
  if (this._tMap == null) {
    this._tMap = com.jiusuo.map.tMap;
  }
  var controlContainer = this._tMap.getOMap().getTargetElement().id;
  var tipLabel = options.tipLabel !== undefined ?
    options.tipLabel : '提示';
  var callback = options.callback || function (e) {
  };
  var icon1 = options.icon1 || '';
  var icon2 = options.icon2 || '';
  var id = options.id || com.jiusuo.map.TUtils.createGUID();
  var html = "<div class='set'>"
    + "<div class='pop_title'>" + tipLabel
    + "                <div class='pop_title_triangle'></div>"
    + "              </div>"
    + "<div class='img' id='" + id + "'><img src='" + icon1 + "' width='26px' height='26px' class='img_right1'><img src='" + icon2 + "' width='26px' height='26px' class='img_right2'></div>"
    + "</div>";
  var div = $(html);
  $("#" + controlContainer + "_ctm_tool_pop").prepend(div);
  $('#' + id).on('click', function (evt) {
    callback();
  });
};


/**
 * 功能：通过extent画多边形
 * @param
 *
 * */
com.jiusuo.map.drawPolygonByExtent = function (options) {
  //var geoExtents= result.geoExtents;
  var extents = options.extents;
  var inStyle = options.style;
  var showPolygonFlag = options.showPolygonFlag || true;
  var style = null;
  var tMap = com.jiusuo.map.tMap;
  var source = tMap.getVectorLayer('baseVector').getSource();
  var projectionCode = tMap.getProjection().getCode();
  var defaultStyle = new com.jiusuo.map.style.TStyle({
    fill: new com.jiusuo.map.style.TFill({
      color: 'rgba(255, 0, 0, 0.3)'
    }),
    stroke: new com.jiusuo.map.style.TStroke({
      color: 'red',
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
  style = inStyle || defaultStyle;
  var geoJsons = [];
  extents.forEach(function (geoExtent) {
    var minxy = null
    var maxxy = null;

    if (projectionCode == 'EPSG:3857') {
      minxy = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([[geoExtent.minx, geoExtent.miny]])[0];
      maxxy = com.jiusuo.map.TGeometryUtils.worldWgs84ToGcj02ofPoints([[geoExtent.maxx, geoExtent.maxy]])[0];
    }

    minxy = com.jiusuo.map.TGeometryUtils.coortransform([minxy[0], minxy[1]], 'EPSG:4326', projectionCode);
    maxxy = com.jiusuo.map.TGeometryUtils.coortransform([maxxy[0], maxxy[1]], 'EPSG:4326', projectionCode);


    var geom = ol.geom.Polygon.fromExtent([minxy[0], minxy[1], maxxy[0], maxxy[1]]);


    var extentFeature = new com.jiusuo.map.TFeature(geom);
    geoJsons.push(JSON.stringify(com.jiusuo.map.TGeometryUtils._toGeoJsonString(geom)));

    extentFeature.setStyle(style);
    if (showPolygonFlag) {
      source.addFeature(extentFeature);
    }


  });
  this.geoJsons = geoJsons;
};

/**
 * 功能：触发鼠标移动到地图对象时，改变地图对象边框颜色
 * @param
 *
 * */
com.jiusuo.map.higtlingStroke = function (option) {
  var oMap = com.jiusuo.map.tMap.getOMap();
  var styles = {};
  var featursIn = [];
  var featureWithStyles = [];
  var strokeStyle = option.strokeStyle || new com.jiusuo.map.style.TStroke({
    color: 'green',
    lineDash: [10, 10],
    width: 4
  });
  var templeFeature = null;
  var templestyle = null;

  var style1 = new com.jiusuo.map.style.TStyle({
    fill: style.getFill(),
    stroke: strokeStyle,
    image: style.getImage()
  });

  var pointHandler = function (evt) {

    var hasFeatureFlag = oMap.hasFeatureAtPixel(evt.pixel);
    if (hasFeatureFlag) {
      featursIn = [];
      var featureEvt = oMap.forEachFeatureAtPixel(evt.pixel,
        function (featureEvt) {
          featursIn.push(featureEvt);
        });


      featureWithStyles.forEach(function (featureWithStyle) {
        featureWithStyle.setStyle(styles[featureWithStyle.getId()]);
      });
      featureWithStyles = [];
      styles = {};


      featursIn.forEach(function (feature) {
        var tempFeature = feature.clone();
        if (!feature.getId()) {
          feature.setId(com.jiusuo.map.TUtils.createGUID());
        }
        var newStyle = new com.jiusuo.map.style.TStyle({
          fill: style.getFill(),
          stroke: strokeStyle,
          image: style.getImage()
        });
        styles[feature.getId()] = tempFeature.getStyle();
        feature.setStyle(newStyle);
        featureWithStyles.push(feature);
      });


    } else {
      featureWithStyles.forEach(function (featureWithStyle) {
        featureWithStyle.setStyle(styles[featureWithStyle.getId()]);
      });

      featureWithStyles = [];
      styles = {};
    }
  };


  oMap.on('pointermove', pointHandler);
};

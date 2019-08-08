 var debug = true;
 // var debug = false;
var contextPath = ""
var DEBUG = {
  isDebug:debug,

  /**************************************人口统计白天常驻start**********************************************/

  queryDayPermanent:contextPath+'/api/modules/population/dayPermanent.json',

  /**************************************人口统计白天常驻end**********************************************/

  //人口统计，人口统计数据
  queryDemographic:contextPath+'/api/modules/population/queryDemographic.json',

  /**************************************人口统计夜间常驻start**********************************************/

  /**************************************人口统计夜间常驻end**********************************************/

  /**************************************人口统计来源地start**********************************************/
  //列表queryConstituteList 暂时用queryConstituteList1代替 正式使用与归属地同一接口

 //点击非西安中国地图省级地图数据
  notDeployPlace:contextPath+'/api/modules/common/notDeployPlace.json',

 //点击省级获取市级地图数据
  queryNotDeployCity:contextPath+'/api/modules/common/queryNotDeployCity.json',
  //列表 下拉省查询数据(flag1归属地进入，flag0来源地进入)
  querySourceData:contextPath+'/api/modules/common/querySourceData.json',
  //归属地进入暂用
  querySourceData1:contextPath+'/api/modules/common/querySourceData1.json',

  //饼图非西安省份
  queryNotDeployPlace:contextPath+'/api/modules/population/queryNotDeployPlace.json',

  //饼图非西安市级数据
  queryoriginPlaceEchCity:contextPath+'/api/modules/population/originPlaceEchCity.json',

  //饼图非西安点击省份获取地市数据
  queryNotDeployCityPager:contextPath+'/api/modules/population/queryNotDeployCityPager.json',
  /**************************************人口统计来源地end**********************************************/

  /**************************************人口统计归属地start**********************************************/

  //归属地列表下拉 国家数据
  queryCountryData:contextPath+'/api/modules/common/queryCountryData.json',

  //列表数据 来源地 归属地同一接口
  queryConstituteList:contextPath+'/api/modules/population/qcellplace.json',

  //归属地列表国家级暂用数据
  queryConstituteList1:contextPath+'/api/modules/population/qcellplaceCountry.json',
  //归属地列表点击中国显示数据
  queryProvinceCityList:contextPath+'/api/modules/population/queryProvinceCityList2.json',

  //点击中国获取省份表格数据接口
  notDeployPlacePager:contextPath+'/api/modules/population/queryProvinceCityList.json',

  //饼图非西安省份
  queryqcellPlaceEchData:contextPath+'/api/modules/population/qcellPlaceEchData.json',

  //人口统计页面-----人口构成-------非西安归属地点击事件国家数据（不分页）
  queryNotDeployCountry:contextPath+'/api/modules/population/queryNotDeployCountry.json',


  /**************************************人口统计归属地start**********************************************/

  /**************************************人口统计来源地热力图表格start**********************************************/
  //人口统计来源地热力图表格数据
  queryoriginPlaceHotData:contextPath+'/api/modules/population/originPlaceHotData.json',

  /**************************************人口统计来源地热力图表格end**********************************************/

  /**************************************人口统计归属地热力图表格start**********************************************/
  //人口统计归属地热力图表格数据
  queryqcellPlaceHotData:contextPath+'/api/modules/population/qcellPlaceHotData.json',
  /**************************************人口统计归属地热力图表格start**********************************************/

  /*********************commonstart************************/
  //获取归属地，来源地数据
  queryPeopleConstitute:contextPath+'/api/modules/common/queryPeopleConstitute.json',

  //旅游页面下饼状图归属地，来源地
  queryTourPeopleConstitute:contextPath+'/api/modules/common/queryTourPeopleConstitute.json',

  /*********************commonend************************/

  /*********************人口统计start************************/
  //获取人口统计表格数据
  queryPopTableData:contextPath+'/api/modules/population/queryPopTableData.json',
  //人口统计地图区域数据
  districtInfo:contextPath+'/api/modules/population/districtInfo.json',
  //人口构成行为特征热力图展示（白天常驻/夜间常驻）
  queryHeatMap:contextPath+'/api/modules/map/heatMap.json',

  //人口添加到剪切板
  // populationSaveImag: contextPath+'/api/modules/population/populationSaveImag.json',
  populationSaveImag: population_contextPath +'/popAnalysis/saveClipBoard.do',
  /*********************人口统计end************************/
  /*********************旅游统计start************************/
  //旅游页面下重点人
  queryMapKeyPeopleCount:contextPath+'/api/modules/tour/queryMapKeyPeopleCount.json',

  //旅游页面重点人列表
  queryMapKeyPeoplePager:contextPath+'/api/modules/tour/queryMapKeyPeoplePager.json',

  //获取旅游表格数据
  queryTourTableData:contextPath+'/api/modules/tour/queryTourTableData.json',

  //旅游页面左下实时折现图数据  非实时分情况下调用该接口 （isRealtime ，data）
  realtimeNum:contextPath+'/api/modules/tour/realtimeNum.json',

  //旅游页面非实时下日,月调用
  durationNum:contextPath+'/api/modules/tour/durationNum.json',

  peopleFlowDirection:contextPath+'/api/modules/map/peopleFlowDirection.json',
  //获取地图上重点人------打点数据
  queryMapKeyPeople:contextPath+'/api/modules/tour/queryMapKeyPeople.json',

  queryKeyPeopleById:contextPath+'/api/modules/tour/queryKeyPeopleById.json',

  pointsInfo:contextPath+'/api/modules/map/pointsInfo.json',
  //景区下拉框选择
  selectArea:contextPath+'/api/modules/tour/selectArea.json',

  //左侧人口统计数据
  queryTourismDemographic:contextPath+'/api/modules/tour/queryTourismDemographic.json',

 //左侧流入流出人口统计
  queryTourEnterLeaveNum:contextPath+'/api/modules/tour/queryTourEnterLeaveNum.json',

 //旅游页面信息列表 来源地  归属地
  querytourConstituteList:contextPath+'/api/modules/tour/querytourConstituteList.json',

  //旅游页面点击归属地列表进入点击中国获取省份列表数据
  queryTourCityList:contextPath+'/api/modules/tour/queryTourCityList.json',

  //旅游页面非西安点击中国地图省数据
  tournotDeployPlace:contextPath+'/api/modules/tour/tournotDeployPlace.json',

  //旅游页面下非西安点击地图地市数据
  tourqueryNotDeployCity:contextPath+'/api/modules/tour/tourqueryNotDeployCity.json',

  //旅游页面非西安点击进入中国地图左侧表格数据分页
  tournotDeployPlacePager:contextPath+'/api/modules/tour/tournotDeployPlacePager.json',

  //旅游页面下地图地市表格数据
  tourqueryNotDeployCityPager:contextPath+'/api/modules/tour/tourqueryNotDeployCityPager.json',


  //旅游页面-----人口构成-------非西安归属地点击事件国家数据（不分页）
  tourqueryNotDeployCountry:contextPath+'/api/modules/tour/tourqueryNotDeployCountry.json',

  //旅游页面------门口构成-----非西安点击国家列表数据
  tourqueryConstituteList:contextPath+'/api/modules/tour/tourqueryConstituteList.json',

  //旅游页面获取最新5分钟时间点
  queryTourisLately5MinTime:contextPath+'/api/modules/tour/queryTourisLately5MinTime.json',
  /*********************旅游统计end************************/

  /*********************人口分析对比start************************/
  //获取人口类别数据
  queryPeopleType:contextPath+'/api/modules/contrast/queryPeopleType.json',
  //获取区县，开发区数据
  queryAreaData:contextPath+'/api/modules/contrast/queryAreaData.json',
  //获取来源地，归属地级联数据
  queryCascadeData:contextPath+'/api/modules/contrast/queryCascadeData.json',
  /*//确定提交
  queryCheckSubmit:contextPath+'/api/modules/contrast/queryCheckSubmit.json',*/
  //获取推荐选择数据
  queryGeneralData:contextPath+'/api/modules/contrast/queryGeneralData.json',
  //获取多个canvas数据
  queryMoreCanvasData:contextPath+'/api/modules/contrast/queryMoreCanvasData.json',
  //人口---分析比对---推荐选择-----人口统计
  recommendStatistics:contextPath+'/api/modules/contrast/recommendStatistics.json',

  //人口---分析比对---推荐选择-----行为特征
  recommendBehavior:contextPath+'/api/modules/contrast/recommendBehavior.json',

  //人口---分析比对---推荐选择-----人口构成------省级
  recommendComposition:contextPath+'/api/modules/contrast/recommendComposition.json',

  //人口---分析比对---推荐选择-----人口构成------市级
  recommendCompCity:contextPath+'/api/modules/contrast/recommendCompCity.json',

  //人口---分析比对---一般检索-----人口统计
  genRetrievalStatistics:contextPath+'/api/modules/contrast/genRetrievalStatistics.json',

  //人口---分析比对---一般检索-----行为特征
  genRetrievalBehavior:contextPath+'/api/modules/contrast/genRetrievalBehavior.json',

  //人口---分析比对---一般检索-----人口构成------省级
  genRetrievalComposition:contextPath+'/api/modules/contrast/genRetrievalComposition.json',

  //人口---分析比对---一般检索-----人口构成------市级
  genRetrievalCompCity:contextPath+'/api/modules/contrast/genRetrievalCompCity.json',

  //人口---分析比对---高级检索-----人口统计
  advRetrievalStatistics:contextPath+'/api/modules/contrast/advRetrievalStatistics.json',

  //人口---分析比对---高级检索-----行为特征
  advRetrievalBehavior:contextPath+'/api/modules/contrast/advRetrievalBehavior.json',

  //人口---分析比对---高级检索-----人口构成------省级
  advRetrievalComposition:contextPath+'/api/modules/contrast/advRetrievalComposition.json',

  //人口---分析比对---高级检索-----人口构成------市级
  advRetrievalCompCity:contextPath+'/api/modules/contrast/advRetrievalCompCity.json',


  /*********************人口分析对比end************************/
  /*********************旅游分析对比start************************/
  //获取景区人口类别数据
  getScenicTypeList:contextPath+'/api/modules/contrast/getScenicTypeList.json',
  //获取景区数据
  getScenicAreaList:contextPath+'/api/modules/contrast/getScenicAreaList.json',
  //获取来源地，归属地数据
  //querySourceData2:contextPath+'/api/modules/contrast/querySourceData.json',
  //确定提交
  queryCheckSubmit2:contextPath+'/api/modules/contrast/queryCheckSubmit.json',


  //获取旅游--推荐选择--对应图表数据
  getRecommendedResult:contextPath+'/api/modules/contrast/getRecommendedResult.json',
  //获取旅游-人口构成市数据
  getCity:contextPath+'/api/modules/contrast/getCity.json',
  //获取景区---分析比对---一般检索确定接口
  generalSearch:contextPath+'/api/modules/contrast/generalSearch.json',
  //获取景区---分析比对---高级检索确定接口
  advanceSearch:contextPath+'/api/modules/contrast/advanceSearch.json',

  //获取旅游---- 世界地图接口
  queryNotDeployCountry2:contextPath+'/api/modules/contrast/queryNotDeployCountry.json',
  //获取旅游---- 国家列表数据 来源地 归属地同一接口
  queryConstituteList2:contextPath+'/api/modules/contrast/qcellplace.json',
  //获取旅游点---中国地图省级地图数据
  notDeployPlace2:contextPath+'/api/modules/contrast/notDeployPlace.json',
  //获取旅游----省份表格数据接口
  notDeployPlacePager2:contextPath+'/api/modules/contrast/queryProvinceCityList.json',
  //获取旅游----市级地图数据
  queryNotDeployCity2:contextPath+'/api/modules/contrast/queryNotDeployCity.json',
  //获取旅游----地市表格数据
  queryNotDeployCityPager2:contextPath+'/api/modules/contrast/queryNotDeployCityPager.json',


  /*********************旅游分析对比end************************/
  /*********************剪切板start************************/
  //剪切板删除
  batchDeleteShearPlate:contextPath+'/api/modules/clipboard/batchDeleteShearPlate.json',
  /*********************剪切板end************************/

  /**************************************报告管理start**********************************************/
  //报告管理大表数据
  queryreportData:contextPath+'/api/modules/report/reportData.json',

  //获取预览报告数据
  queryPreviewReportData:contextPath+'/api/modules/report/queryPreviewReportData2.json',

  //获取新增报告条件数据
  reportconditionslist:contextPath+'/api/modules/report/reportconditionslist.json',

  //新增报告提交
  queryreportconditions:contextPath+'/api/modules/report/queryreportconditions.json',

  //报告管理条件界面时间下拉
  queryTimeList:contextPath+'/api/modules/report/queryTimeList.json',

  /**************************************报告管理end**********************************************/

  /**************************************系统管理start**********************************************/
  /******景区start****/
  //获取景区名称列表数据
  querySelectList:contextPath+'/api/modules/system/querySelectList.json',
  //获取景区表格数据
  queryScenicData:contextPath+'/api/modules/system/queryScenicList.json',
  //添加确定景区数据
  addScenicData:contextPath+'/api/modules/system/insert.json',
  //查看景区
  find:contextPath+'/api/modules/system/find.json',
  //修改确定
  update:contextPath+'/api/modules/system/update.json',
  //导出
  exportData:contextPath+'exportData.do',
  //删除景区数据
  delScenicData:contextPath+'/api/modules/system/delete.json',
  //布控
  updateStatus:contextPath+'/api/modules/tour/updateStatus.json',

  //旅游首页景区边界
  queryExecuteScenic:contextPath+'/api/modules/tour/queryExecuteScenic.json',

  //旅游首页子景区边界
  queryChildAreaByScenicId:contextPath+'/api/modules/tour/queryExecuteScenic.json',
  /******景区end****/


  /******用户管理start****/

  //用户管理界面角色分配下拉
  queryUserRoles:contextPath+'/api/modules/system/parts.json',

  //用户管理界面角色分配下拉
  queryUnusedRoles:contextPath+'/api/modules/system/queryUnusedRoles.json',

  /******用户管理end****/

  /******重点人start****/
  //添加重点人
  insertEmphasisPeople:contextPath+'/api/modules/system/insertEmphasisPeople.json',
  //导入
  upLoad: contextPath + '/api/modules/system/upLoad.json',
  //导出
  export: contextPath + '/api/modules/system/exportexport.json',
  //获取重点人数据
  queryEmphasisPeopleList:contextPath+'/api/modules/system/queryKeyPeopleData.json',
  //修改重点人布控状态
  updateStatuPeople:contextPath+'/api/modules/system/updateStatus.json',
  //删除重点人数据
  deleteEmphasisPeople:contextPath+'/api/modules/system/delKeyPeopleData.json',
  //修改重点人数据
  updateEmphasisPeople:contextPath+'/api/modules/system/deleteEmphasisPeople.json',

  /******重点人end****/

  /******权限管理start*******/

  //用户管理表格数据
  querySysUsers:contextPath+'/api/modules/system/userManage.json',

  //获取指定角色资源数据
  queryRoleResource:contextPath+'/api/modules/system/queryRoleResource.json',

  //角色管理所有资源数据
  queryRolePossess:contextPath+'/api/modules/system/queryRolePossess.json',


  //角色管理表格数据
  queryPartTable:contextPath+'/api/modules/system/queryPartTable.json',

  //资源管理表格数据
  querySysResource:contextPath+'/api/modules/system/querySysResource.json',

  //系统退出登录路径
  queryURLConfig:contextPath+'/login/queryURLConfig.do',

  //获取用户信息包含所拥有权限
  getLoginUserName:contextPath+'/api/modules/system/getLoginUserName.json',

  //非配用户角色
  insertUserRoles:contextPath+'/api/modules/system/insertUserRoles.json',

  //底部角色表单撤销
  deleteUserRoles:contextPath+'/api/modules/system/insertUserRoles.json',

  //资源管理修改状态
  updateSysResource:contextPath+'/api/modules/system/updateSysResource.json',

 //角色管理新增角色
  insertSysRole:contextPath+'/api/modules/system/insertSysRole.json',

  /******权限管理结束********/
  /**************************************系统管理end**********************************************/
  advRetrievalTest:population_contextPath+'/people/popAnalysis/advRetrievalStatistics.do',

  /*****************************剪切板start*********************************/
  //剪切板---批量删除
  batchDeleteShearPlate:contextPath+'/api/modules/clipboard/batchDeleteShearPlate.json',

  //剪切板---获取剪切板图片list(近7天添加到剪切板的)
  queryShearPlateList:contextPath+'/api/modules/clipboard/queryShearPlateList.json',

  /*****************************剪切板end*********************************/


};
var RELEASE = {
  isDebug:debug,

  /**************************************人口统计页面start**********************************************/
  queryreportData:contextPath+'/api/modules/report/reportData.json',

  //人口添加到剪切板
  populationSaveImag: population_contextPath +'/people/popAnalysis/saveClipBoard.do',

  //人口统计，人口统计数据
  queryDemographic:population_contextPath+'/people/population/queryDemographic.do',

  //获取来源地归属地数据
  queryPeopleConstitute:population_contextPath+'/people/population/queryPeopleConstitute.do',


  //人口构成（归属地）列表  //人口构成（来源地）列表  与归属地同一接口
    queryConstituteList:population_contextPath+'/people/population/queryConstituteList.do',

  //人口构成---来源地---热力图数据
  originOrBelongHeatMap:population_contextPath+'/people/population/originOrBelongHeatMap.do',

  //人口首页----地图/列表数据---部署地白天行政区/夜晚行政区/白天开发区/夜晚开发区和占比  列表
  queryPopTableData:population_contextPath+'/people/population/dayOrNightCityOrDevList.do',

  //人口统计页面-----人口构成-------非西安点击事件数据
  queryNotDeployPlace:population_contextPath+'/people/population/queryNotDeployPlace.do',

  //人口统计页面，人口构成列表-----归属国家点击CN中国时获取省市列表
  queryProvinceCityList:population_contextPath+'/people/population/queryProvinceCityList.do',

  //获取来源地，获取归属地检索下拉接口
  querySourceData:population_contextPath+'/people/baseCode/querySourceData.do',

  //获取归属地列表 下拉国家数据
  queryCountryData:population_contextPath+'/people/baseCode/queryCountryData.do',

  //人口统计白天常住地 /夜间常驻地
  queryHeatMap:population_contextPath+'/people/population/queryHeatMap.do',

  //人口统计页面-----人口构成-------非西安点击事件列表数据（分页）
  queryNotDeployList:population_contextPath+'/people/population/queryNotDeployList.do',

  //人口统计页面-----人口构成-------非西安点击事件全量数据（不分页）----- 省级
  notDeployPlace:population_contextPath+'/people/population/notDeployPlace.do',

  //人口统计页面-----人口构成-------非西安点击事件列表数据（分页）----- 省级
  notDeployPlacePager:population_contextPath+'/people/population/notDeployPlacePager.do',

  //人口统计页面-----人口构成-------非西安归属地点击事件国家数据（不分页）
  queryNotDeployCountry:population_contextPath+'/people/population/queryNotDeployCountry.do',

  //人口统计页面-----人口构成-------非西安点击事件全量数据（不分页）----- 市级
  queryNotDeployCity:population_contextPath+'/people/population/queryNotDeployCity.do',

  //人口统计页面-----人口构成-------非西安点击事件列表数据（分页）----- 市级
  queryNotDeployCityPager:population_contextPath+'/people/population/queryNotDeployCityPager.do',

  //一般检索，获取选择区域接口，项目部署地的区县/开发区

  queryAreaData:population_contextPath+'/people/baseCode/queryAreaData.do',

  //获取一般推荐集合
  queryGeneralData:population_contextPath+'/people/baseCode/queryGeneralData.do',

  //一般检索，获取人口类别接口
  queryPeopleType:population_contextPath+'/people/baseCode/queryPeopleType.do',

  //人口---分析比对---推荐选择-----人口统计
  recommendStatistics:population_contextPath+'/people/popAnalysis/recommendStatistics.do',

  //人口---分析比对---推荐选择-----行为特征
  recommendBehavior:population_contextPath+'/people/popAnalysis/recommendBehavior.do',

  //人口---分析比对---推荐选择-----人口构成------省级
  recommendComposition:population_contextPath+'/people/popAnalysis/recommendComposition.do',

  //人口---分析比对---推荐选择-----人口构成------市级
  recommendCompCity:population_contextPath+'/people/popAnalysis/recommendCompCity.do',

  //人口---分析比对---一般检索-----人口统计
  genRetrievalStatistics:population_contextPath+'/people/popAnalysis/genRetrievalStatistics.do',

  //人口---分析比对---一般检索-----行为特征
  genRetrievalBehavior:population_contextPath+'/people/popAnalysis/genRetrievalBehavior.do',

  //人口---分析比对---一般检索-----人口构成------省级
  genRetrievalComposition:population_contextPath+'/people/popAnalysis/genRetrievalComposition.do',

  //人口---分析比对---一般检索-----人口构成------市级
  genRetrievalCompCity:population_contextPath+'/people/popAnalysis/genRetrievalCompCity.do',

  //人口---分析比对---高级检索-----人口统计
  advRetrievalStatistics:population_contextPath+'/people/popAnalysis/advRetrievalStatistics.do',

  //人口---分析比对---高级检索-----行为特征
  advRetrievalBehavior:population_contextPath+'/people/popAnalysis/advRetrievalBehavior.do',

  //人口---分析比对---高级检索-----人口构成------省级
  advRetrievalComposition:population_contextPath+'/people/popAnalysis/advRetrievalComposition.do',

  //人口---分析比对---高级检索-----人口构成------市级
  advRetrievalCompCity:population_contextPath+'/people/popAnalysis/advRetrievalCompCity.do',

  //一般检索，获取来源地/归属地级联数据
  queryCascadeData:population_contextPath+'/people/baseCode/queryCascadeData.do',

  //人口统计地图区域数据
  districtInfo:population_contextPath+'/people/population/dayOrNightCityOrDevList.do',

  /**************************************人口统计页面end**********************************************/

  /**************************************旅游页面start**********************************************/
  //获取旅游表格数据
  queryTourTableData:population_contextPath+'/tourism/travel/queryExecuteScenicPager.do',

  //旅游页面获取最新5分钟时间点
  queryTourisLately5MinTime:population_contextPath+'/tourism/travel/queryTourisLately5MinTime.do',

  //旅游页面下重点人
  queryMapKeyPeopleCount:population_contextPath+'/tourism/travel/queryMapKeyPeopleCount.do',

  //旅游页面下重点人列表
  queryMapKeyPeoplePager:population_contextPath+'/tourism/travel/queryMapKeyPeoplePager.do',

  //旅游页面下饼状图数据
  queryTourPeopleConstitute:population_contextPath+'/tourism/travel/queryPeopleConstitute.do',

  //旅游首页左侧人口统计
  queryTourismDemographic:population_contextPath+'/tourism/travel/queryTourismDemographic.do',

  //左侧流入流出人口统计
  queryTourEnterLeaveNum:population_contextPath+'/tourism/travel/queryTourEnterLeaveNum.do',

  //旅游首页信息列表 //来源地 归属地
  querytourConstituteList:population_contextPath+'/tourism/travel/queryConstituteList.do',

  //旅游页面归属地列表进入点击中国获取省份地市数据
  queryTourCityList:population_contextPath+'/tourism/travel/queryProvinceCityList.do',

  //旅游页面来源地非西安点击不分页-----人口构成-------非西安点击事件全量数据（不分页）----- 省级
  tournotDeployPlace:population_contextPath+'/tourism/travel/notDeployPlace.do',

  //旅游页面-----人口构成-------非西安点击事件列表数据（分页）----- 省级
  tournotDeployPlacePager:population_contextPath+'/tourism/travel/notDeployPlacePager.do',

  //旅游页面-----人口构成-------非西安点击事件全量数据（不分页）----- 市级
  tourqueryNotDeployCity:population_contextPath+'/tourism/travel/queryNotDeployCity.do',

  //旅游页面-----人口构成-------非西安点击事件列表数据（分页）----- 市级
  tourqueryNotDeployCityPager:population_contextPath+'/tourism/travel/queryNotDeployCityPager.do',

  //旅游页面-----人口构成-------非西安归属地点击事件国家数据（不分页）
  tourqueryNotDeployCountry:population_contextPath+'/tourism/travel/queryNotDeployCountry.do',

  //旅游页面-人口构成---非西安点击国家分页数据
  tourqueryConstituteList:population_contextPath+'/tourism/travel/queryConstituteList.do',

  //旅游页面左下实时折现图数据  非实时分情况下调用该接口 （isRealtime ，data）
  realtimeNum:population_contextPath+'/tourism/travel/realtimeNum.do',

  //旅游页面左下非实时 日  月  接口数据
  durationNum:population_contextPath+'/tourism/travel/durationNum.do',

  //获取景区名称列表数据
  querySelectList:population_contextPath+'/scenic/querySelectList.do',

  //获取景区表格数据
  queryScenicData:population_contextPath+'/scenic/queryScenicList.do',

  //删除景区数据
  delScenicData:population_contextPath+'/scenic/delete.do',

  //布撤控
  updateStatus:population_contextPath+'/scenic/updateStatus.do',

  //旅游首页边界
  queryExecuteScenic:population_contextPath+'/tourism/travel/queryExecuteScenic.do',

  //旅游首页子景区边界
  queryChildAreaByScenicId:population_contextPath+'/tourism/travel/queryChildAreaByScenicId.do',

  peopleFlowDirection:population_contextPath+'/tourism/travel/enterOrLeaveData.do',

  //获取地图上重点人------打点数据
  queryMapKeyPeople:population_contextPath+'/tourism/travel/queryMapKeyPeople.do',

  queryKeyPeopleById:population_contextPath+'/tourism/travel/queryKeyPeopleById.do',

  //景区下拉框选择
  selectArea:population_contextPath+'/tourism/travel/queryControlScen.do',
  /**************************************旅游页面页面end**********************************************/



  //添加确定景区数据
  addScenicData:population_contextPath+'/scenic/insert.do',
  //查看景区
  find:population_contextPath+'/scenic/find.do',
  //修改确定
  update:population_contextPath+'/scenic/update.do',

  //添加重点人
  insertEmphasisPeople:population_contextPath+'/emphasis/insertEmphasisPeople.do',
  //重点人管理页面，展示重点人列表
  queryEmphasisPeopleList:population_contextPath+'/emphasis/queryEmphasisPeopleList.do',
  //修改布控状态
  updateStatuPeople:population_contextPath+'/emphasis/updateStatus.do',
  //删除重点人数据
  deleteEmphasisPeople:population_contextPath+'/emphasis/deleteEmphasisPeople.do',
  //修改重点人数据
  updateEmphasisPeople:population_contextPath+'/emphasis/updateEmphasisPeople.do',
  //导入
  upLoad:population_contextPath+'/emphasis/upload.do',
  //导出
  export:population_contextPath+'/emphasis/export.do',



  //========================旅游分析开始======================
  //获取旅游--推荐选择--对应图表数据
  getRecommendedResult:POPULATION_CONTEXTPATH+'/tourism/analysis/getRecommendedResult.do',
  //获取旅游-人口构成市数据
  getCity:POPULATION_CONTEXTPATH+'/tourism/analysis/getCityMessage.do',

  //获取景区人口类别数据
  getScenicTypeList:POPULATION_CONTEXTPATH+'/tourism/analysis/getScenicTypeList.do',
  //获取景区数据
  getScenicAreaList:POPULATION_CONTEXTPATH+'/tourism/analysis/getScenicAreaList.do',
  //获取景区---分析比对---一般检索确定接口
  generalSearch:POPULATION_CONTEXTPATH+'/tourism/analysis/generalSearch.do',
  //获取景区---分析比对---高级检索确定接口
  advanceSearch:POPULATION_CONTEXTPATH+'/tourism/analysis/advanceSearch.do',

  //获取旅游---- 世界地图接口
  queryNotDeployCountry2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapResult.do',
  //获取旅游---- 国家列表数据 来源地 归属地同一接口
  queryConstituteList2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapTable.do',
  //获取旅游点---中国地图省级地图数据
  notDeployPlace2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapResult.do',
  //获取旅游----省份表格数据接口
  notDeployPlacePager2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapTable.do',
  //获取旅游----市级地图数据
  queryNotDeployCity2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapResult.do',
  //获取旅游----地市表格数据
  queryNotDeployCityPager2:POPULATION_CONTEXTPATH+'/tourism/analysis/getMapTable.do',

/*****************************系统管理start*********************************/

 //获取用户信息包含所拥有权限
 getLoginUserName:POPULATION_CONTEXTPATH+'/permission/getLoginUserName.do',

 //获取用户管理表格数据
  querySysUsers:POPULATION_CONTEXTPATH+'/permission/querySysUsers.do',

  //获取用户管理界面点击分配获取下拉数据
  queryUserRoles:POPULATION_CONTEXTPATH+'/permission/queryUserRoles.do',

  //获取用户管理界面点击分配获取下拉数据
  queryUnusedRoles:POPULATION_CONTEXTPATH+'/permission/queryUnusedRoles.do',

  //非配用户角色
  insertUserRoles:POPULATION_CONTEXTPATH+'/permission/insertUserRoles.do',

  //底部角色表单撤销
  deleteUserRoles:POPULATION_CONTEXTPATH+'/permission/deleteUserRoles.do',

  //角色管理表格数据
  querySysRoles:POPULATION_CONTEXTPATH+'/permission/querySysRoles.do',

  //角色管理所有资源数据
  queryRolePossess:POPULATION_CONTEXTPATH+'/permission/queryRolePossess.do',

  //角色管理新增角色
  insertSysRole:POPULATION_CONTEXTPATH+'/permission/insertSysRole.do',

  //角色管理编辑角色提交
  updateSysRole:POPULATION_CONTEXTPATH+'/permission/updateSysRole.do',

  //获取指定角色资源数据
  queryRoleResource:POPULATION_CONTEXTPATH+'/permission/queryRoleResource.do',

  //资源管理表格数据
  querySysResource:POPULATION_CONTEXTPATH+'/permission/querySysResource.do',

  //资源管理修改状态
  updateSysResource:POPULATION_CONTEXTPATH+'/permission/updateSysResource.do',

  /*****************************系统管理end*********************************/

  //========================旅游分析结束======================
  //系统退出登录路径
  queryURLConfig:POPULATION_CONTEXTPATH+'/login/queryURLConfig.do',

  /*****************************剪切板start*********************************/
  //剪切板---批量删除
  batchDeleteShearPlate:POPULATION_CONTEXTPATH+'/people/shearPlate/batchDeleteShearPlate.do',

  //剪切板---获取剪切板图片list(近7天添加到剪切板的)
  queryShearPlateList:POPULATION_CONTEXTPATH+'/people/shearPlate/queryShearPlateList.do',

  //剪切板-单个导出/批量导出
 downloadImageSigle:POPULATION_CONTEXTPATH+'/people/shearPlate/downloadImageSigle.do',

  //分析页面折线图导出数据
  echartsExportExcel:POPULATION_CONTEXTPATH+'/people/popAnalysis/echartsExportExcel.do',

  //分析页面热力图数据导出
  heatMapExportExcel:POPULATION_CONTEXTPATH+'/people/popAnalysis/heatMapExportExcel.do',
 //高级检索下热力图数据导出
  advHeatMapExportExcel:POPULATION_CONTEXTPATH+'/people/popAnalysis/advHeatMapExportExcel.do',
  //分析页面地图数据导出
  echartsMapExportExcel:POPULATION_CONTEXTPATH+'/people/popAnalysis/echartsMapExportExcel.do'
 /*****************************剪切板end*********************************/

};
var  URL = debug ? DEBUG : RELEASE;

export{
  URL,debug
}

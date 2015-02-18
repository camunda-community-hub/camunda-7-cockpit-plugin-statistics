ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('TimingFactory',['DataFactory','Format','GraphFactory', function(DataFactory,Format, GraphFactory) {
		var TimingFactory = {};

		TimingFactory.timeFrames = [{frame:"weekly", format: "%a %H:%M"},{frame: "dayly", format: "%H:%M" }]; 

		TimingFactory.xValueSpecifiers = [{xValue: "startTime",xProperty:"startTime"}, {xValue: "endTime", xProperty:"endTime"}];

		TimingFactory.levelSpecifiers = [{level:"process instances", moreOptions: false}, {level: "usertasks", moreOptions: true}];

		TimingFactory.processInstancesList = [];
		TimingFactory.processInstancesList.push({processDefKey: "all"});

		TimingFactory.data = [];
		TimingFactory.options = [];
		
		var i = TimingFactory.processInstancesList.length;
		TimingFactory.processInstance = TimingFactory.processInstancesList[i-1];

		var initProcessList = function(processInstanceData){
			var processInstancesList = [];
			for(var i =0; i < processInstanceData.length; i++){
				processInstancesList.push({processDefKey: processInstanceData[i].key});
			};
			processInstancesList.push({processDefKey: "all"});
			var i = processInstancesList.length;
			TimingFactory.processInstance = processInstancesList[i-1];
			return processInstancesList;
		};

		TimingFactory.getData = function(currentLevel, userTaskProcessSpecifier, currentFrame, currentXValue,width, kMeans){
			//if we decide to store data and not make an asynchronous call each time the table is build
			//(for example if we periodically update all data) 
			//then we have to remove this
			DataFactory.allUserTasksByProcDefKeyAndDateSpecification=[];
			var timeString = (currentFrame.frame =="dayly")?"24h":"Week";
			if(currentLevel.level  == "process instances"){
				return DataFactory.getProcessesStartEnd()
				.then(function () {
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat(DataFactory.processesStartEnd,"processDefinitionKey",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),"");
//					TimingFactory.data = Format.getClusterFromFormatedData(data,$scope.clusterThreshold);
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data,kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
					if(TimingFactory.processInstancesList[0].processDefKey == "all"){
						TimingFactory.processInstancesList = initProcessList(TimingFactory.data);
					};
				});
			}
			else if(userTaskProcessSpecifier == "all"){
				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(undefined, currentXValue.xValue);
				return DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(undefined,currentXValue.xValue)
				.then(function(){
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat
					(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"userTaskName",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),"");
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data, kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
				});

			}	
			else{
				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier, currentXValue.xValue);
				return DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier,currentXValue.xValue)
				.then(function(){
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat
					(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"userTaskName",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),""); 
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data, kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
				});
			};	
		};

		return TimingFactory;
	}]);
});
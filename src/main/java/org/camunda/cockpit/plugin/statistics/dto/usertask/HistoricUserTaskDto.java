package org.camunda.cockpit.plugin.statistics.dto.usertask;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonAggregationsDto;

public class HistoricUserTaskDto extends CommonAggregationsDto {

	private String taskKey;
	private String name;

	public String getTaskKey() {
		return taskKey;
	}

	public void setTaskKey(String taskKey) {
		this.taskKey = taskKey;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}

package org.camunda.cockpit.plugin.statistics.dto.activity;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonAggregationsDto;

public class ActivityInstanceCountDto extends CommonAggregationsDto {

	private String activityName;
	private String type;
	private String procDefKey;
	private String procDefId;
	

	public String getProcDefId() {
		return procDefId;
	}

	public void setProcDefId(String procDefId) {
		this.procDefId = procDefId;
	}

	public String getActivityName() {
		return activityName;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public void setActivityName(String activityName) {
		this.activityName = activityName;
	}

	public String getProcDefKey() {
		return procDefKey;
	}

	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

}

package org.camunda.cockpit.plugin.statistics.dto.usertask;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonAggregationsDto;

public class EndedUserTaskDto extends CommonAggregationsDto{

	private String procDefKey;

	public String getProcDefKey() {
		return procDefKey;
	}

	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}


}

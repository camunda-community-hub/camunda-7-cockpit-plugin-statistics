package org.camunda.cockpit.plugin.statistics.dto.usertask;

public class RunningUserTaskDto {

	private int count;
	private String procDefKey;

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public String getProcDefKey() {
		return procDefKey;
	}

	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

}

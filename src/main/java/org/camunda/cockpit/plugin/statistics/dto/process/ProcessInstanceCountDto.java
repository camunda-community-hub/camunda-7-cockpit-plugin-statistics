package org.camunda.cockpit.plugin.statistics.dto.process;

public class ProcessInstanceCountDto {

	private String processDefinitionKey;
	private int runningInstanceCount;
	private int endedInstanceCount;
	private int failedInstanceCount;
	private int count;
	private long duration;
	private long minDuration;
	private long maxDuration;

	public String getProcessDefinitionKey() {
		return processDefinitionKey;
	}

	public void setProcessDefinitionKey(String processDefinitionKey) {
		this.processDefinitionKey = processDefinitionKey;
	}

	public int getRunningInstanceCount() {
		return runningInstanceCount;
	}

	public void setRunningInstanceCount(int runningInstanceCount) {
		this.runningInstanceCount = runningInstanceCount;
	}

	public int getEndedInstanceCount() {
		return endedInstanceCount;
	}

	public void setEndedInstanceCount(int endedInstanceCount) {
		this.endedInstanceCount = endedInstanceCount;
	}

	public int getFailedInstanceCount() {
		return failedInstanceCount;
	}

	public void setFailedInstanceCount(int failedInstanceCount) {
		this.failedInstanceCount = failedInstanceCount;
	}
	
	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public long getMinDuration() {
		return minDuration;
	}

	public void setMinDuration(long minDuration) {
		this.minDuration = minDuration;
	}

	public long getMaxDuration() {
		return maxDuration;
	}

	public void setMaxDuration(long maxDuration) {
		this.maxDuration = maxDuration;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

}

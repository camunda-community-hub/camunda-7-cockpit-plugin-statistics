package org.camunda.cockpit.plugin.statistics.dto.other;

public class VariablesSizeDto {

	private String name;
	private int count;
	private long avgSize;
	private long minSize;
	private long maxSize;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getAvgSize() {
		return avgSize;
	}

	public void setAvgSize(long avgSize) {
		this.avgSize = avgSize;
	}

	public long getMinSize() {
		return minSize;
	}

	public void setMinSize(long minSize) {
		this.minSize = minSize;
	}

	public long getMaxSize() {
		return maxSize;
	}

	public void setMaxSize(long maxSize) {
		this.maxSize = maxSize;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

}

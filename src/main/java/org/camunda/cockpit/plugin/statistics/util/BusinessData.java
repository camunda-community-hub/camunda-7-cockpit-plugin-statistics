package org.camunda.cockpit.plugin.statistics.util;

/**
 *
 * @author EH
 */
public class BusinessData {

    private String id;
    private String name;
    private String typeName;
    private String stringValue;
    private String value;
    private String processInstanceId;
    private String executionid;
    private String taskId;
    private String activityInstanceId;
    private String errorMessage;

    public BusinessData() {
    }

    public BusinessData(String id, String name, String typeName, String stringValue, String value, String processInstanceId, String executionid, String taskId, String activityInstanceId, String errorMessage) {
        this.id = id;
        this.name = name;
        this.typeName = typeName;
        this.stringValue = stringValue;
        this.value = value;
        this.processInstanceId = processInstanceId;
        this.executionid = executionid;
        this.taskId = taskId;
        this.activityInstanceId = activityInstanceId;
        this.errorMessage = errorMessage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getStringValue() {
        return stringValue;
    }

    public void setStringValue(String stringValue) {
        this.stringValue = stringValue;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public String getExecutionid() {
        return executionid;
    }

    public void setExecutionid(String executionid) {
        this.executionid = executionid;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getActivityInstanceId() {
        return activityInstanceId;
    }

    public void setActivityInstanceId(String activityInstanceId) {
        this.activityInstanceId = activityInstanceId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    @Override
    public String toString() {
        return "BusinessData{" + "id=" + id + ", name=" + name + ", typeName=" + typeName + ", stringValue=" + stringValue + ", value=" + value + ", processInstanceId=" + processInstanceId + ", executionid=" + executionid + ", taskId=" + taskId + ", activityInstanceId=" + activityInstanceId + ", errorMessage=" + errorMessage + '}';
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 97 * hash + (this.id != null ? this.id.hashCode() : 0);
        hash = 97 * hash + (this.name != null ? this.name.hashCode() : 0);
        hash = 97 * hash + (this.typeName != null ? this.typeName.hashCode() : 0);
        hash = 97 * hash + (this.stringValue != null ? this.stringValue.hashCode() : 0);
        hash = 97 * hash + (this.value != null ? this.value.hashCode() : 0);
        hash = 97 * hash + (this.processInstanceId != null ? this.processInstanceId.hashCode() : 0);
        hash = 97 * hash + (this.executionid != null ? this.executionid.hashCode() : 0);
        hash = 97 * hash + (this.taskId != null ? this.taskId.hashCode() : 0);
        hash = 97 * hash + (this.activityInstanceId != null ? this.activityInstanceId.hashCode() : 0);
        hash = 97 * hash + (this.errorMessage != null ? this.errorMessage.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final BusinessData other = (BusinessData) obj;
        if ((this.id == null) ? (other.id != null) : !this.id.equals(other.id)) {
            return false;
        }
        if ((this.name == null) ? (other.name != null) : !this.name.equals(other.name)) {
            return false;
        }
        if ((this.typeName == null) ? (other.typeName != null) : !this.typeName.equals(other.typeName)) {
            return false;
        }
        if ((this.stringValue == null) ? (other.stringValue != null) : !this.stringValue.equals(other.stringValue)) {
            return false;
        }
        if ((this.value == null) ? (other.value != null) : !this.value.equals(other.value)) {
            return false;
        }
        if ((this.processInstanceId == null) ? (other.processInstanceId != null) : !this.processInstanceId.equals(other.processInstanceId)) {
            return false;
        }
        if ((this.executionid == null) ? (other.executionid != null) : !this.executionid.equals(other.executionid)) {
            return false;
        }
        if ((this.taskId == null) ? (other.taskId != null) : !this.taskId.equals(other.taskId)) {
            return false;
        }
        if ((this.activityInstanceId == null) ? (other.activityInstanceId != null) : !this.activityInstanceId.equals(other.activityInstanceId)) {
            return false;
        }
        if ((this.errorMessage == null) ? (other.errorMessage != null) : !this.errorMessage.equals(other.errorMessage)) {
            return false;
        }
        return true;
    }
}

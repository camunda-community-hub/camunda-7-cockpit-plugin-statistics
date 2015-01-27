package org.camunda.cockpit.plugin.statistics.resources.usertask;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.usertask.RunningUserTaskAByProcDefDto;

public class RunningTaskInstancesAByProcDefKeyRessource extends
    AbstractCockpitPluginResource {

  private String procDefKey;
  private RunningTaskInstancesAByProcDefKeyRessource _this;

  public RunningTaskInstancesAByProcDefKeyRessource(String engineName, String procDefKey) {
    super(engineName);
    this.procDefKey = procDefKey;
    this._this = this;
  }
  
  public RunningTaskInstancesAByProcDefKeyRessource(String engineName) {
    super(engineName);
  }
  
  @GET
  public List<RunningUserTaskAByProcDefDto> getRunningUserTasksAByProcDefKey() {
  
    Command<List<RunningUserTaskAByProcDefDto>> command = new Command<List<RunningUserTaskAByProcDefDto>>() {
      @SuppressWarnings("unchecked")
      public List<RunningUserTaskAByProcDefDto> execute(CommandContext commandContext) {
        return (List<RunningUserTaskAByProcDefDto>) commandContext.getDbSqlSession().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey", _this.procDefKey);
      }
    };
    
    return getCommandExecutor().executeCommand(command);

  }

}

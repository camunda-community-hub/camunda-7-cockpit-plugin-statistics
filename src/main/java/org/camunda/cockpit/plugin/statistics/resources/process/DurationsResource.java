package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessDurationDto;

/**
 * Provides all duration information
 *
 * @author IG
 */
public class DurationsResource extends AbstractCockpitPluginResource {

	private List<String> processDefKeys;

	public DurationsResource(String engineName, List<String> processDefKeys) {
		super(engineName);
		this.processDefKeys = processDefKeys;
	}

	/**
	 * This method gains the data for the duration. It filters the information
	 * with the process def key
	 *
	 * @return
	 */

	@GET
	public List<ProcessDurationDto> getDurations() {
		Map<String, String> params = new HashMap<String, String>();
		StringBuffer processParam = new StringBuffer ("");
		//else durations corresponding to all process definitions will be retrieved
		if((processDefKeys!=null || !processDefKeys.equals("undefined"))){
			for(int i = 0; i<processDefKeys.size(); i++){
				if(i == 0) {
					  processParam.append("AND KEY_ =\'"+processDefKeys.get(i)+"\'");
				}	else {
					processParam.append("OR KEY_ =\'"+processDefKeys.get(i)+"\'");
				}
			}
		}
		params.put("procDefSpec", processParam.toString());
		List<ProcessDurationDto> durationsList = getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectDurationOfTheChosenProcesses", params));
		return durationsList;
	}

	private Command<List<ProcessDurationDto>> getParameterizedQueryCommandWithParamsMap(final String queryId, final Map<String, String> params) {

		//do query with parameters to filter
		Command<List<ProcessDurationDto>> command = new Command<List<ProcessDurationDto>>() {
			@SuppressWarnings("unchecked")
			public List<ProcessDurationDto> execute(CommandContext commandContext) {
				return (List<ProcessDurationDto>)commandContext.getDbSqlSession().selectList("cockpit.statistics."+queryId, params);
			}
		};

		return command;
	}

}

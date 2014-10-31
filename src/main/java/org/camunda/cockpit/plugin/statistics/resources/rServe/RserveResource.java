package org.camunda.cockpit.plugin.statistics.resources.rServe;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.other.RserveDto;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessDurationDto;
import org.rosuda.REngine.REXP;
import org.rosuda.REngine.REXPMismatchException;
import org.rosuda.REngine.REngineException;
import org.rosuda.REngine.Rserve.RConnection;
import org.rosuda.REngine.Rserve.RserveException;

public class RserveResource extends AbstractCockpitPluginResource {

	private List<String> processDefKeys;
	
    public RserveResource(String engineName, List<String> processDefKeys) {
        super(engineName);
        this.processDefKeys = processDefKeys;
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
    
//    @GET
    public List<ProcessDurationDto> getDurations() {
		Map<String, String> params = new HashMap<String, String>();
		StringBuffer processParam = new StringBuffer ("");
		//else durations corresponding to all process definitions will be retrieved
		if((processDefKeys!=null || !processDefKeys.equals("undefined"))){
			for(int i = 0; i<processDefKeys.size(); i++){
				if(i == 0) 
					processParam.append("AND KEY_ =\'"+processDefKeys.get(i)+"\'");
				else
					processParam.append("OR KEY_ =\'"+processDefKeys.get(i)+"\'");
			}
		}
		params.put("procDefSpec", processParam.toString());
		List<ProcessDurationDto> durationsList = getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectDurationOfTheChosenProcesses", params));
		double [] data = new double [durationsList.size()];
		for( int i =0; i<durationsList.size(); i++)
			data[i]=durationsList.get(i).getDuration();
		
		
		return durationsList;
	}

    @GET
    public List<RserveDto> getRserveData() {

        //get the data we want to send to Rserve from Database
        List<ProcessDurationDto> data =  getDurations();
        double[] statData = new double [data.size()];
        for(int i =0; i< data.size(); i++)
        	statData[i] = data.get(i).getDuration();

        //connect to RServer
        double result = 0;
        try {
            RConnection c = new RConnection();
            System.out.println("Connection established");

//            REXP rx = c.eval("x<-5");
//            result = rx.asDouble();
            
            c.assign("x", statData);
            REXP rx2 = c.eval("x<-sum(x)");
            
            result = rx2.asDouble();
            c.close();
            
            

        } catch (RserveException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();

        } catch (REXPMismatchException e) {
            e.printStackTrace();
            System.err.println("REXPMismatchException" + e.getMessage());
        } catch (REngineException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        RserveDto firstTry = new RserveDto();
        firstTry.setFirstTry(result);

        List<RserveDto> list = new ArrayList<RserveDto>();
        list.add(firstTry);

        return list;
    }

}

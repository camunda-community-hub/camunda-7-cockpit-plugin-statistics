package org.camunda.cockpit.plugin.statistics.test;

import org.camunda.bpm.cockpit.Cockpit;
import org.camunda.bpm.cockpit.plugin.spi.CockpitPlugin;
import org.camunda.bpm.cockpit.plugin.test.AbstractCockpitPluginTest;
import org.camunda.cockpit.plugin.statistics.StatisticsPlugin;
import org.junit.Assert;
import org.junit.Test;

/*
 * class for standard test cases
 */


public class StatisticsPluginTest extends AbstractCockpitPluginTest {

    @Test
    public void testPluginDiscovery() {
        CockpitPlugin thisPlugin = Cockpit.getRuntimeDelegate().getAppPluginRegistry().getPlugin(StatisticsPlugin.ID);
        Assert.assertNotNull(thisPlugin);
    }

}


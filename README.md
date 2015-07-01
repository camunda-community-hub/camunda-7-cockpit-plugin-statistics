camunda Cockpit Statistics Plugin
=================================

camunda BPM community extension, which provides a statistics plugin for camunda Cockpit.
This plugin provides a set of charts helping you to understand what is and what was going on with your engine.
The current master release was successfully tested on Camunda 7.3.0 Final.

![Screenshot: Timing](screenshot-timing.png)

![Screenshot: Analytics](screenshot-analytics.png)

![Screenshot: Process Definition](screenshot-process-definition.png)

## Get started

To include this plugin into your cockpit you can either include it in your custom build on [camunda's plugin store](http://camunda.org/plugins/) or you build the cockpit on your own and deploy it to your server.
Do not forget to customize build.properties in case you choose the latter option. Please customize testdbs.properties.example, too to get the tests running on your system. Please see the provided maven profiles for further options.

## Known issues

- zoom in/out not working with enabled "statistics" tab in process definition detail view
## Roadmap

**features we are working on**

- overlay information for rendered process diagram
- more analytics graphs

**todo**

- implement some kind of caching mechanism
- implement a generic dashboard mechanism
- implement further graphs (cases)
- more tests

**done**

- db query tests for different databases
- drill-in/out for process instance / activity pie charts
- feedback mechanism
- general refactoring
- chart showing start and end times of process instances and activities per process definition
- chart showing start and end times of process instances and activities (all available)
- piechart of running, ended and failed process instances (all available)
- piechart of running and ended user tasks (all available)
- piechart of running and ended user tasks per process definition
- piechart of running, ended and failed process instances per process definition
- piechart of finished activities per process definition including information on avg, min, max duration and count


## Maintainer

[Eric Klieme](https://github.com/eklieme) ([NovaTec Consulting GmbH](http://www.novatec-gmbh.de/))

## Contributors

Within NovaTec Consulting GmbH the following persons are contributing

- Ingo G&uuml;hring


![NovaTec Consulting GmbH](http://www.novatec-gmbh.de/fileadmin/styles/novatec_v5.5/images/header-logo.jpg)

## License

Apache License, Version 2.0

camunda Cockpit Statistics Plugin
=================================

camunda BPM community extension, which provides a statistics plugin for camunda Cockpit.
This plugin provides a set of charts helping you to understand what is and what was going on with your engine.

![Screenshot or code snippet](http://placehold.it/550x350&text=Image%20or%20code%20snippet%20if%20applicable)


## Get started

To include this plugin into your cockpit you can either include it in your custom build on (http://camunda.org/plugins/) or you build the cockpit on your own and deploy it to your server.
Do not forget to customize build.properties in case you choose the latter option.


## Roadmap

**todo**

- improve data query service
- chart showing start and end times of process instances and user task per process definition - fix performance issues
- chart showing start and end times of process instances and user task (all available) - fix performance issues
- charts visualizing process of different attributes like start/end time, duration, count or others
- tbc. ;)


**done**
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
- Benedict Gish
- Eberhard Heber


![NovaTec Consulting GmbH](http://www.novatec-gmbh.de/fileadmin/styles/novatec_v5.5/images/header-logo.jpg)

## License

Apache License, Version 2.0
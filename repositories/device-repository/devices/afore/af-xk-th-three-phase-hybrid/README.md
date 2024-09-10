## Afore AF XK-TH Three Phase Hybrid Inverter
Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface

### Input Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name | Range |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- | ----- |
| 0| 6| STRING| | -| No| status_text.inverter_name| Inverter name| - |
| 11| 4| STRING| | -| No| status_text.hard_name| Hard name| - |
| 535| 2| INT32| W| -| No| measure_power.grid_active_power| Grid active power| -24100 - 24100 |
| 547| 2| INT32| W| -| No| measure_power.grid_total_load| Grid total load| -24100 - 24100 |
| 553| 2| UINT32| W| -| No| measure_power.pv| PV power| 0 - 24100 |
| 555| 1| UINT16| V| 0.1| No| measure_voltage.pv1| PV 1 voltage| 0 - 800 |
| 557| 1| UINT16| W| -| No| measure_power.pv1| PV 1 power| 0 - 15000 |
| 558| 1| UINT16| V| 0.1| No| measure_voltage.pv2| PV 2 voltage| 0 - 800 |
| 560| 1| UINT16| W| -| No| measure_power.pv2| PV 2 power| 0 - 15000 |
| 2000| 1| UINT16| | -| Yes| status_text.battery_state| Battery state| - |
| 2001| 1| INT16| °C| 0.1| No| measure_temperature.battery1| Battery 1 temperature| -40 - 100 |
| 2002| 1| UINT16| %| -| No| measure_percentage.bat_soc| Battery SOC| 0 - 100 |
| 2007| 2| INT32| W| -| No| measure_power.battery| Battery power| -24100 - 24100 |
| 2009| 1| UINT16| kWh| 0.1| No| meter_power.daily_battery_charge| Daily battery charge| 0 - 250 |
| 2010| 1| UINT16| kWh| 0.1| No| meter_power.daily_battery_discharge| Daily battery discharge| 0 - 250 |
| 2011| 2| UINT32| kWh| 0.1| No| meter_power.total_battery_charge| Total battery charge| - |
| 2013| 2| UINT32| kWh| 0.1| No| meter_power.total_battery_discharge| Total battery discharge| - |
| 2500| 1| UINT16| | -| No| status_code.running_state| undefined| - |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name | Range |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- | ----- |
| 206| 2| UINT32| | -| Yes| status_text.ac_timing_charge| AC timing charge| - |
| 206| 2| UINT32| | -| Yes| status_text.timing_charge| Timing charge| - |
| 206| 2| UINT32| | -| Yes| status_text.timing_discharge| Timing discharge| - |
| 2500| 1| UINT16| | -| No| status_code.run_mode| Run mode| - |
| 2500| 1| UINT16| | -| Yes| status_text.ems_mode| EMS mode| - |
| 2501| 1| UINT16| | -| Yes| status_text.charge_command| Charge command| - |
| 2502| 2| INT32| W| -| No| measure_power.charge_instructions| Charge command power| - |
| 2504| 1| UINT16| %| 0.1| No| measure_percentage.acpchgmax| AC charge max| 0 - 100 |
| 2505| 1| UINT16| %| 0.1| No| measure_percentage.acsocmaxchg| AC SOC max charge| 0 - 100 |
| 2509| 1| UINT16| | -| Yes| timeslot.time| undefined| - |
| 2510| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2511| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2512| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2513| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2514| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2515| 1| UINT16| | -| No| timeslot.time| undefined| - |
| 2516| 1| UINT16| | -| No| timeslot.time| undefined| - |

### Supported flow actions

#### Write value to register
Write [[value]] to [[registerType]] register [[register]]
| Name | Argument | Type |  Description |
| ------------- | ----- | ------------- | --------------- |
| value | Value | number | - |
| registerType | The register type where to write to | dropdown | - |
| register | Register | autocomplete | - |

#### Set charge command with power
Set EMS mode to Charge Command with the command [[charge_command]] using [[value]].
| Name | Argument | Type |  Description |
| ------------- | ----- | ------------- | --------------- |
| charge_command | Charge command | dropdown | Select the charge command to set. |
| value | Watts | range | - |

#### Set EMS mode
Set EMS mode to [[mode]].
| Name | Argument | Type |  Description |
| ------------- | ----- | ------------- | --------------- |
| mode | EMS mode | dropdown | - |

#### Set times of AC charging timeslot
For timeslot [[timeslot]] set the start time to [[starttime]] and the end time to [[endtime]].
| Name | Argument | Type |  Description |
| ------------- | ----- | ------------- | --------------- |
| timeslot | Timeslot | dropdown | - |
| starttime | Time | time | - |
| endtime | Time | time | - |

#### Set Timing AC Charge OFF
Set timing AC charge OFF.

#### Set timing AC charge ON with values.
Set timing AC charging ON with [[acpchgmax]] AcPChgMax and [[acsocmaxchg]] AcSocMaxChg.
| Name | Argument | Type |  Description |
| ------------- | ----- | ------------- | --------------- |
| acpchgmax | AcPChgMax | range | - |
| acsocmaxchg | AcPChgMax | range | - |


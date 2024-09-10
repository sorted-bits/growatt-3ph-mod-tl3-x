## Growatt 1PH MIC TL-X series
Single phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name | Range |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- | ----- |
| 0| 1| UINT8| | -| No| status_code.run_mode| Run mode| - |
| 1| 2| UINT32| W| 0.1| No| measure_power.ac| AC power| - |
| 3| 2| UINT16| V| 0.1| No| measure_voltage.pv1| PV 1 voltage| 0 - 360 |
| 5| 2| UINT32| W| 0.1| No| measure_power.pv1| PV 1 power| 0 - 20000 |
| 7| 2| UINT16| V| 0.1| No| measure_voltage.pv2| PV 2 voltage| 0 - 360 |
| 9| 2| UINT32| W| 0.1| No| measure_power.pv2| PV 2 power| 0 - 20000 |
| 35| 2| UINT32| W| 0.1| No| measure_power| Power| 0 - 40000 |
| 38| 2| UINT16| V| 0.1| No| measure_voltage.grid_l1| Grid L1 voltage| 0 - 300 |
| 53| 2| UINT32| kWh| 0.1| No| meter_power.today| Today| 0 - 250 |
| 55| 2| UINT32| kWh| 0.1| No| meter_power| Energy| >= 1 |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name | Range |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- | ----- |
| 23| 5| STRING| | -| No| serial| Serial number| - |


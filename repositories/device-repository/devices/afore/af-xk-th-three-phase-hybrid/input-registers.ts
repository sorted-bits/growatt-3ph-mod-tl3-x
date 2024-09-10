import { AccessMode } from '../../../models/enum/access-mode';
import { RegisterDataType } from '../../../models/enum/register-datatype';
import { ModbusRegister } from '../../../models/modbus-register';

export const inputRegisters: ModbusRegister[] = [
  ModbusRegister.default('status_text_inverter_name', 0, 6, RegisterDataType.STRING),

  ModbusRegister.default('status_text_hard_name', 11, 4, RegisterDataType.STRING),
  ModbusRegister.default('measure_power_grid_active_power', 535, 2, RegisterDataType.INT32, AccessMode.ReadOnly, {
    validValueMin: -24100,
    validValueMax: 24100,
  }),
  ModbusRegister.default('measure_power_grid_total_load', 547, 2, RegisterDataType.INT32, AccessMode.ReadOnly, {
    validValueMin: -24100,
    validValueMax: 24100,
  }),

  ModbusRegister.default('measure_power_pv', 553, 2, RegisterDataType.UINT32, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 24100,
  }),

  ModbusRegister.scale('measure_voltage_pv1', 555, 1, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 800,
  }),

  ModbusRegister.default('measure_power_pv1', 557, 1, RegisterDataType.UINT16, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 15000,
  }),
  ModbusRegister.scale('measure_voltage_pv2', 558, 1, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 800,
  }),
  ModbusRegister.default('measure_power_pv2', 560, 1, RegisterDataType.UINT16, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 15000,
  }),

  ModbusRegister.transform('status_text_battery_state', 2000, 1, RegisterDataType.UINT16, (value) => {
    switch (value) {
      case 0:
        return 'No battery';
      case 1:
        return 'Fault';
      case 2:
        return 'Sleep';
      case 3:
        return 'Start';
      case 4:
        return 'Charging';
      case 5:
        return 'Discharging';
      case 6:
        return 'Off';
      case 7:
        return 'Wake up';
      default:
        return 'Unknown';
    }
  }),
  ModbusRegister.scale('measure_temperature_battery1', 2001, 1, RegisterDataType.INT16, 0.1, AccessMode.ReadOnly, {
    validValueMin: -40,
    validValueMax: 100,
  }),
  ModbusRegister.default('measure_percentage_bat_soc', 2002, 1, RegisterDataType.UINT16, AccessMode.ReadOnly, {
    validValueMin: 0,
    validValueMax: 100,
  }),
  ModbusRegister.default('measure_power_battery', 2007, 2, RegisterDataType.INT32, AccessMode.ReadOnly, {
    validValueMin: -24100,
    validValueMax: 24100,
  }),
  ModbusRegister.scale(
    'meter_power_daily_battery_charge',
    2009,
    1,
    RegisterDataType.UINT16,
    0.1,
    AccessMode.ReadOnly,
    {
      validValueMin: 0,
      validValueMax: 250,
    },
    2
  ),

  ModbusRegister.scale(
    'meter_power_daily_battery_discharge',
    2010,
    1,
    RegisterDataType.UINT16,
    0.1,
    AccessMode.ReadOnly,
    {
      validValueMin: 0,
      validValueMax: 250,
    },
    2
  ),

  ModbusRegister.default('status_code_running_state', 2500, 1, RegisterDataType.UINT16, AccessMode.ReadOnly),

  ModbusRegister.scale('meter_power_total_battery_charge', 2011, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, undefined, 2),
  ModbusRegister.scale('meter_power_total_battery_discharge', 2013, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, undefined, 2),
];

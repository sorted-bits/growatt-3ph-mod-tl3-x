import { AccessMode } from '../../../models/enum/access-mode';
import { RegisterDataType } from '../../../models/enum/register-datatype';
import { ModbusRegister } from '../../../models/modbus-register';

export const inputRegisters = [
  ModbusRegister.default('run_mode', 0, 1, RegisterDataType.UINT8),

  ModbusRegister.scale('voltage_pv1', 3, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 360 }, 2),
  ModbusRegister.scale('voltage_pv2', 7, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 360 }, 2),

  ModbusRegister.scale('power_ac', 1, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, undefined, 2),
  ModbusRegister.scale('power_pv1', 5, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 20000 }, 2),
  ModbusRegister.scale('power_pv2', 9, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 20000 }, 2),
  ModbusRegister.scale('power', 35, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 40000 }, 0),

  ModbusRegister.scale('voltage_l1', 38, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 300 }, 2),
  ModbusRegister.scale('meter_power_today', 53, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 100, maxAddDelta: 5 }, 2),
  ModbusRegister.scale('meter_power', 55, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0.1, maxAddDelta: 5, maxSubDelta: 0 }, 2),
];
